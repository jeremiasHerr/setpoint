// Servidor estático mínimo: sirve esta carpeta y guarda lo que llega a POST /guardar?n=<nombre>.
const http = require('http'), fs = require('fs'), path = require('path'), url = require('url');
const RAIZ = __dirname, PUERTO = 8771;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png' };
http.createServer((req, res) => {
  const u = url.parse(req.url, true);
  if (req.method === 'POST' && u.pathname === '/guardar') {
    const nombre = path.basename(String(u.query.n || 'salida.jpg'));
    const partes = [];
    req.on('data', c => partes.push(c));
    req.on('end', () => { const b = Buffer.concat(partes); fs.writeFileSync(path.join(RAIZ, nombre), b); res.end('guardado ' + nombre); });
    return;
  }
  const f = path.join(RAIZ, path.normalize(decodeURIComponent(u.pathname)).replace(/^([\\/])+/, ''));
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end('no'); }
  res.setHeader('Content-Type', TIPOS[path.extname(f)] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(f).pipe(res);
}).listen(PUERTO, '127.0.0.1', () => console.log('http://127.0.0.1:' + PUERTO + '/'));
