import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import { createReact } from "../../../scripts/data-ui-harness.mjs";

const dir = dirname(fileURLToPath(import.meta.url));
const bundle = process.argv.includes("--bundle");
function setup(lang) {
  const rt = createReact();
  const { React } = rt;
  // Network lifecycle belongs to native tests; this test exercises real registered UI trees.
  React.useEffect = () => {};
  React.useLayoutEffect = () => {};
  // This flat hook harness cannot reconcile sibling component hook ownership.
  // Outlet lifecycle has dedicated recent-ui tests; icon tests need only its active child.
  const createElement = React.createElement;
  React.createElement = (type, props, ...children) => props?.view && props?.viewProps
    ? createElement(props.view.component, props.viewProps)
    : createElement(type, props, ...children);
  const jsx = (type, props, key) => React.createElement(type, { ...props, key },
    ...[].concat(props?.children ?? []));
  const sandbox = createContext({ console, Map, Set, URLSearchParams,
    document: { documentElement: { lang }, getElementById: () => true },
  });
  sandbox.window = sandbox;
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    runInContext("(function(require,module,exports){\n" + readFileSync(file, "utf8") + "\n})", sandbox)(req(file), module, module.exports);
    return module.exports;
  }
  function req(file) {
    return (name) => name === "react" ? React : name === "react/jsx-runtime" ? { jsx, jsxs: jsx }
      : name.startsWith("./") ? load(resolve(dirname(file), name))
      : (() => { throw new Error("Unexpected runtime dependency: " + name); })();
  }
  let mod;
  if (bundle) {
    runInContext(readFileSync(resolve(dir, "client.js"), "utf8"), sandbox);
    mod = sandbox.__ModuleLoader__.modules["dsh-workbench"](req(resolve(dir, "client.js")));
  } else mod = load(resolve(dir, "client.src.cjs"));
  let main;
  mod.apply({ effect: fn => fn(), locale: { register() {}, bind: () => k => k },
    slots: { inject: (_, fn) => fn(), register: (meta, render) => { if (meta.name === "main") main = render; } } });
  const host = sandbox.__WB_HOST__;
  const render = () => rt.mount(main, {});
  return { React, host, render };
}
function nodes(tree, predicate) {
  const found = [];
  function walk(n) {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!n || typeof n !== "object") return;
    if (predicate(n)) found.push(n);
    walk(n.children);
  }
  walk(tree);
  return found;
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  if (node == null || typeof node === "boolean") return "";
  return typeof node === "object" ? text(node.children) : String(node);
}
for (const lang of ["zh", "en"]) {
  const { React, host, render } = setup(lang);
  const h = React.createElement;
  const received = [];
  function Icon(props) {
    received.push(props);
    return h("svg", { width: props.size, height: props.size, strokeWidth: props.strokeWidth,
      "aria-hidden": props["aria-hidden"], viewBox: "0 0 24 24" }, h("path", { d: "M3 3h18v18H3z" }));
  }
  const invalid = [undefined, null, "Box", "<svg onload=alert(1)>", 42, true, {}, { render() { throw new Error("must not execute"); } }];
  const views = [{ id: "stats", title: { zh: "概览", en: "Overview" }, icon: Icon },
    ...invalid.map((icon, i) => ({ id: "plain" + i, title: "Plain " + i, icon })),
    { id: "fallback", title: "", icon: false }].map(v => ({ ...v, component: () => h("section", { "data-view": v.id }, v.id) }));
  host.addons.push({ id: "fixture", enabled: true, title: "Fixture", views: [] });
  host.registerAddon({ id: "fixture", views });
  let tree = render();
  nodes(tree, n => n.type === "button" && n.props.className === "wb-home-card")[0].props.onClick();
  tree = render();
  let tabs = nodes(tree, n => n.type === "button" && n.props.className?.startsWith("wb-tab"));
  assert.equal(tabs.length, views.length);
  assert.equal(text(tabs[0]), lang === "zh" ? "概览" : "Overview");
  assert.equal(tabs[0].props["aria-label"], text(tabs[0]));
  assert.equal(nodes(tabs[0], n => n.type === "svg").length, 1);
  assert.equal(nodes(tabs[0], n => n.type === "path").length, 1, "icon component actually renders its SVG children");
  assert.equal(received.at(-1).size, 14);
  assert.equal(received.at(-1).strokeWidth, 2);
  assert.equal(received.at(-1)["aria-hidden"], true);
  assert.equal(nodes(tabs[0], n => n.type === "span")[0].props["aria-hidden"], true);
  assert.equal(text(tabs.at(-1)), "fallback");
  tabs.slice(1).forEach((tab, i) => {
    assert.equal(nodes(tab, n => n.type === "svg").length, 0);
    assert.equal(tab.props["aria-label"], text(tab));
    tab.props.onClick();
    const next = render();
    assert.equal(nodes(next, n => n.type === "section")[0].props["data-view"], views[i + 1].id);
    assert.equal(nodes(next, n => n.props.className === "wb-tab on")[0].props["aria-label"], text(tab));
  });
  host.registerAddon({ id: "fixture", views: [views[0]] });
  assert.equal(nodes(render(), n => n.props.className === "wb-page-tabs").length, 0, "single view retains hidden tab bar");
  host.registerAddon({ id: "fixture", views: [] });
  host.addons[0].views = [{ id: "legacy1", title: "Legacy 1" }, { id: "legacy2", title: "Legacy 2", icon: "unknown" }];
  tree = render();
  tabs = nodes(tree, n => n.type === "button" && n.props.className?.startsWith("wb-tab"));
  assert.deepEqual(tabs.map(text), ["Legacy 1", "Legacy 2"]);
  assert.equal(nodes(tabs, n => n.type === "svg").length, 0);
}
console.log("HOST VIEW ICON TEST PASS (" + (bundle ? "bundle" : "source") + "): rendered SVG, invalid/legacy fallback, i18n accessible labels, routing, single view");
