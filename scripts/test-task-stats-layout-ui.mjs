import {build} from 'esbuild';
import {createServer} from 'node:http';
const bundle=await build({entryPoints:['scripts/stats-ui-fixture.cjs'],bundle:true,write:false,format:'iife',platform:'browser',logLevel:'silent'});
console.log('Statistics browser fixture bundle PASS');
if(process.argv.includes('--serve')){
 const server=createServer((req,res)=>{
  if(req.url==='/fixture.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);return;}
  res.setHeader('Content-Type','text/html');
  if(req.url==='/frames'){res.end('<!doctype html><title>Statistics responsive checks</title><iframe title="Statistics" src="/" style="width:1280px;height:780px;border:0"></iframe>');return;}
  res.end('<!doctype html><meta charset="utf-8"><title>Statistics isolated fixture</title><style>body{margin:0;padding:8px;font:14px system-ui;--wb-border:#ddd;--dsw-alias-bg-layer-1:#fff;background:#f7f8fa}*{box-sizing:border-box}</style><div id="root"></div><script src="/fixture.js"></script>');
 });
 server.listen(0,'127.0.0.1',()=>console.log('STATS_FIXTURE_URL=http://127.0.0.1:'+server.address().port));
}
