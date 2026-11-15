import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const h = React.createElement;
const C = require("../../lib/client-common.cjs")("wbv");

const SecretField = require("../client/ui/secret-field.cjs");
const AskPassphrase = require("../client/ui/ask-passphrase.cjs");

const dir = path.join(process.cwd(), "packages/addons/vault/client");

function render(field, over) {
  return renderToStaticMarkup(
    h(field, Object.assign({
      h,
      C,
      value: "",
      onChange: () => {},
      onToggle: () => {},
      onCancel: () => {},
      onConfirm: () => {},
    }, over || {})),
  );
}

test("明文框默认 password，点击后切 text 且 aria-pressed 同步", () => {
  const hidden = render(SecretField, { value: "s3cret", placeholder: "密码" });
  assert.match(hidden, /type="password"/);
  assert.match(hidden, /aria-pressed="false"/);
  assert.match(hidden, /aria-label="显示明文"/);
  assert.match(hidden, /class="wbv-eye"/);

  const shown = render(SecretField, { show: true, value: "s3cret" });
  assert.match(shown, /type="text"/);
  assert.doesNotMatch(shown, /type="password"/);
  assert.match(shown, /aria-pressed="true"/);
  assert.match(shown, /aria-label="隐藏明文"/);
});

test("明文框的眼睛是 type=button，不会提交表单", () => {
  const html = render(SecretField, { value: "" });
  assert.match(html, /<button[^>]*type="button"/);
});

test("主口令弹层有输入框、取消与确认，且不依赖 window.prompt", () => {
  const html = render(AskPassphrase, {
    title: "查看凭据明文",
    hint: "B 模式需要主口令",
    value: "p",
    busy: false,
  });
  assert.match(html, /type="password"/);
  assert.match(html, /取消/);
  assert.match(html, /确认/);
  const ask = fs.readFileSync(path.join(dir, "ui/ask-passphrase.cjs"), "utf8");
  assert.doesNotMatch(ask, /window\.prompt\(/);
});

test("vault 客户端不再使用 window.prompt（桌面端不支持，会静默失效）", () => {
  const files = [];
  const walk = (d) => {
    for (const name of fs.readdirSync(d)) {
      const full = path.join(d, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".cjs")) files.push(full);
    }
  };
  walk(path.join(dir, "views"));
  walk(path.join(dir, "ui"));
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(src, /window\.prompt\(/, `${path.relative(dir, file)} 仍有 window.prompt`);
  }
});
