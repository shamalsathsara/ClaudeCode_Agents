'use strict';

// Tests for ../app.js
// Usage: node --test examples/greeting-app/frontend/test/app.test.js
// No dependencies. Fake fetch and fake element only; no real DOM, browser,
// backend, screen reader or visual check (all Unverified).

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { requestGreeting, renderResult, createGreetingController, FRIENDLY_ERROR } =require(path.join(__dirname, '..', 'app.js'));

function fakeFetch(status, body, calls) {
  return (url) => {
    if (calls) calls.push(url);
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => (typeof body === 'string' ? Promise.reject(new SyntaxError('bad json')) : Promise.resolve(body)),
    });
  };
}

test('success returns server message and encodes name', async () => {
  const calls = [];
  const r = await requestGreeting('Ada', fakeFetch(200, { message: 'Hello, Ada!' }, calls));
  assert.deepEqual(r, { ok: true, message: 'Hello, Ada!' });
  assert.deepEqual(calls, ['/api/greeting?name=Ada']);
});

test('blank name omits the name param', async () => {
  for (const blank of [undefined, '', '   ']) {
    const calls = [];
    const r = await requestGreeting(blank, fakeFetch(200, { message: 'Hello, World!' }, calls));
    assert.deepEqual(r, { ok: true, message: 'Hello, World!' });
    assert.deepEqual(calls, ['/api/greeting']);
  }
});

test('special characters are URL-encoded', async () => {
  const calls = [];
  await requestGreeting('a&b=c #', fakeFetch(200, { message: 'x' }, calls));
  assert.equal(calls[0], '/api/greeting?name=a%26b%3Dc%20%23');
});

test('400 error returns server error message', async () => {
  const body = { error: { code: 'INVALID_NAME', message: 'Name is too long.' } };
  const r = await requestGreeting('x', fakeFetch(400, body));
  assert.deepEqual(r, { ok: false, message: 'Name is too long.' });
});

test('404 with non-JSON body returns friendly error', async () => {
  const r = await requestGreeting('x', fakeFetch(404, '<html>Not found</html>'));
  assert.deepEqual(r, { ok: false, message: FRIENDLY_ERROR });
});

test('network rejection returns friendly error and does not reject', async () => {
  const r = await requestGreeting('x', () => Promise.reject(new TypeError('network down')));
  assert.deepEqual(r, { ok: false, message: FRIENDLY_ERROR });
});

test('synchronous throw from fetch is handled', async () => {
  const r = await requestGreeting('x', () => { throw new Error('boom'); });
  assert.equal(r.ok, false);
});

test('malformed bodies return friendly error', async () => {
  for (const [status, body] of [[200, {}], [200, null], [200, { message: 5 }], [500, { error: {} }]]) {
    const r = await requestGreeting('x', fakeFetch(status, body));
    assert.deepEqual(r, { ok: false, message: FRIENDLY_ERROR });
  }
});

test('renderResult sets textContent only, never innerHTML', () => {
  const attrs = {};
  let html = 'untouched';
  const el = {
    textContent: '',
    setAttribute: (k, v) => { attrs[k] = v; },
  };
  Object.defineProperty(el, 'innerHTML', {
    get: () => html,
    set: () => { throw new Error('innerHTML must not be used'); },
  });
  const evil = '<img src=x onerror=alert(1)>';
  renderResult(el, { ok: true, message: evil });
  assert.equal(el.textContent, evil);
  assert.equal(html, 'untouched');
  assert.equal(attrs['data-state'], 'success');
  renderResult(el, { ok: false, message: 'oops' });
  assert.equal(attrs['data-state'], 'error');
});

// Controller tests: fake elements and a fetch whose responses are resolved by hand.
function deferredFetch() {
  const pending = [];
  const calls = [];
  const impl = (url) => {
    calls.push(url);
    return new Promise((resolve) => pending.push(resolve));
  };
  // requestGreeting calls fetch a microtask after submit, so wait for the call first.
  const respond = async (i, status, body) => {
    while (!pending[i]) await new Promise((r) => setImmediate(r));
    pending[i]({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
  };
  return { impl, calls, respond };
}

function fakeUi() {
  return { button: { disabled: false }, output: { textContent: '', setAttribute() {} } };
}

test('button is disabled during request and re-enabled after success', async () => {
  const ui = fakeUi();
  const f = deferredFetch();
  const c = createGreetingController({ ...ui, fetchImpl: f.impl });
  const p = c.submit('Ada');
  assert.equal(ui.button.disabled, true);
  assert.equal(ui.output.textContent, 'Loading...');
  await f.respond(0, 200, { message: 'Hello, Ada!' });
  await p;
  assert.equal(ui.button.disabled, false);
  assert.equal(ui.output.textContent, 'Hello, Ada!');
});

test('button is re-enabled after failure', async () => {
  const ui = fakeUi();
  const c = createGreetingController({ ...ui, fetchImpl: () => Promise.reject(new TypeError('down')) });
  const p = c.submit('Ada');
  assert.equal(ui.button.disabled, true);
  await p;
  assert.equal(ui.button.disabled, false);
  assert.equal(ui.output.textContent, FRIENDLY_ERROR);
});

test('out-of-order responses: older response does not overwrite newer result', async () => {
  const ui = fakeUi();
  const f = deferredFetch();
  const c = createGreetingController({ ...ui, fetchImpl: f.impl });
  const first = c.submit('One');
  const second = c.submit('Two');
  await f.respond(1, 200, { message: 'Hello, Two!' });
  await second;
  assert.equal(ui.output.textContent, 'Hello, Two!');
  assert.equal(ui.button.disabled, false);
  await f.respond(0, 200, { message: 'Hello, One!' });
  await first;
  assert.equal(ui.output.textContent, 'Hello, Two!');
  assert.equal(ui.button.disabled, false);
});

test('older response arriving first does not re-enable button or render while newer is pending', async () => {
  const ui = fakeUi();
  const f = deferredFetch();
  const c = createGreetingController({ ...ui, fetchImpl: f.impl });
  const first = c.submit('One');
  const second = c.submit('Two');
  await f.respond(0, 200, { message: 'Hello, One!' });
  await first;
  assert.equal(ui.button.disabled, true);
  assert.equal(ui.output.textContent, 'Loading...');
  await f.respond(1, 200, { message: 'Hello, Two!' });
  await second;
  assert.equal(ui.output.textContent, 'Hello, Two!');
  assert.equal(ui.button.disabled, false);
});

test('controller: blank name sends no name param and shows Hello, World!', async () => {
  for (const blank of ['', '   ']) {
    const ui = fakeUi();
    const f = deferredFetch();
    const c = createGreetingController({ ...ui, fetchImpl: f.impl });
    const p = c.submit(blank);
    await f.respond(0, 200, { message: 'Hello, World!' });
    await p;
    assert.deepEqual(f.calls, ['/api/greeting']);
    assert.equal(ui.output.textContent, 'Hello, World!');
  }
});
