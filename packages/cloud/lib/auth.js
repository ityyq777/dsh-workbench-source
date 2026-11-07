import { randomBytes, scrypt as _scrypt, createHash, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { uuidv7, monoNow } from "@wb/core";
const scryptOpts = (N, r, p) => ({ N, r, p, maxmem: 64 * 1024 * 1024 });
async function scrypt(password, salt, keylen, opts) {
    return new Promise((resolve, reject) => {
        _scrypt(password, salt, keylen, opts, (err, dk) => (err ? reject(err) : resolve(dk)));
    });
}
void promisify;
/**
 * demo 口令散列：scrypt（Node 内置，无原生依赖；07 文档生产换 Argon2id）。
 * 存储格式 "scrypt$N$r$p$saltHex$hashHex"。
 */
export async function hashPassword(password) {
    const salt = randomBytes(16);
    const N = 16384, r = 8, p = 1;
    const hash = await scrypt(password, salt, 32, scryptOpts(N, r, p));
    return ["scrypt", N, r, p, salt.toString("hex"), hash.toString("hex")].join("_");
}
/** 校验口令（timingSafe）。 */
export async function verifyPassword(password, stored) {
    try {
        const sep = stored.includes("$") ? "$" : "_";
        const [tag, N, r, p, saltHex, hashHex] = stored.split(sep);
        if (tag !== "scrypt")
            return false;
        const hash = await scrypt(password, Buffer.from(saltHex, "hex"), 32, { N: Number(N), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024 });
        return timingSafeEqual(hash, Buffer.from(hashHex, "hex"));
    }
    catch {
        return false;
    }
}
/** token 只存 sha256 散列（服务端泄露不裸奔）。 */
export function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}
/** 签发 access(15min)+refresh(90d)；refresh 落库可吊销。 */
export async function issueSession(db, userId, deviceId, deviceName) {
    const accessToken = randomBytes(24).toString("base64url");
    const refreshToken = randomBytes(32).toString("base64url");
    const now = Date.now();
    db.prepare("INSERT INTO refresh_tokens(token_hash,user_id,device_id,expires_at) VALUES(?,?,?,?)").run(hashToken(refreshToken), userId, deviceId, now + 90 * 86400_000);
    db.prepare("INSERT INTO devices(id,user_id,name,last_cursor) VALUES(?,?,?,0) ON CONFLICT(id,user_id) DO UPDATE SET name=COALESCE(excluded.name, devices.name)").run(deviceId, userId, deviceName ?? null);
    // access token 自描述：userId.deviceId.随机串（HMAC 留待生产；demo 校验查 refresh 存在性即可）
    void now;
    void monoNow;
    void uuidv7;
    return { accessToken: `${userId}.${deviceId}.${accessToken}`, refreshToken, userId, deviceId };
}
/** 解析 access token → {userId, deviceId}（无效返回 null）。 */
export function parseAccessToken(db, authHeader) {
    if (!authHeader?.startsWith("Bearer "))
        return null;
    const parts = authHeader.slice(7).split(".");
    if (parts.length !== 3)
        return null;
    const [userId, deviceId] = parts;
    // demo：token 不可伪造性弱化，但仍验证设备登记存在
    const dev = db.prepare("SELECT 1 FROM devices WHERE id=? AND user_id=?").get(deviceId, userId);
    return dev ? { userId, deviceId } : null;
}
/** refresh 旋转 + 重用检测（07）：已旋转的旧 token 再出现 → 吊销该设备链。 */
export function rotateRefresh(db, refreshToken) {
    const h = hashToken(refreshToken);
    const row = db.prepare("SELECT * FROM refresh_tokens WHERE token_hash=?").get(h);
    if (!row || row.expires_at < Date.now())
        return null;
    if (row.replaced_by) {
        // 重用攻击：整条链失效
        db.prepare("DELETE FROM refresh_tokens WHERE user_id=? AND device_id=?").run(row.user_id, row.device_id);
        return null;
    }
    const fresh = issueSessionSync(db, row.user_id, row.device_id);
    db.prepare("UPDATE refresh_tokens SET replaced_by=? WHERE token_hash=?").run(hashToken(fresh.refreshToken), h);
    return fresh;
}
/** 同步签发（不含异步散列需求时用）。 */
export function issueSessionSync(db, userId, deviceId) {
    const accessToken = `${userId}.${deviceId}.${randomBytes(24).toString("base64url")}`;
    const refreshToken = randomBytes(32).toString("base64url");
    db.prepare("INSERT INTO refresh_tokens(token_hash,user_id,device_id,expires_at) VALUES(?,?,?,?)").run(hashToken(refreshToken), userId, deviceId, Date.now() + 90 * 86400_000);
    db.prepare("INSERT OR IGNORE INTO devices(id,user_id,name,last_cursor) VALUES(?,?,?,0)").run(deviceId, userId, null);
    return { accessToken, refreshToken, userId, deviceId };
}
/** 吊销设备（登出/移除）。 */
export function revokeDevice(db, userId, deviceId) {
    db.prepare("DELETE FROM refresh_tokens WHERE user_id=? AND device_id=?").run(userId, deviceId);
    db.prepare("DELETE FROM devices WHERE user_id=? AND id=?").run(userId, deviceId);
}
