// 由 scripts/build-addon-clients.mjs 生成；请修改 client/client.src.cjs 后重新构建。
window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
window.__ModuleLoader__.load({
  id: "dsh-workbench-storage",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// packages/addons/storage/client/styles.cjs
var require_styles = __commonJS({
  "packages/addons/storage/client/styles.cjs"(exports2, module2) {
    module2.exports = `
.wbi-root{--line:var(--wb-line,var(--dsw-alias-border-l2,#d9dfe6));--surface:var(--wb-surface,var(--dsw-alias-bg-layer-1,#fff));--muted:var(--dsw-alias-label-secondary,#64748b);--accent:var(--dsw-alias-brand-primary,#2563eb);font-size:13px;color:inherit;min-width:0}
.wbi-root *{box-sizing:border-box}.wbi-root h2{font-size:18px;margin:0}.wbi-root h3{font-size:15px;margin:0}.wbi-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.wbi-grow{flex:1}.wbi-muted{color:var(--muted);font-size:12px}.wbi-root input,.wbi-root textarea,.wbi-root select{background:var(--surface);color:inherit;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font:inherit;max-width:100%}.wbi-root textarea{resize:vertical;min-height:80px}.wbi-root :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wbi-btn{border:1px solid var(--line);background:var(--surface);color:inherit;border-radius:8px;padding:7px 12px;cursor:pointer;font:inherit}.wbi-btn:hover{border-color:var(--accent)}.wbi-btn:disabled{opacity:.45;cursor:default}.wbi-primary{background:var(--accent);color:#fff;border-color:var(--accent)}.wbi-danger{color:var(--dsw-alias-state-error-primary,#b91c1c)}.wbi-toolbar{margin:18px 0;display:flex;gap:10px;align-items:center;flex-wrap:wrap}.wbi-toolbar input[type=search]{min-width:220px;flex:1}.wbi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}.wbi-card{padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--surface);min-width:0;display:flex;flex-direction:column;gap:12px}.wbi-card h3{overflow-wrap:anywhere}.wbi-stock{font-size:20px;font-weight:650}.wbi-card p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.wbi-tags{display:flex;gap:6px;flex-wrap:wrap}.wbi-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 8px;border-radius:20px;background:color-mix(in srgb,var(--accent) 9%,transparent);font-size:12px}.wbi-images{display:flex;gap:8px;overflow:auto}.wbi-image{border:1px solid var(--line);border-radius:8px;overflow:hidden;padding:0;background:transparent;flex-shrink:0;cursor:pointer}.wbi-image img{display:block;width:76px;height:68px;object-fit:cover}.wbi-empty{padding:50px 20px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:12px}.wbi-error{padding:12px;margin:10px 0;border:1px solid #ef4444;border-radius:8px;color:var(--dsw-alias-state-error-primary,#b91c1c)}.wbi-pager{margin:20px 0;display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap}
.wbi-mask{position:fixed;inset:0;background:#0007;z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px}.wbi-modal{background:var(--surface);color:inherit;border-radius:14px;padding:22px;width:640px;max-width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 70px #0004}.wbi-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px}.wbi-field{display:flex;flex-direction:column;gap:6px;min-width:0}.wbi-wide{grid-column:1/-1}.wbi-formfoot{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}.wbi-tagoptions{display:flex;gap:8px;flex-wrap:wrap;max-height:160px;overflow:auto;margin-top:8px}.wbi-tagoptions label{display:flex;gap:5px;align-items:center}.wbi-preview{display:block;max-width:100%;max-height:65vh;margin:16px auto;object-fit:contain}.wbi-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin:18px 0}.wbi-kpis strong{display:block;font-size:28px;margin-top:8px}.wbi-tablewrap{overflow:auto;margin-top:16px}.wbi-table{width:100%;border-collapse:collapse}.wbi-table td,.wbi-table th{padding:10px;border-bottom:1px solid var(--line);text-align:left;max-width:300px;overflow-wrap:anywhere}.wbi-table th{white-space:nowrap}.wbi-table td{white-space:pre-wrap}.wbi-bar{height:7px;border-radius:4px;background:var(--accent);margin:8px 0 12px}.wbi-notice{padding:10px 0;color:var(--muted)}
@media(max-width:600px){.wbi-grid,.wbi-form{grid-template-columns:1fr}.wbi-wide{grid-column:auto}.wbi-mask{padding:8px}.wbi-modal{padding:16px}.wbi-toolbar input[type=search]{min-width:0;width:100%}}
`;
  }
});

// packages/addons/storage/client/ui.cjs
var require_ui = __commonJS({
  "packages/addons/storage/client/ui.cjs"(exports2, module2) {
    var React = require("react");
    var h = React.createElement;
    function call(api, name, args) {
      return api.call(name, args || {}).then(function(r) {
        if (!r || r.ok !== true) throw new Error(r && r.error || "\u8BF7\u6C42\u5931\u8D25");
        return r.result;
      });
    }
    function tr(lang, zh, en) {
      return lang === "en" ? en : zh;
    }
    function Button(props) {
      return h("button", Object.assign({ type: "button", className: "wbi-btn" }, props), props.children);
    }
    function ErrorBox(props) {
      return props.error ? h("div", { className: "wbi-error", role: "alert" }, String(props.error.message || props.error)) : null;
    }
    function safeImage(url) {
      try {
        var u = new URL(url);
        return /^(https?:)$/.test(u.protocol) && !u.username && !u.password ? u.href : "";
      } catch (_) {
        return "";
      }
    }
    function Modal(props) {
      var ref = React.useRef(null);
      React.useEffect(function() {
        var previous = document.activeElement;
        if (ref.current) ref.current.focus();
        return function() {
          if (previous && previous.isConnected) previous.focus();
        };
      }, []);
      function key(e) {
        if (e.key === "Escape" && props.onClose) props.onClose();
        if (e.key !== "Tab") return;
        var els = ref.current.querySelectorAll(
          "button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]"
        );
        if (!els.length) {
          e.preventDefault();
          return;
        }
        var first = els[0], last = els[els.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
          e.preventDefault();
          last.focus();
        }
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return h(
        "div",
        {
          className: "wbi-mask",
          onMouseDown: function(e) {
            if (e.target === e.currentTarget && props.onClose) props.onClose();
          }
        },
        h(
          "section",
          {
            className: "wbi-modal",
            role: "dialog",
            "aria-modal": true,
            "aria-label": props.title,
            ref,
            tabIndex: -1,
            onKeyDown: key
          },
          h(
            "header",
            { className: "wbi-row" },
            h("h2", null, props.title),
            h("span", { className: "wbi-grow" }),
            h(Button, { onClick: props.onClose, disabled: !props.onClose, "aria-label": "\u5173\u95ED / Close" }, "\xD7")
          ),
          props.children
        )
      );
    }
    module2.exports = { h, call, tr, Button, ErrorBox, Modal, safeImage };
  }
});

// packages/addons/storage/client/stats.cjs
var require_stats = __commonJS({
  "packages/addons/storage/client/stats.cjs"(exports2, module2) {
    var React = require("react");
    var ui = require_ui();
    var h = ui.h;
    var tr = ui.tr;
    function Stats(props) {
      var data = React.useState(null), error = React.useState(null), tick = React.useState(0), busy = React.useState(false), lang = props.lang;
      React.useEffect(
        function() {
          var active = true;
          busy[1](true);
          error[1](null);
          ui.call(props.api, "storage.stats").then(function(r) {
            if (active) data[1](r);
          }).catch(function(e) {
            if (active) error[1](e);
          }).finally(function() {
            if (active) busy[1](false);
          });
          return function() {
            active = false;
          };
        },
        [props.api, tick[0]]
      );
      var s = data[0];
      return h(
        "div",
        { className: "wbi-root" },
        h(
          "div",
          { className: "wbi-row" },
          h("h2", null, tr(lang, "\u7269\u54C1\u6982\u89C8", "Inventory overview")),
          h("span", { className: "wbi-grow" }),
          h(
            ui.Button,
            {
              disabled: busy[0],
              onClick: function() {
                tick[1](tick[0] + 1);
              }
            },
            tr(lang, "\u5237\u65B0", "Refresh")
          )
        ),
        h(ui.ErrorBox, { error: error[0] }),
        busy[0] ? h("p", { role: "status" }, tr(lang, "\u8BFB\u53D6\u4E2D\u2026", "Loading\u2026")) : null,
        s ? h(
          React.Fragment,
          null,
          h(
            "div",
            { className: "wbi-kpis" },
            [
              ["total", "\u7269\u54C1\u8BB0\u5F55", "Items"],
              ["tagged", "\u5DF2\u5173\u8054\u6807\u7B7E", "Tagged"],
              ["withImages", "\u9644\u6709\u56FE\u7247", "With images"]
            ].map(function(k) {
              return h(
                "div",
                { className: "wbi-card", key: k[0] },
                h("span", { className: "wbi-muted" }, tr(lang, k[1], k[2])),
                h("strong", null, s[k[0]] === null ? "\u2014" : s[k[0]])
              );
            })
          ),
          h(
            "p",
            { className: "wbi-notice" },
            tr(
              lang,
              "\u5E93\u5B58\u4EE5\u6587\u5B57\u8BB0\u5F55\uFF0C\u4E0D\u5BF9\u4E0D\u540C\u5355\u4F4D\u6216\u8303\u56F4\u6570\u91CF\u8FDB\u884C\u6C42\u548C\u3002",
              "Stock is stored as text; mixed units and ranges are not summed."
            )
          ),
          h(
            "div",
            { className: "wbi-card" },
            h("h3", null, tr(lang, "\u6700\u8FD1\u66F4\u65B0", "Recently updated")),
            (s.recent || []).map(function(item) {
              return h(
                "div",
                { key: item.id, className: "wbi-row" },
                h("span", null, item.name),
                h("span", { className: "wbi-grow" }),
                h("span", { className: "wbi-muted" }, (item.stock || "\u2014") + " " + (item.unit || ""))
              );
            }),
            !s.total ? h(
              "span",
              { className: "wbi-muted" },
              tr(lang, "\u8FD8\u6CA1\u6709\u7269\u54C1\uFF0C\u524D\u5F80\u8BB0\u5F55\u9875\u6DFB\u52A0", "No items yet. Add one in Records.")
            ) : null
          )
        ) : null
      );
    }
    module2.exports = { Stats };
  }
});

// packages/addons/storage/client/editor.cjs
var require_editor = __commonJS({
  "packages/addons/storage/client/editor.cjs"(exports2, module2) {
    var React = require("react");
    var ui = require_ui();
    var h = ui.h;
    var tr = ui.tr;
    function Editor(props) {
      var item = props.item || {}, lang = props.lang;
      var state = React.useState(function() {
        return {
          name: item.name || "",
          brand: item.brand || "",
          unit: item.unit || "",
          stock: item.stock || "",
          remark: item.remark || "",
          images: (item.imgList || []).join("\n"),
          tagIds: (item.tagIds || (item.tags || []).map(function(t) {
            return t.id;
          })).slice()
        };
      });
      var form = state[0], setForm = state[1];
      var err = React.useState(null), busy = React.useState(false), query = React.useState(""), options = React.useState(item.tags || []);
      var selected = React.useState(item.tags || []);
      React.useEffect(
        function() {
          if (!props.tagsEnabled) return;
          var active = true;
          var timer = setTimeout(function() {
            ui.call(props.api, "storageTags.search", { text: query[0], pageSize: 50 }).then(function(r) {
              if (active) options[1](r.records || []);
            }).catch(function(e) {
              if (active) err[1](e);
            });
          }, 200);
          return function() {
            active = false;
            clearTimeout(timer);
          };
        },
        [query[0], props.tagsEnabled, props.api]
      );
      function update(k, v) {
        setForm(function(f) {
          return Object.assign({}, f, { [k]: v });
        });
      }
      function field(k, zh, en, wide, textarea) {
        return h(
          "label",
          { className: "wbi-field" + (wide ? " wbi-wide" : "") },
          h("span", null, tr(lang, zh, en)),
          h(textarea ? "textarea" : "input", {
            name: k,
            value: form[k],
            required: k === "name",
            disabled: busy[0],
            onChange: function(e) {
              update(k, e.target.value);
            }
          })
        );
      }
      function save(e) {
        e.preventDefault();
        if (busy[0]) return;
        var images = form.images.split(/\r?\n/).map(function(s) {
          return s.trim();
        }).filter(Boolean);
        if (images.some(function(s) {
          return !ui.safeImage(s);
        })) {
          err[1](tr(lang, "\u56FE\u7247\u5730\u5740\u5FC5\u987B\u662F\u5B8C\u6574\u7684 HTTP(S) URL", "Images must use full HTTP(S) URLs"));
          return;
        }
        if (!form.name.trim()) {
          err[1](tr(lang, "\u8BF7\u586B\u5199\u7269\u54C1\u540D\u79F0", "Enter an item name"));
          return;
        }
        var args = {
          name: form.name.trim(),
          brand: form.brand,
          unit: form.unit,
          stock: form.stock,
          remark: form.remark,
          imgList: images
        };
        if (item.id) args.id = item.id;
        if (props.tagsEnabled) args.tagIds = form.tagIds;
        busy[1](true);
        err[1](null);
        ui.call(props.api, item.id ? "storage.update" : "storage.create", args).then(function() {
          props.onSaved();
        }).catch(err[1]).finally(function() {
          busy[1](false);
        });
      }
      var candidates = /* @__PURE__ */ new Map();
      selected[0].concat(options[0]).forEach(function(t) {
        candidates.set(t.id, t);
      });
      return h(
        ui.Modal,
        {
          title: item.id ? tr(lang, "\u7F16\u8F91\u7269\u54C1", "Edit item") : tr(lang, "\u65B0\u589E\u7269\u54C1", "New item"),
          onClose: busy[0] ? null : props.onClose
        },
        h(ui.ErrorBox, { error: err[0] }),
        h(
          "form",
          { onSubmit: save },
          h(
            "div",
            { className: "wbi-form" },
            field("name", "\u540D\u79F0 *", "Name *", true),
            field("brand", "\u54C1\u724C", "Brand"),
            field("unit", "\u5355\u4F4D", "Unit"),
            field("stock", "\u5E93\u5B58\uFF08\u53EF\u586B\u5199 1~2 \u7B49\u6587\u5B57\uFF09", "Stock (text such as 1\u20132)", true),
            field("remark", "\u5907\u6CE8", "Notes", true, true),
            field("images", "\u56FE\u7247 URL\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09", "Image URLs (one per line)", true, true),
            h(
              "div",
              { className: "wbi-field wbi-wide" },
              h("span", null, tr(lang, "\u6807\u7B7E", "Tags")),
              props.tagsEnabled ? h(
                React.Fragment,
                null,
                h("input", {
                  type: "search",
                  placeholder: tr(lang, "\u641C\u7D22\u5DF2\u6709\u6807\u7B7E", "Search existing tags"),
                  "aria-label": tr(lang, "\u641C\u7D22\u5DF2\u6709\u6807\u7B7E", "Search existing tags"),
                  value: query[0],
                  disabled: busy[0],
                  onChange: function(e) {
                    query[1](e.target.value);
                  }
                }),
                h(
                  "div",
                  { className: "wbi-tagoptions" },
                  Array.from(candidates.values()).map(function(t) {
                    return h(
                      "label",
                      { key: t.id },
                      h("input", {
                        type: "checkbox",
                        checked: form.tagIds.includes(t.id),
                        disabled: busy[0],
                        onChange: function(e) {
                          var checked = e.target.checked;
                          update(
                            "tagIds",
                            checked ? form.tagIds.concat(t.id) : form.tagIds.filter(function(id) {
                              return id !== t.id;
                            })
                          );
                          selected[1](function(tags) {
                            return checked ? tags.filter(function(x) {
                              return x.id !== t.id;
                            }).concat(t) : tags.filter(function(x) {
                              return x.id !== t.id;
                            });
                          });
                        }
                      }),
                      t.name
                    );
                  })
                ),
                !candidates.size ? h(
                  "span",
                  { className: "wbi-muted" },
                  tr(lang, "\u6682\u65E0\u6807\u7B7E\uFF0C\u53EF\u5728\u6807\u7B7E\u63D2\u4EF6\u4E2D\u521B\u5EFA", "No tags. Create them in the Tags plugin.")
                ) : null
              ) : h(
                "span",
                { className: "wbi-muted" },
                tr(lang, "\u6807\u7B7E\u63D2\u4EF6\u4E0D\u53EF\u7528\uFF0C\u4FDD\u5B58\u65F6\u4FDD\u7559\u539F\u6709\u5173\u8054", "Tags unavailable; existing links are preserved.")
              )
            )
          ),
          h(
            "div",
            { className: "wbi-formfoot" },
            h(ui.Button, { onClick: props.onClose, disabled: busy[0] }, tr(lang, "\u53D6\u6D88", "Cancel")),
            h(
              ui.Button,
              { type: "submit", disabled: busy[0], className: "wbi-btn wbi-primary" },
              busy[0] ? tr(lang, "\u4FDD\u5B58\u4E2D\u2026", "Saving\u2026") : tr(lang, "\u4FDD\u5B58", "Save")
            )
          )
        )
      );
    }
    module2.exports = { Editor };
  }
});

// packages/addons/storage/client/records.cjs
var require_records = __commonJS({
  "packages/addons/storage/client/records.cjs"(exports2, module2) {
    var React = require("react");
    var ui = require_ui();
    var Editor = require_editor().Editor;
    var h = ui.h;
    var tr = ui.tr;
    function Records(props) {
      var api = props.api, lang = props.lang;
      var items = React.useState(null), error = React.useState(null), loading = React.useState(true), query = React.useState(""), text = React.useState(""), page = React.useState(1), size = React.useState(12), sort = React.useState("update_time"), order = React.useState("desc"), tick = React.useState(0), editing = React.useState(null), deleting = React.useState(null), preview = React.useState(null), busy = React.useState(false), caps = React.useState(false), ready = React.useState(false), confirmDelete = React.useState(true), tag = React.useState(null);
      React.useEffect(
        function() {
          var active = true;
          Promise.all([ui.call(api, "storage.configGet"), ui.call(api, "storage.capabilities")]).then(function(r) {
            if (!active) return;
            var v = r[0].values || {};
            size[1](v["list.pageSize"] || 12);
            sort[1](v["list.sortColumn"] || "update_time");
            order[1](v["list.sortOrder"] || "desc");
            confirmDelete[1](v["ui.confirmDelete"] !== false);
            caps[1](!!r[1].tags);
          }).catch(function(e) {
            if (active) error[1](e);
          }).finally(function() {
            if (active) ready[1](true);
          });
          return function() {
            active = false;
          };
        },
        [api]
      );
      React.useEffect(
        function() {
          var t = setTimeout(function() {
            text[1](query[0]);
            page[1](1);
          }, 250);
          return function() {
            clearTimeout(t);
          };
        },
        [query[0]]
      );
      React.useEffect(
        function() {
          if (!ready[0]) return;
          var active = true;
          loading[1](true);
          error[1](null);
          var args = { text: text[0], pageNumber: page[0], pageSize: size[0], sortColumn: sort[0], sortOrder: order[0] };
          if (tag[0]) args.tagIds = [tag[0].id];
          ui.call(api, "storage.list", args).then(function(r) {
            if (!active) return;
            if (page[0] > Math.max(1, r.pages || 1)) {
              page[1](Math.max(1, r.pages || 1));
              return;
            }
            items[1](r);
          }).catch(function(e) {
            if (active) error[1](e);
          }).finally(function() {
            if (active) loading[1](false);
          });
          return function() {
            active = false;
          };
        },
        [api, ready[0], text[0], page[0], size[0], sort[0], order[0], tick[0], tag[0]]
      );
      function refresh() {
        tick[1](function(n) {
          return n + 1;
        });
      }
      function remove(item) {
        busy[1](true);
        ui.call(api, "storage.delete", { id: item.id }).then(function() {
          deleting[1](null);
          refresh();
        }).catch(error[1]).finally(function() {
          busy[1](false);
        });
      }
      function date(v) {
        return v ? String(v).replace("T", " ").slice(0, 19) : "\u2014";
      }
      var data = items[0], pages = Math.max(1, data && data.pages || 1);
      return h(
        "div",
        { className: "wbi-root" },
        h(
          "div",
          { className: "wbi-row" },
          h("h2", null, tr(lang, "\u7269\u54C1\u7BA1\u7406", "Inventory")),
          h("span", { className: "wbi-muted" }, tr(lang, "\u8BB0\u5F55\u7269\u54C1\u3001\u5E93\u5B58\u4E0E\u5B58\u653E\u5907\u6CE8", "Track items, stock and notes")),
          h("span", { className: "wbi-grow" }),
          h(
            ui.Button,
            {
              className: "wbi-btn wbi-primary",
              onClick: function() {
                editing[1]({});
              }
            },
            tr(lang, "\u65B0\u589E\u7269\u54C1", "New item")
          )
        ),
        h(
          "div",
          { className: "wbi-toolbar" },
          h("input", {
            type: "search",
            value: query[0],
            placeholder: tr(lang, "\u641C\u7D22\u540D\u79F0\u3001\u54C1\u724C\u6216\u5907\u6CE8", "Search name, brand or notes"),
            "aria-label": tr(lang, "\u641C\u7D22\u7269\u54C1", "Search inventory"),
            onChange: function(e) {
              query[1](e.target.value);
            }
          }),
          h(
            "select",
            {
              "aria-label": tr(lang, "\u6392\u5E8F\u5B57\u6BB5", "Sort field"),
              value: sort[0],
              onChange: function(e) {
                sort[1](e.target.value);
                page[1](1);
              }
            },
            [
              ["update_time", "\u6700\u8FD1\u66F4\u65B0", "Updated"],
              ["create_time", "\u521B\u5EFA\u65F6\u95F4", "Created"],
              ["name", "\u540D\u79F0", "Name"],
              ["brand", "\u54C1\u724C", "Brand"],
              ["stock", "\u5E93\u5B58\u6587\u672C", "Stock text"]
            ].map(function(o) {
              return h("option", { key: o[0], value: o[0] }, tr(lang, o[1], o[2]));
            })
          ),
          h(
            ui.Button,
            {
              onClick: function() {
                order[1](order[0] === "desc" ? "asc" : "desc");
                page[1](1);
              }
            },
            order[0] === "desc" ? tr(lang, "\u964D\u5E8F \u2193", "Descending \u2193") : tr(lang, "\u5347\u5E8F \u2191", "Ascending \u2191")
          ),
          h(ui.Button, { onClick: refresh, disabled: loading[0] }, tr(lang, "\u5237\u65B0", "Refresh"))
        ),
        tag[0] ? h(
          "div",
          { className: "wbi-row" },
          h("span", { className: "wbi-chip" }, tag[0].name),
          h(
            ui.Button,
            {
              onClick: function() {
                tag[1](null);
                page[1](1);
              }
            },
            tr(lang, "\u6E05\u9664\u6807\u7B7E\u7B5B\u9009", "Clear tag filter")
          )
        ) : null,
        h(ui.ErrorBox, { error: error[0] }),
        loading[0] ? h("p", { role: "status", className: "wbi-muted" }, tr(lang, "\u8BFB\u53D6\u4E2D\u2026", "Loading\u2026")) : null,
        !loading[0] && !error[0] && data && !data.records.length ? h(
          "div",
          { className: "wbi-empty" },
          text[0] || tag[0] ? tr(lang, "\u6CA1\u6709\u5339\u914D\u7684\u7269\u54C1\uFF0C\u8BD5\u8BD5\u5176\u4ED6\u641C\u7D22\u6761\u4EF6", "No matching items. Try another filter.") : tr(lang, "\u8FD8\u6CA1\u6709\u7269\u54C1\uFF0C\u70B9\u51FB\u201C\u65B0\u589E\u7269\u54C1\u201D\u5F00\u59CB\u8BB0\u5F55", "No items yet. Add your first item.")
        ) : null,
        h(
          "div",
          { className: "wbi-grid", "aria-busy": loading[0] },
          !loading[0] && !error[0] && data ? data.records.map(function(item) {
            return h(
              "article",
              { key: item.id, className: "wbi-card" },
              h(
                "div",
                { className: "wbi-row" },
                h("h3", null, item.name),
                h("span", { className: "wbi-grow" }),
                h(
                  "span",
                  { className: "wbi-stock" },
                  item.stock || "\u2014",
                  item.unit ? h("small", { className: "wbi-muted" }, " " + item.unit) : null
                )
              ),
              h("div", { className: "wbi-muted" }, tr(lang, "\u54C1\u724C\uFF1A", "Brand: ") + (item.brand || "\u2014")),
              item.remark ? h("p", null, item.remark) : null,
              h(
                "div",
                { className: "wbi-tags" },
                (item.tags || []).map(function(t) {
                  return h(
                    ui.Button,
                    {
                      key: t.id,
                      className: "wbi-btn wbi-chip",
                      disabled: !caps[0],
                      title: tr(lang, "\u6309\u6B64\u6807\u7B7E\u7B5B\u9009", "Filter by this tag"),
                      onClick: function() {
                        tag[1](t);
                        page[1](1);
                      }
                    },
                    t.name
                  );
                })
              ),
              h(
                "div",
                { className: "wbi-images" },
                (item.imgList || []).filter(ui.safeImage).map(function(url, i) {
                  return h(
                    "button",
                    {
                      key: i,
                      type: "button",
                      className: "wbi-image",
                      "aria-label": tr(lang, "\u9884\u89C8\u56FE\u7247 ", "Preview image ") + (i + 1),
                      onClick: function() {
                        preview[1]({ url, name: item.name });
                      }
                    },
                    h("img", {
                      src: url,
                      alt: item.name + " " + (i + 1),
                      loading: "lazy",
                      referrerPolicy: "no-referrer"
                    })
                  );
                })
              ),
              h(
                "div",
                { className: "wbi-muted" },
                tr(lang, "\u521B\u5EFA ", "Created ") + date(item.createTime),
                h("br"),
                tr(lang, "\u66F4\u65B0 ", "Updated ") + date(item.updateTime)
              ),
              h(
                "div",
                { className: "wbi-row" },
                h("span", { className: "wbi-grow" }),
                h(
                  ui.Button,
                  {
                    disabled: busy[0],
                    onClick: function() {
                      editing[1](item);
                    }
                  },
                  tr(lang, "\u7F16\u8F91", "Edit")
                ),
                h(
                  ui.Button,
                  {
                    className: "wbi-btn wbi-danger",
                    disabled: busy[0],
                    onClick: function() {
                      if (confirmDelete[0]) deleting[1](item);
                      else remove(item);
                    }
                  },
                  tr(lang, "\u5220\u9664", "Delete")
                )
              )
            );
          }) : null
        ),
        data ? h(
          "div",
          { className: "wbi-pager" },
          h(
            "span",
            { className: "wbi-muted" },
            data.total + tr(lang, " \u6761\u7269\u54C1 \xB7 ", " items \xB7 ") + page[0] + " / " + pages
          ),
          h(
            ui.Button,
            {
              disabled: page[0] <= 1 || loading[0],
              onClick: function() {
                page[1](page[0] - 1);
              }
            },
            tr(lang, "\u4E0A\u4E00\u9875", "Previous")
          ),
          h(
            ui.Button,
            {
              disabled: page[0] >= pages || loading[0],
              onClick: function() {
                page[1](page[0] + 1);
              }
            },
            tr(lang, "\u4E0B\u4E00\u9875", "Next")
          ),
          h(
            "select",
            {
              "aria-label": tr(lang, "\u6BCF\u9875\u6761\u6570", "Page size"),
              value: size[0],
              onChange: function(e) {
                size[1](Number(e.target.value));
                page[1](1);
              }
            },
            Array.from(/* @__PURE__ */ new Set([4, 12, 24, 50, size[0]])).sort(function(a, b) {
              return a - b;
            }).map(function(n) {
              return h("option", { key: n, value: n }, n + tr(lang, " / \u9875", " / page"));
            })
          )
        ) : null,
        editing[0] ? h(Editor, {
          api,
          lang,
          item: editing[0],
          tagsEnabled: caps[0],
          onClose: function() {
            editing[1](null);
          },
          onSaved: function() {
            editing[1](null);
            refresh();
          }
        }) : null,
        deleting[0] ? h(
          ui.Modal,
          {
            title: tr(lang, "\u5220\u9664\u7269\u54C1", "Delete item"),
            onClose: busy[0] ? null : function() {
              deleting[1](null);
            }
          },
          h(ui.ErrorBox, { error: error[0] }),
          h(
            "p",
            null,
            tr(lang, "\u786E\u8BA4\u5220\u9664\u300C", "Delete \u201C") + deleting[0].name + tr(lang, "\u300D\uFF1F\u5C06\u8F6F\u5220\u9664\u8BB0\u5F55\u5E76\u79FB\u9664\u6807\u7B7E\u5173\u8054\u3002", "\u201D? This soft-deletes the record and removes tag links.")
          ),
          h(
            "div",
            { className: "wbi-formfoot" },
            h(
              ui.Button,
              {
                disabled: busy[0],
                onClick: function() {
                  deleting[1](null);
                }
              },
              tr(lang, "\u53D6\u6D88", "Cancel")
            ),
            h(
              ui.Button,
              {
                disabled: busy[0],
                className: "wbi-btn wbi-danger",
                onClick: function() {
                  remove(deleting[0]);
                }
              },
              busy[0] ? tr(lang, "\u5220\u9664\u4E2D\u2026", "Deleting\u2026") : tr(lang, "\u786E\u8BA4\u5220\u9664", "Confirm delete")
            )
          )
        ) : null,
        preview[0] ? h(
          ui.Modal,
          {
            title: preview[0].name,
            onClose: function() {
              preview[1](null);
            }
          },
          h("img", {
            className: "wbi-preview",
            src: preview[0].url,
            alt: preview[0].name,
            referrerPolicy: "no-referrer"
          }),
          h(
            "a",
            { href: preview[0].url, target: "_blank", rel: "noopener noreferrer" },
            tr(lang, "\u6253\u5F00\u539F\u56FE", "Open original")
          )
        ) : null
      );
    }
    module2.exports = { Records };
  }
});

// packages/addons/storage/client/config-copy.cjs
var require_config_copy = __commonJS({
  "packages/addons/storage/client/config-copy.cjs"(exports2, module2) {
    var COPY = {
      zh: {
        title: "\u914D\u7F6E",
        note: "\u8FD9\u4E9B\u504F\u597D\u53EA\u4FDD\u5B58\u5728\u672C\u673A\uFF0C\u4E0D\u53C2\u4E0E\u4E91\u7AEF\u540C\u6B65",
        loading: "\u8BFB\u53D6\u914D\u7F6E\u4E2D\u2026",
        loadFail: "\u914D\u7F6E\u670D\u52A1\u672A\u5C31\u7EEA\uFF08\u63D2\u4EF6\u7248\u672C\u8FC7\u65E7\uFF1F\uFF09",
        retry: "\u91CD\u8BD5",
        saveFail: "\u4FDD\u5B58\u5931\u8D25\uFF1A",
        saved: "\u5DF2\u4FDD\u5B58",
        saving: "\u4FDD\u5B58\u4E2D\u2026",
        reset: "\u6062\u590D\u9ED8\u8BA4",
        resetAll: "\u5168\u90E8\u6062\u590D\u9ED8\u8BA4",
        resetting: "\u6062\u590D\u4E2D\u2026",
        modified: "\u5DF2\u4FEE\u6539",
        defaultValue: "\u9ED8\u8BA4",
        allDefault: "\u5168\u90E8\u4F7F\u7528\u9ED8\u8BA4\u503C",
        on: "\u5F00",
        off: "\u5173",
        empty: "\u6CA1\u6709\u53EF\u914D\u7F6E\u9879",
        confirmResetAll: "\u786E\u5B9A\u628A\u5168\u90E8\u914D\u7F6E\u6062\u590D\u9ED8\u8BA4\u503C\uFF1F",
        min: "\u6700\u5C0F",
        max: "\u6700\u5927"
      },
      en: {
        title: "Config",
        note: "Preferences stay on this machine; they are not synced to the cloud",
        loading: "Loading config\u2026",
        loadFail: "Config service not ready (plugin too old?)",
        retry: "Retry",
        saveFail: "Save failed: ",
        saved: "Saved",
        saving: "Saving\u2026",
        reset: "Reset",
        resetAll: "Reset all",
        resetting: "Resetting\u2026",
        modified: "Modified",
        defaultValue: "Default",
        allDefault: "All defaults",
        on: "On",
        off: "Off",
        empty: "Nothing to configure",
        confirmResetAll: "Reset every setting to its default?",
        min: "Min",
        max: "Max"
      }
    };
    module2.exports = COPY;
  }
});

// packages/addons/storage/client/config.cjs
var require_config = __commonJS({
  "packages/addons/storage/client/config.cjs"(exports2, module2) {
    var React = require("react");
    var h = React.createElement;
    var DOMAIN = "storage";
    var PREFIX = "wbi";
    var COPY = require_config_copy();
    var CSS = [
      ".__P__-cfg{--cfg-line:var(--wb-line,var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent)));--cfg-surface:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));--cfg-muted:var(--dsw-alias-label-secondary,color-mix(in oklab,currentColor 62%,transparent));--cfg-faint:var(--dsw-alias-label-tertiary,color-mix(in oklab,currentColor 42%,transparent));--cfg-hover:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent));display:flex;flex-direction:column;gap:16px;width:100%;min-width:0;padding-bottom:6px;color:inherit;font-size:13.5px}",
      ".__P__-cfg-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}",
      ".__P__-cfg-headmain{min-width:0}",
      ".__P__-cfg-head h2{margin:0;font-size:17px;font-weight:660;letter-spacing:.1px}",
      ".__P__-cfg-note{font-size:12px;color:var(--cfg-muted);margin-top:5px;line-height:1.6}",
      ".__P__-cfg-status{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border:1px solid var(--cfg-line);border-radius:999px;background:var(--cfg-surface);font-size:11.5px;color:var(--cfg-muted);max-width:100%;line-height:1.4}",
      ".__P__-cfg-status::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-success-primary,currentColor);flex:none}",
      ".__P__-cfg-status.err{color:var(--dsw-alias-state-error-primary,inherit);border-color:color-mix(in oklab,var(--dsw-alias-state-error-primary,currentColor) 35%,var(--cfg-line))}",
      ".__P__-cfg-status.err::before{background:var(--dsw-alias-state-error-primary,currentColor)}",
      ".__P__-cfg-group{border:1px solid var(--cfg-line);border-radius:14px;background:var(--cfg-surface);overflow:hidden;box-shadow:0 1px 2px color-mix(in oklab,currentColor 3%,transparent)}",
      ".__P__-cfg-gtitle{display:flex;align-items:center;gap:8px;padding:12px 18px;background:color-mix(in oklab,currentColor 3%,transparent);border-bottom:1px solid var(--cfg-line);font-size:12.5px;font-weight:660;letter-spacing:.1px}",
      ".__P__-cfg-gcount{margin-left:auto;font-size:11px;font-weight:500;color:var(--cfg-muted);font-variant-numeric:tabular-nums}",
      ".__P__-cfg-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(200px,300px);gap:28px;align-items:center;padding:15px 18px;border-top:1px solid color-mix(in oklab,currentColor 7%,transparent);transition:background .12s ease}",
      ".__P__-cfg-gtitle+.__P__-cfg-row{border-top:none}",
      ".__P__-cfg-row:hover{background:var(--cfg-hover)}",
      ".__P__-cfg-label{min-width:0}",
      ".__P__-cfg-name{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;line-height:1.4;flex-wrap:wrap}",
      ".__P__-cfg-hint{font-size:12px;color:var(--cfg-muted);line-height:1.55;margin-top:4px}",
      ".__P__-cfg-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--cfg-muted);margin-top:5px;letter-spacing:.2px;word-break:break-all}",
      ".__P__-cfg-control{display:flex;align-items:center;justify-content:flex-end;gap:8px;min-width:0;flex-wrap:wrap}",
      ".__P__-cfg-select,.__P__-cfg-input{border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:9px;padding:7px 11px;font:inherit;font-size:13px;line-height:1.4;outline:none;min-width:132px;max-width:100%;transition:border-color .15s ease,box-shadow .15s ease}",
      ".__P__-cfg-select:hover,.__P__-cfg-input:hover{border-color:color-mix(in oklab,currentColor 28%,var(--cfg-line))}",
      ".__P__-cfg-select:focus,.__P__-cfg-input:focus{border-color:var(--dsw-alias-brand-primary,currentColor);box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 14%,transparent)}",
      ".__P__-cfg-select{min-width:152px;padding-right:10px}",
      ".__P__-cfg-input{width:132px}",
      ".__P__-cfg-switch{position:relative;display:inline-flex;align-items:center;gap:9px;cursor:pointer;font-size:12.5px;color:var(--cfg-muted);user-select:none}",
      ".__P__-cfg-switch input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}",
      ".__P__-cfg-track{position:relative;width:38px;height:22px;border-radius:999px;background:color-mix(in oklab,currentColor 18%,transparent);transition:background .16s ease;flex:none}",
      ".__P__-cfg-track::after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--dsw-alias-label-primary,currentColor);transition:transform .16s ease,background .16s ease}",
      ".__P__-cfg-switch input:checked+.__P__-cfg-track{background:var(--dsw-alias-brand-primary,currentColor)}",
      ".__P__-cfg-switch input:checked+.__P__-cfg-track::after{transform:translateX(16px);background:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-bg-base))}",
      ".__P__-cfg-switch input:focus-visible+.__P__-cfg-track{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
      ".__P__-cfg-multi{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;max-width:100%}",
      ".__P__-cfg-multi label{position:relative;display:inline-flex;align-items:center;padding:5px 11px;border:1px solid var(--cfg-line);border-radius:999px;font-size:12px;color:var(--cfg-muted);cursor:pointer;line-height:1.4;transition:color .12s ease,border-color .12s ease,background .12s ease}",
      ".__P__-cfg-multi label:hover{background:var(--cfg-hover);color:var(--dsw-alias-label-primary,inherit)}",
      ".__P__-cfg-multi input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}",
      ".__P__-cfg-multi label:has(input:checked){color:var(--dsw-alias-label-primary,inherit);border-color:color-mix(in oklab,currentColor 40%,var(--cfg-line));background:color-mix(in oklab,currentColor 7%,transparent);font-weight:600}",
      ".__P__-cfg-multi input:focus-visible+span{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px;border-radius:4px}",
      ".__P__-cfg-chip{font-size:10.5px;line-height:1.5;padding:1px 7px;border-radius:999px;background:color-mix(in oklab,currentColor 8%,transparent);color:var(--cfg-muted);font-weight:600;white-space:nowrap}",
      ".__P__-cfg-btn{display:inline-flex;align-items:center;gap:4px;border:1px solid transparent;background:transparent;color:var(--cfg-muted);border-radius:8px;padding:5px 9px;font:inherit;font-size:11.5px;cursor:pointer;white-space:nowrap;transition:background .12s ease,color .12s ease,border-color .12s ease}",
      ".__P__-cfg-btn:hover{background:var(--cfg-hover);color:var(--dsw-alias-label-primary,inherit)}",
      ".__P__-cfg-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
      ".__P__-cfg-btn:disabled{opacity:.45;cursor:not-allowed}",
      ".__P__-cfg-btn-outline{border-color:var(--cfg-line);color:var(--dsw-alias-label-primary,inherit)}",
      ".__P__-cfg-foot{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:2px 2px 0;min-height:32px}",
      ".__P__-cfg-changed{font-size:12px;color:var(--cfg-muted)}",
      ".__P__-cfg-grow{flex:1}",
      ".__P__-cfg-loading{display:flex;flex-direction:column;gap:10px;padding:6px 2px}",
      ".__P__-cfg-sk{height:14px;border-radius:7px;background:var(--dsw-alias-bg-skeleton,color-mix(in oklab,currentColor 6%,transparent));animation:__P__-cfg-pulse 1.4s ease-in-out infinite}",
      ".__P__-cfg-sk:nth-child(3){width:72%}",
      ".__P__-cfg-sk:nth-child(4){width:48%}",
      "@keyframes __P__-cfg-pulse{0%,100%{opacity:.65}50%{opacity:1}}",
      ".__P__-cfg-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
      ".__P__-cfg-empty{border:1px dashed var(--cfg-line);border-radius:14px;padding:40px 16px;text-align:center;font-size:12.5px;color:var(--cfg-muted)}",
      ".__P__-cfg-error{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border:1px solid color-mix(in oklab,var(--dsw-alias-state-error-primary,currentColor) 32%,var(--cfg-line));border-radius:10px;padding:10px 13px;color:var(--dsw-alias-state-error-primary,inherit);font-size:12.5px;line-height:1.5}",
      "@media (max-width:820px){.__P__-cfg-row{grid-template-columns:1fr;gap:10px;padding:13px 16px}.__P__-cfg-control{justify-content:flex-start}.__P__-cfg-multi{justify-content:flex-start}.__P__-cfg-gtitle{padding:11px 16px}}",
      "@media (prefers-reduced-motion:reduce){.__P__-cfg-track,.__P__-cfg-track::after,.__P__-cfg-sk{animation:none;transition:none}}"
    ].join("\n").split("__P__").join(PREFIX);
    function injectCss() {
      if (typeof document === "undefined") return;
      var old = document.getElementById("wb-addon-" + DOMAIN + "-config-css");
      if (old) {
        old.textContent = CSS;
        return;
      }
      var s = document.createElement("style");
      s.id = "wb-addon-" + DOMAIN + "-config-css";
      s.setAttribute("data-wb-addon", "wb-addon-" + DOMAIN);
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    function unwrap(r) {
      return r && r.result !== void 0 ? r.result : r;
    }
    function optionLabel(opt, lang) {
      return lang === "en" ? String(opt.en || opt.zh || opt.value) : String(opt.zh || opt.en || opt.value);
    }
    function sameValue(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    function useConfig(api, fallback) {
      var fb = fallback || {};
      var stateS = React.useState({
        ready: false,
        values: Object.assign({}, fb),
        items: [],
        groups: [],
        overrides: {},
        error: "",
        state: null
      });
      var state = stateS[0], setState = stateS[1];
      React.useEffect(
        function() {
          var alive = true;
          Promise.resolve(api.call(DOMAIN + ".configGet")).then(function(r) {
            if (!alive) return;
            var body = unwrap(r);
            if (r && r.ok === false) throw new Error(r && r.error || "load failed");
            if (!body || !body.values) throw new Error("empty config");
            setState({
              ready: true,
              values: Object.assign({}, fb, body.values),
              items: body.items || [],
              groups: body.groups || [],
              overrides: body.overrides || {},
              error: "",
              state: body
            });
          }).catch(function(e) {
            if (!alive) return;
            setState({
              ready: true,
              values: Object.assign({}, fb),
              items: [],
              groups: [],
              overrides: {},
              error: String(e && e.message || e),
              state: null
            });
          });
          return function() {
            alive = false;
          };
        },
        [api]
      );
      return state;
    }
    function ConfigView(props) {
      var api = props.api;
      var lang = props.lang === "en" ? "en" : "zh";
      var t = COPY[lang];
      var loadS = React.useState(true);
      var loading = loadS[0], setLoading = loadS[1];
      var stateS = React.useState(null);
      var state = stateS[0], setState = stateS[1];
      var errS = React.useState("");
      var err = errS[0], setErr = errS[1];
      var noticeS = React.useState({ id: "", text: "", error: false });
      var notice = noticeS[0], setNotice = noticeS[1];
      var savingS = React.useState("");
      var savingId = savingS[0], setSavingId = savingS[1];
      var draftsS = React.useState({});
      var drafts = draftsS[0], setDrafts = draftsS[1];
      var busyS = React.useState(false);
      var busy = busyS[0], setBusy = busyS[1];
      React.useEffect(function() {
        injectCss();
      }, []);
      var load = React.useCallback(
        function() {
          setLoading(true);
          return Promise.resolve(api.call(DOMAIN + ".configGet")).then(function(r) {
            var body2 = unwrap(r);
            if (r && r.ok === false) throw new Error(r && r.error || "load failed");
            setState(body2 || null);
            setErr("");
            setLoading(false);
          }).catch(function(e) {
            setErr(String(e && e.message || e));
            setLoading(false);
          });
        },
        [api]
      );
      React.useEffect(
        function() {
          load();
        },
        [load]
      );
      function setValueLocal(id, value) {
        setState(function(prev) {
          if (!prev) return prev;
          var values = Object.assign({}, prev.values);
          values[id] = value;
          var overrides = Object.assign({}, prev.overrides);
          overrides[id] = value;
          return Object.assign({}, prev, { values, overrides });
        });
      }
      function save(id, value) {
        var prevState = state;
        setSavingId(id);
        setNotice({ id, text: t.saving, error: false });
        setValueLocal(id, value);
        return Promise.resolve(
          api.call(DOMAIN + ".configSet", {
            values: (function() {
              var o = {};
              o[id] = value;
              return o;
            })()
          })
        ).then(function(r) {
          var body2 = unwrap(r);
          if (r && r.ok === false) throw new Error(r && r.error || "save failed");
          setSavingId("");
          if (body2 && body2.state) setState(body2.state);
          setNotice({ id, text: t.saved, error: false });
        }).catch(function(e) {
          setSavingId("");
          if (prevState) setState(prevState);
          setNotice({ id, text: t.saveFail + String(e && e.message || e), error: true });
        });
      }
      function resetItem(id) {
        var prevState = state;
        setBusy(true);
        setNotice({ id, text: t.resetting, error: false });
        return Promise.resolve(api.call(DOMAIN + ".configReset", { ids: [id] })).then(function(r) {
          var body2 = unwrap(r);
          if (r && r.ok === false) throw new Error(r && r.error || "reset failed");
          setBusy(false);
          if (body2 && body2.state) setState(body2.state);
          setNotice({ id, text: t.defaultValue, error: false });
        }).catch(function(e) {
          setBusy(false);
          if (prevState) setState(prevState);
          setNotice({ id, text: String(e && e.message || e), error: true });
        });
      }
      function resetAll() {
        if (typeof window !== "undefined" && window.confirm && !window.confirm(t.confirmResetAll)) return;
        var prevState = state;
        setBusy(true);
        setNotice({ id: "", text: t.resetting, error: false });
        Promise.resolve(api.call(DOMAIN + ".configReset", {})).then(function(r) {
          var body2 = unwrap(r);
          if (r && r.ok === false) throw new Error(r && r.error || "reset failed");
          setBusy(false);
          if (body2 && body2.state) setState(body2.state);
          setNotice({ id: "", text: t.allDefault, error: false });
        }).catch(function(e) {
          setBusy(false);
          if (prevState) setState(prevState);
          setNotice({ id: "", text: String(e && e.message || e), error: true });
        });
      }
      function commitDraft(item) {
        var raw = drafts[item.id];
        if (raw === void 0) return;
        var next = String(raw).trim();
        setDrafts(function(prev) {
          var copy = Object.assign({}, prev);
          delete copy[item.id];
          return copy;
        });
        if (next === "") return;
        var value = Number(next);
        if (!Number.isFinite(value)) return;
        if (sameValue(value, state.values[item.id])) return;
        save(item.id, value);
      }
      function renderControl(item) {
        var value = state.values[item.id];
        var label = lang === "en" ? item.en : item.zh;
        if (item.type === "bool") {
          return h(
            "label",
            { className: PREFIX + "-cfg-switch" },
            h("input", {
              type: "checkbox",
              checked: value === true,
              onChange: function(e) {
                save(item.id, e.target.checked);
              }
            }),
            h("span", { className: PREFIX + "-cfg-track", "aria-hidden": "true" }),
            h("span", { className: PREFIX + "-cfg-switchstate" }, value === true ? t.on : t.off)
          );
        }
        if (item.type === "enum") {
          return h(
            "select",
            {
              className: PREFIX + "-cfg-select",
              value: String(value),
              onChange: function(e) {
                var hit = (item.options || []).filter(function(o) {
                  return String(o.value) === e.target.value;
                })[0];
                if (hit) save(item.id, hit.value);
              }
            },
            (item.options || []).map(function(o) {
              return h("option", { key: String(o.value), value: String(o.value) }, optionLabel(o, lang));
            })
          );
        }
        if (item.type === "int") {
          var draft = drafts[item.id] !== void 0 ? drafts[item.id] : String(value);
          return h("input", {
            className: PREFIX + "-cfg-input",
            type: "number",
            value: draft,
            min: item.min,
            max: item.max,
            "aria-label": label,
            onChange: function(e) {
              var v = e.target.value;
              setDrafts(function(prev) {
                var c = Object.assign({}, prev);
                c[item.id] = v;
                return c;
              });
            },
            onBlur: function() {
              commitDraft(item);
            },
            onKeyDown: function(e) {
              if (e.key === "Enter") {
                e.preventDefault();
                commitDraft(item);
              }
            }
          });
        }
        if (item.type === "multi") {
          var picked = Array.isArray(value) ? value : [];
          return h(
            "div",
            { className: PREFIX + "-cfg-multi" },
            (item.options || []).map(function(o) {
              var on = picked.indexOf(o.value) >= 0;
              return h(
                "label",
                { key: String(o.value) },
                h("input", {
                  type: "checkbox",
                  checked: on,
                  onChange: function() {
                    var next = picked.slice();
                    if (on) {
                      if (next.length <= 1) return;
                      next = next.filter(function(x) {
                        return x !== o.value;
                      });
                    } else next.push(o.value);
                    save(item.id, next);
                  }
                }),
                h("span", null, optionLabel(o, lang))
              );
            })
          );
        }
        return h("input", {
          className: PREFIX + "-cfg-input",
          type: "text",
          defaultValue: value === void 0 ? "" : String(value),
          onBlur: function(e) {
            if (!sameValue(e.target.value, value)) save(item.id, e.target.value);
          }
        });
      }
      var body = [];
      if (loading && !state)
        body.push(
          h(
            "div",
            { key: "loading", className: PREFIX + "-cfg-loading", "aria-busy": "true" },
            h("span", { className: PREFIX + "-cfg-sr" }, t.loading),
            h("div", { className: PREFIX + "-cfg-sk" }),
            h("div", { className: PREFIX + "-cfg-sk" }),
            h("div", { className: PREFIX + "-cfg-sk" })
          )
        );
      if (!loading && err && !state) {
        body.push(
          h(
            "div",
            { key: "err", className: PREFIX + "-cfg-error" },
            h("span", null, t.loadFail + " " + err),
            h("button", { type: "button", className: PREFIX + "-cfg-btn", onClick: load }, t.retry)
          )
        );
      }
      if (state) {
        var items = state.items || [];
        var groups = state.groups || [];
        var byGroup = {};
        items.forEach(function(item) {
          (byGroup[item.group] = byGroup[item.group] || []).push(item);
        });
        var order = groups.length ? groups : Object.keys(byGroup).map(function(id) {
          return { id, zh: id, en: id };
        });
        order.forEach(function(g) {
          var list = byGroup[g.id] || [];
          if (!list.length) return;
          body.push(
            h(
              "section",
              { key: "g-" + g.id, className: PREFIX + "-cfg-group" },
              h(
                "div",
                { className: PREFIX + "-cfg-gtitle" },
                h("span", null, lang === "en" ? g.en : g.zh),
                h("span", { className: PREFIX + "-cfg-gcount" }, list.length + (lang === "en" ? " items" : " \u9879"))
              ),
              list.map(function(item) {
                var overridden = state.overrides && state.overrides[item.id] !== void 0;
                var isSaving = savingId === item.id;
                return h(
                  "div",
                  { key: item.id, className: PREFIX + "-cfg-row" },
                  h(
                    "div",
                    { className: PREFIX + "-cfg-label" },
                    h(
                      "div",
                      { className: PREFIX + "-cfg-name" },
                      h("span", null, lang === "en" ? item.en : item.zh),
                      overridden ? h("span", { className: PREFIX + "-cfg-chip" }, t.modified) : null,
                      isSaving ? h("span", { className: PREFIX + "-cfg-chip" }, t.saving) : null
                    ),
                    (lang === "en" ? item.hintEn : item.hintZh) ? h("div", { className: PREFIX + "-cfg-hint" }, lang === "en" ? item.hintEn : item.hintZh) : null,
                    h("div", { className: PREFIX + "-cfg-id" }, item.id)
                  ),
                  h(
                    "div",
                    { className: PREFIX + "-cfg-control" },
                    renderControl(item),
                    overridden ? h(
                      "button",
                      {
                        type: "button",
                        className: PREFIX + "-cfg-btn",
                        disabled: busy,
                        onClick: function() {
                          resetItem(item.id);
                        },
                        title: t.reset
                      },
                      t.reset
                    ) : null
                  )
                );
              })
            )
          );
        });
        if (!items.length && !loading) body.push(h("div", { key: "empty", className: PREFIX + "-cfg-empty" }, t.empty));
        var anyOverride = Object.keys(state.overrides || {}).length > 0;
        body.push(
          h(
            "div",
            { key: "foot", className: PREFIX + "-cfg-foot" },
            h(
              "span",
              { className: PREFIX + "-cfg-changed" },
              anyOverride ? Object.keys(state.overrides || {}).length + (lang === "en" ? " changed" : " \u9879\u5DF2\u4FEE\u6539") : lang === "en" ? "All preferences are at their defaults" : "\u5168\u90E8\u914D\u7F6E\u5747\u4E3A\u9ED8\u8BA4\u503C"
            ),
            h("span", { className: PREFIX + "-cfg-grow" }),
            anyOverride ? h(
              "button",
              {
                type: "button",
                className: PREFIX + "-cfg-btn " + PREFIX + "-cfg-btn-outline",
                disabled: busy,
                onClick: resetAll
              },
              busy ? t.resetting : t.resetAll
            ) : null
          )
        );
        var warn = (state.warnings || []).filter(function(w) {
          return w && w.message;
        });
        if (warn.length) {
          body.push(
            h(
              "div",
              { key: "warn", className: PREFIX + "-cfg-error" },
              h(
                "span",
                null,
                warn.map(function(w) {
                  return w.message;
                }).join("\uFF1B")
              )
            )
          );
        }
      }
      return h(
        "div",
        { className: PREFIX + "-cfg" },
        h(
          "div",
          { className: PREFIX + "-cfg-head" },
          h(
            "div",
            { className: PREFIX + "-cfg-headmain" },
            h("h2", null, t.title),
            h("div", { className: PREFIX + "-cfg-note" }, t.note)
          ),
          notice.text ? h(
            "div",
            { key: "notice", className: PREFIX + "-cfg-status" + (notice.error ? " err" : ""), role: "status" },
            notice.text
          ) : null
        ),
        body
      );
    }
    module2.exports = { ConfigView, useConfig, DOMAIN };
  }
});

// packages/addons/storage/client/data.cjs
var require_data = __commonJS({
  "packages/addons/storage/client/data.cjs"(exports2, module2) {
    var React = require("react");
    var ui = require_ui();
    var useConfig = require_config().useConfig;
    var h = ui.h;
    var tr = ui.tr;
    function DataView(props) {
      var api = props.api, lang = props.lang, config = useConfig(api, { "data.pageSize": 50, "data.includeDeleted": false, "data.showSystemColumns": false });
      var result = React.useState(null), error = React.useState(null), busy = React.useState(false), page = React.useState(1), search = React.useState(""), query = React.useState(""), deleted = React.useState(null), system = React.useState(null), tick = React.useState(0);
      React.useEffect(
        function() {
          var timer = setTimeout(function() {
            query[1](search[0]);
            page[1](1);
          }, 250);
          return function() {
            clearTimeout(timer);
          };
        },
        [search[0]]
      );
      var showDeleted = deleted[0] === null ? !!config.values["data.includeDeleted"] : deleted[0];
      var showSystem = system[0] === null ? !!config.values["data.showSystemColumns"] : system[0];
      React.useEffect(
        function() {
          if (!config.ready) return;
          var active = true;
          busy[1](true);
          error[1](null);
          ui.call(api, "storage.dataQuery", {
            table: "storage",
            page: page[0],
            pageSize: config.values["data.pageSize"],
            search: query[0],
            includeDeleted: showDeleted
          }).then(function(r) {
            if (active) result[1](r);
          }).catch(function(e) {
            if (active) error[1](e);
          }).finally(function() {
            if (active) busy[1](false);
          });
          return function() {
            active = false;
          };
        },
        [api, config.ready, config.values["data.pageSize"], page[0], query[0], showDeleted, tick[0]]
      );
      var data = result[0], cols = data ? (data.columns || []).filter(function(c) {
        return showSystem || !c.system;
      }) : [];
      return h(
        "div",
        { className: "wbi-root" },
        h("h2", null, tr(lang, "\u7269\u54C1\u6570\u636E", "Inventory data")),
        h(
          "p",
          { className: "wbi-muted" },
          tr(
            lang,
            "\u53EA\u8BFB\u67E5\u770B\u672C\u63D2\u4EF6\u6570\u636E\u3002\u6807\u7B7E\u5173\u8054\u53EF\u5728\u6807\u7B7E\u63D2\u4EF6\u7684\u6570\u636E\u9875\u67E5\u770B\u3002",
            "Read-only plugin data. Tag links are available in the Tags data view."
          )
        ),
        h(
          "div",
          { className: "wbi-toolbar" },
          h("input", {
            type: "search",
            value: search[0],
            placeholder: tr(lang, "\u641C\u7D22\u6570\u636E", "Search data"),
            "aria-label": tr(lang, "\u641C\u7D22\u6570\u636E", "Search data"),
            onChange: function(e) {
              search[1](e.target.value);
            }
          }),
          h(
            "label",
            null,
            h("input", {
              type: "checkbox",
              checked: showDeleted,
              onChange: function(e) {
                deleted[1](e.target.checked);
                page[1](1);
              }
            }),
            tr(lang, "\u5305\u542B\u5DF2\u5220\u9664", "Include deleted")
          ),
          h(
            "label",
            null,
            h("input", {
              type: "checkbox",
              checked: showSystem,
              onChange: function(e) {
                system[1](e.target.checked);
              }
            }),
            tr(lang, "\u7CFB\u7EDF\u5B57\u6BB5", "System columns")
          ),
          h(
            ui.Button,
            {
              disabled: busy[0],
              onClick: function() {
                tick[1](tick[0] + 1);
              }
            },
            tr(lang, "\u5237\u65B0", "Refresh")
          )
        ),
        h(ui.ErrorBox, { error: error[0] || config.error }),
        busy[0] ? h("p", { role: "status" }, tr(lang, "\u8BFB\u53D6\u4E2D\u2026", "Loading\u2026")) : null,
        !busy[0] && !error[0] && data ? h(
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
                cols.map(function(c) {
                  return h("th", { key: c.name, scope: "col" }, c.label && (c.label[lang] || c.label.zh) || c.name);
                })
              )
            ),
            h(
              "tbody",
              null,
              data.rows.map(function(row, i) {
                return h(
                  "tr",
                  { key: row.id || i },
                  cols.map(function(c) {
                    var v = row[c.name];
                    return h(
                      "td",
                      { key: c.name },
                      v === null || v === void 0 ? "\u2014" : typeof v === "object" ? JSON.stringify(v) : String(v)
                    );
                  })
                );
              })
            )
          ),
          !data.rows.length ? h("p", { className: "wbi-empty" }, tr(lang, "\u6CA1\u6709\u5339\u914D\u7684\u6570\u636E", "No matching data")) : null
        ) : null,
        data ? h(
          "div",
          { className: "wbi-pager" },
          h("span", null, data.total + tr(lang, " \u884C \xB7 ", " rows \xB7 ") + data.page + " / " + data.pages),
          h(
            ui.Button,
            {
              disabled: busy[0] || data.page <= 1,
              onClick: function() {
                page[1](data.page - 1);
              }
            },
            tr(lang, "\u4E0A\u4E00\u9875", "Previous")
          ),
          h(
            ui.Button,
            {
              disabled: busy[0] || data.page >= data.pages,
              onClick: function() {
                page[1](data.page + 1);
              }
            },
            tr(lang, "\u4E0B\u4E00\u9875", "Next")
          )
        ) : null
      );
    }
    module2.exports = { DataView };
  }
});

// packages/addons/storage/client/client.src.cjs
var host = window.__WB_HOST__;
if (host) {
  styleId = "wb-addon-storage-style";
  if (!document.getElementById(styleId)) {
    style = document.createElement("style");
    style.id = styleId;
    style.textContent = require_styles();
    document.head.appendChild(style);
  }
  host.registerAddon({
    id: "wb-addon-storage",
    version: "1.0.0",
    views: [
      { id: "stats", title: { zh: "\u7EDF\u8BA1", en: "Stats" }, component: require_stats().Stats },
      { id: "storage", title: { zh: "\u8BB0\u5F55", en: "Records" }, component: require_records().Records },
      { id: "config", title: { zh: "\u914D\u7F6E", en: "Config" }, component: require_config().ConfigView },
      { id: "data", title: { zh: "\u6570\u636E", en: "Data" }, component: require_data().DataView }
    ]
  });
} else console.error("[wb-addon-storage] Missing workbench host");
var styleId;
var style;
module.exports = { name: "dsh-workbench-storage", inject: [], apply: function() {
} };
    return module.exports;
  },
});
