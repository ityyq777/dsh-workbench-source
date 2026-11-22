// 由 scripts/build-addon-clients.mjs 生成；请修改对应 client/client.src.cjs 后重新构建。
window.__ModuleLoader__ = window.__ModuleLoader__ || { modules: {}, load: function (m) { this.modules[m.id] = m.factory; } };
window.__ModuleLoader__.load({
  id: "dsh-workbench",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// packages/shell/client/locale.cjs
var require_locale = __commonJS({
  "packages/shell/client/locale.cjs"(exports2, module2) {
    "use strict";
    var LOCALE2 = {
      zh: {
        nav: "\u5DE5\u4F5C\u53F0",
        title: "\u5DE5\u4F5C\u53F0",
        tagline: "\u79BB\u7EBF\u4F18\u5148 \xB7 \u4E1A\u52A1\u63D2\u4EF6\u7531 DSH \u5B89\u88C5",
        tab_account: "\u8D26\u53F7\u4E0E\u540C\u6B65",
        tab_addons: "\u5B50\u63D2\u4EF6",
        tab_backup: "\u6570\u636E\u5907\u4EFD",
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
        cloud_saved: "\u5DF2\u4FDD\u5B58\uFF0C\u6B63\u5728\u9996\u6B21\u540C\u6B65",
        cloud_save_failed: "\u4FDD\u5B58\u5931\u8D25",
        cloud_test: "\u6D4B\u8BD5\u8FDE\u63A5",
        cloud_testing: "\u6D4B\u8BD5\u4E2D\u2026",
        cloud_ok: "\u8FDE\u63A5\u6B63\u5E38",
        cloud_test_fail: "\u8FDE\u63A5\u5931\u8D25",
        cloud_auth_ok: "\u8BBF\u95EE\u5BC6\u94A5\u6709\u6548",
        cloud_auth_bad: "\u5DF2\u8FDE\u63A5\uFF0C\u4F46\u8BBF\u95EE\u5BC6\u94A5\u65E0\u6548",
        cloud_server: "\u670D\u52A1\u7AEF",
        cloud_devices_count: "\u8BBE\u5907\u6570",
        cloud_shared_hint: "\u5171\u4EAB\u4E91\u7AEF\u8BF7\u4F7F\u7528\u4E0B\u9762\u7684\u8D26\u53F7\u767B\u5F55",
        record_label: "\u8BB0\u5F55\u6A21\u5F0F",
        record_on: "\u8BB0\u5F55\u4E2D",
        record_off: "\u8BB0\u5F55",
        record_on_title: "\u672C\u4F1A\u8BDD\u8BB0\u5F55\u6A21\u5F0F\u5DF2\u5F00\u542F\uFF0C\u70B9\u51FB\u5173\u95ED",
        record_off_title: "\u5F00\u542F\u540E\u628A\u5B8C\u6210\u7684\u53EF\u4EA4\u4ED8\u5185\u5BB9\u8BB0\u5230\u5DE5\u4F5C\u53F0\uFF08\u4EC5\u672C\u4F1A\u8BDD\uFF09",
        record_busy: "\u5207\u6362\u4E2D",
        record_error: "\u5207\u6362\u5931\u8D25",
        record_failed_short: "\u8BB0\u5F55\u5931\u8D25"
      },
      en: {
        nav: "Workbench",
        title: "Workbench",
        tagline: "Offline-first \xB7 addons installed by DSH",
        tab_account: "Account & Sync",
        tab_addons: "Addons",
        tab_backup: "Data backup",
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
        cloud_shared_hint: "Use the account login below for the shared cloud",
        record_label: "Record mode",
        record_on: "Recording",
        record_off: "Record",
        record_on_title: "Record mode is on for this session; click to turn it off",
        record_off_title: "Record finished deliverables to the workbench (this session only)",
        record_busy: "Switching",
        record_error: "Switch failed",
        record_failed_short: "Failed"
      }
    };
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

// packages/shell/client/styles.cjs
var require_styles = __commonJS({
  "packages/shell/client/styles.cjs"(exports2, module2) {
    "use strict";
    var SW = require_switch();
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
      ".wb-record-pill{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:1px solid var(--wb-line,var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent)));border-radius:999px;background:color-mix(in oklab,currentColor 3%,transparent);color:inherit;cursor:pointer;font:inherit;font-size:12px;line-height:1;opacity:.62;white-space:nowrap;transition:opacity .15s ease,border-color .15s ease,background .15s ease}",
      ".wb-record-pill:hover{opacity:.95;border-color:color-mix(in oklab,var(--dsw-alias-brand-primary,#11a89b) 35%,var(--wb-line,var(--dsw-alias-border-l2,color-mix(in oklab,currentColor 16%,transparent))))}",
      ".wb-record-pill.on{opacity:1;border-color:color-mix(in oklab,var(--dsw-alias-brand-primary,#11a89b) 45%,transparent);background:color-mix(in oklab,var(--dsw-alias-brand-primary,#11a89b) 10%,transparent)}",
      ".wb-record-pill:disabled{opacity:.4;cursor:default}",
      ".wb-record-pill.err{opacity:1;border-color:var(--dsw-alias-state-error-primary,#e5484d);color:var(--dsw-alias-state-error-primary,#e5484d)}",
      ".wb-record-pill.err .wb-record-dot{background:currentColor;opacity:1}",
      ".wb-record-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.5;flex:none}",
      ".wb-record-pill.on .wb-record-dot{background:var(--dsw-alias-brand-primary,#11a89b);opacity:1;box-shadow:0 0 0 3px color-mix(in oklab,var(--dsw-alias-brand-primary,#11a89b) 18%,transparent)}",
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
      "@media (pointer:coarse) and (max-width:520px){.wb-root .wb-immersive-main{padding:8px 8px 12px}.wb-root .wb-inner{gap:10px}}"
    ].join("\n");
    module2.exports = CSS2 + "\n" + SW.styles.join("\n");
  }
});

// packages/shell/client/panellist-icon.cjs
var require_panellist_icon = __commonJS({
  "packages/shell/client/panellist-icon.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function PanellistIcon(h2) {
      return function Icon(props) {
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
        "." + P + " details>summary{cursor:pointer;font-size:11.5px;color:var(--dsw-alias-label-secondary,inherit);width:max-content}",
        "." + P + " details>summary:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4f6ef7);outline-offset:2px}",
        // 参数折叠面板：折叠时只留一行「参数 · 必填 n」，展开后与表格之间留一点气口。
        "." + P + "-params{min-width:0}",
        "." + P + "-params>summary{user-select:none;max-width:100%}",
        "." + P + "-params[open]>summary{margin-bottom:6px}",
        "." + P + "-empty{padding:24px;text-align:center;border:1px dashed var(--wb-border,#e3e5e9);border-radius:10px;color:var(--dsw-alias-label-tertiary,inherit)}",
        "." + P + "-error{padding:12px;border:1px solid var(--dsw-alias-state-error-primary,#d9534f);border-radius:10px;color:var(--dsw-alias-state-error-primary,#d9534f);display:flex;gap:10px;align-items:center;flex-wrap:wrap;overflow-wrap:anywhere}",
        "." + P + "-toast{position:sticky;bottom:8px;align-self:flex-start;border-radius:999px;padding:3px 10px;background:var(--dsw-alias-bg-skeleton,#f2f3f5);font-size:11.5px;max-width:100%}",
        // 窄屏：五列参数表压成一列会丢失列名、且 table 布局按最小内容宽度撑破容器，
        // 这里整体改成块级网格：每行 = 名称 / 类型 / 必填 + 约束行 + 说明行，行间用细线分隔。
        "@media(max-width:760px){." + P + "-toolbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:end}." + P + "-search{grid-column:1/-1}." + P + "-toolbar>label{display:flex;flex-direction:column;align-items:stretch;gap:4px;min-width:0}." + P + "-toolbar select{width:100%;min-width:0}." + P + "-cardhead{grid-template-columns:minmax(0,1fr);row-gap:6px}." + P + "-origins{justify-content:flex-start}." + P + "-table{display:block}." + P + "-table thead{display:none}." + P + "-table tbody{display:block}." + P + '-table tr{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"name type need" "extra extra extra" "desc desc desc";column-gap:8px;padding:9px 0;border-top:' + hairline + "}." + P + "-table tr:first-child{border-top:0;padding-top:2px}." + P + "-table tr:last-child{padding-bottom:2px}." + P + "-table td{display:block;border:0;padding:0;min-width:0}." + P + "-table td:empty{display:none}." + P + "-pname{grid-area:name;font-weight:640}." + P + "-ptype{grid-area:type;justify-self:start;align-self:center;color:var(--dsw-alias-label-tertiary,inherit)}." + P + "-pneed{grid-area:need;justify-self:end;align-self:center;font-size:11px;line-height:1.6;white-space:nowrap}." + P + "-pextra{grid-area:extra;margin-top:3px;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55}." + P + "-pdesc{grid-area:desc;margin-top:3px;color:var(--dsw-alias-label-secondary,inherit);line-height:1.55}}",
        // 中等宽度（521–760px）三个筛选项正好排成一行，避免第三项独占一行显得参差。
        "@media(min-width:521px) and (max-width:760px){." + P + "-toolbar{grid-template-columns:repeat(3,minmax(0,1fr))}}",
        "@media(max-width:420px){." + P + "-toolbar{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}." + P + "-card{padding:10px}." + P + "-table tr{padding:8px 0}}"
      ].join("\n");
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
      var Icon = options.Icon || null;
      var injectCss = require_action_schema_style()(prefix, DOMAIN);
      var Highlight = createHighlight(P);
      function icon(name, size) {
        return Icon ? h2(Icon, { name, size: size || 14 }) : null;
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
              "details",
              {
                className: P + "-params",
                "data-params-fold": action.name,
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
              h2("summary", null, t.params + (required ? " \xB7 " + t.requiredCount(required) : "")),
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
              "details",
              null,
              h2("summary", null, t.raw),
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
          hostApi.call("actions.list", {}).then(function(result) {
            if (!alive) return;
            var list = result && Array.isArray(result.actions) ? result.actions : [];
            setSnap({ loading: false, error: "", actions: list });
          }, function(error) {
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
        var head = jsx2.jsx("div", { className: "wb-audit-summary", role: "status", "aria-live": "polite", children: [
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
        else if (!rows.length) body = jsx2.jsx("div", { className: "wb-msg wb-empty-cta", children: t("agent_list_empty") });
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
        card("agent", "agent", t("tab_agent"), t("agent_desc")),
        card("agentList", "agent", t("tab_agent_list"), t("agent_list_desc")),
        card("backup", "backup", t("tab_backup"), t("backup_desc")),
        card("audit", "audit", t("tab_audit"), t("audit_desc")),
        card("account", "account", t("tab_account"), t("account_desc"))
      ];
    }
    module2.exports = { agentAccessPage, agentListPage, manageCards };
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

// packages/shell/client/cloud-settings.cjs
var require_cloud_settings = __commonJS({
  "packages/shell/client/cloud-settings.cjs"(exports2, module2) {
    "use strict";
    module2.exports = function createCloudSettings(react2, jsx2) {
      var MODES = ["none", "private", "shared"];
      function CloudSettings(props) {
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
            if (!r || !r.ok) return;
            setCfg(r);
            setDraftMode(r.mode || "shared");
            if (props.onModeChange) props.onModeChange(r.mode || "shared");
            setForm({
              url: r.private && r.private.url || "",
              secret: "",
              deviceName: r.private && r.private.device_name || ""
            });
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
            if (props.onModeChange) props.onModeChange(r.mode || draftMode);
            setForm({
              url: r.private && r.private.url || "",
              secret: "",
              deviceName: r.private && r.private.device_name || ""
            });
            setMsg(t("cloud_saved"));
            if (props.onChanged) props.onChanged();
          });
        }
        function test() {
          setTesting(true);
          setProbe(null);
          setMsg("");
          var probeMode = draftMode || cfg && cfg.mode || "shared";
          var body = { mode: probeMode };
          if (probeMode === "private") body.private = { url: form.url, secret: form.secret, deviceName: form.deviceName };
          api.post("/cloud/test", body).then(function(r) {
            setTesting(false);
            setProbe(r || { reachable: false });
          });
        }
        var mode = draftMode || cfg && cfg.mode || "shared";
        var hasSecret = Boolean(cfg && cfg.private && cfg.private.has_secret);
        var hintKey = "cloud_mode_" + mode + "_hint";
        return jsx2.jsxs("div", { className: "wb-card", children: [
          jsx2.jsxs("div", { className: "wb-sec", children: [
            jsx2.jsx("h3", { children: t("cloud_settings") }),
            jsx2.jsx("span", { className: "wb-hint", children: t("cloud_switch_hint") })
          ] }),
          jsx2.jsx("div", { className: "wb-tabs", children: MODES.map(function(m) {
            return jsx2.jsx("button", {
              key: m,
              className: "wb-tab" + (mode === m ? " on" : ""),
              onClick: function() {
                setDraftMode(m);
                setMsg("");
                if (props.onModeChange) props.onModeChange(m);
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
            jsx2.jsx("button", { className: "wb-btn", disabled: saving, onClick: save, children: saving ? t("cloud_saving") : t("cloud_save") }),
            jsx2.jsx("button", { className: "wb-btn ghost", disabled: testing, onClick: test, children: testing ? t("cloud_testing") : t("cloud_test") })
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
      }
      return { CloudSettings };
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
        var idsKey = exportable.map(function(a) {
          return a.id;
        }).join(",");
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
        var stFormat = react2.useState("zip");
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
        react2.useEffect(function() {
          setSelected(function(prev) {
            var next = {};
            var changed = false;
            exportable.forEach(function(a) {
              next[a.id] = true;
              if (!prev[a.id]) changed = true;
            });
            Object.keys(prev).forEach(function(id) {
              if (!exportable.some(function(a) {
                return a.id === id;
              })) changed = true;
            });
            return changed ? next : prev;
          });
        }, [idsKey]);
        var chosen = exportable.filter(function(a) {
          return selected[a.id];
        });
        var allSelected = exportable.length > 0 && chosen.length === exportable.length;
        function toggle(id) {
          var next = Object.assign({}, selected);
          next[id] = !next[id];
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
                var sel = !!selected[a.id];
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
      var CloudSettings = require_cloud_settings()(react2, jsx2).CloudSettings;
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
        var st8 = react2.useState("");
        var pickedMode = st8[0];
        var setPickedMode = st8[1];
        function refreshSync() {
          api.get("/sync/status").then(function(r) {
            if (r && r.ok) setSyncStatus(r);
          });
          api.get("/sync/conflicts?limit=20").then(function(r) {
            setConflicts(r && Array.isArray(r.conflicts) ? r.conflicts : []);
          });
        }
        function refresh() {
          api.get("/account").then(function(r) {
            setMe(r);
            if (r && r.logged_in) refreshSync();
          });
        }
        react2.useEffect(function() {
          refresh();
        }, []);
        react2.useEffect(function() {
          if (!me || !me.logged_in) return void 0;
          var es = new EventSource("/workbench/api/events");
          function onSync() {
            refreshSync();
          }
          es.addEventListener("sync-done", onSync);
          es.addEventListener("sync-status", onSync);
          return function() {
            es.close();
          };
        }, [me && me.logged_in]);
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
        var savedMode = me && me.mode || "shared";
        var mode = pickedMode || savedMode;
        var settingsCard = jsx2.jsx(CloudSettings, { t, api, onChanged: refresh, onModeChange: setPickedMode });
        if (!me.logged_in) {
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
                jsx2.jsx(SW.Switch, { h: jsx2.jsx, checked: !!form.signup, label: t("signup"), onChange: function(next) {
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
          var Icon = typeof view.icon === "function" ? view.icon : null;
          return h2("button", {
            key: view.id,
            type: "button",
            className: "wb-tab" + (on ? " on" : ""),
            "aria-label": title,
            onClick: function() {
              props.go("addon:" + props.addonId + ":" + view.id);
            }
          }, Icon ? h2("span", {
            "aria-hidden": true,
            style: { display: "inline-flex", verticalAlign: "middle", marginRight: 6 }
          }, h2(Icon, { size: 14, strokeWidth: 2, "aria-hidden": true })) : null, title);
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

// packages/shell/client/client.src.cjs
var react = require("react");
var jsx = require("react/jsx-runtime");
var h = react.createElement;
var NS = "workbench";
var LOCALE = require_locale();
var CSS = require_styles();
var createPanellistIcon = require_panellist_icon();
var addonNav = require_addon_nav()();
var SystemPages = require_system_pages();
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
var recordModes = {};
var recordListeners = /* @__PURE__ */ new Set();
var stream = null;
var lastAddonError = null;
function setRecordMode(sessionId, enabled) {
  if (!sessionId) return;
  recordModes[sessionId] = !!enabled;
  recordListeners.forEach(function(fn) {
    try {
      fn(sessionId, !!enabled);
    } catch (e) {
      console.error(e);
    }
  });
}
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
  stream.addEventListener("record-mode", function(e) {
    try {
      var payload = JSON.parse(e.data);
      if (payload && payload.sessionId) setRecordMode(payload.sessionId, payload.enabled);
    } catch (err) {
      console.warn(err);
    }
  });
  stream.addEventListener("sync-done", notifyCloudStatus);
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
  if (status.running) return { kind: "syncing", label: t("cloud_syncing"), hint: t("cloud_syncing_hint") };
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
      jsx.jsx("span", { className: "wb-cloud-label", children: view.label })
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
  if (route === "agent") return SystemPages.agentAccessPage({ jsx, t, lang, api, head: pageHead });
  if (route === "agentList") return SystemPages.agentListPage({ jsx, React: react, t, lang, api, head: pageHead });
  if (route === "backup") {
    return jsx.jsxs("div", { className: "wb-root", children: [
      jsx.jsxs("div", { className: "wb-inner wb-wide", children: [pageHead(t("tab_backup"), t("backup_desc")), jsx.jsx(BackupTab, { t, lang, addons })] })
    ] });
  }
  if (route === "audit") {
    return jsx.jsxs("div", { className: "wb-root", children: [
      jsx.jsxs("div", { className: "wb-inner wb-wide", children: [pageHead(t("tab_audit"), t("audit_desc")), jsx.jsx(AuditTab, { t })] })
    ] });
  }
  if (route === "account") {
    return jsx.jsxs("div", { className: "wb-root", children: [
      jsx.jsxs("div", { className: "wb-inner wb-wide", children: [pageHead(t("tab_account"), t("account_desc")), jsx.jsx(AccountTab, { t })] })
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
var RecordToggle = function(props) {
  var sid = props && props.sessionId;
  var st = react.useState(false);
  var on = st[0];
  var setOn = st[1];
  var bst = react.useState(false);
  var busy = bst[0];
  var setBusy = bst[1];
  var est = react.useState("");
  var err = est[0];
  var setErr = est[1];
  var t = props && props.t;
  react.useEffect(function() {
    if (!sid) return;
    var fn = function(changed, value) {
      if (changed === sid) setOn(!!value);
    };
    recordListeners.add(fn);
    ensureStream();
    fetch("/workbench/api/record?sessionId=" + encodeURIComponent(sid)).then(function(r) {
      return r.json();
    }).then(function(j) {
      if (j && j.ok) setRecordMode(sid, !!j.enabled);
    }).catch(function() {
    });
    return function() {
      recordListeners.delete(fn);
    };
  }, [sid]);
  function toggle() {
    if (!sid || busy) return;
    setBusy(true);
    setErr("");
    fetch("/workbench/api/record", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: sid, enabled: !on })
    }).then(function(r) {
      return r.json();
    }).then(function(j) {
      if (!j || !j.ok) throw new Error(j && j.error || "request failed");
      setRecordMode(sid, !!j.enabled);
    }).catch(function(e) {
      var msg = String(e && e.message || e);
      setErr(msg);
      try {
        console.warn("[dsh-workbench] record toggle failed:", msg);
      } catch (_) {
      }
    }).then(function() {
      setBusy(false);
    });
  }
  if (!sid) return null;
  var label = busy ? t("record_busy") : err ? t("record_failed_short") : on ? t("record_on") : t("record_off");
  var title = err ? t("record_error") + ": " + err : on ? t("record_on_title") : t("record_off_title");
  return h(
    "button",
    {
      type: "button",
      className: "wb-record-pill" + (on ? " on" : "") + (err ? " err" : ""),
      onClick: toggle,
      disabled: busy,
      title,
      "aria-label": t("record_label") + ": " + label,
      "aria-pressed": on ? "true" : "false"
    },
    h("span", { className: "wb-record-dot" }),
    h("span", { className: "wb-record-label", children: label })
  );
};
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
          { name: "conversation.input.left", id: NS + "-record", order: 40, label: function() {
            return t("record_label");
          } },
          function(props) {
            return h(RecordToggle, { sessionId: props && props.sessionId, t });
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
