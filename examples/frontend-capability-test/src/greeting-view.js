'use strict';

// Pure render module. Returns HTML strings. No DOM, no I/O, never throws.

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Single-pass replace, so already-produced entities are never escaped twice.
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  let text;
  try {
    text = String(value);
  } catch (e) {
    return '';
  }
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

const GENERIC_ERROR = '<p role="alert">Unexpected response.</p>';

function isObject(v) {
  return typeof v === 'object' && v !== null;
}

function renderResponse(response) {
  if (!isObject(response) || !isObject(response.body)) return GENERIC_ERROR;
  const body = response.body;

  if (response.status === 200 && typeof body.message === 'string') {
    return '<p role="status" aria-live="polite">' + escapeHtml(body.message) + '</p>';
  }

  if (isObject(body.error) && typeof body.error.message === 'string') {
    const code = body.error.code;
    const codeAttr =
      typeof code === 'string' ? ' data-error-code="' + escapeHtml(code) + '"' : '';
    return '<p role="alert"' + codeAttr + '>' + escapeHtml(body.error.message) + '</p>';
  }

  return GENERIC_ERROR;
}

function renderGreetingView(state) {
  try {
    if (!isObject(state)) return GENERIC_ERROR;
    switch (state.status) {
      case 'loading':
        return '<div role="status" aria-live="polite" aria-busy="true">Loading...</div>';
      case 'empty':
        return '<p>Enter a name to get a greeting.</p>';
      case 'done':
        return renderResponse(state.response);
      default:
        return GENERIC_ERROR;
    }
  } catch (e) {
    return GENERIC_ERROR;
  }
}

module.exports = { escapeHtml, renderGreetingView };
