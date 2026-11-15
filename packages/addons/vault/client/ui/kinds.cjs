"use strict";
/**
 * 凭据类型口径：后端 6 种（vault.js KINDS），界面只给前 5 种手工新建。
 * site-account 由站点经 plugin 接口写入，只读展示「站点账号」。
 */
var KIND_LABEL = {
  password: "密码",
  token: "Token",
  app_password: "应用专用密码",
  api_key: "API Key",
  other: "其它",
  "site-account": "站点账号",
};

var CREATABLE_KINDS = ["password", "token", "app_password", "api_key", "other"];

/** 编辑非手建凭据时保留当前类型，避免下拉回落到 password 后把 kind 改掉（kind 进 AAD，会重加密）。 */
function kindOptions(current) {
  return CREATABLE_KINDS.indexOf(current) === -1 ? [current].concat(CREATABLE_KINDS) : CREATABLE_KINDS;
}

module.exports = { KIND_LABEL: KIND_LABEL, CREATABLE_KINDS: CREATABLE_KINDS, kindOptions: kindOptions };
