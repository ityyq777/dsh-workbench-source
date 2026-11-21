/**
 * 凭据保险箱视图预览：把客户端视图渲染成 HTML，供浏览器截图核对浅色/深色观感。
 * 只用于视觉验证，不参与构建；mock 数据与 test/ui.test.mjs 的口径保持一致。
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import Module from "node:module";

const require = createRequire(import.meta.url);
const ROOT = new URL("../", import.meta.url).pathname;

// 共享组件与插件视图在模块顶层 require("react")：预览里没有真 React 的调度器，
// 把 "react" 接管掉，按当前正在渲染的迷你 hooks 实例转发。
let ACTIVE = null;
const reactStub = {
  useState: (...args) => ACTIVE.useState(...args),
  useEffect: (...args) => ACTIVE.useEffect(...args),
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn,
  useRef: (value) => ({ current: value }),
  createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  Fragment: "Fragment",
};

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.startsWith("lucide-react/icons/")) return { default: function StubIcon() { return null; } };
  if (request === "react") return reactStub;
  return origLoad.call(this, request, parent, isMain);
};

const SECRETS = [
  { id: "sec_1", name: "工作邮箱", kind: "password", meta: JSON.stringify({ note: "用户名 zhang@corp.cn" }), setIds: ["set_1", "set_2"], lastUsedAt: Date.now() - 3600_000 },
  { id: "sec_2", name: "GitHub", kind: "token", meta: JSON.stringify({ note: "个人 PAT · 2027-03 到期" }), setIds: ["set_1"], lastUsedAt: Date.now() - 86_400_000 },
  { id: "sec_3", name: "手机号（主）", kind: "phone", meta: "{}", setIds: [], lastUsedAt: 0 },
];
const SETS = [
  { id: "set_1", name: "acc_1", description: "工作邮箱与代码托管", color: "", secretCount: 2, groupIds: ["grp_1"] },
  { id: "set_2", name: "少数派", description: "站点会员账号", color: "", secretCount: 1, groupIds: ["grp_1", "grp_2"] },
  { id: "set_3", name: "kms", description: "", color: "", secretCount: 0, groupIds: [] },
];
const GROUPS = [
  { id: "grp_1", name: "工作", description: "公司相关账号", secretCount: 3, bindingCount: 2 },
  { id: "grp_2", name: "个人", description: "", secretCount: 1, bindingCount: 0 },
];

const RESPONSES = {
  "vault.status": { initialized: true, locked: false, unlockMode: "A", secretCount: 3, groupCount: 2, lastUnlockAt: Date.now() - 600_000 },
  "vault.secretList": { items: SECRETS },
  "vault.setList": { items: SETS },
  "vault.groupList": { items: GROUPS },
  "vault.setGet": { secrets: SECRETS.slice(0, 2), groupIds: ["grp_1"] },
  "vault.subjectsOf": { items: [{ subjectType: "site", subjectId: "s_mine", title: "少数派" }] },
};

class Hooks {
  constructor() { this.slots = []; this.deps = []; this.cursor = 0; this.effects = []; this.dirty = false; }
  reset() { this.cursor = 0; this.effects = []; }
  useState(init) {
    const i = this.cursor++;
    if (!(i in this.slots)) this.slots[i] = typeof init === "function" ? init() : init;
    const self = this;
    return [this.slots[i], (value) => { self.slots[i] = typeof value === "function" ? value(self.slots[i]) : value; self.dirty = true; }];
  }
  useEffect(fn, deps) {
    const i = this.cursor++;
    const prev = this.deps[i];
    const changed = !prev || JSON.stringify(prev) !== JSON.stringify(deps);
    this.deps[i] = deps;
    if (changed) this.effects.push(fn);
  }
  useMemo(fn) { return fn(); }
  useCallback(fn) { return fn; }
  useRef(value) {
    const i = this.cursor++;
    if (!(i in this.slots)) this.slots[i] = { current: value };
    return this.slots[i];
  }
}

function makeReact(hooks) {
  const createElement = (type, props, ...children) => ({ type, props: props || {}, children });
  return {
    createElement,
    useState: (v) => hooks.useState(v), useEffect: (fn, deps) => hooks.useEffect(fn, deps),
    useMemo: (fn) => hooks.useMemo(fn), useCallback: (fn) => hooks.useCallback(fn), useRef: (v) => hooks.useRef(v),
    Fragment: "Fragment", forwardRef: (render) => render,
    createContext: () => ({ Provider: (p) => p, Consumer: () => null }), useContext: () => ({}), useId: () => "id",
  };
}

const api = {
  call: async (action) => ({ ok: true, result: RESPONSES[action] !== undefined ? RESPONSES[action] : {} }),
};

async function renderView(file, extraProps) {
  const component = require(ROOT + "packages/addons/vault/client/" + file);
  const hooks = new Hooks();
  const React = makeReact(hooks);
  let tree = null;
  for (let pass = 0; pass < 6; pass += 1) {
    hooks.dirty = false;
    hooks.reset();
    ACTIVE = React;
    tree = component({ api, lang: "zh", title: "", React, h: React.createElement, ...(extraProps || {}) });
    for (const effect of hooks.effects) effect();
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (!hooks.dirty) break;
  }
  return tree;
}

const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const VOID = new Set(["input", "img", "br", "hr"]);

function toHtml(tree) {
  if (tree === null || tree === undefined || tree === false || tree === true) return "";
  if (Array.isArray(tree)) return tree.map(toHtml).join("");
  if (typeof tree === "string" || typeof tree === "number") return esc(tree);
  if (typeof tree !== "object") return "";
  if (typeof tree.type === "function") {
    const Inner = tree.type;
    if (Inner === "Fragment") return toHtml(tree.children);
    const innerHooks = new Hooks();
    const innerReact = makeReact(innerHooks);
    ACTIVE = innerReact;
    const out = Inner({ ...(tree.props || {}), React: innerReact, h: innerReact.createElement, children: tree.children });
    return toHtml(out);
  }
  const tag = tree.type;
  const props = tree.props || {};
  const attrs = [];
  if (props.className) attrs.push(' class="' + esc(props.className) + '"');
  if (props.style) {
    const cssText = Object.keys(props.style).map((key) => key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + ":" + props.style[key]).join(";");
    attrs.push(' style="' + esc(cssText) + '"');
  }
  if (props.id) attrs.push(' id="' + esc(props.id) + '"');
  for (const key of Object.keys(props)) {
    if (/^(aria-|role$|data-)/.test(key) && props[key] !== undefined && props[key] !== false) {
      attrs.push(" " + key.toLowerCase() + '="' + esc(String(props[key])) + '"');
    }
  }
  for (const key of ["colSpan", "rowSpan"]) {
    if (props[key] !== undefined) attrs.push(" " + key.toLowerCase() + '="' + esc(props[key]) + '"');
  }
  const SKIP = new Set(["className", "style", "id", "children", "key", "ref", "type", "value", "placeholder", "colSpan", "rowSpan", "dangerouslySetInnerHTML"]);
  for (const key of Object.keys(props)) {
    if (SKIP.has(key) || /^on[A-Z]/.test(key) || /^(aria-|role$|data-)/.test(key)) continue;
    const value = props[key];
    if (value === undefined || value === null || value === false) continue;
    if (typeof value === "function" || typeof value === "object") continue;
    attrs.push(" " + key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + '="' + esc(String(value)) + '"');
  }
  if (tag === "input" || tag === "select" || tag === "textarea") {
    if (props.type) attrs.push(' type="' + esc(props.type) + '"');
    if (props.value !== undefined) attrs.push(' value="' + esc(props.value) + '"');
    if (props.placeholder) attrs.push(' placeholder="' + esc(props.placeholder) + '"');
    if (props.checked) attrs.push(" checked");
  }
  if (VOID.has(tag)) return "<" + tag + attrs.join("") + ">";
  let inner = toHtml(tree.children);
  if (tag === "select") {
    inner = (tree.children || []).flat().map((child) => {
      if (!child || typeof child !== "object") return "";
      const childProps = child.props || {};
      return toHtml({ ...child, props: { ...childProps, selected: String(childProps.value) === String(props.value) ? "" : undefined } });
    }).join("");
  }
  if (tag === "option") {
    attrs.push(props.selected !== undefined ? " selected" : "");
    attrs.push(' value="' + esc(props.value === undefined ? "" : props.value) + '"');
  }
  return "<" + tag + attrs.join("") + ">" + inner + "</" + tag + ">";
}

const css = require(ROOT + "packages/addons/vault/client/ui/styles.cjs");
const cssText = Array.isArray(css) ? css.join("\n") : String(css);

const themeVars = {
  light: "--wb-card:#ffffff;--wb-surface:#ffffff;--wb-border:#e2e6ec;--wb-line:#eef0f4;--wb-muted:#6b7280;--wb-accent:#0f9d8f;--wb-ok:#15803d;--wb-warn:#b45309;--wb-danger:#b91c1c;--wb-text:#0f172a;--dsw-alias-label-primary-inverted:#ffffff",
  dark: "--wb-card:#161b26;--wb-surface:#111621;--wb-border:#2a3242;--wb-line:#232a38;--wb-muted:#8b94a6;--wb-accent:#2dd4bf;--wb-ok:#4ade80;--wb-warn:#fbbf24;--wb-danger:#f87171;--wb-text:#e8ecf4;--dsw-alias-label-primary-inverted:#04231f",
};

const statusHtml = toHtml(await renderView("views/status.cjs"));
const secretsHtml = toHtml(await renderView("views/secrets.cjs"));
const setsHtml = toHtml(await renderView("views/sets.cjs"));
const groupsHtml = toHtml(await renderView("views/groups.cjs"));
const configHtml = toHtml(await renderView("views/config.cjs"));

// 弹层外壳：直接渲染一个含表单的对话框，核对标题栏、关闭按钮、按钮列与遮罩层。
const Dialog = require(ROOT + "packages/addons/vault/client/ui/dialog.cjs").Dialog;
const C = require(ROOT + "packages/addons/lib/client-common.cjs")("wbv");
const h = (type, props, ...children) => ({ type, props: props || {}, children });
const dialogHooks = new Hooks();
const dialogReact = makeReact(dialogHooks);
ACTIVE = dialogReact;
const dialogTree = Dialog({
  h,
  React: dialogReact,
  title: "新增凭据",
  titleId: "wbv-preview-dialog",
  onClose: () => {},
  children: [
    h("div", { className: "wbv-modal-body" },
      h(C.Field, { h }, h("input", { className: "wbv-input", value: "", placeholder: "如 工作邮箱" })),
      h(C.Field, { h }, h("select", { className: "wbv-select", value: "password" }, h("option", { value: "password" }, "密码"))),
      h(C.Field, { h }, h("input", { className: "wbv-input", type: "password", value: "••••••" }))),
    h("div", { className: "wbv-modal-foot" },
      h(C.Btn, { h }, "取消"),
      h(C.Btn, { h, kind: "primary" }, "保存")),
  ],
});
const dialogHtml = toHtml(dialogTree);

function pane(theme, title, body, extraClass) {
  return `<section class="pane${extraClass ? " " + extraClass : ""}" data-theme="${theme}" style="${themeVars[theme]}">
    <div class="pane-title">${title}</div>
    <div class="pane-body">${body}</div>
  </section>`;
}

const base = [
  pane("light", "light · status", statusHtml),
  pane("light", "light · secrets", secretsHtml),
  pane("light", "light · sets", setsHtml),
  pane("light", "light · groups", groupsHtml),
  pane("light", "light · config", configHtml),
  pane("dark", "dark · status", statusHtml),
  pane("dark", "dark · secrets", secretsHtml),
  pane("dark", "dark · sets", setsHtml),
  pane("dark", "dark · groups", groupsHtml),
  pane("dark", "dark · config", configHtml),
  pane("light", "light · dialog", dialogHtml, "pane-modal"),
  pane("dark", "dark · dialog", dialogHtml, "pane-modal"),
];

const paneList = base.slice();
if (process.env.THEME) {
  const theme = process.env.THEME;
  paneList.length = 0;
  Array.prototype.push.apply(paneList, base.filter((html) => html.indexOf('data-theme="' + theme + '"') >= 0));
}

const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>vault preview</title>
<style>
  html,body{margin:0;padding:0;background:#070a12;color:#e8ecf4;font-family:-apple-system,"PingFang SC","Segoe UI",sans-serif}
  .wrap{display:grid;grid-template-columns:1fr;gap:0}
  .pane{padding:18px 22px;border-bottom:1px solid #1d2330;background:var(--wb-bg,#0b1020)}
  .pane[data-theme="light"]{--wb-bg:#f5f7fa;color:#0f172a}
  .pane[data-theme="dark"]{--wb-bg:#0b1020;color:#e8ecf4}
  .pane-title{font:600 11px/1 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#7d879b;margin:0 0 10px 2px}
  .pane-body{position:relative;padding:16px;border-radius:12px;background:var(--wb-bg)}
  .pane-modal .pane-body{padding:0}
  .pane-modal .wbv-modal{position:relative;inset:auto;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.45);min-height:320px;border-radius:12px}
${cssText}
</style></head><body><div class="wrap">${paneList.join("\n")}</div></body></html>`;

const out = (process.env.OUT || "/tmp/vault-ui-shots/preview.html");
writeFileSync(out, html);
console.log("written", out, "panes", paneList.length);
