// 首页栏目分组：栏目由宿主定义（/workbench/api/domains 的 categories，顺序即首页顺序），
// 插件在 registerDomain 里声明 category。这里只做纯数据归组，不碰 React 与样式。
//
// 兼容：宿主没下发栏目定义（旧宿主/旧插件包）时 homeGroups 返回 null，调用方回退平铺单网格；
// 插件未声明或写了未知栏目 id 时归入兜底栏目，不丢卡片。

/** 取 {zh,en} 文案；与 client.src.cjs 的 pickTitle 一致。 */
function pickTitle(title, lang) {
  if (!title) return "";
  if (typeof title === "string") return title;
  return title[lang] || title.zh || title.en || "";
}

/**
 * 栏目名：优先页面文案表（t 返回 key 本身表示缺该键），再退回宿主下发的 {zh,en}。
 * @param {{id:string,title:object}} cat 宿主下发的栏目定义
 * @param {(key:string)=>string} t 本地化函数
 * @param {string} lang 当前语言
 */
function categoryTitle(cat, t, lang) {
  var key = "cat_" + String(cat && cat.id);
  var text = typeof t === "function" ? t(key) : key;
  if (text && text !== key) return text;
  return pickTitle(cat && cat.title, lang) || String((cat && cat.id) || "");
}

/**
 * 按栏目归组。
 * @param {Array<{id:string,title:object,fallback?:boolean}>} categories 宿主栏目表
 * @param {Array<{id:string,category?:string}>} list 已注册业务域
 * @returns {Array<{id:string,title:string,count:number,items:Array}>|null}
 */
function homeGroups(categories, list, t, lang) {
  var cats = Array.isArray(categories) ? categories : null;
  if (!cats || !cats.length) return null;
  var known = {};
  var fallbackId = "";
  cats.forEach(function (c) {
    if (!c || !c.id) return;
    known[c.id] = true;
    if (c.fallback && !fallbackId) fallbackId = c.id;
  });
  if (!fallbackId) fallbackId = cats[cats.length - 1].id;
  var bucket = {};
  cats.forEach(function (c) { if (c && c.id) bucket[c.id] = []; });
  (Array.isArray(list) ? list : []).forEach(function (a) {
    var id = a && typeof a.category === "string" && known[a.category] ? a.category : fallbackId;
    (bucket[id] || (bucket[id] = [])).push(a);
  });
  var groups = [];
  cats.forEach(function (c) {
    var items = bucket[c.id] || [];
    if (!items.length) return; // 空栏目不渲染
    groups.push({ id: c.id, title: categoryTitle(c, t, lang), count: items.length, items: items });
  });
  return groups;
}

/**
 * 渲染首页业务卡片区：有栏目定义就分段，没有（旧宿主）就平铺单网格。
 * @param {{jsx:Function,jsxs:Function}} jsx react/jsx-runtime
 * @param {Array} categories 宿主栏目表
 * @param {Array} list 已注册业务域
 * @param {{t:Function,lang:string,addonCard:Function}} opts 文案、语言与单卡渲染
 */
function homeSection(jsx, categories, list, opts) {
  var groups = homeGroups(categories, list, opts.t, opts.lang);
  if (!groups) return jsx.jsx("div", { className: "wb-home-grid", children: list.map(opts.addonCard) });
  return jsx.jsx("div", {
    className: "wb-home-cats",
    children: groups.map(function (g) {
      return jsx.jsxs("section", {
        className: "wb-home-cat",
        children: [
          jsx.jsxs("div", {
            className: "wb-home-cat-head",
            children: [
              jsx.jsx("h3", { children: g.title }),
              jsx.jsx("span", { className: "wb-home-cat-count", children: g.count }),
            ],
          }),
          jsx.jsx("div", { className: "wb-home-grid", children: g.items.map(opts.addonCard) }),
        ],
      }, g.id);
    }),
  });
}

module.exports = {
  homeGroups: homeGroups,
  categoryTitle: categoryTitle,
  pickTitle: pickTitle,
  homeSection: homeSection,
};
