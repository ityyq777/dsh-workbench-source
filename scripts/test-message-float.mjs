/**
 * 全局消息悬浮入口回归测试（不启动 DSH）：
 * 角标计数（初始拉取、created 去重 +1、read 覆写）、弹跳合并、配置开关与换边、
 * 点击跳转与旧宿主降级、样式契约（层级/主题 token/reduced-motion/窄屏）。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** 极简 DOM：够浮层用（createElement / 属性 / 子节点 / 查询）。 */
function createDom() {
  const nodes = [];
  function el(tag) {
    const node = {
      tagName: tag,
      children: [],
      attrs: {},
      style: {
        setProperty(name, value) {
          this[name] = value;
        },
        removeProperty(name) {
          delete this[name];
        },
      },
      textContent: "",
      parentNode: null,
      listeners: {},
      appendChild(child) {
        child.parentNode = node;
        node.children.push(child);
        return child;
      },
      removeChild(child) {
        const i = node.children.indexOf(child);
        if (i >= 0) node.children.splice(i, 1);
        child.parentNode = null;
      },
      setAttribute(name, value) {
        node.attrs[name] = String(value);
      },
      getAttribute(name) {
        return name in node.attrs ? node.attrs[name] : null;
      },
      removeAttribute(name) {
        delete node.attrs[name];
      },
      addEventListener(type, fn) {
        (node.listeners[type] = node.listeners[type] || []).push(fn);
      },
      dispatch(type, event) {
        (node.listeners[type] || []).forEach((fn) => fn(event || {}));
      },
    };
    nodes.push(node);
    return node;
  }
  const head = el("head");
  const body = el("body");
  const byId = new Map();
  const doc = {
    head,
    body,
    documentElement: { getAttribute: () => "zh-CN" },
    visibilityState: "visible",
    createElement: el,
    createElementNS: (_ns, tag) => el(tag),
    getElementById: (id) => byId.get(id) || null,
    querySelector: () => null,
    appendChild(child) {
      body.appendChild(child);
      return child;
    },
  };
  doc.head.appendChild = function (child) {
    if (child.id) byId.set(child.id, child);
    child.parentNode = doc.head;
    doc.head.children.push(child);
    return child;
  };
  return { doc, body, head, all: nodes };
}

const style = require("../packages/addons/message/client/float/style.cjs");
const buttons = require("../packages/addons/message/client/float/button.cjs");
const mountModule = require("../packages/addons/message/client/float/mount.cjs");

