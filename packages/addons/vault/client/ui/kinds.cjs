"use strict";
/**
 * 凭据类型口径：后端八种（packages/addons/vault/lib/domain/secret-input.js 的 KINDS），
 * 0.6.0 起一条凭据可同时有多种类型。旧缓存里可能只有单值 kind，展示与编辑时统一走 kindsOf 兜底。
 */
var KIND_LABEL = {
  password: "密码",
  account: "账号",
  phone: "手机号",
  id_card: "身份证号",
  token: "Token",
  app_password: "授权码",
  api_key: "API Key",
  other: "其它",
};

var CREATABLE_KINDS = ["password", "account", "phone", "id_card", "token", "app_password", "api_key", "other"];

function kindsOf(row) {
  if (row && Array.isArray(row.kinds) && row.kinds.length) return row.kinds.slice();
  if (row && row.kind) return [row.kind];
  return [];
}

function kindsText(list) {
  var arr = Array.isArray(list) ? list : (list ? [list] : []);
  if (!arr.length) return KIND_LABEL.other;
  return arr.map(function (kind) { return KIND_LABEL[kind] || kind; }).join(" / ");
}

function toggleKind(list, kind) {
  var arr = (list || []).slice();
  var at = arr.indexOf(kind);
  if (at >= 0) arr.splice(at, 1);
  else arr.push(kind);
  return arr;
}

/** 多选类型：原生 checkbox 清单（多选清单沿用 checkbox，符合共享控件约定）。 */
function kindChecks(hh, selected, onToggle, label) {
  var picked = selected || [];
  return hh("div", { className: "wbv-check-list", role: "group", "aria-label": label || "凭据类型（可多选）" }, CREATABLE_KINDS.map(function (kind) {
    return hh("label", { key: kind, className: "wbv-check" },
      hh("input", {
        type: "checkbox",
        checked: picked.indexOf(kind) >= 0,
        onChange: function () { onToggle(kind); },
      }),
      hh("span", null, KIND_LABEL[kind] || kind));
  }));
}

module.exports = {
  KIND_LABEL: KIND_LABEL,
  CREATABLE_KINDS: CREATABLE_KINDS,
  kindsOf: kindsOf,
  kindsText: kindsText,
  toggleKind: toggleKind,
  kindChecks: kindChecks,
};
