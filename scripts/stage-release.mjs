/**
 * 生成可发布到 GitHub / npm 的发布树。
 *
 * 主仓库里宿主包名是内部名 dsh-workbench；npm 上这个名字已被无关项目占用，
 * 因此发布名默认是 dsh-workbench-host（可用 NPM_HOST_NAME 覆盖）。
 * 业务插件仍使用 dsh-workbench-tasks / tags / sites / storage。
 *
 * 输出：
 *   dist/release/packages/{host,tasks,tags,sites,storage}  五个可安装包
 *   dist/release/marketplace/*.yml                 插件市场条目草稿
 *   dist/release/README.md / LICENSE
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "dist", "release");
const OWNER = process.env.GITHUB_OWNER ?? "ityyq777";
const REPO = process.env.GITHUB_REPO ?? "dsh-workbench";
const HOST_NAME = process.env.NPM_HOST_NAME ?? "dsh-workbench-host";
const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
const DSH_ENGINES = { dsh: ">=0.2.0-rc.1 <0.3.0" };
const NODE_ENGINES = { node: ">=22.5" };

const pkgDirs = {
  host: join(root, "packages", "shell-dist"),
  tasks: join(root, "packages", "addons", "tasks"),
  tags: join(root, "packages", "addons", "tags"),
  sites: join(root, "packages", "addons", "sites"),
  storage: join(root, "packages", "addons", "storage"),
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
  writeFileSync(file, src.replaceAll("name: 'dsh-workbench'", `name: '${hostName}'`));
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
writeFileSync(join(hostDir, "README.md"), packageReadme(hostPkg, "宿主本身不提供任务/标签/站点/物品视图；安装任一业务插件即可使用。业务插件会自动依赖本包。"));
cpSync(join(root, "LICENSE"), join(hostDir, "LICENSE"));

const hostVersion = hostPkg.version;
const addons = {
  storage: {
    dir: "storage",
    description: "个人工作台储物插件：名称、品牌、单位、库存文本与标签",
    keywords: ["storage", "inventory", "items", "tags"],
    marketCategory: "tools",
    marketEn: "Storage records for DSH: names, brands, units, stock text and tags with local SQLite and optional metadata sync.",
    marketZh: "DSH 储物：记录名称、品牌、单位、库存文本与标签，本地 SQLite 保存，可选元数据同步。",
    marketExtra: "管理物品库存文本台账，不上传或下载文件字节；卸载插件不删数据。",
  },
  tasks: {
    dir: "tasks",
    description: "个人工作台任务插件：任务树、优先级、截止日、时间线与重启",
    keywords: ["tasks", "todo", "tree", "timeline"],
    marketCategory: "workflow",
    marketEn: "Task manager for DSH: a task tree, nine list views, priorities, due dates, timeline/restart chains, batch merge and table moves.",
    marketZh: "DSH 任务管理：任务树、九个视图、优先级、截止日、时间线/重启链、批量归并与迁表。",
    marketExtra: "任务、标签、站点数据都保存在宿主 SQLite；卸载插件不删数据。",
  },
  tags: {
    dir: "tags",
    description: "个人工作台标签插件：创建与管理标签，为站点等业务提供标签归类",
    keywords: ["tags", "label", "catalog"],
    marketCategory: "tools",
    marketEn: "Tag manager for DSH: create, search and delete tags, with soft-delete and per-item mappings used by the Sites plugin.",
    marketZh: "DSH 标签管理：创建、搜索、删除标签，支持软删除与条目映射，供站点插件使用。",
    marketExtra: "标签被删除后，站点等引用它的条目会失去该标签，但条目本身保留。",
  },
  sites: {
    dir: "sites",
    description: "个人工作台站点插件：目录树、链接与标签",
    keywords: ["sites", "bookmarks", "links", "tree"],
    marketCategory: "tools",
    marketEn: "Site bookmark manager for DSH: a folder tree, multiple links per site, tags and filtering, with per-folder views.",
    marketZh: "DSH 站点收藏：目录树、每个站点多条链接、标签与筛选，支持按目录浏览。",
    marketExtra: "标签功能在检测到 dsh-workbench-tags 已安装时显示；未安装时站点仍可正常使用目录与链接。",
  },
};

const built = {};
for (const [key, meta] of Object.entries(addons)) {
  const dir = join(out, "packages", meta.dir);
  copyDir(pkgDirs[key], dir);
  const pkg = commonMeta(
    readJson(join(dir, "package.json")),
    `packages/${meta.dir}`,
    meta.description,
    meta.keywords,
  );
  pkg.files = ["lib", "cordis.patch.yml", "README.md", "LICENSE"];
  const deps = { ...(pkg.dependencies ?? {}) };
  delete deps["dsh-workbench"];
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

const marketEntries = [
  { file: "packages-host", sub: "host", pkg: hostPkg, category: "ui", en: "Shared runtime for the Personal Workbench: local SQLite, domain registration, agent tool, HTTP/SSE and opt-in cloud sync for the Tasks, Tags, Sites and Storage plugins.", zh: "个人工作台共享宿主：本地 SQLite、业务域注册、agent 工具、HTTP/SSE，以及任务/标签/站点/物品插件的可选云端同步。" },
  { file: "packages-tasks", sub: "tasks", pkg: built.tasks, category: "workflow", en: addons.tasks.marketEn, zh: addons.tasks.marketZh },
  { file: "packages-tags", sub: "tags", pkg: built.tags, category: "tools", en: addons.tags.marketEn, zh: addons.tags.marketZh },
  { file: "packages-sites", sub: "sites", pkg: built.sites, category: "tools", en: addons.sites.marketEn, zh: addons.sites.marketZh },
  { file: "packages-storage", sub: "storage", pkg: built.storage, category: "tools", en: addons.storage.marketEn, zh: addons.storage.marketZh },
];
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
  host: { name: hostPkg.name, version: hostPkg.version },
  addons: Object.fromEntries(Object.entries(built).map(([k, p]) => [k, { name: p.name, version: p.version }])),
  marketplace: readdirSync(join(out, "marketplace")),
};
console.log(JSON.stringify(summary, null, 2));
