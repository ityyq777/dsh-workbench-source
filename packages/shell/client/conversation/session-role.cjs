"use strict";
// 输入区只绑定 DSH 分配的真实会话。未选工作区的欢迎页尚不可发送，也不会挂载这个插槽。
const React = require("react");
const { createPortal } = require("react-dom");
const h = React.createElement;
const Button = require("../../../addons/lib/button.cjs")({ prefix: "wb-role" });
const Dialog = require("../../../addons/lib/overlay.cjs")({ maskClass: "wb-role-mask", dialogClass: "wb-role-dialog" });
const endpoint = "/workbench/api/session-role";
const listeners = new Set();

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

function SessionRole({ sessionId: sid, t, ensureStream }) {
  const [state, setState] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const generation = React.useRef(0);
  const saving = React.useRef(false);
  const alive = React.useRef(false);
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
  const choices = [{ id: null, name: t("role_none"), description: t("role_none_desc") }, ...roles];
  return h(React.Fragment, null,
    h(Button, { className: "wb-role-trigger", "aria-haspopup": "dialog", "aria-expanded": open,
      title: t("role_title"), onClick: () => { setOpen(true); refresh(); } },
      state ? label : t("role_title")),
    open && createPortal(h(Dialog, { title: t("role_title"), onClose: () => setOpen(false), closeOnEscape: !busy, closeOnMask: !busy },
      h("strong", null, t("role_title")), h("small", null, t("role_next")),
      missing && h("small", { role: "status" }, t("role_missing")),
      error && h("div", { role: "alert" }, t("role_error") + " · " + error, " ", h(Button, { disabled: busy, onClick: refresh }, t("role_retry"))),
      !state && !error && h("small", { role: "status" }, t("role_loading")),
      choices.map((r) => h(Button, { key: r.id || "", disabled: busy || !state, "aria-pressed": !!state && state.roleId === r.id,
        onClick: () => state.roleId === r.id ? setOpen(false) : save({ roleId: r.id }) },
        h("b", null, r.name), h("small", null, [r.domain, r.description].filter(Boolean).join(" · ")))),
      h(Button, { disabled: busy, onClick: () => setOpen(false) }, t("role_close"))
    ), document.body)
  );
}
module.exports = { SessionRole, attachStream };
