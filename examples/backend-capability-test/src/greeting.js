'use strict';

// Pure greeting function. No I/O, no logging, never throws.

const MAX_NAME_LENGTH = 50;

function invalid(message) {
  return { status: 400, body: { error: { code: 'INVALID_NAME', message } } };
}

function greet(name) {
  if (typeof name !== 'string') {
    return invalid('Name must be a string.');
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

module.exports = { greet };
