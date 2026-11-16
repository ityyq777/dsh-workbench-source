// 储物记录卡片的关键词高亮：命中范围必须与 storage.list 的搜索口径一致
//（名称 / 品牌 / 位置 / 备注），单位与标签名不参与搜索，因此也不高亮。
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { StorageCard } = require("../packages/addons/storage/client/item/card.cjs");

const ITEM = {
  id: "it_1",
  name: "【示例】抽纸",
  brand: "维达 Tissues",
  unit: "包",
  location: "客厅柜子",
  remark: "抽纸快用完了，记得补货",
  stock: 3,
  tags: [{ id: "tag_1", name: "日用品" }],
};

function render(patch = {}, props = {}) {
  const item = Object.assign({}, ITEM, patch);
  return renderToStaticMarkup(
    React.createElement(StorageCard, Object.assign({
      item,
      lang: "zh",
      bodyMode: "text",
      caps: true,
      busy: false,
      date: (ts) => String(ts),
    }, props)),
  );
}

const marks = (html) => (html.match(/<mark class="wbi-hit">([^<]*)<\/mark>/g) || []).map((m) => m.replace(/<[^>]+>/g, ""));

// 1) 名称命中：标题里的关键词被 mark 包住。
{
  const html = render({}, { keyword: "抽纸" });
  assert.deepEqual(marks(html), ["抽纸", "抽纸"], "名称与备注各命中一次：" + marks(html).join("|"));
  assert.match(html, /<h3>[^<]*<mark class="wbi-hit">抽纸<\/mark>/, "标题内联高亮");
}

// 2) 品牌命中：只高亮品牌值，名称里的同词不亮（名称里没有维达）。
{
  const html = render({ name: "抽纸" }, { keyword: "维达" });
  assert.deepEqual(marks(html), ["维达"], "只命中品牌");
  assert.match(html, /品牌：<mark class="wbi-hit">维达<\/mark>/, "品牌值与标签文案分开渲染");
}

// 3) 位置命中。
{
  const html = render({}, { keyword: "客厅" });
  assert.deepEqual(marks(html), ["客厅"], "只命中位置");
  assert.match(html, /位置：<mark class="wbi-hit">客厅<\/mark>/);
}

// 4) 大小写：ASCII 折叠与 SQLite instr(lower()) 一致（Tissues ← tissues）。
{
  const html = render({}, { keyword: "tissues" });
  assert.deepEqual(marks(html), ["Tissues"], "大小写不敏感但保留原文大小写");
}

// 5) 单位与标签名不参与搜索，不应出现 mark。
{
  const html = render({}, { keyword: "包" });
  assert.equal(html.includes("<mark"), false, "单位不应高亮：" + marks(html).join("|"));
  const tagged = render({}, { keyword: "日用品" });
  assert.equal(tagged.includes("<mark"), false, "标签名不应高亮");
}

// 6) 备注命中（纯文本模式）：高亮落在说明区。
{
  const html = render({ name: "纸巾", brand: "", location: "", remark: "抽纸快用完了" }, { keyword: "抽纸" });
  assert.deepEqual(marks(html), ["抽纸"], "只命中备注");
  assert.match(html, /wb-desc-text[\s\S]*<mark class="wbi-hit">抽纸<\/mark>/, "备注正文高亮");
}

// 7) 清空关键词后没有任何 mark，卡片恢复原样。
{
  const html = render({}, { keyword: "" });
  assert.equal(html.includes("<mark"), false, "无关键词不高亮");
  const blank = render({}, { keyword: "   " });
  assert.equal(blank.includes("<mark"), false, "空白关键词按空处理");
}

// 8) 备注走 markdown 模式时同样高亮（共享 Description 透传 Highlight）。
{
  const html = renderToStaticMarkup(React.createElement(StorageCard, {
    item: Object.assign({}, ITEM, { name: "纸巾", brand: "", location: "", remark: "补货 **抽纸**" }),
    lang: "zh", bodyMode: "markdown", caps: true, busy: false, date: String, keyword: "抽纸",
  }));
  assert.ok(marks(html).includes("抽纸"), "markdown 模式也应高亮：" + marks(html).join("|"));
}

console.log("STORAGE HIGHLIGHT PASS: 名称/品牌/位置/备注命中高亮，单位与标签不高亮，清空即消失");
