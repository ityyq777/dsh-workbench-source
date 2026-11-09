import {build} from 'esbuild';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const view=readFileSync('packages/addons/tasks/client/views/tasks-view.cjs','utf8');
assert.ok(!/shownCount|wbt-hint|data.truncated/.test(view));
assert.ok(view.indexOf('className: "wbt-sum"')<view.indexOf('checked: difficultyMissing'));
const bundle=await build({entryPoints:['scripts/filter-bar-ui-fixture.cjs'],bundle:true,write:false,format:'iife',platform:'browser',logLevel:'silent'});
console.log('Filter bar source and browser bundle PASS');
if(process.argv.includes('--serve')){const server=createServer((req,res)=>{if(req.url==='/fixture.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);return;}res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta charset="utf-8"><title>Filter bar isolated fixture</title><style>body{margin:0;font:14px system-ui;--wb-border:#ddd;--dsw-alias-bg-layer-1:#fff}</style><div id="root"></div><script src="/fixture.js"></script>');});server.listen(0,'127.0.0.1',()=>console.log('FILTER_FIXTURE_URL=http://127.0.0.1:'+server.address().port));}
