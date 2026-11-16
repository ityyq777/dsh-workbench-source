import {build} from 'esbuild';
import {createServer} from 'node:http';
const bundle=await build({entryPoints:['scripts/stats-ui-fixture.cjs'],bundle:true,write:false,format:'iife',platform:'browser',logLevel:'silent'});
console.log('Statistics browser fixture bundle PASS');
if(process.argv.includes('--serve')){
 const server=createServer((req,res)=>{
  if(req.url==='/fixture.js'){res.setHeader('Content-Type','text/javascript');res.end(bundle.outputFiles[0].text);return;}
  res.setHeader('Content-Type','text/html');
  if(req.url==='/frames'){res.end('<!doctype html><title>Statistics responsive checks</title><iframe title="Statistics" src="/" style="width:1280px;height:780px;border:0"></iframe>');return;}
  // ?theme=dark 走一套深色 token，便于同一份 fixture 出浅/深对照截图（真机仍以 DSH 主题为准）。
  const dark = new URL(req.url, 'http://127.0.0.1').searchParams.get('theme') === 'dark';
  const tokens = dark
    ? '--wb-border:#3a3833;--wb-text:#ecf0f5;--wb-muted:#9aa1ab;--dsw-alias-bg-layer-1:#232220;--dsw-alias-bg-base:#1a1917;--dsw-alias-label-primary:#ecf0f5;--dsw-alias-label-secondary:#c9cfd8;--dsw-alias-label-tertiary:#9aa1ab;--dsw-alias-border-l1:#3a3833;background:#141312;color:#ecf0f5'
    : '--wb-border:#ddd;--dsw-alias-bg-layer-1:#fff;background:#f7f8fa';
  res.end('<!doctype html><meta charset="utf-8"><title>Statistics isolated fixture</title><style>body{margin:0;padding:8px;font:14px system-ui;' + tokens + '}*{box-sizing:border-box}</style><div id="root"></div><script src="/fixture.js"></script>');
 });
 server.listen(0,'127.0.0.1',()=>console.log('STATS_FIXTURE_URL=http://127.0.0.1:'+server.address().port));
}
