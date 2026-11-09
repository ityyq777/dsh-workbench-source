var React = require("react"),
  ui = require("./ui.cjs"),
  useConfig = require("./config.cjs").useConfig;
var h = ui.h,
  tr = ui.tr;
function DataView(props) {
  var api = props.api,
    lang = props.lang,
    config = useConfig(api, { "data.pageSize": 50, "data.includeDeleted": false, "data.showSystemColumns": false });
  var result = React.useState(null),
    error = React.useState(null),
    busy = React.useState(false),
    page = React.useState(1),
    search = React.useState(""),
    query = React.useState(""),
    deleted = React.useState(null),
    system = React.useState(null),
    tick = React.useState(0);
  React.useEffect(
    function () {
      var timer = setTimeout(function () {
        query[1](search[0]);
        page[1](1);
      }, 250);
      return function () {
        clearTimeout(timer);
      };
    },
    [search[0]],
  );
  var showDeleted = deleted[0] === null ? !!config.values["data.includeDeleted"] : deleted[0];
  var showSystem = system[0] === null ? !!config.values["data.showSystemColumns"] : system[0];
  React.useEffect(
    function () {
      if (!config.ready) return;
      var active = true;
      busy[1](true);
      error[1](null);
      ui.call(api, "storage.dataQuery", {
        table: "storage",
        page: page[0],
        pageSize: config.values["data.pageSize"],
        search: query[0],
        includeDeleted: showDeleted,
      })
        .then(function (r) {
          if (active) result[1](r);
        })
        .catch(function (e) {
          if (active) error[1](e);
        })
        .finally(function () {
          if (active) busy[1](false);
        });
      return function () {
        active = false;
      };
    },
    [api, config.ready, config.values["data.pageSize"], page[0], query[0], showDeleted, tick[0]],
  );
  var data = result[0],
    cols = data
      ? (data.columns || []).filter(function (c) {
          return showSystem || !c.system;
        })
      : [];
  return h(
    "div",
    { className: "wbi-root" },
    h("h2", null, tr(lang, "物品数据", "Inventory data")),
    h(
      "p",
      { className: "wbi-muted" },
      tr(
        lang,
        "只读查看本插件数据。标签关联可在标签插件的数据页查看。",
        "Read-only plugin data. Tag links are available in the Tags data view.",
      ),
    ),
    h(
      "div",
      { className: "wbi-toolbar" },
      h("input", {
        type: "search",
        value: search[0],
        placeholder: tr(lang, "搜索数据", "Search data"),
        "aria-label": tr(lang, "搜索数据", "Search data"),
        onChange: function (e) {
          search[1](e.target.value);
        },
      }),
      h(
        "label",
        null,
        h("input", {
          type: "checkbox",
          checked: showDeleted,
          onChange: function (e) {
            deleted[1](e.target.checked);
            page[1](1);
          },
        }),
        tr(lang, "包含已删除", "Include deleted"),
      ),
      h(
        "label",
        null,
        h("input", {
          type: "checkbox",
          checked: showSystem,
          onChange: function (e) {
            system[1](e.target.checked);
          },
        }),
        tr(lang, "系统字段", "System columns"),
      ),
      h(
        ui.Button,
        {
          disabled: busy[0],
          onClick: function () {
            tick[1](tick[0] + 1);
          },
        },
        tr(lang, "刷新", "Refresh"),
      ),
    ),
    h(ui.ErrorBox, { error: error[0] || config.error }),
    busy[0] ? h("p", { role: "status" }, tr(lang, "读取中…", "Loading…")) : null,
    !busy[0] && !error[0] && data
      ? h(
          "div",
          { className: "wbi-tablewrap" },
          h(
            "table",
            { className: "wbi-table" },
            h(
              "thead",
              null,
              h(
                "tr",
                null,
                cols.map(function (c) {
                  return h("th", { key: c.name, scope: "col" }, (c.label && (c.label[lang] || c.label.zh)) || c.name);
                }),
              ),
            ),
            h(
              "tbody",
              null,
              data.rows.map(function (row, i) {
                return h(
                  "tr",
                  { key: row.id || i },
                  cols.map(function (c) {
                    var v = row[c.name];
                    return h(
                      "td",
                      { key: c.name },
                      v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v),
                    );
                  }),
                );
              }),
            ),
          ),
          !data.rows.length ? h("p", { className: "wbi-empty" }, tr(lang, "没有匹配的数据", "No matching data")) : null,
        )
      : null,
    data
      ? h(
          "div",
          { className: "wbi-pager" },
          h("span", null, data.total + tr(lang, " 行 · ", " rows · ") + data.page + " / " + data.pages),
          h(
            ui.Button,
            {
              disabled: busy[0] || data.page <= 1,
              onClick: function () {
                page[1](data.page - 1);
              },
            },
            tr(lang, "上一页", "Previous"),
          ),
          h(
            ui.Button,
            {
              disabled: busy[0] || data.page >= data.pages,
              onClick: function () {
                page[1](data.page + 1);
              },
            },
            tr(lang, "下一页", "Next"),
          ),
        )
      : null,
  );
}
module.exports = { DataView: DataView };
