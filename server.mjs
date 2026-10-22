import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
const port=Number(process.env.PORT||4317);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.pdf':'application/pdf','.mp4':'video/mp4','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const info=await stat(file);if(!info.isFile())throw Error('Not found');
    const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'};
    if(req.headers.range){
      const m=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      if(!m){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}
      const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),info.size-1):info.size-1;
      if(start>=info.size||start>end){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}
      res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${info.size}`,'Content-Length':end-start+1});
      if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
    }else{
      res.writeHead(200,{...headers,'Content-Length':info.size});
      if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);
    }
  }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('Page not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Portfolio ready: http://localhost:${port}`));
