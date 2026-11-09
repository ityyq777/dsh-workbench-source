// Isolated browser fixture. --serve exposes direct modal entry and historical visual comparison.
import { build } from 'esbuild';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), copy = require('../packages/addons/tasks/client/ui/copy.cjs');
for(const key of Object.keys(copy.zh).filter(k=>k.startsWith('timeline'))) assert.ok(copy.en[key],key);
assert.ok(copy.zh.timelineSingletons.includes('空线'));
assert.ok(!copy.zh.timelineEmpty.includes('暂未提供'));
const options={entryPoints:['scripts/timeline-ui-fixture.cjs'],bundle:true,write:false,format:'iife',platform:'browser',logLevel:'silent'};
await build(options);
console.log('Timeline entity UI bundle and bilingual copy PASS');
if(process.argv.includes('--serve')){
 const baseline={name:'baseline',setup(b){b.onLoad({filter:/\/(timeline-view|timeline-styles|task-timeline-modal)\.cjs$/},args=>({contents:execFileSync('git',['show','9d4d523:'+args.path.slice(process.cwd().length+1)],{encoding:'utf8'}),loader:'js'}));}};
 const server=createServer(async (req,res)=>{
  try {
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/fixture.js'){res.setHeader('Content-Type','text/javascript');const fresh=await build({...options,plugins:url.searchParams.has('before')?[baseline]:[]});res.end(fresh.outputFiles[0].text);return;}
   if(url.pathname==='/frames'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><iframe title="Timeline responsive fixture" style="width:375px;height:780px;border:0" src="/?lang=en"></iframe>');return;}
   const width=Number(url.searchParams.get('width'))||820;
   res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta charset="utf-8"><title>Timeline entity memory fixture</title><style>body{font-family:system-ui;margin:12px;background:#fff;color:#222;--wb-border:#ddd;--wb-radius-sm:6px;--dsw-alias-bg-layer-1:#fff;--dsw-alias-brand-primary:#858b27}html[data-theme=dark] body{background:#18181b;color:#e5e7eb;--wb-border:#555;--dsw-alias-bg-layer-1:#27272a}#view-tabs,#fixture-tools{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px}#root .wbt-modal.wide{width:'+Math.max(320,Math.min(1000,width))+'px;max-width:calc(100vw - 24px)}</style></head><body><div id="root"></div><script src="/fixture.js'+(url.searchParams.has('before')?'?before':'')+'"></script></body></html>');
  }catch(e){res.statusCode=500;res.end(String(e.message));}
 });server.listen(0,'127.0.0.1',()=>console.log('TIMELINE_FIXTURE_URL=http://127.0.0.1:'+server.address().port));
}
