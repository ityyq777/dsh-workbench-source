/** 通过宿主公开入口验证角色选择、轮次、工具权限和单次命令角色。 */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
const dir = mkdtempSync(join(tmpdir(), "wb-role-host-"));
process.env.WB_HOME = dir;
const cleanups = [], events = new Map(), tools = new Map();
let route, section, host, plan = false;
const ctx = {
  webServer: { register(r) { if(r.path === "/workbench/api") route = r; } },
  tools: { register(def, opt) { tools.set(def.name, {def,opt}); } },
  systemPrompt: { getSectionOrder: () => 500, section(def) { section = def; } },
  planMode: { get: () => ({active:plan}) },
  effect(fn) { const d = fn(); if (typeof d === "function") cleanups.push(d); },
  inject(_, cb) { cb(ctx); },
  on(type,fn) { events.set(type,fn); },
  provide(_, service) { host = service; },
};
async function http(method, path, body) {
  const req = Object.assign(Readable.from(body ? [Buffer.from(JSON.stringify(body))] : []), {method,url:"/workbench/api/" + path});
  let result;
  await route.handler(req,{writeHead(status) {this.status = status;}, end(data) {result = {status:this.status, ...JSON.parse(data)};}});
  return result;
}
const agent = {session:{id:"main"}};
const claim = (id, turn) => events.get("agent/inbox/claimed")({agent,message:{id},turn});
const invoke = async (name, action, args = {}, identity = agent) => (await tools.get(name).def.execute({action,args}, {agent:identity})).text;
try {
  const shell = await import("../packages/shell/lib/index.js");
  shell.apply(ctx);
  const fixture = { id:"wb-addon-example", category:"other", title:"示例", version:"1", roles:[{id:"reader", name:"检查员",description:"读记录",version:"1",instructions:"只读示例",actions:["actions.list","actions.help","example.read"]}],
    capability:{records:[{kind:"示例",primaryAction:"example.create"}]},
    setup(api) { for (const name of ["example.read","example.update","example.create"]) api.action(name,{description:name,execute:()=>name}); }};
  const unload = host.registerDomain(fixture);
  const catalog = body => http("POST", "role-catalog", body);
  const [builtin] = (await http("GET", "role-catalog")).roles;
  assert.equal(builtin.source,"plugin");
  for (const op of ["update", "delete"]) assert.equal((await catalog({op,id:builtin.id})).status,400);
  const clone = (await catalog({op:"copy",id:builtin.id})).role;
  assert.equal(clone.source,"user");
  assert.deepEqual(clone.actions,builtin.actions);
  const copiedAgain = (await catalog({op:"copy",id:clone.id})).role;
  assert.notEqual(copiedAgain.id,clone.id);
  const custom = (await catalog({op:"create",name:"审查员",description:"校对",instructions:"检查用字"})).role;
  assert.deepEqual(custom.actions,[]);
  assert.equal((await catalog({op:"update",id:custom.id,actions:["*"]})).status,400);
  const selectCustom = () => http("POST","session-role",{sessionId:"catalog",roleId:custom.id});
  assert.equal((await selectCustom()).unavailable,false);
  const customAgent = {session:{id:"catalog"}};
  assert.match(section.text({agent:customAgent}),/检查用字/);
  assert.match(await invoke("Workbench","example.read",{},customAgent),/ACTION_ROLE_DENIED/);
  const edited = (await catalog({op:"update",id:custom.id,instructions:"检查结构",actions:["example.read"]})).role;
  assert.notEqual(edited.version,custom.version);
  assert.equal((await http("GET","session-role?sessionId=catalog")).unavailable,true);
  await selectCustom();
  assert.match(section.text({agent:customAgent}),/检查结构/);
  assert.equal(await invoke("Workbench","example.read",{},customAgent),'"example.read"');
  await catalog({op:"delete",id:custom.id});
  assert.equal((await http("GET","session-role?sessionId=catalog")).unavailable,true);
  assert.equal((await catalog({op:"copy",id:custom.id})).status,400);
  assert.equal("enabled" in await http("GET","session-role?sessionId=main"),false);
  assert.equal(section.text({agent}),"");
  assert.equal(tools.has("WorkbenchRecord"),false);
  const patch = body => http("POST","session-role",{sessionId:"main", ...body});
  assert.equal((await patch({roleId:"unknown"})).status,400);
  assert.equal((await patch({roleId:"wb-addon-example/reader"})).status,200);
  assert.equal((await patch({roleId:null,enabled:true})).status,400);
  claim("first",1);
  assert.match(section.text({agent}),/只读示例/);
  assert.match(section.text({agent}),/first/);
  assert.match(await invoke("Workbench","example.update",{sessionId:"other"}),/ACTION_ROLE_DENIED/);
  assert.doesNotMatch(await invoke("Workbench","actions.list"),/example.update/);
  assert.match(await invoke("Workbench","actions.help",{action:"example.update"}),/错误/);
  assert.match(await invoke("Workbench","example.read"),/example.read/);
  plan = true;
  assert.match(await invoke("Workbench","example.read"),/ACTION_ROLE_DENIED/);
  plan = false;
  await patch({roleId:null});
  assert.match(section.text({agent}),/只读示例/);
  assert.equal(section.text({agent:{session:{id:"child"}}}),"");
  claim("second",2);
  assert.equal(section.text({agent}),"");
  host.bindMessageRole("main","command","wb-addon-example/reader");
  claim("unrelated",3);
  assert.equal(section.text({agent}),"");
  claim("command",4);
  assert.match(section.text({agent}),/明确要求/);
  assert.equal((await http("GET","session-role?sessionId=main")).roleId,null);
  claim("next",5);
  assert.equal(section.text({agent}),"");
  await patch({roleId:"wb-addon-example/reader"});
  claim("last",6);
  unload();
  assert.equal((await http("GET","session-role?sessionId=main")).unavailable,true);
  assert.match(await invoke("Workbench","example.read"),/ACTION_ROLE_DENIED/);
  console.log("通过：旧入口退役、目录、轮次隔离、执行约束、命令单次角色与卸载失效");
} finally { for (const dispose of cleanups.reverse()) dispose(); rmSync(dir,{recursive:true,force:true}); }
