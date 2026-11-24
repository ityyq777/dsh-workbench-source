"use strict";
// 输入区只绑定 DSH 分配的真实会话。未选工作区的欢迎页尚不可发送，也不会挂载这个插槽。
const React = require("react");
const { createPortal } = require("react-dom");
const h = React.createElement;
const Button = require("../../../addons/lib/button.cjs")({ prefix: "wb-role" });
const { Icon } = require("./icons.cjs");
// 标题只由浮层外壳渲染一次：内容区不再写 h("strong")，副标题 role_next 也归外壳，
// 避免「标题出现两遍、字号各说各话」。
const Dialog = require("../../../addons/lib/overlay.cjs")({
  maskClass: "wb-role-mask",
  dialogClass: "wb-role-dialog",
  header: (props) => h("div", { className: "wb-role-head" },
    h("h2", { className: "wb-role-title" }, props.title),
    props.subtitle ? h("p", { className: "wb-role-sub" }, props.subtitle) : null),
});
const endpoint = "/workbench/api/session-role";
const listeners = new Set();

// 角色由各域在 DomainDef.roles 里声明，装一个插件就多几条；这里把「按关键词找角色」
// 收成一个纯函数，便于单测，也避免把过滤规则散在渲染里。
const TOKEN_SPLIT = /\s+/;

/** 拆关键词：按空白分词、大小写不敏感，空串视为不过滤。 */
function tokensOf(query) {
  return String(query || "").toLowerCase().split(TOKEN_SPLIT).filter(Boolean);
}

/** 一个角色的可检索文本：名称、域、说明、动作名（能从「谁能改任务」这种目标倒着找）。 */
function haystackOf(role) {
  const actions = Array.isArray(role && role.actions) ? role.actions : [];
  return [role && role.name, role && role.domain, role && role.description, ...actions]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** 多关键词按 AND 生效：每个词都要命中同一角色的可检索文本。 */
function matchRole(role, tokens) {
  if (!tokens.length) return true;
  const hay = haystackOf(role);
  return tokens.every((token) => hay.includes(token));
}

/** 过滤角色列表，保持原有顺序（插件角色在前、用户自建在后，不按命中重排）。 */
function filterRoles(roles, query) {
  const tokens = tokensOf(query);
  return (roles || []).filter((role) => matchRole(role, tokens));
}

/**
 * 把文本按命中词切片，返回 [{ text, hit }]，供渲染时用 <mark> 包住命中片段。
 * 多个关键词的命中区间合并后再切，避免嵌套或重复包裹。
 */
function splitHits(value, tokens) {
  const text = String(value == null ? "" : value);
  if (!text) return [];
  if (!tokens.length) return [{ text, hit: false }];
  const lower = text.toLowerCase();
  const ranges = [];
  for (const token of tokens) {
    let from = 0;
    for (;;) {
      const at = lower.indexOf(token, from);
      if (at < 0) break;
      ranges.push([at, at + token.length]);
      from = at + token.length;
      if (!token.length) break;
    }
  }
  if (!ranges.length) return [{ text, hit: false }];
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }
  const parts = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), hit: false });
    parts.push({ text: text.slice(start, end), hit: true });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false });
  return parts;
}

function attachStream(stream) {
  function refresh(event) {
    try {
      const sid = JSON.parse(event.data).sessionId;
      if (sid) listeners.forEach((listener) => listener(sid));
    } catch (error) { console.warn(error); }
  }
  stream.addEventListener("session-role", refresh);
  function refreshAll() { listeners.forEach((listener) => listener(null)); }
  stream.addEventListener("role-catalog", refreshAll);
  stream.addEventListener("domains-changed", refreshAll);
  stream.addEventListener("open", refreshAll);
}

async function request(sid, patch) {
  const response = patch ? await fetch(endpoint, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: sid, ...patch }),
  }) : await fetch(endpoint + "?sessionId=" + encodeURIComponent(sid));
  const data = await response.json();
  if (!response.ok || data.ok === false || data.sessionId !== sid) throw new Error(data.error || "HTTP " + response.status);
  return data;
}

/** 文案里的 {shown}/{total} 占位替换，缺失时原样返回，避免 undefined 露到界面上。 */
function fill(text, values) {
  return String(text || "").replace(/\{(\w+)\}/g, (all, key) => (key in values ? String(values[key]) : all));
}

