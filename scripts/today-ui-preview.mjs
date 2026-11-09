// In-memory build only; never replaces the installed application or generated bundles.
import {build} from 'esbuild';
import {createServer} from 'node:http';
const js = (await build({entryPoints: ['scripts/today-ui-preview.cjs'], bundle: true, write: false, format: 'iife', define: {'process.env.NODE_ENV': '"development"'}})).outputFiles[0].text;
if (process.argv.includes('--check')) console.log('TODAY PREVIEW BUILD PASS');
else createServer((req, res) => {
  res.setHeader('content-type', req.url === '/app.js' ? 'application/javascript' : 'text/html; charset=utf-8');
  res.end(req.url === '/app.js' ? js : '<!doctype html><html lang="zh"><meta charset="utf-8"><title>Today isolated preview</title><div id="root"></div><script src="/app.js"></script></html>');
}).listen(0, '127.0.0.1', function () {console.log('Preview http://127.0.0.1:' + this.address().port);});
