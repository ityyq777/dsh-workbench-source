/**
 * 任务记录子插件（宿主侧）。
 *
 * 所有业务逻辑都在本地 SQLite 完成；云端只负责备份。
 * migrations 故意留空：迁移必须在 setup 开头检测旧表后再建表，
 * 否则 AddonManager 会先执行 migrations 而错过旧 MPTT/tasks 检测。
 */

import { ensureSchema } from "./db.js";
import { registerTaskActions } from "./tasks.js";
import { registerTreeActions } from "./tree.js";

export const migrations = [];

export function setup(api) {
  ensureSchema(api.db, api.log);
  registerTaskActions(api);
  registerTreeActions(api);
  api.log("tasks addon ready", api.addon.version);
}

export default { migrations: migrations, setup: setup };
