import {createRequire} from 'node:module';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url)), require=createRequire(import.meta.url);
let esbuild;
try{esbuild=require('esbuild');}catch{esbuild=require('../telegram-shop/node_modules/.pnpm/esbuild@0.27.7/node_modules/esbuild');}
await esbuild.build({entryPoints:[resolve(root,'src/main.tsx')],bundle:true,outfile:resolve(root,'app.js'),format:'esm',jsx:'automatic',minify:true,legalComments:'eof',target:['es2022'],alias:{'@':resolve(root,'src'),'next/link':resolve(root,'src/router.tsx'),'next/image':resolve(root,'src/image.tsx'),'next/navigation':resolve(root,'src/router.tsx')},nodePaths:[resolve(root,'node_modules'),resolve(root,'../telegram-shop/node_modules')],loader:{'.woff2':'file'},assetNames:'fonts/[name]-[hash]',logLevel:'info'});
