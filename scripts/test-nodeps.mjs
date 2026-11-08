/**
 * 标签域解耦契约测试：只装宿主 + 单个业务插件（任务 / 站点）时，
 * 标签相关参数必须报「标签域未安装」这种可读错误，而不是底层 SQL 错误或静默返回空。
 *
 * 用法：node scripts/test-nodeps.mjs
 * 说明：一个进程里只能装载一次宿主注册中心，所以两种模式各起一个子进程。
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

  if (mode === "tasks") {
    const created = await call("tasks.create", { title: "无标签域任务", priority: 3 });
    assert(created.result.id, "无标签域时 tasks.create 应当正常");

    await expectError("tasks.list", { tagIds: ["t1"] }, "标签域未安装");
    await expectError("tasks.list", { tags: ["工作"] }, "标签域未安装");
    await expectError("tasks.update", { id: created.result.id, tagIds: ["t1"] }, "标签域未安装");
    await expectError("tasks.stats", { groupBy: "tag" }, "标签域未安装");

    const listed = await call("tasks.list", {});
    assert(listed.result.records.length >= 1, "不传标签参数时 tasks.list 应正常返回");
    const tables = await call("tasks.dataTables", { stats: true });
    assert(tables.result.tables.some((t) => t.name === "task"), "数据页表清单异常");
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
  for (const mode of ["tasks", "sites"]) {
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
    console.error("NODEPS TEST FAILED (" + failed + "/2)");
    process.exit(1);
  }
  console.log("NODEPS TEST PASS { modes: 2 }");
}
