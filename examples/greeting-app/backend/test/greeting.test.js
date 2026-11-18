'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { greet } = require('../greeting');

test('greets a valid name', () => {
  assert.deepStrictEqual(greet('Ada'), { status: 200, body: { message: 'Hello, Ada!' } });
});

test('trims whitespace', () => {
  assert.strictEqual(greet('  Ada  ').body.message, 'Hello, Ada!');
});

test('undefined greets World', () => {
  assert.deepStrictEqual(greet(undefined), { status: 200, body: { message: 'Hello, World!' } });
});

test('empty and whitespace-only names are invalid', () => {
  for (const v of ['', '   ', '\t\n']) {
    const r = greet(v);
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.body.error.code, 'INVALID_NAME');
  }
});

test('non-string values are invalid', () => {
  for (const v of [null, 5, ['a', 'b'], {}]) {
    const r = greet(v);
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.body.error.code, 'INVALID_NAME');
  }
});

test('50 chars ok, 51 chars invalid, length measured after trim', () => {
  assert.strictEqual(greet('a'.repeat(50)).status, 200);
  assert.strictEqual(greet('  ' + 'a'.repeat(50) + '  ').status, 200);
  assert.strictEqual(greet('a'.repeat(51)).status, 400);
});
