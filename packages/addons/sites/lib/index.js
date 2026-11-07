/**
 * 站点子插件入口。
 * 业务全部本地；云端只备份数据。
 */

import { ensureSchema } from "./db.js";
import { registerSiteTreeActions } from "./tree.js";
import { registerSiteActions } from "./sites.js";

export const migrations = [];

export function setup(api) {
  ensureSchema(api.db, api.log);
  registerSiteTreeActions(api);
  registerSiteActions(api);
  api.log("sites addon ready");
}

export default { migrations, setup };
