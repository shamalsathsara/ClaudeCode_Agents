# Backend Greeting Example

## 1. Purpose

This document explains the backend greeting example in `examples/backend-capability-test/`.

The example contains one pure function, `greet(name)`, and one test file. Both were read to write this document. No other backend file was read, and the example has no server file or HTTP endpoint.

## 2. Files

| Path | Purpose |
|---|---|
| `examples/backend-capability-test/src/greeting.js` | Defines and exports `greet` |
| `examples/backend-capability-test/test/greeting.test.js` | Tests for `greet`, using the Node.js built-in `node:test` module |

## 3. The `greet(name)` Function

`greet(name)` takes one value and returns a plain object with a `status` number and a `body` object. According to a comment in the source file, the function does no I/O, does no logging and never throws.

The function is exported from `greeting.js` as `{ greet }`.

## 4. Input Rules

The function checks the input in this order:

1. If `name` is not a string, the result is an error with the message `Name must be a string.`
2. Leading and trailing whitespace is removed with `trim()`.
3. If the trimmed name is empty, the result is an error with the message `Name must not be empty.`
4. If the trimmed name is longer than 50 characters, the result is an error with the message `Name must be at most 50 characters.`
5. Otherwise the result is a success.

The length limit is the constant `MAX_NAME_LENGTH`, set to 50 in the source file. The length is the JavaScript string `length` of the trimmed name.

## 5. Response Shapes

### Success

Status `200`. The greeting uses the trimmed name.

```json
{
  "status": 200,
  "body": { "message": "Hello, Ada!" }
}
```

### Error

Status `400`, with the error code `INVALID_NAME`. The `message` value is one of the three messages listed in section 4.

```json
{
  "status": 400,
  "body": {
    "error": {
      "code": "INVALID_NAME",
      "message": "Name must not be empty."
    }
  }
}
```

## 6. Tests

### Command

The header comment of the test file gives this command:

```bash
node --test examples/backend-capability-test/test/greeting.test.js
```

The same comment says there are no external dependencies. This command was not run while writing this document, so this document does not state a test result.

### Test Cases

The test file contains 7 test cases:

| Test case | Input | Expected result |
|---|---|---|
| valid name returns 200 with greeting | `'Ada'` | `{ status: 200, body: { message: 'Hello, Ada!' } }` |
| surrounding whitespace is trimmed | `'  Ada  '` | `{ status: 200, body: { message: 'Hello, Ada!' } }` |
| empty string is invalid | `''` | Error result |
| whitespace-only string is invalid | `'   \t\n '` | Error result |
| exactly 50 characters is valid | 50 times `'a'` | Status 200 with the greeting for that name |
| 51 characters is invalid | 51 times `'a'` | Error result |
| non-string inputs are invalid | `123`, `null`, `undefined`, `{}` | Error result for each value |

For every "Error result" case, the test checks that the status is `400`, that `error.code` is `INVALID_NAME`, and that `error.message` is a non-empty string. The tests do not check the exact message text.

## 7. Not Covered

- The example has no HTTP server and no endpoint. Nothing in the two files reads a request or sends a response.
- No behaviour beyond what is described above was verified.
