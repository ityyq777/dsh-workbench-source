/**
 * 宿主「插件」页的自测：不启动 DSH，直接对编译产物里的 host.addons.* 四个 action 断言。
 * 覆盖：更新来源声明的合法性与官方源白名单、版本比较、列表合并安装记录、
 * 检查更新（单条失败不整页失败）、安装的三种结果文案、没有插件管理器时的降级命令。
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = new URL("../", import.meta.url).pathname;
const libPath = join(ROOT, "packages/shell/lib/actions/host-addons.js");

function assert(cond, message) {
  if (!cond) throw new Error("断言失败：" + message);
}

async function load() {
  try {
    readFileSync(libPath);
  } catch {
    throw new Error("找不到 " + libPath + "，请先 pnpm build");
  }
  return import(pathToFileURL(libPath).href);
}

/** 造一个只有声明、没有安装记录的域集合。 */
function domainsOf(list) {
  const map = new Map();
  for (const def of list) map.set(def.id, { def });
  return map;
}

/** 假的插件管理器：listVersions 用 map 里配好的结果，updateBundle 返回配好的 ChangeResult。 */
function fakeManager({ bundles = [], versions = {}, update = null, throws = false } = {}) {
  return {
    async listBundles() {
      return bundles;
    },
    async listVersions(name) {
      if (throws) throw new Error("网络不可用");
      return versions[name] ?? { status: "refused", problem: "not-found", reason: "404", attempts: [] };
    },
    async updateBundle() {
      return update ?? { from: "1.0.0", to: "1.0.1", step: "install", result: { changed: true, application: "applied", stage: "install", target: "x" } };
    },
  };
}

const { readUpdateSource, compareVersions, createHostAddonActions, OFFICIAL_REGISTRY, registryAllowed } = await load();

// 1. 声明校验：只认官方 npm 源
assert(readUpdateSource({ source: "npm", package: "dsh-workbench-tasks" }).update.package === "dsh-workbench-tasks", "合法声明要能读出来");
assert(readUpdateSource({}).update === undefined && readUpdateSource({}).problem === undefined, "没声明不算错误");
assert(readUpdateSource({ source: "npm" }).problem.includes("package"), "缺包名要报错");
assert(readUpdateSource({ source: "git", package: "x" }).problem.includes("npm"), "非 npm 源要报错");
assert(readUpdateSource({ source: "npm", package: "x", registry: "https://registry.npmmirror.com" }).problem.includes("官方源"), "非官方源要报错");
assert(readUpdateSource({ source: "npm", package: "x", registry: OFFICIAL_REGISTRY + "/" }).update.registry === OFFICIAL_REGISTRY, "官方源带尾斜杠要归一");
assert(readUpdateSource({ source: "npm", package: "x", distTag: "beta" }).update.distTag === "beta", "合法 distTag 保留");
assert(readUpdateSource({ source: "npm", package: "x", distTag: "a b" }).problem.includes("distTag"), "非法 distTag 要报错");
assert(readUpdateSource({ source: "npm", package: "Not A Package" }).problem.includes("包名"), "非法包名要报错");
assert(registryAllowed(OFFICIAL_REGISTRY) && !registryAllowed("https://example.com"), "白名单只放官方源");

// 2. 版本比较
assert(compareVersions("0.7.6", "0.7.5") === 1, "0.7.6 比 0.7.5 新");
assert(compareVersions("1.0.0", "1.0.0-beta") === 1, "正式版比预发布新");
assert(compareVersions("1.2.10", "1.2.9") === 1, "按数字比较第三段");
assert(compareVersions("v1.0.0", "1.0.0") === 0, "前面的 v 不影响比较");

// 3. 没有插件管理器：降级为命令，并写明要重启
const addons = domainsOf([
  { id: "wb-addon-tasks", title: "任务", version: "5.5.3", update: { source: "npm", package: "dsh-workbench-tasks" } },
  { id: "wb-addon-noup", title: "没声明", version: "1.0.0" },
  { id: "wb-addon-bad", title: "坏声明", version: "1.0.0", update: { source: "npm", package: "x", registry: "https://example.com" } },
]);
const plain = createHostAddonActions({ domains: addons });
const listNoManager = await plain["host.addons.list"].execute({});
assert(listNoManager.supported === false, "取不到管理器时 supported=false");
assert(listNoManager.note.includes("重启"), "降级说明要提重启");
const tasksRow = listNoManager.addons.find((row) => row.id === "wb-addon-tasks");
assert(tasksRow.command.startsWith("dsh plugin --profile "), "降级要给可复制命令：" + tasksRow.command);
assert(tasksRow.command.includes("dsh-workbench-tasks"), "命令要带包名");
assert(listNoManager.addons.find((row) => row.id === "wb-addon-noup").update === null, "没声明更新来源的插件 update=null");
assert(listNoManager.addons.find((row) => row.id === "wb-addon-bad").problem.includes("官方源"), "坏声明要带原因");

