import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const publicFiles=new Set(['index.html','style.css','app.mjs','pricing.mjs','checkout-model.mjs','product-50.png','detail-01.png','detail-02.png','detail-03.png','detail-04.png','detail-05.png','detail-06.png','detail-07.png','product-20.png']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.png':'image/png'};
http.createServer(async(req,res)=>{try{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!publicFiles.has(name)){res.writeHead(404).end('Not found');return;}const data=await readFile(path.join(root,name));res.writeHead(200,{'Content-Type':types[path.extname(name)]});res.end(data);}catch{res.writeHead(404).end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://localhost:4173'));

