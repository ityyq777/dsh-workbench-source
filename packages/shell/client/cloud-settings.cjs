// 云端类型设置卡：私人云端（服务端地址 + 访问密钥）与共享云端（账号登录）的入口。
// 保存后由宿主写入 cloud-config.json 并重建同步凭据，切换类型会清空本机同步游标。
module.exports = function createCloudSettings(react, jsx) {
  var MODES = ["none", "private", "shared"];

  function CloudSettings(props) {
    var t = props.t;
    var api = props.api;
    var st = react.useState(null); var cfg = st[0]; var setCfg = st[1];
    var st2 = react.useState(""); var draftMode = st2[0]; var setDraftMode = st2[1];
    var st3 = react.useState({ url: "", secret: "", deviceName: "" }); var form = st3[0]; var setForm = st3[1];
    var st4 = react.useState(false); var saving = st4[0]; var setSaving = st4[1];
    var st5 = react.useState(false); var testing = st5[0]; var setTesting = st5[1];
    var st6 = react.useState(""); var msg = st6[0]; var setMsg = st6[1];
    var st7 = react.useState(null); var probe = st7[0]; var setProbe = st7[1];

    function load() {
      api.get("/cloud/config").then(function (r) {
        if (!r || !r.ok) return;
        setCfg(r);
        setDraftMode(r.mode || "shared");
        if (props.onModeChange) props.onModeChange(r.mode || "shared");
        setForm({
          url: (r.private && r.private.url) || "",
          secret: "",
          deviceName: (r.private && r.private.device_name) || "",
        });
      });
    }
    react.useEffect(function () { load(); }, []);

    function save() {
      setSaving(true);
      setMsg("");
      var body = { mode: draftMode };
      if (draftMode === "private") {
        body.private = { url: form.url, secret: form.secret, deviceName: form.deviceName };
      }
      api.post("/cloud/config", body).then(function (r) {
        setSaving(false);
        if (!r || !r.ok) {
          setMsg((r && r.error) || t("cloud_save_failed"));
          return;
        }
        setCfg(r);
        setDraftMode(r.mode || draftMode);
        if (props.onModeChange) props.onModeChange(r.mode || draftMode);
        setForm({
          url: (r.private && r.private.url) || "",
          secret: "",
          deviceName: (r.private && r.private.device_name) || "",
        });
        setMsg(t("cloud_saved"));
        if (props.onChanged) props.onChanged();
      });
    }

    // 探测设置卡里当前的草稿值（还没保存也能先测连通性）。
    function test() {
      setTesting(true);
      setProbe(null);
      setMsg("");
      var probeMode = draftMode || (cfg && cfg.mode) || "shared";
      var body = { mode: probeMode };
      if (probeMode === "private") body.private = { url: form.url, secret: form.secret, deviceName: form.deviceName };
      api.post("/cloud/test", body).then(function (r) {
        setTesting(false);
        setProbe(r || { reachable: false });
      });
    }

    var mode = draftMode || (cfg && cfg.mode) || "shared";
    var hasSecret = Boolean(cfg && cfg.private && cfg.private.has_secret);
    var hintKey = "cloud_mode_" + mode + "_hint";

    return jsx.jsxs("div", { className: "wb-card", children: [
      jsx.jsxs("div", { className: "wb-sec", children: [
        jsx.jsx("h3", { children: t("cloud_settings") }),
        jsx.jsx("span", { className: "wb-hint", children: t("cloud_switch_hint") }),
      ] }),
      jsx.jsx("div", { className: "wb-tabs", children: MODES.map(function (m) {
        return jsx.jsx("button", {
          key: m,
          className: "wb-tab" + (mode === m ? " on" : ""),
          onClick: function () { setDraftMode(m); setMsg(""); if (props.onModeChange) props.onModeChange(m); },
          children: t("cloud_mode_" + m),
        }, m);
      }) }),
      jsx.jsx("div", { className: "wb-hint", style: { marginTop: 6 }, children: t(hintKey) }),
      mode === "private" ? jsx.jsxs("div", { className: "wb-form", style: { marginTop: 10 }, children: [
        jsx.jsx("input", {
          className: "wb-input",
          placeholder: t("cloud_url_ph"),
          value: form.url,
          onChange: function (e) { setForm(Object.assign({}, form, { url: e.target.value })); },
        }),
        jsx.jsx("input", {
          className: "wb-input",
          type: "password",
          placeholder: hasSecret ? t("cloud_secret_keep") : t("cloud_secret_ph"),
          value: form.secret,
          onChange: function (e) { setForm(Object.assign({}, form, { secret: e.target.value })); },
        }),
        jsx.jsx("input", {
          className: "wb-input",
          placeholder: t("cloud_device_label"),
          value: form.deviceName,
          onChange: function (e) { setForm(Object.assign({}, form, { deviceName: e.target.value })); },
        }),
      ] }) : null,
      mode === "shared" ? jsx.jsx("div", { className: "wb-hint", style: { marginTop: 8 }, children: t("cloud_shared_hint") }) : null,
      jsx.jsxs("div", { className: "wb-form", style: { marginTop: 10 }, children: [
        jsx.jsx("button", { className: "wb-btn", disabled: saving, onClick: save, children: saving ? t("cloud_saving") : t("cloud_save") }),
        jsx.jsx("button", { className: "wb-btn ghost", disabled: testing, onClick: test, children: testing ? t("cloud_testing") : t("cloud_test") }),
      ] }),
      msg ? jsx.jsx("div", { className: "wb-msg", style: { marginTop: 8 }, children: msg }) : null,
      probe ? jsx.jsxs("div", { className: "wb-hint", style: { marginTop: 8 }, children: [
        probe.reachable
          ? jsx.jsxs("div", { children: [
              t("cloud_ok"),
              probe.server_name ? " · " + t("cloud_server") + " " + probe.server_name : "",
              " · " + (probe.latency_ms != null ? probe.latency_ms + "ms" : ""),
            ] })
          : jsx.jsx("div", { children: t("cloud_test_fail") + (probe.error ? " · " + probe.error : "") }),
        probe.reachable
          ? jsx.jsx("div", { children: probe.unauthorized
              ? t("cloud_auth_bad")
              : probe.authorized
                ? t("cloud_auth_ok") + (probe.devices && probe.devices.length ? " · " + t("cloud_devices_count") + " " + probe.devices.length : "")
                : t("cloud_auth_bad") })
          : null,
      ] }) : null,
    ] });
  }

  return { CloudSettings: CloudSettings };
};
