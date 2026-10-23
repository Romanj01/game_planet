import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url)),prefix='/gameplanet-demo/';
createServer(async(req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/'){res.writeHead(302,{Location:prefix});return res.end();}if(!pathname.startsWith(prefix)){res.writeHead(404);return res.end();}const relative=pathname.slice(prefix.length)||'index.html',file=resolve(root,relative);if(!file.startsWith(root)){res.writeHead(403);return res.end();}try{const data=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.json':'application/json'}[extname(file)]||'application/octet-stream'),'Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(3182,'127.0.0.1',()=>console.log('Demo: http://127.0.0.1:3182/gameplanet-demo/'));
