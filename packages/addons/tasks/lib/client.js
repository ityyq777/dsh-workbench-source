// 由 scripts/build-addon-clients.mjs 生成；请修改 client/client.src.cjs 后重新构建。
window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
window.__ModuleLoader__.load({
  id: "dsh-workbench-tasks",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/addons/tasks/client/charts.cjs
var require_charts = __commonJS({
  "packages/addons/tasks/client/charts.cjs"(exports2, module2) {
    var React2 = require("react");
    var h2 = React2.createElement;
    var COLORS = [
      "var(--dsw-alias-state-business-primary, #4f6ef7)",
      "var(--dsw-alias-state-success-primary, #2f9e6e)",
      "var(--dsw-alias-state-warn-primary, #d99100)",
      "var(--dsw-alias-state-error-primary, #d9534f)",
      "var(--dsw-alias-state-done-primary, #7c5cff)",
      "var(--dsw-alias-state-idle-primary, #8f959e)"
    ];
    function css(prefix) {
      return [
        ".@-stats{display:flex;flex-direction:column;gap:14px;padding:4px 2px 24px;color:var(--dsw-alias-label-primary,#1f2329)}",
        ".@-stoolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
        ".@-seg{display:inline-flex;border:1px solid var(--dsw-alias-border-l2,#e5e6eb);border-radius:9px;overflow:hidden;background:var(--dsw-alias-bg-layer-1,#fff)}",
        ".@-seg button{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary,#646a73);font-size:12px;padding:6px 10px;cursor:pointer;white-space:nowrap}",
        ".@-seg button.@-on{background:var(--dsw-alias-brand-primary,#4f6ef7);color:var(--dsw-alias-label-primary-inverted,#fff)}",
        ".@-ghost{appearance:none;border:1px solid var(--dsw-alias-border-l2,#e5e6eb);background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-secondary,#646a73);border-radius:8px;font-size:12px;padding:6px 10px;cursor:pointer}",
        ".@-ghost:hover{border-color:var(--dsw-alias-brand-primary,#4f6ef7);color:var(--dsw-alias-brand-primary,#4f6ef7)}",
        ".@-muted{color:var(--dsw-alias-label-tertiary,#8f959e);font-size:12px}",
        ".@-sgrid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}",
        ".@-scard{grid-column:span 6;min-width:0;background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#e5e6eb);border-radius:12px;padding:14px 16px}",
        ".@-span-3{grid-column:span 3}.@-span-4{grid-column:span 4}.@-span-6{grid-column:span 6}.@-span-8{grid-column:span 8}.@-span-12{grid-column:span 12}",
        ".@-chead{display:flex;align-items:baseline;gap:8px;margin-bottom:10px;flex-wrap:wrap}",
        ".@-ctitle{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#1f2329)}",
        ".@-cnote{font-size:11px;color:var(--dsw-alias-label-tertiary,#8f959e)}",
        ".@-kpis{grid-column:span 12;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}",
        ".@-kpi{background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#e5e6eb);border-radius:12px;padding:12px 14px;min-width:0}",
        ".@-kpi-l{font-size:12px;color:var(--dsw-alias-label-tertiary,#8f959e);display:flex;align-items:center;gap:6px}",
        ".@-kpi-v{font-size:26px;line-height:1.25;font-weight:650;margin-top:4px;font-variant-numeric:tabular-nums}",
        ".@-kpi-u{font-size:12px;font-weight:400;color:var(--dsw-alias-label-tertiary,#8f959e);margin-left:3px}",
        ".@-kpi-h{font-size:11px;color:var(--dsw-alias-label-tertiary,#8f959e);margin-top:3px}",
        ".@-kpi.@-danger .@-kpi-v{color:var(--dsw-alias-state-error-primary,#d9534f)}",
        ".@-kpi.@-warn .@-kpi-v{color:var(--dsw-alias-state-warn-primary,#d99100)}",
        ".@-kpi.@-ok .@-kpi-v{color:var(--dsw-alias-state-success-primary,#2f9e6e)}",
        ".@-donut{display:flex;align-items:center;gap:16px;flex-wrap:wrap}",
        ".@-donut svg{flex:0 0 auto}",
        ".@-legend{display:flex;flex-direction:column;gap:7px;min-width:120px;flex:1}",
        ".@-leg{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--dsw-alias-label-secondary,#646a73)}",
        ".@-dot{width:8px;height:8px;border-radius:50%;flex:0 0 auto}",
        ".@-leg b{margin-left:auto;font-weight:600;color:var(--dsw-alias-label-primary,#1f2329);font-variant-numeric:tabular-nums}",
        ".@-bars{display:flex;flex-direction:column;gap:9px}",
        ".@-bar{display:grid;grid-template-columns:minmax(72px,1.2fr) 3fr auto;gap:8px;align-items:center;font-size:12px}",
        ".@-bar-l{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary,#646a73)}",
        ".@-bar-t{display:block;height:8px;border-radius:6px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);overflow:hidden}",
        ".@-bar-f{display:block;height:100%;border-radius:6px;background:var(--dsw-alias-state-business-primary,#4f6ef7);min-width:2px}",
        ".@-bar-v{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary,#1f2329);font-weight:600;min-width:34px;text-align:right}",
        ".@-stack{display:flex;flex-direction:column;gap:10px}",
        ".@-srow-l{font-size:12px;color:var(--dsw-alias-label-secondary,#646a73);margin-bottom:4px;display:flex}",
        ".@-srow-l b{margin-left:auto;color:var(--dsw-alias-label-primary,#1f2329);font-variant-numeric:tabular-nums}",
        ".@-strack{display:flex;height:10px;border-radius:6px;overflow:hidden;background:var(--dsw-alias-bg-skeleton,#f2f3f5)}",
        ".@-seg-f{height:100%}",
        ".@-hist{display:flex;align-items:flex-end;gap:8px;height:150px;padding-top:16px}",
        ".@-hbar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:5px;min-width:0;height:100%}",
        ".@-hbar-v{font-size:11px;color:var(--dsw-alias-label-secondary,#646a73);font-variant-numeric:tabular-nums}",
        ".@-hbar-f{width:100%;max-width:44px;border-radius:5px 5px 0 0;background:var(--dsw-alias-state-business-primary,#4f6ef7);min-height:2px}",
        ".@-hbar-l{font-size:11px;color:var(--dsw-alias-label-tertiary,#8f959e);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}",
        ".@-trend{width:100%;height:auto;display:block}",
        ".@-tlegend{display:flex;gap:14px;flex-wrap:wrap;margin-top:6px;font-size:11px;color:var(--dsw-alias-label-tertiary,#8f959e)}",
        ".@-table{width:100%;border-collapse:collapse;font-size:12px}",
        ".@-table th{text-align:left;font-weight:500;color:var(--dsw-alias-label-tertiary,#8f959e);padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5e6eb);white-space:nowrap}",
        ".@-table td{padding:7px 8px;border-bottom:1px solid var(--dsw-alias-border-l1,#f2f3f5);color:var(--dsw-alias-label-secondary,#646a73);vertical-align:top}",
        ".@-table tr:last-child td{border-bottom:0}",
        ".@-table td.@-num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}",
        ".@-empty{padding:26px 8px;text-align:center;color:var(--dsw-alias-label-tertiary,#8f959e);font-size:12px}",
        ".@-err{display:flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d9534f) 8%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary,#d9534f) 30%,transparent);color:var(--dsw-alias-state-error-primary,#d9534f);border-radius:10px;padding:10px 12px;font-size:12px}",
        ".@-warn{grid-column:span 12;border:1px dashed var(--dsw-alias-state-warn-primary,#d99100);border-radius:10px;padding:9px 12px;font-size:12px;color:var(--dsw-alias-state-warn-primary,#d99100);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#d99100) 6%,transparent)}",
        ".@-sk{height:14px;border-radius:6px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);margin:7px 0;animation:@-pulse 1.2s ease-in-out infinite}",
        "@keyframes @-pulse{0%,100%{opacity:.55}50%{opacity:1}}",
        "@media (max-width:900px){.@-scard{grid-column:span 12}.@-span-3,.@-span-4,.@-span-6,.@-span-8{grid-column:span 12}.@-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}",
        "@media (max-width:600px){.@-stats{padding-bottom:16px}.@-hist{height:130px}.@-kpi-v{font-size:22px}}",
        "@media (prefers-reduced-motion:reduce){.@-sk{animation:none}}"
      ].join("\n").replace(/@-/g, prefix + "-");
    }
    function makeCharts(prefix) {
      if (typeof document !== "undefined" && !document.getElementById(prefix + "-charts-css")) {
        var el = document.createElement("style");
        el.id = prefix + "-charts-css";
        el.textContent = css(prefix);
        document.head.appendChild(el);
      }
      function num(lang, n) {
        var v = Number(n);
        if (!isFinite(v)) return "\u2014";
        try {
          return new Intl.NumberFormat(lang === "en" ? "en-US" : "zh-CN").format(v);
        } catch (e) {
          return String(v);
        }
      }
      function pct(v, digits) {
        if (v === null || v === void 0 || !isFinite(Number(v))) return "\u2014";
        return (Number(v) * 100).toFixed(digits === void 0 ? 1 : digits) + "%";
      }
      function timeText(ms) {
        if (!ms) return "";
        var d = new Date(Number(ms));
        function p(n) {
          return String(n).padStart(2, "0");
        }
        return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
      }
      function dateText(ms) {
        if (!ms) return "\u2014";
        var d = new Date(Number(ms));
        function p(n) {
          return String(n).padStart(2, "0");
        }
        return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
      }
      function Card(props) {
        var cls = prefix + "-scard" + (props.span ? " " + prefix + "-span-" + props.span : "");
        return h2(
          "section",
          { className: cls },
          props.title || props.right ? h2(
            "div",
            { className: prefix + "-chead" },
            h2("span", { className: prefix + "-ctitle" }, props.title),
            props.note ? h2("span", { className: prefix + "-cnote" }, props.note) : null,
            props.right ? h2("span", { style: { marginLeft: "auto" } }, props.right) : null
          ) : null,
          props.children
        );
      }
      function Kpi(props) {
        var tone = props.tone ? " " + prefix + "-" + props.tone : "";
        return h2(
          "div",
          { className: prefix + "-kpi" + tone },
          h2("div", { className: prefix + "-kpi-l" }, props.label),
          h2(
            "div",
            { className: prefix + "-kpi-v" },
            props.value === null || props.value === void 0 ? "\u2014" : typeof props.value === "number" ? num(props.lang, props.value) : props.value,
            props.unit ? h2("span", { className: prefix + "-kpi-u" }, props.unit) : null
          ),
          props.hint ? h2("div", { className: prefix + "-kpi-h" }, props.hint) : null
        );
      }
      function Donut(props) {
        var data = (props.data || []).filter(function(d) {
          return Number(d.count) > 0;
        });
        var total = Number(props.total || 0);
        var size = props.size || 168;
        var r = size / 2 - 16;
        var c = 2 * Math.PI * r;
        var offset = 0;
        var aria = props.aria || data.map(function(d) {
          return d.label + " " + d.count;
        }).join("\uFF0C");
        return h2(
          "div",
          { className: prefix + "-donut" },
          h2(
            "svg",
            { width: size, height: size, viewBox: "0 0 " + size + " " + size, role: "img", "aria-label": aria },
            h2("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "var(--dsw-alias-bg-skeleton,#f2f3f5)", strokeWidth: 18 }),
            total > 0 ? data.map(function(d, i) {
              var len = Number(d.count) / total * c;
              var seg = h2("circle", {
                key: d.key || d.label || i,
                cx: size / 2,
                cy: size / 2,
                r,
                fill: "none",
                stroke: d.color || COLORS[i % COLORS.length],
                strokeWidth: 18,
                strokeDasharray: len + " " + (c - len),
                strokeDashoffset: -offset,
                transform: "rotate(-90 " + size / 2 + " " + size / 2 + ")",
                strokeLinecap: "butt"
              }, h2("title", null, d.label + "\uFF1A" + d.count));
              offset += len;
              return seg;
            }) : null,
            h2("text", { x: size / 2, y: size / 2 - 2, textAnchor: "middle", fill: "var(--dsw-alias-label-primary,#1f2329)", fontSize: 24, fontWeight: 650 }, num(props.lang, total)),
            h2("text", { x: size / 2, y: size / 2 + 18, textAnchor: "middle", fill: "var(--dsw-alias-label-tertiary,#8f959e)", fontSize: 11 }, props.centerLabel || "")
          ),
          h2("div", { className: prefix + "-legend" }, (props.data || []).map(function(d, i) {
            return h2(
              "div",
              { key: d.key || d.label || i, className: prefix + "-leg" },
              h2("span", { className: prefix + "-dot", style: { background: d.color || COLORS[i % COLORS.length] } }),
              h2("span", null, d.label),
              h2("b", null, num(props.lang, d.count))
            );
          }))
        );
      }
      function BarList(props) {
        var data = props.data || [];
        var max = Number(props.max || 0) || data.reduce(function(m, d) {
          return Math.max(m, Number(d.value || 0));
        }, 0) || 1;
        return h2("div", { className: prefix + "-bars" }, data.map(function(d, i) {
          var v = Number(d.value || 0);
          return h2(
            "div",
            { key: d.key || d.label || i, className: prefix + "-bar" },
            h2("span", { className: prefix + "-bar-l", title: d.title || d.label }, d.label),
            h2("span", { className: prefix + "-bar-t" }, h2("span", { className: prefix + "-bar-f", style: { width: Math.max(2, v / max * 100) + "%", background: d.color || props.color || COLORS[0] } })),
            h2("span", { className: prefix + "-bar-v" }, props.format ? props.format(v) : num(props.lang, v))
          );
        }));
      }
      function StackedRows(props) {
        var rows = props.rows || [];
        var keys = props.keys || [];
        return h2("div", { className: prefix + "-stack" }, rows.map(function(row, ri) {
          var total = Number(row.total || 0) || 1;
          return h2(
            "div",
            { key: row.key || ri },
            h2("div", { className: prefix + "-srow-l" }, h2("span", null, row.label), h2("b", null, num(props.lang, row.total))),
            h2("div", { className: prefix + "-strack" }, keys.map(function(k, i) {
              var v = Number(row.parts && row.parts[k.key] || 0);
              if (v <= 0) return null;
              return h2("span", {
                key: k.key,
                className: prefix + "-seg-f",
                title: k.label + " " + v,
                style: { width: v / total * 100 + "%", background: k.color || COLORS[i % COLORS.length] }
              });
            }))
          );
        }));
      }
      function Trend(props) {
        var data = props.data || [];
        var series = props.series || [];
        var width = 640;
        var height = props.height || 200;
        var left = 30, right = 10, top = 12, bottom = 24;
        var pw = width - left - right, ph = height - top - bottom;
        var max = 1;
        data.forEach(function(d) {
          series.forEach(function(s) {
            max = Math.max(max, Number(d[s.key] || 0));
          });
        });
        max = Math.ceil(max * 1.15) || 1;
        function x(i2) {
          return left + (data.length <= 1 ? pw / 2 : i2 / (data.length - 1) * pw);
        }
        function y(v) {
          return top + ph - Number(v || 0) / max * ph;
        }
        var ticks = [];
        for (var t = 0; t <= 3; t++) ticks.push(Math.round(max / 3 * t));
        var labelIdx = [];
        if (data.length) {
          var step = Math.max(1, Math.floor(data.length / 5));
          for (var i = 0; i < data.length; i += step) labelIdx.push(i);
          if (labelIdx[labelIdx.length - 1] !== data.length - 1) labelIdx.push(data.length - 1);
        }
        var aria = series.map(function(s) {
          return s.label + " " + data.reduce(function(n, d) {
            return n + Number(d[s.key] || 0);
          }, 0);
        }).join("\uFF0C");
        return h2(
          "div",
          null,
          h2(
            "svg",
            { className: prefix + "-trend", viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": props.aria || aria },
            ticks.map(function(v, i2) {
              return h2(
                "g",
                { key: "t" + i2 },
                h2("line", { x1: left, x2: width - right, y1: y(v), y2: y(v), stroke: "var(--dsw-alias-border-l1,#f2f3f5)", strokeWidth: 1 }),
                h2("text", { x: left - 5, y: y(v) + 3, textAnchor: "end", fontSize: 9, fill: "var(--dsw-alias-label-tertiary,#8f959e)" }, num(props.lang, v))
              );
            }),
            series.map(function(s, si) {
              var pts = data.map(function(d, i2) {
                return x(i2) + "," + y(d[s.key]);
              }).join(" ");
              return h2(
                "g",
                { key: s.key },
                h2("polyline", { points: pts, fill: "none", stroke: s.color || COLORS[si % COLORS.length], strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" }),
                data.map(function(d, i2) {
                  if (data.length > 40 && i2 % 3 !== 0) return null;
                  return h2(
                    "circle",
                    { key: i2, cx: x(i2), cy: y(d[s.key]), r: 2.4, fill: s.color || COLORS[si % COLORS.length] },
                    h2("title", null, d.bucket + "\uFF1A" + s.label + " " + (d[s.key] || 0))
                  );
                })
              );
            }),
            labelIdx.map(function(i2) {
              return h2("text", { key: "x" + i2, x: x(i2), y: height - 6, textAnchor: "middle", fontSize: 9, fill: "var(--dsw-alias-label-tertiary,#8f959e)" }, String(data[i2].bucket).slice(5));
            })
          ),
          h2("div", { className: prefix + "-tlegend" }, series.map(function(s, i2) {
            return h2(
              "span",
              { key: s.key, style: { display: "inline-flex", alignItems: "center", gap: 5 } },
              h2("span", { className: prefix + "-dot", style: { background: s.color || COLORS[i2 % COLORS.length] } }),
              s.label
            );
          }))
        );
      }
      function Histogram(props) {
        var data = props.data || [];
        var max = data.reduce(function(m, d) {
          return Math.max(m, Number(d.count || 0));
        }, 0) || 1;
        return h2(
          "div",
          { className: prefix + "-hist", role: "img", "aria-label": props.aria || data.map(function(d) {
            return d.label + " " + d.count;
          }).join("\uFF0C") },
          data.map(function(d, i) {
            return h2(
              "div",
              { key: d.key || d.label || i, className: prefix + "-hbar", title: d.label + "\uFF1A" + d.count },
              h2("span", { className: prefix + "-hbar-v" }, num(props.lang, d.count)),
              h2("span", { className: prefix + "-hbar-f", style: { height: Math.max(2, Number(d.count || 0) / max * 100) + "%", background: d.color || props.color || COLORS[0] } }),
              h2("span", { className: prefix + "-hbar-l" }, d.label)
            );
          })
        );
      }
      function DataTable(props) {
        var cols = props.columns || [];
        var rows = props.rows || [];
        if (!rows.length) return h2("div", { className: prefix + "-empty" }, props.empty || "\u6682\u65E0\u6570\u636E");
        return h2(
          "table",
          { className: prefix + "-table" },
          h2("thead", null, h2("tr", null, cols.map(function(c) {
            return h2("th", { key: c.key, className: c.num ? prefix + "-num" : "" }, c.label);
          }))),
          h2("tbody", null, rows.map(function(row, ri) {
            return h2("tr", { key: row.id || row.key || ri }, cols.map(function(c) {
              return h2("td", { key: c.key, className: c.num ? prefix + "-num" : "" }, c.render ? c.render(row) : row[c.key]);
            }));
          }))
        );
      }
      function RangeSwitch(props) {
        return h2(
          "div",
          { className: prefix + "-stoolbar" },
          h2("div", { className: prefix + "-seg", role: "group", "aria-label": props.aria || "\u65F6\u95F4\u8303\u56F4" }, (props.options || []).map(function(o) {
            return h2("button", {
              key: o.key,
              type: "button",
              className: o.key === props.value ? prefix + "-on" : "",
              "aria-pressed": o.key === props.value,
              onClick: function() {
                props.onChange(o.key);
              }
            }, o.label);
          })),
          h2("button", { type: "button", className: prefix + "-ghost", disabled: !!props.loading, onClick: props.onRefresh }, props.refreshLabel || "\u5237\u65B0"),
          h2("span", { className: prefix + "-muted" }, props.generatedAt ? (props.timeLabel || "\u622A\u81F3") + " " + timeText(props.generatedAt) : ""),
          props.right ? h2("span", { style: { marginLeft: "auto" } }, props.right) : null
        );
      }
      function Empty(props) {
        return h2("div", { className: prefix + "-empty" }, props.text || "\u6682\u65E0\u6570\u636E");
      }
      function Skeleton() {
        return h2(
          "div",
          { className: prefix + "-sgrid" },
          h2("div", { className: prefix + "-kpis" }, [0, 1, 2, 3].map(function(i) {
            return h2(
              "div",
              { key: i, className: prefix + "-kpi" },
              h2("div", { className: prefix + "-sk", style: { width: "40%" } }),
              h2("div", { className: prefix + "-sk", style: { width: "65%", height: 26 } })
            );
          })),
          [0, 1].map(function(i) {
            return h2(
              "div",
              { key: "c" + i, className: prefix + "-scard " + prefix + "-span-6" },
              h2("div", { className: prefix + "-sk", style: { width: "30%" } }),
              h2("div", { className: prefix + "-sk", style: { height: 120 } })
            );
          })
        );
      }
      function ErrorBar(props) {
        return h2(
          "div",
          { className: prefix + "-err", role: "alert" },
          h2("span", null, props.message),
          props.onRetry ? h2("button", { type: "button", className: prefix + "-ghost", onClick: props.onRetry }, props.retryLabel || "\u91CD\u8BD5") : null
        );
      }
      function Warnings(props) {
        var items = props.items || [];
        if (!items.length) return null;
        return h2("div", { className: prefix + "-warn", role: "status" }, items.map(function(w) {
          return w.message;
        }).join("\uFF1B"));
      }
      return {
        Card,
        Kpi,
        Donut,
        BarList,
        StackedRows,
        Trend,
        Histogram,
        DataTable,
        RangeSwitch,
        Empty,
        Skeleton,
        ErrorBar,
        Warnings,
        num,
        pct,
        timeText,
        dateText,
        colors: COLORS
      };
    }
    module2.exports = { makeCharts };
  }
});

// packages/addons/tasks/client/config.cjs
var require_config = __commonJS({
  "packages/addons/tasks/client/config.cjs"(exports2, module2) {
    var React2 = require("react");
    var h2 = React2.createElement;
    var DOMAIN = "tasks";
    var PREFIX = "wbt";
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
    var CSS = [
      ".__P__-cfg{--cfg-line:var(--wb-line,var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent)));--cfg-surface:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));--cfg-muted:var(--dsw-alias-label-secondary,color-mix(in oklab,currentColor 62%,transparent));--cfg-faint:var(--dsw-alias-label-tertiary,color-mix(in oklab,currentColor 42%,transparent));--cfg-hover:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent));display:flex;flex-direction:column;gap:16px;width:100%;max-width:980px;margin:0 auto;min-width:0;padding-bottom:6px;color:inherit;font-size:13.5px}",
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
      var stateS = React2.useState({
        ready: false,
        values: Object.assign({}, fb),
        items: [],
        groups: [],
        overrides: {},
        error: "",
        state: null
      });
      var state = stateS[0], setState = stateS[1];
      React2.useEffect(function() {
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
      }, [api]);
      return state;
    }
    function ConfigView(props) {
      var api = props.api;
      var lang = props.lang === "en" ? "en" : "zh";
      var t = COPY[lang];
      var loadS = React2.useState(true);
      var loading = loadS[0], setLoading = loadS[1];
      var stateS = React2.useState(null);
      var state = stateS[0], setState = stateS[1];
      var errS = React2.useState("");
      var err = errS[0], setErr = errS[1];
      var noticeS = React2.useState({ id: "", text: "", error: false });
      var notice = noticeS[0], setNotice = noticeS[1];
      var savingS = React2.useState("");
      var savingId = savingS[0], setSavingId = savingS[1];
      var draftsS = React2.useState({});
      var drafts = draftsS[0], setDrafts = draftsS[1];
      var busyS = React2.useState(false);
      var busy = busyS[0], setBusy = busyS[1];
      React2.useEffect(function() {
        injectCss();
      }, []);
      var load = React2.useCallback(function() {
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
      }, [api]);
      React2.useEffect(function() {
        load();
      }, [load]);
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
        return Promise.resolve(api.call(DOMAIN + ".configSet", { values: (function() {
          var o = {};
          o[id] = value;
          return o;
        })() })).then(function(r) {
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
          return h2(
            "label",
            { className: PREFIX + "-cfg-switch" },
            h2("input", {
              type: "checkbox",
              checked: value === true,
              onChange: function(e) {
                save(item.id, e.target.checked);
              }
            }),
            h2("span", { className: PREFIX + "-cfg-track", "aria-hidden": "true" }),
            h2("span", { className: PREFIX + "-cfg-switchstate" }, value === true ? t.on : t.off)
          );
        }
        if (item.type === "enum") {
          return h2("select", {
            className: PREFIX + "-cfg-select",
            value: String(value),
            onChange: function(e) {
              var hit = (item.options || []).filter(function(o) {
                return String(o.value) === e.target.value;
              })[0];
              if (hit) save(item.id, hit.value);
            }
          }, (item.options || []).map(function(o) {
            return h2("option", { key: String(o.value), value: String(o.value) }, optionLabel(o, lang));
          }));
        }
        if (item.type === "int") {
          var draft = drafts[item.id] !== void 0 ? drafts[item.id] : String(value);
          return h2("input", {
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
          return h2("div", { className: PREFIX + "-cfg-multi" }, (item.options || []).map(function(o) {
            var on = picked.indexOf(o.value) >= 0;
            return h2(
              "label",
              { key: String(o.value) },
              h2("input", {
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
              h2("span", null, optionLabel(o, lang))
            );
          }));
        }
        return h2("input", {
          className: PREFIX + "-cfg-input",
          type: "text",
          defaultValue: value === void 0 ? "" : String(value),
          onBlur: function(e) {
            if (!sameValue(e.target.value, value)) save(item.id, e.target.value);
          }
        });
      }
      var body = [];
      if (loading && !state) body.push(h2(
        "div",
        { key: "loading", className: PREFIX + "-cfg-loading", "aria-busy": "true" },
        h2("span", { className: PREFIX + "-cfg-sr" }, t.loading),
        h2("div", { className: PREFIX + "-cfg-sk" }),
        h2("div", { className: PREFIX + "-cfg-sk" }),
        h2("div", { className: PREFIX + "-cfg-sk" })
      ));
      if (!loading && err && !state) {
        body.push(h2(
          "div",
          { key: "err", className: PREFIX + "-cfg-error" },
          h2("span", null, t.loadFail + " " + err),
          h2("button", { type: "button", className: PREFIX + "-cfg-btn", onClick: load }, t.retry)
        ));
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
          body.push(h2(
            "section",
            { key: "g-" + g.id, className: PREFIX + "-cfg-group" },
            h2(
              "div",
              { className: PREFIX + "-cfg-gtitle" },
              h2("span", null, lang === "en" ? g.en : g.zh),
              h2("span", { className: PREFIX + "-cfg-gcount" }, list.length + (lang === "en" ? " items" : " \u9879"))
            ),
            list.map(function(item) {
              var overridden = state.overrides && state.overrides[item.id] !== void 0;
              var isSaving = savingId === item.id;
              return h2(
                "div",
                { key: item.id, className: PREFIX + "-cfg-row" },
                h2(
                  "div",
                  { className: PREFIX + "-cfg-label" },
                  h2(
                    "div",
                    { className: PREFIX + "-cfg-name" },
                    h2("span", null, lang === "en" ? item.en : item.zh),
                    overridden ? h2("span", { className: PREFIX + "-cfg-chip" }, t.modified) : null,
                    isSaving ? h2("span", { className: PREFIX + "-cfg-chip" }, t.saving) : null
                  ),
                  (lang === "en" ? item.hintEn : item.hintZh) ? h2("div", { className: PREFIX + "-cfg-hint" }, lang === "en" ? item.hintEn : item.hintZh) : null,
                  h2("div", { className: PREFIX + "-cfg-id" }, item.id)
                ),
                h2(
                  "div",
                  { className: PREFIX + "-cfg-control" },
                  renderControl(item),
                  overridden ? h2("button", {
                    type: "button",
                    className: PREFIX + "-cfg-btn",
                    disabled: busy,
                    onClick: function() {
                      resetItem(item.id);
                    },
                    title: t.reset
                  }, t.reset) : null
                )
              );
            })
          ));
        });
        if (!items.length && !loading) body.push(h2("div", { key: "empty", className: PREFIX + "-cfg-empty" }, t.empty));
        var anyOverride = Object.keys(state.overrides || {}).length > 0;
        body.push(h2(
          "div",
          { key: "foot", className: PREFIX + "-cfg-foot" },
          h2(
            "span",
            { className: PREFIX + "-cfg-changed" },
            anyOverride ? Object.keys(state.overrides || {}).length + (lang === "en" ? " changed" : " \u9879\u5DF2\u4FEE\u6539") : lang === "en" ? "All preferences are at their defaults" : "\u5168\u90E8\u914D\u7F6E\u5747\u4E3A\u9ED8\u8BA4\u503C"
          ),
          h2("span", { className: PREFIX + "-cfg-grow" }),
          anyOverride ? h2("button", { type: "button", className: PREFIX + "-cfg-btn " + PREFIX + "-cfg-btn-outline", disabled: busy, onClick: resetAll }, busy ? t.resetting : t.resetAll) : null
        ));
        var warn = (state.warnings || []).filter(function(w) {
          return w && w.message;
        });
        if (warn.length) {
          body.push(h2(
            "div",
            { key: "warn", className: PREFIX + "-cfg-error" },
            h2("span", null, warn.map(function(w) {
              return w.message;
            }).join("\uFF1B"))
          ));
        }
      }
      return h2(
        "div",
        { className: PREFIX + "-cfg" },
        h2(
          "div",
          { className: PREFIX + "-cfg-head" },
          h2(
            "div",
            { className: PREFIX + "-cfg-headmain" },
            h2("h2", null, t.title),
            h2("div", { className: PREFIX + "-cfg-note" }, t.note)
          ),
          notice.text ? h2("div", { key: "notice", className: PREFIX + "-cfg-status" + (notice.error ? " err" : ""), role: "status" }, notice.text) : null
        ),
        body
      );
    }
    module2.exports = { ConfigView, useConfig, DOMAIN };
  }
});

// packages/addons/tasks/client/stats.cjs
var require_stats = __commonJS({
  "packages/addons/tasks/client/stats.cjs"(exports2, module2) {
    var React2 = require("react");
    var h2 = React2.createElement;
    var charts = require_charts();
    var configView = require_config();
    var COPY = {
      zh: {
        title: "\u4EFB\u52A1\u7EDF\u8BA1",
        range7: "\u8FD1 7 \u5929",
        range30: "\u8FD1 30 \u5929",
        range90: "\u8FD1 90 \u5929",
        range365: "\u8FD1 1 \u5E74",
        rangeAll: "\u5168\u90E8",
        refresh: "\u5237\u65B0",
        asOf: "\u622A\u81F3",
        retry: "\u91CD\u8BD5",
        loadFail: "\u7EDF\u8BA1\u670D\u52A1\u672A\u5C31\u7EEA\uFF0C\u8BF7\u5347\u7EA7\u63D2\u4EF6\u540E\u91CD\u8BD5",
        total: "\u603B\u4EFB\u52A1",
        active: "\u8FDB\u884C\u4E2D",
        overdue: "\u903E\u671F",
        completion: "\u5B8C\u6210\u7387",
        dueToday: "\u4ECA\u65E5\u5230\u671F",
        dueNext7: "\u672A\u6765 7 \u5929\u5230\u671F",
        newInRange: "\u8303\u56F4\u5185\u65B0\u589E",
        avgCycle: "\u5E73\u5747\u5B8C\u6210\u5468\u671F",
        days: "\u5929",
        current: "\u5F53\u524D",
        inRange: "\u8303\u56F4\u5185",
        ofTotal: "\u5360\u603B\u91CF",
        ofActive: "\u5360\u8FDB\u884C\u4E2D",
        trend: "\u65B0\u589E / \u5B8C\u6210 / \u5230\u671F\u8D8B\u52BF",
        trendNote: "\u6309\u81EA\u7136\u65E5 / \u5468 / \u6708\u5206\u6876",
        created: "\u65B0\u589E",
        done: "\u5B8C\u6210",
        due: "\u5230\u671F",
        status: "\u72B6\u6001\u6784\u6210",
        statusNote: "\u5F53\u524D\u5B58\u91CF",
        tags: "\u6807\u7B7E \xD7 \u72B6\u6001",
        tagsNote: "\u5F53\u524D\u5B58\u91CF\uFF1B\u4E00\u4E2A\u4EFB\u52A1\u53EF\u5C5E\u4E8E\u591A\u4E2A\u6807\u7B7E",
        priority: "\u4F18\u5148\u7EA7\u5206\u5E03",
        priorityNote: "\u5F53\u524D\u5B58\u91CF",
        difficulty: "\u96BE\u5EA6\u5206\u5E03",
        difficultyNote: "\u5F53\u524D\u5B58\u91CF",
        aging: "\u903E\u671F\u8D26\u9F84",
        agingNote: "\u5F53\u524D\u903E\u671F\u4EFB\u52A1",
        overdueList: "\u903E\u671F\u6E05\u5355",
        overdueNote: "\u6309\u8D26\u9F84\u964D\u5E8F",
        tables: "\u4EFB\u52A1\u8868\u6392\u884C",
        tablesNote: "\u6309\u8FDB\u884C\u4E2D + \u903E\u671F\u6743\u91CD",
        groups: "\u4EFB\u52A1\u7EC4\u6392\u884C",
        groupsNote: "\u4E00\u7EA7\u4EFB\u52A1\u7EC4",
        colName: "\u540D\u79F0",
        colTotal: "\u603B\u6570",
        colOpen: "\u8FDB\u884C\u4E2D",
        colOverdue: "\u903E\u671F",
        colDone: "\u5DF2\u5B8C\u6210",
        colRate: "\u5B8C\u6210\u7387",
        colTitle: "\u4EFB\u52A1",
        colTarget: "\u8BA1\u5212\u5B8C\u6210",
        colAge: "\u903E\u671F\u5929\u6570",
        colTable: "\u4EFB\u52A1\u8868",
        noOverdue: "\u6CA1\u6709\u903E\u671F\u4EFB\u52A1",
        noData: "\u8FD8\u6CA1\u6709\u4EFB\u52A1\u3002\u5728\u300C\u8BB0\u5F55\u300D\u91CC\u521B\u5EFA\u540E\uFF0C\u8FD9\u91CC\u4F1A\u81EA\u52A8\u6C47\u603B",
        open: "\u8FDB\u884C\u4E2D",
        shutdown: "\u5DF2\u5173\u95ED",
        restarted: "\u5DF2\u91CD\u542F"
      },
      en: {
        title: "Task stats",
        range7: "7 days",
        range30: "30 days",
        range90: "90 days",
        range365: "1 year",
        rangeAll: "All",
        refresh: "Refresh",
        asOf: "As of",
        retry: "Retry",
        loadFail: "Stats service not ready. Upgrade the plugin and retry.",
        total: "Tasks",
        active: "Active",
        overdue: "Overdue",
        completion: "Completion",
        dueToday: "Due today",
        dueNext7: "Due next 7d",
        newInRange: "New in range",
        avgCycle: "Avg cycle",
        days: "d",
        current: "Current",
        inRange: "In range",
        ofTotal: "of total",
        ofActive: "of active",
        trend: "Created / done / due trend",
        trendNote: "Bucketed by day / week / month",
        created: "Created",
        done: "Done",
        due: "Due",
        status: "Status",
        statusNote: "Current",
        tags: "Tags \xD7 status",
        tagsNote: "Current; a task can carry several tags",
        priority: "Priority",
        priorityNote: "Current",
        difficulty: "Difficulty",
        difficultyNote: "Current",
        aging: "Overdue aging",
        agingNote: "Current overdue",
        overdueList: "Overdue list",
        overdueNote: "Oldest first",
        tables: "Task tables",
        tablesNote: "Weighted by active + overdue",
        groups: "Task groups",
        groupsNote: "First-level groups",
        colName: "Name",
        colTotal: "Total",
        colOpen: "Active",
        colOverdue: "Overdue",
        colDone: "Done",
        colRate: "Completion",
        colTitle: "Task",
        colTarget: "Target",
        colAge: "Days late",
        colTable: "Table",
        noOverdue: "No overdue tasks",
        noData: "No tasks yet. Create one in Tasks and the summary appears here.",
        open: "Active",
        shutdown: "Closed",
        restarted: "Restarted"
      }
    };
    var RANGES = ["7d", "30d", "90d", "365d", "all"];
    var CFG_FALLBACK = { "stats.range": "30d", "stats.top": 10, "stats.showKpi": true };
    function TasksStatsView(props) {
      var lang = props.lang === "en" ? "en" : "zh";
      var cfg = configView.useConfig(props.api, CFG_FALLBACK);
      if (!cfg.ready) {
        return h2("div", { style: { padding: "48px", textAlign: "center", fontSize: "12.5px", opacity: 0.6 } }, lang === "en" ? "Loading\u2026" : "\u8F7D\u5165\u4E2D\u2026");
      }
      return h2(TasksStatsBody, Object.assign({}, props, { cfg: cfg.values }));
    }
    function TasksStatsBody(props) {
      var lang = props.lang === "en" ? "en" : "zh";
      var t = COPY[lang];
      var api = props.api;
      var cfg = props.cfg || {};
      var cfgRange = RANGES.indexOf(cfg["stats.range"]) >= 0 ? cfg["stats.range"] : "30d";
      var cfgTop = Math.floor(Number(cfg["stats.top"]));
      if (!(cfgTop >= 5)) cfgTop = 10;
      if (cfgTop > 20) cfgTop = 20;
      var cfgSections = Array.isArray(cfg["stats.sections"]) ? cfg["stats.sections"] : null;
      function sectionOn(key) {
        return !cfgSections || cfgSections.indexOf(key) >= 0;
      }
      var ch = React2.useMemo(function() {
        return charts.makeCharts("wbt");
      }, []);
      var rangePair = React2.useState(cfgRange);
      var range = rangePair[0], setRange = rangePair[1];
      var dataPair = React2.useState(null);
      var data = dataPair[0], setData = dataPair[1];
      var errPair = React2.useState("");
      var err = errPair[0], setErr = errPair[1];
      var loadPair = React2.useState(true);
      var loading = loadPair[0], setLoading = loadPair[1];
      var req = React2.useRef(0);
      var load = React2.useCallback(function(silent) {
        var id = ++req.current;
        if (!silent) setLoading(true);
        return Promise.resolve(api.call("tasks.statsReport", { range, top: cfgTop })).then(function(r) {
          return r && r.result !== void 0 ? r.result : r;
        }).then(function(d) {
          if (id !== req.current) return;
          setData(d);
          setErr("");
        }).catch(function(e) {
          if (id !== req.current) return;
          setErr(String(e && e.message || e || "load failed"));
        }).then(function() {
          if (id === req.current) setLoading(false);
        });
      }, [api, range]);
      React2.useEffect(function() {
        load(false);
      }, [load]);
      React2.useEffect(function() {
        if (!api || typeof api.subscribe !== "function") return void 0;
        var timer = null;
        var pending = false;
        var off = api.subscribe(function(payload) {
          var ev = payload && payload.event;
          if (ev !== "tasks-changed" && ev !== "task-nodes-changed") return;
          if (typeof document !== "undefined" && document.visibilityState && document.visibilityState !== "visible") {
            pending = true;
            return;
          }
          if (timer) clearTimeout(timer);
          timer = setTimeout(function() {
            load(true);
          }, 800);
        });
        function onVisible() {
          if (typeof document !== "undefined" && document.visibilityState === "visible" && pending) {
            pending = false;
            load(true);
          }
        }
        if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisible);
        return function() {
          if (timer) clearTimeout(timer);
          if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisible);
          if (typeof off === "function") off();
        };
      }, [api, load]);
      var options = RANGES.map(function(key) {
        return { key, label: t["range" + (key === "all" ? "All" : key.replace("d", ""))] };
      });
      var children = [];
      if (!data && loading) children.push(h2(ch.Skeleton, { key: "sk" }));
      if (!data && !loading && err) {
        children.push(h2(ch.Card, { key: "err", span: 12 }, h2(ch.Empty, { text: t.loadFail })));
      }
      if (data) {
        var totals = data.totals || {};
        var rates = data.rates || {};
        var b = data.breakdowns || {};
        children.push(h2(
          "div",
          { key: "kpi", className: "wbt-kpis" },
          h2(ch.Kpi, { label: t.total, value: totals.total, hint: t.current, lang }),
          h2(ch.Kpi, { label: t.active, value: totals.active, hint: t.ofTotal + " " + ch.pct(totals.total ? totals.active / totals.total : 0), lang }),
          h2(ch.Kpi, { label: t.overdue, value: totals.overdue, hint: t.ofActive + " " + ch.pct(rates.overdue), tone: totals.overdue > 0 ? "danger" : "", lang }),
          h2(ch.Kpi, { label: t.completion, value: ch.pct(rates.completion), hint: totals.done + " / " + totals.total, tone: "ok", lang }),
          h2(ch.Kpi, { label: t.dueToday, value: totals.dueToday, hint: t.current, tone: totals.dueToday > 0 ? "warn" : "", lang }),
          h2(ch.Kpi, { label: t.dueNext7, value: totals.dueNext7, hint: t.current, lang }),
          h2(ch.Kpi, { label: t.newInRange, value: totals.newInRange, hint: t.inRange, lang }),
          h2(ch.Kpi, { label: t.avgCycle, value: rates.avgCycleDays === null || rates.avgCycleDays === void 0 ? "\u2014" : rates.avgCycleDays, unit: t.days, hint: t.inRange, lang })
        ));
        if (totals.total === 0) {
          children.push(h2(ch.Card, { key: "empty", span: 12 }, h2(ch.Empty, { text: t.noData })));
        } else {
          children.push(h2(
            ch.Card,
            { key: "trend", span: 8, title: t.trend, note: t.trendNote },
            h2(ch.Trend, {
              data: data.trend || [],
              lang,
              series: [
                { key: "created", label: t.created, color: ch.colors[0] },
                { key: "done", label: t.done, color: ch.colors[1] },
                { key: "due", label: t.due, color: ch.colors[2] }
              ]
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "status", span: 4, title: t.status, note: t.statusNote },
            h2(ch.Donut, {
              data: (b.status || []).map(function(s, i) {
                return { key: s.key, label: s.label, count: s.count, color: i === 1 ? "var(--dsw-alias-label-tertiary,#8f959e)" : ch.colors[i] };
              }),
              total: totals.total,
              lang,
              centerLabel: t.total,
              aria: (b.status || []).map(function(s) {
                return s.label + " " + s.count;
              }).join("\uFF0C")
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "tags", span: 6, title: t.tags, note: t.tagsNote },
            h2(ch.StackedRows, {
              rows: (b.tags || []).map(function(x) {
                return { key: x.key, label: x.label, total: x.total, parts: { open: x.open, done: x.done, shutdown: x.shutdown, restarted: x.restarted } };
              }),
              keys: [
                { key: "open", label: t.open, color: ch.colors[0] },
                { key: "done", label: t.done, color: ch.colors[1] },
                { key: "shutdown", label: t.shutdown, color: "var(--dsw-alias-label-tertiary,#8f959e)" },
                { key: "restarted", label: t.restarted, color: ch.colors[2] }
              ],
              lang
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "priority", span: 3, title: t.priority, note: t.priorityNote },
            h2(ch.Histogram, { data: b.priority || [], lang, color: ch.colors[0] })
          ));
          children.push(h2(
            ch.Card,
            { key: "difficulty", span: 3, title: t.difficulty, note: t.difficultyNote },
            h2(ch.Histogram, { data: b.difficulty || [], lang, color: ch.colors[4] })
          ));
          children.push(h2(
            ch.Card,
            { key: "aging", span: 6, title: t.aging, note: t.agingNote },
            h2(ch.Histogram, { data: data.aging || [], lang, color: ch.colors[2] })
          ));
          children.push(h2(
            ch.Card,
            { key: "overdue", span: 6, title: t.overdueList, note: t.overdueNote },
            h2(ch.DataTable, {
              rows: data.lists && data.lists.overdue || [],
              lang,
              empty: t.noOverdue,
              columns: [
                { key: "title", label: t.colTitle },
                { key: "targetDate", label: t.colTarget },
                { key: "daysOverdue", label: t.colAge, num: true },
                { key: "tableTitle", label: t.colTable }
              ]
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "tables", span: 6, title: t.tables, note: t.tablesNote },
            h2(ch.DataTable, {
              rows: data.rankings && data.rankings.tables || [],
              lang,
              columns: [
                { key: "title", label: t.colName },
                { key: "total", label: t.colTotal, num: true },
                { key: "open", label: t.colOpen, num: true },
                { key: "overdue", label: t.colOverdue, num: true },
                { key: "completion", label: t.colRate, num: true, render: function(r) {
                  return ch.pct(r.completion);
                } }
              ]
            })
          ));
          children.push(h2(
            ch.Card,
            { key: "groups", span: 6, title: t.groups, note: t.groupsNote },
            h2(ch.DataTable, {
              rows: data.rankings && data.rankings.groups || [],
              lang,
              columns: [
                { key: "title", label: t.colName },
                { key: "total", label: t.colTotal, num: true },
                { key: "open", label: t.colOpen, num: true },
                { key: "overdue", label: t.colOverdue, num: true },
                { key: "completion", label: t.colRate, num: true, render: function(r) {
                  return ch.pct(r.completion);
                } }
              ]
            })
          ));
        }
        children.push(h2(ch.Warnings, { key: "warn", items: data.warnings || [] }));
      }
      children = children.filter(function(node) {
        var k = node && node.key;
        if (!k || k === "sk" || k === "err" || k === "warn" || k === "empty") return true;
        if (k === "kpi") return cfg["stats.showKpi"] !== false;
        return sectionOn(k);
      });
      return h2(
        "div",
        { className: "wbt-stats" },
        h2(ch.RangeSwitch, {
          options,
          value: range,
          onChange: setRange,
          onRefresh: function() {
            load(false);
          },
          loading,
          generatedAt: data && data.generatedAt,
          refreshLabel: t.refresh,
          timeLabel: t.asOf
        }),
        err && data ? h2(ch.ErrorBar, { message: err, onRetry: function() {
          load(false);
        }, retryLabel: t.retry }) : null,
        h2("div", { className: "wbt-sgrid" }, children)
      );
    }
    module2.exports = { TasksStatsView };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs
var toKebabCase;
var init_toKebabCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs"() {
    toKebabCase = (string) => string?.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toLucideIconData.mjs
function toLucideIconData(iconName, iconNode, aliases = []) {
  if (iconNode == null) {
    throw new Error("[lucide]: iconNode is required when icon name is used");
  }
  return {
    name: toKebabCase(iconName),
    size: 24,
    node: iconNode,
    ...aliases.length > 0 ? { aliases } : {}
  };
}
var init_toLucideIconData = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toLucideIconData.mjs"() {
    init_toKebabCase();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs
var toCamelCase;
var init_toCamelCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs"() {
    toCamelCase = (string) => {
      let out = "";
      let upperNext = false;
      for (const ch of string) {
        if (ch === "-" || ch === "_" || ch <= " ") {
          upperNext = out.length > 0;
          continue;
        }
        if (out.length === 0) {
          out += ch.toLowerCase();
        } else {
          out += upperNext ? ch.toUpperCase() : ch;
        }
        upperNext = false;
      }
      return out;
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs
var toPascalCase;
var init_toPascalCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs"() {
    init_toCamelCase();
    toPascalCase = (string) => {
      const camelCase = toCamelCase(string);
      return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var mergeClasses;
var init_mergeClasses = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs"() {
    mergeClasses = (...classes) => classes.filter((className, index, array) => {
      return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
    }).join(" ").trim();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/defaultAttributes.mjs
var defaultAttributes;
var init_defaultAttributes = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/defaultAttributes.mjs"() {
    defaultAttributes = {
      xmlns: "http://www.w3.org/2000/svg",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconNode.mjs
function isDefined(value) {
  return value !== null && value !== void 0;
}
function buildLucideIconNode(icon, params = {}) {
  const attributeNames = params.attributeNames ?? {};
  const getAttributeName = (attributeName) => attributeNames[attributeName] ?? attributeName;
  const viewBoxWidth = icon.size ?? icon.width ?? defaultAttributes["width"];
  const viewBoxHeight = icon.size ?? icon.height ?? defaultAttributes["height"];
  const aliasClassNames = icon.aliases?.filter((alias) => typeof alias === "string" && alias.trim() !== "").map((alias) => `lucide-${alias}`) ?? [];
  const iconClassNames = [...icon.name ? [`lucide-${icon.name}`] : [], ...aliasClassNames];
  const classNamesFromClassName = params.className?.split(" ").filter(Boolean) ?? [];
  const className = params.includeDefaultClasses === false ? mergeClasses(...classNamesFromClassName) : mergeClasses("lucide", ...iconClassNames, ...classNamesFromClassName);
  const calculatedStrokeWidth = params.absoluteStrokeWidth ? Number(params.strokeWidth ?? defaultAttributes["stroke-width"]) * Number(icon.size ?? icon.width ?? defaultAttributes["width"]) / Number(params.size ?? params.width ?? defaultAttributes["width"]) : params.strokeWidth ?? defaultAttributes["stroke-width"];
  const attributes = {
    ...Object.entries(defaultAttributes).reduce((attrs, [attrName, value]) => {
      attrs[getAttributeName(attrName)] = value;
      return attrs;
    }, {}),
    ..."color" in params && params.color && {
      [getAttributeName("stroke")]: params.color
    },
    ..."size" in params && isDefined(params.size) && {
      [getAttributeName("width")]: params.size,
      [getAttributeName("height")]: params.size
    },
    ..."width" in params && isDefined(params.width) && {
      [getAttributeName("width")]: params.width
    },
    ..."height" in params && isDefined(params.height) && {
      [getAttributeName("height")]: params.height
    },
    [getAttributeName("stroke-width")]: calculatedStrokeWidth,
    ...className && {
      [getAttributeName("class")]: className
    },
    [getAttributeName("viewBox")]: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
    ...params.hasA11yProp === false ? {
      [getAttributeName("aria-hidden")]: "true"
    } : {},
    ..."attributes" in params && params.attributes
  };
  return [
    "svg",
    attributes,
    icon.node.map((child) => {
      const [name, attrs, children] = child;
      const nextAttrs = params.nonScalingStroke ? { [getAttributeName("vector-effect")]: "non-scaling-stroke", ...attrs } : attrs;
      return children ? [name, nextAttrs, children] : [name, nextAttrs];
    })
  ];
}
var init_buildLucideIconNode = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconNode.mjs"() {
    init_defaultAttributes();
    init_mergeClasses();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconForReact.mjs
function buildLucideIconForReact(icon, params = {}) {
  return buildLucideIconNode(icon, {
    ...params,
    attributeNames: {
      ...params.attributeNames,
      class: "className",
      "stroke-width": "strokeWidth",
      "stroke-linecap": "strokeLinecap",
      "stroke-linejoin": "strokeLinejoin",
      "vector-effect": "vectorEffect"
    }
  });
}
var init_buildLucideIconForReact = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconForReact.mjs"() {
    init_buildLucideIconNode();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs
var hasA11yProp;
var init_hasA11yProp = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs"() {
    hasA11yProp = (props) => {
      for (const prop in props) {
        if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
          return true;
        }
      }
      return false;
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/context.mjs
var import_react, LucideContext, useLucideContext;
var init_context = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/context.mjs"() {
    "use strict";
    "use client";
    import_react = require("react");
    LucideContext = (0, import_react.createContext)({});
    useLucideContext = () => (0, import_react.useContext)(LucideContext);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/Icon.mjs
var import_react2, Icon;
var init_Icon = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/Icon.mjs"() {
    "use strict";
    "use client";
    import_react2 = require("react");
    init_mergeClasses();
    init_buildLucideIconForReact();
    init_hasA11yProp();
    init_context();
    Icon = (0, import_react2.forwardRef)(
      ({
        color,
        size,
        width,
        height,
        strokeWidth,
        absoluteStrokeWidth,
        nonScalingStroke,
        className = "",
        children,
        iconNode = [],
        icon = {
          node: iconNode,
          aliases: [],
          size: 24
        },
        ...rest
      }, ref) => {
        const {
          size: contextSize = 24,
          strokeWidth: contextStrokeWidth = 2,
          absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
          nonScalingStroke: contextNonScalingStroke = false,
          color: contextColor = "currentColor",
          className: contextClass = ""
        } = useLucideContext() ?? {};
        const hasAccessibleProp = Boolean(children) || hasA11yProp(rest);
        const [name, svgAttributes, builtIconNode = []] = buildLucideIconForReact(icon, {
          color: color ?? contextColor,
          width: width ?? size ?? contextSize,
          height: height ?? size ?? contextSize,
          strokeWidth: strokeWidth ?? contextStrokeWidth,
          absoluteStrokeWidth: absoluteStrokeWidth ?? contextAbsoluteStrokeWidth,
          nonScalingStroke: nonScalingStroke ?? contextNonScalingStroke,
          className: mergeClasses(contextClass, className),
          hasA11yProp: hasAccessibleProp,
          attributes: rest
        });
        return (0, import_react2.createElement)(
          name,
          {
            ref,
            ...svgAttributes
          },
          [
            ...builtIconNode.map(([tag, attrs]) => (0, import_react2.createElement)(tag, attrs)),
            ...Array.isArray(children) ? children : [children]
          ]
        );
      }
    );
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
function createLucideIcon(iconDataOrName, iconNode = [], aliases = []) {
  const iconData = typeof iconDataOrName === "string" ? toLucideIconData(iconDataOrName, iconNode, aliases) : iconDataOrName;
  const Component = (0, import_react3.forwardRef)(
    ({ className, ...props }, ref) => (0, import_react3.createElement)(Icon, {
      ref,
      icon: iconData,
      className,
      ...props
    })
  );
  if (iconData.name) {
    Component.displayName = toPascalCase(iconData.name);
  }
  return Component;
}
var import_react3;
var init_createLucideIcon = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/createLucideIcon.mjs"() {
    import_react3 = require("react");
    init_toLucideIconData();
    init_toPascalCase();
    init_Icon();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/plus.mjs
var plus_exports = {};
__export(plus_exports, {
  __iconData: () => __iconData,
  default: () => Plus
});
var __iconData, Plus;
var init_plus = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/plus.mjs"() {
    init_createLucideIcon();
    __iconData = {
      name: "plus",
      size: 24,
      node: [
        ["path", { d: "M5 12h14", key: "1ays0h" }],
        ["path", { d: "M12 5v14", key: "s699le" }]
      ]
    };
    __iconData.node;
    Plus = createLucideIcon(__iconData);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/minus.mjs
var minus_exports = {};
__export(minus_exports, {
  __iconData: () => __iconData2,
  default: () => Minus
});
var __iconData2, Minus;
var init_minus = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/minus.mjs"() {
    init_createLucideIcon();
    __iconData2 = {
      name: "minus",
      size: 24,
      node: [["path", { d: "M5 12h14", key: "1ays0h" }]]
    };
    __iconData2.node;
    Minus = createLucideIcon(__iconData2);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/check.mjs
var check_exports = {};
__export(check_exports, {
  __iconData: () => __iconData3,
  default: () => Check
});
var __iconData3, Check;
var init_check = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/check.mjs"() {
    init_createLucideIcon();
    __iconData3 = {
      name: "check",
      size: 24,
      node: [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]
    };
    __iconData3.node;
    Check = createLucideIcon(__iconData3);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/square.mjs
var square_exports = {};
__export(square_exports, {
  __iconData: () => __iconData4,
  default: () => Square
});
var __iconData4, Square;
var init_square = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/square.mjs"() {
    init_createLucideIcon();
    __iconData4 = {
      name: "square",
      size: 24,
      node: [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]]
    };
    __iconData4.node;
    Square = createLucideIcon(__iconData4);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs
var rotate_ccw_exports = {};
__export(rotate_ccw_exports, {
  __iconData: () => __iconData5,
  default: () => RotateCcw
});
var __iconData5, RotateCcw;
var init_rotate_ccw = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/rotate-ccw.mjs"() {
    init_createLucideIcon();
    __iconData5 = {
      name: "rotate-ccw",
      size: 24,
      node: [
        ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
        ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
      ]
    };
    __iconData5.node;
    RotateCcw = createLucideIcon(__iconData5);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/list-tree.mjs
var list_tree_exports = {};
__export(list_tree_exports, {
  __iconData: () => __iconData6,
  default: () => ListTree
});
var __iconData6, ListTree;
var init_list_tree = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/list-tree.mjs"() {
    init_createLucideIcon();
    __iconData6 = {
      name: "list-tree",
      size: 24,
      node: [
        ["path", { d: "M8 5h13", key: "1pao27" }],
        ["path", { d: "M13 12h8", key: "h98zly" }],
        ["path", { d: "M13 19h8", key: "c3s6r1" }],
        ["path", { d: "M3 10a2 2 0 0 0 2 2h3", key: "1npucw" }],
        ["path", { d: "M3 5v12a2 2 0 0 0 2 2h3", key: "x1gjn2" }]
      ]
    };
    __iconData6.node;
    ListTree = createLucideIcon(__iconData6);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-tree.mjs
var folder_tree_exports = {};
__export(folder_tree_exports, {
  __iconData: () => __iconData7,
  default: () => FolderTree
});
var __iconData7, FolderTree;
var init_folder_tree = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-tree.mjs"() {
    init_createLucideIcon();
    __iconData7 = {
      name: "folder-tree",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",
            key: "hod4my"
          }
        ],
        [
          "path",
          {
            d: "M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.9a1 1 0 0 1-.88-.55l-.42-.85a1 1 0 0 0-.92-.6H13a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z",
            key: "w4yl2u"
          }
        ],
        ["path", { d: "M3 5a2 2 0 0 0 2 2h3", key: "f2jnh7" }],
        ["path", { d: "M3 3v13a2 2 0 0 0 2 2h3", key: "k8epm1" }]
      ]
    };
    __iconData7.node;
    FolderTree = createLucideIcon(__iconData7);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/search.mjs
var search_exports = {};
__export(search_exports, {
  __iconData: () => __iconData8,
  default: () => Search
});
var __iconData8, Search;
var init_search = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/search.mjs"() {
    init_createLucideIcon();
    __iconData8 = {
      name: "search",
      size: 24,
      node: [
        ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
        ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
      ]
    };
    __iconData8.node;
    Search = createLucideIcon(__iconData8);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/layout-grid.mjs
var layout_grid_exports = {};
__export(layout_grid_exports, {
  __iconData: () => __iconData9,
  default: () => LayoutGrid
});
var __iconData9, LayoutGrid;
var init_layout_grid = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/layout-grid.mjs"() {
    init_createLucideIcon();
    __iconData9 = {
      name: "layout-grid",
      size: 24,
      node: [
        ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
        ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
        ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
        ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
      ]
    };
    __iconData9.node;
    LayoutGrid = createLucideIcon(__iconData9);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/list.mjs
var list_exports = {};
__export(list_exports, {
  __iconData: () => __iconData10,
  default: () => List
});
var __iconData10, List;
var init_list = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/list.mjs"() {
    init_createLucideIcon();
    __iconData10 = {
      name: "list",
      size: 24,
      node: [
        ["path", { d: "M3 5h.01", key: "18ugdj" }],
        ["path", { d: "M3 12h.01", key: "nlz23k" }],
        ["path", { d: "M3 19h.01", key: "noohij" }],
        ["path", { d: "M8 5h13", key: "1pao27" }],
        ["path", { d: "M8 12h13", key: "1za7za" }],
        ["path", { d: "M8 19h13", key: "m83p4d" }]
      ]
    };
    __iconData10.node;
    List = createLucideIcon(__iconData10);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/square-check-big.mjs
var square_check_big_exports = {};
__export(square_check_big_exports, {
  __iconData: () => __iconData11,
  default: () => SquareCheckBig
});
var __iconData11, SquareCheckBig;
var init_square_check_big = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/square-check-big.mjs"() {
    init_createLucideIcon();
    __iconData11 = {
      name: "square-check-big",
      size: 24,
      node: [
        [
          "path",
          { d: "M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344", key: "2acyp4" }
        ],
        ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
      ],
      aliases: ["check-square"]
    };
    __iconData11.node;
    SquareCheckBig = createLucideIcon(__iconData11);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs
var chevron_left_exports = {};
__export(chevron_left_exports, {
  __iconData: () => __iconData12,
  default: () => ChevronLeft
});
var __iconData12, ChevronLeft;
var init_chevron_left = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs"() {
    init_createLucideIcon();
    __iconData12 = {
      name: "chevron-left",
      size: 24,
      node: [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]]
    };
    __iconData12.node;
    ChevronLeft = createLucideIcon(__iconData12);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs
var chevron_right_exports = {};
__export(chevron_right_exports, {
  __iconData: () => __iconData13,
  default: () => ChevronRight
});
var __iconData13, ChevronRight;
var init_chevron_right = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs"() {
    init_createLucideIcon();
    __iconData13 = {
      name: "chevron-right",
      size: 24,
      node: [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]
    };
    __iconData13.node;
    ChevronRight = createLucideIcon(__iconData13);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder.mjs
var folder_exports = {};
__export(folder_exports, {
  __iconData: () => __iconData14,
  default: () => Folder
});
var __iconData14, Folder;
var init_folder = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder.mjs"() {
    init_createLucideIcon();
    __iconData14 = {
      name: "folder",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
            key: "1kt360"
          }
        ]
      ]
    };
    __iconData14.node;
    Folder = createLucideIcon(__iconData14);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-open.mjs
var folder_open_exports = {};
__export(folder_open_exports, {
  __iconData: () => __iconData15,
  default: () => FolderOpen
});
var __iconData15, FolderOpen;
var init_folder_open = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-open.mjs"() {
    init_createLucideIcon();
    __iconData15 = {
      name: "folder-open",
      size: 24,
      node: [
        [
          "path",
          {
            d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
            key: "usdka0"
          }
        ]
      ]
    };
    __iconData15.node;
    FolderOpen = createLucideIcon(__iconData15);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/table-2.mjs
var table_2_exports = {};
__export(table_2_exports, {
  __iconData: () => __iconData16,
  default: () => Table2
});
var __iconData16, Table2;
var init_table_2 = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/table-2.mjs"() {
    init_createLucideIcon();
    __iconData16 = {
      name: "table-2",
      size: 24,
      node: [
        ["path", { d: "M3 9h18", key: "1pudct" }],
        ["path", { d: "M9 3v18", key: "fh3hqa" }],
        ["rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", key: "h1oib" }]
      ]
    };
    __iconData16.node;
    Table2 = createLucideIcon(__iconData16);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/house.mjs
var house_exports = {};
__export(house_exports, {
  __iconData: () => __iconData17,
  default: () => House
});
var __iconData17, House;
var init_house = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/house.mjs"() {
    init_createLucideIcon();
    __iconData17 = {
      name: "house",
      size: 24,
      node: [
        ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
        [
          "path",
          {
            d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
            key: "r6nss1"
          }
        ]
      ],
      aliases: ["home"]
    };
    __iconData17.node;
    House = createLucideIcon(__iconData17);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-plus.mjs
var folder_plus_exports = {};
__export(folder_plus_exports, {
  __iconData: () => __iconData18,
  default: () => FolderPlus
});
var __iconData18, FolderPlus;
var init_folder_plus = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/folder-plus.mjs"() {
    init_createLucideIcon();
    __iconData18 = {
      name: "folder-plus",
      size: 24,
      node: [
        ["path", { d: "M12 10v6", key: "1bos4e" }],
        ["path", { d: "M9 13h6", key: "1uhe8q" }],
        [
          "path",
          {
            d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
            key: "1kt360"
          }
        ]
      ]
    };
    __iconData18.node;
    FolderPlus = createLucideIcon(__iconData18);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/file-plus.mjs
var file_plus_exports = {};
__export(file_plus_exports, {
  __iconData: () => __iconData19,
  default: () => FilePlus
});
var __iconData19, FilePlus;
var init_file_plus = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/file-plus.mjs"() {
    init_createLucideIcon();
    __iconData19 = {
      name: "file-plus",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
            key: "1oefj6"
          }
        ],
        ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
        ["path", { d: "M9 15h6", key: "cctwl0" }],
        ["path", { d: "M12 18v-6", key: "17g6i2" }]
      ]
    };
    __iconData19.node;
    FilePlus = createLucideIcon(__iconData19);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/pencil.mjs
var pencil_exports = {};
__export(pencil_exports, {
  __iconData: () => __iconData20,
  default: () => Pencil
});
var __iconData20, Pencil;
var init_pencil = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/pencil.mjs"() {
    init_createLucideIcon();
    __iconData20 = {
      name: "pencil",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
            key: "1a8usu"
          }
        ],
        ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
      ]
    };
    __iconData20.node;
    Pencil = createLucideIcon(__iconData20);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/trash.mjs
var __iconData21, Trash;
var init_trash = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/trash.mjs"() {
    init_createLucideIcon();
    __iconData21 = {
      name: "trash",
      size: 24,
      node: [
        ["path", { d: "M10 11v6", key: "nco0om" }],
        ["path", { d: "M14 11v6", key: "outv1u" }],
        ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
        ["path", { d: "M3 6h18", key: "d0wm0j" }],
        ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
      ],
      aliases: ["trash-2"]
    };
    __iconData21.node;
    Trash = createLucideIcon(__iconData21);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/trash-2.mjs
var trash_2_exports = {};
__export(trash_2_exports, {
  default: () => Trash
});
var init_trash_2 = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/trash-2.mjs"() {
    init_trash();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/x.mjs
var x_exports = {};
__export(x_exports, {
  __iconData: () => __iconData22,
  default: () => X
});
var __iconData22, X;
var init_x = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/x.mjs"() {
    init_createLucideIcon();
    __iconData22 = {
      name: "x",
      size: 24,
      node: [
        ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
        ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
      ]
    };
    __iconData22.node;
    X = createLucideIcon(__iconData22);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs
var chevron_down_exports = {};
__export(chevron_down_exports, {
  __iconData: () => __iconData23,
  default: () => ChevronDown
});
var __iconData23, ChevronDown;
var init_chevron_down = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs"() {
    init_createLucideIcon();
    __iconData23 = {
      name: "chevron-down",
      size: 24,
      node: [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]
    };
    __iconData23.node;
    ChevronDown = createLucideIcon(__iconData23);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/tag.mjs
var tag_exports = {};
__export(tag_exports, {
  __iconData: () => __iconData24,
  default: () => Tag
});
var __iconData24, Tag;
var init_tag = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/tag.mjs"() {
    init_createLucideIcon();
    __iconData24 = {
      name: "tag",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
            key: "vktsd0"
          }
        ],
        ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
      ]
    };
    __iconData24.node;
    Tag = createLucideIcon(__iconData24);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/clock.mjs
