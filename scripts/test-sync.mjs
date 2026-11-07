/**
 * 数据同步 protocol v2 集成测试：真实云端合并函数 + 宿主 SyncEngine + 三个业务插件。
 * 覆盖：首轮 backfill / 树整表 full / 行 push+pull / 重复标签 / 冲突写入 conflict_shadow / 第二轮增量。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openCloudDb } from "../packages/cloud/lib/store.js";
import {
  openSyncSession,
  pushChangesV2,
  pullChangesV2,
  snapshotTable,
  fullTable,
  closeSyncSession,
} from "../packages/cloud/lib/sync.js";
import { SyncClock, SyncEngine, listConflicts, resolveConflict } from "../packages/shell/lib/sync.js";
import { taskSync } from "../packages/addons/tasks/lib/sync.js";
import { tagSync } from "../packages/addons/tags/lib/sync.js";
import { siteSync } from "../packages/addons/sites/lib/sync.js";

const home = mkdtempSync(join(tmpdir(), "wb-sync-"));
process.env.WB_HOME = home;
const cleanups = [];
let host = null;

const fakeCtx = {
  webServer: { register: () => () => {} },
  tools: { register: () => {} },
  connection: { requestRejection: () => undefined },
  provide: (name, value) => { if (name === "workbench") host = value; },
  effect: (fn) => { const d = fn(); if (typeof d === "function") cleanups.push(d); },
};

function assert(cond, message) {
  if (!cond) throw new Error("断言失败：" + message);
}
async function call(action, args) {
  return host.invoke(action, args || {}, "agent");
}

const cloud = openCloudDb(join(home, "cloud.db"));
let session = "";
let device = "devA";
const transport = {
  open: async (protocol, d) => {
    device = d;
    const r = openSyncSession(cloud, "u1", d, protocol);
    session = r.session_id;
    return r;
  },
  push: async (body) => pushChangesV2(cloud, "u1", device, body.client_epoch, session, body.changes),
  pull: async (body) => pullChangesV2(cloud, "u1", device, session, body.cursors, body.limit),
  snapshot: async (body) => snapshotTable(cloud, "u1", device, session, body.table),
  full: async (body) => fullTable(cloud, "u1", device, session, body.table, body.base_version, body.rows),
  close: async (body) => closeSyncSession(cloud, "u1", device, session, body.success, body.cursors),
};

try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  await (await import("../packages/addons/tasks/lib/index.js")).apply({ workbench: host, effect: fakeCtx.effect });
  await (await import("../packages/addons/tags/lib/index.js")).apply({ workbench: host, effect: fakeCtx.effect });
  await (await import("../packages/addons/sites/lib/index.js")).apply({ workbench: host, effect: fakeCtx.effect });

  const root = (await call("taskNodes.tree")).result[0];
  assert(root && String(root.id) === "1", "根节点不是 id=1");
  const group = await call("taskNodes.create", { parentId: "1", type: "0", name: "同步测试组" });
  const table = await call("taskNodes.create", { parentId: group.result.node.id, type: "1", name: "同步测试表" });
  const task = await call("tasks.create", { title: "同步测试任务", tableId: table.result.node.id, priority: 6 });
  assert(task.result.id, "任务创建失败");
  const tag1 = await call("tags.create", { name: "重名标签" });
  const tag2 = await call("tags.create", { name: "重名标签" });
  assert(tag1.result.id !== tag2.result.id, "重复标签名未允许");

  const engine = new SyncEngine({
    db: host.db,
    domains: [
      { id: "wb-addon-tasks", sync: taskSync },
      { id: "wb-addon-tags", sync: tagSync },
      { id: "wb-addon-sites", sync: siteSync },
    ],
    transport,
    clock: new SyncClock(),
    userId: "u1",
    deviceId: "devA",
    epoch: "epoch-A",
  });

  const first = await engine.run();
  console.log("first sync:", JSON.stringify({ ok: first.ok, pushed: first.pushed, pulled: first.pulled, failed: first.failed_tables, repaired: first.repaired }));
  assert(first.ok, "首轮同步失败：" + first.error);
  assert(first.failed_tables.length === 0, "首轮同步有失败表");
  const treeVersion = (cloud.prepare("SELECT version FROM sync_table_state WHERE user_id=? AND table_name='task_node'").get("u1") || {}).version;
  assert(treeVersion === 1, "树表版本不是 1：" + treeVersion);
  const cloudTask = cloud.prepare("SELECT payload FROM row_states WHERE user_id=? AND table_name='task' AND row_id=?").get("u1", task.result.id);
  assert(cloudTask, "任务未推到云端");

  // 另一台设备改云端任务：updated_at 更大，随后本地再改一次并推送，应产生 conflict_shadow。
  const current = JSON.parse(cloudTask.payload);
  const serverRow = Object.assign({}, current, { title: "服务端改名", updated_at: Number(current.updated_at) + 5000, rev: Number(current.rev) + 1 });
  device = "devB";
  const s2 = openSyncSession(cloud, "u1", "devB", 2);
  session = s2.session_id;
  pushChangesV2(cloud, "u1", "devB", "epoch-B", session, [{
    client_seq: 1, table_name: "task", row_id: task.result.id, op: "upsert", payload: serverRow, updated_at: serverRow.updated_at,
  }]);
  closeSyncSession(cloud, "u1", "devB", session, true, {});

  await call("tasks.update", { id: task.result.id, title: "本地再改名" });
  const second = await engine.run();
  console.log("second sync:", JSON.stringify({ ok: second.ok, pushed: second.pushed, pulled: second.pulled, failed: second.failed_tables }));
  assert(second.ok, "第二轮同步失败：" + second.error);
  const shadow = host.db.prepare("SELECT COUNT(*) AS n FROM conflict_shadow").get();
  assert(Number(shadow.n) >= 1, "push 冲突未写入 conflict_shadow");
  const localTask = host.db.prepare("SELECT title FROM task WHERE id=?").get(task.result.id);
  assert(localTask.title === "服务端改名", "冲突后本地未采用服务端行：" + localTask.title);
  const pending = listConflicts(host.db, 10);
  console.log("pending conflicts:", pending.length);
  assert(pending.length >= 1, "冲突列表未返回待处理项");
  assert(resolveConflict(host.db, pending[0].id, "keep_local", Date.now() + 10000), "keep_local 处理失败");
  assert(listConflicts(host.db, 10).length === 0, "冲突处理后仍在待处理列表");

  // 本地移动节点，第三轮应整表 full 推上去。
  const moved = await call("taskNodes.move", { sourceId: table.result.node.id, targetId: "1", moveType: 0 });
  assert(moved.result.node, "节点移动失败");
  const third = await engine.run();
  assert(third.ok, "第三轮同步失败：" + third.error);
  const cloudNode = JSON.parse(cloud.prepare("SELECT payload FROM row_states WHERE user_id=? AND table_name='task_node' AND row_id=?").get("u1", table.result.node.id).payload);
  assert(String(cloudNode.parent_id) === "1", "树移动未整表推送到云端：" + cloudNode.parent_id);
  const version2 = (cloud.prepare("SELECT version FROM sync_table_state WHERE user_id=? AND table_name='task_node'").get("u1") || {}).version;
  assert(Number(version2) >= 2, "树表版本未推进");

  // 唯一键冲突：本地 tag_mapping 与远端同键不同 id，远端更新，应软删本地并采用远端。
  await call("tags.link", { tagIds: [tag1.result.id], itemIds: [task.result.id], itemType: "task" });
  const afterLink = await engine.run();
  assert(afterLink.ok, "标签映射推送失败：" + afterLink.error);
  const localMap = host.db.prepare("SELECT * FROM tag_mapping WHERE tag_id=? AND item_id=? AND item_type='task' AND deleted_at IS NULL").get(tag1.result.id, task.result.id);
  assert(localMap, "本地标签映射不存在");
  const remoteMap = Object.assign({}, localMap, {
    id: "remote-map-1",
    updated_at: Number(localMap.updated_at) + 5000,
    rev: Number(localMap.rev) + 1,
  });
  device = "devB";
  const s3 = openSyncSession(cloud, "u1", "devB", 2);
  session = s3.session_id;
  pushChangesV2(cloud, "u1", "devB", "epoch-B", session, [{
    client_seq: 2, table_name: "tag_mapping", row_id: remoteMap.id, op: "upsert", payload: remoteMap, updated_at: remoteMap.updated_at,
  }]);
  closeSyncSession(cloud, "u1", "devB", session, true, {});
  const fourth = await engine.run();
  assert(fourth.ok, "唯一键冲突同步失败：" + fourth.error);
  const liveMaps = host.db.prepare("SELECT * FROM tag_mapping WHERE tag_id=? AND item_id=? AND item_type='task' AND deleted_at IS NULL").all(tag1.result.id, task.result.id);
  assert(liveMaps.length === 1 && liveMaps[0].id === remoteMap.id, "唯一键冲突未按 lww-tombstone 收敛");
  const deadMap = host.db.prepare("SELECT * FROM tag_mapping WHERE id=?").get(localMap.id);
  assert(deadMap && deadMap.deleted_at !== null, "输掉的本地映射未软删");

  console.log("SYNC TEST PASS", { shadow: Number(shadow.n), treeVersion: version2 });
} finally {
  for (const fn of cleanups.reverse()) { try { fn(); } catch {} }
  try { cloud.close(); } catch {}
  rmSync(home, { recursive: true, force: true });
}
