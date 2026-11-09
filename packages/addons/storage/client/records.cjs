var React = require("react"),
  ui = require("./ui.cjs"),
  Editor = require("./editor.cjs").Editor;
var h = ui.h,
  tr = ui.tr;
var Description = require("../../lib/description.cjs").Description;
function StorageCard(props) {
  var item = props.item, lang = props.lang, gallery = React.useState(false);
  var images = (item.imgList || []).filter(ui.safeImage), tags = item.tags || [];
  var shown = gallery[0] ? images : images.slice(0, 1);
  var meta = [item.brand && tr(lang, "品牌：", "Brand: ") + item.brand,
    item.unit && tr(lang, "单位：", "Unit: ") + item.unit].filter(Boolean);
  return h("article", { className: "wbi-card" },
    h("div", { className: "wbi-cardhead" }, h("h3", null, item.name),
      h("span", { className: "wbi-stock" }, item.stock == null || item.stock === "" ? "—" : item.stock,
        item.unit ? h("small", { className: "wbi-muted" }, " " + item.unit) : null)),
    tags.length ? h("div", { className: "wbi-tags" }, tags.map(function (t) {
      return h(ui.Button, { key: t.id, className: "wbi-btn wbi-chip", disabled: !props.caps,
        title: tr(lang, "按此标签筛选", "Filter by this tag"),
        onClick: function () { props.onTag(t); } }, t.name);
    })) : null,
    meta.length || item.createTime || item.updateTime ? h("div", { className: "wbi-metazone" },
      meta.length ? h("div", { className: "wbi-muted" }, meta.join(" · ")) : null,
      item.createTime || item.updateTime ? h("div", { className: "wbi-meta" },
        item.createTime ? h("span", null, tr(lang, "创建 ", "Created ") + props.date(item.createTime)) : null,
        item.updateTime ? h("span", null, tr(lang, "更新 ", "Updated ") + props.date(item.updateTime)) : null) : null) : null,
    h(Description, { text: item.remark, lang: lang }),
    images.length ? h("div", { className: "wbi-images" }, shown.map(function (url, i) {
      return h("button", { key: i, type: "button", className: "wbi-image",
        "aria-label": tr(lang, "预览图片 ", "Preview image ") + (i + 1),
        onClick: function () { props.onPreview({ url: url, name: item.name }); } },
        h("img", { src: url, alt: item.name + " " + (i + 1), loading: "lazy", referrerPolicy: "no-referrer" }));
    }), images.length > 1 ? h(ui.Button, { className: "wbi-btn wbi-btn-sm wbi-ghost wbi-more",
      "aria-expanded": gallery[0], "aria-label": tr(lang, "展开或收起物品图片", "Expand or collapse item images"),
      onClick: function () { gallery[1](!gallery[0]); }
    }, gallery[0] ? tr(lang, "收起", "Collapse") : "+" + (images.length - 1)) : null) : null,
    h("div", { className: "wbi-actions" },
      h(ui.Button, { className: "wbi-btn wbi-btn-sm wbi-ghost", disabled: props.busy,
        onClick: function () { props.onEdit(item); } }, tr(lang, "编辑", "Edit")),
      h(ui.Button, { className: "wbi-btn wbi-btn-sm wbi-ghost wbi-danger", disabled: props.busy,
        onClick: function () { props.onDelete(item); } }, tr(lang, "删除", "Delete"))));
}
function Records(props) {
  var api = props.api,
    lang = props.lang;
  var items = React.useState(null),
    error = React.useState(null),
    loading = React.useState(true),
    query = React.useState(""),
    text = React.useState(""),
    page = React.useState(1),
    size = React.useState(12),
    sort = React.useState("update_time"),
    order = React.useState("desc"),
    tick = React.useState(0),
    editing = React.useState(null),
    deleting = React.useState(null),
    preview = React.useState(null),
    busy = React.useState(false),
    caps = React.useState(false),
    ready = React.useState(false),
    confirmDelete = React.useState(true),
    tag = React.useState(null);
  React.useEffect(
    function () {
      var active = true;
      Promise.all([ui.call(api, "storage.configGet"), ui.call(api, "storage.capabilities")])
        .then(function (r) {
          if (!active) return;
          var v = r[0].values || {};
          size[1](v["list.pageSize"] || 12);
          sort[1](v["list.sortColumn"] || "update_time");
          order[1](v["list.sortOrder"] || "desc");
          confirmDelete[1](v["ui.confirmDelete"] !== false);
          caps[1](!!r[1].tags);
        })
        .catch(function (e) {
          if (active) error[1](e);
        })
        .finally(function () {
          if (active) ready[1](true);
        });
      return function () {
        active = false;
      };
    },
    [api],
  );
  React.useEffect(
    function () {
      var t = setTimeout(function () {
        text[1](query[0]);
        page[1](1);
      }, 250);
      return function () {
        clearTimeout(t);
      };
    },
    [query[0]],
  );
  React.useEffect(
    function () {
      if (!ready[0]) return;
      var active = true;
      loading[1](true);
      error[1](null);
      var args = { text: text[0], pageNumber: page[0], pageSize: size[0], sortColumn: sort[0], sortOrder: order[0] };
      if (tag[0]) args.tagIds = [tag[0].id];
      ui.call(api, "storage.list", args)
        .then(function (r) {
          if (!active) return;
          if (page[0] > Math.max(1, r.pages || 1)) {
            page[1](Math.max(1, r.pages || 1));
            return;
          }
          items[1](r);
        })
        .catch(function (e) {
          if (active) error[1](e);
        })
        .finally(function () {
          if (active) loading[1](false);
        });
      return function () {
        active = false;
      };
    },
    [api, ready[0], text[0], page[0], size[0], sort[0], order[0], tick[0], tag[0]],
  );
  function refresh() {
    tick[1](function (n) {
      return n + 1;
    });
  }
  function remove(item) {
    busy[1](true);
    ui.call(api, "storage.delete", { id: item.id })
      .then(function () {
        deleting[1](null);
        refresh();
      })
      .catch(error[1])
      .finally(function () {
        busy[1](false);
      });
  }
  function date(v) {
    return v ? String(v).replace("T", " ").slice(0, 19) : "—";
  }
  var data = items[0],
    pages = Math.max(1, (data && data.pages) || 1);
  return h(
    "div",
    { className: "wbi-root" },
    h(
      "div",
      { className: "wbi-row" },
      h("h2", null, tr(lang, "储物", "Storage")),
      h("span", { className: "wbi-muted" }, tr(lang, "记录物品、库存与存放备注", "Track items, stock and notes")),
      h("span", { className: "wbi-grow" }),
      h(
        ui.Button,
        {
          className: "wbi-btn wbi-primary",
          onClick: function () {
            editing[1]({});
          },
        },
        tr(lang, "新增物品", "New item"),
      ),
    ),
    h(
      "div",
      { className: "wbi-toolbar" },
      h("input", {
        type: "search",
        value: query[0],
        placeholder: tr(lang, "搜索名称、品牌或备注", "Search name, brand or notes"),
        "aria-label": tr(lang, "搜索物品", "Search inventory"),
        onChange: function (e) {
          query[1](e.target.value);
        },
      }),
      h(
        "select",
        {
          "aria-label": tr(lang, "排序字段", "Sort field"),
          value: sort[0],
          onChange: function (e) {
            sort[1](e.target.value);
            page[1](1);
          },
        },
        [
          ["update_time", "最近更新", "Updated"],
          ["create_time", "创建时间", "Created"],
          ["name", "名称", "Name"],
          ["brand", "品牌", "Brand"],
          ["stock", "库存文本", "Stock text"],
        ].map(function (o) {
          return h("option", { key: o[0], value: o[0] }, tr(lang, o[1], o[2]));
        }),
      ),
      h(
        ui.Button,
        {
          onClick: function () {
            order[1](order[0] === "desc" ? "asc" : "desc");
            page[1](1);
          },
        },
        order[0] === "desc" ? tr(lang, "降序 ↓", "Descending ↓") : tr(lang, "升序 ↑", "Ascending ↑"),
      ),
      h(ui.Button, { onClick: refresh, disabled: loading[0] }, tr(lang, "刷新", "Refresh")),
    ),
    tag[0]
      ? h(
          "div",
          { className: "wbi-row" },
          h("span", { className: "wbi-chip" }, tag[0].name),
          h(
            ui.Button,
            {
              onClick: function () {
                tag[1](null);
                page[1](1);
              },
            },
            tr(lang, "清除标签筛选", "Clear tag filter"),
          ),
        )
      : null,
    h(ui.ErrorBox, { error: error[0] }),
    loading[0] ? h("p", { role: "status", className: "wbi-muted" }, tr(lang, "读取中…", "Loading…")) : null,
    !loading[0] && !error[0] && data && !data.records.length
      ? h(
          "div",
          { className: "wbi-empty" },
          text[0] || tag[0]
            ? tr(lang, "没有匹配的物品，试试其他搜索条件", "No matching items. Try another filter.")
            : tr(lang, "还没有物品，点击“新增物品”开始记录", "No items yet. Add your first item."),
        )
      : null,
    h(
      "div",
      { className: "wbi-grid", "aria-busy": loading[0] },
      !loading[0] && !error[0] && data
        ? data.records.map(function (item) {
            return h(StorageCard, {
              key: item.id, item: item, lang: lang, caps: caps[0], busy: busy[0], date: date,
              onTag: function (t) { tag[1](t); page[1](1); },
              onPreview: preview[1], onEdit: editing[1],
              onDelete: function (v) { if (confirmDelete[0]) deleting[1](v); else remove(v); }
            });
          })
        : null,
    ),
    data
      ? h(
          "div",
          { className: "wbi-pager" },
          h(
            "span",
            { className: "wbi-muted" },
            data.total + tr(lang, " 条物品 · ", " items · ") + page[0] + " / " + pages,
          ),
          h(
            ui.Button,
            {
              disabled: page[0] <= 1 || loading[0],
              onClick: function () {
                page[1](page[0] - 1);
              },
            },
            tr(lang, "上一页", "Previous"),
          ),
          h(
            ui.Button,
            {
              disabled: page[0] >= pages || loading[0],
              onClick: function () {
                page[1](page[0] + 1);
              },
            },
            tr(lang, "下一页", "Next"),
          ),
          h(
            "select",
            {
              "aria-label": tr(lang, "每页条数", "Page size"),
              value: size[0],
              onChange: function (e) {
                size[1](Number(e.target.value));
                page[1](1);
              },
            },
            Array.from(new Set([4, 12, 24, 50, size[0]]))
              .sort(function (a, b) {
                return a - b;
              })
              .map(function (n) {
                return h("option", { key: n, value: n }, n + tr(lang, " / 页", " / page"));
              }),
          ),
        )
      : null,
    editing[0]
      ? h(Editor, {
          api: api,
          lang: lang,
          item: editing[0],
          tagsEnabled: caps[0],
          onClose: function () {
            editing[1](null);
          },
          onSaved: function () {
            editing[1](null);
            refresh();
          },
        })
      : null,
    deleting[0]
      ? h(
          ui.Modal,
          {
            title: tr(lang, "删除物品", "Delete item"),
            onClose: busy[0]
              ? null
              : function () {
                  deleting[1](null);
                },
          },
          h(ui.ErrorBox, { error: error[0] }),
          h(
            "p",
            null,
            tr(lang, "确认删除「", "Delete “") +
              deleting[0].name +
              tr(lang, "」？将软删除记录并移除标签关联。", "”? This soft-deletes the record and removes tag links."),
          ),
          h(
            "div",
            { className: "wbi-formfoot" },
            h(
              ui.Button,
              {
                disabled: busy[0],
                onClick: function () {
                  deleting[1](null);
                },
              },
              tr(lang, "取消", "Cancel"),
            ),
            h(
              ui.Button,
              {
                disabled: busy[0],
                className: "wbi-btn wbi-danger",
                onClick: function () {
                  remove(deleting[0]);
                },
              },
              busy[0] ? tr(lang, "删除中…", "Deleting…") : tr(lang, "确认删除", "Confirm delete"),
            ),
          ),
        )
      : null,
    preview[0]
      ? h(
          ui.Modal,
          {
            title: preview[0].name,
            onClose: function () {
              preview[1](null);
            },
          },
          h("img", {
            className: "wbi-preview",
            src: preview[0].url,
            alt: preview[0].name,
            referrerPolicy: "no-referrer",
          }),
          h(
            "a",
            { href: preview[0].url, target: "_blank", rel: "noopener noreferrer" },
            tr(lang, "打开原图", "Open original"),
          ),
        )
      : null,
  );
}
module.exports = { Records: Records, StorageCard: StorageCard };
