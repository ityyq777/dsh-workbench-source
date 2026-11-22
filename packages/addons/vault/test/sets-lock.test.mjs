/**
 * 集合页的锁定态与凭据选择回归。
 *
 * 覆盖：
 * - 锁定态整页让位：不渲染集合/凭据/分组信息，也不发列表与详情请求，只留锁定提示卡；
 * - 解锁后正常渲染集合列表、凭据名与操作入口；
 * - 解锁后「加入凭据」是共享 SearchPicker（关键字搜索 + 多选 + chip 回显），不再是原生下拉；
 * - 弹窗里的凭据选择同样是 SearchPicker。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..", "..", "..", "..");
const h = require("react").createElement;
const C = require(path.join(root, "packages/addons/lib/client-common.cjs"))("wbv");
const SetsView = require(path.join(root, "packages/addons/vault/client/views/sets.cjs"));

/** 极简 hook 宿主：按「组件在树里的路径」隔离槽位，让视图能被反复调用重绘。 */
function mountSets(api) {
  const frames = new Map();
  let frame = null;
  let epoch = 0;
  function frameOf(key) {
    let f = frames.get(key);
    if (!f) { f = { slots: [], effects: [], idx: 0 }; frames.set(key, f); }
    f.epoch = epoch;
    return f;
  }
  function depsChanged(slot, deps) {
    if (!slot) return true;
    if (!deps) return !!slot.first;
    if (!slot.deps || slot.deps.length !== deps.length) return true;
    return deps.some((d, k) => d !== slot.deps[k]);
  }
  const FakeReact = {
    useState(init) {
      const f = frame;
      const i = f.idx;
      f.idx += 1;
      if (!(i in f.slots)) f.slots[i] = typeof init === "function" ? init() : init;
      return [f.slots[i], (v) => { f.slots[i] = typeof v === "function" ? v(f.slots[i]) : v; }];
    },
    useRef(init) {
      const f = frame;
      const i = f.idx;
      f.idx += 1;
      if (!(i in f.slots) || !f.slots[i] || typeof f.slots[i] !== "object" || !("current" in f.slots[i])) f.slots[i] = { current: init };
      return f.slots[i];
    },
    useEffect(fn, deps) {
      const f = frame;
      const i = f.idx;
      f.idx += 1;
      if (!depsChanged(f.effects[i], deps)) return;
      if (f.effects[i] && typeof f.effects[i].cleanup === "function") f.effects[i].cleanup();
      f.effects[i] = { deps: deps ? deps.slice() : null, first: false, cleanup: fn() };
    },
    useMemo(fn) { return fn(); },
    useCallback(fn) { return fn; },
    Fragment: "Fragment",
  };
  function expand(node, pathKey) {
    if (!node || typeof node !== "object") return node;
    if (Array.isArray(node)) return node.map((n, i) => expand(n, pathKey + "[" + i + "]"));
    if (typeof node.type === "function") {
      const key = pathKey + "|" + (node.type.displayName || node.type.name || "anon");
      const prev = frame;
      const f = frameOf(key);
      f.idx = 0;
      frame = f;
      let out;
      try { out = node.type(node.props); } finally { frame = prev; }
      return expand(out, key);
    }
    if (!node.props || node.props.children === undefined) return node;
    return { type: node.type, props: Object.assign({}, node.props, { children: expand(node.props.children, pathKey + "/kids") }) };
  }
  function paint() {
    epoch += 1;
    const prev = frame;
    const f = frameOf("root");
    f.idx = 0;
    frame = f;
    let tree;
    try { tree = SetsView({ h, api, lang: "zh", React: FakeReact }); } finally { frame = prev; }
    const out = expand(tree, "root");
    for (const [key, slot] of frames) if (slot.epoch !== epoch) frames.delete(key);
    return out;
  }
  return { paint };
}

function walk(node, out) {
  if (!node || typeof node !== "object") return out;
  if (Array.isArray(node)) { node.forEach((n) => walk(n, out)); return out; }
  if (typeof node.type === "function") return walk(node.type(node.props), out);
  out.push(node);
  if (node.props && node.props.children !== undefined) walk(node.props.children, out);
  return out;
}

function texts(tree) {
  return walk(tree, []).map((n) => {
    const c = n.props && n.props.children;
    return typeof c === "string" ? c : "";
  }).join(" | ");
}

function byClass(tree, cls) {
  return walk(tree, []).filter((n) => typeof n.props?.className === "string" && n.props.className.split(/\s+/).includes(cls));
}

/** 递归拼出按钮里的全部文字（图标是组件节点，跳过即可）。 */
function labelOf(node) {
  const flat = (c) => {
    if (Array.isArray(c)) return c.map(flat).join("");
    if (c == null || typeof c === "boolean") return "";
    if (typeof c === "object") return flat(c.props ? c.props.children : "");
    return String(c);
  };
  return node && node.props ? flat(node.props.children) : "";
}

function buttonByText(tree, label) {
  return walk(tree, []).filter((n) => n.type === "button" && labelOf(n) === label)[0] || null;
}

async function flush() {
  for (let i = 0; i < 12; i += 1) await Promise.resolve();
}

/** 首屏要等两拍：先取到 vault.status，effect 才会按解锁态发三个列表请求。 */
async function settle(view) {
  view.paint();
  await flush();
  view.paint();
  await flush();
  return view.paint();
}

