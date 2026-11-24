import assert from "node:assert/strict";
import test from "node:test";
import { parseDomainRoles } from "../lib/index.js";

const domain = "wb-addon-test";
const role = { id: "reviewer", name: "文稿审阅者", description: "检查现有文稿", version: "1", instructions: "先标注待核实的结论。", actions: ["docs.read"] };

test("旧业务域可以省略角色，纯对话角色可以声明空动作列表", () => {
  assert.deepEqual(parseDomainRoles(domain, undefined), []);
  assert.deepEqual(parseDomainRoles(domain, []), []);
  const pure = { ...role, actions: [] };
  assert.deepEqual(parseDomainRoles(domain, [pure]), [pure]);
});

test("动作清单可省略：只写指令的角色照样能注册", () => {
  const { actions, ...noActions } = role;
  assert.deepEqual(parseDomainRoles(domain, [noActions]), [{ ...role, actions: [] }]);
});

test("宿主获得独立声明快照，按精确动作名去重", () => {
  const input = { ...role, actions: ["docs.read", "docs.read"], domainId: "other" };
  const copy = parseDomainRoles(domain, [input]);
  input.actions.push("docs.delete");
  input.instructions = "变更后的说明";
  assert.deepEqual(copy, [role]);
});

test("拒绝同域重复角色、带命名空间或格式错误的域内标识", () => {
  assert.throws(() => parseDomainRoles(domain, [role, role]), /id 重复/);
  for (const id of ["other/publisher", "*", "0-role", "大写", "WithCaps"]) {
    assert.throws(() => parseDomainRoles(domain, [{ ...role, id }]), /\.id /);
  }
});

test("拒绝畸形、缺字段或动作清单含通配符的角色声明", () => {
  for (const value of [null, "", {}, [null], new Array(1)]) {
    assert.throws(() => parseDomainRoles(domain, value), /必须是/);
  }
  // actions 现在可选，其余字段仍必填。
  for (const key of Object.keys(role).filter((name) => name !== "actions")) {
    assert.throws(() => parseDomainRoles(domain, [{ ...role, [key]: undefined }]), new RegExp(key));
  }
  for (const item of [{ version: 2 }, { name: " " }, { actions: ["docs.*"] }, { actions: [true] }, { actions: ["docs"] }]) {
    assert.throws(() => parseDomainRoles(domain, [{ ...role, ...item }]));
  }
});
