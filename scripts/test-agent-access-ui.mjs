// Agent 可调用开关的 UI 回归：共享 Action 页的开关渲染与切换、不可放开的安全约束标记、
// 宿主 actions.list 数据源，以及各业务插件「默认仅界面」声明是否与迁移清单一致。
// 静态部分只读源码文本，不加载插件本体；动态部分用 data-ui-harness 的最小 React 同步渲染。
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createReact, loadCjs } from "./data-ui-harness.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const VIEW_SRC = resolve(ROOT, "packages/addons/lib/action-schema-view.cjs");

// 迷你 React 展开函数组件后会更新 node.children，但 props.children 仍是展开前的引用；
// 取子节点时优先用 node.children，避免遍历到未展开的旧树。
const kids = (node) => {
  const own = node && Array.isArray(node.children) && node.children.length ? node.children : null;
  const c = own || (node && node.props ? node.props.children : null);
  return c == null ? [] : Array.isArray(c) ? c.flat(Infinity).filter((x) => x != null) : [c];
};
const walk = (n) => (n && typeof n === "object" ? [n, ...kids(n).flatMap(walk)] : []);
const text = (n) => {
  if (n == null || typeof n === "boolean") return "";
  if (typeof n === "string" || typeof n === "number") return String(n);
  return kids(n).map(text).join(" ");
};
const hasClass = (n, cls) => String((n.props && n.props.className) || "").split(/\s+/).includes(cls);
const find = (tree, fn) => walk(tree).find(fn);
const findAll = (tree, fn) => walk(tree).filter(fn);
const settle = async () => { await new Promise((r) => setImmediate(r)); };

function mount(payload, options = {}, lang = "zh") {
  const rt = createReact();
  const view = loadCjs(VIEW_SRC, { react: rt.React })(options);
  let tree = rt.mount(view.ActionSchemaView, { api: payload.api, lang });
  return {
    view,
    tree: () => tree,
    rerender() { tree = rt.rerender(); return tree; },
  };
}

const ORIGINS = ["ui", "plugin", "agent", "sync"];

const roster = {
  ok: true,
  shellVersion: "0.8.0",
  domains: [{ id: "wb-addon-vault", title: "保险箱", version: "1.4.2", actionCount: 3 }],
  actions: [
    { name: "vault.status", domain: "wb-addon-vault", description: "只读状态", input: { type: "object", properties: {} }, origins: ORIGINS.slice(), originsDeclared: ORIGINS.slice(), originsSource: "declared" },
    { name: "vault.secretList", domain: "wb-addon-vault", description: "密钥列表", input: { type: "object", properties: {} }, origins: ["ui"], originsDeclared: ["ui", "plugin"], originsSource: "declared" },
    // 老宿主 / agent 视角不带 origins：既不给多选，也不给「全部关闭」的假象。
    { name: "vault.legacy", domain: "wb-addon-vault", description: "未注入来源字段", input: { type: "object", properties: {} } },
  ],
};

