import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, renameSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { auditStructure, importsOf, LAYOUT, ROOT } from './audit-structure.mjs';
import { sourceFiles, readLibSource, resolveLineBudgets } from './source-files.mjs';
const root=mkdtempSync(join(tmpdir(),'wb-structure-'));
const put=(path,text='export const value=1;')=>{const file=join(root,path);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,text);return file;};
const base=LAYOUT.scopes['tasks/lib'].root;
const audit=()=>auditStructure({root,scopes:['tasks/lib']});
const cli=(...args)=>spawnSync(process.execPath,[join(ROOT,'scripts/audit-structure.mjs'),'--root',root,...args],{encoding:'utf8'});
const has=code=>audit().issues.some(issue=>issue.code===code);
try {
  for(const spec of Object.values(LAYOUT.scopes)) mkdirSync(join(root,spec.root),{recursive:true});
  put(base+'/index.js');put(base+'/tasks.js');put(base+'/client.js',"require('react');");
  put(base+'/db/core.js');put(base+'/task/model/task.js',"import '../../db/core.js';");
  assert.deepEqual(audit().issues,[]);assert.equal(cli('--scope','tasks/lib').status,0);
  const bad=put(base+'/unexpected.js');assert(has('ROOT_FILE'));assert.equal(cli('--scope','tasks/lib').status,1);rmSync(bad);
  const nested=[];for(let i=0;i<13;i++) nested.push(put(base+'/many/f'+i+'.cjs','module.exports=1;'));
  assert(has('FILE_COUNT'));for(const file of nested) rmSync(file);
  const deep=put(base+'/a/b/c/deep.js');assert(has('DEPTH'));rmSync(dirname(deep),{recursive:true});
  for(const text of ["import React from 'react';","const x=require('react/jsx-runtime');","export {x} from 'react-dom/client';","import('react');"]){put(base+'/task/model/task.js',text);assert(has('BACKEND_CLIENT'));}
  put(base+'/task/model/task.js',"// require('react')\nconst text=\"import React from 'react'\";");assert(!has('BACKEND_CLIENT'));
  put('packages/addons/tasks/client/views/view.cjs','module.exports=1;');put(base+'/task/model/task.js',"import '../../../client/views/view.cjs';");assert(has('BACKEND_CLIENT'));
  put(base+'/task/model/task.js');put(base+'/db/core.js',"export * from '../task/model/task.js';");assert(has('DB_REVERSE'));
  put(base+'/infra/bridge.js',"export * from '../timeline/service.js';");put(base+'/timeline/service.js');
  put(base+'/db/core.js',"export * from '../infra/bridge.js';");assert(has('DB_REVERSE'));
  put(base+'/db/core.js');put(base+'/task/model/task.js',"import './missing.js';");assert(has('MISSING_IMPORT'));put(base+'/task/model/task.js');
  // An invalid different scope cannot be hidden from the default all-scope CLI.
  const other=put('packages/addons/tags/lib/unexpected.js');assert.equal(cli('--scope','tasks/lib').status,0);assert.equal(cli().status,1);rmSync(other);
  assert.equal(cli('--scope','no-such-scope').status,2);assert.equal(cli('--scope','').status,2);
  const absent=join(root,'packages/addons/storage/lib');rmSync(absent,{recursive:true});assert(auditStructure({root}).issues.some(i=>i.code==='MISSING_ROOT'));mkdirSync(absent);
  // Shared CJS UI helpers in addons/lib are not a backend addon/lib tree.
  put('packages/addons/lib/shared.cjs','module.exports=1;');put('packages/addons/tasks/client/views/view.cjs',"require('../../../lib/shared.cjs');");
  assert.deepEqual(auditStructure({root,scopes:['tasks/client']}).issues,[]);
  put('packages/addons/tasks/client/views/view.cjs',"require('../../lib/db/core.js');");assert(auditStructure({root,scopes:['tasks/client']}).issues.some(i=>i.code==='CLIENT_BACKEND'));
  assert.deepEqual(importsOf('x.ts',"import x = require('./x'); export * from './y'; import('./z');"),['./x','./y','./z']);
  // Recursive source inventory sees nested CJS and excludes only the exact generated entry.
  put(base+'/timeline/helper.cjs','module.exports={nestedSentinel:true};');put(base+'/timeline/client.js','export const handwrittenSentinel=true;');
  const source=readLibSource(join(root,base));assert(source.includes('nestedSentinel'));assert(source.includes('handwrittenSentinel'));assert(!source.includes("require('react')"));
  assert(sourceFiles(join(root,base)).some(file=>file.endsWith('helper.cjs')));
  const old=base+'/task-model.js',dest=base+'/task/model/task-model.js';put(old);
  const caps={[old]:1001};assert.equal(resolveLineBudgets(root,caps,LAYOUT).caps[old],1001);
  mkdirSync(dirname(join(root,dest)),{recursive:true});renameSync(join(root,old),join(root,dest));
  const moved=resolveLineBudgets(root,caps,LAYOUT);assert.deepEqual(moved.errors,[]);assert.equal(moved.caps[dest],1001);
  put(old);assert(resolveLineBudgets(root,caps,LAYOUT).errors.length);rmSync(join(root,old));rmSync(join(root,dest));assert(resolveLineBudgets(root,caps,LAYOUT).errors.length);
  // The checked-in manifest is exhaustive for this baseline, has unique targets, and respects layout limits.
  for(const spec of Object.values(LAYOUT.scopes)) {
    const targets=Object.values(spec.files);assert.equal(new Set(targets).size,targets.length);
    for(const path of targets) assert(path.split('/').length<=LAYOUT.maxDirectoryDepth);
    const counts=new Map();for(const path of targets) if(!spec.generated.includes(path)) counts.set(dirname(path),(counts.get(dirname(path))||0)+1);
    assert([...counts.values()].every(n=>n<=LAYOUT.maxFilesPerDirectory));
    for(const file of sourceFiles(join(ROOT,spec.root))) {const rel=relative(join(ROOT,spec.root),file).split('\\').join('/');assert(Object.hasOwn(spec.files,rel)||targets.includes(rel)||(spec.root==='packages/addons/tasks/lib'&&['db/timeline-schema.js','db/ownership-path.js'].includes(rel)),'unmapped baseline '+file);}
  }
  const e2e=readFileSync(join(ROOT,'scripts/e2e.mjs'),'utf8');assert(e2e.includes('"scripts/audit-structure.mjs"'));assert(!e2e.includes('--scope'));
  console.log('STRUCTURE TEST PASS: CLI failures, scopes, roots, depth/count, dependency graph, recursive inventory and frozen budget relocation');
} finally {assert(resolve(root).startsWith(resolve(tmpdir())+'/wb-structure-'));rmSync(root,{recursive:true,force:true});}
