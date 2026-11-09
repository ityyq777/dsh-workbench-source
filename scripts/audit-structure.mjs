#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { SOURCE_EXTENSION } from './source-files.mjs';
export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const LAYOUT=JSON.parse(readFileSync(join(ROOT,'scripts/structure-map.json'),'utf8'));
const slash=path=>path.split(sep).join('/');
/** Parse syntax, not regex: comments and ordinary strings are not imports. */
export function importsOf(file,text) {
  const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);
  const imports=[];
  function visit(node) {
    let specifier;
    if(ts.isImportDeclaration(node)||ts.isExportDeclaration(node)) specifier=node.moduleSpecifier;
    else if(ts.isImportEqualsDeclaration(node)&&ts.isExternalModuleReference(node.moduleReference)) specifier=node.moduleReference.expression;
    else if(ts.isCallExpression(node)&&(node.expression.kind===ts.SyntaxKind.ImportKeyword||(ts.isIdentifier(node.expression)&&node.expression.text==='require'))) specifier=node.arguments[0];
    if(specifier&&(ts.isStringLiteralLike(specifier))) imports.push(specifier.text);
    ts.forEachChild(node,visit);
  }
  visit(source);return imports;
}
function localTarget(file,specifier) {
  if(!specifier.startsWith('.')) return null;
  const base=resolve(dirname(file),specifier);
  const candidates=[base,base.replace(/\.js$/,'.ts'),base.replace(/\.js$/,'.tsx'),...['.js','.cjs','.mjs','.ts','.tsx','/index.js','/index.ts'].map(ext=>base+ext)];
  return candidates.find(path=>existsSync(path)&&statSync(path).isFile())||null;
}
export function auditStructure({root=ROOT,scopes,layout=LAYOUT}={}) {
  const selected=scopes??Object.keys(layout.scopes),issues=[],files=[],graph=new Map();
  const issue=(code,file,message)=>issues.push({code,file:slash(relative(root,file)),message});
  if(!selected.length) throw new Error('scope 不能为空');
  for(const scope of selected) if(!Object.hasOwn(layout.scopes,scope)) throw new Error('未知 scope：'+scope);
  for(const name of new Set(selected)) {
    const spec=layout.scopes[name],base=join(root,spec.root),generated=new Set(spec.generated.map(file=>join(base,file)));
    if(!existsSync(base)) {issue('MISSING_ROOT',base,'scope 根目录不存在');continue;}
    function walk(dir,depth) {
      const entries=readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name));
      const regular=entries.filter(entry=>entry.isFile()&&!generated.has(join(dir,entry.name)));
      if(depth>layout.maxDirectoryDepth) issue('DEPTH',dir,'目录深度 '+depth+' > '+layout.maxDirectoryDepth+'（源码根=1）');
      if(regular.length>layout.maxFilesPerDirectory) issue('FILE_COUNT',dir,'直接文件数 '+regular.length+' > '+layout.maxFilesPerDirectory);
      for(const entry of entries) {
        const file=join(dir,entry.name);
        if(entry.isSymbolicLink()) {issue('SYMLINK',file,'源码目录不允许符号链接绕过扫描');continue;}
        if(entry.isDirectory()) {walk(file,depth+1);continue;}
        if(!entry.isFile()||generated.has(file)) continue;
        if(depth===1&&!spec.entries.includes(entry.name)) issue('ROOT_FILE',file,'非白名单入口必须移入业务子目录');
        if(SOURCE_EXTENSION.test(entry.name)) files.push({file,base,scope:name});
      }
    }
    walk(base,1);
  }
  // Follow resolvable local imports beyond the selected scope as well, so barrels cannot hide reverse dependencies.
  function edges(file) {
    if(graph.has(file)) return graph.get(file);
    const refs=importsOf(file,readFileSync(file,'utf8')).map(specifier=>({specifier,target:localTarget(file,specifier)}));
    graph.set(file,refs);return refs;
  }
  for(const {file,base,scope} of files) {
    const backend=scope.endsWith('/lib')||scope==='shell/src',client=scope.endsWith('/client');
    for(const {specifier,target} of edges(file)) {
      const path=slash(target||resolve(dirname(file),specifier));
      if(backend&&(/^(react|react-dom)(\/|$)/.test(specifier)||path.includes('/client/'))) issue('BACKEND_CLIENT',file,'后端禁止依赖 '+specifier);
      if(client&&(/\/packages\/addons\/[^/]+\/lib\//.test(path)||/\/packages\/shell\/(src|lib)\//.test(path))) issue('CLIENT_BACKEND',file,'客户端禁止导入后端 '+specifier);
      if(scope.endsWith('/shared')&&(!target||!target.startsWith(base+sep))) issue('SHARED_DEPENDENCY',file,'中立共享层只能依赖同层模块：'+specifier);
      if(specifier.startsWith('.')&&!target) issue('MISSING_IMPORT',file,'本地依赖不存在：'+specifier);
    }
    if(!slash(relative(base,file)).startsWith('db/')) continue;
    const seen=new Set([file]),queue=[file];
    while(queue.length) {
      const current=queue.shift();
      for(const {target} of edges(current)) {
        if(!target||!SOURCE_EXTENSION.test(target)||seen.has(target)) continue;
        seen.add(target);
        const rel=slash(relative(base,target));
        if(/^(task|domain|timeline|stats)\//.test(rel)) issue('DB_REVERSE',file,'数据库层反向依赖 '+slash(relative(root,target))+'（经 '+slash(relative(root,current))+'）');
        else if(!slash(relative(root,target)).startsWith('..')&&!target.includes(sep+'node_modules'+sep)) queue.push(target);
      }
    }
  }
  return {scopes:[...new Set(selected)],files:files.length,issues};
}
export function main(args=process.argv.slice(2)) {
  let root=ROOT,scopes,json=false;
  for(let i=0;i<args.length;i++) {
    const arg=args[i];
    if(arg==='--json') json=true;
    else if(arg==='--scope') {const value=args[++i];if(!value||value.split(',').some(v=>!v)) throw new Error('--scope 需要非空逗号列表');scopes=value.split(',');}
    else if(arg==='--root') {const value=args[++i];if(!value||value.startsWith('--')) throw new Error('--root 需要路径');root=resolve(value);}
    else throw new Error('未知参数：'+arg);
  }
  const result=auditStructure({root,scopes});
  if(json) console.log(JSON.stringify(result,null,2));
  else {console.log('目录结构审计：'+result.scopes.join(', ')+'；'+result.files+' 个源码文件');for(const entry of result.issues) console.error(entry.code+' '+entry.file+'：'+entry.message);console.log(result.issues.length?'结构违规 '+result.issues.length+' 项':'STRUCTURE PASS');}
  return result.issues.length?1:0;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {process.exitCode=main();} catch(error) {console.error(error.message);process.exitCode=2;}
}
