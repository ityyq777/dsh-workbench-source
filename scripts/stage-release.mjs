/**
 * 生成可发布到 GitHub / npm 的发布树。
 *
 * 主仓库里宿主包名是内部名 dsh-workbench；npm 上这个名字已被无关项目占用，
 * 因此发布名默认是 dsh-workbench-host（可用 NPM_HOST_NAME 覆盖）。
 * 业务插件逐个取 packages/addons/<目录>，npm 名沿用插件自身 package.json。
 *
 * 插件清单按目录枚举，不在这里硬编码：新增插件只要在 ADDON_META 里补一段市场
 * 文案就会被带上；漏登记会直接报错，避免新插件悄悄漏发布。
 *
 * 输出：
 *   dist/release/packages/host + dist/release/packages/<插件>   可安装包
 *   dist/release/marketplace/*.yml                 插件市场条目草稿
 *   dist/release/release.json                      发布清单（publish-npm / publish-github 读它）
 *   dist/release/README.md / LICENSE
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "dist", "release");
const OWNER = process.env.GITHUB_OWNER ?? "ityyq777";
const REPO = process.env.GITHUB_REPO ?? "dsh-workbench";
const HOST_NAME = process.env.NPM_HOST_NAME ?? "dsh-workbench-host";
const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
const DSH_ENGINES = { dsh: ">=0.2.0-rc.1 <0.3.0" };
const NODE_ENGINES = { node: ">=22.5" };

const addonsRoot = join(root, "packages", "addons");

// 每个业务插件一段发布元数据：目录名即 key。新增插件必须在这里登记，
// 否则脚本直接报错（宁可发布失败，也不要新插件悄悄漏发）。
const ADDON_META = {
  tasks: {
    description: "个人工作台任务插件：任务树、优先级、截止日、时间线与重启",
    keywords: ["tasks", "todo", "tree", "timeline"],
    marketCategory: "workflow",
    marketEn: "Task manager for DSH: a task tree, eight views, priorities, due dates, timeline/restart chains, batch merge and table moves.",
    marketZh: "DSH 任务管理：任务树、八个视图、优先级、截止日、时间线/重启链、批量归并与迁表。",
    marketExtra: "任务、标签、站点数据都保存在宿主 SQLite；卸载插件不删数据。",
  },
  tags: {
    description: "个人工作台标签插件：创建与管理标签，为任务、站点与储物提供标签归类",
    keywords: ["tags", "label", "catalog"],
    marketCategory: "tools",
    marketEn: "Tag manager for DSH: create, search and delete tags, with soft-delete and per-item mappings used by the workbench task, site and storage plugins.",
    marketZh: "DSH 标签管理：创建、搜索、删除标签，支持软删除与条目映射，供任务、站点与储物插件使用。",
    marketExtra: "标签被删除后，站点等引用它的条目会失去该标签，但条目本身保留。",
  },
  sites: {
    description: "个人工作台站点插件：目录树、链接与标签",
    keywords: ["sites", "bookmarks", "links", "tree"],
    marketCategory: "tools",
    marketEn: "Site bookmark manager for DSH: a folder tree, multiple links per site, tags and filtering, with per-folder views.",
    marketZh: "DSH 站点收藏：目录树、每个站点多条链接、标签与筛选，支持按目录浏览。",
    marketExtra: "标签功能在检测到 dsh-workbench-tags 已安装时显示；未安装时站点仍可正常使用目录与链接。",
  },
  storage: {
    description: "个人工作台储物插件：名称、品牌、位置、单位、库存文本与标签",
    keywords: ["storage", "inventory", "items", "tags"],
    marketCategory: "tools",
    marketEn: "Storage records for DSH: names, brands, locations, units, stock text and tags with local SQLite and optional metadata sync.",
    marketZh: "DSH 储物：记录名称、品牌、位置、单位、库存文本与标签，本地 SQLite 保存，可选元数据同步。",
    marketExtra: "管理物品库存文本台账，不上传或下载文件字节；卸载插件不删数据。",
  },
  message: {
    description: "个人工作台消息插件：统一消息发送入口、收件箱、未读统计与提示音",
    keywords: ["message", "notification", "inbox", "sound"],
    marketCategory: "tools",
    marketEn: "Message center for DSH: one send entry for agents and other plugins, inbox with unread counts, stats and a configurable notification sound.",
    marketZh: "DSH 消息中心：给 agent 与其他插件统一的消息发送入口，收件箱、未读数、统计与可配置提示音。",
    marketExtra: "消息只保存在本机，不参与云端同步，也不进入备份导出；已读消息默认 30 天后清理。",
  },
  vault: {
    description: "个人工作台凭据保险箱：加密保存密码与 token，agent 只见掩码",
    keywords: ["vault", "secrets", "password", "token", "security"],
    marketCategory: "tools",
    marketEn: "Credential vault for DSH: secrets are encrypted with AES-256-GCM under a scrypt-derived key, stay on the local machine, and the agent only ever sees a masked preview.",
    marketZh: "DSH 凭据保险箱：密码与 token 用 scrypt 派生密钥 + AES-256-GCM 加密，只存本机，agent 只见掩码。",
    marketExtra: "密文与 KDF 参数不进备份导出，换机需重新录入或等云同步。",
  },
  connector: {
    description: "个人工作台连接器插件：RSS/Webhook 内容接入，来源定义、条目与运行记录",
    keywords: ["connector", "rss", "webhook", "feed"],
    marketCategory: "tools",
    marketEn: "Content connector for DSH: define RSS or webhook sources, sync items into the workbench, keep credentials local and review per-source run logs.",
    marketZh: "DSH 连接器：定义 RSS/Webhook 来源并同步条目进工作台，凭据留在本机，按来源查看运行记录。",
    marketExtra: "只保存来源定义与拉取到的条目，不代理浏览外部页面；凭据优先存保险箱。",
  },
  contacts: {
    description: "个人工作台联系人插件：本地联系人、分组、多值字段与 vCard 导入导出",
    keywords: ["contacts", "vcard", "addressbook"],
    marketCategory: "tools",
    marketEn: "Contacts for DSH: local address book with groups, multi-value fields, search and vCard import/export.",
    marketZh: "DSH 联系人：本地通讯录，支持分组、多值字段、搜索与 vCard 导入导出。",
    marketExtra: "联系人只存本机 SQLite；vCard 导入导出按文件和文本处理，不上传。",
  },
  calendar: {
    description: "个人工作台日历插件：本地日历、事件、参与人与提醒",
    keywords: ["calendar", "events", "reminder"],
    marketCategory: "tools",
    marketEn: "Calendar for DSH: local calendars, events, participants and reminders, searchable from the workbench agent.",
    marketZh: "DSH 日历：本地日历、事件、参与人与提醒，工作台 agent 可搜索。",
    marketExtra: "事件与提醒存本机；不订阅外部日历协议。",
  },
  salary: {
    description: "个人工作台工资插件：按发薪日期记录工资构成、扣款与实发",
    keywords: ["salary", "payroll", "wage", "income"],
    marketCategory: "tools",
    marketEn: "Salary records for DSH: track pay components, deductions and net pay by pay date, with monthly stats and a full-width records view.",
    marketZh: "DSH 工资记录：按发薪日期记录工资构成、社保与个税扣款、实发金额，支持年度统计与按月聚合。",
    marketExtra: "只存本机 SQLite，不存姓名与工号，不参与云同步；不限月结，日结多笔也可按日期记录。",
  },
  mail: {
    description: "个人工作台邮件插件：安全 IMAP 收信、文件夹与已读同步、附件按需下载、草稿与 SMTP 回复转发",
    keywords: ["mail", "imap", "smtp", "email"],
    marketCategory: "tools",
    marketEn: "Browse IMAP folders and older mail over TLS, sync read status, download individual attachments, and reply or forward via SMTP with local drafts.",
    marketZh: "DSH 邮件：通过加密 IMAP 浏览文件夹与历史邮件，同步已读、移动和废纸篓；按需下载附件，从本地草稿回复或转发。",
    marketExtra: "保险箱随邮件安装；首次使用仍需初始化、解锁并绑定邮箱授权码。邮件账户仅保存 secretId。",
  },
  danmaku: {
    description: "个人工作台弹幕插件：把自建弹幕轮播在整个 DSH 界面，并可叠加到整个桌面",
    keywords: ["danmaku", "overlay", "desktop", "electron", "fun"],
    marketCategory: "ui",
    marketEn:
      "Danmaku for DSH: play your own bullet comments across the whole interface, or layer them over the desktop itself, with a local library, per-item styles and weighted rotation.",
    marketZh: "DSH 弹幕：把自建弹幕轮播在整个界面，也可叠加到整个桌面，含弹幕库、逐条样式与权重轮播。",
    marketExtra: "桌面透明层依赖 Electron 外壳；弹幕库只存本机，不上传也不参与云同步。",
  },
  automation: {
    description: "自动化兼容保留包：引擎自宿主 dsh-workbench-host 0.17.0 起已内化，本包不提供独立能力",
    keywords: ["automation", "scheduler", "compat"],
    marketCategory: "workflow",
    marketEn:
      "Compatibility placeholder for the DSH automation plugin. Since dsh-workbench-host 0.17.0 the rule engine, its three tables (host_automation_*), the 19 host.automation.* actions and the automation page live in the host; installing this package only registers the host row. The host and the standalone plugin (0.4.12) now coexist: each keeps its own actions and tables, so nobody needs to uninstall one to avoid double runs.",
    marketZh:
      "DSH 自动化兼容保留包：自 dsh-workbench-host 0.17.0 起规则引擎、三张 host_automation_* 表、19 个 host.automation.* action 与自动化页都已内置于宿主，本包只插入宿主行，不含独立能力。宿主与独立插件（0.4.12）现在可以共存：各用各的 action 与表，不会互相执行对方的规则，也就不必为了避开双跑而卸载其中一个。",
    marketExtra:
      "引擎已在宿主里：装本包与不装行为一致，装后不会新增视图、表或 action。想继续用插件自带的自动化页面，可以装 0.4.12（仍可从 npm 取到），它现在与宿主的 host.automation.* 共存；两套规则分别落在 host_automation_* 与插件自己的 automation_* 表里。",
  },
};

const addonNames = readdirSync(addonsRoot)
  .filter((name) => name !== "lib" && existsSync(join(addonsRoot, name, "package.json")))
  .sort();
const unregistered = addonNames.filter((name) => !ADDON_META[name]);
if (unregistered.length) {
  throw new Error(
    `新增插件还没登记发布文案：${unregistered.join("、")}；请在 scripts/stage-release.mjs 的 ADDON_META 补 description/keywords/marketCategory/marketEn/marketZh`,
  );
}
const vanished = Object.keys(ADDON_META).filter((name) => !addonNames.includes(name));
if (vanished.length) {
  throw new Error(`ADDON_META 里的插件已不存在：${vanished.join("、")}；请同步删除登记`);
}

// 发布顺序固定：宿主在前，其余按 ADDON_META 声明顺序（业务包依赖宿主）。
const releaseOrder = Object.keys(ADDON_META);
const pkgDirs = {
  host: join(root, "packages", "shell-dist"),
  ...Object.fromEntries(releaseOrder.map((name) => [name, join(addonsRoot, name)])),
};

for (const [key, dir] of Object.entries(pkgDirs)) {
  if (!existsSync(join(dir, "package.json"))) {
    throw new Error(`missing ${key} package: ${dir}（宿主请先运行 node scripts/dist-shell.mjs）`);
  }
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}
function writeJson(file, value) {
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}
function copyDir(src, dest) {
  cpSync(src, dest, {
    recursive: true,
    filter: (path) => {
      const base = path.split(/[\\/]/).pop();
      return base !== "node_modules" && base !== ".git" && base !== ".DS_Store" && !base.endsWith(".tgz");
    },
  });
}
function packageReadme(pkg, extra) {
  const lines = [
    `# ${pkg.name}`,
    "",
    pkg.description ?? "",
    "",
    "## 安装",
    "",
    "\`\`\`sh",
    `dsh plugin --profile web add ${pkg.name}`,
    "\`\`\`",
    "",
    "安装或升级后按 DSH 提示重启/刷新。",
    "",
  ];
  if (extra) lines.push(extra, "");
  lines.push(
    "## 兼容性",
    "",
    `- DSH：\`${DSH_ENGINES.dsh}\``,
    `- Node：\`${NODE_ENGINES.node}\``,
    "",
    "## 仓库",
    "",
    `- 源码入口：${REPO_URL}`,
    `- 问题反馈：${REPO_URL}/issues`,
    "",
    "## 许可",
    "",
    "MIT",
    "",
  );
  return lines.join("\n");
}
function commonMeta(pkg, subdir, description, keywords) {
  pkg.description = description;
  pkg.license = "MIT";
  pkg.author = OWNER;
  pkg.keywords = ["dsh", "dsh-plugin", "deepseek-harness", ...keywords];
  pkg.repository = { type: "git", url: `git+${REPO_URL}.git`, directory: subdir };
  pkg.homepage = `${REPO_URL}#readme`;
  pkg.bugs = { url: `${REPO_URL}/issues` };
  pkg.engines = { ...(pkg.engines ?? {}), ...NODE_ENGINES };
  pkg.dsh = { ...(pkg.dsh ?? {}), engines: DSH_ENGINES };
  pkg.publishConfig = { access: "public" };
  delete pkg.private;
  delete pkg.devDependencies;
  delete pkg.scripts;
  return pkg;
}
function rewritePatch(file, hostName) {
  const src = readFileSync(file, "utf8");
  // 块式（`name: 'dsh-workbench'` 独占一行）与流式（`{ id: workbench, name: 'dsh-workbench' }`）
  // 两种写法都要换成发布名。子插件的宿主行故意写成流式（见 docs/AGENTS规范/03-安装与交付.md），
  // 只按行首匹配的旧正则改不到它，发布出去会指向源码里才有的包名。
  const next = src.replace(/(\bname:\s*)(['"]?)dsh-workbench\2(?=\s*(?:[,}#]|$))/gm, (_match, key, quote) => `${key}${quote}${hostName}${quote}`);
  if (/name:\s*['"]?dsh-workbench(?![-.\w])/u.test(next)) {
    throw new Error(`patch 里的宿主名没有全部改写：${file}`);
  }
  writeFileSync(file, next);
}
function rewriteHostClient(file, hostName) {
  const src = readFileSync(file, "utf8");
  const next = src.replace('id: "dsh-workbench"', `id: "${hostName}"`);
  if (next === src) throw new Error("host client module id not rewritten");
  writeFileSync(file, next);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "packages"), { recursive: true });
mkdirSync(join(out, "marketplace"), { recursive: true });

// host
const hostDir = join(out, "packages", "host");
copyDir(pkgDirs.host, hostDir);
const hostPkg = commonMeta(
  readJson(join(hostDir, "package.json")),
  "packages/host",
  "个人工作台宿主：本地 SQLite、业务域注册、HTTP/SSE、Workbench agent 工具、账号与数据同步。",
  ["workbench", "sqlite", "sync", "tasks", "sites", "tags"],
);
hostPkg.name = HOST_NAME;
hostPkg.files = ["lib", "client", "cordis.patch.yml", "README.md", "LICENSE"];
writeJson(join(hostDir, "package.json"), hostPkg);
rewritePatch(join(hostDir, "cordis.patch.yml"), HOST_NAME);
rewriteHostClient(join(hostDir, "client", "client.js"), HOST_NAME);
writeFileSync(join(hostDir, "README.md"), packageReadme(hostPkg, "宿主本身不提供业务视图；安装任一业务插件即可使用。业务插件会自动依赖本包。"));
cpSync(join(root, "LICENSE"), join(hostDir, "LICENSE"));

const hostVersion = hostPkg.version;

const built = {};
for (const [key, meta] of Object.entries(ADDON_META)) {
  const dir = join(out, "packages", key);
  copyDir(pkgDirs[key], dir);
  const pkg = commonMeta(
    readJson(join(dir, "package.json")),
    `packages/${key}`,
    meta.description,
    meta.keywords,
  );
  pkg.files = [...new Set([...(pkg.files ?? ["lib", "cordis.patch.yml"]), "README.md", "LICENSE"])];
  const deps = { ...(pkg.dependencies ?? {}) };
  delete deps["dsh-workbench"];
  for (const [name, spec] of Object.entries(deps)) {
    if (!/^(?:file|link|workspace):/.test(spec)) continue;
    const provider = Object.values(built).find((dep) => dep.name === name);
    if (!provider) throw new Error(`${pkg.name} 的本地依赖 ${name} 必须先进入发布清单`);
    deps[name] = `^${provider.version}`;
  }
  deps[HOST_NAME] = `^${hostVersion}`;
  pkg.dependencies = deps;
  if (pkg.dsh?.client?.inject) {
    pkg.dsh.client.inject = pkg.dsh.client.inject.map((x) => (x === "dsh-workbench" ? HOST_NAME : x));
  }
  writeJson(join(dir, "package.json"), pkg);
  rewritePatch(join(dir, "cordis.patch.yml"), HOST_NAME);
  writeFileSync(join(dir, "README.md"), packageReadme(pkg, meta.marketExtra));
  cpSync(join(root, "LICENSE"), join(dir, "LICENSE"));
  built[key] = pkg;
}

// root README / license / marketplace drafts
cpSync(join(root, "README.md"), join(out, "README.md"));
cpSync(join(root, "LICENSE"), join(out, "LICENSE"));

const hostMarket = {
  file: "packages-host",
  sub: "host",
  category: "ui",
  en: "Shared runtime for the Personal Workbench: local SQLite, domain registration, agent tool, HTTP/SSE and opt-in cloud sync for the workbench plugins.",
  zh: "个人工作台共享宿主：本地 SQLite、业务域注册、agent 工具、HTTP/SSE，以及各工作台插件的可选云端同步。",
};
const marketEntries = [
  hostMarket,
  ...Object.entries(ADDON_META).map(([key, meta]) => ({
    file: `packages-${key}`,
    sub: key,
    category: meta.marketCategory,
    en: meta.marketEn,
    zh: meta.marketZh,
  })),
];
// 草稿目录整目录重建：插件删掉后不要残留过期条目。
rmSync(join(out, "marketplace"), { recursive: true, force: true });
mkdirSync(join(out, "marketplace"), { recursive: true });
for (const e of marketEntries) {
  const name = `${OWNER}/${REPO}#${e.sub}`;
  const url = `${REPO_URL}/tree/main/packages/${e.sub}`;
  const text = [
    `url: ${url}`,
    `name: ${name}`,
    `category: ${e.category}`,
    "description:",
    `  en: '${e.en.replaceAll("'", "''")}'`,
    `  zh: '${e.zh.replaceAll("'", "''")}'`,
    "",
  ].join("\n");
  writeFileSync(join(out, "marketplace", `${OWNER}__${REPO}--${e.file}.yml`), text);
}

const summary = {
  out,
  repo: REPO_URL,
  packages: ["host", ...releaseOrder],
  host: { name: hostPkg.name, version: hostPkg.version },
  addons: Object.fromEntries(Object.entries(built).map(([k, p]) => [k, { name: p.name, version: p.version }])),
  marketplace: readdirSync(join(out, "marketplace")),
};
// 发布顺序写进清单，publish-npm / publish-github 读它，避免再维护一份硬编码列表。
writeJson(join(out, "release.json"), {
  generatedAt: new Date().toISOString(),
  packages: summary.packages,
  host: summary.host,
  addons: summary.addons,
});
console.log(JSON.stringify(summary, null, 2));
