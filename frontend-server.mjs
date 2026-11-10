import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.env.DIST_DIR || 'dist');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
};

createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }

  const file = resolve(root, `.${pathname}`);
  if (file !== root && !file.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end();
    return;
  }

  const requestedFile = file.endsWith(sep) ? `${file}index.html` : file;
  const servesFile = existsSync(requestedFile) && statSync(requestedFile).isFile();
  const fallbackToApp = !extname(pathname);
  const fileToServe = servesFile ? requestedFile : fallbackToApp ? resolve(root, 'index.html') : null;

  if (!fileToServe || !existsSync(fileToServe)) {
    response.writeHead(404).end();
    return;
  }

  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(fileToServe)] ?? 'application/octet-stream'
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(fileToServe).pipe(response);
}).listen(Number(process.env.PORT) || 80, '0.0.0.0');
