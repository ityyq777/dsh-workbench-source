import { gunzipSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";

/**
 * 安全解包 ustar + gzip。
 *
 * 只接受普通文件与目录；拒绝绝对路径、..、符号/硬链接、设备文件、PAX 扩展。
 * 这是「云端下载的代码」进入本机前的第一道闸。
 */
export interface ExtractLimits {
  maxFiles?: number;
  maxBytes?: number;
  maxFileBytes?: number;
}

const BLOCK = 512;

function str(block: Buffer, offset: number, length: number): string {
  const raw = block.subarray(offset, offset + length);
  const nul = raw.indexOf(0);
  return raw.subarray(0, nul === -1 ? raw.length : nul).toString("utf8").trim();
}

function octal(block: Buffer, offset: number, length: number): number {
  const s = str(block, offset, length).replace(/[^0-7]/g, "");
  return s ? parseInt(s, 8) : 0;
}

function safeRelPath(name: string): string {
  const normalized = name.replace(/\\/g, "/").replace(/^\.?\/+/, "");
  if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) {
    throw new Error("tar 条目路径非法：" + JSON.stringify(name));
  }
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length === 0 || parts.some((p) => p === ".." || p === ".")) {
    throw new Error("tar 条目路径越界：" + JSON.stringify(name));
  }
  return parts.join("/");
}

function inside(root: string, rel: string): string {
  const target = resolve(root, rel);
  if (target !== root && !target.startsWith(root + sep)) {
    throw new Error("tar 条目逃逸出目标目录：" + rel);
  }
  return target;
}

export function extractTarGz(archive: Buffer, destDir: string, limits: ExtractLimits = {}): string[] {
  const maxFiles = limits.maxFiles ?? 500;
  const maxBytes = limits.maxBytes ?? 20 * 1024 * 1024;
  const maxFileBytes = limits.maxFileBytes ?? 8 * 1024 * 1024;

  const tar = gunzipSync(archive, { maxOutputLength: maxBytes + BLOCK });
  if (tar.length > maxBytes + BLOCK) {
    throw new Error("解包后体积超过上限");
  }

  const root = resolve(destDir);
  mkdirSync(root, { recursive: true });

  const files: string[] = [];
  let offset = 0;
  let total = 0;

  while (offset + BLOCK <= tar.length) {
    const header = tar.subarray(offset, offset + BLOCK);
    if (header.every((b) => b === 0)) break;

    const name = str(header, 0, 100);
    const prefix = str(header, 345, 155);
    const fullName = prefix ? prefix + "/" + name : name;
    const size = octal(header, 124, 12);
    const type = String.fromCharCode(header[156] || 0);
    const mode = octal(header, 100, 8);
    const checksumField = octal(header, 148, 8);

    let checksum = 0;
    for (let i = 0; i < BLOCK; i += 1) {
      checksum += i >= 148 && i < 156 ? 32 : header[i];
    }
    if (checksum !== checksumField) {
      throw new Error("tar 头校验和不匹配：" + fullName);
    }

    const dataStart = offset + BLOCK;
    const dataEnd = dataStart + size;
    if (dataEnd > tar.length) {
      throw new Error("tar 数据被截断：" + fullName);
    }

    if (type === "5") {
      mkdirSync(inside(root, safeRelPath(fullName)), { recursive: true });
    } else if (type === "0" || type === "\u0000" || type === "") {
      if (size > maxFileBytes) {
        throw new Error("单个文件超过上限：" + fullName + "（" + size + " bytes）");
      }
      total += size;
      if (total > maxBytes) {
        throw new Error("解包总大小超过上限");
      }
      files.push(safeRelPath(fullName));
      if (files.length > maxFiles) {
        throw new Error("文件数超过上限：" + maxFiles);
      }
      const target = inside(root, safeRelPath(fullName));
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, tar.subarray(dataStart, dataEnd), { mode: mode & 0o111 ? 0o755 : 0o644 });
    } else if (type === "x" || type === "g" || type === "L" || type === "K") {
      throw new Error("不支持 tar 扩展头（PAX/GNU）：" + fullName);
    } else {
      throw new Error("不支持 tar 条目类型 " + JSON.stringify(type) + "：" + fullName);
    }

    offset = dataStart + Math.ceil(size / BLOCK) * BLOCK;
  }

  return files;
}
