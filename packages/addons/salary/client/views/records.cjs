"use strict";
/** 工资记录页：KPI + 按月分组列表 + 行内详情/编辑/删除 + 内联录入表单。 */
module.exports = function Records(props) {
  var h = props.h, React = props.React, api = props.api, lang = props.lang;
  var C = require("../ui/common.cjs");
  var F = require("../ui/fields.cjs");
  var msgState = React.useState(null);
  var msg = msgState[0], setMsg = msgState[1];
  var filterState = React.useState({ year: "", cycle: "" });
  var filter = filterState[0], setFilter = filterState[1];
  var openState = React.useState("");
  var openId = openState[0], setOpenId = openState[1];
  var confirmState = React.useState("");
  var confirmId = confirmState[0], setConfirmId = confirmState[1];
  var formState = React.useState(null);
  var form = formState[0], setForm = formState[1];

  var status = C.useLoad(React, api, "salary.status", {}, []);
  var stats = C.useLoad(React, api, "salary.stats", { year: new Date().getFullYear() }, []);
  var list = C.useLoad(React, api, "salary.recordList", {
    year: filter.year || undefined,
    cycle: filter.cycle || undefined,
    limit: 500,
  }, [filter.year, filter.cycle]);

  function reloadAll() { status.refresh(); stats.refresh(); list.refresh(); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function todayStr() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function monthlyDefault() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-15"; }

  function openCreate() {
    var values = F.blankValues();
    setMsg(null);
    setForm({
      mode: "create", id: "", payDate: monthlyDefault(), cycle: "monthly", note: "",
      values: values, lockGross: false, lastComputed: { gross: 0, net: 0 },
    });
  }
  function openEdit(item) {
    var values = {};
    F.KEYS.forEach(function (key) { values[key] = item[key] ? String(item[key]) : ""; });
    var incomes = F.sumValues(values, F.INCOME_KEYS);
    setMsg(null);
    setForm({
      mode: "edit", id: item.id, payDate: item.payDate, cycle: item.cycle || "monthly", note: item.note || "",
      values: values, lockGross: incomes === 0 && Number(item.grossPay) > 0,
      lastComputed: { gross: Number(item.grossPay) || 0, net: Number(item.netPay) || 0 },
    });
  }
  function closeForm() { setForm(null); setMsg(null); }

  function setValue(key, value) {
    var current = form.values;
    var nextValues = Object.assign({}, current);
    nextValues[key] = value;
    var computed = F.totals(nextValues);
    if (key !== "grossPay" && !form.lockGross && F.num(current.grossPay) === form.lastComputed.gross) {
      nextValues.grossPay = F.fmtAmount(computed.gross);
    }
    if (key !== "netPay" && F.num(current.netPay) === form.lastComputed.net) {
      nextValues.netPay = F.fmtAmount(computed.net);
    }
    setForm(Object.assign({}, form, {
      values: nextValues,
      lastComputed: { gross: F.num(nextValues.grossPay), net: F.num(nextValues.netPay) },
    }));
  }
  function setField(key, value) {
    var next = Object.assign({}, form, { [key]: value });
    if (key === "cycle" && form.mode === "create") next.payDate = value === "daily" ? todayStr() : monthlyDefault();
    setForm(next);
  }
  function recalcFromDetail() {
    var computed = F.totals(form.values);
    setForm(Object.assign({}, form, {
      lockGross: false,
      values: Object.assign({}, form.values, { grossPay: F.fmtAmount(computed.gross), netPay: F.fmtAmount(computed.net) }),
      lastComputed: { gross: computed.gross, net: computed.net },
    }));
  }
  function submit() {
    if (!form.payDate) { setMsg({ kind: "error", text: "请选择发薪日期" }); return; }
    var payload = { payDate: form.payDate, cycle: form.cycle, note: form.note };
    F.KEYS.forEach(function (key) { payload[key] = F.num(form.values[key]); });
    var pending = form.mode === "edit"
      ? C.call(api, "salary.recordUpdate", Object.assign({ id: form.id }, payload))
      : C.call(api, "salary.recordCreate", payload);
    pending.then(function () {
      setMsg({ kind: "ok", text: form.mode === "edit" ? "已保存" : "已记录一笔工资" });
      setForm(null);
      reloadAll();
    }).catch(function (e) { setMsg({ kind: "error", text: C.errText(e) }); });
  }
  function remove(id) {
    C.call(api, "salary.recordDelete", { id: id }).then(function () {
      setConfirmId("");
      if (openId === id) setOpenId("");
      setMsg({ kind: "ok", text: "已删除" });
      reloadAll();
    }).catch(function (e) { setMsg({ kind: "error", text: C.errText(e) }); });
  }

  var items = (list.data && list.data.items) || [];
  var groups = {};
  items.forEach(function (item) {
    var period = String(item.payDate).slice(0, 7);
    (groups[period] = groups[period] || []).push(item);
  });
  var periods = Object.keys(groups).sort().reverse();
  var sameDayCount = form ? items.filter(function (item) { return item.payDate === form.payDate; }).length : 0;
  var currentYear = new Date().getFullYear();
  var yearOptions = ["", String(currentYear + 1), String(currentYear), String(currentYear - 1), String(currentYear - 2), String(currentYear - 3)];

  function kpi(label, value, sub) {
    return h("div", { className: "wbsal-card wbsal-kpi" }, h("span", null, label), h("strong", null, value), h("em", null, sub));
  }

  function amountInput(key, formState, disabled) {
    return h("input", {
      className: "wbsal-input", type: "number", step: "0.01",
      min: key === "performanceBonus" ? undefined : "0",
      value: formState.values[key],
      disabled: disabled,
      onChange: function (e) { setValue(key, e.target.value); },
      onBlur: function () { setValue(key, F.fmtAmount(F.num(formState.values[key]))); },
    });
  }

  function renderForm() {
    var computed = F.totals(form.values);
    return h("div", { className: "wbsal-card" },
      h("div", { className: "wbsal-head" },
        h("h3", null, form.mode === "edit" ? "编辑工资" : "记一笔工资"),
        h(C.Btn, { h: h, onClick: closeForm }, "关闭")),
      form.mode === "create" && sameDayCount > 0
        ? h(C.Notice, { h: h, text: "该日已有 " + sameDayCount + " 笔记录；保存会新增一条，不会覆盖。" })
        : null,
      h("div", { className: "wbsal-form-grid" },
        h(C.Field, { h: h, label: "发薪日期" }, h("input", { className: "wbsal-input", type: "date", value: form.payDate, onChange: function (e) { setField("payDate", e.target.value); } })),
        h(C.Field, { h: h, label: "类型", hint: "月结默认当月 15 号" },
          h("select", { className: "wbsal-input", value: form.cycle, onChange: function (e) { setField("cycle", e.target.value); } },
            h("option", { value: "monthly" }, "月结"), h("option", { value: "daily" }, "日结"))),
        h(C.Field, { h: h, label: "备注" }, h("input", { className: "wbsal-input", value: form.note, onChange: function (e) { setField("note", e.target.value); } }))),
      F.GROUPS.map(function (group) {
        return h("div", { key: group.id },
          h("div", { className: "wbsal-group-title" }, group.title + " · " + group.hint),
          h("div", { className: "wbsal-form-grid" }, group.keys.map(function (key) {
            return h(C.Field, { key: key, h: h, label: F.LABELS[key] }, amountInput(key, form, false));
          })));
      }),
      h("div", { className: "wbsal-group-title" }, "汇总 · 默认按明细实时计算，也可直接改"),
      h("div", { className: "wbsal-form-grid" },
        h(C.Field, { h: h, label: "应发税前工资" }, amountInput("grossPay", form, false)),
        h(C.Field, { h: h, label: "实发工资" }, amountInput("netPay", form, false)),
        h("div", { className: "wbsal-inline-actions" },
          form.lockGross ? h("span", { className: "wbsal-muted" }, "该记录只有汇总值，应发已锁定") : null,
          h(C.Btn, { h: h, onClick: recalcFromDetail }, "按明细重算"))),
      h("div", { className: "wbsal-summary" },
        h("div", null, h("span", null, "收入合计"), h("b", null, F.money(computed.income))),
        h("div", null, h("span", null, "税前扣款"), h("b", null, F.money(computed.preTax))),
        h("div", null, h("span", null, "社保公积金"), h("b", null, F.money(computed.social))),
        h("div", null, h("span", null, "个税+税后"), h("b", null, F.money(computed.tax))),
        h("div", null, h("span", null, "应发"), h("b", null, F.money(F.num(form.values.grossPay)))),
        h("div", null, h("span", null, "实发"), h("b", null, F.money(F.num(form.values.netPay))))),
      h(C.Notice, { h: h, kind: msg && msg.kind, text: msg && msg.text }),
      h("div", { className: "wbsal-inline-actions" },
        h(C.Btn, { h: h, kind: "primary", onClick: submit }, form.mode === "edit" ? "保存修改" : "保存"),
        h(C.Btn, { h: h, onClick: closeForm }, "取消")));
  }

  function renderDetail(item) {
    return h("div", { className: "wbsal-detail" },
      F.GROUPS.map(function (group) {
        return h("div", { key: group.id },
          h("div", { className: "wbsal-group-title" }, group.title),
          h("div", { className: "wbsal-fields" }, group.keys.map(function (key) {
            return h("div", { key: key }, h("span", null, F.LABELS[key]), h("b", null, F.money(item[key])));
          })));
      }),
      h("div", { className: "wbsal-fields" },
        h("div", null, h("span", null, "应发税前工资"), h("b", null, F.money(item.grossPay))),
        h("div", null, h("span", null, "实发工资"), h("b", null, F.money(item.netPay)))),
      item.note ? h("div", { className: "wbsal-muted" }, "备注：" + item.note) : null,
      h("div", { className: "wbsal-inline-actions" },
        h(C.Btn, { h: h, onClick: function () { openEdit(item); } }, "编辑"),
        confirmId === item.id
          ? h("span", { className: "wbsal-inline-actions" }, h("span", { className: "wbsal-danger" }, "确认删除？"),
            h(C.Btn, { h: h, kind: "danger", onClick: function () { remove(item.id); } }, "删除"),
            h(C.Btn, { h: h, onClick: function () { setConfirmId(""); } }, "取消"))
          : h(C.Btn, { h: h, kind: "danger", onClick: function () { setConfirmId(item.id); } }, "删除"),
        h("span", { className: "wbsal-muted" }, "更新于 " + C.fmtTime(item.updatedAt, lang))));
  }

  function renderRow(item) {
    var expanded = openId === item.id;
    return h("div", { key: item.id, className: "wbsal-record" },
      h("div", { className: "wbsal-record-row", onClick: function () { setOpenId(expanded ? "" : item.id); setConfirmId(""); } },
        h("span", { className: "wbsal-num" }, String(item.payDate).slice(5) + " " + F.weekday(item.payDate)),
        h(C.Pill, { h: h, kind: item.cycle === "daily" ? "warn" : "ok" }, item.cycle === "daily" ? "日结" : "月结"),
        h("span", { className: "wbsal-net" }, F.money(item.netPay)),
        h("span", { className: "wbsal-col opt" }, F.money(item.grossPay)),
        h("span", { className: "wbsal-col opt" }, F.money(F.sumValues(item, F.SOCIAL_KEYS))),
        h("span", { className: "wbsal-col opt" }, F.money(item.incomeTax))),
      expanded ? renderDetail(item) : null);
  }

  return h("div", { className: "wbsal-page" },
    h("div", { className: "wbsal-head" },
      h("div", null,
        h("h2", null, "工资记录"),
        h("p", { className: "wbsal-sub" }, "按发薪日期记录，日结/月结都记；同一天可以有多笔")),
      h(C.Btn, { h: h, kind: "primary", onClick: openCreate }, "＋ 记一笔")),
    form ? renderForm() : null,
    h("div", { className: "wbsal-kpis" },
      kpi("最近实发", status.data ? F.money(status.data.latestNetPay) : "—",
        status.data && status.data.latestDate ? status.data.latestDate + " · 最近一笔" : "还没有记录"),
      kpi("最近月合计", stats.data && stats.data.latestMonth ? F.money(stats.data.latestMonth.netPay) : "—",
        stats.data && stats.data.latestMonth ? F.monthLabel(stats.data.latestMonth.period) + " · " + stats.data.latestMonth.records + " 笔" : "暂无"),
      kpi("今年累计实发", stats.data ? F.money(stats.data.netTotal) : "—", currentYear + " 年 · " + (stats.data ? stats.data.records : 0) + " 笔"),
      kpi("今年个税", stats.data ? F.money(stats.data.incomeTaxTotal) : "—", "含工资薪金预扣")),
    h("div", { className: "wbsal-row" },
      h(C.Field, { h: h, label: "年份" }, h("select", { className: "wbsal-input", value: filter.year, onChange: function (e) { setFilter(Object.assign({}, filter, { year: e.target.value })); } },
        yearOptions.map(function (value) { return h("option", { key: value || "all", value: value }, value ? value + " 年" : "全部年份"); }))),
      h(C.Field, { h: h, label: "类型" }, h("select", { className: "wbsal-input", value: filter.cycle, onChange: function (e) { setFilter(Object.assign({}, filter, { cycle: e.target.value })); } },
        h("option", { value: "" }, "全部"), h("option", { value: "monthly" }, "月结"), h("option", { value: "daily" }, "日结"))),
      h("span", { className: "wbsal-muted" }, "共 " + (list.data ? list.data.total : 0) + " 笔")),
    h(C.Notice, { h: h, kind: msg && msg.kind, text: msg && !form ? msg.text : "" }),
    list.loading ? h(C.Empty, { h: h, text: "加载中…" })
      : list.error ? h(C.Notice, { h: h, kind: "error", text: list.error })
        : items.length === 0 ? h("div", null,
          h(C.Empty, { h: h, text: filter.year || filter.cycle ? "这个筛选条件下没有记录" : "还没有工资记录，先记一笔" }),
          h("div", { className: "wbsal-empty-actions" }, h(C.Btn, { h: h, kind: "primary", onClick: openCreate }, "＋ 记一笔")))
          : periods.map(function (period) {
            var rows = groups[period];
            var sum = rows.reduce(function (total, item) { return total + (Number(item.netPay) || 0); }, 0);
            return h("section", { key: period },
              h("div", { className: "wbsal-month" }, h("strong", null, F.monthLabel(period)), h("span", null, rows.length + " 笔 · 合计 " + F.money(sum))),
              rows.map(renderRow));
          }));
};
