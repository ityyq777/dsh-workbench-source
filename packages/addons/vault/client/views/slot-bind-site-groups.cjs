"use strict";
/**
 * 插槽贡献：在站点记录行上挂「凭据分组」入口，弹窗里勾选/取消分组完成关联。
 *
 * 为什么由保险箱贡献、站点只放落点：
 *  - vault_binding 只归保险箱写（vault.bind / vault.unbind），站点侧不该出现第二套写入；
 *  - 「哪些分组能挂、挂了以后有哪些凭据」只有保险箱知道，管理界面留在属主侧才不会两边口径打架。
 * 站点只负责把 item 传进来：{ kind: "site", id, title }。
 *
 * 组件只认 kind === "site"，别的条目（比如邮件）直接返回 null，不影响同一个插槽的其他贡献。
 */
var C = require("../ui/common.cjs");
var Page = require("../ui/page.cjs");
var Dialog = require("../ui/dialog.cjs").Dialog;
var GLYPHS = require("../ui/icons.cjs").ICONS;

var KIND = "site";

module.exports = function createSlotBindSiteGroups(deps) {
  var React = deps.React;
  var h = deps.h;
  var injectCss = typeof deps.injectCss === "function" ? deps.injectCss : function () {};
  var Key = GLYPHS["key-round"];

  return function SlotBindSiteGroups(props) {
    // 站点页可能先于保险箱页面渲染，样式在这里补一次注入。
    React.useEffect(function () { injectCss(); }, []);

    var api = props.api;
    var item = props.item || null;
    var en = props.lang === "en";

    var openS = React.useState(false);
    var stateS = React.useState({ loading: false, groups: [], bound: {}, error: "" });
    var busyS = React.useState("");

    // 不是站点条目就什么都不做：贡献方只认自己声明过的 kind。
    if (!item || item.kind !== KIND || !item.id) return null;

    function load() {
      stateS[1](function (old) {
        return Object.assign({}, old, { loading: true, error: "" });
      });
      Promise.all([
        C.call(api, "vault.groupList"),
        C.call(api, "vault.bindingsOf", { subjectType: KIND, subjectId: item.id }),
      ])
        .then(function (r) {
          var bound = {};
          ((r[1] && r[1].items) || []).forEach(function (b) {
            bound[String(b.groupId)] = true;
          });
          stateS[1]({ loading: false, groups: (r[0] && r[0].items) || [], bound: bound, error: "" });
        })
        .catch(function (e) {
          stateS[1]({ loading: false, groups: [], bound: {}, error: C.errText(e) });
        });
    }

    function openDialog() {
      openS[1](true);
      load();
    }

    function toggle(group) {
      var id = String(group.id);
      var on = !!stateS[0].bound[id];
      busyS[1](id);
      var action = on
        ? C.call(api, "vault.unbind", { subjectType: KIND, subjectId: item.id, groupId: id })
        : C.call(api, "vault.bind", { subjectType: KIND, subjectId: item.id, groupId: id });
      action
        .then(function () {
          stateS[1](function (old) {
            var bound = Object.assign({}, old.bound);
            if (on) delete bound[id];
            else bound[id] = true;
            return Object.assign({}, old, { bound: bound, error: "" });
          });
        })
        .catch(function (e) {
          stateS[1](function (old) {
            return Object.assign({}, old, { error: C.errText(e) });
          });
        })
        .then(function () {
          busyS[1]("");
        });
    }

    var state = stateS[0];
    var title = String(item.title || item.id);

    return h(
      React.Fragment,
      null,
      h(
        C.Btn,
        { h: h, title: en ? "Credential groups" : "凭据分组", onClick: openDialog },
        Key ? h(Key, { size: 12, strokeWidth: 2, "aria-hidden": "true" }) : null,
        en ? "Groups" : "凭据分组",
      ),
      openS[0]
        ? h(
            Dialog,
            {
              h: h,
              React: React,
              title: (en ? "Credential groups · " : "凭据分组 · ") + title,
              titleId: "wbv-site-groups-title",
              onClose: function () { openS[1](false); },
            },
            h(
              "div",
              { className: "wbv-modal-body" },
              h(
                "p",
                { className: "wbv-modal-sub" },
                en
                  ? "Checked means linked; unchecking removes the link. Only vault_binding changes, credentials stay untouched."
                  : "勾选即关联到该分组，取消勾选即解除；只改关联，不动凭据与集合。",
              ),
              h(C.Notice, { h: h, kind: "error", text: state.error }),
              state.loading
                ? h(C.Empty, { h: h, text: en ? "Loading…" : "读取中…" })
                : h(
                    "div",
                    { className: "wbv-check-list" },
                    state.groups.length
                      ? state.groups.map(function (group) {
                          var id = String(group.id);
                          return h(
                            "label",
                            { key: id, className: "wbv-check" },
                            h("input", {
                              type: "checkbox",
                              checked: !!state.bound[id],
                              disabled: busyS[0] === id,
                              onChange: function () { toggle(group); },
                            }),
                            h("span", {
                              className: "wbv-dot",
                              style: { background: group.color || "var(--wb-accent)" },
                            }),
                            h("span", null, group.name),
                            h(
                              "span",
                              { className: "wbv-muted" },
                              " · " + (group.secretCount || 0) + (en ? " secrets" : " 条凭据"),
                            ),
                          );
                        })
                      : h(Page.EmptyState, {
                          h: h,
                          title: en ? "No credential groups yet" : "还没有凭据分组",
                          hint: en
                            ? "Create one in the vault's Groups page, then come back to link this site."
                            : "先到保险箱「分组与关联」新建分组，再回这里关联本站点。",
                        }),
                  ),
            ),
            h(
              "div",
              { className: "wbv-modal-foot" },
              h(
                "span",
                { className: "wbv-muted wbv-grow" },
                en ? "Mapping is owned by the vault." : "关联由保险箱维护，站点这里只是入口。",
              ),
              h(C.Btn, { h: h, onClick: function () { openS[1](false); } }, en ? "Close" : "关闭"),
            ),
          )
        : null,
    );
  };
};