// ── 来源多选：勾选状态、切换、固定来源 ────────────────────────────────
{
  const calls = [];
  const api = {
    call(name, args) {
      calls.push({ name, args });
      if (name === "actions.setActionOrigins") {
        return Promise.resolve({ ok: true, result: { action: args.action, origins: args.origins, source: "meta" } });
      }
      assert.equal(name, "vault.actionSchema", "业务插件页只能读本域 actionSchema");
      return Promise.resolve({ ok: true, result: roster });
    },
    schema() { throw new Error("Action 页不得走宿主统一 schema 接口"); },
  };
  const m = mount({ api }, { domain: "vault", prefix: "wbv" });
  await settle();
  let tree = m.rerender();
  assert.equal(calls.length, 1);

  const chips = findAll(tree, (n) => n.props && n.props["data-origin-row"]);
  assert.equal(chips.length, 8, "两条带 origins 的 action 各四个来源 chip；未注入来源的不渲染");
  assert.ok(chips.every((n) => n.type === "input" && n.props.type === "checkbox"), "来源多选用原生 checkbox");
  const rows = [...new Set(chips.map((n) => n.props["data-origin-row"]))];
  assert.deepEqual(rows, ["vault.status", "vault.secretList"]);
  const pressed = chips.filter((n) => n.props.checked === true).map((n) => n.props["data-origin-row"] + ":" + n.props["data-origin"]);
  assert.deepEqual(pressed, ["vault.status:ui", "vault.status:plugin", "vault.status:agent", "vault.status:sync", "vault.secretList:ui"]);
  assert.ok(!find(tree, (n) => n.props && n.props["data-origin-row"] === "vault.legacy"), "未注入 origins 时不给多选");
  // 声明是上界：secretList 只支持 ui/plugin，agent 与 sync 这两个 chip 必须点不动。
  const bound = chips.filter((n) => n.props["data-origin-row"] === "vault.secretList");
  assert.deepEqual(bound.map((n) => [n.props["data-origin"], n.props.disabled, n.props["data-origin-supported"]]),
    [["ui", false, "1"], ["plugin", false, "1"], ["agent", true, "0"], ["sync", true, "0"]], "只有 action 声明支持的来源才可配置");

  // 给「vault.secretList」加上 agent：只传 action + 归一后的数组，宿主负责归属与校验。
  calls.length = 0;
  const agentChip = chips.find((n) => n.props["data-origin-row"] === "vault.secretList" && n.props["data-origin"] === "agent");
  agentChip.props.onChange();
  await settle();
  tree = m.rerender();
  assert.equal(JSON.stringify(calls), JSON.stringify([{ name: "actions.setActionOrigins", args: { action: "vault.secretList", origins: ["ui", "agent"] } }]));
  const after = find(tree, (n) => n.props && n.props["data-origin-row"] === "vault.secretList" && n.props["data-origin"] === "agent");
  assert.equal(after.props.checked, true, "宿主返回后复选框应就地变为选中");
  assert.match(text(tree), /已更新允许来源/);

  // 再取消 ui 之外的最后一个来源：数组从 ["ui","agent"] 变 ["agent"]
  calls.length = 0;
  find(tree, (n) => n.props && n.props["data-origin-row"] === "vault.secretList" && n.props["data-origin"] === "ui").props.onChange();
  await settle();
  m.rerender();
  assert.equal(JSON.stringify(calls), JSON.stringify([{ name: "actions.setActionOrigins", args: { action: "vault.secretList", origins: ["agent"] } }]));
}

// ── 来源筛选：子插件页与宿主页都能按来源过滤 ────────────────────────
{
  const mixed = {
    ok: true, shellVersion: "0.8.0", domains: [],
    actions: [
      { name: "vault.status", domain: "wb-addon-vault", input: { type: "object", properties: {} }, origins: ["ui", "plugin", "agent"], originsDeclared: ["ui", "plugin", "agent"], originsSource: "declared" },
      { name: "vault.onlyUi", domain: "wb-addon-vault", input: { type: "object", properties: {} }, origins: ["ui"], originsDeclared: ["ui", "plugin"], originsSource: "declared" },
      { name: "vault.noAgent", domain: "wb-addon-vault", input: { type: "object", properties: {} }, origins: ["ui", "plugin"], originsDeclared: ["ui", "plugin"], originsSource: "declared" },
      { name: "vault.legacy", domain: "wb-addon-vault", input: { type: "object", properties: {} } },
    ],
  };
  const api = { call() { return Promise.resolve({ ok: true, result: mixed }); } };
  const m = mount({ api }, { domain: "vault", prefix: "wbv" });
  await settle();
  let tree = m.rerender();
  const filter = find(tree, (n) => n.props && Object.prototype.hasOwnProperty.call(n.props, "data-origin-filter"));
  assert.ok(filter, "工具栏应有一个来源筛选下拉");
  assert.deepEqual(findAll(filter, (n) => n.type === "option").map((n) => n.props.value), ["", "ui", "plugin", "agent", "sync"], "筛选选项覆盖四个来源 + 全部");
  const names = () => findAll(m.tree(), (n) => n.type === "code" && String(n.props.children || "").startsWith("vault.")).map((n) => String(n.props.children));
  assert.equal(names().length, 4, "不筛选时四条都在");
  filter.props.onChange({ target: { value: "agent" } });
  await settle();
  tree = m.rerender();
  assert.deepEqual(names(), ["vault.status"], "按 agent 筛只剩允许 agent 的那条（未注入来源的不算）");
  find(tree, (n) => n.props && Object.prototype.hasOwnProperty.call(n.props, "data-origin-filter")).props.onChange({ target: { value: "plugin" } });
  await settle();
  tree = m.rerender();
  assert.deepEqual(names().sort(), ["vault.noAgent", "vault.status"], "按 plugin 筛得两条");
}

