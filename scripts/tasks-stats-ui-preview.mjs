// 任务统计页版面预览：用 esbuild 把真实视图与图表打进一个静态页，数据全是内存样例。
// 只用于核对信息层级、栅格与浅/深色，不连宿主也不连数据库。
//
// 用法：node scripts/tasks-stats-ui-preview.mjs [端口]
import { build } from "esbuild";
import { createServer } from "node:http";

const PORT = Number(process.argv[2] || 4631);

const source = String.raw`
const React = require('react');
const h = React.createElement;
const { createRoot } = require('react-dom/client');
const statsView = require('./packages/addons/tasks/client/views/stats.cjs');
const copy = require('./packages/addons/tasks/client/ui/copy.cjs');
const styles = require('./packages/addons/tasks/client/ui/styles.cjs');

var DAY = 86400000;
function day(offset) {
  var d = new Date(Date.UTC(2026, 10, 17) - offset * DAY);
  return d.toISOString().slice(0, 10);
}
function trend(days) {
  var names = ['publish', 'done', 'shutdown', 'claimed', 'target'];
  return Array.from({ length: days }, function (_, i) {
    var row = { bucket: day(days - 1 - i) };
    names.forEach(function (name, k) {
      row[name] = Math.max(0, Math.round(3 + 2.6 * Math.sin((i + k * 3) / 3.4) + (i % 7 === 0 ? 3 : 0)));
    });
    return row;
  });
}
function recent(n) {
  return Array.from({ length: n }, function (_, i) {
    return {
      id: 't' + i,
      title: ['重做任务统计页布局', '修复凭据保存后列表不新增', '时间线成员预览面板', '接取工作台任务流程', '插件版本核对脚本'][i % 5] + (i > 4 ? ' ' + (i + 1) : ''),
      difficulty: i % 3 === 0 ? null : (i % 5) + 1,
      tableTitle: i % 4 === 0 ? '' : 'dsh-workbench-task',
      date: day(i * 2),
    };
  });
}
var report = {
  generatedAt: Date.UTC(2026, 10, 17, 2, 20, 0),
  range: { from: day(29), to: day(0), key: '30d' },
  today: { date: day(0), published: 6, claimed: 3, done: 4, shutdown: 1, avgDifficultyDone: 2.7, avgSample: 4 },
  totals: { total: 128, active: 74, done: 46, shutdown: 8, claimed: 12, overdue: 9, dueToday: 3, dueNext7: 11, newInRange: 26, restarted: 5 },
  rates: { completion: 0.359, overdue: 0.122, avgCycleDays: 4.6 },
  breakdowns: {
    status: [{ key: '0', label: '已开启', count: 74 }, { key: '1', label: '已关闭', count: 8 }, { key: '2', label: '已完成', count: 34 }, { key: '4', label: '已接取', count: 12 }],
    priority: [{ key: '1', label: 'P1', count: 4 }, { key: '2', label: 'P2', count: 11 }, { key: '3', label: 'P3', count: 22 }, { key: '4', label: 'P4', count: 31 }, { key: '5', label: 'P5', count: 26 }, { key: '6', label: 'P6', count: 18 }, { key: '7', label: 'P7', count: 9 }, { key: '8', label: 'P8', count: 4 }, { key: '9', label: 'P9', count: 2 }, { key: '10', label: 'P10', count: 1 }],
    difficulty: [{ key: 'unset', label: '未设置', count: 17 }, { key: '0', label: '0', count: 3 }, { key: '1', label: '1', count: 21 }, { key: '2', label: '2', count: 34 }, { key: '3', label: '3', count: 28 }, { key: '4', label: '4', count: 17 }, { key: '5', label: '5', count: 8 }],
  },
  aging: [{ key: '1-3', label: '1-3 天', count: 3 }, { key: '4-7', label: '4-7 天', count: 4 }, { key: '8-30', label: '8-30 天', count: 2 }],
  eventTrend: trend(30),
  rankings: {
    tables: [
      { id: 'a', title: 'dsh-workbench-task', total: 62, open: 34, overdue: 5, completion: 0.35 },
      { id: 'b', title: '工作台插件开发', total: 38, open: 22, overdue: 3, completion: 0.32 },
      { id: 'c', title: '移动端适配', total: 16, open: 11, overdue: 1, completion: 0.31 },
      { id: 'd', title: '发布与市场', total: 12, open: 7, overdue: 0, completion: 0.42 },
    ],
    groups: [
      { id: 'g1', title: '插件开发', total: 70, open: 41, overdue: 6, completion: 0.34 },
      { id: 'g2', title: '宿主内核', total: 26, open: 14, overdue: 2, completion: 0.38 },
      { id: 'g3', title: '文档与规范', total: 18, open: 12, overdue: 1, completion: 0.33 },
    ],
    workspaces: [
      { id: 'w1', title: 'DeepseekHarness/插件开发', total: 64, open: 36, overdue: 5, completion: 0.36 },
      { id: 'w2', title: 'DeepseekHarness/宿主', total: 31, open: 19, overdue: 3, completion: 0.35 },
      { id: 'w3', title: 'DeepseekHarness/市场', total: 14, open: 8, overdue: 1, completion: 0.4 },
    ],
    noWorkspace: { id: '', title: '未归属工作区', total: 19, open: 11, overdue: 0, completion: 0.42 },
  },
  lists: {
    overdue: Array.from({ length: 4 }, function (_, i) {
      return { id: 'o' + i, title: ['补齐统计页空态文案', '核对 profile 版本', '整理插件依赖文档', '修掉结构测试基线'][i], targetDate: day(12 + i * 2), daysOverdue: 12 + i * 2, tableTitle: 'dsh-workbench-task' };
    }),
    recentPublish: recent(5),
    recentDone: recent(5),
    recentShutdown: recent(3),
    recentClaimed: recent(4),
  },
  capabilities: { lists: ['overdue', 'recentPublish', 'recentDone', 'recentShutdown', 'recentClaimed'] },
  warnings: [],
};
var calendar = { year: 2026, days: Array.from({ length: 365 }, function (_, i) {
  var date = new Date(Date.UTC(2026, 0, 1) + i * DAY).toISOString().slice(0, 10);
  var count = i % 11 === 0 ? 5 : i % 5 === 0 ? 3 : i % 3 === 0 ? 1 : 0;
  return { date: date, done: count, publish: Math.max(0, count - 1), shutdown: i % 29 === 0 ? 1 : 0, claimed: i % 7 === 0 ? 2 : 0, target: i % 4 === 0 ? 2 : 0 };
}) };

var api = {
  subscribe: function () { return function () {}; },
  call: function (name, args) {
    var result;
    if (name === 'tasks.configGet') result = { values: { 'stats.range': '30d', 'stats.top': 10, 'ui.bodyMode': 'full' } };
    else if (name === 'tasks.activityCalendar') result = calendar;
    else if (name === 'tasks.statsReport') result = report;
    else result = {};
    return Promise.resolve({ ok: true, result: result });
  },
};

var style = document.createElement('style');
style.textContent = styles + [
  'html,body{margin:0;padding:0}',
  'body{background:var(--wb-bg,#f6f7f9);color:var(--wb-fg,#1f2329);font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}',
  '.preview{max-width:none;padding:0 20px 40px}',
  '.preview-bar{display:flex;gap:8px;align-items:center;padding:10px 0 14px;font-size:12px;color:var(--wb-muted,#8a919c)}',
  '.preview-bar button{font:inherit;padding:3px 10px;border-radius:6px;border:1px solid var(--wb-border,#e3e6ea);background:var(--wb-card,#fff);color:inherit;cursor:pointer}',
  '.preview-bar button[aria-pressed=true]{border-color:var(--wb-accent,#11a89b);color:var(--wb-accent,#11a89b)}',
].join('\n');
document.head.appendChild(style);

var LIGHT = {
  '--wb-bg': '#f6f7f9', '--wb-card': '#ffffff', '--wb-surface': '#f1f3f5', '--wb-border': '#e3e6ea',
  '--wb-line': '#eceff2', '--wb-accent': '#11a89b', '--wb-muted': '#8a919c', '--wb-ok': '#2f9e44',
  '--wb-warn': '#e8a33d', '--wb-danger': '#e0483d', '--wb-fg': '#1f2329', '--wb-fg-2': '#5b6470',
  '--dsw-alias-bg-base': '#f6f7f9', '--dsw-alias-bg-layer-1': '#ffffff', '--dsw-alias-bg-skeleton': '#eceff2',
  '--dsw-alias-border-l1': '#e3e6ea', '--dsw-alias-border-l2': '#eceff2',
  '--dsw-alias-label-primary': '#1f2329', '--dsw-alias-label-secondary': '#5b6470', '--dsw-alias-label-tertiary': '#8a919c',
  '--dsw-alias-label-primary-inverted': '#ffffff', '--dsw-alias-brand-primary': '#11a89b',
  '--dsw-alias-state-business-primary': '#3b82f6', '--dsw-alias-state-success-primary': '#2f9e44',
  '--dsw-alias-state-error-primary': '#e0483d', '--dsw-alias-state-warn-primary': '#e8a33d',
  '--dsw-alias-state-warning-primary': '#e8a33d', '--dsw-alias-state-done-primary': '#7c6cf5',
  '--dsw-alias-state-idle-primary': '#9aa1ab',
};
var DARK = {
  '--wb-bg': '#15181d', '--wb-card': '#1d2127', '--wb-surface': '#232830', '--wb-border': '#2f353e',
  '--wb-line': '#272d35', '--wb-accent': '#38c3b4', '--wb-muted': '#8b939f', '--wb-ok': '#51cf66',
  '--wb-warn': '#f0b357', '--wb-danger': '#ff6b5e', '--wb-fg': '#e6e9ee', '--wb-fg-2': '#aab2bd',
  '--dsw-alias-bg-base': '#15181d', '--dsw-alias-bg-layer-1': '#1d2127', '--dsw-alias-bg-skeleton': '#262c34',
  '--dsw-alias-border-l1': '#2f353e', '--dsw-alias-border-l2': '#272d35',
  '--dsw-alias-label-primary': '#e6e9ee', '--dsw-alias-label-secondary': '#aab2bd', '--dsw-alias-label-tertiary': '#8b939f',
  '--dsw-alias-label-primary-inverted': '#15181d', '--dsw-alias-brand-primary': '#38c3b4',
  '--dsw-alias-state-business-primary': '#5b9cff', '--dsw-alias-state-success-primary': '#51cf66',
  '--dsw-alias-state-error-primary': '#ff6b5e', '--dsw-alias-state-warn-primary': '#f0b357',
  '--dsw-alias-state-warning-primary': '#f0b357', '--dsw-alias-state-done-primary': '#9a8dfb',
  '--dsw-alias-state-idle-primary': '#767e8a',
};
function paint(theme) {
  var tokens = theme === 'dark' ? DARK : LIGHT;
  Object.keys(tokens).forEach(function (key) { document.documentElement.style.setProperty(key, tokens[key]); });
}

function App() {
  var [lang, setLang] = React.useState(new URLSearchParams(location.search).get('lang') || 'zh');
  var [theme, setTheme] = React.useState(new URLSearchParams(location.search).get('theme') || 'light');
  React.useEffect(function () { paint(theme); }, [theme]);
  return h('div', { className: 'preview' },
    h('div', { className: 'preview-bar' },
      h('strong', { style: { fontWeight: 600 } }, '任务统计页版面预览'),
      h('span', null, '· 内存样例数据 ·'),
      h('button', { type: 'button', 'aria-pressed': lang === 'zh', onClick: function () { setLang('zh'); } }, '中文'),
      h('button', { type: 'button', 'aria-pressed': lang === 'en', onClick: function () { setLang('en'); } }, 'English'),
      h('button', { type: 'button', 'aria-pressed': theme === 'light', onClick: function () { setTheme('light'); } }, '浅色'),
      h('button', { type: 'button', 'aria-pressed': theme === 'dark', onClick: function () { setTheme('dark'); } }, '深色'),
    ),
    h(statsView.TasksStatsView, { key: lang, api: api, lang: lang, active: true, onNavigate: function () {} }),
  );
}
// ?debug=1 时把溢出诊断写进 DOM，供无头浏览器 --dump-dom 读取。
if (new URLSearchParams(location.search).get('debug')) {
  setTimeout(function () {
    var doc = document.documentElement;
    var wide = [].slice.call(document.querySelectorAll('.wbt-stats *'))
      .filter(function (el) { return el.getBoundingClientRect().right > doc.clientWidth + 1; })
      .slice(0, 6)
      .map(function (el) { return (el.className || el.tagName) + '@' + Math.round(el.getBoundingClientRect().right); });
    var box = document.createElement('div');
    box.id = 'overflow-report';
    box.textContent = 'viewport=' + doc.clientWidth + ' scrollWidth=' + doc.scrollWidth + ' offenders=' + (wide.join(',') || 'none');
    document.body.appendChild(box);
  }, 1200);
}

var root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);
createRoot(root).render(h(App));
`;