const ITEMS = {
  sets: [
    { id: "set_1", name: "工作邮箱", description: "主号", color: "", groupIds: ["grp_1"], secretCount: 2 },
  ],
  secrets: [
    { id: "sec_1", name: "邮箱密码", kinds: ["password"], updatedAt: 1700000000000 },
    { id: "sec_2", name: "备用手机号", kinds: ["phone"], updatedAt: 1700000000000 },
  ],
  groups: [{ id: "grp_1", name: "公司" }],
};

function makeApi(locked) {
  const calls = [];
  const sets = ITEMS.sets;
  return {
    calls,
    call(action, args) {
      calls.push({ action, args });
      if (action === "vault.status") return Promise.resolve({ locked, initialized: true });
      if (action === "vault.setList") return Promise.resolve({ items: sets });
      if (action === "vault.setGet") {
        return Promise.resolve({ set: sets[0], secrets: [ITEMS.secrets[0]], groupIds: ["grp_1"] });
      }
      if (action === "vault.secretList") return Promise.resolve({ items: ITEMS.secrets });
      if (action === "vault.groupList") return Promise.resolve({ items: ITEMS.groups });
      return Promise.resolve({ ok: true });
    },
  };
}

test("锁定态：整页让位，不渲染集合/凭据信息也不发列表请求", async () => {
  const api = makeApi(true);
  const view = mountSets(api);
  const tree = await settle(view);

  const body = texts(tree);
  assert.match(body, /保险箱已锁定/, "应只给锁定提示卡");
  assert.doesNotMatch(body, /工作邮箱/, "锁定时不得渲染集合名");
  assert.doesNotMatch(body, /邮箱密码/, "锁定时不得渲染凭据名");
  assert.equal(byClass(tree, "wbv-split").length, 0, "锁定时不应渲染列表/详情分栏");
  assert.equal(buttonByText(tree, "新建集合"), null, "锁定时不渲染新建入口");
  assert.equal(buttonByText(tree, "刷新"), null, "锁定时不渲染刷新入口");

  const listCalls = api.calls.filter((c) => ["vault.setList", "vault.setGet", "vault.secretList", "vault.groupList"].indexOf(c.action) >= 0);
  assert.deepEqual(listCalls, [], "锁定时不应请求任何列表/详情接口");
});

test("解锁态：加入凭据用共享选择器，搜索后勾选并回显 chip", async () => {
  const api = makeApi(false);
  const view = mountSets(api);
  let tree = await settle(view);

  assert.doesNotMatch(texts(tree), /保险箱已锁定/, "解锁后不应出现锁定说明");
  assert.notEqual(buttonByText(tree, "新建集合").props.disabled, true, "解锁后新建可用");

  byClass(tree, "wbv-item")[0].props.onClick();
  await flush();
  tree = view.paint();

  const pickers = byClass(tree, "wbv-picker");
  assert.equal(pickers.length, 1, "详情里应有一个共享选择器");
  assert.ok(byClass(tree, "wbv-picker-btn")[0], "选择器应有触发按钮");
  assert.equal(walk(tree, []).some((n) => n.props?.["aria-label"] === "选择要加入的凭据"), false, "不应再有原生下拉");

  // 展开面板 → 搜索 → 勾选
  byClass(tree, "wbv-picker-btn")[0].props.onClick({ stopPropagation() {} });
  tree = view.paint();
  assert.ok(byClass(tree, "wbck"), "展开后应出现勾选清单");
  const search = walk(tree, []).filter((n) => n.type === "input")[0];
  search.props.onChange({ target: { value: "手机" } });
  tree = view.paint();
  const menu = byClass(tree, "wbv-picker-menu")[0];
  assert.ok(menu, "展开后应渲染面板");
  assert.match(texts(menu), /备用手机号/, "关键字应命中凭据名");
  assert.doesNotMatch(texts(menu), /邮箱密码/, "不匹配的凭据应被过滤");

  const opt = byClass(tree, "wbck-opt")[0];
  assert.ok(opt, "应渲染候选项");
  walk(opt, []).filter((n) => n.type === "input")[0].props.onChange({});
  tree = view.paint();
  assert.match(texts(tree), /备用手机号/, "已选项应作为 chip 回显");
  const attach = buttonByText(tree, "加入 1");
  assert.ok(attach, "已选 1 条时出现「加入 1」按钮");
  assert.notEqual(attach.props.disabled, true);

  attach.props.onClick();
  await flush();
  assert.ok(api.calls.some((c) => c.action === "vault.setAttachSecret" && c.args.secretId === "sec_2"), "应调用挂载接口");
});

test("解锁态：弹窗里的凭据选择同样是共享选择器", async () => {
  const api = makeApi(false);
  const view = mountSets(api);
  await settle(view);

  buttonByText(view.paint(), "新建集合").props.onClick();
  const tree = view.paint();
  const pickers = byClass(tree, "wbv-picker");
  assert.equal(pickers.length, 1, "弹窗里应有一个共享选择器");
  assert.equal(walk(tree, []).some((n) => n.props?.["aria-label"] === "新凭据类型"), true, "「新建一条凭据」入口保留");
  assert.match(texts(tree), /或直接新建一条凭据/);

  byClass(tree, "wbv-picker-btn")[0].props.onClick({ stopPropagation() {} });
  const open = view.paint();
  assert.equal(byClass(open, "wbck").length, 1);
  walk(byClass(open, "wbck-opt")[0], []).filter((n) => n.type === "input")[0].props.onChange({});
  assert.match(texts(view.paint()), /邮箱密码/, "已选凭据应回显");
  const trigger = walk(view.paint(), []).filter((n) => n.type === "button" && n.props["aria-haspopup"] === "dialog")[0];
  assert.match(labelOf(trigger), /选择凭据 · 1/, "触发按钮应显示已选数量");
});
