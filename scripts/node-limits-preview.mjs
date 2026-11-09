// Builds only in memory; standalone fixture never calls a production API.
import {build} from 'esbuild';
import {createServer} from 'node:http';
const {outputFiles}=await build({entryPoints:['scripts/node-limits-preview.cjs'],bundle:true,write:false,format:'iife',define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'capture-node-components',setup(builder){
 builder.onResolve({filter:/views\/tasks-view\.cjs$/},()=>({path:'capture',namespace:'fixture'}));
 builder.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'module.exports=function(ctx){window.nodeComponents=ctx;return function(){return null;};};',loader:'js'}));
}}]});
if(process.argv.includes('--check')) console.log('NODE LIMITS PREVIEW BUILD PASS');
else createServer((req,res)=>{
 res.setHeader('content-type',req.url==='/app.js'?'application/javascript':'text/html; charset=utf-8');
 res.end(req.url==='/app.js'?outputFiles[0].text:'<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Node limits isolated preview</title>'+(req.url==='/narrow'?'<iframe title="360px narrow preview" src="/" style="width:360px;height:850px;border:0"></iframe>':'<div id="root"></div><script src="/app.js"></script>')+'</html>');
}).listen(0,'127.0.0.1',function(){console.log('Preview http://127.0.0.1:'+this.address().port);});
