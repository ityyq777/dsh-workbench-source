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

// packages/addons/lib/description.cjs
var require_description = __commonJS({
  "packages/addons/lib/description.cjs"(exports2, module2) {
    var React = require("react");
    var h = React.createElement;
    var css = `
.wb-desc{margin-top:4px;font-size:12.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;max-width:100%;min-width:0;box-sizing:border-box;padding:6px 10px;border-radius:0 8px 8px 0;border-left:2px solid color-mix(in oklab,#5b7fd6 34%,transparent);background:color-mix(in oklab,#5b7fd6 7%,transparent);color:inherit}
.wb-desc-text{display:block}.wb-desc-clamped{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.wb-desc-toggle{display:block;border:1px solid transparent;background:transparent;color:inherit;font:inherit;font-size:12px;min-width:32px;min-height:32px;padding:3px 6px;border-radius:6px;cursor:pointer;white-space:normal}
.wb-desc-toggle:hover{background:color-mix(in oklab,currentColor 8%,transparent)}.wb-desc-toggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#2563eb);outline-offset:2px}
`;
    function Description(props) {
      var text = props.text == null ? "" : String(props.text);
      var expanded = React.useState(false), overflow = React.useState(false), ref = React.useRef(null);
      React.useEffect(function() {
        expanded[1](false);
      }, [text]);
      React.useEffect(function() {
        var node = ref.current;
        if (!node) return;
        function measure() {
          if (!expanded[0]) overflow[1](node.scrollHeight > node.clientHeight + 1);
        }
        measure();
        var observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
        if (observer) observer.observe(node);
        return function() {
          if (observer) observer.disconnect();
        };
      }, [text, expanded[0]]);
      if (!text.trim()) return null;
      return h(
        "div",
        { className: "wb-desc" },
        h("span", { ref, className: "wb-desc-text" + (expanded[0] ? "" : " wb-desc-clamped") }, text),
        overflow[0] || expanded[0] ? h("button", {
          type: "button",
          className: "wb-desc-toggle",
          "aria-expanded": expanded[0],
          onClick: function() {
            expanded[1](!expanded[0]);
          }
        }, props.lang === "en" ? expanded[0] ? "Collapse" : "Expand" : expanded[0] ? "\u6536\u8D77" : "\u5C55\u5F00") : null
      );
    }
    module2.exports = { css, Description };
  }
});

