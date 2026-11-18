'use strict';

// Tests for src/greeting-view.js
// Usage: node --test examples/frontend-capability-test/test/greeting-view.test.js
// No external dependencies. Exits 0 if all tests pass.
// These tests check strings only. Real DOM, browser parsing, screen readers,
// visual appearance and interaction are Unverified.

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { escapeHtml, renderGreetingView } = require(path.join(__dirname, '..', 'src', 'greeting-view.js'));

// Literal fixtures mirroring the backend contract (not imported).
const OK = { status: 200, body: { message: 'Hello, Ada!' } };
const INVALID = {
  status: 400,
  body: { error: { code: 'INVALID_NAME', message: 'Name must not be empty.' } },
};
const done = (response) => ({ status: 'done', response });

test('escapeHtml escapes each special character', () => {
  assert.equal(escapeHtml('&'), '&amp;');
  assert.equal(escapeHtml('<'), '&lt;');
  assert.equal(escapeHtml('>'), '&gt;');
  assert.equal(escapeHtml('"'), '&quot;');
  assert.equal(escapeHtml("'"), '&#39;');
});

test('escapeHtml handles non-strings and nullish values', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(42), '42');
  assert.equal(escapeHtml(false), 'false');
});

test('escapeHtml does not double-escape its own output pieces', () => {
  assert.equal(escapeHtml('&lt;'), '&amp;lt;');
  assert.equal(escapeHtml('a & b'), 'a &amp; b');
  assert.equal(escapeHtml('plain'), 'plain');
});

test('loading state', () => {
  const html = renderGreetingView({ status: 'loading' });
  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-busy="true"/);
});

test('empty state', () => {
  assert.equal(renderGreetingView({ status: 'empty' }), '<p>Enter a name to get a greeting.</p>');
});

test('success state (200 contract)', () => {
  const html = renderGreetingView(done(OK));
  assert.equal(html, '<p role="status" aria-live="polite">Hello, Ada!</p>');
});

test('error state (400 INVALID_NAME contract)', () => {
  const html = renderGreetingView(done(INVALID));
  assert.equal(html, '<p role="alert" data-error-code="INVALID_NAME">Name must not be empty.</p>');
});

test('malformed input falls back to generic alert and never throws', () => {
  const bad = [
    undefined,
    null,
    'string',
    {},
    { status: 'bogus' },
    done(undefined),
    done({}),
    done({ status: 200, body: {} }),
    done({ status: 400, body: { error: {} } }),
    done({ status: 400, body: { error: 'x' } }),
    done({ status: 200, body: { message: 123 } }),
  ];
  for (const s of bad) {
    assert.equal(renderGreetingView(s), '<p role="alert">Unexpected response.</p>');
  }
});

test('script payload in success message is escaped', () => {
  const html = renderGreetingView(
    done({ status: 200, body: { message: 'Hello, <script>alert(1)</script>!' } })
  );
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});

test('onerror payload in error message is escaped', () => {
  const payload = '"><img src=x onerror=alert(1)>';
  const html = renderGreetingView(
    done({ status: 400, body: { error: { code: 'INVALID_NAME', message: payload } } })
  );
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;'));
});

test('quotes in a user name inside error.message are escaped', () => {
  const html = renderGreetingView(
    done({ status: 400, body: { error: { code: 'INVALID_NAME', message: 'Bad name "Bob" and \'Eve\'' } } })
  );
  assert.ok(html.includes('Bad name &quot;Bob&quot; and &#39;Eve&#39;'));
  assert.ok(!html.includes('"Bob"'));
  assert.ok(!html.includes("'Eve'"));
});

test('attribute breakout via double quote in error.code is neutralised', () => {
  const code = 'INVALID" onmouseover="alert(1)';
  const html = renderGreetingView(done({ status: 400, body: { error: { code, message: 'm' } } }));
  assert.ok(html.includes('data-error-code="INVALID&quot; onmouseover=&quot;alert(1)"'));
  assert.ok(!html.includes('" onmouseover='));
  assert.equal(html, '<p role="alert" data-error-code="INVALID&quot; onmouseover=&quot;alert(1)">m</p>');
  // Exactly one data-error-code attribute, and the whole payload sits inside its value.
  assert.equal(html.split('data-error-code=').length - 1, 1);
  const m = /data-error-code="([^"]*)"/.exec(html);
  assert.ok(m);
  assert.equal(m[1], 'INVALID&quot; onmouseover=&quot;alert(1)');
  // The only literal double quotes are the attribute delimiters: role (2) + data-error-code (2).
  assert.equal(html.split('"').length - 1, 4);
});

test('attribute breakout via single quote in error.code is neutralised', () => {
  const code = "' onfocus='alert(1)";
  const html = renderGreetingView(done({ status: 400, body: { error: { code, message: 'm' } } }));
  assert.ok(html.includes('data-error-code="&#39; onfocus=&#39;alert(1)"'));
  assert.ok(!html.includes("' onfocus='"));
  assert.equal(html.split('data-error-code=').length - 1, 1);
  const m = /data-error-code="([^"]*)"/.exec(html);
  assert.ok(m);
  assert.equal(m[1], '&#39; onfocus=&#39;alert(1)');
  assert.ok(!html.includes("'"));
});

test('non-string error.code omits the attribute', () => {
  const html = renderGreetingView(done({ status: 400, body: { error: { code: 5, message: 'm' } } }));
  assert.equal(html, '<p role="alert">m</p>');
});

test('accessibility: errors use role=alert, status views use aria-live', () => {
  assert.match(renderGreetingView(done(INVALID)), /^<p role="alert"/);
  assert.match(renderGreetingView(done(OK)), /role="status" aria-live="polite"/);
  assert.match(renderGreetingView({ status: 'loading' }), /aria-live="polite"/);
});
