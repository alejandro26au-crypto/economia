// prueba de personajes: node carta.mjs salida.png '[["sailor",{"R":"hold","match":1}], ...]'
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, out, spec] = process.argv; const root = path.resolve('web');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch(); const pg = await b.newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html#nada`).catch(()=>{});
const d = await pg.evaluate(async (spec) => { const T = await import('./toon.js'); const L = JSON.parse(spec);
  const c = document.createElement('canvas'); c.width = 600 * L.length; c.height = 1000; const g = c.getContext('2d'); g.fillStyle = '#8a9a9a'; g.fillRect(0, 0, c.width, c.height);
  L.forEach(([w, o], i) => { g.setTransform(1, 0, 0, 1, i * 600, 0); T.romanFront(new T.Pen(g), w, o); }); return c.toDataURL('image/png'); }, spec);
fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); await b.close(); srv.close();
