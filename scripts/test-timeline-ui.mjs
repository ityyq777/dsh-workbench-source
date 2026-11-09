// Isolated browser fixture. Run with --serve and call window.runTimelineTests().
import { build } from 'esbuild';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), copy = require('../packages/addons/tasks/client/ui/copy.cjs');
for(const key of Object.keys(copy.zh).filter(k=>k.startsWith('timeline'))) assert.ok(copy.en[key],key);
assert.ok(copy.zh.timelineSingletons.includes('空线'));
assert.ok(!copy.zh.timelineEmpty.includes('暂未提供'));
const bundled=await build({entryPoints:['scripts/timeline-ui-fixture.cjs'],bundle:true,write:false,format:'iife',platform:'browser',logLevel:'silent'});
console.log('Timeline entity UI bundle and bilingual copy PASS');
if(process.argv.includes('--serve')){
 const server=createServer(async (req,res)=>{
  if(req.url==='/fixture.js'){res.setHeader('Content-Type','text/javascript');const fresh=await build({entryPoints:['scripts/timeline-ui-fixture.cjs'],bundle:true,write:false,format:'iife',platform:'browser',logLevel:'silent'});res.end(fresh.outputFiles[0].text);return;}
  res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta charset="utf-8"><title>Timeline entity memory fixture</title><style>body{font-family:system-ui;margin:24px;background:#fff;color:#222;--wb-border:#ddd;--wb-radius-sm:6px;--dsw-alias-bg-layer-1:#fff}html[data-theme=dark] body{background:#18181b;color:#e5e7eb;--wb-border:#555;--dsw-alias-bg-layer-1:#27272a}#view-tabs,#fixture-tools{display:flex;gap:24px;margin-bottom:20px}</style></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>');
 });server.listen(0,'127.0.0.1',()=>console.log('TIMELINE_FIXTURE_URL=http://127.0.0.1:'+server.address().port));
}
