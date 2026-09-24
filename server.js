import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const reqPath = req.url.split('?')[0];

  // API handler for quotation rates
  if (reqPath === '/api/quotation/rates' || reqPath === '/hcgi/api/quotation/rates') {
    const qRateCandidates = [
      path.join(__dirname, 'quotation_rates.json'),
      path.join(__dirname, 'public/quotation_rates.json'),
      path.join(__dirname, 'dist/quotation_rates.json')
    ];
    if (req.method === 'GET') {
      for (const p of qRateCandidates) {
        if (fs.existsSync(p)) {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
          return res.end(fs.readFileSync(p, 'utf8'));
        }
      }
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Rates not found' }));
    }
    if (req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        try {
          const parsed = JSON.parse(b);
          parsed.updated_at = new Date().toISOString();
          const str = JSON.stringify(parsed, null, 2);
          qRateCandidates.forEach(p => {
            try {
              fs.mkdirSync(path.dirname(p), { recursive: true });
              fs.writeFileSync(p, str, 'utf8');
            } catch (e) {}
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, rates: parsed }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
  }

  let filePath = path.join(DIST, reqPath === '/' ? 'index.html' : reqPath);
  const ext = path.extname(filePath).toLowerCase();

  // If request has an asset file extension but file does not exist, check fallback locations
  if (ext && ext !== '.html') {
    if (!fs.existsSync(filePath)) {
      const candidates = [
        path.join(__dirname, 'public', reqPath),
        path.join(__dirname, 'apps/web/dist', reqPath),
        path.join(__dirname, 'dist/apps/web', reqPath),
        path.join(__dirname, 'apps/api/dist', reqPath)
      ];
      let found = false;
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          filePath = cand;
          found = true;
          break;
        }
      }
      if (!found) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }
    }
  } else {
    // For page navigation (HTML or routes without extension), fallback to dist/index.html
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST, 'index.html');
    }
  }

  const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
