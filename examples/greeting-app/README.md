# Greeting App

A small self-contained full-stack example: a Node backend that returns a greeting, and a plain HTML/JS page that requests and displays it.

## 1. Requirements

- Node.js 18 or later (developed and tested with v22). No `package.json`, no dependencies and no install step.

## 2. Run the Application

Run from the repository root:

```bash
node examples/greeting-app/backend/server.js
```

Open `http://127.0.0.1:3000/`. Set `PORT` to use another port (for example `PORT=4000`). The server listens on `127.0.0.1` only.

## 3. API

`GET /api/greeting?name=Ada` returns `200` with `{"message":"Hello, Ada!"}`. Without `name` it returns `Hello, World!`.

An empty or whitespace-only `name`, a repeated `name` parameter, or a name longer than 50 characters returns `400` with `{"error":{"code":"INVALID_NAME","message":"..."}}`. Unknown paths return `404` and other methods return `405`, using the same error shape. Request targets that do not start with a single `/` (for example `//app.js`) are treated as unknown paths and return `404`.

Blank names: the API treats a missing `name` and an explicitly blank `name` differently. `/api/greeting` returns `Hello, World!`, but `/api/greeting?name=` returns `400`. The page never sends a blank name. If the input is empty or whitespace-only, it sends no `name` parameter and shows `Hello, World!`.

## 4. Run the Tests

Run from the repository root. Pass explicit file paths:

```bash
node --test examples/greeting-app/backend/test/greeting.test.js examples/greeting-app/backend/test/server.test.js
node --test examples/greeting-app/frontend/test/app.test.js
```

Exit code 0 means all tests passed.

## 5. Layout

| Path | Purpose |
|---|---|
| `backend/server.js` | HTTP server, routing and static file allowlist |
| `backend/greeting.js` | Pure greeting and validation logic |
| `frontend/index.html`, `frontend/app.js` | The page and its client logic |
| `backend/test/`, `frontend/test/` | Automated tests |

## 6. Limitations

- Frontend tests use a fake `fetch` and a fake element. The browser wiring (form submit, loading text, live-region announcement) is not covered by automated tests.