const installNoManager = await plain["host.addons.install"].execute({ id: "wb-addon-tasks" });
assert(installNoManager.application === "manual", "无管理器时 application=manual");
assert(installNoManager.nextStep.includes("重启"), "无管理器时要提示重启");

// 4. 有插件管理器：列表合并 DSH 的安装记录
const manager = fakeManager({
  bundles: [
    { name: "dsh-workbench-tasks", version: "5.5.2", installed: true },
    { name: "dsh-workbench-mail", version: "0.9.0", installed: true },
  ],
  versions: {
    "dsh-workbench-tasks": { status: "listed", installed: "5.5.2", registry: OFFICIAL_REGISTRY, attempts: [], versions: [{ version: "5.5.3" }, { version: "5.5.1" }], omitted: 0 },
    "pkg-a": { status: "listed", installed: "1.0.0", registry: OFFICIAL_REGISTRY, attempts: [], versions: [{ version: "1.0.1" }], omitted: 0 },
  },
});
const fakeCtx = {
  get: (name) => (name === "pluginManager" ? manager : undefined),
  profileContext: { name: "wb-run-test" },
};
const live = createHostAddonActions({ domains: addons, ctx: () => fakeCtx });
const listed = await live["host.addons.list"].execute({});
assert(listed.supported && listed.manager, "有管理器时 supported/manager 都为 true");
assert(listed.profile === "wb-run-test", "profile 名字取自 DSH 上下文：" + listed.profile);
assert(listed.addons.find((row) => row.id === "wb-addon-tasks").installed === "5.5.2", "要合并 DSH 记录的已装版本");
assert(listed.addons.find((row) => row.id === "wb-addon-tasks").managed === true, "已装的插件 managed=true");
assert(listed.addons.find((row) => row.id === "wb-addon-noup").installed === null, "没有安装记录时 installed=null");

// 5. 检查更新：一条有新版本、一条查不到、一条没声明更新来源
const checked = await live["host.addons.checkUpdates"].execute({});
assert(checked.checked === 1, "只检查声明了更新来源的插件，实际 " + checked.checked);
assert(checked.updates.length === 1 && checked.updates[0].latest === "5.5.3", "要报出可用版本");
assert(checked.updates[0].installed === "5.5.2", "update 里要带当前版本");
assert(checked.problems.length === 0, "只有声明了的才查，不应有 problem");

const extra = createHostAddonActions({
  domains: domainsOf([
    { id: "wb-addon-a", title: "A", version: "1.0.0", update: { source: "npm", package: "pkg-a" } },
    { id: "wb-addon-b", title: "B", version: "1.0.0", update: { source: "npm", package: "pkg-b" } },
  ]),
  ctx: () => fakeCtx,
});
const mixed = await extra["host.addons.checkUpdates"].execute({});
assert(mixed.updates.length === 1 && mixed.problems.length === 1, "单条查不到只记 problem，不整体失败");
assert(mixed.problems[0].problem === "not-found", "problem 要带上原因");

const thrown = createHostAddonActions({
  domains: domainsOf([{ id: "wb-addon-a", title: "A", version: "1.0.0", update: { source: "npm", package: "pkg-a" } }]),
  ctx: () => ({ get: () => fakeManager({ throws: true }), profileContext: { name: "p" } }),
});
const safe = await thrown["host.addons.checkUpdates"].execute({});
assert(safe.problems.length === 1, "抛错也要收成 problem");
assert(safe.updates.length === 0, "抛错时没有更新可报");

// 6. 安装：三种结果各自给对文案
const applied = await live["host.addons.install"].execute({ id: "wb-addon-tasks" });
assert(applied.application === "applied" && applied.nextStep.includes("已生效"), "applied 要写已生效：" + applied.nextStep);

