/**
 * 标签域解耦契约测试：只装宿主 + 单个业务插件（任务 / 站点 / 物品）时，
 * 标签相关参数必须报「标签域未安装」这种可读错误，而不是底层 SQL 错误或静默返回空。
 *
 * 用法：node scripts/test-nodeps.mjs
 * 说明：一个进程里只能装载一次宿主注册中心，所以三种模式各起一个子进程。
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const MODE_ENV = "WB_NODEPS_MODE";
const self = fileURLToPath(import.meta.url);

function assert(cond, message) {
  if (!cond) throw new Error("断言失败：" + message);
}

async function runMode() {
  const mode = process.env[MODE_ENV];
  const home = mkdtempSync(join(tmpdir(), "wb-nodeps-" + mode + "-"));
  process.env.WB_HOME = home;
  let host = null;
  const fakeCtx = {
    webServer: { register: () => () => {} },
    tools: { register: () => {} },
    connection: { requestRejection: () => undefined },
    systemPrompt: { section: () => () => {}, getSectionOrder: () => 500 },
    commands: { register: () => () => {} },
    agents: { get: () => undefined },
    provide: (name, value) => { if (name === "workbench") host = value; },
    effect: (fn) => { const d = fn(); },
  };

  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");

  // 只加载被测插件，标签域保持未安装。
  const plugin = await import("../packages/addons/" + mode + "/lib/index.js");
  plugin.apply({ workbench: host, effect: fakeCtx.effect });

  async function call(action, args) {
    return host.invoke(action, args || {}, "agent");
  }
  async function expectError(action, args, needle) {
    let caught = null;
    try {
      await call(action, args);
    } catch (e) {
      caught = e;
    }
    assert(caught, action + " 应该报错但没有");
    const text = String(caught.message || caught);
    assert(text.includes(needle), action + " 报错文案缺少「" + needle + "」：" + text);
    assert(!/SQL logic error|ERR_SQLITE_ERROR/.test(text), action + " 抛的是底层 SQL 错误：" + text);
  }

  const domains = host.listDomains().map((d) => d.id);
  assert(domains.includes("wb-addon-" + mode), "未装载 " + mode + " 域");
  assert(!domains.includes("wb-addon-tags"), "本测试不应装载标签域");

  const cap = await call("capabilities.get", { domain: "wb-addon-" + mode });
  if (mode === "sites") {
    // 站点把标签当强依赖：缺域时声明 requires 并在 warnings 里提示。
    assert(cap.text.includes("依赖未安装"), mode + " 能力清单未提示依赖未安装");
    assert(
      Array.isArray(cap.result.capability.requires) && cap.result.capability.requires.includes("wb-addon-tags"),
      mode + " 能力未声明 requires",
    );
    assert(
      Array.isArray(cap.result.capability.missingRequires) && cap.result.capability.missingRequires.includes("wb-addon-tags"),
      mode + " 未计算 missingRequires",
    );
    assert(cap.result.warnings.some((w) => String(w).includes("依赖未安装")), mode + " warnings 未包含依赖提示");
  } else {
    // 任务把标签当可选能力：不声明 requires，缺域也不告警。
    assert(!cap.result.capability.requires || !cap.result.capability.requires.includes("wb-addon-tags"), "任务不应把标签声明为 requires");
    assert(!cap.result.warnings.some((w) => String(w).includes("依赖未安装")), "任务缺标签域不应产生依赖告警");
  }

  if (mode === "tasks") {
    const fixtureTableId = (await call("taskNodes.create", { parentId: "1", type: "1", name: "无标签域回归任务表" })).result.node.id;
    // 任务：标签是可选能力，缺域时写入照常，只跳过标签并回执 notices。
    const created = await call("tasks.create", { tableId: fixtureTableId, title: "无标签域任务", priority: 3, tags: ["工作"], tagIds: ["t1"] });
    assert(created.result.id, "无标签域时 tasks.create 应当正常");
    assert((created.result.notices || []).some((n) => n.code === "tag_domain_missing"), "创建回执缺少 tag_domain_missing");
    assert(!("tags" in created.result.task) && !("tagIds" in created.result.task), "缺域时不应回显 tags 字段");

    const updated = await call("tasks.update", { id: created.result.id, title: "无标签域改", addTags: ["x"] });
    assert(updated.result.task.title === "无标签域改" && (updated.result.notices || []).length === 1, "更新未降级");

    const bulk = await call("tasks.bulkUpdate", { ids: [created.result.id], patch: { priority: 4, tags: ["x"] } });
    assert(bulk.result.updated === 1 && (bulk.result.notices || []).length === 1, "批量更新未降级");

    const byTags = await call("tasks.list", { tags: ["工作"] });
    assert(byTags.result.records.length === 0 && (byTags.result.notices || []).length === 1, "按标签筛选未降级为空结果");
    const byIds = await call("tasks.list", { tagIds: ["t1"] });
    assert(byIds.result.records.length === 0 && (byIds.result.notices || []).length === 1, "tagIds 过滤未降级");

    const group = await call("tasks.stats", { groupBy: "tag" });
    assert(group.result.available === false && (group.result.groups || []).length === 0, "groupBy=tag 未降级");
    assert((await call("tasks.tags", {})).result.available === false, "tasks.tags 应 available=false");

    const listed = await call("tasks.list", {});
    assert(listed.result.records.length >= 1 && !listed.result.notices, "不传标签参数时 tasks.list 应正常返回且无 notice");
    const tables = await call("tasks.dataTables", { stats: true });
    assert(tables.result.tables.some((t) => t.name === "task"), "数据页表清单异常");
  } else if (mode === "storage") {
    const caps = await call("storage.capabilities");
    assert(caps.result.tags === false, "独立物品插件应关闭标签能力");
    const created = await call("storage.create", { name: "独立物品", stock: "1~2", remark: "备注" });
    const id = created.result.storage.id;
    assert(id && created.result.storage.stock === "1~2", "无标签物品创建失败");
    await expectError("storage.update", { id, tagIds: ["t1"] }, "标签插件");
    await expectError("storage.list", { tagIds: ["t1"] }, "标签插件");
    const updated = await call("storage.update", { id, remark: "独立更新" });
    assert(updated.result.storage.remark === "独立更新", "无标签物品更新失败");
    assert((await call("storage.list", { text: "独立更新" })).result.total === 1, "无标签物品查询失败");
    assert((await call("storage.delete", { id })).result.deleted, "无标签物品删除失败");
    assert((await call("storage.list")).result.total === 0, "软删物品仍出现在列表");
  } else {
    const empty = await call("sites.list", {});
    assert(Array.isArray(empty.result.records), "不传标签时 sites.list 应正常返回");

    const dir = await call("siteNodes.create", { parentId: 0, name: "无标签域目录" });
    assert(dir.result.node && dir.result.node.id, "siteNodes.create 应当正常");

    await expectError("sites.list", { tagIds: ["t1"] }, "标签域未安装");
    await expectError(
      "sites.create",
      { siteName: "无标签域站点", siteLinks: ["https://example.com"], dirIds: [dir.result.node.id], tagIds: ["t1"] },
      "标签域未安装",
    );
    // 不带标签参数时站点照常能建，说明降级只作用在标签能力上。
    const site = await call("sites.create", {
      siteName: "无标签域站点2",
      siteLinks: ["https://example.org"],
      dirIds: [dir.result.node.id],
    });
    assert(site.result.site && site.result.site.id, "不传标签参数时 sites.create 应正常");
    await expectError("sites.update", { id: site.result.site.id, tagIds: ["t1"] }, "标签域未安装");

    const tables = await call("sites.dataTables", { stats: true });
    assert(tables.result.tables.some((t) => t.name === "site"), "数据页表清单异常");
  }

  rmSync(home, { recursive: true, force: true });
  console.log(
    "NODEPS TEST PASS { mode: " + mode + ", actions: " + host.actionNames().length + " }",
  );
  // 插件 apply 会留下定时器/订阅句柄，测试跑完直接退出，避免脚本挂住 CI。
  process.exit(0);
}

if (process.env[MODE_ENV]) {
  await runMode();
} else {
  let failed = 0;
  for (const mode of ["tasks", "sites", "storage"]) {
    const r = spawnSync(process.execPath, [self], {
      env: { ...process.env, [MODE_ENV]: mode },
      encoding: "utf8",
    });
    const out = (r.stdout || "").trim();
    const err = (r.stderr || "").trim();
    if (r.status === 0) {
      console.log(out);
    } else {
      failed += 1;
      console.error("[" + mode + "] FAILED\n" + out + "\n" + err);
    }
  }
  if (failed) {
    console.error("NODEPS TEST FAILED (" + failed + "/3)");
    process.exit(1);
  }
  console.log("NODEPS TEST PASS { modes: 3 }");
}