// 1. 样式契约：层级夹在弹幕与弹窗之间、只用 token、窄屏与 reduced-motion 有兜底。
{
  const css = style().join("");
  assert.ok(css.includes("z-index:860"), "浮层层级应为 860（高于弹幕 780、低于弹窗 900）");
  assert.ok(css.includes("pointer-events:none"), "容器不能挡住页面点击");
  assert.ok(css.includes("pointer-events:auto"), "按钮自身要可点");
  // 宿主浮层容器对直接子元素有 `.overlayLayer>*{pointer-events:auto}`，与容器规则同权重；
  // 容器一旦铺满全屏（inset:0）就可能在注入顺序变化时接管整页点击，只剩按钮可点。
  assert.ok(
    !/\.wbm-float-root\{[^}]*inset:0/.test(css),
    "浮层容器不能铺满全屏，否则会吞掉页面其它位置的点击",
  );
  assert.ok(/\.wbm-float-root\{[^}]*height:0/.test(css), "浮层容器应缩成零高度定位带");
  assert.ok(css.includes("-webkit-app-region:no-drag"), "桌面端不能声明可拖拽区域");
  assert.ok(css.includes("var(--dsw-alias-button-floating-fill"), "底色优先取应用外壳的浮层 token");
  assert.ok(css.includes("var(--dsw-alias-label-primary"), "图标颜色必须取文字 token，不能继承任意主题色");
  assert.ok(css.includes("var(--dsw-alias-border-l2"), "描边取外壳边框 token");
  assert.ok(css.includes("var(--dsw-alias-state-error-primary"), "角标取外壳错误色 token");
  assert.ok(css.includes("var(--wb-card") && css.includes("var(--wb-border"), "--wb-* 只作为拿不到外壳 token 时的兜底");
  // 颜色只允许出现在 var(--token, 兜底) 的兜底位置，不允许裸写色值。
  const bare = css.replace(/var\([^)]*\)/g, "VAR");
  const hex = (bare.match(/#[0-9a-f]{3,8}\b/gi) || []).map((x) => x.toLowerCase());
  assert.deepEqual(hex, [], "除 var() 兜底外不允许写死颜色，实际：" + hex.join(" "));
  assert.ok(css.includes("border-radius:50%"), "按钮是圆形，不能退化成圆角方块");
  assert.ok(css.includes("@media (max-width:640px)"), "窄屏要缩尺寸");
  assert.ok(/prefers-reduced-motion: reduce[\s\S]*animation:none/.test(css), "reduced-motion 下不做位移");
}

// 2. 按钮：角标文本、99+ 封顶、可访问名、弹跳合并。
{
  const { doc } = createDom();
  let activated = 0;
  const btn = buttons.createButton({ doc, lang: "zh", onActivate: () => activated++ });
  assert.equal(btn.el.getAttribute("aria-label"), "消息，无未读");
  btn.setCount(3);
  assert.equal(btn.el.getAttribute("data-unread"), "1");
  assert.equal(btn.el.children[1].textContent, "3", "角标应显示未读数");
  assert.equal(btn.el.getAttribute("aria-label"), "消息，3 条未读");
  btn.setCount(130);
  assert.equal(btn.el.children[1].textContent, "99+", "超过 99 显示 99+");
  btn.setCount(0);
  assert.equal(btn.el.getAttribute("data-unread"), null, "清零后不带未读标记");
  assert.equal(btn.el.children[1].textContent, "0");

  btn.pulse();
  assert.equal(btn.el.getAttribute("data-pulse"), "1", "新消息应触发一次弹跳");
  btn.el.removeAttribute("data-pulse");
  btn.setPosition("bottom-left");
  assert.equal(btn.el.getAttribute("data-pos"), "bottom-left", "支持镜像到左下角");
  btn.el.dispatch("click", { preventDefault() {} });
  assert.equal(activated, 1, "点击应触发回调");
}

// 3. 弹跳合并：600ms 内连来三条只播一次动画。
{
  const { doc } = createDom();
  const btn = buttons.createButton({ doc, lang: "zh" });
  let writes = 0;
  const raw = btn.el.setAttribute.bind(btn.el);
  btn.el.setAttribute = (name, value) => {
    if (name === "data-pulse") writes++;
    raw(name, value);
  };
  btn.pulse();
  btn.pulse();
  btn.pulse();
  assert.equal(writes, 1, "动画进行中的消息不应重启动画");
  assert.equal(buttons.PULSE_MS, 600);
}

// 4. 挂载与数据流：初始拉取、created 去重 +1、read 覆写、点击直达收件箱。
async function main() {
  const { doc, body, head } = createDom();
  const calls = [];
  const created = [];
  const fakeFetch = (url, init) => {
    const action = url.split("/actions/")[1];
    calls.push({ action, body: JSON.parse(init.body) });
    const table = {
      "message.configGet": { values: { "float.enabled": true, "float.position": "bottom-right" } },
      "message.unreadCount": { unread: 2 },
    };
    return Promise.resolve({ json: () => Promise.resolve({ ok: true, result: table[action] || {} }) });
  };
  const host = {
    navigateAddon: (id, view) => {
      created.push([id, view]);
      return true;
    },
  };
  const notifier = {
    subscribe: (fn) => {
      notifier.handler = fn;
      return () => {
        notifier.handler = null;
      };
    },
  };
  const mount = mountModule.createMount({ doc, win: { addEventListener: () => {}, removeEventListener: () => {} }, fetchImpl: fakeFetch, host, notifier });
  mount.mount();
  // 挂载链是「配置 → 计数 → 渲染」三段微任务，等够 tick 才算落地。
  const flush = async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
    await new Promise((resolve) => setImmediate(resolve));
  };
  await flush();

  assert.ok(doc.getElementById("wb-message-float-style"), "样式应注入一次");
  // 内联兜底：宿主浮层规则可能把直接子元素改成 pointer-events:auto。
  assert.equal(body.children[0].style.pointerEvents, "none", "浮层容器内联不吃页面点击");
  assert.equal(body.children[0].children[0].style.pointerEvents, "auto", "按钮内联收点击");
  assert.equal(calls[0].action, "message.configGet");
  assert.equal(calls[1].action, "message.unreadCount");
  assert.equal(mount.readState().count, 2, "初始未读数来自 message.unreadCount");
  assert.equal(body.children.length, 1, "无宿主浮层容器时挂到 body");

  // created：按 id 去重 +1
  notifier.handler("message.created", { message: { id: "m1" } });
  assert.equal(mount.readState().count, 3);
  notifier.handler("message.created", { message: { id: "m1" } });
  assert.equal(mount.readState().count, 3, "同一 id 重复推送不再加");
  notifier.handler("message.created", { message: { id: "m2" } });
  assert.equal(mount.readState().count, 4);

  // read：以服务端 unread 覆写
  notifier.handler("message.read", { unread: 0, updated: 4 });
  assert.equal(mount.readState().count, 0, "标记已读后角标清零");

  // 点击直达收件箱
  body.children[0].children[0].dispatch("click", { preventDefault() {} });
  assert.deepEqual(created, [["wb-addon-message", "inbox"]], "点击应直达消息收件箱");

  // 配置：关闭立即隐藏、换边立即生效
  notifier.handler("config", { values: { "float.enabled": false, "float.position": "bottom-left" } });
  const btnEl = body.children[0].children[0];
  assert.equal(btnEl.style.display, "none", "关闭配置后按钮立即隐藏");
  assert.equal(btnEl.getAttribute("data-pos"), "bottom-left", "位置配置立即生效");
  notifier.handler("config", { values: { "float.enabled": true } });
  assert.equal(btnEl.style.display, "", "重新开启后按钮恢复显示");

  // 5. 旧宿主降级：没有 navigateAddon 时给可读提示，不抛错
  const { doc: doc2, body: body2 } = createDom();
  const infos = [];
  const originalInfo = console.info;
  console.info = (msg) => infos.push(String(msg));
  try {
    const legacy = mountModule.createMount({
      doc: doc2,
      win: { addEventListener: () => {}, removeEventListener: () => {} },
      fetchImpl: () => Promise.resolve({ json: () => Promise.resolve({ ok: true, result: {} }) }),
      host: {},
      notifier: { subscribe: () => () => {} },
    });
    legacy.mount();
    await flush();
    body2.children[0].children[0].dispatch("click", { preventDefault() {} });
  } finally {
    console.info = originalInfo;
  }
  assert.equal(infos.length, 1, "旧宿主点击时给一条提示");
  assert.ok(infos[0].includes("消息"), "提示应指向消息入口");

  // 6. 未读数拉取失败：不显示角标（未知不等于 0），按钮仍可用
  const { doc: doc3, body: body3 } = createDom();
  const failing = mountModule.createMount({
    doc: doc3,
    win: { addEventListener: () => {}, removeEventListener: () => {} },
    fetchImpl: () => Promise.reject(new Error("offline")),
    host: {},
    notifier: { subscribe: () => () => {} },
  });
  failing.mount();
  await flush();
  assert.equal(failing.readState().count, 0);
  assert.equal(body3.children[0].children[0].getAttribute("data-unread"), null, "拉取失败不应伪造未读");

  // 7. 底部输入区避让：找到输入框就把按钮抬到它上方，高度夹在 48–140px
  {
    const { doc: doc4, body: body4 } = createDom();
    const composer = doc4.createElement("div");
    composer.getBoundingClientRect = () => ({ height: 96, top: 600, bottom: 696 });
    doc4.querySelector = (sel) => (String(sel).indexOf("composer") >= 0 || String(sel).indexOf("contenteditable") >= 0 ? composer : null);
    const lifted = mountModule.createMount({
      doc: doc4,
      win: { addEventListener: () => {}, removeEventListener: () => {} },
      fetchImpl: () => Promise.resolve({ json: () => Promise.resolve({ ok: true, result: { values: {}, unread: 0 } }) }),
      host: {},
      notifier: { subscribe: () => () => {} },
    });
    lifted.mount();
    await flush();
    const el = body4.children[0].children[0];
    assert.equal(el.getAttribute("data-lift"), "1", "有输入框时应抬起按钮");
    assert.equal(el.style["--wbm-float-lift"], "108px", "抬起高度 = 输入框高度 + 12");

    // 找不到输入框时不抬（贴右下角）
    const { doc: doc5, body: body5 } = createDom();
    const plain = mountModule.createMount({
      doc: doc5,
      win: { addEventListener: () => {}, removeEventListener: () => {} },
      fetchImpl: () => Promise.resolve({ json: () => Promise.resolve({ ok: true, result: { values: {}, unread: 0 } }) }),
      host: {},
      notifier: { subscribe: () => () => {} },
    });
    plain.mount();
    await flush();
    assert.equal(body5.children[0].children[0].getAttribute("data-lift"), null, "没有输入框时保持贴底");
  }

  // 8. 客户端入口接线：浮层在 notifier.start() 之后启动且被 try/catch 保护
  const client = readFileSync(new URL("../packages/addons/message/client/client.src.cjs", import.meta.url), "utf8");
  assert.ok(client.includes('require("./float/mount.cjs")'), "客户端入口应引入浮层模块");
  assert.ok(client.indexOf("notifier.start()") < client.indexOf("floatMount.createMount"), "浮层在提示音之后启动");
  assert.ok(/try \{\s*floatMount\.createMount[\s\S]*?catch/.test(client), "浮层启动失败不能拖垮插件注册");

  console.log("MESSAGE FLOAT TEST PASS", JSON.stringify({ count: mount.readState().count, position: mount.readState().position, head: head.children.length }));
}

await main();
