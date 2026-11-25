/**
 * 自动化兼容保留包（dsh-workbench-automation）。
 *
 * 定位：**不提供任何独立能力**。自动化引擎自宿主 dsh-workbench-host 0.17.0 起已内化：
 * 规则引擎、automation_rule / automation_run / automation_meta 三张表、19 个
 * automation.* action 与自动化页都在宿主里。
 *
 * 保留本包的原因有二：
 * 1. 市场条目与安装入口不 404：老配置、老链接指向 dsh-workbench-automation 时仍能装上；
 * 2. 旧备份可导回：备份里的 wb-addon-automation 导出域由宿主提供，本包不参与。
 *
 * 因此这里刻意不 registerDomain、不建表、不注册 action、不带 client —— 一旦带 client
 * 就会多出一个插件视图，插件数从 12 变 13，连带要改共享控件覆盖断言与文档口径。
 *
 * 0.5.1 起 cordis.patch.yml 也不再插入宿主行（连本插件自己的行都没有）：桌面端移除
 * 插件时会把 patch 里 insert 的行与存活的 loader 条目对拍，插了必然存活的行就永远报
 * `bundle-in-use`。没有行可插，这个包就不会再加载本文件——下面的日志只在被直接 import
 * 或将来加回行时才看得到，测试用 import 守着它。
 */

import { createRequire } from "node:module";

const HERE = createRequire(import.meta.url)("../package.json");
// 源码树里宿主包名是 dsh-workbench，发布树会被 stage-release 改写成 dsh-workbench-host；
// 两个名字都试一次，避免日志里出现「未知」版本。
const HOST_VERSION = (() => {
  const require = createRequire(import.meta.url);
  for (const name of ["dsh-workbench-host", "dsh-workbench"]) {
    try {
      return require(name + "/package.json").version;
    } catch {
      /* 换下一个包名 */
    }
  }
  return "未知";
})();

export const inject = ["workbench"];

export function apply(ctx) {
  const host = ctx?.workbench;
  if (!host) throw new Error("dsh-workbench 未加载：缺少 workbench 服务");
  // 这里只写日志，不注册任何域。宿主侧的「双跑防护」检测的是 wb-addon-automation 域，
  // 本包不注册该域，因此不会误停用宿主内置引擎。
  const since = HOST_VERSION === "未知" ? "" : " " + HOST_VERSION;
  console.info(
    "[automation] 自动化引擎自 dsh-workbench-host" +
      since +
      " 起已内置于宿主，本包（兼容保留包 " +
      HERE.version +
      "）不提供独立能力、不插入任何插件行；宿主需已安装，本包可安全卸载。",
  );
}