// ── 取消最后一个来源：拒绝并提示，不发请求 ───────────────────────────
{
  const one = { ok: true, shellVersion: "0.8.0", domains: [], actions: [{ name: "vault.only", domain: "wb-addon-vault", input: { type: "object", properties: {} }, origins: ["ui"], originsSource: "declared" }] };
  const calls = [];
  const api = {
    call(name, args) { calls.push({ name, args }); return Promise.resolve({ ok: true, result: one }); },
  };
  const m = mount({ api }, { domain: "vault", prefix: "wbv" });
  await settle();
  let tree = m.rerender();
  find(tree, (n) => n.props && n.props["data-origin"] === "ui" && n.props["data-origin-row"] === "vault.only").props.onChange();
  await settle();
  tree = m.rerender();
  assert.equal(calls.length, 1, "只剩一个来源时不许清空，不发写请求");
  assert.match(text(tree), /至少要保留一个来源/);
}

// ── 切换失败：显示原因、状态不变（不假装成功） ────────────────────────
{
  const fixture = { ok: true, shellVersion: "0.8.0", domains: [], actions: [{ name: "vault.status", domain: "wb-addon-vault", input: { type: "object", properties: {} }, origins: ["ui"], originsDeclared: ["ui", "agent"], originsSource: "declared" }] };
  const api = {
    call(name) {
      if (name === "vault.actionSchema") return Promise.resolve({ ok: true, result: fixture });
      return Promise.resolve({ ok: false, error: "本机 meta 写失败" });
    },
  };
  const m = mount({ api }, { domain: "vault", prefix: "wbv" });
  await settle();
  let tree = m.rerender();
  find(tree, (n) => n.props && n.props["data-origin"] === "agent" && n.props["data-origin-row"] === "vault.status").props.onChange();
  await settle();
  tree = m.rerender();
  assert.match(text(tree), /更新允许来源失败/);
  assert.match(text(tree), /本机 meta 写失败/);
  assert.equal(find(tree, (n) => n.props && n.props["data-origin"] === "agent").props.checked, false, "失败时来源保持原值");
}

// ── 宿主页数据源：actions.list + wb-shell，域名原样保留 ──────────────
{
  const hostRoster = {
    ok: true,
    shellVersion: "0.8.0",
    domains: [{ id: "wb-shell", actionCount: 2 }],
    actions: [
      { name: "audit.list", domain: "wb-shell", description: "查审计", input: { type: "object", properties: { action: { type: "string" } } }, origins: ORIGINS.slice(), originsDeclared: ORIGINS.slice(), originsSource: "declared" },
      { name: "actions.setActionOrigins", domain: "wb-shell", description: "改允许来源", input: { type: "object", properties: {} }, origins: ["ui"], originsDeclared: ["ui"], originsSource: "declared" },
    ],
  };
  const calls = [];
  const api = {
    call(name, args) {
      calls.push({ name, args });
      return Promise.resolve({ ok: true, result: hostRoster });
    },
    schema() { throw new Error("宿主页也不得走 /workbench/api/schema"); },
  };
  const m = mount({ api }, { domain: "wb-shell", source: "actions.list", prefix: "wb" });
  await settle();
  const tree = m.rerender();
  assert.equal(JSON.stringify(calls), JSON.stringify([{ name: "actions.list", args: { detail: true, domain: "wb-shell" } }]), "宿主页走 actions.list，并按 wb-shell 过滤");
  assert.equal(m.view.DOMAIN, "wb-shell", "actions.list 模式下域名原样保留，不补 wb-addon-");
  const body = text(tree);
  assert.match(body, /audit\.list/);
  assert.match(body, /宿主 action 的允许来源/);
  assert.equal(findAll(tree, (n) => n.props && n.props["data-origin-row"]).length, 8);
  const pinned = findAll(tree, (n) => n.props && n.props["data-origin-row"] === "actions.setActionOrigins");
  assert.ok(pinned.length === 4 && pinned.every((n) => n.props.disabled === true), "权限设置自身的来源被钉死，界面改不动");
  assert.ok(pinned.filter((n) => n.props["data-origin-supported"] === "0").length === 3, "只有 ui 在声明范围内，其余三个连开关都不该给");
  assert.ok(!body.includes("v1.4.2"), "宿主页没有插件版本 badge");
}

