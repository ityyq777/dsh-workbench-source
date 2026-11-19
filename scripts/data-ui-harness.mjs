import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createContext, runInContext } from "node:vm";

/**
 * 在 vm 沙箱里加载浏览器侧 CJS（视图/样式），用 deps 顶替外部依赖（如 require("react")）。
 * 相对路径依赖按需递归加载，与 esbuild 打包时的解析口径一致。
 */
export function loadCjs(entryFile, deps = {}) {
  const sandbox = createContext({
    console, Promise, Set, Map, WeakMap, JSON, Object, Array, String, Number, Boolean,
    Error, RegExp, Date, Math, Symbol, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
  });
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
    const stubRequire = (name) => {
      if (Object.prototype.hasOwnProperty.call(deps, name)) return deps[name];
      if (name.startsWith(".")) return load(resolve(dirname(file), name));
      throw new Error("Unexpected runtime dependency: " + name);
    };
    runInContext(
      "(function (module, exports, require) {" + readFileSync(file, "utf8") + "\n})",
      sandbox,
    )(mod, mod.exports, stubRequire);
    return mod.exports;
  }
  return load(entryFile);
}

// Deterministic element renderer with hook/effect cleanup and explicit event handlers.
export function createReact() {
  const rt = {
    hooks: [],
    idx: 0,
    dirty: false,
    effects: [],
    pending: [],
    Component: null,
    props: null,
    tree: null,
  };

  function slot(init) {
    const i = rt.idx++;
    if (!(i in rt.hooks)) rt.hooks[i] = init;
    return i;
  }

  function schedule() {
    rt.dirty = true;
  }

  const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children }, children }),
    cloneElement: (node, props, ...children) => ({ type: node.type, props: { ...node.props, ...props, children }, children }),
    Fragment: "Fragment",
    forwardRef: (fn) => fn,
    createContext: (v) => ({ Provider: (p) => p, Consumer: () => null, _currentValue: v }),
    useContext: () => ({}),
    useId: () => "id",
    useState(initial) {
      const i = slot({ v: typeof initial === "function" ? initial() : initial });
      const set = (next) => {
        const cur = rt.hooks[i].v;
        const val = typeof next === "function" ? next(cur) : next;
        if (val === cur) return;
        rt.hooks[i].v = val;
        schedule();
      };
      return [rt.hooks[i].v, set];
    },
    useRef(initial) {
      const i = slot({ v: { current: initial } });
      return rt.hooks[i].v;
    },
    useMemo(fn) {
      const i = slot({ v: fn() });
      return rt.hooks[i].v;
    },
    useCallback(fn) {
      const i = slot({ v: fn });
      return rt.hooks[i].v;
    },
    useEffect(fn, deps) {
      const i = rt.idx++;
      const prev = rt.hooks[i];
      const changed =
        !prev ||
        !deps ||
        !prev.deps ||
        deps.length !== prev.deps.length ||
        deps.some((d, k) => d !== prev.deps[k]);
      rt.effects.push({ i, fn, deps: deps || null, run: changed });
    },
  };

  // 迷你 React 只渲染一棵元素树；视图现在包了一层 useConfig 外壳，
  // 这里把函数组件就地展开（hook 槽位按调用顺序稳定即可）。
  function expand(node) {
    if (Array.isArray(node)) return node.map(expand);
    if (node === null || node === undefined || typeof node !== "object") return node;
    if (typeof node.type === "function") {
      return expand(node.type(Object.assign({}, node.props)));
    }
    const children = (node.children || []).map(expand);
    if (children.length === (node.children || []).length && children.every((c, i) => c === node.children[i])) return node;
    return Object.assign({}, node, { children });
  }

  rt.mount = (Component, props) => {
    rt.Component = Component;
    rt.props = props;
    let guard = 0;
    do {
      rt.dirty = false;
      rt.idx = 0;
      rt.effects = [];
      rt.tree = expand(Component(props));
      // 先把 effect 挂起来，再统一执行变更过的
      const runNow = rt.effects.filter((e) => e.run);
      for (const e of runNow) {
        const prev = rt.hooks[e.i];
        if (prev && typeof prev.cleanup === "function") prev.cleanup();
        rt.hooks[e.i] = { deps: e.deps, cleanup: e.fn() };
      }
      // effect 里常见的 setState 已经通过 schedule 置 dirty
    } while (rt.dirty && ++guard < 60);
    if (guard >= 60) throw new Error("render loop did not settle");
    return rt.tree;
  };
  rt.rerender = () => rt.mount(rt.Component, rt.props);
  rt.React = React;
  return rt;
}
