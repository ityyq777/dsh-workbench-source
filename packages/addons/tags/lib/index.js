/**
 * 标签子插件（宿主侧）。
 *
 * 所有业务逻辑都在本地 SQLite 完成；云端只负责备份。
 * migrations 故意留空：ensureSchema 需要先检测 v2 旧表（is_deleted/update_time）
 * 再建平台列（deleted_at/updated_at），不能交给宿主先跑 migrations。
 */

import { ensureSchema } from "./db.js";
import { registerTagActions } from "./tags.js";

export const migrations = [];

export function setup(api) {
  ensureSchema(api.db, api.log);
  registerTagActions(api);
  api.log("tags addon ready", api.addon.version);
}

export default { migrations: migrations, setup: setup };
