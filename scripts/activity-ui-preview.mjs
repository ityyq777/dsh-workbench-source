// Reuse the existing preview pattern: compile to memory, no bundle or database writes.
import {build} from 'esbuild';
import {createServer} from 'node:http';
const js=(await build({entryPoints:['scripts/activity-ui-preview.cjs'],bundle:true,write:false,format:'iife',define:{'process.env.NODE_ENV':'"development"'}})).outputFiles[0].text;
if(process.argv.includes('--check'))console.log('ACTIVITY PREVIEW BUILD PASS');
else createServer((req,res)=>{res.setHeader('content-type',req.url==='/app.js'?'application/javascript':'text/html; charset=utf-8');res.end(req.url==='/app.js'?js:'<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Activity isolated preview</title><div id="root"></div><script src="/app.js"></script></html>');}).listen(0,'127.0.0.1',function(){console.log('Preview http://127.0.0.1:'+this.address().port);});