// packages/addons/storage/client/styles.cjs
var require_styles = __commonJS({
  "packages/addons/storage/client/styles.cjs"(exports2, module2) {
    module2.exports = require_description().css + `
.wbi-root{--line:var(--wb-line,var(--dsw-alias-border-l2,#d9dfe6));--surface:var(--wb-surface,var(--dsw-alias-bg-layer-1,#fff));--muted:var(--dsw-alias-label-secondary,#64748b);--accent:var(--dsw-alias-brand-primary,#2563eb);font-size:13px;color:inherit;min-width:0;container-type:inline-size;container-name:storage}
.wbi-root *{box-sizing:border-box}.wbi-root h2{font-size:18px;margin:0}.wbi-root h3{font-size:15px;margin:0}.wbi-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.wbi-grow{flex:1;min-width:0}.wbi-muted{color:var(--muted);font-size:12px}.wbi-root input,.wbi-root textarea,.wbi-root select{background:var(--surface);color:inherit;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font:inherit;max-width:100%}.wbi-root textarea{resize:vertical;min-height:80px}.wbi-root :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wbi-btn{border:1px solid var(--line);background:var(--surface);color:inherit;border-radius:8px;padding:7px 12px;cursor:pointer;font:inherit}.wbi-btn:hover{border-color:var(--accent)}.wbi-btn:disabled{opacity:.45;cursor:default}.wbi-primary{background:var(--accent);color:#fff;border-color:var(--accent)}.wbi-danger{color:var(--dsw-alias-state-error-primary,#b91c1c)}.wbi-toolbar{margin:18px 0;display:flex;gap:10px;align-items:center;flex-wrap:wrap}.wbi-toolbar input[type=search]{min-width:220px;flex:1}.wbi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr));gap:14px}.wbi-card{padding:14px;border:1px solid var(--line);border-radius:10px;background:var(--surface);min-width:0;height:100%;display:flex;flex-direction:column;gap:8px;transition:transform .14s ease,border-color .14s ease}.wbi-card h3{font-size:14px;font-weight:650;line-height:1.4;overflow-wrap:anywhere;min-width:0;flex:1}.wbi-stock{font-size:18px;font-weight:650;overflow-wrap:anywhere;max-width:100%;font-variant-numeric:tabular-nums}.wbi-card p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.wbi-tags{display:flex;gap:6px;flex-wrap:wrap}.wbi-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 8px;border-radius:20px;background:color-mix(in srgb,var(--accent) 9%,transparent);font-size:12px}.wbi-images{display:flex;gap:8px;flex-wrap:wrap;align-items:center;min-width:0}.wbi-image{border:1px solid var(--line);border-radius:8px;overflow:hidden;padding:0;background:transparent;flex-shrink:0;cursor:pointer}.wbi-image img{display:block;width:80px;aspect-ratio:4/3;height:auto;object-fit:cover}.wbi-empty{padding:50px 20px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:12px}.wbi-error{padding:12px;margin:10px 0;border:1px solid #ef4444;border-radius:8px;color:var(--dsw-alias-state-error-primary,#b91c1c)}.wbi-pager{margin:20px 0;display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap}
.wbi-mask{position:fixed;inset:0;background:#0007;z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px}.wbi-modal{background:var(--surface);color:inherit;border-radius:14px;padding:22px;width:640px;max-width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 70px #0004}.wbi-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px}.wbi-field{display:flex;flex-direction:column;gap:6px;min-width:0}.wbi-wide{grid-column:1/-1}.wbi-formfoot{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}.wbi-tagoptions{display:flex;gap:8px;flex-wrap:wrap;max-height:160px;overflow:auto;margin-top:8px}.wbi-tagoptions label{display:flex;gap:5px;align-items:center}.wbi-preview{display:block;max-width:100%;max-height:65vh;margin:16px auto;object-fit:contain}.wbi-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin:18px 0}.wbi-kpis strong{display:block;font-size:28px;margin-top:8px}.wbi-bar{height:7px;border-radius:4px;background:var(--accent);margin:8px 0 12px}.wbi-notice{padding:10px 0;color:var(--muted)}
@media(max-width:600px){.wbi-form{grid-template-columns:1fr}.wbi-wide{grid-column:auto}.wbi-mask{padding:8px}.wbi-modal{padding:16px}.wbi-toolbar input[type=search]{min-width:0;width:100%}}

.wbi-cardhead{display:flex;align-items:baseline;gap:8px;min-width:0;flex-wrap:wrap}.wbi-metazone{display:flex;flex-direction:column;gap:3px;min-width:0;overflow-wrap:anywhere}.wbi-meta{display:flex;gap:2px 10px;flex-wrap:wrap;font-size:11.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.wbi-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:4px;margin-top:auto;padding-top:6px;min-width:0}.wbi-btn-sm{padding:3px 9px;font-size:12px;min-height:32px;min-width:32px}.wbi-ghost{background:transparent;border-color:transparent}.wbi-ghost.wbi-danger{color:inherit}.wbi-ghost.wbi-danger:hover{color:var(--dsw-alias-state-error-primary,#b91c1c);border-color:currentColor}.wbi-chip{min-height:32px;max-width:100%;overflow-wrap:anywhere;text-align:left}.wbi-stock small{font-weight:400}.wbi-more{font-variant-numeric:tabular-nums}
.wbi-card:hover,.wbi-card:focus-within{border-color:color-mix(in oklab,var(--accent) 40%,var(--line))}.wbi-card:hover{transform:translateY(-2px)}.wbi-card:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wbi-selectable{cursor:pointer;position:relative;padding-top:42px}.wbi-root input.wbi-check{position:absolute;left:14px;top:14px;margin:0;padding:0;accent-color:var(--accent)}.wbi-card.wbi-selected{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 9%,var(--surface))}.wbi-selbar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:900;display:flex;gap:8px;align-items:center;background:var(--surface);border:1px solid var(--line);box-shadow:0 10px 34px #0004;border-radius:12px;padding:8px 11px;max-width:94vw;flex-wrap:wrap}.wbi-bulk-actions{display:flex;gap:8px}.wbi-root:has(.wbi-selbar){padding-bottom:84px}.wbi-selbar .wbi-danger{background:color-mix(in srgb,currentColor 9%,var(--surface))}
@container storage (min-width:1280px){.wbi-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}
@media(prefers-reduced-motion:reduce){.wbi-card{transition:none}.wbi-card:hover{transform:none}}
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
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          if (props.onClose) props.onClose();
          return;
        }
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
          h("h2", null, tr(lang, "\u7EDF\u8BA1", "Statistics")),
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

// packages/addons/storage/client/card.cjs
var require_card = __commonJS({
  "packages/addons/storage/client/card.cjs"(exports2, module2) {
    var React = require("react");
    var ui = require_ui();
    var h = ui.h;
    var tr = ui.tr;
    var Description = require_description().Description;
    function StorageCard(props) {
      var item = props.item, lang = props.lang, gallery = React.useState(false);
      var images = (item.imgList || []).filter(ui.safeImage), tags = item.tags || [];
      var shown = gallery[0] ? images : images.slice(0, 1);
      var meta = [
        item.brand && tr(lang, "\u54C1\u724C\uFF1A", "Brand: ") + item.brand,
        item.unit && tr(lang, "\u5355\u4F4D\uFF1A", "Unit: ") + item.unit
      ].filter(Boolean);
      return h(
        "article",
        {
          className: "wbi-card" + (props.selectionMode ? " wbi-selectable" : "") + (props.checked ? " wbi-selected" : ""),
          onClickCapture: props.selectionMode ? function(e) {
            if (e.target.type === "checkbox") return;
            e.preventDefault();
            e.stopPropagation();
            if (!props.busy) props.onCheck(item.id, e.shiftKey);
          } : void 0
        },
        props.selectionMode ? h("input", {
          type: "checkbox",
          className: "wbi-check",
          checked: !!props.checked,
          disabled: props.busy,
          "aria-label": tr(lang, "\u9009\u62E9 ", "Select ") + item.name,
          onClick: function(e) {
            e.stopPropagation();
            props.onCheck(item.id, e.shiftKey);
          },
          onChange: function() {
          }
        }) : null,
        h(
          "div",
          { className: "wbi-cardhead" },
          h("h3", null, item.name),
          h(
            "span",
            { className: "wbi-stock" },
            item.stock == null || item.stock === "" ? "\u2014" : item.stock,
            item.unit ? h("small", { className: "wbi-muted" }, " " + item.unit) : null
          )
        ),
        tags.length ? h("div", { className: "wbi-tags" }, tags.map(function(t) {
          return h(ui.Button, {
            key: t.id,
            className: "wbi-btn wbi-chip",
            disabled: !props.caps,
            title: tr(lang, "\u6309\u6B64\u6807\u7B7E\u7B5B\u9009", "Filter by this tag"),
            onClick: function() {
              props.onTag(t);
            }
          }, t.name);
        })) : null,
        meta.length || item.createTime || item.updateTime ? h(
          "div",
          { className: "wbi-metazone" },
          meta.length ? h("div", { className: "wbi-muted" }, meta.join(" \xB7 ")) : null,
          item.createTime || item.updateTime ? h(
            "div",
            { className: "wbi-meta" },
            item.createTime ? h("span", null, tr(lang, "\u521B\u5EFA ", "Created ") + props.date(item.createTime)) : null,
            item.updateTime ? h("span", null, tr(lang, "\u66F4\u65B0 ", "Updated ") + props.date(item.updateTime)) : null
          ) : null
        ) : null,
        h(Description, { text: item.remark, lang }),
        images.length ? h("div", { className: "wbi-images" }, shown.map(function(url, i) {
          return h(
            "button",
            {
              key: i,
              type: "button",
              className: "wbi-image",
              "aria-label": tr(lang, "\u9884\u89C8\u56FE\u7247 ", "Preview image ") + (i + 1),
              onClick: function() {
                props.onPreview({ url, name: item.name });
              }
            },
            h("img", { src: url, alt: item.name + " " + (i + 1), loading: "lazy", referrerPolicy: "no-referrer" })
          );
        }), images.length > 1 ? h(ui.Button, {
          className: "wbi-btn wbi-btn-sm wbi-ghost wbi-more",
          "aria-expanded": gallery[0],
          "aria-label": tr(lang, "\u5C55\u5F00\u6216\u6536\u8D77\u7269\u54C1\u56FE\u7247", "Expand or collapse item images"),
          onClick: function() {
            gallery[1](!gallery[0]);
          }
        }, gallery[0] ? tr(lang, "\u6536\u8D77", "Collapse") : "+" + (images.length - 1)) : null) : null,
        !props.selectionMode ? h(
          "div",
          { className: "wbi-actions" },
          h(ui.Button, {
            className: "wbi-btn wbi-btn-sm wbi-ghost",
            disabled: props.busy,
            onClick: function() {
              props.onEdit(item);
            }
          }, tr(lang, "\u7F16\u8F91", "Edit")),
          h(ui.Button, {
            className: "wbi-btn wbi-btn-sm wbi-ghost wbi-danger",
            disabled: props.busy,
            onClick: function() {
              props.onDelete(item);
            }
          }, tr(lang, "\u5220\u9664", "Delete"))
        ) : null
      );
    }
    module2.exports = { StorageCard };
  }
});

// packages/addons/storage/client/selection.cjs
var require_selection = __commonJS({
  "packages/addons/storage/client/selection.cjs"(exports2, module2) {
    var React = require("react");
    var ui = require_ui();
    var h = ui.h;
    var tr = ui.tr;
    function useSelection(scope, rows, blocked) {
      var mode = React.useState(false), state = React.useState({ scope, ids: [] }), anchor = React.useRef(null);
      var ids = state[0].scope === scope ? state[0].ids : [];
      function set(next) {
        state[1]({ scope, ids: next });
      }
      function exit() {
        mode[1](false);
        set([]);
        anchor.current = null;
      }
      React.useEffect(function() {
        set([]);
        anchor.current = null;
      }, [scope]);
      React.useEffect(function() {
        function key(e) {
          if (e.key === "Escape" && !e.defaultPrevented && !blocked) exit();
        }
        document.addEventListener("keydown", key);
        return function() {
          document.removeEventListener("keydown", key);
        };
      }, [scope, blocked]);
      return {
        mode: mode[0],
        ids,
        exit,
        enter: function() {
          set([]);
          anchor.current = null;
          mode[1](true);
        },
        all: function() {
          if (!blocked) set(rows.map(function(r) {
            return r.id;
          }));
        },
        toggle: function(id, shift) {
          if (blocked) return;
          var next = new Set(ids), add = !next.has(id), range = [id];
          if (shift && anchor.current && anchor.current.scope === scope) {
            var a = rows.findIndex(function(r) {
              return r.id === anchor.current.id;
            });
            var b = rows.findIndex(function(r) {
              return r.id === id;
            });
            if (a >= 0 && b >= 0) range = rows.slice(Math.min(a, b), Math.max(a, b) + 1).map(function(r) {
              return r.id;
            });
          }
          range.forEach(function(v) {
            if (add) next.add(v);
            else next.delete(v);
          });
          anchor.current = { scope, id };
          set(Array.from(next));
        }
      };
    }
    function SelectionBar(p) {
      return h(
        "div",
        { className: "wbi-selbar", role: "toolbar", "aria-label": tr(p.lang, "\u6279\u91CF\u64CD\u4F5C", "Bulk actions") },
        h("span", { role: "status" }, tr(p.lang, "\u5DF2\u9009 ", "Selected ") + p.selection.ids.length),
        h(ui.Button, { className: "wbi-btn wbi-btn-sm", disabled: p.busy || p.loading, onClick: p.selection.all }, tr(p.lang, "\u5168\u9009\u672C\u9875", "Select page")),
        h(ui.Button, { className: "wbi-btn wbi-btn-sm", disabled: p.busy, onClick: p.selection.exit }, tr(p.lang, "\u9000\u51FA", "Exit")),
        h("div", { className: "wbi-bulk-actions" }, p.children)
      );
    }
    function DeleteConfirmation(p) {
      return h(
        ui.Modal,
        { title: tr(p.lang, "\u6279\u91CF\u5220\u9664\u7269\u54C1", "Delete selected items"), onClose: p.busy ? null : p.onClose },
        h(ui.ErrorBox, { error: p.error }),
        h("p", null, tr(p.lang, "\u5C06\u8F6F\u5220\u9664\u4EE5\u4E0B\u7269\u54C1\u3002\u5171 ", "Soft-delete these items. Total: ") + p.items.length + tr(p.lang, " \u6761", " items")),
        h("ul", null, p.items.slice(0, 10).map(function(item) {
          return h("li", { key: item.id }, item.name);
        })),
        p.items.length > 10 ? h("p", null, tr(p.lang, "\u4EC5\u5C55\u793A\u524D 10 \u6761", "Showing first 10 items")) : null,
        h("p", { className: "wbi-muted" }, tr(p.lang, "\u6807\u7B7E\u53EF\u7528\u65F6\u540C\u65F6\u79FB\u9664\u5173\u8054\uFF0C\u4E0D\u53EF\u7528\u65F6\u4FDD\u7559\u3002", "Tag links are removed when tags are available, otherwise preserved.")),
        h(
          "div",
          { className: "wbi-formfoot" },
          h(ui.Button, { className: "wbi-btn wbi-btn-sm", disabled: p.busy, onClick: p.onClose }, tr(p.lang, "\u53D6\u6D88", "Cancel")),
          h(ui.Button, { className: "wbi-btn wbi-btn-sm wbi-danger", disabled: p.busy, onClick: p.onConfirm }, p.busy ? tr(p.lang, "\u5220\u9664\u4E2D\u2026", "Deleting\u2026") : tr(p.lang, "\u786E\u8BA4\u5220\u9664", "Confirm delete"))
        )
      );
    }
    module2.exports = { useSelection, SelectionBar, DeleteConfirmation };
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
    var StorageCard = require_card().StorageCard;
    var selection = require_selection();
    function Records(props) {
      var api = props.api, lang = props.lang;
      var items = React.useState(null), error = React.useState(null), loading = React.useState(true), query = React.useState(""), text = React.useState(""), page = React.useState(1), size = React.useState(12), sort = React.useState("update_time"), order = React.useState("desc"), tick = React.useState(0), editing = React.useState(null), deleting = React.useState(null), preview = React.useState(null), busy = React.useState(false), caps = React.useState(false), ready = React.useState(false), confirmDelete = React.useState(true), tag = React.useState(null), bulk = React.useState(null), bulkError = React.useState(null), notice = React.useState(""), pending = React.useRef(false);
      var scope = JSON.stringify([query[0], text[0], page[0], size[0], sort[0], order[0], tag[0] && tag[0].id, tick[0]]);
      var rows = items[0] && items[0].scope === scope ? items[0].records : [];
      var selected = selection.useSelection(scope, rows, busy[0] || !!bulk[0]);
      function deleteSelected() {
        if (pending.current || !bulk[0] || !bulk[0].length) return;
        pending.current = true;
        busy[1](true);
        bulkError[1](null);
        ui.call(api, "storage.bulkDelete", { ids: bulk[0].map(function(r) {
          return r.id;
        }) }).then(function(r) {
          bulk[1](null);
          selected.exit();
          notice[1](tr(lang, "\u5DF2\u5220\u9664 ", "Deleted ") + r.deleted + tr(lang, " \u6761\uFF0C\u8DF3\u8FC7 ", " items; skipped ") + r.skipped);
          refresh();
        }).catch(bulkError[1]).finally(function() {
          pending.current = false;
          busy[1](false);
        });
      }
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
          if (!ready[0] || query[0] !== text[0]) return;
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
            items[1](Object.assign({}, r, { scope }));
          }).catch(function(e) {
            if (active) error[1](e);
          }).finally(function() {
            if (active) loading[1](false);
          });
          return function() {
            active = false;
          };
        },
        [api, ready[0], scope]
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
          h("h2", null, tr(lang, "\u50A8\u7269", "Storage")),
          h("span", { className: "wbi-muted" }, tr(lang, "\u8BB0\u5F55\u7269\u54C1\u3001\u5E93\u5B58\u4E0E\u5B58\u653E\u5907\u6CE8", "Track items, stock and notes")),
          h("span", { className: "wbi-grow" }),
          h(ui.Button, {
            className: "wbi-btn wbi-btn-sm",
            disabled: busy[0] || !!bulk[0],
            onClick: selected.mode ? selected.exit : selected.enter
          }, selected.mode ? tr(lang, "\u53D6\u6D88\u9009\u62E9", "Cancel selection") : tr(lang, "\u9009\u62E9", "Select")),
          h(
            ui.Button,
            {
              className: "wbi-btn wbi-primary",
              disabled: selected.mode || busy[0],
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
        selected.mode ? h("p", { className: "wbi-muted" }, tr(
          lang,
          "\u4EC5\u9009\u62E9\u5F53\u524D\u9875\uFF1B\u641C\u7D22\u3001\u7B5B\u9009\u3001\u6392\u5E8F\u3001\u7FFB\u9875\u6216\u5237\u65B0\u4F1A\u6E05\u7A7A\u9009\u62E9\u3002Shift+\u70B9\u51FB\u8FDE\u9009\uFF0CEsc\u9000\u51FA\u3002",
          "Current page only. Search, filters, sorting, paging or refresh clear selection. Shift-click selects a range; Esc exits."
        )) : null,
        notice[0] ? h("p", { role: "status" }, notice[0]) : null,
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
          !loading[0] && !error[0] && data ? rows.map(function(item) {
            return h(StorageCard, {
              key: item.id,
              item,
              lang,
              caps: caps[0],
              busy: busy[0] || !!bulk[0],
              date,
              selectionMode: selected.mode,
              checked: selected.ids.includes(item.id),
              onCheck: selected.toggle,
              onTag: function(t) {
                tag[1](t);
                page[1](1);
              },
              onPreview: preview[1],
              onEdit: editing[1],
              onDelete: function(v) {
                if (confirmDelete[0]) deleting[1](v);
                else remove(v);
              }
            });
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
        selected.mode ? h(
          selection.SelectionBar,
          { selection: selected, lang, busy: busy[0] || !!bulk[0], loading: loading[0] },
          h(ui.Button, {
            className: "wbi-btn wbi-btn-sm wbi-danger",
            disabled: !selected.ids.length || loading[0] || busy[0] || !!bulk[0],
            onClick: function() {
              bulkError[1](null);
              bulk[1](rows.filter(function(r) {
                return selected.ids.includes(r.id);
              }).map(function(r) {
                return { id: r.id, name: r.name };
              }));
            }
          }, tr(lang, "\u5220\u9664", "Delete"))
        ) : null,
        bulk[0] ? h(selection.DeleteConfirmation, {
          items: bulk[0],
          lang,
          busy: busy[0],
          error: bulkError[0],
          onClose: function() {
            bulk[1](null);
          },
          onConfirm: deleteSelected
        }) : null,
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
    module2.exports = { Records, StorageCard };
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

// packages/addons/lib/data-copy.cjs
var require_data_copy = __commonJS({
  "packages/addons/lib/data-copy.cjs"(exports2, module2) {
    "use strict";
    var COPY = {
      zh: {
        title: "\u6570\u636E",
        subtitle: "\u53EA\u8BFB\u6D4F\u89C8\u672C\u63D2\u4EF6\u8D1F\u8D23\u7684\u8868\uFF1B\u7CFB\u7EDF\u5217\u4E0E\u5DF2\u5220\u9664\u884C\u9ED8\u8BA4\u9690\u85CF",
        tables: "\u8868",
        rows: "\u884C",
        deleted: "\u5DF2\u5220\u9664",
        rowCount: "\u5171 {n} \u884C",
        deletedCount: "\u5176\u4E2D {n} \u884C\u5DF2\u5220\u9664",
        search: "\u641C\u7D22\u6240\u6709\u6587\u672C\u5217\u2026",
        pageSize: "\u6BCF\u9875",
        includeDeleted: "\u542B\u5DF2\u5220\u9664",
        showSystem: "\u7CFB\u7EDF\u5217",
        refresh: "\u5237\u65B0",
        loading: "\u8F7D\u5165\u4E2D\u2026",
        empty: "\u8FD9\u5F20\u8868\u8FD8\u6CA1\u6709\u6570\u636E",
        emptyTable: "\u6CA1\u6709\u53EF\u5C55\u793A\u7684\u8868",
        loadFail: "\u6570\u636E\u670D\u52A1\u4E0D\u53EF\u7528\uFF08\u63D2\u4EF6\u7248\u672C\u8FC7\u65E7\uFF1F\uFF09",
        retry: "\u91CD\u8BD5",
        queryFail: "\u67E5\u8BE2\u5931\u8D25\uFF1A",
        noRows: "\u6CA1\u6709\u5339\u914D\u7684\u884C",
        prev: "\u4E0A\u4E00\u9875",
        next: "\u4E0B\u4E00\u9875",
        pageInfo: "\u7B2C {page} / {pages} \u9875",
        jump: "\u8DF3\u8F6C",
        total: "\u5171 {n} \u884C",
        copied: "\u5DF2\u590D\u5236",
        copy: "\u590D\u5236",
        close: "\u5173\u95ED",
        drawerTitle: "{column} \xB7 \u7B2C {row} \u884C",
        nullText: "NULL",
        emptyText: "\u7A7A",
        yes: "\u662F",
        no: "\u5426",
        json: "JSON",
        queryTime: "{n} ms",
        sortAsc: "\u5347\u5E8F",
        sortDesc: "\u964D\u5E8F",
        filterCol: "\u7B5B\u9009\u2026",
        filterClear: "\u6E05\u9664\u7B5B\u9009",
        index: "\u8868\u7D22\u5F15",
        indexSub: "\u672C\u63D2\u4EF6\u8D1F\u8D23\u7684\u8868\uFF08{tables}\uFF09\uFF1A\u884C\u6570\u3001\u5217\u6570\u3001\u4E3B\u952E\u3001\u7D22\u5F15\u4E0E\u6700\u8FD1\u5199\u5165\uFF08\u53EA\u8BFB\uFF09",
        idxTable: "\u8868",
        idxRows: "\u884C\u6570",
        idxCols: "\u5217\u6570",
        idxKey: "\u4E3B\u952E",
        idxIndexes: "\u7D22\u5F15",
        idxLastWrite: "\u6700\u8FD1\u5199\u5165",
        idxNone: "\u65E0",
        idxEmpty: "\u6CA1\u6709\u53EF\u7EDF\u8BA1\u7684\u8868",
        idxTables: "\u8868",
        idxAt: "\u7EDF\u8BA1\u65F6\u95F4"
      },
      en: {
        title: "Data",
        subtitle: "Read-only view of this plugin's tables; system and deleted rows are hidden by default",
        tables: "Tables",
        rows: "rows",
        deleted: "deleted",
        rowCount: "{n} rows",
        deletedCount: "{n} deleted",
        search: "Search all text columns\u2026",
        pageSize: "Rows",
        includeDeleted: "Deleted",
        showSystem: "System",
        refresh: "Refresh",
        loading: "Loading\u2026",
        empty: "This table has no rows yet",
        emptyTable: "No tables to show",
        loadFail: "Data service unavailable (plugin too old?)",
        retry: "Retry",
        queryFail: "Query failed: ",
        noRows: "No matching rows",
        prev: "Previous",
        next: "Next",
        pageInfo: "Page {page} / {pages}",
        jump: "Jump",
        total: "{n} rows",
        copied: "Copied",
        copy: "Copy",
        close: "Close",
        drawerTitle: "{column} \xB7 row {row}",
        nullText: "NULL",
        emptyText: "empty",
        yes: "Yes",
        no: "No",
        json: "JSON",
        queryTime: "{n} ms",
        sortAsc: "ascending",
        sortDesc: "descending",
        filterCol: "Filter\u2026",
        filterClear: "Clear filter",
        index: "Table index",
        indexSub: "Tables owned by {domain} ({tables}): rows, columns, primary key, indexes and last write (read-only)",
        idxTable: "Table",
        idxRows: "Rows",
        idxCols: "Cols",
        idxKey: "Primary key",
        idxIndexes: "Indexes",
        idxLastWrite: "Last write",
        idxNone: "\u2014",
        idxEmpty: "No tables to index",
        idxTables: "Tables",
        idxAt: "Generated"
      }
    };
    module2.exports = COPY;
  }
});

// packages/addons/lib/data-style.cjs
var require_data_style = __commonJS({
  "packages/addons/lib/data-style.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function(DOMAIN, PREFIX) {
      var P = PREFIX + "-data";
      var CSS = [
        "." + P + "{--cfg-line:var(--wb-line,var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent)));--cfg-surface:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));--cfg-muted:var(--dsw-alias-label-secondary,color-mix(in oklab,currentColor 62%,transparent));--cfg-faint:var(--dsw-alias-label-tertiary,color-mix(in oklab,currentColor 42%,transparent));--cfg-hover:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent));display:grid;grid-template-columns:216px minmax(0,1fr);gap:16px;width:100%;min-width:0;color:inherit;font-size:13px;align-items:start}",
        "." + P + "-side{position:sticky;top:12px;display:flex;flex-direction:column;gap:3px;border:1px solid var(--cfg-line);border-radius:14px;background:var(--cfg-surface);padding:8px;box-shadow:0 1px 2px color-mix(in oklab,currentColor 3%,transparent)}",
        "." + P + "-sidetitle{display:flex;align-items:center;justify-content:space-between;padding:6px 10px 8px;font-size:11px;font-weight:660;letter-spacing:.6px;text-transform:uppercase;color:var(--cfg-faint)}",
        "." + P + "-stab{display:flex;flex-direction:column;gap:3px;align-items:stretch;border:1px solid transparent;background:transparent;border-radius:9px;padding:8px 10px;font:inherit;color:inherit;text-align:left;cursor:pointer;position:relative;transition:background .12s ease,border-color .12s ease}",
        "." + P + "-stab:hover{background:var(--cfg-hover)}",
        "." + P + "-stab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
        "." + P + "-stab.on{background:color-mix(in oklab,currentColor 6%,transparent);border-color:var(--cfg-line)}",
        "." + P + "-stab.on::before{content:'';position:absolute;left:-1px;top:9px;bottom:9px;width:2px;border-radius:2px;background:var(--dsw-alias-brand-primary,currentColor)}",
        "." + P + "-stabname{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;line-height:1.4;min-width:0}",
        "." + P + "-stabname span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
        "." + P + "-sidetable{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;color:var(--cfg-muted);margin-top:3px;letter-spacing:.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
        "." + P + "-sidecount{margin-left:auto;font-size:10.5px;font-variant-numeric:tabular-nums;color:var(--cfg-muted);background:color-mix(in oklab,currentColor 8%,transparent);border-radius:999px;padding:1px 7px;flex:none}",
        "." + P + "-main{display:flex;flex-direction:column;gap:10px;min-width:0;border:1px solid var(--cfg-line);border-radius:14px;background:var(--cfg-surface);padding:14px 16px 12px;box-shadow:0 1px 2px color-mix(in oklab,currentColor 3%,transparent)}",
        "." + P + "-head{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap}",
        "." + P + "-headmain{min-width:0;flex:1}",
        "." + P + "-head h2{margin:0;font-size:16px;font-weight:660;letter-spacing:.1px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
        "." + P + "-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;font-weight:500;color:var(--cfg-muted);background:color-mix(in oklab,currentColor 6%,transparent);border-radius:6px;padding:2px 6px}",
        "." + P + "-sub{font-size:11.5px;color:var(--cfg-muted);line-height:1.55;margin-top:4px}",
        "." + P + "-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:2px 0 4px}",
        "." + P + "-search{position:relative;flex:1;min-width:180px;max-width:340px}",
        "." + P + "-search input{width:100%;border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:9px;padding:8px 11px;font:inherit;font-size:12.5px;outline:none;transition:border-color .15s ease,box-shadow .15s ease}",
        "." + P + "-search input:hover{border-color:color-mix(in oklab,currentColor 28%,var(--cfg-line))}",
        "." + P + "-search input:focus{border-color:var(--dsw-alias-brand-primary,currentColor);box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 14%,transparent)}",
        "." + P + "-select{border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:9px;padding:7px 10px;font:inherit;font-size:12px;outline:none}",
        "." + P + "-select:focus{border-color:var(--dsw-alias-brand-primary,currentColor);box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 14%,transparent)}",
        "." + P + "-switch{position:relative;display:inline-flex;align-items:center;gap:7px;cursor:pointer;font-size:12px;color:var(--cfg-muted);user-select:none;padding:4px 2px}",
        "." + P + "-switch input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}",
        "." + P + "-track{position:relative;width:34px;height:20px;border-radius:999px;background:color-mix(in oklab,currentColor 18%,transparent);transition:background .16s ease;flex:none}",
        "." + P + "-track::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-primary,currentColor);transition:transform .16s ease,background .16s ease}",
        "." + P + "-switch input:checked+." + P + "-track{background:var(--dsw-alias-brand-primary,currentColor)}",
        "." + P + "-switch input:checked+." + P + "-track::after{transform:translateX(14px);background:var(--dsw-alias-label-primary-inverted,var(--dsw-alias-bg-base))}",
        "." + P + "-switch input:focus-visible+." + P + "-track{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
        "." + P + "-btn{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--cfg-line);background:transparent;color:var(--cfg-muted);border-radius:8px;padding:6px 10px;font:inherit;font-size:11.5px;cursor:pointer;white-space:nowrap;transition:background .12s ease,color .12s ease}",
        "." + P + "-btn:hover{background:var(--cfg-hover);color:var(--dsw-alias-label-primary,inherit)}",
        "." + P + "-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:2px}",
        "." + P + "-btn:disabled{opacity:.45;cursor:not-allowed}",
        "." + P + "-btn[aria-busy='true']{opacity:.6}",
        "." + P + "-tablewrap{overflow:auto;max-height:calc(100vh - 300px);border:1px solid var(--cfg-line);border-radius:11px;background:var(--dsw-alias-bg-base,transparent)}",
        "." + P + "-table{border-collapse:separate;border-spacing:0;width:max-content;min-width:100%;font-size:12.5px}",
        "." + P + "-table th{position:sticky;top:0;z-index:2;background:var(--cfg-surface);border-bottom:1px solid var(--cfg-line);padding:0;text-align:left;font-weight:600;white-space:nowrap}",
        "." + P + "-thbtn{display:flex;align-items:baseline;gap:6px;width:100%;border:0;background:transparent;color:inherit;font:inherit;font-size:11.5px;font-weight:660;letter-spacing:.2px;padding:9px 12px;cursor:pointer;text-align:left;white-space:nowrap}",
        "." + P + "-thbtn:hover{background:var(--cfg-hover)}",
        "." + P + "-thbtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:-2px}",
        "." + P + "-coltype{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;font-weight:500;color:var(--cfg-faint);letter-spacing:.3px}",
        "." + P + "-sortmark{color:var(--dsw-alias-brand-primary,currentColor);font-size:10px}",
        "." + P + "-rownum{position:sticky;left:0;z-index:1;background:var(--cfg-surface);color:var(--cfg-faint);text-align:right;font-variant-numeric:tabular-nums;font-size:10.5px;padding:0 8px;width:1%;white-space:nowrap;border-right:1px solid color-mix(in oklab,currentColor 7%,transparent)}",
        "." + P + "-table thead ." + P + "-rownum{z-index:3}",
        "." + P + "-cell{padding:7px 12px;border-bottom:1px solid color-mix(in oklab,currentColor 6%,transparent);max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:default;vertical-align:top}",
        "." + P + "-table tbody tr:hover ." + P + "-cell{background:var(--cfg-hover)}",
        "." + P + "-table tbody tr:nth-child(even) ." + P + "-cell,." + P + "-table tbody tr:nth-child(even) ." + P + "-rownum{background:color-mix(in oklab,currentColor 2.5%,transparent)}",
        "." + P + "-cell.num{text-align:right;font-variant-numeric:tabular-nums}",
        "." + P + "-cell.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}",
        "." + P + "-cell.null{color:var(--cfg-faint);font-style:italic}",
        "." + P + "-cell.json .v{color:var(--dsw-alias-brand-primary,inherit)}",
        "." + P + "-tr.deleted ." + P + "-cell,." + P + "-tr.deleted ." + P + "-rownum{opacity:.55}",
        "." + P + "-tr.deleted ." + P + "-cell .v{text-decoration:line-through;text-decoration-color:color-mix(in oklab,currentColor 35%,transparent)}",
        "." + P + "-delbadge{display:inline-block;margin-left:6px;font-size:9.5px;line-height:1.5;padding:0 5px;border-radius:999px;background:color-mix(in oklab,var(--dsw-alias-state-error-primary,currentColor) 14%,transparent);color:var(--dsw-alias-state-error-primary,inherit);vertical-align:middle}",
        "." + P + "-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:2px;font-size:11.5px;color:var(--cfg-muted)}",
        "." + P + "-grow{flex:1}",
        "." + P + "-pageinfo{font-variant-numeric:tabular-nums}",
        "." + P + "-jump{width:56px;border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:7px;padding:4px 7px;font:inherit;font-size:11.5px;text-align:right;outline:none}",
        "." + P + "-jump:focus{border-color:var(--dsw-alias-brand-primary,currentColor)}",
        "." + P + "-empty{border:1px dashed var(--cfg-line);border-radius:11px;padding:44px 16px;text-align:center;font-size:12.5px;color:var(--cfg-muted)}",
        "." + P + "-err{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border:1px solid color-mix(in oklab,var(--dsw-alias-state-error-primary,currentColor) 32%,var(--cfg-line));border-radius:10px;padding:9px 12px;color:var(--dsw-alias-state-error-primary,inherit);font-size:12px;line-height:1.5}",
        "." + P + "-skwrap{display:flex;flex-direction:column;gap:1px;padding:2px}",
        "." + P + "-sk{height:26px;border-radius:4px;background:var(--dsw-alias-bg-skeleton,color-mix(in oklab,currentColor 6%,transparent));animation:" + PREFIX + "-data-pulse 1.4s ease-in-out infinite}",
        "@keyframes " + PREFIX + "-data-pulse{0%,100%{opacity:.6}50%{opacity:1}}",
        "." + P + "-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:40;background:var(--dsw-alias-bg-layer-1,var(--cfg-surface));border:1px solid var(--cfg-line);border-radius:999px;padding:7px 14px;font-size:12px;color:var(--dsw-alias-label-primary,inherit);box-shadow:0 6px 24px color-mix(in oklab,currentColor 18%,transparent)}",
        "." + P + "-mask{position:fixed;inset:0;z-index:30;background:color-mix(in oklab,currentColor 26%,transparent)}",
        "." + P + "-drawer{position:fixed;top:0;right:0;bottom:0;z-index:31;width:min(520px,92vw);display:flex;flex-direction:column;gap:12px;background:var(--dsw-alias-bg-layer-1,var(--cfg-surface));border-left:1px solid var(--cfg-line);box-shadow:-8px 0 28px color-mix(in oklab,currentColor 16%,transparent);padding:18px 20px}",
        "." + P + "-drawer h3{margin:0;font-size:14px;font-weight:660;display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
        "." + P + "-drawer pre{margin:0;flex:1;overflow:auto;border:1px solid var(--cfg-line);border-radius:10px;background:var(--dsw-alias-bg-base,transparent);padding:12px 14px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.65;white-space:pre-wrap;word-break:break-word}",
        "." + P + "-drawerfoot{display:flex;gap:8px;justify-content:flex-end}",
        "." + P + "-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
        "@media (max-width:900px){." + P + "{grid-template-columns:minmax(0,1fr)}." + P + "-side{position:static;flex-direction:row;flex-wrap:wrap;gap:6px;padding:6px}." + P + "-sidetitle{display:none}." + P + "-stab{padding:6px 10px;flex:none}." + P + "-sidecount{display:none}." + P + "-tablewrap{max-height:calc(100vh - 260px)}}",
        "@media (prefers-reduced-motion:reduce){." + P + "-track,." + P + "-track::after,." + P + "-sk,." + P + "-drawer{transition:none;animation:none}}",
        "." + P + "-idxsub{font-size:11.5px;color:var(--cfg-muted);line-height:1.55}",
        "." + P + "-idxsum{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;color:var(--cfg-muted)}",
        "." + P + "-idxsum b{font-weight:660;color:var(--dsw-alias-label-primary,inherit);font-variant-numeric:tabular-nums}",
        "." + P + "-idxname{font-size:12.5px;font-weight:600}",
        "." + P + "-idxtags{display:flex;flex-wrap:wrap;gap:4px;max-width:280px}",
        "." + P + "-idxchip{display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:1.6;border-radius:999px;padding:0 7px;background:color-mix(in oklab,currentColor 7%,transparent);color:var(--cfg-muted);white-space:nowrap}",
        "." + P + "-idxchip.u{background:color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 15%,transparent);color:var(--dsw-alias-brand-primary,inherit)}",
        "." + P + "-idxnone{color:var(--cfg-faint)}",
        "." + P + "-frow th{padding:0 8px 6px;border-bottom:1px solid var(--cfg-line)}",
        "." + P + "-fcell{position:relative;display:block;min-width:96px}",
        "." + P + "-finput{width:100%;box-sizing:border-box;border:1px solid transparent;border-radius:6px;background:color-mix(in oklab,currentColor 4%,transparent);color:inherit;font:inherit;font-size:11.5px;padding:3px 18px 3px 6px;min-width:0}",
        "." + P + "-finput:hover{background:color-mix(in oklab,currentColor 7%,transparent)}",
        "." + P + "-finput:focus{outline:none;border-color:var(--dsw-alias-brand-primary,currentColor);background:var(--cfg-surface)}",
        "." + P + "-fclear{position:absolute;right:2px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:var(--cfg-muted);cursor:pointer;font-size:13px;line-height:1;padding:2px 4px;border-radius:4px}",
        "." + P + "-fclear:hover{color:inherit;background:var(--cfg-hover)}",
        "." + P + "-emptycell{padding:22px 12px;text-align:center;color:var(--cfg-muted)}",
        "." + P + " *{box-sizing:border-box}",
        "." + P + "-tabs{display:flex;gap:6px;border-bottom:1px solid var(--cfg-line);padding-bottom:9px}",
        "." + P + "-tabs [aria-selected=true]{background:var(--cfg-hover);color:inherit;font-weight:660}",
        "." + P + "-images{display:flex;gap:5px;align-items:center}",
        "." + P + "-images img{width:36px;height:36px;object-fit:cover;border-radius:5px}",
        "." + P + "-gallery{display:flex;flex-direction:column;gap:12px;overflow:auto;flex:1}",
        "." + P + "-gallery img{width:100%;height:auto;object-fit:contain;border-radius:8px}"
      ].join("\n");
      function injectCss() {
        if (typeof document === "undefined") return;
        var old = document.getElementById("wb-addon-" + DOMAIN + "-data-css");
        if (old) {
          old.textContent = CSS;
          return;
        }
        var style2 = document.createElement("style");
        style2.id = "wb-addon-" + DOMAIN + "-data-css";
        style2.setAttribute("data-wb-addon", "wb-addon-" + DOMAIN);
        style2.textContent = CSS;
        document.head.appendChild(style2);
      }
      return injectCss;
    };
  }
});

// packages/addons/lib/data-view.cjs
var require_data_view = __commonJS({
  "packages/addons/lib/data-view.cjs"(exports2, module2) {
    "use strict";
    var React = require("react");
    var h = React.createElement;
    var COPY = require_data_copy();
    module2.exports = function createDataView(options) {
      var DOMAIN = options.domain;
      var P = options.prefix + "-data";
      var configView = { useConfig: options.useConfig };
      var columnHooks = options.columns || {};
      var injectCss = require_data_style()(DOMAIN, options.prefix);
      var CFG_FALLBACK = {
        "data.pageSize": 50,
        "data.showSystemColumns": false,
        "data.includeDeleted": false
      };
      var PAGE_SIZES = [10, 25, 50, 100, 200];
      function unwrap(r) {
        return r && r.result !== void 0 ? r.result : r;
      }
      function fmt(template, vars) {
        return String(template).replace(/\{(\w+)\}/g, function(m, key) {
          return vars[key] === void 0 ? m : String(vars[key]);
        });
      }
      function pad2(n) {
        return n < 10 ? "0" + n : String(n);
      }
      function timeText(ms) {
        var d = new Date(Number(ms));
        if (!Number.isFinite(d.getTime())) return String(ms);
        return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
      }
      function looksJson(value) {
        var text = String(value).trim();
        if (!text || text[0] !== "{" && text[0] !== "[") return false;
        try {
          JSON.parse(text);
          return true;
        } catch (e) {
          return false;
        }
      }
      function rawText(value, col) {
        if (value === null || value === void 0) return "";
        return String(value);
      }
      function DataView(props) {
        var api = props.api;
        var lang = props.lang === "en" ? "en" : "zh";
        var t = Object.assign({}, COPY[lang], { indexSub: fmt(COPY[lang].indexSub, { tables: options.tables.join(" / "), domain: DOMAIN }) });
        var cfgWrap = configView.useConfig(api, CFG_FALLBACK);
        var cfg = cfgWrap.values;
        var tablesS = React.useState(null);
        var tables = tablesS[0], setTables = tablesS[1];
        var activeS = React.useState("");
        var active = activeS[0], setActive = activeS[1];
        var dataS = React.useState(null);
        var data = dataS[0], setData = dataS[1];
        var loadingS = React.useState(false);
        var loadingRows = loadingS[0], setLoadingRows = loadingS[1];
        var loadingTablesS = React.useState(true);
        var loadingTables = loadingTablesS[0], setLoadingTables = loadingTablesS[1];
        var errorS = React.useState("");
        var error = errorS[0], setError = errorS[1];
        var pageS = React.useState(1);
        var page = pageS[0], setPage = pageS[1];
        var sizeS = React.useState(0);
        var pageSize = sizeS[0], setPageSize = sizeS[1];
        var sortS = React.useState("");
        var sort = sortS[0], setSort = sortS[1];
        var orderS = React.useState("desc");
        var order = orderS[0], setOrder = orderS[1];
        var searchDraftS = React.useState("");
        var searchDraft = searchDraftS[0], setSearchDraft = searchDraftS[1];
        var searchS = React.useState("");
        var search = searchS[0], setSearch = searchS[1];
        var filterDraftS = React.useState({});
        var filterDraft = filterDraftS[0], setFilterDraft = filterDraftS[1];
        var filtersS = React.useState({});
        var filters = filtersS[0], setFilters = filtersS[1];
        var includeDeletedS = React.useState(null);
        var includeDeletedRaw = includeDeletedS[0], setIncludeDeleted = includeDeletedS[1];
        var showSystemS = React.useState(null);
        var showSystemRaw = showSystemS[0], setShowSystem = showSystemS[1];
        var drawerS = React.useState(null);
        var drawer = drawerS[0], setDrawer = drawerS[1];
        var toastS = React.useState("");
        var toast = toastS[0], setToast = toastS[1];
        var filtersKey = JSON.stringify(filters);
        var reqRef = React.useRef(0);
        var toastTimer = React.useRef(null);
        var refreshS = React.useState(0);
        function refresh() {
          loadTables();
          refreshS[1](function(n) {
            return n + 1;
          });
        }
        var indexReqRef = React.useRef(0);
        var indexS = React.useState(null);
        var index = indexS[0], setIndex = indexS[1];
        var indexBusyS = React.useState(false);
        var indexBusy = indexBusyS[0], setIndexBusy = indexBusyS[1];
        var cfgSize = Number(cfg["data.pageSize"]) || 50;
        var size = pageSize || (PAGE_SIZES.indexOf(cfgSize) >= 0 ? cfgSize : 50);
        var includeDeleted = includeDeletedRaw === null ? cfg["data.includeDeleted"] === true : includeDeletedRaw;
        var showSystem = showSystemRaw === null ? cfg["data.showSystemColumns"] === true : showSystemRaw;
        function say(text) {
          setToast(text);
          if (toastTimer.current) clearTimeout(toastTimer.current);
          toastTimer.current = setTimeout(function() {
            setToast("");
          }, 1600);
        }
        function loadTables() {
          setLoadingTables(true);
          Promise.resolve(api.call(DOMAIN + ".dataTables")).then(function(r) {
            if (r && r.ok === false) throw new Error(r && r.error || t.loadFail);
            var body = unwrap(r);
            if (!body || !Array.isArray(body.tables)) throw new Error(t.loadFail);
            setTables(body.tables);
            setError("");
            if (!active && body.tables.length) setActive(body.tables[0].name);
          }).catch(function(e) {
            setError(String(e && e.message || e) || t.loadFail);
          }).then(function() {
            setLoadingTables(false);
          });
        }
        React.useEffect(function() {
          injectCss();
          loadTables();
          return function() {
            indexReqRef.current++;
            if (toastTimer.current) clearTimeout(toastTimer.current);
          };
        }, []);
        function selectTable(name) {
          leaveIndex();
          if (name === active) return;
          reqRef.current++;
          setActive(name);
          setData(null);
          setDrawer(null);
          setError("");
          setLoadingRows(true);
          setPage(1);
          setSort("");
          setOrder("desc");
          setSearch("");
          setSearchDraft("");
          setFilterDraft({});
          setFilters({});
        }
        React.useEffect(function() {
          if (searchDraft === search) return void 0;
          var timer = setTimeout(function() {
            setSearch(searchDraft);
            setPage(1);
          }, 280);
          return function() {
            clearTimeout(timer);
          };
        }, [searchDraft]);
        React.useEffect(function() {
          if (JSON.stringify(filterDraft) === JSON.stringify(filters)) return void 0;
          var timer = setTimeout(function() {
            setFilters(filterDraft);
            setPage(1);
          }, 280);
          return function() {
            clearTimeout(timer);
          };
        }, [filterDraft]);
        React.useEffect(function() {
          if (!active || !cfgWrap.ready) return void 0;
          var req = ++reqRef.current;
          setLoadingRows(true);
          var args = { table: active, page, pageSize: size, order, includeDeleted };
          if (sort) args.sort = sort;
          if (search) args.search = search;
          if (Object.keys(filters).length) args.filters = filters;
          Promise.resolve(api.call(DOMAIN + ".dataQuery", args)).then(function(r) {
            if (req !== reqRef.current) return;
            if (r && r.ok === false) throw new Error(r && r.error || t.queryFail);
            var body = unwrap(r);
            if (!body) throw new Error(t.queryFail);
            setData(body);
            setError("");
            if (body.page !== page) setPage(body.page);
          }).catch(function(e) {
            if (req !== reqRef.current) return;
            setError(String(e && e.message || e) || t.queryFail);
          }).then(function() {
            if (req === reqRef.current) setLoadingRows(false);
          });
          return function() {
            reqRef.current++;
          };
        }, [active, page, size, sort, order, search, includeDeleted, cfgWrap.ready, filtersKey, refreshS[0]]);
        React.useEffect(function() {
          if (!drawer) return void 0;
          function onKey(e) {
            if (e.key === "Escape") setDrawer(null);
          }
          document.addEventListener("keydown", onKey);
          return function() {
            document.removeEventListener("keydown", onKey);
          };
        }, [drawer]);
        var current = null;
        if (tables) {
          for (var i = 0; i < tables.length; i++) if (tables[i].name === active) current = tables[i];
        }
        function leaveIndex() {
          indexReqRef.current++;
          setIndex(null);
          setIndexBusy(false);
        }
        function loadIndex() {
          var req = ++indexReqRef.current;
          setIndex([]);
          setIndexBusy(true);
          Promise.resolve(api.call(DOMAIN + ".dataTables", { stats: true })).then(function(r) {
            if (req !== indexReqRef.current) return;
            if (r && r.ok === false) throw new Error(r.error || t.loadFail);
            var payload = unwrap(r) || {};
            var rows = (payload.tables || []).map(function(tb) {
              return { table: tb, stats: tb.stats || null };
            });
            setIndex(rows);
            setError("");
            setIndexBusy(false);
          }).catch(function(e) {
            if (req !== indexReqRef.current) return;
            setError(String(e.message || e));
            setIndex([]);
            setIndexBusy(false);
          });
        }
        function toggleIndex() {
          if (index) {
            leaveIndex();
            return;
          }
          loadIndex();
        }
        function renderIndex() {
          var rows = index || [];
          var totalRows = rows.reduce(function(n, r) {
            return n + (r.stats && Number(r.stats.rows) || 0);
          }, 0);
          return h(
            "div",
            { className: P + "-idx" },
            h(
              "div",
              { className: P + "-head" },
              h(
                "div",
                { className: P + "-headmain" },
                h("h2", null, t.index, h("span", { className: P + "-code" }, "index")),
                h("div", { className: P + "-idxsub" }, t.indexSub)
              ),
              h("button", {
                type: "button",
                className: P + "-btn",
                "aria-busy": indexBusy ? "true" : "false",
                onClick: function() {
                  loadIndex();
                }
              }, t.refresh)
            ),
            h(
              "div",
              { className: P + "-idxsum" },
              h("span", null, t.idxTables, " ", h("b", null, String(rows.length))),
              h("span", null, t.idxRows, " ", h("b", null, String(totalRows)))
            ),
            indexBusy && !rows.length ? h("div", { className: P + "-empty" }, t.loading) : !rows.length ? h("div", { className: P + "-empty" }, t.idxEmpty) : h(
              "div",
              { className: P + "-tablewrap" },
              h(
                "table",
                { className: P + "-table" },
                h("thead", null, h(
                  "tr",
                  null,
                  h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxTable)),
                  h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxRows)),
                  h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxCols)),
                  h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxKey)),
                  h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxIndexes)),
                  h("th", { scope: "col" }, h("span", { className: P + "-thbtn" }, t.idxLastWrite))
                )),
                h("tbody", null, rows.map(function(row) {
                  var st = row.stats || {};
                  var pk = (st.primaryKey || []).join(", ");
                  var indexes = st.indexes || [];
                  return h(
                    "tr",
                    { className: P + "-tr", key: row.table.name },
                    h(
                      "td",
                      { className: P + "-cell" },
                      h("div", { className: P + "-idxname" }, tableLabel(row.table)),
                      h("div", { className: P + "-sidetable" }, row.table.name)
                    ),
                    h("td", { className: P + "-cell num" }, String(st.rows === void 0 ? row.table.count : st.rows)),
                    h("td", { className: P + "-cell num" }, String(st.columnCount || (row.table.columns || []).length)),
                    h("td", { className: P + "-cell" }, pk ? h("span", { className: P + "-idxchip u" }, pk) : h("span", { className: P + "-idxnone" }, t.idxNone)),
                    h("td", { className: P + "-cell" }, h("div", { className: P + "-idxtags" }, indexes.length ? indexes.map(function(ix) {
                      return h("span", {
                        key: ix.name,
                        title: ix.name + " (" + (ix.columns || []).join(", ") + ")",
                        className: P + "-idxchip" + (ix.unique ? " u" : "")
                      }, (ix.columns || []).join(",") || ix.name);
                    }) : h("span", { className: P + "-idxnone" }, t.idxNone))),
                    h("td", { className: P + "-cell mono" }, st.lastWrite ? timeText(st.lastWrite.at) : h("span", { className: P + "-idxnone" }, t.idxNone))
                  );
                }))
              )
            )
          );
        }
        function tableLabel(tb) {
          if (!tb || !tb.label) return "";
          return lang === "en" ? tb.label.en || tb.label.zh : tb.label.zh || tb.label.en;
        }
        function colLabel(col) {
          if (!col.label) return col.name;
          return lang === "en" ? col.label.en || col.label.zh : col.label.zh || col.label.en;
        }
        function visibleColumns() {
          var cols = data && data.columns ? data.columns.map(function(col) {
            var hook = columnHooks[col.name];
            return hook && hook.kind ? Object.assign({}, col, { kind: hook.kind, type: hook.type || col.type }) : col;
          }) : [];
          return cols.filter(function(c) {
            return showSystem || !c.system;
          });
        }
        function toggleSort(name) {
          if (sort !== name) {
            setSort(name);
            setOrder("desc");
            return;
          }
          if (order === "desc") {
            setOrder("asc");
            return;
          }
          setSort("");
          setOrder("desc");
        }
        function ariaSort(name) {
          if (sort !== name) return "none";
          return order === "asc" ? "ascending" : "descending";
        }
        function copyCell(value) {
          var text = value === null || value === void 0 ? "" : String(value);
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
            else {
              var ta = document.createElement("textarea");
              ta.value = text;
              ta.style.position = "fixed";
              ta.style.opacity = "0";
              document.body.appendChild(ta);
              ta.select();
              document.execCommand("copy");
              document.body.removeChild(ta);
            }
            say(t.copied);
          } catch (e) {
          }
        }
        function cellText(col, value) {
          if (value === null || value === void 0) return null;
          if (col.kind === "bool") return value ? t.yes : t.no;
          if (col.kind === "timestamp") return timeText(value);
          return String(value);
        }
        function cellClass(col, value) {
          var cls = P + "-cell";
          if (value === null || value === void 0) return cls + " null";
          if (col.kind === "number") return cls + " num";
          if (col.kind === "id" || col.kind === "path") return cls + " mono";
          if (col.kind === "text" && looksJson(value)) return cls + " json";
          return cls;
        }
        function cellTitle(col, value) {
          if (value === null || value === void 0) return t.nullText;
          if (col.kind === "timestamp") return String(value);
          if (col.kind === "bool") return value ? "1" : "0";
          return String(value);
        }
        function renderCell(row, col) {
          var value = row[col.name];
          var hook = columnHooks[col.name];
          function openDetail() {
            setDrawer({ column: colLabel(col), name: col.name, row: (data.page - 1) * data.pageSize + row.__i + 1, value });
          }
          var text = cellText(col, value);
          var content;
          if (text === null) content = h("span", { className: "v" }, t.nullText);
          else if (text === "") content = h("span", { className: "v" }, '""');
          else content = h("span", { className: "v" }, text);
          if (hook && hook.render) content = hook.render({ value, row, col, lang, prefix: P, openDetail });
          return h("td", {
            key: col.name,
            className: cellClass(col, value),
            title: cellTitle(col, value),
            onClick: function() {
              copyCell(value);
            },
            onDoubleClick: openDetail
          }, content);
        }
        function activeFilterCount() {
          var n = 0;
          for (var k in filters) if (Object.prototype.hasOwnProperty.call(filters, k)) n++;
          return n;
        }
        function filterCell(col) {
          var val = filterDraft[col.name] === void 0 ? "" : filterDraft[col.name];
          return h(
            "th",
            { key: col.name, scope: "col", className: P + "-fth" },
            h(
              "span",
              { className: P + "-fcell" },
              h("input", {
                className: P + "-finput",
                type: "search",
                value: val,
                placeholder: t.filterCol,
                "aria-label": t.filterCol + " " + colLabel(col),
                title: colLabel(col) + " \xB7 " + t.filterCol,
                onChange: function(e) {
                  var v = e.target.value;
                  setFilterDraft(function(prev) {
                    var next = Object.assign({}, prev);
                    if (v) next[col.name] = v;
                    else delete next[col.name];
                    return next;
                  });
                }
              }),
              val ? h("button", {
                type: "button",
                className: P + "-fclear",
                title: t.filterClear,
                "aria-label": t.filterClear + " " + colLabel(col),
                onClick: function() {
                  setFilterDraft(function(prev) {
                    var next = Object.assign({}, prev);
                    delete next[col.name];
                    return next;
                  });
                }
              }, "\xD7") : null
            )
          );
        }
        function renderRows() {
          if (loadingRows && !data) {
            return h(
              "div",
              { className: P + "-skwrap", "aria-busy": "true" },
              h("span", { className: P + "-sr" }, t.loading),
              [0, 1, 2, 3, 4, 5, 6, 7].map(function(i2) {
                return h("div", { key: i2, className: P + "-sk" });
              })
            );
          }
          if (error) {
            return h(
              "div",
              { className: P + "-err", role: "alert" },
              h("span", null, t.queryFail + error),
              h("button", { type: "button", className: P + "-btn", onClick: refresh }, t.retry)
            );
          }
          if (!data) return h("div", { className: P + "-empty" }, t.empty);
          var cols = visibleColumns();
          var rows = data.rows || [];
          var narrowing = !!search || activeFilterCount() > 0;
          return h(
            "div",
            { className: P + "-tablewrap" },
            h(
              "table",
              { className: P + "-table" },
              h(
                "thead",
                null,
                h(
                  "tr",
                  null,
                  h("th", { className: P + "-rownum", scope: "col" }, "#"),
                  cols.map(function(col) {
                    return h(
                      "th",
                      { key: col.name, scope: "col", "aria-sort": ariaSort(col.name) },
                      h(
                        "button",
                        {
                          type: "button",
                          className: P + "-thbtn",
                          title: colLabel(col) + " \xB7 " + col.type,
                          onClick: function() {
                            toggleSort(col.name);
                          }
                        },
                        h("span", null, colLabel(col)),
                        h("span", { className: P + "-coltype" }, String(col.type || "").toLowerCase()),
                        sort === col.name ? h("span", { className: P + "-sortmark", "aria-hidden": "true" }, order === "asc" ? "\u25B2" : "\u25BC") : null
                      )
                    );
                  })
                ),
                h(
                  "tr",
                  { className: P + "-frow" },
                  h("th", { className: P + "-rownum", scope: "col" }, ""),
                  cols.map(filterCell)
                )
              ),
              h("tbody", null, rows.length ? rows.map(function(row, idx) {
                row.__i = idx;
                var deleted = row.deleted_at !== null && row.deleted_at !== void 0;
                return h(
                  "tr",
                  { key: row.id || idx, className: P + "-tr" + (deleted ? " deleted" : "") },
                  h("td", { className: P + "-rownum" }, (data.page - 1) * data.pageSize + idx + 1),
                  cols.map(function(col) {
                    var cell = renderCell(row, col);
                    if (deleted && col.name === "id") {
                      return React.cloneElement(cell, { key: col.name }, cell.props.children, h("span", { className: P + "-delbadge" }, t.deleted));
                    }
                    return cell;
                  })
                );
              }) : h("tr", null, h("td", { className: P + "-emptycell", colSpan: cols.length + 1 }, narrowing ? t.noRows : t.empty)))
            )
          );
        }
        function renderFoot() {
          var pages = data ? data.pages : 1;
          var total = data ? data.total : 0;
          return h(
            "div",
            { className: P + "-foot" },
            h("span", null, fmt(t.total, { n: total })),
            h("span", { className: P + "-grow" }),
            h("button", { type: "button", className: P + "-btn", disabled: !data || page <= 1, onClick: function() {
              setPage(Math.max(1, page - 1));
            } }, "\u2039 " + t.prev),
            h("span", { className: P + "-pageinfo" }, fmt(t.pageInfo, { page: data ? data.page : 1, pages })),
            h("button", { type: "button", className: P + "-btn", disabled: !data || page >= pages, onClick: function() {
              setPage(Math.min(pages, page + 1));
            } }, t.next + " \u203A"),
            h("input", {
              className: P + "-jump",
              type: "number",
              min: 1,
              max: pages,
              "aria-label": t.jump,
              onKeyDown: function(e) {
                if (e.key === "Enter") {
                  var n = Math.floor(Number(e.target.value));
                  if (n >= 1) setPage(Math.min(pages, n));
                }
              }
            }),
            h("span", null, fmt(t.queryTime, { n: data ? data.queryMs : 0 }))
          );
        }
        if (!tables && loadingTables) {
          return h("div", { className: P + "-skwrap", "aria-busy": "true" }, h("span", { className: P + "-sr" }, t.loading), [0, 1, 2, 3].map(function(i2) {
            return h("div", { key: i2, className: P + "-sk" });
          }));
        }
        if (!tables) {
          return h("div", { className: P + "-err", role: "alert" }, h("span", null, t.loadFail), h("button", { type: "button", className: P + "-btn", onClick: loadTables }, t.retry));
        }
        if (!tables.length) return h("div", { className: P + "-empty" }, t.emptyTable);
        return h(
          "div",
          { className: P },
          h(
            "div",
            { className: P + "-side" },
            h("div", { className: P + "-sidetitle" }, h("span", null, t.tables), h("span", null, String(tables.length))),
            tables.map(function(tb) {
              return h(
                "button",
                {
                  key: tb.name,
                  type: "button",
                  className: P + "-stab" + (tb.name === active ? " on" : ""),
                  "aria-pressed": tb.name === active,
                  onClick: function() {
                    selectTable(tb.name);
                  }
                },
                h(
                  "span",
                  { className: P + "-stabname" },
                  h("span", null, tableLabel(tb)),
                  h("span", { className: P + "-sidecount" }, String(tb.count))
                ),
                h("span", { className: P + "-sidetable" }, tb.name),
                tb.deletedCount ? h("span", { className: P + "-sidetable" }, tb.deletedCount + " " + t.deleted) : null
              );
            }),
            h(
              "button",
              {
                type: "button",
                className: P + "-stab" + (index ? " on" : ""),
                "aria-pressed": !!index,
                onClick: toggleIndex
              },
              h(
                "span",
                { className: P + "-stabname" },
                h("span", null, t.index),
                h("span", { className: P + "-sidecount" }, index ? String(index.length) : "")
              ),
              h("span", { className: P + "-sidetable" }, "index")
            )
          ),
          h(
            "div",
            { className: P + "-main" },
            h(
              "div",
              { className: P + "-tabs", role: "tablist", "aria-label": t.title },
              h("button", { type: "button", role: "tab", className: P + "-btn", "aria-selected": !index, onClick: leaveIndex }, lang === "en" ? "Row data" : "\u884C\u6570\u636E"),
              h("button", { type: "button", role: "tab", className: P + "-btn", "aria-selected": !!index, onClick: loadIndex }, t.index)
            ),
            index && error ? h("div", { className: P + "-err", role: "alert" }, error) : null,
            index ? renderIndex() : [
              h(
                "div",
                { className: P + "-head" },
                h(
                  "div",
                  { className: P + "-headmain" },
                  h("h2", null, tableLabel(current), h("span", { className: P + "-code" }, active)),
                  h(
                    "div",
                    { className: P + "-sub" },
                    current ? fmt(t.rowCount, { n: current.count }) : "",
                    current && current.deletedCount ? " \xB7 " + fmt(t.deletedCount, { n: current.deletedCount }) : "",
                    " \xB7 " + t.subtitle
                  )
                ),
                h("button", {
                  type: "button",
                  className: P + "-btn",
                  "aria-busy": loadingRows ? "true" : "false",
                  onClick: refresh
                }, t.refresh)
              ),
              h(
                "div",
                { className: P + "-toolbar" },
                h(
                  "div",
                  { className: P + "-search" },
                  h("input", {
                    type: "search",
                    value: searchDraft,
                    placeholder: t.search,
                    "aria-label": t.search,
                    onChange: function(e) {
                      setSearchDraft(e.target.value);
                    }
                  })
                ),
                h(
                  "label",
                  { className: P + "-switch" },
                  h("input", { type: "checkbox", checked: includeDeleted, onChange: function(e) {
                    setIncludeDeleted(e.target.checked);
                    setPage(1);
                  } }),
                  h("span", { className: P + "-track" }),
                  h("span", null, t.includeDeleted)
                ),
                h(
                  "label",
                  { className: P + "-switch" },
                  h("input", { type: "checkbox", checked: showSystem, onChange: function(e) {
                    setShowSystem(e.target.checked);
                  } }),
                  h("span", { className: P + "-track" }),
                  h("span", null, t.showSystem)
                ),
                h("span", { className: P + "-grow" }),
                h(
                  "label",
                  { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--cfg-muted)" } },
                  h("span", null, t.pageSize),
                  h("select", {
                    className: P + "-select",
                    value: size,
                    onChange: function(e) {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }
                  }, PAGE_SIZES.map(function(n) {
                    return h("option", { key: n, value: n }, String(n));
                  }))
                )
              ),
              renderRows(),
              renderFoot()
            ]
          ),
          drawer ? h(
            "div",
            null,
            h("div", { className: P + "-mask", onClick: function() {
              setDrawer(null);
            } }),
            h(
              "aside",
              { className: P + "-drawer", role: "dialog", "aria-modal": "true", "aria-label": drawer.column },
              h("h3", null, fmt(t.drawerTitle, { column: drawer.column, row: drawer.row }), h("span", { className: P + "-code" }, drawer.name)),
              columnHooks[drawer.name] && columnHooks[drawer.name].detail ? columnHooks[drawer.name].detail({ value: drawer.value, lang, prefix: P }) : h("pre", null, drawerText(drawer.value)),
              h(
                "div",
                { className: P + "-drawerfoot" },
                h("button", { type: "button", className: P + "-btn", onClick: function() {
                  copyCell(drawer.value);
                } }, t.copy),
                h("button", { type: "button", className: P + "-btn", onClick: function() {
                  setDrawer(null);
                } }, t.close)
              )
            )
          ) : null,
          toast ? h("div", { className: P + "-toast", role: "status" }, toast) : null
        );
      }
      function drawerText(value) {
        if (value === null || value === void 0) return "NULL";
        if (typeof value === "string" && looksJson(value)) {
          try {
            return JSON.stringify(JSON.parse(value), null, 2);
          } catch (e) {
            return value;
          }
        }
        if (typeof value === "object") {
          try {
            return JSON.stringify(value, null, 2);
          } catch (e) {
            return String(value);
          }
        }
        return String(value);
      }
      return { DataView, DOMAIN };
    };
  }
});

// packages/addons/storage/client/data-columns.cjs
var require_data_columns = __commonJS({
  "packages/addons/storage/client/data-columns.cjs"(exports2, module2) {
    "use strict";
    var h = require("react").createElement;
    var safeImage = require_ui().safeImage;
    function images(value) {
      try {
        var list = typeof value === "string" ? JSON.parse(value) : value;
        if (!Array.isArray(list) || !list.length) return [];
        var urls = list.map(function(url) {
          return typeof url === "string" ? safeImage(url) : "";
        });
        return urls.every(Boolean) ? urls : [];
      } catch (_) {
        return [];
      }
    }
    function text(value) {
      return value == null ? "NULL" : String(value);
    }
    function picture(url, index, lang) {
      return h("img", { key: index, src: url, alt: (lang === "en" ? "Image " : "\u56FE\u7247 ") + (index + 1), loading: "lazy", referrerPolicy: "no-referrer" });
    }
    module2.exports = {
      img_list: {
        render: function(ctx) {
          var urls = images(ctx.value);
          if (!urls.length) return h("span", { className: "v" }, text(ctx.value));
          return h(
            "button",
            {
              type: "button",
              className: ctx.prefix + "-btn " + ctx.prefix + "-images",
              "aria-label": (ctx.lang === "en" ? "Preview images: " : "\u9884\u89C8\u56FE\u7247\uFF1A") + urls.length,
              onClick: function(e) {
                e.stopPropagation();
                ctx.openDetail();
              }
            },
            urls.slice(0, 3).map(function(url, i) {
              return picture(url, i, ctx.lang);
            }),
            urls.length > 3 ? h("span", null, "+" + (urls.length - 3)) : null
          );
        },
        detail: function(ctx) {
          var urls = images(ctx.value);
          return urls.length ? h("div", { className: ctx.prefix + "-gallery" }, urls.map(function(url, i) {
            return picture(url, i, ctx.lang);
          })) : h("pre", null, text(ctx.value));
        }
      },
      stock: {
        kind: "text",
        type: "TEXT",
        render: function(ctx) {
          return h("span", { className: "v" }, text(ctx.value));
        }
      },
      remark: {
        render: function(ctx) {
          var value = text(ctx.value);
          return h("span", { className: "v", title: value }, value.length > 80 ? value.slice(0, 80) + "\u2026" : value);
        }
      }
    };
  }
});

// packages/addons/storage/client/data.cjs
var require_data = __commonJS({
  "packages/addons/storage/client/data.cjs"(exports2, module2) {
    "use strict";
    module2.exports = require_data_view()({
      domain: "storage",
      prefix: "wbi",
      tables: ["storage"],
      useConfig: require_config().useConfig,
      columns: require_data_columns()
    });
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
    version: "1.2.0",
    views: [
      { id: "stats", title: { zh: "\u7EDF\u8BA1", en: "Statistics" }, component: require_stats().Stats },
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
