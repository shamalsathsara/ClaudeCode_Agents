'use strict';

// Usage: node --test examples/backend-capability-test/test/greeting.test.js
// No external dependencies.

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

const { greet } = require(path.join(__dirname, '..', 'src', 'greeting.js'));

function assertInvalid(result) {
  assert.strictEqual(result.status, 400);
  assert.strictEqual(result.body.error.code, 'INVALID_NAME');
  assert.strictEqual(typeof result.body.error.message, 'string');
  assert.ok(result.body.error.message.length > 0);
}

test('valid name returns 200 with greeting', () => {
  assert.deepStrictEqual(greet('Ada'), { status: 200, body: { message: 'Hello, Ada!' } });
});

test('surrounding whitespace is trimmed', () => {
  assert.deepStrictEqual(greet('  Ada  '), { status: 200, body: { message: 'Hello, Ada!' } });
});

test('empty string is invalid', () => {
  assertInvalid(greet(''));
});

test('whitespace-only string is invalid', () => {
  assertInvalid(greet('   \t\n '));
});

test('exactly 50 characters is valid', () => {
  const name = 'a'.repeat(50);
  assert.deepStrictEqual(greet(name), { status: 200, body: { message: 'Hello, ' + name + '!' } });
});

test('51 characters is invalid', () => {
  assertInvalid(greet('a'.repeat(51)));
});

test('non-string inputs are invalid', () => {
  for (const value of [123, null, undefined, {}]) {
    assertInvalid(greet(value));
  }
});
