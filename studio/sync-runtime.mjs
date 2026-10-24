// Mechanical mirrors only. Author shared geometry in studio/*.mjs, then run this helper.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=new URL('./',import.meta.url),check=process.argv.includes('--check');
const modules={architect:['architect.js','staging/lib/architect.mjs','staging/public/studio/architect.js'],'site-planner':['site-planner.js','staging/lib/site-planner.mjs','staging/public/studio/site-planner.js'],geometry:['staging/lib/geometry.mjs'],catalog:['staging/lib/catalog.mjs'],'model-tools':['staging/lib/model-tools.mjs','staging/public/studio/model-tools.js'],exports:['staging/lib/exports.mjs'],visualization:['staging/lib/visualization.mjs','staging/public/studio/visualization.js'],feasibility:['staging/lib/feasibility.mjs','staging/public/studio/feasibility.js'],localization:['staging/public/studio/localization.js']};
let count=0;for(const [name,targets] of Object.entries(modules)){const source=readFileSync(new URL(name+'.mjs',root),'utf8');for(const target of targets){const expected=target.endsWith('.js')?source.replaceAll(".mjs'",".js'"):source,path=new URL(target,root);if(check){if(readFileSync(path,'utf8')!==expected)throw Error('Runtime mirror drift: '+fileURLToPath(path));}else writeFileSync(path,expected);count++;}}
console.log((check?'Verified ':'Synced ')+count+' geometry/runtime mirrors.');
