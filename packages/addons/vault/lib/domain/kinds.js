/**
 * 凭据的多类型（vault_secret_kind）。
 *
 * 0.6.0 起一条凭据可以同时是多种类型（例如「账号 + 密码」），类型不再落在
 * vault_secret.kind 单列上，也不参与加密 AAD——改类型只动关联表，不重加密。
 * 对外一律按 KINDS 的固定顺序返回，避免同一条凭据在不同入口显示顺序不同。
 */
import { newId } from "../db/db.js";
import { KINDS } from "./secret-input.js";

const ORDER = new Map(KINDS.map((kind, index) => [kind, index]));

function sortKinds(list) {
  return list.slice().sort((a, b) => (ORDER.get(a) ?? 999) - (ORDER.get(b) ?? 999));
}

export function kindsOf(db, secretId) {
  const rows = db
    .prepare("SELECT kind FROM vault_secret_kind WHERE secret_id = ? AND deleted_at IS NULL")
    .all(String(secretId));
  return sortKinds(rows.map((row) => String(row.kind)));
}

/** 批量取类型，列表页一次查完，避免 N+1。 */
export function kindsMap(db, secretIds) {
  const out = new Map();
  const ids = Array.from(new Set((secretIds || []).map(String))).filter(Boolean);
  if (!ids.length) return out;
  const marks = ids.map(() => "?").join(",");
  const rows = db
    .prepare("SELECT secret_id, kind FROM vault_secret_kind WHERE deleted_at IS NULL AND secret_id IN (" + marks + ")")
    .all(...ids);
  for (const row of rows) {
    const key = String(row.secret_id);
    if (!out.has(key)) out.set(key, []);
    out.get(key).push(String(row.kind));
  }
  for (const [, list] of out) list.sort((a, b) => (ORDER.get(a) ?? 999) - (ORDER.get(b) ?? 999));
  return out;
}

export function attachKinds(db, secretId, kinds, ts) {
  const stmt = db.prepare(
    "INSERT INTO vault_secret_kind(id, secret_id, kind, created_at, updated_at, rev) VALUES(?, ?, ?, ?, ?, 1)",
  );
  for (const kind of kinds) stmt.run(newId("sk"), String(secretId), String(kind), ts, ts);
}

/** 把某条凭据的类型集合改成 next：多退少补，软删旧行，保留 rev 以便同步收敛。 */
export function replaceKinds(db, secretId, next, ts) {
  const current = new Set(kindsOf(db, secretId));
  const wanted = new Set(next);
  for (const kind of current) {
    if (wanted.has(kind)) continue;
    db.prepare(
      "UPDATE vault_secret_kind SET deleted_at = ?, updated_at = ?, rev = rev + 1 " +
        "WHERE secret_id = ? AND kind = ? AND deleted_at IS NULL",
    ).run(ts, ts, String(secretId), kind);
  }
  const stmt = db.prepare(
    "INSERT INTO vault_secret_kind(id, secret_id, kind, created_at, updated_at, rev) VALUES(?, ?, ?, ?, ?, 1)",
  );
  for (const kind of wanted) {
    if (current.has(kind)) continue;
    stmt.run(newId("sk"), String(secretId), kind, ts, ts);
  }
}
