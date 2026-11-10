// 统计柱形可点击分桶的行为回归：只有传 onSelect 且数量 > 0 才是按钮，
// 逾期账龄等不传 onSelect 的图表必须保持纯展示（不可聚焦、无点击）。
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { makeCharts } = require("../packages/addons/tasks/client/stats/charts.cjs");

const kids = (node) => {
  const c = node && node.props ? node.props.children : null;
  return c == null ? [] : Array.isArray(c) ? c.flat(Infinity).filter((x) => x != null) : [c];
};
const walk = (n) => (n && typeof n === "object" ? [n, ...kids(n).flatMap(walk)] : []);
const charts = makeCharts("wbt");
const data = [{ key: "3", label: "3", count: 4 }, { key: "9", label: "9", count: 0 }];

function render(props) {
  const hist = charts.Histogram(Object.assign({ data, lang: "zh", color: "#000" }, props));
  return { hist, bars: walk(hist).filter((n) => /(^|\s)wbt-hbar(\s|$)/.test(String(n.props.className || ""))) };
}

// 1) 不传 onSelect：纯展示，任何柱形都不可点击、不可聚焦。
const plain = render({});
assert.equal(plain.hist.props.role, "img");
for (const bar of plain.bars) {
  assert.equal(bar.props.onClick, undefined);
  assert.equal(bar.props.tabIndex, undefined);
  assert.ok(!String(bar.props.className).includes("wbt-hbar-link"));
}

// 2) 传 onSelect：数量 > 0 的桶变成按钮，可点击；0 桶仍然不可点击。
const picked = [];
const picking = render({ onSelect: (bin) => picked.push(bin), selectHint: "点击查看任务" });
assert.equal(picking.hist.props.role, "group");
const four = picking.bars.find((b) => String(b.props.className).includes("wbt-hbar-link"));
assert.ok(four, "数量 4 的柱形应可点击");
assert.equal(four.props.role, "button");
assert.equal(four.props.tabIndex, 0);
assert.equal(picking.bars.filter((b) => String(b.props.className).includes("wbt-hbar-link")).length, 1, "数量 0 的柱形不应可点击");
assert.ok(four.props.title.includes("点击查看任务"));
four.props.onClick();
assert.deepEqual(picked, [data[0]]);

// 3) 键盘 Enter / 空格等价于点击，其它按键不触发；空格必须阻止页面滚动。
picked.length = 0;
const prevent = { count: 0 };
four.props.onKeyDown({ key: "Enter", preventDefault() { prevent.count += 1; } });
four.props.onKeyDown({ key: "a", preventDefault() { prevent.count += 1; } });
assert.deepEqual(picked, [data[0]]);
assert.equal(prevent.count, 1, "Enter 需要阻止默认行为");
assert.equal(picked.length, 1, "其它按键不应触发跳转");
four.props.onKeyDown({ key: " ", preventDefault() { prevent.count += 1; } });
assert.deepEqual(picked, [data[0], data[0]]);
assert.equal(prevent.count, 2);

// 4) 逾期账龄等无 onSelect 的图表：容器仍是 img 语义，不会被键盘选中。
assert.equal(render({ data: [{ key: "1-7", label: "1-7 天", count: 2 }] }).hist.props.role, "img");
console.log("TASK STATS BARS UI PASS", { bars: picking.bars.length });
