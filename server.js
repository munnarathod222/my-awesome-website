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
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const reqPath = req.url.split('?')[0];
  let filePath = path.join(DIST, reqPath === '/' ? 'index.html' : reqPath);
  const ext = path.extname(filePath).toLowerCase();

  // If request has an asset file extension but file does not exist, check apps/web/dist fallback
  if (ext && ext !== '.html') {
    if (!fs.existsSync(filePath)) {
      const fallbackPath = path.join(__dirname, 'apps/web/dist', reqPath);
      if (fs.existsSync(fallbackPath)) {
        filePath = fallbackPath;
      } else {
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
