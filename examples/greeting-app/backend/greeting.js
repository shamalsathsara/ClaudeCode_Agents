'use strict';

// Pure greeting logic. No I/O, no logging, never throws.
// name === undefined means "not provided" and greets the world.

const MAX_NAME_LENGTH = 50;

function invalid(message) {
  return { status: 400, body: { error: { code: 'INVALID_NAME', message } } };
}

function greet(name) {
  if (name === undefined) {
    return { status: 200, body: { message: 'Hello, World!' } };
  }
  if (typeof name !== 'string') {
    return invalid('Name must be a single string.');
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return invalid('Name must not be empty.');
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return invalid('Name must be at most ' + MAX_NAME_LENGTH + ' characters.');
  }
  return { status: 200, body: { message: 'Hello, ' + trimmed + '!' } };
}

module.exports = { greet, MAX_NAME_LENGTH };
