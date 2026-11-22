/**
 * 宿主「数据」「配置」两页的渲染冒烟测试。
 *
 * 背景：`createDataView()` 返回的是 `{ DataView, DOMAIN }`，不是组件本身；
 * 直接把它塞进 jsx 会触发 React #130（元素类型是对象），整个工作台白屏。
 * 这里用假 jsx 把两页的元素树搭出来，断言每个节点的 type 都是字符串或函数。
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const HostPages = require("../packages/shell/client/host-pages.cjs");

const jsx = {
  jsx: (type, props, key) => ({ type, props: props || {}, key }),
  jsxs: (type, props, key) => ({ type, props: props || {}, key }),
};

function reactStub() {
  return {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}],
    useEffect: () => {},
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useRef: (v) => ({ current: v }),
    Fragment: "Fragment",
  };
}

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit);
    return;
  }
  visit(node);
  const children = node.props && node.props.children !== undefined ? node.props.children : node.children;
  walk(children, visit);
}

function assertRenderable(tree, pageName) {
  let count = 0;
  walk(tree, (node) => {
    if (node.type === undefined) return;
    count += 1;
    assert.ok(
      typeof node.type === "string" || typeof node.type === "function",
      pageName + " 出现无法渲染的元素类型（" + typeof node.type + "）：" + String(node.type),
    );
  });
  assert.ok(count > 3, pageName + " 应该渲染出元素树，实际仅 " + count + " 个节点");
}

const deps = {
  jsx,
  React: reactStub(),
  api: { post: async () => ({ ok: true, result: {} }) },
  lang: "zh",
  t: (key) => key,
  head: (title, desc) => jsx.jsx("div", { className: "wb-page-head" }, title + (desc || "")),
};

assertRenderable(HostPages.dataPage(deps), "数据页");

// 配置页会调用宿主 action，这里只关心元素树是否可渲染；effect 不执行请求。
assertRenderable(HostPages.configPage(deps), "配置页");

console.log("HOST PAGES TEST PASS：数据页与配置页元素树均可渲染");
