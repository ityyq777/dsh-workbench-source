"use strict";
var C = require("../ui/common.cjs");

function emptyForm() {
  return { id: "", name: "", enabled: true, kind: "interval", everyMinutes: 60, time: "09:00", tz: "Asia/Shanghai", weekdays: "1,2,3,4,5", domainId: "", event: "", actionName: "message.send", actionArgs: '{\n  "title": "自动化提醒",\n  "body": "规则 {{rule.name}} 已运行"\n}', condition: "" };
}

function formFromRule(rule) {
  var f = emptyForm();
  f.id = rule.id;
  f.name = rule.name;
  f.enabled = rule.enabled;
  f.actionName = rule.actionName;
  f.actionArgs = JSON.stringify(rule.actionArgs || {}, null, 2);
  f.condition = rule.condition ? JSON.stringify(rule.condition, null, 2) : "";
  var t = rule.triggerConfig || {};
  f.kind = t.kind || "manual";
  if (t.kind === "interval") f.everyMinutes = t.everyMinutes || 60;
  if (t.kind === "dailyAt") { f.time = t.time || "09:00"; f.tz = t.tz || "Asia/Shanghai"; f.weekdays = (t.weekdays || [1,2,3,4,5]).join(","); }
  if (t.kind === "event") { f.domainId = t.domainId || ""; f.event = t.event || ""; }
  return f;
}

function triggerText(rule) {
  var t = rule.triggerConfig || {};
  if (t.kind === "interval") return "每 " + t.everyMinutes + " 分钟";
  if (t.kind === "dailyAt") return "每天 " + t.time + "（" + t.tz + "，周" + (t.weekdays || []).join(",") + "）";
  if (t.kind === "event") return "事件 " + t.domainId + "/" + t.event;
  return "手动";
}

