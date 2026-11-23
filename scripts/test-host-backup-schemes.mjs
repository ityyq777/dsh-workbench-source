import assert from "node:assert/strict";

/** 由真实宿主 action 测试调用，也可在单独的临时库上验证。 */
export async function verifyBackupSchemes(call) {
  const get = () => call("wb.configGet", {});
  const set = values => call("wb.configSet", { values });
  const activate = id => call("wb.configSchemeActivate", { id });
  const create = (name, from) => call("wb.configSchemeCreate", { name, from });
  const original = await get();
  assert.equal(original.scheme, null);
  assert.deepEqual(original.schemes, []);
  assert.equal(original.values["backup.exportFormat"], "zip");
  assert.equal(original.values["backup.moduleIds"], null);
  assert.equal(original.values["cloud.conflictLimit"], 20);
  await set({ "audit.retentionDays": 123 });
  assert.equal((await get()).scheme, null);
  await assert.rejects(() => set({ "backup.exportFormat": "csv", "cloud.secret": "拒绝" }));
  assert.deepEqual((await get()).schemes, []);
  const local = await set({ "backup.exportFormat": "csv", "backup.moduleIds": ["wb-addon-tags"], "cloud.conflictLimit": 7 });
  const first = local.scheme.id;
  const copy = await create("复制", "current");
  assert.deepEqual(copy.values, local.values);
  await set({ "backup.moduleIds": [], "cloud.conflictLimit": 100 });
  const renamed = await call("wb.configSchemeRename", { id: copy.scheme.id, name: "工作日" });
  assert.equal(renamed.scheme.name, "工作日");
  assert.deepEqual(renamed.values["backup.moduleIds"], []);
  const reset = await call("wb.configReset", { ids: ["backup.moduleIds"] });
  assert.equal(reset.values["backup.moduleIds"], null);
  assert.ok(!Object.hasOwn(reset.overrides, "backup.moduleIds"));
  const fresh = await create("全量", "default");
  assert.equal(fresh.values["audit.retentionDays"], 123);
  assert.equal(fresh.values["backup.exportFormat"], "zip");
  await assert.rejects(() => activate("不存在"));
  await assert.rejects(() => call("wb.configSchemeRename", { id: first, name: "  " }));
  await assert.rejects(() => create("不会创建", "其他"));
  for (const values of [{ "backup.exportFormat": "tar" }, { "backup.moduleIds": [5] }, { "cloud.conflictLimit": 1.5 }, { "cloud.conflictLimit": 101 }]) {
    await assert.rejects(() => set({ "audit.retentionDays": 527, ...values }));
    assert.equal((await get()).values["audit.retentionDays"], 123);
  }
  await assert.rejects(() => call("wb.configReset", { ids: ["audit.retentionDays", "云端密钥"] }));
  assert.equal((await get()).values["audit.retentionDays"], 123);
  assert.equal((await get()).scheme.id, fresh.scheme.id);
  const restored = await activate(first);
  assert.deepEqual(restored.values, local.values);
  const none = await activate(null);
  assert.equal(none.scheme, null);
  assert.equal(none.values["backup.exportFormat"], "zip");
  await activate(first);
  await call("wb.configSchemeDelete", { id: copy.scheme.id });
  assert.equal((await get()).scheme.id, first);
  const deleted = await call("wb.configSchemeDelete", { id: first });
  assert.equal(deleted.scheme, null);
  assert.equal(deleted.schemes.length, 1);
  assert.equal(deleted.values["audit.retentionDays"], 123);
  return fresh.scheme.id;
}
