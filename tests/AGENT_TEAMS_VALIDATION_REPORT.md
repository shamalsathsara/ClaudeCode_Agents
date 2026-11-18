# Agent Teams Validation Report

**Date:** 18 November 2026
**Roadmap phase:** Native Agent Teams (README roadmap row 10, referred to as "Phase 9" during the validation work)
**Status:** Completed with limitations

## 1. Objective and Scope

Validate that the lead (the main Claude session) can take one requirement, select suitable agents without being told which, delegate non-overlapping work in parallel, integrate and review the result, and verify it independently, including in a real browser.

The test subject was a small Greeting application in `examples/greeting-app/`. The application is a fixture for this validation. It is not a product feature.

## 2. Validation Runs

The evidence comes from two runs. They did not test the same mechanism, so they are kept apart.

| Run | What it covered | Mechanism |
|---|---|---|
| A. Supervised Agent Teams session (earlier) | Team setup, teammate coordination, shared task list, task claiming, shutdown on request, single-agent capability tests | Agent Teams, enabled with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` and `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` outside the repository settings |
| B. Greeting application run (this report) | Agent selection from a requirement, parallel implementation, integration, review, fixes, independent tests, browser checks | The lead delegated to custom agents through the `Agent` tool |

Run A is recorded in `CLAUDE.md` section 7 and was not re-observed in Run B. Run B did not use a team with a shared task list. Do not read Run B as evidence for task claiming or teammate messaging.

## 3. Results

| Capability | Result | Evidence | Run |
|---|---|---|---|
| Agent Teams setup and teammate coordination | Validated | Team created, teammates joined from the custom definitions, shut down on request | A |
| Shared task visibility and task claiming | Validated | Teammates saw the shared task list and claimed a task | A |
| Automatic specialist selection and delegation | Validated in one run | The requirement named no agents. The lead selected `backend-developer`, `frontend-developer`, `test-runner` and `code-reviewer`, and set contracts and owned paths | B |
| Parallel implementation on separate paths | Validated | Backend and frontend agents were started in one message and finished at about the same time (30.8 s and 30.1 s). Each wrote only inside its own directory | B |
| Integration and code review | Validated | `code-reviewer` found no critical, high or medium issues and 5 low findings. The `//` routing finding was reproduced by the lead | B |
| Independent test verification | Validated | `test-runner` re-ran the tests: 17 of 17 backend and 14 of 14 frontend passed after the review fixes | B |
| Live API verification | Validated | The lead started the real server and checked the greeting, blank-name, 404 and `//` cases with `curl` | B |
| Real browser integration | Validated | 18 of 18 checks passed in headless Chrome (see section 5) | B |

## 4. Greeting Application Run

### 4.1 Agent selection

- **Used:** `backend-developer` (owned `examples/greeting-app/backend/**`), `frontend-developer` (owned `examples/greeting-app/frontend/**`), `test-runner` (independent test runs), `code-reviewer` (read-only review).
- **Not used:** `database-engineer` (no data layer), `documentation-engineer` (the lead wrote the short README from verified facts), `security-auditor` (the reviewer covered the small attack surface), and the configuration, MCP, skill and workflow agents (out of scope).

### 4.2 Rounds and test results

| Round | Backend | Frontend | Source |
|---|---|---|---|
| Initial implementation | 12 of 12 | 9 of 9 | Implementers, then `test-runner` |
| After review fixes | 17 of 17 | 14 of 14 | Implementers, then `test-runner` (independent) |

During the fix round the frontend agent reported that 4 of its new tests failed at first because of a timing problem in its own test helper. It fixed the helper and changed no product code.

### 4.3 Review findings and outcome

- Fixed: request targets starting with `//` now return 404; static-route tests now require 200; HEAD behaviour is tested; the submit button is disabled during a request; a request counter stops an older response overwriting a newer one.
- Kept by decision: an explicitly blank `name` returns 400 on the API, while the page sends no `name` for blank input and shows `Hello, World!`. This is documented in `examples/greeting-app/README.md`.
- Not implemented by decision: Content-Security-Policy and Cache-Control headers. The 127.0.0.1 binding is unchanged.

## 5. Browser Verification

The checks ran against the real server in headless Google Chrome, controlled through the Chrome DevTools protocol. No dependencies or tools were installed.

| Area | Result |
|---|---|
| `DOMContentLoaded` initialisation | Form, input and button present, button enabled, submit handler wired |
| Submit button `disabled` attribute | Present during a held request, removed after the response |
| Enter-key submission | Sent the request and displayed the greeting |
| Overlapping Enter while in flight | No second request was sent |
| Greeting display | `Hello, Ada!` and `Hello, Zoë!` (real end-to-end request) |
| Blank name | No `name` parameter sent, `Hello, World!` shown |
| Markup in a name | Shown as plain text, no child elements created |
| Network failure | Button re-enabled, friendly message shown |
| Live region | `role="status"`, `aria-live="polite"`, and exposed in Chrome's accessibility tree as a polite, atomic live region |

Total: 18 of 18 checks passed, with no application defects found. The only console errors were the deliberately failed request and a `/favicon.ico` 404 (the page has no favicon).

## 6. Known Limitations

- **File ownership was verified by hand, not enforced.** Owned paths rest on instructions. The lead compared changed files with owned paths afterwards. Because `examples/` is untracked, `git status` cannot separate these edits from earlier ones.
- **Teammate tool restrictions were not fully validated.** Whether a `tools` list is an exact limit for teammates is untested, and teammates were seen with task and messaging tools that their lists did not include (see `CLAUDE.md` section 3).
- **Process-level shutdown was not independently verified.** Agents reported completion and shut down on request, but no process-level check was made.
- **Run B did not use a shared task list.** Delegation used the `Agent` tool, so task claiming and teammate messaging were validated only in Run A. Task dependencies were sequenced by the lead, not by task-list dependencies.
- **Automatic selection was tested once.** The requirement asked the lead to decide which agents were needed, and the lead also wrote the contracts and owned paths. Selection under other requirements, and under error or hostile conditions, is untested.
- **Browser coverage was headless Chrome only.** Edge, Firefox, Safari and visual appearance were not checked.
- **Screen-reader announcements were not tested.** Only the live-region markup and the browser accessibility tree were checked.
- **Browser checks are not in the repository.** They ran from a temporary scratchpad script that is not part of the test suite and may be deleted. The request-in-flight and network-failure cases used DevTools request interception.
- **No general test suite or CI exists.** The Greeting tests run only with the commands in `examples/greeting-app/README.md`.

## 7. Conclusion

The intended workflow worked end to end in these runs: requirement, agent selection, parallel implementation on separate paths, integration, review, fixes, independent test verification and browser verification. The phase is recorded as Completed with the limitations above. It does not show that the workflow is reliable across other tasks, or that ownership is enforced.