module.exports = function RulesView(props) {
  var h = props.h, api = props.api, React = props.React;
  var list = C.useLoad(React, api, "automation.ruleList", {}, []);
  var opts = C.useLoad(React, api, "automation.actionOptions", {}, []);
  var form = React.useState(null);
  var msg = React.useState("");
  var busy = React.useState(false);
  var f = form[0];
  function set(k, v) { var next = Object.assign({}, form[0]); next[k] = v; form[1](next); }
  function fail(e) { msg[1](C.errText(e)); }
  function payload() {
    var triggerConfig = { kind: f.kind };
    if (f.kind === "interval") triggerConfig.everyMinutes = Number(f.everyMinutes) || 60;
    if (f.kind === "dailyAt") {
      triggerConfig.time = f.time;
      triggerConfig.tz = f.tz;
      triggerConfig.weekdays = String(f.weekdays || "").split(",").map(function (x) { return Number(x.trim()); }).filter(Boolean);
    }
    if (f.kind === "event") { triggerConfig.domainId = f.domainId; triggerConfig.event = f.event; }
    var args, cond = null;
    try { args = f.actionArgs.trim() ? JSON.parse(f.actionArgs) : {}; } catch (e) { throw new Error("actionArgs 不是合法 JSON"); }
    if (f.condition.trim()) { try { cond = JSON.parse(f.condition); } catch (e) { throw new Error("条件不是合法 JSON"); } }
    var out = { id: f.id || undefined, name: f.name, enabled: f.enabled, triggerType: f.kind === "event" ? "event" : f.kind === "manual" ? "manual" : "schedule", triggerConfig: triggerConfig, actionName: f.actionName, actionArgs: args, condition: cond };
    return out;
  }
  function save() {
    busy[1](true); msg[1]("");
    var p;
    try { p = payload(); } catch (e) { busy[1](false); return fail(e); }
    var action = f.id ? "automation.ruleUpdate" : "automation.ruleCreate";
    C.call(api, action, p).then(function () { form[1](null); list.refresh(); msg[1]("已保存"); }).catch(fail).then(function () { busy[1](false); });
  }
  function remove(rule) {
    if (typeof window !== "undefined" && !window.confirm("删除规则「" + rule.name + "」？")) return;
    C.call(api, "automation.ruleDelete", { id: rule.id }).then(function () { list.refresh(); }).catch(fail);
  }
  function run(rule) {
    busy[1](true); msg[1]("");
    C.call(api, "automation.ruleRun", { id: rule.id }).then(function (r) { msg[1](r && r.skipped ? "已跳过：" + (r.reason || "") : "已执行"); list.refresh(); }).catch(fail).then(function () { busy[1](false); });
  }
  function toggle(rule) {
    C.call(api, "automation.ruleUpdate", { id: rule.id, enabled: !rule.enabled }).then(function () { list.refresh(); }).catch(fail);
  }
  var rows = (list.data && list.data.items) || [];
  return h("div", { className: "wba-wrap" },
    h("div", { className: "wba-head" }, h("h2", null, "规则"), h("div", { className: "wba-row" },
      h(C.Btn, { h: h, kind: "primary", onClick: function () { form[1](emptyForm()); msg[1](""); } }, "新建规则"),
      h(C.Btn, { h: h, onClick: list.refresh }, "刷新"))),
    h(C.Notice, { h: h, text: msg[0], kind: /失败|不是|错误|非法/.test(msg[0]) ? "error" : "info" }),
    list.error ? h(C.Notice, { h: h, kind: "error", text: list.error }) : null,
    rows.length === 0 && !list.loading ? h(C.Empty, { h: h, text: "还没有规则。新建一条，或从备份导入。" }) : null,
    h("div", { className: "wba-table-wrap" },
      h("table", { className: "wba-table" },
        h("thead", null, h("tr", null, ["名称", "触发", "action", "状态", "上次", "操作"].map(function (x) { return h("th", { key: x }, x); }))),
        h("tbody", null, rows.map(function (r) {
          return h("tr", { key: r.id },
            h("td", null, h("b", null, r.name), h("div", { className: "wba-muted" }, r.id)),
            h("td", null, triggerText(r)),
            h("td", null, h("code", null, r.actionName)),
            h("td", null, h(C.Pill, { h: h, kind: r.enabled ? "ok" : "" }, r.enabled ? "启用" : "停用"), " ", h("span", { className: "wba-muted" }, r.lastStatus)),
            h("td", null, C.fmtTime(r.lastRunAt, props.lang)),
            h("td", null, h("div", { className: "wba-row" },
              h(C.Btn, { h: h, onClick: function () { run(r); }, disabled: busy[0] }, "运行"),
              h(C.Btn, { h: h, onClick: function () { form[1](formFromRule(r)); } }, "编辑"),
              h(C.Btn, { h: h, onClick: function () { toggle(r); } }, r.enabled ? "停用" : "启用"),
              h(C.Btn, { h: h, kind: "danger", onClick: function () { remove(r); } }, "删除"))));
        })))),
    f ? h("div", { className: "wba-panel" },
      h("h3", null, f.id ? "编辑规则" : "新建规则"),
      h("div", { className: "wba-grid" },
        h(C.Field, { h: h, label: "名称" }, h("input", { className: "wba-input", value: f.name, onChange: function (e) { set("name", e.target.value); } })),
        h(C.Field, { h: h, label: "启用" }, h("input", { type: "checkbox", checked: f.enabled, onChange: function (e) { set("enabled", e.target.checked); } })),
        h(C.Field, { h: h, label: "触发类型" }, h("select", { className: "wba-input", value: f.kind, onChange: function (e) { set("kind", e.target.value); } },
          [["interval", "固定间隔"], ["dailyAt", "每天固定时间"], ["event", "域事件"], ["manual", "手动"]].map(function (x) { return h("option", { key: x[0], value: x[0] }, x[1]); }))),
        h(C.Field, { h: h, label: "action" }, h("select", { className: "wba-input", value: f.actionName, onChange: function (e) { set("actionName", e.target.value); } },
          ((opts.data && opts.data.actions) || [f.actionName]).map(function (a) { return h("option", { key: a, value: a }, a); })))),
      f.kind === "interval" ? h(C.Field, { h: h, label: "每几分钟（1–10080）" }, h("input", { className: "wba-input", type: "number", value: f.everyMinutes, onChange: function (e) { set("everyMinutes", e.target.value); } })) : null,
      f.kind === "dailyAt" ? h("div", { className: "wba-grid" },
        h(C.Field, { h: h, label: "时间 HH:MM" }, h("input", { className: "wba-input", value: f.time, onChange: function (e) { set("time", e.target.value); } })),
        h(C.Field, { h: h, label: "时区" }, h("input", { className: "wba-input", value: f.tz, onChange: function (e) { set("tz", e.target.value); } })),
        h(C.Field, { h: h, label: "星期（1–7，逗号分隔）" }, h("input", { className: "wba-input", value: f.weekdays, onChange: function (e) { set("weekdays", e.target.value); } }))) : null,
      f.kind === "event" ? h("div", { className: "wba-grid" },
        h(C.Field, { h: h, label: "域 id" }, h("input", { className: "wba-input", value: f.domainId, onChange: function (e) { set("domainId", e.target.value); }, placeholder: "wb-addon-connector" })),
        h(C.Field, { h: h, label: "事件名" }, h("input", { className: "wba-input", value: f.event, onChange: function (e) { set("event", e.target.value); }, placeholder: "item.created" }))) : null,
      h(C.Field, { h: h, label: "action 参数（JSON，支持 {{event.field}} / {{item.field}}）" }, h("textarea", { className: "wba-input wba-code", rows: 8, value: f.actionArgs, onChange: function (e) { set("actionArgs", e.target.value); } })),
      h(C.Field, { h: h, label: "条件（可选 JSON：{field,op,value}）" }, h("textarea", { className: "wba-input wba-code", rows: 4, value: f.condition, onChange: function (e) { set("condition", e.target.value); } })),
      h("div", { className: "wba-row" },
        h(C.Btn, { h: h, kind: "primary", onClick: save, disabled: busy[0] }, "保存"),
        h(C.Btn, { h: h, onClick: function () { form[1](null); } }, "取消"))) : null);
};