// ── 宿主页模块：真实挂载 agentAccessPage，确认走 wb-shell 的 action 端点 ──
{
  const rt = createReact();
  const pages = loadCjs(resolve(ROOT, "packages/shell/client/system-pages.cjs"), { react: rt.React });
  const hostRoster = {
    ok: true,
    shellVersion: "0.8.0",
    domains: [{ id: "wb-shell", actionCount: 1 }],
    actions: [{ name: "audit.list", domain: "wb-shell", description: "查审计", input: { type: "object", properties: {} }, origins: ORIGINS.slice(), originsDeclared: ORIGINS.slice(), originsSource: "declared" }],
  };
  const posts = [];
  const api = {
    post(path, body) {
      posts.push({ path, body });
      return Promise.resolve({ ok: true, result: hostRoster });
    },
  };
  const t = (key) => ({ tab_agent: "Agent 权限", agent_desc: "允许来源只存本机，立即生效" }[key] || key);
  const jsxJsx = (type, props) => {
    const p = Object.assign({}, props);
    const kidsIn = p.children;
    delete p.children;
    return rt.React.createElement(type, p, ...(Array.isArray(kidsIn) ? kidsIn : kidsIn === undefined ? [] : [kidsIn]));
  };
  const jsx = { jsx: jsxJsx, jsxs: jsxJsx };
  const el = pages.agentAccessPage({ jsx, t, lang: "zh", api, head: (title, desc) => rt.React.createElement("div", { className: "head" }, title, desc) });
  rt.mount(function HostPage() { return el; }, {});
  await settle();
  const tree = rt.rerender();
  assert.equal(posts.length, 1, "宿主页只发一次 actions.list 请求");
  assert.equal(posts[0].path, "/domains/wb-shell/actions/actions.list", "宿主页直接打 wb-shell 的 action 端点");
  assert.equal(posts[0].body.domain, "wb-shell");
  assert.equal(posts[0].body.detail, true);
  const body = text(tree);
  assert.match(body, /Agent 权限/);
  assert.match(body, /audit\.list/);
  const cards = pages.manageCards({ t, systemCard: (key, icon, title) => rt.React.createElement("b", { "data-card": key }, title) });
  assert.equal(cards.length, 4, "首页管理区保留四个入口");
  assert.equal(JSON.stringify(cards.map((c) => c.props["data-card"])), JSON.stringify(["agent", "backup", "audit", "account"]));
}

