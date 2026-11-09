import {build} from 'esbuild';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const view=readFileSync('packages/addons/tasks/client/views/tasks-view.cjs','utf8');
assert.ok(!/shownCount|wbt-hint|data.truncated/.test(view));
assert.ok(view.includes('renderFilters(React,'));
assert.ok(!view.includes('h("nav"'));
assert.ok(view.split('\n').length<=600);
const bundle=await build({entryPoints:['scripts/filter-bar-ui-fixture.cjs'],bundle:true,write:false,format:'iife',platform:'browser',logLevel:'silent'});
console.log('Filter bar source and browser bundle PASS');
if(process.argv.includes('--serve')){
 const hostStyles=readFileSync('packages/shell/client/styles.cjs','utf8');
 const {createRequire}=await import('node:module');
 const require=createRequire(import.meta.url);
 const css=require('../packages/shell/client/styles.cjs');
 assert.ok(hostStyles.includes('.wb-immersive-main'));
 const server=createServer((req,res)=>{
  if(req.url==='/mobile'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>375px filter fixture</title><iframe title="375px task view" src="/?host=dark" style="width:375px;height:780px;border:0"></iframe>');return;}
  if(req.url==='/fixture.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);return;}
  const host=new URL(req.url,'http://localhost').searchParams.get('host');
  const dark=host==='dark';
  res.setHeader('Content-Type','text/html');
  res.end('<!doctype html><meta charset="utf-8"><title>Filter bar isolated fixture</title><style>body{margin:0;font:14px system-ui;--wb-border:#8885;--dsw-alias-bg-layer-1:'+(host?'rgba(128,128,128,.08)':'#fff')+';--dsw-alias-bg-base:'+(dark?'#1d233c':'#faf7ea')+';--dsw-alias-bg-layer-2:var(--dsw-alias-bg-base);color:'+(dark?'#eee':'#222')+';color-scheme:'+(dark?'dark':'light')+'}'+(host?css:'')+'</style>'+(host?'<div class="wb-root wb-immersive"><header class="wb-immersive-bar">Workbench · 任务</header><div class="wb-immersive-main" id="root"></div></div>':'<div id="root"></div>')+'<script src="/fixture.js"></script>');
 });
 server.listen(0,'127.0.0.1',()=>console.log('FILTER_FIXTURE_URL=http://127.0.0.1:'+server.address().port));
}
