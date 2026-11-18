'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { greet } = require('./greeting');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Fixed allowlist: URL path -> file name and content type. No user input is joined into a path.
const STATIC_FILES = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/index.html': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/app.js': { file: 'app.js', type: 'text/javascript; charset=utf-8' },
};

function sendJson(res, status, body, extraHeaders) {
  const payload = JSON.stringify(body);
  res.writeHead(status, Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'X-Content-Type-Options': 'nosniff',
  }, extraHeaders));
  res.end(payload);
}

function sendError(res, status, code, message, extraHeaders) {
  sendJson(res, status, { error: { code, message } }, extraHeaders);
}

function handleGreeting(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed.', { Allow: 'GET, HEAD' });
    return;
  }
  const names = url.searchParams.getAll('name');
  let name;
  if (names.length === 1) {
    name = names[0];
  } else if (names.length > 1) {
    name = names; // not a single string -> INVALID_NAME
  }
  const result = greet(name);
  sendJson(res, result.status, result.body);
}

function handleStatic(req, res, entry) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed.', { Allow: 'GET, HEAD' });
    return;
  }
  fs.readFile(path.join(FRONTEND_DIR, entry.file), (err, data) => {
    if (err) {
      sendError(res, 404, 'NOT_FOUND', 'Not found.');
      return;
    }
    res.writeHead(200, {
      'Content-Type': entry.type,
      'Content-Length': data.length,
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

function createServer() {
  return http.createServer((req, res) => {
    // Reject non-canonical request targets ('//x', 'x', absolute-form) before any URL parsing.
    if (typeof req.url !== 'string' || req.url[0] !== '/' || req.url[1] === '/') {
      sendError(res, 404, 'NOT_FOUND', 'Not found.');
      return;
    }
    let url;
    try {
      url = new URL(req.url, 'http://localhost');
    } catch (e) {
      sendError(res, 404, 'NOT_FOUND', 'Not found.');
      return;
    }
    const pathname = url.pathname;
    if (pathname === '/api/greeting') {
      handleGreeting(req, res, url);
    } else if (Object.prototype.hasOwnProperty.call(STATIC_FILES, pathname)) {
      handleStatic(req, res, STATIC_FILES[pathname]);
    } else {
      sendError(res, 404, 'NOT_FOUND', 'Not found.');
    }
  });
}

module.exports = { createServer };

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, '127.0.0.1', () => {
    console.log('Listening on http://127.0.0.1:' + port);
  });
}
