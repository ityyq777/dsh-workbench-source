"use strict";
/**
 * 集合选择器：邮箱账户绑一个保险箱集合，集合里需要有类型为「账号」的凭据。
 *
 * 0.6.0 起集合不再有账号字段，账号是一条 kind=account 的凭据；邮箱地址由
 * mail.accountSetPreview 在选中集合后带出，授权码再从同一集合里的凭据里选。
 * 只读保险箱既有接口，不改它的契约；保险箱没装时退化成说明文案。
 * 集合名是明文元数据（vault.setList 不要求解锁），锁定态照常可选，
 * 只有账号/授权码明文才需要解锁。
 */
var FilterChecklist = require("../../../lib/filter-checklist.cjs");

function t(lang, zh, en) {
    return lang === "en" ? en : zh;
}

module.exports = function SetPicker(props) {
    var h = props.h;
    var C = props.C;
    var api = props.api;
    var lang = props.lang || "zh";
    var React = props.React || require("react");
    var vault = props.vault || "ready";
    var disabled = props.disabled === true;

    var S = React.useState;
    var openS = S(false);
    var qS = S("");
    var rowsS = S([]);
    var loadS = S(false);
    var errS = S("");
    var knownS = S({});
    var boxRef = React.useRef ? React.useRef(null) : { current: null };

    var open = openS[0];
    var rows = rowsS[0];
    var value = String(props.value || "");

    function call(query) {
        return C.call(api, "vault.setList", { q: query || "" }).then(function (r) {
            var items = (r && Array.isArray(r.items) ? r.items : []).map(function (x) {
                return { id: x.id, name: x.name, secretCount: x.secretCount || 0 };
            });
            return items;
        });
    }

    function remember(items) {
        knownS[1](function (prev) {
            var next = Object.assign({}, prev);
            items.forEach(function (x) { next[x.id] = x; });
            return next;
        });
    }

    // 首次挂载先拉一次：既回显已绑定集合的名称，也用于判断「原集合已失效」。
    // 锁定与未初始化都照常取数：setList 只回元数据，不碰密钥。
    var canRead = vault !== "loading" && vault !== "missing";

    React.useEffect(function () {
        if (!canRead) return;
        var alive = true;
        loadS[1](true);
        call("")
            .then(function (items) {
                if (!alive) return;
                rowsS[1](items);
                remember(items);
                loadS[1](false);
            })
            .catch(function (e) {
                if (!alive) return;
                loadS[1](false);
                errS[1](C.errText(e));
            });
        return function () { alive = false; };
    }, [vault, canRead]);

    // 展开面板时按关键字取数：服务端 setList 的 q 匹配集合名。
    React.useEffect(function () {
        if (!open) return;
        var alive = true;
        loadS[1](true);
        errS[1]("");
        var timer = setTimeout(function () {
            call(qS[0])
                .then(function (items) {
                    if (!alive) return;
                    rowsS[1](items);
                    remember(items);
                    loadS[1](false);
                })
                .catch(function (e) {
                    if (!alive) return;
                    rowsS[1]([]);
                    loadS[1](false);
                    errS[1](C.errText(e));
                });
        }, 180);
        return function () {
            alive = false;
            clearTimeout(timer);
        };
    }, [open, qS[0]]);

    // 点外部 / Esc 收起。
    React.useEffect(function () {
        if (!open) return;
        function onDown(e) {
            var box = boxRef.current;
            if (box && !box.contains(e.target)) openS[1](false);
        }
        function onKey(e) {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                openS[1](false);
            }
        }
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return function () {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    var picked = knownS[0][value] || null;
    var missing = !!value && !picked && !loadS[0];
    var label = !value
        ? t(lang, "选择集合（含账号凭据）", "Choose a set with an account")
        : picked
            ? picked.name + (picked.secretCount ? " · " + picked.secretCount + " 条凭据" : "")
            : t(lang, "集合 " + value.slice(0, 8), "Set " + value.slice(0, 8));

    if (vault === "missing") {
        return h("div", { className: "wbml-picker" },
            h("div", { className: "wbml-picker-note", role: "status" },
                t(lang, "没有检测到凭据保险箱，无法选择集合。安装并初始化保险箱后刷新本页。",
                    "No vault plugin detected. Install and initialise the vault, then reload.")));
    }
    if (vault === "loading") {
        return h("div", { className: "wbml-picker" },
            h("div", { className: "wbml-picker-note", role: "status" }, t(lang, "正在检查保险箱状态…", "Checking the vault…")));
    }

    function pick(id) {
        var item = knownS[0][id] || rows.filter(function (x) { return x.id === id; })[0] || null;
        openS[1](false);
        if (props.onChange) props.onChange(id, item);
    }

    function goVault() {
        openS[1](false);
        var host = typeof window !== "undefined" ? window.__WB_HOST__ : null;
        if (host && typeof host.navigateAddon === "function") host.navigateAddon("wb-addon-vault");
    }

    var emptyText = qS[0]
        ? t(lang, "没有匹配的账号集合", "No matching account set")
        : t(lang, "还没有账号集合", "No account sets yet");

    return h("div", { className: "wbml-picker", ref: boxRef },
        h("button", {
            type: "button",
            className: "wbml-picker-trigger" + (value && !missing ? " is-set" : "") + (missing ? " is-missing" : ""),
            disabled: disabled,
            "aria-haspopup": "listbox",
            "aria-expanded": open ? "true" : "false",
            onClick: function () { openS[1](!open); },
        },
        h("span", { className: "wbml-picker-label" }, label),
        h("span", { className: "wbml-picker-caret", "aria-hidden": "true" }, "▾")),
        missing
            ? h("p", { className: "wbml-picker-warn" },
                t(lang, "原账号集合已失效，请重新选择", "The bound account set is gone — pick another one"))
            : null,
        open
            ? h("div", { className: "wbml-picker-panel", role: "listbox", "aria-label": t(lang, "选择集合（含账号凭据）", "Choose a set with an account") },
                h(FilterChecklist, {
                    mode: "single",
                    items: rows.map(function (x) {
                        return { id: x.id, name: x.name, meta: t(lang, x.secretCount + " 条凭据", x.secretCount + " credentials") };
                    }),
                    selected: value ? [value] : [],
                    onPick: pick,
                    query: qS[0],
                    onQuery: function (v) { qS[1](v); },
                    title: t(lang, "凭据集合", "Credential sets"),
                    total: rows.length,
                    searchPlaceholder: t(lang, "搜索集合名", "Search set name"),
                    groupLabel: t(lang, "凭据集合", "Credential sets"),
                    loading: loadS[0],
                    emptyText: emptyText,
                    noMatchText: t(lang, "没有匹配的集合", "No matching set"),
                    loadingText: t(lang, "加载中…", "Loading…"),
                    disabled: disabled,
                }),
                errS[0] ? h(C.Notice, { h: h, kind: "error", text: errS[0] }) : null,
                !rows.length && !loadS[0]
                    ? h("div", { className: "wbml-picker-empty" },
                        h("span", null, t(lang, "还没有集合，去保险箱新建一个并放入一条「账号」类型的凭据", "No sets yet — create one in the vault and add an account credential")),
                        h("button", { type: "button", className: "wbml-btn", onClick: goVault },
                            t(lang, "去保险箱", "Open vault")))
                    : null)
            : null);
};
