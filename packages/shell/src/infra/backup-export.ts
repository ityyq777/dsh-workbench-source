/**
 * 备份的可读导出：把各模块 exportData 的结果按表拆成 json / csv / txt 文件。
 *
 * 产物始终是 zip：`metadata.json` 放元数据，每张表一个文件（表级导出）。
 * zip 仍是唯一可回导的形态；这三种格式只解决「看得懂、能直接进表格」。
 * 「表」的判定：顶层数组算一张表，对象里每个「对象数组」字段算一张表，
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

/**
 * 产出可读导出包：始终是 zip，元数据固定为 metadata.json，每张表一个文件。
 *
 * - json：`<模块id>.<表名>.json`，内容是行对象数组；
 * - csv：`<模块id>.<表名>.csv`，UTF-8 BOM + RFC4180；
 * - txt：`<模块id>.<表名>.txt`，列用 ` | ` 分隔的纯文本表。
 *
 * metadata.json 记录 kind / format / 版本 / 导出时间与每张表的文件、行数、列名；
 * 没有 manifest.json，所以导入接口会把它当无效备份拒绝。
 */
export function buildReadableExport(opts: {
  format: Exclude<BackupExportFormat, "zip">;
  modules: BackupExportModule[];
  shellVersion: string;
  formatVersion: number;
  exportedAt: Date;
}): ReadableExportFile {
  const stamp = backupStamp(opts.exportedAt);
  const files: { name: string; data: Buffer }[] = [];
  const modules: {
    id: string;
    title: string;
    version: string;
    tables: { name: string; file: string; rows: number; columns: string[] }[];
  }[] = [];
  for (const m of opts.modules) {
    const tables = exportTablesOf(m.data).map((table) => {
      const file = m.id + "." + table.name + "." + opts.format;
      const text =
        opts.format === "json"
          ? JSON.stringify(table.rows, null, 2) + "\n"
          : opts.format === "csv"
            ? toCsv(table)
            : txtTable(table) + "\n";
      files.push({ name: file, data: Buffer.from(text, "utf8") });
      return { name: table.name, file, rows: table.rows.length, columns: columnsOf(table.rows) };
    });
    modules.push({ id: m.id, title: m.title, version: m.version, tables });
  }
  const metadata = {
    kind: READABLE_EXPORT_KIND,
    format: opts.format,
    formatVersion: opts.formatVersion,
    shellVersion: opts.shellVersion,
    exportedAt: opts.exportedAt.toISOString(),
    note: "只读导出，按表拆分，元数据在 metadata.json；不能导入恢复，需要恢复数据请导出 zip 备份包。",
    modules,
  };
  files.unshift({ name: "metadata.json", data: Buffer.from(JSON.stringify(metadata, null, 2), "utf8") });
  return {
    filename: "dsh-workbench-export-" + stamp + "-" + opts.format + ".zip",
    contentType: "application/zip",
    buffer: zipCreate(files),
  };
}
