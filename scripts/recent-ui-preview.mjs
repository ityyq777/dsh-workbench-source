// Standalone browser entry derived from difficulty-ui-preview; no database/API access.
import {build} from 'esbuild';
import {createServer} from 'node:http';
export async function buildRecentPreview(){return (await build({entryPoints:['scripts/recent-ui-preview.cjs'],bundle:true,write:false,format:'iife',define:{'process.env.NODE_ENV':'"development"'}})).outputFiles[0].text;}
const js=await buildRecentPreview();
if(process.argv.includes('--check'))console.log('RECENT PREVIEW BUILD PASS');
else createServer((req,res)=>{res.setHeader('content-type',req.url==='/app.js'?'application/javascript':'text/html; charset=utf-8');res.end(req.url==='/app.js'?js:'<!doctype html><html lang="zh"><meta charset="utf-8"><title>Recent tasks isolated preview</title><div id="root"></div><script src="/app.js"></script></html>');}).listen(0,'127.0.0.1',function(){console.log('Preview http://127.0.0.1:'+this.address().port);});
