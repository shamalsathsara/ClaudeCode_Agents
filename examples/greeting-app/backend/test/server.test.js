'use strict';

const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { createServer } = require('../server');

function request(port, method, path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function withServer(fn) {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    await fn(server.address().port);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('GET greeting with name', () => withServer(async (port) => {
  const r = await request(port, 'GET', '/api/greeting?name=Ada');
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.headers['content-type'], 'application/json; charset=utf-8');
  assert.strictEqual(r.headers['x-content-type-options'], 'nosniff');
  assert.deepStrictEqual(JSON.parse(r.body), { message: 'Hello, Ada!' });
}));

test('GET greeting without name', () => withServer(async (port) => {
  const r = await request(port, 'GET', '/api/greeting');
  assert.strictEqual(r.status, 200);
  assert.deepStrictEqual(JSON.parse(r.body), { message: 'Hello, World!' });
}));

test('invalid names return 400 INVALID_NAME', () => withServer(async (port) => {
  const paths = [
    '/api/greeting?name=',
    '/api/greeting?name=%20%20',
    '/api/greeting?name=a&name=b',
    '/api/greeting?name=' + 'a'.repeat(51),
  ];
  for (const p of paths) {
    const r = await request(port, 'GET', p);
    assert.strictEqual(r.status, 400, p);
    assert.strictEqual(JSON.parse(r.body).error.code, 'INVALID_NAME');
  }
}));

test('POST greeting returns 405 with Allow header', () => withServer(async (port) => {
  const r = await request(port, 'POST', '/api/greeting');
  assert.strictEqual(r.status, 405);
  assert.ok(r.headers.allow);
  assert.strictEqual(JSON.parse(r.body).error.code, 'METHOD_NOT_ALLOWED');
}));

test('unknown paths return 404 JSON', () => withServer(async (port) => {
  for (const p of ['/nope', '/server.js', '/../server.js', '/%2e%2e/server.js', '/api/other']) {
    const r = await request(port, 'GET', p);
    assert.strictEqual(r.status, 404, p);
    assert.strictEqual(r.headers['content-type'], 'application/json; charset=utf-8');
    assert.strictEqual(JSON.parse(r.body).error.code, 'NOT_FOUND');
  }
}));

const STATIC_ROUTES = [['/', 'text/html'], ['/index.html', 'text/html'], ['/app.js', 'text/javascript']];

test('static allowlist routes return 200 with content type and body', () => withServer(async (port) => {
  for (const [p, type] of STATIC_ROUTES) {
    const r = await request(port, 'GET', p);
    assert.strictEqual(r.status, 200, p);
    assert.strictEqual(r.headers['x-content-type-options'], 'nosniff');
    assert.ok(r.headers['content-type'].startsWith(type), p);
    assert.ok(r.body.length > 0, p);
  }
}));

test('HEAD greeting returns 200 with headers and no body', () => withServer(async (port) => {
  const g = await request(port, 'GET', '/api/greeting?name=Ada');
  const r = await request(port, 'HEAD', '/api/greeting?name=Ada');
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.headers['content-type'], 'application/json; charset=utf-8');
  assert.strictEqual(r.headers['x-content-type-options'], 'nosniff');
  assert.strictEqual(r.headers['content-length'], g.headers['content-length']);
  assert.strictEqual(r.body, '');
}));

test('HEAD static routes return 200 with content type and empty body', () => withServer(async (port) => {
  for (const [p, type] of STATIC_ROUTES) {
    const r = await request(port, 'HEAD', p);
    assert.strictEqual(r.status, 200, p);
    assert.ok(r.headers['content-type'].startsWith(type), p);
    assert.strictEqual(r.body, '', p);
  }
}));

test('HEAD unknown path returns 404', () => withServer(async (port) => {
  const r = await request(port, 'HEAD', '/nope');
  assert.strictEqual(r.status, 404);
  assert.strictEqual(r.body, '');
}));

test('non-canonical request targets return 404 JSON', () => withServer(async (port) => {
  for (const p of ['//app.js', '//x/api/greeting?name=Z', '//']) {
    const r = await request(port, 'GET', p);
    assert.strictEqual(r.status, 404, p);
    assert.strictEqual(r.headers['content-type'], 'application/json; charset=utf-8');
    assert.strictEqual(JSON.parse(r.body).error.code, 'NOT_FOUND', p);
  }
}));

test('blank name is 400 INVALID_NAME, missing name is 200 Hello, World!', () => withServer(async (port) => {
  for (const p of ['/api/greeting?name=', '/api/greeting?name=%20%20']) {
    const r = await request(port, 'GET', p);
    assert.strictEqual(r.status, 400, p);
    assert.strictEqual(JSON.parse(r.body).error.code, 'INVALID_NAME', p);
  }
  const m = await request(port, 'GET', '/api/greeting');
  assert.strictEqual(m.status, 200);
  assert.deepStrictEqual(JSON.parse(m.body), { message: 'Hello, World!' });
}));