var clock_exports = {};
__export(clock_exports, {
  __iconData: () => __iconData25,
  default: () => Clock
});
var __iconData25, Clock;
var init_clock = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.3.1/node_modules/lucide-react/dist/esm/icons/clock.mjs"() {
    init_createLucideIcon();
    __iconData25 = {
      name: "clock",
      size: 24,
      node: [
        ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
        ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }]
      ]
    };
    __iconData25.node;
    Clock = createLucideIcon(__iconData25);
  }
});

// packages/addons/tasks/client/client.src.cjs
var React = require("react");
var h = React.createElement;
(function() {
  "use strict";
  var host = window.__WB_HOST__;
  if (!host) {
    console.error("[wb-addon-tasks] \u5BBF\u4E3B\u6865 window.__WB_HOST__ \u4E0D\u5B58\u5728\uFF0C\u89C6\u56FE\u672A\u6CE8\u518C");
    return { name: "dsh-workbench-tasks", inject: [], apply: function() {
    } };
  }
  var React2 = require("react");
  var h2 = React2.createElement;
  var statsView = require_stats();
  var configView = require_config();
  var COPY = {
    zh: {
      title: "\u4EFB\u52A1",
      search: "\u641C\u7D22\u4EFB\u52A1\u6807\u9898",
      newTask: "\u65B0\u5EFA\u4EFB\u52A1",
      tree: "\u4EFB\u52A1\u6811",
      select: "\u7B5B\u9009",
      cancelSelect: "\u9000\u51FA\u7B5B\u9009",
      list: "\u5217\u8868",
      card: "\u5361\u7247",
      all: "\u5168\u90E8",
      empty: "\u8FD9\u4E2A\u89C6\u56FE\u8FD8\u6CA1\u6709\u4EFB\u52A1",
      loading: "\u52A0\u8F7D\u4E2D\u2026",
      error: "\u64CD\u4F5C\u5931\u8D25\uFF1A",
      save: "\u4FDD\u5B58",
      cancel: "\u53D6\u6D88",
      create: "\u521B\u5EFA",
      close: "\u5173\u95ED",
      addGroup: "\u65B0\u5EFA\u7EC4",
      addTable: "\u65B0\u5EFA\u8868",
      rename: "\u91CD\u547D\u540D",
      del: "\u5220\u9664",
      editTitle: "\u53CC\u51FB\u7F16\u8F91\u6807\u9898\uFF08\u4EFB\u4F55\u72B6\u6001\u90FD\u53EF\u6539\uFF09",
      deleteConfirm: "\u786E\u5B9A\u5220\u9664\u8FD9\u4E2A\u8282\u70B9\u53CA\u5176\u5B50\u6811\uFF1F\u5B50\u6811\u4E2D\u7684\u4EFB\u52A1\u4F1A\u88AB\u8F6F\u5220\u9664\u3002",
      root: "\u5168\u90E8\u4EFB\u52A1\u7EC4",
      manager: "\u7BA1\u7406\u6A21\u5F0F",
      filterRestarted: "\u8FC7\u6EE4\u5DF2\u91CD\u542F",
      treeSearch: "\u641C\u7D22\u4EFB\u52A1\u7EC4 / \u4EFB\u52A1\u8868",
      treeHint: "\u70B9\u4EFB\u52A1\u8868\u7B5B\u9009\u4EFB\u52A1\uFF1B\u7BA1\u7406\u6A21\u5F0F\u53EF\u62D6\u62FD\u6392\u5E8F\u3001\u6539\u540D\u6216\u5220\u9664",
      groups: "\u4E2A\u4EFB\u52A1\u7EC4",
      tables: "\u5F20\u4EFB\u52A1\u8868",
      treeNoMatch: "\u6CA1\u6709\u5339\u914D\u7684\u8282\u70B9",
      tags: "\u6807\u7B7E",
      tagsHint: "\u7528\u6807\u7B7E\u5F52\u7C7B\uFF08\u5DE5\u4F5C/\u751F\u6D3B/\u5B66\u4E60/\u5F00\u53D1 \u5DF2\u662F\u6807\u7B7E\uFF09",
      tagPlaceholder: "\u591A\u4E2A\u6807\u7B7E\u7528\u9017\u53F7\u5206\u9694\uFF0C\u4F8B\u5982\uFF1A\u5DE5\u4F5C, \u5F00\u53D1",
      tagFilter: "\u6807\u7B7E\u7B5B\u9009",
      allTags: "\u5168\u90E8\u6807\u7B7E",
      noTags: "\u6682\u65E0\u6807\u7B7E",
      untagged: "\u672A\u6253\u6807\u7B7E",
      publish: "\u53D1\u5E03",
      target: "\u8BA1\u5212\u5B8C\u6210",
      done: "\u5B9E\u9645\u5B8C\u6210",
      shutdown: "\u5173\u95ED\u65F6\u95F4",
      priority: "\u4F18\u5148\u7EA7",
      difficulty: "\u96BE\u5EA6",
      desc: "\u63CF\u8FF0",
      review: "\u611F\u53D7",
      reviewHint: "\u5199\u4E0B\u5B8C\u6210\u65F6\u7684\u611F\u53D7\uFF08\u53EF\u9009\uFF09",
      reviewPlaceholder: "\u4F8B\u5982\uFF1A\u601D\u8DEF\u5F88\u987A / \u5361\u5728\u63A5\u53E3\u8C03\u8BD5 / \u6BD4\u9884\u60F3\u8F7B\u677E",
      reviewAdd: "\u8BB0\u5F55\u611F\u53D7",
      status: "\u72B6\u6001",
      publishDate: "\u53D1\u5E03\u65E5\u671F",
      targetDate: "\u8BA1\u5212\u5B8C\u6210\u65E5\u671F",
      doneDate: "\u5B8C\u6210\u65E5\u671F",
      shutdownDate: "\u5173\u95ED\u65E5\u671F",
      table: "\u4EFB\u52A1\u8868",
      titleField: "\u6807\u9898",
      timeline: "\u65F6\u95F4\u7EBF",
      restart: "\u91CD\u542F",
      complete: "\u5B8C\u6210",
      shutdownOp: "\u5173\u95ED",
      selected: "\u5DF2\u9009",
      selectedTasks: "\u9009\u4E2D\u4EFB\u52A1",
      batchTimeline: "\u5F52\u5E76\u65F6\u95F4\u7EBF",
      batchMigrate: "\u8FC1\u79FB\u4EFB\u52A1\u8868",
      refresh: "\u5237\u65B0",
      clear: "\u6E05\u7A7A",
      chooseBase: "\u9009\u62E9\u57FA\u51C6\u4EFB\u52A1\uFF08\u4F7F\u7528\u5B83\u7684\u65F6\u95F4\u7EBF\uFF09",
      chooseTable: "\u9009\u62E9\u76EE\u6807\u4EFB\u52A1\u8868",
      timelineTitle: "\u4EFB\u52A1\u65F6\u95F4\u7EBF",
      newTimeline: "\u65B0\u5EFA\u65F6\u95F4\u7EBF\u4EFB\u52A1",
      restartTitle: "\u91CD\u542F\u4EFB\u52A1",
      noTimeline: "\u8FD9\u6761\u4EFB\u52A1\u8FD8\u6CA1\u6709\u65F6\u95F4\u7EBF",
      confirm: "\u786E\u5B9A",
      difficultyHint: "\u5B8C\u6210\u4EFB\u52A1\u524D\u8BF7\u9009\u62E9\u96BE\u5EA6\uFF080.5\u20135\uFF09",
      emptyTree: "\u4EFB\u52A1\u6811\u8FD8\u6CA1\u6709\u6570\u636E",
      appear: "\u663E\u793A",
      hide: "\u9690\u85CF",
      move: "\u79FB\u52A8\u5230",
      source: "\u6765\u6E90",
      page: "\u9875",
      total: "\u5171",
      items: "\u6761",
      doneSuccess: "\u5DF2\u5B8C\u6210",
      saved: "\u5DF2\u4FDD\u5B58",
      created: "\u5DF2\u521B\u5EFA",
      updated: "\u5DF2\u66F4\u65B0",
      deleted: "\u5DF2\u5220\u9664",
      needTitle: "\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A",
      needTable: "\u8BF7\u9009\u62E9\u4EFB\u52A1\u8868",
      needDate: "\u65E5\u671F\u4E0D\u80FD\u4E3A\u7A7A",
      needBase: "\u8BF7\u9009\u62E9\u57FA\u51C6\u4EFB\u52A1",
      needDifficulty: "\u8BF7\u9009\u62E9\u96BE\u5EA6"
    },
    en: {
      title: "Tasks",
      search: "Search title",
      newTask: "New task",
      tree: "Task tree",
      select: "Select",
      cancelSelect: "Exit select",
      list: "List",
      card: "Cards",
      all: "All",
      empty: "No tasks in this view",
      loading: "Loading\u2026",
      error: "Failed: ",
      save: "Save",
      cancel: "Cancel",
      create: "Create",
      close: "Close",
      addGroup: "New group",
      addTable: "New table",
      rename: "Rename",
      del: "Delete",
      editTitle: "Double-click to rename (any status)",
      deleteConfirm: "Delete this node and its subtree? Tasks under it will be soft-deleted.",
      root: "All tasks",
      manager: "Manage",
      filterRestarted: "Hide restarted",
      treeSearch: "Search groups / tables",
      treeHint: "Pick a table to filter tasks; Manage mode allows drag, rename and delete",
      groups: "groups",
      tables: "tables",
      treeNoMatch: "No matching node",
      tags: "Tags",
      tagsHint: "Group tasks with tags (Work/Life/Study/Dev are tags now)",
      tagPlaceholder: "Comma separated, e.g. Work, Dev",
      tagFilter: "Filter by tag",
      allTags: "All tags",
      noTags: "No tags",
      untagged: "Untagged",
      publish: "Published",
      target: "Target",
      done: "Done",
      shutdown: "Closed",
      priority: "Priority",
      difficulty: "Difficulty",
      desc: "Description",
      review: "Feeling",
      reviewHint: "How did it feel to finish? (optional)",
      reviewPlaceholder: "e.g. smooth, stuck on the API, easier than expected",
      reviewAdd: "Add feeling",
      status: "Status",
      publishDate: "Publish date",
      targetDate: "Target date",
      doneDate: "Done date",
      shutdownDate: "Close date",
      table: "Task table",
      titleField: "Title",
      timeline: "Timeline",
      restart: "Restart",
      complete: "Complete",
      shutdownOp: "Close",
      selected: "Selected",
      selectedTasks: "Selected tasks",
      batchTimeline: "Merge timeline",
      batchMigrate: "Move table",
      refresh: "Refresh",
      clear: "Clear",
      chooseBase: "Choose a base task (it supplies the timeline)",
      chooseTable: "Choose target table",
      timelineTitle: "Task timeline",
      newTimeline: "New timeline task",
      restartTitle: "Restart task",
      noTimeline: "No timeline for this task",
      confirm: "OK",
      difficultyHint: "Pick a difficulty (0.5\u20135) before completing",
      emptyTree: "Task tree is empty",
      appear: "Show",
      hide: "Hide",
      move: "Move to",
      source: "Source",
      page: "Page",
      total: "Total",
      items: "items",
      doneSuccess: "Completed",
      saved: "Saved",
      created: "Created",
      updated: "Updated",
      deleted: "Deleted",
      needTitle: "Title is required",
      needTable: "Pick a task table",
      needDate: "Date is required",
      needBase: "Pick a base task",
      needDifficulty: "Pick a difficulty"
    }
  };
  var TABS = [
    { id: 0, zh: "\u7D27\u6025\u4EFB\u52A1", en: "Urgent" },
    { id: 5, zh: "\u5DF2\u5173\u95ED", en: "Closed" },
    { id: 6, zh: "\u5DF2\u5F00\u542F", en: "Active" },
    { id: 7, zh: "\u5DF2\u5B8C\u6210", en: "Done" },
    { id: 8, zh: "\u603B\u89C8", en: "Overview" }
  ];
  var STATUS = {
    "0": { zh: "\u5DF2\u5F00\u542F", en: "Active", cls: "active" },
    "1": { zh: "\u5DF2\u5173\u95ED", en: "Closed", cls: "shutdown" },
    "2": { zh: "\u5DF2\u5B8C\u6210", en: "Done", cls: "done" },
    "3": { zh: "\u5DF2\u91CD\u542F", en: "Restarted", cls: "restarted" }
  };
  var ICONS = {
    "plus": (init_plus(), __toCommonJS(plus_exports)).default,
    "minus": (init_minus(), __toCommonJS(minus_exports)).default,
    "check": (init_check(), __toCommonJS(check_exports)).default,
    "stop": (init_square(), __toCommonJS(square_exports)).default,
    "restart": (init_rotate_ccw(), __toCommonJS(rotate_ccw_exports)).default,
    "timeline": (init_list_tree(), __toCommonJS(list_tree_exports)).default,
    "tree": (init_folder_tree(), __toCommonJS(folder_tree_exports)).default,
    "search": (init_search(), __toCommonJS(search_exports)).default,
    "grid": (init_layout_grid(), __toCommonJS(layout_grid_exports)).default,
    "list": (init_list(), __toCommonJS(list_exports)).default,
    "select": (init_square_check_big(), __toCommonJS(square_check_big_exports)).default,
    "left": (init_chevron_left(), __toCommonJS(chevron_left_exports)).default,
    "right": (init_chevron_right(), __toCommonJS(chevron_right_exports)).default,
    "folder": (init_folder(), __toCommonJS(folder_exports)).default,
    "folderOpen": (init_folder_open(), __toCommonJS(folder_open_exports)).default,
    "table": (init_table_2(), __toCommonJS(table_2_exports)).default,
    "house": (init_house(), __toCommonJS(house_exports)).default,
    "folderPlus": (init_folder_plus(), __toCommonJS(folder_plus_exports)).default,
    "filePlus": (init_file_plus(), __toCommonJS(file_plus_exports)).default,
    "pencil": (init_pencil(), __toCommonJS(pencil_exports)).default,
    "trash": (init_trash_2(), __toCommonJS(trash_2_exports)).default,
    "close": (init_x(), __toCommonJS(x_exports)).default,
    "down": (init_chevron_down(), __toCommonJS(chevron_down_exports)).default,
    "tag": (init_tag(), __toCommonJS(tag_exports)).default,
    "clock": (init_clock(), __toCommonJS(clock_exports)).default
  };
  function Icon2(props) {
    var C = ICONS[props.name];
    if (!C) return null;
    return h2(C, { size: props.size || 14, strokeWidth: 2, "aria-hidden": "true", className: "wbt-svg" });
  }
  function Countdown(props) {
    var s = React2.useState(Date.now());
    var now = s[0];
    var setNow = s[1];
    React2.useEffect(function() {
      var id = setInterval(function() {
        setNow(Date.now());
      }, 1e3);
      return function() {
        clearInterval(id);
      };
    }, []);
    var diff = props.target - now;
    var over = diff < 0;
    var total = Math.floor(Math.abs(diff) / 1e3);
    var pad = function(n) {
      return (n < 10 ? "0" : "") + n;
    };
    var text = (over ? "\u903E\u671F " : "") + pad(Math.floor(total / 3600)) + ":" + pad(Math.floor(total % 3600 / 60)) + ":" + pad(total % 60);
    return h2("span", {
      className: "wbt-countdown" + (over ? " overdue" : diff < 36e5 ? " soon" : ""),
      title: over ? "\u5DF2\u8D85\u8FC7\u8BA1\u5212\u5B8C\u6210\u65F6\u95F4" : "\u8DDD\u8BA1\u5212\u5B8C\u6210"
    }, h2(Icon2, { name: "clock", size: 11 }), h2("span", { className: "wbt-cd-num" }, text));
  }
  var CSS = [
    ".wbt-root{--wbt-line:var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent));--wbt-surface:var(--dsw-alias-bg-layer-1,color-mix(in oklab,currentColor 4%,transparent));--wbt-bg:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base,#fff));--wbt-accent:var(--dsw-alias-brand-primary,#11a89b);display:flex;flex-direction:column;gap:10px;min-height:0;color:inherit;font-size:13px}",
    ".wbt-pathrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:0 0 2px}",
    ".wbt-tree-slot{flex:0 0 138px;width:138px;margin-right:6px;display:flex;align-items:center}",
    ".wbt-grow{flex:1;min-width:0}",
    ".wbt-btn{border:1px solid var(--wbt-line);background:var(--wbt-surface);color:inherit;border-radius:8px;padding:6px 11px;font-size:12.5px;cursor:pointer;white-space:nowrap;line-height:1.3;display:inline-flex;align-items:center;gap:5px}",
    ".wbt-svg{display:block;flex:none}",
    ".wbt-btn:hover{border-color:var(--wbt-accent)}",
    ".wbt-btn.primary{background:var(--wbt-accent);border-color:var(--wbt-accent);color:var(--dsw-alias-label-primary-inverted,#fff);font-weight:600}",
    ".wbt-btn.ghost{background:transparent}",
    ".wbt-btn.danger{color:var(--dsw-alias-state-error-primary,#e5484d);border-color:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 45%,transparent)}",
    ".wbt-btn:disabled{opacity:.5;cursor:not-allowed}",
    ".wbt-input,.wbt-select,.wbt-textarea{border:1px solid var(--wbt-line);background:transparent;color:inherit;border-radius:8px;padding:7px 10px;font-size:13px;outline:none;min-width:0}",
    ".wbt-input:focus,.wbt-select:focus,.wbt-textarea:focus{border-color:var(--wbt-accent)}",
    ".wbt-input:focus-visible,.wbt-select:focus-visible,.wbt-textarea:focus-visible{outline:none !important;border-color:var(--wbt-accent) !important;box-shadow:0 0 0 3px color-mix(in oklab,var(--wbt-accent) 18%,transparent) !important}",
    ".wbt-btn:focus-visible,.wbt-icon:focus-visible,.wbt-tw:focus-visible,.wbt-tool:focus-visible,.wbt-tab:focus-visible,.wbt-tacts button:focus-visible,.wbt-addbtn:focus-visible,.wbt-search-clear:focus-visible{outline:2px solid color-mix(in oklab,var(--wbt-accent) 55%,transparent);outline-offset:1px}",
    ".wbt-search{width:220px;max-width:46vw}",
    ".wbt-body{display:flex;gap:14px;align-items:flex-start;min-height:0;flex:1}",
    ".wbt-nav{display:flex;flex-direction:column;gap:2px;flex:0 0 138px;width:138px;padding:3px 0;border-right:1px solid var(--wbt-line)}",
    ".wbt-content{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}",
    ".wbt-nav-sep{height:1px;background:var(--wbt-line);margin:5px 9px;opacity:.7}",
    ".wbt-tab{display:flex;align-items:center;text-align:left;width:100%;border:none;background:transparent;color:inherit;opacity:.62;border-radius:8px;padding:8px 10px;cursor:pointer;font-size:12.5px;line-height:1.35;transition:background .12s ease,color .12s ease,opacity .12s ease}",
    ".wbt-tab:hover{opacity:1;background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-tab.on{opacity:1;font-weight:650;background:color-mix(in oklab,var(--wbt-accent) 15%,transparent);color:var(--wbt-accent);box-shadow:inset 2px 0 0 var(--wbt-accent)}",
    ".wbt-filters{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:12px;opacity:.85}",
    ".wbt-check{display:inline-flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap}",
    ".wbt-check input{accent-color:var(--wbt-accent)}",
    ".wbt-crumb{display:flex;align-items:center;gap:3px;flex-wrap:wrap;font-size:12px;opacity:.8}",
    ".wbt-crumb button{border:none;background:none;color:inherit;cursor:pointer;padding:2px 4px;border-radius:5px;font-size:12px}",
    ".wbt-crumb button:hover{background:color-mix(in oklab,currentColor 9%,transparent)}",
    ".wbt-crumb .sep{opacity:.35}",
    ".wbt-list{display:flex;flex-direction:column;gap:7px;min-height:0}",
    ".wbt-item{display:flex;gap:12px;align-items:flex-start;border:1px solid var(--wbt-line);border-radius:12px;background:var(--wbt-surface);padding:11px 13px;min-height:0;transition:border-color .14s ease,box-shadow .14s ease}",
    ".wbt-item:hover{border-color:color-mix(in oklab,var(--wbt-accent) 30%,var(--wbt-line));box-shadow:0 2px 10px rgba(20,30,40,.05)}",
    ".wbt-item.closed{opacity:.62}",
    ".wbt-item.closed .wbt-title{text-decoration:line-through}",
    ".wbt-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}",
    ".wbt-line1{display:flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap}",
    ".wbt-title{font-weight:620;font-size:14px;line-height:1.38;letter-spacing:.1px;word-break:break-word}",
    ".wbt-desc{font-size:12.5px;opacity:.66;line-height:1.55;word-break:break-word;white-space:pre-wrap;max-width:80ch}",
    ".wbt-foot{display:flex;align-items:center;gap:6px 12px;flex-wrap:wrap;margin-top:1px}",
    ".wbt-meta{display:flex;gap:4px 12px;flex-wrap:wrap;font-size:11.5px;opacity:.64;font-variant-numeric:tabular-nums}",
    ".wbt-meta b{font-weight:560;opacity:.9;margin-right:1px}",
    ".wbt-add-desc{border:none;background:none;color:inherit;font:inherit;font-size:12px;line-height:1;opacity:.3;padding:2px 4px;border-radius:5px;cursor:pointer;flex:none}",
    ".wbt-add-desc:hover{opacity:.85;background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-path{display:flex;gap:3px;flex-wrap:wrap;align-items:center;font-size:11.5px;opacity:.58}",
    ".wbt-taskpath{display:flex;align-items:center;gap:6px;margin-top:3px;min-width:0}",
    ".wbt-taskpath .wbt-path{flex:1 1 auto;flex-wrap:nowrap;overflow:hidden;min-width:0;gap:0;opacity:.52;-webkit-mask-image:linear-gradient(90deg,#000 91%,transparent);mask-image:linear-gradient(90deg,#000 91%,transparent)}",
    ".wbt-taskpath .wbt-path button{white-space:nowrap}",
    ".wbt-taskpath .wbt-path .sep{margin:0 1px;opacity:.4}",
    ".wbt-review{margin-top:5px;font-size:12.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word;max-width:80ch;padding:6px 10px;border-radius:0 8px 8px 0;border-left:2px solid color-mix(in oklab,var(--wbt-accent) 42%,transparent);background:color-mix(in oklab,var(--wbt-accent) 6%,transparent)}",
    ".wbt-review-label{font-size:11px;letter-spacing:.04em;opacity:.72;margin-right:5px;font-weight:560}",
    ".wbt-review-add{margin-top:2px;align-self:flex-start;border:none;background:none;color:inherit;font:inherit;font-size:11.5px;padding:2px 3px;border-radius:5px;cursor:pointer;opacity:.42}",
    ".wbt-review-add:hover{opacity:.9;background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-path button{border:none;background:none;color:inherit;padding:2px 3px;border-radius:5px;cursor:pointer;font-size:11.5px;display:inline-flex;align-items:center;gap:4px;line-height:1.2}",
    ".wbt-path button .wbt-svg{opacity:.7;margin-top:-1px}",
    ".wbt-path button:hover{background:color-mix(in oklab,currentColor 8%,transparent);text-decoration:underline}",
    ".wbt-prio{font-size:10px;font-weight:650;padding:2px 6px;border-radius:999px;border:none;background:color-mix(in oklab,currentColor 12%,transparent);opacity:.92;flex:none;font-variant-numeric:tabular-nums}",
    ".wbt-prio.high{color:var(--dsw-alias-state-error-primary,#d93a40)}.wbt-prio.mid{color:var(--dsw-alias-state-warn-primary,#cf6512)}.wbt-prio.low{color:var(--dsw-alias-label-tertiary,#77839a)}",
    ".wbt-tag{font-size:11.5px;line-height:1.5;padding:0 6px;border-radius:999px;background:color-mix(in oklab,var(--wbt-accent) 12%,transparent);color:var(--wbt-accent);cursor:pointer;white-space:nowrap}",
    ".wbt-tag:hover{background:color-mix(in oklab,var(--wbt-accent) 22%,transparent)}",
    ".wbt-tags{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin-top:5px}",
    ".wbt-tagfilter{position:relative;display:flex;align-items:center;gap:5px;min-width:0}",
    ".wbt-tagfilter .wbt-btn.on{border-color:var(--wbt-accent);color:var(--wbt-accent);background:color-mix(in oklab,var(--wbt-accent) 12%,transparent)}",
    ".wbt-tagmenu{position:absolute;z-index:60;top:calc(100% + 6px);right:0;width:236px;max-height:320px;overflow:auto;padding:8px;border-radius:10px;border:1px solid var(--wbt-line);box-shadow:0 14px 34px rgba(26,20,12,.2);background-color:var(--wbt-bg);background-image:linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg));-webkit-backdrop-filter:blur(24px) saturate(1.4);backdrop-filter:blur(24px) saturate(1.4)}",
    ".wbt-tagmenu-head{display:flex;align-items:center;gap:6px;font-size:11px;opacity:.6;padding:2px 4px 7px}",
    ".wbt-tagopt{display:flex;align-items:center;gap:7px;padding:6px;border-radius:6px;cursor:pointer;font-size:12.5px}",
    ".wbt-tagopt:hover{background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-tagopt input{margin:0;accent-color:var(--wbt-accent)}",
    ".wbt-mini{appearance:none;border:0;background:transparent;color:inherit;border-radius:4px;cursor:pointer;font-size:11.5px;line-height:1;padding:3px 5px;font-family:inherit;opacity:.7}",
    ".wbt-mini:hover{background:color-mix(in oklab,currentColor 8%,transparent);opacity:1}",
    ".wbt-note{font-size:11.5px;opacity:.6;padding:6px}",
    ".wbt-tagcnt{font-size:10.5px;opacity:.55;font-variant-numeric:tabular-nums;margin-left:auto}",
    ".wbt-tagnm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".wbt-badge{font-size:10.5px;padding:1px 6px;border-radius:999px;border:none;background:color-mix(in oklab,currentColor 9%,transparent);opacity:.86;white-space:nowrap}",
    '.wbt-badge::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:currentColor;margin-right:4px;vertical-align:1px;opacity:.8}',
    ".wbt-badge.active{color:var(--dsw-alias-brand-primary,#0b8a7f)}",
    ".wbt-badge.done{color:var(--dsw-alias-state-success-primary,#2f9e44)}",
    ".wbt-badge.shutdown{color:var(--dsw-alias-label-tertiary,#7d8698)}.wbt-badge.restarted{color:var(--dsw-alias-state-business-primary,#7048e8)}",
    ".wbt-ops{display:flex;gap:3px;align-items:center;flex-wrap:wrap;flex:none;padding-top:1px}",
    ".wbt-icon{border:none;background:color-mix(in oklab,currentColor 5%,transparent);color:inherit;width:24px;height:24px;border-radius:6px;cursor:pointer;font-size:12.5px;line-height:1;display:inline-flex;align-items:center;justify-content:center;flex:none;opacity:.7;padding:0}",
    ".wbt-icon:hover{opacity:1;background:color-mix(in oklab,var(--wbt-accent) 13%,transparent);color:var(--wbt-accent)}",
    ".wbt-icon.danger:hover{background:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 12%,transparent);color:var(--dsw-alias-state-error-primary,#e5484d)}",
    ".wbt-ops .wbt-btn{border-color:transparent;background:transparent;padding:5px 8px;font-size:12px;border-radius:7px;opacity:.72}",
    ".wbt-ops .wbt-btn:hover{opacity:1;background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-ops .wbt-act-done{color:var(--dsw-alias-state-success-primary,#1f8a4c);background:color-mix(in oklab,var(--dsw-alias-state-success-primary,#2f9e44) 10%,transparent);opacity:.96}",
    ".wbt-ops .wbt-act-done:hover{background:color-mix(in oklab,var(--dsw-alias-state-success-primary,#2f9e44) 16%,transparent)}",
    ".wbt-ops .wbt-act-close{color:var(--dsw-alias-state-error-primary,#b4434a)}",
    ".wbt-ops .wbt-act-close:hover{background:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 10%,transparent)}",
    ".wbt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:9px}",
    ".wbt-card{display:flex;flex-direction:column;gap:6px;min-height:150px}",
    ".wbt-card .wbt-ops{margin-top:auto}",
    ".wbt-empty{border:1px dashed var(--wbt-line);border-radius:11px;padding:34px 12px;text-align:center;opacity:.5;font-size:12.5px}",
    ".wbt-err{font-size:12.5px;color:var(--dsw-alias-state-error-primary,#e5484d);line-height:1.5}",
    ".wbt-pager{display:flex;gap:8px;align-items:center;justify-content:flex-end;font-size:12px;opacity:.8;flex-wrap:wrap}",
    ".wbt-drawer-mask{position:fixed;inset:0;z-index:800;display:flex;background:rgba(26,20,12,.26);animation:wbt-fade .16s ease}",
    ".wbt-drawer{width:392px;max-width:94vw;height:100%;display:flex;flex-direction:column;background-color:var(--wbt-bg);background-image:linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg));-webkit-backdrop-filter:blur(30px) saturate(1.4);backdrop-filter:blur(30px) saturate(1.4);border-right:1px solid var(--wbt-line);box-shadow:0 24px 70px rgba(26,20,12,.3);animation:wbt-slide .18s ease}",
    ".wbt-drawer-head{display:flex;align-items:center;gap:8px;padding:14px 16px 10px}",
    ".wbt-drawer-head>.wbt-svg{opacity:.7}",
    ".wbt-drawer-title{display:flex;align-items:baseline;gap:8px;flex:1;min-width:0}",
    ".wbt-drawer-title b{font-size:14px;font-weight:650;letter-spacing:.2px}",
    ".wbt-drawer-meta{font-size:11px;opacity:.5;white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".wbt-tool{border:1px solid var(--wbt-line);background:color-mix(in oklab,currentColor 3%,transparent);color:inherit;font:inherit;font-size:11.5px;line-height:1;padding:5px 9px;border-radius:7px;cursor:pointer;opacity:.7;white-space:nowrap;flex:none}",
    ".wbt-tool:hover{opacity:.9;background:color-mix(in oklab,currentColor 7%,transparent)}",
    ".wbt-tool.on{opacity:1;border-color:color-mix(in oklab,var(--wbt-accent) 48%,transparent);background:color-mix(in oklab,var(--wbt-accent) 14%,transparent);color:var(--wbt-accent);font-weight:600}",
    ".wbt-drawer-search{padding:0 14px 8px;display:flex;align-items:center;gap:6px}",
    ".wbt-search-clear{flex:none;width:26px;height:26px;border:none;background:color-mix(in oklab,currentColor 6%,transparent);color:inherit;border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;opacity:.6;padding:0}",
    ".wbt-search-clear:hover{opacity:1;background:color-mix(in oklab,currentColor 11%,transparent)}",
    ".wbt-drawer-search .wbt-input{width:100%;box-sizing:border-box;padding:6px 9px;font-size:12.5px;border-radius:8px;background:color-mix(in oklab,currentColor 4%,transparent)}",
    ".wbt-drawer-body{flex:1;overflow:auto;padding:2px 8px 18px}",
    ".wbt-drawer-foot{display:flex;flex-direction:column;gap:7px;padding:10px 14px 12px;border-top:1px solid var(--wbt-line)}",
    ".wbt-drawer-acts{display:flex;gap:6px}",
    ".wbt-addbtn{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--wbt-line);background:color-mix(in oklab,currentColor 3%,transparent);color:inherit;font:inherit;font-size:11.5px;line-height:1;padding:7px 11px;border-radius:8px;cursor:pointer;opacity:.78;transition:opacity .12s ease,background .12s ease,border-color .12s ease,color .12s ease}",
    ".wbt-addbtn:hover{opacity:1;border-color:color-mix(in oklab,var(--wbt-accent) 42%,transparent);color:var(--wbt-accent);background:color-mix(in oklab,var(--wbt-accent) 10%,transparent)}",
    ".wbt-drawer-hint{font-size:10.5px;opacity:.45;line-height:1.55}",
    ".wbt-tree-row{display:flex;align-items:center;gap:1px;border-radius:8px;padding:0 4px 0 2px;height:30px;position:relative}",
    ".wbt-tree-row:hover{background:color-mix(in oklab,currentColor 6%,transparent)}",
    ".wbt-tree-row.sel{background:color-mix(in oklab,var(--wbt-accent) 13%,transparent)}",
    '.wbt-tree-row.sel::before{content:"";position:absolute;left:-4px;top:7px;bottom:7px;width:2.5px;border-radius:2px;background:var(--wbt-accent)}',
    ".wbt-tree-row.sel .nm{color:var(--wbt-accent);font-weight:620}",
    ".wbt-tree-row.drop{outline:1px dashed var(--wbt-accent);outline-offset:-1px}",
    ".wbt-tw{width:16px;height:30px;border:none;background:none;color:inherit;cursor:pointer;opacity:.45;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:0}",
    ".wbt-tw:hover{opacity:.9}",
    ".wbt-tw.void{visibility:hidden;cursor:default}",
    ".wbt-ti{display:inline-flex;align-items:center;justify-content:center;width:16px;flex:none;opacity:.55}",
    ".wbt-tree-row.sel .wbt-ti{opacity:.95}",
    ".wbt-tn{flex:1;min-width:0;height:100%;display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12.5px}",
    ".wbt-tn .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".wbt-tcnt{font-size:10px;opacity:.38;font-variant-numeric:tabular-nums;flex:none}",
    ".wbt-tacts{display:flex;gap:0;opacity:0;flex:none;transition:opacity .12s ease}",
    ".wbt-tree-row:hover .wbt-tacts{opacity:1}",
    ".wbt-tacts button{border:none;background:none;color:inherit;cursor:pointer;width:23px;height:23px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;opacity:.5;padding:0}",
    ".wbt-tacts button:hover{background:color-mix(in oklab,currentColor 11%,transparent);opacity:.95}",
    ".wbt-tacts button.wbt-danger:hover{color:var(--dsw-alias-state-error-primary,#e5484d);background:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 12%,transparent)}",
    "@keyframes wbt-fade{from{opacity:0}to{opacity:1}}",
    "@keyframes wbt-slide{from{transform:translateX(-14px);opacity:.5}to{transform:none;opacity:1}}",
    ".wbt-modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.28);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}",
    ".wbt-modal{width:560px;max-width:96vw;max-height:90vh;overflow:auto;background-color:var(--wbt-bg);background-image:linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg));-webkit-backdrop-filter:blur(30px) saturate(1.4);backdrop-filter:blur(30px) saturate(1.4);border:1px solid var(--wbt-line);border-radius:14px;box-shadow:0 20px 60px rgba(26,20,12,.3);padding:15px 17px;display:flex;flex-direction:column;gap:11px}",
    ".wbt-modal.wide{width:820px}",
    ".wbt-modal-head{display:flex;align-items:center;gap:8px}",
    ".wbt-modal-head h3{margin:0;font-size:14.5px;font-weight:650;flex:1}",
    ".wbt-form{display:grid;grid-template-columns:1fr 1fr;gap:9px}",
    ".wbt-field{display:flex;flex-direction:column;gap:4px;font-size:12px;min-width:0}",
    ".wbt-field.full{grid-column:1 / -1}",
    ".wbt-field>span{opacity:.62;font-size:11.5px}",
    ".wbt-modal-foot{display:flex;gap:8px;justify-content:flex-end;align-items:center;margin-top:2px}",
    ".wbt-timeline{display:flex;flex-direction:column;gap:0;margin:2px 0}",
    ".wbt-tl-item{display:flex;gap:9px;min-height:40px}",
    ".wbt-tl-rail{width:12px;display:flex;flex-direction:column;align-items:center;flex:none}",
    ".wbt-tl-dot{width:8px;height:8px;border-radius:50%;background:var(--wbt-accent);margin-top:5px}",
    ".wbt-tl-line{width:1px;flex:1;background:var(--wbt-line)}",
    ".wbt-tl-body{padding:0 0 10px;min-width:0;flex:1}",
    ".wbt-tl-title{font-weight:600;font-size:12.5px}",
    ".wbt-tl-meta{font-size:11px;opacity:.58;display:flex;gap:7px;flex-wrap:wrap;margin-top:2px}",
    ".wbt-selbar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:900;display:flex;gap:8px;align-items:center;background-color:var(--wbt-bg);background-image:linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg)),linear-gradient(var(--wbt-bg),var(--wbt-bg));-webkit-backdrop-filter:blur(30px) saturate(1.4);backdrop-filter:blur(30px) saturate(1.4);border:1px solid var(--wbt-line);box-shadow:0 10px 34px rgba(26,20,12,.24);border-radius:12px;padding:8px 11px;max-width:94vw;flex-wrap:wrap}",
    ".wbt-toast{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:1100;background:var(--dsw-alias-toast-bg,#1f2328);color:var(--dsw-alias-toast-label,#fff);border-radius:9px;padding:8px 14px;font-size:12.5px;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:90vw;text-align:center}",
    ".wbt-stars{color:var(--dsw-alias-state-warn-primary,#f59f00);font-size:11px;letter-spacing:.5px;white-space:nowrap}",
    ".wbt-sum{display:flex;gap:5px;flex-wrap:wrap;font-size:11px;opacity:.55}",
    ".wbt-nowrap{white-space:nowrap}",
    ".wbt-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}",
    ".wbt-split{display:flex;gap:12px;align-items:flex-start}",
    ".wbt-col{flex:1;min-width:0}",
    ".wbt-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}",
    ".wbt-pill{font-size:11px;padding:2px 7px;border-radius:999px;background:color-mix(in oklab,var(--wbt-accent) 12%,transparent);color:var(--wbt-accent)}",
    ".wbt-hint{font-size:11.5px;opacity:.55;line-height:1.5}",
    ".wbt-danger{color:var(--dsw-alias-state-error-primary,#e5484d)}",
    ".wbt-countdown{display:inline-flex;align-items:center;gap:3px;margin-left:5px;padding:1px 6px 1px 5px;border-radius:6px;font-size:10.5px;font-weight:600;letter-spacing:.2px;color:var(--dsw-alias-state-error-primary,#e5484d);background:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 9%,transparent);border:1px solid color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 20%,transparent);vertical-align:1px}",
    '.wbt-countdown .wbt-cd-num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}',
    ".wbt-countdown.soon{background:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 14%,transparent);border-color:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 32%,transparent)}",
    ".wbt-countdown.overdue{color:var(--dsw-alias-label-primary-inverted,#fff);background:var(--dsw-alias-state-error-primary,#e5484d);border-color:transparent}",
    "@media (max-width:760px){.wbt-body{flex-direction:column;gap:8px}.wbt-nav{flex-direction:row;width:100%;flex:0 0 auto;overflow-x:auto;border-right:none;border-bottom:1px solid var(--wbt-line);padding:0 0 6px}.wbt-tab{width:auto;white-space:nowrap;padding:6px 9px}.wbt-tab.on{box-shadow:inset 0 -2px 0 var(--wbt-accent)}.wbt-nav-sep{width:1px;height:18px;flex:none;margin:auto 4px}.wbt-tree-slot{flex:0 0 auto;width:auto;margin-right:0}.wbt-pathrow .wbt-search{flex:1 1 160px;max-width:none}}",
    "@media (max-width:640px){.wbt-form{grid-template-columns:1fr}.wbt-drawer{width:94vw}.wbt-search{width:100%}.wbt-item{padding:9px}.wbt-ops{width:100%;justify-content:flex-end}}"
  ].join("\n");
  function injectCss() {
    if (typeof document === "undefined") return;
    var old = document.getElementById("wb-addon-tasks-v2-css");
    if (old) {
      old.textContent = CSS;
      return;
    }
    var s = document.createElement("style");
    s.id = "wb-addon-tasks-v2-css";
    s.setAttribute("data-wb-addon", "wb-addon-tasks");
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(" ");
  }
  function addDays(n) {
    var d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + Number(n || 0));
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function today() {
    var d = /* @__PURE__ */ new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function daysBetween(dateText) {
    if (!dateText) return null;
    var d = /* @__PURE__ */ new Date(String(dateText) + "T00:00:00");
    if (Number.isNaN(d.getTime())) return null;
    var n = /* @__PURE__ */ new Date();
    n.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - n.getTime()) / 864e5);
  }
  function splitTags(text) {
    var out = [];
    String(text || "").split(/[,，]/).forEach(function(x) {
      var v = String(x).trim();
      if (v && out.indexOf(v) < 0) out.push(v);
    });
    return out;
  }
  function tagNames(task) {
    return (task && task.tags ? task.tags : []).map(function(x) {
      return String(x.name || "");
    }).filter(Boolean);
  }
  function statusInfo(id) {
    return STATUS[String(id)] || STATUS["0"];
  }
  function treeFlat(nodes, depth, out) {
    var arr = out || [];
    for (var i = 0; i < (nodes || []).length; i++) {
      var n = nodes[i];
      arr.push({ id: String(n.id), name: n.name, type: String(n.type), depth: depth || 0 });
      if (n.children && n.children.length) treeFlat(n.children, (depth || 0) + 1, arr);
    }
    return arr;
  }
  function treeWalk(nodes, depth, out) {
    var arr = out || [];
    for (var i = 0; i < (nodes || []).length; i++) {
      var n = nodes[i];
      arr.push({ node: n, depth: depth || 0 });
      if (n.children && n.children.length) treeWalk(n.children, (depth || 0) + 1, arr);
    }
    return arr;
  }
  function findFirstTable(nodes) {
    for (var i = 0; i < (nodes || []).length; i++) {
      var n = nodes[i];
      if (String(n.type) === "1") return n;
      var found = findFirstTable(n.children || []);
      if (found) return found;
    }
    return null;
  }
  function findNode(nodes, id) {
    for (var i = 0; i < (nodes || []).length; i++) {
      var n = nodes[i];
      if (String(n.id) === String(id)) return n;
      var found = findNode(n.children || [], id);
      if (found) return found;
    }
    return null;
  }
  function allTables(nodes) {
    return treeFlat(nodes).filter(function(n) {
      return n.type === "1";
    });
  }
  function pClass(n) {
    return n >= 6 ? "high" : n >= 3 ? "mid" : "low";
  }
  function stars(n) {
    var v = Number(n || 0);
    var full = Math.floor(v);
    var half = v - full >= 0.5;
    var out = "";
    for (var i = 0; i < full; i++) out += "\u2605";
    if (half) out += "\u2BEA";
    for (var j = full + (half ? 1 : 0); j < 5; j++) out += "\u2606";
    return out;
  }
  function pathIcon(type) {
    var code = String(type);
    return code === "1" ? "table" : code === "2" ? "house" : "folder";
  }
  function PathCrumbs(props) {
    var path = props.path || [];
    if (!path.length) return null;
    return h2("div", { className: "wbt-path" }, path.map(function(p, i) {
      return h2(
        React2.Fragment,
        { key: p.id + "-" + i },
        i > 0 ? h2("span", { className: "sep", children: "\u203A" }) : null,
        h2("button", {
          type: "button",
          title: p.name || p.id,
          onClick: function(e) {
            e.stopPropagation();
            if (props.onPick) props.onPick(p, i, path);
          }
        }, h2(Icon2, { name: pathIcon(p.type), size: 11 }), h2("span", null, p.name || p.id))
      );
    }));
  }
  function TaskItem(props) {
    var t = props.t;
    var task = props.task;
    var st = statusInfo(task.status);
    var stName = props.lang === "en" ? st.en : st.zh;
    var myTags = task.tags || [];
    var isActive = String(task.status) === "0";
    var titleState = React2.useState(null);
    var editingTitle = titleState[0], setEditingTitle = titleState[1];
    var descState = React2.useState(null);
    var editingDesc = descState[0], setEditingDesc = descState[1];
    var revState = React2.useState(null);
    var editingReview = revState[0], setEditingReview = revState[1];
    var titleRef = React2.useRef(null);
    var descRef = React2.useRef(null);
    var revRef = React2.useRef(null);
    React2.useEffect(function() {
      if (editingTitle !== null && titleRef.current) titleRef.current.focus();
    }, [editingTitle]);
    React2.useEffect(function() {
      if (editingDesc !== null && descRef.current) descRef.current.focus();
    }, [editingDesc]);
    React2.useEffect(function() {
      if (editingReview !== null && revRef.current) revRef.current.focus();
    }, [editingReview]);
    function beginTitle() {
      setEditingTitle(String(task.title || ""));
    }
    function saveTitle() {
      if (editingTitle === null) return;
      var v = String(editingTitle).trim();
      if (!v) {
        props.toast(t.needTitle);
        setEditingTitle(null);
        return;
      }
      if (v !== String(task.title || "")) props.update(task, { type: "TITLE", title: v });
      setEditingTitle(null);
    }
    function beginDesc() {
      if (!isActive) return;
      setEditingDesc(String(task.description || ""));
    }
    function saveDesc() {
      if (editingDesc === null) return;
      if (String(editingDesc) !== String(task.description || "")) {
        props.update(task, { type: "DESCRIPTION", description: String(editingDesc) });
      }
      setEditingDesc(null);
    }
    function beginReview() {
      setEditingReview(String(task.review || ""));
    }
    function saveReview() {
      if (editingReview === null) return;
      if (String(editingReview) !== String(task.review || "")) {
        props.update(task, { type: "REVIEW", review: String(editingReview) });
      }
      setEditingReview(null);
    }
    var isDone = String(task.status) === "2";
    var countdown = String(task.status) === "0" ? daysBetween(task.targetDate) : null;
    var cdTarget = String(task.status) === "0" && task.targetDate ? (/* @__PURE__ */ new Date(String(task.targetDate) + "T23:59:59")).getTime() : NaN;
    var tagNodes = myTags.map(function(tag) {
      return h2("span", {
        key: "tag-" + String(tag.id),
        className: "wbt-tag",
        title: tag.name,
        onClick: props.onTagPick ? function(e) {
          e.stopPropagation();
          props.onTagPick(String(tag.id));
        } : null
      }, "#" + tag.name);
    });
    var meta = [];
    if (task.publishDate) meta.push(h2("span", { key: "p" }, h2("b", null, t.publish), " ", task.publishDate));
    if (String(task.status) === "0" && task.targetDate) {
      meta.push(h2(
        "span",
        { key: "g" },
        h2("b", null, t.target),
        " ",
        task.targetDate,
        Number.isFinite(cdTarget) ? h2(Countdown, { target: cdTarget }) : null
      ));
    } else if (String(task.status) === "2") {
      if (task.targetDate) meta.push(h2("span", { key: "g" }, h2("b", null, t.target), " ", task.targetDate));
      if (task.doneDate) meta.push(h2("span", { key: "d" }, h2("b", null, t.done), " ", task.doneDate));
      meta.push(h2("span", { key: "s", className: "wbt-stars", children: stars(task.difficulty) + " " + Number(task.difficulty || 0).toFixed(1) }));
    } else {
      if (task.targetDate) meta.push(h2("span", { key: "g" }, h2("b", null, t.target), " ", task.targetDate));
      if (task.shutdownDate) meta.push(h2("span", { key: "s" }, h2("b", null, t.shutdown), " ", task.shutdownDate));
    }
    var ops = [];
    if (isActive) {
      ops.push(h2("button", { key: "p+", className: "wbt-icon", title: t.priority + " +1", onClick: function() {
        if (task.priority < 10) props.update(task, { type: "PRIORITY", priority: Number(task.priority) + 1 });
      } }, h2(Icon2, { name: "plus", size: 14 })));
      ops.push(h2("button", { key: "p-", className: "wbt-icon", title: t.priority + " -1", onClick: function() {
        if (task.priority > 0) props.update(task, { type: "PRIORITY", priority: Number(task.priority) - 1 });
      } }, h2(Icon2, { name: "minus", size: 14 })));
      ops.push(h2("button", { key: "done", className: "wbt-btn wbt-act-done", onClick: function() {
        props.onDone(task);
      } }, h2(Icon2, { name: "check", size: 14 }), t.complete));
      ops.push(h2("button", { key: "shut", className: "wbt-btn wbt-act-close", onClick: function() {
        props.update(task, { type: "STATUS", status: "1", date: today() });
      } }, h2(Icon2, { name: "stop", size: 14 }), t.shutdownOp));
    }
    ops.push(h2("button", { key: "restart", className: "wbt-btn ghost", onClick: function() {
      props.onRestart(task);
    } }, h2(Icon2, { name: "restart", size: 14 }), t.restart));
    ops.push(h2("button", { key: "timeline", className: "wbt-btn ghost", onClick: function() {
      props.onTimeline(task);
    } }, h2(Icon2, { name: "timeline", size: 14 }), t.timeline));
    var titleNode = editingTitle !== null ? h2("input", {
      ref: titleRef,
      className: "wbt-input",
      style: { fontSize: "13px", padding: "4px 7px" },
      value: editingTitle,
      onChange: function(e) {
        setEditingTitle(e.target.value);
      },
      onKeyDown: function(e) {
        if (e.key === "Enter") {
          e.preventDefault();
          saveTitle();
        }
        if (e.key === "Escape") setEditingTitle(null);
      },
      onBlur: saveTitle
    }) : h2("div", { className: "wbt-title", onDoubleClick: beginTitle, title: t.editTitle }, task.title);
    var descNode = editingDesc !== null ? h2("textarea", {
      ref: descRef,
      className: "wbt-textarea",
      rows: 2,
      value: editingDesc,
      onChange: function(e) {
        setEditingDesc(e.target.value);
      },
      onKeyDown: function(e) {
        if (e.key === "Escape") setEditingDesc(null);
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          saveDesc();
        }
      },
      onBlur: saveDesc
    }) : task.description ? h2("div", { className: "wbt-desc", onDoubleClick: beginDesc }, task.description) : null;
    var addDesc = !task.description && isActive && editingDesc === null ? h2("button", { key: "add-desc", className: "wbt-add-desc", title: t.desc, onClick: beginDesc }, "\uFF0B") : null;
    var reviewNode = editingReview !== null ? h2("textarea", {
      ref: revRef,
      className: "wbt-textarea",
      rows: 2,
      placeholder: t.reviewPlaceholder,
      value: editingReview,
      onChange: function(e) {
        setEditingReview(e.target.value);
      },
      onKeyDown: function(e) {
        if (e.key === "Escape") setEditingReview(null);
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          saveReview();
        }
      },
      onBlur: saveReview
    }) : task.review ? h2(
      "div",
      { className: "wbt-review", title: isDone ? "\u53CC\u51FB\u7F16\u8F91" + t.review : "", onDoubleClick: isDone ? beginReview : null },
      h2("span", { className: "wbt-review-label" }, t.review),
      task.review
    ) : null;
    var addReview = isDone && !task.review && editingReview === null ? h2("button", { key: "add-review", className: "wbt-review-add", onClick: beginReview }, "\uFF0B " + t.reviewAdd) : null;
    return h2(
      "div",
      { className: cx("wbt-item", props.card && "wbt-card", String(task.status) === "1" && "closed") },
      props.selectionMode ? h2("input", { type: "checkbox", className: "wbt-check", checked: !!props.checked, onChange: function() {
        props.onCheck(task.id);
      } }) : null,
      h2(
        "div",
        { className: "wbt-main" },
        h2(
          "div",
          { className: "wbt-line1" },
          h2("span", { className: "wbt-prio " + pClass(task.priority), children: "P" + task.priority }),
          h2("span", { className: "wbt-badge " + st.cls, children: stName }),
          titleNode,
          addDesc
        ),
        descNode,
        reviewNode,
        addReview,
        tagNodes.length ? h2("div", { className: "wbt-tags", key: "tags" }, tagNodes) : null,
        h2("div", { className: "wbt-foot" }, meta.length ? h2("div", { className: "wbt-meta", key: "meta" }, meta) : null),
        task.path && task.path.length ? h2("div", { className: "wbt-taskpath" }, h2(PathCrumbs, { key: "path", path: task.path, t, onPick: props.onPathPick })) : null
      ),
      h2("div", { className: "wbt-ops" }, ops)
    );
  }
  function TreeNode(props) {
    var node = props.node;
    var t = props.t;
    var expanded = props.expanded;
    var isExpanded = expanded.has(String(node.id));
    var hasKids = node.children && node.children.length > 0;
    var selected = props.selectedTable === String(node.id) || !props.selectedTable && props.selectedGroup === String(node.id);
    var isTable = String(node.type) === "1";
    var isRoot = String(node.parent) === "0" || String(node.parentId) === "0";
    var pad = 3 + (props.depth || 0) * 15;
    var editing = props.edit && String(props.edit.id) === String(node.id);
    var kids = node.children ? node.children.length : 0;
    function toggle(e) {
      e.stopPropagation();
      props.onToggle(node.id);
    }
    function select() {
      props.onSelect(node);
    }
    function stop(fn) {
      return function(e) {
        e.stopPropagation();
        fn();
      };
    }
    function drop(e) {
      e.preventDefault();
      e.stopPropagation();
      var src = props.dragId;
      if (!src || String(src) === String(node.id)) return;
      var asChild = !isTable && isExpanded;
      props.onMove(src, node.id, asChild ? 0 : 2);
    }
    return h2(
      "div",
      null,
      h2(
        "div",
        {
          className: cx("wbt-tree-row", selected && "sel", props.dropId === String(node.id) && "drop"),
          style: { paddingLeft: pad + "px" },
          draggable: props.manager && !isRoot,
          onDragStart: function(e) {
            props.onDragStart(node.id);
          },
          onDragOver: function(e) {
            e.preventDefault();
            props.onDragOver(node.id);
          },
          onDrop: drop
        },
        isTable || !hasKids ? h2("span", { className: "wbt-tw void" }) : h2("button", { className: "wbt-tw", "aria-label": node.name, "aria-expanded": !!isExpanded, onClick: toggle }, h2(Icon2, { name: isExpanded ? "down" : "right", size: 12 })),
        h2("span", { className: "wbt-ti" }, h2(Icon2, { name: isRoot ? "house" : isTable ? "table" : isExpanded ? "folderOpen" : "folder", size: 13 })),
        h2(
          "div",
          { className: "wbt-tn", onClick: select, title: node.name },
          editing ? h2("input", {
            className: "wbt-input",
            style: { padding: "2px 6px", fontSize: "12px", width: "150px" },
            value: props.editName,
            autoFocus: true,
            onClick: function(e) {
              e.stopPropagation();
            },
            onChange: function(e) {
              props.onEditName(e.target.value);
            },
            onKeyDown: function(e) {
              if (e.key === "Enter") {
                e.preventDefault();
                props.onRename(node.id, props.editName);
              }
              if (e.key === "Escape") props.onCancelEdit();
            },
            onBlur: function() {
              props.onRename(node.id, props.editName);
            }
          }) : h2("span", { className: "nm" }, node.name),
          !isTable && hasKids && !editing ? h2("span", { className: "wbt-tcnt" }, kids) : null
        ),
        h2(
          "div",
          { className: "wbt-tacts" },
          !isTable ? h2("button", { title: t.addGroup, "aria-label": t.addGroup, onClick: stop(function() {
            props.onAdd(node.id, "0");
          }) }, h2(Icon2, { name: "folderPlus", size: 12 })) : null,
          !isTable ? h2("button", { title: t.addTable, "aria-label": t.addTable, onClick: stop(function() {
            props.onAdd(node.id, "1");
          }) }, h2(Icon2, { name: "filePlus", size: 12 })) : null,
          !isRoot ? h2("button", { title: t.rename, "aria-label": t.rename, onClick: stop(function() {
            props.onEdit(node);
          }) }, h2(Icon2, { name: "pencil", size: 12 })) : null,
          props.manager && !isRoot ? h2("button", { title: t.del, "aria-label": t.del, className: "wbt-danger", onClick: stop(function() {
            props.onDelete(node);
          }) }, h2(Icon2, { name: "trash", size: 12 })) : null
        )
      ),
      isExpanded && hasKids ? h2("div", null, node.children.map(function(kid) {
        return h2(TreeNode, Object.assign({}, props, { key: kid.id, node: kid, depth: (props.depth || 0) + 1 }));
      })) : null
    );
  }
  function CreateModal(props) {
    var t = props.t;
    var source = props.source || "0";
    var origin = props.originTask || null;
    var tables = allTables(props.tree);
    var first = props.defaultTableId || origin && origin.tableId || tables[0] && tables[0].id || "";
    var initTags = origin ? tagNames(origin).join(", ") : "";
    var initTable = origin ? String(origin.tableId || first) : String(first);
    var defaults = props.defaults || {};
    var initPriority = Math.floor(Number(defaults.priority));
    if (!(initPriority >= 1)) initPriority = 1;
    var initDifficulty = Math.floor(Number(defaults.difficulty));
    if (!(initDifficulty >= 1)) initDifficulty = 1;
    var initOffset = Math.floor(Number(defaults.targetOffset));
    if (!(initOffset >= 0)) initOffset = 0;
    var f = React2.useState({
      title: "",
      description: "",
      tags: initTags,
      status: "0",
      priority: initPriority,
      difficulty: initDifficulty,
      publishDate: today(),
      targetDate: addDays(initOffset),
      doneDate: today(),
      shutdownDate: today(),
      tableId: initTable
    });
    var form = f[0], setForm = f[1];
    var busy = React2.useState(false);
    var isBusy = busy[0], setBusy = busy[1];
    var err = React2.useState("");
    var error = err[0], setError = err[1];
    function set(k, v) {
      var next = Object.assign({}, form);
      next[k] = v;
      setForm(next);
    }
    function submit() {
      if (!String(form.title).trim()) {
        setError(t.needTitle);
        return;
      }
      if (!form.tableId) {
        setError(t.needTable);
        return;
      }
      if (!form.publishDate || !form.targetDate) {
        setError(t.needDate);
        return;
      }
      setBusy(true);
      setError("");
      var args = {
        title: String(form.title).trim(),
        description: String(form.description || ""),
        tags: splitTags(form.tags),
        status: source === "2" ? "0" : String(form.status),
        priority: Number(form.priority) || 0,
        tableId: String(form.tableId),
        publishDate: form.publishDate,
        targetDate: form.targetDate,
        source
      };
      if (source !== "0" && origin) {
        args.timelineKey = String(origin.timelineKey || origin.id);
        args.restartKey = source === "2" ? String(origin.id) : void 0;
      }
      if (args.status === "2") {
        args.doneDate = form.doneDate || today();
        args.difficulty = Number(form.difficulty) || 0;
      }
      if (args.status === "1") args.shutdownDate = form.shutdownDate || today();
      props.api.call("tasks.create", args).then(function(r) {
        if (!r || !r.ok) {
          setError(r && r.error || "create failed");
          setBusy(false);
          return;
        }
        props.onCreated();
      }).catch(function(e) {
        setError(String(e && e.message || e));
        setBusy(false);
      });
    }
    var title = source === "2" ? t.restartTitle : source === "1" ? t.newTimeline : t.newTask;
    return h2(
      "div",
      { className: "wbt-modal-mask", onMouseDown: function(e) {
        if (e.target === e.currentTarget) props.onClose();
      } },
      h2(
        "div",
        { className: "wbt-modal" },
        h2("div", { className: "wbt-modal-head" }, h2("h3", null, title), h2("button", { className: "wbt-icon", onClick: props.onClose }, "\xD7")),
        source !== "0" && origin ? h2("div", { className: "wbt-hint" }, "\u6765\u6E90\uFF1A" + (origin.title || origin.id) + (source === "2" ? " \xB7 \u91CD\u542F\u94FE " + (origin.restartKey || origin.id) : " \xB7 \u65F6\u95F4\u7EBF " + (origin.timelineKey || origin.id))) : null,
        h2(
          "div",
          { className: "wbt-form" },
          h2("label", { className: "wbt-field full" }, h2("span", null, t.titleField + " *"), h2("input", { className: "wbt-input", value: form.title, onChange: function(e) {
            set("title", e.target.value);
          }, autoFocus: true })),
          h2("label", { className: "wbt-field full" }, h2("span", null, t.desc), h2("textarea", { className: "wbt-textarea", rows: 2, value: form.description, onChange: function(e) {
            set("description", e.target.value);
          } })),
          h2("label", { className: "wbt-field full" }, h2("span", null, t.tags), h2("input", { className: "wbt-input", value: form.tags, placeholder: t.tagPlaceholder, onChange: function(e) {
            set("tags", e.target.value);
          } })),
          h2("label", { className: "wbt-field" }, h2("span", null, t.status), h2(
            "select",
            { className: "wbt-select", value: source === "2" ? "0" : form.status, disabled: source === "2", onChange: function(e) {
              set("status", e.target.value);
            } },
            h2("option", { value: "0" }, "\u5DF2\u5F00\u542F"),
            h2("option", { value: "2" }, "\u5DF2\u5B8C\u6210"),
            h2("option", { value: "1" }, "\u5DF2\u5173\u95ED")
          )),
          h2("label", { className: "wbt-field" }, h2("span", null, t.priority + "\uFF080\u201310\uFF09"), h2("input", { className: "wbt-input", type: "number", min: 0, max: 10, value: form.priority, onChange: function(e) {
            set("priority", e.target.value);
          } })),
          h2("label", { className: "wbt-field" }, h2("span", null, t.table + " *"), h2("select", { className: "wbt-select", value: form.tableId, onChange: function(e) {
            set("tableId", e.target.value);
          } }, tables.map(function(x) {
            return h2("option", { key: x.id, value: x.id }, "\u3000".repeat(x.depth) + x.name);
          }))),
          h2("label", { className: "wbt-field" }, h2("span", null, t.publishDate), h2("input", { className: "wbt-input", type: "date", value: form.publishDate, onChange: function(e) {
            set("publishDate", e.target.value);
          } })),
          h2("label", { className: "wbt-field" }, h2("span", null, t.targetDate), h2("input", { className: "wbt-input", type: "date", value: form.targetDate, onChange: function(e) {
            set("targetDate", e.target.value);
          } })),
          source !== "2" && form.status === "2" ? h2("label", { className: "wbt-field" }, h2("span", null, t.doneDate), h2("input", { className: "wbt-input", type: "date", value: form.doneDate, onChange: function(e) {
            set("doneDate", e.target.value);
          } })) : null,
          source !== "2" && form.status === "2" ? h2("label", { className: "wbt-field" }, h2("span", null, t.difficulty + "\uFF080\u20135\uFF09"), h2("input", { className: "wbt-input", type: "number", min: 0, max: 5, step: 0.5, value: form.difficulty, onChange: function(e) {
            set("difficulty", e.target.value);
          } })) : null,
          source !== "2" && form.status === "1" ? h2("label", { className: "wbt-field" }, h2("span", null, t.shutdownDate), h2("input", { className: "wbt-input", type: "date", value: form.shutdownDate, onChange: function(e) {
            set("shutdownDate", e.target.value);
          } })) : null
        ),
        error ? h2("div", { className: "wbt-err" }, error) : null,
        h2(
          "div",
          { className: "wbt-modal-foot" },
          h2("button", { className: "wbt-btn ghost", onClick: props.onClose }, t.cancel),
          h2("button", { className: "wbt-btn primary", disabled: isBusy, onClick: submit }, isBusy ? "\u2026" : t.create)
        )
      )
    );
  }
  function TimelineModal(props) {
    var t = props.t;
    var task = props.task;
    var s = React2.useState({ items: [], loading: true, error: "" });
    var state = s[0], setState = s[1];
    React2.useEffect(function() {
      props.api.call("tasks.timeline", { timelineKey: task.timelineKey }).then(function(r) {
        if (r && r.ok) setState({ items: Array.isArray(r.result) ? r.result : [], loading: false, error: "" });
        else setState({ items: [], loading: false, error: r && r.error || "load failed" });
      }).catch(function(e) {
        setState({ items: [], loading: false, error: String(e && e.message || e) });
      });
    }, [task.timelineKey]);
    var items = state.items;
    var last = items.length ? items[items.length - 1] : task;
    return h2(
      "div",
      { className: "wbt-modal-mask", onMouseDown: function(e) {
        if (e.target === e.currentTarget) props.onClose();
      } },
      h2(
        "div",
        { className: "wbt-modal wide" },
        h2(
          "div",
          { className: "wbt-modal-head" },
          h2("h3", null, t.timelineTitle),
          h2("button", { className: "wbt-btn", onClick: function() {
            props.onCreateTimeline(last);
          } }, "\uFF0B " + t.newTimeline),
          h2("button", { className: "wbt-icon", onClick: props.onClose }, "\xD7")
        ),
        state.loading ? h2("div", { className: "wbt-hint" }, t.loading) : state.error ? h2("div", { className: "wbt-err" }, t.error + state.error) : items.length === 0 ? h2("div", { className: "wbt-empty" }, t.noTimeline) : h2("div", { className: "wbt-timeline" }, items.map(function(x, i) {
          var st = statusInfo(x.status);
          return h2(
            "div",
            { className: "wbt-tl-item", key: x.id },
            h2("div", { className: "wbt-tl-rail" }, h2("div", { className: "wbt-tl-dot" }), i < items.length - 1 ? h2("div", { className: "wbt-tl-line" }) : null),
            h2(
              "div",
              { className: "wbt-tl-body" },
              h2(
                "div",
                { className: "wbt-row" },
                h2("span", { className: "wbt-badge " + st.cls }, st.zh),
                h2("span", { className: "wbt-tl-title" }, x.title),
                h2("span", { className: "wbt-pill" }, "P" + x.priority)
              ),
              h2(
                "div",
                { className: "wbt-tl-meta" },
                h2("span", null, "\u53D1\u5E03 " + (x.publishDate || "-")),
                h2("span", null, "\u8BA1\u5212 " + (x.targetDate || "-")),
                x.doneDate ? h2("span", null, "\u5B8C\u6210 " + x.doneDate) : null,
                x.shutdownDate ? h2("span", null, "\u5173\u95ED " + x.shutdownDate) : null
              ),
              h2(PathCrumbs, { path: x.path })
            )
          );
        }))
      )
    );
  }
  function DoneModal(props) {
    var t = props.t;
    var s = React2.useState(1);
    var value = s[0], setValue = s[1];
    var rs = React2.useState("");
    var review = rs[0], setReview = rs[1];
    var busy = React2.useState(false);
    var isBusy = busy[0], setBusy = busy[1];
    return h2(
      "div",
      { className: "wbt-modal-mask", onMouseDown: function(e) {
        if (e.target === e.currentTarget) props.onClose();
      } },
      h2(
        "div",
        { className: "wbt-modal", style: { width: "420px" } },
        h2("div", { className: "wbt-modal-head" }, h2("h3", null, t.complete + " \xB7 " + props.task.title), h2("button", { className: "wbt-icon", onClick: props.onClose }, "\xD7")),
        h2("div", { className: "wbt-hint" }, t.difficultyHint),
        h2(
          "div",
          { className: "wbt-row" },
          h2("span", { className: "wbt-stars", style: { fontSize: "22px" } }, stars(value)),
          h2("input", { type: "range", min: 0.5, max: 5, step: 0.5, value, onChange: function(e) {
            setValue(Number(e.target.value));
          }, style: { flex: 1 } }),
          h2("b", null, value.toFixed(1))
        ),
        h2(
          "label",
          { className: "wbt-field", style: { marginTop: "12px" } },
          h2("span", null, t.review + " \xB7 " + t.reviewHint),
          h2("textarea", { className: "wbt-textarea", rows: 3, placeholder: t.reviewPlaceholder, value: review, onChange: function(e) {
            setReview(e.target.value);
          } })
        ),
        h2(
          "div",
          { className: "wbt-modal-foot" },
          h2("button", { className: "wbt-btn ghost", onClick: props.onClose }, t.cancel),
          h2("button", { className: "wbt-btn primary", disabled: isBusy, onClick: function() {
            if (!value || value <= 0) return;
            setBusy(true);
            props.api.call("tasks.update", { id: props.task.id, type: "STATUS", status: "2", date: today(), difficulty: value, review: String(review || "") }).then(function(r) {
              setBusy(false);
              if (r && r.ok) props.onDone();
              else props.onError(r && r.error || "update failed");
            });
          } }, isBusy ? "\u2026" : t.confirm)
        )
      )
    );
  }
  function BatchModal(props) {
    var t = props.t;
    var items = props.items || [];
    var mode = props.mode;
    var s = React2.useState(mode === "timeline" ? items[0] && items[0].id || "" : props.tables[0] && props.tables[0].id || "");
    var value = s[0], setValue = s[1];
    var busy = React2.useState(false);
    var isBusy = busy[0], setBusy = busy[1];
    var err = React2.useState("");
    var error = err[0], setError = err[1];
    return h2(
      "div",
      { className: "wbt-modal-mask", onMouseDown: function(e) {
        if (e.target === e.currentTarget) props.onClose();
      } },
      h2(
        "div",
        { className: "wbt-modal" },
        h2("div", { className: "wbt-modal-head" }, h2("h3", null, mode === "timeline" ? t.batchTimeline : t.batchMigrate), h2("button", { className: "wbt-icon", onClick: props.onClose }, "\xD7")),
        h2("div", { className: "wbt-hint" }, mode === "timeline" ? t.chooseBase : t.chooseTable),
        mode === "timeline" ? h2("div", { className: "wbt-list" }, items.map(function(x) {
          return h2(
            "label",
            { key: x.id, className: "wbt-check", style: { padding: "6px 2px" } },
            h2("input", { type: "radio", name: "base", checked: String(value) === String(x.id), onChange: function() {
              setValue(String(x.id));
            } }),
            h2("span", null, x.title + "\uFF08timeline " + (x.timelineKey || "-") + "\uFF09")
          );
        })) : h2("select", { className: "wbt-select", value, onChange: function(e) {
          setValue(e.target.value);
        } }, props.tables.map(function(x) {
          return h2("option", { key: x.id, value: x.id }, "\u3000".repeat(x.depth) + x.name);
        })),
        error ? h2("div", { className: "wbt-err" }, error) : null,
        h2(
          "div",
          { className: "wbt-modal-foot" },
          h2("button", { className: "wbt-btn ghost", onClick: props.onClose }, t.cancel),
          h2("button", { className: "wbt-btn primary", disabled: isBusy, onClick: function() {
            if (!value) {
              setError(mode === "timeline" ? t.needBase : t.needTable);
              return;
            }
            setBusy(true);
            if (mode === "timeline") {
              var base = null;
              for (var i = 0; i < items.length; i++) if (String(items[i].id) === String(value)) base = items[i];
              if (!base || !base.timelineKey) {
                setError(t.needBase);
                setBusy(false);
                return;
              }
              props.api.call("tasks.timelineRefactor", { ids: items.map(function(x) {
                return x.id;
              }), timelineKey: base.timelineKey }).then(function(r) {
                setBusy(false);
                if (r && r.ok) props.onDone();
                else setError(r && r.error || "failed");
              });
            } else {
              props.api.call("tasks.migrate", { ids: items.map(function(x) {
                return x.id;
              }), tableId: value }).then(function(r) {
                setBusy(false);
                if (r && r.ok) props.onDone();
                else setError(r && r.error || "failed");
              });
            }
          } }, isBusy ? "\u2026" : t.confirm)
        )
      )
    );
  }
  var CFG_FALLBACK = {
    "ui.defaultTab": 0,
    "ui.listView": "list",
    "ui.expandDepth": 2,
    "list.pageSize": 12,
    "list.sort": "auto",
    "list.filterRestarted": true,
    "form.defaultPriority": 1,
    "form.defaultDifficulty": 1,
    "form.defaultTargetOffset": 0,
    "stats.range": "30d",
    "stats.top": 10,
    "stats.showKpi": true,
    "stats.sections": ["trend", "status", "tags", "priority", "difficulty", "aging", "overdue", "tables", "groups"]
  };
  function TasksView(props) {
    var lang = props.lang === "en" ? "en" : "zh";
    var cfg = configView.useConfig(props.api, CFG_FALLBACK);
    if (!cfg.ready) {
      return h2("div", { style: { padding: "48px", textAlign: "center", fontSize: "12.5px", opacity: 0.6 } }, lang === "en" ? "Loading\u2026" : "\u8F7D\u5165\u4E2D\u2026");
    }
    return h2(TasksViewBody, Object.assign({}, props, { cfg: cfg.values }));
  }
  function expandedByDepth(nodes, depth) {
    var out = /* @__PURE__ */ new Set();
    (function walk(list, d) {
      (list || []).forEach(function(n) {
        if (d >= depth || !n.children || !n.children.length) return;
        out.add(String(n.id));
        walk(n.children, d + 1);
      });
    })(nodes, 0);
    return out;
  }
  function TasksViewBody(props) {
    var t = COPY[props.lang === "en" ? "en" : "zh"];
    var api = props.api;
    var cfg = props.cfg || {};
    var cfgTab = Number(cfg["ui.defaultTab"]);
    if ([0, 5, 6, 7, 8].indexOf(cfgTab) < 0) cfgTab = 0;
    var cfgSize = Math.floor(Number(cfg["list.pageSize"]));
    if (!(cfgSize > 0)) cfgSize = 12;
    var cfgDepth = Math.floor(Number(cfg["ui.expandDepth"]));
    if (!(cfgDepth >= 0)) cfgDepth = 2;
    var cfgSort = typeof cfg["list.sort"] === "string" ? cfg["list.sort"] : "auto";
    var treeS = React2.useState([]);
    var tree = treeS[0], setTree = treeS[1];
    var expS = React2.useState(/* @__PURE__ */ new Set());
    var expanded = expS[0], setExpanded = expS[1];
    var expInitRef = React2.useRef(false);
    var targetS = React2.useState({ groupId: "1", tableId: null });
    var target = targetS[0], setTarget = targetS[1];
    var pathS = React2.useState([]);
    var currentPath = pathS[0], setCurrentPath = pathS[1];
    var tabS = React2.useState(cfgTab);
    var tab = tabS[0], setTab = tabS[1];
    var viewS = React2.useState(cfg["ui.listView"] === "card" ? "card" : "list");
    var view = viewS[0], setView = viewS[1];
    var searchS = React2.useState("");
    var searchDraft = searchS[0], setSearchDraft = searchS[1];
    var tqS = React2.useState("");
    var treeQuery = tqS[0], setTreeQuery = tqS[1];
    var titleS = React2.useState("");
    var titleKey = titleS[0], setTitleKey = titleS[1];
    var filterS = React2.useState(cfg["list.filterRestarted"] !== false);
    var filterRestarted = filterS[0], setFilterRestarted = filterS[1];
    var tagNavS = React2.useState({ available: false, tags: [], untagged: { total: 0 } });
    var tagNav = tagNavS[0], setTagNav = tagNavS[1];
    var filterTagIdsS = React2.useState([]);
    var filterTagIds = filterTagIdsS[0], setFilterTagIds = filterTagIdsS[1];
    var tagMenuS = React2.useState(false);
    var tagMenu = tagMenuS[0], setTagMenu = tagMenuS[1];
    var pageS = React2.useState(1);
    var pageNumber = pageS[0], setPageNumber = pageS[1];
    var sizeS = React2.useState(cfgSize);
    var pageSize = sizeS[0], setPageSize = sizeS[1];
    var dataS = React2.useState({ records: [], total: 0, current: 1, size: 0, pageable: false });
    var data = dataS[0], setData = dataS[1];
    var loadingS = React2.useState(true);
    var loading = loadingS[0], setLoading = loadingS[1];
    var errorS = React2.useState("");
    var error = errorS[0], setError = errorS[1];
    var drawerS = React2.useState(false);
    var drawer = drawerS[0], setDrawer = drawerS[1];
    var managerS = React2.useState(false);
    var manager = managerS[0], setManager = managerS[1];
    var selModeS = React2.useState(false);
    var selectionMode = selModeS[0], setSelectionMode = selModeS[1];
    var selS = React2.useState(/* @__PURE__ */ new Set());
    var selectedIds = selS[0], setSelectedIds = selS[1];
    var selItemsS = React2.useState([]);
    var selectedItems = selItemsS[0], setSelectedItems = selItemsS[1];
    var selOpenS = React2.useState(false);
    var selectedOpen = selOpenS[0], setSelectedOpen = selOpenS[1];
    var batchS = React2.useState(null);
    var batchMode = batchS[0], setBatchMode = batchS[1];
    var createS = React2.useState(null);
    var createState = createS[0], setCreateState = createS[1];
    var timelineS = React2.useState(null);
    var timelineTask = timelineS[0], setTimelineTask = timelineS[1];
    var doneS = React2.useState(null);
    var doneTask = doneS[0], setDoneTask = doneS[1];
    var editS = React2.useState(null);
    var edit = editS[0], setEdit = editS[1];
    var editNameS = React2.useState("");
    var editName = editNameS[0], setEditName = editNameS[1];
    var dragS = React2.useState(null);
    var dragId = dragS[0], setDragId = dragS[1];
    var dropS = React2.useState(null);
    var dropId = dropS[0], setDropId = dropS[1];
    var toastS = React2.useState("");
    var toast = toastS[0], setToast = toastS[1];
    var refreshRef = React2.useRef({});
    function say(msg) {
      setToast(String(msg || ""));
    }
    React2.useEffect(function() {
      if (!toast) return;
      var id = setTimeout(function() {
        setToast("");
      }, 3200);
      return function() {
        clearTimeout(id);
      };
    }, [toast]);
    var treeSearchRef = React2.useRef(null);
    React2.useEffect(function() {
      if (!drawer) return;
      var id = setTimeout(function() {
        if (treeSearchRef.current) treeSearchRef.current.focus();
      }, 40);
      function onKey(e) {
        if (e.key === "Escape") setDrawer(false);
      }
      window.addEventListener("keydown", onKey);
      return function() {
        clearTimeout(id);
        window.removeEventListener("keydown", onKey);
      };
    }, [drawer]);
    var refreshTree = React2.useCallback(function() {
      return api.call("taskNodes.tree").then(function(r) {
        if (r && r.ok) {
          var nodes = Array.isArray(r.result) ? r.result : [];
          setTree(nodes);
          if (!expInitRef.current) {
            expInitRef.current = true;
            setExpanded(expandedByDepth(nodes, cfgDepth));
          }
        } else setError(r && r.error || "tree load failed");
      }).catch(function(e) {
        setError(String(e && e.message || e));
      });
    }, [api]);
    var refreshTagNav = React2.useCallback(function() {
      return api.call("tasks.tags").then(function(r) {
        if (r && r.ok) setTagNav(r.result || { available: false, tags: [], untagged: { total: 0 } });
      }).catch(function() {
      });
    }, [api]);
    var refreshPath = React2.useCallback(function(id) {
      if (!id) {
        setCurrentPath([]);
        return Promise.resolve();
      }
      return api.call("taskNodes.path", { id }).then(function(r) {
        if (r && r.ok) setCurrentPath(Array.isArray(r.result) ? r.result : []);
      }).catch(function() {
      });
    }, [api]);
    var refreshList = React2.useCallback(function() {
      setLoading(true);
      return api.call("tasks.list", {
        tab,
        titleKey,
        tableId: target.tableId,
        groupId: target.tableId ? null : target.groupId,
        pageNumber,
        pageSize,
        filterRestarted,
        tagIds: filterTagIds,
        sort: cfgSort === "auto" ? void 0 : cfgSort
      }).then(function(r) {
        setLoading(false);
        if (r && r.ok) {
          setData(r.result || { records: [], total: 0, current: 1, size: 0, pageable: false });
          setError("");
        } else {
          setError(r && r.error || "list load failed");
        }
      }).catch(function(e) {
        setLoading(false);
        setError(String(e && e.message || e));
      });
    }, [api, tab, titleKey, target.tableId, target.groupId, pageNumber, pageSize, filterRestarted, filterTagIds, cfgSort]);
    refreshRef.current = { tree: refreshTree, list: refreshList, path: refreshPath, tags: refreshTagNav };
    React2.useEffect(function() {
      injectCss();
      refreshTree();
      refreshTagNav();
      refreshPath("1");
    }, [refreshTree, refreshTagNav, refreshPath]);
    React2.useEffect(function() {
      refreshList();
    }, [refreshList]);
    React2.useEffect(function() {
      var off = api.subscribe(function(p) {
        if (!p) return;
        if (p.event === "tasks-changed") {
          refreshRef.current.list();
          refreshRef.current.tags();
        }
        if (p.event === "task-nodes-changed") {
          refreshRef.current.tree();
          refreshRef.current.path(target.tableId || target.groupId);
        }
      });
      return off;
    }, [api, target.tableId, target.groupId]);
    React2.useEffect(function() {
      refreshPath(target.tableId || target.groupId);
    }, [target.tableId, target.groupId, refreshPath]);
    function update(task, patch) {
      var args = Object.assign({ id: task.id }, patch);
      api.call("tasks.update", args).then(function(r) {
        if (r && r.ok) refreshList();
        else say(r && r.error || "update failed");
      });
    }
    function pickNode(node) {
      if (String(node.type) === "1") setTarget({ groupId: String(node.parent || node.parentId || ""), tableId: String(node.id) });
      else setTarget({ groupId: String(node.id), tableId: null });
      setPageNumber(1);
      setDrawer(false);
    }
    function pickPath(p, i, path) {
      if (String(p.type) === "1") {
        var parent = i > 0 ? path[i - 1] : null;
        setTarget({ groupId: parent ? String(parent.id) : "", tableId: String(p.id) });
      } else {
        setTarget({ groupId: String(p.id), tableId: null });
      }
      setPageNumber(1);
    }
    function toggleExpanded(id) {
      var next = new Set(expanded);
      if (next.has(String(id))) next.delete(String(id));
      else next.add(String(id));
      setExpanded(next);
    }
    function addNode(parentId, type) {
      api.call("taskNodes.create", { parentId, type }).then(function(r) {
        if (r && r.ok) {
          var next = new Set(expanded);
          next.add(String(parentId));
          setExpanded(next);
          refreshTree();
          say(t.created);
        } else say(r && r.error || "create failed");
      });
    }
    function renameNode(id, name) {
      if (!edit || String(edit.id) !== String(id)) return;
      var v = String(name || "").trim();
      if (!v || v === String(edit.name || "")) {
        setEdit(null);
        return;
      }
      api.call("taskNodes.rename", { id, name: v }).then(function(r) {
        setEdit(null);
        if (r && r.ok) {
          refreshTree();
          say(t.saved);
        } else say(r && r.error || "rename failed");
      });
    }
    function deleteNode(node) {
      if (!window.confirm(t.deleteConfirm)) return;
      api.call("taskNodes.delete", { id: node.id }).then(function(r) {
        if (r && r.ok) {
          refreshTree();
          setTarget({ groupId: "1", tableId: null });
          setPageNumber(1);
          say(t.deleted);
        } else say(r && r.error || "delete failed");
      });
    }
    function moveNode(sourceId, targetId, moveType) {
      setDropId(null);
      setDragId(null);
      api.call("taskNodes.move", { sourceId, targetId, moveType }).then(function(r) {
        if (r && r.ok) {
          refreshTree();
          say(t.updated);
        } else say(r && r.error || "move failed");
      });
    }
    function toggleTagId(id) {
      var next = filterTagIds.slice();
      var idx = next.indexOf(String(id));
      if (idx >= 0) next.splice(idx, 1);
      else next.push(String(id));
      setFilterTagIds(next);
      setPageNumber(1);
    }
    function toggleSelect(id) {
      var next = new Set(selectedIds);
      if (next.has(String(id))) next.delete(String(id));
      else next.add(String(id));
      setSelectedIds(next);
    }
    function openSelected() {
      var ids = Array.from(selectedIds);
      if (!ids.length) {
        say("\u8BF7\u5148\u52FE\u9009\u4EFB\u52A1");
        return;
      }
      api.call("tasks.selected", { ids }).then(function(r) {
        if (r && r.ok) {
          setSelectedItems(Array.isArray(r.result) ? r.result : []);
          setSelectedOpen(true);
        } else say(r && r.error || "load failed");
      });
    }
    function clearSelection() {
      setSelectedIds(/* @__PURE__ */ new Set());
      setSelectedItems([]);
      setSelectedOpen(false);
      setBatchMode(null);
    }
    function batchDone() {
      setBatchMode(null);
      setSelectedOpen(false);
      clearSelection();
      refreshList();
      say(t.updated);
    }
    var tables = allTables(tree);
    var firstTable = findFirstTable(tree);
    var pageable = tab > 4 && tab < 9;
    var totalPages = pageable && data.total ? Math.ceil(data.total / pageSize) : 1;
    var treeProps = {
      t,
      expanded,
      selectedTable: target.tableId,
      selectedGroup: target.groupId,
      manager,
      dragId,
      dropId,
      edit,
      editName,
      onToggle: toggleExpanded,
      onSelect: pickNode,
      onAdd: addNode,
      onEdit: function(node) {
        setEdit({ id: node.id, name: node.name });
        setEditName(node.name);
      },
      onEditName: setEditName,
      onCancelEdit: function() {
        setEdit(null);
      },
      onRename: renameNode,
      onDelete: deleteNode,
      onDragStart: function(id) {
        setDragId(String(id));
      },
      onDragOver: function(id) {
        setDropId(String(id));
      },
      onMove: moveNode
    };
    function flatTreeRow(item) {
      var node = item.node;
      var isTable = String(node.type) === "1";
      var selected = String(target.tableId || "") === String(node.id) || !target.tableId && String(target.groupId || "") === String(node.id);
      return h2(
        "div",
        {
          key: node.id,
          className: cx("wbt-tree-row", selected && "sel"),
          style: { paddingLeft: 3 + item.depth * 15 + "px" }
        },
        h2("span", { className: "wbt-tw void" }),
        h2("span", { className: "wbt-ti" }, h2(Icon2, { name: isTable ? "table" : "folder", size: 13 })),
        h2(
          "div",
          { className: "wbt-tn", onClick: function() {
            pickNode(node);
          }, title: node.name },
          h2("span", { className: "nm" }, node.name),
          !isTable && node.children && node.children.length ? h2("span", { className: "wbt-tcnt" }, node.children.length) : null
        )
      );
    }
    var flatNodes = treeWalk(tree);
    var rootId = tree.length ? String(tree[0].id) : "";
    var nodeById = {};
    flatNodes.forEach(function(x) {
      nodeById[String(x.node.id)] = x.node;
    });
    var curNode = nodeById[String(target.tableId || target.groupId || "")] || null;
    var footGroupId = curNode ? String(curNode.type) === "1" ? String(curNode.parent || curNode.parentId || rootId) : String(curNode.id) : rootId;
    var groupCount = 0;
    var tableCount = 0;
    flatNodes.forEach(function(x) {
      if (String(x.node.type) === "1") tableCount++;
      else groupCount++;
    });
    var tq = treeQuery.trim().toLowerCase();
    var treeHits = tq ? flatNodes.filter(function(x) {
      return String(x.node.name || "").toLowerCase().indexOf(tq) >= 0;
    }) : [];
    var treeBody = !tree.length ? h2("div", { className: "wbt-empty" }, t.emptyTree) : tq ? treeHits.length ? treeHits.map(flatTreeRow) : h2("div", { className: "wbt-empty" }, t.treeNoMatch) : tree.map(function(n) {
      return h2(TreeNode, Object.assign({}, treeProps, { key: n.id, node: n, depth: 0 }));
    });
    var filterBar = h2(
      "div",
      { className: "wbt-filters" },
      pageable ? h2("span", { className: "wbt-sum" }, t.total + " " + data.total + " " + t.items) : null,
      tab === 5 || tab === 8 ? h2(
        "label",
        { className: "wbt-check" },
        h2("input", { type: "checkbox", checked: filterRestarted, onChange: function(e) {
          setFilterRestarted(e.target.checked);
          setPageNumber(1);
        } }),
        t.filterRestarted
      ) : null
    );
    var listBody = loading ? h2("div", { className: "wbt-empty" }, t.loading) : error ? h2("div", { className: "wbt-err" }, t.error + error) : data.records.length === 0 ? h2("div", { className: "wbt-empty" }, t.empty) : h2("div", { className: view === "card" ? "wbt-grid" : "wbt-list" }, data.records.map(function(task) {
      return h2(TaskItem, {
        key: task.id,
        task,
        t,
        lang: props.lang,
        card: view === "card",
        selectionMode,
        checked: selectedIds.has(String(task.id)),
        onCheck: toggleSelect,
        update,
        toast: say,
        onDone: function(x) {
          setDoneTask(x);
        },
        onRestart: function(x) {
          setCreateState({ source: "2", originTask: x });
        },
        onTimeline: function(x) {
          setTimelineTask(x);
        },
        onPathPick: pickPath,
        onTagPick: toggleTagId
      });
    }));
    return h2(
      "div",
      { className: "wbt-root" },
      h2(
        "div",
        { className: "wbt-pathrow" },
        h2(
          "div",
          { className: "wbt-tree-slot" },
          h2("button", { className: "wbt-btn", onClick: function() {
            setDrawer(true);
            refreshTree();
          } }, h2(Icon2, { name: "tree", size: 13 }), t.tree)
        ),
        h2(PathCrumbs, { path: currentPath, onPick: pickPath }),
        h2("div", { className: "wbt-grow" }),
        h2("input", {
          className: "wbt-input wbt-search",
          placeholder: t.search,
          value: searchDraft,
          onChange: function(e) {
            setSearchDraft(e.target.value);
          },
          onKeyDown: function(e) {
            if (e.key === "Enter") {
              setTitleKey(searchDraft);
              setPageNumber(1);
            }
          }
        }),
        h2("button", { className: "wbt-btn ghost", title: t.search, "aria-label": t.search, onClick: function() {
          setTitleKey(searchDraft);
          setPageNumber(1);
        } }, h2(Icon2, { name: "search", size: 14 })),
        h2("button", { className: "wbt-btn " + (selectionMode ? "primary" : "ghost"), onClick: function() {
          if (selectionMode) {
            setSelectionMode(false);
            clearSelection();
          } else setSelectionMode(true);
        } }, h2(Icon2, { name: "select", size: 13 }), selectionMode ? t.cancelSelect : t.select),
        tagNav.available && tagNav.tags.length ? h2(
          "div",
          { className: "wbt-tagfilter" },
          h2("button", {
            className: "wbt-btn ghost" + (filterTagIds.length ? " on" : ""),
            "aria-expanded": tagMenu ? "true" : "false",
            onClick: function() {
              setTagMenu(!tagMenu);
            }
          }, h2(Icon2, { name: "tag", size: 13 }), t.tagFilter + (filterTagIds.length ? " \xB7 " + filterTagIds.length : ""), h2(Icon2, { name: "down", size: 12 })),
          tagMenu ? h2(
            "div",
            { className: "wbt-tagmenu", role: "menu" },
            h2(
              "div",
              { className: "wbt-tagmenu-head" },
              h2("span", null, t.allTags),
              h2("span", { className: "wbt-grow" }),
              h2("button", { className: "wbt-mini", onClick: function() {
                setFilterTagIds([]);
                setPageNumber(1);
              } }, t.clear)
            ),
            tagNav.tags.length ? tagNav.tags.map(function(x) {
              var on = filterTagIds.indexOf(String(x.id)) >= 0;
              return h2(
                "label",
                { key: x.id, className: "wbt-tagopt" },
                h2("input", { type: "checkbox", checked: on, onChange: function() {
                  toggleTagId(String(x.id));
                } }),
                h2("span", { className: "wbt-tagnm" }, x.name),
                h2("span", { className: "wbt-tagcnt" }, x.total)
              );
            }) : h2("div", { className: "wbt-note" }, t.noTags)
          ) : null
        ) : null,
        h2("button", { className: "wbt-btn primary", onClick: function() {
          setCreateState({ source: "0", originTask: null, defaultTableId: target.tableId || firstTable && firstTable.id });
        } }, h2(Icon2, { name: "plus", size: 14 }), t.newTask),
        h2("button", { className: "wbt-btn ghost", onClick: function() {
          setView(view === "list" ? "card" : "list");
        } }, h2(Icon2, { name: view === "list" ? "grid" : "list", size: 13 }), view === "list" ? t.card : t.list)
      ),
      h2(
        "div",
        { className: "wbt-body" },
        h2("nav", { className: "wbt-nav" }, TABS.map(function(x) {
          var btn = h2("button", {
            key: x.id,
            className: "wbt-tab" + (tab === x.id ? " on" : ""),
            onClick: function() {
              setTab(x.id);
              setPageNumber(1);
            }
          }, t === COPY.zh ? x.zh : x.en);
          if (x.id !== 5) return btn;
          return [h2("div", { key: "nav-sep", className: "wbt-nav-sep" }), btn];
        })),
        h2(
          "div",
          { className: "wbt-content" },
          filterBar,
          listBody,
          pageable ? h2(
            "div",
            { className: "wbt-pager" },
            h2("button", { className: "wbt-btn ghost", disabled: pageNumber <= 1, onClick: function() {
              setPageNumber(Math.max(1, pageNumber - 1));
            } }, h2(Icon2, { name: "left", size: 14 })),
            h2("span", null, t.page + " " + pageNumber + " / " + totalPages),
            h2(
              "select",
              { className: "wbt-select", value: pageSize, onChange: function(e) {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              } },
              [6, 12, 24].map(function(n) {
                return h2("option", { key: n, value: n }, n + " / " + t.page);
              })
            ),
            h2("button", { className: "wbt-btn ghost", disabled: pageNumber >= totalPages, onClick: function() {
              setPageNumber(Math.min(totalPages, pageNumber + 1));
            } }, h2(Icon2, { name: "right", size: 14 }))
          ) : null
        )
      ),
      selectionMode && selectedIds.size ? h2(
        "div",
        { className: "wbt-selbar" },
        h2("b", null, t.selected + " " + selectedIds.size),
        h2("button", { className: "wbt-btn", onClick: openSelected }, t.selectedTasks),
        h2("button", { className: "wbt-btn", onClick: function() {
          setBatchMode("timeline");
          openSelected();
        } }, t.batchTimeline),
        h2("button", { className: "wbt-btn", onClick: function() {
          setBatchMode("migrate");
          openSelected();
        } }, t.batchMigrate),
        h2("button", { className: "wbt-btn ghost", onClick: clearSelection }, t.clear)
      ) : null,
      drawer ? h2(
        "div",
        { className: "wbt-drawer-mask", onMouseDown: function(e) {
          if (e.target === e.currentTarget) setDrawer(false);
        } },
        h2(
          "div",
          { className: "wbt-drawer", role: "dialog", "aria-label": t.tree },
          h2(
            "div",
            { className: "wbt-drawer-head" },
            h2(Icon2, { name: "tree", size: 15 }),
            h2(
              "div",
              { className: "wbt-drawer-title" },
              h2("b", null, t.tree),
              h2("span", { className: "wbt-drawer-meta" }, groupCount + " " + t.groups + " \xB7 " + tableCount + " " + t.tables)
            ),
            h2("button", {
              className: "wbt-tool" + (manager ? " on" : ""),
              onClick: function() {
                setManager(!manager);
              }
            }, t.manager),
            h2("button", { className: "wbt-icon", title: t.close, "aria-label": t.close, onClick: function() {
              setDrawer(false);
            } }, h2(Icon2, { name: "close", size: 15 }))
          ),
          h2(
            "div",
            { className: "wbt-drawer-search" },
            h2("input", {
              className: "wbt-input",
              ref: treeSearchRef,
              placeholder: t.treeSearch,
              value: treeQuery,
              onChange: function(e) {
                setTreeQuery(e.target.value);
              },
              onKeyDown: function(e) {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setTreeQuery("");
                  setDrawer(false);
                }
              }
            }),
            treeQuery ? h2("button", {
              className: "wbt-search-clear",
              title: t.clear,
              "aria-label": t.clear,
              onClick: function() {
                setTreeQuery("");
                if (treeSearchRef.current) treeSearchRef.current.focus();
              }
            }, h2(Icon2, { name: "close", size: 13 })) : null
          ),
          h2("div", { className: "wbt-drawer-body" }, treeBody),
          h2(
            "div",
            { className: "wbt-drawer-foot" },
            h2(
              "div",
              { className: "wbt-drawer-acts" },
              h2(
                "button",
                { className: "wbt-addbtn", title: t.addGroup, onClick: function() {
                  if (footGroupId) addNode(footGroupId, "0");
                } },
                h2(Icon2, { name: "folderPlus", size: 13 }),
                t.addGroup
              ),
              h2(
                "button",
                { className: "wbt-addbtn", title: t.addTable, onClick: function() {
                  if (footGroupId) addNode(footGroupId, "1");
                } },
                h2(Icon2, { name: "filePlus", size: 13 }),
                t.addTable
              )
            ),
            h2("div", { className: "wbt-drawer-hint" }, t.treeHint)
          )
        )
      ) : null,
      createState ? h2(CreateModal, {
        key: (createState.source || "0") + "-" + (createState.originTask && createState.originTask.id || ""),
        t,
        api,
        tree,
        source: createState.source,
        originTask: createState.originTask,
        defaultTableId: createState.defaultTableId,
        defaults: {
          priority: cfg["form.defaultPriority"],
          difficulty: cfg["form.defaultDifficulty"],
          targetOffset: cfg["form.defaultTargetOffset"]
        },
        onClose: function() {
          setCreateState(null);
        },
        onCreated: function() {
          setCreateState(null);
          refreshList();
          refreshTree();
          say(t.created);
        }
      }) : null,
      timelineTask ? h2(TimelineModal, {
        key: timelineTask.id,
        t,
        api,
        task: timelineTask,
        onClose: function() {
          setTimelineTask(null);
        },
        onCreateTimeline: function(originTask) {
          setTimelineTask(null);
          setCreateState({ source: "1", originTask, defaultTableId: originTask.tableId });
        }
      }) : null,
      doneTask ? h2(DoneModal, {
        key: doneTask.id,
        t,
        api,
        task: doneTask,
        onClose: function() {
          setDoneTask(null);
        },
        onDone: function() {
          setDoneTask(null);
          refreshList();
          say(t.doneSuccess);
        },
        onError: function(e) {
          setDoneTask(null);
          say(e);
        }
      }) : null,
      selectedOpen && batchMode ? h2(BatchModal, {
        key: batchMode,
        t,
        api,
        mode: batchMode,
        items: selectedItems,
        tables,
        onClose: function() {
          setBatchMode(null);
        },
        onDone: batchDone
      }) : null,
      toast ? h2("div", { className: "wbt-toast" }, toast) : null
    );
  }
  host.registerAddon({
    id: "wb-addon-tasks",
    version: "2.7.0",
    views: [
      { id: "stats", title: { zh: "\u7EDF\u8BA1", en: "Stats" }, component: statsView.TasksStatsView },
      { id: "tasks", title: { zh: "\u8BB0\u5F55", en: "Records" }, component: TasksView },
      { id: "config", title: { zh: "\u914D\u7F6E", en: "Config" }, component: configView.ConfigView }
    ]
  });
  module.exports = { name: "dsh-workbench-tasks", inject: [], apply: function() {
  } };
})();
    return module.exports;
  },
});
