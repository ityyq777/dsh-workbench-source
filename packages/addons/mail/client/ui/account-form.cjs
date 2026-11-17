"use strict";
/**
 * 账户表单：服务商选择 → 自动填主机 → 授权码内联 → 保存前自检 → 落库。
 *
 * 保存顺序按设计文档第 7 节：先 vault.secretCreate 拿到 secretId，再 mail.accountCreate；
 * 后者失败就回滚刚建的 secret，避免保险箱里留下没人引用的孤儿凭据。
 */
var util = require("./provider-util.cjs");
var VaultGate = require("./vault-gate.cjs");
var probe = require("../../lib/domain/probe-error.js");

function t(lang, zh, en) {
  return lang === "en" ? en : zh;
}

module.exports = function AccountForm(props) {
  var h = props.h;
  var React = props.React;
  var C = props.C;
  var api = props.api;
  var lang = props.lang;
  var SecretField = props.SecretField;
  var providers = props.providers || { providers: [] };
  var editing = props.account || null;
  var S = React.useState;

  function initial() {
    var base = util.presetFor(providers, "qq", "") || {
      provider: "qq",
      imapHost: "",
      imapPort: 993,
      imapTls: true,
      smtpHost: "",
      smtpPort: 465,
      smtpTls: true,
      username: "",
    };
    base.email = "";
    base.name = "";
    base.password = "";
    base.secretId = "";
    base.advanced = false;
    if (!editing) return base;
    return Object.assign(base, {
      provider: util.detect(providers, editing.email) ? util.detect(providers, editing.email).id : "other",
      email: editing.email || "",
      name: editing.name || "",
      username: editing.username || editing.email || "",
      imapHost: editing.imapHost || "",
      imapPort: editing.imapPort || 993,
      imapTls: editing.imapTls !== false,
      smtpHost: editing.smtpHost || "",
      smtpPort: editing.smtpPort || 465,
      smtpTls: editing.smtpTls !== false,
      secretId: editing.secretId || "",
      advanced: true,
    });
  }

  var fs = S(initial);
  var f = fs[0];
  var setF = fs[1];
  var touchedS = S(!!editing);
  var vaultS = S("loading");
  var passS = S("");
  var pass2S = S("");
  var showS = S({ pass: false, pass2: false, secret: false });
  var vaultErrS = S("");
  var afterS = S("");
  var probeS = S(null);
  var busyS = S({ save: false, probe: false, vault: false });
  var errS = S("");
  var noticeS = S("");

  var vault = vaultS[0];
  var busy = busyS[0];

  function upd(patch) {
    setF(function (prev) {
      return Object.assign({}, prev, patch);
    });
  }
  function setBusy(key, on) {
    setBusyState(function (prev) {
      var next = Object.assign({}, prev);
      next[key] = on;
      return next;
    });
  }
  var setBusyState = busyS[1];

  function setProbe(value) {
    probeS[1](value);
  }
  function setErr(value) {
    errS[1](value);
  }
  function setNotice(value) {
    noticeS[1](value);
  }

  function checkVault() {
    return C.call(api, "vault.status")
      .then(function (r) {
        var state = !r || !r.initialized ? "init" : r.locked ? "locked" : "ready";
        vaultS[1](state);
        return state;
      })
      .catch(function () {
        vaultS[1]("missing");
        return "missing";
      });
  }

  React.useEffect(function () {
    checkVault();
  }, []);

  function applyPreset(id, email) {
    var p = util.presetFor(providers, id, email);
    if (!p) return;
    upd({ provider: id, imapHost: p.imapHost, imapPort: p.imapPort, imapTls: p.imapTls, smtpHost: p.smtpHost, smtpPort: p.smtpPort, smtpTls: p.smtpTls, username: p.username, advanced: id === "other" });
  }

  function onPick(id) {
    touchedS[1](true);
    setProbe(null);
    applyPreset(id, f.email);
  }

  function onEmailBlur() {
    if (touchedS[0] || !f.email) return;
    var hit = util.detect(providers, f.email);
    if (hit) {
      if (hit.id !== f.provider) applyPreset(hit.id, f.email);
      else upd({ username: f.username || f.email });
    } else {
      upd({ provider: "other", advanced: true, username: f.username || f.email });
    }
  }

  function validate() {
    if (!/^\S+@\S+\.\S+$/.test(String(f.email || "").trim())) return t(lang, "请填写正确的邮箱地址", "Enter a valid email address");
    if (!String(f.name || "").trim()) return t(lang, "请填写账户名称", "Enter an account name");
    if (!String(f.imapHost || "").trim()) return t(lang, "请填写 IMAP 服务器", "Enter the IMAP server");
    if (!String(f.username || "").trim()) return t(lang, "请填写登录名", "Enter the login name");
    if (!editing || f.password) {
      if (!f.password && !f.secretId) return t(lang, "请填写授权码 / 应用密码", "Enter the app password");
    }
    var ports = [f.imapPort, f.smtpPort];
    for (var i = 0; i < ports.length; i += 1) {
      var n = Number(ports[i]);
      if (!(n >= 1 && n <= 65535)) return t(lang, "端口需在 1–65535 之间", "Port must be between 1 and 65535");
    }
    return "";
  }

  function secretName() {
    return "mail:" + String(f.email || "").trim();
  }

  function createSecret() {
    var args = { name: secretName(), kind: "app_password", secret: f.password, meta: { username: f.username, url: "mailto:" + f.email } };
    return C.call(api, "vault.secretCreate", args).catch(function (e) {
      if (String(C.errText(e)).indexOf("同名") < 0) throw e;
      args.name = secretName() + ":" + Date.now().toString(36);
      return C.call(api, "vault.secretCreate", args);
    });
  }

  function persist() {
    setErr("");
    setBusy("save", true);
    var createdId = "";
    var secretId = f.secretId;
    var step = Promise.resolve();
    if (f.password) {
      step = editing
        ? C.call(api, "vault.secretUpdate", { id: editing.secretId, secret: f.password }).then(function () {
            secretId = editing.secretId;
          })
        : createSecret().then(function (r) {
            createdId = r && r.id ? r.id : "";
            secretId = createdId;
          });
    }
    var payload = {
      name: String(f.name || "").trim(),
      email: String(f.email || "").trim(),
      imapHost: String(f.imapHost || "").trim(),
      imapPort: Number(f.imapPort),
      imapTls: !!f.imapTls,
      smtpHost: String(f.smtpHost || "").trim(),
      smtpPort: Number(f.smtpPort),
      smtpTls: !!f.smtpTls,
      username: String(f.username || "").trim() || String(f.email || "").trim(),
      secretId: secretId,
    };
    step
      .then(function () {
        if (editing) return C.call(api, "mail.accountUpdate", Object.assign({ id: editing.id }, payload));
        return C.call(api, "mail.accountCreate", payload);
      })
      .then(function () {
        setBusy("save", false);
        setNotice(t(lang, "已保存", "Saved"));
        if (props.onSaved) props.onSaved();
      })
      .catch(function (e) {
        var rollback = createdId ? C.call(api, "vault.secretDelete", { id: createdId }).catch(function () {}) : Promise.resolve();
        rollback.then(function () {
          setBusy("save", false);
          setErr(C.errText(e));
        });
      });
  }

  function submit() {
    var msg = validate();
    if (msg) {
      setErr(msg);
      return;
    }
    setErr("");
    if (vault !== "ready") {
      afterS[1]("save");
      setNotice("");
      if (vault === "loading") checkVault();
      return;
    }
    persist();
  }

  function onVaultSubmit() {
    var p = passS[0];
    if (!p) {
      vaultErrS[1](t(lang, "请输入主口令", "Enter the master password"));
      return;
    }
    if (vault === "init" && p !== pass2S[0]) {
      vaultErrS[1](t(lang, "两次输入的主口令不一致", "The two passwords do not match"));
      return;
    }
    vaultErrS[1]("");
    setBusy("vault", true);
    var call = vault === "init" ? C.call(api, "vault.setup", { passphrase: p, mode: "A" }) : C.call(api, "vault.unlock", { passphrase: p });
    call
      .then(function () {
        setBusy("vault", false);
        passS[1]("");
        pass2S[1]("");
        vaultS[1]("ready");
        if (afterS[0] === "save") {
          afterS[1]("");
          persist();
        }
      })
      .catch(function (e) {
        setBusy("vault", false);
        vaultErrS[1](C.errText(e));
      });
  }

  function runProbe() {
    var msg = validate();
    if (msg) {
      setErr(msg);
      return;
    }
    setErr("");
    setBusy("probe", true);
    C.call(api, "mail.accountProbe", {
      email: f.email,
      username: f.username,
      imapHost: f.imapHost,
      imapPort: Number(f.imapPort),
      imapTls: !!f.imapTls,
      smtpHost: f.smtpHost,
      smtpPort: Number(f.smtpPort),
      smtpTls: !!f.smtpTls,
      password: f.password || "",
      secretId: f.password ? "" : f.secretId,
    })
      .then(function (r) {
        setBusy("probe", false);
        setProbe(r);
      })
      .catch(function (e) {
        setBusy("probe", false);
        setErr(C.errText(e));
      });
  }

  function field(label, input, hint) {
    return h(C.Field, { h: h, label: label, hint: hint }, input);
  }
  function textInput(key, opts) {
    var o = opts || {};
    return h("input", {
      className: "wbml-input",
      type: o.type || "text",
      value: f[key],
      placeholder: o.placeholder || "",
      autoComplete: o.autoComplete || "off",
      onChange: function (e) {
        upd(key === "imapPort" || key === "smtpPort" ? { [key]: e.target.value } : { [key]: e.target.value });
      },
    });
  }
  function tlsRow(key, label) {
    return h(
      "label",
      { className: "wbml-check" },
      h("input", {
        type: "checkbox",
        checked: !!f[key],
        onChange: function (e) {
          upd({ [key]: e.target.checked });
        },
      }),
      h("span", null, label),
    );
  }

  var provider = util.providerById(providers, f.provider);
  var probeText = "";
  if (probeS[0]) {
    var r = probeS[0];
    if (r.ok) probeText = t(lang, "自检通过：IMAP 登录成功" + (r.imap ? "，列出 " + r.imap.mailboxes + " 个文件夹" : "") + (r.smtp ? "；SMTP 认证成功" : ""), "Check passed: IMAP login succeeded" + (r.smtp ? " and SMTP authenticated" : ""));
    else {
      var cls = r.errorClass || "unknown";
      var tx = probe.ERROR_TEXT[cls] || probe.ERROR_TEXT.unknown;
      probeText = (lang === "en" ? tx.en : tx.zh) + " " + t(lang, "（" + cls + "）", "(" + cls + ")");
    }
  }

  return h(
    "div",
    { className: "wbml-acct-form" },
    h(
      "div",
      { className: "wbml-acct-head" },
      h("strong", null, editing ? t(lang, "编辑账户", "Edit account") : t(lang, "新增账户", "New account")),
      h("button", { type: "button", className: "wbml-icon-btn", onClick: props.onCancel, title: t(lang, "关闭", "Close") }, "×"),
    ),
    h(require("./provider-chips.cjs"), { h: h, lang: lang, providers: providers, value: f.provider, onPick: onPick }),
    h("div", { className: "wbml-acct-grid" },
      field(t(lang, "邮箱地址", "Email address"), h("input", {
        className: "wbml-input", type: "email", value: f.email, placeholder: "you@example.com", autoComplete: "off",
        onChange: function (e) { upd({ email: e.target.value }); },
        onBlur: onEmailBlur,
      })),
      field(t(lang, "账户名称", "Account name"), textInput("name", { placeholder: t(lang, "例如 工作邮箱", "e.g. Work mail") })),
    ),
    field(
      editing ? t(lang, "新授权码（留空则不修改）", "New app password (leave empty to keep)") : t(lang, "授权码 / 应用密码", "App password"),
      h(SecretField, {
        h: h,
        value: f.password,
        onChange: function (v) { upd({ password: v }); },
        show: showS[0].secret,
        onToggle: function () { showS[1](Object.assign({}, showS[0], { secret: !showS[0].secret })); },
        autoComplete: editing ? "new-password" : "off",
        showLabel: t(lang, "显示明文", "Show plain text"),
        hideLabel: t(lang, "隐藏明文", "Hide plain text"),
      }),
      t(lang, "密码只存进保险箱，不会写进账户表。", "Passwords go to the vault, never into the account row."),
    ),
    provider && util.hintOf(provider, lang) ? h("p", { className: "wbml-hint-line" }, util.hintOf(provider, lang)) : null,
    !f.advanced && f.imapHost
      ? h("p", { className: "wbml-hint-line" }, "IMAP " + f.imapHost + ":" + f.imapPort + (f.imapTls ? " TLS" : "") + " · SMTP " + (f.smtpHost || "—") + ":" + f.smtpPort + (f.smtpTls ? " TLS" : " STARTTLS"))
      : null,
    !f.advanced
      ? h("button", { type: "button", className: "wbml-btn", onClick: function () { upd({ advanced: true }); } }, t(lang, "其他设置（主机 / 端口 / 登录名）", "Advanced (hosts / ports / login name)"))
      : h("div", { className: "wbml-acct-grid" },
          field(t(lang, "登录名", "Login name"), textInput("username", { placeholder: t(lang, "默认与邮箱相同", "Defaults to the email") })),
          field(t(lang, "IMAP 服务器", "IMAP server"), textInput("imapHost")),
          field(t(lang, "IMAP 端口", "IMAP port"), textInput("imapPort", { type: "number" })),
          field("", tlsRow("imapTls", t(lang, "IMAP 隐式 TLS", "IMAP implicit TLS"))),
          field(t(lang, "SMTP 服务器", "SMTP server"), textInput("smtpHost")),
          field(t(lang, "SMTP 端口", "SMTP port"), textInput("smtpPort", { type: "number" })),
          field("", tlsRow("smtpTls", t(lang, "SMTP 隐式 TLS（关掉走 STARTTLS）", "SMTP implicit TLS (off = STARTTLS)"))),
        ),
    vault === "missing"
      ? field(t(lang, "已有凭据 id（secretId）", "Existing credential id (secretId)"), textInput("secretId"))
      : null,
    h(VaultGate, {
      h: h, C: C, lang: lang, SecretField: SecretField, vault: vault,
      pass: passS[0], pass2: pass2S[0],
      showPass: showS[0].pass, showPass2: showS[0].pass2,
      onPass: function (v) { passS[1](v); },
      onPass2: function (v) { pass2S[1](v); },
      onTogglePass: function () { showS[1](Object.assign({}, showS[0], { pass: !showS[0].pass })); },
      onTogglePass2: function () { showS[1](Object.assign({}, showS[0], { pass2: !showS[0].pass2 })); },
      onSubmit: onVaultSubmit,
      busy: busy.vault,
      error: vaultErrS[0],
      onSkip: function () { vaultS[1]("missing"); },
    }),
    probeS[0] ? h(C.Notice, { h: h, text: probeText, kind: probeS[0].ok ? "ok" : "warn" }) : null,
    errS[0] ? h(C.Notice, { h: h, text: errS[0], kind: "warn" }) : null,
    noticeS[0] ? h(C.Notice, { h: h, text: noticeS[0], kind: "ok" }) : null,
    h(
      "div",
      { className: "wbml-acct-foot" },
      h(C.Btn, { h: h, onClick: runProbe, disabled: busy.probe || busy.save }, busy.probe ? t(lang, "自检中…", "Checking…") : t(lang, "保存前自检", "Check connection")),
      h(C.Btn, { h: h, kind: "primary", onClick: submit, disabled: busy.save }, busy.save ? t(lang, "保存中…", "Saving…") : t(lang, "保存", "Save")),
      h(C.Btn, { h: h, onClick: props.onCancel }, t(lang, "取消", "Cancel")),
    ),
  );
};
