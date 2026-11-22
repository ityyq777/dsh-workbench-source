/**
 * 备份的可读导出：把各模块 exportData 的结果转成 json / csv / txt。
 *
 * zip 仍是唯一可回导的形态；这三种格式只解决「看得懂、能直接进表格」。
 * CSV/TXT 把模块数据拆成表：顶层数组算一张表，对象里每个「对象数组」字段算一张表，
 * 纯配置对象（没有数组字段）整体当作一行。
 */
import { zipCreate } from "./zip.js";

export type BackupExportFormat = "zip" | "json" | "csv" | "txt";

export function normalizeBackupFormat(value: unknown): BackupExportFormat {
  return value === "json" || value === "csv" || value === "txt" ? value : "zip";
}

/** 参与可读导出的一个模块；data 是插件 exportData 的原样结果。 */
export interface BackupExportModule {
  id: string;
  title: string;
  version: string;
  data: unknown;
}

/** 一张可读表；rows 里的键即导出列。 */
export interface ExportTable {
  name: string;
  rows: Record<string, unknown>[];
}

export interface ReadableExportFile {
  filename: string;
  /** 响应头用的 MIME；多表 CSV 会打包成 zip。 */
  contentType: string;
  buffer: Buffer;
}

/** 可读导出的 kind：与 dsh-workbench-backup 区分开，导入侧会明确拒绝它。 */
export const READABLE_EXPORT_KIND = "dsh-workbench-export";

const CSV_BOM = "\uFEFF";

export function backupStamp(value: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return value.getFullYear() + p(value.getMonth() + 1) + p(value.getDate()) + "-" +
    p(value.getHours()) + p(value.getMinutes()) + p(value.getSeconds());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function rowsOf(value: unknown[]): Record<string, unknown>[] {
  return value.map((row) => (isPlainObject(row) ? row : { value: row }));
}

/** 把模块数据拆成可读表；没有任何数据时返回空数组。 */
export function exportTablesOf(data: unknown): ExportTable[] {
  if (Array.isArray(data)) return data.length ? [{ name: "rows", rows: rowsOf(data) }] : [];
  if (!isPlainObject(data)) return [{ name: "value", rows: [{ value: data }] }];
  const tables: ExportTable[] = [];
  let arrayKeys = 0;
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (!Array.isArray(value)) continue;
    arrayKeys += 1;
    if (value.length) tables.push({ name: key, rows: rowsOf(value) });
  }
  // 一个数组字段都没有（纯配置对象）：整体当成一行更好读，也避免产出空文件。
  if (!arrayKeys) return [{ name: "record", rows: [data] }];
  return tables;
}

function columnsOf(rows: Record<string, unknown>[]): string[] {
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (seen.has(key)) continue;
      seen.add(key);
      columns.push(key);
    }
  }
  return columns;
}

function csvCell(value: unknown): string {
  if (value === undefined || value === null) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

export function toCsv(table: ExportTable): string {
  const columns = columnsOf(table.rows);
  const lines = [columns.map(csvCell).join(",")];
  for (const row of table.rows) lines.push(columns.map((key) => csvCell(row[key])).join(","));
  // BOM 让 Excel 直接按 UTF-8 打开，中文不乱码。
  return CSV_BOM + lines.join("\r\n") + "\r\n";
}

function txtCell(value: unknown): string {
  if (value === undefined || value === null) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return text.replace(/\r?\n/g, "\\n").replaceAll("|", "\\|");
}

function txtTable(table: ExportTable): string {
  const columns = columnsOf(table.rows);
  const lines = [
    "## " + table.name + "（" + table.rows.length + " 行）",
    columns.join(" | "),
    "-".repeat(56),
  ];
  for (const row of table.rows) lines.push(columns.map((key) => txtCell(row[key])).join(" | "));
  return lines.join("\n");
}

function buildTxt(opts: {
  modules: BackupExportModule[];
  shellVersion: string;
  formatVersion: number;
  exportedAt: Date;
}): string {
  const blocks: string[] = [
    [
      "# 个人工作台数据导出",
      "# 导出时间：" + opts.exportedAt.toISOString(),
      "# 壳版本：" + opts.shellVersion,
      "# 格式版本：" + opts.formatVersion,
      "# 说明：只读导出，不能导入恢复；需要恢复数据请导出 zip 备份包。",
    ].join("\n"),
  ];
  for (const m of opts.modules) {
    blocks.push([
      "",
      "═".repeat(68),
      "模块：" + m.title + "（" + m.id + "） · 版本 " + (m.version || "?"),
      "═".repeat(68),
    ].join("\n"));
    const tables = exportTablesOf(m.data);
    if (!tables.length) {
      blocks.push("（该模块暂无数据）");
      continue;
    }
    for (const table of tables) blocks.push("", txtTable(table));
  }
  return blocks.join("\n") + "\n";
}

/** 产出可读导出文件；CSV 多表时打包成 zip，文件名与 MIME 随格式变化。 */
export function buildReadableExport(opts: {
  format: Exclude<BackupExportFormat, "zip">;
  modules: BackupExportModule[];
  shellVersion: string;
  formatVersion: number;
  exportedAt: Date;
}): ReadableExportFile {
  const stamp = backupStamp(opts.exportedAt);
  if (opts.format === "json") {
    const payload = {
      kind: READABLE_EXPORT_KIND,
      formatVersion: opts.formatVersion,
      shellVersion: opts.shellVersion,
      exportedAt: opts.exportedAt.toISOString(),
      note: "可读导出，不能导入恢复；需要恢复数据请使用 zip 备份包。",
      modules: opts.modules,
    };
    return {
      filename: "dsh-workbench-export-" + stamp + ".json",
      contentType: "application/json; charset=utf-8",
      buffer: Buffer.from(JSON.stringify(payload, null, 2), "utf8"),
    };
  }
  if (opts.format === "txt") {
    return {
      filename: "dsh-workbench-export-" + stamp + ".txt",
      contentType: "text/plain; charset=utf-8",
      buffer: Buffer.from(buildTxt(opts), "utf8"),
    };
  }
  const files: { name: string; data: Buffer }[] = [];
  for (const m of opts.modules) {
    for (const table of exportTablesOf(m.data)) {
      files.push({ name: m.id + "." + table.name + ".csv", data: Buffer.from(toCsv(table), "utf8") });
    }
  }
  if (files.length === 1) {
    return { filename: "dsh-workbench-export-" + stamp + ".csv", contentType: "text/csv; charset=utf-8", buffer: files[0].data };
  }
  return {
    filename: "dsh-workbench-export-" + stamp + ".zip",
    contentType: "application/zip",
    buffer: zipCreate(files),
  };
}
