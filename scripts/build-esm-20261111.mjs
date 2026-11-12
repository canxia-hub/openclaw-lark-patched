import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, cp, glob } from 'node:fs/promises';
import path from 'node:path';
const source=path.resolve(process.cwd());
const target=path.resolve(process.env.LARK_ESM_OUTPUT ?? path.join(source,'dist-esm'));
const host=process.env.OPENCLAW_HOST ?? process.env.OPENCLAW_HOME;
if(!host) throw new Error('Set OPENCLAW_HOST to an OpenClaw installation containing node_modules/esbuild');
const {build}=createRequire(path.join(host,'package.json'))('esbuild');
const sdkBridge={name:'public-sdk-esm',setup(api){
 api.onResolve({filter:/^openclaw\/plugin-sdk\//},args=>args.namespace==='host-sdk-bridge'
  ?{path:args.path,external:true}:{path:args.path,namespace:'host-sdk-bridge'});
 api.onLoad({filter:/.*/,namespace:'host-sdk-bridge'},args=>({contents:`export * from ${JSON.stringify(args.path)};`,loader:'js'}));
}};
await mkdir(target,{recursive:true});
const pkg=JSON.parse(await readFile(path.join(source,'package.json'),'utf8'));
for(const item of ['skills','bin','index.d.ts','secret-contract-api.d.ts','openclaw.plugin.json','LICENSE','README.md','MANAGED.md'])
 await cp(path.join(source,item),path.join(target,item),{recursive:true});
for await(const relative of glob('**/*.d.ts',{cwd:path.join(source,'src')})){
 const destination=path.join(target,'src',relative);await mkdir(path.dirname(destination),{recursive:true});
 await cp(path.join(source,'src',relative),destination);
}
for(const entry of ['index.js','secret-contract-api.js','bin/openclaw-lark.js']){
 const text=await readFile(path.join(source,entry),'utf8');
 const names=[...new Set([...text.matchAll(/(?:exports\.(\w+)\s*=|Object\.defineProperty\(exports,\s*["'](\w+)["'])/g)].map(m=>m[1]??m[2]))].filter(n=>n!=='default'&&n!=='__esModule');
 const rel='./'+entry;
 const wrapper=entry.startsWith('bin/')?`import ${JSON.stringify(rel)};\n`:`import legacy from ${JSON.stringify(rel)};\n`+(entry==='index.js'?'export default legacy.default ?? legacy;\n':'')+names.map(n=>`export const ${n}=legacy.${n};`).join('\n');
 await build({stdin:{contents:wrapper,resolveDir:source,sourcefile:entry+'.entry.mjs',loader:'js'},outfile:path.join(target,entry),bundle:true,platform:'node',target:'node26',format:'esm',plugins:[sdkBridge],logLevel:'warning',banner:{js:'import {createRequire as __createRequire} from "node:module"; import {fileURLToPath as __fileURLToPath} from "node:url"; import {dirname as __dirnameOf} from "node:path"; const require=__createRequire(import.meta.url); const __filename=__fileURLToPath(import.meta.url); const __dirname=__dirnameOf(__filename);'}});
}
let index=await readFile(path.join(target,'index.js'),'utf8');
index=index.replace(/join\)\(__dirname, "\.\.", "\.\.", "package\.json"\)/g,'join)(__dirname, "package.json")');
await writeFile(path.join(target,'index.js'),index);
pkg.type='module';pkg.dependencies={};pkg.devDependencies={};pkg.peerDependencies={openclaw:'2026.11.3'};
pkg.openclaw.extensions=['./index.js'];pkg.files=['index.js','index.d.ts','secret-contract-api.js','secret-contract-api.d.ts','openclaw.plugin.json','src/**/*.d.ts','skills/','bin/','LICENSE','README.md','MANAGED.md'];pkg.scripts={};
await writeFile(path.join(target,'package.json'),JSON.stringify(pkg,null,2)+'\n');
console.log(JSON.stringify({target,host,format:'esm',hostSdk:'external public ESM imports',bundledDependencies:true}));