const output = await build({
  stdin: { contents: source, resolveDir: process.cwd(), loader: "js" },
  bundle: true,
  write: false,
  format: "iife",
  define: { "process.env.NODE_ENV": JSON.stringify("development") },
});

if (process.argv.includes("--check")) {
  console.log("TASKS STATS PREVIEW BUILD PASS");
} else {
  const html =
    '<!doctype html><html lang="zh"><meta charset="utf-8"><title>Tasks stats layout preview</title><div id="root"></div><script src="/app.js"></script></html>';
  // /frame?w=420：把预览装进固定宽度的 iframe，媒体查询按 iframe 视口生效，
  // 这样能在桌面浏览器最小窗口宽度（约 500px）下核对 420px 版面。
  const frameHtml = (width) =>
    '<!doctype html><html lang="zh"><meta charset="utf-8"><title>frame ' +
    width +
    '</title><style>html,body{margin:0;background:#888}iframe{width:' +
    width +
    'px;height:100vh;border:0;display:block}</style><iframe src="/?theme=light&lang=zh"></iframe></html>';
  createServer((req, res) => {
    const url = req.url || "";
    if (url.startsWith("/frame")) {
      const width = Number(new URL(url, "http://127.0.0.1").searchParams.get("w") || 420);
      const theme = new URL(url, "http://127.0.0.1").searchParams.get("theme") || "light";
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(frameHtml(width).replace('theme=light', 'theme=' + theme));
      return;
    }
    const js = url.startsWith("/app.js");
    res.setHeader("content-type", js ? "application/javascript" : "text/html; charset=utf-8");
    res.end(js ? output.outputFiles[0].text : html);
  }).listen(PORT, "127.0.0.1", function () {
    console.log("Preview http://127.0.0.1:" + this.address().port + "/?theme=light");
  });
}
