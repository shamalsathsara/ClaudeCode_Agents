'use strict';

// Greeting app frontend. Pure logic is exported for tests (Node);
// DOM wiring runs only in a browser. No dependencies.

var FRIENDLY_ERROR = 'Could not get a greeting. Please try again.';

function buildUrl(name) {
  var trimmed = typeof name === 'string' ? name.trim() : '';
  if (trimmed === '') return '/api/greeting';
  return '/api/greeting?name=' + encodeURIComponent(name);
}

// Never rejects. Resolves { ok: true, message } or { ok: false, message }.
function requestGreeting(name, fetchImpl) {
  var doFetch = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  return Promise.resolve()
    .then(function () {
      if (!doFetch) throw new Error('no fetch');
      return doFetch(buildUrl(name));
    })
    .then(function (res) {
      return res.json().then(
        function (body) {
          if (res.ok && body && typeof body.message === 'string') {
            return { ok: true, message: body.message };
          }
          if (body && body.error && typeof body.error.message === 'string') {
            return { ok: false, message: body.error.message };
          }
          return { ok: false, message: FRIENDLY_ERROR };
        },
        function () {
          return { ok: false, message: FRIENDLY_ERROR };
        }
      );
    })
    .catch(function () {
      return { ok: false, message: FRIENDLY_ERROR };
    });
}

// Uses textContent only, so server text cannot inject HTML.
function renderResult(element, result) {
  element.textContent = result.message;
  if (element.setAttribute) {
    element.setAttribute('data-state', result.ok ? 'success' : 'error');
  }
}

// Testable wiring without a DOM. `button` and `output` are element-like
// objects. submit(name) returns a promise that resolves when that request
// settles. Only the latest request may render and re-enable the button, so an
// older response that arrives late cannot overwrite a newer result.
function createGreetingController(options) {
  var button = options.button;
  var output = options.output;
  var fetchImpl = options.fetchImpl;
  var latest = 0;

  function submit(name) {
    latest += 1;
    var mine = latest;
    button.disabled = true;
    output.textContent = 'Loading...';
    // A blank or whitespace name is intentionally sent with no name param
    // (see buildUrl). The backend then returns 'Hello, World!'. It returns
    // 400 only for an explicitly sent blank name, which this client never sends.
    return requestGreeting(name, fetchImpl).then(function (result) {
      if (mine !== latest) return;
      renderResult(output, result);
      button.disabled = false;
    });
  }

  return { submit: submit };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildUrl: buildUrl,
    requestGreeting: requestGreeting,
    renderResult: renderResult,
    createGreetingController: createGreetingController,
    FRIENDLY_ERROR: FRIENDLY_ERROR,
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('greet-form');
    var input = document.getElementById('name');
    var controller = createGreetingController({
      button: form.querySelector('button[type="submit"]'),
      output: document.getElementById('result'),
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      controller.submit(input.value);
    });
  });
}
