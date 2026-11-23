"use strict";
// 宿主角色目录使用自己的接口，插件原件只读，两种来源均可生成独立副本。
const React = require("react");
const h = React.createElement;
const { Btn, Field, Notice, Empty, unwrap } = require("../../../addons/lib/client-common.cjs")("wb");
const endpoint = "/role-catalog";
function catalogRows(response) {
  const value = unwrap(response);
  if (!Array.isArray(value?.roles)) throw new Error("Invalid role catalog");
  return value.roles;
}
function fieldsOf(role) {
  return { name: role?.name || "", description: role?.description || "", instructions: role?.instructions || "", actions: (role?.actions || []).join("\n") };
}
function editorPayload(mode, values, id) {
  const actions = [...new Set(values.actions.split(/[\s,，]+/).filter(Boolean))];
  return { op: mode, ...(id ? { id } : {}), name: values.name.trim(), description: values.description.trim(), instructions: values.instructions.trim(), actions };
}
function RoleCatalog({ api, lang, head }) {
  const tr = (zh, en) => lang === "en" ? en : zh;
  const [roles, setRoles] = React.useState(null);
  const [draft, setDraft] = React.useState(null);
  const [pendingDelete, setDelete] = React.useState(null);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const lock = React.useRef(false), sequence = React.useRef(0);
  async function refresh() {
    const req = ++sequence.current;
    try { const rows = catalogRows(await api.get(endpoint)); if (req === sequence.current) { setRoles(rows); setError(""); } }
    catch (e) { if (req === sequence.current) setError(e.message); }
  }
  React.useEffect(() => {
    refresh();
    const stream = new EventSource("/workbench/api/events");
    for (const event of ["role-catalog", "domains-changed", "open"]) stream.addEventListener(event, refresh);
    return () => { ++sequence.current; stream.close(); };
  }, []);
  async function mutate(payload) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const rows = catalogRows(await api.post(endpoint, payload));
      ++sequence.current; setRoles(rows); setDraft(null); setDelete(null);
    } catch (e) { setError(e.message); }
    finally { lock.current = false; setBusy(false); }
  }
  function button(label, onClick, disabled = false) { return h(Btn, { h, onClick, disabled: busy || disabled }, label); }
  function begin(mode, role) { setDraft({ mode, id: role?.id, ...fieldsOf(role) }); setDelete(null); setError(""); }
  function field(key, label, rows) {
    return h(Field, { h, label }, h(rows ? "textarea" : "input", { name: key, rows, className: "wb-input", value: draft[key], disabled: busy,
      onChange: (e) => setDraft({ ...draft, [key]: e.target.value }) }));
  }
  const labels = { create: tr("新建角色", "New role"), update: tr("编辑角色", "Edit role") };
  function editor() {
    return h("section", { className: "wb-card wb-stack" }, h("strong", null, labels[draft.mode]),
      field("name", tr("名称", "Name")), field("description", tr("职责简介", "Description")),
      field("instructions", tr("角色指令", "Instructions"), 8), field("actions", tr("允许的工作台动作（每行一个）", "Allowed actions (one per line)"), 4),
      h("div", { className: "wb-sec" }, button(tr("保存", "Save"), () => mutate(editorPayload(draft.mode, draft, draft.id)), !draft.name.trim() || !draft.instructions.trim()),
        button(tr("取消", "Cancel"), () => setDraft(null))));
  }
  function card(role) {
    const editable = role.source === "user";
    return h("article", { key: role.id, className: "wb-card wb-stack" }, h("strong", null, role.name),
      h("small", { className: "wb-msg" }, (editable ? tr("自定义角色", "Custom role") : role.domain) + " · " + role.id + " · v" + role.version),
      h("span", null, role.description),
      h("details", null, h("summary", null, tr("查看指令与动作", "View instructions and actions")),
        h("p", { style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere" } }, role.instructions),
        h("code", { style: { overflowWrap: "anywhere" } }, role.actions.join(", ") || tr("未选择动作", "No actions"))),
      h("div", { className: "wb-sec" }, button(tr("复制为新角色", "Duplicate as a new role"), () => mutate({ op: "copy", id: role.id }), !!draft),
        editable && button(tr("编辑", "Edit"), () => begin("update", role), !!draft),
        editable && button(tr("删除", "Delete"), () => setDelete(role.id), !!draft)),
      pendingDelete === role.id && h("div", { className: "wb-sec" }, tr("确定删除此角色？", "Delete this role?"),
        button(tr("确认删除", "Confirm deletion"), () => mutate({ op: "delete", id: role.id })),
        button(tr("取消", "Cancel"), () => setDelete(null))));
  }
  return h("div", { className: "wb-root" }, h("div", { className: "wb-inner wb-wide wb-stack" },
    head(tr("角色管理", "Role management"), tr("查看插件角色，创建和维护自己的会话角色", "Browse plugin roles and manage your own session roles")),
    h("div", { className: "wb-sec" }, button(labels.create, () => begin("create"), !!draft)),
    error && h("div", { role: "alert" }, h(Notice, { h, kind: "error", text: error }), button(tr("重新加载", "Reload"), refresh)),
    draft && editor(), roles === null ? h(Notice, { h, text: tr("正在读取角色…", "Loading roles…") }) :
      roles.length ? roles.map(card) : h(Empty, { h, text: tr("暂无角色", "No roles") })));
}
module.exports = RoleCatalog;
