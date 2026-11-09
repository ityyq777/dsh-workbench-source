import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
export const SOURCE_EXTENSION = /\.(?:js|cjs|mjs|ts|tsx|jsx)$/;
/** Recursive, stable source inventory; symlinks are never followed. */
export function sourceFiles(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(entry=>{
    const path=join(root,entry.name);
    return entry.isDirectory()?sourceFiles(path):entry.isFile()&&SOURCE_EXTENSION.test(entry.name)?[path]:[];
  });
}
export function readLibSource(root) {
  return sourceFiles(root).filter(file=>file!==join(root,'client.js')).map(file=>readFileSync(file,'utf8')).join('\n');
}
/** Preserve frozen caps through exact declared moves; never grant one cap to two files. */
export function resolveLineBudgets(root,budget,layout) {
  const caps={},errors=[];
  for(const [old,cap] of Object.entries(budget)) {
    let destination=old;
    for(const scope of Object.values(layout.scopes)) {
      const prefix=scope.root+'/';
      if(old.startsWith(prefix)&&scope.files[old.slice(prefix.length)]) destination=prefix+scope.files[old.slice(prefix.length)];
    }
    const oldExists=existsSync(resolve(root,old)),newExists=existsSync(resolve(root,destination));
    if(old!==destination&&oldExists&&newExists) errors.push('预算源与目标同时存在：'+old+' / '+destination);
    if(!oldExists&&!newExists) errors.push('预算文件不存在：'+old+' -> '+destination);
    const active=oldExists?old:destination;
    if(caps[active]!==undefined) errors.push('重复预算目标：'+active);
    if(!Number.isSafeInteger(cap)||cap<1) errors.push('非法冻结预算：'+old);
    caps[active]=cap;
  }
  return {caps,errors};
}
