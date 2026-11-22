/**
 * 站点关联的凭据分组：只读弹窗。
 *
 * 映射表由凭据保险箱维护（vault_binding），站点侧只调 sites.vaultGroups 查询；
 * 绑定/解绑在保险箱页的分组里操作，这里不提供写入口。
 */
module.exports = function createVaultGroupsModal(deps) {
  var h = deps.h;
  var React = deps.React;
  var useState = deps.useState;
  var useEffect = deps.useEffect;
  var Modal = deps.Modal;
  var Icon = deps.Icon;
  var text = deps.text;
  var callApi = deps.callApi;
  var errText = deps.errText;

  function VaultGroupsModal(props) {
    var api = props.api;
    var lang = props.lang || "zh";
    var site = props.site;
    var [state, setState] = useState({ loading: true, installed: true, items: [], error: "" });

    useEffect(function () {
      var alive = true;
      callApi(api, "sites.vaultGroups", { siteId: site.id }).then(function (r) {
        if (!alive) return;
        setState({ loading: false, installed: r && r.installed !== false, items: (r && r.items) || [], error: "" });
      }).catch(function (e) {
        if (!alive) return;
        setState({ loading: false, installed: true, items: [], error: errText(e) });
      });
      return function () { alive = false; };
    }, [site.id]);

    return h(Modal, { "aria-label": text(lang, "vaultGroupsTitle", { name: site.siteName || site.id }), onClose: props.onClose },
      h("div", { className: "wbs-modal-title" },
        h(Icon, { name: "key", size: 15 }),
        text(lang, "vaultGroupsTitle", { name: site.siteName || site.id }),
        h("button", { type: "button", className: "wbs-mini wbs-modal-x", title: text(lang, "cancel"), onClick: props.onClose }, h(Icon, { name: "x", size: 15 })),
      ),
      h("div", { className: "wbs-modal-sub" }, text(lang, "vaultGroupsSub")),
      state.error ? h("div", { className: "wbs-error" }, state.error) : null,
      state.loading
        ? h("div", { className: "wbs-muted" }, text(lang, "loading"))
        : !state.installed
          ? h("div", { className: "wbs-muted" }, text(lang, "vaultGroupsNoVault"))
          : !state.items.length
            ? h("div", { className: "wbs-muted" }, text(lang, "vaultGroupsEmpty"))
            : h("table", { className: "wbs-subtable" },
              h("thead", null, h("tr", null,
                h("th", null, text(lang, "groupName")),
                h("th", null, text(lang, "groupSecrets")),
              )),
              h("tbody", null, state.items.map(function (g) {
                return h("tr", { key: g.id },
                  h("td", null, g.name || g.id),
                  h("td", { className: "wbs-muted" }, String(g.secretCount || 0)),
                );
              })),
            ),
      h("div", { className: "wbs-formfoot" },
        h("div", { className: "wbs-grow" }, h("span", { className: "wbs-muted" }, text(lang, "vaultGroupsHint"))),
        h("button", { className: "wbs-btn", onClick: props.onClose }, text(lang, "close")),
      ),
    );
  }

  return VaultGroupsModal;
};
