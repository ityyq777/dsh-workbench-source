"use strict";
/**
 * 数据页：与 tasks/sites 共用只读浏览器；旧 dataQuery 由兼容层适配分页。
 * 锁定态整页让位：数据页会铺出表清单与行数据（含凭据名称、类型、集合/分组关系），
 * 未解锁时既不渲染表格，也不向服务端发取数请求；解锁后自动恢复。
 */
var C = require("../ui/common.cjs");
var Lock = require("../ui/lock.cjs");

var legacy = require("../../../lib/legacy-data.cjs")("vault", { paged: true });

var Inner = require("../../../lib/data-view.cjs")({
  domain: "vault",
  prefix: "wbv",
  tables: ["vault_secret", "vault_group", "vault_set", "vault_group_set", "vault_set_secret", "vault_binding"],
  useConfig: function (api, fallback) { return { values: fallback, ready: true }; },
  tablesLoader: legacy.tablesLoader,
  query: legacy.query,
}).DataView;

module.exports = function VaultDataView(props) {
  var h = props.h;
  var guard = Lock.use({ api: props.api, C: C, React: props.React });
  if (!guard.ready) return h("div", { className: "wbv" }, h(C.Empty, { h: h, text: "正在读取保险箱状态…" }));
  if (guard.locked) return h(Lock.Panel, { h: h, C: C, lang: props.lang, error: guard.error });
  return h(Inner, props);
};
