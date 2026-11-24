// 由 scripts/build-addon-clients.mjs 生成；请修改对应 client/client.src.cjs 后重新构建。
window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
window.__ModuleLoader__.load({
  id: "dsh-workbench",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
"use strict";
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

// packages/shell/client/automation/locale.cjs
var require_locale = __commonJS({
  "packages/shell/client/automation/locale.cjs"(exports2, module2) {
    "use strict";
    var DICT = {
      zh: {
        "auto_common_save": "\u4FDD\u5B58",
        "auto_common_cancel": "\u53D6\u6D88",
        "auto_common_close": "\u5173\u95ED",
        "auto_common_next": "\u4E0B\u4E00\u6B65",
        "auto_common_back": "\u4E0A\u4E00\u6B65",
        "auto_common_more": "\u52A0\u8F7D\u66F4\u65E9\u7684\u8BB0\u5F55",
        "auto_common_refresh": "\u5237\u65B0",
        "auto_common_retry": "\u91CD\u8BD5",
        "auto_common_delete": "\u5220\u9664",
        "auto_common_edit": "\u7F16\u8F91",
        "auto_common_create": "\u65B0\u5EFA\u89C4\u5219",
        "auto_common_createShort": "\u65B0\u5EFA",
        "auto_common_run": "\u7ACB\u5373\u8FD0\u884C",
        "auto_common_enable": "\u542F\u7528",
        "auto_common_disable": "\u505C\u7528",
        "auto_common_search": "\u641C\u7D22",
        "auto_common_clear": "\u6E05\u9664",
        "auto_common_all": "\u5168\u90E8",
        "auto_common_loading": "\u52A0\u8F7D\u4E2D\u2026",
        "auto_common_none": "\u2014",
        "auto_common_saved": "\u5DF2\u4FDD\u5B58",
        "auto_rules_title": "\u89C4\u5219",
        "auto_rules_subtitle": "\u5B9A\u65F6\u3001\u57DF\u4E8B\u4EF6\u6216\u624B\u52A8\u89E6\u53D1\uFF1B\u53EA\u8C03\u7528\u767D\u540D\u5355 action\uFF1B\u6BCF\u89C4\u5219\u6BCF\u5C0F\u65F6\u9650\u9891\u3001\u5168\u5C40\u5E76\u53D1 2\u3002",
        "auto_rules_searchPh": "\u641C\u7D22\u540D\u79F0\u6216 action",
        "auto_rules_filterStatus": "\u72B6\u6001",
        "auto_rules_filterTrigger": "\u89E6\u53D1\u65B9\u5F0F",
        "auto_rules_filterOrigin": "\u6765\u6E90",
        "auto_rules_col_origin": "\u6765\u6E90",
        "auto_rules_origin_user": "\u7528\u6237\u81EA\u5B9A\u4E49",
        "auto_rules_origin_plugin": "\u63D2\u4EF6\u5185\u7F6E",
        "auto_rules_origin_state_active": "\u7531\u63D2\u4EF6\u58F0\u660E\uFF0C\u968F\u63D2\u4EF6\u5347\u7EA7",
        "auto_rules_origin_state_updated": "\u5185\u7F6E\u89C4\u5219\u5DF2\u66F4\u65B0",
        "auto_rules_origin_state_stale": "\u63D2\u4EF6\u5DF2\u4E0D\u518D\u58F0\u660E",
        "auto_rules_origin_state_uninstalled": "\u63D2\u4EF6\u5DF2\u5378\u8F7D",
        "auto_rules_builtinLocked": "\u5185\u7F6E\u89C4\u5219\u7531\u63D2\u4EF6\u58F0\u660E\uFF1A\u4E0D\u80FD\u5220\u9664\uFF0C\u4E5F\u4E0D\u80FD\u6539\u89E6\u53D1\u4E0E action\uFF1B\u53EF\u505C\u7528\u6216\u6309\u58F0\u660E\u6539\u53C2\u6570",
        "auto_rules_triggerCol": "\u89E6\u53D1",
        "auto_rules_status_on": "\u542F\u7528",
        "auto_rules_status_off": "\u505C\u7528",
        "auto_rules_col_name": "\u540D\u79F0",
        "auto_rules_col_trigger": "\u89E6\u53D1\u65B9\u5F0F",
        "auto_rules_col_action": "\u6267\u884C Action",
        "auto_rules_col_status": "\u72B6\u6001",
        "auto_rules_col_lastRun": "\u4E0A\u6B21\u8FD0\u884C",
        "auto_rules_col_ops": "\u64CD\u4F5C",
        "auto_rules_empty_title": "\u8FD8\u6CA1\u6709\u89C4\u5219",
        "auto_rules_empty_body": "\u521B\u5EFA\u4E00\u6761\u89C4\u5219\uFF0C\u628A\u5B9A\u65F6\u6216\u57DF\u4E8B\u4EF6\u63A5\u5230\u767D\u540D\u5355 action \u4E0A\u3002",
        "auto_rules_empty_backup": "\u89C4\u5219\u53EF\u4EE5\u968F\u5907\u4EFD\u5BFC\u5165\u5BFC\u51FA\uFF1B\u8FD0\u884C\u8BB0\u5F55\u53EA\u4FDD\u7559\u5728\u672C\u673A\u3002",
        "auto_rules_empty_filtered": "\u6CA1\u6709\u5339\u914D\u7684\u89C4\u5219",
        "auto_rules_empty_filteredBody": "\u6362\u4E2A\u5173\u952E\u8BCD\uFF0C\u6216\u6E05\u9664\u8FC7\u6EE4\u6761\u4EF6\u3002",
        "auto_rules_empty_noActionTitle": "\u8FD8\u6CA1\u6709\u542F\u7528\u4EFB\u4F55 action",
        "auto_rules_empty_noActionBody": "\u81EA\u52A8\u5316\u9ED8\u8BA4\u4E0D\u5141\u8BB8\u8C03\u7528\u4EFB\u4F55 action\u3002\u5148\u5230\u8BBE\u7F6E\u9875\u52FE\u9009\u9700\u8981\u7684 action\uFF0C\u518D\u521B\u5EFA\u89C4\u5219\u3002",
        "auto_rules_empty_noActionCta": "\u53BB\u8BBE\u7F6E",
        "auto_rules_empty_noActionHint": "\u52FE\u9009\u540E\u7ACB\u5373\u751F\u6548\uFF0C\u4E0D\u9700\u8981\u91CD\u542F\u3002",
        "auto_rules_actionDisabled": "\u672A\u542F\u7528",
        "auto_rules_confirm_delete": "\u5220\u9664\u89C4\u5219\u300C{name}\u300D\uFF1F\u5220\u9664\u540E\u4E0D\u53EF\u6062\u590D\u3002",
        "auto_rules_running": "\u8FD0\u884C\u4E2D\u2026",
        "auto_rules_exec_mode": "\u6267\u884C\u65B9\u5F0F",
        "auto_rules_exec_action": "\u8C03\u7528 Action",
        "auto_rules_exec_agent": "\u4EA4\u7ED9 AI",
        "auto_rules_agentAction": "\u4EA4\u7ED9 AI \u6267\u884C",
        "auto_rules_schedule_active": "\u8FD0\u884C\u4E2D",
        "auto_rules_schedule_paused": "\u5DF2\u6682\u505C",
        "auto_rules_schedule_ended": "\u5DF2\u7ED3\u675F",
        "auto_rules_schedule_missing": "\u5BBF\u4E3B\u4EFB\u52A1\u5DF2\u5220\u9664",
        "auto_rules_lastDelivery": "\u4E0A\u6B21\u6295\u9012",
        "auto_rules_history": "\u6295\u9012\u5386\u53F2",
        "auto_rules_agentOffline": "\u5F53\u524D\u5BBF\u4E3B\u6CA1\u6709\u52A0\u8F7D\u300C\u81EA\u52A8\u5316\u4EFB\u52A1\u300D\u670D\u52A1\uFF0CAI \u89C4\u5219\u6682\u65F6\u53EA\u80FD\u67E5\u770B\uFF0C\u4E0D\u80FD\u521B\u5EFA\u6216\u4FEE\u6539\u3002",
        "auto_rules_orphans": "\u5BBF\u4E3B\u91CC\u8FD8\u6709 {n} \u4E2A\u81EA\u52A8\u5316\u4EFB\u52A1\u6CA1\u6709\u7EB3\u5165\u5DE5\u4F5C\u53F0\u89C4\u5219\uFF0C\u53EF\u5728\u300C\u81EA\u52A8\u5316\u4EFB\u52A1\u300D\u9762\u677F\u7BA1\u7406\u3002",
        "auto_trigger_interval": "\u95F4\u9694",
        "auto_trigger_dailyAt": "\u6BCF\u5929",
        "auto_trigger_event": "\u4E8B\u4EF6",
        "auto_trigger_manual": "\u624B\u52A8",
        "auto_trigger_interval_text": "\u6BCF {n} \u5206\u949F",
        "auto_trigger_interval_textHours": "\u6BCF {n} \u5C0F\u65F6",
        "auto_trigger_daily_text": "\u6BCF\u5929 {time}\uFF08{tz}\uFF09",
        "auto_trigger_event_text": "\u4E8B\u4EF6 {domain}/{event}",
        "auto_trigger_manual_text": "\u624B\u52A8\u89E6\u53D1",
        "auto_trigger_every": "\u6BCF",
        "auto_trigger_minutes": "\u5206\u949F",
        "auto_trigger_hours": "\u5C0F\u65F6",
        "auto_trigger_intervalHint": "1\u201310080 \u5206\u949F\uFF1B\u5C0F\u65F6\u6309 \xD760 \u6298\u7B97\u3002",
        "auto_trigger_time": "\u65F6\u95F4\uFF08HH:MM\uFF09",
        "auto_trigger_tz": "\u65F6\u533A",
        "auto_trigger_weekdays": "\u661F\u671F",
        "auto_trigger_weekdaysHint": "\u5168\u4E0D\u9009\u8868\u793A\u6BCF\u5929\uFF1B1=\u5468\u4E00 \u2026 7=\u5468\u65E5\u3002",
        "auto_trigger_wd_1": "\u4E00",
        "auto_trigger_wd_2": "\u4E8C",
        "auto_trigger_wd_3": "\u4E09",
        "auto_trigger_wd_4": "\u56DB",
        "auto_trigger_wd_5": "\u4E94",
        "auto_trigger_wd_6": "\u516D",
        "auto_trigger_wd_7": "\u65E5",
        "auto_trigger_domain": "\u57DF id",
        "auto_trigger_eventName": "\u4E8B\u4EF6\u540D",
        "auto_trigger_eventHint": "\u5E38\u7528\uFF1Awb-addon-connector / wb-addon-message / wb-addon-tasks\u3002",
        "auto_trigger_manualHint": "\u53EA\u5728\u89C4\u5219\u9875\u70B9\u300C\u8FD0\u884C\u300D\u6216\u7531\u811A\u672C\u624B\u52A8\u89E6\u53D1\u65F6\u6267\u884C\u3002",
        "auto_editor_newTitle": "\u65B0\u5EFA\u89C4\u5219",
        "auto_editor_editTitle": "\u7F16\u8F91\u89C4\u5219",
        "auto_editor_section_basic": "\u57FA\u672C\u4FE1\u606F",
        "auto_editor_section_trigger": "\u89E6\u53D1",
        "auto_editor_section_run": "\u6267\u884C",
        "auto_editor_section_condition": "\u6761\u4EF6\uFF08\u53EF\u9009\uFF09",
        "auto_editor_name": "\u540D\u79F0",
        "auto_editor_namePh": "\u4F8B\u5982\uFF1A\u6BCF\u65E5\u6D88\u606F\u6C47\u603B",
        "auto_editor_nameRequired": "\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A",
        "auto_editor_enabled": "\u542F\u7528",
        "auto_editor_action": "Action",
        "auto_editor_actionRequired": "\u8BF7\u9009\u62E9\u4E00\u4E2A action",
        "auto_editor_noActions": "\u672A\u542F\u7528\u4EFB\u4F55 action",
        "auto_editor_noActionsHint": "\u5148\u5230\u8BBE\u7F6E\u9875\u52FE\u9009 action\uFF0C\u624D\u80FD\u4FDD\u5B58\u89C4\u5219\u3002",
        "auto_editor_showExample": "\u67E5\u770B\u53C2\u6570\u793A\u4F8B",
        "auto_editor_fillExample": "\u586B\u5165\u793A\u4F8B",
        "auto_editor_exampleHint": "\u793A\u4F8B\u4F1A\u8986\u76D6\u5F53\u524D JSON\uFF0C\u786E\u8BA4\u540E\u586B\u5165\u3002",
        "auto_editor_insertVar": "\u63D2\u5165\u53D8\u91CF",
        "auto_editor_argsHint": "JSON \u5BF9\u8C61\uFF1B\u6A21\u677F\u53D8\u91CF {{rule.name}}\u3001{{event.item.title}}\u3001{{item.url}}\u3002",
        "auto_editor_conditionOn": "\u542F\u7528\u6761\u4EF6",
        "auto_editor_conditionHint": "op \u53D6\u503C eq / neq / contains / gt / lt\uFF1Bfield \u53EA\u80FD\u662F\u6570\u636E\u8DEF\u5F84\uFF0C\u5982 event.item.title\u3002",
        "auto_editor_conditionEmpty": "\u5173\u95ED\u6761\u4EF6\u65F6\u63D0\u4EA4 null\u3002",
        "auto_editor_jsonInvalid": "JSON \u975E\u6CD5\uFF1A{msg}",
        "auto_editor_nameEmptySave": "\u586B\u5199\u540D\u79F0\u540E\u53EF\u4FDD\u5B58",
        "auto_editor_discard": "\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u786E\u5B9A\u5173\u95ED\uFF1F",
        "auto_editor_format": "\u683C\u5F0F\u5316",
        "auto_editor_argsObject": "actionArgs \u5FC5\u987B\u662F JSON \u5BF9\u8C61",
        "auto_editor_conditionObject": "\u6761\u4EF6\u5FC5\u987B\u662F JSON \u5BF9\u8C61",
        "auto_editor_exampleTitle": "\u53C2\u6570\u793A\u4F8B",
        "auto_editor_ruleFallbackHint": "\u89E6\u53D1\u5668\u6BCF 30 \u79D2\u626B\u63CF\u4E00\u6B21\uFF0C\u5355\u6B21\u6700\u591A\u6267\u884C 3 \u6761\u3002",
        "auto_editor_section_mode": "\u6267\u884C\u65B9\u5F0F",
        "auto_editor_mode_action": "\u8C03\u7528 Action",
        "auto_editor_mode_actionHint": "\u6309\u65F6\u95F4\u6216\u57DF\u4E8B\u4EF6\u76F4\u63A5\u8C03\u7528\u5DF2\u542F\u7528\u7684 action\uFF1A\u786E\u5B9A\u6027\u6267\u884C\uFF0C\u4E0D\u6D88\u8017 token\u3002",
        "auto_editor_mode_agent": "\u4EA4\u7ED9 AI",
        "auto_editor_mode_agentHint": "\u628A\u63D0\u793A\u8BCD\u4EA4\u7ED9\u5BBF\u4E3B\u300C\u81EA\u52A8\u5316\u4EFB\u52A1\u300D\uFF0C\u6309\u65F6\u6295\u8FDB\u4F1A\u8BDD\u7531 AI \u6267\u884C\uFF1A\u6BCF\u6B21\u6295\u9012\u90FD\u4F1A\u4EA7\u751F\u4E00\u6B21\u6A21\u578B\u8BF7\u6C42\uFF0C\u7ED3\u679C\u4E0D\u786E\u5B9A\u3002",
        "auto_editor_mode_locked": "\u6267\u884C\u65B9\u5F0F\u521B\u5EFA\u540E\u4E0D\u53EF\u4FEE\u6539\uFF1B\u8981\u6362\u65B9\u5F0F\u8BF7\u65B0\u5EFA\u4E00\u6761\u89C4\u5219\u3002",
        "auto_editor_mode_agentUnavailable": "\u5F53\u524D\u5BBF\u4E3B\u6CA1\u6709\u300C\u81EA\u52A8\u5316\u4EFB\u52A1\u300D\u670D\u52A1\uFF0C\u65E0\u6CD5\u9009\u62E9\u300C\u4EA4\u7ED9 AI\u300D\u3002",
        "auto_editor_section_prompt": "\u63D0\u793A\u8BCD",
        "auto_editor_prompt": "\u63D0\u793A\u8BCD",
        "auto_editor_promptPh": "\u4F8B\u5982\uFF1A\u8BFB\u4ECA\u5929\u7684\u4EFB\u52A1\u4E0E\u6D88\u606F\uFF0C\u6C47\u603B\u6210\u4E00\u6BB5\u6458\u8981\u53D1\u7ED9\u6211\u3002",
        "auto_editor_promptHint": "\u539F\u6837\u6295\u9012\u7ED9 agent\uFF0C\u5199\u6E05\u8981\u505A\u4EC0\u4E48\u3001\u770B\u54EA\u4E9B\u6570\u636E\u3001\u8F93\u51FA\u6210\u4EC0\u4E48\u6837\u3002",
        "auto_editor_promptRequired": "AI \u89C4\u5219\u9700\u8981\u586B\u5199\u63D0\u793A\u8BCD",
        "auto_editor_section_timing": "\u65F6\u95F4\uFF08\u7531\u5BBF\u4E3B\u8C03\u5EA6\uFF09",
        "auto_editor_section_target": "\u6295\u9012\u76EE\u6807",
        "auto_editor_target": "\u76EE\u6807",
        "auto_editor_target_new_once": "\u65B0\u5EFA\u4F1A\u8BDD\uFF08\u4E4B\u540E\u590D\u7528\u540C\u4E00\u4E2A\uFF09",
        "auto_editor_target_new": "\u6BCF\u6B21\u65B0\u5EFA\u4F1A\u8BDD",
        "auto_editor_targetHint": "\u300C\u65B0\u5EFA\u4F1A\u8BDD\u300D\u7531\u5BBF\u4E3B\u628A\u63D0\u793A\u8BCD\u6295\u8FDB\u4E00\u4E2A\u7A7A\u4F1A\u8BDD\u518D\u4EA4\u7ED9 AI\uFF1B\u300C\u6BCF\u6B21\u65B0\u5EFA\u300D\u53EF\u4EE5\u5E76\u53D1\uFF0C\u4E92\u4E0D\u5F71\u54CD\u3002",
        "auto_editor_targetCwd": "\u5DE5\u4F5C\u533A\u8DEF\u5F84\uFF08\u53EF\u9009\uFF09",
        "auto_editor_targetPreset": "Agent \u9884\u8BBE\uFF08\u53EF\u9009\uFF09",
        "auto_editor_targetPresetPh": "\u7559\u7A7A\u4F7F\u7528\u5BBF\u4E3B\u9ED8\u8BA4\u9884\u8BBE",
        "auto_editor_targetSession": "\u4F1A\u8BDD ID",
        "auto_editor_targetSessionPh": "\u8981\u6295\u9012\u5230\u7684\u73B0\u6709\u4F1A\u8BDD id",
        "auto_editor_targetSessionRequired": "\u6295\u9012\u5230\u73B0\u6709\u4F1A\u8BDD\u65F6\u9700\u8981\u586B\u5199\u4F1A\u8BDD ID",
        "auto_agent_every": "\u6BCF\u9694",
        "auto_agent_after": "\u5EF6\u8FDF",
        "auto_agent_daily": "\u6BCF\u5929",
        "auto_agent_weekly": "\u6BCF\u5468",
        "auto_agent_cron": "cron \u8868\u8FBE\u5F0F",
        "auto_agent_rrule": "RRULE",
        "auto_agent_at": "\u4E00\u6B21\u6027",
        "auto_agent_everyHint": "\u4E0D\u80FD\u5C0F\u4E8E 1 \u5206\u949F\uFF0C\u6700\u957F 30 \u5929\u3002",
        "auto_agent_afterHint": "\u4ECE\u4FDD\u5B58\u65F6\u8D77\u5EF6\u8FDF N \u5206\u949F\u540E\u6267\u884C\u4E00\u6B21\u3002",
        "auto_agent_cronPh": "0 9 * * 1-5",
        "auto_agent_cronHint": "5 \u6BB5\uFF1A\u5206 \u65F6 \u65E5 \u6708 \u5468\u3002",
        "auto_agent_rrulePh": "DTSTART;TZID=Asia/Shanghai:20260101T090000\nRRULE:FREQ=DAILY",
        "auto_agent_rruleHint": "\u4E24\u884C\uFF1A\u4E00\u884C DTSTART\uFF0C\u4E00\u884C RRULE\u3002",
        "auto_agent_date": "\u65E5\u671F",
        "auto_agent_text_every": "\u6BCF {n} \u5206\u949F",
        "auto_agent_text_everyHours": "\u6BCF {n} \u5C0F\u65F6",
        "auto_agent_text_daily": "\u6BCF\u5929 {time}\uFF08{tz}\uFF09",
        "auto_agent_text_weekly": "\u6BCF\u5468 {days} {time}\uFF08{tz}\uFF09",
        "auto_agent_text_cron": "cron {expr}\uFF08{tz}\uFF09",
        "auto_agent_text_rrule": "RRULE {expr}",
        "auto_agent_text_at": "\u4E00\u6B21\u6027 {at}",
        "auto_agent_text_after": "{n} \u5206\u949F\u540E\u6267\u884C\u4E00\u6B21",
        "auto_agent_text_missing": "\u672A\u8BBE\u7F6E\u65F6\u95F4",
        "auto_hist_title": "\u6295\u9012\u5386\u53F2",
        "auto_hist_subtitle": "\u7531\u5BBF\u4E3B\u8BB0\u5F55\uFF1B\u56DE\u6267\u53EA\u4EE3\u8868\u63D0\u793A\u8BCD\u8FDB\u5165\u4E86\u76EE\u6807\u4F1A\u8BDD\uFF0C\u4E0D\u4EE3\u8868 agent \u6267\u884C\u6210\u529F\u3002",
        "auto_hist_records": "\u6700\u8FD1 {n} \u6761",
        "auto_hist_empty": "\u8FD8\u6CA1\u6709\u6295\u9012\u8BB0\u5F55\u3002",
        "auto_hist_pruned": "\u66F4\u65E9\u7684\u8BB0\u5F55\u5DF2\u88AB\u5BBF\u4E3B\u6E05\u7406\u3002",
        "auto_hist_missing": "\u5BBF\u4E3B\u4EFB\u52A1\u5DF2\u4E0D\u5B58\u5728\uFF0C\u65E0\u6CD5\u8BFB\u53D6\u6295\u9012\u8BB0\u5F55\u3002",
        "auto_hist_col_time": "\u6295\u9012\u65F6\u95F4",
        "auto_hist_col_detail": "\u8BE6\u60C5",
        "auto_runs_title": "\u8FD0\u884C\u8BB0\u5F55",
        "auto_runs_subtitle": "\u53EA\u5728\u672C\u673A\u4FDD\u7559\uFF0C\u4E0D\u968F\u5907\u4EFD\u540C\u6B65\uFF1B\u70B9\u51FB\u884C\u67E5\u770B\u8BE6\u60C5\u3002",
        "auto_runs_limitNote": "\u6700\u8FD1 200 \u6761",
        "auto_runs_filterRule": "\u89C4\u5219",
        "auto_runs_filterStatus": "\u72B6\u6001",
        "auto_runs_col_status": "\u72B6\u6001",
        "auto_runs_col_rule": "\u89C4\u5219",
        "auto_runs_origin_plugin": "\u63D2\u4EF6\u5185\u7F6E",
        "auto_runs_col_trigger": "\u89E6\u53D1",
        "auto_runs_col_start": "\u5F00\u59CB",
        "auto_runs_col_cost": "\u8017\u65F6",
        "auto_runs_col_summary": "\u7ED3\u679C\u6458\u8981",
        "auto_run_status_ok": "\u6210\u529F",
        "auto_run_status_error": "\u5931\u8D25",
        "auto_run_status_skipped": "\u8DF3\u8FC7",
        "auto_runs_detail_title": "\u8FD0\u884C\u8BE6\u60C5",
        "auto_runs_detail_id": "\u8FD0\u884C id",
        "auto_runs_detail_trigger": "\u89E6\u53D1",
        "auto_runs_detail_start": "\u5F00\u59CB",
        "auto_runs_detail_finish": "\u7ED3\u675F",
        "auto_runs_detail_cost": "\u8017\u65F6",
        "auto_runs_detail_error": "\u9519\u8BEF",
        "auto_runs_detail_result": "\u7ED3\u679C JSON",
        "auto_runs_detail_noError": "\u65E0\u9519\u8BEF",
        "auto_runs_empty_title": "\u8FD8\u6CA1\u6709\u8FD0\u884C\u8BB0\u5F55",
        "auto_runs_empty_body": "\u89C4\u5219\u8FD0\u884C\u540E\uFF0C\u8FD9\u91CC\u4FDD\u7559\u6700\u8FD1 200 \u6761\u8BB0\u5F55\u4E0E\u9519\u8BEF\u4FE1\u606F\u3002",
        "auto_tab_overview": "\u6982\u89C8",
        "auto_stats_title": "\u81EA\u52A8\u5316",
        "auto_stats_subtitle": "\u628A\u5B9A\u65F6\u3001\u57DF\u4E8B\u4EF6\u6216\u624B\u52A8\u64CD\u4F5C\u63A5\u5230\u5DF2\u542F\u7528\u7684 action\uFF1A\u6A21\u677F\u3001\u6761\u4EF6\u3001\u9650\u9891\u4E0E\u8FD0\u884C\u8BB0\u5F55\u3002",
        "auto_stats_kpi_total": "\u89C4\u5219\u603B\u6570",
        "auto_stats_kpi_totalHint": "\u672A\u5220\u9664\u7684\u89C4\u5219",
        "auto_stats_kpi_enabled": "\u5DF2\u542F\u7528",
        "auto_stats_kpi_enabledHint": "enabled=1 \u7684\u89C4\u5219",
        "auto_stats_kpi_ok": "\u4ECA\u65E5\u6210\u529F",
        "auto_stats_kpi_okHint": "\u8FD1 24 \u5C0F\u65F6 status=ok",
        "auto_stats_kpi_error": "\u4ECA\u65E5\u5931\u8D25",
        "auto_stats_kpi_errorHint": "\u8FD1 24 \u5C0F\u65F6 status=error",
        "auto_stats_kpi_skipped": "\u4ECA\u65E5\u8DF3\u8FC7",
        "auto_stats_kpi_skippedHint": "\u6761\u4EF6\u4E0D\u6EE1\u8DB3\u3001\u8D85\u9650\u6216\u5E76\u53D1\u5DF2\u6EE1",
        "auto_stats_origin_title": "\u6309\u6765\u6E90",
        "auto_stats_origin_hint": "\u7528\u6237\u81EA\u5B9A\u4E49\u4E0E\u63D2\u4EF6\u5185\u7F6E\u5206\u5F00\u7EDF\u8BA1\uFF1B\u5185\u7F6E\u89C4\u5219\u6765\u81EA\u63D2\u4EF6\u7684 DomainDef.automations \u58F0\u660E",
        "auto_stats_origin_user": "\u7528\u6237\u81EA\u5B9A\u4E49",
        "auto_stats_origin_builtin": "\u63D2\u4EF6\u5185\u7F6E",
        "auto_stats_origin_builtinEnabled": "\u5185\u7F6E\u542F\u7528",
        "auto_stats_origin_builtinDisabled": "\u5185\u7F6E\u505C\u7528",
        "auto_stats_origin_stale": "\u58F0\u660E\u5DF2\u6D88\u5931",
        "auto_stats_origin_uninstalled": "\u63D2\u4EF6\u5DF2\u5378\u8F7D",
        "auto_stats_originWarning": "\u6709 {stale} \u6761\u5185\u7F6E\u89C4\u5219\u58F0\u660E\u5DF2\u6D88\u5931\u3001{uninstalled} \u6761\u6240\u5C5E\u63D2\u4EF6\u5DF2\u5378\u8F7D\uFF1A\u5B83\u4EEC\u4E0D\u4F1A\u6267\u884C\uFF0C\u91CD\u65B0\u58F0\u660E\u6216\u91CD\u88C5\u63D2\u4EF6\u540E\u81EA\u52A8\u6062\u590D\u3002",
        "auto_stats_allowed": "\u5141\u8BB8\u8C03\u7528",
        "auto_stats_allowedHint": "\u5728\u8BBE\u7F6E\u9875\u52FE\u9009\uFF0C\u9ED8\u8BA4\u7A7A",
        "auto_stats_allowedEmpty": "\u5C1A\u672A\u542F\u7528\u4EFB\u4F55 action\uFF1B\u52FE\u9009\u540E\u624D\u80FD\u521B\u5EFA\u89C4\u5219\u3002",
        "auto_stats_gotoSettings": "\u53BB\u8BBE\u7F6E",
        "auto_stats_staleWarning": "{n} \u6761\u89C4\u5219\u7684 action \u672A\u542F\u7528\uFF0C\u8FD0\u884C\u4F1A\u88AB\u8DF3\u8FC7\u3002",
        "auto_stats_denied": "\u4E0D\u5141\u8BB8\u8C03\u7528",
        "auto_stats_deniedHint": "vault / automation / audit \u4E0E\u4EFB\u4F55\u5220\u9664\u3001\u5907\u4EFD\u7C7B action",
        "auto_stats_triggers": "\u89E6\u53D1\u65B9\u5F0F",
        "auto_stats_trigger_interval": "\u6BCF N \u5206\u949F\u6309 next_run_at \u5230\u671F\u6267\u884C\u3002",
        "auto_stats_trigger_dailyAt": "\u6309\u65F6\u95F4\u4E0E\u65F6\u533A\u8BA1\u7B97\u4E0B\u4E00\u6B21\uFF0C\u53EF\u9009\u661F\u671F\u3002",
        "auto_stats_trigger_event": "\u5BBF\u4E3B domain-event \u547D\u4E2D domainId + event \u65F6\u6267\u884C\u3002",
        "auto_stats_trigger_manual": "\u5728\u89C4\u5219\u9875\u70B9\u300C\u8FD0\u884C\u300D\uFF0C\u4ECD\u53D7\u5DF2\u542F\u7528\u6E05\u5355\u3001\u6761\u4EF6\u4E0E\u9650\u9891\u7EA6\u675F\u3002",
        "auto_config_title": "\u8BBE\u7F6E",
        "auto_config_subtitle": "\u9650\u6D41\u53C2\u6570\u4E0E\u5141\u8BB8\u8C03\u7528\u7684 action \u90FD\u5B58\u5728\u672C\u673A\uFF1B\u89C4\u5219\u4E0E\u5176\u5B83\u4E1A\u52A1\u6570\u636E\u4E00\u8D77\u53C2\u4E0E\u5907\u4EFD\u3002",
        "auto_config_limit_title": "\u9650\u6D41",
        "auto_config_limit_maxRules": "\u89C4\u5219\u6570\u91CF\u4E0A\u9650",
        "auto_config_limit_perHour": "\u6BCF\u89C4\u5219\u6BCF\u5C0F\u65F6\u4E0A\u9650",
        "auto_config_limit_hint": "\u89C4\u5219\u4E0A\u9650 1\u2013500\uFF1B\u6BCF\u5C0F\u65F6\u4E0A\u9650 1\u2013600\u3002\u8D85\u9650\u7684\u521B\u5EFA\u88AB\u62D2\uFF0C\u8D85\u9891\u7684\u8FD0\u884C\u8BB0 skipped\u3002",
        "auto_config_limit_unchanged": "\u5F53\u524D\u503C\u4E0E\u5DF2\u4FDD\u5B58\u4E00\u81F4",
        "auto_config_constraints_title": "\u8FD0\u884C\u7EA6\u675F",
        "auto_config_c_strategy": "\u5B9A\u65F6\u5668\u6BCF 30 \u79D2\u68C0\u67E5\u4E00\u6B21\uFF0C\u5355\u6B21\u6700\u591A\u53D6 3 \u6761\u5230\u671F\u89C4\u5219\u3002",
        "auto_config_c_concurrency": "\u5168\u5C40\u5E76\u53D1 2\uFF1B\u5E76\u53D1\u5DF2\u6EE1\u65F6\u5B9A\u65F6\u89E6\u53D1\u8BB0 skipped\uFF0C\u4E0D\u6392\u961F\u91CD\u8BD5\u3002",
        "auto_config_c_event": "\u4E8B\u4EF6\u89E6\u53D1\u7531\u5BBF\u4E3B domain-event \u9A71\u52A8\uFF0Cpayload \u4E3A {domainId,event,data}\u3002",
        "auto_config_c_condition": "\u6761\u4EF6\u4E0D\u6EE1\u8DB3\u8BB0 skipped\uFF0C\u4E0D\u8C03\u7528 action\u3002",
        "auto_config_c_backup": "\u89C4\u5219\u968F\u5907\u4EFD\u8FC1\u79FB\uFF1B\u5141\u8BB8\u6E05\u5355\u4E0E\u8FD0\u884C\u8BB0\u5F55\u53EA\u5728\u672C\u673A\uFF0C\u4E0D\u53C2\u4E0E\u4E91\u540C\u6B65\u3002",
        "auto_config_c_safety": "\u786C\u5E95\u7EBF\u4E0D\u53EF\u914D\u7F6E\uFF1Avault.*\u3001automation.*\u3001audit.* \u4E0E\u4EFB\u4F55 delete/backup action \u6C38\u8FDC\u4E0D\u5141\u8BB8\u88AB\u81EA\u52A8\u5316\u8C03\u7528\u3002",
        "auto_config_allowed_title": "\u5141\u8BB8\u8C03\u7528\u7684 action",
        "auto_config_allowed_hint": "\u9ED8\u8BA4\u7A7A\u3002\u53EA\u6709\u52FE\u9009\u540E\u7684 action \u624D\u80FD\u88AB\u89C4\u5219\u8C03\u7528\uFF1B\u786C\u5E95\u7EBF\u4E0D\u53D7\u6B64\u5904\u5F71\u54CD\u3002",
        "auto_config_allowed_search": "\u641C\u7D22 action \u6216\u6240\u5C5E\u57DF",
        "auto_config_allowed_selected": "\u5DF2\u9009 {n} \u4E2A",
        "auto_config_allowed_empty": "\u6CA1\u6709\u5339\u914D\u7684 action\uFF0C\u53EF\u5728\u4E0B\u65B9\u624B\u52A8\u6DFB\u52A0\u3002",
        "auto_config_allowed_extra": "\u5DF2\u9009\u4F46\u4E0D\u5728\u5019\u9009",
        "auto_config_allowed_manual": "\u624B\u52A8\u6DFB\u52A0 action",
        "auto_config_allowed_add": "\u6DFB\u52A0",
        "auto_config_allowed_invalid": "\u8BF7\u8F93\u5165 namespace.action\uFF0C\u4E14\u4E0D\u80FD\u662F vault / automation / audit \u6216 delete / backup\u3002",
        "auto_config_allowed_deniedNote": "vault / automation / audit \u4E0E\u5220\u9664\u3001\u5907\u4EFD\u7C7B action \u6C38\u8FDC\u4E0D\u53EF\u542F\u7528\u3002",
        // 页面骨架与「Action」页签（原插件没有这些键）
        "auto_common_listSep": "\u3001",
        "auto_editor_ex_message_title": "\u81EA\u52A8\u5316\u63D0\u9192",
        "auto_editor_ex_message_body": "\u89C4\u5219 {{rule.name}} \u5DF2\u8FD0\u884C",
        "auto_editor_ex_task_title": "\u6765\u81EA\u81EA\u52A8\u5316\u7684\u8DDF\u8FDB",
        "auto_editor_ex_task_description": "\u89C4\u5219 {{rule.name}} \u89E6\u53D1",
        "auto_editor_ex_tag_name": "\u81EA\u52A8\u5316",
        "auto_page_title": "\u81EA\u52A8\u5316",
        "auto_page_desc": "\u7528 action \u6216 AI \u89C4\u5219\u6309\u8BA1\u5212\u3001\u6309\u4E8B\u4EF6\u6267\u884C\u4EFB\u52A1\uFF0C\u5E76\u67E5\u770B\u8FD0\u884C\u8BB0\u5F55\u3002"
      },
      en: {
        "auto_common_save": "Save",
        "auto_common_cancel": "Cancel",
        "auto_common_close": "Close",
        "auto_common_next": "Next",
        "auto_common_back": "Back",
        "auto_common_more": "Load older deliveries",
        "auto_common_refresh": "Refresh",
        "auto_common_retry": "Retry",
        "auto_common_delete": "Delete",
        "auto_common_edit": "Edit",
        "auto_common_create": "New rule",
        "auto_common_createShort": "New",
        "auto_common_run": "Run now",
        "auto_common_enable": "Enable",
        "auto_common_disable": "Disable",
        "auto_common_search": "Search",
        "auto_common_clear": "Clear",
        "auto_common_all": "All",
        "auto_common_loading": "Loading\u2026",
        "auto_common_none": "\u2014",
        "auto_common_saved": "Saved",
        "auto_rules_title": "Rules",
        "auto_rules_subtitle": "Interval, domain event or manual; whitelisted actions only; per-rule hourly limit, global concurrency 2.",
        "auto_rules_searchPh": "Search name or action",
        "auto_rules_filterStatus": "Status",
        "auto_rules_filterTrigger": "Trigger",
        "auto_rules_filterOrigin": "Origin",
        "auto_rules_col_origin": "Origin",
        "auto_rules_origin_user": "User-defined",
        "auto_rules_origin_plugin": "Plugin built-in",
        "auto_rules_origin_state_active": "Declared by the plugin, follows its updates",
        "auto_rules_origin_state_updated": "Built-in rule updated",
        "auto_rules_origin_state_stale": "No longer declared by the plugin",
        "auto_rules_origin_state_uninstalled": "Plugin uninstalled",
        "auto_rules_builtinLocked": "Declared by the plugin: cannot be deleted, nor have its trigger or action changed; disable it or edit its args if allowed",
        "auto_rules_triggerCol": "Trigger",
        "auto_rules_status_on": "Enabled",
        "auto_rules_status_off": "Disabled",
        "auto_rules_col_name": "Name",
        "auto_rules_col_trigger": "Trigger",
        "auto_rules_col_action": "Action",
        "auto_rules_col_status": "Status",
        "auto_rules_col_lastRun": "Last run",
        "auto_rules_col_ops": "Actions",
        "auto_rules_empty_title": "No rules yet",
        "auto_rules_empty_body": "Create a rule to connect a schedule or domain event to a whitelisted action.",
        "auto_rules_empty_backup": "Rules travel with backups; run history stays on this device.",
        "auto_rules_empty_filtered": "No matching rules",
        "auto_rules_empty_filteredBody": "Try another keyword, or clear the filters.",
        "auto_rules_empty_noActionTitle": "No actions enabled yet",
        "auto_rules_empty_noActionBody": "Automation cannot call any action by default. Pick the ones you need in Settings first.",
        "auto_rules_empty_noActionCta": "Open settings",
        "auto_rules_empty_noActionHint": "Changes take effect immediately; no restart needed.",
        "auto_rules_actionDisabled": "Disabled",
        "auto_rules_confirm_delete": 'Delete rule "{name}"? This cannot be undone.',
        "auto_rules_running": "Running\u2026",
        "auto_rules_exec_mode": "Mode",
        "auto_rules_exec_action": "Run action",
        "auto_rules_exec_agent": "Hand to AI",
        "auto_rules_agentAction": "Handed to AI",
        "auto_rules_schedule_active": "Active",
        "auto_rules_schedule_paused": "Paused",
        "auto_rules_schedule_ended": "Ended",
        "auto_rules_schedule_missing": "Schedule deleted",
        "auto_rules_lastDelivery": "Last delivery",
        "auto_rules_history": "Delivery history",
        "auto_rules_agentOffline": "This Host does not expose the Schedule service, so AI rules are read-only for now.",
        "auto_rules_orphans": "{n} schedule task(s) in the Host are not registered as rules; manage them in the Schedule panel.",
        "auto_trigger_interval": "Interval",
        "auto_trigger_dailyAt": "Daily",
        "auto_trigger_event": "Event",
        "auto_trigger_manual": "Manual",
        "auto_trigger_interval_text": "Every {n} min",
        "auto_trigger_interval_textHours": "Every {n} h",
        "auto_trigger_daily_text": "Daily at {time} ({tz})",
        "auto_trigger_event_text": "Event {domain}/{event}",
        "auto_trigger_manual_text": "Manual",
        "auto_trigger_every": "Every",
        "auto_trigger_minutes": "minutes",
        "auto_trigger_hours": "hours",
        "auto_trigger_intervalHint": "1\u201310080 minutes; hours are converted by \xD760.",
        "auto_trigger_time": "Time (HH:MM)",
        "auto_trigger_tz": "Time zone",
        "auto_trigger_weekdays": "Weekdays",
        "auto_trigger_weekdaysHint": "None selected means every day; 1=Mon \u2026 7=Sun.",
        "auto_trigger_wd_1": "Mon",
        "auto_trigger_wd_2": "Tue",
        "auto_trigger_wd_3": "Wed",
        "auto_trigger_wd_4": "Thu",
        "auto_trigger_wd_5": "Fri",
        "auto_trigger_wd_6": "Sat",
        "auto_trigger_wd_7": "Sun",
        "auto_trigger_domain": "Domain id",
        "auto_trigger_eventName": "Event name",
        "auto_trigger_eventHint": "Common: wb-addon-connector / wb-addon-message / wb-addon-tasks.",
        "auto_trigger_manualHint": 'Runs only via "Run now" or a manual script call.',
        "auto_editor_newTitle": "New rule",
        "auto_editor_editTitle": "Edit rule",
        "auto_editor_section_basic": "Basics",
        "auto_editor_section_trigger": "Trigger",
        "auto_editor_section_run": "Action",
        "auto_editor_section_condition": "Condition (optional)",
        "auto_editor_name": "Name",
        "auto_editor_namePh": "e.g. Daily digest",
        "auto_editor_nameRequired": "Name is required",
        "auto_editor_enabled": "Enabled",
        "auto_editor_action": "Action",
        "auto_editor_actionRequired": "Pick an action",
        "auto_editor_noActions": "No actions enabled",
        "auto_editor_noActionsHint": "Enable actions in Settings before saving a rule.",
        "auto_editor_showExample": "View example args",
        "auto_editor_fillExample": "Fill example",
        "auto_editor_exampleHint": "The example replaces the current JSON after confirmation.",
        "auto_editor_insertVar": "Insert variable",
        "auto_editor_argsHint": "JSON object; template variables {{rule.name}}, {{event.item.title}}, {{item.url}}.",
        "auto_editor_conditionOn": "Enable condition",
        "auto_editor_conditionHint": "op: eq / neq / contains / gt / lt; field is a data path such as event.item.title.",
        "auto_editor_conditionEmpty": "Submits null when the condition is off.",
        "auto_editor_jsonInvalid": "Invalid JSON: {msg}",
        "auto_editor_nameEmptySave": "Enter a name to save",
        "auto_editor_discard": "Discard unsaved changes?",
        "auto_editor_format": "Format",
        "auto_editor_argsObject": "actionArgs must be a JSON object",
        "auto_editor_conditionObject": "Condition must be a JSON object",
        "auto_editor_exampleTitle": "Example args",
        "auto_editor_ruleFallbackHint": "The trigger scans every 30 seconds, at most 3 rules per scan.",
        "auto_editor_section_mode": "Mode",
        "auto_editor_mode_action": "Run action",
        "auto_editor_mode_actionHint": "Call an enabled action directly on a schedule or domain event: deterministic, no tokens.",
        "auto_editor_mode_agent": "Hand to AI",
        "auto_editor_mode_agentHint": "Register the prompt with the Host Schedule service; each delivery starts a model request and the result is not deterministic.",
        "auto_editor_mode_locked": "The mode cannot change after creation; create a new rule instead.",
        "auto_editor_mode_agentUnavailable": 'This Host does not expose the Schedule service, so "Hand to AI" is unavailable.',
        "auto_editor_section_prompt": "Prompt",
        "auto_editor_prompt": "Prompt",
        "auto_editor_promptPh": "e.g. Read today's tasks and messages, then send me a short digest.",
        "auto_editor_promptHint": "Delivered verbatim to the agent; state the goal, the data to read and the expected output.",
        "auto_editor_promptRequired": "AI rules need a prompt",
        "auto_editor_section_timing": "Timing (driven by the Host)",
        "auto_editor_section_target": "Delivery target",
        "auto_editor_target": "Target",
        "auto_editor_target_new_once": "New session (reused afterwards)",
        "auto_editor_target_new": "New session each time",
        "auto_editor_targetHint": 'The Host delivers the prompt into an empty session; "each time" may run concurrently.',
        "auto_editor_targetCwd": "Workspace path (optional)",
        "auto_editor_targetPreset": "Agent preset (optional)",
        "auto_editor_targetPresetPh": "Leave empty for the Host default",
        "auto_editor_targetSession": "Session id",
        "auto_editor_targetSessionPh": "Existing session id to deliver into",
        "auto_editor_targetSessionRequired": "A session id is required when delivering into an existing session",
        "auto_agent_every": "Every",
        "auto_agent_after": "Delay",
        "auto_agent_daily": "Daily",
        "auto_agent_weekly": "Weekly",
        "auto_agent_cron": "cron expression",
        "auto_agent_rrule": "RRULE",
        "auto_agent_at": "One-off",
        "auto_agent_everyHint": "At least 1 minute, at most 30 days.",
        "auto_agent_afterHint": "Runs once, N minutes after saving.",
        "auto_agent_cronPh": "0 9 * * 1-5",
        "auto_agent_cronHint": "Five fields: minute hour day month weekday.",
        "auto_agent_rrulePh": "DTSTART;TZID=Asia/Shanghai:20260101T090000\nRRULE:FREQ=DAILY",
        "auto_agent_rruleHint": "Two lines: DTSTART then RRULE.",
        "auto_agent_date": "Date",
        "auto_agent_text_every": "Every {n} min",
        "auto_agent_text_everyHours": "Every {n} h",
        "auto_agent_text_daily": "Daily at {time} ({tz})",
        "auto_agent_text_weekly": "Every {days} at {time} ({tz})",
        "auto_agent_text_cron": "cron {expr} ({tz})",
        "auto_agent_text_rrule": "RRULE {expr}",
        "auto_agent_text_at": "Once at {at}",
        "auto_agent_text_after": "Once in {n} minutes",
        "auto_agent_text_missing": "No timing set",
        "auto_hist_title": "Delivery history",
        "auto_hist_subtitle": "Recorded by the Host; a receipt only means the prompt reached the session, not that the agent succeeded.",
        "auto_hist_records": "Latest {n}",
        "auto_hist_empty": "No deliveries yet.",
        "auto_hist_pruned": "Earlier records were pruned by the Host.",
        "auto_hist_missing": "The schedule task no longer exists; history is unavailable.",
        "auto_hist_col_time": "Delivered at",
        "auto_hist_col_detail": "Detail",
        "auto_runs_title": "Run history",
        "auto_runs_subtitle": "Local only, not synced with backups; click a row for details.",
        "auto_runs_limitNote": "Latest 200",
        "auto_runs_filterRule": "Rule",
        "auto_runs_filterStatus": "Status",
        "auto_runs_col_status": "Status",
        "auto_runs_col_rule": "Rule",
        "auto_runs_origin_plugin": "Plugin built-in",
        "auto_runs_col_trigger": "Trigger",
        "auto_runs_col_start": "Started",
        "auto_runs_col_cost": "Duration",
        "auto_runs_col_summary": "Summary",
        "auto_run_status_ok": "OK",
        "auto_run_status_error": "Failed",
        "auto_run_status_skipped": "Skipped",
        "auto_runs_detail_title": "Run details",
        "auto_runs_detail_id": "Run id",
        "auto_runs_detail_trigger": "Trigger",
        "auto_runs_detail_start": "Started",
        "auto_runs_detail_finish": "Finished",
        "auto_runs_detail_cost": "Duration",
        "auto_runs_detail_error": "Error",
        "auto_runs_detail_result": "Result JSON",
        "auto_runs_detail_noError": "No error",
        "auto_runs_empty_title": "No runs yet",
        "auto_runs_empty_body": "Once rules run, the latest 200 runs and errors are kept here.",
        "auto_tab_overview": "Overview",
        "auto_stats_title": "Automation",
        "auto_stats_subtitle": "Connect schedules, domain events or manual actions to whitelisted actions: templates, conditions, limits and history.",
        "auto_stats_kpi_total": "Rules",
        "auto_stats_kpi_totalHint": "Not deleted",
        "auto_stats_kpi_enabled": "Enabled",
        "auto_stats_kpi_enabledHint": "enabled=1",
        "auto_stats_kpi_ok": "OK today",
        "auto_stats_kpi_okHint": "Last 24h status=ok",
        "auto_stats_kpi_error": "Failed today",
        "auto_stats_kpi_errorHint": "Last 24h status=error",
        "auto_stats_kpi_skipped": "Skipped today",
        "auto_stats_kpi_skippedHint": "Condition, rate limit or concurrency",
        "auto_stats_origin_title": "By origin",
        "auto_stats_origin_hint": "User-defined and plugin built-in rules are counted separately; built-in rules come from DomainDef.automations",
        "auto_stats_origin_user": "User-defined",
        "auto_stats_origin_builtin": "Plugin built-in",
        "auto_stats_origin_builtinEnabled": "Built-in enabled",
        "auto_stats_origin_builtinDisabled": "Built-in disabled",
        "auto_stats_origin_stale": "No longer declared",
        "auto_stats_origin_uninstalled": "Plugin uninstalled",
        "auto_stats_originWarning": "{stale} built-in rule(s) are no longer declared and {uninstalled} belong to uninstalled plugins: they will not run and recover once the plugin declares them again.",
        "auto_stats_allowed": "Allowed",
        "auto_stats_allowedHint": "Chosen in Settings; empty by default",
        "auto_stats_allowedEmpty": "No actions enabled yet; enable some before creating rules.",
        "auto_stats_gotoSettings": "Open settings",
        "auto_stats_staleWarning": "{n} rule(s) use actions that are not enabled and will be skipped.",
        "auto_stats_denied": "Denied",
        "auto_stats_deniedHint": "vault / automation / audit and any delete or backup action",
        "auto_stats_triggers": "Triggers",
        "auto_stats_trigger_interval": "Runs when next_run_at is due every N minutes.",
        "auto_stats_trigger_dailyAt": "Next run from time and time zone, optional weekdays.",
        "auto_stats_trigger_event": "A host domain-event matching domainId + event.",
        "auto_stats_trigger_manual": '"Run now" on the rules page, still subject to whitelist, conditions and limits.',
        "auto_config_title": "Settings",
        "auto_config_subtitle": "Limits and allowed actions stay on this device; rules are part of regular backups.",
        "auto_config_limit_title": "Rate limits",
        "auto_config_limit_maxRules": "Max rules",
        "auto_config_limit_perHour": "Runs per rule per hour",
        "auto_config_limit_hint": "Rules 1\u2013500; runs per hour 1\u2013600. Excess creation is rejected, excess runs are recorded as skipped.",
        "auto_config_limit_unchanged": "Matches the saved value",
        "auto_config_constraints_title": "Runtime constraints",
        "auto_config_c_strategy": "The timer checks every 30 seconds and picks at most 3 due rules.",
        "auto_config_c_concurrency": "Global concurrency 2; when full, scheduled triggers are recorded as skipped without retry.",
        "auto_config_c_event": "Events come from the host domain-event bus; payload is {domainId,event,data}.",
        "auto_config_c_condition": "A false condition records skipped and does not call the action.",
        "auto_config_c_backup": "Rules travel with backups; the allowed list and run history stay on this device.",
        "auto_config_c_safety": "Hard limits are not configurable: vault.*, automation.*, audit.* and any delete/backup action can never be called.",
        "auto_config_allowed_title": "Allowed actions",
        "auto_config_allowed_hint": "Empty by default. Only checked actions can be called by rules; hard limits always apply.",
        "auto_config_allowed_search": "Search action or domain",
        "auto_config_allowed_selected": "{n} selected",
        "auto_config_allowed_empty": "No matching action; add one manually below.",
        "auto_config_allowed_extra": "Selected but not in catalog",
        "auto_config_allowed_manual": "Add action manually",
        "auto_config_allowed_add": "Add",
        "auto_config_allowed_invalid": "Use namespace.action, and avoid vault / automation / audit or delete / backup.",
        "auto_config_allowed_deniedNote": "vault / automation / audit and delete/backup actions can never be enabled.",
        "auto_common_listSep": ", ",
        "auto_editor_ex_message_title": "Automation reminder",
        "auto_editor_ex_message_body": "Rule {{rule.name}} has run",
        "auto_editor_ex_task_title": "Follow-up from automation",
        "auto_editor_ex_task_description": "Triggered by rule {{rule.name}}",
        "auto_editor_ex_tag_name": "automation",
        "auto_page_title": "Automation",
        "auto_page_desc": "Run actions or AI rules on a schedule or event, and review the run history."
      }
    };
    module2.exports = { zh: DICT.zh, en: DICT.en };
  }
});

// packages/shell/client/locale.cjs
var require_locale2 = __commonJS({
  "packages/shell/client/locale.cjs"(exports2, module2) {
    "use strict";
    var LOCALE2 = {
      zh: {
        tab_roles: "\u89D2\u8272\u7BA1\u7406",
        roles_desc: "\u67E5\u770B\u63D2\u4EF6\u89D2\u8272\uFF0C\u521B\u5EFA\u548C\u7EF4\u62A4\u81EA\u5DF1\u7684\u4F1A\u8BDD\u89D2\u8272",
        role_title: "\u5DE5\u4F5C\u53F0\u89D2\u8272",
        role_none: "\u4E0D\u4F7F\u7528\u5DE5\u4F5C\u53F0\u89D2\u8272",
        role_none_desc: "\u6CBF\u7528\u5F53\u524D DSH \u4F1A\u8BDD\u8BBE\u7F6E",
        role_missing: "\u89D2\u8272\u5DF2\u4E0D\u53EF\u7528\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9",
        role_next: "\u9009\u62E9\u5C06\u4ECE\u4E0B\u4E00\u8F6E\u5BF9\u8BDD\u751F\u6548\u3002",
        role_close: "\u5173\u95ED",
        role_retry: "\u91CD\u8BD5",
        role_error: "\u65E0\u6CD5\u8BFB\u53D6\u6216\u4FDD\u5B58\u4F1A\u8BDD\u8BBE\u7F6E",
        role_loading: "\u8BFB\u53D6\u4E2D\u2026",
        role_search: "\u641C\u7D22\u89D2\u8272\uFF08\u540D\u79F0\u3001\u57DF\u3001\u8BF4\u660E\u6216\u52A8\u4F5C\uFF09",
        role_search_clear: "\u6E05\u7A7A\u641C\u7D22",
        role_search_empty: "\u6CA1\u6709\u5339\u914D\u7684\u89D2\u8272",
        role_search_count: "\u5339\u914D {shown} / \u5171 {total} \u4E2A\u89D2\u8272",
        role_hint: "\u2191\u2193 \u9009\u62E9 \xB7 Enter \u786E\u8BA4 \xB7 Esc \u5173\u95ED",
        role_step_basic: "\u57FA\u672C\u4FE1\u606F",
        role_step_instructions: "\u89D2\u8272\u6307\u4EE4",
        role_step_actions: "\u5141\u8BB8\u7684\u52A8\u4F5C",
        role_step_confirm: "\u786E\u8BA4\u4E0E\u4FDD\u5B58",
        role_step_label: "\u521B\u5EFA\u6B65\u9AA4",
        role_wizard_new: "\u65B0\u5EFA\u89D2\u8272",
        role_wizard_edit: "\u7F16\u8F91\u89D2\u8272",
        role_name: "\u540D\u79F0",
        role_description: "\u804C\u8D23\u7B80\u4ECB",
        role_name_required: "\u8BF7\u5148\u586B\u5199\u89D2\u8272\u540D\u79F0",
        role_instructions: "\u89D2\u8272\u6307\u4EE4",
        role_instructions_required: "\u8BF7\u5148\u586B\u5199\u89D2\u8272\u6307\u4EE4",
        role_edit: "\u7F16\u8F91",
        role_preview: "\u9884\u89C8",
        role_preview_empty: "\u8FD8\u6CA1\u6709\u5185\u5BB9",
        role_chars: "{n} \u5B57",
        role_actions_title: "\u5141\u8BB8\u7684\u5DE5\u4F5C\u53F0\u52A8\u4F5C",
        role_actions_selected: "\u5DF2\u9009 {n} \u9879",
        role_actions_search: "\u7B5B\u9009\u52A8\u4F5C\u540D\u6216\u8BF4\u660E",
        role_actions_select_all: "\u5168\u9009",
        role_actions_clear: "\u6E05\u7A7A\u672C\u57DF",
        role_actions_manual: "\u624B\u52A8\u8865\u5145\u52A8\u4F5C\u540D\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09",
        role_actions_manual_hint: "\u7528\u4E8E\u76EE\u5F55\u91CC\u6682\u672A\u5217\u51FA\u3001\u4F46\u786E\u5B9E\u5B58\u5728\u7684\u52A8\u4F5C",
        role_unknown_title: "\u8FD9\u4E9B\u52A8\u4F5C\u4E0D\u5B58\u5728\uFF1A",
        role_unknown_hint: "\u8BF7\u6539\u6210\u771F\u5B9E\u52A8\u4F5C\u540D\u540E\u518D\u7EE7\u7EED\uFF0C\u5426\u5219\u89D2\u8272\u6BCF\u6B21\u8C03\u7528\u90FD\u4F1A\u88AB\u62D2\u3002",
        role_back: "\u4E0A\u4E00\u6B65",
        role_next_step: "\u4E0B\u4E00\u6B65",
        role_save: "\u4FDD\u5B58",
        role_cancel: "\u53D6\u6D88",
        role_summary_name: "\u540D\u79F0",
        role_summary_description: "\u804C\u8D23\u7B80\u4ECB",
        role_summary_actions: "\u5141\u8BB8\u7684\u52A8\u4F5C",
        role_summary_actions_value: "\u5DF2\u9009 {n} \u9879",
        role_summary_instructions: "\u6307\u4EE4\u957F\u5EA6",
        role_summary_chars: "{n} \u5B57",
        role_summary_effect: "\u751F\u6548\u65F6\u673A",
        role_summary_effect_value: "\u4FDD\u5B58\u540E\u4ECE\u4E0B\u4E00\u8F6E\u5BF9\u8BDD\u751F\u6548\u3002",
        role_summary_empty: "\u672A\u586B\u5199",
        nav: "\u5DE5\u4F5C\u53F0",
        title: "\u5DE5\u4F5C\u53F0",
        tagline: "\u79BB\u7EBF\u4F18\u5148 \xB7 \u4E1A\u52A1\u63D2\u4EF6\u7531 DSH \u5B89\u88C5",
        tab_account: "\u8D26\u53F7\u4E0E\u540C\u6B65",
        tab_addons: "\u5B50\u63D2\u4EF6",
        tab_backup: "\u6570\u636E\u5907\u4EFD",
        tab_automation: "\u81EA\u52A8\u5316",
        automation_desc: "\u7528 action \u6216 AI \u89C4\u5219\u6309\u8BA1\u5212\u3001\u6309\u4E8B\u4EF6\u6267\u884C\u4EFB\u52A1\uFF1A\u7BA1\u7406\u89C4\u5219\u3001\u8FD0\u884C\u8BB0\u5F55\u4E0E\u8BBE\u7F6E",
        tab_data: "\u6570\u636E",
        data_desc: "\u6D4F\u89C8\u5BBF\u4E3B\u81EA\u5DF1\u7EF4\u62A4\u7684\u5E73\u53F0\u8868\uFF08meta\u3001\u540C\u6B65\u65E5\u5FD7/\u6B7B\u4FE1/\u6C34\u4F4D\u3001\u4F1A\u8BDD\u89D2\u8272\u3001\u5BA1\u8BA1\u65E5\u5FD7\uFF09\uFF1A\u53EA\u8BFB\u3001\u53EF\u641C\u7D22\u3001\u53EF\u5206\u9875",
        tab_config: "\u914D\u7F6E",
        config_desc: "\u6309\u65B9\u6848\u7BA1\u7406\u5907\u4EFD\u504F\u597D\u3002\u5BA1\u8BA1\u8BBE\u7F6E\u5BF9\u672C\u673A\u6240\u6709\u65B9\u6848\u751F\u6548\u3002",
        tab_queue: "\u4E8B\u4EF6\u961F\u5217",
        queue_desc: "\u5BBF\u4E3B\u4E8B\u4EF6\u961F\u5217\u7684\u8FD0\u884C\u89C6\u56FE\uFF1A\u5404\u63D2\u4EF6\u58F0\u660E\u4F1A\u53D1\u5E03/\u76D1\u542C\u54EA\u4E9B\u4E8B\u4EF6\u3001\u4E8B\u4EF6\u4E0E\u6309\u8BA2\u9605\u62C6\u51FA\u7684\u6295\u9012\uFF1B\u5931\u8D25\u6295\u9012\u53EF\u91CD\u6295\uFF0C\u5386\u53F2\u4E8B\u4EF6\u53EF\u6E05\u7406",
        queue_queued: "\u6392\u961F",
        queue_dead: "\u6B7B\u4FE1",
        queue_pending: "\u5F85\u6295\u9012",
        queue_done: "\u5DF2\u5B8C\u6210",
        queue_subscriptions: "\u8BA2\u9605",
        queue_tab_domains: "\u63D2\u4EF6",
        queue_domain_publishes: "\u53D1\u5E03",
        queue_domain_listens: "\u76D1\u542C",
        queue_domain_receives: "\u5B9A\u5411\u6536\u4EF6",
        queue_no_receive: "\u6CA1\u6709\u6536\u5230\u5B9A\u5411\u4E8B\u4EF6",
        queue_mode: "\u6295\u9012\u65B9\u5F0F",
        queue_all_modes: "\u5168\u90E8\u65B9\u5F0F",
        queue_mode_broadcast: "\u5E7F\u64AD",
        queue_mode_targeted: "\u5B9A\u5411",
        queue_sent: "\u5DF2\u53D1",
        queue_not_registered: "\u58F0\u660E\u4F46\u672A\u767B\u8BB0",
        queue_no_publish: "\u4E0D\u53D1\u5E03\u4E8B\u4EF6",
        queue_no_listen: "\u4E0D\u76D1\u542C\u4E8B\u4EF6",
        queue_domain_error: "\u521D\u59CB\u5316\u5931\u8D25",
        queue_tab_events: "\u4E8B\u4EF6",
        queue_tab_deliveries: "\u6295\u9012",
        queue_tab_subscriptions: "\u8BA2\u9605",
        queue_all_status: "\u5168\u90E8\u72B6\u6001",
        queue_refresh: "\u5237\u65B0",
        queue_cleanup: "\u6E05\u7406\u5386\u53F2",
        queue_replay: "\u91CD\u6295",
        queue_empty: "\u961F\u5217\u91CC\u8FD8\u6CA1\u6709\u8BB0\u5F55",
        queue_loading: "\u8BFB\u53D6\u4E2D\u2026",
        queue_prev: "\u4E0A\u4E00\u9875",
        queue_next: "\u4E0B\u4E00\u9875",
        queue_status: "\u72B6\u6001",
        queue_domain: "\u8BA2\u9605\u65B9",
        queue_event_type: "\u4E8B\u4EF6\u7C7B\u578B",
        queue_action: "\u6D88\u8D39 action",
        queue_source: "\u63A8\u9001\u65B9",
        queue_created: "\u521B\u5EFA\u65F6\u95F4",
        queue_payload: "\u8F7D\u8377",
        queue_attempts: "\u5C1D\u8BD5",
        queue_next_at: "\u4E0B\u6B21\u91CD\u8BD5",
        queue_last_error: "\u6700\u8FD1\u9519\u8BEF",
        queue_replay_confirm: "\u91CD\u6295\u8FD9\u6761\u6295\u9012\uFF1F\u5C1D\u8BD5\u6B21\u6570\u4F1A\u6E05\u96F6\uFF0C\u961F\u5217\u4F1A\u7ACB\u523B\u518D\u6D3E\u53D1\u4E00\u6B21\u3002",
        queue_replay_ok: "\u5DF2\u91CD\u65B0\u6392\u961F",
        queue_cleanup_confirm: "\u6E05\u7406 7 \u5929\u524D\u5DF2\u7EC8\u7ED3\uFF08\u5B8C\u6210/\u6B7B\u4FE1\uFF09\u7684\u4E8B\u4EF6\u53CA\u5176\u6295\u9012\uFF1F",
        queue_cleanup_ok: "\u5DF2\u6E05\u7406",
        queue_health_idle: "\u961F\u5217\u7A7A\u95F2",
        queue_health_busy: "\u6B63\u5728\u6D3E\u53D1",
        queue_health_dead: "\u6709\u6B7B\u4FE1\u5F85\u5904\u7406",
        queue_health_idle_hint: "\u6CA1\u6709\u6392\u961F\u4E2D\u6216\u5F85\u6295\u9012\u7684\u4E8B\u4EF6",
        queue_health_busy_hint: "\u6709\u4E8B\u4EF6\u5728\u6392\u961F\u6216\u7B49\u5F85\u6295\u9012\uFF0C\u5BBF\u4E3B\u6B63\u5728\u540E\u53F0\u63A8\u8FDB",
        queue_health_dead_hint: "\u6B7B\u4FE1\u4E0D\u4F1A\u81EA\u52A8\u91CD\u8BD5\uFF0C\u9700\u8981\u4EBA\u5DE5\u91CD\u6295",
        queue_types: "\u4E8B\u4EF6\u7C7B\u578B\u5206\u5E03",
        queue_recent: "\u6700\u8FD1\u4E8B\u4EF6",
        queue_no_types: "\u8FD8\u6CA1\u6709\u4EFB\u4F55\u4E8B\u4EF6\u7C7B\u578B",
        queue_total_events: "\u5171 {n} \u6761",
        queue_empty_hint: "\u4E8B\u4EF6\u88AB\u63A8\u5165\u540E\u4F1A\u7ACB\u523B\u51FA\u73B0\u5728\u8FD9\u91CC",
        queue_empty_domains: "\u6CA1\u6709\u5DF2\u6CE8\u518C\u7684\u63D2\u4EF6\u57DF",
        queue_empty_events: "\u5F53\u524D\u7B5B\u9009\u4E0B\u6CA1\u6709\u4E8B\u4EF6",
        queue_empty_deliveries: "\u5F53\u524D\u7B5B\u9009\u4E0B\u6CA1\u6709\u6295\u9012",
        queue_empty_subs: "\u8FD8\u6CA1\u6709\u63D2\u4EF6\u767B\u8BB0\u8BA2\u9605",
        queue_ago_just: "\u521A\u521A",
        queue_ago_min: "{n} \u5206\u949F\u524D",
        queue_ago_hour: "{n} \u5C0F\u65F6\u524D",
        queue_ago_day: "{n} \u5929\u524D",
        queue_auto: "\u81EA\u52A8\u5237\u65B0",
        queue_updated_at: "\u66F4\u65B0\u4E8E {t}",
        config_scheme_none: "\u4E0D\u4F7F\u7528\u65B9\u6848\uFF08\u5BBF\u4E3B\u9ED8\u8BA4\u503C\uFF09",
        config_scheme_default: "\u4FEE\u6539\u5907\u4EFD\u504F\u597D\u4F1A\u521B\u5EFA\u672C\u673A\u65B9\u6848\u3002",
        config_scheme_local: "\u5907\u4EFD\u504F\u597D\u65B9\u6848\u4EC5\u4FDD\u5B58\u5728\u672C\u673A\u3002",
        config_scheme_delete: "\u5220\u9664\u5F53\u524D\u65B9\u6848\u5E76\u4F7F\u7528\u9ED8\u8BA4\u5907\u4EFD\u504F\u597D\uFF1F",
        config_scheme_from_default: "\u4ECE\u5BBF\u4E3B\u9ED8\u8BA4\u503C\u5F00\u59CB",
        config_modules: "\u9ED8\u8BA4\u5BFC\u51FA\u6A21\u5757",
        config_dynamic_all: "\u81EA\u52A8\u9009\u62E9\u5168\u90E8\u53EF\u5BFC\u51FA\u6A21\u5757\uFF08\u542B\u4EE5\u540E\u65B0\u589E\uFF09",
        config_format: "\u9ED8\u8BA4\u5BFC\u51FA\u683C\u5F0F",
        config_read_error: "\u65E0\u6CD5\u8BFB\u53D6\u914D\u7F6E",
        config_saved: "\u5DF2\u4FDD\u5B58",
        config_fallback: "\u8BFB\u53D6\u5907\u4EFD\u504F\u597D\u5931\u8D25\uFF0C\u672C\u6B21\u4F7F\u7528\u9ED8\u8BA4\u503C\u3002",
        loading: "\u8BFB\u53D6\u4E2D\u2026",
        reset_default: "\u6062\u590D\u9ED8\u8BA4",
        sync_progress: "\u540C\u6B65\u8FDB\u5EA6",
        sync_current_table: "\u5F53\u524D\u8868",
        sync_mode_tree: "\u6574\u8868",
        sync_mode_row: "\u9010\u884C",
        backup_desc: "\u6309\u6A21\u5757\u5BFC\u51FA\u6216\u5BFC\u5165\u672C\u5730\u6570\u636E\uFF1B\u5BFC\u5165\u53EA\u5408\u5E76\uFF0C\u4E0D\u5220\u9664\u5DF2\u6709\u6570\u636E",
        backup_modules: "\u9009\u62E9\u8981\u5BFC\u51FA\u7684\u6A21\u5757",
        backup_export_result: "\u5BFC\u51FA\u7ED3\u679C",
        backup_select_all: "\u5168\u9009",
        backup_clear: "\u6E05\u7A7A",
        backup_export: "\u5BFC\u51FA\u5907\u4EFD",
        backup_import: "\u5BFC\u5165\u5907\u4EFD",
        backup_exporting: "\u6B63\u5728\u5BFC\u51FA\u2026",
        backup_importing: "\u6B63\u5728\u5BFC\u5165\u2026",
        backup_no_modules: "\u5F53\u524D\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u6A21\u5757",
        backup_select_required: "\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A\u6A21\u5757",
        backup_import_result: "\u5BFC\u5165\u7ED3\u679C",
        backup_summary: "\u6C47\u603B",
        backup_detail: "\u6A21\u5757\u660E\u7EC6",
        backup_status: "\u72B6\u6001",
        backup_imported: "\u5BFC\u5165",
        backup_skipped: "\u8DF3\u8FC7",
        backup_failed: "\u5931\u8D25",
        backup_ok: "\u6210\u529F",
        backup_partial: "\u90E8\u5206\u6210\u529F",
        backup_failed_status: "\u5931\u8D25",
        backup_skipped_status: "\u8DF3\u8FC7",
        backup_exported_at: "\u5BFC\u51FA\u65F6\u95F4",
        backup_shell_version: "\u58F3\u7248\u672C",
        backup_format: "\u5907\u4EFD\u683C\u5F0F",
        backup_incompatible: "\u5907\u4EFD\u683C\u5F0F\u7248\u672C\u4E0D\u517C\u5BB9\uFF0C\u8BF7\u5347\u7EA7\u5DE5\u4F5C\u53F0\u540E\u518D\u5BFC\u5165",
        backup_invalid: "\u5907\u4EFD\u6587\u4EF6\u65E0\u6548",
        backup_file_hint: "\u652F\u6301 .zip \u5907\u4EFD\u5305",
        backup_download_started: "\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u5907\u4EFD",
        backup_import_done: "\u5BFC\u5165\u5B8C\u6210",
        backup_export_failed: "\u5BFC\u51FA\u5931\u8D25",
        backup_import_failed: "\u5BFC\u5165\u5931\u8D25",
        backup_no_import: "\u672A\u5B9E\u73B0\u5BFC\u5165",
        backup_no_export: "\u672A\u5B9E\u73B0\u5BFC\u51FA",
        backup_refresh: "\u91CD\u65B0\u8BFB\u53D6\u6A21\u5757",
        backup_cap_export: "\u53EF\u5BFC\u51FA",
        backup_cap_import: "\u53EF\u5BFC\u5165",
        backup_dup_policy: "\u91CD\u590D ID \u65F6",
        backup_dup_newest: "\u4EE5\u65F6\u95F4\u6700\u65B0\u4E3A\u4E3B",
        backup_dup_skip: "\u4FDD\u7559\u672C\u5730\uFF08\u8DF3\u8FC7\uFF09",
        backup_dup_overwrite: "\u7528\u5907\u4EFD\u8986\u76D6",
        backup_dup_hint: "\u5BFC\u5165\u65F6\u5BF9\u540C ID \u8BB0\u5F55\u7684\u5904\u7406\u65B9\u5F0F",
        backup_policy: "\u7B56\u7565",
        backup_modules_title: "\u6A21\u5757",
        backup_modules_hint: "\u52FE\u9009\u8981\u5BFC\u51FA\u7684\u6A21\u5757\uFF1B\u53F3\u4FA7\u9F7F\u8F6E\u8BBE\u7F6E\u5BFC\u5165\u65F6\u7684\u91CD\u590D ID \u7B56\u7565",
        backup_selected_count: "\u5DF2\u9009 {n} / {all} \u4E2A\u6A21\u5757",
        backup_export_title: "\u5BFC\u51FA",
        backup_import_title: "\u5BFC\u5165",
        backup_export_format: "\u5BFC\u51FA\u683C\u5F0F",
        backup_table_unit: "\u5F20\u8868",
        backup_no_tables: "\u8BE5\u6A21\u5757\u6CA1\u6709\u6570\u636E\u8868",
        backup_fmt_zip: "zip \u5907\u4EFD\u5305",
        backup_fmt_zip_hint: "\u53EF\u5BFC\u5165\u6062\u590D\uFF0C\u542B\u5168\u90E8\u539F\u59CB\u6570\u636E",
        backup_fmt_json: "JSON",
        backup_fmt_json_hint: "\u6BCF\u5F20\u8868\u4E00\u4E2A .json\uFF0C\u9644 metadata.json",
        backup_fmt_csv: "CSV",
        backup_fmt_csv_hint: "\u6BCF\u5F20\u8868\u4E00\u4E2A .csv\uFF0C\u53EF\u76F4\u63A5\u7528\u8868\u683C\u8F6F\u4EF6\u6253\u5F00",
        backup_fmt_txt: "TXT",
        backup_fmt_txt_hint: "\u6BCF\u5F20\u8868\u4E00\u4E2A .txt\uFF0C\u9002\u5408\u5FEB\u901F\u6D4F\u89C8",
        backup_readonly_hint: "JSON / CSV / TXT \u6309\u8868\u62C6\u5206\u5E76\u6253\u5305\u6210 zip\uFF0C\u5143\u6570\u636E\u653E\u5728 metadata.json\uFF1B\u8FD9\u4E09\u79CD\u662F\u53EA\u8BFB\u5BFC\u51FA\uFF0C\u4E0D\u80FD\u5BFC\u5165\u6062\u590D\uFF0C\u6062\u590D\u6570\u636E\u8BF7\u7528 zip \u5907\u4EFD\u5305\u3002",
        backup_import_drop: "\u9009\u62E9\u6216\u62D6\u5165 .zip \u5907\u4EFD\u5305",
        backup_import_drop_sub: "\u5BFC\u5165\u53EA\u5408\u5E76\uFF0C\u4E0D\u5220\u9664\u5DF2\u6709\u6570\u636E",
        backup_import_hint: "\u540C\u4E00 ID \u7684\u8BB0\u5F55\u6309\u5404\u6A21\u5757\u300C\u91CD\u590D ID \u65F6\u300D\u7684\u7B56\u7565\u5904\u7406",
        // 数据清空：确认词必须与宿主 packages/shell/src/infra/data-clear.ts 的 CLEAR_CONFIRM 一致。
        clear_title: "\u6E05\u7A7A\u672C\u673A\u6570\u636E",
        clear_scope_hint: "\u4E0D\u53EF\u64A4\u9500\uFF0C\u5EFA\u8BAE\u5148\u5BFC\u51FA zip \u5907\u4EFD",
        clear_desc: "\u628A\u672C\u673A\u5DE5\u4F5C\u53F0\u6062\u590D\u5230\u521A\u5B89\u88C5\u63D2\u4EF6\u65F6\u7684\u72B6\u6001\u3002\u53EA\u5F71\u54CD\u8FD9\u53F0\u8BBE\u5907\uFF0C\u79C1\u4EBA\u4E91\u7AEF\u7684\u6570\u636E\u4E0D\u53D7\u5F71\u54CD\uFF1B\u4E3A\u514D\u4E0B\u6B21\u540C\u6B65\u628A\u6570\u636E\u62C9\u56DE\u6765\uFF0C\u4E91\u7AEF\u8FDE\u63A5\u4F1A\u4E00\u5E76\u65AD\u5F00\u3002",
        clear_scope_data: "\u5168\u90E8\u4E1A\u52A1\u6570\u636E\uFF1A\u4EFB\u52A1\u3001\u6807\u7B7E\u3001\u7AD9\u70B9\u3001\u50A8\u7269\u3001\u90AE\u4EF6\u3001\u65E5\u5386\u3001\u8054\u7CFB\u4EBA\u3001\u8FDE\u63A5\u5668\u3001\u81EA\u52A8\u5316\u7B49",
        clear_scope_config: "\u5404\u63D2\u4EF6\u7684\u672C\u673A\u914D\u7F6E\u65B9\u6848\u4E0E\u754C\u9762\u504F\u597D",
        clear_scope_sync: "\u540C\u6B65\u6E38\u6807\u3001\u53D8\u66F4\u65E5\u5FD7\u3001\u51B2\u7A81\u5F85\u529E\u4E0E\u5F85\u91CD\u8BD5\u961F\u5217",
        clear_scope_cloud: "\u4E91\u7AEF\u8FDE\u63A5\u914D\u7F6E\u4E0E\u767B\u5F55\u51ED\u636E\uFF08\u6E05\u7A7A\u540E\u9700\u8981\u91CD\u65B0\u8FDE\u63A5\u6216\u767B\u5F55\uFF09",
        clear_confirm_label: "\u8F93\u5165\u786E\u8BA4\u8BCD\u4EE5\u542F\u7528\u6309\u94AE\uFF1A",
        clear_phrase_placeholder: "\u6E05\u7A7A\u5168\u90E8\u6570\u636E",
        clear_action: "\u6E05\u7A7A\u5168\u90E8\u6570\u636E",
        clear_running: "\u6B63\u5728\u6E05\u7A7A\u2026",
        clear_sync_busy: "\u6B63\u5728\u540C\u6B65\uFF0C\u7B49\u672C\u8F6E\u540C\u6B65\u7ED3\u675F\u540E\u518D\u8BD5",
        clear_failed: "\u6E05\u7A7A\u5931\u8D25",
        clear_done: "\u5DF2\u6E05\u7A7A",
        clear_done_counts: "{tables} \u5F20\u8868\u3001{rows} \u884C\u6570\u636E",
        clear_done_sub: "\u4E91\u7AEF\u8FDE\u63A5\u5DF2\u65AD\u5F00\uFF0C\u540E\u53F0\u540C\u6B65\u5DF2\u505C\u6B62\uFF1B\u5237\u65B0\u9875\u9762\u540E\u4F60\u4F1A\u770B\u5230\u5E72\u51C0\u7684\u521D\u59CB\u72B6\u6001\u3002",
        clear_reload: "\u5237\u65B0\u5DE5\u4F5C\u53F0",
        clear_note: "\u5BFC\u51FA\u7684\u5907\u4EFD\u6587\u4EF6\u4E0D\u53D7\u5F71\u54CD\uFF0C\u9700\u8981\u6062\u590D\u65F6\u4ECD\u53EF\u4ECE\u5907\u4EFD\u5BFC\u5165\u3002",
        back_home: "\u8FD4\u56DE\u9996\u9875",
        open: "\u6253\u5F00",
        manage: "\u5DE5\u4F5C\u53F0\u7BA1\u7406",
        // 首页栏目名：与宿主 packages/shell/src/infra/categories.ts 的 id 一一对应；宿主没下发文案时的兜底。
        cat_work: "\u5DE5\u4F5C\u4E0E\u8BA1\u5212",
        cat_comm: "\u6C9F\u901A\u4E0E\u6D88\u606F",
        cat_assets: "\u8D44\u4EA7\u4E0E\u8D44\u6599",
        cat_finance: "\u8D22\u52A1",
        cat_auto: "\u81EA\u52A8\u5316\u4E0E\u96C6\u6210",
        cat_other: "\u5176\u4ED6",
        home_hint: "\u70B9\u5F00\u5361\u7247\u8FDB\u5165\u4E1A\u52A1\u63D2\u4EF6\uFF1B\u5B89\u88C5\u4E0E\u5378\u8F7D\u5728 DSH \u63D2\u4EF6\u7BA1\u7406\u91CC",
        search_placeholder: "\u641C\u7D22\u4EFB\u52A1\u3001\u6807\u7B7E\u3001\u7AD9\u70B9\u3001\u8FDE\u63A5\u5668\u5185\u5BB9\u2026\uFF08\u2318K\uFF09",
        searching: "\u641C\u7D22\u4E2D\u2026",
        search_none: "\u6CA1\u6709\u547D\u4E2D",
        search_partial: "\u90E8\u5206\u57DF\u641C\u7D22\u5931\u8D25",
        account_desc: "\u767B\u5F55\u4E91\u7AEF\u8D26\u53F7\uFF0C\u5907\u4EFD\u4E0E\u540C\u6B65\u6570\u636E",
        tab_agent: "\u5BBF\u4E3B action \u6743\u9650",
        tab_agent_list: "Agent \u6743\u9650\u6E05\u5355",
        agent_list_desc: "\u53EA\u8BFB\uFF1A\u5F53\u524D\u6240\u6709\u5BF9 agent \u5F00\u653E\u7684 action\uFF0C\u6309\u57DF\u6C47\u603B\uFF0C\u4FBF\u4E8E\u4E00\u773C\u770B\u6E05 agent \u80FD\u505A\u4EC0\u4E48\u3002",
        agent_list_count: "{n} \u4E2A action \u5BF9 agent \u5F00\u653E\uFF08\u5171 {all} \u4E2A\uFF0C\u8986\u76D6 {d} \u4E2A\u57DF\uFF09",
        agent_list_readonly: "\u53EA\u8BFB\u9875\uFF1B\u8981\u6539\u6765\u6E90\u8BF7\u5230\u5BF9\u5E94\u63D2\u4EF6\u7684 Action \u9875\u6216\u300C\u5BBF\u4E3B action \u6743\u9650\u300D\u9875",
        agent_list_search: "\u641C\u7D22",
        agent_list_search_ph: "action \u540D\u79F0 / \u57DF / \u8BF4\u660E",
        agent_list_domain: "\u57DF",
        agent_list_all_domains: "\u5168\u90E8\u57DF",
        agent_list_col_action: "action",
        agent_list_col_domain: "\u57DF",
        agent_list_col_desc: "\u8BF4\u660E",
        agent_list_col_origins: "\u751F\u6548\u6765\u6E90",
        agent_list_narrow: "\u58F0\u660E\u4E0A\u754C",
        agent_list_invalid: "\u65E0\u6CD5\u8BFB\u53D6\u6743\u9650\u6E05\u5355\uFF1A\u5BBF\u4E3B\u672A\u8FD4\u56DE\u5B8C\u6574\u7684 action \u6765\u6E90\u4FE1\u606F",
        agent_list_no_match: "\u6CA1\u6709\u7B26\u5408\u5F53\u524D\u7B5B\u9009\u6761\u4EF6\u7684 action",
        agent_list_empty: "\u6CA1\u6709\u5BF9 agent \u5F00\u653E\u7684 action",
        agent_list_loading: "\u8BFB\u53D6\u4E2D\u2026",
        agent_desc: "\u9010\u4E2A action \u9009\u62E9\u5141\u8BB8\u7684\u8C03\u7528\u6765\u6E90\uFF08\u754C\u9762 / \u63D2\u4EF6 / agent / \u540C\u6B65\uFF09\uFF1B\u8BBE\u7F6E\u53EA\u5B58\u672C\u673A\u3001\u7ACB\u5373\u751F\u6548\uFF0C\u4E0D\u8FDB\u5907\u4EFD\u4E0E\u4E91\u540C\u6B65",
        tab_audit: "\u5BA1\u8BA1\u65E5\u5FD7",
        audit_desc: "\u672C\u673A\u884C\u4E3A\u8D26\u672C\uFF1A\u8C01\u5728\u4F55\u65F6\u8C03\u7528\u4E86\u54EA\u4E2A action\u3001\u6210\u529F\u4E0E\u5426\uFF1B\u5BC6\u7801\u4E0E token \u7B49\u53C2\u6570\u5DF2\u8131\u654F",
        audit_filters: "\u7B5B\u9009",
        audit_action_prefix: "action \u524D\u7F00",
        audit_actor: "\u5165\u53E3",
        audit_ok: "\u7ED3\u679C",
        audit_all: "\u5168\u90E8",
        audit_ok_only: "\u53EA\u770B\u6210\u529F",
        audit_fail_only: "\u53EA\u770B\u5931\u8D25",
        audit_q: "\u5173\u952E\u5B57",
        audit_since: "\u8D77\u59CB\u65E5\u671F",
        audit_until: "\u7ED3\u675F\u65E5\u671F",
        audit_search: "\u67E5\u8BE2",
        audit_refresh: "\u5237\u65B0",
        audit_empty: "\u5F53\u524D\u7B5B\u9009\u65E0\u8BB0\u5F55",
        audit_load_failed: "\u8BFB\u53D6\u5BA1\u8BA1\u65E5\u5FD7\u5931\u8D25",
        audit_time: "\u65F6\u95F4",
        audit_action: "action",
        audit_target: "\u76EE\u6807",
        audit_duration: "\u8017\u65F6",
        audit_detail: "\u53C2\u6570\u4E0E\u7ED3\u679C",
        audit_error: "\u9519\u8BEF",
        audit_active: "\u7B5B\u9009\u4E2D",
        audit_clear: "\u6E05\u9664\u7B5B\u9009",
        audit_loading: "\u67E5\u8BE2\u4E2D\u2026",
        audit_page_size: "\u6BCF\u9875\u6761\u6570",
        audit_stats: "\u8FD1 30 \u5929\uFF08\u4E0D\u53D7\u4E0A\u65B9\u7B5B\u9009\u5F71\u54CD\uFF09",
        audit_total: "\u5171",
        audit_failed: "\u5931\u8D25",
        audit_prev: "\u4E0A\u4E00\u9875",
        audit_next: "\u4E0B\u4E00\u9875",
        audit_page: "\u9875",
        audit_retention: "\u9ED8\u8BA4\u4FDD\u7559 90 \u5929\uFF1B\u53EF\u7528 audit.prune \u8C03\u6574\u4FDD\u7559\u671F",
        audit_reads_hint: "\u53EA\u8BFB action \u9ED8\u8BA4\u4E0D\u8BB0\uFF1Bmeta.audit.recordReads=1 \u65F6\u8BB0\u5F55",
        addons_desc: "\u5B89\u88C5\u3001\u5347\u7EA7\u6216\u5378\u8F7D\u5B50\u63D2\u4EF6",
        no_views: "\u8BE5\u5B50\u63D2\u4EF6\u6CA1\u6709\u6CE8\u518C\u754C\u9762",
        addon_loading: "\u6B63\u5728\u52A0\u8F7D\u5B50\u63D2\u4EF6\u754C\u9762\u2026",
        addon_unavailable: "\u5B50\u63D2\u4EF6\u754C\u9762\u4E0D\u53EF\u7528",
        views: "\u4E2A\u89C6\u56FE",
        addons_installed: "\u5DF2\u5B89\u88C5\u7684\u5B50\u63D2\u4EF6",
        addons_cloud: "\u4E91\u7AEF\u76EE\u5F55",
        install: "\u5B89\u88C5",
        upgrade: "\u5347\u7EA7",
        installed: "\u5DF2\u5B89\u88C5",
        uninstall: "\u5378\u8F7D",
        confirm_uninstall: "\u786E\u8BA4\u5378\u8F7D",
        installing: "\u6B63\u5728\u5B89\u88C5\u2026",
        refresh: "\u5237\u65B0\u76EE\u5F55",
        no_installed: "\u8FD8\u6CA1\u6709\u5B89\u88C5\u4E1A\u52A1\u63D2\u4EF6\u2014\u2014\u5728 DSH \u63D2\u4EF6\u7BA1\u7406\u91CC\u5B89\u88C5\u4EFB\u52A1\u8BB0\u5F55\u3001\u6807\u7B7E\u6216\u7AD9\u70B9",
        no_catalog: "\u4E91\u7AEF\u76EE\u5F55\u4E3A\u7A7A\u6216\u4E0D\u53EF\u8FBE",
        catalog_loading: "\u6B63\u5728\u8BFB\u53D6\u4E91\u7AEF\u76EE\u5F55\u2026",
        cached_notice: "\u4E91\u7AEF\u4E0D\u53EF\u8FBE\uFF0C\u663E\u793A\u4E0A\u6B21\u7F13\u5B58\u7684\u76EE\u5F55",
        install_failed: "\u5B89\u88C5\u5931\u8D25",
        uninstall_failed: "\u5378\u8F7D\u5931\u8D25",
        load_failed: "\u5BA2\u6237\u7AEF\u52A0\u8F7D\u5931\u8D25",
        data_kept: "\u5378\u8F7D\u53EA\u5220\u4EE3\u7801\uFF0C\u6570\u636E\u4FDD\u7559\uFF1B\u91CD\u88C5\u540E\u6570\u636E\u4ECD\u5728",
        addon_error: "\u52A0\u8F7D\u5F02\u5E38",
        source_cloud: "\u4E91\u7AEF",
        source_local: "\u672C\u5730\u76EE\u5F55",
        version: "\u7248\u672C",
        latest: "\u6700\u65B0",
        shell_version: "\u58F3\u7248\u672C",
        delete: "\u5220\u9664",
        login: "\u767B\u5F55",
        signup: "\u6CE8\u518C",
        email: "\u90AE\u7BB1",
        password: "\u5BC6\u7801",
        logout: "\u9000\u51FA\u767B\u5F55",
        logged_in_as: "\u5DF2\u767B\u5F55",
        not_logged_in: "\u672A\u767B\u5F55\u2014\u2014\u6570\u636E\u4EC5\u5B58\u672C\u673A SQLite",
        sync_now: "\u7ACB\u5373\u540C\u6B65",
        sync_pushed: "\u63A8\u9001",
        sync_pulled: "\u62C9\u53D6",
        device_name: "\u672C\u8BBE\u5907",
        sync_status: "\u540C\u6B65\u72B6\u6001",
        sync_last: "\u4E0A\u6B21\u540C\u6B65",
        sync_never: "\u5C1A\u672A\u540C\u6B65",
        sync_conflicts: "\u51B2\u7A81",
        sync_failed_tables: "\u5931\u8D25\u7684\u8868",
        sync_clock: "\u65F6\u949F\u504F\u79FB",
        sync_no_conflicts: "\u6CA1\u6709\u5F85\u5904\u7406\u7684\u51B2\u7A81",
        sync_conflict_hint: "\u540C\u4E00\u884C\u5728\u672C\u5730\u548C\u4E91\u7AEF\u90FD\u88AB\u4FEE\u6539\uFF0C\u9009\u62E9\u4FDD\u7559\u54EA\u4E2A\u7248\u672C",
        sync_keep_local: "\u4FDD\u7559\u672C\u5730",
        sync_keep_server: "\u91C7\u7528\u4E91\u7AEF",
        sync_dismiss: "\u5FFD\u7565",
        sync_resolve_failed: "\u51B2\u7A81\u5904\u7406\u5931\u8D25",
        sync_ok: "\u540C\u6B65\u5B8C\u6210",
        sync_partial: "\u90E8\u5206\u8868\u540C\u6B65\u5931\u8D25",
        cloud_status: "\u4E91\u7AEF\u8FDE\u63A5\u72B6\u6001",
        cloud_checking: "\u68C0\u67E5\u4E91\u7AEF\u2026",
        cloud_checking_hint: "\u6B63\u5728\u68C0\u67E5\u4E91\u7AEF\u8FDE\u63A5",
        cloud_local: "\u672C\u5730\u6A21\u5F0F",
        cloud_local_hint: "\u672A\u767B\u5F55\u4E91\u7AEF\uFF1B\u6570\u636E\u53EA\u4FDD\u5B58\u5728\u672C\u673A\uFF0C\u4ECD\u53EF\u6B63\u5E38\u4F7F\u7528",
        cloud_syncing: "\u6B63\u5728\u540C\u6B65\u2026",
        cloud_syncing_hint: "\u6B63\u5728\u4E0E\u4E91\u7AEF\u540C\u6B65\u6570\u636E",
        cloud_online: "\u4E91\u7AEF\u5DF2\u8FDE\u63A5",
        cloud_online_hint: "\u8D26\u53F7\u5DF2\u8FDE\u63A5\uFF0C\u6570\u636E\u4F1A\u81EA\u52A8\u540C\u6B65",
        cloud_offline: "\u4E91\u7AEF\u8FDE\u63A5\u5931\u8D25",
        cloud_offline_hint: "\u65E0\u6CD5\u8FDE\u63A5\u5230\u4E91\u7AEF\uFF1B\u672C\u5730\u6570\u636E\u4ECD\u53EF\u6B63\u5E38\u4F7F\u7528",
        cloud_never: "\u7B49\u5F85\u9996\u6B21\u540C\u6B65",
        cloud_never_hint: "\u5DF2\u767B\u5F55\u4E91\u7AEF\uFF0C\u6B63\u5728\u7B49\u5F85\u9996\u8F6E\u540C\u6B65",
        cloud_sync_failed: "\u540C\u6B65\u5F02\u5E38",
        cloud_sync_failed_hint: "\u4E91\u7AEF\u53EF\u8FDE\u63A5\uFF0C\u4F46\u4E0A\u6B21\u540C\u6B65\u672A\u5B8C\u5168\u6210\u529F",
        cloud_open: "\u6253\u5F00\u8D26\u53F7\u4E0E\u540C\u6B65",
        cloud_settings: "\u4E91\u7AEF\u7C7B\u578B",
        cloud_open_config: "\u524D\u5F80\u914D\u7F6E",
        cloud_mode_none: "\u4EC5\u672C\u673A",
        cloud_mode_private: "\u79C1\u4EBA\u4E91\u7AEF",
        cloud_mode_shared: "\u5171\u4EAB\u4E91\u7AEF",
        cloud_mode_none_hint: "\u4E0D\u8FDE\u63A5\u4E91\u7AEF\uFF0C\u6570\u636E\u53EA\u4FDD\u5B58\u5728\u672C\u673A",
        cloud_mode_private_hint: "\u5355\u7528\u6237\uFF0C\u591A\u53F0\u8BBE\u5907\u4E4B\u95F4\u540C\u6B65\u81EA\u5DF1\u7684\u6570\u636E",
        cloud_mode_shared_hint: "\u591A\u7528\u6237\u8D26\u53F7\u4F53\u7CFB\uFF0C\u767B\u5F55\u540E\u540C\u6B65",
        cloud_switch_hint: "\u5207\u6362\u4E91\u7AEF\u4F1A\u6E05\u7A7A\u672C\u673A\u540C\u6B65\u6E38\u6807\u5E76\u91CD\u65B0\u5168\u91CF\u540C\u6B65\uFF0C\u4E1A\u52A1\u6570\u636E\u4E0D\u53D7\u5F71\u54CD",
        cloud_url_ph: "\u670D\u52A1\u7AEF\u5730\u5740\uFF0C\u5982 https://cloud.example.com",
        cloud_secret_ph: "\u8BBF\u95EE\u5BC6\u94A5\uFF0C\u81F3\u5C11 16 \u4F4D",
        cloud_secret_keep: "\u5DF2\u8BBE\u7F6E\u8BBF\u95EE\u5BC6\u94A5\uFF1B\u7559\u7A7A\u8868\u793A\u4E0D\u4FEE\u6539",
        cloud_device_label: "\u672C\u8BBE\u5907\u540D\u79F0\uFF08\u4FBF\u4E8E\u5728\u8BBE\u5907\u5217\u8868\u91CC\u533A\u5206\uFF09",
        cloud_save: "\u4FDD\u5B58",
        cloud_saving: "\u4FDD\u5B58\u4E2D\u2026",
        cloud_saved: "\u5DF2\u4FDD\u5B58\u4E91\u7AEF\u8BBE\u7F6E",
        cloud_save_failed: "\u4FDD\u5B58\u5931\u8D25",
        cloud_test: "\u6D4B\u8BD5\u8FDE\u63A5",
        cloud_testing: "\u6D4B\u8BD5\u4E2D\u2026",
        cloud_ok: "\u8FDE\u63A5\u6B63\u5E38",
        cloud_test_fail: "\u8FDE\u63A5\u5931\u8D25",
        cloud_auth_ok: "\u8BBF\u95EE\u5BC6\u94A5\u6709\u6548",
        cloud_auth_bad: "\u5DF2\u8FDE\u63A5\uFF0C\u4F46\u8BBF\u95EE\u5BC6\u94A5\u65E0\u6548",
        cloud_server: "\u670D\u52A1\u7AEF",
        cloud_devices_count: "\u8BBE\u5907\u6570",
        cloud_shared_hint: "\u5171\u4EAB\u4E91\u7AEF\u8BF7\u524D\u5F80\u300C\u8D26\u53F7\u4E0E\u540C\u6B65\u300D\u767B\u5F55"
      },
      en: {
        tab_roles: "Role management",
        roles_desc: "Browse plugin roles and manage your own session roles",
        role_title: "Workbench role",
        role_none: "No workbench role",
        role_none_desc: "Use the current DSH session settings",
        role_missing: "Role unavailable. Choose another role.",
        role_next: "Changes apply to the next turn.",
        role_close: "Close",
        role_retry: "Retry",
        role_error: "Could not read or save session settings",
        role_loading: "Loading\u2026",
        role_search: "Search roles (name, domain, description or action)",
        role_search_clear: "Clear search",
        role_search_empty: "No matching roles",
        role_search_count: "{shown} of {total} roles match",
        role_hint: "\u2191\u2193 select \xB7 Enter confirm \xB7 Esc close",
        role_step_basic: "Basics",
        role_step_instructions: "Instructions",
        role_step_actions: "Actions",
        role_step_confirm: "Review",
        role_step_label: "Setup steps",
        role_wizard_new: "New role",
        role_wizard_edit: "Edit role",
        role_name: "Name",
        role_description: "Description",
        role_name_required: "Enter a role name first",
        role_instructions: "Instructions",
        role_instructions_required: "Enter role instructions first",
        role_edit: "Edit",
        role_preview: "Preview",
        role_preview_empty: "Nothing to preview",
        role_chars: "{n} chars",
        role_actions_title: "Allowed workbench actions",
        role_actions_selected: "{n} selected",
        role_actions_search: "Filter actions by name or description",
        role_actions_select_all: "All",
        role_actions_clear: "Clear domain",
        role_actions_manual: "Extra action names (one per line)",
        role_actions_manual_hint: "For actions that are valid but not listed",
        role_unknown_title: "These actions do not exist:",
        role_unknown_hint: "Fix the names before continuing, otherwise every call from this role will be rejected.",
        role_back: "Back",
        role_next_step: "Next",
        role_save: "Save",
        role_cancel: "Cancel",
        role_summary_name: "Name",
        role_summary_description: "Description",
        role_summary_actions: "Allowed actions",
        role_summary_actions_value: "{n} selected",
        role_summary_instructions: "Instruction length",
        role_summary_chars: "{n} chars",
        role_summary_effect: "Takes effect",
        role_summary_effect_value: "From the next turn after saving.",
        role_summary_empty: "Not set",
        nav: "Workbench",
        title: "Workbench",
        tagline: "Offline-first \xB7 addons installed by DSH",
        tab_account: "Account & Sync",
        tab_addons: "Addons",
        tab_backup: "Data backup",
        tab_automation: "Automation",
        automation_desc: "Run actions or AI rules on a schedule or event: manage rules, run history and settings",
        tab_data: "Data",
        data_desc: "Browse the platform tables the host itself owns (meta, sync log/dead letters/state, session roles, audit log): read-only, searchable, paged",
        tab_config: "Settings",
        config_desc: "Manage backup preferences in schemes. Audit settings apply to every scheme on this device.",
        tab_queue: "Event queue",
        queue_desc: "Runtime view of the host event queue: which events each plugin declares to publish or listen to, plus events and per-subscription deliveries; failed deliveries can be replayed and finished events cleaned up",
        queue_queued: "Queued",
        queue_dead: "Dead",
        queue_pending: "Pending",
        queue_done: "Done",
        queue_subscriptions: "Subs",
        queue_tab_domains: "Plugins",
        queue_domain_publishes: "Publishes",
        queue_domain_listens: "Listens",
        queue_domain_receives: "Targeted inbox",
        queue_no_receive: "No targeted events received",
        queue_mode: "Mode",
        queue_all_modes: "All modes",
        queue_mode_broadcast: "Broadcast",
        queue_mode_targeted: "Targeted",
        queue_sent: "sent",
        queue_not_registered: "declared, not registered",
        queue_no_publish: "Publishes nothing",
        queue_no_listen: "Listens to nothing",
        queue_domain_error: "setup failed",
        queue_tab_events: "Events",
        queue_tab_deliveries: "Deliveries",
        queue_tab_subscriptions: "Subscriptions",
        queue_all_status: "All statuses",
        queue_refresh: "Refresh",
        queue_cleanup: "Clean up",
        queue_replay: "Replay",
        queue_empty: "Nothing in the queue yet",
        queue_loading: "Loading\u2026",
        queue_prev: "Prev",
        queue_next: "Next",
        queue_status: "Status",
        queue_domain: "Subscriber",
        queue_event_type: "Event type",
        queue_action: "Consuming action",
        queue_source: "Source",
        queue_created: "Created",
        queue_payload: "Payload",
        queue_attempts: "Attempts",
        queue_next_at: "Next try",
        queue_last_error: "Last error",
        queue_replay_confirm: "Replay this delivery? Attempts reset to zero and the queue dispatches again right away.",
        queue_replay_ok: "Re-queued",
        queue_cleanup_confirm: "Delete finished (done/dead) events and their deliveries older than 7 days?",
        queue_cleanup_ok: "Deleted",
        queue_health_idle: "Queue idle",
        queue_health_busy: "Dispatching",
        queue_health_dead: "Dead letters need attention",
        queue_health_idle_hint: "Nothing queued or waiting for delivery",
        queue_health_busy_hint: "Events are queued or waiting; the host is working through them",
        queue_health_dead_hint: "Dead letters are never retried automatically; replay them by hand",
        queue_types: "Event types",
        queue_recent: "Recent events",
        queue_no_types: "No event types yet",
        queue_total_events: "{n} total",
        queue_empty_hint: "Events show up here the moment they are pushed",
        queue_empty_domains: "No plugin domain registered",
        queue_empty_events: "No events for this filter",
        queue_empty_deliveries: "No deliveries for this filter",
        queue_empty_subs: "No plugin subscribed yet",
        queue_ago_just: "just now",
        queue_ago_min: "{n} min ago",
        queue_ago_hour: "{n} h ago",
        queue_ago_day: "{n} d ago",
        queue_auto: "Auto refresh",
        queue_updated_at: "updated {t}",
        config_scheme_none: "No scheme (host defaults)",
        config_scheme_default: "Editing backup preferences creates a local scheme.",
        config_scheme_local: "Backup preference schemes are stored on this device.",
        config_scheme_delete: "Delete the active scheme and use the default backup preferences?",
        config_scheme_from_default: "Start from host defaults",
        config_modules: "Default export modules",
        config_dynamic_all: "Select all exportable modules, including future ones",
        config_format: "Default export format",
        config_read_error: "Could not read configuration",
        config_saved: "Saved",
        config_fallback: "Could not read backup preferences. Using defaults for this visit.",
        loading: "Loading\u2026",
        reset_default: "Reset to default",
        sync_progress: "Sync progress",
        sync_current_table: "Current table",
        sync_mode_tree: "tree",
        sync_mode_row: "row",
        backup_desc: "Export or import local data per module; import merges and never deletes existing rows",
        backup_modules: "Modules to export",
        backup_export_result: "Export result",
        backup_select_all: "Select all",
        backup_clear: "Clear",
        backup_export: "Export backup",
        backup_import: "Import backup",
        backup_exporting: "Exporting\u2026",
        backup_importing: "Importing\u2026",
        backup_no_modules: "No exportable modules",
        backup_select_required: "Select at least one module",
        backup_import_result: "Import result",
        backup_summary: "Summary",
        backup_detail: "Module details",
        backup_status: "Status",
        backup_imported: "imported",
        backup_skipped: "skipped",
        backup_failed: "failed",
        backup_ok: "ok",
        backup_partial: "partial",
        backup_failed_status: "failed",
        backup_skipped_status: "skipped",
        backup_exported_at: "Exported at",
        backup_shell_version: "Shell version",
        backup_format: "Format",
        backup_incompatible: "Backup format is incompatible; update the workbench before importing",
        backup_invalid: "Invalid backup file",
        backup_file_hint: "Supports .zip backups",
        backup_download_started: "Backup download started",
        backup_import_done: "Import finished",
        backup_export_failed: "Export failed",
        backup_import_failed: "Import failed",
        backup_no_import: "Import not implemented",
        backup_no_export: "Export not implemented",
        backup_refresh: "Reload modules",
        backup_cap_export: "export",
        backup_cap_import: "import",
        backup_dup_policy: "On duplicate ID",
        backup_dup_newest: "Keep newest by time",
        backup_dup_skip: "Keep local (skip)",
        backup_dup_overwrite: "Overwrite with backup",
        backup_dup_hint: "How to handle rows with the same ID on import",
        backup_policy: "Policy",
        backup_modules_title: "Modules",
        backup_modules_hint: "Pick the modules to export; the gear sets the duplicate-ID policy used on import",
        backup_selected_count: "{n} of {all} modules selected",
        backup_export_title: "Export",
        backup_import_title: "Import",
        backup_export_format: "Export format",
        backup_table_unit: "tables",
        backup_no_tables: "No data tables",
        backup_fmt_zip: "zip backup",
        backup_fmt_zip_hint: "Importable and restorable, contains all raw data",
        backup_fmt_json: "JSON",
        backup_fmt_json_hint: "One .json per table, plus metadata.json",
        backup_fmt_csv: "CSV",
        backup_fmt_csv_hint: "One .csv per table, opens in a spreadsheet",
        backup_fmt_txt: "TXT",
        backup_fmt_txt_hint: "One .txt per table for quick reading",
        backup_readonly_hint: "JSON / CSV / TXT are packed as a zip: one file per table plus metadata.json. They are read-only and cannot be restored; use a zip backup to restore.",
        backup_import_drop: "Choose or drop a .zip backup",
        backup_import_drop_sub: "Import merges and never deletes existing rows",
        backup_import_hint: "Rows with the same ID follow each module's duplicate-ID policy",
        clear_title: "Clear local data",
        clear_scope_hint: "Cannot be undone; export a zip backup first",
        clear_desc: "Restores this workbench to the state right after installing the plugins. Only this device is affected; data in your private cloud is untouched, and the cloud connection is disconnected so the next sync cannot pull it back.",
        clear_scope_data: "All business data: tasks, tags, sites, storage, mail, calendar, contacts, connectors, automations",
        clear_scope_config: "Local configuration schemes and UI preferences of every plugin",
        clear_scope_sync: "Sync cursors, change log, conflict queue and retry queue",
        clear_scope_cloud: "Cloud connection settings and login credentials (reconnect or sign in again afterwards)",
        clear_confirm_label: "Type the confirmation phrase to enable the button:",
        clear_phrase_placeholder: "\u6E05\u7A7A\u5168\u90E8\u6570\u636E",
        clear_action: "Clear all data",
        clear_running: "Clearing\u2026",
        clear_sync_busy: "A sync is running; try again when it finishes",
        clear_failed: "Clear failed",
        clear_done: "Cleared",
        clear_done_counts: "{tables} tables, {rows} rows",
        clear_done_sub: "The cloud connection is disconnected and background sync has stopped. Refresh to see the clean initial state.",
        clear_reload: "Reload workbench",
        clear_note: "Exported backup files are untouched and can still be imported later.",
        back_home: "Back to home",
        open: "Open",
        manage: "Manage",
        // Home category names; ids match packages/shell/src/infra/categories.ts.
        cat_work: "Work & Planning",
        cat_comm: "Communication",
        cat_assets: "Assets & Docs",
        cat_finance: "Finance",
        cat_auto: "Automation & Integrations",
        cat_other: "Other",
        home_hint: "Open a card to enter a domain; install or remove plugins in DSH",
        search_placeholder: "Search tasks, tags, sites, connector items\u2026 (\u2318K)",
        searching: "Searching\u2026",
        search_none: "No matches",
        search_partial: "Some domains failed",
        account_desc: "Sign in to back up and sync your data",
        tab_agent: "Host action origins",
        tab_agent_list: "Agent access list",
        agent_list_desc: "Read-only: every action the agent can currently call, grouped by domain.",
        agent_list_count: "{n} actions open to the agent ({all} total across {d} domains)",
        agent_list_readonly: "Read-only; change origins on the plugin's Action page or the Host action origins page",
        agent_list_search: "Search",
        agent_list_search_ph: "action name / domain / description",
        agent_list_domain: "Domain",
        agent_list_all_domains: "All domains",
        agent_list_col_action: "Action",
        agent_list_col_domain: "Domain",
        agent_list_col_desc: "Description",
        agent_list_col_origins: "Effective origins",
        agent_list_narrow: "declared upper bound",
        agent_list_invalid: "Cannot read the permission list: the host returned incomplete action origins",
        agent_list_no_match: "No actions match the current filters",
        agent_list_empty: "No action is open to the agent",
        agent_list_loading: "Loading\u2026",
        agent_desc: "Pick which origins may call each action (UI / plugin / agent / sync); settings stay on this machine, apply immediately, and are never backed up or synced",
        tab_audit: "Audit log",
        audit_desc: "A local ledger of who called which action and how it went; passwords and tokens are redacted",
        audit_filters: "Filters",
        audit_action_prefix: "Action prefix",
        audit_actor: "Actor",
        audit_ok: "Result",
        audit_all: "All",
        audit_ok_only: "Succeeded",
        audit_fail_only: "Failed",
        audit_q: "Keyword",
        audit_since: "Since",
        audit_until: "Until",
        audit_search: "Search",
        audit_refresh: "Refresh",
        audit_empty: "No audit records match",
        audit_load_failed: "Failed to load the audit log",
        audit_time: "Time",
        audit_action: "Action",
        audit_target: "Target",
        audit_duration: "Duration",
        audit_detail: "Arguments & result",
        audit_error: "Error",
        audit_active: "Filtering",
        audit_clear: "Clear filters",
        audit_loading: "Loading\u2026",
        audit_page_size: "Records per page",
        audit_stats: "Last 30 days (unaffected by filters)",
        audit_total: "total",
        audit_failed: "failed",
        audit_prev: "Previous",
        audit_next: "Next",
        audit_page: "page",
        audit_retention: "Retained for 90 days by default; adjust with audit.prune",
        audit_reads_hint: "Read-only actions are not recorded unless meta.audit.recordReads=1",
        addons_desc: "Install, update or uninstall addons",
        no_views: "This addon has no UI",
        addon_loading: "Loading addon UI\u2026",
        addon_unavailable: "Addon UI unavailable",
        views: "views",
        addons_installed: "Installed addons",
        addons_cloud: "Cloud catalog",
        install: "Install",
        upgrade: "Update",
        installed: "Installed",
        uninstall: "Uninstall",
        confirm_uninstall: "Confirm uninstall",
        installing: "Installing\u2026",
        refresh: "Refresh catalog",
        no_installed: "No domains yet \u2014 install Tasks, Tags or Sites from DSH plugins",
        no_catalog: "Catalog is empty or unreachable",
        catalog_loading: "Loading catalog\u2026",
        cached_notice: "Cloud unreachable \u2014 showing the cached catalog",
        install_failed: "Install failed",
        uninstall_failed: "Uninstall failed",
        load_failed: "client failed to load",
        data_kept: "Uninstall removes code only; data is kept and reappears after reinstall",
        addon_error: "load error",
        source_cloud: "cloud",
        source_local: "local dir",
        version: "version",
        latest: "latest",
        shell_version: "shell",
        delete: "Delete",
        login: "Login",
        signup: "Sign up",
        email: "Email",
        password: "Password",
        logout: "Log out",
        logged_in_as: "Signed in",
        not_logged_in: "Not signed in \u2014 data stays local",
        sync_now: "Sync now",
        sync_pushed: "pushed",
        sync_pulled: "pulled",
        device_name: "This device",
        sync_status: "Sync status",
        sync_last: "Last sync",
        sync_never: "Never synced",
        sync_conflicts: "Conflicts",
        sync_failed_tables: "Failed tables",
        sync_clock: "Clock offset",
        sync_no_conflicts: "No pending conflicts",
        sync_conflict_hint: "The same row changed locally and remotely; choose which version to keep",
        sync_keep_local: "Keep local",
        sync_keep_server: "Use remote",
        sync_dismiss: "Dismiss",
        sync_resolve_failed: "Failed to resolve conflict",
        sync_ok: "Sync complete",
        sync_partial: "Some tables failed",
        cloud_status: "Cloud connection",
        cloud_checking: "Checking cloud\u2026",
        cloud_checking_hint: "Checking the cloud connection",
        cloud_local: "Local only",
        cloud_local_hint: "Not signed in; data stays on this device",
        cloud_syncing: "Syncing\u2026",
        cloud_syncing_hint: "Syncing data with the cloud",
        cloud_online: "Cloud connected",
        cloud_online_hint: "Signed in; data syncs automatically",
        cloud_offline: "Cloud unreachable",
        cloud_offline_hint: "Cannot reach the cloud; local data still works",
        cloud_never: "Waiting for first sync",
        cloud_never_hint: "Signed in; waiting for the first sync",
        cloud_sync_failed: "Sync issue",
        cloud_sync_failed_hint: "Cloud is reachable but the last sync did not fully succeed",
        cloud_open: "Open Account & Sync",
        cloud_settings: "Cloud type",
        cloud_open_config: "Open settings",
        cloud_mode_none: "Local only",
        cloud_mode_private: "Private cloud",
        cloud_mode_shared: "Shared cloud",
        cloud_mode_none_hint: "Do not connect a cloud; data stays on this device",
        cloud_mode_private_hint: "Single user syncing your own data across devices",
        cloud_mode_shared_hint: "Multi-user accounts; sync after signing in",
        cloud_switch_hint: "Switching cloud clears local sync cursors and starts a full sync; business data is untouched",
        cloud_url_ph: "Server URL, e.g. https://cloud.example.com",
        cloud_secret_ph: "Access secret, at least 16 characters",
        cloud_secret_keep: "Secret already set; leave empty to keep it",
        cloud_device_label: "Device name (to tell devices apart)",
        cloud_save: "Save",
        cloud_saving: "Saving\u2026",
        cloud_saved: "Saved, starting the first sync",
        cloud_save_failed: "Save failed",
        cloud_test: "Test connection",
        cloud_testing: "Testing\u2026",
        cloud_ok: "Connection OK",
        cloud_test_fail: "Connection failed",
        cloud_auth_ok: "Secret accepted",
        cloud_auth_bad: "Reachable, but the secret is rejected",
        cloud_server: "Server",
        cloud_devices_count: "Devices",
        cloud_shared_hint: "Sign in to the shared cloud in Account & sync"
      }
    };
    var AUTO_LOCALE = require_locale();
    Object.assign(LOCALE2.zh, AUTO_LOCALE.zh);
    Object.assign(LOCALE2.en, AUTO_LOCALE.en);
    module2.exports = LOCALE2;
  }
});

// packages/addons/lib/switch.cjs
var require_switch = __commonJS({
  "packages/addons/lib/switch.cjs"(exports2, module2) {
    "use strict";
    var SWITCH_STYLES = [
      ".wbctl-switch{display:inline-flex;align-items:center;gap:7px;white-space:nowrap;min-height:24px;padding:2px;border:0;background:transparent;font:inherit;font-size:12px;color:var(--wb-muted,#6b7280);cursor:pointer;user-select:none;border-radius:999px}",
      ".wbctl-switch-track{position:relative;display:inline-flex;align-items:center;box-sizing:border-box;width:34px;height:20px;padding:2px;border-radius:999px;background:color-mix(in oklab,currentColor 22%,transparent);transition:background .16s ease;flex:none}",
      ".wbctl-switch-knob{display:block;width:16px;height:16px;border-radius:50%;background:var(--wb-card,#fff);box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .16s ease}",
      ".wbctl-switch[aria-checked=true]{color:var(--wb-accent,#2563eb)}",
      ".wbctl-switch[aria-checked=true] .wbctl-switch-track{background:var(--wb-accent,#2563eb)}",
      ".wbctl-switch[aria-checked=true] .wbctl-switch-knob{transform:translateX(14px)}",
      ".wbctl-switch:hover:not(:disabled) .wbctl-switch-track{outline:1px solid var(--wb-accent,#2563eb)}",
      ".wbctl-switch:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:2px}",
      ".wbctl-switch:disabled{opacity:.45;cursor:not-allowed}",
      ".wbctl-switch-text{white-space:nowrap}",
      "@media (prefers-reduced-motion:reduce){.wbctl-switch-track,.wbctl-switch-knob{transition:none}}"
    ];
    function Switch(props) {
      var h2 = props.h;
      var on = props.checked === true || props.checked === "true";
      var disabled = !!props.disabled;
      var text = props.label;
      if (props.showState) text = on ? props.onText || "\u5F00" : props.offText || "\u5173";
      return h2(
        "button",
        {
          type: "button",
          role: "switch",
          "aria-checked": on ? "true" : "false",
          className: "wbctl-switch" + (props.className ? " " + props.className : ""),
          disabled,
          title: props.title,
          "aria-label": text ? void 0 : props.ariaLabel,
          onClick: function(e) {
            e.preventDefault();
            if (disabled) return;
            if (typeof props.onChange === "function") props.onChange(!on);
          }
        },
        h2(
          "span",
          { className: "wbctl-switch-track", "aria-hidden": "true" },
          h2("span", { className: "wbctl-switch-knob" })
        ),
        text ? h2("span", { className: "wbctl-switch-text" }, text) : null
      );
    }
    module2.exports = { Switch, styles: SWITCH_STYLES };
  }
});

// packages/addons/lib/number-field.cjs
var require_number_field = __commonJS({
  "packages/addons/lib/number-field.cjs"(exports2, module2) {
    "use strict";
    var React = require("react");
    var NUM = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
    var TEXT = {
      zh: {
        required: "\u8BF7\u586B\u5199\u6570\u5B57",
        invalid: "\u8BF7\u8F93\u5165\u6570\u5B57",
        integer: "\u9700\u8981\u662F\u6574\u6570",
        min: "\u4E0D\u80FD\u5C0F\u4E8E {min}",
        max: "\u4E0D\u80FD\u5927\u4E8E {max}",
        range: "\u9700\u8981\u5728 {min}\u2013{max} \u4E4B\u95F4",
        step: "\u9700\u8981\u662F {step} \u7684\u500D\u6570",
        unit: "\u5355\u4F4D"
      },
      en: {
        required: "Please enter a number",
        invalid: "Please enter a number",
        integer: "Must be a whole number",
        min: "Must be at least {min}",
        max: "Must be at most {max}",
        range: "Must be between {min} and {max}",
        step: "Must be a multiple of {step}",
        unit: "unit"
      }
    };
    function messages(lang) {
      return lang === "en" ? TEXT.en : TEXT.zh;
    }
    function fill(text, vars) {
      return String(text).replace(/\{(\w+)\}/g, function(m, key) {
        return vars && vars[key] !== void 0 ? String(vars[key]) : m;
      });
    }
    function validateNumber(raw, opts) {
      var o = opts || {};
      var M = messages(o.lang);
      var text = raw === null || raw === void 0 ? "" : String(raw).trim();
      if (text === "") {
        return o.allowEmpty ? { ok: true, value: null, error: "" } : { ok: false, value: null, error: M.required };
      }
      if (!NUM.test(text)) return { ok: false, value: null, error: M.invalid };
      var n = Number(text);
      if (!isFinite(n)) return { ok: false, value: null, error: M.invalid };
      if (o.integer && Math.round(n) !== n) return { ok: false, value: null, error: M.integer };
      var hasMin = o.min !== void 0 && o.min !== null && o.min !== "";
      var hasMax = o.max !== void 0 && o.max !== null && o.max !== "";
      if (hasMin && hasMax && n >= o.min && n <= o.max) {
      } else if (hasMin && hasMax) {
        return { ok: false, value: null, error: fill(M.range, { min: o.min, max: o.max }) };
      } else if (hasMin && n < o.min) {
        return { ok: false, value: null, error: fill(M.min, { min: o.min }) };
      } else if (hasMax && n > o.max) {
        return { ok: false, value: null, error: fill(M.max, { max: o.max }) };
      }
      if (o.step && Number(o.step) > 0) {
        var q = n / Number(o.step);
        if (Math.abs(q - Math.round(q)) > 1e-9) {
          return { ok: false, value: null, error: fill(M.step, { step: o.step }) };
        }
      }
      return { ok: true, value: n, error: "" };
    }
    function rangeHint(opts, lang) {
      var o = opts || {};
      var M = messages(lang);
      var en = lang === "en";
      var hasMin = o.min !== void 0 && o.min !== null && o.min !== "";
      var hasMax = o.max !== void 0 && o.max !== null && o.max !== "";
      var parts = [];
      if (hasMin && hasMax) parts.push(String(o.min) + "\u2013" + String(o.max));
      else if (hasMin) parts.push((en ? "\u2265 " : "\u2265 ") + String(o.min));
      else if (hasMax) parts.push((en ? "\u2264 " : "\u2264 ") + String(o.max));
      if (o.integer) parts.push(en ? "whole numbers" : "\u6574\u6570");
      else if (o.step && Number(o.step) > 0) parts.push((en ? "step " : "\u6B65\u957F ") + String(o.step));
      return parts.join(en ? ", " : "\uFF0C");
    }
    function NumberField(props) {
      var h2 = props.h || React.createElement;
      var lang = props.lang;
      var M = messages(lang);
      var text = props.value === null || props.value === void 0 ? "" : String(props.value);
      var draftS = React.useState(text);
      var draft = draftS[0];
      var setDraft = draftS[1];
      var focusS = React.useState(false);
      var focused = focusS[0];
      var setFocused = focusS[1];
      var errS = React.useState("");
      var err = errS[0];
      var setErr = errS[1];
      var lastRef = React.useRef(text);
      var skipBlurRef = React.useRef(false);
      React.useEffect(
        function() {
          if (focused) return;
          if (lastRef.current === text) return;
          lastRef.current = text;
          setDraft(text);
          setErr("");
        },
        [text, focused]
      );
      function commit(raw) {
        var r = validateNumber(raw, props);
        if (!r.ok) {
          setErr(r.error);
          if (typeof props.onValidChange === "function") props.onValidChange(false, r.error);
          return false;
        }
        setErr("");
        if (typeof props.onValidChange === "function") props.onValidChange(true, "");
        var cur = props.value === null || props.value === void 0 ? null : Number(props.value);
        if (r.value !== cur) {
          lastRef.current = r.value === null ? "" : String(r.value);
          if (typeof props.onCommit === "function") props.onCommit(r.value);
        }
        return true;
      }
      var hint = props.hint !== void 0 ? props.hint : rangeHint(props, lang);
      var shown = props.hint === false ? "" : hint;
      return h2(
        "span",
        { className: "wbctl-num" + (props.wide ? " is-wide" : "") + (props.className ? " " + props.className : "") },
        h2(
          "span",
          { className: "wbctl-num-box" },
          h2("input", {
            className: "wbctl-num-input" + (err ? " is-invalid" : ""),
            type: "text",
            inputMode: props.integer || Number(props.step) === 1 ? "numeric" : "decimal",
            value: draft,
            disabled: !!props.disabled,
            placeholder: props.placeholder,
            title: props.title,
            "aria-label": props.ariaLabel,
            "aria-invalid": err ? "true" : void 0,
            onFocus: function() {
              setFocused(true);
            },
            onChange: function(e) {
              setDraft(e.target.value);
              if (err) setErr("");
              if (typeof props.onDraft === "function") props.onDraft(e.target.value);
            },
            onBlur: function() {
              setFocused(false);
              if (skipBlurRef.current) {
                skipBlurRef.current = false;
                return;
              }
              commit(draft);
            },
            onKeyDown: function(e) {
              if (e.key === "Enter") {
                e.preventDefault();
                if (e.target && e.target.blur) e.target.blur();
              } else if (e.key === "Escape") {
                e.preventDefault();
                skipBlurRef.current = true;
                setDraft(text);
                setErr("");
                if (e.target && e.target.blur) e.target.blur();
              }
            }
          }),
          props.unit ? h2("span", { className: "wbctl-num-unit" }, props.unit) : null
        ),
        err ? h2("span", { className: "wbctl-num-err", role: "alert" }, err) : shown ? h2("span", { className: "wbctl-num-hint" }, shown) : null
      );
    }
    var NUMBER_STYLES = [
      ".wbctl-num{display:inline-flex;flex-direction:column;gap:3px;min-width:0;max-width:100%}",
      ".wbctl-num.is-wide{display:flex;width:100%}",
      ".wbctl-num-box{display:inline-flex;align-items:center;gap:6px;min-width:0}",
      ".wbctl-num-input{box-sizing:border-box;width:96px;min-width:0;padding:6px 9px;border:1px solid var(--wb-line,rgba(127,127,127,.35));border-radius:6px;background:var(--wb-surface,var(--wb-card,transparent));color:inherit;font:inherit;font-size:13px;font-variant-numeric:tabular-nums;transition:border-color .14s ease,outline-color .14s ease}",
      ".wbctl-num-input:hover:not(:disabled){border-color:var(--wb-border,var(--wb-line))}",
      ".wbctl-num-input:focus{outline:2px solid color-mix(in oklab,var(--wb-accent,#2563eb) 55%,transparent);outline-offset:1px;border-color:var(--wb-accent,#2563eb)}",
      ".wbctl-num-input.is-invalid{border-color:var(--wb-danger,#dc2626)}",
      ".wbctl-num-input.is-invalid:focus{outline-color:color-mix(in oklab,var(--wb-danger,#dc2626) 55%,transparent)}",
      ".wbctl-num-input:disabled{opacity:.5;cursor:not-allowed}",
      ".wbctl-num-unit{color:var(--wb-muted,inherit);font-size:12px;white-space:nowrap}",
      ".wbctl-num-hint{color:var(--wb-muted,inherit);font-size:11px;line-height:1.4}",
      ".wbctl-num-err{color:var(--wb-danger,#dc2626);font-size:11px;line-height:1.4}",
      "@media (prefers-reduced-motion:reduce){.wbctl-num-input{transition:none}}"
    ];
    module2.exports = {
      NumberField,
      validateNumber,
      rangeHint,
      messages,
      styles: NUMBER_STYLES
    };
  }
});

// packages/addons/lib/config-scheme-bar.cjs
var require_config_scheme_bar = __commonJS({
  "packages/addons/lib/config-scheme-bar.cjs"(exports2, module2) {
    "use strict";
    var React = require("react");
    var h2 = React.createElement;
    var COPY = {
      zh: {
        title: "\u914D\u7F6E\u65B9\u6848",
        none: "\u4E0D\u4F7F\u7528\u65B9\u6848\uFF08\u63D2\u4EF6\u9ED8\u8BA4\u914D\u7F6E\uFF09",
        create: "\u65B0\u5EFA\u65B9\u6848",
        rename: "\u91CD\u547D\u540D",
        remove: "\u5220\u9664",
        namePlaceholder: "\u65B9\u6848\u540D\u79F0",
        ok: "\u786E\u5B9A",
        cancel: "\u53D6\u6D88",
        current: "\u5F53\u524D\u65B9\u6848",
        defaultHint: "\u672A\u9009\u62E9\u65B9\u6848\u65F6\u4F7F\u7528\u63D2\u4EF6\u9ED8\u8BA4\u914D\u7F6E\uFF1B\u4FEE\u6539\u4EFB\u610F\u8BBE\u7F6E\u4F1A\u81EA\u52A8\u65B0\u5EFA\u300C\u672C\u673A\u914D\u7F6E\u300D\u65B9\u6848\u3002",
        syncedHint: "\u65B9\u6848\u4F1A\u968F\u4E91\u7AEF\u540C\u6B65\u4E0E\u5907\u4EFD\u4E00\u8D77\u8D70\uFF1B\u5F53\u524D\u9009\u4E2D\u54EA\u4E2A\u65B9\u6848\u53EA\u4FDD\u5B58\u5728\u672C\u673A\u3002",
        confirmDelete: "\u5220\u9664\u5F53\u524D\u65B9\u6848\u540E\u4F1A\u56DE\u5230\u63D2\u4EF6\u9ED8\u8BA4\u914D\u7F6E\uFF0C\u786E\u5B9A\u5220\u9664\uFF1F",
        createTitle: "\u65B0\u5EFA\u914D\u7F6E\u65B9\u6848",
        renameTitle: "\u91CD\u547D\u540D\u914D\u7F6E\u65B9\u6848",
        fromCurrent: "\u4ECE\u5F53\u524D\u65B9\u6848\u590D\u5236",
        fromDefault: "\u4ECE\u63D2\u4EF6\u9ED8\u8BA4\u5F00\u59CB"
      },
      en: {
        title: "Config scheme",
        none: "No scheme (plugin defaults)",
        create: "New scheme",
        rename: "Rename",
        remove: "Delete",
        namePlaceholder: "Scheme name",
        ok: "OK",
        cancel: "Cancel",
        current: "Active scheme",
        defaultHint: 'With no scheme selected the plugin defaults apply. Editing any setting creates a local "My config" scheme automatically.',
        syncedHint: "Schemes sync to the cloud and travel with backups; which scheme this device uses stays local.",
        confirmDelete: "Deleting the active scheme returns to plugin defaults. Delete it?",
        createTitle: "New config scheme",
        renameTitle: "Rename config scheme",
        fromCurrent: "Copy active scheme",
        fromDefault: "Start from plugin defaults"
      }
    };
    var styles = [
      ".__P__-cfg-schemes{display:flex;flex-direction:column;gap:10px;padding:13px 16px;border:1px solid var(--cfg-line);border-radius:12px;background:var(--cfg-surface)}",
      ".__P__-cfg-schemes-main{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
      ".__P__-cfg-schemes-label{font-size:12.5px;font-weight:660;white-space:nowrap}",
      ".__P__-cfg-schemes-select{border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:9px;padding:7px 11px;font:inherit;font-size:13px;line-height:1.4;outline:none;min-width:190px;max-width:100%}",
      ".__P__-cfg-schemes-select:focus{border-color:var(--dsw-alias-brand-primary,currentColor);box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-brand-primary,currentColor) 14%,transparent)}",
      ".__P__-cfg-schemes-actions{display:flex;gap:7px;flex-wrap:wrap}",
      ".__P__-cfg-sbtn{appearance:none;border:1px solid var(--cfg-line);background:transparent;color:inherit;border-radius:8px;padding:5px 11px;font:inherit;font-size:12px;line-height:1.5;cursor:pointer;transition:background .12s ease,border-color .12s ease}",
      ".__P__-cfg-sbtn:hover:not(:disabled){background:var(--cfg-hover);border-color:color-mix(in oklab,currentColor 28%,var(--cfg-line))}",
      ".__P__-cfg-sbtn:disabled{opacity:.5;cursor:default}",
      ".__P__-cfg-sbtn.danger{color:var(--dsw-alias-state-error-primary,inherit)}",
      ".__P__-cfg-schemes-form{display:flex;align-items:center;gap:7px;flex-wrap:wrap}",
      ".__P__-cfg-schemes-input{flex:1 1 180px;min-width:120px;border:1px solid var(--cfg-line);background:var(--dsw-alias-bg-base,transparent);color:inherit;border-radius:8px;padding:6px 10px;font:inherit;font-size:13px;outline:none}",
      ".__P__-cfg-schemes-input:focus{border-color:var(--dsw-alias-brand-primary,currentColor)}",
      ".__P__-cfg-schemes-hint{font-size:11.5px;color:var(--cfg-muted);line-height:1.6}"
    ];
    function SchemeBar(props) {
      var lang = props.lang === "en" ? "en" : "zh";
      var c = props.copy ? Object.assign({}, COPY[lang], props.copy) : COPY[lang];
      var prefix = props.prefix || "wb";
      var cls = function(suffix) {
        return "." + prefix + "-cfg-" + suffix;
      };
      var schemes = Array.isArray(props.schemes) ? props.schemes : [];
      var activeId = props.activeId || "";
      var busy = Boolean(props.busy);
      var [editing, setEditing] = React.useState(null);
      var [name, setName] = React.useState("");
      var [from, setFrom] = React.useState("current");
      function begin(mode) {
        var current = schemes.filter(function(s) {
          return s.id === activeId;
        })[0];
        setName(mode === "rename" && current ? current.name : "");
        setFrom(current ? "current" : "default");
        setEditing(mode);
      }
      function submit(event) {
        if (event && event.preventDefault) event.preventDefault();
        var value = String(name || "").trim();
        if (!value || busy) return;
        if (editing === "rename") props.onRename(activeId, value);
        else props.onCreate(value, from);
        setEditing(null);
        setName("");
      }
      function remove() {
        if (typeof window !== "undefined" && window.confirm && !window.confirm(c.confirmDelete)) return;
        props.onDelete(activeId);
      }
      return h2(
        "div",
        { className: prefix + "-cfg-schemes" },
        h2(
          "div",
          { className: prefix + "-cfg-schemes-main" },
          h2("span", { className: prefix + "-cfg-schemes-label" }, c.title),
          h2(
            "select",
            {
              className: prefix + "-cfg-schemes-select",
              value: activeId,
              disabled: busy,
              onChange: function(event) {
                props.onActivate(event.target.value || null);
              },
              "aria-label": c.title
            },
            h2("option", { value: "" }, c.none),
            schemes.map(function(s) {
              return h2("option", { key: s.id, value: s.id }, s.name);
            })
          ),
          h2("span", { className: prefix + "-cfg-schemes-hint" }, activeId ? c.current : "")
        ),
        editing ? h2(
          "form",
          { className: prefix + "-cfg-schemes-form", onSubmit: submit },
          h2("span", { className: prefix + "-cfg-schemes-label" }, editing === "rename" ? c.renameTitle : c.createTitle),
          h2("input", {
            className: prefix + "-cfg-schemes-input",
            value: name,
            placeholder: c.namePlaceholder,
            maxLength: 64,
            autoFocus: true,
            disabled: busy,
            onChange: function(event) {
              setName(event.target.value);
            }
          }),
          editing === "create" && activeId ? h2(
            "select",
            { className: prefix + "-cfg-schemes-select", value: from, disabled: busy, onChange: function(event) {
              setFrom(event.target.value);
            }, "aria-label": c.createTitle },
            h2("option", { value: "current" }, c.fromCurrent),
            h2("option", { value: "default" }, c.fromDefault)
          ) : null,
          h2("button", { className: prefix + "-cfg-sbtn", type: "submit", disabled: busy || !String(name || "").trim() }, c.ok),
          h2("button", { className: prefix + "-cfg-sbtn", type: "button", disabled: busy, onClick: function() {
            setEditing(null);
          } }, c.cancel)
        ) : h2(
          "div",
          { className: prefix + "-cfg-schemes-actions" },
          h2("button", { className: prefix + "-cfg-sbtn", type: "button", disabled: busy, onClick: function() {
            begin("create");
          } }, c.create),
          activeId ? h2("button", { className: prefix + "-cfg-sbtn", type: "button", disabled: busy, onClick: function() {
            begin("rename");
          } }, c.rename) : null,
          activeId ? h2("button", { className: prefix + "-cfg-sbtn danger", type: "button", disabled: busy, onClick: remove }, c.remove) : null
        ),
        h2("div", { className: prefix + "-cfg-schemes-hint" }, activeId ? c.syncedHint : c.defaultHint)
      );
    }
    module2.exports = { SchemeBar, styles, COPY };
  }
});

// packages/addons/lib/client-base-styles.cjs
var require_client_base_styles = __commonJS({
  "packages/addons/lib/client-base-styles.cjs"(exports2, module2) {
    "use strict";
    var SECRET_FIELD = [
      ".wb-secret-field{position:relative;display:flex;align-items:center;min-width:0}",
      ".wb-secret-field input{flex:1 1 auto;min-width:0;padding-right:34px}",
      ".wb-eye{position:absolute;right:4px;display:inline-flex;align-items:center;justify-content:center;background:transparent;border:0;border-radius:6px;padding:4px;color:var(--wb-muted,#6b7280);cursor:pointer}",
      ".wb-eye:hover:not(:disabled){color:var(--wb-accent,#2563eb);background:color-mix(in srgb, var(--wb-accent,#2563eb) 12%, transparent)}",
      ".wb-eye:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:1px}",
      ".wb-eye:disabled{opacity:.45;cursor:not-allowed}"
    ];
    module2.exports = function baseStyles(prefix) {
      var p = String(prefix || "wb");
      var s = "." + p;
      return SECRET_FIELD.concat([
        s + "-wrap{display:flex;flex-direction:column;gap:12px;padding:16px;overflow:auto;height:100%;box-sizing:border-box}",
        s + "-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}",
        s + "-title{font-size:16px;font-weight:650;margin:0}",
        s + "-sub{font-size:12px;color:var(--wb-muted,#6b7280);margin:2px 0 0}",
        s + "-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
        s + "-card{border:1px solid var(--wb-border,#e5e7eb);border-radius:10px;background:var(--wb-surface,#fff);padding:12px}",
        s + "-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}",
        s + "-kpi{font-size:22px;font-weight:700;line-height:1.2}" + s + "-kpi-label{font-size:12px;color:var(--wb-muted,#6b7280)}",
        s + "-table{width:100%;border-collapse:collapse;font-size:12px}" + s + "-table th," + s + "-table td{padding:7px 8px;border-bottom:1px solid var(--wb-border,#eef0f3);text-align:left;vertical-align:top}",
        s + "-table th{font-weight:600;color:var(--wb-muted,#6b7280);white-space:nowrap}",
        s + "-btn{border:1px solid var(--wb-border,#d1d5db);background:var(--wb-surface,#fff);color:inherit;border-radius:7px;padding:5px 10px;font-size:12px;cursor:pointer}",
        s + "-btn:hover:not(:disabled){border-color:var(--wb-accent,#2563eb)}" + s + "-btn:disabled{opacity:.5;cursor:default}",
        s + "-btn.primary{background:var(--wb-accent,#2563eb);border-color:var(--wb-accent,#2563eb);color:var(--dsw-alias-label-primary-inverted,#fff)}",
        s + "-btn.danger{color:var(--wb-danger,#b91c1c);border-color:color-mix(in oklab,var(--wb-danger,#b91c1c) 35%,transparent)}",
        s + "-field{display:flex;flex-direction:column;gap:4px;font-size:12px}" + s + "-label{font-weight:600}",
        s + "-field input," + s + "-field select," + s + "-field textarea{border:1px solid var(--wb-border,#d1d5db);border-radius:7px;padding:6px 8px;font:inherit;background:var(--wb-surface,#fff);color:inherit;min-width:0}",
        s + "-hint{color:var(--wb-muted,#6b7280);font-size:11px}" + s + "-notice{padding:8px 10px;border-radius:8px;font-size:12px;background:color-mix(in oklab,var(--wb-accent,#2563eb) 9%,transparent);color:var(--dsw-alias-label-primary,inherit)}",
        s + "-notice.error{background:color-mix(in oklab,var(--wb-danger,#b91c1c) 10%,transparent);color:var(--wb-danger,#b91c1c)}" + s + "-notice.ok{background:color-mix(in oklab,var(--wb-ok,#047857) 10%,transparent);color:var(--wb-ok,#047857)}",
        s + "-empty{padding:18px;text-align:center;color:var(--wb-muted,#6b7280);font-size:12px;border:1px dashed var(--wb-border,#e5e7eb);border-radius:8px}",
        s + "-pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:11px;background:color-mix(in oklab,currentColor 7%,transparent);color:inherit}",
        s + "-pill.ok{background:color-mix(in oklab,var(--wb-ok,#047857) 12%,transparent);color:var(--wb-ok,#047857)}" + s + "-pill.error{background:color-mix(in oklab,var(--wb-danger,#b91c1c) 12%,transparent);color:var(--wb-danger,#b91c1c)}" + s + "-pill.warn{background:color-mix(in oklab,var(--wb-warn,#b45309) 14%,transparent);color:var(--wb-warn,#b45309)}",
        s + "-json{margin:0;padding:8px;background:color-mix(in oklab,currentColor 4%,transparent);border-radius:8px;font-size:11px;max-height:240px;overflow:auto}",
        s + "-muted{color:var(--wb-muted,#6b7280)}" + s + "-link{color:var(--wb-accent,#2563eb);cursor:pointer;text-decoration:none}",
        s + "-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}",
        // 窄屏：页面容器不再自带左右内边距（宿主的 .wb-immersive-main 已经给过），
        // 卡片与栅格收紧，把宽度尽量留给内容——窄屏下两侧留白比桌面更影响可读性。
        "@media(max-width:760px){" + s + "-wrap{padding:0 0 8px;gap:10px}" + s + "-card{padding:12px;border-radius:10px}" + s + "-grid{grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}" + s + "-form{grid-template-columns:minmax(0,1fr)}" + s + "-title{font-size:15px}" + s + "-btn." + s + "-icon-text ." + s + "-btn-label{display:none}" + s + "-btn." + s + "-icon-text{padding-left:8px;padding-right:8px}" + s + "-table-wrap{overflow-x:auto;max-width:100%}" + s + "-table{width:max-content;min-width:100%}}button .wb-icon-label:not(.wb-icon-label-fallback) .wb-icon-label-text{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}button .wb-icon-label.wb-icon-label-short .wb-icon-label-text{position:static;width:auto;height:auto;margin:0;overflow:visible;clip-path:none;white-space:normal}@media(max-width:420px){" + s + "-wrap{padding:0 0 6px}" + s + "-card{padding:10px}" + s + "-grid{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}}"
      ]);
    };
    module2.exports.secretFieldStyles = SECRET_FIELD;
  }
});

// packages/addons/lib/stepper.cjs
var require_stepper = __commonJS({
  "packages/addons/lib/stepper.cjs"(exports2, module2) {
    "use strict";
    function stepState(index, current, maxVisited) {
      if (index === current) return "current";
      if (index < current) return "done";
      if (index <= maxVisited) return "visited";
      return "todo";
    }
    function Steps(props) {
      var h2 = props.h;
      var steps = props.steps || [];
      var current = props.current || 0;
      var maxVisited = props.maxVisited === void 0 ? current : props.maxVisited;
      var invalid = props.invalid || {};
      var disabled = !!props.disabled;
      var label = props.label || "\u6B65\u9AA4";
      return h2(
        "nav",
        { className: "wbctl-steps" + (props.className ? " " + props.className : ""), "aria-label": label },
        h2(
          "ol",
          { className: "wbctl-step-list" },
          steps.map(function(step, index) {
            var state = stepState(index, current, maxVisited);
            var canJump = !disabled && typeof props.onJump === "function" && state !== "current" && state !== "todo";
            var isInvalid = !!invalid[index] || !!invalid[step.key];
            return h2(
              "li",
              { key: step.key || index, className: "wbctl-step-item" },
              h2(
                "button",
                {
                  type: "button",
                  className: "wbctl-step",
                  "data-state": state,
                  "data-invalid": isInvalid ? "true" : null,
                  "aria-current": state === "current" ? "step" : void 0,
                  "aria-label": index + 1 + " \xB7 " + step.label + (state === "done" ? "\uFF08\u5DF2\u5B8C\u6210\uFF09" : ""),
                  disabled: disabled || state === "todo",
                  title: step.hint || "",
                  onClick: function() {
                    if (canJump) props.onJump(index);
                  }
                },
                h2("span", { className: "wbctl-step-index", "aria-hidden": "true" }, state === "done" ? "\u2713" : String(index + 1)),
                h2("span", { className: "wbctl-step-label" }, step.label),
                step.hint ? h2("span", { className: "wbctl-step-hint" }, step.hint) : null,
                step.optional ? h2("span", { className: "wbctl-step-opt" }, "\u53EF\u9009") : null
              )
            );
          })
        )
      );
    }
    var STYLES = [
      ".wbctl-steps{display:block;min-width:0}",
      ".wbctl-step-list{display:flex;align-items:stretch;gap:6px;list-style:none;margin:0 0 14px;padding:0;min-width:0}",
      ".wbctl-step-item{display:flex;flex:1 1 0;min-width:0}",
      ".wbctl-step{display:flex;align-items:center;gap:7px;flex:1 1 auto;min-width:0;padding:7px 9px;border:1px solid var(--wb-line,var(--wb-border));border-radius:10px;background:transparent;color:var(--wb-muted,inherit);font:inherit;font-size:12px;line-height:1.35;text-align:left;cursor:default;transition:background .14s ease,border-color .14s ease,color .14s ease}",
      ".wbctl-step[data-state=done],.wbctl-step[data-state=visited]{color:inherit;cursor:pointer}",
      ".wbctl-step[data-state=done]{border-color:color-mix(in oklab,var(--wb-ok,var(--wb-accent,#2563eb)) 36%,var(--wb-border))}",
      ".wbctl-step[data-state=current]{border-color:color-mix(in oklab,var(--wb-accent,#2563eb) 58%,var(--wb-border));background:color-mix(in oklab,var(--wb-accent,#2563eb) 8%,transparent);color:inherit;font-weight:600}",
      ".wbctl-step[data-state=visited]:hover,.wbctl-step[data-state=done]:hover{background:color-mix(in oklab,currentColor 7%,transparent)}",
      ".wbctl-step[data-invalid=true]{border-color:var(--wb-danger,#d33)}",
      ".wbctl-step:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:2px}",
      ".wbctl-step:disabled{cursor:default;opacity:.72}",
      ".wbctl-step-index{display:inline-flex;align-items:center;justify-content:center;flex:none;width:20px;height:20px;border-radius:50%;font-size:11px;font-variant-numeric:tabular-nums;background:color-mix(in oklab,currentColor 15%,transparent)}",
      ".wbctl-step[data-state=current] .wbctl-step-index{background:var(--wb-accent,#2563eb);color:var(--wb-on-accent,#fff)}",
      ".wbctl-step[data-state=done] .wbctl-step-index{background:color-mix(in oklab,var(--wb-ok,var(--wb-accent,#2563eb)) 20%,transparent);color:var(--wb-ok,var(--wb-accent,#2563eb))}",
      ".wbctl-step-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".wbctl-step-hint{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:400;opacity:.62}",
      ".wbctl-step-opt{flex:none;font-size:10px;font-weight:400;opacity:.55}",
      "@media (max-width:760px){.wbctl-step{padding:6px 7px;font-size:11.5px}.wbctl-step-hint,.wbctl-step-opt{display:none}.wbctl-step-index{width:18px;height:18px;font-size:10px}}",
      "@media (max-width:520px){.wbctl-step-list{gap:4px}.wbctl-step-label{white-space:normal}.wbctl-step{gap:5px}}",
      "@media (prefers-reduced-motion:reduce){.wbctl-step{transition:none}}"
    ];
    module2.exports = { Steps, stepState, styles: STYLES };
  }
});

// packages/shell/client/conversation/styles.cjs
var require_styles = __commonJS({
  "packages/shell/client/conversation/styles.cjs"(exports2, module2) {
    "use strict";
    module2.exports = `
.wb-role-trigger,.wb-role-mask{--wb-line:var(--dsw-alias-border-l2);--wb-card:var(--dsw-alias-bg-layer-1,Canvas);--wb-surface:var(--dsw-alias-bg-layer-2,Canvas);--wb-accent:var(--dsw-alias-brand-primary,Highlight);--wb-muted:var(--dsw-alias-label-tertiary,GrayText);--wb-danger:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary,CanvasText)}
.wb-role-trigger,.wb-role-btn{font:inherit;color:inherit;border:1px solid var(--wb-line);cursor:pointer;background:var(--wb-card);border-radius:8px;padding:6px 10px}
.wb-role-trigger{height:28px;max-width:min(32vw,16em);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;border-radius:999px;font-size:12px;padding:0 9px}
.wb-role-trigger:hover{border-color:var(--wb-accent)}
.wb-role-trigger:focus-visible,.wb-role-btn:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wb-role-btn:disabled,.wb-role-option:disabled,.wb-role-none:disabled,.wb-role-close:disabled{opacity:.5;cursor:wait}
.wb-role-mask{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:12px;background:color-mix(in oklab,var(--dsw-alias-label-primary,CanvasText) 22%,transparent)}
.wb-role-dialog{display:flex;flex-direction:column;gap:12px;padding:16px;box-sizing:border-box;width:min(100%,26rem);max-height:86dvh;overflow:auto;background:var(--wb-card);border:1px solid var(--wb-line);border-radius:12px;box-shadow:0 8px 32px color-mix(in oklab,var(--wb-muted) 24%,transparent)}
.wb-role-head{display:flex;flex-direction:column;gap:4px}
.wb-role-title{margin:0;font-size:14px;font-weight:600;line-height:1.4}
.wb-role-sub{margin:0;font-size:11.5px;line-height:1.5;color:var(--wb-muted)}
.wb-role-note{margin:0;font-size:11.5px;line-height:1.5;color:var(--wb-muted)}
.wb-role-error{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;line-height:1.5;color:var(--wb-danger)}
.wb-role-retry{font:inherit;font-size:11.5px;padding:2px 8px;border:1px solid currentColor;border-radius:6px;background:transparent;color:inherit;cursor:pointer}
.wb-role-retry:hover:not(:disabled){background:color-mix(in oklab,currentColor 10%,transparent)}
.wb-role-search{box-sizing:border-box;width:100%;font:inherit;font-size:13px;color:inherit;background:var(--wb-surface);border:1px solid var(--wb-line);border-radius:10px;padding:8px 10px;outline:none}
.wb-role-search:focus{border-color:var(--wb-accent)}
.wb-role-search::placeholder{color:var(--wb-muted)}
.wb-role-count{font-size:11.5px;color:var(--wb-muted);font-variant-numeric:tabular-nums}
.wb-role-list{display:flex;flex-direction:column;gap:8px;max-height:min(52dvh,24rem);overflow:auto;overscroll-behavior:contain}
.wb-role-option{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:10px;box-sizing:border-box;width:100%;text-align:start;padding:9px 10px;border-radius:10px;border:1px solid var(--wb-line);background:var(--wb-card);font:inherit;color:inherit;cursor:pointer}
.wb-role-option:hover:not(:disabled){background:var(--wb-surface)}
.wb-role-option[aria-pressed=true]{border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 8%,var(--wb-card));box-shadow:inset 2px 0 0 var(--wb-accent)}
.wb-role-option[aria-pressed=true]:hover:not(:disabled){background:color-mix(in oklab,var(--wb-accent) 12%,var(--wb-card))}
.wb-role-option:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wb-role-option-icon{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;background:color-mix(in oklab,var(--wb-muted) 14%,transparent);color:var(--wb-muted)}
.wb-role-option[aria-pressed=true] .wb-role-option-icon{background:color-mix(in oklab,var(--wb-accent) 16%,transparent);color:var(--wb-accent)}
.wb-role-option-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.wb-role-option-name{font-size:13.5px;font-weight:500;line-height:1.4;overflow-wrap:anywhere}
.wb-role-option-meta{display:flex;flex-wrap:wrap;gap:2px 8px;font-size:11.5px;line-height:1.45;color:var(--wb-muted)}
.wb-role-option-domain{opacity:.9}
.wb-role-option-desc{overflow-wrap:anywhere}
.wb-role-option-check{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;color:var(--wb-accent)}
.wb-role-mark{background:color-mix(in oklab,var(--wb-accent) 24%,transparent);color:inherit;border-radius:3px;padding:0 1px}
.wb-role-empty{display:flex;gap:8px;align-items:center;flex-wrap:wrap;color:var(--wb-muted);font-size:12px}
.wb-role-clear{border:1px solid var(--wb-line);background:var(--wb-card);color:inherit;font:inherit;font-size:12px;border-radius:8px;padding:3px 8px;cursor:pointer}
.wb-role-clear:hover{border-color:var(--wb-accent)}
.wb-role-clear:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wb-role-sep{height:1px;margin:0;border:0;background:var(--wb-line)}
.wb-role-none{display:flex;align-items:center;gap:8px;flex-wrap:wrap;box-sizing:border-box;width:100%;text-align:start;padding:8px 10px;border-radius:10px;border:1px dashed var(--wb-line);background:transparent;color:var(--wb-muted);font:inherit;font-size:12px;cursor:pointer}
.wb-role-none:hover:not(:disabled){background:var(--wb-surface);color:inherit}
.wb-role-none[aria-pressed=true]{border-style:solid;border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 8%,var(--wb-card));color:inherit;box-shadow:inset 2px 0 0 var(--wb-accent)}
.wb-role-none:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wb-role-none-icon{display:inline-flex;align-items:center}
.wb-role-none-name{font-weight:500}
.wb-role-none-desc{font-size:11px;font-weight:400;color:var(--wb-muted)}
.wb-role-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.wb-role-hint{font-size:11px;color:var(--wb-muted)}
.wb-role-close{font:inherit;font-size:12px;padding:4px 10px;border:1px solid var(--wb-line);border-radius:8px;background:transparent;color:var(--wb-muted);cursor:pointer;margin-inline-start:auto}
.wb-role-close:hover:not(:disabled){border-color:var(--wb-accent);color:inherit}
.wb-role-close:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
@media (max-width:480px){
  .wb-role-dialog{width:100%;max-height:92dvh;padding:14px;gap:10px}
  .wb-role-list{max-height:60dvh}
  .wb-role-option{padding:8px 9px}
}
`;
    var ROLES_BASE = require_client_base_styles()("wbr").join("\n");
    var STEPS_BASE = require_stepper().styles.join("\n");
    module2.exports += "\n" + ROLES_BASE + "\n" + STEPS_BASE + `
.wbr-input,.wbr-select{border:1px solid var(--wb-line);border-radius:8px;padding:7px 10px;font:inherit;font-size:13px;background:transparent;color:inherit;min-width:0;outline:none}
.wbr-input:focus,.wbr-select:focus{border-color:var(--wb-accent)}
.wbr-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.wbr-search{flex:1 1 260px;min-width:0}
.wbr-select{flex:0 0 auto}
.wbr-split{display:grid;grid-template-columns:minmax(240px,340px) minmax(0,1fr);gap:14px;align-items:start}
.wbr-list{min-width:0;display:flex;flex-direction:column;gap:8px}
.wbr-rows{display:flex;flex-direction:column;gap:6px;max-height:min(70dvh,720px);overflow:auto;padding-right:2px}
.wbr-row{display:flex;flex-direction:column;gap:4px;text-align:start;background:transparent;color:inherit;font:inherit;border:1px solid var(--wb-line);border-radius:10px;padding:9px 10px;cursor:pointer}
.wbr-row:hover{border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 7%,transparent)}
.wbr-row[aria-pressed=true]{border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 12%,transparent)}
.wbr-row:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}
.wbr-row-name{font-weight:600;font-size:13px;overflow-wrap:anywhere}
.wbr-row-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px;color:var(--wb-muted)}
.wbr-row-meta code{font-size:11px;overflow-wrap:anywhere}
.wbr-row-counts{display:flex;flex-direction:column;gap:2px;font-size:11.5px;color:var(--wb-muted)}
.wbr-row-counts small{color:var(--wb-muted);opacity:.85}
.wbr-detail{border:1px solid var(--wb-border);border-radius:12px;background:var(--wb-surface);padding:14px;display:flex;flex-direction:column;gap:10px;min-width:0}
.wbr-detail-empty{padding:0;border:0;background:transparent}
.wbr-detail-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.wbr-detail-head strong{font-size:15px}
.wbr-detail-head code{font-size:11.5px;color:var(--wb-muted);overflow-wrap:anywhere}
.wbr-detail-head small{font-size:11.5px;color:var(--wb-muted)}
.wbr-detail-desc{margin:0;font-size:13px;line-height:1.6;overflow-wrap:anywhere}
.wbr-detail-actions{display:flex;flex-direction:column;gap:8px}
.wbr-detail-group{display:flex;flex-direction:column;gap:5px}
.wbr-detail-domain{font-size:11.5px;color:var(--wb-muted);font-weight:600}
.wbr-chips{display:flex;gap:6px;flex-wrap:wrap}
.wbr-chip{font-size:11.5px;line-height:1.5;padding:2px 7px;border-radius:6px;border:1px solid var(--wb-line);background:color-mix(in oklab,currentColor 4%,transparent);white-space:nowrap}
.wbr-editor{display:flex;flex-direction:column;gap:12px}
.wbr-steps .wbctl-step-list{margin:0}
.wbr-step-pane{display:flex;flex-direction:column;gap:10px;min-width:0}
.wbr-field-error{margin:0;font-size:12px;color:var(--wb-danger)}
.wbr-step-status{margin:0;font-size:12px;color:var(--wb-muted)}
.wbr-editor-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.wbr-editor-head small{color:var(--wb-muted);font-size:11.5px}
.wbr-instructions{display:flex;flex-direction:column;gap:6px}
.wbr-instructions-head{display:flex;align-items:center;justify-content:flex-start;gap:8px;flex-wrap:wrap}
.wbr-instructions-head .wbr-tabs{margin-inline-start:auto}
.wbr-tabs{display:inline-flex;gap:2px;border:1px solid var(--wb-line);border-radius:8px;padding:2px}
.wbr-tab{font:inherit;font-size:12px;border:0;background:transparent;color:inherit;padding:3px 9px;border-radius:6px;cursor:pointer}
.wbr-tab[aria-selected=true]{background:color-mix(in oklab,var(--wb-accent) 14%,transparent);color:var(--wb-accent)}
.wbr-tab:focus-visible{outline:2px solid var(--wb-accent);outline-offset:1px}
.wbr-preview{border:1px dashed var(--wb-line);border-radius:8px;padding:8px 10px;min-height:3em;font-size:13px;line-height:1.6;overflow-wrap:anywhere}
.wbr-actions{display:flex;flex-direction:column;gap:8px;border:1px solid var(--wb-line);border-radius:10px;padding:10px}
.wbr-actions-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.wbr-count{font-size:11.5px;color:var(--wb-muted);font-weight:400}
.wbr-actions-groups{display:flex;flex-direction:column;gap:8px;max-height:min(46dvh,420px);overflow:auto}
.wbr-actions-group{display:flex;flex-direction:column;gap:6px}
.wbr-actions-grouphead{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.wbr-actions-domain{flex:1 1 auto;min-width:0;font-size:11.5px;font-weight:600;color:var(--wb-muted);display:flex;gap:6px;overflow-wrap:anywhere}
.wbr-actions-checks{display:flex;flex-wrap:wrap;gap:6px}
.wbr-mini{font:inherit;font-size:11px;line-height:1.5;border:1px solid var(--wb-line);background:transparent;color:var(--wb-muted);border-radius:6px;padding:1px 6px;cursor:pointer}
.wbr-mini:hover{border-color:var(--wb-accent);color:var(--wb-accent)}
.wbr-mini:focus-visible{outline:2px solid var(--wb-accent);outline-offset:1px}
.wbr-check{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;border:1px solid var(--wb-line);border-radius:6px;padding:2px 7px;cursor:pointer}
.wbr-check:has(input:checked){border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 10%,transparent)}
.wbr-check:focus-within{outline:2px solid var(--wb-accent);outline-offset:1px}
.wbr-check code{font-size:11.5px}
.wbr-unknown{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--wb-danger)}
.wbr-unknown small{color:var(--wb-muted)}
.wbr-summary{display:grid;gap:8px;margin:0;padding:10px 12px;border:1px solid var(--wb-line);border-radius:10px}
.wbr-summary-row{display:grid;grid-template-columns:minmax(84px,auto) minmax(0,1fr);gap:10px;font-size:13px;line-height:1.6}
.wbr-summary-row dt{color:var(--wb-muted);font-size:12px}
.wbr-summary-row dd{margin:0;overflow-wrap:anywhere}
.wbr-wizard-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-top:1px solid var(--wb-line);padding-top:10px}
.wbr-wizard-nav{display:flex;gap:8px;margin-inline-start:auto}
@media(max-width:760px){
  .wbr-split{grid-template-columns:minmax(0,1fr)}
  .wbr-rows{max-height:none}
  .wbr-actions-groups{max-height:none}
}
@media(max-width:520px){
  .wbr-summary-row{grid-template-columns:minmax(0,1fr);gap:2px}
  .wbr-wizard-foot{gap:6px}
  /* \u7A84\u5C4F\u4E0D\u6324\u538B\u6B65\u9AA4\u540D\uFF1A\u6BCF\u6B65\u7ED9\u6700\u5C0F\u5BBD\u5EA6\uFF0C\u6574\u6761\u6B65\u9AA4\u680F\u6A2A\u5411\u6EDA\u52A8\u3002 */
  .wbr-steps .wbctl-step-list{overflow-x:auto;padding-bottom:2px}
  .wbr-steps .wbctl-step-item{flex:0 0 auto}
  .wbr-steps .wbctl-step{min-width:112px}
  .wbr-steps .wbctl-step-label{white-space:nowrap}
}
`;
  }
});

// packages/addons/lib/overlay.cjs
var require_overlay = __commonJS({
  "packages/addons/lib/overlay.cjs"(exports2, module2) {
    "use strict";
    var defaultReact = require("react");
    var FOCUSABLE = "button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]";
    module2.exports = function createOverlay(options) {
      var opts = options || {};
      var React = opts.React || defaultReact;
      var h2 = React.createElement;
      var tag = opts.tag || "section";
      var maskClass = opts.maskClass;
      var dialogClass = opts.dialogClass;
      var dialogClassOf = opts.dialogClassOf || function() {
        return "";
      };
      var ariaLabelOf = opts.ariaLabelOf || function(props) {
        return props["aria-label"] || props.title;
      };
      var ariaLabelledByOf = opts.ariaLabelledByOf || function() {
        return null;
      };
      var header = opts.header || null;
      var closeOnEscape = opts.closeOnEscape || function() {
        return true;
      };
      var closeOnMask = opts.closeOnMask || function() {
        return true;
      };
      var extraKeyDown = opts.onKeyDown || null;
      var autoFocusDialog = opts.autoFocusDialog !== false;
      var focusableSelector = opts.focusableSelector || FOCUSABLE;
      function Modal(props) {
        var R = props.React || React;
        var ref = R.useRef(null);
        R.useEffect(function() {
          var previous = typeof document !== "undefined" ? document.activeElement : null;
          var focusIt = props.autoFocus !== void 0 ? props.autoFocus : autoFocusDialog;
          if (focusIt && ref.current) ref.current.focus();
          return function() {
            if (previous && previous.isConnected) previous.focus();
          };
        }, []);
        function onKeyDown(e) {
          if (extraKeyDown && extraKeyDown(e, props, ref)) return;
          if (e.key === "Escape") {
            if (!(props.closeOnEscape !== void 0 ? props.closeOnEscape : closeOnEscape(props))) return;
            e.preventDefault();
            e.stopPropagation();
            if (props.onClose) props.onClose();
            return;
          }
          if (e.key !== "Tab" || !ref.current) return;
          var els = ref.current.querySelectorAll(focusableSelector);
          if (!els.length) {
            e.preventDefault();
            return;
          }
          var first = els[0];
          var last = els[els.length - 1];
          if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
            e.preventDefault();
            last.focus();
          }
          if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
        var labelledBy = ariaLabelledByOf(props);
        return h2(
          "div",
          {
            className: maskClass,
            onMouseDown: function(e) {
              var allowed = props.closeOnMask !== void 0 ? props.closeOnMask : closeOnMask(props);
              if (e.target === e.currentTarget && props.onClose && allowed) props.onClose();
            }
          },
          h2(
            tag,
            {
              className: dialogClass + dialogClassOf(props),
              role: "dialog",
              "aria-modal": true,
              "aria-label": labelledBy ? null : ariaLabelOf(props),
              "aria-labelledby": labelledBy || null,
              ref,
              tabIndex: -1,
              onKeyDown
            },
            header ? header(props) : null,
            props.children
          )
        );
      }
      return Modal;
    };
  }
});

// packages/addons/lib/staged-dialog.cjs
var require_staged_dialog = __commonJS({
  "packages/addons/lib/staged-dialog.cjs"(exports2, module2) {
    "use strict";
    var defaultReact = require("react");
    var overlayFactory = require_overlay();
    var stepper = require_stepper();
    function validateStep(step) {
      if (!step || typeof step.validate !== "function") return "";
      var message = step.validate();
      return message ? String(message) : "";
    }
    function firstFailing(steps) {
      var list = steps || [];
      for (var i = 0; i < list.length; i += 1) {
        var message = validateStep(list[i]);
        if (message) return { index: i, key: list[i] && list[i].key, message };
      }
      return null;
    }
    function createStagedDialog(options) {
      var opts = options || {};
      var React = opts.React || defaultReact;
      var h2 = React.createElement;
      var dialogClass = ((opts.dialogClass || "") + " wbctl-dialog").trim();
      var Overlay = overlayFactory(
        Object.assign({}, opts, {
          React,
          dialogClass,
          // 首焦点由外壳送进对话框，字段由 focusStep 负责，避免打开瞬间落进第一个输入框。
          autoFocusDialog: opts.autoFocusDialog !== false
        })
      );
      function StagedDialog(props) {
        var R = props.React || React;
        var steps = props.steps || [];
        var count = steps.length;
        var busy = !!props.submitting || !!props.busy;
        var indexState = R.useState(props.initialStep || 0);
        var rawIndex = indexState[0];
        var setIndex = indexState[1];
        var index = count === 0 ? 0 : Math.min(Math.max(rawIndex, 0), count - 1);
        var visitedState = R.useState(props.initialStep || 0);
        var maxVisited = count === 0 ? 0 : Math.min(Math.max(visitedState[0], index), count - 1);
        var setMaxVisited = visitedState[1];
        var errorState = R.useState("");
        var stepError = errorState[0];
        var setStepError = errorState[1];
        var invalidState = R.useState({});
        var invalid = invalidState[0];
        var setInvalid = invalidState[1];
        var bodyRef = R.useRef(null);
        var mounted = R.useRef(true);
        function runValidate(step) {
          return validateStep(step);
        }
        function markInvalid(i, bad) {
          setInvalid(function(prev) {
            var next2 = Object.assign({}, prev);
            if (bad) next2[i] = true;
            else delete next2[i];
            return next2;
          });
        }
        function focusBody() {
          var el = bodyRef.current;
          if (el && typeof el.focus === "function") el.focus();
        }
        R.useEffect(
          function() {
            if (!mounted.current) return;
            focusBody();
          },
          [index]
        );
        R.useEffect(function() {
          mounted.current = true;
          return function() {
            mounted.current = false;
          };
        }, []);
        function goTo(i) {
          if (busy || i < 0 || i >= count) return;
          setIndex(i);
          if (i > maxVisited) setMaxVisited(i);
          setStepError("");
        }
        function fail(i, message) {
          markInvalid(i, true);
          goTo(i);
          setStepError(message);
          focusBody();
        }
        function next() {
          if (busy) return;
          var message = runValidate(steps[index]);
          if (message) {
            fail(index, message);
            return;
          }
          markInvalid(index, false);
          goTo(Math.min(index + 1, count - 1));
        }
        function back() {
          if (busy || index === 0) return;
          goTo(index - 1);
        }
        function jump(i) {
          if (busy || i > maxVisited) return;
          goTo(i);
        }
        function submit() {
          if (busy) return;
          var bad = firstFailing(steps);
          if (bad) {
            fail(bad.index, bad.message);
            return;
          }
          for (var i = 0; i < count; i++) markInvalid(i, false);
          setStepError("");
          if (typeof props.onSubmit === "function") props.onSubmit();
        }
        function cancel() {
          if (busy) return;
          if (typeof props.onClose === "function") props.onClose();
        }
        var current = steps[index];
        var isLast = index >= count - 1;
        var saveText = props.submitText || "\u4FDD\u5B58";
        var shownError = stepError || props.error || "";
        return h2(
          Overlay,
          props,
          count > 1 ? h2(stepper.Steps, {
            h: h2,
            steps: steps.map(function(step) {
              return { key: step.key, label: step.label, hint: step.hint, optional: step.optional };
            }),
            current: index,
            maxVisited,
            onJump: jump,
            invalid,
            disabled: busy,
            label: props.stepsLabel || "\u521B\u5EFA\u6B65\u9AA4"
          }) : null,
          h2(
            "div",
            {
              className: "wbctl-dialog-body" + (props.bodyClassName ? " " + props.bodyClassName : ""),
              ref: bodyRef,
              tabIndex: -1
            },
            current ? current.render(h2, props) : null
          ),
          props.footerExtra || null,
          shownError ? h2("div", { className: "wbctl-dialog-err", role: "alert" }, shownError) : null,
          h2(
            "div",
            { className: "wbctl-dialog-foot" },
            count > 1 ? h2("span", { className: "wbctl-dialog-progress" }, index + 1 + " / " + count) : null,
            props.footerNote ? h2("span", { className: "wbctl-dialog-note" }, props.footerNote) : null,
            h2("span", { className: "wbctl-dialog-spacer" }),
            index > 0 ? h2(
              "button",
              { type: "button", className: "wbctl-btn", onClick: back, disabled: busy },
              props.backText || "\u4E0A\u4E00\u6B65"
            ) : null,
            h2("button", { type: "button", className: "wbctl-btn", onClick: cancel, disabled: busy }, props.cancelText || "\u53D6\u6D88"),
            h2(
              "button",
              {
                type: "button",
                className: "wbctl-btn wbctl-btn-p",
                onClick: isLast ? submit : next,
                // submitDisabled 只作用于末步的保存：插件据此把「结构性不合法」（JSON 语法、无可选 action）
                // 提前反映成禁用态，避免用户点到保存才被弹回第一步。
                disabled: busy || isLast && !!props.submitDisabled
              },
              busy ? saveText + "\u4E2D\u2026" : isLast ? saveText : props.nextText || "\u4E0B\u4E00\u6B65"
            )
          )
        );
      }
      StagedDialog.displayName = opts.displayName || "StagedDialog";
      return StagedDialog;
    }
    var STYLES = [
      // 宽表单：内容多时给足横向空间，窄屏留 16px 边距后铺满。
      ".wbctl-dialog{width:min(880px,calc(100vw - 32px));max-height:min(92vh,760px);display:flex;flex-direction:column;overflow:hidden}",
      ".wbctl-dialog-body{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;padding:2px 2px 10px;outline:none}",
      ".wbctl-dialog-body:focus-visible{outline:none}",
      ".wbctl-dialog-foot{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding-top:10px;margin-top:10px;border-top:1px solid var(--wb-line,var(--wb-border))}",
      ".wbctl-dialog-progress{font-size:11.5px;color:var(--wb-muted,#666);font-variant-numeric:tabular-nums}",
      ".wbctl-dialog-note{font-size:11.5px;color:var(--wb-muted,#666);min-width:0}",
      ".wbctl-dialog-spacer{flex:1 1 auto}",
      ".wbctl-dialog-err{margin-top:8px;padding:7px 10px;border-radius:8px;border:1px solid color-mix(in oklab,var(--wb-danger,#d33) 45%,transparent);background:color-mix(in oklab,var(--wb-danger,#d33) 8%,transparent);color:var(--wb-danger,#d33);font-size:12px}",
      ".wbctl-btn{padding:6px 14px;border:1px solid var(--wb-border,#d0d5dd);border-radius:8px;background:var(--wb-card,#fff);color:inherit;font:inherit;font-size:12.5px;cursor:pointer}",
      ".wbctl-btn:hover:not(:disabled){background:color-mix(in oklab,currentColor 7%,transparent)}",
      ".wbctl-btn:focus-visible{outline:2px solid var(--wb-accent,#2563eb);outline-offset:2px}",
      ".wbctl-btn:disabled{opacity:.55;cursor:default}",
      ".wbctl-btn.wbctl-btn-p{background:var(--wb-accent,#2563eb);border-color:transparent;color:var(--wb-on-accent,#fff)}",
      ".wbctl-btn.wbctl-btn-p:hover:not(:disabled){background:color-mix(in oklab,var(--wb-accent,#2563eb) 86%,#000)}",
      // 确认步：键值对清单，各插件共用，避免再各写一套只读摘要。\n  ".wbctl-review{display:flex;flex-direction:column;border:1px solid var(--wb-line,var(--wb-border));border-radius:10px;overflow:hidden}",\n  ".wbctl-review-row{display:grid;grid-template-columns:96px minmax(0,1fr);gap:10px;padding:8px 12px;font-size:12.5px;background:var(--wb-surface,transparent)}",\n  ".wbctl-review-row+.wbctl-review-row{border-top:1px solid var(--wb-line,var(--wb-border))}",\n  ".wbctl-review-k{color:var(--wb-muted,inherit);font-size:11.5px;line-height:1.6}",\n  ".wbctl-review-v{min-width:0;word-break:break-word;line-height:1.6}",\n  ".wbctl-note{margin:10px 0 0;font-size:11.5px;color:var(--wb-muted,inherit)}",\n  // 两列字段布局：内容多的弹窗不再单列拉长，窄屏回落单列。
      ".wbctl-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 14px}",
      ".wbctl-form>.full{grid-column:1/-1}",
      "@media (max-width:760px){.wbctl-dialog{width:calc(100vw - 16px);max-height:94vh}.wbctl-form{grid-template-columns:1fr}.wbctl-form>.full{grid-column:auto}}",
      "@media (prefers-reduced-motion:reduce){.wbctl-btn{transition:none}}"
    ];
    module2.exports = {
      createStagedDialog,
      validateStep,
      firstFailing,
      styles: STYLES
    };
  }
});

// packages/shell/client/automation/styles.cjs
var require_styles2 = __commonJS({
  "packages/shell/client/automation/styles.cjs"(exports2, module2) {
    "use strict";
    module2.exports = require_client_base_styles()("wba").join("\n") + "\n" + [
      // 页面分区
      ".wba-panel{border:1px solid var(--wb-border);border-radius:12px;padding:16px;background:var(--wb-surface);display:flex;flex-direction:column;gap:12px}",
      ".wba-panel-h{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}",
      ".wba-panel-title{font-size:14px;font-weight:650;margin:0}",
      ".wba-sub{font-size:12px;color:var(--wb-muted);margin:0;line-height:1.5}",
      ".wba-sep{height:1px;background:var(--wb-border);border:0;margin:0}",
      // 表格容器与行
      ".wba-table-wrap{overflow-x:auto;border:1px solid var(--wb-border);border-radius:12px;background:var(--wb-surface)}",
      ".wba-table-wrap .wba-table{border-collapse:separate;border-spacing:0}",
      ".wba-table tbody tr{transition:background 120ms ease}",
      ".wba-table tbody tr:hover{background:var(--wb-line)}",
      ".wba-table td{vertical-align:middle}",
      ".wba-table code{font-size:11px;color:var(--wb-muted)}",
      ".wba-table tr.wba-row-open{background:var(--wb-line)}",
      ".wba-detail-cell{padding:12px 14px!important;background:color-mix(in oklab,var(--wb-line) 45%,transparent)}",
      // KPI 卡片
      ".wba-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}",
      ".wba-card{border:1px solid var(--wb-border);border-radius:10px;padding:12px;background:var(--wb-surface);display:flex;flex-direction:column;gap:6px}",
      ".wba-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--wb-muted)}",
      ".wba-card-num{font-size:26px;font-weight:700;line-height:1.1;font-variant-numeric:tabular-nums}",
      ".wba-card-ico{display:flex;color:var(--wb-accent)}",
      ".wba-card-label{font-size:12px;font-weight:600}",
      ".wba-card-hint{font-size:11px;color:var(--wb-muted);margin:0}",
      // 键值 / chips
      ".wba-kv{display:grid;grid-template-columns:max-content 1fr;gap:6px 12px;font-size:12px;align-items:start}",
      ".wba-kv b{font-weight:600;color:var(--wb-muted);white-space:nowrap}",
      ".wba-kv span,.wba-kv code{min-width:0;overflow-wrap:anywhere}",
      ".wba-pills{display:flex;flex-wrap:wrap;gap:6px}",
      // 内置规则来源标：用强调色区分用户自定义（中性）与插件声明（accent）。
      ".wba-pill.info{color:var(--wb-accent);border-color:color-mix(in oklab,var(--wb-accent) 35%,transparent);background:color-mix(in oklab,var(--wb-accent) 10%,transparent)}",
      ".wba-chip{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--wb-border);border-radius:999px;padding:2px 10px;font-size:12px;background:transparent;color:inherit;cursor:pointer;font-family:inherit}",
      ".wba-chip[aria-pressed=true]{background:var(--wb-accent);border-color:var(--wb-accent);color:var(--wb-surface)}",
      ".wba-chip.static{cursor:default}",
      ".wba-chips{display:flex;flex-wrap:wrap;gap:6px}",
      // JSON 编辑器
      ".wba-code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.55;width:100%;min-height:160px;resize:vertical;tab-size:2;box-sizing:border-box;padding:8px;border-radius:8px;border:1px solid var(--wb-border);background:var(--wb-line);color:inherit}",
      ".wba-code.sm{min-height:96px}",
      ".wba-code:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}",
      ".wba-code.err{border-color:var(--wb-danger)}",
      ".wba-code-err{font-size:11px;color:var(--wb-danger);min-height:14px}",
      ".wba-pre{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:1.55;margin:0;padding:10px;border-radius:8px;background:var(--wb-line);max-height:260px;overflow:auto;overflow-wrap:anywhere}",
      // 输入与按钮
      ".wba-input{width:100%;min-width:0;box-sizing:border-box;border:1px solid var(--wb-border);border-radius:8px;padding:6px 8px;font:inherit;font-size:12px;background:var(--wb-surface);color:inherit}",
      ".wba-input.err{border-color:var(--wb-danger)}",
      ".wba-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end}",
      ".wba-toolbar .wba-field{min-width:150px}",
      ".wba-actions{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}",
      ".wba-icon-btn{width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border:1px solid transparent;border-radius:7px;background:transparent;color:inherit;cursor:pointer;padding:0}",
      ".wba-icon-btn:hover{border-color:var(--wb-accent);color:var(--wb-accent)}",
      ".wba-icon-btn.danger:hover{border-color:var(--wb-danger);color:var(--wb-danger)}",
      ".wba-icon-btn:disabled{opacity:.45;cursor:default}",
      // 空态与骨架
      ".wba-empty-card{border:1px dashed var(--wb-border);border-radius:12px;padding:28px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;background:var(--wb-surface)}",
      ".wba-empty-ico{color:var(--wb-muted);display:flex}",
      ".wba-empty-title{font-size:14px;font-weight:650;margin:0}",
      ".wba-empty-body{font-size:12px;color:var(--wb-muted);margin:0;max-width:52ch;line-height:1.55}",
      ".wba-skel{height:12px;border-radius:6px;background:var(--wb-line);animation:wba-pulse 1.2s ease-in-out infinite}",
      ".wba-skel-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:14px;padding:12px 14px;border-bottom:1px solid var(--wb-border)}",
      "@keyframes wba-pulse{50%{opacity:.45}}",
      // 模态
      ".wba-modal{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:16px;background:color-mix(in oklab,var(--wb-muted) 45%,transparent)}",
      ".wba-modal-box{width:min(760px,calc(100vw - 32px));max-height:90vh;display:flex;flex-direction:column;background:var(--wb-surface);border:1px solid var(--wb-border);border-radius:14px;overflow:hidden;box-shadow:0 24px 64px color-mix(in oklab,var(--wb-muted) 40%,transparent)}",
      ".wba-modal-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 16px;border-bottom:1px solid var(--wb-border)}",
      ".wba-modal-head h3{font-size:15px;margin:0}",
      ".wba-modal-body{padding:16px;overflow:auto;display:flex;flex-direction:column;gap:16px}",
      ".wba-modal-foot{position:sticky;bottom:0;display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--wb-border);background:var(--wb-surface)}",
      ".wba-modal-foot .wba-grow{flex:1}",
      // 编辑器分段与栅格
      ".wba-section{display:flex;flex-direction:column;gap:10px;padding-top:14px;border-top:1px solid var(--wb-border)}",
      ".wba-section:first-child{border-top:0;padding-top:0}",
      ".wba-section-title{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--wb-muted);margin:0;text-transform:uppercase}",
      ".wba-grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}",
      ".wba-grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}",
      ".wba-span-2{grid-column:span 2}",
      ".wba-seg{display:inline-flex;gap:2px;padding:2px;border:1px solid var(--wb-border);border-radius:8px;background:var(--wb-line);align-self:flex-start}",
      ".wba-seg button{border:0;background:transparent;color:inherit;border-radius:6px;padding:4px 12px;font-size:12px;font-family:inherit;cursor:pointer}",
      ".wba-seg button[aria-pressed=true]{background:var(--wb-surface);box-shadow:0 0 0 1px var(--wb-border);font-weight:600}",
      ".wba-block{display:flex;flex-direction:column;gap:6px;min-width:0}",
      ".wba-inline{display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-width:0}",
      ".wba-hint{font-size:12px;color:var(--wb-muted);line-height:1.4}",
      ".wba-grow{flex:1;min-width:0}",
      ".wba-svg{display:inline-block;vertical-align:middle;flex:none}",
      ".wba-w-120{width:120px;flex:none}",
      /* 共享数字输入框在触发配置里的宽度：与原来的 120px 输入框对齐。 */
      ".wba-num{flex:none}.wba-num .wbctl-num-input{width:120px}",
      ".wba-w-96{width:96px;flex:none}",
      ".wba-list{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px;font-size:12px;line-height:1.55}",
      ".wba-clickable{cursor:pointer}",
      ".wba-check{display:inline-flex;align-items:center;gap:6px;font-size:12px;cursor:pointer}",
      ".wba-check input{accent-color:var(--wb-accent);margin:0}",
      // 设置页：纵向堆叠的卡片与 action 多选
      ".wba-stack{display:flex;flex-direction:column;gap:12px}",
      ".wba-notice.warn{background:var(--wb-surface);color:var(--wb-warn);border:1px solid var(--wb-warn)}",
      ".wba-hist{display:flex;flex-direction:column;gap:8px;max-height:52vh;overflow:auto}",
      ".wba-hist-row{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border:1px solid var(--wb-line);border-radius:8px;background:var(--wb-surface)}",
      ".wba-hist-row .wba-pre{max-height:120px}",
      ".wba-empty-inline{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:4px 0}",
      ".wba-picker{display:flex;flex-direction:column;gap:8px;max-height:280px;overflow:auto;border:1px solid var(--wb-border);border-radius:8px;padding:8px;background:var(--wb-surface)}",
      ".wba-picker-group{display:flex;flex-direction:column;gap:2px}",
      ".wba-picker-domain{margin:4px 0 2px;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--wb-muted)}",
      ".wba-picker-row{padding:3px 4px;border-radius:6px;gap:8px;min-width:0}",
      ".wba-picker-row:hover{background:var(--wb-card)}",
      ".wba-picker-row .wba-hint{flex:1;min-width:0}",
      // 文本与焦点
      ".wba-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}",
      ".wba-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:var(--wb-muted)}",
      ".wba-nowrap{white-space:nowrap}",
      ".wba-strong{font-weight:600}",
      ".wba-warn{color:var(--wb-warn)}",
      ".wba-err-text{color:var(--wb-danger);font-size:11px;margin:0}",
      ".wba-wrap :focus-visible,.wba-modal :focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}",
      // 响应式
      "@media (max-width:720px){.wba-grid-2,.wba-grid-3{grid-template-columns:1fr}.wba-span-2{grid-column:auto}.wba-modal{padding:8px}.wba-modal-box{width:calc(100vw - 16px)}.wba-toolbar .wba-field{min-width:0;flex:1 1 140px}.wba-modal-body{padding:12px}.wba-modal-foot{flex-wrap:wrap}.wba-skel-row{grid-template-columns:1fr 1fr}}",
      // 窄屏筛选条：搜索与三个下拉各占整行，清除按钮同样整行，避免和下拉挤在一格里。
      "@media (max-width:600px){.wba-toolbar-filters .wba-field{min-width:0;flex:1 1 100%}.wba-toolbar-filters .wba-grow{display:none}.wba-toolbar-filters .wba-btn{flex:1 1 100%}}",
      // 宿主视图容器：全宽铺满，不复用 .wb-inner 的 1040px 收窄。
      ".wb-auto{display:flex;flex-direction:column;gap:14px;width:100%;min-width:0}",
      ".wb-auto .wba-wrap{padding:0;height:auto;overflow:visible;gap:14px}"
      // 数据页签删除后的去向说明条
    ].join("\n") + "\n" + // 分步弹窗外壳：遮罩/焦点环/步骤条样式由共享层提供。
    require_staged_dialog().styles.join("\n");
  }
});

// packages/shell/client/styles.cjs
var require_styles3 = __commonJS({
  "packages/shell/client/styles.cjs"(exports2, module2) {
    "use strict";
    var SW = require_switch();
    var NF = require_number_field();
    var schemeStyles = require_config_scheme_bar().styles.join("\n").replace(/__P__/g, "wbh");
    var CSS2 = [
      ".wb-root{--wb-line:var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent));--wb-surface:var(--dsw-alias-bg-layer-1,color-mix(in oklab,currentColor 4%,transparent));display:flex;flex-direction:column;height:100%;box-sizing:border-box;overflow:auto;color:inherit;font-size:13px;background:var(--dsw-alias-bg-base,var(--dsw-alias-bg-layer-2,color-mix(in oklab,currentColor 4%,transparent)));padding:24px 28px}",
      ".wb-inner{display:flex;flex-direction:column;gap:16px;width:100%;max-width:1040px;margin:0 auto}",
      ".wb-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap}",
      ".wb-hero h2{margin:0;font-size:18px;font-weight:650;letter-spacing:.2px}",
      ".wb-tag{font-size:12px;opacity:.62;margin-top:4px;display:block;line-height:1.5}",
      ".wb-cloud{display:inline-flex;align-items:center;gap:7px;max-width:100%;padding:6px 11px;border:1px solid var(--wb-line);border-radius:999px;background:var(--wb-surface);color:inherit;font:inherit;font-size:12px;line-height:1.2;cursor:pointer;white-space:nowrap;transition:border-color .15s ease,background .15s ease}",
      ".wb-cloud:hover{border-color:var(--dsw-alias-brand-primary,#11a89b)}",
      ".wb-cloud:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#11a89b);outline-offset:2px}",
      ".wb-cloud-dot{width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.4;flex:none}",
      ".wb-cloud.local{opacity:.7}",
      ".wb-cloud.on .wb-cloud-dot{background:var(--dsw-alias-state-success-primary,#18a058);opacity:1;box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-state-success-primary,#18a058) 16%,transparent)}",
      ".wb-cloud.off{border-color:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 35%,var(--wb-line));background:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 5%,var(--wb-surface))}",
      ".wb-cloud.off .wb-cloud-dot{background:var(--dsw-alias-state-error-primary,#e5484d);opacity:1}",
      ".wb-cloud.warn{border-color:color-mix(in oklab,var(--dsw-alias-state-warn-primary,#d48806) 35%,var(--wb-line))}",
      ".wb-cloud.warn .wb-cloud-dot{background:var(--dsw-alias-state-warn-primary,#d48806);opacity:1}",
      ".wb-cloud.syncing .wb-cloud-dot{background:var(--dsw-alias-brand-primary,#11a89b);opacity:1;animation:wb-cloud-pulse 1.2s ease-in-out infinite}",
      "@keyframes wb-cloud-pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in oklab,var(--dsw-alias-brand-primary,#11a89b) 0%,transparent)}50%{box-shadow:0 0 0 4px color-mix(in oklab,var(--dsw-alias-brand-primary,#11a89b) 18%,transparent)}}",
      "@media (prefers-reduced-motion:reduce){.wb-cloud.syncing .wb-cloud-dot{animation:none}}",
      ".wb-tabs{display:flex;gap:6px;border-bottom:1px solid var(--wb-line);margin-bottom:2px}",
      ".wb-tab{border:none;background:transparent;color:inherit;opacity:.6;padding:9px 14px;cursor:pointer;font-size:13px;border-bottom:2px solid transparent;margin-bottom:-1px;transition:opacity .15s ease,border-color .15s ease}",
      ".wb-tab:hover{opacity:.9}",
      ".wb-tab.on{opacity:1;border-bottom-color:var(--dsw-alias-brand-primary,#11a89b);font-weight:600}",
      ".wb-card{background:var(--wb-surface);border:1px solid var(--wb-line);border-radius:12px;padding:14px 16px}",
      ".wb-form{display:flex;gap:8px;align-items:center;background:var(--wb-surface);border:1px solid var(--wb-line);border-radius:12px;padding:10px;flex-wrap:wrap}",
      ".wb-input,.wb-select{background:transparent;color:inherit;border:1px solid var(--wb-line);border-radius:8px;padding:8px 11px;font-size:13px;outline:none;transition:border-color .15s ease}",
      ".wb-input:focus,.wb-select:focus{border-color:var(--dsw-alias-brand-primary,#11a89b)}",
      ".wb-btn{background:var(--dsw-alias-brand-primary,#11a89b);color:var(--dsw-alias-label-primary-inverted,#fff);border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-size:13px;font-weight:600;transition:filter .15s ease}",
      ".wb-btn:hover{filter:brightness(1.08)}",
      ".wb-btn:disabled{opacity:.55;cursor:default;filter:none}",
      ".wb-btn.ghost{background:transparent;border:1px solid var(--wb-line);color:inherit;font-weight:400;opacity:.8}",
      ".wb-btn.danger{background:transparent;border:1px solid var(--dsw-alias-state-error-primary,#e5484d);color:var(--dsw-alias-state-error-primary,#e5484d);font-weight:500}",
      ".wb-sec{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 0}",
      ".wb-sec h3{margin:0;font-size:13px;font-weight:650;letter-spacing:.2px}",
      ".wb-sec .wb-hint{font-size:11.5px;opacity:.5}",
      ".wb-addon{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:12px 14px;border:1px solid var(--wb-line);border-radius:10px;background:var(--wb-surface)}",
      ".wb-addon+.wb-addon{margin-top:8px}",
      ".wb-addon-main{min-width:0;display:flex;flex-direction:column;gap:2px}",
      ".wb-addon-title{font-weight:600;font-size:13.5px}",
      ".wb-addon-meta{font-size:11.5px;opacity:.52;margin-top:3px;line-height:1.5;word-break:break-word}",
      ".wb-addon-desc{font-size:12px;opacity:.66;margin-top:2px;line-height:1.5}",
      ".wb-actions{display:flex;gap:6px;align-items:center;flex:none;flex-wrap:wrap;justify-content:flex-end}",
      ".wb-badge{font-size:10.5px;padding:2px 7px;border-radius:999px;border:1px solid var(--wb-line);opacity:.7;margin-left:6px;white-space:nowrap}",
      ".wb-err{font-size:12px;color:var(--dsw-alias-state-error-primary,#e5484d);margin-top:4px;line-height:1.5;word-break:break-word}",
      ".wb-msg{font-size:12.5px;opacity:.55;padding:20px 0;text-align:center;line-height:1.6}",
      ".wb-empty-cta{padding:26px 14px}",
      ".wb-stack{display:flex;flex-direction:column;gap:10px}",
      // 数据清空危险区：只借用主题的状态错误色做描边与浅底，避免在备份页另建色板。
      ".wb-danger{border-color:color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 34%,var(--wb-line));background:linear-gradient(180deg,color-mix(in oklab,var(--dsw-alias-state-error-primary,#e5484d) 5%,var(--wb-surface)),var(--wb-surface) 72%)}",
      ".wb-danger .wb-sec h3{color:var(--dsw-alias-state-error-primary,#e5484d)}",
      ".wb-danger-desc{font-size:12.5px;line-height:1.65;opacity:.72;margin:10px 0 0}",
      ".wb-danger-scope{margin:8px 0 0;padding-left:18px;font-size:12px;line-height:1.7;opacity:.66}",
      ".wb-danger-action{display:flex;flex-direction:column;gap:8px;margin-top:12px;max-width:540px}",
      ".wb-danger-label{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px;opacity:.72}",
      ".wb-danger-phrase{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;padding:2px 6px;border-radius:6px;border:1px solid var(--wb-line);background:var(--wb-card);opacity:.92}",
      ".wb-danger-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}",
      ".wb-danger-row .wb-input{flex:1 1 220px;min-width:0}",
      ".wb-danger-msg{font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary,#e5484d)}",
      ".wb-danger-note{font-size:11.5px;line-height:1.55;opacity:.55;margin:0}",
      ".wb-danger-done{display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin-top:12px}",
      ".wb-danger-done-text{font-size:14px;font-weight:650}",
      ".wb-danger-done-sub{font-size:12px;line-height:1.6;opacity:.66}",
      ".wb-home-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(236px,1fr));gap:12px}",
      // 首页栏目分组：宿主栏目表定顺序，每个栏目一段标题 + 网格；空栏目不渲染。
      ".wb-home-cats{display:flex;flex-direction:column;gap:20px}",
      ".wb-home-cat{display:flex;flex-direction:column;gap:10px;min-width:0}",
      ".wb-home-cat-head{display:flex;align-items:center;gap:8px;min-height:20px}",
      ".wb-home-cat-head h3{margin:0;font-size:13px;font-weight:650;letter-spacing:.2px;opacity:.82}",
      ".wb-home-cat-count{min-width:20px;padding:0 6px;border-radius:999px;border:1px solid var(--wb-line);background:var(--wb-surface);font-size:11px;line-height:18px;text-align:center;opacity:.62;font-variant-numeric:tabular-nums}",
      ".wb-home-card{display:flex;flex-direction:column;gap:6px;text-align:left;background:var(--wb-surface);border:1px solid var(--wb-line);border-radius:14px;padding:16px 16px 14px;color:inherit;font:inherit;cursor:pointer;transition:transform .12s ease,border-color .12s ease,background .12s ease}",
      ".wb-home-card:hover{border-color:var(--dsw-alias-brand-primary,#11a89b);transform:translateY(-1px)}",
      ".wb-home-card:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#11a89b);outline-offset:2px}",
      ".wb-home-top{display:flex;align-items:center;justify-content:space-between;gap:8px}",
      ".wb-home-icon{width:34px;height:34px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in oklab,var(--dsw-alias-brand-primary,#11a89b) 14%,transparent);color:var(--dsw-alias-brand-primary,#11a89b);font-size:16px;font-weight:650;flex:none}",
      ".wb-home-title{font-size:14px;font-weight:650;margin-top:4px;line-height:1.4}",
      ".wb-home-desc{font-size:12px;opacity:.62;line-height:1.55;min-height:34px}",
      ".wb-home-card.dim{opacity:.72}",
      ".wb-home-grid.manage{margin-top:2px}",
      ".wb-wide{max-width:1280px}",
      ".wb-page-head{display:flex;flex-direction:column;gap:8px;padding-bottom:2px}",
      ".wb-page-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}",
      ".wb-back{border:1px solid var(--wb-line);background:transparent;color:inherit;border-radius:8px;padding:6px 11px;cursor:pointer;font:inherit;font-size:12px;opacity:.75;display:inline-flex;align-items:center;gap:5px}",
      ".wb-back:hover{opacity:1;border-color:var(--dsw-alias-brand-primary,#11a89b)}",
      // 「返回首页」拆成图标 + 文字两段：窄屏只留箭头图标，避免四个字被挤成两行。
      ".wb-back-icon{display:inline-flex;align-items:center;justify-content:center;line-height:1}",
      // 返回按钮只留箭头：文字会把顶栏挤窄屏一行放不下，图标本身已足够（附 aria-label/title）。
      ".wb-back-label{display:none}",
      ".wb-page-title{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
      ".wb-page-title h2{margin:0;font-size:19px;font-weight:650;letter-spacing:.2px}",
      ".wb-page-desc{font-size:12px;opacity:.6;line-height:1.5}",
      ".wb-page-tabs{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--wb-line)}",
      ".wb-page-loading{display:flex;flex-direction:column;gap:8px;align-items:flex-start}",
      ".wb-grow{flex:1;min-width:0}",
      // 全屏页铺满整个窗口（inset:0），但根节点必须声明 -webkit-app-region:no-drag：
      // macOS 的宿主 chrome 把顶部条带标成 drag 区，Electron 按图层几何计算拖拽区，
      // 覆盖在 drag 区上的元素若不声明 no-drag，点击会被当成拖窗口，
      // 「返回首页」按钮就永远收不到 click。工具栏空白段再恢复 drag（按钮另有 no-drag 规则）。
      ".wb-immersive{position:fixed;inset:0;z-index:700;height:100vh;box-sizing:border-box;padding:0;background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-layer-1,#faf7ea));backdrop-filter:saturate(1.05) blur(10px);overflow:hidden;-webkit-app-region:no-drag}",
      ".wb-immersive-bar{position:relative;display:flex;align-items:center;gap:10px;padding:calc(9px + var(--dsh-frame-top-clearance,0px)) 22px 9px;border-bottom:1px solid var(--wb-line);flex:none;background:transparent;-webkit-app-region:no-drag}",
      ".wb-immersive-bar .wb-immersive-title{cursor:default;user-select:none}",
      ".wb-immersive-bar button,.wb-immersive-bar a,.wb-immersive-bar input,.wb-immersive-bar select,.wb-immersive-bar textarea,.wb-immersive-bar [role=button]{-webkit-app-region:no-drag}",
      ".wb-immersive-title{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;opacity:.85}",
      ".wb-immersive-title .wb-home-icon{width:24px;height:24px;border-radius:7px;font-size:12px}",
      ".wb-immersive-main{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:18px 24px 24px}",
      ".wb-immersive-main>.wb-inner{max-width:none}",
      // .wb-fill：页面根节点声明“我自己管滚动，请把整块可用高度给我”（三栏/双栏工作区这类应用式布局用）
      ".wb-immersive-main:has(.wb-fill)>.wb-inner{height:100%}",
      ".wb-inner>div:has(>.wb-fill){display:flex;flex-direction:column;height:100%;min-height:0}",
      ".wb-fill{flex:1 1 auto;min-height:0}",
      "@media (max-width:760px){.wb-root{padding:16px}.wb-home-grid{grid-template-columns:1fr}.wb-home-cats{gap:16px}.wb-page-title h2{font-size:17px}.wb-immersive-bar{padding:calc(8px + var(--dsh-frame-top-clearance,0px)) 14px 8px}.wb-immersive-main{padding:10px 10px 18px}.wb-inner{gap:12px}.wb-immersive-title span:not(.wb-home-icon):not(.wb-badge){display:none}}",
      ".wb-backup{display:flex;flex-direction:column;gap:14px}",
      ".wb-backup-overview{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;background:linear-gradient(120deg,color-mix(in oklab,var(--wb-accent) 7%,var(--wb-card)),var(--wb-card) 65%)}",
      ".wb-backup-overview-main{min-width:0;display:flex;flex-direction:column;gap:3px}",
      ".wb-backup-overview-title{font-size:14px;font-weight:650;letter-spacing:.1px}",
      ".wb-backup-overview-sub{font-size:12px;opacity:.62;line-height:1.5}",
      ".wb-backup-toolbar{display:flex;gap:8px;flex-wrap:wrap}",
      ".wb-backup-toolbar .wb-btn{padding:6px 12px;font-size:12px}",
      ".wb-backup-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(296px,1fr);gap:14px;align-items:start}",
      ".wb-backup-modules,.wb-backup-panel{display:flex;flex-direction:column;gap:12px}",
      ".wb-backup-side{display:flex;flex-direction:column;gap:14px;position:sticky;top:12px}",
      ".wb-backup-list{display:flex;flex-direction:column;gap:8px}",
      ".wb-backup-item{border:1px solid var(--wb-line);border-radius:12px;background:var(--wb-card);transition:border-color .12s ease,background .12s ease}",
      ".wb-backup-item:hover{border-color:color-mix(in oklab,var(--wb-accent) 30%,var(--wb-line))}",
      ".wb-backup-item.on{border-color:color-mix(in oklab,var(--wb-accent) 44%,var(--wb-line));background:color-mix(in oklab,var(--wb-accent) 4%,var(--wb-card))}",
      ".wb-backup-row{display:flex;align-items:flex-start;gap:10px;padding:12px 13px;border-radius:12px}",
      ".wb-backup-row.open{border-radius:12px 12px 0 0}",
      ".wb-backup-row-main{display:flex;align-items:flex-start;gap:10px;flex:1;min-width:0;cursor:pointer}",
      ".wb-backup-row input{margin-top:3px;accent-color:var(--wb-accent);cursor:pointer}",
      ".wb-backup-main{min-width:0;display:flex;flex-direction:column;gap:4px}",
      ".wb-backup-name{font-weight:600;font-size:13px;display:flex;align-items:center;flex-wrap:wrap;gap:2px}",
      ".wb-backup-meta{font-size:11.5px;opacity:.55;line-height:1.55;overflow-wrap:anywhere}",
      ".wb-backup-tables{display:flex;flex-wrap:wrap;gap:5px;margin-top:1px}",
      ".wb-backup-chip{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;line-height:1;padding:4px 7px;border-radius:6px;border:1px solid var(--wb-line);background:var(--wb-surface);opacity:.8}",
      ".wb-backup-gear{flex:none;width:28px;height:28px;border-radius:8px;border:1px solid transparent;background:transparent;color:inherit;opacity:.45;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;margin-top:-2px;transition:opacity .12s ease,background .12s ease,border-color .12s ease}",
      ".wb-backup-gear:hover,.wb-backup-gear:focus-visible,.wb-backup-gear.active{opacity:1;border-color:var(--wb-line);background:color-mix(in oklab,var(--wb-accent) 10%,transparent);outline:none}",
      ".wb-backup-icon{display:block;flex:none}",
      ".wb-backup-config{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 13px 12px;border-top:1px solid var(--wb-line);background:color-mix(in oklab,var(--wb-accent) 4%,var(--wb-card));border-radius:0 0 12px 12px}",
      ".wb-backup-config-label{font-size:12px;font-weight:600;opacity:.8}",
      ".wb-backup-config .wb-select{padding:6px 9px;font-size:12px;background:var(--wb-surface)}",
      ".wb-backup-note{font-size:11.5px;opacity:.58;line-height:1.6;margin:0}",
      ".wb-backup-formats{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
      ".wb-backup-format{display:flex;flex-direction:column;gap:4px;text-align:left;padding:10px 11px;border:1px solid var(--wb-line);border-radius:10px;background:var(--wb-surface);color:inherit;font:inherit;cursor:pointer;transition:border-color .12s ease,background .12s ease}",
      ".wb-backup-format:hover{border-color:color-mix(in oklab,var(--wb-accent) 34%,var(--wb-line))}",
      ".wb-backup-format.on{border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 8%,var(--wb-surface))}",
      ".wb-backup-format:focus-visible{outline:2px solid color-mix(in oklab,var(--wb-accent) 60%,transparent);outline-offset:1px}",
      ".wb-backup-format-head{display:flex;align-items:center;justify-content:space-between;gap:6px}",
      ".wb-backup-format-name{font-size:12.5px;font-weight:600}",
      ".wb-backup-format-check{color:var(--wb-accent);font-size:12px;font-weight:700}",
      ".wb-backup-format-desc{font-size:11px;opacity:.58;line-height:1.45}",
      ".wb-backup-go{display:inline-flex;align-items:center;justify-content:center;gap:7px}",
      ".wb-backup-drop{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;padding:20px 14px;border:1.5px dashed color-mix(in oklab,var(--wb-line) 70%,var(--wb-accent));border-radius:12px;background:color-mix(in oklab,var(--wb-accent) 3%,var(--wb-card));cursor:pointer;transition:border-color .12s ease,background .12s ease}",
      ".wb-backup-drop:hover,.wb-backup-drop:focus-within,.wb-backup-drop.drag{border-color:var(--wb-accent);background:color-mix(in oklab,var(--wb-accent) 8%,var(--wb-card))}",
      ".wb-backup-drop-title{font-size:12.5px;font-weight:600}",
      ".wb-backup-drop-sub{font-size:11px;opacity:.55}",
      ".wb-backup-file{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}",
      ".wb-backup-msg{padding:10px 13px;border-radius:10px;font-size:12.5px;line-height:1.55;border:1px solid var(--wb-line);background:var(--wb-card)}",
      ".wb-backup-msg.ok{border-color:color-mix(in oklab,var(--wb-ok) 32%,var(--wb-line));background:color-mix(in oklab,var(--wb-ok) 7%,var(--wb-card))}",
      ".wb-backup-msg.err{border-color:color-mix(in oklab,var(--wb-danger) 32%,var(--wb-line));background:color-mix(in oklab,var(--wb-danger) 7%,var(--wb-card));color:var(--wb-danger)}",
      ".wb-backup-report{display:flex;flex-direction:column;gap:10px}",
      ".wb-backup-file-line{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;padding-bottom:8px;border-bottom:1px solid var(--wb-line)}",
      ".wb-backup-file-name{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;overflow-wrap:anywhere}",
      ".wb-backup-stack{display:flex;flex-direction:column;gap:0}",
      ".wb-backup-result-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid var(--wb-line)}",
      ".wb-backup-result-row:first-of-type{border-top:0;padding-top:0}",
      ".wb-backup-table-wrap{overflow-x:auto}",
      ".wb-backup-table{width:100%;border-collapse:collapse;font-size:12px}",
      ".wb-backup-table th,.wb-backup-table td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--wb-line);vertical-align:top}",
      ".wb-backup-table th{font-weight:600;opacity:.66;font-size:11.5px;white-space:nowrap}",
      ".wb-backup-table td.num{white-space:nowrap;opacity:.8;font-variant-numeric:tabular-nums}",
      ".wb-backup-status{font-weight:600}",
      ".wb-backup-status.ok{color:var(--wb-ok)}",
      ".wb-backup-status.partial{color:var(--wb-warn)}",
      ".wb-backup-status.failed{color:var(--wb-danger)}",
      ".wb-backup-status.skipped{opacity:.55}",
      "@media(max-width:980px){.wb-backup-layout{grid-template-columns:1fr}.wb-backup-side{position:static}}",
      "@media(max-width:520px){.wb-backup-formats{grid-template-columns:1fr}.wb-backup-overview{align-items:flex-start}}",
      ".wb-audit-filters{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin-top:10px}",
      ".wb-audit-field{display:flex;flex:1 1 150px;min-width:0;flex-direction:column;gap:5px;font-size:12px}",
      ".wb-audit-field .wb-input,.wb-audit-field .wb-select{width:100%;min-width:0;box-sizing:border-box;height:36px;padding:6px 9px;font-size:12px}",
      ".wb-audit-summary{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px;font-size:12px;overflow-wrap:anywhere}",
      ".wb-audit-summary span{min-width:0}.wb-audit-row:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#11a89b);outline-offset:-2px}",
      "@media(max-width:480px){.wb-audit-field{flex-basis:100%}.wb-audit-pager{flex-wrap:wrap}.wb-audit-filters .wb-btn{flex:1}}",
      ".wb-audit-table{width:100%;border-collapse:collapse;font-size:12px}",
      ".wb-audit-table th{text-align:left;font-weight:600;opacity:.6;padding:6px 8px;border-bottom:1px solid var(--wb-line);white-space:nowrap}",
      ".wb-audit-table td{padding:7px 8px;border-bottom:1px solid var(--wb-line);vertical-align:top}",
      ".wb-audit-row{cursor:pointer}",
      ".wb-audit-row:hover td{background:color-mix(in oklab,var(--dsw-alias-brand-primary,#11a89b) 5%,transparent)}",
      ".wb-audit-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}",
      ".wb-audit-ok{color:#1a9c6a;font-weight:600}",
      ".wb-audit-fail{color:#d0483c;font-weight:600}",
      ".wb-audit-dim{opacity:.55}",
      ".wb-audit-pre{white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.6;background:color-mix(in oklab,var(--wb-line) 18%,transparent);border-radius:8px;padding:9px 11px;margin:6px 0 4px}",
      ".wb-audit-pager{display:flex;align-items:center;gap:10px;margin-top:12px}",
      ".wb-sync-status{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;opacity:.7;margin-top:10px;line-height:1.6}",
      ".wb-sync-status b{font-weight:600;opacity:.9}",
      ".wb-conflict{display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap;padding:9px 0;border-top:1px solid var(--wb-line);font-size:12px}",
      ".wb-conflict:first-of-type{border-top:0;padding-top:0}",
      ".wb-conflict-main{min-width:0;display:flex;flex-direction:column;gap:2px}",
      ".wb-conflict-meta{font-size:11px;opacity:.55;word-break:break-word}",
      ".wb-conflict-actions{display:flex;gap:6px;flex:none}",
      require_styles(),
      ".wb-search-wrap{position:relative;display:flex;flex-direction:column;gap:6px}",
      ".wb-search-bar{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--wb-line);border-radius:10px;background:var(--wb-surface)}",
      ".wb-search-bar:focus-within{border-color:var(--dsw-alias-brand-primary,#11a89b)}",
      ".wb-search-icon{opacity:.55;font-size:15px;line-height:1}",
      ".wb-search-input{flex:1;min-width:0;border:0;background:transparent;color:inherit;font:inherit;font-size:13px;outline:none}",
      ".wb-search-kbd{font-size:11px;opacity:.5;border:1px solid var(--wb-line);border-radius:5px;padding:1px 5px}",
      ".wb-search-panel{position:absolute;top:100%;left:0;right:0;z-index:40;margin-top:6px;max-height:340px;overflow:auto;border:1px solid var(--wb-line);border-radius:10px;background:var(--dsw-alias-bg-layer-1,var(--wb-surface));box-shadow:0 12px 32px rgba(0,0,0,.18);padding:6px}",
      ".wb-search-hit{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;font-size:12px;padding:7px 8px;cursor:pointer}",
      ".wb-search-hit:hover{background:color-mix(in oklab,currentColor 7%,transparent)}",
      ".wb-search-domain{flex:none;min-width:52px;font-size:11px;opacity:.6;padding-top:2px}",
      ".wb-search-hit-main{display:flex;flex-direction:column;gap:2px;min-width:0}",
      ".wb-search-hit-title{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".wb-search-hit-snippet{opacity:.65;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
      ".wb-search-empty{padding:12px;font-size:12px;opacity:.65;text-align:center}",
      // ── 统一 UI 设计系统：所有业务插件共享的 token 与基础件 ──
      // 插件各自写过 --wb-border/--wb-accent 等变量但没有宿主兜底，导致大量 #2563eb、#fff 硬编码在深色模式下失效。
      ".wb-root{--wb-border:var(--wb-line);--wb-card:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-layer-2,color-mix(in oklab,currentColor 6%,transparent)));--wb-surface:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-layer-2,color-mix(in oklab,currentColor 6%,transparent)));--wb-accent:var(--dsw-alias-brand-primary,#11a89b);--wb-muted:var(--dsw-alias-label-secondary,color-mix(in oklab,currentColor 58%,transparent));--wb-ok:var(--dsw-alias-state-success-primary,#18a058);--wb-warn:var(--dsw-alias-state-warn-primary,var(--dsw-alias-state-warning-primary,#d48806));--wb-danger:var(--dsw-alias-state-error-primary,#e5484d);--wb-radius-card:14px;--wb-space-md:14px;-webkit-text-size-adjust:100%;text-size-adjust:100%}",
      // Android Chrome / WebView 的「文字自动放大（font boosting）」会把 em 尺寸的表单控件一起放大，
      // 真机上就出现「复选框巨大、按钮文字撑成两行」。这里在文档层关掉，插件视图内部无需再管。
      "html,body{-webkit-text-size-adjust:100%;text-size-adjust:100%}",
      // 手机端浏览器/WebView 的原生复选框没走插件样式时会撑成大块白框，这里统一收口。
      ".wb-root input[type=checkbox],.wb-root input[type=radio]{width:14px;height:14px;margin:0;accent-color:var(--wb-accent,#11a89b);vertical-align:middle}",
      ".wb-root input,.wb-root select,.wb-root textarea,.wb-root button{max-width:100%;font-family:inherit}",
      ".wb-root *{scrollbar-width:thin;scrollbar-color:color-mix(in oklab,currentColor 22%,transparent) transparent}",
      ".wb-root ::-webkit-scrollbar{width:10px;height:10px}.wb-root ::-webkit-scrollbar-thumb{background:color-mix(in oklab,currentColor 18%,transparent);border-radius:999px;border:2px solid transparent;background-clip:padding-box}",
      ".wb-root :is(.wbc-wrap,.wbv,.wba-wrap,.wbct-wrap,.wbca-wrap,.wbm-wrap,.wbml-wrap,.wbm-page,.wbml-page){width:100%;max-width:none;margin:0;padding:0;gap:16px;box-sizing:border-box}",
      ".wb-root :is(.wbc-wrap,.wbv,.wba-wrap,.wbct-wrap,.wbca-wrap,.wbm-wrap,.wbml-wrap,.wbm-page,.wbml-page) h2{font-size:20px;line-height:1.3;font-weight:680;letter-spacing:-.02em;margin:0}",
      ".wb-root :is(.wbc-sub,.wba-sub,.wbct-sub,.wbca-sub,.wbm-sub,.wbml-sub,.wbv-muted,.wbct-muted,.wbc-muted,.wba-muted,.wbca-muted,.wbm-muted,.wbml-muted){font-size:12.5px;line-height:1.55;color:var(--wb-muted)}",
      ".wb-root :is(.wbc-wrap,.wbv,.wba-wrap,.wbct-wrap,.wbca-wrap,.wbm-wrap,.wbml-wrap,.wbm-page,.wbml-page) > :is(.wbc-head,.wba-head,.wbct-head,.wbca-head,.wbm-head,.wbml-head){padding-bottom:12px;border-bottom:1px solid var(--wb-border);align-items:flex-start}",
      ".wb-root :is(.wbc-card,.wbv-card,.wba-card,.wbct-card,.wbca-card,.wbm-card,.wbml-card,.wbct-panel){background:var(--wb-card);border:1px solid var(--wb-border);border-radius:var(--wb-radius-card);padding:16px;box-shadow:0 1px 2px color-mix(in oklab,#000 4%,transparent);transition:border-color .15s ease,box-shadow .15s ease}",
      ".wb-root :is(.wbc-card,.wbv-card,.wba-card,.wbct-card,.wbca-card,.wbm-card,.wbml-card):hover{border-color:color-mix(in oklab,var(--wb-accent) 32%,var(--wb-border));box-shadow:0 2px 14px color-mix(in oklab,#000 6%,transparent)}",
      ".wb-root :is(.wbc-grid,.wbv-grid,.wba-grid,.wbct-grid,.wbca-grid,.wbm-grid,.wbml-grid){gap:12px}",
      ".wb-root :is(.wbc-kpi,.wbv-kpi,.wba-kpi,.wbct-kpi,.wbca-kpi,.wbm-kpi,.wbml-kpi){font-size:26px;line-height:1.15;font-weight:680;letter-spacing:-.03em;font-variant-numeric:tabular-nums}",
      ".wb-root :is(.wbc-btn,.wbv-btn,.wba-btn,.wbct-btn,.wbca-btn,.wbm-btn,.wbml-btn){min-height:32px;padding:0 12px;border-radius:8px;border:1px solid var(--wb-border);background:var(--wb-card);color:inherit;font:inherit;font-size:12.5px;font-weight:500;line-height:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;white-space:nowrap;transition:background .12s ease,border-color .12s ease,color .12s ease,transform .12s ease}",
      ".wb-root :is(.wbc-btn,.wbv-btn,.wba-btn,.wbct-btn,.wbca-btn,.wbm-btn,.wbml-btn):hover:not(:disabled){background:color-mix(in oklab,var(--wb-accent) 8%,var(--wb-card));border-color:color-mix(in oklab,var(--wb-accent) 45%,var(--wb-border))}",
      ".wb-root :is(.wbc-btn,.wbv-btn,.wba-btn,.wbct-btn,.wbca-btn,.wbm-btn,.wbml-btn):active:not(:disabled){transform:translateY(1px)}",
      ".wb-root :is(.wbc-btn,.wbv-btn,.wba-btn,.wbct-btn,.wbca-btn,.wbm-btn,.wbml-btn):disabled{opacity:.45;cursor:not-allowed}",
      ".wb-root :is(.wbc-btn,.wbv-btn,.wba-btn,.wbct-btn,.wbca-btn,.wbm-btn,.wbml-btn):is(.primary,.on){background:var(--wb-accent);border-color:var(--wb-accent);color:var(--dsw-alias-label-primary-inverted,#fff);font-weight:600}",
      ".wb-root :is(.wbc-btn,.wbv-btn,.wba-btn,.wbct-btn,.wbca-btn,.wbm-btn,.wbml-btn).primary:hover:not(:disabled){filter:brightness(1.06)}",
      ".wb-root :is(.wbc-btn,.wbv-btn,.wba-btn,.wbct-btn,.wbca-btn,.wbm-btn,.wbml-btn):is(.danger){color:var(--wb-danger);border-color:color-mix(in oklab,var(--wb-danger) 40%,transparent);background:transparent}",
      ".wb-root :is(.wbc-btn,.wbv-btn,.wba-btn,.wbct-btn,.wbca-btn,.wbm-btn,.wbml-btn).danger:hover:not(:disabled){background:color-mix(in oklab,var(--wb-danger) 8%,var(--wb-card));border-color:var(--wb-danger)}",
      ".wb-root :is(.wbc-btn,.wbv-btn,.wba-btn,.wbct-btn,.wbca-btn,.wbm-btn,.wbml-btn):focus-visible,.wb-root :is(.wbc-input,.wbv input,.wbc-field input,.wbc-field select,.wbc-field textarea,.wba-field input,.wba-field select,.wba-field textarea,.wbct-input,.wbct-field input,.wbca-input,.wbca-field input,.wbm-input,.wbml-input,.wbm-field input,.wbm-field select,.wbm-field textarea):focus-visible{outline:2px solid color-mix(in oklab,var(--wb-accent) 55%,transparent);outline-offset:2px}",
      ".wb-root :is(.wbc-field,.wbv-field,.wba-field,.wbct-field,.wbca-field,.wbm-field,.wbml-field){gap:6px;font-size:12px}",
      ".wb-root :is(.wbc-field,.wbv-field,.wba-field,.wbct-field,.wbca-field,.wbm-field,.wbml-field) > :is(.wbc-label,.wbv-label,.wba-label,.wbct-label,.wbca-label,.wbm-label,.wbml-label){font-size:11.5px;font-weight:600;letter-spacing:.02em;color:var(--wb-muted);opacity:1}",
      ".wb-root :is(.wbc-field,.wbv-field,.wba-field,.wbct-field,.wbca-field,.wbm-field,.wbml-field) :is(input,select,textarea),.wb-root :is(.wbc-input,.wbct-input,.wbca-input,.wbm-input,.wbml-input){min-height:34px;padding:7px 10px;border:1px solid var(--wb-border);border-radius:8px;background:color-mix(in oklab,var(--wb-card) 92%,transparent);color:inherit;font:inherit;font-size:12.5px;box-sizing:border-box;transition:border-color .12s ease,box-shadow .12s ease}",
      ".wb-root :is(.wbc-field,.wbv-field,.wba-field,.wbct-field,.wbca-field,.wbm-field,.wbml-field) :is(input,select,textarea):hover,.wb-root :is(.wbc-input,.wbct-input,.wbca-input,.wbm-input,.wbml-input):hover{border-color:color-mix(in oklab,currentColor 26%,var(--wb-border))}",
      ".wb-root :is(.wbc-field,.wbv-field,.wba-field,.wbct-field,.wbca-field,.wbm-field,.wbml-field) :is(input,select,textarea):focus,.wb-root :is(.wbc-input,.wbct-input,.wbca-input,.wbm-input,.wbml-input):focus{border-color:var(--wb-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--wb-accent) 14%,transparent);outline:none}",
      ".wb-root :is(.wbc-table,.wbv-table,.wba-table,.wbct-table,.wbca-table,.wbm-table,.wbml-table){width:100%;border-collapse:separate;border-spacing:0;font-size:12.5px}",
      ".wb-root :is(.wbc-table,.wbv-table,.wba-table,.wbct-table,.wbca-table,.wbm-table,.wbml-table) th{text-align:left;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--wb-muted);padding:9px 10px;border-bottom:1px solid var(--wb-border);white-space:nowrap;background:color-mix(in oklab,currentColor 3%,transparent)}",
      ".wb-root :is(.wbc-table,.wbv-table,.wba-table,.wbct-table,.wbca-table,.wbm-table,.wbml-table) td{padding:10px;border-bottom:1px solid color-mix(in oklab,var(--wb-border) 70%,transparent);vertical-align:top}",
      ".wb-root :is(.wbc-table,.wbv-table,.wba-table,.wbct-table,.wbca-table,.wbm-table,.wbml-table) tbody tr{transition:background .12s ease}",
      ".wb-root :is(.wbc-table,.wbv-table,.wba-table,.wbct-table,.wbca-table,.wbm-table,.wbml-table) tbody tr:hover{background:color-mix(in oklab,var(--wb-accent) 4%,transparent)}",
      ".wb-root :is(.wbc-pill,.wbv-pill,.wba-pill,.wbct-pill,.wbca-pill,.wbm-pill,.wbml-pill){display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;border:1px solid var(--wb-border);background:color-mix(in oklab,currentColor 5%,transparent);color:inherit;font-size:11px;font-weight:500;line-height:1.5;white-space:nowrap}",
      ".wb-root :is(.wbc-pill,.wbv-pill,.wba-pill,.wbct-pill,.wbca-pill,.wbm-pill,.wbml-pill).ok{color:var(--wb-ok);border-color:color-mix(in oklab,var(--wb-ok) 35%,transparent);background:color-mix(in oklab,var(--wb-ok) 10%,transparent)}",
      ".wb-root :is(.wbc-pill,.wbv-pill,.wba-pill,.wbct-pill,.wbca-pill,.wbm-pill,.wbml-pill).warn{color:var(--wb-warn);border-color:color-mix(in oklab,var(--wb-warn) 35%,transparent);background:color-mix(in oklab,var(--wb-warn) 10%,transparent)}",
      ".wb-root :is(.wbc-pill,.wbv-pill,.wba-pill,.wbct-pill,.wbca-pill,.wbm-pill,.wbml-pill):is(.error,.bad){color:var(--wb-danger);border-color:color-mix(in oklab,var(--wb-danger) 35%,transparent);background:color-mix(in oklab,var(--wb-danger) 10%,transparent)}",
      ".wb-root :is(.wbc-notice,.wbv-notice,.wba-notice,.wbct-notice,.wbca-notice,.wbm-notice,.wbml-notice){padding:10px 12px;border:1px solid color-mix(in oklab,var(--wb-accent) 24%,var(--wb-border));border-left:3px solid var(--wb-accent);border-radius:8px;background:color-mix(in oklab,var(--wb-accent) 6%,var(--wb-card));color:inherit;font-size:12.5px;line-height:1.55}",
      ".wb-root :is(.wbc-notice,.wbv-notice,.wba-notice,.wbct-notice,.wbca-notice,.wbm-notice,.wbml-notice).error{border-color:color-mix(in oklab,var(--wb-danger) 30%,var(--wb-border));border-left-color:var(--wb-danger);background:color-mix(in oklab,var(--wb-danger) 7%,var(--wb-card))}",
      ".wb-root :is(.wbc-notice,.wbv-notice,.wba-notice,.wbct-notice,.wbca-notice,.wbm-notice,.wbml-notice).ok{border-color:color-mix(in oklab,var(--wb-ok) 30%,var(--wb-border));border-left-color:var(--wb-ok);background:color-mix(in oklab,var(--wb-ok) 7%,var(--wb-card))}",
      ".wb-root :is(.wbc-empty,.wbv-empty,.wba-empty,.wbct-empty,.wbca-empty,.wbm-empty,.wbml-empty){padding:42px 20px;border:1px dashed var(--wb-border);border-radius:var(--wb-radius-card);background:color-mix(in oklab,currentColor 2%,transparent);color:var(--wb-muted);font-size:12.5px;line-height:1.6}",
      ".wb-root :is(.wbc-json,.wbv-code,.wba-json,.wbct-json,.wbca-json,.wbm-json,.wbml-json){margin:0;padding:12px;border:1px solid var(--wb-border);border-radius:10px;background:color-mix(in oklab,currentColor 4%,transparent);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.6;max-height:260px;overflow:auto}",
      ".wb-root :is(.wbc-table-wrap,.wba-table-wrap,.wbct-table-wrap,.wbca-table-wrap,.wbm-table-wrap,.wbml-table-wrap){overflow:auto;border:1px solid var(--wb-border);border-radius:var(--wb-radius-card);background:var(--wb-card)}",
      ".wb-root :is(.wbc-table-wrap,.wba-table-wrap,.wbct-table-wrap,.wbca-table-wrap,.wbm-table-wrap,.wbml-table-wrap) :is(.wbc-table,.wba-table,.wbct-table,.wbca-table,.wbm-table,.wbml-table){border:0}",
      ".wb-root .wba-pills{display:flex;flex-wrap:wrap;gap:6px}",
      ".wb-root .wba-list{display:flex;flex-direction:column;gap:8px}",
      ".wb-root .wba-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".wb-root .wba-kv{display:grid;grid-template-columns:minmax(96px,auto) minmax(0,1fr);gap:6px 12px;font-size:12px}",
      ".wb-root .wba-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}",
      ".wb-root .wba-card-num{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}",
      ".wb-root .wbct-list{display:flex;flex-direction:column;gap:8px}",
      ".wb-root .wb-home-icon svg{display:block}",
      ".wb-root :is(.wba-panel,.wbca-panel,.wbm-panel,.wbml-panel,.wbc-panel){margin-top:4px;padding:18px;border:1px solid color-mix(in oklab,var(--wb-accent) 28%,var(--wb-border));border-radius:var(--wb-radius-card);background:var(--wb-card);box-shadow:0 10px 36px color-mix(in oklab,#000 8%,transparent)}",
      ".wb-root :is(.wba-panel,.wbca-panel,.wbm-panel,.wbml-panel,.wbc-panel) > h3{font-size:15px;font-weight:650;margin:0 0 12px}",
      ".wb-root :is(.wba-code,.wbca-code,.wbm-code,.wbml-code,.wbc-code){font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.65;resize:vertical;min-height:90px}",
      ".wb-root :is(.wba-input,.wbca-input,.wbm-input,.wbml-input,.wbc-input){min-height:34px}",
      ".wb-root .wbct-panel{margin-top:2px;border-color:color-mix(in oklab,var(--wb-accent) 30%,var(--wb-border))}",
      ".wb-root .wbct-pills{display:flex;flex-wrap:wrap;gap:8px 16px;padding:4px 0}",
      ".wb-root .wbct-check{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;cursor:pointer}",
      ".wb-root .wbct-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.6;resize:vertical}",
      ".wb-root .wbm-list-row{transition:background .12s ease}.wb-root .wbm-list-row:hover{background:color-mix(in oklab,var(--wb-accent) 5%,transparent)}",
      ".wb-root .wbm-body{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;font-size:13px;line-height:1.75;margin:10px 0 0;max-height:60vh;overflow:auto}",
      ".wb-root .wbv-notice{color:inherit}.wb-root .wbv-pill{background:color-mix(in oklab,currentColor 5%,transparent);color:inherit}",
      ".wb-root .wbv-pill.ok{background:color-mix(in oklab,var(--wb-ok) 10%,transparent);color:var(--wb-ok)}",
      ".wb-root .wbv-pill.warn{background:color-mix(in oklab,var(--wb-warn) 10%,transparent);color:var(--wb-warn)}",
      ".wb-root .wbv-pill.bad{background:color-mix(in oklab,var(--wb-danger) 10%,transparent);color:var(--wb-danger)}",
      ".wb-root .wbc-wrap>.wbc-head,.wb-root .wba-wrap>.wba-head,.wb-root .wbct-wrap>.wbct-head,.wb-root .wbca-wrap>.wbca-head,.wb-root .wbm-page>.wbm-head{margin-bottom:0}",
      ".wb-root :is(.wbc-row,.wba-row,.wbct-row,.wbca-row,.wbm-row,.wbml-row){gap:8px}",
      // 首页与导航视觉
      ".wb-root .wb-inner{gap:18px;max-width:1120px}",
      ".wb-root .wb-hero{padding:6px 2px 2px;align-items:center}",
      ".wb-root .wb-hero h2{font-size:24px;font-weight:700;letter-spacing:-.02em}",
      ".wb-root .wb-tag{font-size:12.5px;opacity:.58;margin-top:6px}",
      ".wb-root .wb-home-grid{grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:14px}",
      ".wb-root .wb-home-card{position:relative;min-height:142px;padding:18px;border-radius:16px;background:var(--wb-card);box-shadow:0 1px 2px color-mix(in oklab,#000 3%,transparent);transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease}",
      ".wb-root .wb-home-card:hover{transform:translateY(-2px);border-color:color-mix(in oklab,var(--wb-accent) 50%,var(--wb-border));box-shadow:0 10px 28px color-mix(in oklab,#000 10%,transparent)}",
      ".wb-root .wb-home-card .wb-home-icon{background:color-mix(in oklab,var(--wb-accent) 7%,var(--wb-card));border-color:color-mix(in oklab,var(--wb-accent) 12%,var(--wb-border))}",
      ".wb-root .wb-home-icon{width:38px;height:38px;border-radius:11px;background:color-mix(in oklab,var(--wb-accent) 13%,transparent);color:var(--wb-accent);font-size:16px;font-weight:700;box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--wb-accent) 16%,transparent)}",
      ".wb-root .wb-home-title{font-size:15px;font-weight:660;margin-top:8px}",
      ".wb-root .wb-home-desc{font-size:12px;line-height:1.55;opacity:.62;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;min-height:56px}",
      ".wb-root .wb-home-card .wb-badge{background:color-mix(in oklab,currentColor 5%,transparent);border:1px solid color-mix(in oklab,currentColor 8%,transparent);opacity:.72;font-variant-numeric:tabular-nums}",
      ".wb-root .wb-immersive-bar{background:color-mix(in oklab,var(--wb-card) 86%,transparent);backdrop-filter:saturate(1.15) blur(14px);box-shadow:0 1px 0 var(--wb-line)}",
      ".wb-root .wb-page-tabs{gap:2px;padding:2px 0}",
      ".wb-root .wb-tab{border-radius:8px 8px 0 0;padding:9px 13px;font-weight:500}",
      ".wb-root .wb-tab.on{background:color-mix(in oklab,var(--wb-accent) 7%,transparent)}",
      // 邮件三栏：账户栏 / 列表 / 阅读
      ".wb-root .wbm-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:14px;align-items:start;min-height:420px}",
      ".wb-root .wbm-layout.has-detail{grid-template-columns:210px minmax(260px,.9fr) minmax(0,1.1fr)}",
      ".wb-root .wbm-rail{display:flex;flex-direction:column;gap:10px;min-width:0}",
      ".wb-root .wbm-rail-card{display:flex;flex-direction:column;gap:10px;padding:14px}",
      ".wb-root .wbm-rail-title{font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--wb-muted)}",
      ".wb-root .wbm-rail-stats{display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px;color:var(--wb-muted)}",
      ".wb-root .wbm-rail-stats b{font-size:15px;color:inherit;font-variant-numeric:tabular-nums;margin-right:2px}",
      ".wb-root .wbm-rail-tip{font-size:11.5px;line-height:1.55;color:var(--wb-muted);opacity:.8;padding:0 4px}",
      ".wb-root .wbm-pane{border:1px solid var(--wb-border);border-radius:var(--wb-radius-card);background:var(--wb-card);min-width:0;overflow:hidden;display:flex;flex-direction:column;max-height:calc(100vh - 250px)}",
      ".wb-root .wbm-pane-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 14px;border-bottom:1px solid var(--wb-border);font-size:12px;background:color-mix(in oklab,currentColor 2%,transparent)}",
      ".wb-root .wbm-list{display:flex;flex-direction:column;overflow:auto;min-height:0}",
      ".wb-root .wbm-list-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:start;text-align:left;border:0;border-bottom:1px solid color-mix(in oklab,var(--wb-border) 65%,transparent);background:transparent;color:inherit;font:inherit;padding:11px 14px;cursor:pointer;transition:background .12s ease}",
      ".wb-root .wbm-list-row:last-child{border-bottom:0}",
      ".wb-root .wbm-list-row:hover{background:color-mix(in oklab,var(--wb-accent) 5%,transparent)}",
      ".wb-root .wbm-list-row.on{background:color-mix(in oklab,var(--wb-accent) 9%,transparent);box-shadow:inset 3px 0 0 var(--wb-accent)}",
      ".wb-root .wbm-list-row .wbm-dot{width:7px;height:7px;border-radius:50%;margin-top:6px;background:color-mix(in oklab,currentColor 22%,transparent)}",
      ".wb-root .wbm-list-row.unread .wbm-dot{background:var(--wb-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--wb-accent) 15%,transparent)}",
      ".wb-root .wbm-list-row.unread .wbm-subject{font-weight:700}",
      ".wb-root .wbm-subject{display:block;font-size:12.5px;font-weight:560;line-height:1.45;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".wb-root .wbm-snippet{display:block;font-size:11.5px;line-height:1.5;color:var(--wb-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px}",
      ".wb-root .wbm-list-row .wbm-time{font-size:11px;white-space:nowrap;color:var(--wb-muted);padding-top:2px}",
      ".wb-root .wbm-detailpane{overflow:auto}",
      ".wb-root .wbm-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--wb-border);background:color-mix(in oklab,currentColor 2%,transparent)}",
      ".wb-root .wbm-detail-title{display:flex;flex-direction:column;gap:4px;min-width:0}",
      ".wb-root .wbm-detail-title strong{font-size:15px;line-height:1.4;overflow-wrap:anywhere}",
      ".wb-root .wbm-detail-meta{display:flex;gap:16px;flex-wrap:wrap;padding:10px 16px;font-size:11.5px;color:var(--wb-muted);border-bottom:1px solid color-mix(in oklab,var(--wb-border) 65%,transparent)}",
      ".wb-root .wbm-detailpane .wbm-body{padding:0 16px 18px;margin:0}",
      "@media (max-width:980px){.wb-root .wbm-layout,.wbml-layout,.wb-root .wbm-layout.has-detail{grid-template-columns:180px minmax(0,1fr)}.wb-root .wbm-layout.has-detail .wbm-detailpane{grid-column:1/-1;max-height:none}}",
      "@media (max-width:760px){.wb-root :is(.wbc-wrap,.wbv,.wba-wrap,.wbct-wrap,.wbca-wrap,.wbm-wrap,.wbml-wrap,.wbm-page,.wbml-page){padding:2px 0 18px;gap:12px}.wb-root .wb-hero h2{font-size:20px}.wb-root .wb-home-card{min-height:0;padding:16px}.wb-root :is(.wbc-card,.wbv-card,.wba-card,.wbct-card,.wbca-card,.wbm-card,.wbml-card,.wbct-panel){padding:14px;border-radius:12px}.wb-root .wbm-layout,.wbml-layout,.wb-root .wbm-layout.has-detail{grid-template-columns:1fr}.wb-root .wbm-pane{max-height:none}.wb-root .wbm-rail{order:2}}",
      // 全宽模块页：去掉两侧留白，并把视图标签并入唯一的一层顶栏。
      ".wb-root .wb-inner{max-width:none}",
      ".wb-root .wb-immersive-main{padding:16px 22px 24px}",
      ".wb-root .wb-immersive-main>.wb-inner{max-width:none;width:100%;padding:0}",
      ".wb-root .wb-immersive-bar{padding:calc(8px + var(--dsh-frame-top-clearance,0px)) 18px 8px;background:var(--wb-card);box-shadow:none;border-bottom:1px solid var(--wb-line);-webkit-app-region:no-drag}",
      ".wb-root .wb-immersive-bar .wb-page-tabs{border-bottom:0;margin:0 0 0 auto;padding:0;flex-wrap:nowrap;overflow-x:auto;max-width:min(72vw,980px);scrollbar-width:none}",
      ".wb-root .wb-immersive-bar .wb-page-tabs::-webkit-scrollbar{display:none}",
      ".wb-root .wb-immersive-bar .wb-tab{padding:6px 10px;white-space:nowrap}",
      "@media (max-width:760px){.wb-root .wb-immersive-bar{flex-wrap:nowrap;padding:calc(6px + var(--dsh-frame-top-clearance,0px)) 12px 6px}.wb-root .wb-immersive-bar .wb-page-tabs{max-width:none}.wb-root .wb-immersive-title{display:none}}",
      "html[data-platform=darwin] .wb-root .wb-immersive-bar{padding-top:8px;padding-left:max(88px,calc(12px + var(--dsh-frame-leading-clearance,0px)))}",
      // 顶栏分左右两区：左区标题+版本，右区标签，两区贴边。
      ".wb-root .wb-immersive-bar{justify-content:space-between;gap:16px}",
      ".wb-root .wb-immersive-left{display:flex;align-items:center;gap:10px;min-width:0;flex:0 1 auto}",
      ".wb-root .wb-immersive-bar .wb-grow{display:none}",
      ".wb-root .wb-immersive-bar .wb-immersive-left .wb-back{margin-right:0}",
      ".wb-root .wb-immersive-icon{display:none}",
      "html[data-platform=darwin] .wb-root .wb-immersive-bar{position:relative}",
      "html[data-platform=darwin] .wb-root .wb-immersive-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9px;background:var(--wb-card);border:1px solid var(--wb-border);color:var(--wb-accent);z-index:1}",
      "html[data-platform=darwin] .wb-root .wb-immersive-icon svg{width:17px;height:17px}",
      ".wb-root .wb-immersive-bar .wb-immersive-title{flex:0 0 auto;min-width:0}",
      ".wb-root .wb-immersive-bar .wb-immersive-title>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".wb-root .wb-immersive-bar .wb-page-tabs{margin:0;flex:0 1 auto;min-width:0;max-width:none;justify-content:flex-start;gap:4px}",
      ".wb-root .wb-immersive-bar .wb-tab{flex:0 0 auto;min-width:0;justify-content:center;text-align:center;padding:6px 10px}",
      // 窄屏收口：上面这些 .wb-root 前缀的规则优先级高于文件开头的 @media，必须放到最后覆盖，
      // 否则窄屏仍在用桌面内边距。窄屏两侧留白直接从 22px 降到 10px，插件页容器不再自带左右边距。
      "@media (max-width:760px){.wb-root .wb-immersive-main{padding:10px 10px 16px}.wb-root .wb-immersive-bar{padding:calc(8px + var(--dsh-frame-top-clearance,0px)) 12px 8px}.wb-back{padding:0;width:30px;height:30px;justify-content:center;gap:0;flex:0 0 auto}.wb-root :is(.wbc-wrap,.wbv,.wba-wrap,.wbct-wrap,.wbca-wrap,.wbm-wrap,.wbml-wrap,.wbm-page,.wbml-page){padding:0 0 16px}.wb-root .wb-inner{gap:12px}.wb-root .wb-immersive-main>.wb-inner{gap:12px}}",
      "@media (max-width:420px){.wb-root .wb-immersive-main{padding:8px 8px 12px}.wb-root .wb-immersive-bar{padding:calc(6px + var(--dsh-frame-top-clearance,0px)) 10px 6px}}",
      // 触屏设备（手机 / 平板 / App 内置 WebView）不一定按 390 这类窄宽度上报视口，
      // 有的会把页面按 ~980px 布局再缩小，媒体查询就落在桌面档。用 pointer:coarse 兜一层：
      // 只要没有精确指针，就按窄屏的留白处理，避免手机上又出现桌面端 24px 的两侧留白。
      "@media (pointer:coarse){.wb-root .wb-immersive-main{padding:10px 10px 16px}.wb-root .wb-immersive-bar{padding:calc(8px + var(--dsh-frame-top-clearance,0px)) 12px 8px}.wb-root :is(.wbc-wrap,.wbv,.wba-wrap,.wbct-wrap,.wbca-wrap,.wbm-wrap,.wbml-wrap,.wbm-page,.wbml-page){padding:0 0 16px}.wb-root .wb-inner{gap:12px}.wb-root input[type=checkbox],.wb-root input[type=radio]{width:16px;height:16px}}",
      "@media (pointer:coarse) and (max-width:520px){.wb-root .wb-immersive-main{padding:8px 8px 12px}.wb-root .wb-inner{gap:10px}}",
      // 宿主「配置」页：分组卡片 + 每项一行（说明在左、控件在右），窄屏自动换行。
      ".wb-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}",
      ".wb-card-head h3{margin:0;font-size:13px;font-weight:650}",
      ".wbh-config-row{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:10px 0;border-top:1px solid var(--wb-line)}",
      ".wbh-config-row:first-of-type{border-top:0}",
      ".wbh-config-text{min-width:200px;flex:1 1 240px}",
      ".wbh-config-label{font-size:13px;line-height:1.5}",
      ".wbh-config-ctl{display:flex;align-items:center;gap:10px;margin-left:auto;flex-wrap:wrap}",
      ".wb-link{border:0;background:transparent;color:var(--wb-accent,var(--dsw-alias-brand-primary,#11a89b));font:inherit;font-size:12px;cursor:pointer;padding:2px 4px;border-radius:6px}",
      ".wb-link:hover{text-decoration:underline}",
      ".wb-link:disabled{opacity:.5;cursor:not-allowed;text-decoration:none}",
      // 同步进度：顶栏胶囊里的细进度条 + 账号页的步骤列表。
      ".wb-cloud-bar{display:block;width:46px;height:3px;border-radius:999px;background:color-mix(in oklab,currentColor 22%,transparent);overflow:hidden}",
      ".wb-cloud-bar>span{display:block;height:100%;background:var(--dsw-alias-brand-primary,#11a89b);transition:width .2s ease}",
      ".wb-sync-progress{margin-top:10px;padding-top:10px;border-top:1px solid var(--wb-line)}",
      ".wb-sync-progress-head{display:flex;align-items:center;gap:10px;font-size:12px;flex-wrap:wrap}",
      ".wb-sync-progress-head b{font-weight:600}",
      ".wb-sync-count{margin-left:auto;opacity:.72}",
      ".wb-sync-bar{margin-top:6px;height:5px;border-radius:999px;background:color-mix(in oklab,currentColor 14%,transparent);overflow:hidden}",
      ".wb-sync-bar>span{display:block;height:100%;background:var(--dsw-alias-brand-primary,#11a89b);transition:width .2s ease}",
      ".wb-sync-tables{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:4px;font-size:12px}",
      ".wb-sync-tables li{display:flex;align-items:center;gap:8px;flex-wrap:wrap;line-height:1.5}",
      ".wb-sync-tables li.fail{color:var(--wb-danger,inherit)}",
      ".wb-sync-table-name{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}",
      ".wb-sync-table-state{margin-left:auto;opacity:.8;overflow-wrap:anywhere}",
      ".wb-inner.wb-queue{max-width:none;gap:14px}",
      ".wbq{display:flex;flex-direction:column;gap:14px;padding:4px 0 24px;box-sizing:border-box;min-width:0}",
      ".wbq-hero{display:flex;flex-direction:column;gap:14px;padding:14px 16px;border:1px solid var(--wb-line);border-radius:14px;background:var(--wb-card);backdrop-filter:blur(14px) saturate(1.1);min-width:0}",
      ".wbq-hero-top{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:space-between}",
      ".wbq-health{display:flex;align-items:center;gap:10px;min-width:0}",
      ".wbq-health-text{display:flex;flex-direction:column;gap:2px;font-size:13px;min-width:0}",
      ".wbq-dot{flex:none;width:10px;height:10px;border-radius:50%;background:var(--wb-muted);box-shadow:0 0 0 4px color-mix(in oklab,var(--wb-muted) 18%,transparent)}",
      ".wbq-dot.h-idle{background:var(--wb-ok);box-shadow:0 0 0 4px color-mix(in oklab,var(--wb-ok) 18%,transparent)}",
      ".wbq-dot.h-busy{background:var(--wb-warn);box-shadow:0 0 0 4px color-mix(in oklab,var(--wb-warn) 18%,transparent)}",
      ".wbq-dot.h-dead{background:var(--wb-danger);box-shadow:0 0 0 4px color-mix(in oklab,var(--wb-danger) 20%,transparent)}",
      ".wbq-hero-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}",
      ".wbq-hero-actions .wb-btn{padding:5px 12px;font-size:12px}",
      ".wbq-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:10px}",
      ".wbq-metric{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border:1px solid var(--wb-line);border-radius:10px;background:color-mix(in oklab,currentColor 2.5%,transparent);min-width:0}",
      ".wbq-metric-label{font-size:11.5px;color:var(--wb-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".wbq-metric-value{font-size:21px;line-height:1.25;font-variant-numeric:tabular-nums;font-weight:650}",
      ".wbq-metric.t-ok .wbq-metric-value{color:var(--wb-ok)}",
      ".wbq-metric.t-warn .wbq-metric-value{color:var(--wb-warn)}",
      ".wbq-metric.t-danger .wbq-metric-value{color:var(--wb-danger)}",
      ".wbq-insight{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px}",
      ".wbq-panel{display:flex;flex-direction:column;gap:10px;padding:12px 14px;border:1px solid var(--wb-line);border-radius:12px;background:var(--wb-card);backdrop-filter:blur(14px) saturate(1.1);min-width:0}",
      ".wbq-panel-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:12.5px}",
      ".wbq-bars{display:flex;flex-direction:column;gap:8px}",
      ".wbq-bar-row{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(50px,1.6fr) 34px;align-items:center;gap:10px}",
      ".wbq-bar-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px;color:var(--wb-muted)}",
      ".wbq-bar-track{display:block;height:6px;border-radius:999px;background:color-mix(in oklab,var(--wb-accent) 12%,var(--wb-line));overflow:hidden}",
      ".wbq-bar-fill{display:block;height:100%;border-radius:999px;background:var(--wb-accent);transition:width .3s ease}",
      ".wbq-bar-count{text-align:right;font-size:11.5px;font-variant-numeric:tabular-nums}",
      ".wbq-bar-total{font-size:11px;color:var(--wb-muted);text-align:right}",
      ".wbq-recent{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}",
      ".wbq-recent-item{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:10px}",
      ".wbq-recent-type{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px}",
      ".wbq-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:space-between;min-width:0}",
      ".wbq-tabs{display:inline-flex;flex:0 0 auto;gap:2px;padding:3px;border:1px solid var(--wb-line);border-radius:10px;background:var(--wb-card);backdrop-filter:blur(14px)}",
      ".wbq-tab{appearance:none;border:0;background:transparent;color:var(--wb-muted);font:inherit;font-size:12.5px;padding:5px 12px;border-radius:8px;cursor:pointer;transition:background .12s ease,color .12s ease}",
      ".wbq-tab:hover{color:inherit;background:color-mix(in oklab,currentColor 5%,transparent)}",
      ".wbq-tab.on{background:color-mix(in oklab,var(--wb-accent) 14%,var(--wb-card));color:var(--wb-accent);font-weight:600}",
      ".wbq-filters{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;flex:1 1 auto;min-width:0}",
      ".wbq-filter{appearance:none;border:1px solid var(--wb-line);background:var(--wb-card);color:var(--wb-muted);font:inherit;font-size:11.5px;padding:4px 10px;border-radius:999px;cursor:pointer;transition:border-color .12s ease,color .12s ease,background .12s ease}",
      ".wbq-filter:hover{color:inherit}",
      ".wbq-filter.on{color:inherit;border-color:color-mix(in oklab,var(--wb-accent) 45%,var(--wb-line));background:color-mix(in oklab,var(--wb-accent) 10%,var(--wb-card));font-weight:600}",
      ".wbq-filter.s-dead.on,.wbq-badge.s-dead{color:var(--wb-danger)}",
      ".wbq-filter.s-pending.on,.wbq-filter.s-running.on,.wbq-badge.s-pending,.wbq-badge.s-running{color:var(--wb-warn)}",
      ".wbq-filter.s-done.on,.wbq-badge.s-done{color:var(--wb-ok)}",
      ".wbq-filter.s-queued.on,.wbq-badge.s-queued{color:var(--wb-accent)}",
      ".wbq-badge{display:inline-flex;align-items:center;gap:6px;padding:1px 9px;border-radius:999px;border:1px solid currentColor;font-size:11px;line-height:1.7;white-space:nowrap;background:color-mix(in oklab,currentColor 6%,transparent)}",
      ".wbq-badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}",
      ".wbq-mode{display:inline-flex;align-items:center;padding:0 8px;border-radius:999px;border:1px solid var(--wb-line);font-size:10.5px;line-height:1.7;color:var(--wb-muted);white-space:nowrap}",
      ".wbq-mode.m-targeted{color:var(--wb-accent);border-color:color-mix(in oklab,var(--wb-accent) 45%,var(--wb-line));background:color-mix(in oklab,var(--wb-accent) 8%,transparent)}",
      ".wbq-mode-filters{flex:0 0 auto;justify-content:flex-start}",
      ".wbq-table-wrap{overflow:auto;max-height:62vh;border:1px solid var(--wb-line);border-radius:12px;background:var(--wb-card);backdrop-filter:blur(14px) saturate(1.1);min-width:0}",
      ".wbq-table{width:100%;border-collapse:separate;border-spacing:0;font-size:12.5px}",
      ".wbq-table thead th{position:sticky;top:0;z-index:1;text-align:left;font-size:11px;font-weight:600;letter-spacing:.03em;color:var(--wb-muted);padding:9px 10px;border-bottom:1px solid var(--wb-line);white-space:nowrap;background:color-mix(in oklab,var(--wb-card) 82%,var(--wb-surface,#0e1116));backdrop-filter:blur(4px)}",
      ".wbq-table tbody td{padding:8px 10px;border-bottom:1px solid color-mix(in oklab,var(--wb-line) 65%,transparent);vertical-align:middle;overflow-wrap:anywhere}",
      ".wbq-table tbody tr:last-child td{border-bottom:0}",
      ".wbq-table tbody tr:nth-child(even) td{background:color-mix(in oklab,currentColor 1.8%,transparent)}",
      ".wbq-table tbody tr:hover td{background:color-mix(in oklab,var(--wb-accent) 6%,transparent)}",
      ".wbq-table tbody tr.is-dead td{background:color-mix(in oklab,var(--wb-danger) 5%,transparent)}",
      ".wbq-table tbody tr.is-dead td:first-child{box-shadow:inset 3px 0 0 var(--wb-danger)}",
      ".wbq-table code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}",
      ".wbq-cell-strong{font-weight:600}",
      ".wbq-table tbody td:first-child code{font-size:12px;color:color-mix(in oklab,currentColor 88%,transparent)}",
      ".wbq-cell-time{color:var(--wb-muted);white-space:nowrap;font-variant-numeric:tabular-nums}",
      ".wbq-cell-num{text-align:right;font-variant-numeric:tabular-nums;color:var(--wb-muted)}",
      ".wbq-cell-action{text-align:right;white-space:nowrap}",
      ".wbq-replay{padding:2px 10px;font-size:11.5px}",
      ".wbq-payload{max-width:520px}",
      ".wbq-payload code{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--wb-muted)}",
      ".wbq-err{max-width:320px;font-size:11.5px;color:var(--wb-muted)}",
      ".wbq-domains{display:flex;flex-direction:column;gap:10px}",
      ".wbq-domain{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:1px solid var(--wb-line);border-radius:12px;background:var(--wb-card);backdrop-filter:blur(14px) saturate(1.1)}",
      ".wbq-domain.has-error{border-color:color-mix(in oklab,var(--wb-danger) 40%,var(--wb-line))}",
      ".wbq-domain-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
      ".wbq-domain-title{font-size:13px}",
      ".wbq-domain-id{font-size:11px;color:var(--wb-muted)}",
      ".wbq-domain-row{display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap}",
      ".wbq-domain-label{flex:none;width:44px;font-size:11.5px;font-weight:600;color:var(--wb-muted);padding-top:3px}",
      ".wbq-chips{display:flex;flex-wrap:wrap;gap:6px}",
      ".wbq-chip{display:inline-flex;align-items:center;gap:8px;padding:3px 10px;border-radius:999px;border:1px solid var(--wb-line);background:color-mix(in oklab,currentColor 3%,transparent);font-size:11.5px}",
      ".wbq-chip.off{opacity:.62;border-style:dashed}",
      ".wbq-chip-meta{font-style:normal;font-size:11px;color:var(--wb-muted)}",
      ".wbq-loading{display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid var(--wb-line);border-radius:12px;background:var(--wb-card);backdrop-filter:blur(14px)}",
      ".wbq-loading-row{display:flex;gap:12px}",
      ".wbq-loading-bar{flex:1;height:14px;border-radius:6px;background:linear-gradient(90deg,color-mix(in oklab,currentColor 4%,transparent),color-mix(in oklab,currentColor 9%,transparent),color-mix(in oklab,currentColor 4%,transparent));background-size:200% 100%;animation:wbq-shimmer 1.4s ease-in-out infinite}",
      "@keyframes wbq-shimmer{0%{background-position:180% 0}100%{background-position:-80% 0}}",
      ".wbq-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:36px 18px;border:1px dashed var(--wb-line);border-radius:12px;text-align:center;color:var(--wb-muted);font-size:12.5px;background:var(--wb-card);backdrop-filter:blur(14px)}",
      ".wbq-empty b{font-size:13px;color:inherit}",
      ".wbq-empty-mark{width:26px;height:26px;border-radius:50%;border:1px dashed color-mix(in oklab,currentColor 40%,transparent)}",
      ".wbq-empty-hint{font-size:11.5px;opacity:.85}",
      ".wbq-hint{color:var(--wb-muted);font-size:11.5px}",
      ".wbq-note{padding:8px 12px;border-radius:8px;border:1px solid color-mix(in oklab,var(--wb-accent) 26%,var(--wb-line));background:color-mix(in oklab,var(--wb-accent) 6%,var(--wb-card));font-size:12.5px}",
      ".wbq-note.err{border-color:color-mix(in oklab,var(--wb-danger) 30%,var(--wb-line));background:color-mix(in oklab,var(--wb-danger) 7%,var(--wb-card));color:var(--wb-danger)}",
      ".wbq-pager{display:flex;align-items:center;gap:10px;font-size:12px}",
      ".wbq-pager .wb-btn{padding:4px 10px;font-size:12px}",
      ".wbq-muted{color:var(--wb-muted);font-size:12px}",
      ".wbq-updated{font-size:11.5px;color:var(--wb-muted);font-variant-numeric:tabular-nums;white-space:nowrap}",
      ".wbh-cfg-schemes{--cfg-line:var(--wb-line);--cfg-surface:var(--wb-surface);--cfg-muted:var(--wb-muted);--cfg-hover:var(--wb-card)}",
      ".wbh-modules{display:flex;flex-wrap:wrap;gap:8px;border:1px solid var(--wb-line);min-width:0}.wbh-modules label{display:inline-flex;align-items:center;gap:4px}",
      ".wb-toast{position:sticky;bottom:12px;align-self:center;padding:7px 14px;border-radius:999px;border:1px solid var(--wb-line);background:var(--wb-surface);font-size:12px;box-shadow:0 6px 18px rgba(0,0,0,.12)}"
    ].join("\n");
    var AUTO_CSS = require_styles2();
    module2.exports = CSS2 + "\n" + schemeStyles + "\n" + SW.styles.join("\n") + "\n" + NF.styles.join("\n") + "\n" + AUTO_CSS;
  }
});

// packages/shell/client/panellist-icon.cjs
var require_panellist_icon = __commonJS({
  "packages/shell/client/panellist-icon.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function PanellistIcon(h2) {
      return function Icon2(props) {
        var size = props && props.size || 20;
        return h2(
          "svg",
          { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.5, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
          h2("rect", { x: 3, y: 3, width: 7, height: 9, rx: 1 }),
          h2("rect", { x: 14, y: 3, width: 7, height: 5, rx: 1 }),
          h2("rect", { x: 14, y: 12, width: 7, height: 9, rx: 1 }),
          h2("rect", { x: 3, y: 16, width: 7, height: 5, rx: 1 })
        );
      };
    };
  }
});

// packages/shell/client/addon-nav.cjs
var require_addon_nav = __commonJS({
  "packages/shell/client/addon-nav.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function createAddonNav() {
      var hook = null;
      var layout = null;
      var pending = null;
      return {
        setLayout: function(api) {
          layout = api && typeof api.selectPanel === "function" ? api : null;
        },
        // 返回注销函数：页面卸载时钩子必须清掉，否则会往已卸载的 state 里写路由。
        setHook: function(fn) {
          hook = typeof fn === "function" ? fn : null;
          return function() {
            if (hook === fn) hook = null;
          };
        },
        // 取出待办（取完即清）；没有就返回 null。
        takePending: function() {
          var want = pending;
          pending = null;
          return want;
        },
        /// 返回是否真的跳了。addonId 必填，viewId 为空时落到插件首页视图。
        /// params 是视图参数（如 {messageId}），面板未挂载时一并暂存。
        navigate: function(panelId, addonId, viewId, params) {
          if (!addonId) return false;
          var id = String(addonId);
          var vid = viewId ? String(viewId) : "";
          var extra = params && typeof params === "object" ? params : null;
          if (hook && hook(id, vid, extra) !== false) return true;
          pending = { addonId: id, viewId: vid, params: extra };
          if (layout) {
            try {
              layout.selectPanel(panelId);
              return true;
            } catch (e) {
            }
          }
          pending = null;
          return false;
        }
      };
    };
  }
});

// packages/addons/lib/client-common.cjs
var require_client_common = __commonJS({
  "packages/addons/lib/client-common.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function createCommon(prefix) {
      var p = String(prefix || "wb");
      function unwrap(r) {
        if (r && r.ok === false) {
          var error = new Error(r.error || r.message || "\u64CD\u4F5C\u5931\u8D25");
          if (r.code !== void 0) error.code = r.code;
          error.payload = r;
          throw error;
        }
        return r && r.result !== void 0 ? r.result : r;
      }
      function call(api, action, args) {
        return Promise.resolve(api.call(action, args || {})).then(unwrap);
      }
      function errText(e) {
        if (!e) return "\u64CD\u4F5C\u5931\u8D25";
        if (typeof e === "string") return e;
        return e.message || e.error || String(e);
      }
      function fmtTime(ts, lang) {
        if (!ts) return "\u2014";
        try {
          return new Date(ts).toLocaleString(lang === "en" ? "en-US" : "zh-CN", { hour12: false });
        } catch (e) {
          return String(ts);
        }
      }
      function Btn(props) {
        var h2 = props.h;
        return h2(
          "button",
          {
            type: props.type || "button",
            className: p + "-btn" + (props.kind ? " " + props.kind : ""),
            disabled: props.disabled,
            onClick: props.onClick,
            title: props.title
          },
          props.children
        );
      }
      function Field(props) {
        var h2 = props.h;
        return h2(
          "label",
          { className: p + "-field" },
          h2("span", { className: p + "-label" }, props.label),
          props.children,
          props.hint ? h2("span", { className: p + "-hint" }, props.hint) : null
        );
      }
      function Notice(props) {
        var h2 = props.h;
        if (!props.text) return null;
        return h2("div", { className: p + "-notice " + (props.kind || "info") }, props.text);
      }
      function Empty(props) {
        var h2 = props.h;
        return h2("div", { className: p + "-empty" }, props.text || "\u6682\u65E0\u6570\u636E");
      }
      function Pill(props) {
        var h2 = props.h;
        return h2("span", { className: p + "-pill " + (props.kind || "") }, props.children);
      }
      function Json(props) {
        var h2 = props.h;
        var text;
        try {
          text = JSON.stringify(props.value, null, 2);
        } catch (e) {
          text = String(props.value);
        }
        return h2("pre", { className: p + "-json" }, text);
      }
      function useLoad(React, api, action, args, deps) {
        var s = React.useState({ loading: true, data: null, error: "" });
        var tick = React.useState(0);
        var refresh = function() {
          tick[1](tick[0] + 1);
        };
        React.useEffect(
          function() {
            var alive = true;
            s[1]({ loading: true, data: null, error: "" });
            call(api, action, args).then(function(data) {
              if (alive) s[1]({ loading: false, data, error: "" });
            }).catch(function(e) {
              if (alive) s[1]({ loading: false, data: null, error: errText(e) });
            });
            return function() {
              alive = false;
            };
          },
          (deps || []).concat([tick[0]])
        );
        return { loading: s[0].loading, data: s[0].data, error: s[0].error, refresh };
      }
      return {
        unwrap,
        call,
        errText,
        fmtTime,
        Switch: require_switch().Switch,
        switchStyles: require_switch().styles,
        NumberField: require_number_field().NumberField,
        numberFieldStyles: require_number_field().styles,
        validateNumber: require_number_field().validateNumber,
        Btn,
        Field,
        Notice,
        Empty,
        Pill,
        Json,
        useLoad
      };
    };
  }
});

// packages/addons/lib/highlight.cjs
var require_highlight = __commonJS({
  "packages/addons/lib/highlight.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function(React) {
      var h2 = React.createElement;
      function sourceOf(keyword) {
        var pattern = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return pattern.replace(/[a-zA-Z]/g, function(letter) {
          return "[" + letter.toLowerCase() + letter.toUpperCase() + "]";
        });
      }
      return function createHighlight(prefix) {
        var className = String(prefix || "wb") + "-hit";
        function hit(rawText, rawKeyword) {
          var text = rawText == null ? "" : String(rawText);
          var keyword = rawKeyword == null ? "" : String(rawKeyword);
          if (!keyword) return text;
          var matcher, match, end = 0, parts = [];
          try {
            matcher = new RegExp(sourceOf(keyword), "g");
          } catch (error) {
            return text;
          }
          while (match = matcher.exec(text)) {
            if (match.index > end) parts.push(text.slice(end, match.index));
            parts.push(h2("mark", { className, key: match.index }, match[0]));
            end = match.index + match[0].length;
            if (!match[0]) matcher.lastIndex += 1;
          }
          if (!parts.length) return text;
          if (end < text.length) parts.push(text.slice(end));
          return parts;
        }
        function Highlight(props) {
          return hit(props.text, props.keyword);
        }
        Highlight.hit = hit;
        return Highlight;
      };
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs
var toKebabCase;
var init_toKebabCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs"() {
    toKebabCase = (string) => string?.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toLucideIconData.mjs
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
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toLucideIconData.mjs"() {
    init_toKebabCase();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs
var toCamelCase;
var init_toCamelCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs"() {
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs
var toPascalCase;
var init_toPascalCase = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs"() {
    init_toCamelCase();
    toPascalCase = (string) => {
      const camelCase = toCamelCase(string);
      return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var mergeClasses;
var init_mergeClasses = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs"() {
    mergeClasses = (...classes) => classes.filter((className, index, array) => {
      return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
    }).join(" ").trim();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/defaultAttributes.mjs
var defaultAttributes;
var init_defaultAttributes = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/defaultAttributes.mjs"() {
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconNode.mjs
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
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconNode.mjs"() {
    init_defaultAttributes();
    init_mergeClasses();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconForReact.mjs
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
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/build/buildLucideIconForReact.mjs"() {
    init_buildLucideIconNode();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs
var hasA11yProp;
var init_hasA11yProp = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs"() {
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/context.mjs
var import_react, LucideContext, useLucideContext;
var init_context = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/context.mjs"() {
    "use strict";
    "use client";
    import_react = require("react");
    LucideContext = (0, import_react.createContext)({});
    useLucideContext = () => (0, import_react.useContext)(LucideContext);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/Icon.mjs
var import_react2, Icon;
var init_Icon = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/Icon.mjs"() {
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

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
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
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/createLucideIcon.mjs"() {
    import_react3 = require("react");
    init_toLucideIconData();
    init_toPascalCase();
    init_Icon();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs
var chevron_right_exports = {};
__export(chevron_right_exports, {
  __iconData: () => __iconData,
  default: () => ChevronRight
});
var __iconData, ChevronRight;
var init_chevron_right = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs"() {
    init_createLucideIcon();
    __iconData = {
      name: "chevron-right",
      size: 24,
      node: [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]
    };
    __iconData.node;
    ChevronRight = createLucideIcon(__iconData);
  }
});

// packages/addons/lib/disclosure-styles.cjs
var require_disclosure_styles = __commonJS({
  "packages/addons/lib/disclosure-styles.cjs"(exports2, module2) {
    "use strict";
    module2.exports = [
      ".wb-disc{min-width:0;border:0;padding:0;margin:0}",
      // 原生 details/summary 保留键盘与无障碍语义，这里只接管观感：去掉默认三角并铺满整行。
      ".wb-disc>summary{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12.5px;font-weight:600;line-height:1.6;color:inherit;user-select:none;list-style:none;padding:2px 8px 2px 2px;margin:-2px -8px -2px -2px;border-radius:7px}",
      ".wb-disc>summary::-webkit-details-marker{display:none}",
      '.wb-disc>summary::marker{content:""}',
      ".wb-disc>summary:hover{background:color-mix(in oklab,currentColor 6%,transparent)}",
      ".wb-disc>summary:focus-visible{outline:2px solid var(--wb-accent,var(--dsw-alias-brand-primary,Highlight));outline-offset:2px}",
      ".wb-disc-chev{flex:0 0 auto;width:14px;height:14px;transition:transform 160ms ease}",
      ".wb-disc[open]>summary .wb-disc-chev{transform:rotate(90deg)}",
      ".wb-disc-title{min-width:0;overflow-wrap:anywhere}",
      ".wb-disc-meta{font-weight:400;font-size:12px;color:var(--wb-muted,var(--dsw-alias-label-tertiary,GrayText))}",
      ".wb-disc-body{margin-top:8px;min-width:0;animation:wb-disc-in 160ms ease}",
      "@keyframes wb-disc-in{from{opacity:0;transform:translateY(-2px)}to{opacity:1;transform:none}}",
      "@media(prefers-reduced-motion:reduce){.wb-disc-chev{transition:none}.wb-disc-body{animation:none}}"
    ].join("\n");
  }
});

// packages/addons/lib/disclosure.cjs
var require_disclosure = __commonJS({
  "packages/addons/lib/disclosure.cjs"(exports2, module2) {
    "use strict";
    var ChevronRight2 = (init_chevron_right(), __toCommonJS(chevron_right_exports)).default;
    function createDisclosure(React) {
      var h2 = React.createElement;
      function Disclosure(props) {
        var attrs = Object.assign({ className: ("wb-disc " + (props.className || "")).trim() }, props.attrs || {});
        if (props.open !== void 0) attrs.open = !!props.open;
        else if (props.defaultOpen !== void 0) attrs.open = !!props.defaultOpen;
        if (props.onToggle) attrs.onToggle = props.onToggle;
        return h2(
          "details",
          attrs,
          h2(
            "summary",
            null,
            h2(ChevronRight2, { className: "wb-disc-chev", "aria-hidden": true, focusable: false }),
            h2("span", { className: "wb-disc-title" }, props.title),
            props.meta != null && props.meta !== "" ? h2("span", { className: "wb-disc-meta" }, props.meta) : null
          ),
          h2("div", { className: "wb-disc-body" }, props.children)
        );
      }
      return { Disclosure, css: require_disclosure_styles() };
    }
    module2.exports = { createDisclosure, css: require_disclosure_styles() };
  }
});

// packages/addons/lib/action-schema-style.cjs
var require_action_schema_style = __commonJS({
  "packages/addons/lib/action-schema-style.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function(PREFIX, DOMAIN) {
      var P = PREFIX + "-as";
      var hairline = "1px solid color-mix(in oklab,currentColor 8%,transparent)";
      var CSS2 = [
        "." + P + "{display:flex;flex-direction:column;gap:12px;width:100%;min-width:0;font-size:13px;color:inherit}",
        "." + P + "-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
        "." + P + "-title{font-size:15px;font-weight:660;margin:0}",
        "." + P + "-badge{display:inline-flex;align-items:center;gap:4px;max-width:100%;border:1px solid var(--wb-border,#e3e5e9);border-radius:999px;padding:1px 8px;font-size:11px;color:var(--dsw-alias-label-secondary,currentColor);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}",
        "." + P + "-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}",
        "." + P + "-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
        "." + P + "-search{position:relative;flex:1 1 220px;min-width:0;display:flex;align-items:center}",
        "." + P + "-search input{width:100%;border:1px solid var(--wb-border,#e3e5e9);border-radius:8px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));color:inherit;font:inherit;padding:6px 10px 6px 30px}",
        "." + P + "-search input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:1px}",
        "." + P + "-search .wbi-svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--dsw-alias-label-tertiary,inherit)}",
        "." + P + " select{border:1px solid var(--wb-border,#e3e5e9);border-radius:8px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));color:inherit;font:inherit;padding:6px 8px;max-width:100%}",
        "." + P + " select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:1px}",
        "." + P + "-list{display:flex;flex-direction:column;gap:8px}",
        "." + P + "-card{border:1px solid var(--wb-border,#e3e5e9);border-radius:10px;padding:10px 12px;background:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));display:flex;flex-direction:column;gap:8px;min-width:0}",
        "." + P + "-cardhead{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:8px}",
        "." + P + "-cardmeta{display:flex;align-items:center;flex-wrap:wrap;gap:8px;min-width:0;min-height:24px}",
        "." + P + "-cardhead code{font-weight:640;overflow-wrap:anywhere;min-width:0}",
        "." + P + "-hintline{margin:0;color:var(--dsw-alias-label-tertiary,inherit);font-size:11.5px;line-height:1.5}",
        "." + P + "-origins{display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end;min-width:0}",
        "." + P + "-origins-label{font-size:11px;color:var(--wb-muted);white-space:nowrap}",
        "." + P + "-origin{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:var(--wb-muted);cursor:pointer;user-select:none}",
        // 该 action 本身不支持的来源：整项置灰、不可点，示意「不是没开，是开不了」。
        "." + P + "-origin-off{opacity:.55;cursor:not-allowed}",
        "." + P + "-origin input[type=checkbox]{width:13px;height:13px;margin:0;accent-color:var(--wb-accent);cursor:inherit}",
        "." + P + "-origin input[type=checkbox]:focus-visible{outline:2px solid var(--wb-accent);outline-offset:2px}",
        "." + P + "-locked{border-color:var(--wb-warn,#b7791f);color:var(--wb-warn,#b7791f)}",
        "." + P + "-desc{margin:0;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55;font-size:12.5px;overflow-wrap:anywhere}",
        // 搜索命中：用品牌色透明度叠加而不是写死浅色，深浅主题都可读；继承文字颜色、不覆盖 ::selection。
        "." + P + " mark." + P + "-hit{background:color-mix(in oklab,var(--dsw-alias-brand-primary,#4f6ef7) 22%,transparent);color:inherit;border-radius:2px;padding:0;font:inherit;box-decoration-break:clone;-webkit-box-decoration-break:clone}",
        "." + P + "-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:auto}",
        "." + P + "-table th{text-align:left;font-weight:620;font-size:11px;letter-spacing:.4px;text-transform:uppercase;color:var(--dsw-alias-label-tertiary,inherit);padding:4px 8px 4px 0;white-space:nowrap}",
        "." + P + "-table td{padding:4px 8px 4px 0;vertical-align:top;border-top:" + hairline + ";line-height:1.5;overflow-wrap:anywhere}",
        "." + P + "-req{color:var(--dsw-alias-state-error-primary,#d9534f);font-weight:620}",
        "." + P + "-opt{color:var(--dsw-alias-label-tertiary,inherit)}",
        "." + P + "-none{color:var(--dsw-alias-label-tertiary,inherit);font-size:12px}",
        "." + P + "-example{position:relative;display:flex;flex-direction:column;gap:4px;min-width:0}",
        "." + P + "-examplehead{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}",
        "." + P + "-pre{margin:0;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);color:inherit;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.5;overflow:auto;max-height:280px;white-space:pre-wrap;word-break:break-word}",
        "." + P + "-copy{border:1px solid var(--wb-border,#e3e5e9);border-radius:7px;background:transparent;color:inherit;font:inherit;font-size:11.5px;padding:2px 8px;cursor:pointer}",
        "." + P + "-copy:hover{background:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent))}",
        "." + P + "-copy:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:2px}",
        // 折叠头观感已收口到共享控件 disclosure-styles.cjs（.wb-disc），这里不再重复定义 details>summary。
        "." + P + "-params{min-width:0}",
        "." + P + "-empty{padding:24px;text-align:center;border:1px dashed var(--wb-border,#e3e5e9);border-radius:10px;color:var(--dsw-alias-label-tertiary,inherit)}",
        "." + P + "-error{padding:12px;border:1px solid var(--dsw-alias-state-error-primary,#d9534f);border-radius:10px;color:var(--dsw-alias-state-error-primary,#d9534f);display:flex;gap:10px;align-items:center;flex-wrap:wrap;overflow-wrap:anywhere}",
        "." + P + "-toast{position:sticky;bottom:8px;align-self:flex-start;border-radius:999px;padding:3px 10px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);font-size:11.5px;max-width:100%}",
        // 窄屏：五列参数表压成一列会丢失列名、且 table 布局按最小内容宽度撑破容器，
        // 这里整体改成块级网格：每行 = 名称 / 类型 / 必填 + 约束行 + 说明行，行间用细线分隔。
        "@media(max-width:760px){." + P + "-toolbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:end}." + P + "-search{grid-column:1/-1}." + P + "-toolbar>label{display:flex;flex-direction:column;align-items:stretch;gap:4px;min-width:0}." + P + "-toolbar select{width:100%;min-width:0}." + P + "-cardhead{grid-template-columns:minmax(0,1fr);row-gap:6px}." + P + "-origins{justify-content:flex-start}." + P + "-table{display:block}." + P + "-table thead{display:none}." + P + "-table tbody{display:block}." + P + '-table tr{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"name type need" "extra extra extra" "desc desc desc";column-gap:8px;padding:9px 0;border-top:' + hairline + "}." + P + "-table tr:first-child{border-top:0;padding-top:2px}." + P + "-table tr:last-child{padding-bottom:2px}." + P + "-table td{display:block;border:0;padding:0;min-width:0}." + P + "-table td:empty{display:none}." + P + "-pname{grid-area:name;font-weight:640}." + P + "-ptype{grid-area:type;justify-self:start;align-self:center;color:var(--dsw-alias-label-tertiary,inherit)}." + P + "-pneed{grid-area:need;justify-self:end;align-self:center;font-size:11px;line-height:1.6;white-space:nowrap}." + P + "-pextra{grid-area:extra;margin-top:3px;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55}." + P + "-pdesc{grid-area:desc;margin-top:3px;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55}}",
        // 中等宽度（521–760px）三个筛选项正好排成一行，避免第三项独占一行显得参差。
        "@media(min-width:521px) and (max-width:760px){." + P + "-toolbar{grid-template-columns:repeat(3,minmax(0,1fr))}}",
        "@media(max-width:420px){." + P + "-toolbar{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}." + P + "-card{padding:10px}." + P + "-table tr{padding:8px 0}}"
      ].join("\n") + "\n" + require_disclosure_styles();
      return function injectCss() {
        if (typeof document === "undefined") return;
        var id = "wb-addon-" + DOMAIN + "-actions-css";
        var old = document.getElementById(id);
        if (old) {
          old.textContent = CSS2;
          return;
        }
        var style = document.createElement("style");
        style.id = id;
        style.setAttribute("data-wb-addon", "wb-addon-" + DOMAIN);
        style.textContent = CSS2;
        document.head.appendChild(style);
      };
    };
  }
});

// packages/addons/lib/action-schema-view.cjs
var require_action_schema_view = __commonJS({
  "packages/addons/lib/action-schema-view.cjs"(exports2, module2) {
    "use strict";
    var React = require("react");
    var createHighlight = require_highlight()(React);
    var Disclosure = require_disclosure().createDisclosure(React).Disclosure;
    var h2 = React.createElement;
    var COPY = {
      zh: {
        title: "Action",
        hint: "\u8FD0\u884C\u65F6\u6CE8\u518C \xB7 \u53EA\u8BFB",
        switchHint: "\u5141\u8BB8\u6765\u6E90\u843D\u672C\u673A\u3001\u5373\u6539\u5373\u751F\u6548\uFF1A\u52FE\u4E0A\u7684\u6765\u6E90\u624D\u80FD\u8C03\u7528\u8BE5 action\uFF0C\u5176\u4F59\u4F1A\u88AB ACTION_ORIGIN_DENIED \u62E6\u4E0B\u3002",
        hostHint: "\u5BBF\u4E3B action \u7684\u5141\u8BB8\u6765\u6E90\uFF1B\u6807\u300C\u6765\u6E90\u56FA\u5B9A\u300D\u7684\u4E0D\u53EF\u4FEE\u6539\u3002",
        originsLabel: "\u5141\u8BB8\u6765\u6E90",
        originUi: "\u754C\u9762",
        originPlugin: "\u63D2\u4EF6",
        originAgent: "agent",
        originSync: "\u540C\u6B65",
        originsSaving: "\u4FDD\u5B58\u4E2D\u2026",
        originsToast: "\u5DF2\u66F4\u65B0\u5141\u8BB8\u6765\u6E90",
        originsFail: "\u66F4\u65B0\u5141\u8BB8\u6765\u6E90\u5931\u8D25",
        originsEmpty: "\u81F3\u5C11\u8981\u4FDD\u7559\u4E00\u4E2A\u6765\u6E90",
        originsUnsupported: "\u8BE5 action \u672C\u8EAB\u4E0D\u652F\u6301\u8FD9\u4E2A\u6765\u6E90",
        originsPinned: "\u6765\u6E90\u56FA\u5B9A",
        originsPinnedHint: "\u8BE5 action \u7684\u5141\u8BB8\u6765\u6E90\u88AB\u56FA\u5B9A\uFF08\u5B89\u5168\u7EA6\u675F\uFF09\uFF0C\u4E0D\u80FD\u4FEE\u6539",
        domain: "\u57DF",
        versionLabel: "\u7248\u672C",
        shell: "\u5BBF\u4E3B",
        count: function(shown, total) {
          return shown + " / " + total + " \u4E2A action";
        },
        search: "\u641C\u7D22\u540D\u79F0\u3001\u63CF\u8FF0\u3001\u53C2\u6570\uFF08\u547D\u4E2D\u5904\u9AD8\u4EAE\uFF09",
        filterReq: "\u5FC5\u586B\u7B5B\u9009",
        all: "\u5168\u90E8",
        onlyRequired: "\u542B\u5FC5\u586B\u9879",
        onlyOptional: "\u65E0\u5FC5\u586B\u9879",
        filterType: "\u53C2\u6570\u7C7B\u578B",
        allTypes: "\u5168\u90E8\u7C7B\u578B",
        filterOrigin: "\u5141\u8BB8\u6765\u6E90",
        allOrigins: "\u5168\u90E8\u6765\u6E90",
        colName: "\u53C2\u6570",
        colType: "\u7C7B\u578B",
        colReq: "\u5FC5\u586B",
        colExtra: "\u9ED8\u8BA4 / \u679A\u4E3E / \u7EA6\u675F",
        colDesc: "\u8BF4\u660E",
        required: "\u5FC5\u586B",
        optional: "\u53EF\u9009",
        noParams: "\u65E0\u53C2\u6570",
        paramCount: function(n) {
          return n + " \u4E2A\u53C2\u6570";
        },
        params: "\u53C2\u6570",
        requiredCount: function(n) {
          return "\u5FC5\u586B " + n;
        },
        examples: "\u793A\u4F8B",
        noExamples: "\u65E0\u793A\u4F8B",
        copy: "\u590D\u5236",
        copied: "\u5DF2\u590D\u5236",
        raw: "\u539F\u59CB JSON Schema",
        loading: "\u8F7D\u5165\u4E2D\u2026",
        loadFail: "\u8BFB\u53D6 action schema \u5931\u8D25",
        retry: "\u91CD\u8BD5",
        empty: "\u6CA1\u6709\u5339\u914D\u7684 action",
        emptyRegistry: "\u8BE5\u57DF\u6CA1\u6709\u6CE8\u518C action",
        envelope: "\u9ED8\u8BA4",
        enumLabel: "\u679A\u4E3E",
        range: "\u8303\u56F4",
        length: "\u957F\u5EA6",
        pattern: "\u6B63\u5219",
        format: "\u683C\u5F0F",
        items: "\u5143\u7D20\u6570"
      },
      en: {
        title: "Actions",
        hint: "runtime registry \xB7 read-only",
        switchHint: "Allowed origins are stored locally and apply immediately: only checked origins may call the action; others get ACTION_ORIGIN_DENIED.",
        hostHint: "Allowed origins for host actions; items marked pinned cannot be changed.",
        originsLabel: "Origins",
        originUi: "UI",
        originPlugin: "Plugin",
        originAgent: "Agent",
        originSync: "Sync",
        originsSaving: "Saving\u2026",
        originsToast: "Allowed origins updated",
        originsFail: "Failed to update allowed origins",
        originsEmpty: "Keep at least one origin",
        originsUnsupported: "This action does not support this origin",
        originsPinned: "Pinned",
        originsPinnedHint: "Allowed origins are pinned for this action (security constraint) and cannot be changed",
        originsDefaultOn: "Allowed by default",
        originsDefaultOff: "Off by default, can be enabled",
        domain: "Domain",
        versionLabel: "Version",
        shell: "Host",
        count: function(shown, total) {
          return shown + " / " + total + " actions";
        },
        search: "Search name, description, params (matches highlighted)",
        filterReq: "Required",
        all: "All",
        onlyRequired: "Has required",
        onlyOptional: "No required",
        filterType: "Param type",
        allTypes: "All types",
        filterOrigin: "Origins",
        allOrigins: "All origins",
        colName: "Param",
        colType: "Type",
        colReq: "Required",
        colExtra: "Default / enum / constraints",
        colDesc: "Description",
        required: "required",
        optional: "optional",
        noParams: "No parameters",
        paramCount: function(n) {
          return n + " params";
        },
        params: "Parameters",
        requiredCount: function(n) {
          return n + " required";
        },
        examples: "Examples",
        noExamples: "No examples",
        copy: "Copy",
        copied: "Copied",
        raw: "Raw JSON Schema",
        loading: "Loading\u2026",
        loadFail: "Failed to read action schema",
        retry: "Retry",
        empty: "No matching action",
        emptyRegistry: "This domain has no registered action",
        envelope: "Default",
        enumLabel: "Enum",
        range: "Range",
        length: "Length",
        pattern: "Pattern",
        format: "Format",
        items: "Items"
      }
    };
    function typeLabel(schema) {
      if (!schema || typeof schema !== "object") return "";
      if (Array.isArray(schema.type)) return schema.type.join(" | ");
      if (typeof schema.type === "string") {
        if (schema.type === "array" && schema.items) {
          var inner = typeLabel(schema.items);
          return inner ? inner + "[]" : "array";
        }
        return schema.type;
      }
      if (Array.isArray(schema.oneOf)) return schema.oneOf.map(typeLabel).filter(Boolean).join(" | ");
      if (Array.isArray(schema.anyOf)) return schema.anyOf.map(typeLabel).filter(Boolean).join(" | ");
      return "";
    }
    function typeNames(schema) {
      var label = typeLabel(schema);
      if (!label) return [];
      return label.split("|").map(function(x) {
        return x.trim().replace(/\[\]$/, "");
      }).filter(Boolean);
    }
    function scalar(value) {
      if (typeof value === "string") return JSON.stringify(value);
      return String(value);
    }
    function extraText(schema, t) {
      if (!schema || typeof schema !== "object") return "";
      var parts = [];
      if (Object.prototype.hasOwnProperty.call(schema, "default")) {
        parts.push(t.envelope + " " + scalar(schema.default));
      }
      if (Array.isArray(schema.enum)) {
        parts.push(t.enumLabel + " " + schema.enum.map(scalar).join(" / "));
      }
      if (typeof schema.minimum === "number" || typeof schema.maximum === "number") {
        var lo = typeof schema.minimum === "number" ? schema.minimum : null;
        var hi = typeof schema.maximum === "number" ? schema.maximum : null;
        if (lo !== null && hi !== null) parts.push(t.range + " \u2265" + lo + " \u4E14 \u2264" + hi);
        else if (lo !== null) parts.push(t.range + " \u2265" + lo);
        else parts.push(t.range + " \u2264" + hi);
      }
      if (typeof schema.minLength === "number" || typeof schema.maxLength === "number") {
        parts.push(t.length + " " + (schema.minLength ?? 0) + "\u2013" + (schema.maxLength ?? "\u221E"));
      }
      if (typeof schema.minItems === "number" || typeof schema.maxItems === "number") {
        parts.push(t.items + " " + (schema.minItems ?? 0) + "\u2013" + (schema.maxItems ?? "\u221E"));
      }
      if (typeof schema.pattern === "string") parts.push(t.pattern + " " + schema.pattern);
      if (typeof schema.format === "string") parts.push(t.format + " " + schema.format);
      return parts.join(" \xB7 ");
    }
    function paramRows(action) {
      var input = action && action.input && typeof action.input === "object" ? action.input : {};
      var props = input.properties && typeof input.properties === "object" ? input.properties : {};
      var required = Array.isArray(input.required) ? input.required : [];
      return Object.keys(props).map(function(key) {
        var schema = props[key] && typeof props[key] === "object" ? props[key] : {};
        return {
          name: key,
          schema,
          type: typeLabel(schema),
          types: typeNames(schema),
          required: required.indexOf(key) >= 0,
          description: typeof schema.description === "string" ? schema.description : ""
        };
      });
    }
    module2.exports = function createActionSchemaView(options) {
      var raw = String(options.domain || "");
      var SOURCE = options.source === "actions.list" ? "actions.list" : "actionSchema";
      var DOMAIN = SOURCE === "actions.list" ? raw : raw.indexOf("wb-addon-") === 0 ? raw : "wb-addon-" + raw;
      var LIST_DOMAIN = options.listDomain ? String(options.listDomain) : DOMAIN;
      var prefix = options.prefix;
      var P = prefix + "-as";
      var Icon2 = options.Icon || null;
      var injectCss = require_action_schema_style()(prefix, DOMAIN);
      var Highlight = createHighlight(P);
      function icon(name, size) {
        return Icon2 ? h2(Icon2, { name, size: size || 14 }) : null;
      }
      function plainCopy(text) {
        if (typeof document === "undefined") return;
        var area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "readonly");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand("copy");
        } catch (e) {
        }
        document.body.removeChild(area);
      }
      function ActionSchemaView(props) {
        var lang = props.lang === "en" ? "en" : "zh";
        var t = COPY[lang];
        var api = props.api;
        var snapState = React.useState(null);
        var snap = snapState[0], setSnap = snapState[1];
        var errState = React.useState("");
        var err = errState[0], setErr = errState[1];
        var loadingState = React.useState(true);
        var loading = loadingState[0], setLoading = loadingState[1];
        var reloadState = React.useState(0);
        var reload = reloadState[0], setReload = reloadState[1];
        var queryState = React.useState("");
        var query = queryState[0], setQuery = queryState[1];
        var reqState = React.useState("all");
        var reqMode = reqState[0], setReqMode = reqState[1];
        var typeState = React.useState("");
        var typePick = typeState[0], setTypePick = typeState[1];
        var originFilterState = React.useState("");
        var originPick = originFilterState[0], setOriginPick = originFilterState[1];
        var toastState = React.useState("");
        var toast = toastState[0], setToast = toastState[1];
        var savingState = React.useState("");
        var saving = savingState[0], setSaving = savingState[1];
        var foldsState = React.useState({});
        var folds = foldsState[0], setFolds = foldsState[1];
        React.useEffect(function() {
          injectCss();
        }, []);
        React.useEffect(function() {
          var alive = true;
          setLoading(true);
          setErr("");
          var pending;
          var actionName = SOURCE === "actions.list" ? "actions.list" : DOMAIN.replace(/^wb-addon-/, "") + ".actionSchema";
          var callArgs = SOURCE === "actions.list" ? { detail: true, domain: LIST_DOMAIN } : void 0;
          if (api && typeof api.call === "function") {
            pending = Promise.resolve(api.call(actionName, callArgs)).then(function(r) {
              if (r && r.ok === false) return r;
              return r && r.result || r;
            });
          } else {
            pending = Promise.reject(new Error("no call api"));
          }
          Promise.resolve(pending).then(function(r) {
            if (!alive) return;
            if (!r || r.ok === false) {
              setSnap(null);
              setErr(String(r && (r.error || r.text) || t.loadFail));
            } else {
              setSnap(r);
            }
            setLoading(false);
          }, function(e) {
            if (!alive) return;
            setSnap(null);
            setErr(String(e && e.message || e || t.loadFail));
            setLoading(false);
          });
          return function() {
            alive = false;
          };
        }, [reload]);
        function copy(text) {
          var done = function() {
            setToast(t.copied);
          };
          if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            navigator.clipboard.writeText(text).then(done, function() {
              plainCopy(text);
              done();
            });
            return;
          }
          plainCopy(text);
          done();
        }
        var ORIGINS = ["ui", "plugin", "agent", "sync"];
        var originText = { ui: t.originUi, plugin: t.originPlugin, agent: t.originAgent, sync: t.originSync };
        function setOrigins(action, origin) {
          var name = action.name;
          var current = Array.isArray(action.origins) ? action.origins.slice() : [];
          var index = current.indexOf(origin);
          var next = index >= 0 ? current.filter(function(o) {
            return o !== origin;
          }) : current.concat([origin]);
          if (next.length === 0) {
            setToast(t.originsEmpty);
            return;
          }
          next = ORIGINS.filter(function(o) {
            return next.indexOf(o) >= 0;
          });
          setSaving(name);
          setToast("");
          var fail = function(e) {
            setSaving("");
            setToast(t.originsFail + "\uFF1A" + String(e && e.message || e || ""));
          };
          var done = function(r) {
            setSaving("");
            var payload = r && typeof r === "object" && Object.prototype.hasOwnProperty.call(r, "result") ? r.result : r;
            if (r && r.ok === false) {
              setToast(t.originsFail + "\uFF1A" + String(r.error || r.text || ""));
              return;
            }
            var value = payload && Array.isArray(payload.origins) ? payload.origins : next;
            var source = payload && typeof payload.source === "string" ? payload.source : action.originsSource;
            setSnap(function(prev) {
              if (!prev || !Array.isArray(prev.actions)) return prev;
              return Object.assign({}, prev, {
                actions: prev.actions.map(function(a) {
                  if (!a || a.name !== name) return a;
                  return Object.assign({}, a, { origins: value, originsSource: source });
                })
              });
            });
            setToast(t.originsToast);
          };
          if (!api || typeof api.call !== "function") {
            fail(new Error("no call api"));
            return;
          }
          Promise.resolve(api.call("actions.setActionOrigins", { action: name, origins: next })).then(done, fail);
        }
        function paramsOpen(action) {
          if (Object.prototype.hasOwnProperty.call(folds, action.name)) return folds[action.name] === true;
          return Boolean(String(query || "").trim()) || reqMode !== "all" || Boolean(typePick);
        }
        function resetFolds() {
          setFolds(function(prev) {
            return Object.keys(prev).length ? {} : prev;
          });
        }
        var all = snap && Array.isArray(snap.actions) ? snap.actions.filter(function(a) {
          return a && a.domain === DOMAIN;
        }) : [];
        var info = snap && Array.isArray(snap.domains) ? snap.domains.filter(function(d) {
          return d && d.id === DOMAIN;
        })[0] || null : null;
        var typeOptions = [];
        all.forEach(function(a) {
          paramRows(a).forEach(function(row) {
            row.types.forEach(function(name) {
              if (typeOptions.indexOf(name) < 0) typeOptions.push(name);
            });
          });
        });
        typeOptions.sort();
        var kw = String(query || "").trim();
        var q = kw.toLowerCase();
        var visible = all.filter(function(a) {
          var rows = paramRows(a);
          if (q) {
            var hay = [a.name || "", a.description || ""].concat(rows.map(function(row) {
              return row.name + " " + row.type + " " + row.description;
            })).join(" ").toLowerCase();
            if (hay.indexOf(q) < 0) return false;
          }
          var hasRequired = rows.some(function(row) {
            return row.required;
          });
          if (reqMode === "required" && !hasRequired) return false;
          if (reqMode === "optional" && hasRequired) return false;
          if (typePick && !rows.some(function(row) {
            return row.types.indexOf(typePick) >= 0;
          })) return false;
          if (originPick && (!Array.isArray(a.origins) || a.origins.indexOf(originPick) < 0)) return false;
          return true;
        });
        function paramRow(row) {
          var extra = extraText(row.schema, t);
          return h2(
            "tr",
            { key: row.name },
            h2("td", { className: P + "-mono " + P + "-pname" }, Highlight.hit(row.name, kw)),
            h2("td", { className: P + "-mono " + P + "-ptype" }, Highlight.hit(row.type, kw)),
            h2(
              "td",
              { className: row.required ? P + "-req " + P + "-pneed" : P + "-opt " + P + "-pneed" },
              row.required ? t.required : t.optional
            ),
            // extra（默认 / 枚举 / 约束）不在过滤 haystack 里，因此也不高亮，保持「显示即命中」口径。
            h2("td", { className: P + "-mono " + P + "-pextra" }, extra),
            h2("td", { className: P + "-pdesc" }, Highlight.hit(row.description, kw))
          );
        }
        function originsChips(action) {
          if (!Array.isArray(action.origins)) return null;
          if (action.originsSource === "invalid") {
            return h2("span", { className: P + "-badge " + P + "-locked", title: t.originsPinnedHint, "data-origins-invalid": action.name }, t.originsPinned);
          }
          var busy = saving === action.name;
          var pinned = action.name === "actions.setActionOrigins";
          var supported = Array.isArray(action.originsDeclared) ? action.originsDeclared : action.origins;
          return h2(
            "div",
            { className: P + "-origins", "data-origins-row": action.name },
            h2("span", { className: P + "-origins-label" }, t.originsLabel),
            ORIGINS.map(function(origin) {
              var on = action.origins.indexOf(origin) >= 0;
              var allowed = supported.indexOf(origin) >= 0;
              var preset = Array.isArray(action.originsDefault) ? action.originsDefault : supported;
              var byDefault = preset.indexOf(origin) >= 0;
              return h2(
                "label",
                {
                  key: origin,
                  className: P + "-origin" + (allowed ? "" : " " + P + "-origin-off"),
                  title: pinned ? t.originsPinnedHint : !allowed ? t.originsUnsupported : originText[origin] + " \xB7 " + action.name + " \xB7 " + (byDefault ? t.originsDefaultOn : t.originsDefaultOff)
                },
                h2("input", {
                  type: "checkbox",
                  checked: on,
                  disabled: busy || pinned || !allowed,
                  "data-origin": origin,
                  "data-origin-row": action.name,
                  "data-origin-supported": allowed ? "1" : "0",
                  onChange: function() {
                    setOrigins(action, origin);
                  }
                }),
                h2("span", null, originText[origin])
              );
            }),
            busy ? h2("span", { className: P + "-origins-label" }, t.originsSaving) : null
          );
        }
        function card(action) {
          var rows = paramRows(action);
          var required = rows.filter(function(row) {
            return row.required;
          }).length;
          var open = paramsOpen(action);
          var examples = Array.isArray(action.examples) ? action.examples : [];
          return h2(
            "div",
            { className: P + "-card", key: action.name },
            h2(
              "div",
              { className: P + "-cardhead" },
              h2(
                "div",
                { className: P + "-cardmeta" },
                h2("code", { className: P + "-mono" }, Highlight.hit(action.name, kw)),
                h2("span", { className: P + "-badge" }, rows.length ? t.paramCount(rows.length) : t.noParams),
                rows.some(function(row) {
                  return row.required;
                }) ? h2("span", { className: P + "-badge " + P + "-req" }, t.required) : null
              ),
              originsChips(action)
            ),
            action.description ? h2("p", { className: P + "-desc" }, Highlight.hit(action.description, kw)) : null,
            rows.length ? h2(
              Disclosure,
              {
                className: P + "-params",
                title: t.params,
                meta: required ? t.requiredCount(required) : "",
                attrs: { "data-params-fold": action.name },
                open,
                // 原生 details 自带键盘与无障碍语义，这里只记下用户的开合；
                // 筛选变化引起的程序性开合也会触发 toggle，记下的值与当次默认一致，随后由 resetFolds 清掉。
                onToggle: function(e) {
                  var next = !!(e && e.currentTarget && e.currentTarget.open);
                  setFolds(function(prev) {
                    if (prev[action.name] === next) return prev;
                    var out = Object.assign({}, prev);
                    out[action.name] = next;
                    return out;
                  });
                }
              },
              h2(
                "table",
                { className: P + "-table" },
                h2("thead", null, h2(
                  "tr",
                  null,
                  h2("th", null, t.colName),
                  h2("th", null, t.colType),
                  h2("th", null, t.colReq),
                  h2("th", null, t.colExtra),
                  h2("th", null, t.colDesc)
                )),
                h2("tbody", null, rows.map(paramRow))
              )
            ) : h2("div", { className: P + "-none" }, t.noParams),
            h2(
              "div",
              { className: P + "-example" },
              h2(
                "div",
                { className: P + "-examplehead" },
                h2("span", { className: P + "-none" }, t.examples),
                examples.length ? h2("button", {
                  type: "button",
                  className: P + "-copy",
                  "data-copy-example": action.name,
                  onClick: function() {
                    copy(JSON.stringify(examples.length === 1 ? examples[0] : examples, null, 2));
                  }
                }, t.copy) : null
              ),
              examples.length ? examples.map(function(example, index) {
                return h2("pre", { className: P + "-pre", key: index }, JSON.stringify(example, null, 2));
              }) : h2("div", { className: P + "-none" }, t.noExamples)
            ),
            h2(
              Disclosure,
              { title: t.raw },
              h2("pre", { className: P + "-pre" }, JSON.stringify(action.input || {}, null, 2))
            )
          );
        }
        var body;
        if (loading) {
          body = h2("div", { className: P + "-empty", role: "status" }, t.loading);
        } else if (err) {
          body = h2(
            "div",
            { className: P + "-error", role: "alert" },
            h2("span", null, t.loadFail + "\uFF1A" + err),
            h2("button", { type: "button", className: P + "-copy", onClick: function() {
              setReload(reload + 1);
            } }, t.retry)
          );
        } else if (!all.length) {
          body = h2("div", { className: P + "-empty" }, t.emptyRegistry);
        } else if (!visible.length) {
          body = h2("div", { className: P + "-empty" }, t.empty);
        } else {
          body = h2("div", { className: P + "-list" }, visible.map(card));
        }
        return h2(
          "div",
          { className: P },
          h2(
            "div",
            { className: P + "-head" },
            h2("h3", { className: P + "-title" }, t.title),
            h2("span", { className: P + "-badge" }, t.domain + " " + DOMAIN),
            info && info.version ? h2("span", { className: P + "-badge" }, t.versionLabel + " v" + info.version) : null,
            snap && snap.shellVersion ? h2("span", { className: P + "-badge" }, t.shell + " v" + snap.shellVersion) : null,
            h2("span", { className: P + "-badge" }, t.count(visible.length, all.length)),
            h2("span", { className: P + "-none" }, t.hint)
          ),
          h2("p", { className: P + "-hintline" }, SOURCE === "actions.list" ? t.hostHint : t.switchHint),
          snap ? h2(
            "div",
            { className: P + "-toolbar" },
            h2(
              "label",
              { className: P + "-search" },
              icon("search", 14),
              h2("input", {
                type: "search",
                value: query,
                placeholder: t.search,
                "aria-label": t.search,
                onChange: function(e) {
                  setQuery(e.target.value);
                  resetFolds();
                }
              })
            ),
            h2(
              "label",
              { className: P + "-none" },
              t.filterReq + " ",
              h2(
                "select",
                { value: reqMode, "aria-label": t.filterReq, onChange: function(e) {
                  setReqMode(e.target.value);
                  resetFolds();
                } },
                h2("option", { value: "all" }, t.all),
                h2("option", { value: "required" }, t.onlyRequired),
                h2("option", { value: "optional" }, t.onlyOptional)
              )
            ),
            h2(
              "label",
              { className: P + "-none" },
              t.filterType + " ",
              h2(
                "select",
                { value: typePick, "aria-label": t.filterType, onChange: function(e) {
                  setTypePick(e.target.value);
                  resetFolds();
                } },
                h2("option", { value: "" }, t.allTypes),
                typeOptions.map(function(name) {
                  return h2("option", { value: name, key: name }, name);
                })
              )
            ),
            h2(
              "label",
              { className: P + "-none" },
              t.filterOrigin + " ",
              h2(
                "select",
                { value: originPick, "aria-label": t.filterOrigin, "data-origin-filter": "", onChange: function(e) {
                  setOriginPick(e.target.value);
                } },
                h2("option", { value: "" }, t.allOrigins),
                ORIGINS.map(function(origin) {
                  return h2("option", { value: origin, key: origin }, originText[origin]);
                })
              )
            )
          ) : null,
          body,
          toast ? h2("div", { className: P + "-toast", role: "status" }, toast) : null
        );
      }
      return { ActionSchemaView, DOMAIN, typeLabel, paramRows };
    };
  }
});

// packages/shell/client/system-pages.cjs
var require_system_pages = __commonJS({
  "packages/shell/client/system-pages.cjs"(exports2, module2) {
    "use strict";
    var common = require_client_common()("wb");
    var createActionSchemaView = require_action_schema_view();
    function agentAccessPage(deps) {
      var jsx2 = deps.jsx;
      var t = deps.t;
      var lang = deps.lang;
      var api = deps.api;
      var View = createActionSchemaView({ domain: "wb-shell", source: "actions.list", prefix: "wb" }).ActionSchemaView;
      var hostApi = {
        call: function(action, args) {
          return api.post("/domains/wb-shell/actions/" + encodeURIComponent(action), args || {});
        }
      };
      return jsx2.jsxs("div", { className: "wb-root", children: [
        jsx2.jsxs("div", { className: "wb-inner wb-wide", children: [
          deps.head(t("tab_agent"), t("agent_desc")),
          jsx2.jsx(View, { api: hostApi, lang })
        ] })
      ] });
    }
    function agentListPage(deps) {
      var jsx2 = deps.jsx;
      var React = deps.React;
      var t = deps.t;
      var lang = deps.lang;
      var api = deps.api;
      var hostApi = {
        call: function(action, args) {
          return api.post("/domains/wb-shell/actions/" + encodeURIComponent(action), args || {});
        }
      };
      function AgentListBody() {
        var state = React.useState({ loading: true, error: "", actions: [] });
        var snap = state[0], setSnap = state[1];
        var qState = React.useState("");
        var q = qState[0], setQ = qState[1];
        var domainState = React.useState("");
        var domainPick = domainState[0], setDomainPick = domainState[1];
        React.useEffect(function() {
          var alive = true;
          common.call(hostApi, "actions.list", { detail: true }).then(function(result) {
            if (!alive) return;
            var list = result && result.actions;
            if (!Array.isArray(list) || list.some(function(a) {
              return !a || !a.name || !a.domain || !Array.isArray(a.origins);
            })) throw new Error(t("agent_list_invalid"));
            setSnap({ loading: false, error: "", actions: list });
          }).catch(function(error) {
            if (!alive) return;
            setSnap({ loading: false, error: error && error.message || String(error), actions: [] });
          });
          return function() {
            alive = false;
          };
        }, []);
        var opened = snap.actions.filter(function(a) {
          return Array.isArray(a.origins) && a.origins.indexOf("agent") >= 0;
        });
        var domains = [];
        opened.forEach(function(a) {
          if (a.domain && domains.indexOf(a.domain) < 0) domains.push(a.domain);
        });
        domains.sort();
        if (domainPick && domains.indexOf(domainPick) < 0) domains.unshift(domainPick);
        var rows = opened.filter(function(a) {
          if (domainPick && a.domain !== domainPick) return false;
          if (!q.trim()) return true;
          var text = [a.name, a.domain, a.description].join(" ").toLowerCase();
          return text.indexOf(q.trim().toLowerCase()) >= 0;
        });
        var head = !snap.loading && !snap.error && jsx2.jsx("div", { className: "wb-audit-summary", role: "status", "aria-live": "polite", children: [
          jsx2.jsx("span", { children: t("agent_list_count").replace("{n}", String(rows.length)).replace("{all}", String(opened.length)).replace("{d}", String(domains.length)) }),
          jsx2.jsx("span", { className: "wb-audit-dim", children: t("agent_list_readonly") })
        ] });
        var filters = jsx2.jsxs("div", { className: "wb-audit-filters", children: [
          jsx2.jsxs("label", { className: "wb-audit-field", children: [
            jsx2.jsx("span", { children: t("agent_list_search") }),
            jsx2.jsx("input", { className: "wb-input", type: "search", "data-agent-search": "1", placeholder: t("agent_list_search_ph"), value: q, onChange: function(e) {
              setQ(e.target.value);
            } })
          ] }),
          jsx2.jsxs("label", { className: "wb-audit-field", children: [
            jsx2.jsx("span", { children: t("agent_list_domain") }),
            jsx2.jsxs("select", { className: "wb-select", "data-agent-domain": "1", value: domainPick, onChange: function(e) {
              setDomainPick(e.target.value);
            }, children: [
              jsx2.jsx("option", { value: "", children: t("agent_list_all_domains") }),
              domains.map(function(d) {
                return jsx2.jsx("option", { value: d, children: d }, d);
              })
            ] })
          ] })
        ] });
        var body;
        if (snap.loading) body = jsx2.jsx("div", { className: "wb-msg", role: "status", children: t("agent_list_loading") });
        else if (snap.error) body = jsx2.jsx("div", { className: "wb-err", role: "alert", children: snap.error });
        else if (!rows.length) body = jsx2.jsx("div", { className: "wb-msg wb-empty-cta", children: t(opened.length ? "agent_list_no_match" : "agent_list_empty") });
        else {
          body = jsx2.jsx("div", { style: { overflowX: "auto" }, children: jsx2.jsxs("table", { className: "wb-audit-table", "data-agent-list": "1", children: [
            jsx2.jsx("thead", { children: jsx2.jsx("tr", { children: [
              jsx2.jsx("th", { children: t("agent_list_col_action") }),
              jsx2.jsx("th", { children: t("agent_list_col_domain") }),
              jsx2.jsx("th", { children: t("agent_list_col_desc") }),
              jsx2.jsx("th", { children: t("agent_list_col_origins") })
            ] }) }),
            jsx2.jsx("tbody", { children: rows.map(function(a) {
              var declared = Array.isArray(a.originsDeclared) ? a.originsDeclared : a.origins;
              var narrow = Array.isArray(declared) && declared.length < 4;
              return jsx2.jsxs("tr", { "data-agent-row": a.name, children: [
                jsx2.jsx("td", { className: "wb-audit-mono", children: a.name }),
                jsx2.jsx("td", { className: "wb-audit-dim", children: a.domain || "\u2014" }),
                jsx2.jsx("td", { children: a.description || "\u2014" }),
                jsx2.jsx("td", { children: jsx2.jsxs("span", { className: "wb-audit-mono", children: [
                  (a.origins || []).join(" \xB7 "),
                  narrow ? jsx2.jsx("span", { className: "wb-audit-dim", children: "  (" + t("agent_list_narrow") + " " + declared.join("/") + ")" }) : null
                ] }) })
              ] }, a.name);
            }) })
          ] }) });
        }
        return jsx2.jsxs("div", { children: [filters, head, body] });
      }
      return jsx2.jsxs("div", { className: "wb-root", children: [
        jsx2.jsxs("div", { className: "wb-inner wb-wide", children: [
          deps.head(t("tab_agent_list"), t("agent_list_desc")),
          jsx2.jsx(AgentListBody, {})
        ] })
      ] });
    }
    function manageCards(deps) {
      var t = deps.t;
      var card = deps.systemCard;
      return [
        card("roles", "agent", t("tab_roles"), t("roles_desc")),
        card("agent", "agent", t("tab_agent"), t("agent_desc")),
        card("agentList", "agent", t("tab_agent_list"), t("agent_list_desc")),
        card("queue", "\u961F", t("tab_queue"), t("queue_desc")),
        card("automation", "\u81EA\u52A8", t("tab_automation"), t("automation_desc")),
        card("data", "\u6570", t("tab_data"), t("data_desc")),
        card("config", "\u914D", t("tab_config"), t("config_desc")),
        card("backup", "backup", t("tab_backup"), t("backup_desc")),
        card("audit", "audit", t("tab_audit"), t("audit_desc")),
        card("account", "account", t("tab_account"), t("account_desc"))
      ];
    }
    module2.exports = { agentAccessPage, agentListPage, manageCards };
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
        indexSub: "\u5F53\u524D\u9009\u4E2D\u8868\u7684\u7D22\u5F15\uFF08\u53EA\u8BFB\uFF09\uFF1B\u884C\u6570\u4E3A\u6240\u5C5E\u8868\u603B\u884C\u6570\uFF0C\u4E0D\u662F\u7D22\u5F15\u6761\u76EE\u6570",
        idxName: "\u7D22\u5F15\u540D",
        idxColumns: "\u5217",
        idxType: "\u7C7B\u578B",
        idxSource: "\u6765\u6E90",
        idxUnique: "\u552F\u4E00",
        idxNormal: "\u666E\u901A",
        idxAuto: "\u81EA\u52A8",
        idxCreated: "\u663E\u5F0F\u521B\u5EFA",
        idxCount: "\u5171 {n} \u4E2A\u7D22\u5F15",
        idxNoExtra: "\u8BE5\u8868\u9664\u4E3B\u952E\u5916\u6CA1\u6709\u989D\u5916\u7D22\u5F15",
        idxRowsHelp: "\u6240\u5C5E\u8868\u603B\u884C\u6570\uFF08\u542B\u5DF2\u5220\u9664\u884C\uFF09\uFF0C\u4E0D\u662F\u7D22\u5F15\u6761\u76EE\u6570",
        idxTable: "\u8868",
        idxRows: "\u884C\u6570",
        idxCols: "\u5217\u6570",
        idxKey: "\u4E3B\u952E",
        idxIndexes: "\u7D22\u5F15",
        idxLastWrite: "\u6700\u8FD1\u5199\u5165",
        idxNone: "\u65E0",
        idxEmpty: "\u5F53\u524D\u8868\u6CA1\u6709\u53EF\u7528\u7684\u7D22\u5F15\u7EDF\u8BA1",
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
        indexSub: "Indexes of the selected table (read-only); rows are the table total, not index entries",
        idxName: "Index name",
        idxColumns: "Columns",
        idxType: "Type",
        idxSource: "Source",
        idxUnique: "Unique",
        idxNormal: "Normal",
        idxAuto: "Automatic",
        idxCreated: "Explicit",
        idxCount: "{n} indexes",
        idxNoExtra: "This table has no indexes other than its primary key",
        idxRowsHelp: "Total table rows (including deleted rows), not index entries",
        idxTable: "Table",
        idxRows: "Rows",
        idxCols: "Cols",
        idxKey: "Primary key",
        idxIndexes: "Indexes",
        idxLastWrite: "Last write",
        idxNone: "\u2014",
        idxEmpty: "No index statistics available for this table",
        idxTables: "Tables",
        idxAt: "Generated"
      }
    };
    module2.exports = COPY;
  }
});

// packages/addons/lib/visual-tokens.cjs
var require_visual_tokens = __commonJS({
  "packages/addons/lib/visual-tokens.cjs"(exports2, module2) {
    module2.exports = `
:where(.wbt-root,.wbi-root,.wbi-cfg,.wbt-data,.wbs-data,.wbg-data,.wbi-data,.wb-desc){--wb-radius-sm:8px;--wb-radius-card:12px;--wb-space-sm:8px;--wb-space-md:14px;--wb-border:var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent));--wb-description-bg:color-mix(in oklab,var(--dsw-alias-brand-primary,#5b7fd6) 7%,transparent);--wb-description-line:color-mix(in oklab,var(--dsw-alias-brand-primary,#5b7fd6) 34%,transparent);--wb-motion:140ms;--wb-btn-bg:transparent;--wb-btn-hover-bg:color-mix(in oklab,currentColor 6%,transparent);--wb-btn-active-bg:color-mix(in oklab,currentColor 11%,transparent);--wb-btn-primary-bg:var(--dsw-alias-brand-primary,#2563eb);--wb-btn-primary-fg:var(--dsw-alias-label-primary-inverted,#fff);--wb-btn-danger-fg:var(--dsw-alias-state-error-primary,#b91c1c);--wb-btn-size-sm:32px;--wb-btn-focus:2px solid var(--dsw-alias-brand-primary,#2563eb);--wb-btn-focus-offset:2px}
.wb-desc{background:var(--wb-description-bg);border-left-color:var(--wb-description-line);border-radius:0 var(--wb-radius-sm) var(--wb-radius-sm) 0}
`;
  }
});

// packages/addons/lib/data-style.cjs
var require_data_style = __commonJS({
  "packages/addons/lib/data-style.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function(DOMAIN, PREFIX) {
      var P = PREFIX + "-data";
      var CSS2 = [
        require_visual_tokens(),
        "." + P + "-search:has(.wbi-svg) input{padding-left:30px}." + P + "-search>.wbi-svg{position:absolute;left:10px;top:50%;transform:translateY(-50%)}",
        "." + P + "-btn{transition:background var(--wb-motion),border-color var(--wb-motion)}",
        "@media(max-width:480px){." + P + "-head>." + P + "-btn:has(.wbi-svg){width:32px;height:32px;padding:0;justify-content:center}." + P + "-head>." + P + "-btn:has(.wbi-svg) ." + P + "-btnlabel{display:none}}",
        "." + P + "{--cfg-line:var(--wb-border);--cfg-surface:var(--wb-surface,var(--dsw-alias-bg-layer-1,transparent));--cfg-muted:var(--dsw-alias-label-secondary,color-mix(in oklab,currentColor 62%,transparent));--cfg-faint:var(--dsw-alias-label-tertiary,color-mix(in oklab,currentColor 42%,transparent));--cfg-hover:var(--dsw-alias-interactive-bg-hover,color-mix(in oklab,currentColor 5%,transparent));display:grid;grid-template-columns:216px minmax(0,1fr);gap:16px;width:100%;min-width:0;color:inherit;font-size:13px;align-items:start}",
        "." + P + "-side{position:sticky;top:12px;display:flex;flex-direction:column;gap:3px;border:1px solid var(--cfg-line);border-radius:var(--wb-radius-card);background:var(--cfg-surface);padding:8px;box-shadow:0 1px 2px color-mix(in oklab,currentColor 3%,transparent)}",
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
        "." + P + "-main{display:flex;flex-direction:column;gap:10px;min-width:0;border:1px solid var(--cfg-line);border-radius:var(--wb-radius-card);background:var(--cfg-surface);padding:14px 16px 12px;box-shadow:0 1px 2px color-mix(in oklab,currentColor 3%,transparent)}",
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
        "." + P + "-jump .wbctl-num-input{width:56px;padding:4px 7px;font-size:11.5px;text-align:right}",
        "." + P + "-jump .wbctl-num-hint{display:none}",
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
        "@media (prefers-reduced-motion:reduce){." + P + " *,." + P + "-track,." + P + "-track::after,." + P + "-sk,." + P + "-drawer{transition:none;animation:none}}",
        "." + P + "-idxsub{font-size:11.5px;color:var(--cfg-muted);line-height:1.55}",
        "." + P + "-idxsum{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;color:var(--cfg-muted)}",
        "." + P + "-idxsum b{font-weight:660;color:var(--dsw-alias-label-primary,inherit);font-variant-numeric:tabular-nums}",
        "." + P + "-idxtable{width:100%;table-layout:fixed}." + P + "-idxtable ." + P + "-cell{white-space:normal;overflow-wrap:anywhere;max-width:none}." + P + "-idxtable th:first-child{width:30%}." + P + "-idxtable th:nth-child(2){width:28%}",
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
      ].concat(require_switch().styles).concat(require_number_field().styles).join("\n");
      if (DOMAIN === "storage") {
        var buttons = "." + P + " :is(button)";
        CSS2 += buttons + "{border:none;background:var(--wb-btn-bg);min-height:var(--wb-btn-size-sm);min-width:var(--wb-btn-size-sm)}" + buttons + ":enabled:hover{background:var(--wb-btn-hover-bg)}" + buttons + ":enabled:active{background:var(--wb-btn-active-bg)}" + buttons + ":disabled{background:var(--wb-btn-bg);color:var(--cfg-muted)}" + buttons + ":focus-visible{outline:var(--wb-btn-focus);outline-offset:var(--wb-btn-focus-offset)}." + P + "-fcell:has(button) input{padding-right:34px}";
      }
      function injectCss() {
        if (typeof document === "undefined") return;
        var old = document.getElementById("wb-addon-" + DOMAIN + "-data-css");
        if (old) {
          old.textContent = CSS2;
          return;
        }
        var style = document.createElement("style");
        style.id = "wb-addon-" + DOMAIN + "-data-css";
        style.setAttribute("data-wb-addon", "wb-addon-" + DOMAIN);
        style.textContent = CSS2;
        document.head.appendChild(style);
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
    var NF = require_number_field();
    var h2 = React.createElement;
    var COPY = require_data_copy();
    var SW = require_switch();
    module2.exports = function createDataView(options) {
      var DOMAIN = options.domain;
      function icon(name) {
        return options.Icon ? h2(options.Icon, { name }) : null;
      }
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
          Promise.resolve((options.tablesLoader || function(a) {
            return a.call(DOMAIN + ".dataTables");
          })(api)).then(function(r) {
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
          if (!active || !cfgWrap.ready || index) return void 0;
          var req = ++reqRef.current;
          setLoadingRows(true);
          var args = { table: active, page, pageSize: size, order, includeDeleted };
          if (sort) args.sort = sort;
          if (search) args.search = search;
          if (Object.keys(filters).length) args.filters = filters;
          Promise.resolve((options.query || function(a, q) {
            return a.call(DOMAIN + ".dataQuery", q);
          })(api, args)).then(function(r) {
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
        }, [active, page, size, sort, order, search, includeDeleted, cfgWrap.ready, filtersKey, refreshS[0], !!index]);
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
          setError("");
        }
        function loadIndex() {
          reqRef.current++;
          setError("");
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
        function renderIndex() {
          var row = (index || []).filter(function(r) {
            return r.table.name === active;
          })[0];
          var tb = row ? row.table : current;
          var st = row && row.stats;
          var indexes = st ? st.indexes || [] : [];
          var hasExtra = indexes.some(function(ix) {
            return ix.origin !== "pk";
          });
          var count = st && st.rows !== void 0 ? st.rows : tb && tb.count;
          return h2(
            "div",
            { className: P + "-idx" },
            h2(
              "div",
              { className: P + "-head" },
              h2(
                "div",
                { className: P + "-headmain" },
                h2("h2", null, icon("database"), tableLabel(tb), h2("span", { className: P + "-code" }, active)),
                h2("div", { className: P + "-idxsub" }, t.indexSub)
              ),
              h2("button", {
                type: "button",
                className: P + "-btn",
                "aria-label": t.refresh,
                title: t.refresh,
                "aria-busy": indexBusy ? "true" : "false",
                onClick: function() {
                  loadIndex();
                }
              }, icon("refresh"), h2("span", { className: P + "-btnlabel" }, t.refresh))
            ),
            st ? h2(
              "div",
              { className: P + "-idxsum" },
              h2("span", null, t.idxRows, " ", h2("b", null, String(count))),
              h2("span", null, t.idxCols, " ", h2("b", null, String(st.columnCount === void 0 ? (tb.columns || []).length : st.columnCount))),
              h2("span", null, fmt(t.idxCount, { n: indexes.length }))
            ) : null,
            indexBusy ? options.Skeleton ? h2(options.Skeleton, { lang, label: t.loading }) : h2("div", { className: P + "-empty", role: "status", "aria-busy": "true" }, t.loading) : !st ? h2("div", { className: P + "-empty" }, t.idxEmpty) : !hasExtra ? h2("div", { className: P + "-empty" }, t.idxNoExtra) : h2(
              "div",
              { className: P + "-tablewrap" },
              h2(
                "table",
                { className: P + "-table " + P + "-idxtable" },
                h2("thead", null, h2(
                  "tr",
                  null,
                  [t.idxName, t.idxColumns, t.idxType, t.idxSource, t.idxRows].map(function(label) {
                    return h2("th", { scope: "col", key: label }, h2("span", { className: P + "-thbtn" }, label));
                  })
                )),
                h2("tbody", null, indexes.map(function(ix) {
                  return h2(
                    "tr",
                    { className: P + "-tr", key: ix.name },
                    h2("td", { className: P + "-cell mono" }, ix.name),
                    h2("td", { className: P + "-cell mono" }, (ix.columns || []).join(", ") || t.idxNone),
                    h2("td", { className: P + "-cell" }, ix.origin === "pk" ? t.idxKey : ix.unique ? t.idxUnique : t.idxNormal),
                    h2("td", { className: P + "-cell" }, /^sqlite_autoindex_/.test(ix.name) ? t.idxAuto : t.idxCreated),
                    h2("td", { className: P + "-cell num", title: t.idxRowsHelp }, String(count))
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
          if (text === null) content = h2("span", { className: "v" }, t.nullText);
          else if (text === "") content = h2("span", { className: "v" }, '""');
          else content = h2("span", { className: "v" }, text);
          if (hook && hook.render) content = hook.render({ value, row, col, lang, prefix: P, openDetail });
          return h2("td", {
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
          return h2(
            "th",
            { key: col.name, scope: "col", className: P + "-fth" },
            h2(
              "span",
              { className: P + "-fcell" },
              h2("input", {
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
              val ? h2("button", {
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
          if (loadingRows && !data && options.Skeleton) return h2(options.Skeleton, { lang, label: t.loading });
          if (loadingRows && !data) {
            return h2(
              "div",
              { className: P + "-skwrap", "aria-busy": "true" },
              h2("span", { className: P + "-sr" }, t.loading),
              [0, 1, 2, 3, 4, 5, 6, 7].map(function(i2) {
                return h2("div", { key: i2, className: P + "-sk" });
              })
            );
          }
          if (error) {
            return h2(
              "div",
              { className: P + "-err", role: "alert" },
              h2("span", null, t.queryFail + error),
              h2("button", { type: "button", className: P + "-btn", onClick: refresh }, t.retry)
            );
          }
          if (!data) return h2("div", { className: P + "-empty" }, t.empty);
          var cols = visibleColumns();
          var rows = data.rows || [];
          var narrowing = !!search || activeFilterCount() > 0;
          return h2(
            "div",
            { className: P + "-tablewrap" },
            h2(
              "table",
              { className: P + "-table" },
              h2(
                "thead",
                null,
                h2(
                  "tr",
                  null,
                  h2("th", { className: P + "-rownum", scope: "col" }, "#"),
                  cols.map(function(col) {
                    return h2(
                      "th",
                      { key: col.name, scope: "col", "aria-sort": ariaSort(col.name) },
                      h2(
                        "button",
                        {
                          type: "button",
                          className: P + "-thbtn",
                          title: colLabel(col) + " \xB7 " + col.type,
                          onClick: function() {
                            toggleSort(col.name);
                          }
                        },
                        h2("span", null, colLabel(col)),
                        h2("span", { className: P + "-coltype" }, String(col.type || "").toLowerCase()),
                        sort === col.name ? h2("span", { className: P + "-sortmark", "aria-hidden": "true" }, order === "asc" ? "\u25B2" : "\u25BC") : null
                      )
                    );
                  })
                ),
                h2(
                  "tr",
                  { className: P + "-frow" },
                  h2("th", { className: P + "-rownum", scope: "col" }, ""),
                  cols.map(filterCell)
                )
              ),
              h2("tbody", null, rows.length ? rows.map(function(row, idx) {
                row.__i = idx;
                var deleted = row.deleted_at !== null && row.deleted_at !== void 0;
                return h2(
                  "tr",
                  { key: row.id || idx, className: P + "-tr" + (deleted ? " deleted" : "") },
                  h2("td", { className: P + "-rownum" }, (data.page - 1) * data.pageSize + idx + 1),
                  cols.map(function(col) {
                    var cell = renderCell(row, col);
                    if (deleted && col.name === "id") {
                      return React.cloneElement(cell, { key: col.name }, cell.props.children, h2("span", { className: P + "-delbadge" }, t.deleted));
                    }
                    return cell;
                  })
                );
              }) : h2("tr", null, h2("td", { className: P + "-emptycell", colSpan: cols.length + 1 }, narrowing ? t.noRows : t.empty)))
            )
          );
        }
        function renderFoot() {
          var pages = data ? data.pages : 1;
          var total = data ? data.total : 0;
          return h2(
            "div",
            { className: P + "-foot" },
            h2("span", null, fmt(t.total, { n: total })),
            h2("span", { className: P + "-grow" }),
            h2("button", { type: "button", className: P + "-btn", disabled: !data || page <= 1, onClick: function() {
              setPage(Math.max(1, page - 1));
            } }, "\u2039 " + t.prev),
            h2("span", { className: P + "-pageinfo" }, fmt(t.pageInfo, { page: data ? data.page : 1, pages })),
            h2("button", { type: "button", className: P + "-btn", disabled: !data || page >= pages, onClick: function() {
              setPage(Math.min(pages, page + 1));
            } }, t.next + " \u203A"),
            h2(NF.NumberField, {
              h: h2,
              lang,
              className: P + "-jump",
              value: page,
              min: 1,
              max: pages,
              integer: true,
              ariaLabel: t.jump,
              hint: false,
              onCommit: function(next) {
                if (next !== null) setPage(next);
              }
            }),
            data && data.queryMs !== void 0 ? h2("span", null, fmt(t.queryTime, { n: data.queryMs })) : null
          );
        }
        if (!tables && loadingTables && options.Skeleton) return h2(options.Skeleton, { lang, label: t.loading });
        if (!tables && loadingTables) {
          return h2("div", { className: P + "-skwrap", "aria-busy": "true" }, h2("span", { className: P + "-sr" }, t.loading), [0, 1, 2, 3].map(function(i2) {
            return h2("div", { key: i2, className: P + "-sk" });
          }));
        }
        if (!tables) {
          return h2("div", { className: P + "-err", role: "alert" }, h2("span", null, t.loadFail), h2("button", { type: "button", className: P + "-btn", onClick: loadTables }, t.retry));
        }
        if (!tables.length) return h2("div", { className: P + "-empty" }, t.emptyTable);
        return h2(
          "div",
          { className: P },
          h2(
            "div",
            { className: P + "-side" },
            h2("div", { className: P + "-sidetitle" }, h2("span", null, icon("table"), t.tables), h2("span", null, String(tables.length))),
            tables.map(function(tb) {
              return h2(
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
                h2(
                  "span",
                  { className: P + "-stabname" },
                  h2("span", null, tableLabel(tb)),
                  h2("span", { className: P + "-sidecount" }, tb.count === void 0 || tb.count === null ? "" : String(tb.count))
                ),
                h2("span", { className: P + "-sidetable" }, tb.name)
              );
            })
          ),
          h2(
            "div",
            { className: P + "-main" },
            h2(
              "div",
              { className: P + "-tabs", role: "tablist", "aria-label": t.title },
              h2("button", { type: "button", role: "tab", className: P + "-btn", "aria-selected": !index, onClick: leaveIndex }, icon("list"), lang === "en" ? "Row data" : "\u884C\u6570\u636E"),
              h2("button", { type: "button", role: "tab", className: P + "-btn", "aria-selected": !!index, onClick: loadIndex }, icon("database"), t.index)
            ),
            index && error ? h2("div", { className: P + "-err", role: "alert" }, error) : null,
            index ? renderIndex() : [
              h2(
                "div",
                { className: P + "-head" },
                h2(
                  "div",
                  { className: P + "-headmain" },
                  h2("h2", null, icon("database"), tableLabel(current), h2("span", { className: P + "-code" }, active)),
                  h2(
                    "div",
                    { className: P + "-sub" },
                    current && data && data.total !== void 0 ? fmt(t.rowCount, { n: data.total }) : "",
                    current && current.deletedCount ? " \xB7 " + fmt(t.deletedCount, { n: current.deletedCount }) : "",
                    " \xB7 " + t.subtitle
                  )
                ),
                h2("button", {
                  type: "button",
                  className: P + "-btn",
                  "aria-label": t.refresh,
                  title: t.refresh,
                  "aria-busy": loadingRows ? "true" : "false",
                  onClick: refresh
                }, icon("refresh"), h2("span", { className: P + "-btnlabel" }, t.refresh))
              ),
              h2(
                "div",
                { className: P + "-toolbar" },
                h2(
                  "div",
                  { className: P + "-search" },
                  icon("search"),
                  h2("input", {
                    type: "search",
                    value: searchDraft,
                    placeholder: t.search,
                    "aria-label": t.search,
                    onChange: function(e) {
                      setSearchDraft(e.target.value);
                    }
                  })
                ),
                h2(SW.Switch, {
                  h: h2,
                  checked: includeDeleted,
                  label: t.includeDeleted,
                  onChange: function(next) {
                    setIncludeDeleted(next);
                    setPage(1);
                  }
                }),
                h2(SW.Switch, {
                  h: h2,
                  checked: showSystem,
                  label: t.showSystem,
                  onChange: function(next) {
                    setShowSystem(next);
                  }
                }),
                h2("span", { className: P + "-grow" }),
                h2(
                  "label",
                  { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--cfg-muted)" } },
                  h2("span", null, t.pageSize),
                  h2("select", {
                    className: P + "-select",
                    value: size,
                    onChange: function(e) {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }
                  }, PAGE_SIZES.map(function(n) {
                    return h2("option", { key: n, value: n }, String(n));
                  }))
                )
              ),
              renderRows(),
              renderFoot()
            ]
          ),
          drawer ? h2(
            "div",
            null,
            h2("div", { className: P + "-mask", onClick: function() {
              setDrawer(null);
            } }),
            h2(
              "aside",
              { className: P + "-drawer", role: "dialog", "aria-modal": "true", "aria-label": drawer.column },
              h2("h3", null, fmt(t.drawerTitle, { column: drawer.column, row: drawer.row }), h2("span", { className: P + "-code" }, drawer.name)),
              columnHooks[drawer.name] && columnHooks[drawer.name].detail ? columnHooks[drawer.name].detail({ value: drawer.value, lang, prefix: P }) : h2("pre", null, drawerText(drawer.value)),
              h2(
                "div",
                { className: P + "-drawerfoot" },
                h2("button", { type: "button", className: P + "-btn", onClick: function() {
                  copyCell(drawer.value);
                } }, t.copy),
                h2("button", { type: "button", className: P + "-btn", onClick: function() {
                  setDrawer(null);
                } }, t.close)
              )
            )
          ) : null,
          toast ? h2("div", { className: P + "-toast", role: "status" }, toast) : null
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

// packages/shell/client/cloud-settings.cjs
var require_cloud_settings = __commonJS({
  "packages/shell/client/cloud-settings.cjs"(exports2, module2) {
    "use strict";
    var MODES = ["none", "private", "shared"];
    module2.exports = function CloudSettings(props) {
      var react2 = props.React, jsx2 = props.jsx;
      var t = props.t;
      var api = props.api;
      var st = react2.useState(null);
      var cfg = st[0];
      var setCfg = st[1];
      var st2 = react2.useState("");
      var draftMode = st2[0];
      var setDraftMode = st2[1];
      var st3 = react2.useState({ url: "", secret: "", deviceName: "" });
      var form = st3[0];
      var setForm = st3[1];
      var st4 = react2.useState(false);
      var saving = st4[0];
      var setSaving = st4[1];
      var st5 = react2.useState(false);
      var testing = st5[0];
      var setTesting = st5[1];
      var st6 = react2.useState("");
      var msg = st6[0];
      var setMsg = st6[1];
      var st7 = react2.useState(null);
      var probe = st7[0];
      var setProbe = st7[1];
      function load() {
        api.get("/cloud/config").then(function(r) {
          if (!r || !r.ok) throw new Error(r && r.error || t("config_read_error"));
          setCfg(r);
          setDraftMode(r.mode || "none");
          setForm({
            url: r.private && r.private.url || "",
            secret: "",
            deviceName: r.private && r.private.device_name || ""
          });
        }).catch(function(e) {
          setMsg(String(e.message || e));
        });
      }
      react2.useEffect(function() {
        load();
      }, []);
      function save() {
        setSaving(true);
        setMsg("");
        var body = { mode: draftMode };
        if (draftMode === "private") {
          body.private = { url: form.url, secret: form.secret, deviceName: form.deviceName };
        }
        api.post("/cloud/config", body).then(function(r) {
          setSaving(false);
          if (!r || !r.ok) {
            setMsg(r && r.error || t("cloud_save_failed"));
            return;
          }
          setCfg(r);
          setDraftMode(r.mode || draftMode);
          setForm({
            url: r.private && r.private.url || "",
            secret: "",
            deviceName: r.private && r.private.device_name || ""
          });
          setMsg(t("cloud_saved"));
        }).catch(function(e) {
          setSaving(false);
          setMsg(String(e.message || e));
        });
      }
      function test() {
        setTesting(true);
        setProbe(null);
        setMsg("");
        var probeMode = draftMode || cfg && cfg.mode || "none";
        var body = { mode: probeMode };
        if (probeMode === "private") body.private = { url: form.url, secret: form.secret, deviceName: form.deviceName };
        api.post("/cloud/test", body).then(function(r) {
          setTesting(false);
          setProbe(r || { reachable: false });
        }).catch(function(e) {
          setTesting(false);
          setMsg(String(e.message || e));
        });
      }
      var mode = draftMode || cfg && cfg.mode || "none";
      var hasSecret = Boolean(cfg && cfg.private && cfg.private.has_secret);
      var hintKey = "cloud_mode_" + mode + "_hint";
      return jsx2.jsxs("div", { className: "wb-card", children: [
        jsx2.jsxs("div", { className: "wb-sec", children: [
          jsx2.jsx("h3", { children: t("cloud_settings") }),
          jsx2.jsx("span", { className: "wb-hint", children: t("cloud_switch_hint") })
        ] }),
        jsx2.jsx("div", { className: "wb-tabs", children: MODES.map(function(m) {
          return jsx2.jsx("button", {
            disabled: !cfg || saving || testing,
            "aria-pressed": mode === m,
            className: "wb-tab" + (mode === m ? " on" : ""),
            onClick: function() {
              setDraftMode(m);
              setMsg("");
              setProbe(null);
            },
            children: t("cloud_mode_" + m)
          }, m);
        }) }),
        jsx2.jsx("div", { className: "wb-hint", style: { marginTop: 6 }, children: t(hintKey) }),
        mode === "private" ? jsx2.jsxs("div", { className: "wb-form", style: { marginTop: 10 }, children: [
          jsx2.jsx("input", {
            className: "wb-input",
            placeholder: t("cloud_url_ph"),
            value: form.url,
            onChange: function(e) {
              setForm(Object.assign({}, form, { url: e.target.value }));
            }
          }),
          jsx2.jsx("input", {
            className: "wb-input",
            type: "password",
            placeholder: hasSecret ? t("cloud_secret_keep") : t("cloud_secret_ph"),
            value: form.secret,
            onChange: function(e) {
              setForm(Object.assign({}, form, { secret: e.target.value }));
            }
          }),
          jsx2.jsx("input", {
            className: "wb-input",
            placeholder: t("cloud_device_label"),
            value: form.deviceName,
            onChange: function(e) {
              setForm(Object.assign({}, form, { deviceName: e.target.value }));
            }
          })
        ] }) : null,
        mode === "shared" ? jsx2.jsx("div", { className: "wb-hint", style: { marginTop: 8 }, children: t("cloud_shared_hint") }) : null,
        jsx2.jsxs("div", { className: "wb-form", style: { marginTop: 10 }, children: [
          jsx2.jsx("button", { className: "wb-btn", disabled: !cfg || saving || testing, onClick: save, children: saving ? t("cloud_saving") : t("cloud_save") }),
          jsx2.jsx("button", { className: "wb-btn ghost", disabled: !cfg || saving || testing || mode === "none", onClick: test, children: testing ? t("cloud_testing") : t("cloud_test") })
        ] }),
        msg ? jsx2.jsx("div", { className: "wb-msg", style: { marginTop: 8 }, children: msg }) : null,
        probe ? jsx2.jsxs("div", { className: "wb-hint", style: { marginTop: 8 }, children: [
          probe.reachable ? jsx2.jsxs("div", { children: [
            t("cloud_ok"),
            probe.server_name ? " \xB7 " + t("cloud_server") + " " + probe.server_name : "",
            " \xB7 " + (probe.latency_ms != null ? probe.latency_ms + "ms" : "")
          ] }) : jsx2.jsx("div", { children: t("cloud_test_fail") + (probe.error ? " \xB7 " + probe.error : "") }),
          probe.reachable ? jsx2.jsx("div", { children: probe.unauthorized ? t("cloud_auth_bad") : probe.authorized ? t("cloud_auth_ok") + (probe.devices && probe.devices.length ? " \xB7 " + t("cloud_devices_count") + " " + probe.devices.length : "") : t("cloud_auth_bad") }) : null
        ] }) : null
      ] });
    };
  }
});

// packages/shell/client/host-pages.cjs
var require_host_pages = __commonJS({
  "packages/shell/client/host-pages.cjs"(exports2, module2) {
    "use strict";
    var createDataView = require_data_view();
    var CloudSettings = require_cloud_settings();
    var schemes = require_config_scheme_bar();
    var SW = require_switch();
    var NF = require_number_field();
    var HOST_TABLES = [
      "meta",
      "sync_change_log",
      "conflict_shadow",
      "sync_dead_letter",
      "sync_state",
      "session_role",
      "audit_log",
      "host_event",
      "host_event_delivery",
      "host_event_subscription"
    ];
    function useHostDisplayConfig() {
      return { values: { "data.pageSize": 50, "data.showSystemColumns": false, "data.includeDeleted": false }, ready: true };
    }
    var HostDataView = createDataView({
      domain: "wb",
      prefix: "wbh",
      tables: HOST_TABLES,
      useConfig: useHostDisplayConfig
    }).DataView;
    function hostApi(api) {
      return {
        call: function(action, args) {
          return api.post("/domains/wb-shell/actions/" + encodeURIComponent(action), args || {});
        }
      };
    }
    async function configAction(api, action, args, t) {
      var reply = await hostApi(api).call(action, args);
      var body = reply && reply.result !== void 0 ? reply.result : reply;
      if (!body || !body.values || reply.ok === false) throw new Error(reply && reply.error || t("config_read_error"));
      return Object.assign({ ready: true, items: [], overrides: {}, schemes: [] }, body);
    }
    function PreferenceView(props) {
      var React = props.React;
      var state = React.useState(null), prefs = state[0], setPrefs = state[1];
      React.useEffect(function() {
        var active = true;
        configAction(props.api, "wb.configGet", {}, props.t).then(function(data) {
          if (active) setPrefs({ values: data.values });
        }).catch(function(e) {
          if (active) setPrefs({ values: {}, error: String(e.message || e) });
        });
        return function() {
          active = false;
        };
      }, []);
      if (!prefs) return React.createElement("div", { className: "wb-msg" }, props.t("loading"));
      return React.createElement(
        React.Fragment,
        null,
        prefs.error && React.createElement("div", { className: "wb-err", role: "alert" }, props.t("config_fallback") + " " + prefs.error),
        React.createElement(props.component, Object.assign({}, props, { preferences: prefs.values }))
      );
    }
    function moduleControl(h2, deps, view, item) {
      var ids = view.state.values[item.id];
      var all = !Array.isArray(ids);
      var modules = (deps.addons || []).filter(function(a) {
        return a.backup && a.backup.export;
      });
      function save(next) {
        view.onSave(item.id, next);
      }
      return h2(
        "fieldset",
        { className: "wbh-modules", disabled: view.busy },
        h2("legend", null, deps.t("config_modules")),
        h2("label", null, h2("input", { type: "checkbox", checked: all, onChange: function(e) {
          save(e.target.checked ? null : modules.map(function(a) {
            return a.id;
          }));
        } }), deps.t("config_dynamic_all")),
        modules.map(function(a) {
          return h2("label", { key: a.id }, h2("input", {
            type: "checkbox",
            checked: all || ids.includes(a.id),
            disabled: all,
            onChange: function(e) {
              save(e.target.checked ? ids.concat(a.id) : ids.filter(function(id) {
                return id !== a.id;
              }));
            }
          }), a.title || a.id);
        })
      );
    }
    function pageShell(deps, title, desc, body) {
      var jsx2 = deps.jsx;
      return jsx2.jsxs("div", { className: "wb-root", children: [
        jsx2.jsxs("div", { className: "wb-inner wb-wide", children: [
          deps.head(title, desc),
          body
        ] })
      ] });
    }
    function dataPage(deps) {
      var jsx2 = deps.jsx;
      return pageShell(
        deps,
        deps.t("tab_data"),
        deps.t("data_desc"),
        jsx2.jsx(HostDataView, { api: hostApi(deps.api), lang: deps.lang })
      );
    }
    function configBody(deps, view) {
      var jsx2 = deps.jsx;
      var t = deps.t;
      var h2 = deps.React.createElement;
      var state = view.state;
      var busy = view.busy;
      var body;
      if (state.error) body = jsx2.jsx("div", { className: "wb-err", children: state.error });
      else if (!state.ready) body = jsx2.jsx("div", { className: "wb-msg", children: t("loading") });
      else {
        var groups = [];
        state.items.forEach(function(item) {
          var group = item.group || "\u901A\u7528";
          if (groups.indexOf(group) < 0) groups.push(group);
        });
        body = groups.map(function(group) {
          return jsx2.jsxs("div", { className: "wb-card", children: [
            jsx2.jsx("div", { className: "wb-card-head", children: jsx2.jsx("h3", { children: group }) }),
            state.items.filter(function(item) {
              return (item.group || "\u901A\u7528") === group;
            }).map(function(item) {
              var overridden = state.overrides[item.id] !== void 0;
              var control;
              if (item.id === "backup.moduleIds") {
                control = moduleControl(h2, deps, view, item);
              } else if (item.id === "backup.exportFormat") {
                control = h2(
                  "select",
                  {
                    className: "wb-input",
                    value: state.values[item.id],
                    disabled: busy,
                    "aria-label": t("config_format"),
                    onChange: function(e) {
                      view.onSave(item.id, e.target.value);
                    }
                  },
                  ["zip", "json", "csv", "txt"].map(function(fmt) {
                    return h2("option", { key: fmt, value: fmt }, t("backup_fmt_" + fmt));
                  })
                );
              } else if (item.type === "boolean") {
                control = jsx2.jsx(SW.Switch, {
                  h: h2,
                  checked: state.values[item.id] === true,
                  disabled: busy,
                  label: item.label,
                  onChange: function(next) {
                    view.onSave(item.id, !!next);
                  }
                });
              } else {
                control = jsx2.jsx(NF.NumberField, {
                  h: h2,
                  lang: deps.lang,
                  integer: true,
                  value: state.values[item.id],
                  min: item.min,
                  max: item.max,
                  step: item.step || 1,
                  disabled: busy,
                  label: item.label,
                  onCommit: function(next) {
                    view.onSave(item.id, next);
                  }
                });
              }
              return jsx2.jsxs("div", { className: "wbh-config-row", children: [
                jsx2.jsxs("div", { className: "wbh-config-text", children: [
                  jsx2.jsx("div", { className: "wbh-config-label", children: item.label }),
                  jsx2.jsx("div", { className: "wb-hint", children: item.description || "" })
                ] }),
                jsx2.jsxs("div", { className: "wbh-config-ctl", children: [
                  control,
                  overridden ? jsx2.jsx("button", { type: "button", className: "wb-link", disabled: busy, onClick: function() {
                    view.onReset(item.id);
                  }, children: t("reset_default") }) : null
                ] })
              ] }, item.id);
            })
          ] }, group);
        });
      }
      return pageShell(deps, t("tab_config"), t("config_desc"), [
        state.ready && !state.error ? jsx2.jsx(schemes.SchemeBar, {
          prefix: "wbh",
          lang: deps.lang,
          schemes: state.schemes,
          activeId: state.scheme && state.scheme.id,
          busy,
          copy: {
            none: t("config_scheme_none"),
            defaultHint: t("config_scheme_default"),
            syncedHint: t("config_scheme_local"),
            confirmDelete: t("config_scheme_delete"),
            fromDefault: t("config_scheme_from_default")
          },
          onCreate: function(name, from) {
            view.onScheme("Create", { name, from });
          },
          onRename: function(id, name) {
            view.onScheme("Rename", { id, name });
          },
          onDelete: function(id) {
            view.onScheme("Delete", { id });
          },
          onActivate: function(id) {
            view.onScheme("Activate", { id });
          }
        }, "schemes") : null,
        body,
        jsx2.jsx(CloudSettings, { React: deps.React, jsx: jsx2, api: deps.api, t }, "cloud"),
        view.toast ? jsx2.jsx("div", { className: "wb-toast", children: view.toast }) : null
      ]);
    }
    function configPage(deps) {
      var React = deps.React;
      var api = deps.api;
      var stateS = React.useState({ ready: false, items: [], values: {}, overrides: {}, error: "" });
      var state = stateS[0], setState = stateS[1];
      var busyS = React.useState(false);
      var busy = busyS[0], setBusy = busyS[1];
      var toastS = React.useState("");
      var toast = toastS[0], setToast = toastS[1];
      React.useEffect(function() {
        var active = true;
        configAction(api, "wb.configGet", {}, deps.t).then(function(data) {
          if (active) setState(data);
        }).catch(function(e) {
          if (active) setState({ ready: true, error: String(e.message || e) });
        });
        return function() {
          active = false;
        };
      }, []);
      async function mutate(action, args) {
        setBusy(true);
        try {
          setState(await configAction(api, action, args, deps.t));
          setToast(deps.t("config_saved"));
        } catch (e) {
          setToast(String(e.message || e));
        } finally {
          setBusy(false);
        }
      }
      return configBody(deps, {
        state,
        busy,
        toast,
        onSave: function(id, value) {
          return mutate("wb.configSet", { values: { [id]: value } });
        },
        onReset: function(id) {
          return mutate("wb.configReset", { ids: [id] });
        },
        onScheme: function(verb, args) {
          return mutate("wb.configScheme" + verb, args);
        }
      });
    }
    function ConfigView(props) {
      return configPage(props);
    }
    module2.exports = { PreferenceView, dataPage, configPage, configBody, ConfigView, DataView: HostDataView, HOST_TABLES };
  }
});

// packages/shell/client/event-queue-page.cjs
var require_event_queue_page = __commonJS({
  "packages/shell/client/event-queue-page.cjs"(exports2, module2) {
    "use strict";
    var PAGE_SIZE = 50;
    var STATUS_LABEL = {
      queued: "\u6392\u961F\u4E2D",
      pending: "\u5F85\u6295\u9012",
      running: "\u6267\u884C\u4E2D",
      done: "\u5DF2\u5B8C\u6210",
      dead: "\u6B7B\u4FE1"
    };
    var MODE_LABEL = { broadcast: "\u5E7F\u64AD", targeted: "\u5B9A\u5411" };
    var MODE_LABEL_EN = { broadcast: "broadcast", targeted: "targeted" };
    var STATUS_LABEL_EN = {
      queued: "queued",
      pending: "pending",
      running: "running",
      done: "done",
      dead: "dead"
    };
    function statusText(lang, status) {
      var table = lang === "en" ? STATUS_LABEL_EN : STATUS_LABEL;
      return table[status] || status;
    }
    function modeText(lang, mode) {
      var table = lang === "en" ? MODE_LABEL_EN : MODE_LABEL;
      return table[mode] || table.broadcast;
    }
    function modeBadge(jsx2, lang, mode) {
      var m = mode === "targeted" ? "targeted" : "broadcast";
      return jsx2.jsx("span", { className: "wbq-mode m-" + m, children: modeText(lang, m) });
    }
    function pad2(x) {
      return x < 10 ? "0" + x : String(x);
    }
    function timeText(value) {
      var n = Number(value);
      if (!n) return "\u2014";
      var d = new Date(n);
      if (Number.isNaN(d.getTime())) return "\u2014";
      return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
    }
    function clockText(value) {
      var d = new Date(Number(value) || 0);
      if (Number.isNaN(d.getTime())) return "\u2014";
      return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
    }
    function agoText(t, value, now) {
      var ts = Number(value);
      if (!ts) return "\u2014";
      var diff = Math.max(0, Number(now || Date.now()) - ts);
      var minute = 6e4;
      var hour = 36e5;
      var day = 864e5;
      if (diff < minute) return t("queue_ago_just");
      if (diff < hour) return t("queue_ago_min").replace("{n}", String(Math.floor(diff / minute)));
      if (diff < day) return t("queue_ago_hour").replace("{n}", String(Math.floor(diff / hour)));
      return t("queue_ago_day").replace("{n}", String(Math.floor(diff / day)));
    }
    function readResult(res) {
      if (res && res.ok === false) throw new Error(String(res.error || "\u8BF7\u6C42\u5931\u8D25"));
      if (res && res.result !== void 0) return res.result;
      return res;
    }
    function useLoader(React, api, action, args, deps) {
      var state = React.useState({ loading: true, error: "", data: null });
      var value = state[0];
      var set = state[1];
      var tick = React.useState(0);
      var bump = tick[1];
      React.useEffect(function() {
        var alive = true;
        set(function(prev) {
          return { loading: true, error: prev.error, data: prev.data };
        });
        api.post("/domains/wb-shell/actions/" + encodeURIComponent(action), args || {}).then(readResult).then(function(data) {
          if (alive) set({ loading: false, error: "", data });
        }).catch(function(e) {
          if (alive) set({ loading: false, error: String(e && e.message || e), data: null });
        });
        return function() {
          alive = false;
        };
      }, deps.concat([tick[0]]));
      return { state: value, reload: function() {
        bump(function(n) {
          return n + 1;
        });
      } };
    }
    function metricTile(jsx2, label, value, tone) {
      return jsx2.jsxs("div", { key: label, className: "wbq-metric" + (tone ? " t-" + tone : ""), children: [
        jsx2.jsx("span", { className: "wbq-metric-label", children: label }),
        jsx2.jsx("b", { className: "wbq-metric-value", children: String(value || 0) })
      ] });
    }
    function statusBadge(jsx2, lang, status) {
      return jsx2.jsxs("span", { className: "wbq-badge s-" + status, children: [
        jsx2.jsx("i", { className: "wbq-badge-dot", "aria-hidden": "true" }),
        statusText(lang, status)
      ] });
    }
    function typeBars(jsx2, t, types) {
      if (!types.length) return jsx2.jsx("div", { className: "wbq-hint", children: t("queue_no_types") });
      var max = Math.max.apply(null, types.map(function(x) {
        return Number(x.count) || 0;
      })) || 1;
      return jsx2.jsx("div", { className: "wbq-bars", children: types.slice(0, 6).map(function(item) {
        var count = Number(item.count) || 0;
        var pct = Math.max(4, Math.round(count / max * 100));
        return jsx2.jsxs("div", { key: item.type, className: "wbq-bar-row", children: [
          jsx2.jsx("code", { className: "wbq-bar-name", title: item.type, children: item.type }),
          jsx2.jsx("span", { className: "wbq-bar-track", children: jsx2.jsx("i", { className: "wbq-bar-fill", style: { width: pct + "%" } }) }),
          jsx2.jsx("b", { className: "wbq-bar-count", children: String(count) })
        ] }, item.type);
      }) });
    }
    function panel(jsx2, title, extra, body) {
      return jsx2.jsxs("section", { className: "wbq-panel", children: [
        jsx2.jsxs("header", { className: "wbq-panel-head", children: [
          jsx2.jsx("b", { children: title }),
          extra ? jsx2.jsx("span", { className: "wbq-muted", children: extra }) : null
        ] }),
        body
      ] });
    }
    function tableWrap(jsx2, head, rows) {
      return jsx2.jsx("div", { className: "wbq-table-wrap", children: jsx2.jsxs("table", { className: "wbq-table", children: [
        jsx2.jsx("thead", { children: jsx2.jsx("tr", { children: head }) }),
        jsx2.jsx("tbody", { children: rows })
      ] }) });
    }
    function emptyState(jsx2, t, hint) {
      return jsx2.jsxs("div", { className: "wbq-empty", children: [
        jsx2.jsx("span", { className: "wbq-empty-mark", "aria-hidden": "true" }),
        jsx2.jsx("b", { children: t("queue_empty") }),
        jsx2.jsx("span", { className: "wbq-empty-hint", children: hint || t("queue_empty_hint") })
      ] });
    }
    function loadingRows(jsx2, t, cols) {
      return jsx2.jsx("div", { className: "wbq-loading", role: "status", "aria-label": t("queue_loading"), children: [0, 1, 2].map(function(i) {
        return jsx2.jsx("div", { key: i, className: "wbq-loading-row", "aria-hidden": "true", children: [0, 1, 2, Math.max(1, cols - 3)].map(function(c) {
          return jsx2.jsx("span", { key: c, className: "wbq-loading-bar" });
        }) });
      }) });
    }
    function queuePage(deps) {
      var jsx2 = deps.jsx;
      var React = deps.React;
      var api = deps.api;
      var t = deps.t;
      var lang = deps.lang;
      var tabState = React.useState("events");
      var tab = tabState[0];
      var setTab = tabState[1];
      var filterState = React.useState("");
      var filter = filterState[0];
      var setFilter = filterState[1];
      var modeState = React.useState("");
      var modeFilter = modeState[0];
      var setModeFilter = modeState[1];
      var pageState = React.useState(1);
      var page = pageState[0];
      var setPage = pageState[1];
      var noteState = React.useState("");
      var note = noteState[0];
      var setNote = noteState[1];
      var autoState = React.useState(false);
      var auto = autoState[0];
      var setAuto = autoState[1];
      var clockState = React.useState(0);
      var updatedAt = clockState[0];
      var setUpdatedAt = clockState[1];
      var overview = useLoader(React, api, "wb.eventOverview", {}, []);
      var events = useLoader(React, api, "wb.eventList", { status: filter || void 0, mode: modeFilter || void 0, page, pageSize: PAGE_SIZE }, [filter, modeFilter, page]);
      var deliveries = useLoader(React, api, "wb.eventDeliveryList", { status: filter || void 0, mode: modeFilter || void 0, page, pageSize: PAGE_SIZE }, [filter, modeFilter, page]);
      var subs = useLoader(React, api, "wb.eventSubscriptionList", {}, []);
      var domainsView = useLoader(React, api, "wb.eventDomains", {}, []);
      var active = tab === "events" ? events : tab === "deliveries" ? deliveries : tab === "domains" ? domainsView : subs;
      React.useEffect(function() {
        setFilter("");
        setModeFilter("");
        setPage(1);
      }, [tab]);
      React.useEffect(function() {
        if (!auto) return void 0;
        var timer = setInterval(function() {
          overview.reload();
          active.reload();
        }, 5e3);
        return function() {
          clearInterval(timer);
        };
      }, [auto, tab]);
      React.useEffect(function() {
        if (!active.state.loading && !active.state.error) setUpdatedAt(Date.now());
      }, [active.state.loading, active.state.error]);
      function reload() {
        overview.reload();
        if (tab === "subscriptions") subs.reload();
        else if (tab === "deliveries") deliveries.reload();
        else if (tab === "domains") domainsView.reload();
        else events.reload();
      }
      function replay(delivery) {
        if (!window.confirm(t("queue_replay_confirm"))) return;
        api.post("/domains/wb-shell/actions/wb.eventReplay", { deliveryId: delivery.id }).then(readResult).then(function() {
          setNote(t("queue_replay_ok"));
          reload();
        }).catch(function(e) {
          setNote(String(e && e.message || e));
        });
      }
      function cleanup() {
        if (!window.confirm(t("queue_cleanup_confirm"))) return;
        api.post("/domains/wb-shell/actions/wb.eventCleanup", { olderThanDays: 7 }).then(readResult).then(function(r) {
          setNote(t("queue_cleanup_ok") + " " + String(r && r.deleted || 0));
          reload();
        }).catch(function(e) {
          setNote(String(e && e.message || e));
        });
      }
      var stats = overview.state.data || { events: {}, deliveries: {}, subscriptions: 0 };
      var tabs = [
        ["domains", t("queue_tab_domains")],
        ["events", t("queue_tab_events")],
        ["deliveries", t("queue_tab_deliveries")],
        ["subscriptions", t("queue_tab_subscriptions")]
      ];
      var filters = tab === "events" ? ["queued", "done", "dead"] : tab === "deliveries" ? ["pending", "running", "done", "dead"] : [];
      var modes = tab === "events" || tab === "deliveries" ? ["", "broadcast", "targeted"] : [];
      var eventCounts = stats.events || {};
      var deliveryCounts = stats.deliveries || {};
      var countOf = function(bucket, key) {
        var n = bucket[key];
        return typeof n === "number" ? n : 0;
      };
      var queued = countOf(eventCounts, "queued");
      var pending = countOf(deliveryCounts, "pending") + countOf(deliveryCounts, "running");
      var done = countOf(eventCounts, "done");
      var dead = countOf(eventCounts, "dead") + countOf(deliveryCounts, "dead");
      var subscriptions = typeof stats.subscriptions === "number" ? stats.subscriptions : 0;
      var types = Array.isArray(stats.types) ? stats.types : [];
      var typeTotal = types.reduce(function(sum, item) {
        return sum + (Number(item.count) || 0);
      }, 0);
      var health = dead > 0 ? "dead" : queued + pending > 0 ? "busy" : "idle";
      var healthText = health === "dead" ? t("queue_health_dead") : health === "busy" ? t("queue_health_busy") : t("queue_health_idle");
      var healthHint = health === "dead" ? t("queue_health_dead_hint") : health === "busy" ? t("queue_health_busy_hint") : t("queue_health_idle_hint");
      var body = [];
      body.push(
        jsx2.jsxs("section", { className: "wbq-hero", children: [
          jsx2.jsxs("div", { className: "wbq-hero-top", children: [
            jsx2.jsxs("div", { className: "wbq-health", children: [
              jsx2.jsx("span", { className: "wbq-dot h-" + health, "aria-hidden": "true" }),
              jsx2.jsxs("div", { className: "wbq-health-text", children: [
                jsx2.jsx("b", { children: healthText }),
                jsx2.jsx("span", { className: "wbq-muted", children: healthHint })
              ] })
            ] }),
            jsx2.jsxs("div", { className: "wbq-hero-actions", children: [
              updatedAt ? jsx2.jsx("span", { className: "wbq-updated", children: t("queue_updated_at").replace("{t}", clockText(updatedAt)) }) : null,
              jsx2.jsx("button", {
                type: "button",
                className: "wbq-filter" + (auto ? " on" : ""),
                "aria-pressed": auto,
                onClick: function() {
                  setAuto(!auto);
                },
                children: t("queue_auto")
              }),
              jsx2.jsx("button", { type: "button", className: "wb-btn ghost", onClick: reload, children: t("queue_refresh") }),
              tab === "events" || tab === "deliveries" ? jsx2.jsx("button", { type: "button", className: "wb-btn danger", onClick: cleanup, children: t("queue_cleanup") }) : null
            ] })
          ] }),
          jsx2.jsxs("div", { className: "wbq-stats", children: [
            metricTile(jsx2, t("queue_queued"), queued, queued ? "warn" : ""),
            metricTile(jsx2, t("queue_pending"), pending, pending ? "warn" : ""),
            metricTile(jsx2, t("queue_done"), done, "ok"),
            metricTile(jsx2, t("queue_dead"), dead, dead ? "danger" : ""),
            metricTile(jsx2, t("queue_subscriptions"), subscriptions, "")
          ] })
        ] })
      );
      var recent = (events.state.data && events.state.data.items || []).slice(0, 4);
      var now = Date.now();
      body.push(
        jsx2.jsxs("div", { className: "wbq-insight", children: [
          panel(jsx2, t("queue_types"), typeTotal ? t("queue_total_events").replace("{n}", String(typeTotal)) : "", typeBars(jsx2, t, types)),
          panel(
            jsx2,
            t("queue_recent"),
            recent.length ? t("queue_total_events").replace("{n}", String(recent.length)) : "",
            recent.length ? jsx2.jsx("ul", { className: "wbq-recent", children: recent.map(function(r, i) {
              return jsx2.jsxs("li", { key: i, className: "wbq-recent-item", children: [
                jsx2.jsx("code", { className: "wbq-recent-type", title: r.type, children: r.type }),
                statusBadge(jsx2, lang, r.status),
                jsx2.jsx("time", { className: "wbq-muted", title: timeText(r.created_at), children: agoText(t, r.created_at, now) })
              ] });
            }) }) : jsx2.jsx("div", { className: "wbq-hint", children: t("queue_empty") })
          )
        ] })
      );
      body.push(
        jsx2.jsxs("div", { className: "wbq-toolbar", children: [
          jsx2.jsx("div", { className: "wbq-tabs", role: "tablist", children: tabs.map(function(item) {
            return jsx2.jsx("button", {
              key: item[0],
              type: "button",
              role: "tab",
              "aria-selected": tab === item[0],
              className: "wbq-tab" + (tab === item[0] ? " on" : ""),
              onClick: function() {
                setTab(item[0]);
              },
              children: item[1]
            });
          }) }),
          filters.length ? jsx2.jsx("div", { className: "wbq-filters", children: [""].concat(filters).map(function(s) {
            var label = s ? statusText(lang, s) : t("queue_all_status");
            var on = filter === s;
            return jsx2.jsx("button", {
              key: s || "all",
              type: "button",
              className: "wbq-filter" + (on ? " on" : "") + (s ? " s-" + s : ""),
              "aria-pressed": on,
              onClick: function() {
                setFilter(s);
                setPage(1);
              },
              children: label
            });
          }) }) : null,
          modes.length ? jsx2.jsx("div", { className: "wbq-filters wbq-mode-filters", children: modes.map(function(m) {
            var on = modeFilter === m;
            return jsx2.jsx("button", {
              key: m || "all",
              type: "button",
              className: "wbq-filter kw" + (on ? " on" : ""),
              "aria-pressed": on,
              onClick: function() {
                setModeFilter(m);
                setPage(1);
              },
              children: m ? modeText(lang, m) : t("queue_all_modes")
            });
          }) }) : null
        ] })
      );
      if (note) body.push(jsx2.jsx("div", { className: "wbq-note", role: "status", children: note }));
      if (active.state.error) body.push(jsx2.jsx("div", { className: "wbq-note err", role: "alert", children: active.state.error }));
      var rows = active.state.data && active.state.data.items || [];
      var showing = active.state.loading && !rows.length;
      if (tab === "domains") {
        var list = active.state.data && active.state.data.domains || [];
        if (showing) body.push(loadingRows(jsx2, t, 2));
        else body.push(list.length ? jsx2.jsx("div", { className: "wbq-domains", children: list.map(function(d) {
          var pub = d.publishes || [];
          var recv = d.receives || [];
          var lis = d.listens || [];
          return jsx2.jsxs("article", { key: d.domain, className: "wbq-domain" + (d.error ? " has-error" : ""), children: [
            jsx2.jsxs("header", { className: "wbq-domain-head", children: [
              jsx2.jsx("b", { className: "wbq-domain-title", children: d.title }),
              jsx2.jsx("code", { className: "wbq-domain-id", children: d.domain }),
              d.error ? jsx2.jsx("span", { className: "wbq-badge s-dead", children: t("queue_domain_error") }) : null
            ] }),
            jsx2.jsxs("div", { className: "wbq-domain-row", children: [
              jsx2.jsx("span", { className: "wbq-domain-label", children: t("queue_domain_publishes") }),
              pub.length ? jsx2.jsx("div", { className: "wbq-chips", children: pub.map(function(p) {
                return jsx2.jsxs("span", { key: p.type, className: "wbq-chip", title: p.description || "", children: [
                  jsx2.jsx("code", { children: p.type }),
                  modeBadge(jsx2, lang, p.mode),
                  p.mode === "targeted" && (p.targets || []).length ? jsx2.jsx("em", { className: "wbq-chip-meta", children: (p.targets || []).join(", ") }) : null,
                  jsx2.jsx("em", { className: "wbq-chip-meta", children: t("queue_sent") + " " + String(p.sent || 0) })
                ] });
              }) }) : jsx2.jsx("span", { className: "wbq-hint", children: t("queue_no_publish") })
            ] }),
            jsx2.jsxs("div", { className: "wbq-domain-row", children: [
              jsx2.jsx("span", { className: "wbq-domain-label", children: t("queue_domain_receives") }),
              recv.length ? jsx2.jsx("div", { className: "wbq-chips", children: recv.map(function(r) {
                return jsx2.jsxs("span", { key: r.type + "@" + r.from, className: "wbq-chip", children: [
                  jsx2.jsx("code", { children: r.type }),
                  jsx2.jsx("em", { className: "wbq-chip-meta", children: r.from + " \xB7 " + String(r.delivered || 0) })
                ] });
              }) }) : jsx2.jsx("span", { className: "wbq-hint", children: t("queue_no_receive") })
            ] }),
            jsx2.jsxs("div", { className: "wbq-domain-row", children: [
              jsx2.jsx("span", { className: "wbq-domain-label", children: t("queue_domain_listens") }),
              lis.length ? jsx2.jsx("div", { className: "wbq-chips", children: lis.map(function(l) {
                return jsx2.jsxs("span", { key: l.type, className: "wbq-chip" + (l.registered ? "" : " off"), title: l.description || "", children: [
                  jsx2.jsx("code", { children: l.type }),
                  jsx2.jsx("em", { className: "wbq-chip-meta", children: l.registered ? (l.actions || []).join(", ") : t("queue_not_registered") })
                ] });
              }) }) : jsx2.jsx("span", { className: "wbq-hint", children: t("queue_no_listen") })
            ] })
          ] }, d.domain);
        }) }) : emptyState(jsx2, t, t("queue_empty_domains")));
      } else if (tab === "subscriptions") {
        if (showing) body.push(loadingRows(jsx2, t, 4));
        else body.push(rows.length ? tableWrap(jsx2, [
          jsx2.jsx("th", { key: "d", children: t("queue_domain") }),
          jsx2.jsx("th", { key: "t", children: t("queue_event_type") }),
          jsx2.jsx("th", { key: "a", children: t("queue_action") }),
          jsx2.jsx("th", { key: "c", children: t("queue_created") })
        ], rows.map(function(r, i) {
          return jsx2.jsxs("tr", { children: [
            jsx2.jsx("td", { className: "wbq-cell-strong", children: r.domain }),
            jsx2.jsx("td", { children: jsx2.jsx("code", { children: r.type }) }),
            jsx2.jsx("td", { children: jsx2.jsx("code", { children: r.action }) }),
            jsx2.jsx("td", { className: "wbq-cell-time", title: timeText(r.created_at), children: timeText(r.created_at) })
          ] }, i);
        })) : emptyState(jsx2, t, t("queue_empty_subs")));
      } else if (tab === "deliveries") {
        if (showing) body.push(loadingRows(jsx2, t, 8));
        else body.push(rows.length ? tableWrap(jsx2, [
          jsx2.jsx("th", { key: "t", children: t("queue_event_type") }),
          jsx2.jsx("th", { key: "m", children: t("queue_mode") }),
          jsx2.jsx("th", { key: "d", children: t("queue_domain") }),
          jsx2.jsx("th", { key: "a", children: t("queue_action") }),
          jsx2.jsx("th", { key: "s", children: t("queue_status") }),
          jsx2.jsx("th", { key: "n", children: t("queue_attempts") }),
          jsx2.jsx("th", { key: "x", children: t("queue_next_at") }),
          jsx2.jsx("th", { key: "e", children: t("queue_last_error") }),
          jsx2.jsx("th", { key: "o", children: "" })
        ], rows.map(function(r, i) {
          return jsx2.jsxs("tr", { className: r.status === "dead" ? "is-dead" : "", children: [
            jsx2.jsx("td", { children: jsx2.jsx("code", { children: r.event_type || "\u2014" }) }),
            jsx2.jsx("td", { children: modeBadge(jsx2, lang, r.delivery_mode) }),
            jsx2.jsx("td", { className: "wbq-cell-strong", children: r.domain }),
            jsx2.jsx("td", { children: jsx2.jsx("code", { children: r.action }) }),
            jsx2.jsx("td", { children: statusBadge(jsx2, lang, r.status) }),
            jsx2.jsx("td", { className: "wbq-cell-num", children: String(r.attempts || 0) }),
            jsx2.jsx("td", { className: "wbq-cell-time", children: r.status === "done" ? "\u2014" : timeText(r.next_at) }),
            jsx2.jsx("td", { className: "wbq-err", children: r.last_error || "\u2014" }),
            jsx2.jsx("td", { className: "wbq-cell-action", children: r.status === "dead" || r.status === "pending" && r.last_error ? jsx2.jsx("button", { type: "button", className: "wb-btn ghost wbq-replay", onClick: function() {
              replay(r);
            }, children: t("queue_replay") }) : null })
          ] }, i);
        })) : emptyState(jsx2, t, t("queue_empty_deliveries")));
      } else {
        if (showing) body.push(loadingRows(jsx2, t, 5));
        else body.push(rows.length ? tableWrap(jsx2, [
          jsx2.jsx("th", { key: "t", children: t("queue_event_type") }),
          jsx2.jsx("th", { key: "s", children: t("queue_source") }),
          jsx2.jsx("th", { key: "m", children: t("queue_mode") }),
          jsx2.jsx("th", { key: "st", children: t("queue_status") }),
          jsx2.jsx("th", { key: "c", children: t("queue_created") }),
          jsx2.jsx("th", { key: "p", children: t("queue_payload") })
        ], rows.map(function(r, i) {
          return jsx2.jsxs("tr", { children: [
            jsx2.jsx("td", { children: jsx2.jsx("code", { children: r.type }) }),
            jsx2.jsx("td", { className: "wbq-cell-strong", children: r.source }),
            jsx2.jsx("td", { children: modeBadge(jsx2, lang, r.mode) }),
            jsx2.jsx("td", { children: statusBadge(jsx2, lang, r.status) }),
            jsx2.jsx("td", { className: "wbq-cell-time", title: timeText(r.created_at), children: agoText(t, r.created_at, now) }),
            jsx2.jsx("td", { className: "wbq-payload", children: jsx2.jsx("code", { title: r.payload || "", children: r.payload || "\u2014" }) })
          ] }, i);
        })) : emptyState(jsx2, t, t("queue_empty_events")));
      }
      var meta = (tab === "subscriptions" ? subs : tab === "deliveries" ? deliveries : events).state;
      var paging = (tab === "events" || tab === "deliveries") && meta.data && meta.data.pages ? meta.data : null;
      if (paging) {
        body.push(jsx2.jsxs("div", { className: "wbq-pager", children: [
          jsx2.jsx("button", { type: "button", className: "wb-btn ghost", disabled: page <= 1, onClick: function() {
            setPage(page - 1);
          }, children: t("queue_prev") }),
          jsx2.jsx("span", { className: "wbq-muted", children: page + " / " + paging.pages + " \xB7 " + paging.total }),
          jsx2.jsx("button", { type: "button", className: "wb-btn ghost", disabled: page >= paging.pages, onClick: function() {
            setPage(page + 1);
          }, children: t("queue_next") })
        ] }));
      }
      return jsx2.jsxs("div", { className: "wb-root", children: [
        jsx2.jsxs("div", { className: "wb-inner wb-wide", children: [
          deps.head(t("tab_queue"), t("queue_desc")) || null,
          jsx2.jsx("div", { className: "wbq", children: body })
        ] })
      ] });
    }
    function QueueView(props) {
      return queuePage(props);
    }
    module2.exports = { queuePage, QueueView, readResult, agoText, clockText, statusText };
  }
});

// packages/addons/lib/icon-label.cjs
var require_icon_label = __commonJS({
  "packages/addons/lib/icon-label.cjs"(exports2, module2) {
    "use strict";
    var VISUALLY_HIDDEN = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
    module2.exports = function iconLabel(h2, Icon2, text, options) {
      var opts = options || {};
      var cls = "wb-icon-label" + (opts.short ? " wb-icon-label-short" : "") + (Icon2 ? "" : " wb-icon-label-fallback");
      return h2(
        "span",
        { className: cls, title: typeof text === "string" ? text : void 0 },
        Icon2 ? h2(Icon2, { size: 14, strokeWidth: 2, "aria-hidden": true, focusable: false }) : null,
        h2("span", { className: "wb-icon-label-text" }, text)
      );
    };
    module2.exports.styles = ".wb-icon-label{display:inline-flex;align-items:center;gap:5px;max-width:100%;vertical-align:middle;text-align:start}.wb-icon-label>svg{flex:none}.wb-icon-label>span{min-width:0;overflow-wrap:anywhere}button .wb-icon-label:not(.wb-icon-label-fallback) .wb-icon-label-text{" + VISUALLY_HIDDEN + "}button .wb-icon-label.wb-icon-label-short .wb-icon-label-text{position:static;width:auto;height:auto;margin:0;overflow:visible;clip-path:none;white-space:normal}";
  }
});

// packages/addons/lib/icons.cjs
var require_icons = __commonJS({
  "packages/addons/lib/icons.cjs"(exports2, module2) {
    "use strict";
    var h2 = require("react").createElement;
    function create(prefix, glyphs, options) {
      var opts = options || {};
      var ICONS = Object.assign({}, glyphs);
      function Icon2(props) {
        var C = ICONS[props.name] || (opts.fallback ? ICONS[opts.fallback] : null);
        if (!C) return null;
        var size = typeof opts.sizeOf === "function" ? opts.sizeOf(props) : props.size || 14;
        var cls = prefix + "-svg" + (opts.classNameAppend && props.className ? " " + props.className : "");
        var attrs = {
          size,
          strokeWidth: props.strokeWidth || 2,
          "aria-hidden": "true",
          className: cls
        };
        if (opts.focusable) attrs.focusable = false;
        return h2(C, attrs);
      }
      var set = { ICONS, Icon: Icon2 };
      set.label = function(name, text, options2) {
        return require_icon_label()(h2, function NamedIcon(props) {
          return h2(Icon2, Object.assign({ name }, props));
        }, text, options2);
      };
      if (opts.tabIcon) {
        set.tabIcon = function(name) {
          return function TabIcon() {
            return h2(Icon2, { name, size: 14 });
          };
        };
      }
      return set;
    }
    module2.exports = { create };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/activity.mjs
var activity_exports = {};
__export(activity_exports, {
  __iconData: () => __iconData2,
  default: () => Activity
});
var __iconData2, Activity;
var init_activity = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/activity.mjs"() {
    init_createLucideIcon();
    __iconData2 = {
      name: "activity",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
            key: "169zse"
          }
        ]
      ]
    };
    __iconData2.node;
    Activity = createLucideIcon(__iconData2);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/bot.mjs
var bot_exports = {};
__export(bot_exports, {
  __iconData: () => __iconData3,
  default: () => Bot
});
var __iconData3, Bot;
var init_bot = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/bot.mjs"() {
    init_createLucideIcon();
    __iconData3 = {
      name: "bot",
      size: 24,
      node: [
        ["path", { d: "M12 8V4H8", key: "hb8ula" }],
        ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }],
        ["path", { d: "M2 14h2", key: "vft8re" }],
        ["path", { d: "M20 14h2", key: "4cs60a" }],
        ["path", { d: "M15 13v2", key: "1xurst" }],
        ["path", { d: "M9 13v2", key: "rq6x2g" }]
      ]
    };
    __iconData3.node;
    Bot = createLucideIcon(__iconData3);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/calendar-clock.mjs
var calendar_clock_exports = {};
__export(calendar_clock_exports, {
  __iconData: () => __iconData4,
  default: () => CalendarClock
});
var __iconData4, CalendarClock;
var init_calendar_clock = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/calendar-clock.mjs"() {
    init_createLucideIcon();
    __iconData4 = {
      name: "calendar-clock",
      size: 24,
      node: [
        ["path", { d: "M16 14v2.2l1.6 1", key: "fo4ql5" }],
        ["path", { d: "M16 2v3", key: "otl347" }],
        ["path", { d: "M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338", key: "7hb8p4" }],
        ["path", { d: "M3 9h5.859", key: "numkqi" }],
        ["path", { d: "M8 2v3", key: "1ioesn" }],
        ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
      ]
    };
    __iconData4.node;
    CalendarClock = createLucideIcon(__iconData4);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/clock.mjs
var clock_exports = {};
__export(clock_exports, {
  __iconData: () => __iconData5,
  default: () => Clock
});
var __iconData5, Clock;
var init_clock = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/clock.mjs"() {
    init_createLucideIcon();
    __iconData5 = {
      name: "clock",
      size: 24,
      node: [
        ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
        ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }]
      ]
    };
    __iconData5.node;
    Clock = createLucideIcon(__iconData5);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/hourglass.mjs
var hourglass_exports = {};
__export(hourglass_exports, {
  __iconData: () => __iconData6,
  default: () => Hourglass
});
var __iconData6, Hourglass;
var init_hourglass = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/hourglass.mjs"() {
    init_createLucideIcon();
    __iconData6 = {
      name: "hourglass",
      size: 24,
      node: [
        ["path", { d: "M5 22h14", key: "ehvnwv" }],
        ["path", { d: "M5 2h14", key: "pdyrp9" }],
        [
          "path",
          {
            d: "M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22",
            key: "1d314k"
          }
        ],
        [
          "path",
          {
            d: "M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2",
            key: "1vvvr6"
          }
        ]
      ]
    };
    __iconData6.node;
    Hourglass = createLucideIcon(__iconData6);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/repeat.mjs
var repeat_exports = {};
__export(repeat_exports, {
  __iconData: () => __iconData7,
  default: () => Repeat
});
var __iconData7, Repeat;
var init_repeat = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/repeat.mjs"() {
    init_createLucideIcon();
    __iconData7 = {
      name: "repeat",
      size: 24,
      node: [
        ["path", { d: "m17 2 4 4-4 4", key: "nntrym" }],
        ["path", { d: "M3 11v-1a4 4 0 0 1 4-4h14", key: "84bu3i" }],
        ["path", { d: "m7 22-4-4 4-4", key: "1wqhfi" }],
        ["path", { d: "M21 13v1a4 4 0 0 1-4 4H3", key: "1rx37r" }]
      ]
    };
    __iconData7.node;
    Repeat = createLucideIcon(__iconData7);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/send.mjs
var send_exports = {};
__export(send_exports, {
  __iconData: () => __iconData8,
  default: () => Send
});
var __iconData8, Send;
var init_send = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/send.mjs"() {
    init_createLucideIcon();
    __iconData8 = {
      name: "send",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
            key: "1ffxy3"
          }
        ],
        ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
      ]
    };
    __iconData8.node;
    Send = createLucideIcon(__iconData8);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/sparkles.mjs
var sparkles_exports = {};
__export(sparkles_exports, {
  __iconData: () => __iconData9,
  default: () => Sparkles
});
var __iconData9, Sparkles;
var init_sparkles = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/sparkles.mjs"() {
    init_createLucideIcon();
    __iconData9 = {
      name: "sparkles",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
            key: "1s2grr"
          }
        ],
        ["path", { d: "M20 2v4", key: "1rf3ol" }],
        ["path", { d: "M22 4h-4", key: "gwowj6" }],
        ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }]
      ],
      aliases: ["stars"]
    };
    __iconData9.node;
    Sparkles = createLucideIcon(__iconData9);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/alarm-clock.mjs
var alarm_clock_exports = {};
__export(alarm_clock_exports, {
  __iconData: () => __iconData10,
  default: () => AlarmClock
});
var __iconData10, AlarmClock;
var init_alarm_clock = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/alarm-clock.mjs"() {
    init_createLucideIcon();
    __iconData10 = {
      name: "alarm-clock",
      size: 24,
      node: [
        ["circle", { cx: "12", cy: "13", r: "8", key: "3y4lt7" }],
        ["path", { d: "M12 9v4l2 2", key: "1c63tq" }],
        ["path", { d: "M5 3 2 6", key: "18tl5t" }],
        ["path", { d: "m22 6-3-3", key: "1opdir" }],
        ["path", { d: "M6.38 18.7 4 21", key: "17xu3x" }],
        ["path", { d: "M17.64 18.67 20 21", key: "kv2oe2" }]
      ]
    };
    __iconData10.node;
    AlarmClock = createLucideIcon(__iconData10);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/triangle-exclamation-point.mjs
var __iconData11, TriangleExclamationPoint;
var init_triangle_exclamation_point = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/triangle-exclamation-point.mjs"() {
    init_createLucideIcon();
    __iconData11 = {
      name: "triangle-exclamation-point",
      size: 24,
      node: [
        [
          "path",
          {
            d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
            key: "wmoenq"
          }
        ],
        ["path", { d: "M12 9v4", key: "juzpu7" }],
        ["path", { d: "M12 17h.01", key: "p32p05" }]
      ],
      aliases: ["alert-triangle", "triangle-alert"]
    };
    __iconData11.node;
    TriangleExclamationPoint = createLucideIcon(__iconData11);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/alert-triangle.mjs
var alert_triangle_exports = {};
__export(alert_triangle_exports, {
  default: () => TriangleExclamationPoint
});
var init_alert_triangle = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/alert-triangle.mjs"() {
    init_triangle_exclamation_point();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/circle-check-big.mjs
var __iconData12, CircleCheckBig;
var init_circle_check_big = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/circle-check-big.mjs"() {
    init_createLucideIcon();
    __iconData12 = {
      name: "circle-check-big",
      size: 24,
      node: [
        ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
        ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
      ],
      aliases: ["check-circle"]
    };
    __iconData12.node;
    CircleCheckBig = createLucideIcon(__iconData12);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/check-circle.mjs
var check_circle_exports = {};
__export(check_circle_exports, {
  default: () => CircleCheckBig
});
var init_check_circle = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/check-circle.mjs"() {
    init_circle_check_big();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/database.mjs
var database_exports = {};
__export(database_exports, {
  __iconData: () => __iconData13,
  default: () => Database
});
var __iconData13, Database;
var init_database = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/database.mjs"() {
    init_createLucideIcon();
    __iconData13 = {
      name: "database",
      size: 24,
      node: [
        ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
        ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
        ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
      ]
    };
    __iconData13.node;
    Database = createLucideIcon(__iconData13);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/hand.mjs
var hand_exports = {};
__export(hand_exports, {
  __iconData: () => __iconData14,
  default: () => Hand
});
var __iconData14, Hand;
var init_hand = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/hand.mjs"() {
    init_createLucideIcon();
    __iconData14 = {
      name: "hand",
      size: 24,
      node: [
        ["path", { d: "M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2", key: "1fvzgz" }],
        ["path", { d: "M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2", key: "1kc0my" }],
        ["path", { d: "M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8", key: "10h0bg" }],
        [
          "path",
          {
            d: "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15",
            key: "1s1gnw"
          }
        ]
      ]
    };
    __iconData14.node;
    Hand = createLucideIcon(__iconData14);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rotate-ccw-clock.mjs
var __iconData15, RotateCcwClock;
var init_rotate_ccw_clock = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rotate-ccw-clock.mjs"() {
    init_createLucideIcon();
    __iconData15 = {
      name: "rotate-ccw-clock",
      size: 24,
      node: [
        ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
        ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
        ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
      ],
      aliases: ["history"]
    };
    __iconData15.node;
    RotateCcwClock = createLucideIcon(__iconData15);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/history.mjs
var history_exports = {};
__export(history_exports, {
  default: () => RotateCcwClock
});
var init_history = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/history.mjs"() {
    init_rotate_ccw_clock();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/layers.mjs
var layers_exports = {};
__export(layers_exports, {
  __iconData: () => __iconData16,
  default: () => Layers
});
var __iconData16, Layers;
var init_layers = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/layers.mjs"() {
    init_createLucideIcon();
    __iconData16 = {
      name: "layers",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
            key: "zw3jo"
          }
        ],
        [
          "path",
          {
            d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
            key: "1wduqc"
          }
        ],
        [
          "path",
          {
            d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
            key: "kqbvx6"
          }
        ]
      ],
      aliases: ["layers-3"]
    };
    __iconData16.node;
    Layers = createLucideIcon(__iconData16);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.mjs
var list_exports = {};
__export(list_exports, {
  __iconData: () => __iconData17,
  default: () => List
});
var __iconData17, List;
var init_list = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.mjs"() {
    init_createLucideIcon();
    __iconData17 = {
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
    __iconData17.node;
    List = createLucideIcon(__iconData17);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/pencil.mjs
var pencil_exports = {};
__export(pencil_exports, {
  __iconData: () => __iconData18,
  default: () => Pencil
});
var __iconData18, Pencil;
var init_pencil = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/pencil.mjs"() {
    init_createLucideIcon();
    __iconData18 = {
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
    __iconData18.node;
    Pencil = createLucideIcon(__iconData18);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/plus.mjs
var plus_exports = {};
__export(plus_exports, {
  __iconData: () => __iconData19,
  default: () => Plus
});
var __iconData19, Plus;
var init_plus = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/plus.mjs"() {
    init_createLucideIcon();
    __iconData19 = {
      name: "plus",
      size: 24,
      node: [
        ["path", { d: "M5 12h14", key: "1ays0h" }],
        ["path", { d: "M12 5v14", key: "s699le" }]
      ]
    };
    __iconData19.node;
    Plus = createLucideIcon(__iconData19);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/play.mjs
var play_exports = {};
__export(play_exports, {
  __iconData: () => __iconData20,
  default: () => Play
});
var __iconData20, Play;
var init_play = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/play.mjs"() {
    init_createLucideIcon();
    __iconData20 = {
      name: "play",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
            key: "10ikf1"
          }
        ]
      ]
    };
    __iconData20.node;
    Play = createLucideIcon(__iconData20);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/power.mjs
var power_exports = {};
__export(power_exports, {
  __iconData: () => __iconData21,
  default: () => Power
});
var __iconData21, Power;
var init_power = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/power.mjs"() {
    init_createLucideIcon();
    __iconData21 = {
      name: "power",
      size: 24,
      node: [
        ["path", { d: "M12 2v10", key: "mnfbl" }],
        ["path", { d: "M18.4 6.6a9 9 0 1 1-12.77.04", key: "obofu9" }]
      ]
    };
    __iconData21.node;
    Power = createLucideIcon(__iconData21);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/power-off.mjs
var power_off_exports = {};
__export(power_off_exports, {
  __iconData: () => __iconData22,
  default: () => PowerOff
});
var __iconData22, PowerOff;
var init_power_off = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/power-off.mjs"() {
    init_createLucideIcon();
    __iconData22 = {
      name: "power-off",
      size: 24,
      node: [
        ["path", { d: "M18.36 6.64A9 9 0 0 1 20.77 15", key: "dxknvb" }],
        ["path", { d: "M6.16 6.16a9 9 0 1 0 12.68 12.68", key: "1x7qb5" }],
        ["path", { d: "M12 2v4", key: "3427ic" }],
        ["path", { d: "m2 2 20 20", key: "1ooewy" }]
      ]
    };
    __iconData22.node;
    PowerOff = createLucideIcon(__iconData22);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/radio.mjs
var radio_exports = {};
__export(radio_exports, {
  __iconData: () => __iconData23,
  default: () => Radio
});
var __iconData23, Radio;
var init_radio = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/radio.mjs"() {
    init_createLucideIcon();
    __iconData23 = {
      name: "radio",
      size: 24,
      node: [
        ["path", { d: "M16.247 7.761a6 6 0 0 1 0 8.478", key: "1fwjs5" }],
        ["path", { d: "M19.075 4.933a10 10 0 0 1 0 14.134", key: "ehdyv1" }],
        ["path", { d: "M4.925 19.067a10 10 0 0 1 0-14.134", key: "1q22gi" }],
        ["path", { d: "M7.753 16.239a6 6 0 0 1 0-8.478", key: "r2q7qm" }],
        ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
      ]
    };
    __iconData23.node;
    Radio = createLucideIcon(__iconData23);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/shield-check.mjs
var shield_check_exports = {};
__export(shield_check_exports, {
  __iconData: () => __iconData24,
  default: () => ShieldCheck
});
var __iconData24, ShieldCheck;
var init_shield_check = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/shield-check.mjs"() {
    init_createLucideIcon();
    __iconData24 = {
      name: "shield-check",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
            key: "oel41y"
          }
        ],
        ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
      ]
    };
    __iconData24.node;
    ShieldCheck = createLucideIcon(__iconData24);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/skip-forward.mjs
var skip_forward_exports = {};
__export(skip_forward_exports, {
  __iconData: () => __iconData25,
  default: () => SkipForward
});
var __iconData25, SkipForward;
var init_skip_forward = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/skip-forward.mjs"() {
    init_createLucideIcon();
    __iconData25 = {
      name: "skip-forward",
      size: 24,
      node: [
        ["path", { d: "M21 4v16", key: "7j8fe9" }],
        [
          "path",
          {
            d: "M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z",
            key: "zs4d6"
          }
        ]
      ]
    };
    __iconData25.node;
    SkipForward = createLucideIcon(__iconData25);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/sliders-horizontal.mjs
var sliders_horizontal_exports = {};
__export(sliders_horizontal_exports, {
  __iconData: () => __iconData26,
  default: () => SlidersHorizontal
});
var __iconData26, SlidersHorizontal;
var init_sliders_horizontal = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/sliders-horizontal.mjs"() {
    init_createLucideIcon();
    __iconData26 = {
      name: "sliders-horizontal",
      size: 24,
      node: [
        ["path", { d: "M10 5H3", key: "1qgfaw" }],
        ["path", { d: "M12 19H3", key: "yhmn1j" }],
        ["path", { d: "M14 3v4", key: "1sua03" }],
        ["path", { d: "M16 17v4", key: "1q0r14" }],
        ["path", { d: "M21 12h-9", key: "1o4lsq" }],
        ["path", { d: "M21 19h-5", key: "1rlt1p" }],
        ["path", { d: "M21 5h-7", key: "1oszz2" }],
        ["path", { d: "M8 10v4", key: "tgpxqk" }],
        ["path", { d: "M8 12H3", key: "a7s4jb" }]
      ]
    };
    __iconData26.node;
    SlidersHorizontal = createLucideIcon(__iconData26);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/timer.mjs
var timer_exports = {};
__export(timer_exports, {
  __iconData: () => __iconData27,
  default: () => Timer
});
var __iconData27, Timer;
var init_timer = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/timer.mjs"() {
    init_createLucideIcon();
    __iconData27 = {
      name: "timer",
      size: 24,
      node: [
        ["line", { x1: "10", x2: "14", y1: "2", y2: "2", key: "14vaq8" }],
        ["line", { x1: "12", x2: "15", y1: "14", y2: "11", key: "17fdiu" }],
        ["circle", { cx: "12", cy: "14", r: "8", key: "1e1u0o" }]
      ]
    };
    __iconData27.node;
    Timer = createLucideIcon(__iconData27);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/trash.mjs
var __iconData28, Trash;
var init_trash = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/trash.mjs"() {
    init_createLucideIcon();
    __iconData28 = {
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
    __iconData28.node;
    Trash = createLucideIcon(__iconData28);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/trash-2.mjs
var trash_2_exports = {};
__export(trash_2_exports, {
  default: () => Trash
});
var init_trash_2 = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/trash-2.mjs"() {
    init_trash();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/x.mjs
var x_exports = {};
__export(x_exports, {
  __iconData: () => __iconData29,
  default: () => X
});
var __iconData29, X;
var init_x = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/x.mjs"() {
    init_createLucideIcon();
    __iconData29 = {
      name: "x",
      size: 24,
      node: [
        ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
        ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
      ]
    };
    __iconData29.node;
    X = createLucideIcon(__iconData29);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/zap.mjs
var zap_exports = {};
__export(zap_exports, {
  __iconData: () => __iconData30,
  default: () => Zap
});
var __iconData30, Zap;
var init_zap = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/zap.mjs"() {
    init_createLucideIcon();
    __iconData30 = {
      name: "zap",
      size: 24,
      node: [
        [
          "path",
          {
            d: "M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z",
            key: "1v7up4"
          }
        ]
      ]
    };
    __iconData30.node;
    Zap = createLucideIcon(__iconData30);
  }
});

// packages/shell/client/automation/common.cjs
var require_common = __commonJS({
  "packages/shell/client/automation/common.cjs"(exports2, module2) {
    "use strict";
    var react2 = require("react");
    var createCommon = require_client_common();
    var iconsLib = require_icons();
    var C = createCommon("wba");
    var ICON_SET = iconsLib.create("wba", {
      "activity": (init_activity(), __toCommonJS(activity_exports)).default,
      "bot": (init_bot(), __toCommonJS(bot_exports)).default,
      "calendar-clock": (init_calendar_clock(), __toCommonJS(calendar_clock_exports)).default,
      "clock": (init_clock(), __toCommonJS(clock_exports)).default,
      "hourglass": (init_hourglass(), __toCommonJS(hourglass_exports)).default,
      "repeat": (init_repeat(), __toCommonJS(repeat_exports)).default,
      "send": (init_send(), __toCommonJS(send_exports)).default,
      "sparkles": (init_sparkles(), __toCommonJS(sparkles_exports)).default,
      "alarm-clock": (init_alarm_clock(), __toCommonJS(alarm_clock_exports)).default,
      "alert-triangle": (init_alert_triangle(), __toCommonJS(alert_triangle_exports)).default,
      "check-circle": (init_check_circle(), __toCommonJS(check_circle_exports)).default,
      "database": (init_database(), __toCommonJS(database_exports)).default,
      "hand": (init_hand(), __toCommonJS(hand_exports)).default,
      "history": (init_history(), __toCommonJS(history_exports)).default,
      "layers": (init_layers(), __toCommonJS(layers_exports)).default,
      "list": (init_list(), __toCommonJS(list_exports)).default,
      "pencil": (init_pencil(), __toCommonJS(pencil_exports)).default,
      "plus": (init_plus(), __toCommonJS(plus_exports)).default,
      "play": (init_play(), __toCommonJS(play_exports)).default,
      "power": (init_power(), __toCommonJS(power_exports)).default,
      "power-off": (init_power_off(), __toCommonJS(power_off_exports)).default,
      "radio": (init_radio(), __toCommonJS(radio_exports)).default,
      "shield-check": (init_shield_check(), __toCommonJS(shield_check_exports)).default,
      "skip-forward": (init_skip_forward(), __toCommonJS(skip_forward_exports)).default,
      "sliders-horizontal": (init_sliders_horizontal(), __toCommonJS(sliders_horizontal_exports)).default,
      "timer": (init_timer(), __toCommonJS(timer_exports)).default,
      "trash-2": (init_trash_2(), __toCommonJS(trash_2_exports)).default,
      "x": (init_x(), __toCommonJS(x_exports)).default,
      "zap": (init_zap(), __toCommonJS(zap_exports)).default
    }, { fallback: "zap" });
    function icon(name, size) {
      return react2.createElement(ICON_SET.Icon, { name, size: size || 14 });
    }
    var ICONS = Object.assign({ icon }, ICON_SET);
    function hostApi(api) {
      return {
        call: function(action, args) {
          return api.post("/domains/wb-shell/actions/" + encodeURIComponent(action), args || {});
        }
      };
    }
    function autoT(t) {
      return function(key, vars) {
        var raw = String(key);
        var text = t(raw.indexOf("auto_") === 0 ? raw : "auto_" + raw.replace(/\./g, "_"));
        if (!vars) return text;
        return String(text).replace(/\{(\w+)\}/g, function(m, name) {
          return vars[name] === void 0 ? m : String(vars[name]);
        });
      };
    }
    module2.exports = Object.assign({}, C, {
      icons: ICONS,
      hostApi,
      autoT
    });
  }
});

// packages/shell/client/automation/stats.cjs
var require_stats = __commonJS({
  "packages/shell/client/automation/stats.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    var icons = require_common().icons;
    var DENIED = ["vault.*", "automation.*", "audit.*", "*.delete", "*.backup"];
    function kpiRows(s) {
      var today = s && s.today || {};
      return [
        ["total", "layers", s && s.total || 0, "stats.kpi.total", "stats.kpi.totalHint"],
        ["enabled", "power", s && s.enabled || 0, "stats.kpi.enabled", "stats.kpi.enabledHint"],
        ["ok", "check-circle", today.ok || 0, "stats.kpi.ok", "stats.kpi.okHint"],
        ["error", "alert-triangle", today.error || 0, "stats.kpi.error", "stats.kpi.errorHint"],
        ["skipped", "skip-forward", today.skipped || 0, "stats.kpi.skipped", "stats.kpi.skippedHint"]
      ];
    }
    function StatsBody(props) {
      var h2 = props.h;
      var t = props.t;
      var icon = props.icon;
      var s = props.s;
      return h2(
        "div",
        { className: "wba-panel" },
        h2("div", { className: "wba-cards" }, kpiRows(props.s).map(function(k) {
          return h2(
            "div",
            { key: k[0], className: "wba-card" },
            h2(
              "div",
              { className: "wba-card-top" },
              h2("span", { className: "wba-card-label" }, t(k[3])),
              icon ? h2("span", { className: "wba-card-ico" }, icon(k[1], 18)) : null
            ),
            h2("div", { className: "wba-card-num" }, String(k[2])),
            h2("p", { className: "wba-card-hint" }, t(k[4]))
          );
        })),
        h2(
          "div",
          { className: "wba-panel" },
          h2(
            "div",
            { className: "wba-panel-h" },
            h2("p", { className: "wba-panel-title" }, t("stats.origin.title")),
            h2("span", { className: "wba-hint" }, t("stats.origin.hint"))
          ),
          h2(
            "div",
            { className: "wba-kv" },
            h2("b", null, t("stats.origin.user")),
            h2("span", null, String(s && s.userRules || 0)),
            h2("b", null, t("stats.origin.builtin")),
            h2("span", null, String(s && s.builtinRules || 0)),
            h2("b", null, t("stats.origin.builtinEnabled")),
            h2("span", null, String(s && s.builtinEnabled || 0)),
            h2("b", null, t("stats.origin.builtinDisabled")),
            h2("span", null, String(s && s.builtinDisabled || 0)),
            h2("b", null, t("stats.origin.stale")),
            h2("span", null, String(s && s.builtinStale || 0)),
            h2("b", null, t("stats.origin.uninstalled")),
            h2("span", null, String(s && s.builtinUninstalled || 0))
          )
        ),
        h2(
          "div",
          { className: "wba-panel" },
          h2(
            "div",
            { className: "wba-panel-h" },
            h2("p", { className: "wba-panel-title" }, t("stats.allowed")),
            h2("span", { className: "wba-hint" }, t("stats.allowedHint"))
          ),
          (props.actions || []).length ? h2("div", { className: "wba-pills" }, (props.actions || []).map(function(a) {
            return h2("span", { key: a, className: "wba-chip static" }, h2("code", null, a));
          })) : h2(
            "div",
            { className: "wba-empty-inline" },
            h2("p", { className: "wba-hint" }, t("stats.allowedEmpty")),
            h2(C.Btn, { h: h2, onClick: props.onSettings }, t("stats.gotoSettings"))
          )
        ),
        h2(
          "div",
          { className: "wba-panel" },
          h2(
            "div",
            { className: "wba-panel-h" },
            h2("p", { className: "wba-panel-title" }, t("stats.denied")),
            h2("span", { className: "wba-hint" }, t("stats.deniedHint"))
          ),
          h2("div", { className: "wba-pills" }, (props.denied || DENIED).map(function(a) {
            return h2("span", { key: a, className: "wba-chip static wba-mono" }, a);
          }))
        ),
        h2(
          "div",
          { className: "wba-panel" },
          h2("p", { className: "wba-panel-title" }, t("stats.triggers")),
          h2("div", { className: "wba-kv" }, ["interval", "dailyAt", "event", "manual"].map(function(k) {
            return [h2("b", { key: k + "-k" }, t("trigger." + k)), h2("span", { key: k + "-v" }, t("stats.trigger." + k))];
          }))
        )
      );
    }
    module2.exports = function StatsView(props) {
      var h2 = props.h;
      var api = props.api;
      var React = props.React;
      var lang = props.lang === "en" ? "en" : "zh";
      var t = props.t;
      var stats = C.useLoad(React, api, "automation.stats", {}, []);
      var opts = C.useLoad(React, api, "automation.actionOptions", {}, []);
      var s = stats.data || { total: 0, enabled: 0, today: {} };
      return h2(
        "div",
        { className: "wba-wrap" },
        h2(
          "div",
          { className: "wba-head" },
          h2(
            "div",
            null,
            h2("h2", { className: "wba-title" }, t("stats.title")),
            h2("p", { className: "wba-sub" }, t("stats.subtitle"))
          ),
          h2(
            "div",
            { className: "wba-row" },
            h2(C.Btn, { h: h2, onClick: function() {
              stats.refresh();
              opts.refresh();
            } }, t("common.refresh")),
            h2(C.Btn, { h: h2, kind: "primary", onClick: function() {
              if (props.onNavigate) props.onNavigate("rules", { new: true });
            } }, icons.label("plus", t("common.createShort"), { short: true }))
          )
        ),
        stats.error ? h2(C.Notice, { h: h2, kind: "error", text: stats.error }) : null,
        s.staleCount ? h2(C.Notice, { h: h2, kind: "warn", text: t("stats.staleWarning", { n: s.staleCount }) }) : null,
        s.builtinStale || s.builtinUninstalled ? h2(C.Notice, {
          h: h2,
          kind: "warn",
          text: t("stats.originWarning", { stale: s.builtinStale || 0, uninstalled: s.builtinUninstalled || 0 })
        }) : null,
        stats.loading ? h2("div", { className: "wba-cards" }, [0, 1, 2, 3, 4].map(function(i) {
          return h2("div", { key: i, className: "wba-card" }, h2("div", { className: "wba-skel" }));
        })) : h2(StatsBody, {
          h: h2,
          t,
          icon: props.icon,
          s,
          actions: opts.data && opts.data.actions || [],
          denied: opts.data && opts.data.denied || DENIED,
          onSettings: function() {
            if (props.onNavigate) props.onNavigate("config");
          }
        })
      );
    };
    module2.exports.StatsBody = StatsBody;
    module2.exports.DENIED = DENIED;
  }
});

// packages/shell/client/automation/trigger-fields.cjs
var require_trigger_fields = __commonJS({
  "packages/shell/client/automation/trigger-fields.cjs"(exports2, module2) {
    "use strict";
    var NF = require_number_field();
    var INTERVAL = { min: 1, max: 10080, integer: true };
    var WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
    var TZ_LIST = ["Asia/Shanghai", "UTC", "Asia/Tokyo", "Europe/London", "America/New_York"];
    var DOMAIN_HINTS = ["wb-addon-connector", "wb-addon-message", "wb-addon-tasks", "wb-addon-sites"];
    var EVENT_HINTS = ["item.created", "message.sent", "task.created", "site.created"];
    function daysOf(value) {
      return String(value || "").split(",").map(function(x) {
        return Number(String(x).trim());
      }).filter(function(n) {
        return n >= 1 && n <= 7;
      });
    }
    function triggerText(rule, t) {
      var c = rule && rule.triggerConfig || {};
      var kind = c.kind || rule && rule.triggerType || "manual";
      if (kind === "interval") {
        var n = Number(c.everyMinutes) || 60;
        return n % 60 === 0 && n >= 60 ? t("trigger.interval.textHours", { n: n / 60 }) : t("trigger.interval.text", { n });
      }
      if (kind === "dailyAt") return t("trigger.daily.text", { time: c.time || "09:00", tz: c.tz || "UTC" });
      if (kind === "event") return t("trigger.event.text", { domain: c.domainId || "?", event: c.event || "?" });
      return t("trigger.manual.text");
    }
    function TriggerFields(props) {
      var h2 = props.h;
      var t = props.t;
      var form = props.form;
      var set = props.set;
      var errs = props.errs || {};
      var icon = props.icon;
      var lang = props.lang;
      function unitOf(minutes) {
        var n = Number(minutes) || 60;
        return n >= 60 && n % 60 === 0 ? 60 : 1;
      }
      function changeUnit(unit2) {
        var n = Number(form.everyMinutes);
        if (!isFinite(n)) return;
        if (unit2 === 60) {
          var hours = Math.round(n / 60);
          set("everyMinutes", (hours < 1 ? 1 : hours) * 60);
        } else set("everyMinutes", n);
      }
      function reportValid(ok) {
        if (typeof props.onValidChange === "function") props.onValidChange(ok);
      }
      function reportDraft(raw) {
        reportValid(NF.validateNumber(raw, { min: INTERVAL.min, max: INTERVAL.max, integer: INTERVAL.integer, lang }).ok);
      }
      function toggleDay(day) {
        var days2 = daysOf(form.weekdays);
        var i = days2.indexOf(day);
        if (i === -1) days2.push(day);
        else days2.splice(i, 1);
        days2.sort(function(a, b) {
          return a - b;
        });
        set("weekdays", days2.join(","));
      }
      var kinds = [
        ["interval", "timer", t("trigger.interval")],
        ["dailyAt", "alarm-clock", t("trigger.dailyAt")],
        ["event", "radio", t("trigger.event")],
        ["manual", "hand", t("trigger.manual")]
      ];
      var unit = unitOf(form.everyMinutes);
      var days = daysOf(form.weekdays);
      return h2(
        "div",
        { className: "wba-block" },
        h2(
          "div",
          { className: "wba-seg", role: "group" },
          kinds.map(function(k) {
            return h2("button", {
              key: k[0],
              type: "button",
              "aria-pressed": form.kind === k[0],
              onClick: function() {
                reportValid(true);
                set("kind", k[0]);
              }
            }, icon ? h2("span", { className: "wba-inline" }, icon(k[1], 12), k[2]) : k[2]);
          })
        ),
        form.kind === "interval" ? h2(
          "div",
          { className: "wba-grid-2" },
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("trigger.every")),
            h2(
              "div",
              { className: "wba-inline" },
              h2(NF.NumberField, {
                h: h2,
                lang,
                value: form.everyMinutes,
                min: INTERVAL.min,
                max: INTERVAL.max,
                integer: INTERVAL.integer,
                className: "wba-num",
                // 范围提示由本行下方的 wba-hint/wba-err-text 统一展示，避免出现两条提示。
                hint: false,
                ariaLabel: t("trigger.every"),
                onCommit: function(next) {
                  set("everyMinutes", next);
                },
                onDraft: reportDraft,
                onValidChange: function(ok) {
                  reportValid(ok);
                }
              }),
              h2(
                "select",
                {
                  className: "wba-input wba-w-96",
                  value: unit,
                  "aria-label": t("trigger.minutes"),
                  onChange: function(e) {
                    changeUnit(Number(e.target.value));
                  }
                },
                h2("option", { value: 1 }, t("trigger.minutes")),
                h2("option", { value: 60 }, t("trigger.hours"))
              )
            ),
            errs.everyMinutes ? h2("span", { className: "wba-err-text" }, errs.everyMinutes) : h2("span", { className: "wba-hint" }, t("trigger.intervalHint"))
          )
        ) : null,
        form.kind === "dailyAt" ? h2(
          "div",
          { className: "wba-grid-3" },
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("trigger.time")),
            h2("input", { className: "wba-input" + (errs.time ? " err" : ""), type: "time", value: form.time, onChange: function(e) {
              set("time", e.target.value);
            } }),
            errs.time ? h2("span", { className: "wba-err-text" }, errs.time) : null
          ),
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("trigger.tz")),
            h2(
              "select",
              { className: "wba-input", value: form.tz, onChange: function(e) {
                set("tz", e.target.value);
              } },
              (TZ_LIST.indexOf(form.tz) === -1 ? [form.tz].concat(TZ_LIST) : TZ_LIST).map(function(z) {
                return h2("option", { key: z, value: z }, z);
              })
            )
          ),
          h2(
            "div",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("trigger.weekdays")),
            h2(
              "div",
              { className: "wba-chips" },
              WEEKDAYS.map(function(d) {
                return h2("button", {
                  key: d,
                  type: "button",
                  className: "wba-chip",
                  "aria-pressed": days.indexOf(d) !== -1,
                  onClick: function() {
                    toggleDay(d);
                  }
                }, t("trigger.wd." + d));
              })
            ),
            h2("span", { className: "wba-hint" }, t("trigger.weekdaysHint"))
          )
        ) : null,
        form.kind === "event" ? h2(
          "div",
          { className: "wba-grid-2" },
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("trigger.domain")),
            h2("input", {
              className: "wba-input" + (errs.domainId ? " err" : ""),
              value: form.domainId,
              list: "wba-domain-hints",
              placeholder: "wb-addon-connector",
              onChange: function(e) {
                set("domainId", e.target.value);
              }
            }),
            h2("datalist", { id: "wba-domain-hints" }, DOMAIN_HINTS.map(function(d) {
              return h2("option", { key: d, value: d });
            })),
            errs.domainId ? h2("span", { className: "wba-err-text" }, errs.domainId) : h2("span", { className: "wba-hint" }, t("trigger.eventHint"))
          ),
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("trigger.eventName")),
            h2("input", {
              className: "wba-input" + (errs.event ? " err" : ""),
              value: form.event,
              list: "wba-event-hints",
              placeholder: "item.created",
              onChange: function(e) {
                set("event", e.target.value);
              }
            }),
            h2("datalist", { id: "wba-event-hints" }, EVENT_HINTS.map(function(d) {
              return h2("option", { key: d, value: d });
            })),
            errs.event ? h2("span", { className: "wba-err-text" }, errs.event) : null
          )
        ) : null,
        form.kind === "manual" ? h2("p", { className: "wba-sub" }, t("trigger.manualHint")) : null
      );
    }
    module2.exports = { TriggerFields, triggerText, daysOf, TZ_LIST, WEEKDAYS };
  }
});

// packages/shell/client/automation/agent-timing.cjs
var require_agent_timing = __commonJS({
  "packages/shell/client/automation/agent-timing.cjs"(exports2, module2) {
    "use strict";
    var NF = require_number_field();
    var trig = require_trigger_fields();
    var EVERY = { min: 1, max: 43200, integer: true };
    var AFTER = { min: 1, max: 525600, integer: true };
    var KINDS = [
      ["every", "repeat", "agent.every"],
      ["daily", "alarm-clock", "agent.daily"],
      ["weekly", "calendar-clock", "agent.weekly"],
      ["cron", "clock", "agent.cron"],
      ["rrule", "repeat", "agent.rrule"],
      ["at", "calendar-clock", "agent.at"],
      ["after", "hourglass", "agent.after"]
    ];
    function hhmm(value) {
      var s = String(value || "").trim();
      return /^\d{2}:\d{2}$/.test(s) ? s + ":00" : s;
    }
    function buildTiming(form) {
      var kind = form.pKind || "daily";
      var tz = form.pTz || "Asia/Shanghai";
      if (kind === "every") return { kind: "every", every_seconds: (Number(form.pEvery) || 60) * 60 };
      if (kind === "after") return { kind: "after", after_seconds: (Number(form.pAfter) || 60) * 60 };
      if (kind === "daily") return { kind: "daily", daily: { time: hhmm(form.pTime), time_zone: tz } };
      if (kind === "weekly") {
        return { kind: "weekly", weekly: { time: hhmm(form.pTime), time_zone: tz, weekdays: trig.daysOf(form.pWeekdays) } };
      }
      if (kind === "cron") return { kind: "cron", cron: { expression: String(form.pCron || "").trim().replace(/\s+/g, " "), time_zone: tz } };
      if (kind === "at") return { kind: "at", at: { date: String(form.pDate || "").trim(), time: hhmm(form.pTime), time_zone: tz } };
      return { kind: "rrule", rrule: String(form.pRrule || "").replace(/\r\n/g, "\n") };
    }
    function validateTiming(form, t) {
      var errs = {};
      var kind = form.pKind || "daily";
      if (kind === "every") {
        var every = Number(form.pEvery);
        if (!isFinite(every) || every < EVERY.min || every > EVERY.max) errs.pEvery = t("agent.everyHint");
      }
      if (kind === "after") {
        var after = Number(form.pAfter);
        if (!isFinite(after) || after < AFTER.min || after > AFTER.max) errs.pAfter = t("agent.afterHint");
      }
      if (kind === "daily" || kind === "weekly" || kind === "at") {
        if (!/^\d{2}:\d{2}$/.test(String(form.pTime || ""))) errs.pTime = t("trigger.time");
      }
      if (kind === "weekly" && trig.daysOf(form.pWeekdays).length === 0) errs.pWeekdays = t("trigger.weekdaysHint");
      if (kind === "at" && !/^\d{4}-\d{2}-\d{2}$/.test(String(form.pDate || ""))) errs.pDate = t("agent.date");
      if (kind === "cron") {
        var expr = String(form.pCron || "").trim();
        if (expr.split(/\s+/).filter(Boolean).length !== 5) errs.pCron = t("agent.cronHint");
      }
      if (kind === "rrule" && !/^DTSTART[^\n]*\nRRULE:/i.test(String(form.pRrule || "").replace(/\r\n/g, "\n"))) {
        errs.pRrule = t("agent.rruleHint");
      }
      return errs;
    }
    function timingText(timing, t) {
      var c = timing || {};
      if (c.kind === "every") {
        var mins = Math.round((Number(c.every_seconds) || 60) / 60);
        return mins % 60 === 0 && mins >= 60 ? t("agent.text.everyHours", { n: mins / 60 }) : t("agent.text.every", { n: mins });
      }
      if (c.kind === "after") {
        return t("agent.text.after", { n: Math.round((Number(c.after_seconds) || 60) / 60) });
      }
      if (c.kind === "daily" && c.daily) return t("agent.text.daily", { time: String(c.daily.time || "").slice(0, 5), tz: c.daily.time_zone || "" });
      if (c.kind === "weekly" && c.weekly) {
        var days = (Array.isArray(c.weekly.weekdays) ? c.weekly.weekdays : []).map(function(d) {
          return t("trigger.wd." + d);
        }).join(t("common.listSep"));
        return t("agent.text.weekly", { days, time: String(c.weekly.time || "").slice(0, 5), tz: c.weekly.time_zone || "" });
      }
      if (c.kind === "cron" && c.cron) return t("agent.text.cron", { expr: c.cron.expression || "", tz: c.cron.time_zone || "" });
      if (c.kind === "rrule") {
        var m = String(c.rrule || "").match(/RRULE:([^\n]*)/i);
        return t("agent.text.rrule", { expr: m ? m[1] : "" });
      }
      if (c.kind === "at") {
        var at = c.at;
        if (typeof at === "string") return t("agent.text.at", { at });
        if (at && at.date) return t("agent.text.at", { at: at.date + " " + String(at.time || "").slice(0, 5) + (at.time_zone ? " (" + at.time_zone + ")" : "") });
      }
      return t("agent.text.missing");
    }
    function TimingFields(props) {
      var h2 = props.h;
      var t = props.t;
      var icon = props.icon;
      var lang = props.lang;
      var form = props.form;
      var set = props.set;
      var errs = props.errs || {};
      var kind = form.pKind || "daily";
      var days = trig.daysOf(form.pWeekdays);
      function reportValid(ok) {
        if (typeof props.onValidChange === "function") props.onValidChange(ok);
      }
      function toggleDay(day) {
        var list = trig.daysOf(form.pWeekdays);
        var i = list.indexOf(day);
        if (i === -1) list.push(day);
        else list.splice(i, 1);
        list.sort(function(a, b) {
          return a - b;
        });
        set("pWeekdays", list.join(","));
      }
      var tzOptions = trig.TZ_LIST.indexOf(form.pTz) === -1 ? [form.pTz].concat(trig.TZ_LIST) : trig.TZ_LIST;
      return h2(
        "div",
        { className: "wba-block" },
        h2(
          "div",
          { className: "wba-seg", role: "group" },
          KINDS.map(function(k) {
            return h2("button", {
              key: k[0],
              type: "button",
              "aria-pressed": kind === k[0],
              onClick: function() {
                reportValid(true);
                set("pKind", k[0]);
              }
            }, icon ? h2("span", { className: "wba-inline" }, icon(k[1], 12), t(k[2])) : t(k[2]));
          })
        ),
        kind === "every" ? h2(
          "label",
          { className: "wba-field" },
          h2("span", { className: "wba-label" }, t("agent.every")),
          h2(NF.NumberField, {
            h: h2,
            lang,
            value: form.pEvery,
            min: EVERY.min,
            max: EVERY.max,
            integer: EVERY.integer,
            className: "wba-num",
            hint: false,
            ariaLabel: t("agent.every"),
            onCommit: function(next) {
              set("pEvery", next);
            },
            onValidChange: function(ok) {
              reportValid(ok);
            }
          }),
          errs.pEvery ? h2("span", { className: "wba-err-text" }, errs.pEvery) : h2("span", { className: "wba-hint" }, t("agent.everyHint"))
        ) : null,
        kind === "after" ? h2(
          "label",
          { className: "wba-field" },
          h2("span", { className: "wba-label" }, t("agent.after")),
          h2(NF.NumberField, {
            h: h2,
            lang,
            value: form.pAfter,
            min: AFTER.min,
            max: AFTER.max,
            integer: AFTER.integer,
            className: "wba-num",
            hint: false,
            ariaLabel: t("agent.after"),
            onCommit: function(next) {
              set("pAfter", next);
            },
            onValidChange: function(ok) {
              reportValid(ok);
            }
          }),
          errs.pAfter ? h2("span", { className: "wba-err-text" }, errs.pAfter) : h2("span", { className: "wba-hint" }, t("agent.afterHint"))
        ) : null,
        kind === "daily" || kind === "weekly" || kind === "at" ? h2(
          "div",
          { className: kind === "at" ? "wba-grid-3" : "wba-grid-2" },
          kind === "at" ? h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("agent.date")),
            h2("input", {
              className: "wba-input" + (errs.pDate ? " err" : ""),
              type: "date",
              value: form.pDate,
              onChange: function(e) {
                set("pDate", e.target.value);
              }
            }),
            errs.pDate ? h2("span", { className: "wba-err-text" }, errs.pDate) : null
          ) : null,
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("trigger.time")),
            h2("input", {
              className: "wba-input" + (errs.pTime ? " err" : ""),
              type: "time",
              value: form.pTime,
              onChange: function(e) {
                set("pTime", e.target.value);
              }
            }),
            errs.pTime ? h2("span", { className: "wba-err-text" }, errs.pTime) : null
          ),
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("trigger.tz")),
            h2(
              "select",
              { className: "wba-input", value: form.pTz, onChange: function(e) {
                set("pTz", e.target.value);
              } },
              tzOptions.map(function(z) {
                return h2("option", { key: z, value: z }, z);
              })
            )
          ),
          kind === "weekly" ? h2(
            "div",
            { className: "wba-field wba-span-2" },
            h2("span", { className: "wba-label" }, t("trigger.weekdays")),
            h2(
              "div",
              { className: "wba-chips" },
              trig.WEEKDAYS.map(function(d) {
                return h2("button", {
                  key: d,
                  type: "button",
                  className: "wba-chip",
                  "aria-pressed": days.indexOf(d) !== -1,
                  onClick: function() {
                    toggleDay(d);
                  }
                }, t("trigger.wd." + d));
              })
            ),
            h2("span", { className: "wba-hint" }, t("trigger.weekdaysHint"))
          ) : null
        ) : null,
        kind === "cron" ? h2(
          "div",
          { className: "wba-grid-2" },
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("agent.cron")),
            h2("input", {
              className: "wba-input" + (errs.pCron ? " err" : ""),
              value: form.pCron,
              placeholder: t("agent.cronPh"),
              spellCheck: false,
              onChange: function(e) {
                set("pCron", e.target.value);
              }
            }),
            errs.pCron ? h2("span", { className: "wba-err-text" }, errs.pCron) : h2("span", { className: "wba-hint" }, t("agent.cronHint"))
          ),
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("trigger.tz")),
            h2(
              "select",
              { className: "wba-input", value: form.pTz, onChange: function(e) {
                set("pTz", e.target.value);
              } },
              tzOptions.map(function(z) {
                return h2("option", { key: z, value: z }, z);
              })
            )
          )
        ) : null,
        kind === "rrule" ? h2(
          "label",
          { className: "wba-field" },
          h2("span", { className: "wba-label" }, t("agent.rrule")),
          h2("textarea", {
            className: "wba-code sm" + (errs.pRrule ? " err" : ""),
            value: form.pRrule,
            placeholder: t("agent.rrulePh"),
            spellCheck: false,
            onChange: function(e) {
              set("pRrule", e.target.value);
            }
          }),
          errs.pRrule ? h2("span", { className: "wba-err-text" }, errs.pRrule) : h2("span", { className: "wba-hint" }, t("agent.rruleHint"))
        ) : null
      );
    }
    module2.exports = {
      KINDS,
      buildTiming,
      validateTiming,
      timingText,
      TimingFields
    };
  }
});

// packages/shell/client/automation/json-editor.cjs
var require_json_editor = __commonJS({
  "packages/shell/client/automation/json-editor.cjs"(exports2, module2) {
    "use strict";
    var VARS = ["{{rule.name}}", "{{rule.id}}", "{{event.at}}", "{{event.item.title}}", "{{item.title}}", "{{item.url}}"];
    function parseJsonSafe(text) {
      var raw = String(text == null ? "" : text).trim();
      if (!raw) return { ok: true, value: void 0, error: "" };
      try {
        return { ok: true, value: JSON.parse(raw), error: "" };
      } catch (e) {
        return { ok: false, value: void 0, error: e && e.message ? e.message : String(e) };
      }
    }
    function formatJson(text) {
      var r = parseJsonSafe(text);
      if (!r.ok) return null;
      return JSON.stringify(r.value, null, 2);
    }
    function JsonEditor(props) {
      var h2 = props.h;
      var t = props.t;
      var React = props.React;
      var value = props.value;
      var onChange = props.onChange;
      var ref = React.useRef(null);
      var vars = props.vars === false ? [] : props.vars || VARS;
      function insert(text) {
        var el = ref.current;
        if (!el) {
          onChange(value + text);
          return;
        }
        var start = typeof el.selectionStart === "number" ? el.selectionStart : value.length;
        var end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        onChange(value.slice(0, start) + text + value.slice(end));
        if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(function() {
            try {
              el.focus();
              el.setSelectionRange(start + text.length, start + text.length);
            } catch (e) {
            }
          });
        }
      }
      return h2(
        "div",
        { className: "wba-block" },
        h2(
          "div",
          { className: "wba-inline" },
          h2("span", { className: "wba-label" }, props.label || ""),
          props.action ? h2("span", { className: "wba-grow" }) : null,
          props.action || null
        ),
        vars.length ? h2(
          "div",
          { className: "wba-inline" },
          h2("span", { className: "wba-hint" }, t("editor.insertVar")),
          h2("div", { className: "wba-chips" }, vars.map(function(v) {
            return h2("button", {
              key: v,
              type: "button",
              className: "wba-chip",
              onClick: function() {
                insert(v);
              }
            }, v);
          }))
        ) : null,
        h2("textarea", {
          ref,
          className: "wba-code" + (props.small ? " sm" : "") + (props.invalid ? " err" : ""),
          value,
          spellCheck: false,
          autoComplete: "off",
          "aria-invalid": props.invalid ? "true" : "false",
          "aria-label": props.label || "JSON",
          onChange: function(e) {
            onChange(e.target.value);
          },
          onKeyDown: function(e) {
            if (e.key === "Tab") {
              e.preventDefault();
              insert("  ");
            }
          }
        }),
        h2("div", { className: "wba-code-err", "aria-live": "polite" }, props.invalid ? props.error || t("editor.jsonInvalid", { msg: "JSON" }) : ""),
        props.hint ? h2("span", { className: "wba-hint" }, props.hint) : null
      );
    }
    module2.exports = { JsonEditor, parseJsonSafe, formatJson, VARS };
  }
});

// packages/shell/client/automation/rule-editor.cjs
var require_rule_editor = __commonJS({
  "packages/shell/client/automation/rule-editor.cjs"(exports2, module2) {
    "use strict";
    var staged = require_staged_dialog();
    var SW = require_switch();
    var EditorDialog = staged.createStagedDialog({
      maskClass: "wba-modal",
      dialogClass: "wba-modal-box",
      displayName: "AutomationRuleDialog",
      ariaLabelOf: function(props) {
        var t = props.t;
        return props.form && props.form.id ? t("editor.editTitle") : t("editor.newTitle");
      },
      header: function(props) {
        var hh = props.h;
        return hh(
          "div",
          { className: "wba-modal-head" },
          hh("h3", null, props.form && props.form.id ? props.t("editor.editTitle") : props.t("editor.newTitle")),
          hh("button", {
            type: "button",
            className: "wba-icon-btn",
            title: props.t("common.close"),
            "aria-label": props.t("common.close"),
            disabled: !!props.submitting,
            onClick: props.onClose
          }, props.icon ? props.icon("x", 15) : "\xD7")
        );
      },
      // 有未保存改动时要先问一次，所以关掉「点遮罩直接关」的默认行为，交给 close()。
      closeOnMask: false,
      closeOnEscape: function(props) {
        return !props.submitting;
      }
    });
    var trig = require_trigger_fields();
    var atiming = require_agent_timing();
    var json = require_json_editor();
    function examplesOf(t) {
      return {
        "message.send": { title: t("editor.ex.message.title"), body: t("editor.ex.message.body") },
        "tasks.create": { title: t("editor.ex.task.title"), description: t("editor.ex.task.description") },
        "tags.create": { name: t("editor.ex.tag.name") },
        "sites.create": { title: "{{item.title}}", url: "{{item.url}}" },
        "connector.sourceRun": { sourceId: "{{event.data.sourceId}}" }
      };
    }
    function plain(text) {
      var r = json.parseJsonSafe(text);
      if (!r.ok) return { ok: false, error: r.error };
      if (r.value === void 0) return { ok: true, value: {} };
      if (!r.value || typeof r.value !== "object" || Array.isArray(r.value)) return { ok: false, error: "object" };
      return { ok: true, value: r.value };
    }
    function buildTarget(form) {
      var kind = form.targetKind || "new_once";
      if (kind === "session") return { kind: "session", sessionId: String(form.targetSession || "").trim() };
      var create = {};
      if (String(form.targetCwd || "").trim()) create.cwd = String(form.targetCwd).trim();
      if (String(form.targetPreset || "").trim()) create.agentPreset = String(form.targetPreset).trim();
      return Object.keys(create).length ? { kind, create } : { kind };
    }
    function isAgent(form) {
      return Boolean(form) && form.execMode === "agent";
    }
    function validateForm(form, t) {
      var errs = {};
      if (!String(form.name || "").trim()) errs.name = t("editor.nameRequired");
      if (isAgent(form)) {
        if (!String(form.prompt || "").trim()) errs.prompt = t("editor.promptRequired");
        Object.assign(errs, atiming.validateTiming(form, t));
        if (String(form.targetKind || "new_once") === "session" && !String(form.targetSession || "").trim()) {
          errs.targetSession = t("editor.targetSessionRequired");
        }
        return { errs, valid: Object.keys(errs).length === 0 };
      }
      if (!String(form.actionName || "").trim()) errs.actionName = t("editor.actionRequired");
      var args = plain(form.actionArgs);
      if (!args.ok) errs.actionArgs = args.error === "object" ? t("editor.argsObject") : t("editor.jsonInvalid", { msg: args.error });
      if (form.condOn) {
        var cond = plain(form.condition);
        if (!cond.ok) errs.condition = cond.error === "object" ? t("editor.conditionObject") : t("editor.jsonInvalid", { msg: cond.error });
      }
      if (form.kind === "interval") {
        var n = Number(form.everyMinutes);
        if (!n || n < 1 || n > 10080) errs.everyMinutes = t("trigger.intervalHint");
      }
      if (form.kind === "dailyAt" && !/^\d{2}:\d{2}$/.test(String(form.time || ""))) errs.time = t("trigger.time");
      if (form.kind === "event") {
        if (!String(form.domainId || "").trim()) errs.domainId = t("trigger.domain");
        if (!String(form.event || "").trim()) errs.event = t("trigger.eventName");
      }
      return { errs, valid: Object.keys(errs).length === 0 };
    }
    function buildPayload(form, t) {
      var name = String(form.name || "").trim();
      if (isAgent(form)) {
        return {
          id: form.id || void 0,
          name,
          enabled: Boolean(form.enabled),
          execMode: "agent",
          agent: {
            prompt: String(form.prompt || "").trim(),
            timing: atiming.buildTiming(form),
            target: buildTarget(form)
          }
        };
      }
      var triggerConfig = { kind: form.kind };
      if (form.kind === "interval") triggerConfig.everyMinutes = Number(form.everyMinutes) || 60;
      if (form.kind === "dailyAt") {
        triggerConfig.time = form.time;
        triggerConfig.tz = form.tz;
        triggerConfig.weekdays = trig.daysOf(form.weekdays);
      }
      if (form.kind === "event") {
        triggerConfig.domainId = String(form.domainId || "").trim();
        triggerConfig.event = String(form.event || "").trim();
      }
      var args = plain(form.actionArgs);
      if (!args.ok) throw new Error(t ? t("editor.argsObject") : "actionArgs");
      var condition = null;
      if (form.condOn && String(form.condition || "").trim()) {
        var cond = plain(form.condition);
        if (!cond.ok) throw new Error(t ? t("editor.conditionObject") : "condition");
        condition = cond.value;
      }
      return {
        id: form.id || void 0,
        name,
        enabled: Boolean(form.enabled),
        execMode: "action",
        triggerType: form.kind === "event" ? "event" : form.kind === "manual" ? "manual" : "schedule",
        triggerConfig,
        actionName: form.actionName,
        actionArgs: args.value,
        condition
      };
    }
    function snapshot(form) {
      try {
        return JSON.stringify(buildPayload(form));
      } catch (e) {
        return JSON.stringify({ name: form.name, actionArgs: form.actionArgs, condition: form.condition, kind: form.kind, prompt: form.prompt });
      }
    }
    function RuleEditor(props) {
      var h2 = props.h;
      var C = props.C;
      var t = props.t;
      var React = props.React;
      var form = props.form;
      var set = props.set;
      var busy = props.busy;
      var lang = props.lang;
      var actions = props.actions || [];
      var icon = props.icon;
      var initial = props.initial;
      var agentMode = isAgent(form);
      var locked = Boolean(form.id);
      var agentAvailable = props.agentAvailable !== false;
      var validation = validateForm(form, t);
      var errs = validation.errs;
      var exampleS = React.useState(false);
      var numOkS = React.useState(true);
      var touchedS = React.useState(Boolean(form.name));
      var showNameErr = touchedS[0] && Boolean(errs.name);
      var hasActions = actions.length > 0;
      var actionName = !form.actionName || actions.indexOf(form.actionName) !== -1 ? actions : [form.actionName].concat(actions);
      var actionMissing = hasActions && Boolean(form.actionName) && actions.indexOf(form.actionName) === -1;
      var EXAMPLES = examplesOf(t);
      var example = EXAMPLES[form.actionName];
      React.useEffect(function() {
        var prev = typeof document !== "undefined" ? document.body.style.overflow : "";
        if (typeof document !== "undefined") document.body.style.overflow = "hidden";
        return function() {
          if (typeof document !== "undefined") document.body.style.overflow = prev;
        };
      });
      function dirty() {
        return snapshot(form) !== snapshot(initial || form);
      }
      function close() {
        if (dirty() && typeof window !== "undefined" && !window.confirm(t("editor.discard"))) return;
        props.onClose();
      }
      function pickMode(mode) {
        if (locked || mode === (agentMode ? "agent" : "action")) return;
        set("execMode", mode);
      }
      var modeButtons = [
        ["action", t("editor.mode.action")],
        ["agent", t("editor.mode.agent")]
      ];
      function renderBasic(hh) {
        return hh(
          "div",
          { className: "wba-section" },
          hh(
            "div",
            { className: "wba-grid-3" },
            hh(
              "label",
              { className: "wba-field wba-span-2" },
              hh("span", { className: "wba-label" }, t("editor.name")),
              hh("input", {
                className: "wba-input" + (showNameErr ? " err" : ""),
                value: form.name,
                placeholder: t("editor.namePh"),
                onChange: function(e) {
                  touchedS[1](true);
                  set("name", e.target.value);
                }
              }),
              showNameErr ? hh("span", { className: "wba-err-text" }, errs.name) : null
            ),
            hh(
              "div",
              { className: "wba-field" },
              hh("span", { className: "wba-label" }, t("editor.enabled")),
              hh(SW.Switch, {
                h: hh,
                checked: Boolean(form.enabled),
                showState: true,
                onText: t("rules.status.on"),
                offText: t("rules.status.off"),
                onChange: function(next) {
                  set("enabled", next);
                }
              })
            )
          ),
          hh("p", { className: "wba-section-title" }, t("editor.section.mode")),
          renderModeBody(hh)
        );
      }
      function renderModeBody(hh) {
        return hh(
          "div",
          null,
          hh(
            "div",
            { className: "wba-seg", role: "group" },
            modeButtons.map(function(m) {
              var off = locked || m[0] === "agent" && !agentAvailable;
              return hh("button", {
                key: m[0],
                type: "button",
                "data-mode": m[0],
                "aria-pressed": (agentMode ? "agent" : "action") === m[0],
                disabled: off,
                title: m[0] === "agent" && !agentAvailable ? t("editor.mode.agentUnavailable") : "",
                onClick: function() {
                  pickMode(m[0]);
                }
              }, m[1]);
            })
          ),
          hh("p", { className: "wba-sub" }, agentMode ? t("editor.mode.agentHint") : t("editor.mode.actionHint")),
          locked ? hh("p", { className: "wba-hint" }, t("editor.mode.locked")) : null
        );
      }
      function renderTiming(hh) {
        return hh(
          "div",
          { className: "wba-section" },
          agentMode ? hh(atiming.TimingFields, {
            h: hh,
            t,
            lang,
            form,
            set,
            errs,
            icon,
            onValidChange: function(ok) {
              numOkS[1](ok);
            }
          }) : hh(trig.TriggerFields, {
            h: hh,
            t,
            lang,
            form,
            set,
            errs,
            icon,
            onValidChange: function(ok) {
              numOkS[1](ok);
            }
          })
        );
      }
      function renderPrompt(hh) {
        return hh(
          "div",
          { className: "wba-section" },
          hh(
            "label",
            { className: "wba-field" },
            hh("span", { className: "wba-label" }, t("editor.prompt")),
            hh("textarea", {
              className: "wba-code sm" + (errs.prompt ? " err" : ""),
              value: form.prompt,
              placeholder: t("editor.promptPh"),
              onChange: function(e) {
                set("prompt", e.target.value);
              }
            }),
            errs.prompt ? hh("span", { className: "wba-err-text" }, errs.prompt) : hh("span", { className: "wba-hint" }, t("editor.promptHint"))
          ),
          hh("p", { className: "wba-section-title" }, t("editor.section.target")),
          hh(
            "div",
            { className: "wba-grid-3" },
            hh(
              "label",
              { className: "wba-field" },
              hh("span", { className: "wba-label" }, t("editor.target")),
              hh(
                "select",
                {
                  className: "wba-input",
                  value: form.targetKind || "new_once",
                  onChange: function(e) {
                    set("targetKind", e.target.value);
                  }
                },
                ["new_once", "new", "session"].map(function(k) {
                  return hh("option", { key: k, value: k }, t("editor.target." + k));
                })
              )
            ),
            (form.targetKind || "new_once") === "session" ? hh(
              "label",
              { className: "wba-field wba-span-2" },
              hh("span", { className: "wba-label" }, t("editor.targetSession")),
              hh("input", {
                className: "wba-input" + (errs.targetSession ? " err" : ""),
                value: form.targetSession || "",
                placeholder: t("editor.targetSessionPh"),
                onChange: function(e) {
                  set("targetSession", e.target.value);
                }
              }),
              errs.targetSession ? hh("span", { className: "wba-err-text" }, errs.targetSession) : null
            ) : [
              hh(
                "label",
                { key: "cwd", className: "wba-field" },
                hh("span", { className: "wba-label" }, t("editor.targetCwd")),
                hh("input", {
                  className: "wba-input",
                  value: form.targetCwd || "",
                  placeholder: "/Users/me/work",
                  onChange: function(e) {
                    set("targetCwd", e.target.value);
                  }
                })
              ),
              hh(
                "label",
                { key: "preset", className: "wba-field" },
                hh("span", { className: "wba-label" }, t("editor.targetPreset")),
                hh("input", {
                  className: "wba-input",
                  value: form.targetPreset || "",
                  placeholder: t("editor.targetPresetPh"),
                  onChange: function(e) {
                    set("targetPreset", e.target.value);
                  }
                })
              )
            ]
          ),
          hh("p", { className: "wba-hint" }, t("editor.targetHint"))
        );
      }
      function renderAction(hh) {
        return hh(
          "div",
          { className: "wba-section" },
          hh(
            "div",
            { className: "wba-inline" },
            hh(
              "label",
              { className: "wba-field" },
              hh("span", { className: "wba-label" }, t("editor.action")),
              hh(
                "select",
                {
                  className: "wba-input",
                  value: form.actionName,
                  disabled: !hasActions,
                  onChange: function(e) {
                    set("actionName", e.target.value);
                  }
                },
                hasActions ? actionName.map(function(a) {
                  return hh("option", { key: a, value: a }, a);
                }) : hh("option", { value: "" }, t("editor.noActions"))
              ),
              !hasActions || actionMissing ? hh("span", { className: "wba-err-text" }, hasActions ? t("rules.actionDisabled") : t("editor.noActionsHint")) : null
            ),
            hh("span", { className: "wba-grow" }),
            example ? hh(C.Btn, { h: hh, onClick: function() {
              exampleS[1](!exampleS[0]);
            } }, t("editor.showExample")) : null
          ),
          exampleS[0] && example ? hh(
            "div",
            { className: "wba-block" },
            hh("span", { className: "wba-label" }, t("editor.exampleTitle")),
            hh("pre", { className: "wba-pre" }, JSON.stringify(example, null, 2)),
            hh(
              "div",
              { className: "wba-inline" },
              hh(C.Btn, { h: hh, onClick: function() {
                if (typeof window !== "undefined" && !window.confirm(t("editor.exampleHint"))) return;
                set("actionArgs", JSON.stringify(example, null, 2));
              } }, t("editor.fillExample")),
              hh("span", { className: "wba-grow" })
            )
          ) : null,
          hh(json.JsonEditor, {
            h: hh,
            t,
            React,
            label: "actionArgs",
            hint: t("editor.argsHint"),
            value: form.actionArgs,
            invalid: Boolean(errs.actionArgs),
            error: errs.actionArgs,
            onChange: function(v) {
              set("actionArgs", v);
            },
            action: hh(C.Btn, { h: hh, onClick: function() {
              var next = json.formatJson(form.actionArgs);
              if (next) set("actionArgs", next);
            } }, t("editor.format"))
          })
        );
      }
      function renderCondition(hh) {
        return hh(
          "div",
          { className: "wba-section" },
          hh("p", { className: "wba-section-title" }, t("editor.section.condition")),
          hh(SW.Switch, {
            h: hh,
            checked: Boolean(form.condOn),
            label: t("editor.conditionOn"),
            onChange: function(next) {
              set("condOn", next);
            }
          }),
          hh("p", { className: "wba-sub" }, t("editor.conditionHint")),
          form.condOn ? hh(json.JsonEditor, {
            h: hh,
            t,
            React,
            small: true,
            vars: false,
            label: "condition",
            value: form.condition,
            invalid: Boolean(errs.condition),
            error: errs.condition,
            onChange: function(v) {
              set("condition", v);
            }
          }) : hh("p", { className: "wba-sub" }, t("editor.conditionEmpty"))
        );
      }
      function renderRun(hh) {
        return hh(
          "div",
          null,
          agentMode ? renderPrompt(hh) : renderAction(hh),
          agentMode ? null : renderCondition(hh)
        );
      }
      var steps = [
        {
          key: "basic",
          label: t("editor.section.basic"),
          render: renderBasic,
          validate: function() {
            return String(form.name || "").trim() ? "" : t("editor.nameRequired");
          }
        },
        {
          key: agentMode ? "timing" : "trigger",
          label: agentMode ? t("editor.section.timing") : t("editor.section.trigger"),
          render: renderTiming,
          validate: function() {
            if (numOkS[0]) return "";
            return errs.pEvery || errs.pAfter || errs.everyMinutes || errs.pCron || errs.pRrule || errs.pDate || errs.pTime || errs.pWeekdays || t("trigger.intervalHint");
          }
        },
        {
          key: agentMode ? "prompt" : "run",
          label: agentMode ? t("editor.section.prompt") : t("editor.section.run"),
          render: renderRun,
          validate: function() {
            if (agentMode) return String(form.prompt || "").trim() ? "" : t("editor.promptRequired");
            if (!hasActions || actionMissing) return hasActions ? t("rules.actionDisabled") : t("editor.noActionsHint");
            return errs.actionArgs || errs.condition || "";
          }
        }
      ];
      return h2(EditorDialog, {
        h: h2,
        React,
        t,
        form,
        icon,
        steps,
        // 测试与深链接需要直接落到某一步；正常打开都从第一步开始。
        initialStep: props.initialStep,
        submitting: busy,
        submitDisabled: !validation.valid || !numOkS[0],
        onClose: close,
        onSubmit: function() {
          if (!validation.valid || !numOkS[0]) return;
          props.onSave(buildPayload(form, t));
        },
        submitText: t("common.save"),
        cancelText: t("common.cancel"),
        nextText: t("common.next"),
        backText: t("common.back"),
        // 页脚只在用户动过字段之后给一行说明（也是「保存」禁用时的原因）；
        // 空表单首屏不再先红一片——此前一打开就显示「名称不能为空」。
        footerNote: !touchedS[0] ? "" : validation.valid ? numOkS[0] ? "" : errs.pEvery || errs.pAfter || errs.everyMinutes || t("trigger.intervalHint") : errs.name || errs.prompt || errs.actionArgs || errs.condition || errs.pCron || errs.pRrule || errs.pDate || errs.pTime || errs.pWeekdays || t("editor.nameEmptySave")
      });
    }
    module2.exports = {
      RuleEditor,
      buildPayload,
      validateForm,
      buildTarget,
      examplesOf
    };
  }
});

// packages/shell/client/automation/rules.cjs
var require_rules = __commonJS({
  "packages/shell/client/automation/rules.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    var icons = require_common().icons;
    var trig = require_trigger_fields();
    var atiming = require_agent_timing();
    var editor = require_rule_editor();
    var createOverlay = require_overlay();
    var TRIGGER_ICON = { interval: "timer", dailyAt: "alarm-clock", event: "radio", manual: "hand" };
    function emptyForm() {
      return {
        id: "",
        name: "",
        enabled: true,
        execMode: "action",
        // action 模式
        kind: "interval",
        everyMinutes: 60,
        time: "09:00",
        tz: "Asia/Shanghai",
        weekdays: "1,2,3,4,5",
        domainId: "",
        event: "",
        actionName: "",
        actionArgs: "{}",
        condOn: false,
        condition: '{\n  "field": "event.item.title",\n  "op": "contains",\n  "value": ""\n}',
        // agent 模式
        prompt: "",
        pKind: "every",
        pEvery: 60,
        pAfter: 60,
        pTime: "09:00",
        pTz: "Asia/Shanghai",
        pWeekdays: "1,2,3,4,5",
        pCron: "0 9 * * *",
        pRrule: "DTSTART;TZID=Asia/Shanghai:20260101T090000\nRRULE:FREQ=DAILY",
        pDate: "",
        targetKind: "new_once",
        targetCwd: "",
        targetPreset: "",
        targetSession: ""
      };
    }
    function timingToForm(f, timing) {
      var ti = timing && typeof timing === "object" ? timing : {};
      f.pKind = ti.kind || "every";
      if (ti.kind === "every") f.pEvery = Math.max(1, Math.round((ti.every_seconds || 3600) / 60));
      if (ti.kind === "after") f.pAfter = Math.max(1, Math.round((ti.after_seconds || 60) / 60));
      if (ti.kind === "daily" && ti.daily) {
        f.pTime = String(ti.daily.time || "09:00").slice(0, 5);
        f.pTz = ti.daily.time_zone || "Asia/Shanghai";
      }
      if (ti.kind === "weekly" && ti.weekly) {
        f.pTime = String(ti.weekly.time || "09:00").slice(0, 5);
        f.pTz = ti.weekly.time_zone || "Asia/Shanghai";
        f.pWeekdays = (ti.weekly.weekdays || [1, 2, 3, 4, 5]).join(",");
      }
      if (ti.kind === "cron" && ti.cron) {
        f.pCron = ti.cron.expression || f.pCron;
        f.pTz = ti.cron.time_zone || "Asia/Shanghai";
      }
      if (ti.kind === "rrule") f.pRrule = ti.rrule || f.pRrule;
      if (ti.kind === "at") {
        var at = ti.at;
        if (typeof at === "string") {
          f.pDate = at.slice(0, 10);
          f.pTime = at.slice(11, 16) || f.pTime;
        } else if (at && typeof at === "object") {
          f.pDate = at.date || "";
          f.pTime = String(at.time || "09:00").slice(0, 5);
          f.pTz = at.time_zone || f.pTz;
        }
      }
    }
    function formFromRule(rule) {
      var f = emptyForm();
      f.id = rule.id;
      f.name = rule.name;
      f.enabled = rule.enabled;
      f.execMode = rule.execMode === "agent" ? "agent" : "action";
      if (f.execMode === "agent") {
        var snap = rule.agent && typeof rule.agent === "object" ? rule.agent : {};
        f.prompt = String(snap.prompt || "");
        timingToForm(f, snap.timing);
        var target = snap.target && typeof snap.target === "object" ? snap.target : {};
        f.targetKind = target.kind || "new_once";
        f.targetSession = target.sessionId || "";
        var create = target.create && typeof target.create === "object" ? target.create : {};
        f.targetCwd = create.cwd || "";
        f.targetPreset = create.agentPreset || "";
        return f;
      }
      f.actionName = rule.actionName;
      f.actionArgs = JSON.stringify(rule.actionArgs || {}, null, 2);
      f.condOn = Boolean(rule.condition);
      f.condition = rule.condition ? JSON.stringify(rule.condition, null, 2) : f.condition;
      var tc = rule.triggerConfig || {};
      f.kind = tc.kind || "manual";
      if (tc.kind === "interval") f.everyMinutes = tc.everyMinutes || 60;
      if (tc.kind === "dailyAt") {
        f.time = tc.time || "09:00";
        f.tz = tc.tz || "Asia/Shanghai";
        f.weekdays = (tc.weekdays || [1, 2, 3, 4, 5]).join(",");
      }
      if (tc.kind === "event") {
        f.domainId = tc.domainId || "";
        f.event = tc.event || "";
      }
      return f;
    }
    function filterRules(rows, filters) {
      var q = String(filters && filters.q || "").trim().toLowerCase();
      var status = filters && filters.status || "";
      var trigger = filters && filters.trigger || "";
      var mode = filters && filters.mode || "";
      var origin = filters && filters.origin || "";
      return rows.filter(function(r) {
        if (q) {
          var hit = String(r.name).toLowerCase().indexOf(q) !== -1 || String(r.actionName || "").toLowerCase().indexOf(q) !== -1 || String(r.ownerDomain || "").toLowerCase().indexOf(q) !== -1 || String(r.agent && r.agent.prompt || "").toLowerCase().indexOf(q) !== -1;
          if (!hit) return false;
        }
        if (origin === "user" && r.origin === "plugin") return false;
        if (origin === "plugin" && r.origin !== "plugin") return false;
        if (status === "on" && !r.enabled) return false;
        if (status === "off" && r.enabled) return false;
        if (mode === "agent" && r.execMode !== "agent") return false;
        if (mode === "action" && r.execMode === "agent") return false;
        if (trigger) {
          var kind = r.execMode === "agent" ? "agent" : r.triggerConfig && r.triggerConfig.kind || r.triggerType;
          if (kind !== trigger) return false;
        }
        return true;
      });
    }
    function resultKind(status) {
      if (status === "ok") return "ok";
      if (status === "error") return "error";
      if (status === "skipped") return "warn";
      return "";
    }
    function scheduleKind(status) {
      if (status === "active") return "ok";
      if (status === "paused") return "warn";
      return "";
    }
    function originPill(C2, h2, t, r) {
      if (r.origin !== "plugin") {
        return h2(C2.Pill, { h: h2, kind: "" }, t("rules.origin.user"));
      }
      var state = r.originState || "active";
      var kind = state === "active" ? "info" : state === "updated" ? "warn" : "error";
      var label = t("rules.origin.plugin") + (r.ownerDomain ? " \xB7 " + shortDomain(r.ownerDomain) : "");
      var pill = h2(C2.Pill, { h: h2, kind }, label);
      if (state === "active") return pill;
      return h2(
        "span",
        { className: "wba-inline" },
        pill,
        h2("span", { className: "wba-hint" }, t("rules.origin.state." + state))
      );
    }
    function shortDomain(id) {
      return String(id || "").replace(/^wb-addon-/, "");
    }
    function EmptyCard(props) {
      var h2 = props.h;
      var t = props.t;
      var icon = props.icon;
      return h2(
        "div",
        { className: "wba-empty-card" },
        icon ? h2("span", { className: "wba-empty-ico" }, icon("zap", 36)) : null,
        h2("p", { className: "wba-empty-title" }, props.title),
        h2("p", { className: "wba-empty-body" }, props.body),
        h2(
          "div",
          { className: "wba-inline" },
          props.noActions ? h2(C.Btn, { h: h2, kind: "primary", onClick: props.onSettings }, t("rules.empty.noActionCta")) : h2(C.Btn, { h: h2, kind: "primary", onClick: props.onNew }, icons.label("plus", t("common.createShort"), { short: true }))
        ),
        h2("p", { className: "wba-empty-body" }, props.noActions ? t("rules.empty.noActionHint") : t("rules.empty.backup"))
      );
    }
    function RuleRow(props) {
      var h2 = props.h;
      var t = props.t;
      var icon = props.icon;
      var r = props.rule;
      var builtin = r.origin === "plugin";
      var agentRule = r.execMode === "agent";
      var snap = r.agent && typeof r.agent === "object" ? r.agent : {};
      var kind = agentRule ? "agent" : r.triggerConfig && r.triggerConfig.kind || r.triggerType || "manual";
      var last = r.lastRun;
      var deliveredAt = snap.lastDeliveryAt;
      return h2(
        "tr",
        null,
        h2(
          "td",
          null,
          h2("div", { className: "wba-strong wba-ellipsis", title: r.name }, r.name),
          h2("div", { className: "wba-mono" }, r.id)
        ),
        h2("td", { className: "wba-nowrap" }, originPill(C, h2, t, r)),
        h2(
          "td",
          { className: "wba-nowrap" },
          h2(
            "span",
            { className: "wba-inline" },
            icon ? icon(agentRule ? "bot" : TRIGGER_ICON[kind] || "zap", 13) : null,
            agentRule ? atiming.timingText(snap.timing, t) : trig.triggerText(r, t)
          )
        ),
        h2("td", null, agentRule ? h2(
          "span",
          { className: "wba-inline" },
          h2(C.Pill, { h: h2, kind: "" }, t("rules.agentAction")),
          h2("span", { className: "wba-ellipsis", title: snap.prompt || "" }, String(snap.prompt || "").slice(0, 48))
        ) : h2(
          "span",
          { className: "wba-inline" },
          h2("code", { className: "wba-ellipsis", title: r.actionName }, r.actionName),
          props.allowed.indexOf(r.actionName) === -1 ? h2(C.Pill, { h: h2, kind: "warn" }, t("rules.actionDisabled")) : null
        )),
        h2("td", null, agentRule ? h2(C.Pill, { h: h2, kind: r.scheduleMissing ? "error" : scheduleKind(r.scheduleStatus) }, t("rules.schedule." + (r.scheduleMissing ? "missing" : r.scheduleStatus || "paused"))) : h2(C.Pill, { h: h2, kind: r.enabled ? "ok" : "" }, r.enabled ? t("rules.status.on") : t("rules.status.off"))),
        h2("td", { className: "wba-nowrap" }, agentRule ? h2("span", null, deliveredAt ? C.fmtTime(deliveredAt, props.lang) : t("common.none")) : h2(
          "div",
          { className: "wba-inline" },
          h2("span", null, last ? C.fmtTime(last.startedAt, props.lang) : t("common.none")),
          last ? h2(C.Pill, { h: h2, kind: resultKind(last.status) }, t("run.status." + last.status) || last.status) : null
        )),
        h2("td", null, h2(
          "div",
          { className: "wba-actions" },
          agentRule ? h2("button", { type: "button", className: "wba-icon-btn", title: t("rules.history"), onClick: function() {
            props.onHistory(r);
          } }, icon ? icon("send", 14) : "\u2709") : null,
          h2("button", { type: "button", className: "wba-icon-btn", title: t("common.run"), disabled: props.runningId === r.id || agentRule && r.scheduleMissing, onClick: function() {
            props.onRun(r);
          } }, icon ? icon("play", 14) : "\u25B6"),
          builtin ? null : h2("button", { type: "button", className: "wba-icon-btn", title: t("common.edit"), onClick: function() {
            props.onEdit(r);
          } }, icon ? icon("pencil", 14) : "\u270E"),
          h2("button", { type: "button", className: "wba-icon-btn", title: r.enabled ? t("common.disable") : t("common.enable"), onClick: function() {
            props.onToggle(r);
          } }, icon ? icon(r.enabled ? "power-off" : "power", 14) : "\u23FB"),
          builtin ? h2("span", { className: "wba-icon-btn", title: t("rules.builtinLocked") }, icon ? icon("lock", 14) : "\u{1F512}") : h2("button", { type: "button", className: "wba-icon-btn danger", title: t("common.delete"), onClick: function() {
            props.onDelete(r);
          } }, icon ? icon("trash-2", 14) : "\u{1F5D1}")
        ))
      );
    }
    function RulesBody(props) {
      var h2 = props.h;
      var t = props.t;
      var icon = props.icon;
      var rows = props.rows;
      var filters = props.filters || {};
      var allowed = props.allowed || [];
      var orphans = Number(props.agentStatus && props.agentStatus.orphans && props.agentStatus.orphans.length || 0);
      var offline = props.agentStatus && props.agentStatus.available === false;
      return h2(
        "div",
        { className: "wba-panel" },
        h2(
          "div",
          { className: "wba-toolbar wba-toolbar-filters" },
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("common.search")),
            h2("input", {
              className: "wba-input",
              type: "search",
              value: filters.q || "",
              placeholder: t("rules.searchPh"),
              onChange: function(e) {
                props.onFilter({ q: e.target.value });
              }
            })
          ),
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("rules.filterStatus")),
            h2(
              "select",
              { className: "wba-input", value: filters.status || "", onChange: function(e) {
                props.onFilter({ status: e.target.value });
              } },
              h2("option", { value: "" }, t("common.all")),
              h2("option", { value: "on" }, t("rules.status.on")),
              h2("option", { value: "off" }, t("rules.status.off"))
            )
          ),
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("rules.filterTrigger")),
            h2(
              "select",
              { className: "wba-input", value: filters.trigger || "", onChange: function(e) {
                props.onFilter({ trigger: e.target.value });
              } },
              h2("option", { value: "" }, t("common.all")),
              ["interval", "dailyAt", "event", "manual"].map(function(k) {
                return h2("option", { key: k, value: k }, t("trigger." + k));
              }),
              h2("option", { value: "agent" }, t("rules.agentAction"))
            )
          ),
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("rules.filterOrigin")),
            h2(
              "select",
              { className: "wba-input", value: filters.origin || "", onChange: function(e) {
                props.onFilter({ origin: e.target.value });
              } },
              h2("option", { value: "" }, t("common.all")),
              h2("option", { value: "user" }, t("rules.origin.user")),
              h2("option", { value: "plugin" }, t("rules.origin.plugin"))
            )
          ),
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("rules.exec.mode")),
            h2(
              "select",
              { className: "wba-input", value: filters.mode || "", onChange: function(e) {
                props.onFilter({ mode: e.target.value });
              } },
              h2("option", { value: "" }, t("common.all")),
              h2("option", { value: "action" }, t("editor.mode.action")),
              h2("option", { value: "agent" }, t("editor.mode.agent"))
            )
          ),
          h2("span", { className: "wba-grow" }),
          h2(C.Btn, { h: h2, onClick: props.onClear }, t("common.clear"))
        ),
        props.error ? h2(C.Notice, { h: h2, kind: "error", text: props.error }) : null,
        offline ? h2(C.Notice, { h: h2, kind: "warn", text: t("rules.agentOffline") }) : null,
        orphans > 0 ? h2(C.Notice, { h: h2, kind: "warn", text: t("rules.orphans", { n: orphans }) }) : null,
        props.loading ? h2(
          "div",
          { className: "wba-table-wrap" },
          h2("div", { className: "wba-skel-row" }, [1, 2, 3, 4, 5].map(function(i) {
            return h2("div", { key: i, className: "wba-skel" });
          })),
          h2("div", { className: "wba-skel-row" }, [1, 2, 3, 4, 5].map(function(i) {
            return h2("div", { key: i, className: "wba-skel" });
          })),
          h2("div", { className: "wba-skel-row" }, [1, 2, 3, 4, 5].map(function(i) {
            return h2("div", { key: i, className: "wba-skel" });
          }))
        ) : rows.length === 0 ? h2(EmptyCard, {
          h: h2,
          t,
          icon,
          title: props.hasRules ? t("rules.empty.filtered") : props.noActions ? t("rules.empty.noActionTitle") : t("rules.empty.title"),
          body: props.hasRules ? t("rules.empty.filteredBody") : props.noActions ? t("rules.empty.noActionBody") : t("rules.empty.body"),
          noActions: !props.hasRules && props.noActions,
          onNew: props.onNew,
          onSettings: props.onSettings
        }) : h2(
          "div",
          { className: "wba-table-wrap" },
          h2(
            "table",
            { className: "wba-table" },
            h2("thead", null, h2(
              "tr",
              null,
              ["name", "origin", "trigger", "action", "status", "lastRun", "ops"].map(function(k) {
                return h2("th", { key: k }, t("rules.col." + k));
              })
            )),
            h2("tbody", null, rows.map(function(r) {
              return h2(RuleRow, {
                key: r.id,
                h: h2,
                t,
                icon,
                lang: props.lang,
                rule: r,
                allowed,
                runningId: props.runningId,
                onRun: props.onRun,
                onEdit: props.onEdit,
                onToggle: props.onToggle,
                onDelete: props.onDelete,
                onHistory: props.onHistory
              });
            }))
          )
        )
      );
    }
    module2.exports = function RulesView(props) {
      var h2 = props.h;
      var api = props.api;
      var React = props.React;
      var lang = props.lang === "en" ? "en" : "zh";
      var t = props.t;
      var list = C.useLoad(React, api, "automation.ruleList", {}, []);
      var opts = C.useLoad(React, api, "automation.actionOptions", {}, []);
      var status = C.useLoad(React, api, "automation.agentStatus", {}, []);
      var formS = React.useState(null);
      var initS = React.useState(null);
      var busyS = React.useState(false);
      var msgS = React.useState("");
      var filterS = React.useState({ q: "", status: "", trigger: "", mode: "", origin: "" });
      var runningS = React.useState("");
      var historyS = React.useState(null);
      var all = list.data && list.data.items || [];
      var rows = filterRules(all, filterS[0]);
      var actions = opts.data && opts.data.actions || [];
      var agentStatus = status.data || null;
      var form = formS[0];
      React.useEffect(function() {
        if (props.viewParams && props.viewParams.new && !formS[0]) openNew();
      }, [props.viewParams]);
      function fail(e) {
        msgS[1](C.errText(e));
      }
      function reload() {
        list.refresh();
        status.refresh();
      }
      function openNew() {
        var f = emptyForm();
        if (agentStatus && agentStatus.available === false) f.execMode = "action";
        initS[1](f);
        formS[1](f);
        msgS[1]("");
      }
      function save(payload) {
        busyS[1](true);
        msgS[1]("");
        var action = payload.id ? "automation.ruleUpdate" : "automation.ruleCreate";
        C.call(api, action, payload).then(function() {
          busyS[1](false);
          formS[1](null);
          reload();
          msgS[1](t("common.saved"));
        }).catch(function(e) {
          busyS[1](false);
          fail(e);
        });
      }
      function remove(rule) {
        if (typeof window !== "undefined" && !window.confirm(t("rules.confirm.delete", { name: rule.name }))) return;
        C.call(api, "automation.ruleDelete", { id: rule.id }).then(reload).catch(fail);
      }
      function run(rule) {
        runningS[1](rule.id);
        msgS[1]("");
        C.call(api, "automation.ruleRun", { id: rule.id }).then(function(r) {
          runningS[1]("");
          msgS[1](r && r.skipped ? "skipped: " + (r.reason || "") : t("common.saved"));
          reload();
        }).catch(function(e) {
          runningS[1]("");
          fail(e);
        });
      }
      function toggle(rule) {
        C.call(api, "automation.ruleUpdate", { id: rule.id, enabled: !rule.enabled }).then(reload).catch(fail);
      }
      function setForm(k, v) {
        var next = Object.assign({}, formS[0]);
        next[k] = v;
        formS[1](next);
      }
      return h2(
        "div",
        { className: "wba-wrap" },
        h2(
          "div",
          { className: "wba-head" },
          h2(
            "div",
            null,
            h2("h2", { className: "wba-title" }, t("rules.title")),
            h2("p", { className: "wba-sub" }, t("rules.subtitle"))
          ),
          h2(
            "div",
            { className: "wba-row" },
            h2(C.Btn, { h: h2, onClick: reload }, t("common.refresh")),
            h2(C.Btn, { h: h2, kind: "primary", onClick: openNew }, icons.label("plus", t("common.createShort"), { short: true }))
          )
        ),
        h2(C.Notice, { h: h2, text: msgS[0], kind: "info" }),
        h2(RulesBody, {
          h: h2,
          t,
          lang,
          icon: props.icon,
          rows,
          hasRules: all.length > 0,
          loading: list.loading,
          error: list.error,
          allowed: actions,
          agentStatus,
          noActions: actions.length === 0,
          onSettings: function() {
            if (props.onNavigate) props.onNavigate("config");
          },
          filters: filterS[0],
          runningId: runningS[0],
          onFilter: function(patch) {
            filterS[1](Object.assign({}, filterS[0], patch));
          },
          onClear: function() {
            filterS[1]({ q: "", status: "", trigger: "", mode: "", origin: "" });
          },
          onNew: openNew,
          onRun: run,
          onEdit: function(r) {
            var f = formFromRule(r);
            initS[1](f);
            formS[1](f);
          },
          onToggle: toggle,
          onDelete: remove,
          onHistory: function(r) {
            historyS[1](r);
          }
        }),
        form ? h2(editor.RuleEditor, {
          h: h2,
          C,
          t,
          React,
          lang,
          icon: props.icon,
          form,
          initial: initS[0],
          set: setForm,
          busy: busyS[0],
          actions,
          agentAvailable: !(agentStatus && agentStatus.available === false),
          onClose: function() {
            formS[1](null);
          },
          onSave: save
        }) : null,
        historyS[0] ? h2(AgentHistory, {
          h: h2,
          api,
          React,
          t,
          lang,
          icon: props.icon,
          rule: historyS[0],
          onClose: function() {
            historyS[1](null);
          }
        }) : null
      );
    };
    module2.exports.filterRules = filterRules;
    module2.exports.RulesBody = RulesBody;
    module2.exports.RuleRow = RuleRow;
    module2.exports.emptyForm = emptyForm;
    module2.exports.formFromRule = formFromRule;
    module2.exports.timingToForm = timingToForm;
    var HistoryOverlay = createOverlay({
      maskClass: "wba-modal",
      dialogClass: "wba-modal-box",
      ariaLabelOf: function(props) {
        return props.t("hist.title");
      },
      closeOnMask: true,
      autoFocusDialog: false
    });
    var LIMIT = 20;
    function when(rec, lang) {
      var ts = rec && (rec.deliveredAt || rec.scheduledAt);
      if (!ts) return "";
      var ms = Date.parse(ts);
      return isNaN(ms) ? String(ts) : C.fmtTime(ms, lang);
    }
    function AgentHistory(props) {
      var h2 = props.h;
      var api = props.api;
      var React = props.React;
      var icon = props.icon;
      var lang = props.lang === "en" ? "en" : "zh";
      var t = props.t;
      var rule = props.rule;
      var cursorS = React.useState("");
      var state = C.useLoad(React, api, "automation.ruleHistory", { id: rule.id, limit: LIMIT, before: cursorS[0] || void 0 }, [rule.id, cursorS[0]]);
      var data = state.data || {};
      var records = data.records || [];
      var missing = Boolean(rule.scheduleMissing) || data.earlierRecordsUnavailable && records.length === 0;
      var oldest = records.length ? records[records.length - 1].messageId : "";
      var canOlder = records.length === LIMIT && Boolean(oldest);
      return h2(
        HistoryOverlay,
        { t, onClose: props.onClose },
        h2(
          "div",
          { className: "wba-modal-head" },
          h2("h3", null, t("hist.title") + " \xB7 " + rule.name),
          h2("button", { type: "button", className: "wba-icon-btn", title: t("common.close"), onClick: props.onClose }, icon ? icon("x", 15) : "\xD7")
        ),
        h2(
          "div",
          { className: "wba-modal-body" },
          h2("p", { className: "wba-sub" }, t("hist.subtitle")),
          state.error ? h2(C.Notice, { h: h2, kind: "error", text: state.error }) : null,
          missing ? h2("p", { className: "wba-sub" }, t("hist.missing")) : state.loading && records.length === 0 ? h2("div", { className: "wba-hist" }, [1, 2, 3].map(function(i) {
            return h2("div", { key: i, className: "wba-skel" });
          })) : records.length === 0 ? h2("p", { className: "wba-sub" }, t("hist.empty")) : h2(
            "div",
            { className: "wba-hist" },
            h2("p", { className: "wba-sub" }, t("hist.records", { n: records.length })),
            records.map(function(rec, i) {
              return h2(
                "div",
                { key: rec.messageId || i, className: "wba-hist-row" },
                h2(
                  "div",
                  { className: "wba-inline" },
                  icon ? icon("send", 13) : null,
                  h2("span", { className: "wba-nowrap" }, when(rec, lang)),
                  h2("code", { className: "wba-mono wba-ellipsis", title: rec.targetSessionId }, rec.targetSessionId || "")
                ),
                rec.prompt ? h2("pre", { className: "wba-pre" }, rec.prompt) : null
              );
            }),
            data.earlierRecordsPruned ? h2("p", { className: "wba-sub" }, t("hist.pruned")) : null,
            canOlder ? h2(C.Btn, { h: h2, onClick: function() {
              cursorS[1](oldest);
            } }, t("common.more")) : null
          )
        ),
        h2(
          "div",
          { className: "wba-modal-foot" },
          h2("span", { className: "wba-grow" }),
          h2(C.Btn, { h: h2, onClick: props.onClose }, t("common.close"))
        )
      );
    }
    module2.exports.AgentHistory = AgentHistory;
  }
});

// packages/shell/client/automation/runs.cjs
var require_runs = __commonJS({
  "packages/shell/client/automation/runs.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    var LIMIT = 200;
    function cost(run) {
      if (!run || !run.finishedAt) return "\u2014";
      var ms = Math.max(0, Number(run.finishedAt) - Number(run.startedAt));
      return ms < 1e3 ? ms + "ms" : (ms / 1e3).toFixed(1) + "s";
    }
    function resultKind(status) {
      if (status === "ok") return "ok";
      if (status === "error") return "error";
      if (status === "skipped") return "warn";
      return "";
    }
    function asText(value) {
      if (value === null || value === void 0 || value === "") return "";
      if (typeof value === "string") return value;
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return String(value);
      }
    }
    function summary(run) {
      var text = run.error ? run.error : asText(run.result);
      return String(text).replace(/\s+/g, " ").slice(0, 80) || "\u2014";
    }
    function RunsBody(props) {
      var h2 = props.h;
      var t = props.t;
      var icon = props.icon;
      var rows = props.rows;
      return h2(
        "div",
        { className: "wba-panel" },
        h2(
          "div",
          { className: "wba-toolbar" },
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("runs.filterRule")),
            h2(
              "select",
              { className: "wba-input", value: props.ruleId || "", onChange: function(e) {
                props.onRule(e.target.value);
              } },
              h2("option", { value: "" }, t("common.all")),
              (props.rules || []).map(function(r) {
                return h2("option", { key: r.id, value: r.id }, r.name);
              })
            )
          ),
          h2(
            "label",
            { className: "wba-field" },
            h2("span", { className: "wba-label" }, t("runs.filterStatus")),
            h2(
              "select",
              { className: "wba-input", value: props.status || "", onChange: function(e) {
                props.onStatus(e.target.value);
              } },
              h2("option", { value: "" }, t("common.all")),
              ["ok", "error", "skipped"].map(function(k) {
                return h2("option", { key: k, value: k }, k);
              })
            )
          ),
          h2("span", { className: "wba-grow" }),
          h2("span", { className: "wba-mono" }, t("runs.limitNote"))
        ),
        props.error ? h2(C.Notice, { h: h2, kind: "error", text: props.error }) : null,
        props.loading ? h2(
          "div",
          { className: "wba-table-wrap" },
          [0, 1, 2].map(function(i) {
            return h2("div", { key: i, className: "wba-skel-row" }, [1, 2, 3, 4, 5].map(function(j) {
              return h2("div", { key: j, className: "wba-skel" });
            }));
          })
        ) : rows.length === 0 ? h2(
          "div",
          { className: "wba-empty-card" },
          icon ? h2("span", { className: "wba-empty-ico" }, icon("history", 34)) : null,
          h2("p", { className: "wba-empty-title" }, t("runs.empty.title")),
          h2("p", { className: "wba-empty-body" }, t("runs.empty.body"))
        ) : h2(
          "div",
          { className: "wba-table-wrap" },
          h2(
            "table",
            { className: "wba-table" },
            h2("thead", null, h2(
              "tr",
              null,
              ["status", "rule", "trigger", "start", "cost", "summary"].map(function(k) {
                return h2("th", { key: k }, t("runs.col." + k));
              })
            )),
            h2("tbody", null, rows.map(function(r) {
              var open = props.expanded === r.id;
              return [
                h2(
                  "tr",
                  {
                    key: r.id,
                    className: open ? "wba-row-open wba-clickable" : "wba-clickable",
                    style: { cursor: "pointer" },
                    onClick: function() {
                      props.onExpand(open ? "" : r.id);
                    }
                  },
                  h2("td", null, h2(C.Pill, { h: h2, kind: resultKind(r.status) }, t("run.status." + r.status) || r.status)),
                  h2(
                    "td",
                    { className: "wba-ellipsis" },
                    h2(
                      "span",
                      { className: "wba-inline" },
                      h2("span", null, props.ruleName ? props.ruleName(r.ruleId) : r.ruleId),
                      props.ruleOrigin && props.ruleOrigin(r.ruleId) === "plugin" ? h2(C.Pill, { h: h2, kind: "info" }, t("runs.origin.plugin")) : null
                    )
                  ),
                  h2("td", { className: "wba-nowrap" }, r.trigger ? t("trigger." + r.trigger) || r.trigger : "\u2014"),
                  h2("td", { className: "wba-nowrap" }, C.fmtTime(r.startedAt, props.lang)),
                  h2("td", { className: "wba-nowrap" }, cost(r)),
                  h2("td", null, h2("span", { className: "wba-ellipsis", title: r.error || summary(r) }, summary(r)))
                ),
                open ? h2(
                  "tr",
                  { key: r.id + "-detail" },
                  h2(
                    "td",
                    { colSpan: 6, className: "wba-detail-cell" },
                    h2("p", { className: "wba-section-title" }, t("runs.detail.title")),
                    h2(
                      "div",
                      { className: "wba-kv" },
                      h2("b", null, t("runs.detail.id")),
                      h2("code", null, r.id),
                      h2("b", null, t("runs.detail.trigger")),
                      h2("span", null, r.trigger ? t("trigger." + r.trigger) || r.trigger : "\u2014"),
                      h2("b", null, t("runs.detail.start")),
                      h2("span", null, C.fmtTime(r.startedAt, props.lang)),
                      h2("b", null, t("runs.detail.finish")),
                      h2("span", null, r.finishedAt ? C.fmtTime(r.finishedAt, props.lang) : "\u2014"),
                      h2("b", null, t("runs.detail.cost")),
                      h2("span", null, cost(r)),
                      h2("b", null, t("runs.detail.error")),
                      h2("span", { className: r.error ? "wba-err-text" : "" }, r.error || t("runs.detail.noError"))
                    ),
                    h2("p", { className: "wba-section-title" }, t("runs.detail.result")),
                    h2("pre", { className: "wba-pre" }, asText(r.result) || "\u2014")
                  )
                ) : null
              ];
            }))
          )
        )
      );
    }
    module2.exports = function RunsView(props) {
      var h2 = props.h;
      var api = props.api;
      var React = props.React;
      var lang = props.lang === "en" ? "en" : "zh";
      var t = props.t;
      var runs = C.useLoad(React, api, "automation.runList", { limit: LIMIT }, []);
      var rules = C.useLoad(React, api, "automation.ruleList", {}, []);
      var filterS = React.useState({ ruleId: "", status: "" });
      var expandS = React.useState("");
      var ruleList = rules.data && rules.data.items || [];
      var names = {};
      var origins = {};
      ruleList.forEach(function(r) {
        names[r.id] = r.name;
        origins[r.id] = r.origin;
      });
      var rows = (runs.data && runs.data.items || []).filter(function(r) {
        if (filterS[0].ruleId && r.ruleId !== filterS[0].ruleId) return false;
        if (filterS[0].status && r.status !== filterS[0].status) return false;
        return true;
      });
      return h2(
        "div",
        { className: "wba-wrap" },
        h2(
          "div",
          { className: "wba-head" },
          h2(
            "div",
            null,
            h2("h2", { className: "wba-title" }, t("runs.title")),
            h2("p", { className: "wba-sub" }, t("runs.subtitle"))
          ),
          h2(
            "div",
            { className: "wba-row" },
            h2(C.Btn, { h: h2, onClick: runs.refresh }, t("common.refresh"))
          )
        ),
        h2(RunsBody, {
          h: h2,
          t,
          lang,
          icon: props.icon,
          rows,
          rules: ruleList,
          ruleId: filterS[0].ruleId,
          status: filterS[0].status,
          expanded: expandS[0],
          loading: runs.loading,
          error: runs.error,
          ruleName: function(id) {
            return names[id] || id;
          },
          ruleOrigin: function(id) {
            return origins[id] || "user";
          },
          onRule: function(v) {
            filterS[1](Object.assign({}, filterS[0], { ruleId: v }));
          },
          onStatus: function(v) {
            filterS[1](Object.assign({}, filterS[0], { status: v }));
          },
          onExpand: function(id) {
            expandS[1](id);
          }
        })
      );
    };
    module2.exports.RunsBody = RunsBody;
    module2.exports.cost = cost;
    module2.exports.LIMIT = LIMIT;
  }
});

// packages/shell/client/automation/action-picker.cjs
var require_action_picker = __commonJS({
  "packages/shell/client/automation/action-picker.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    var DENIED = /^(vault|automation|audit)\.|\.(delete|backup)$/i;
    var NAME = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*){1,2}$/;
    function filterCatalog(items, q) {
      var text = String(q || "").trim().toLowerCase();
      if (!text) return items || [];
      return (items || []).filter(function(row) {
        return String(row.name).toLowerCase().indexOf(text) !== -1 || String(row.domain || "").toLowerCase().indexOf(text) !== -1 || String(row.description || "").toLowerCase().indexOf(text) !== -1;
      });
    }
    function groupByDomain(items) {
      var order = [];
      var map = {};
      (items || []).forEach(function(row) {
        var key = String(row.domain || "other");
        if (!map[key]) {
          map[key] = [];
          order.push(key);
        }
        map[key].push(row);
      });
      return order.map(function(key) {
        return { domain: key, items: map[key] };
      });
    }
    function ActionPicker(props) {
      var h2 = props.h;
      var t = props.t;
      var icon = props.icon;
      var React = props.React;
      var qS = React.useState("");
      var manualS = React.useState("");
      var items = props.items || [];
      var selected = props.selected || [];
      var loading = Boolean(props.loading);
      var error = props.error || "";
      var rows = filterCatalog(items, qS[0]);
      var groups = groupByDomain(rows);
      var known = {};
      items.forEach(function(row) {
        known[row.name] = true;
      });
      var extra = selected.filter(function(name) {
        return !known[name];
      });
      if (extra.length) groups.push({ domain: "__extra", items: extra.map(function(name) {
        return { name, domain: "", description: "" };
      }) });
      function has(name) {
        return selected.indexOf(name) !== -1;
      }
      function toggle(name, on) {
        var next = selected.filter(function(x) {
          return x !== name;
        });
        if (on) next.push(name);
        next.sort();
        props.onChange(next);
      }
      function addManual() {
        var name = manualS[0].trim();
        if (!name) return;
        if (!NAME.test(name) || DENIED.test(name)) {
          manualS[1](name);
          return;
        }
        if (!has(name)) toggle(name, true);
        manualS[1]("");
      }
      var manualBad = manualS[0].trim() ? !NAME.test(manualS[0].trim()) || DENIED.test(manualS[0].trim()) : false;
      return h2(
        "div",
        { className: "wba-panel" },
        h2(
          "div",
          { className: "wba-panel-h" },
          h2("p", { className: "wba-panel-title" }, t("config.allowed.title")),
          icon ? h2("span", { className: "wba-card-ico" }, icon("list-checks", 16)) : null
        ),
        h2("p", { className: "wba-sub" }, t("config.allowed.hint")),
        h2(
          "div",
          { className: "wba-inline" },
          h2(
            "label",
            { className: "wba-field wba-grow" },
            h2("span", { className: "wba-label" }, t("common.search")),
            h2("input", {
              className: "wba-input",
              type: "search",
              value: qS[0],
              placeholder: t("config.allowed.search"),
              "aria-label": t("config.allowed.search"),
              onChange: function(e) {
                qS[1](e.target.value);
              }
            })
          ),
          h2("span", { className: "wba-hint" }, t("config.allowed.selected", { n: selected.length })),
          h2(C.Btn, { h: h2, disabled: !selected.length, onClick: function() {
            props.onChange([]);
          } }, t("common.clear"))
        ),
        error ? h2(C.Notice, { h: h2, kind: "error", text: error }) : null,
        loading ? h2("div", { className: "wba-skel" }) : groups.length === 0 ? h2("p", { className: "wba-hint" }, t("config.allowed.empty")) : h2("div", { className: "wba-picker" }, groups.map(function(group) {
          return h2(
            "div",
            { key: group.domain, className: "wba-picker-group" },
            h2("p", { className: "wba-picker-domain" }, group.domain === "__extra" ? t("config.allowed.extra") : group.domain),
            group.items.map(function(row) {
              return h2(
                "label",
                { key: row.name, className: "wba-check wba-picker-row", title: row.description || row.name },
                h2("input", { type: "checkbox", checked: has(row.name), onChange: function(e) {
                  toggle(row.name, e.target.checked);
                } }),
                h2("code", null, row.name),
                row.description ? h2("span", { className: "wba-hint wba-ellipsis" }, row.description) : null
              );
            })
          );
        })),
        h2(
          "div",
          { className: "wba-inline" },
          h2(
            "label",
            { className: "wba-field wba-grow" },
            h2("span", { className: "wba-label" }, t("config.allowed.manual")),
            h2("input", {
              className: "wba-input" + (manualBad ? " err" : ""),
              value: manualS[0],
              placeholder: "namespace.action",
              "aria-label": t("config.allowed.manual"),
              onChange: function(e) {
                manualS[1](e.target.value);
              }
            })
          ),
          h2(C.Btn, { h: h2, disabled: !manualS[0].trim() || manualBad, onClick: addManual }, t("config.allowed.add"))
        ),
        manualBad ? h2("span", { className: "wba-err-text" }, t("config.allowed.invalid")) : null,
        h2("p", { className: "wba-hint" }, t("config.allowed.deniedNote"))
      );
    }
    module2.exports = { ActionPicker, filterCatalog, groupByDomain };
  }
});

// packages/shell/client/automation/config.cjs
var require_config = __commonJS({
  "packages/shell/client/automation/config.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    var picker = require_action_picker();
    var NF = require_number_field();
    var CONSTRAINTS = ["strategy", "concurrency", "event", "condition", "backup", "safety"];
    function ConfigBody(props) {
      var h2 = props.h;
      var t = props.t;
      var icon = props.icon;
      var form = props.form || {};
      var catalog = props.catalog || { items: [], error: "", loading: false };
      return h2(
        "div",
        { className: "wba-stack" },
        h2(
          "div",
          { className: "wba-panel" },
          h2(
            "div",
            { className: "wba-panel-h" },
            h2("p", { className: "wba-panel-title" }, t("config.limit.title")),
            props.saved && !props.dirty ? h2(C.Pill, { h: h2, kind: "ok" }, t("common.saved")) : null
          ),
          h2(
            "div",
            { className: "wba-grid-2" },
            h2(
              "label",
              { className: "wba-field" },
              h2("span", { className: "wba-label" }, t("config.limit.maxRules")),
              h2(NF.NumberField, {
                h: h2,
                lang: props.lang,
                value: form.maxRules === void 0 ? "" : form.maxRules,
                min: 1,
                max: 500,
                integer: true,
                ariaLabel: t("config.limit.maxRules"),
                onCommit: function(next) {
                  props.onChange("maxRules", next);
                }
              })
            ),
            h2(
              "label",
              { className: "wba-field" },
              h2("span", { className: "wba-label" }, t("config.limit.perHour")),
              h2(NF.NumberField, {
                h: h2,
                lang: props.lang,
                value: form.perHour === void 0 ? "" : form.perHour,
                min: 1,
                max: 600,
                integer: true,
                ariaLabel: t("config.limit.perHour"),
                onCommit: function(next) {
                  props.onChange("perHour", next);
                }
              })
            )
          ),
          h2("p", { className: "wba-sub" }, t("config.limit.hint")),
          h2(
            "div",
            { className: "wba-inline" },
            h2(C.Btn, {
              h: h2,
              kind: "primary",
              disabled: props.busy || !props.dirty,
              onClick: function() {
                props.onSave({ maxRules: Number(form.maxRules), perHour: Number(form.perHour), allowedActions: form.allowedActions || [] });
              }
            }, props.busy ? t("common.loading") : t("common.save")),
            props.dirty ? null : h2("span", { className: "wba-hint" }, t("config.limit.unchanged"))
          ),
          h2("hr", { className: "wba-sep" }),
          h2(
            "div",
            { className: "wba-panel-h" },
            h2("p", { className: "wba-panel-title" }, t("config.constraints.title")),
            icon ? h2("span", { className: "wba-card-ico" }, icon("shield-check", 16)) : null
          ),
          h2("ul", { className: "wba-list" }, CONSTRAINTS.map(function(k) {
            return h2("li", { key: k }, t("config.c." + k));
          }))
        ),
        h2(picker.ActionPicker, {
          h: h2,
          t,
          icon,
          React: props.React,
          items: catalog.items,
          error: catalog.error,
          loading: catalog.loading,
          selected: form.allowedActions || [],
          onChange: function(list) {
            props.onChange("allowedActions", list);
          }
        })
      );
    }
    module2.exports = function ConfigView(props) {
      var h2 = props.h;
      var api = props.api;
      var React = props.React;
      var lang = props.lang === "en" ? "en" : "zh";
      var t = props.t;
      var cfg = C.useLoad(React, api, "automation.configGet", {}, []);
      var catalog = C.useLoad(React, api, "automation.actionCatalog", {}, []);
      var formS = React.useState(null);
      var busyS = React.useState(false);
      var msgS = React.useState(null);
      var savedS = React.useState(false);
      React.useEffect(function() {
        if (cfg.data && !formS[0]) {
          formS[1]({
            maxRules: String(cfg.data.maxRules),
            perHour: String(cfg.data.perHour),
            allowedActions: (cfg.data.allowedActions || []).slice()
          });
        }
      }, [cfg.data]);
      var form = formS[0] || { maxRules: "", perHour: "", allowedActions: [] };
      var base = cfg.data || {};
      var dirty = String(form.maxRules) !== String(base.maxRules) || String(form.perHour) !== String(base.perHour) || (form.allowedActions || []).join(",") !== (base.allowedActions || []).join(",");
      function save(payload) {
        busyS[1](true);
        msgS[1](null);
        C.call(api, "automation.configSet", payload).then(function() {
          busyS[1](false);
          savedS[1](true);
          msgS[1]({ kind: "ok", text: t("common.saved") });
          cfg.refresh();
        }).catch(function(e) {
          busyS[1](false);
          msgS[1]({ kind: "error", text: C.errText(e) });
        });
      }
      return h2(
        "div",
        { className: "wba-wrap" },
        h2(
          "div",
          { className: "wba-head" },
          h2(
            "div",
            null,
            h2("h2", { className: "wba-title" }, t("config.title")),
            h2("p", { className: "wba-sub" }, t("config.subtitle"))
          ),
          h2(
            "div",
            { className: "wba-row" },
            h2(C.Btn, { h: h2, onClick: function() {
              cfg.refresh();
              catalog.refresh();
            } }, t("common.refresh"))
          )
        ),
        msgS[0] ? h2(C.Notice, { h: h2, kind: msgS[0].kind, text: msgS[0].text }) : null,
        cfg.error ? h2(C.Notice, { h: h2, kind: "error", text: cfg.error }) : null,
        cfg.loading && !cfg.data ? h2("div", { className: "wba-panel" }, h2("div", { className: "wba-skel" }), h2("div", { className: "wba-skel" })) : h2(ConfigBody, {
          h: h2,
          lang,
          t,
          icon: props.icon,
          form,
          React,
          busy: busyS[0],
          dirty,
          saved: savedS[0],
          catalog: { items: catalog.data && catalog.data.items || [], error: catalog.data && catalog.data.error || (catalog.error || ""), loading: catalog.loading && !catalog.data },
          onChange: function(k, v) {
            formS[1](Object.assign({}, form, { [k]: v }));
          },
          onSave: save
        })
      );
    };
    module2.exports.ConfigBody = ConfigBody;
    module2.exports.CONSTRAINTS = CONSTRAINTS;
  }
});

// packages/shell/client/automation-page.cjs
var require_automation_page = __commonJS({
  "packages/shell/client/automation-page.cjs"(exports2, module2) {
    "use strict";
    var C = require_common();
    var icons = C.icons;
    var stats = require_stats();
    var StatsView = stats.StatsView || stats;
    var rules = require_rules();
    var runs = require_runs();
    var config = require_config();
    var TABS = [
      ["overview", "auto_tab_overview", "activity"],
      ["rules", "rules.title", "list"],
      ["runs", "runs.title", "history"],
      ["config", "config.title", "sliders-horizontal"]
    ];
    module2.exports = function AutomationView(props) {
      var h2 = props.h;
      var React = props.React;
      var t = C.autoT(props.t);
      var api = C.hostApi(props.api);
      var tabS = React.useState("overview");
      var tab = tabS[0];
      var newS = React.useState(false);
      var wantNew = newS[0];
      React.useEffect(function() {
        if (!wantNew) return void 0;
        var timer = setTimeout(function() {
          newS[1](false);
        }, 0);
        return function() {
          clearTimeout(timer);
        };
      }, [wantNew]);
      function openTab(key) {
        tabS[1](key);
      }
      function onNavigate(name) {
        if (name === "rules") {
          newS[1](true);
          openTab("rules");
          return;
        }
        if (name === "config") openTab("config");
      }
      var body;
      if (tab === "rules") {
        body = h2(rules, { h: h2, api, React, lang: props.lang, t, icon: icons.icon, viewParams: wantNew ? { new: true } : null });
      } else if (tab === "runs") {
        body = h2(runs, { h: h2, api, React, lang: props.lang, t, icon: icons.icon });
      } else if (tab === "config") {
        body = h2(config, { h: h2, api, React, lang: props.lang, t, icon: icons.icon });
      } else {
        body = h2(StatsView, { h: h2, api, React, lang: props.lang, t, icon: icons.icon, onNavigate });
      }
      return h2(
        "div",
        { className: "wb-root" },
        h2(
          "div",
          { className: "wb-auto" },
          props.head(t("auto_page_title"), t("auto_page_desc")),
          h2(
            "div",
            { className: "wb-tabs", role: "tablist" },
            TABS.map(function(item) {
              var active = tab === item[0];
              return h2(
                "button",
                {
                  key: item[0],
                  type: "button",
                  role: "tab",
                  "aria-selected": active,
                  className: "wb-tab" + (active ? " on" : ""),
                  onClick: function() {
                    openTab(item[0]);
                  }
                },
                h2("span", { className: "wba-inline" }, icons.icon(item[2], 13), t(item[1]))
              );
            })
          ),
          body
        )
      );
    };
    module2.exports.TABS = TABS;
  }
});

// packages/shell/client/slot-catalog.cjs
var require_slot_catalog = __commonJS({
  "packages/shell/client/slot-catalog.cjs"(exports2, module2) {
    "use strict";
    var SLOTS = [
      {
        id: "item.actions",
        title: { zh: "\u6761\u76EE\u64CD\u4F5C", en: "Item actions" },
        description: "\u5217\u8868\u6216\u8BE6\u60C5\u91CC\u9488\u5BF9\u5355\u6761\u5BF9\u8C61\u7684\u64CD\u4F5C\u6309\u94AE\uFF0C\u5982\u628A\u4E00\u5C01\u90AE\u4EF6\u53D8\u6210\u4EFB\u52A1\u3002",
        props: { item: "WbItemRef\uFF1A{kind,id,title?,subtitle?,url?}\uFF0C\u7531\u5C5E\u4E3B\u586B\u5199\uFF1Bkind \u5E26\u547D\u540D\u7A7A\u95F4\uFF0C\u5982 mail.message" }
      },
      {
        id: "view.toolbar",
        title: { zh: "\u89C6\u56FE\u5DE5\u5177\u6761", en: "View toolbar" },
        description: "\u63D2\u4EF6\u89C6\u56FE\u9876\u90E8\u5DE5\u5177\u6761\u4E0A\u7684\u8FFD\u52A0\u6309\u94AE\u3002",
        props: { view: "{addonId, viewId}\uFF1A\u5F53\u524D\u6B63\u5728\u770B\u7684\u63D2\u4EF6\u89C6\u56FE" }
      },
      {
        id: "settings.sections",
        title: { zh: "\u8BBE\u7F6E\u5206\u533A", en: "Settings sections" },
        description: "\u914D\u7F6E\u9875\u4E0A\u8FFD\u52A0\u7684\u4E00\u6BB5\u8BBE\u7F6E\u5757\u3002",
        props: { owner: "string\uFF1A\u843D\u70B9\u6240\u5C5E\u63D2\u4EF6 id" }
      },
      {
        id: "home.card.footer",
        title: { zh: "\u9996\u9875\u5361\u7247\u5E95\u90E8", en: "Home card footer" },
        description: "\u5DE5\u4F5C\u53F0\u9996\u9875\u63D2\u4EF6\u5361\u7247\u5E95\u90E8\u7684\u4E00\u884C\u6587\u5B57\u6216\u6309\u94AE\u3002",
        props: { card: "{addonId,title}\uFF1A\u5361\u7247\u5BF9\u5E94\u7684\u63D2\u4EF6" }
      }
    ];
    var INDEX = {};
    SLOTS.forEach(function(slot) {
      INDEX[slot.id] = slot;
    });
    module2.exports = {
      slots: SLOTS,
      has: function(id) {
        return Object.prototype.hasOwnProperty.call(INDEX, String(id || ""));
      },
      get: function(id) {
        return INDEX[String(id || "")] || null;
      },
      ids: function() {
        return SLOTS.map(function(s) {
          return s.id;
        });
      }
    };
  }
});

// packages/shell/client/slot-registry.cjs
var require_slot_registry = __commonJS({
  "packages/shell/client/slot-registry.cjs"(exports2, module2) {
    "use strict";
    var DEFAULT_ORDER = 100;
    var UNKNOWN_OWNER = "unknown";
    function idCompare(a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    }
    module2.exports = function createSlotRegistry(catalog, onChange) {
      var bySlot = {};
      var problems = [];
      function notify() {
        if (typeof onChange === "function") {
          try {
            onChange();
          } catch (e) {
            console.error("[dsh-workbench] \u63D2\u69FD\u53D8\u66F4\u901A\u77E5\u5931\u8D25", e);
          }
        }
      }
      function reject(reason, detail) {
        problems.push(Object.assign({ reason }, detail || {}));
        console.error("[dsh-workbench] \u63D2\u69FD\u8D21\u732E\u88AB\u62D2\u7EDD\uFF08" + reason + "\uFF09", detail && (detail.slot || "") + "/" + (detail && detail.id || ""), detail && detail.addonId || "");
        return false;
      }
      function add(contrib, addonId) {
        var owner = typeof addonId === "string" && addonId ? addonId : UNKNOWN_OWNER;
        if (!contrib || typeof contrib !== "object") return reject("invalid-contribution", { addonId: owner });
        var slotId = String(contrib.slot || "");
        var id = String(contrib.id || "");
        if (!id) return reject("invalid-id", { slot: slotId, addonId: owner });
        if (typeof contrib.component !== "function") return reject("invalid-component", { slot: slotId, id, addonId: owner });
        if (!catalog.has(slotId)) return reject("unknown-slot", { slot: slotId, id, addonId: owner });
        var bucket = bySlot[slotId] || (bySlot[slotId] = {});
        if (Object.prototype.hasOwnProperty.call(bucket, id)) return reject("duplicate-id", { slot: slotId, id, addonId: owner });
        var order = Number(contrib.order);
        bucket[id] = {
          slot: slotId,
          id,
          addonId: owner,
          order: Number.isFinite(order) ? order : DEFAULT_ORDER,
          title: contrib.title === void 0 ? null : contrib.title,
          icon: typeof contrib.icon === "function" ? contrib.icon : null,
          component: contrib.component,
          error: null
        };
        notify();
        return true;
      }
      function addAll(list, addonId) {
        if (!Array.isArray(list)) return 0;
        var accepted = 0;
        for (var i = 0; i < list.length; i += 1) if (add(list[i], addonId)) accepted += 1;
        return accepted;
      }
      function removeAddon(addonId) {
        var removed = 0;
        Object.keys(bySlot).forEach(function(slotId) {
          var bucket = bySlot[slotId];
          Object.keys(bucket).forEach(function(id) {
            if (bucket[id].addonId !== addonId) return;
            delete bucket[id];
            removed += 1;
          });
          if (!Object.keys(bucket).length) delete bySlot[slotId];
        });
        if (removed) notify();
        return removed;
      }
      function markError(slotId, id, error) {
        var bucket = bySlot[slotId];
        if (!bucket || !bucket[id]) return;
        bucket[id].error = String(error && error.message || error || "unknown");
      }
      function get(slotId) {
        var bucket = bySlot[String(slotId || "")];
        if (!bucket) return [];
        return Object.keys(bucket).map(function(id) {
          return bucket[id];
        }).sort(function(a, b) {
          return a.order === b.order ? idCompare(a.id, b.id) : a.order - b.order;
        });
      }
      function describe(slotId) {
        return get(slotId).map(function(entry) {
          return { slot: entry.slot, id: entry.id, addonId: entry.addonId, order: entry.order, title: entry.title, ok: entry.error === null, error: entry.error };
        });
      }
      return {
        add,
        addAll,
        removeAddon,
        markError,
        get,
        describe,
        problems: function() {
          return problems.slice();
        },
        clearProblems: function() {
          problems.length = 0;
        },
        size: function(slotId) {
          return get(slotId).length;
        }
      };
    };
  }
});

// node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/cjs/react-dom.development.js
var require_react_dom_development = __commonJS({
  "node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/cjs/react-dom.development.js"(exports2) {
    "use strict";
    (function() {
      function noop() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function createPortal$1(children, containerInfo, implementation) {
        var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
        try {
          testStringCoercion(key);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        JSCompiler_inline_result && (console.error(
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          "function" === typeof Symbol && Symbol.toStringTag && key[Symbol.toStringTag] || key.constructor.name || "Object"
        ), testStringCoercion(key));
        return {
          $$typeof: REACT_PORTAL_TYPE,
          key: null == key ? null : "" + key,
          children,
          containerInfo,
          implementation
        };
      }
      function getCrossOriginStringAs(as, input) {
        if ("font" === as) return "";
        if ("string" === typeof input)
          return "use-credentials" === input ? input : "";
      }
      function getValueDescriptorExpectingObjectForWarning(thing) {
        return null === thing ? "`null`" : void 0 === thing ? "`undefined`" : "" === thing ? "an empty string" : 'something with type "' + typeof thing + '"';
      }
      function getValueDescriptorExpectingEnumForWarning(thing) {
        return null === thing ? "`null`" : void 0 === thing ? "`undefined`" : "" === thing ? "an empty string" : "string" === typeof thing ? JSON.stringify(thing) : "number" === typeof thing ? "`" + thing + "`" : 'something with type "' + typeof thing + '"';
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var React = require("react"), Internals = {
        d: {
          f: noop,
          r: function() {
            throw Error(
              "Invalid form element. requestFormReset must be passed a form that was rendered by React."
            );
          },
          D: noop,
          C: noop,
          L: noop,
          m: noop,
          X: noop,
          S: noop,
          M: noop
        },
        p: 0,
        findDOMNode: null
      }, REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
      "function" === typeof Map && null != Map.prototype && "function" === typeof Map.prototype.forEach && "function" === typeof Set && null != Set.prototype && "function" === typeof Set.prototype.clear && "function" === typeof Set.prototype.forEach || console.error(
        "React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills"
      );
      exports2.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
      exports2.createPortal = function(children, container) {
        var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
        if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType)
          throw Error("Target container is not a DOM element.");
        return createPortal$1(children, container, null, key);
      };
      exports2.flushSync = function(fn) {
        var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
        try {
          if (ReactSharedInternals.T = null, Internals.p = 2, fn)
            return fn();
        } finally {
          ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f() && console.error(
            "flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task."
          );
        }
      };
      exports2.preconnect = function(href, options) {
        "string" === typeof href && href ? null != options && "object" !== typeof options ? console.error(
          "ReactDOM.preconnect(): Expected the `options` argument (second) to be an object but encountered %s instead. The only supported option at this time is `crossOrigin` which accepts a string.",
          getValueDescriptorExpectingEnumForWarning(options)
        ) : null != options && "string" !== typeof options.crossOrigin && console.error(
          "ReactDOM.preconnect(): Expected the `crossOrigin` option (second argument) to be a string but encountered %s instead. Try removing this option or passing a string value instead.",
          getValueDescriptorExpectingObjectForWarning(options.crossOrigin)
        ) : console.error(
          "ReactDOM.preconnect(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
          getValueDescriptorExpectingObjectForWarning(href)
        );
        "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
      };
      exports2.prefetchDNS = function(href) {
        if ("string" !== typeof href || !href)
          console.error(
            "ReactDOM.prefetchDNS(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
            getValueDescriptorExpectingObjectForWarning(href)
          );
        else if (1 < arguments.length) {
          var options = arguments[1];
          "object" === typeof options && options.hasOwnProperty("crossOrigin") ? console.error(
            "ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. It looks like the you are attempting to set a crossOrigin property for this DNS lookup hint. Browsers do not perform DNS queries using CORS and setting this attribute on the resource hint has no effect. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.",
            getValueDescriptorExpectingEnumForWarning(options)
          ) : console.error(
            "ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.",
            getValueDescriptorExpectingEnumForWarning(options)
          );
        }
        "string" === typeof href && Internals.d.D(href);
      };
      exports2.preinit = function(href, options) {
        "string" === typeof href && href ? null == options || "object" !== typeof options ? console.error(
          "ReactDOM.preinit(): Expected the `options` argument (second) to be an object with an `as` property describing the type of resource to be preinitialized but encountered %s instead.",
          getValueDescriptorExpectingEnumForWarning(options)
        ) : "style" !== options.as && "script" !== options.as && console.error(
          'ReactDOM.preinit(): Expected the `as` property in the `options` argument (second) to contain a valid value describing the type of resource to be preinitialized but encountered %s instead. Valid values for `as` are "style" and "script".',
          getValueDescriptorExpectingEnumForWarning(options.as)
        ) : console.error(
          "ReactDOM.preinit(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
          getValueDescriptorExpectingObjectForWarning(href)
        );
        if ("string" === typeof href && options && "string" === typeof options.as) {
          var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
          "style" === as ? Internals.d.S(
            href,
            "string" === typeof options.precedence ? options.precedence : void 0,
            {
              crossOrigin,
              integrity,
              fetchPriority
            }
          ) : "script" === as && Internals.d.X(href, {
            crossOrigin,
            integrity,
            fetchPriority,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0
          });
        }
      };
      exports2.preinitModule = function(href, options) {
        var encountered = "";
        "string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
        void 0 !== options && "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : options && "as" in options && "script" !== options.as && (encountered += " The `as` option encountered was " + getValueDescriptorExpectingEnumForWarning(options.as) + ".");
        if (encountered)
          console.error(
            "ReactDOM.preinitModule(): Expected up to two arguments, a non-empty `href` string and, optionally, an `options` object with a valid `as` property.%s",
            encountered
          );
        else
          switch (encountered = options && "string" === typeof options.as ? options.as : "script", encountered) {
            case "script":
              break;
            default:
              encountered = getValueDescriptorExpectingEnumForWarning(encountered), console.error(
                'ReactDOM.preinitModule(): Currently the only supported "as" type for this function is "script" but received "%s" instead. This warning was generated for `href` "%s". In the future other module types will be supported, aligning with the import-attributes proposal. Learn more here: (https://github.com/tc39/proposal-import-attributes)',
                encountered,
                href
              );
          }
        if ("string" === typeof href)
          if ("object" === typeof options && null !== options) {
            if (null == options.as || "script" === options.as)
              encountered = getCrossOriginStringAs(
                options.as,
                options.crossOrigin
              ), Internals.d.M(href, {
                crossOrigin: encountered,
                integrity: "string" === typeof options.integrity ? options.integrity : void 0,
                nonce: "string" === typeof options.nonce ? options.nonce : void 0
              });
          } else null == options && Internals.d.M(href);
      };
      exports2.preload = function(href, options) {
        var encountered = "";
        "string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
        null == options || "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : "string" === typeof options.as && options.as || (encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".");
        encountered && console.error(
          'ReactDOM.preload(): Expected two arguments, a non-empty `href` string and an `options` object with an `as` property valid for a `<link rel="preload" as="..." />` tag.%s',
          encountered
        );
        if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
          encountered = options.as;
          var crossOrigin = getCrossOriginStringAs(
            encountered,
            options.crossOrigin
          );
          Internals.d.L(href, encountered, {
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0,
            type: "string" === typeof options.type ? options.type : void 0,
            fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
            referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
            imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
            imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
            media: "string" === typeof options.media ? options.media : void 0
          });
        }
      };
      exports2.preloadModule = function(href, options) {
        var encountered = "";
        "string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
        void 0 !== options && "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : options && "as" in options && "string" !== typeof options.as && (encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".");
        encountered && console.error(
          'ReactDOM.preloadModule(): Expected two arguments, a non-empty `href` string and, optionally, an `options` object with an `as` property valid for a `<link rel="modulepreload" as="..." />` tag.%s',
          encountered
        );
        "string" === typeof href && (options ? (encountered = getCrossOriginStringAs(
          options.as,
          options.crossOrigin
        ), Internals.d.m(href, {
          as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
          crossOrigin: encountered,
          integrity: "string" === typeof options.integrity ? options.integrity : void 0
        })) : Internals.d.m(href));
      };
      exports2.requestFormReset = function(form) {
        Internals.d.r(form);
      };
      exports2.unstable_batchedUpdates = function(fn, a) {
        return fn(a);
      };
      exports2.useFormState = function(action, initialState, permalink) {
        return resolveDispatcher().useFormState(action, initialState, permalink);
      };
      exports2.useFormStatus = function() {
        return resolveDispatcher().useHostTransitionStatus();
      };
      exports2.version = "19.2.0";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/index.js
var require_react_dom = __commonJS({
  "node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/index.js"(exports2, module2) {
    "use strict";
    if (false) {
      checkDCE();
      module2.exports = null;
    } else {
      module2.exports = require_react_dom_development();
    }
  }
});

// packages/addons/lib/button.cjs
var require_button = __commonJS({
  "packages/addons/lib/button.cjs"(exports2, module2) {
    "use strict";
    var React = require("react");
    var h2 = React.createElement;
    module2.exports = function createButton(options) {
      var opts = options || {};
      var prefix = opts.prefix;
      var Icon2 = opts.Icon;
      function Button(props) {
        var attrs = Object.assign({ type: "button", className: prefix + "-btn" }, props);
        delete attrs.icon;
        delete attrs.iconOnly;
        if (props.icon) {
          attrs["aria-label"] = props["aria-label"] || props.children;
          attrs.title = props.title || attrs["aria-label"];
          attrs.className += props.iconOnly ? " " + prefix + "-icon-only" : " " + prefix + "-icon-text";
        }
        return h2(
          "button",
          attrs,
          props.icon ? h2(Icon2, { name: props.icon }) : null,
          props.iconOnly ? null : props.icon ? h2("span", { className: prefix + "-btn-label" }, props.children) : props.children
        );
      }
      return Button;
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/check.mjs
var check_exports = {};
__export(check_exports, {
  __iconData: () => __iconData31,
  default: () => Check
});
var __iconData31, Check;
var init_check = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/check.mjs"() {
    init_createLucideIcon();
    __iconData31 = {
      name: "check",
      size: 24,
      node: [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]
    };
    __iconData31.node;
    Check = createLucideIcon(__iconData31);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/user.mjs
var user_exports = {};
__export(user_exports, {
  __iconData: () => __iconData32,
  default: () => User
});
var __iconData32, User;
var init_user = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/user.mjs"() {
    init_createLucideIcon();
    __iconData32 = {
      name: "user",
      size: 24,
      node: [
        ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
        ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
      ]
    };
    __iconData32.node;
    User = createLucideIcon(__iconData32);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/circle-x.mjs
var __iconData33, CircleX;
var init_circle_x = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/circle-x.mjs"() {
    init_createLucideIcon();
    __iconData33 = {
      name: "circle-x",
      size: 24,
      node: [
        ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
        ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
        ["path", { d: "m9 9 6 6", key: "z0biqf" }]
      ],
      aliases: ["x-circle"]
    };
    __iconData33.node;
    CircleX = createLucideIcon(__iconData33);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/x-circle.mjs
var x_circle_exports = {};
__export(x_circle_exports, {
  default: () => CircleX
});
var init_x_circle = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/x-circle.mjs"() {
    init_circle_x();
  }
});

// packages/shell/client/conversation/icons.cjs
var require_icons2 = __commonJS({
  "packages/shell/client/conversation/icons.cjs"(exports2, module2) {
    "use strict";
    var iconsLib = require_icons();
    module2.exports = iconsLib.create("wb-role", {
      "check": (init_check(), __toCommonJS(check_exports)).default,
      "bot": (init_bot(), __toCommonJS(bot_exports)).default,
      "user": (init_user(), __toCommonJS(user_exports)).default,
      "x-circle": (init_x_circle(), __toCommonJS(x_circle_exports)).default
    }, { fallback: "bot", classNameAppend: true });
  }
});

// packages/shell/client/conversation/session-role.cjs
var require_session_role = __commonJS({
  "packages/shell/client/conversation/session-role.cjs"(exports2, module2) {
    "use strict";
    var React = require("react");
    var { createPortal } = require_react_dom();
    var h2 = React.createElement;
    var Button = require_button()({ prefix: "wb-role" });
    var { Icon: Icon2 } = require_icons2();
    var Dialog = require_overlay()({
      maskClass: "wb-role-mask",
      dialogClass: "wb-role-dialog",
      header: (props) => h2(
        "div",
        { className: "wb-role-head" },
        h2("h2", { className: "wb-role-title" }, props.title),
        props.subtitle ? h2("p", { className: "wb-role-sub" }, props.subtitle) : null
      )
    });
    var endpoint = "/workbench/api/session-role";
    var listeners2 = /* @__PURE__ */ new Set();
    var TOKEN_SPLIT = /\s+/;
    function tokensOf(query) {
      return String(query || "").toLowerCase().split(TOKEN_SPLIT).filter(Boolean);
    }
    function haystackOf(role) {
      const actions = Array.isArray(role && role.actions) ? role.actions : [];
      return [role && role.name, role && role.domain, role && role.description, ...actions].filter(Boolean).join(" ").toLowerCase();
    }
    function matchRole(role, tokens) {
      if (!tokens.length) return true;
      const hay = haystackOf(role);
      return tokens.every((token) => hay.includes(token));
    }
    function filterRoles(roles, query) {
      const tokens = tokensOf(query);
      return (roles || []).filter((role) => matchRole(role, tokens));
    }
    function splitHits(value, tokens) {
      const text = String(value == null ? "" : value);
      if (!text) return [];
      if (!tokens.length) return [{ text, hit: false }];
      const lower = text.toLowerCase();
      const ranges = [];
      for (const token of tokens) {
        let from = 0;
        for (; ; ) {
          const at = lower.indexOf(token, from);
          if (at < 0) break;
          ranges.push([at, at + token.length]);
          from = at + token.length;
          if (!token.length) break;
        }
      }
      if (!ranges.length) return [{ text, hit: false }];
      ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
      const merged = [];
      for (const range of ranges) {
        const last = merged[merged.length - 1];
        if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
        else merged.push([range[0], range[1]]);
      }
      const parts = [];
      let cursor = 0;
      for (const [start, end] of merged) {
        if (start > cursor) parts.push({ text: text.slice(cursor, start), hit: false });
        parts.push({ text: text.slice(start, end), hit: true });
        cursor = end;
      }
      if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false });
      return parts;
    }
    function attachStream(stream2) {
      function refresh(event) {
        try {
          const sid = JSON.parse(event.data).sessionId;
          if (sid) listeners2.forEach((listener) => listener(sid));
        } catch (error) {
          console.warn(error);
        }
      }
      stream2.addEventListener("session-role", refresh);
      function refreshAll() {
        listeners2.forEach((listener) => listener(null));
      }
      stream2.addEventListener("role-catalog", refreshAll);
      stream2.addEventListener("domains-changed", refreshAll);
      stream2.addEventListener("open", refreshAll);
    }
    async function request(sid, patch) {
      const response = patch ? await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: sid, ...patch })
      }) : await fetch(endpoint + "?sessionId=" + encodeURIComponent(sid));
      const data = await response.json();
      if (!response.ok || data.ok === false || data.sessionId !== sid) throw new Error(data.error || "HTTP " + response.status);
      return data;
    }
    function fill(text, values) {
      return String(text || "").replace(/\{(\w+)\}/g, (all, key) => key in values ? String(values[key]) : all);
    }
    function SessionRole({ sessionId: sid, t, ensureStream: ensureStream2 }) {
      const [state, setState] = React.useState(null);
      const [open, setOpen] = React.useState(false);
      const [busy, setBusy] = React.useState(false);
      const [error, setError] = React.useState("");
      const [query, setQuery] = React.useState("");
      const generation = React.useRef(0);
      const saving = React.useRef(false);
      const alive = React.useRef(false);
      const searchRef = React.useRef(null);
      const listRef = React.useRef(null);
      const refresh = React.useCallback(async () => {
        const current2 = ++generation.current;
        try {
          const result = await request(sid);
          if (alive.current && current2 === generation.current) {
            setState(result);
            setError("");
          }
        } catch (e) {
          if (alive.current && current2 === generation.current) setError(String(e.message || e));
        }
      }, [sid]);
      React.useEffect(() => {
        if (!sid) return;
        alive.current = true;
        const listener = (changed) => {
          if (!changed || changed === sid) refresh();
        };
        listeners2.add(listener);
        ensureStream2();
        refresh();
        return () => {
          alive.current = false;
          generation.current++;
          listeners2.delete(listener);
        };
      }, [sid, refresh, ensureStream2]);
      async function save(patch) {
        if (saving.current || !state) return;
        saving.current = true;
        ++generation.current;
        setBusy(true);
        setError("");
        try {
          const result = await request(sid, patch);
          if (alive.current) {
            ++generation.current;
            setState((previous) => ({ ...previous, ...result }));
            setQuery("");
            setOpen(false);
            refresh();
          }
        } catch (e) {
          if (alive.current) setError(String(e.message || e));
        } finally {
          saving.current = false;
          if (alive.current) setBusy(false);
        }
      }
      if (!sid) return null;
      const roles = state?.roles || [];
      const selected = roles.find((r) => r.id === state?.roleId);
      const missing = state?.roleId && !selected;
      const label = selected?.name || t(missing ? "role_missing" : "role_none");
      const tokens = tokensOf(query);
      const matched = filterRoles(roles, query);
      const searching = tokens.length > 0;
      const current = state ? state.roleId ?? null : void 0;
      function clearQuery() {
        setQuery("");
        if (searchRef.current && searchRef.current.focus) searchRef.current.focus();
      }
      function escape() {
        if (searching) clearQuery();
        else setOpen(false);
      }
      function focusItem(step) {
        if (!listRef.current || !listRef.current.querySelectorAll) return;
        const items = Array.from(listRef.current.querySelectorAll("button:not(:disabled)"));
        if (!items.length) return;
        const active = typeof document === "undefined" ? null : document.activeElement;
        const at = items.indexOf(active);
        const next = at < 0 ? step > 0 ? 0 : items.length - 1 : Math.min(items.length - 1, Math.max(0, at + step));
        if (items[next] && items[next].focus) items[next].focus();
      }
      function onSearchKeyDown(event) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          focusItem(1);
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          focusItem(-1);
          return;
        }
        if (event.key === "Enter") {
          if (matched.length === 1) {
            event.preventDefault();
            save({ roleId: matched[0].id });
            return;
          }
          if (matched.length) {
            event.preventDefault();
            focusItem(1);
          }
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          escape();
        }
      }
      function onItemKeyDown(event) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          focusItem(1);
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          focusItem(-1);
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          escape();
        }
      }
      function marked(value) {
        return splitHits(value, tokens).map((part, index) => part.hit ? h2("mark", { key: "m" + index, className: "wb-role-mark" }, part.text) : part.text);
      }
      function glyphOf(role) {
        return role.source === "user" ? "user" : "bot";
      }
      function optionRow(role) {
        const on = !!state && current === role.id;
        return h2(
          Button,
          {
            key: role.id,
            className: "wb-role-option",
            disabled: busy || !state,
            "aria-pressed": on,
            onKeyDown: onItemKeyDown,
            onClick: () => on ? setOpen(false) : save({ roleId: role.id })
          },
          h2(
            "span",
            { className: "wb-role-option-icon", "aria-hidden": "true" },
            h2(Icon2, { name: glyphOf(role), size: 14 })
          ),
          h2(
            "span",
            { className: "wb-role-option-text" },
            h2("span", { className: "wb-role-option-name" }, marked(role.name)),
            // 域与说明拆成两个元素：说明较长时才能各自换行，也不再依赖「·」拼串。
            (role.domain || role.description) && h2(
              "span",
              { className: "wb-role-option-meta" },
              role.domain ? h2("span", { className: "wb-role-option-domain" }, marked(role.domain)) : null,
              role.description ? h2("span", { className: "wb-role-option-desc" }, marked(role.description)) : null
            )
          ),
          h2(
            "span",
            { className: "wb-role-option-check", "aria-hidden": "true" },
            on ? h2(Icon2, { name: "check", size: 14, strokeWidth: 2.5 }) : null
          )
        );
      }
      return h2(
        React.Fragment,
        null,
        h2(
          Button,
          {
            className: "wb-role-trigger",
            "aria-haspopup": "dialog",
            "aria-expanded": open,
            title: t("role_title"),
            onClick: () => {
              setOpen(true);
              refresh();
            }
          },
          state ? label : t("role_title")
        ),
        open && createPortal(h2(
          Dialog,
          {
            title: t("role_title"),
            subtitle: t("role_next"),
            onClose: () => {
              setQuery("");
              setOpen(false);
            },
            closeOnEscape: !busy,
            closeOnMask: !busy,
            autoFocus: false
          },
          error && h2(
            "div",
            { className: "wb-role-error", role: "alert" },
            t("role_error") + " \xB7 " + error,
            " ",
            h2(Button, { className: "wb-role-retry", disabled: busy, onClick: refresh }, t("role_retry"))
          ),
          missing && h2("p", { className: "wb-role-note", role: "status" }, t("role_missing")),
          h2("input", {
            ref: searchRef,
            className: "wb-role-search",
            type: "search",
            value: query,
            autoFocus: true,
            "aria-label": t("role_search"),
            placeholder: t("role_search"),
            onChange: (event) => setQuery(event.target.value),
            onKeyDown: onSearchKeyDown
          }),
          searching && h2(
            "small",
            { className: "wb-role-count", role: "status" },
            fill(t("role_search_count"), { shown: matched.length, total: roles.length })
          ),
          !state && !error && h2("p", { className: "wb-role-note", role: "status" }, t("role_loading")),
          h2(
            "div",
            { ref: listRef, className: "wb-role-list", role: "group", "aria-label": t("role_title") },
            matched.map(optionRow)
          ),
          searching && !matched.length && h2(
            "div",
            { className: "wb-role-empty", role: "status" },
            h2("span", null, t("role_search_empty")),
            " ",
            h2(Button, { className: "wb-role-clear", onClick: clearQuery }, t("role_search_clear"))
          ),
          // 分隔线之后是退出项：不参与过滤、不混在角色列表里，语义更像「取消选择」。
          h2("hr", { className: "wb-role-sep" }),
          h2(
            Button,
            {
              className: "wb-role-none",
              disabled: busy || !state,
              "aria-pressed": !!state && current === null,
              onClick: () => !!state && current === null ? setOpen(false) : save({ roleId: null })
            },
            h2("span", { className: "wb-role-none-icon", "aria-hidden": "true" }, h2(Icon2, { name: "x-circle", size: 14 })),
            h2("span", { className: "wb-role-none-name" }, t("role_none")),
            h2("small", { className: "wb-role-none-desc" }, t("role_none_desc"))
          ),
          h2(
            "div",
            { className: "wb-role-foot" },
            h2("span", { className: "wb-role-hint" }, t("role_hint")),
            h2(Button, {
              className: "wb-role-close",
              disabled: busy,
              onClick: () => {
                setQuery("");
                setOpen(false);
              }
            }, t("role_close"))
          )
        ), document.body)
      );
    }
    module2.exports = { SessionRole, attachStream, filterRoles, splitHits, tokensOf };
  }
});

// packages/shell/client/slot-outlet.cjs
var require_slot_outlet = __commonJS({
  "packages/shell/client/slot-outlet.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function createSlotOutlet(react2, deps) {
      var h2 = react2.createElement;
      var Component = react2.Component;
      function pickLang(value) {
        return value === "en" ? "en" : "zh";
      }
      function payloadOf(props) {
        var out = {};
        Object.keys(props || {}).forEach(function(key) {
          if (key === "slot" || key === "lang" || key === "t" || key === "ownerId" || key === "children" || key === "key") return;
          out[key] = props[key];
        });
        return out;
      }
      function makeBoundary() {
        function Boundary(props) {
          Component.call(this, props);
          this.state = { failed: false };
          this.componentDidCatch = function(error) {
            this.setState({ failed: true });
            deps.registry.markError(props.slot, props.contribution.id, error);
            console.error("[dsh-workbench] \u63D2\u69FD\u8D21\u732E\u6E32\u67D3\u5931\u8D25\uFF1A" + props.slot + "/" + props.contribution.id, error);
          };
        }
        Boundary.prototype = Object.create(Component.prototype);
        Boundary.prototype.constructor = Boundary;
        Boundary.prototype.render = function() {
          return this.state.failed ? null : this.props.children;
        };
        return Boundary;
      }
      var SlotBoundary = makeBoundary();
      function Slot(props) {
        var bump = react2.useState(0);
        react2.useEffect(function() {
          var off = deps.subscribe(function() {
            bump[1](function(x) {
              return x + 1;
            });
          });
          return typeof off === "function" ? off : function() {
          };
        }, []);
        var entries = deps.registry.get(props.slot);
        if (!entries.length) return null;
        var lang = pickLang(props.lang);
        var t = typeof props.t === "function" ? props.t : function(key) {
          return key;
        };
        var payload = payloadOf(props);
        var ownerId = typeof props.ownerId === "string" ? props.ownerId : null;
        return h2(
          "span",
          { className: "wb-slot", "data-slot": props.slot, style: { display: "contents" } },
          entries.map(function(entry) {
            var childProps = Object.assign({}, payload, {
              slot: props.slot,
              ownerId,
              contributorId: entry.addonId,
              lang,
              t,
              api: deps.apiFor(entry.addonId),
              onNavigate: function(viewId, params) {
                return deps.navigate(entry.addonId, viewId, params);
              }
            });
            return h2(
              SlotBoundary,
              { key: entry.id, slot: props.slot, contribution: entry },
              h2(entry.component, childProps)
            );
          })
        );
      }
      return { Slot, SlotBoundary, payloadOf };
    };
  }
});

// packages/shell/client/backup-tab.cjs
var require_backup_tab = __commonJS({
  "packages/shell/client/backup-tab.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function createBackupTab(react2, jsx2) {
      var FORMATS = [
        { value: "zip", name: "backup_fmt_zip", hint: "backup_fmt_zip_hint" },
        { value: "json", name: "backup_fmt_json", hint: "backup_fmt_json_hint" },
        { value: "csv", name: "backup_fmt_csv", hint: "backup_fmt_csv_hint" },
        { value: "txt", name: "backup_fmt_txt", hint: "backup_fmt_txt_hint" }
      ];
      function icon(name) {
        var paths = {
          gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4 0a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.2.63.75 1.08 1.41 1.14H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z",
          download: "M12 3v11m0 0 4.2-4.2M12 14 7.8 9.8M4 16.5V18a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18v-1.5",
          upload: "M12 16V5m0 0 4.2 4.2M12 5 7.8 9.2M4 16.5V18a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18v-1.5"
        };
        return jsx2.jsx("svg", {
          className: "wb-backup-icon",
          viewBox: "0 0 24 24",
          width: 16,
          height: 16,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.7,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: jsx2.jsx("path", { d: paths[name] || paths.gear })
        });
      }
      function BackupTab2(props) {
        var t = props.t;
        var addons = props.addons || [];
        var exportable = addons.filter(function(a) {
          return a && a.backup && a.backup.export;
        });
        var preferences = props.preferences || {};
        var preferredIds = preferences["backup.moduleIds"];
        var stSel = react2.useState({});
        var selected = stSel[0];
        var setSelected = stSel[1];
        var stBusy = react2.useState("");
        var busy = stBusy[0];
        var setBusy = stBusy[1];
        var stMsg = react2.useState(null);
        var msg = stMsg[0];
        var setMsg = stMsg[1];
        var stReport = react2.useState(null);
        var report = stReport[0];
        var setReport = stReport[1];
        var stExported = react2.useState(null);
        var exported = stExported[0];
        var setExported = stExported[1];
        var stPolicies = react2.useState({});
        var policies = stPolicies[0];
        var setPolicies = stPolicies[1];
        var stOpen = react2.useState({});
        var openConfig = stOpen[0];
        var setOpenConfig = stOpen[1];
        var stFormat = react2.useState(preferences["backup.exportFormat"] || "zip");
        var format = stFormat[0];
        var setFormat = stFormat[1];
        var stDrag = react2.useState(false);
        var dragging = stDrag[0];
        var setDragging = stDrag[1];
        var stClearPhrase = react2.useState("");
        var clearPhrase = stClearPhrase[0];
        var setClearPhrase = stClearPhrase[1];
        var stClearMsg = react2.useState(null);
        var clearMsg = stClearMsg[0];
        var setClearMsg = stClearMsg[1];
        var stClearDone = react2.useState(null);
        var clearDone = stClearDone[0];
        var setClearDone = stClearDone[1];
        var fileRef = react2.useRef(null);
        function isSelected(id) {
          if (Object.hasOwn(selected, id)) return selected[id];
          return !Array.isArray(preferredIds) || preferredIds.includes(id);
        }
        var chosen = exportable.filter(function(a) {
          return isSelected(a.id);
        });
        var allSelected = exportable.length > 0 && chosen.length === exportable.length;
        function toggle(id) {
          var next = Object.assign({}, selected);
          next[id] = !isSelected(id);
          setSelected(next);
        }
        function selectAll(flag) {
          var next = {};
          exportable.forEach(function(a) {
            next[a.id] = flag;
          });
          setSelected(next);
        }
        function policyOf(id) {
          return policies[id] || "newest";
        }
        function policyLabel(policy) {
          if (policy === "skip") return t("backup_dup_skip");
          if (policy === "overwrite") return t("backup_dup_overwrite");
          return t("backup_dup_newest");
        }
        function setPolicy(id, value) {
          setPolicies(function(prev) {
            var next = Object.assign({}, prev);
            next[id] = value;
            return next;
          });
        }
        function toggleConfig(id) {
          setOpenConfig(function(prev) {
            var next = Object.assign({}, prev);
            next[id] = !next[id];
            return next;
          });
        }
        var CLEAR_PHRASE = "\u6E05\u7A7A\u5168\u90E8\u6570\u636E";
        var clearArmed = clearPhrase.trim() === CLEAR_PHRASE;
        function doClear() {
          if (!clearArmed || busy) return;
          setBusy("clear");
          setClearMsg(null);
          fetch("/workbench/api/data/clear", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ confirm: clearPhrase.trim() })
          }).then(function(res) {
            return res.json().catch(function() {
              return null;
            }).then(function(data) {
              return { status: res.status, data };
            });
          }).then(function(r) {
            setBusy("");
            var d = r.data || {};
            if (r.status === 200 && d.ok) {
              setClearDone(d);
              setClearPhrase("");
              return;
            }
            var text = d.code === "sync_running" ? t("clear_sync_busy") : d.error || t("clear_failed");
            setClearMsg(text);
          }).catch(function(e) {
            setBusy("");
            setClearMsg(String(e && e.message || e));
          });
        }
        function statusLabel(status) {
          if (status === "ok") return t("backup_ok");
          if (status === "partial") return t("backup_partial");
          if (status === "skipped") return t("backup_skipped_status");
          return t("backup_failed_status");
        }
        function formatName(value) {
          var hit = FORMATS.filter(function(f) {
            return f.value === value;
          })[0];
          return hit ? t(hit.name) : value;
        }
        function doExport() {
          if (busy) return;
          var ids = chosen.map(function(a) {
            return a.id;
          });
          if (!ids.length) {
            setMsg({ kind: "err", text: t("backup_select_required") });
            return;
          }
          setBusy("export");
          setMsg(null);
          setReport(null);
          setExported(null);
          var url = "/workbench/api/backup/export?modules=" + ids.map(encodeURIComponent).join(",") + "&format=" + encodeURIComponent(format);
          fetch(url).then(function(r) {
            if (!r.ok) {
              return r.json().catch(function() {
                return {};
              }).then(function(j) {
                throw new Error(j && j.error || "HTTP " + r.status);
              });
            }
            var cd = r.headers.get("content-disposition") || "";
            var m = /filename="?([^";]+)"?/.exec(cd);
            var name = m ? m[1] : "dsh-workbench-export." + format;
            return r.blob().then(function(blob) {
              var href = URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = href;
              a.download = name;
              document.body.appendChild(a);
              a.click();
              a.remove();
              setTimeout(function() {
                URL.revokeObjectURL(href);
              }, 1500);
              setMsg({ kind: "ok", text: t("backup_download_started") });
              var rows = [];
              chosen.forEach(function(a2) {
                var tables = a2.tables || [];
                if (!tables.length) rows.push({ id: a2.id + ":*", table: t("backup_no_tables"), module: a2.title || a2.id, version: a2.version });
                tables.forEach(function(table) {
                  rows.push({ id: a2.id + ":" + table, table, module: a2.title || a2.id, version: a2.version });
                });
              });
              setExported({ format, filename: name, size: blob.size, rows, moduleCount: chosen.length });
            });
          }).catch(function(e) {
            setMsg({ kind: "err", text: t("backup_export_failed") + "\uFF1A" + String(e && e.message || e) });
          }).then(function() {
            setBusy("");
          });
        }
        function doImportFile(file) {
          if (!file || busy) return;
          setBusy("import");
          setMsg(null);
          setReport(null);
          var policyMap = {};
          exportable.forEach(function(a) {
            policyMap[a.id] = policyOf(a.id);
          });
          fetch("/workbench/api/backup/import", { method: "POST", headers: { "content-type": "application/zip", "x-wb-backup-policy": JSON.stringify(policyMap) }, body: file }).then(function(r) {
            if (r.status === 422) {
              return r.json().catch(function() {
                return {};
              }).then(function() {
                setMsg({ kind: "err", text: t("backup_incompatible") });
                return null;
              });
            }
            return r.json().catch(function() {
              return null;
            }).then(function(j) {
              if (!r.ok) throw new Error(j && j.error || "HTTP " + r.status);
              if (!j) throw new Error(t("backup_invalid"));
              setReport(j);
              setMsg({ kind: j.ok ? "ok" : "err", text: j.ok ? t("backup_import_done") : t("backup_import_result") });
              return j;
            });
          }).catch(function(e) {
            setMsg({ kind: "err", text: t("backup_import_failed") + "\uFF1A" + String(e && e.message || e) });
          }).then(function() {
            setBusy("");
          });
        }
        function doImport(ev) {
          var file = ev.target.files && ev.target.files[0];
          ev.target.value = "";
          doImportFile(file);
        }
        function onDrop(ev) {
          ev.preventDefault();
          setDragging(false);
          var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
          doImportFile(file);
        }
        function moduleCaps(a) {
          var caps = [];
          if (a.backup && a.backup.export) caps.push(t("backup_cap_export"));
          if (a.backup && a.backup.import) caps.push(t("backup_cap_import"));
          return caps.join(" \xB7 ");
        }
        return jsx2.jsxs("div", { className: "wb-backup", children: [
          jsx2.jsxs("div", { className: "wb-card wb-backup-overview", children: [
            jsx2.jsxs("div", { className: "wb-backup-overview-main", children: [
              jsx2.jsx("div", { className: "wb-backup-overview-title", children: t("backup_modules") }),
              jsx2.jsx("div", { className: "wb-backup-overview-sub", children: t("backup_selected_count").replace("{n}", String(chosen.length)).replace("{all}", String(exportable.length)) })
            ] }),
            jsx2.jsxs("div", { className: "wb-backup-toolbar", children: [
              jsx2.jsx("button", { type: "button", className: "wb-btn ghost", disabled: !exportable.length || allSelected, onClick: function() {
                selectAll(true);
              }, children: t("backup_select_all") }),
              jsx2.jsx("button", { type: "button", className: "wb-btn ghost", disabled: !chosen.length, onClick: function() {
                selectAll(false);
              }, children: t("backup_clear") })
            ] })
          ] }),
          jsx2.jsxs("div", { className: "wb-backup-layout", children: [
            jsx2.jsxs("section", { className: "wb-card wb-backup-modules", children: [
              jsx2.jsxs("div", { className: "wb-sec", children: [
                jsx2.jsx("h3", { children: t("backup_modules_title") }),
                jsx2.jsx("span", { className: "wb-hint", children: t("backup_modules_hint") })
              ] }),
              exportable.length ? jsx2.jsx("div", { className: "wb-backup-list", children: exportable.map(function(a) {
                var open = !!openConfig[a.id];
                var sel = isSelected(a.id);
                var tables = a.tables || [];
                return jsx2.jsxs("div", { className: "wb-backup-item" + (sel ? " on" : ""), children: [
                  jsx2.jsxs("div", { className: "wb-backup-row" + (open ? " open" : ""), children: [
                    jsx2.jsxs("label", { className: "wb-backup-row-main", children: [
                      jsx2.jsx("input", { type: "checkbox", checked: sel, onChange: function() {
                        toggle(a.id);
                      } }),
                      jsx2.jsxs("span", { className: "wb-backup-main", children: [
                        jsx2.jsxs("span", { className: "wb-backup-name", children: [a.title || a.id, jsx2.jsx("span", { className: "wb-badge", children: "v" + (a.version || "?") })] }),
                        jsx2.jsx("span", { className: "wb-backup-meta", children: moduleCaps(a) }),
                        tables.length ? jsx2.jsx("span", { className: "wb-backup-tables", children: tables.map(function(tb) {
                          return jsx2.jsx("span", { className: "wb-backup-chip", children: tb }, tb);
                        }) }) : jsx2.jsx("span", { className: "wb-backup-meta", children: t("backup_no_tables") }),
                        a.description ? jsx2.jsx("span", { className: "wb-backup-meta", children: a.description }) : null
                      ] })
                    ] }),
                    jsx2.jsx("button", {
                      type: "button",
                      className: "wb-backup-gear" + (open ? " active" : ""),
                      title: t("backup_dup_policy"),
                      "aria-label": t("backup_dup_policy"),
                      "aria-expanded": open,
                      onClick: function() {
                        toggleConfig(a.id);
                      },
                      children: icon("gear")
                    })
                  ] }),
                  open ? jsx2.jsxs("div", { className: "wb-backup-config", children: [
                    jsx2.jsx("span", { className: "wb-backup-config-label", children: t("backup_dup_policy") }),
                    jsx2.jsx("select", {
                      className: "wb-select",
                      "aria-label": t("backup_dup_policy"),
                      value: policyOf(a.id),
                      onChange: function(e) {
                        setPolicy(a.id, e.target.value);
                      },
                      children: [
                        jsx2.jsx("option", { value: "newest", children: t("backup_dup_newest") }),
                        jsx2.jsx("option", { value: "skip", children: t("backup_dup_skip") }),
                        jsx2.jsx("option", { value: "overwrite", children: t("backup_dup_overwrite") })
                      ]
                    }),
                    jsx2.jsx("span", { className: "wb-backup-note", children: t("backup_dup_hint") })
                  ] }) : null
                ] }, a.id);
              }) }) : jsx2.jsx("div", { className: "wb-msg", children: t("backup_no_modules") })
            ] }),
            jsx2.jsxs("aside", { className: "wb-backup-side", children: [
              jsx2.jsxs("section", { className: "wb-card wb-backup-panel", children: [
                jsx2.jsxs("div", { className: "wb-sec", children: [
                  jsx2.jsx("h3", { children: t("backup_export_title") }),
                  jsx2.jsx("span", { className: "wb-hint", children: formatName(format) })
                ] }),
                jsx2.jsx("div", { className: "wb-backup-formats", role: "radiogroup", "aria-label": t("backup_export_format"), children: FORMATS.map(function(f) {
                  var on = format === f.value;
                  return jsx2.jsxs("button", {
                    type: "button",
                    role: "radio",
                    "aria-checked": on,
                    className: "wb-backup-format" + (on ? " on" : ""),
                    onClick: function() {
                      setFormat(f.value);
                    },
                    children: [
                      jsx2.jsxs("span", { className: "wb-backup-format-head", children: [
                        jsx2.jsx("span", { className: "wb-backup-format-name", children: t(f.name) }),
                        on ? jsx2.jsx("span", { className: "wb-backup-format-check", children: "\u2713" }) : null
                      ] }),
                      jsx2.jsx("span", { className: "wb-backup-format-desc", children: t(f.hint) })
                    ]
                  }, f.value);
                }) }),
                jsx2.jsxs("button", { type: "button", className: "wb-btn wb-backup-go", disabled: !!busy || !exportable.length, onClick: doExport, children: [
                  icon("download"),
                  jsx2.jsx("span", { children: busy === "export" ? t("backup_exporting") : t("backup_export") })
                ] }),
                jsx2.jsx("p", { className: "wb-backup-note", children: t("backup_readonly_hint") })
              ] }),
              jsx2.jsxs("section", { className: "wb-card wb-backup-panel", children: [
                jsx2.jsx("div", { className: "wb-sec", children: jsx2.jsx("h3", { children: t("backup_import_title") }) }),
                jsx2.jsxs("p", { className: "wb-backup-note", children: [
                  t("backup_dup_policy"),
                  " \xB7 ",
                  policyLabel("newest"),
                  exportable.filter(function(a) {
                    return policyOf(a.id) !== "newest";
                  }).map(function(a) {
                    return jsx2.jsx("span", { children: " \xB7 " + (a.title || a.id) + "\uFF1A" + policyLabel(policyOf(a.id)) }, a.id);
                  })
                ] }),
                jsx2.jsxs("label", {
                  className: "wb-backup-drop" + (dragging ? " drag" : ""),
                  onDragOver: function(ev) {
                    ev.preventDefault();
                    setDragging(true);
                  },
                  onDragLeave: function() {
                    setDragging(false);
                  },
                  onDrop,
                  children: [
                    jsx2.jsx("input", { ref: fileRef, type: "file", accept: ".zip,application/zip", className: "wb-backup-file", onChange: doImport }),
                    icon("upload"),
                    jsx2.jsx("span", { className: "wb-backup-drop-title", children: busy === "import" ? t("backup_importing") : t("backup_import_drop") }),
                    jsx2.jsx("span", { className: "wb-backup-drop-sub", children: t("backup_import_drop_sub") })
                  ]
                }),
                jsx2.jsx("p", { className: "wb-backup-note", children: t("backup_import_hint") })
              ] })
            ] })
          ] }),
          msg ? jsx2.jsx("div", { className: "wb-backup-msg " + msg.kind, role: "status", "aria-live": "polite", children: msg.text }) : null,
          exported ? jsx2.jsxs("div", { className: "wb-card wb-backup-report", children: [
            jsx2.jsxs("div", { className: "wb-sec", children: [
              jsx2.jsx("h3", { children: t("backup_export_result") }),
              jsx2.jsx("span", { className: "wb-hint", children: formatName(exported.format) })
            ] }),
            jsx2.jsxs("div", { className: "wb-backup-file-line", children: [
              jsx2.jsx("span", { className: "wb-backup-file-name", children: exported.filename }),
              jsx2.jsx("span", { className: "wb-backup-meta", children: Math.max(1, Math.round(exported.size / 1024)) + " KB \xB7 " + exported.rows.length + " " + t("backup_table_unit") })
            ] }),
            jsx2.jsx("div", { className: "wb-backup-stack", children: exported.rows.map(function(a) {
              return jsx2.jsxs("div", { className: "wb-backup-result-row", children: [
                jsx2.jsx("span", { className: "wb-backup-table", children: a.table }),
                jsx2.jsxs("span", { className: "wb-backup-meta", children: [a.module, jsx2.jsx("span", { className: "wb-badge", children: "v" + (a.version || "?") })] })
              ] }, a.id);
            }) })
          ] }) : null,
          report ? jsx2.jsxs("div", { className: "wb-card wb-backup-report", children: [
            jsx2.jsxs("div", { className: "wb-sec", children: [
              jsx2.jsx("h3", { children: t("backup_import_result") }),
              jsx2.jsxs("span", { className: "wb-hint", children: [
                t("backup_summary"),
                "\uFF1A",
                t("backup_ok") + " " + report.summary.ok + " \xB7 ",
                t("backup_partial") + " " + report.summary.partial + " \xB7 ",
                t("backup_failed") + " " + report.summary.failed + " \xB7 ",
                t("backup_skipped") + " " + report.summary.skipped
              ] })
            ] }),
            jsx2.jsxs("div", { className: "wb-backup-meta", children: [
              t("backup_exported_at") + "\uFF1A" + (report.exportedAt || "?"),
              " \xB7 " + t("backup_shell_version") + "\uFF1A" + (report.shellVersion || "?"),
              " \xB7 " + t("backup_format") + "\uFF1Av" + report.formatVersion
            ] }),
            jsx2.jsx("div", { className: "wb-backup-table-wrap", children: jsx2.jsx("table", { className: "wb-backup-table", children: [
              jsx2.jsxs("thead", { children: [
                jsx2.jsxs("tr", { children: [
                  jsx2.jsx("th", { children: t("backup_detail") }),
                  jsx2.jsx("th", { children: t("backup_status") }),
                  jsx2.jsx("th", { children: t("backup_policy") }),
                  jsx2.jsx("th", { children: t("backup_imported") }),
                  jsx2.jsx("th", { children: t("backup_skipped") }),
                  jsx2.jsx("th", { children: t("backup_failed") })
                ] })
              ] }),
              jsx2.jsxs("tbody", { children: (report.results || []).map(function(r) {
                return jsx2.jsxs("tr", { children: [
                  jsx2.jsxs("td", { children: [
                    jsx2.jsx("div", { children: r.title || r.id }),
                    r.message ? jsx2.jsx("div", { className: "wb-backup-meta", children: r.message }) : null
                  ] }),
                  jsx2.jsx("td", { children: jsx2.jsx("span", { className: "wb-backup-status " + r.status, children: statusLabel(r.status) }) }),
                  jsx2.jsx("td", { className: "wb-backup-meta", children: policyLabel(r.policy) }),
                  jsx2.jsx("td", { className: "num", children: r.imported || 0 }),
                  jsx2.jsx("td", { className: "num", children: r.skipped || 0 }),
                  jsx2.jsx("td", { className: "num", children: r.failed || 0 })
                ] }, r.id);
              }) })
            ] }) })
          ] }) : null,
          jsx2.jsxs("section", { className: "wb-card wb-danger", children: [
            jsx2.jsxs("div", { className: "wb-sec", children: [
              jsx2.jsx("h3", { children: t("clear_title") }),
              jsx2.jsx("span", { className: "wb-hint", children: t("clear_scope_hint") })
            ] }),
            jsx2.jsx("p", { className: "wb-danger-desc", children: t("clear_desc") }),
            jsx2.jsx("ul", { className: "wb-danger-scope", children: [
              jsx2.jsx("li", { children: t("clear_scope_data") }),
              jsx2.jsx("li", { children: t("clear_scope_config") }),
              jsx2.jsx("li", { children: t("clear_scope_sync") }),
              jsx2.jsx("li", { children: t("clear_scope_cloud") })
            ] }),
            clearDone ? jsx2.jsxs("div", { className: "wb-danger-done", role: "status", "aria-live": "polite", children: [
              jsx2.jsxs("div", { className: "wb-danger-done-text", children: [
                t("clear_done") + "\uFF1A" + t("clear_done_counts").replace("{tables}", String(clearDone.tables || 0)).replace("{rows}", String(clearDone.rows || 0))
              ] }),
              jsx2.jsx("div", { className: "wb-danger-done-sub", children: t("clear_done_sub") }),
              jsx2.jsx("button", { type: "button", className: "wb-btn", onClick: function() {
                window.location.reload();
              }, children: t("clear_reload") })
            ] }) : jsx2.jsxs("div", { className: "wb-danger-action", children: [
              jsx2.jsxs("label", { className: "wb-danger-label", children: [
                t("clear_confirm_label"),
                jsx2.jsx("code", { className: "wb-danger-phrase", children: CLEAR_PHRASE })
              ] }),
              jsx2.jsxs("div", { className: "wb-danger-row", children: [
                jsx2.jsx("input", {
                  className: "wb-input",
                  value: clearPhrase,
                  placeholder: t("clear_phrase_placeholder"),
                  autoComplete: "off",
                  onChange: function(e) {
                    setClearPhrase(e.target.value);
                    if (clearMsg) setClearMsg(null);
                  },
                  onKeyDown: function(e) {
                    if (e.key === "Enter") doClear();
                  }
                }),
                jsx2.jsxs("button", {
                  type: "button",
                  className: "wb-btn danger",
                  disabled: !clearArmed || busy === "clear",
                  onClick: doClear,
                  children: busy === "clear" ? t("clear_running") : t("clear_action")
                })
              ] }),
              clearMsg ? jsx2.jsx("div", { className: "wb-danger-msg", role: "alert", children: clearMsg }) : null,
              jsx2.jsx("p", { className: "wb-danger-note", children: t("clear_note") })
            ] })
          ] })
        ] });
      }
      return { BackupTab: BackupTab2 };
    };
  }
});

// packages/shell/client/system-tabs.cjs
var require_system_tabs = __commonJS({
  "packages/shell/client/system-tabs.cjs"(exports2, module2) {
    "use strict";
    var SW = require_switch();
    module2.exports = function createSystemTabs(react2, jsx2, useApi2) {
      var BackupTab2 = require_backup_tab()(react2, jsx2).BackupTab;
      function AccountTab2(props) {
        var t = props.t;
        var api = useApi2();
        var st = react2.useState(null);
        var me = st[0];
        var setMe = st[1];
        var st2 = react2.useState({ email: "", password: "", signup: false });
        var form = st2[0];
        var setForm = st2[1];
        var st3 = react2.useState("");
        var msg = st3[0];
        var setMsg = st3[1];
        var st4 = react2.useState(false);
        var syncing = st4[0];
        var setSyncing = st4[1];
        var st5 = react2.useState(null);
        var syncStatus = st5[0];
        var setSyncStatus = st5[1];
        var st6 = react2.useState([]);
        var conflicts = st6[0];
        var setConflicts = st6[1];
        function refreshSync() {
          api.get("/sync/status").then(function(r) {
            if (r && r.ok) setSyncStatus(r);
          });
          api.get("/sync/conflicts?limit=" + ((props.preferences || {})["cloud.conflictLimit"] || 20)).then(function(r) {
            setConflicts(r && Array.isArray(r.conflicts) ? r.conflicts : []);
          });
        }
        function refresh() {
          api.get("/account").then(function(r) {
            setMe(r);
            if (r && r.logged_in && (r.mode === "shared" || r.mode === "private")) refreshSync();
          });
        }
        react2.useEffect(function() {
          refresh();
        }, []);
        react2.useEffect(function() {
          if (!me || !me.logged_in || !["shared", "private"].includes(me.mode)) return void 0;
          var es = new EventSource("/workbench/api/events");
          function onSync() {
            refreshSync();
          }
          es.addEventListener("sync-done", onSync);
          es.addEventListener("sync-status", onSync);
          return function() {
            es.close();
          };
        }, [me && me.logged_in, me && me.mode]);
        function submit() {
          api.post("/account/login", { email: form.email, password: form.password, signup: form.signup }).then(function(r) {
            setMsg(r.ok ? "" : r.error || "failed");
            refresh();
          });
        }
        function resolve(id, action) {
          api.post("/sync/conflicts/" + id + "/resolve", { action }).then(function(r) {
            if (!r || !r.ok) setMsg(t("sync_resolve_failed"));
            refreshSync();
          });
        }
        if (!me) return jsx2.jsx("div", { className: "wb-card", children: jsx2.jsx("span", { className: "wb-msg", children: "\u2026" }) });
        var mode = me.mode || "none";
        var settingsCard = jsx2.jsxs("div", { className: "wb-card wb-sec", children: [
          jsx2.jsx("span", { children: t("cloud_settings") + " \xB7 " + t("cloud_mode_" + mode) }),
          jsx2.jsx("button", { type: "button", className: "wb-btn ghost", onClick: props.openConfig, children: t("cloud_open_config") })
        ] });
        if (mode === "none" || !me.logged_in) {
          if (mode !== "shared") return jsx2.jsx("div", { className: "wb-stack", children: settingsCard });
          return jsx2.jsxs("div", { className: "wb-stack", children: [
            settingsCard,
            jsx2.jsxs("div", { className: "wb-card", children: [
              jsx2.jsx("div", { className: "wb-msg", style: { marginBottom: 10 }, children: t("not_logged_in") }),
              jsx2.jsxs("div", { className: "wb-form", children: [
                jsx2.jsx("input", { className: "wb-input", placeholder: t("email"), value: form.email, onChange: function(e) {
                  setForm(Object.assign({}, form, { email: e.target.value }));
                } }),
                jsx2.jsx("input", { className: "wb-input", type: "password", placeholder: t("password"), value: form.password, onChange: function(e) {
                  setForm(Object.assign({}, form, { password: e.target.value }));
                }, onKeyDown: function(e) {
                  if (e.key === "Enter") submit();
                } }),
                jsx2.jsx(SW.Switch, { h: react2.createElement, checked: !!form.signup, label: t("signup"), onChange: function(next) {
                  setForm(Object.assign({}, form, { signup: next }));
                } }),
                jsx2.jsx("button", { className: "wb-btn", onClick: submit, children: form.signup ? t("signup") : t("login") })
              ] }),
              msg ? jsx2.jsx("div", { className: "wb-err", style: { marginTop: 8 }, children: msg }) : null
            ] })
          ] });
        }
        var failed = syncStatus && Array.isArray(syncStatus.failed_tables) ? syncStatus.failed_tables : [];
        return jsx2.jsxs("div", { className: "wb-stack", children: [
          settingsCard,
          jsx2.jsxs("div", { className: "wb-card", children: [
            jsx2.jsxs("div", { children: [t("logged_in_as"), " ", mode === "private" ? t("cloud_mode_private") : me.user ? me.user.email : "", " (", t("device_name"), ")"] }),
            jsx2.jsxs("div", { className: "wb-form", style: { marginTop: 10 }, children: [
              jsx2.jsx("button", { className: "wb-btn", disabled: syncing, onClick: function() {
                setSyncing(true);
                api.post("/sync/now").then(function(r) {
                  setSyncing(false);
                  if (r && r.ok && Array.isArray(r.failed_tables) && r.failed_tables.length) {
                    setMsg(t("sync_partial") + ": " + r.failed_tables.join(", "));
                  } else {
                    setMsg(r && r.ok ? t("sync_ok") + " \xB7 " + t("sync_pushed") + " " + r.pushed + " \xB7 " + t("sync_pulled") + " " + r.pulled : r && r.error || "fail");
                  }
                  refreshSync();
                });
              }, children: syncing ? "\u2026" : t("sync_now") }),
              mode === "shared" ? jsx2.jsx("button", { className: "wb-btn ghost", onClick: function() {
                api.post("/account/logout").then(refresh);
              }, children: t("logout") }) : null
            ] }),
            msg ? jsx2.jsx("div", { className: "wb-msg", style: { marginTop: 8 }, children: msg }) : null,
            syncStatus && syncStatus.progress ? (function() {
              var pg = syncStatus.progress;
              var done = pg.total ? Math.min(pg.index || 0, pg.total) : 0;
              var pct = pg.total ? Math.round(done / pg.total * 100) : 0;
              return jsx2.jsxs("div", { className: "wb-sync-progress", children: [
                jsx2.jsxs("div", { className: "wb-sync-progress-head", children: [
                  jsx2.jsx("b", { children: t("sync_progress") }),
                  jsx2.jsx("span", { children: pg.running ? t("cloud_syncing") : pg.ok ? t("sync_ok") : t("sync_partial") }),
                  jsx2.jsx("span", { className: "wb-sync-count", children: done + "/" + (pg.total || 0) })
                ] }),
                jsx2.jsx("div", { className: "wb-sync-bar", children: jsx2.jsx("span", { style: { width: pct + "%" } }) }),
                pg.current ? jsx2.jsx("div", { className: "wb-hint", children: t("sync_current_table") + "\uFF1A" + pg.current }) : null,
                (pg.tables || []).length ? jsx2.jsx("ul", { className: "wb-sync-tables", children: pg.tables.map(function(x) {
                  return jsx2.jsxs("li", { className: x.ok ? "ok" : "fail", children: [
                    jsx2.jsx("span", { className: "wb-sync-table-name", children: x.name }),
                    jsx2.jsx("span", { className: "wb-sync-table-state", children: x.ok ? "\u2713 " + (x.mode === "tree" ? t("sync_mode_tree") : t("sync_mode_row")) : "\u2717 " + (x.error || "") })
                  ] }, x.name + ":" + (x.ok ? "ok" : "fail"));
                }) }) : null
              ] });
            })() : null,
            syncStatus ? jsx2.jsxs("div", { className: "wb-sync-status", children: [
              jsx2.jsxs("span", { children: [t("sync_last"), ": ", jsx2.jsx("b", { children: syncStatus.last_sync_at ? new Date(syncStatus.last_sync_at).toLocaleString() : t("sync_never") })] }),
              jsx2.jsxs("span", { children: [t("sync_conflicts"), ": ", jsx2.jsx("b", { children: syncStatus.conflicts || 0 })] }),
              failed.length ? jsx2.jsxs("span", { children: [t("sync_failed_tables"), ": ", jsx2.jsx("b", { children: failed.join(", ") })] }) : null,
              syncStatus.clock_offset ? jsx2.jsxs("span", { children: [t("sync_clock"), ": ", jsx2.jsx("b", { children: syncStatus.clock_offset + "ms" })] }) : null
            ] }) : null
          ] }),
          jsx2.jsxs("div", { className: "wb-card", children: [
            jsx2.jsxs("div", { className: "wb-sec", children: [
              jsx2.jsx("h3", { children: t("sync_conflicts") + " (" + conflicts.length + ")" }),
              jsx2.jsx("span", { className: "wb-hint", children: t("sync_conflict_hint") })
            ] }),
            conflicts.length ? conflicts.map(function(c) {
              return jsx2.jsxs("div", { className: "wb-conflict", children: [
                jsx2.jsxs("div", { className: "wb-conflict-main", children: [
                  jsx2.jsx("div", { children: (c.table_name || "") + " \xB7 " + (c.row_id || "") }),
                  jsx2.jsx("div", { className: "wb-conflict-meta", children: (c.kind || "") + (c.server_updated_at ? " \xB7 " + new Date(c.server_updated_at).toLocaleString() : "") })
                ] }),
                jsx2.jsxs("div", { className: "wb-conflict-actions", children: [
                  jsx2.jsx("button", { className: "wb-btn ghost", onClick: function() {
                    resolve(c.id, "keep_local");
                  }, children: t("sync_keep_local") }),
                  jsx2.jsx("button", { className: "wb-btn ghost", onClick: function() {
                    resolve(c.id, "keep_server");
                  }, children: t("sync_keep_server") }),
                  jsx2.jsx("button", { className: "wb-btn ghost", onClick: function() {
                    resolve(c.id, "dismiss");
                  }, children: t("sync_dismiss") })
                ] })
              ] }, c.id);
            }) : jsx2.jsx("div", { className: "wb-msg", children: t("sync_no_conflicts") })
          ] })
        ] });
      }
      function AuditTab2(props) {
        var t = props.t;
        var fst = react2.useState({ action: "", actor: "", ok: "", q: "", since: "", until: "" });
        var filters = fst[0];
        var setFilters = fst[1];
        var pst = react2.useState(1);
        var page = pst[0];
        var setPage = pst[1];
        var zst = react2.useState(50);
        var pageSize = zst[0];
        var setPageSize = zst[1];
        var dst = react2.useState(null);
        var data = dst[0];
        var setData = dst[1];
        var sst = react2.useState(null);
        var stats = sst[0];
        var setStats = sst[1];
        var bst = react2.useState(false);
        var busy = bst[0];
        var setBusy = bst[1];
        var est = react2.useState("");
        var err = est[0];
        var setErr = est[1];
        var ost = react2.useState(null);
        var openId = ost[0];
        var setOpenId = ost[1];
        var latest = react2.useRef(0);
        var currentFilters = react2.useRef(filters);
        function query(p, size, filters2) {
          var qs = new URLSearchParams();
          if (filters2.action) qs.set("actionPrefix", filters2.action);
          if (filters2.actor) qs.set("actor", filters2.actor);
          if (filters2.ok !== "") qs.set("ok", filters2.ok);
          if (filters2.q) qs.set("q", filters2.q);
          if (filters2.since) qs.set("since", filters2.since);
          if (filters2.until) qs.set("until", filters2.until);
          qs.set("page", String(p));
          qs.set("pageSize", String(size || pageSize));
          qs.set("stats", "1");
          qs.set("rangeDays", "30");
          return qs.toString();
        }
        function load(p, size, selected) {
          var request = ++latest.current;
          setData(null);
          setOpenId(null);
          setPage(p || page);
          setBusy(true);
          setErr("");
          fetch("/workbench/api/audit?" + query(p || page, size, selected || currentFilters.current)).then(function(r) {
            return r.json();
          }).then(function(j) {
            if (request !== latest.current) return;
            if (!j || j.ok === false) throw new Error(j && j.error || t("audit_load_failed"));
            setData(j);
            setStats(j.stats || null);
            setPage(j.page || 1);
          }).catch(function(e) {
            if (request === latest.current) setErr(String(e && e.message || e));
          }).then(function() {
            if (request === latest.current) setBusy(false);
          });
        }
        react2.useEffect(function() {
          load(1);
          return function() {
            latest.current++;
          };
        }, []);
        function applyFilters(next) {
          currentFilters.current = next;
          setFilters(next);
          load(1, pageSize, next);
        }
        function field(key, value) {
          applyFilters(Object.assign({}, currentFilters.current, { [key]: value }));
        }
        function clearFilters() {
          applyFilters({ action: "", actor: "", ok: "", q: "", since: "", until: "" });
        }
        function search() {
          load(1);
        }
        function setSize(n) {
          var size = Math.max(10, Math.min(200, Number(n) || 50));
          setPageSize(size);
          load(1, size);
        }
        function fmtTime(ms) {
          try {
            var d = new Date(Number(ms));
            return d.toLocaleString();
          } catch (e) {
            return String(ms);
          }
        }
        function shortJson(text, limit) {
          if (!text) return "";
          return String(text).length > (limit || 400) ? String(text).slice(0, limit || 400) + "\u2026" : String(text);
        }
        var active = Object.keys(filters).filter(function(key) {
          return filters[key] !== "";
        });
        var labels = { action: "audit_action_prefix", actor: "audit_actor", ok: "audit_ok", q: "audit_q", since: "audit_since", until: "audit_until" };
        function labeled(key, control) {
          return jsx2.jsxs("label", { className: "wb-audit-field", children: [jsx2.jsx("span", { children: t(labels[key]) }), control] }, key);
        }
        var summary = active.map(function(key) {
          return t(labels[key]) + "=" + (key === "ok" ? t(filters.ok === "true" ? "audit_ok_only" : "audit_fail_only") : filters[key]);
        }).join(" \xB7 ");
        var records = data && data.records || [];
        var total = data ? data.total : 0;
        var totalPages = Math.max(1, Math.ceil(total / pageSize));
        var statsText = stats ? t("audit_stats") + "\uFF1A" + totalOf(stats) + " \xB7 " + t("audit_failed") + " " + (stats.failed || 0) : "";
        function totalOf(s) {
          return t("audit_total") + " " + (s.total || 0);
        }
        return jsx2.jsxs(react2.Fragment, { children: [
          jsx2.jsxs("div", { className: "wb-card", children: [
            jsx2.jsxs("div", { className: "wb-sec", children: [
              jsx2.jsx("h3", { children: t("audit_filters") }),
              jsx2.jsx("span", { className: "wb-hint", children: statsText })
            ] }),
            jsx2.jsxs("form", { className: "wb-audit-filters", onSubmit: function(e) {
              e.preventDefault();
              search();
            }, children: [
              labeled("action", jsx2.jsx("input", { className: "wb-input", placeholder: t("audit_action_prefix"), value: filters.action, onChange: function(e) {
                field("action", e.target.value);
              } })),
              labeled("actor", jsx2.jsx("select", { className: "wb-select", "aria-label": t("audit_actor"), value: filters.actor, onChange: function(e) {
                field("actor", e.target.value);
              }, children: [
                jsx2.jsx("option", { value: "", children: t("audit_all") + " \xB7 " + t("audit_actor") }),
                jsx2.jsx("option", { value: "agent", children: "agent" }),
                jsx2.jsx("option", { value: "ui", children: "ui" }),
                jsx2.jsx("option", { value: "sync", children: "sync" })
              ] })),
              labeled("ok", jsx2.jsx("select", { className: "wb-select", "aria-label": t("audit_ok"), value: filters.ok, onChange: function(e) {
                field("ok", e.target.value);
              }, children: [
                jsx2.jsx("option", { value: "", children: t("audit_all") + " \xB7 " + t("audit_ok") }),
                jsx2.jsx("option", { value: "true", children: t("audit_ok_only") }),
                jsx2.jsx("option", { value: "false", children: t("audit_fail_only") })
              ] })),
              labeled("q", jsx2.jsx("input", { className: "wb-input", placeholder: t("audit_q"), value: filters.q, onChange: function(e) {
                field("q", e.target.value);
              } })),
              labeled("since", jsx2.jsx("input", { className: "wb-input", type: "date", title: t("audit_since"), value: filters.since, onChange: function(e) {
                field("since", e.target.value);
              } })),
              labeled("until", jsx2.jsx("input", { className: "wb-input", type: "date", title: t("audit_until"), value: filters.until, onChange: function(e) {
                field("until", e.target.value);
              } })),
              jsx2.jsx("button", { className: "wb-btn", type: "submit", disabled: busy, children: busy ? "\u2026" : t("audit_search") }),
              jsx2.jsx("button", { className: "wb-btn ghost", type: "button", disabled: busy, onClick: function() {
                load(page);
              }, children: t("audit_refresh") })
            ] }),
            jsx2.jsxs("div", { className: "wb-audit-summary", role: "status", "aria-live": "polite", children: [
              jsx2.jsx("span", { children: (summary ? t("audit_active") + "\uFF1A" + summary : t("audit_all")) + " \xB7 " + (busy ? t("audit_loading") : err ? t("audit_load_failed") : t("audit_total") + " " + total) }),
              active.length ? jsx2.jsx("button", { type: "button", className: "wb-btn ghost", onClick: clearFilters, children: t("audit_clear") }) : null
            ] }),
            err ? jsx2.jsx("div", { className: "wb-err", style: { marginTop: 10 }, children: err }) : null,
            jsx2.jsx("div", { className: "wb-hint", style: { marginTop: 10 }, children: t("audit_reads_hint") + " \xB7 " + t("audit_retention") })
          ] }),
          jsx2.jsxs("div", { className: "wb-card", children: [
            jsx2.jsxs("div", { className: "wb-sec", children: [
              jsx2.jsx("h3", { children: t("tab_audit") }),
              jsx2.jsx("span", { className: "wb-hint", children: (busy ? t("audit_loading") : err ? t("audit_load_failed") : t("audit_total") + " " + total) + " \xB7 " + page + " / " + totalPages + " " + t("audit_page") })
            ] }),
            records.length ? jsx2.jsx("div", { style: { overflowX: "auto" }, children: jsx2.jsxs("table", { className: "wb-audit-table", children: [
              jsx2.jsx("thead", { children: jsx2.jsxs("tr", { children: [
                jsx2.jsx("th", { children: t("audit_time") }),
                jsx2.jsx("th", { children: t("audit_actor") }),
                jsx2.jsx("th", { children: t("audit_action") }),
                jsx2.jsx("th", { children: t("audit_ok") }),
                jsx2.jsx("th", { children: t("audit_target") }),
                jsx2.jsx("th", { children: t("audit_duration") })
              ] }) }),
              jsx2.jsx("tbody", { children: records.map(function(r) {
                var open = openId === r.id;
                return jsx2.jsxs(react2.Fragment, { children: [
                  jsx2.jsxs("tr", { className: "wb-audit-row", tabIndex: 0, "aria-expanded": open, onKeyDown: function(e) {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenId(open ? null : r.id);
                    }
                  }, onClick: function() {
                    setOpenId(open ? null : r.id);
                  }, children: [
                    jsx2.jsx("td", { className: "wb-audit-mono", children: fmtTime(r.at) }),
                    jsx2.jsx("td", { children: jsx2.jsx("span", { className: "wb-badge", children: r.actor }) }),
                    jsx2.jsx("td", { className: "wb-audit-mono", children: r.action }),
                    jsx2.jsx("td", { children: r.ok ? jsx2.jsx("span", { className: "wb-audit-ok", children: "\u2713" }) : jsx2.jsx("span", { className: "wb-audit-fail", children: "\u2717" }) }),
                    jsx2.jsx("td", { className: "wb-audit-mono wb-audit-dim", children: r.target || "\u2014" }),
                    jsx2.jsx("td", { className: "wb-audit-dim", children: (r.durationMs || 0) + " ms" })
                  ] }),
                  open ? jsx2.jsx("tr", { children: jsx2.jsx("td", { colSpan: 6, children: jsx2.jsxs("div", { children: [
                    r.error ? jsx2.jsxs("div", { children: [jsx2.jsx("div", { className: "wb-audit-dim", children: t("audit_error") }), jsx2.jsx("div", { className: "wb-audit-pre", children: r.error })] }) : null,
                    jsx2.jsxs("div", { children: [jsx2.jsx("div", { className: "wb-audit-dim", children: t("audit_detail") + " \xB7 id=" + r.id }), jsx2.jsx("div", { className: "wb-audit-pre", children: shortJson(r.args, 1200) || "{}" }), r.result ? jsx2.jsx("div", { className: "wb-audit-pre", children: shortJson(r.result, 1200) }) : null] })
                  ] }) }) }) : null
                ] }, r.id);
              }) })
            ] }) }) : jsx2.jsxs("div", { className: "wb-msg", children: [busy ? t("audit_loading") : err ? t("audit_load_failed") : t("audit_empty"), !busy && !err && active.length ? jsx2.jsx("button", { className: "wb-btn ghost", onClick: clearFilters, children: t("audit_clear") }) : null] }),
            jsx2.jsxs("div", { className: "wb-audit-pager", children: [
              jsx2.jsx("button", { className: "wb-btn ghost", disabled: busy || page <= 1, onClick: function() {
                load(page - 1);
              }, children: t("audit_prev") }),
              jsx2.jsx("button", { className: "wb-btn ghost", disabled: busy || page >= totalPages, onClick: function() {
                load(page + 1);
              }, children: t("audit_next") }),
              jsx2.jsx("select", { className: "wb-select", "aria-label": t("audit_page_size"), value: String(pageSize), onChange: function(e) {
                setSize(e.target.value);
              }, children: [20, 50, 100, 200].map(function(n) {
                return jsx2.jsx("option", { value: String(n), children: n + " / " + t("audit_page") }, n);
              }) })
            ] })
          ] })
        ] });
      }
      return { AccountTab: AccountTab2, BackupTab: BackupTab2, AuditTab: AuditTab2 };
    };
  }
});

// packages/shell/client/home-categories.cjs
var require_home_categories = __commonJS({
  "packages/shell/client/home-categories.cjs"(exports2, module2) {
    "use strict";
    function pickTitle2(title, lang) {
      if (!title) return "";
      if (typeof title === "string") return title;
      return title[lang] || title.zh || title.en || "";
    }
    function categoryTitle(cat, t, lang) {
      var key = "cat_" + String(cat && cat.id);
      var text = typeof t === "function" ? t(key) : key;
      if (text && text !== key) return text;
      return pickTitle2(cat && cat.title, lang) || String(cat && cat.id || "");
    }
    function homeGroups(categories, list, t, lang) {
      var cats = Array.isArray(categories) ? categories : null;
      if (!cats || !cats.length) return null;
      var known = {};
      var fallbackId = "";
      cats.forEach(function(c) {
        if (!c || !c.id) return;
        known[c.id] = true;
        if (c.fallback && !fallbackId) fallbackId = c.id;
      });
      if (!fallbackId) fallbackId = cats[cats.length - 1].id;
      var bucket = {};
      cats.forEach(function(c) {
        if (c && c.id) bucket[c.id] = [];
      });
      (Array.isArray(list) ? list : []).forEach(function(a) {
        var id = a && typeof a.category === "string" && known[a.category] ? a.category : fallbackId;
        (bucket[id] || (bucket[id] = [])).push(a);
      });
      var groups = [];
      cats.forEach(function(c) {
        var items = bucket[c.id] || [];
        if (!items.length) return;
        groups.push({ id: c.id, title: categoryTitle(c, t, lang), count: items.length, items });
      });
      return groups;
    }
    function homeSection(jsx2, categories, list, opts) {
      var groups = homeGroups(categories, list, opts.t, opts.lang);
      if (!groups) return jsx2.jsx("div", { className: "wb-home-grid", children: list.map(opts.addonCard) });
      return jsx2.jsx("div", {
        className: "wb-home-cats",
        children: groups.map(function(g) {
          return jsx2.jsxs("section", {
            className: "wb-home-cat",
            children: [
              jsx2.jsxs("div", {
                className: "wb-home-cat-head",
                children: [
                  jsx2.jsx("h3", { children: g.title }),
                  jsx2.jsx("span", { className: "wb-home-cat-count", children: g.count })
                ]
              }),
              jsx2.jsx("div", { className: "wb-home-grid", children: g.items.map(opts.addonCard) })
            ]
          }, g.id);
        })
      });
    }
    module2.exports = {
      homeGroups,
      categoryTitle,
      pickTitle: pickTitle2,
      homeSection
    };
  }
});

// packages/shell/client/view-tabs.cjs
var require_view_tabs = __commonJS({
  "packages/shell/client/view-tabs.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function createViewTabs(react2, pickTitle2) {
      var h2 = react2.createElement;
      return function ViewTabs2(props) {
        if (props.views.length < 2) return null;
        return h2("div", { className: "wb-page-tabs" }, props.views.map(function(view) {
          var title = pickTitle2(view.title, props.lang) || view.id;
          var on = props.activeView && view.id === props.activeView.id;
          var Icon2 = typeof view.icon === "function" ? view.icon : null;
          return h2("button", {
            key: view.id,
            type: "button",
            className: "wb-tab" + (on ? " on" : ""),
            "aria-label": title,
            onClick: function() {
              props.go("addon:" + props.addonId + ":" + view.id);
            }
          }, Icon2 ? h2("span", {
            "aria-hidden": true,
            style: { display: "inline-flex", verticalAlign: "middle", marginRight: 6 }
          }, h2(Icon2, { size: 14, strokeWidth: 2, "aria-hidden": true })) : null, title);
        }));
      };
    };
  }
});

// packages/shell/client/view-outlet.cjs
var require_view_outlet = __commonJS({
  "packages/shell/client/view-outlet.cjs"(exports2, module2) {
    "use strict";
    var React = require("react");
    var h2 = React.createElement;
    function Slot(props) {
      var root = React.useRef(null), scroll = React.useRef([]);
      React.useLayoutEffect(function() {
        if (!props.active) return;
        var positions = scroll.current.slice();
        function restore() {
          positions.forEach(function(p) {
            p.node.scrollTop = p.top;
            p.node.scrollLeft = p.left;
          });
        }
        restore();
        var frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame(restore) : null;
        function remember() {
          var positions2 = [], node = root.current;
          while (node) {
            positions2.push({ node, top: node.scrollTop, left: node.scrollLeft });
            node = node.parentElement;
          }
          scroll.current = positions2;
        }
        document.addEventListener("scroll", remember, true);
        return function() {
          if (frame !== null) cancelAnimationFrame(frame);
          document.removeEventListener("scroll", remember, true);
        };
      }, [props.active]);
      return h2(
        "div",
        { ref: root, hidden: !props.active, "data-view-id": props.view.id },
        h2(props.view.component, Object.assign({}, props.viewProps, { active: props.active }))
      );
    }
    module2.exports = function ViewOutlet2(props) {
      var kept = React.useRef({});
      if (props.view.keepAlive) kept.current[props.view.id] = props;
      var entries = Object.keys(kept.current).map(function(id) {
        return kept.current[id];
      });
      if (!props.view.keepAlive) entries.push(props);
      return h2(React.Fragment, null, entries.map(function(entry) {
        return h2(Slot, { key: entry.view.id, view: entry.view, viewProps: entry.viewProps, active: entry.view.id === props.view.id });
      }));
    };
  }
});

// packages/addons/lib/markdown.cjs
var require_markdown = __commonJS({
  "packages/addons/lib/markdown.cjs"(exports2, module2) {
    "use strict";
    var cache = /* @__PURE__ */ new Map();
    var cacheChars = 0;
    function node(tag, children, props) {
      return { tag, children, props: props || {} };
    }
    function inline(text, depth) {
      if ((depth || 0) > 8) return [text];
      var out = [], re = /(\\[\\\x60*\[\]#!_>+-]|!?\[[^\[\]\n]+\]\([^\s)\[\]]*\)|\x60[^\x60\n]+\x60|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g, at = 0, m;
      while (m = re.exec(text)) {
        if (m.index > at) out.push(text.slice(at, m.index));
        var s = m[0], link = /^\[([^\]]+)\]\(([^)]*)\)$/.exec(s);
        if (s[0] === "\\") out.push(s.slice(1));
        else if (link && /^(https?:\/\/|mailto:)[^\s\u0000-\u001f\u007f]+$/i.test(link[2]))
          out.push(node("a", inline(link[1], (depth || 0) + 1), { href: link[2], target: "_blank", rel: "noopener noreferrer nofollow" }));
        else if (s[0] === "[" || s[0] === "!") out.push(s);
        else if (s[0] === "`") out.push(node("code", [s.slice(1, -1)]));
        else if (s.slice(0, 2) === "**") out.push(node("strong", inline(s.slice(2, -2), (depth || 0) + 1)));
        else out.push(node("em", inline(s.slice(1, -1), (depth || 0) + 1)));
        at = re.lastIndex;
      }
      if (at < text.length) out.push(text.slice(at));
      return out;
    }
    function blocks(lines, depth) {
      var out = [], i = 0;
      function listMatch(s) {
        return /^( *)([-+*]|\d+\.) +(.+)$/.exec(s);
      }
      function special(s) {
        return /^\s*$|^\x60\x60\x60|^#{1,6} +|^> ?|^\s*(?:---+|\*\*\*+|___+)\s*$/.test(s) || listMatch(s);
      }
      while (i < lines.length) {
        var line = lines[i], m;
        if (!line.trim()) {
          i++;
          continue;
        }
        if (/^\x60\x60\x60/.test(line)) {
          var end = i + 1;
          while (end < lines.length && !/^\x60\x60\x60\s*$/.test(lines[end])) end++;
          if (end === lines.length) {
            out.push(node("p", [lines.slice(i).join("\n")]));
            break;
          }
          out.push(node("pre", [node("code", [lines.slice(i + 1, end).join("\n")])]));
          i = end + 1;
          continue;
        }
        if (m = /^(#{1,6}) +(.+)$/.exec(line)) {
          out.push(node("h" + m[1].length, inline(m[2])));
          i++;
          continue;
        }
        if (/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(line)) {
          out.push(node("hr", []));
          i++;
          continue;
        }
        if (/^> ?/.test(line) && depth < 2) {
          var quote = [];
          while (i < lines.length && /^> ?/.test(lines[i])) quote.push(lines[i++].replace(/^> ?/, ""));
          out.push(node("blockquote", blocks(quote, depth + 1)));
          continue;
        }
        if ((m = listMatch(line)) && depth < 2) {
          var base = m[1].length, ordered = /\d/.test(m[2]), items = [], start = parseInt(m[2], 10);
          while (i < lines.length) {
            m = listMatch(lines[i]);
            if (!m || m[1].length !== base || /\d/.test(m[2]) !== ordered) break;
            var children = inline(m[3]), nested = [];
            i++;
            while (i < lines.length && (m = listMatch(lines[i])) && m[1].length > base) nested.push(lines[i++].slice(base + 2));
            if (nested.length) children = children.concat(blocks(nested, depth + 1));
            items.push(node("li", children));
          }
          out.push(node(ordered ? "ol" : "ul", items, ordered ? { start } : {}));
          continue;
        }
        var paragraph = [line];
        i++;
        while (i < lines.length && !special(lines[i])) paragraph.push(lines[i++]);
        var parts = [];
        paragraph.forEach(function(s, j) {
          if (j) parts.push(node("br", []));
          var children2 = inline(s);
          for (var k = 0; k < children2.length; k++) parts.push(children2[k]);
        });
        out.push(node("p", parts));
      }
      return out;
    }
    function parse(text, mode) {
      text = String(text == null ? "" : text);
      mode = mode === "text" ? "text" : "markdown";
      var key = mode + ":" + text;
      if (cache.has(key)) return cache.get(key);
      var ast = mode === "text" ? [text] : blocks(text.replace(/\r\n?/g, "\n").split("\n"), 0);
      if (text.length <= 1e5) {
        while (cache.size >= 100 || cacheChars + key.length > 1e6) {
          var first = cache.keys().next().value;
          cacheChars -= first.length;
          cache.delete(first);
        }
        cache.set(key, ast);
        cacheChars += key.length;
      }
      return ast;
    }
    function createBody(React, Highlight) {
      var h2 = React.createElement;
      return function Body(props) {
        function render(items, path) {
          return items.map(function(item, i) {
            var key = path + "-" + i;
            if (typeof item === "string") return Highlight ? h2(Highlight, { key, text: item, keyword: props.keyword }) : item;
            var attrs = Object.assign({ key }, item.props);
            if (item.tag === "br" || item.tag === "hr") return h2(item.tag, attrs);
            return h2(item.tag, attrs, render(item.children, key));
          });
        }
        return h2("div", { className: props.mode === "text" ? "wb-body-text" : "wb-markdown" }, render(parse(props.text, props.mode), "md"));
      };
    }
    module2.exports = { parse, createBody };
  }
});

// packages/addons/lib/body-toggle.cjs
var require_body_toggle = __commonJS({
  "packages/addons/lib/body-toggle.cjs"(exports2, module2) {
    module2.exports = function(React) {
      var h2 = React.createElement;
      return function BodyMode(props) {
        var plain = props.mode === "text", t = props.t;
        var label = t.bodyModeToggle.replace("{field}", props.label).replace("{current}", t[plain ? "plainText" : "markdown"]).replace("{target}", t[plain ? "markdown" : "plainText"]);
        return h2("button", {
          type: "button",
          className: "wb-body-toggle" + (props.className ? " " + props.className : ""),
          title: label,
          "aria-label": label,
          "aria-pressed": !plain,
          onClick: function(e) {
            e.stopPropagation();
            props.onChange(plain ? "markdown" : "text");
          }
        }, h2("span", { key: props.mode, className: "wb-body-toggle-icon", "aria-hidden": true }, h2(props.Icon, { name: plain ? "pilcrow" : "code-2", size: 14 })));
      };
    };
  }
});

// packages/addons/lib/body-copy.cjs
var require_body_copy = __commonJS({
  "packages/addons/lib/body-copy.cjs"(exports2, module2) {
    module2.exports = {
      zh: { desc: "\u63CF\u8FF0", markdown: "Markdown \u6E32\u67D3", plainText: "\u7EAF\u6587\u672C", bodyModeToggle: "{field} \xB7 \u5F53\u524D\uFF1A{current}\uFF1B\u5207\u6362\u4E3A{target}" },
      en: { desc: "Description", markdown: "Rendered Markdown", plainText: "Plain text", bodyModeToggle: "{field} \xB7 Current: {current}; switch to {target}" }
    };
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/code-xml.mjs
var __iconData34, CodeXml;
var init_code_xml = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/code-xml.mjs"() {
    init_createLucideIcon();
    __iconData34 = {
      name: "code-xml",
      size: 24,
      node: [
        ["path", { d: "m18 16 4-4-4-4", key: "1inbqp" }],
        ["path", { d: "m6 8-4 4 4 4", key: "15zrgr" }],
        ["path", { d: "m14.5 4-5 16", key: "e7oirm" }]
      ],
      aliases: ["code-2"]
    };
    __iconData34.node;
    CodeXml = createLucideIcon(__iconData34);
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/code-2.mjs
var code_2_exports = {};
__export(code_2_exports, {
  default: () => CodeXml
});
var init_code_2 = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/code-2.mjs"() {
    init_code_xml();
  }
});

// node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/pilcrow.mjs
var pilcrow_exports = {};
__export(pilcrow_exports, {
  __iconData: () => __iconData35,
  default: () => Pilcrow
});
var __iconData35, Pilcrow;
var init_pilcrow = __esm({
  "node_modules/.pnpm/lucide-react@1.70.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/pilcrow.mjs"() {
    init_createLucideIcon();
    __iconData35 = {
      name: "pilcrow",
      size: 24,
      node: [
        ["path", { d: "M13 4v16", key: "8vvj80" }],
        ["path", { d: "M17 4v16", key: "7dpous" }],
        ["path", { d: "M19 4H9.5a4.5 4.5 0 0 0 0 9H13", key: "sh4n9v" }]
      ]
    };
    __iconData35.node;
    Pilcrow = createLucideIcon(__iconData35);
  }
});

// packages/addons/lib/body-styles.cjs
var require_body_styles = __commonJS({
  "packages/addons/lib/body-styles.cjs"(exports2, module2) {
    module2.exports = `
.wb-body-label{float:left;position:relative;z-index:1;margin:1px 6px 0 0;padding:1px 4px;border-radius:4px;font-size:11px;font-weight:600;letter-spacing:.06em;line-height:1.6;color:#234783;background:color-mix(in srgb,#5b7fd6 8%,#fff);white-space:nowrap}
.wb-body-label.wb-review-label{color:#154d43;background:color-mix(in srgb,var(--wbt-accent,#11a89b) 8%,#fff)}
.wb-markdown{white-space:normal;min-width:0;overflow-wrap:anywhere}.wb-markdown:after{content:'';display:table;clear:both}
.wb-markdown p{margin:0 0 6px;white-space:pre-wrap}.wb-markdown>:last-child{margin-bottom:0}
.wb-markdown h1,.wb-markdown h2,.wb-markdown h3,.wb-markdown h4,.wb-markdown h5,.wb-markdown h6{margin:6px 0;font-weight:650;line-height:1.6}
.wb-markdown>:first-child{margin-top:0}.wb-markdown h1{font-size:16px}.wb-markdown h2{font-size:15px}.wb-markdown h3{font-size:14px}.wb-markdown h4,.wb-markdown h5,.wb-markdown h6{font-size:13px}
.wb-markdown ul,.wb-markdown ol{margin:4px 0;padding-left:24px;display:flow-root}.wb-markdown li{margin:1px 0}
.wb-markdown blockquote{border-left:2px solid currentColor;padding-left:9px;margin:4px 0;display:flow-root}
.wb-markdown pre{white-space:pre-wrap;overflow-wrap:anywhere;padding:8px;border-radius:6px;background:color-mix(in srgb,currentColor 7%,transparent);display:flow-root;margin:5px 0}
.wb-markdown code,.wb-body-text{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.wb-markdown code{background:color-mix(in srgb,currentColor 7%,transparent);border-radius:3px;padding:1px 3px}.wb-markdown pre code{padding:0;background:none}
.wb-markdown a{color:inherit;text-decoration:underline}.wb-markdown hr{border:0;border-top:1px solid currentColor;opacity:.3;clear:both}
.wb-body-text{white-space:pre-wrap;overflow-wrap:anywhere}.wb-body-text:after{content:'';display:table;clear:both}
.wb-body-section{min-width:0;overflow-anchor:none}
.wb-body-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;padding-left:12px;min-height:24px}
.wb-body-heading .wb-body-label{float:none;margin:0;padding:0;border-radius:0;background:none;color:inherit;font-size:11.5px;font-weight:600;letter-spacing:.06em;opacity:.72}
.wb-body-toggle{display:inline-flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;border:0;background:transparent;color:inherit;padding:0;border-radius:4px;cursor:pointer;opacity:.7}
.wb-body-toggle:hover{opacity:1;background:color-mix(in srgb,currentColor 5%,transparent)}
.wb-body-toggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#2563eb);outline-offset:2px}
.wb-body-toggle-icon{display:flex;animation:wb-body-icon-in 140ms ease-out}
@keyframes wb-body-icon-in{from{opacity:0}to{opacity:1}}
@media(prefers-reduced-motion:reduce){.wb-body-toggle-icon{animation:none}}
.wbt-item.closed:has(.wb-body-label){opacity:1}
`;
  }
});

// packages/addons/lib/body-id.cjs
var require_body_id = __commonJS({
  "packages/addons/lib/body-id.cjs"(exports2, module2) {
    var nextId = 0;
    module2.exports = function useBodyId(React) {
      return typeof React.useId === "function" ? React.useId() : React.useState("wb-body-" + ++nextId)[0];
    };
  }
});

// packages/addons/lib/description.cjs
var require_description = __commonJS({
  "packages/addons/lib/description.cjs"(exports2, module2) {
    var React = require("react");
    var h2 = React.createElement;
    var Body = require_markdown().createBody(React);
    var bodies = typeof WeakMap === "function" ? /* @__PURE__ */ new WeakMap() : null;
    function bodyFor(Highlight) {
      if (!Highlight) return Body;
      if (!bodies) return require_markdown().createBody(React, Highlight);
      if (!bodies.has(Highlight)) bodies.set(Highlight, require_markdown().createBody(React, Highlight));
      return bodies.get(Highlight);
    }
    var BodyMode = require_body_toggle()(React);
    var copy = require_body_copy();
    var Code = (init_code_2(), __toCommonJS(code_2_exports)).default;
    var Pilcrow2 = (init_pilcrow(), __toCommonJS(pilcrow_exports)).default;
    function BodyIcon(props) {
      return h2(props.name === "pilcrow" ? Pilcrow2 : Code, { size: props.size, "aria-hidden": true, focusable: false });
    }
    var css = require_body_styles() + `
.wb-desc{margin-top:4px;font-size:12.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;max-width:100%;min-width:0;box-sizing:border-box;padding:6px 10px;border-radius:0 8px 8px 0;border-left:2px solid color-mix(in oklab,#5b7fd6 34%,transparent);background:color-mix(in oklab,#5b7fd6 7%,transparent);color:inherit}
.wb-description{margin-top:10px}.wb-description>.wb-desc{margin-top:0}
.wb-desc-text{display:block}.wb-desc-clamped{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.wb-desc-toggle{display:block;border:1px solid transparent;background:transparent;color:inherit;font:inherit;font-size:12px;min-width:32px;min-height:32px;padding:3px 6px;border-radius:6px;cursor:pointer;white-space:normal}
.wb-desc-toggle:hover{background:color-mix(in oklab,currentColor 8%,transparent)}.wb-desc-toggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#2563eb);outline-offset:2px}
`;
    function Description(props) {
      var mode = React.useState(props.bodyMode === "text" ? "text" : "markdown");
      var labelId = require_body_id()(React) + "-desc", t = copy[props.lang === "en" ? "en" : "zh"];
      var text = props.text == null ? "" : String(props.text);
      var DescBody = bodyFor(props.Highlight);
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
      }, [text, expanded[0], mode[0]]);
      if (!text.trim()) return null;
      return h2(
        "section",
        { className: "wb-body-section wb-description", "aria-labelledby": labelId },
        h2(
          "div",
          { className: "wb-body-heading" },
          h2("span", { id: labelId, className: "wb-body-label" }, t.desc),
          h2(BodyMode, { label: t.desc, mode: mode[0], onChange: mode[1], t, Icon: props.Icon || BodyIcon })
        ),
        h2(
          "div",
          { className: "wb-desc" },
          h2(
            "div",
            { ref, className: "wb-desc-text" + (expanded[0] ? "" : " wb-desc-clamped") },
            h2(DescBody, { text, mode: mode[0], keyword: props.keyword })
          ),
          overflow[0] || expanded[0] ? h2("button", {
            type: "button",
            className: "wb-desc-toggle",
            "aria-expanded": expanded[0],
            onClick: function() {
              expanded[1](!expanded[0]);
            }
          }, props.lang === "en" ? expanded[0] ? "Collapse" : "Expand" : expanded[0] ? "\u6536\u8D77" : "\u5C55\u5F00") : null
        )
      );
    }
    module2.exports = { css, Description };
  }
});

// packages/shell/client/conversation/catalog-groups.cjs
var require_catalog_groups = __commonJS({
  "packages/shell/client/conversation/catalog-groups.cjs"(exports2, module2) {
    "use strict";
    function domainOf(name) {
      var text = String(name || "");
      var at = text.indexOf(".");
      return at > 0 ? text.slice(0, at) : text;
    }
    function groupActions(names) {
      var order = [], map = /* @__PURE__ */ Object.create(null);
      (names || []).forEach(function(raw) {
        var name = String(raw || "").trim();
        if (!name) return;
        var domain = domainOf(name);
        if (!map[domain]) {
          map[domain] = [];
          order.push(domain);
        }
        if (map[domain].indexOf(name) < 0) map[domain].push(name);
      });
      order.sort();
      return order.map(function(domain) {
        return { domain, items: map[domain].sort() };
      });
    }
    function dedupe(list) {
      var out = [];
      (list || []).forEach(function(raw) {
        var name = String(raw || "").trim();
        if (name && out.indexOf(name) < 0) out.push(name);
      });
      return out;
    }
    function parseManual(text) {
      return dedupe(String(text || "").split(/[\s,，]+/));
    }
    function validateActions(names, catalog) {
      var actions = dedupe(names);
      if (!catalog) return { actions, unknown: [] };
      var known = /* @__PURE__ */ Object.create(null);
      catalog.forEach(function(item) {
        if (item && item.name) known[String(item.name)] = true;
      });
      return {
        actions,
        unknown: actions.filter(function(name) {
          return !known[name];
        })
      };
    }
    function domainKey(role) {
      if (!role) return "";
      if (role.source === "user") return "user";
      var raw = String(role.domain || role.id || "");
      return raw.replace(/^wb-addon-/, "").split(/[\/.]/)[0];
    }
    function filterRoles(rows, filter) {
      var q = String(filter && filter.q || "").trim().toLowerCase();
      var source = filter && filter.source || "";
      var domain = filter && filter.domain || "";
      return (rows || []).filter(function(role) {
        if (source && role.source !== source) return false;
        if (domain && domainKey(role) !== domain) return false;
        if (!q) return true;
        var text = [role.name, role.description, role.instructions, (role.actions || []).join(" "), role.id].join(" ").toLowerCase();
        return text.indexOf(q) >= 0;
      });
    }
    function domainsOf(rows) {
      var seen = [];
      (rows || []).forEach(function(role) {
        var key = domainKey(role);
        if (key && seen.indexOf(key) < 0) seen.push(key);
      });
      return seen.sort();
    }
    module2.exports = {
      domainOf,
      domainKey,
      groupActions,
      dedupe,
      parseManual,
      validateActions,
      filterRoles,
      domainsOf
    };
  }
});

// packages/shell/client/conversation/catalog-editor.cjs
var require_catalog_editor = __commonJS({
  "packages/shell/client/conversation/catalog-editor.cjs"(exports2, module2) {
    "use strict";
    var React = require("react");
    var h2 = React.createElement;
    var common = require_client_common()("wbr");
    var Btn = common.Btn;
    var Field = common.Field;
    var Notice = common.Notice;
    var Body = require_markdown().createBody(React);
    var Steps = require_stepper().Steps;
    var LOCALE2 = require_locale2();
    var groups = require_catalog_groups();
    function translator(lang) {
      var dict = LOCALE2[lang] || LOCALE2.zh;
      return function(key, values) {
        var text = dict[key] || LOCALE2.zh[key] || key;
        return values ? String(text).replace(/\{(\w+)\}/g, function(all, name) {
          return name in values ? String(values[name]) : all;
        }) : text;
      };
    }
    function firstFailing(draft, catalog) {
      if (!String(draft.name || "").trim()) return 0;
      if (!String(draft.instructions || "").trim()) return 1;
      var picked = (draft.actions || []).concat(groups.parseManual(draft.manual));
      if (groups.validateActions(picked, catalog).unknown.length) return 2;
      return -1;
    }
    function Editor(props) {
      var draft = props.draft;
      var t = translator(props.lang);
      var set = function(patch) {
        props.setDraft(Object.assign({}, draft, patch));
      };
      var stepState = React.useState(0), step = stepState[0], setStep = stepState[1];
      var visitedState = React.useState(0), maxVisited = visitedState[0], setMaxVisited = visitedState[1];
      var invalidState = React.useState({}), invalid = invalidState[0], setInvalid = invalidState[1];
      var statusState = React.useState(""), status = statusState[0], setStatus = statusState[1];
      var tabState = React.useState("edit"), view = tabState[0], setView = tabState[1];
      var pickState = React.useState(""), query = pickState[0], setQuery = pickState[1];
      var nameRef = React.useRef(null), instructionsRef = React.useRef(null);
      var searchRef = React.useRef(null), saveRef = React.useRef(null);
      var catalog = props.catalog;
      var picked = draft.actions || [];
      var manual = groups.parseManual(draft.manual);
      var effective = groups.dedupe(picked.concat(manual));
      var unknown = groups.validateActions(effective, catalog).unknown;
      var busy = !!props.busy;
      React.useEffect(function() {
        var refs = [nameRef, instructionsRef, searchRef, saveRef];
        var node = refs[step] && refs[step].current;
        if (node && node.focus) node.focus();
      }, [step]);
      function mark(index, bad) {
        var next2 = Object.assign({}, invalid);
        if (bad) next2[index] = true;
        else delete next2[index];
        setInvalid(next2);
      }
      function toggle(name) {
        set({ actions: picked.indexOf(name) >= 0 ? picked.filter(function(x) {
          return x !== name;
        }) : picked.concat([name]) });
      }
      function toggleDomain(items, on) {
        var next2 = picked.slice();
        items.forEach(function(name) {
          var at = next2.indexOf(name);
          if (on && at < 0) next2.push(name);
          if (!on && at >= 0) next2.splice(at, 1);
        });
        set({ actions: next2 });
      }
      function goBack() {
        setStatus("");
        setStep(Math.max(0, step - 1));
      }
      function blockedText(index) {
        if (index === 0) return t("role_name_required");
        if (index === 1) return t("role_instructions_required");
        return t("role_unknown_hint");
      }
      function next() {
        var blocked = firstFailing(draft, catalog);
        if (blocked >= 0 && blocked <= step) {
          mark(blocked, true);
          setStatus(blockedText(blocked));
          setStep(blocked);
          return;
        }
        mark(step, false);
        setStatus("");
        var to = Math.min(3, step + 1);
        setStep(to);
        setMaxVisited(Math.max(maxVisited, to));
      }
      function goTo(index) {
        if (index <= maxVisited) {
          setStatus("");
          setStep(index);
        }
      }
      function submit() {
        var blocked = firstFailing(draft, catalog);
        if (blocked >= 0) {
          mark(blocked, true);
          setStatus(blockedText(blocked));
          setStep(blocked);
          return;
        }
        props.onSave();
      }
      function basicPane() {
        return h2(
          "div",
          { className: "wbr-step-pane" },
          h2(
            Field,
            { h: h2, label: t("role_name") },
            h2("input", {
              ref: nameRef,
              name: "name",
              className: "wbr-input",
              value: draft.name || "",
              onChange: function(e) {
                mark(0, false);
                set({ name: e.target.value });
              }
            })
          ),
          invalid[0] ? h2("p", { className: "wbr-field-error", role: "alert" }, t("role_name_required")) : null,
          h2(
            Field,
            { h: h2, label: t("role_description") },
            h2("input", {
              name: "description",
              className: "wbr-input",
              value: draft.description || "",
              onChange: function(e) {
                set({ description: e.target.value });
              }
            })
          )
        );
      }
      function instructionsPane() {
        var text = String(draft.instructions || "");
        return h2(
          "div",
          { className: "wbr-step-pane" },
          h2(
            "section",
            { className: "wbr-instructions" },
            h2(
              "div",
              { className: "wbr-instructions-head" },
              h2("strong", null, t("role_instructions")),
              h2("span", { className: "wbr-count" }, t("role_chars", { n: text.trim().length })),
              h2(
                "div",
                { className: "wbr-tabs", role: "tablist" },
                h2("button", { type: "button", role: "tab", "aria-selected": view === "edit", className: "wbr-tab", onClick: function() {
                  setView("edit");
                } }, t("role_edit")),
                h2("button", { type: "button", role: "tab", "aria-selected": view === "preview", className: "wbr-tab", onClick: function() {
                  setView("preview");
                } }, t("role_preview"))
              )
            ),
            view === "edit" ? h2("textarea", {
              ref: instructionsRef,
              name: "instructions",
              className: "wbr-input",
              rows: 12,
              value: draft.instructions || "",
              onChange: function(e) {
                mark(1, false);
                set({ instructions: e.target.value });
              }
            }) : h2("div", { className: "wbr-preview" }, text.trim() ? h2(Body, { text, mode: "markdown" }) : h2("em", null, t("role_preview_empty")))
          ),
          invalid[1] ? h2("p", { className: "wbr-field-error", role: "alert" }, t("role_instructions_required")) : null
        );
      }
      function actionsPane() {
        var catalogRows = (catalog || []).filter(function(item) {
          if (!query.trim()) return true;
          return String(item.name + " " + (item.description || "")).toLowerCase().indexOf(query.trim().toLowerCase()) >= 0;
        });
        var table = groups.groupActions(catalogRows.map(function(item) {
          return item.name;
        }));
        var byName = /* @__PURE__ */ Object.create(null);
        (catalog || []).forEach(function(item) {
          byName[item.name] = item;
        });
        return h2(
          "div",
          { className: "wbr-step-pane" },
          h2(
            "section",
            { className: "wbr-actions" },
            h2(
              "div",
              { className: "wbr-actions-head" },
              h2("strong", null, t("role_actions_title")),
              h2("span", { className: "wbr-count" }, t("role_actions_selected", { n: effective.length }))
            ),
            props.catalogError ? h2(Notice, { h: h2, kind: "warn", text: props.catalogError }) : null,
            h2("input", {
              ref: searchRef,
              name: "actionSearch",
              className: "wbr-input",
              value: query,
              placeholder: t("role_actions_search"),
              onChange: function(e) {
                setQuery(e.target.value);
              }
            }),
            h2("div", { className: "wbr-actions-groups" }, table.map(function(group) {
              return h2(
                "div",
                { key: group.domain, className: "wbr-actions-group" },
                h2(
                  "div",
                  { className: "wbr-actions-grouphead" },
                  h2("span", { className: "wbr-actions-domain" }, group.domain, h2("span", { className: "wbr-count" }, String(group.items.length))),
                  h2("button", { type: "button", className: "wbr-mini", onClick: function() {
                    toggleDomain(group.items, true);
                  } }, t("role_actions_select_all")),
                  h2("button", { type: "button", className: "wbr-mini", onClick: function() {
                    toggleDomain(group.items, false);
                  } }, t("role_actions_clear"))
                ),
                h2("div", { className: "wbr-actions-checks" }, group.items.map(function(name) {
                  var item = byName[name] || {};
                  return h2(
                    "label",
                    { key: name, className: "wbr-check", title: item.description || name },
                    h2("input", { type: "checkbox", name: "action:" + name, checked: picked.indexOf(name) >= 0, onChange: function() {
                      toggle(name);
                    } }),
                    h2("code", null, name)
                  );
                }))
              );
            })),
            h2(
              Field,
              { h: h2, label: t("role_actions_manual"), hint: t("role_actions_manual_hint") },
              h2("textarea", {
                name: "manual",
                className: "wbr-input",
                rows: 3,
                value: draft.manual || "",
                onChange: function(e) {
                  mark(2, false);
                  set({ manual: e.target.value });
                }
              })
            ),
            unknown.length ? h2(
              "div",
              { className: "wbr-unknown", role: "alert" },
              h2("strong", null, t("role_unknown_title")),
              h2("span", null, unknown.join("\u3001")),
              h2("small", null, t("role_unknown_hint"))
            ) : null
          )
        );
      }
      function summaryRow(label, value) {
        return h2(
          "div",
          { className: "wbr-summary-row" },
          h2("dt", null, label),
          h2("dd", null, value || t("role_summary_empty"))
        );
      }
      function confirmPane() {
        var chips = groups.groupActions(effective);
        return h2(
          "div",
          { className: "wbr-step-pane" },
          h2(
            "dl",
            { className: "wbr-summary" },
            summaryRow(t("role_summary_name"), draft.name),
            summaryRow(t("role_summary_description"), draft.description),
            summaryRow(t("role_summary_actions"), t("role_summary_actions_value", { n: effective.length })),
            summaryRow(t("role_summary_instructions"), t("role_summary_chars", { n: String(draft.instructions || "").trim().length })),
            summaryRow(t("role_summary_effect"), t("role_summary_effect_value"))
          ),
          chips.length ? h2("div", { className: "wbr-chips" }, chips.map(function(group) {
            return h2("code", { key: group.domain, className: "wbr-chip" }, group.domain + " " + group.items.length);
          })) : null,
          unknown.length ? h2(
            "p",
            { className: "wbr-field-error", role: "alert" },
            t("role_unknown_title") + " " + unknown.join("\u3001")
          ) : null
        );
      }
      var panes = [basicPane, instructionsPane, actionsPane, confirmPane];
      var labels = ["role_step_basic", "role_step_instructions", "role_step_actions", "role_step_confirm"];
      var steps = labels.map(function(key) {
        return { key, label: t(key) };
      });
      return h2(
        "section",
        { className: "wb-card wbr-editor" },
        h2(
          "div",
          { className: "wbr-editor-head" },
          h2("strong", null, draft.mode === "create" ? t("role_wizard_new") : t("role_wizard_edit")),
          draft.id ? h2("code", null, draft.id) : null
        ),
        h2(Steps, {
          h: h2,
          steps,
          current: step,
          maxVisited,
          invalid,
          disabled: busy,
          label: t("role_step_label"),
          onJump: goTo,
          className: "wbr-steps"
        }),
        panes[step](),
        status ? h2("p", { className: "wbr-step-status", role: "status" }, status) : null,
        h2(
          "div",
          { className: "wbr-wizard-foot" },
          h2(Btn, { h: h2, onClick: props.onCancel, disabled: busy }, t("role_cancel")),
          h2(
            "div",
            { className: "wbr-wizard-nav" },
            step > 0 ? h2(Btn, { h: h2, onClick: goBack, disabled: busy }, t("role_back")) : null,
            step < 3 ? h2(Btn, { h: h2, onClick: next, disabled: busy }, t("role_next_step")) : h2(Btn, { h: h2, onClick: submit, disabled: busy }, t("role_save"))
          )
        )
      );
    }
    module2.exports = Editor;
    module2.exports.firstFailing = firstFailing;
  }
});

// packages/shell/client/conversation/catalog.cjs
var require_catalog = __commonJS({
  "packages/shell/client/conversation/catalog.cjs"(exports2, module2) {
    "use strict";
    var React = require("react");
    var h2 = React.createElement;
    var common = require_client_common()("wbr");
    var Btn = common.Btn;
    var Notice = common.Notice;
    var Empty = common.Empty;
    var Pill = common.Pill;
    var unwrap = common.unwrap;
    var Description = require_description().Description;
    var groups = require_catalog_groups();
    var Editor = require_catalog_editor();
    var endpoint = "/role-catalog";
    var ACTIONS_ENDPOINT = "/domains/wb-shell/actions/actions.list";
    function catalogRows(response) {
      var value = unwrap(response);
      if (!Array.isArray(value && value.roles)) throw new Error("Invalid role catalog");
      return value.roles;
    }
    function actionRows(response) {
      var value = unwrap(response);
      var list = value && value.actions;
      if (!Array.isArray(list)) return null;
      return list.filter(function(item) {
        return item && typeof item.name === "string";
      });
    }
    function blankDraft() {
      return { mode: "create", id: "", name: "", description: "", instructions: "", actions: [], manual: "" };
    }
    function draftOf(role) {
      return {
        mode: "update",
        id: role.id,
        name: role.name || "",
        description: role.description || "",
        instructions: role.instructions || "",
        actions: (role.actions || []).slice(),
        manual: ""
      };
    }
    function payloadOf(draft) {
      var actions = groups.dedupe((draft.actions || []).concat(groups.parseManual(draft.manual)));
      return {
        op: draft.mode,
        ...draft.id ? { id: draft.id } : {},
        name: String(draft.name || "").trim(),
        description: String(draft.description || "").trim(),
        instructions: String(draft.instructions || "").trim(),
        actions
      };
    }
    function RoleCatalog(props) {
      var lang = props.lang === "en";
      var tr = function(zh, en) {
        return lang ? en : zh;
      };
      var rowsState = React.useState(null), rows = rowsState[0], setRows = rowsState[1];
      var errorState = React.useState(""), error = errorState[0], setError = errorState[1];
      var filterState = React.useState({ q: "", source: "", domain: "" }), filter = filterState[0], setFilter = filterState[1];
      var selectState = React.useState(""), selected = selectState[0], setSelected = selectState[1];
      var draftState = React.useState(null), draft = draftState[0], setDraft = draftState[1];
      var deleteState = React.useState(""), pendingDelete = deleteState[0], setDelete = deleteState[1];
      var busyState = React.useState(false), busy = busyState[0], setBusy = busyState[1];
      var catalogState = React.useState(null), catalog = catalogState[0], setCatalog = catalogState[1];
      var catalogErrorState = React.useState(""), catalogError = catalogErrorState[0], setCatalogError = catalogErrorState[1];
      var lock = React.useRef(false), sequence = React.useRef(0);
      async function refresh() {
        var req = ++sequence.current;
        try {
          var next = catalogRows(await props.api.get(endpoint));
          if (req !== sequence.current) return;
          setRows(next);
          setError("");
        } catch (e) {
          if (req === sequence.current) setError(e.message);
        }
      }
      async function loadActions() {
        try {
          var list2 = actionRows(await props.api.post(ACTIONS_ENDPOINT, { detail: true }));
          if (list2) setCatalog(list2);
        } catch (e) {
          setCatalogError(tr("\u52A8\u4F5C\u76EE\u5F55\u8BFB\u53D6\u5931\u8D25\uFF1A\u4FDD\u5B58\u65F6\u4ECD\u6309\u670D\u52A1\u7AEF\u6821\u9A8C", "Could not load the action catalog; the server still validates on save"));
        }
      }
      React.useEffect(function() {
        refresh();
        loadActions();
        var stream2 = new EventSource("/workbench/api/events");
        var events = ["role-catalog", "domains-changed", "open"];
        events.forEach(function(event) {
          stream2.addEventListener(event, refresh);
        });
        return function() {
          ++sequence.current;
          stream2.close();
        };
      }, []);
      async function mutate(payload) {
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        setError("");
        try {
          var next = catalogRows(await props.api.post(endpoint, payload));
          ++sequence.current;
          setRows(next);
          setDraft(null);
          setDelete("");
        } catch (e) {
          setError(e.message);
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }
      function save() {
        var checked = groups.validateActions((draft.actions || []).concat(groups.parseManual(draft.manual)), catalog);
        if (checked.unknown.length) {
          setError(tr("\u52A8\u4F5C\u540D\u4E0D\u5B58\u5728\uFF1A", "Unknown actions: ") + checked.unknown.join("\u3001"));
          return;
        }
        mutate(payloadOf(draft));
      }
      var filtered = groups.filterRoles(rows || [], filter);
      var current = (rows || []).filter(function(role) {
        return role.id === selected;
      })[0] || null;
      function toolbar() {
        return h2(
          "div",
          { className: "wbr-toolbar" },
          h2("input", {
            name: "search",
            className: "wbr-input wbr-search",
            value: filter.q,
            placeholder: tr("\u641C\u7D22\u540D\u79F0\u3001\u7B80\u4ECB\u3001\u6307\u4EE4\u6216\u52A8\u4F5C", "Search name, description, instructions or actions"),
            "aria-label": tr("\u641C\u7D22\u89D2\u8272", "Search roles"),
            onChange: function(e) {
              setFilter(Object.assign({}, filter, { q: e.target.value }));
            }
          }),
          h2(
            "select",
            {
              name: "source",
              className: "wbr-input wbr-select",
              value: filter.source,
              "aria-label": tr("\u6309\u6765\u6E90\u7B5B\u9009", "Filter by source"),
              onChange: function(e) {
                setFilter(Object.assign({}, filter, { source: e.target.value }));
              }
            },
            h2("option", { value: "" }, tr("\u5168\u90E8\u6765\u6E90", "All sources")),
            h2("option", { value: "plugin" }, tr("\u63D2\u4EF6\u89D2\u8272", "Plugin roles")),
            h2("option", { value: "user" }, tr("\u81EA\u5B9A\u4E49\u89D2\u8272", "Custom roles"))
          ),
          h2(
            "select",
            {
              name: "domain",
              className: "wbr-input wbr-select",
              value: filter.domain,
              "aria-label": tr("\u6309\u57DF\u7B5B\u9009", "Filter by domain"),
              onChange: function(e) {
                setFilter(Object.assign({}, filter, { domain: e.target.value }));
              }
            },
            h2("option", { value: "" }, tr("\u5168\u90E8\u57DF", "All domains")),
            groups.domainsOf(rows || []).map(function(domain) {
              return h2("option", { key: domain, value: domain }, domain);
            })
          ),
          h2(Btn, { h: h2, onClick: function() {
            setDraft(blankDraft());
            setDelete("");
          }, disabled: !!draft }, tr("\u65B0\u5EFA\u89D2\u8272", "New role"))
        );
      }
      function badge(role) {
        return h2(
          Pill,
          { h: h2, kind: role.source === "user" ? "info" : "" },
          role.source === "user" ? tr("\u81EA\u5B9A\u4E49", "Custom") : tr("\u63D2\u4EF6", "Plugin")
        );
      }
      function list() {
        if (rows === null) return h2(Notice, { h: h2, text: tr("\u6B63\u5728\u8BFB\u53D6\u89D2\u8272\u2026", "Loading roles\u2026") });
        if (!rows.length) return h2(Empty, { h: h2, text: tr("\u6682\u65E0\u89D2\u8272", "No roles") });
        if (!filtered.length) return h2(Empty, { h: h2, text: tr("\u6CA1\u6709\u5339\u914D\u7684\u89D2\u8272\uFF0C\u8BD5\u8BD5\u6E05\u7A7A\u7B5B\u9009", "No role matches these filters") });
        return h2("div", { className: "wbr-rows", role: "list" }, filtered.map(function(role) {
          var counts = groups.groupActions(role.actions || []);
          return h2(
            "button",
            {
              key: role.id,
              type: "button",
              role: "listitem",
              className: "wbr-row" + (role.id === selected ? " on" : ""),
              "aria-pressed": role.id === selected,
              onClick: function() {
                setSelected(role.id);
                setDraft(null);
                setDelete("");
              }
            },
            h2("span", { className: "wbr-row-name" }, role.name),
            h2("span", { className: "wbr-row-meta" }, badge(role), h2("code", null, role.id), h2("small", null, "v" + role.version)),
            h2(
              "span",
              { className: "wbr-row-counts" },
              tr(String((role.actions || []).length) + " \u9879\u52A8\u4F5C", String((role.actions || []).length) + " actions"),
              counts.length ? h2("small", null, counts.map(function(group) {
                return group.domain + " " + group.items.length;
              }).join(" \xB7 ")) : null
            )
          );
        }));
      }
      function detail() {
        if (!current) return h2("div", { className: "wbr-detail wbr-detail-empty" }, h2(Empty, { h: h2, text: tr("\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4E2A\u89D2\u8272\u67E5\u770B\u8BE6\u60C5", "Pick a role on the left") }));
        var editable = current.source === "user";
        var table = groups.groupActions(current.actions || []);
        return h2(
          "article",
          { className: "wbr-detail" },
          h2(
            "header",
            { className: "wbr-detail-head" },
            h2("strong", null, current.name),
            badge(current),
            h2("code", null, current.id),
            h2("small", null, "v" + current.version + " \xB7 " + (current.domain || "user"))
          ),
          current.description ? h2("p", { className: "wbr-detail-desc" }, current.description) : null,
          h2(Description, { text: current.instructions, lang: props.lang, bodyMode: "markdown" }),
          h2(
            "section",
            { className: "wbr-detail-actions" },
            h2("strong", null, tr("\u52A8\u4F5C ", "Actions ") + (current.actions || []).length + tr(" \u9879", "")),
            table.length ? table.map(function(group) {
              return h2(
                "div",
                { key: group.domain, className: "wbr-detail-group" },
                h2("span", { className: "wbr-detail-domain" }, group.domain + " \xB7 " + group.items.length),
                h2("span", { className: "wbr-chips" }, group.items.map(function(name) {
                  return h2("code", { key: name, className: "wbr-chip" }, name);
                }))
              );
            }) : h2(Empty, { h: h2, text: tr("\u672A\u9009\u62E9\u52A8\u4F5C", "No actions") })
          ),
          h2(
            "div",
            { className: "wb-sec" },
            h2(Btn, { h: h2, onClick: function() {
              mutate({ op: "copy", id: current.id });
            }, disabled: busy || !!draft }, tr("\u590D\u5236\u4E3A\u65B0\u89D2\u8272", "Duplicate as a new role")),
            editable ? h2(Btn, { h: h2, onClick: function() {
              setDraft(draftOf(current));
            }, disabled: busy || !!draft }, tr("\u7F16\u8F91", "Edit")) : null,
            editable ? h2(Btn, { h: h2, onClick: function() {
              setDelete(current.id);
            }, disabled: busy || !!draft }, tr("\u5220\u9664", "Delete")) : null
          ),
          pendingDelete === current.id ? h2(
            "div",
            { className: "wb-sec" },
            tr("\u786E\u5B9A\u5220\u9664\u6B64\u89D2\u8272\uFF1F", "Delete this role?"),
            h2(Btn, { h: h2, onClick: function() {
              mutate({ op: "delete", id: current.id });
            }, disabled: busy }, tr("\u786E\u8BA4\u5220\u9664", "Confirm deletion")),
            h2(Btn, { h: h2, onClick: function() {
              setDelete("");
            }, disabled: busy }, tr("\u53D6\u6D88", "Cancel"))
          ) : null
        );
      }
      return h2("div", { className: "wb-root" }, h2(
        "div",
        { className: "wb-inner wb-wide wb-stack" },
        props.head(tr("\u89D2\u8272\u7BA1\u7406", "Role management"), tr("\u6309\u6765\u6E90\u4E0E\u57DF\u67E5\u770B\u89D2\u8272\uFF0C\u6307\u4EE4\u53EF\u8BFB\u3001\u52A8\u4F5C\u53EF\u67E5\u3001\u4FDD\u5B58\u524D\u6821\u9A8C\u52A8\u4F5C\u540D", "Browse roles by source and domain; readable instructions, grouped actions, validated names")),
        toolbar(),
        error ? h2("div", { role: "alert" }, h2(Notice, { h: h2, kind: "error", text: error }), h2(Btn, { h: h2, onClick: refresh }, tr("\u91CD\u65B0\u52A0\u8F7D", "Reload"))) : null,
        draft ? h2(Editor, {
          h: h2,
          lang: props.lang,
          draft,
          setDraft,
          catalog,
          catalogError,
          busy,
          onSave: save,
          onCancel: function() {
            setDraft(null);
          }
        }) : h2("div", { className: "wbr-split" }, h2("div", { className: "wbr-list" }, list()), detail())
      ));
    }
    module2.exports = RoleCatalog;
  }
});

// packages/shell/client/client.src.cjs
var react = require("react");
var jsx = require("react/jsx-runtime");
var h = react.createElement;
var NS = "workbench";
var LOCALE = require_locale2();
var CSS = require_styles3();
var createPanellistIcon = require_panellist_icon();
var addonNav = require_addon_nav()();
var SystemPages = require_system_pages();
var HostPages = require_host_pages();
var QueuePage = require_event_queue_page();
var AutomationPage = require_automation_page();
var slotCatalog = require_slot_catalog();
var slotRegistry = require_slot_registry()(slotCatalog, function() {
  notifyStore();
});
var registry = /* @__PURE__ */ new Map();
var listeners = /* @__PURE__ */ new Set();
var apiCache = /* @__PURE__ */ new Map();
var addonState = { addons: [], categories: null, loaded: false, shellVersion: "" };
var storeListeners = /* @__PURE__ */ new Set();
var cloudStatusListeners = /* @__PURE__ */ new Set();
var sessionRole = require_session_role();
var stream = null;
var lastAddonError = null;
function notifyStore() {
  storeListeners.forEach(function(fn) {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
}
function notifyCloudStatus() {
  cloudStatusListeners.forEach(function(fn) {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
}
function broadcast(payload) {
  listeners.forEach(function(fn) {
    try {
      fn(payload);
    } catch (e) {
      console.error(e);
    }
  });
}
function apiFor(id) {
  var cached = apiCache.get(id);
  if (cached) return cached;
  var api = {
    call: function(action, args) {
      var targetId = id;
      var name = String(action || "");
      var dot = name.indexOf(".");
      if (dot > 0) {
        var hinted = "wb-addon-" + name.slice(0, dot);
        if (hinted !== id && registry.has(hinted)) targetId = hinted;
      }
      return fetch("/workbench/api/domains/" + encodeURIComponent(targetId) + "/actions/" + encodeURIComponent(action), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args || {})
      }).then(function(r) {
        return r.json();
      }).catch(function(e) {
        return { ok: false, error: String(e && e.message || e) };
      });
    },
    // 只读 schema 快照：宿主 /workbench/api/schema 与 actions.list(detail=true) 同源，
    // 供工作台 Action 页渲染运行时注册；不走 action 执行链路，也不会产生审计记录。
    schema: function(domain) {
      var q = domain ? "?domain=" + encodeURIComponent(domain) : "";
      return fetch("/workbench/api/schema" + q).then(function(r) {
        return r.json();
      }).catch(function(e) {
        return { ok: false, error: String(e && e.message || e) };
      });
    },
    subscribe: function(fn) {
      listeners.add(fn);
      return function() {
        listeners.delete(fn);
      };
    }
  };
  apiCache.set(id, api);
  return api;
}
var slotOutlet = require_slot_outlet()(react, {
  registry: slotRegistry,
  apiFor,
  navigate: function(addonId, viewId, params) {
    return addonNav.navigate(NS, addonId, viewId, params);
  },
  subscribe: function(fn) {
    storeListeners.add(fn);
    return function() {
      storeListeners.delete(fn);
    };
  }
});
function registerAddon(mod) {
  if (!mod || typeof mod.id !== "string" || !Array.isArray(mod.views)) {
    console.error("[dsh-workbench] registerAddon \u53C2\u6570\u4E0D\u5408\u6CD5", mod);
    return;
  }
  if (registry.has(mod.id)) slotRegistry.removeAddon(mod.id);
  registry.set(mod.id, mod);
  if (Array.isArray(mod.slots) && mod.slots.length) slotRegistry.addAll(mod.slots, mod.id);
  notifyStore();
}
function setAddons(list) {
  addonState.addons = Array.isArray(list) ? list : [];
  addonState.loaded = true;
  var alive = {};
  addonState.addons.forEach(function(a) {
    alive[a.id] = a;
  });
  registry.forEach(function(_m, id) {
    if (alive[id]) return;
    registry.delete(id);
    slotRegistry.removeAddon(id);
  });
  notifyStore();
}
function refreshAddons() {
  return fetch("/workbench/api/domains").then(function(r) {
    return r.json();
  }).then(function(j) {
    if (!j || !j.domains) return j;
    addonState.shellVersion = j.shellVersion || addonState.shellVersion;
    addonState.categories = Array.isArray(j.categories) && j.categories.length ? j.categories : null;
    setAddons(j.domains);
    return j;
  }).catch(function(e) {
    console.warn("[dsh-workbench] \u8BFB\u53D6\u4E1A\u52A1\u63D2\u4EF6\u5931\u8D25", e);
    return null;
  });
}
function ensureStream() {
  if (stream) return;
  stream = new EventSource("/workbench/api/events");
  stream.addEventListener("domains-changed", function(e) {
    try {
      setAddons(JSON.parse(e.data));
    } catch (err) {
      console.warn(err);
    }
  });
  stream.addEventListener("domain-event", function(e) {
    try {
      broadcast(JSON.parse(e.data));
    } catch (err) {
      console.warn(err);
    }
  });
  sessionRole.attachStream(stream);
  stream.addEventListener("sync-done", notifyCloudStatus);
  stream.addEventListener("sync-status", notifyCloudStatus);
  stream.addEventListener("account-changed", notifyCloudStatus);
}
function useAddonStore() {
  var st = react.useState(0);
  var bump = st[1];
  react.useEffect(function() {
    ensureStream();
    var fn = function() {
      bump(function(x) {
        return x + 1;
      });
    };
    storeListeners.add(fn);
    if (!addonState.loaded) refreshAddons();
    return function() {
      storeListeners.delete(fn);
    };
  }, []);
  return addonState;
}
window.__WB_HOST__ = {
  react,
  jsx,
  h,
  registerAddon,
  get addons() {
    return addonState.addons;
  },
  error: function() {
    return lastAddonError;
  },
  // 第二个参数是插件内的视图 id（如消息的 inbox）；不传保持落到 views[0]，旧插件不受影响。
  // 第三个参数是视图参数（如 {messageId}），由宿主路由带过去，插件用 viewParams 读。
  navigateAddon: function(addonId, viewId, params) {
    return addonNav.navigate(NS, addonId, viewId, params);
  },
  // ── 跨插件界面插槽 ──
  // 落点组件：属主插件在自己界面里 h(host.Slot, {slot, item, lang, t, ownerId})。
  Slot: slotOutlet.Slot,
  // 宿主目录（白名单），插件可据此判断某个插槽是否存在。
  slots: slotCatalog.slots,
  // 单独注册一个贡献：registerSlot({slot,id,order,component,addonId}) 或 registerSlot(addonId, contrib)。
  // 推荐写在 registerAddon 的 slots 数组里——那样卸载插件时宿主能按 addonId 一起撤销。
  registerSlot: function(a, b) {
    var addonId = typeof a === "string" ? a : a && a.addonId ? String(a.addonId) : "unknown";
    var contrib = typeof a === "string" ? b : a;
    return slotRegistry.add(contrib, addonId);
  },
  // 诊断快照（可 JSON 化）：[{slot,id,addonId,order,title,ok,error}]
  slotContributions: function(slotId) {
    return slotRegistry.describe(slotId);
  }
};
function useApi() {
  var base = "/workbench/api";
  return react.useMemo(function() {
    return {
      get: function(p) {
        return fetch(base + p).then(function(r) {
          return r.json();
        });
      },
      post: function(p, b) {
        return fetch(base + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b || {}) }).then(function(r) {
          return r.json();
        });
      },
      del: function(p) {
        return fetch(base + p, { method: "DELETE" }).then(function(r) {
          return r.json();
        });
      }
    };
  }, []);
}
function useCloudStatus() {
  var api = useApi();
  var st = react.useState(null);
  var status = st[0];
  var setStatus = st[1];
  react.useEffect(function() {
    var alive = true;
    function load() {
      api.get("/sync/status").then(function(r) {
        if (alive && r && r.ok) setStatus(r);
      }).catch(function() {
      });
    }
    load();
    var timer = setInterval(load, 15e3);
    function onVisible() {
      if (typeof document !== "undefined" && document.visibilityState === "visible") load();
    }
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisible);
    cloudStatusListeners.add(load);
    return function() {
      alive = false;
      clearInterval(timer);
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisible);
      cloudStatusListeners.delete(load);
    };
  }, [api]);
  return status;
}
function cloudView(status, t) {
  if (!status) return { kind: "local", label: t("cloud_checking"), hint: t("cloud_checking_hint") };
  var failed = Array.isArray(status.failed_tables) ? status.failed_tables : [];
  if (!status.logged_in) return { kind: "local", label: t("cloud_local"), hint: t("cloud_local_hint") };
  if (status.running || status.progress && status.progress.running) {
    var pg = status.progress || null;
    var done = pg && pg.total ? Math.min(pg.index || 0, pg.total) : 0;
    var pct = pg && pg.total ? Math.round(done / pg.total * 100) : 0;
    var label = pg && pg.total ? t("cloud_syncing") + " " + done + "/" + pg.total : t("cloud_syncing");
    var hint = pg && pg.current ? t("sync_current_table") + "\uFF1A" + pg.current : t("cloud_syncing_hint");
    return { kind: "syncing", label, hint, pct, progress: pg };
  }
  if (status.cloud && status.cloud.reachable === false) return { kind: "off", label: t("cloud_offline"), hint: t("cloud_offline_hint") };
  if (!status.last_sync_at) return { kind: "warn", label: t("cloud_never"), hint: t("cloud_never_hint") };
  if (status.last_sync_ok === false || failed.length) return { kind: "warn", label: t("cloud_sync_failed"), hint: t("cloud_sync_failed_hint") };
  return { kind: "on", label: t("cloud_online"), hint: t("cloud_online_hint") };
}
function cloudTitle(view, status, t) {
  var parts = [view.hint];
  if (status && status.logged_in) {
    parts.push(t("sync_last") + ": " + (status.last_sync_at ? new Date(status.last_sync_at).toLocaleString() : t("sync_never")));
    if (status.conflicts) parts.push(t("sync_conflicts") + ": " + status.conflicts);
    var failed = Array.isArray(status.failed_tables) ? status.failed_tables : [];
    if (failed.length) parts.push(t("sync_failed_tables") + ": " + failed.join(", "));
    if (status.last_sync_error) parts.push(status.last_sync_error);
    if (status.cloud && status.cloud.error) parts.push(status.cloud.error);
  }
  return parts.join(" \xB7 ");
}
function CloudStatusPill(props) {
  var t = props.t;
  var status = useCloudStatus();
  var view = cloudView(status, t);
  var title = cloudTitle(view, status, t);
  return jsx.jsxs("button", {
    type: "button",
    className: "wb-cloud " + view.kind,
    onClick: props.onOpen,
    title,
    "aria-label": t("cloud_status") + ": " + view.label + " \u2014 " + view.hint + " \xB7 " + t("cloud_open"),
    "data-cloud-state": view.kind,
    children: [
      jsx.jsx("span", { className: "wb-cloud-dot" }),
      jsx.jsx("span", { className: "wb-cloud-label", children: view.label }),
      view.kind === "syncing" ? jsx.jsx("span", { className: "wb-cloud-bar", "aria-hidden": "true", children: jsx.jsx("span", { style: { width: (view.pct || 0) + "%" } }) }) : null
    ]
  });
}
function pickTitle(title, lang) {
  if (!title) return "";
  if (typeof title === "string") return title;
  return title[lang] || title.zh || title.en || "";
}
function currentLang() {
  var raw = document && document.documentElement && document.documentElement.lang || typeof navigator !== "undefined" && navigator.language || "zh";
  return String(raw).toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
}
var systemTabs = require_system_tabs()(react, jsx, useApi);
var AccountTab = systemTabs.AccountTab;
var BackupTab = systemTabs.BackupTab;
var AuditTab = systemTabs.AuditTab;
var homeCategory = require_home_categories();
var ViewTabs = require_view_tabs()(react, pickTitle);
var ViewOutlet = require_view_outlet();
function ensureCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById("wb-css")) return;
  var s = document.createElement("style");
  s.id = "wb-css";
  s.setAttribute("data-plugin-css", NS);
  s.textContent = CSS;
  document.head.appendChild(s);
}
function SearchPanel(props) {
  var api = props.api;
  var st = react.useState("");
  var rs = react.useState([]);
  var bs = react.useState(false);
  var es = react.useState("");
  var os = react.useState(false);
  var inputRef = react.useRef(null);
  var q = st[0];
  var results = rs[0];
  var loading = bs[0];
  var error = es[0];
  var open = os[0];
  var t = props.t;
  react.useEffect(function() {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === "k") {
        e.preventDefault();
        os[1](true);
        setTimeout(function() {
          if (inputRef.current) inputRef.current.focus();
        }, 0);
      }
      if (e.key === "Escape") os[1](false);
    }
    document.addEventListener("keydown", onKey);
    return function() {
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  react.useEffect(function() {
    var text = String(q || "").trim();
    if (!text) {
      rs[1]([]);
      es[1]("");
      return;
    }
    var alive = true;
    bs[1](true);
    es[1]("");
    var timer = setTimeout(function() {
      api.post("/domains/wb-shell/actions/search.query", { q: text, limit: 20 }).then(function(j) {
        if (!alive) return;
        var data = j && j.result || j || {};
        rs[1](data.items || []);
        if (data.partial) es[1](t("search_partial") + ": " + (data.failed || []).join("\u3001"));
      }).catch(function(e) {
        if (alive) es[1](String(e && e.message || e));
      }).then(function() {
        if (alive) bs[1](false);
      });
    }, 220);
    return function() {
      alive = false;
      clearTimeout(timer);
    };
  }, [q]);
  function pick(hit) {
    os[1](false);
    st[1]("");
    if (hit.url) {
      window.open(hit.url, "_blank", "noopener,noreferrer");
      return;
    }
    var addon = (props.addons || []).filter(function(a) {
      return a.id === hit.domainId;
    })[0];
    if (addon) props.go("addon:" + addon.id + ":" + (hit.view || ""));
  }
  return jsx.jsxs("div", { className: "wb-search-wrap", children: [
    jsx.jsxs("div", { className: "wb-search-bar", children: [
      jsx.jsx("span", { className: "wb-search-icon", children: "\u2315" }),
      jsx.jsx("input", {
        ref: inputRef,
        className: "wb-search-input",
        value: q,
        placeholder: t("search_placeholder"),
        onFocus: function() {
          os[1](true);
        },
        onChange: function(e) {
          st[1](e.target.value);
          os[1](true);
        },
        onKeyDown: function(e) {
          if (e.key === "Enter" && results.length) pick(results[0]);
        }
      }),
      jsx.jsx("kbd", { className: "wb-search-kbd", children: "\u2318K" })
    ] }),
    open && String(q || "").trim() ? jsx.jsxs("div", { className: "wb-search-panel", children: [
      loading ? jsx.jsx("div", { className: "wb-search-empty", children: t("searching") }) : null,
      error ? jsx.jsx("div", { className: "wb-search-empty", children: error }) : null,
      !loading && !error && results.length === 0 ? jsx.jsx("div", { className: "wb-search-empty", children: t("search_none") }) : null,
      results.map(function(hit) {
        var addon = (props.addons || []).filter(function(a) {
          return a.id === hit.domainId;
        })[0];
        var title = addon ? addon.title || addon.id : hit.domainId;
        return jsx.jsxs("button", { type: "button", className: "wb-search-hit", onClick: function() {
          pick(hit);
        }, children: [
          jsx.jsx("span", { className: "wb-search-domain", children: title }),
          jsx.jsxs("span", { className: "wb-search-hit-main", children: [
            jsx.jsx("span", { className: "wb-search-hit-title", children: hit.title }),
            hit.snippet ? jsx.jsx("span", { className: "wb-search-hit-snippet", children: hit.snippet }) : null
          ] })
        ] }, hit.domainId + ":" + hit.id);
      })
    ] }) : null
  ] });
}
function WorkbenchPage(props) {
  var t = props.t;
  var store = useAddonStore();
  var rs = react.useState("home");
  var route = rs[0];
  var setRoute = rs[1];
  var navigation = react.useState({});
  var viewParams = navigation[0];
  var lang = currentLang();
  var api = useApi();
  react.useEffect(function() {
    ensureCss();
  }, []);
  var addons = (store.addons || []).filter(function(a) {
    return a && a.enabled;
  });
  var currentAddon = null;
  if (route.indexOf("addon:") === 0) {
    var parts = route.split(":");
    var wanted = parts[1] || "";
    addons.forEach(function(a) {
      if (a.id === wanted) currentAddon = a;
    });
  }
  var mod = currentAddon ? registry.get(currentAddon.id) : null;
  var clientViews = mod && Array.isArray(mod.views) ? mod.views : [];
  var manifestViews = currentAddon && Array.isArray(currentAddon.views) ? currentAddon.views : [];
  var viewList = clientViews.length ? clientViews : manifestViews;
  var wantedView = route.indexOf("addon:") === 0 ? route.split(":")[2] || "" : "";
  var activeView = null;
  viewList.forEach(function(v) {
    if (v.id === wantedView) activeView = v;
  });
  if (!activeView && viewList.length) activeView = viewList[0];
  function go(next, params) {
    navigation[1](params || {});
    setRoute(next);
  }
  function navigateView(viewId, params) {
    if (currentAddon && viewList.some(function(v) {
      return v.id === viewId;
    })) {
      go("addon:" + currentAddon.id + ":" + viewId, params);
    }
  }
  function cardIcon(id, title) {
    var m = registry.get(id) || registry.get("wb-addon-" + id);
    if (m && m.icon) return h(m.icon, { size: 18, strokeWidth: 1.9, "aria-hidden": "true" });
    return String(title || "?").slice(0, 1);
  }
  function openAddon(a, viewId, params) {
    var m = registry.get(a.id);
    var list = m && m.views || a.views || [];
    var hit = viewId ? list.filter(function(v2) {
      return v2 && v2.id === viewId;
    })[0] : null;
    var v = hit || list[0] || null;
    go("addon:" + a.id + ":" + (v && v.id ? v.id : ""), params);
  }
  react.useEffect(function() {
    var off = addonNav.setHook(function(addonId, viewId, params) {
      var t2 = addons.filter(function(a) {
        return a && a.id === addonId;
      })[0];
      if (t2) openAddon(t2, viewId, params);
      return !!t2;
    });
    var want = addons.length ? addonNav.takePending() : null;
    var hit = want ? addons.filter(function(a) {
      return a && a.id === want.addonId;
    })[0] : null;
    if (hit) openAddon(hit, want.viewId, want.params);
    return off;
  }, [addons]);
  function pageHead(title, desc) {
    return jsx.jsxs("div", { className: "wb-page-head", children: [
      jsx.jsx("div", { className: "wb-page-top", children: [
        jsx.jsx("button", { className: "wb-back", type: "button", "aria-label": t("back_home"), title: t("back_home"), onClick: function() {
          go("home");
        }, children: [jsx.jsx("span", { className: "wb-back-icon", "aria-hidden": "true", children: "\u2190" }), jsx.jsx("span", { className: "wb-back-label", children: t("back_home") })] })
      ] }),
      jsx.jsxs("div", { className: "wb-page-title", children: [
        jsx.jsx("span", { className: "wb-home-icon", children: cardIcon(route, title) }),
        jsx.jsx("h2", { children: title })
      ] }),
      desc ? jsx.jsx("div", { className: "wb-page-desc", children: desc }) : null
    ] });
  }
  function addonCard(a) {
    var m = registry.get(a.id);
    var v = m && m.views && m.views[0] || a.views && a.views[0] || null;
    var title = a.title || pickTitle(v && v.title, lang) || a.id;
    return jsx.jsxs("button", { type: "button", className: "wb-home-card" + (a.error ? " dim" : ""), onClick: function() {
      openAddon(a);
    }, children: [
      jsx.jsxs("div", { className: "wb-home-top", children: [
        jsx.jsx("span", { className: "wb-home-icon", children: cardIcon(a.id, a.title || title) }),
        jsx.jsx("span", { className: "wb-badge", children: "v" + (a.version || "?") })
      ] }),
      jsx.jsx("div", { className: "wb-home-title", children: title }),
      a.description ? jsx.jsx("div", { className: "wb-home-desc", children: a.description }) : null,
      a.error ? jsx.jsx("div", { className: "wb-err", children: t("addon_error") + ": " + a.error }) : null
    ] }, a.id);
  }
  function systemCard(key, icon, title, desc) {
    return jsx.jsxs("button", { type: "button", className: "wb-home-card", onClick: function() {
      go(key);
    }, children: [
      jsx.jsxs("div", { className: "wb-home-top", children: [
        jsx.jsx("span", { className: "wb-home-icon", children: cardIcon(key, icon) })
      ] }),
      jsx.jsx("div", { className: "wb-home-title", children: title }),
      jsx.jsx("div", { className: "wb-home-desc", children: desc })
    ] }, key);
  }
  if (route === "roles") return h(require_catalog(), { api, lang, head: pageHead });
  if (route === "agent") return SystemPages.agentAccessPage({ jsx, t, lang, api, head: pageHead });
  if (route === "agentList") return SystemPages.agentListPage({ jsx, React: react, t, lang, api, head: pageHead });
  if (route === "backup") {
    return jsx.jsxs("div", { className: "wb-root", children: [
      jsx.jsxs("div", { className: "wb-inner wb-wide", children: [pageHead(t("tab_backup"), t("backup_desc")), jsx.jsx(HostPages.PreferenceView, { React: react, component: BackupTab, api, t, lang, addons }, "backup")] })
    ] });
  }
  if (route === "audit") {
    return jsx.jsxs("div", { className: "wb-root", children: [
      jsx.jsxs("div", { className: "wb-inner wb-wide", children: [pageHead(t("tab_audit"), t("audit_desc")), jsx.jsx(AuditTab, { t })] })
    ] });
  }
  if (route === "queue") {
    return jsx.jsx(QueuePage.QueueView, { jsx, React: react, api, lang, t, head: pageHead });
  }
  if (route === "automation") {
    return jsx.jsx(AutomationPage, { h, jsx, React: react, api, lang, t, head: pageHead });
  }
  if (route === "data") {
    return HostPages.dataPage({ jsx, api, lang, t, head: pageHead });
  }
  if (route === "config") {
    return jsx.jsx(HostPages.ConfigView, { addons, jsx, React: react, api, lang, t, head: pageHead });
  }
  if (route === "account") {
    return jsx.jsxs("div", { className: "wb-root", children: [
      jsx.jsxs("div", { className: "wb-inner wb-wide", children: [pageHead(t("tab_account"), t("account_desc")), jsx.jsx(HostPages.PreferenceView, { React: react, component: AccountTab, api, t, openConfig: function() {
        go("config");
      } }, "account")] })
    ] });
  }
  if (currentAddon) {
    var canRender = activeView && typeof activeView.component === "function";
    var addonTitle = currentAddon.title || pickTitle(activeView && activeView.title, lang) || currentAddon.id;
    return jsx.jsxs("div", { className: "wb-root wb-immersive", children: [
      jsx.jsxs("div", { className: "wb-immersive-bar", children: [
        jsx.jsxs("div", { className: "wb-immersive-left", children: [
          jsx.jsx("span", { className: "wb-immersive-icon", children: cardIcon(currentAddon.id, addonTitle) }),
          jsx.jsx("button", { className: "wb-back", type: "button", "aria-label": t("back_home"), title: t("back_home"), onClick: function() {
            go("home");
          }, children: [jsx.jsx("span", { className: "wb-back-icon", "aria-hidden": "true", children: "\u2190" }), jsx.jsx("span", { className: "wb-back-label", children: t("back_home") })] }),
          jsx.jsx(ViewTabs, { views: viewList, activeView, addonId: currentAddon.id, lang, go })
        ] }),
        jsx.jsxs("div", { className: "wb-immersive-title", children: [
          jsx.jsx("span", { children: addonTitle }),
          jsx.jsx("span", { className: "wb-badge", children: "v" + (currentAddon.version || "?") })
        ] })
      ] }),
      jsx.jsxs("div", { className: "wb-immersive-main", children: [
        jsx.jsxs("div", { className: "wb-inner wb-wide", children: [
          currentAddon.error ? jsx.jsx("div", { className: "wb-card", children: jsx.jsx("div", { className: "wb-err", children: t("addon_error") + ": " + currentAddon.error }) }) : canRender ? jsx.jsx(ViewOutlet, { view: activeView, viewProps: { api: apiFor(currentAddon.id), lang, addonId: currentAddon.id, t, viewParams, onNavigate: navigateView } }, currentAddon.id) : !viewList.length ? jsx.jsx("div", { className: "wb-card", children: jsx.jsx("div", { className: "wb-msg", children: t("no_views") }) }) : jsx.jsx("div", { className: "wb-card", children: jsx.jsx("div", { className: "wb-page-loading", children: jsx.jsx("div", { className: "wb-msg", style: { padding: "4px 0" }, children: lastAddonError ? t("addon_unavailable") + " \xB7 " + lastAddonError : t("addon_loading") }) }) })
        ] })
      ] })
    ] });
  }
  return jsx.jsxs("div", { className: "wb-root", children: [
    jsx.jsxs("div", { className: "wb-inner", children: [
      jsx.jsxs("div", { className: "wb-hero", children: [
        jsx.jsxs("div", { children: [jsx.jsx("h2", { children: t("title") }), jsx.jsx("span", { className: "wb-tag", children: t("tagline") })] }),
        jsx.jsx(CloudStatusPill, { t, onOpen: function() {
          go("account");
        } })
      ] }),
      jsx.jsx(SearchPanel, { api, addons, go, t }),
      addons.length ? homeCategory.homeSection(jsx, addonState.categories, addons, { t, lang, addonCard }) : jsx.jsx("div", { className: "wb-card", children: jsx.jsx("div", { className: "wb-msg wb-empty-cta", children: t("no_installed") }) }),
      jsx.jsxs("div", { className: "wb-sec", children: [
        jsx.jsx("h3", { children: t("manage") }),
        jsx.jsx("span", { className: "wb-hint", children: t("home_hint") })
      ] }),
      jsx.jsx("div", { className: "wb-home-grid manage", children: SystemPages.manageCards({ t, systemCard }) })
    ] })
  ] });
}
var exports_ = {
  name: NS,
  // layout：跨页跳转需要把工作台面板切到前台（见 __WB_HOST__.navigateAddon 的第 2 条分支）。
  inject: ["slots", "locale", "theme", "layout"],
  apply: function(ctx) {
    try {
      ensureCss();
      try {
        var head = document.head || document.getElementsByTagName("head")[0];
        if (head && !document.querySelector('meta[name="viewport"]')) {
          var vp = document.createElement("meta");
          vp.setAttribute("name", "viewport");
          vp.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
          head.insertBefore(vp, head.firstChild);
        }
      } catch (e) {
      }
      addonNav.setLayout(ctx && ctx.layout);
      ctx.effect(function() {
        return function() {
          addonNav.setLayout(null);
        };
      }, "wb-layout-api");
      var PanellistIcon = createPanellistIcon(h);
      ctx.effect(function() {
        return ctx.locale.register(NS, LOCALE);
      }, "wb-locale");
      var t = ctx.locale.bind(NS);
      ctx.slots.inject("sidebar.panellist", function() {
        return ctx.slots.register(
          { name: "sidebar.panellist", id: NS, order: 62, label: function() {
            return t("nav");
          } },
          function(props) {
            return h(PanellistIcon, props);
          }
        );
      });
      ctx.slots.inject("main", function() {
        return ctx.slots.register(
          { name: "main", key: NS, locale: NS, inject: function() {
            return { t };
          } },
          function() {
            try {
              return jsx.jsx(WorkbenchPage, { t });
            } catch (e) {
              window.__wbSlotErr = String(e && e.stack || e);
              throw e;
            }
          }
        );
      });
      ctx.slots.inject("settings.plugins.tab", function() {
        return ctx.slots.register(
          { name: "settings.plugins.tab", id: NS, order: 65, label: function() {
            return t("nav");
          }, locale: NS, inject: function() {
            return { t };
          } },
          function() {
            return h(WorkbenchPage, { t });
          }
        );
      });
      ctx.slots.inject("conversation.input.left", function() {
        return ctx.slots.register(
          { name: "conversation.input.left", id: NS + "-role", order: 40, label: function() {
            return t("role_title");
          } },
          function(props) {
            return h(sessionRole.SessionRole, { key: props.sessionId, sessionId: props.sessionId, t, ensureStream });
          }
        );
      });
    } catch (e) {
      console.error("[dsh-workbench] apply crashed:", e, e && e.stack);
      throw e;
    }
  }
};
module.exports = exports_;
    return module.exports;
  },
});