// ── 静态接线：宿主页面 / 文案 / 各插件声明 ───────────────────────────
{
  const shellClient = readFileSync(resolve(ROOT, "packages/shell/client/client.src.cjs"), "utf8");
  const systemPages = readFileSync(resolve(ROOT, "packages/shell/client/system-pages.cjs"), "utf8");
  assert.match(shellClient, /SystemPages\.agentAccessPage\(\{ jsx: jsx, t: t, lang: lang, api: api, head: pageHead \}\)/, "宿主路由应挂到独立的 Agent 权限页模块");
  assert.match(shellClient, /SystemPages\.manageCards\(\{ t: t, systemCard: systemCard \}\)/, "首页管理区应有 Agent 权限等入口");
  assert.match(systemPages, /createActionSchemaView\(\{ domain: "wb-shell", source: "actions\.list"/, "宿主页复用共享 Action 页的 actions.list 模式");
  assert.match(systemPages, /actions\/" \+ encodeURIComponent\(action\)/, "宿主页应直接打 wb-shell 的 action 端点");
  const locale = readFileSync(resolve(ROOT, "packages/shell/client/locale.cjs"), "utf8");
  assert.equal((locale.match(/tab_agent:/g) || []).length, 2, "中英文都要有 Agent 权限文案");

  // 声明层：权限只剩 origins 一个字段，agentEnabled / agentLocked 必须绝迹。
  const pluginFile = (id) => resolve(ROOT, "packages/addons", id, "lib/domain/actions.js");
  // 口径：原 agentEnabled:false → origins: ["ui", "agent"] + originsDefault: ["ui"]
  // （本身支持 agent、默认只给界面，用户可在界面打开）；原 agentLocked → origins: ["ui"]（不可放开）。
  const expected = {
    automation: { ui: 0, agentOff: 6 },
    calendar: { ui: 0, agentOff: 8 },
    contacts: { ui: 0, agentOff: 6 },
    mail: { ui: 1, agentOff: 12 },
    salary: { ui: 0, agentOff: 1 },
    vault: { ui: 21, agentOff: 0 },
  };
  for (const [id, want] of Object.entries(expected)) {
    const src = readFileSync(pluginFile(id), "utf8");
    assert.equal((src.match(/origins: \["ui"\]/g) || []).length, want.ui, id + " 的 origins:[\"ui\"] 声明数量");
    assert.equal((src.match(/origins: \["ui", "agent"\]/g) || []).length, want.agentOff, id + " 的 origins:[\"ui\", \"agent\"] 声明数量");
    assert.equal((src.match(/originsDefault: \["ui"\]/g) || []).length, want.agentOff, id + " 的 originsDefault:[\"ui\"] 数量应与「支持但默认关闭」一致");
    assert.ok(!/agentEnabled|agentLocked/.test(src), id + " 不得残留 agentEnabled / agentLocked（权限只用来源数组）");
  }

  // 插件自己的执行期 guard 原样保留：数组是第一道门，execute 里的 origin 判断是第二道。
  const contacts = readFileSync(pluginFile("contacts"), "utf8");
  assert.match(contacts, /origin !== "ui" && origin !== "agent"/, "contacts 的 origin guard 应放行 agent、继续拒绝 plugin/sync");
  const automation = readFileSync(pluginFile("automation"), "utf8");
  assert.equal((automation.match(/deny\(ctx\.origin, \["ui", "agent"\]\)/g) || []).length, 6, "automation 的 6 处写入口 guard 应放行 agent");
  assert.equal((automation.match(/deny\(ctx\.origin, \["ui"\]\)/g) || []).length, 0, "不得残留只允许 ui 的旧 guard");
  const vault = readFileSync(pluginFile("vault"), "utf8");
  assert.equal((vault.match(/only\(ctx, \["ui", "agent"/g) || []).length, 6, "原本就允许 agent 的读类保持原样");
  for (const name of ["vault.setup", "vault.secretReveal", "vault.dataQuery", "vault.lease"]) {
    assert.ok(vault.includes('], "' + name + '")'), name + " 的原 guard 必须保留（来源数组放开也不能绕过它）");
  }

  // 共享 Action 页与宿主实现：不得再出现旧的开关协议。
  const viewSrc = readFileSync(VIEW_SRC, "utf8");
  assert.ok(!/setAgentAccess|agentEnabled|agentLocked/.test(viewSrc), "共享 Action 页不得残留 agent 开关协议");
  const actionsSrc = readFileSync(resolve(ROOT, "packages/shell/src/actions/actions.ts"), "utf8");
  assert.ok(!/setAgentAccess|createAgentAccess/.test(actionsSrc), "宿主不得再注册 agent 开关");
  assert.match(actionsSrc, /actions\.setActionOrigins/, "宿主应提供来源设置 action");
  assert.match(actionsSrc, /ACTION_ORIGIN_DENIED/, "越界来源应有独立错误码");
}

console.log("AGENT ACCESS UI TEST PASS");