function SessionRole({ sessionId: sid, t, ensureStream }) {
  const [state, setState] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  // 搜索词跟着组件走，目录刷新（role-catalog / domains-changed）不会把它重置掉。
  const [query, setQuery] = React.useState("");
  const generation = React.useRef(0);
  const saving = React.useRef(false);
  const alive = React.useRef(false);
  const searchRef = React.useRef(null);
  const listRef = React.useRef(null);
  const refresh = React.useCallback(async () => {
    const current = ++generation.current;
    try {
      const result = await request(sid);
      if (alive.current && current === generation.current) { setState(result); setError(""); }
    } catch (e) {
      if (alive.current && current === generation.current) setError(String(e.message || e));
    }
  }, [sid]);
  React.useEffect(() => {
    if (!sid) return;
    alive.current = true;
    const listener = (changed) => { if (!changed || changed === sid) refresh(); };
    listeners.add(listener);
    ensureStream();
    refresh();
    return () => { alive.current = false; generation.current++; listeners.delete(listener); };
  }, [sid, refresh, ensureStream]);

  async function save(patch) {
    if (saving.current || !state) return;
    saving.current = true;
    ++generation.current;
    setBusy(true);
    setError("");
    try {
      const result = await request(sid, patch);
      if (alive.current) {
        ++generation.current;
        setState((previous) => ({ ...previous, ...result }));
        setQuery("");
        setOpen(false);
        refresh();
      }
    } catch (e) {
      if (alive.current) setError(String(e.message || e));
    } finally {
      saving.current = false;
      if (alive.current) setBusy(false);
    }
  }
  if (!sid) return null;
  const roles = state?.roles || [];
  const selected = roles.find((r) => r.id === state?.roleId);
  const missing = state?.roleId && !selected;
  const label = selected?.name || t(missing ? "role_missing" : "role_none");
  const tokens = tokensOf(query);
  const matched = filterRoles(roles, query);
  // 「不使用工作台角色」已移出列表：它不受关键词过滤影响，作为列表下方的退出项常驻，
  // 搜索时也不会把用户的退出路径滤掉。
  const searching = tokens.length > 0;
  // 读取中（state 为空）时任何一项都不算选中，避免加载瞬间就点亮「不使用工作台角色」。
  const current = state ? state.roleId ?? null : undefined;

  function clearQuery() {
    setQuery("");
    if (searchRef.current && searchRef.current.focus) searchRef.current.focus();
  }

  // Esc：有搜索词先清空（保留弹层），没有搜索词才关闭，避免一按就把选择流程打断。
  function escape() {
    if (searching) clearQuery();
    else setOpen(false);
  }

  // 方向键在弹层内的选项按钮之间移动焦点；被过滤掉的项根本不渲染，天然不可聚焦。
  function focusItem(step) {
    if (!listRef.current || !listRef.current.querySelectorAll) return;
    const items = Array.from(listRef.current.querySelectorAll("button:not(:disabled)"));
    if (!items.length) return;
    const active = typeof document === "undefined" ? null : document.activeElement;
    const at = items.indexOf(active);
    const next = at < 0 ? (step > 0 ? 0 : items.length - 1) : Math.min(items.length - 1, Math.max(0, at + step));
    if (items[next] && items[next].focus) items[next].focus();
  }

  function onSearchKeyDown(event) {
    if (event.key === "ArrowDown") { event.preventDefault(); focusItem(1); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); focusItem(-1); return; }
    if (event.key === "Enter") {
      // 只剩一条命中时直接选中，省一次方向键；否则把焦点交给列表。
      if (matched.length === 1) { event.preventDefault(); save({ roleId: matched[0].id }); return; }
      if (matched.length) { event.preventDefault(); focusItem(1); }
      return;
    }
    if (event.key === "Escape") { event.preventDefault(); escape(); }
  }

  function onItemKeyDown(event) {
    if (event.key === "ArrowDown") { event.preventDefault(); focusItem(1); return; }
    if (event.key === "ArrowUp") { event.preventDefault(); focusItem(-1); return; }
    if (event.key === "Escape") { event.preventDefault(); escape(); }
  }

  // 命中片段用 <mark> 包住，颜色走主题 token（见 conversation/styles.cjs 的 .wb-role-mark）。
  function marked(value) {
    return splitHits(value, tokens).map((part, index) => part.hit
      ? h("mark", { key: "m" + index, className: "wb-role-mark" }, part.text)
      : part.text);
  }

  // 选项左侧图标区分来源：插件声明的角色是 bot，用户自建的是 user。
  function glyphOf(role) {
    return role.source === "user" ? "user" : "bot";
  }

  // 一条角色卡片：左图标、右侧名称 + 「域 / 说明」两行、选中时右侧打勾。
  function optionRow(role) {
    const on = !!state && current === role.id;
    return h(Button, { key: role.id, className: "wb-role-option",
      disabled: busy || !state, "aria-pressed": on,
      onKeyDown: onItemKeyDown,
      onClick: () => (on ? setOpen(false) : save({ roleId: role.id })) },
      h("span", { className: "wb-role-option-icon", "aria-hidden": "true" },
        h(Icon, { name: glyphOf(role), size: 14 })),
      h("span", { className: "wb-role-option-text" },
        h("span", { className: "wb-role-option-name" }, marked(role.name)),
        // 域与说明拆成两个元素：说明较长时才能各自换行，也不再依赖「·」拼串。
        (role.domain || role.description) && h("span", { className: "wb-role-option-meta" },
          role.domain ? h("span", { className: "wb-role-option-domain" }, marked(role.domain)) : null,
          role.description ? h("span", { className: "wb-role-option-desc" }, marked(role.description)) : null)),
      h("span", { className: "wb-role-option-check", "aria-hidden": "true" },
        on ? h(Icon, { name: "check", size: 14, strokeWidth: 2.5 }) : null));
  }

  return h(React.Fragment, null,
    h(Button, { className: "wb-role-trigger", "aria-haspopup": "dialog", "aria-expanded": open,
      title: t("role_title"), onClick: () => { setOpen(true); refresh(); } },
      state ? label : t("role_title")),
    open && createPortal(h(Dialog, { title: t("role_title"), subtitle: t("role_next"),
      onClose: () => { setQuery(""); setOpen(false); }, closeOnEscape: !busy, closeOnMask: !busy, autoFocus: false },
      error && h("div", { className: "wb-role-error", role: "alert" },
        t("role_error") + " · " + error, " ",
        h(Button, { className: "wb-role-retry", disabled: busy, onClick: refresh }, t("role_retry"))),
      missing && h("p", { className: "wb-role-note", role: "status" }, t("role_missing")),
      h("input", { ref: searchRef, className: "wb-role-search", type: "search", value: query, autoFocus: true,
        "aria-label": t("role_search"), placeholder: t("role_search"),
        onChange: (event) => setQuery(event.target.value), onKeyDown: onSearchKeyDown }),
      searching && h("small", { className: "wb-role-count", role: "status" },
        fill(t("role_search_count"), { shown: matched.length, total: roles.length })),
      !state && !error && h("p", { className: "wb-role-note", role: "status" }, t("role_loading")),
      h("div", { ref: listRef, className: "wb-role-list", role: "group", "aria-label": t("role_title") },
        matched.map(optionRow)),
      searching && !matched.length && h("div", { className: "wb-role-empty", role: "status" },
        h("span", null, t("role_search_empty")), " ",
        h(Button, { className: "wb-role-clear", onClick: clearQuery }, t("role_search_clear"))),
      // 分隔线之后是退出项：不参与过滤、不混在角色列表里，语义更像「取消选择」。
      h("hr", { className: "wb-role-sep" }),
      h(Button, { className: "wb-role-none", disabled: busy || !state,
        "aria-pressed": !!state && current === null,
        onClick: () => (!!state && current === null ? setOpen(false) : save({ roleId: null })) },
        h("span", { className: "wb-role-none-icon", "aria-hidden": "true" }, h(Icon, { name: "x-circle", size: 14 })),
        h("span", { className: "wb-role-none-name" }, t("role_none")),
        h("small", { className: "wb-role-none-desc" }, t("role_none_desc"))),
      h("div", { className: "wb-role-foot" },
        h("span", { className: "wb-role-hint" }, t("role_hint")),
        h(Button, { className: "wb-role-close", disabled: busy,
          onClick: () => { setQuery(""); setOpen(false); } }, t("role_close")))
    ), document.body)
  );
}
module.exports = { SessionRole, attachStream, filterRoles, splitHits, tokensOf };
