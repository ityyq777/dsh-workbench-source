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
const SecretsView = require("../client/views/secrets.cjs");

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

test("备注合并：新数据读 note，旧数据回退「用户名 · URL」", () => {
  const noteOf = SecretsView.noteOf;
  assert.equal(noteOf({ username: "neo", url: "https://a.b" }), "neo · https://a.b");
  assert.equal(noteOf({ note: "工作邮箱", username: "neo" }), "工作邮箱");
  assert.equal(noteOf({}), "");
  assert.equal(noteOf(null), "");
});

test("保存路径只写 meta.note，不再写 username/url", () => {
  const src = fs.readFileSync(path.join(dir, "views/secrets.cjs"), "utf8");
  assert.doesNotMatch(src, /username:\s*f\.username/);
  assert.doesNotMatch(src, /url:\s*f\.url/);
  assert.match(src, /meta\.note = note/);
  assert.match(src, /label: "备注"/);
  assert.doesNotMatch(src, /备注用户名|备注 URL/);
});

test("分组页：建组走弹窗，顶部不再有内联建组表单", () => {
  const src = fs.readFileSync(path.join(dir, "views/groups.cjs"), "utf8");
  assert.doesNotMatch(src, /新分组名称/);
  assert.doesNotMatch(src, /wbv-card wbv-row/);
  assert.match(src, /className: "wbv-modal-box"/);
  assert.match(src, /label: "集合（可多选）"/);
  assert.match(src, /kind: "primary", onClick: openCreate/);
});

test("分组页：集合选择器复用共享清单，搜索走后端、本地每页 20 条", () => {
  const src = fs.readFileSync(path.join(dir, "views/groups.cjs"), "utf8");
  assert.match(src, /require\("\.\.\/\.\.\/\.\.\/lib\/filter-checklist\.cjs"\)/);
  assert.match(src, /h\(FilterChecklist, \{/);
  assert.match(src, /title: "全部集合"/);
  assert.match(src, /searchPlaceholder: "搜索集合名称或描述"/);
  assert.match(src, /"vault\.setList", pickQ \? \{ q: pickQ \} : \{\}/);
  assert.match(src, /var PICK_PAGE = 20;/);
  assert.match(src, /slice\(0, pickS\[0\]\.page \* PICK_PAGE\)/);
  assert.match(src, /onClear: pickClear/);
  // 已选跨搜索保留：搜索与页码只动 pickS，不重置 createS.setIds
  assert.match(src, /function pickQuery\(v\)/);
  assert.doesNotMatch(src, /pickQuery[\s\S]{0,200}setIds: \[\]/);
});

test("分组页：创建时先 groupCreate 再逐个 groupAttachSet，Esc 可关、创建中不可关", () => {
  const src = fs.readFileSync(path.join(dir, "views/groups.cjs"), "utf8");
  assert.match(src, /vault\.groupCreate/);
  assert.match(src, /vault\.groupAttachSet/);
  assert.match(src, /e\.key === "Escape"/);
  assert.match(src, /if \(createS\[0\] && createS\[0\]\.busy\) return;/);
  assert.match(src, /个集合挂载失败/);
});
