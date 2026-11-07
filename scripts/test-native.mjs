/**
 * DSH 原生插件形态的本地自测（不启动 DSH）。
 * 覆盖：宿主域注册中心 / 业务插件 apply 注册 / action 调用。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const home = mkdtempSync(join(tmpdir(), "wb-native-"));
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

try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(fakeCtx);
  if (!host) throw new Error("workbench service not provided");

  const tasks = await import("../packages/addons/tasks/lib/index.js");
  tasks.apply({ workbench: host, effect: fakeCtx.effect });
  const tags = await import("../packages/addons/tags/lib/index.js");
  tags.apply({ workbench: host, effect: fakeCtx.effect });
  const sites = await import("../packages/addons/sites/lib/index.js");
  sites.apply({ workbench: host, effect: fakeCtx.effect });

  const domains = host.listDomains();
  console.log("domains:", domains.map((d) => d.id + "@" + d.version + (d.enabled ? "" : "!" + d.error)).join(", "));
  const names = host.actionNames().map((a) => a.name);
  for (const n of ["tasks.list", "tasks.create", "tags.list", "sites.list", "siteNodes.children"]) {
    if (!names.includes(n)) throw new Error("missing action " + n);
  }
  const created = await host.invoke("tasks.create", { title: "native 测试任务", priority: 5 }, "agent");
  const id = created.result.id;
  const list = await host.invoke("tasks.list", {}, "agent");
  if (!list.result.records.some((t) => t.id === id)) throw new Error("task not listed");
  const tag = await host.invoke("tags.create", { name: "native 标签" }, "agent");
  if (!tag.result.id) throw new Error("tag not created");
  const node = await host.invoke("siteNodes.create", { parentId: "0", name: "native 目录" }, "agent");
  const site = await host.invoke("sites.create", { siteName: "native 站点", dirIds: [node.result.node.id], siteLinks: [] }, "agent");
  if (!site.result.site.id) throw new Error("site not created");

  console.log("NATIVE TEST PASS", { domains: domains.length, actions: names.length, home });
} finally {
  for (const fn of cleanups.reverse()) { try { fn(); } catch {} }
  rmSync(home, { recursive: true, force: true });
}