const restarting = createHostAddonActions({
  domains: addons,
  ctx: () => ({
    get: () => fakeManager({ update: { from: "5.5.2", to: "5.5.3", step: "install", result: { changed: true, application: "restart-required", stage: "install", target: "x", restartReason: "host" } }, versions: { "dsh-workbench-tasks": { status: "listed", installed: "5.5.2", versions: [{ version: "5.5.3" }], attempts: [] } } }),
    profileContext: { name: "wb-run-test" },
  }),
});
const needRestart = await restarting["host.addons.install"].execute({ id: "wb-addon-tasks" });
assert(needRestart.application === "restart-required" && needRestart.restartRequired === true, "restart-required 要标出来");
assert(needRestart.nextStep.includes("重启"), "restart-required 要提示重启");

const failed = createHostAddonActions({
  domains: addons,
  ctx: () => ({
    get: () => fakeManager({ versions: { "dsh-workbench-tasks": { status: "listed", installed: "5.5.2", versions: [{ version: "5.5.3" }], attempts: [] } }, update: { from: "5.5.2", to: "5.5.3", step: "install", result: { changed: false, application: "failed", stage: "install", target: "x", error: { message: "和已安装的插件冲突" } } } }),
    profileContext: { name: "p" },
  }),
});
const broken = await failed["host.addons.install"].execute({ id: "wb-addon-tasks" });
assert(broken.application === "failed", "失败时 application=failed");
assert(broken.nextStep.includes("没有生效"), "失败要说明没生效");
assert(broken.nextStep.includes("冲突"), "失败要带管理器的错误原因");

// 7. 目标解析：包名与声明不一致要拒绝；没声明时只按官方源
const mismatch = await live["host.addons.install"].execute({ id: "wb-addon-tasks", package: "someone-else" });
assert(mismatch.application === "failed" && mismatch.error.includes("不一致"), "包名与声明不一致要拒绝");
const unknownDomain = await live["host.addons.versions"].execute({ id: "wb-addon-nope" });
assert(unknownDomain.status === "refused" && unknownDomain.reason.includes("没有这个插件域"), "未知域要明确报错");

// 8. 本地安装（管理器拒绝 not-updatable）与没有管理器时，版本列表仍要能从 registry 读出来，
//    但不允许在这里切换版本——用户要的是「能看历史版本」，不是偷偷换包。
const realFetch = globalThis.fetch;
const fetched = [];
globalThis.fetch = async (url) => {
  fetched.push(String(url));
  return {
    ok: true,
    status: 200,
    json: async () => ({ versions: { "5.5.3": {}, "5.4.0": {}, "5.5.10": {}, "bad": {} } }),
  };
};
try {
  const localManager = fakeManager({ versions: { "dsh-workbench-tasks": { status: "refused", problem: "not-updatable", reason: "link install", attempts: [] } } });
  const localLive = createHostAddonActions({ domains: domainsOf([{ id: "wb-addon-tasks", title: "任务", version: "5.5.3", update: { source: "npm", package: "dsh-workbench-tasks" } }]), ctx: () => ({ get: () => localManager }) });
  const localVersions = await localLive["host.addons.versions"].execute({ id: "wb-addon-tasks" });
  assert(localVersions.status === "listed" && localVersions.versions.length === 3, "本地安装也要能列出 registry 历史版本");
  assert(localVersions.canSwitch === false, "本地安装不允许在这里切换版本");
  assert(localVersions.versions[0].version === "5.5.10", "版本要按语义化版本从新到旧排序");
  assert(fetched[0].includes("dsh-workbench-tasks"), "兜底要查声明的那个包名");

  const noManager = createHostAddonActions({ domains: domainsOf([{ id: "wb-addon-tasks", title: "任务", version: "5.5.3", update: { source: "npm", package: "dsh-workbench-tasks" } }]), ctx: () => ({ get: () => undefined }) });
  const noManagerVersions = await noManager["host.addons.versions"].execute({ id: "wb-addon-tasks" });
  assert(noManagerVersions.supported === true && noManagerVersions.versions.length === 3, "没有插件管理器时也要能看版本");
  assert(noManagerVersions.canSwitch === false && noManagerVersions.note.includes("复制命令"), "没有管理器时切换要降级为复制命令");
} finally {
  globalThis.fetch = realFetch;
}

console.log("HOST ADDONS TEST PASS", {
  actions: Object.keys(plain).length,
  checked: checked.checked,
  updates: checked.updates.length,
  problems: mixed.problems.length,
});
