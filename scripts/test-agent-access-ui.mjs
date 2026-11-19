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

const roster = {
  ok: true,
  shellVersion: "0.8.0",
  domains: [{ id: "wb-addon-vault", title: "保险箱", version: "1.4.2", actionCount: 3 }],
  actions: [
    { name: "vault.status", domain: "wb-addon-vault", description: "只读状态", input: { type: "object", properties: {} }, agentEnabled: true },
    { name: "vault.secretList", domain: "wb-addon-vault", description: "密钥列表", input: { type: "object", properties: {} }, agentEnabled: false },
    { name: "vault.secretReveal", domain: "wb-addon-vault", description: "显示密钥明文", input: { type: "object", properties: {} }, agentEnabled: false, agentLocked: true },
    // 老宿主 / agent 视角不带 agentEnabled：既不给开关，也不给「已关闭」的假象。
    { name: "vault.legacy", domain: "wb-addon-vault", description: "未注入开关字段", input: { type: "object", properties: {} } },
  ],
};

// ── 开关渲染：可切换、已关闭、安全约束锁定、未注入 ────────────────────
{
  const calls = [];
  const api = {
    call(name, args) {
      calls.push({ name, args });
      if (name === "actions.setAgentAccess") {
        return Promise.resolve({ ok: true, result: { action: args.action, agentEnabled: args.agentEnabled, source: "meta", declared: true } });
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

  const toggles = findAll(tree, (n) => n.props && n.props["data-agent-toggle"]);
  assert.deepEqual(toggles.map((n) => n.props["data-agent-toggle"]), ["vault.status", "vault.secretList"], "只有宿主注入了 agentEnabled 的 action 才给开关");
  assert.ok(toggles.every(n => n.type === "button" && n.props.role === "switch"));
  assert.equal(toggles[0].props["aria-checked"], true);
  assert.equal(toggles[1].props["aria-checked"], false);
  assert.ok(!text(tree).includes("vault.legacy") || !find(tree, (n) => n.props && n.props["data-agent-toggle"] === "vault.legacy"), "未注入 agentEnabled 时不给开关");

  const locked = find(tree, (n) => n.props && n.props["data-agent-locked"] === "vault.secretReveal");
  assert.ok(locked, "agentLocked 的 action 应有安全约束标记");
  assert.match(text(locked), /仅界面/);
  assert.equal(find(locked, (n) => n.type === "input"), undefined, "安全约束标记里不能再包一个开关");
  assert.ok(!toggles.some((n) => n.props["data-agent-toggle"] === "vault.secretReveal"), "锁定 action 不渲染 checkbox");

  // 打开「vault.secretList」：只传 action + agentEnabled，宿主负责归属与校验。
  calls.length = 0;
  const write = toggles.find((n) => n.props["data-agent-toggle"] === "vault.secretList");
  write.props.onClick();
  await settle();
  tree = m.rerender();
  // 沙箱里的对象原型不同，按 JSON 比较（下同）。
  assert.equal(JSON.stringify(calls), JSON.stringify([{ name: "actions.setAgentAccess", args: { action: "vault.secretList", agentEnabled: true } }]));
  const after = find(tree, (n) => n.props && n.props["data-agent-toggle"] === "vault.secretList");
  assert.equal(after.props["aria-checked"], true, "宿主返回后开关应就地变为打开");
  assert.match(text(tree), /已允许 agent 调用/);

  // 关闭同一条：再点一次应写 false
  calls.length = 0;
  after.props.onClick();
  await settle();
  tree = m.rerender();
  assert.equal(JSON.stringify(calls), JSON.stringify([{ name: "actions.setAgentAccess", args: { action: "vault.secretList", agentEnabled: false } }]));
  assert.match(text(tree), /已禁止 agent 调用/);
}

// ── 切换失败：显示原因、开关回退（不假装成功） ─────────────────────
{
  const fixture = { ok: true, shellVersion: "0.8.0", domains: [], actions: [{ name: "vault.status", domain: "wb-addon-vault", input: { type: "object", properties: {} }, agentEnabled: true }] };
  const api = {
    call(name) {
      if (name === "vault.actionSchema") return Promise.resolve({ ok: true, result: fixture });
      return Promise.resolve({ ok: false, error: "本机 meta 写失败" });
    },
  };
  const m = mount({ api }, { domain: "vault", prefix: "wbv" });
  await settle();
  let tree = m.rerender();
  find(tree, (n) => n.props && n.props["data-agent-toggle"] === "vault.status").props.onClick();
  await settle();
  tree = m.rerender();
  assert.match(text(tree), /切换 agent 开关失败/);
  assert.match(text(tree), /本机 meta 写失败/);
  assert.equal(find(tree, (n) => n.props && n.props["data-agent-toggle"] === "vault.status").props["aria-checked"], true, "失败时开关保持原值");
}

// ── 宿主页数据源：actions.list + wb-shell，域名原样保留 ──────────────
{
  const hostRoster = {
    ok: true,
    shellVersion: "0.8.0",
    domains: [{ id: "wb-shell", actionCount: 2 }],
    actions: [
      { name: "audit.list", domain: "wb-shell", description: "查审计", input: { type: "object", properties: { action: { type: "string" } } }, agentEnabled: true },
      { name: "actions.setAgentAccess", domain: "wb-shell", description: "改 agent 开关", input: { type: "object", properties: {} }, agentEnabled: false, agentLocked: true },
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
  assert.match(body, /宿主 action 的 agent 开关/);
  assert.ok(findAll(tree, (n) => n.props && n.props["data-agent-toggle"]).length === 1);
  assert.ok(find(tree, (n) => n.props && n.props["data-agent-locked"] === "actions.setAgentAccess"), "宿主自身的改开关动作必须标成不可放开");
  assert.ok(!body.includes("v1.4.2"), "宿主页没有插件版本 badge");
}

// ── 宿主页模块：真实挂载 agentAccessPage，确认走 wb-shell 的 action 端点 ──
{
  const rt = createReact();
  const pages = loadCjs(resolve(ROOT, "packages/shell/client/system-pages.cjs"), { react: rt.React });
  const roster = {
    ok: true,
    shellVersion: "0.8.0",
    domains: [{ id: "wb-shell", actionCount: 1 }],
    actions: [{ name: "audit.list", domain: "wb-shell", description: "查审计", input: { type: "object", properties: {} }, agentEnabled: true }],
  };
  const posts = [];
  const api = {
    post(path, body) {
      posts.push({ path, body });
      return Promise.resolve({ ok: true, result: roster });
    },
  };
  const t = (key) => ({ tab_agent: "Agent 权限", agent_desc: "开关只存本机，立即生效" }[key] || key);
  // 真实客户端用 react/jsx-runtime：children 放在 props 里；迷你 React 的 createElement 只吃可变参数，这里转一下。
  const jsxJsx = (type, props) => {
    const p = Object.assign({}, props);
    const kids = p.children;
    delete p.children;
    return rt.React.createElement(type, p, ...(Array.isArray(kids) ? kids : kids === undefined ? [] : [kids]));
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

  const pluginFile = (id) => resolve(ROOT, "packages/addons", id, "lib/domain/actions.js");
  const expectations = [
    // 默认仅界面的 action：迁移后仍由宿主按 agentEnabled:false 拒绝 agent，但用户可以在 Action 页打开。
    ["mail", ["mail.accountCreate", "mail.accountUpdate", "mail.accountDelete", "mail.accountTest", "mail.accountProbe", "mail.mailboxSync", "mail.messageSend", "mail.messageMarkRead", "mail.messageMove", "mail.messageDelete", "mail.sync", "mail.dataQuery"]],
    ["contacts", ["contacts.create", "contacts.update", "contacts.delete", "contacts.groupCreate", "contacts.groupDelete", "contacts.importVcf"]],
    ["calendar", ["calendar.calendarCreate", "calendar.calendarUpdate", "calendar.calendarDelete", "calendar.eventCreate", "calendar.eventUpdate", "calendar.eventDelete", "calendar.eventRemind", "calendar.dataQuery"]],
    ["salary", ["salary.dataQuery"]],
  ];
  for (const [id, names] of expectations) {
    const src = readFileSync(pluginFile(id), "utf8");
    const declared = [...src.matchAll(/action\("([\w.]+)", \{\n?\s*agentEnabled: false/g)].map((m) => m[1]).sort();
    assert.deepEqual(declared, [...names].sort(), id + " 的 agentEnabled:false 清单应与迁移清单一致");
    assert.match(src, /!== "ui" && (?:\w+\.)?origin !== "agent"/, id + " 的 origin guard 应放行 agent、继续拒绝 plugin/sync");
  }

  // automation 用白名单写法：deny 允许 ui/agent，plugin/sync 仍被拒。
  const automation = readFileSync(pluginFile("automation"), "utf8");
  const autoDeclared = [...automation.matchAll(/action\("([\w.]+)", \{\n?\s*agentEnabled: false/g)].map((m) => m[1]).sort();
  assert.deepEqual(autoDeclared, ["automation.configSet", "automation.dataQuery", "automation.ruleCreate", "automation.ruleDelete", "automation.ruleRun", "automation.ruleUpdate"], "automation 的 agentEnabled:false 清单应与迁移清单一致");
  assert.equal((automation.match(/deny\(ctx\.origin, \["ui", "agent"\]\)/g) || []).length, 6, "automation 的 6 处写入口 guard 应放行 agent");
  assert.equal((automation.match(/deny\(ctx\.origin, \["ui"\]\)/g) || []).length, 0, "不得残留只允许 ui 的旧 guard");

  // 保险箱：安全约束不可放开，guard 原样保留（不能用开关绕过）。
  const vault = readFileSync(pluginFile("vault"), "utf8");
  const locked = [...vault.matchAll(/api\.action\("([\w.]+)", \{\n?\s*agentLocked: true/g)].map((m) => m[1]).sort();
  assert.deepEqual(locked, [
    "vault.bindingPurge", "vault.bind", "vault.changePassphrase", "vault.dataQuery", "vault.dataTables",
    "vault.groupCreate", "vault.groupDelete", "vault.groupUpdate", "vault.lease", "vault.lock",
    "vault.rotateDeviceKey", "vault.secretCreate", "vault.secretDelete", "vault.secretReveal",
    "vault.secretUpdate", "vault.setUnlockMode", "vault.setup", "vault.subjectRegister",
    "vault.subjectSecrets", "vault.unbind", "vault.unlock",
  ].sort(), "vault 的 agentLocked 清单应覆盖所有当前不允许 agent 的 action");
  for (const name of ["vault.setup", "vault.secretReveal", "vault.dataQuery", "vault.lease"]) {
    assert.ok(vault.includes('], "' + name + '")'), name + " 的原 guard 必须保留");
  }
  assert.equal((vault.match(/only\(ctx, \["ui", "agent"/g) || []).length, 6, "原本就允许 agent 的读类保持原样");
}

console.log("AGENT ACCESS UI TEST PASS");
