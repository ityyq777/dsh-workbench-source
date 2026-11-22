/**
 * 数据清空：把本机工作台恢复到「刚装好插件」的状态。
 *
 * 只删行、不删表：各业务域 setup 只执行一次，闭包一直持有同一个 DatabaseSync 句柄，
 * 删库重开会留下悬空句柄；保留表结构逐表清空，宿主与插件都能继续使用原连接。
 * 云端相关文件（cloud-config.json / cloud-creds.json / 旧版 vault-device.key）
 * 一并删除，等价于断开云端并回到默认「共享云端 + 未登录」。
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";

/** 界面与接口共用的确认词：必须原样输入才会真的清空。 */
export const CLEAR_CONFIRM = "清空全部数据";

/** 需要一并删除的宿主状态文件；私有密钥文件不参与同步，清空后由插件按需重建。 */
const HOST_STATE_FILES = ["cloud-config.json", "cloud-creds.json", "vault-device.key"];

export interface ClearDatabaseResult {
  /** 清空的表数量。 */
  tables: number;
  /** 删除的总行数。 */
  rows: number;
  /** 表名，便于回执与测试断言。 */
  names: string[];
}

export interface ClearHostResult extends ClearDatabaseResult {
  /** 实际删除的宿主状态文件名。 */
  files: string[];
}

/** 除 SQLite 内部表以外的所有表；只读查询，不改变数据。 */
export function listDataTables(db: DatabaseSync): string[] {
  const rows = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all() as { name: string }[];
  return rows.map((row) => String(row.name));
}

function quoteIdent(name: string): string {
  return '"' + name.replace(/"/g, '""') + '"';
}

/** 逐表删除全部数据（含自增计数），保留表结构。调用方负责串行化，避免与同步并发。 */
export function clearDatabase(db: DatabaseSync): ClearDatabaseResult {
  const names = listDataTables(db);
  let rows = 0;
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const name of names) {
      const result = db.prepare("DELETE FROM " + quoteIdent(name)).run();
      rows += Number(result.changes ?? 0);
    }
    // AUTOINCREMENT 表的计数也回到起点；没有自增表时 sqlite_sequence 不存在，忽略。
    try {
      db.exec("DELETE FROM sqlite_sequence");
    } catch {
      /* ignore */
    }
    db.exec("COMMIT");
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw e;
  }

  // 清空后回收 WAL 与文件体积；失败不影响清空结果。
  try {
    db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
    db.exec("VACUUM");
  } catch {
    /* 回收失败只影响体积，不影响数据已删 */
  }
  return { tables: names.length, rows, names };
}

/** 删除云端连接与旧版设备密钥文件，返回实际删除的文件名。 */
export function clearHostFiles(home: string): string[] {
  const removed: string[] = [];
  for (const name of HOST_STATE_FILES) {
    const file = join(home, name);
    if (!existsSync(file)) continue;
    rmSync(file, { force: true });
    removed.push(name);
  }
  return removed;
}
