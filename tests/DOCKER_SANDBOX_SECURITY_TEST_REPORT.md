# Docker Sandbox & Agent Allowlist Security Test Report

**Date:** 17 November 2026  
**Project:** Claude Code Agentic AI Engineering R&D  
**Phase:** Phase 4 – Subagents & Agent Collaboration (original sandbox tests, sections 1 to 6) and Phase 7 – Hook Reliability and Live Validation (sections 6A to 6C)

---

## 1. Objective

The objective of this task was to establish an isolated Docker Sandbox environment and validate the security of the Claude Code Agent Orchestrator.

The main focus was to verify that the `agent-orchestrator` can invoke only explicitly approved custom agents and that unauthorized agent execution is prevented by the Agent Allowlist Hook.

## 2. Docker Sandbox Environment

A Docker Sandbox environment was successfully installed and configured on Windows.

The following activities were completed:

- Installed Docker Sandbox CLI.
- Started the Docker Sandbox daemon.
- Authenticated using Docker Sandbox login.
- Initialized the balanced network policy.
- Ran diagnostics to verify the environment.
- Created an isolated project clone using Git clone mode.
- Started a Claude Code session inside the sandbox.
- Verified the sandbox workspace and Git branch.
- Confirmed that the original source workspace was mounted read-only.
- Verified that the project-level Agent Allowlist Hook was registered.

Node.js 24 (`v24.22.3`) was installed inside the sandbox to support hook execution.

## 3. Agent Allowlist Hook Overview

The Agent Allowlist Hook is configured as a Claude Code `PreToolUse` hook with the `Agent` matcher.

Before an agent invokes another agent, the hook checks the delegation request.

The hook validates:

1. Whether the calling agent is `agent-orchestrator`.
2. Whether the requested `subagent_type` is explicitly provided.
3. Whether the requested agent name exists in the approved allowlist.

The hook allows approved agent requests and blocks unauthorized requests.

### Approved agents

The configured allowlist contains these ten agent names:

1. `project-analyzer`
2. `security-auditor`
3. `code-reviewer`
4. `test-engineer`
5. `debugging-assistant`
6. `documentation-writer`
7. `agentic-workflow-designer`
8. `mcp-specialist`
9. `claude-config-specialist`
10. `skill-builder`

## 4. Security Tests Performed

### Test 01 – Approved Agent Delegation

**Scenario:** The main session invoked `agent-orchestrator`, which delegated a read-only README summary task to `skill-builder`.

**Expected result:** The approved agent should be allowed to execute.

**Actual result:** PASS

- The main session invoked only `agent-orchestrator`.
- The orchestrator successfully invoked `skill-builder`.
- The hook allowed the delegation.
- The agent returned the requested README summary.
- No fallback agent was used.

### Test 02 – Unauthorized Agent Delegation

**Scenario:** The orchestrator attempted to invoke `general-purpose`.

**Expected result:** The hook should block the request.

**Actual result:** PASS

The hook returned an error containing:

`Blocked by agent-allowlist`

The request was blocked with exit code `2`, and `general-purpose` did not start.

### Test 03 – Other Unauthorized Agent Names

The following agent targets were tested:

| Agent target | Expected result | Actual result |
|---|---|---|
| `fork` | Block | Blocked |
| `Explore` | Block | Blocked |
| `Plan` | Block | Blocked |
| `claude` | Block | Blocked |
| `Skill-Builder` | Block | Blocked |

**Actual result:** PASS

All five requests were blocked. No unauthorized agent started.

The `Skill-Builder` test also confirmed that the allowlist uses exact, case-sensitive agent names.

### Test 04 – Missing `subagent_type`

**Scenario:** The orchestrator attempted to call the Agent tool without providing the `subagent_type` field.

**Expected result:** The hook should reject the request.

**Actual result:** PASS

The hook returned an explicit error:

`agent-orchestrator must set an explicit subagent_type.`

The request was blocked, and no agent started.

This prevents an unspecified agent request from bypassing the explicit allowlist requirement.

## 5. Consolidated Test Results

| Test | Expected behavior | Actual behavior | Status |
|---|---|---|---|
| Approved `skill-builder` | Allow | Allowed | PASS |
| Unauthorized `general-purpose` | Block | Blocked | PASS |
| Unauthorized `fork` | Block | Blocked | PASS |
| Unauthorized `Explore` | Block | Blocked | PASS |
| Unauthorized `Plan` | Block | Blocked | PASS |
| Unauthorized `claude` | Block | Blocked | PASS |
| Incorrect case `Skill-Builder` | Block | Blocked | PASS |
| Missing `subagent_type` | Block | Blocked | PASS |

All performed live sandbox tests produced their expected results.

## 6. Additional Validation

The following validations were also performed during the wider hook implementation and host testing:

- JavaScript syntax validation.
- Settings JSON validation.
- Verification that the allowlist contains exactly ten approved names.
- Verification that the allowlist names match the registered custom-agent frontmatter names.
- Synthetic tests for missing, non-string and invalid target values.
- Synthetic tests for malformed JSON and empty input.
- Host-side live tests confirming that main-session calls are not restricted by the orchestrator-specific rule.
- Host-side live tests confirming that unauthorized orchestrator delegation is blocked.

The host-side synthetic tests and sandbox live tests are separate validation activities.

## 6A. Phase 7 Step 3 – In-Sandbox Hook Execution (17 November 2026)

These tests ran the hook process inside the existing sandbox `claude-hook-security-test` (Docker Sandboxes v0.54.0) with synthetic JSON on stdin. They are not live Claude Code delegations: no agent was started through the Agent tool. The hook only receives the input and returns an exit code.

**Environment observed (`sbx exec claude-hook-security-test ...`):**

- Workspace: `/i/Projects/ClaudeCode_Agent`, branch `sandbox-hook-test`, commit `806ac39`.
- Node.js: `v24.22.3`.
- Hook SHA-256 inside the sandbox equals the host copy: `e8c45718e84a1bd5ff4b0cdfb009a34f413c263d96ec07071fc4635a091639df`.
- Sandbox `.claude/agents/` contains only 5 agents: `agent-orchestrator`, `agentic-workflow-designer`, `claude-config-specialist`, `mcp-specialist`, `skill-builder`. The six personal agents are stored in the repository under `agents/personal/` and are not in `.claude/agents/`. Whether they are installed at user level inside the sandbox was not established.
- The sandbox was stopped before testing. `sbx exec` started it, and it was left running.

**Command:** a Node script (kept outside the repository) was piped into `sbx exec -i claude-hook-security-test node -`. For each case it ran `node .claude/hooks/agent-allowlist.js` with the input shown. The script exit code was `0`.

Every input was an object `{"agent_type": <caller>, "tool_name": "Agent", "tool_input": {"subagent_type": <target>}}` unless stated.

| Caller | Target / input | Expected exit | Observed exit | Status |
|---|---|---|---|---|
| `agent-orchestrator` | `project-analyzer` | 0 | 0 | PASS |
| `agent-orchestrator` | `security-auditor` | 0 | 0 | PASS |
| `agent-orchestrator` | `code-reviewer` | 0 | 0 | PASS |
| `agent-orchestrator` | `test-engineer` | 0 | 0 | PASS |
| `agent-orchestrator` | `debugging-assistant` | 0 | 0 | PASS |
| `agent-orchestrator` | `documentation-writer` | 0 | 0 | PASS |
| `agent-orchestrator` | `agentic-workflow-designer` | 0 | 0 | PASS |
| `agent-orchestrator` | `mcp-specialist` | 0 | 0 | PASS |
| `agent-orchestrator` | `claude-config-specialist` | 0 | 0 | PASS |
| `agent-orchestrator` | `skill-builder` | 0 | 0 | PASS |
| `agent-orchestrator` | `general-purpose` | 2 | 2 | PASS |
| `agent-orchestrator` | `Skill-Builder` | 2 | 2 | PASS |
| `agent-orchestrator` | empty `tool_input` (no `subagent_type`) | 2 | 2 | PASS |
| `code-reviewer` | `general-purpose` | 0 | 0 | PASS |
| none (no `agent_type`) | `general-purpose` | 0 | 0 | PASS |
| n/a | malformed input `{not valid json` | 0 | 0 | PASS |
| n/a | empty stdin | 0 | 0 | PASS |

Observed stderr for exit 2 cases began with `Blocked by agent-allowlist: agent-orchestrator may not spawn subagent type ...` (blocked names) and `Blocked by agent-allowlist: agent-orchestrator must set an explicit subagent_type.` (missing type).

**Fail-open:** malformed JSON and empty input were run in the sandbox through the unmodified hook and exited `0`. This confirms input-level fail-open in the sandbox runtime. It does not cover the internal-error and stdin-error paths, nor the `onFailure: "block"` setting (see section 7).

**Permission bypass setting:**

- Host `.claude/settings.json` contains `"disableBypassPermissionsMode": "disable"`. It was read only and not changed. Note that this file has uncommitted changes (the `deny` rules) in the working tree.
- The sandbox clone is at commit `806ac39`. Its `.claude/settings.json` has only the hook block and does not contain `disableBypassPermissionsMode`. The sandbox clone therefore does not enforce the bypass restriction from project settings. This is a gap, not a pass.
- No bypass behavior was exercised.

## 6B. Approved Failure Policy (Phase 7)

The following policy was approved and is documented in `docs/PROJECT_SETTINGS_JSON_SETUP_GUIDE.md` (section 8). The hook implementation was not changed.

1. Valid main-session and non-orchestrator calls stay fail-open.
2. Malformed JSON and internal errors stay fail-open. Trade-off: the hook identifies the orchestrator only through `agent_type`. Anything unparseable, such as a BOM-prefixed payload, or a payload whose `agent_type` is missing or non-string, is not restricted. The automated test script records both cases as expecting exit 0.
3. Unauthorized delegation from `agent-orchestrator` stays blocked (exit 2).
4. `onFailure: "block"` stays in `.claude/settings.json`. The Claude Code hooks reference documents it (values `continue` or `block`, requires v2.1.295 or later, and it also covers failure to start, invalid output and timeouts). The installed version when this was checked was 2.1.326. The documentation claims were not tested; the hook-start-failure case was later tested live (section 6C, Result 2).
5. The live orchestrator-to-`general-purpose` test is a required canary after every Claude Code upgrade. The `agent_type` field is documented, but no version is given for it, so a change could silently disable the allowlist.

**Automated hook tests:** `node tests/test-agent-allowlist.js` (standalone Node.js script, no dependencies).

- Result of the run made after the last two cases were added (17 November 2026): **38 total, 38 passed, 0 failed, exit code 0.**
- Cases: 10 approved agents, 6 blocked agents, 3 wrong-case names, 4 missing or invalid `subagent_type`, 4 non-orchestrator callers, 1 missing `agent_type`, 1 non-`Agent` tool name, 7 malformed or non-object inputs and 2 documented fail-open cases (BOM-prefixed payload, non-string `agent_type`).
- Scope: these are host-side synthetic tests that run the hook process directly. They are not live Claude Code delegations. The script was not rerun when this report was edited.

## 6C. Phase 7 Live Validation – Claude Code 2.1.326 (17 November 2026)

Both tests below ran on the host (not in the Docker Sandbox) with Claude Code 2.1.326, with bypass permissions not used. They are reported separately.

### Result 1 – Live allowlist canary: PASS (evidence limitation)

**Scenario:** The main session invoked the existing `agent-orchestrator` subagent and asked it to make exactly one Agent call with `subagent_type` `general-purpose` (read-only README summary task), with no retry and no fallback.

**Preconditions checked first:** hook SHA-256 `e8c45718e84a1bd5ff4b0cdfb009a34f413c263d96ec07071fc4635a091639df`; project `.claude/settings.json` registers the `PreToolUse` hook for matcher `Agent` with `onFailure: "block"`, and `disableBypassPermissionsMode` is `disable`.

**Expected result:** The hook blocks the delegation with `Blocked by agent-allowlist`.

**Observed result (as reported by the orchestrator):**

```text
PreToolUse:Agent hook error: [node ${CLAUDE_PROJECT_DIR}/.claude/hooks/agent-allowlist.js]: Blocked by agent-allowlist: agent-orchestrator may not spawn subagent type "general-purpose". Allowed: project-analyzer, security-auditor, code-reviewer, test-engineer, debugging-assistant, documentation-writer, agentic-workflow-designer, mcp-specialist, claude-config-specialist, skill-builder.
```

- The delegation was blocked, and no agent started. No fallback agent was used.
- The message carries the harness `PreToolUse:Agent hook error` wrapper naming the configured `node` command, which indicates the real hook ran. This was not a manually simulated invocation.

**Evidence limitation:** The text above is the subagent's own report. The main session did not independently capture the raw tool result. The test also ran against the working-tree `.claude/settings.json`, which had uncommitted changes (the `deny` rules).

### Result 2 – Live `onFailure: "block"` test: PASS (limited scope)

**Scenario:** A disposable project outside the repository contained only a `.claude/settings.json` with a `PreToolUse` hook for matcher `Agent`. The hook `command` was the nonexistent executable `this-executable-does-not-exist-xyz` with one argument, and `onFailure` was `"block"`.

**Command shape:** from the disposable project directory, a fresh headless session was started with `claude -p "<prompt>" --allowedTools Agent --max-turns 5 --output-format stream-json --verbose`. The prompt asked for exactly one Agent call with `subagent_type` `general-purpose` and the prompt `Reply with the single word OK`, with no retry. The permission mode reported by the session was `default`.

**Expected result:** Claude Code blocks the Agent call because the hook cannot start.

**Observed result:** The session made one Agent call. The tool result had `is_error=true` and this exact text:

```text
PreToolUse:Agent hook error: [this-executable-does-not-exist-xyz arg1]: failed; blocking because onFailure is "block"
Error occurred while executing hook command: Executable not found in $PATH: "this-executable-does-not-exist-xyz"
```

No subagent started, and the session did not retry. This was read from the raw session output.

**Hook-start failure vs. exit code 2:** An ordinary block from the allowlist hook reads `Blocked by agent-allowlist: ...` (the hook's own stderr, exit code 2). The message above instead says the hook `failed` and that Claude Code is `blocking because onFailure is "block"`, with `Executable not found in $PATH`. The hook never ran, and Claude Code itself did the blocking.

**Control (`onFailure: "continue"`):** An identical disposable project with `"onFailure": "continue"` and the same nonexistent executable was run with the same prompt. The Agent call was not blocked: the tool result reported the agent launched, and the subagent replied `OK`. This shows the block in the first run comes from the `onFailure` setting.

**Scope limitation:** This confirms only hook startup failure (executable not found), on Claude Code 2.1.326, in headless `-p` mode, with one run per case. Timeout, crash after start, invalid output and non-2 exit codes were NOT TESTED, even though the documentation says `onFailure: "block"` also covers them. Interactive-session behavior and behavior in the Docker Sandbox were not tested. The disposable projects were removed after the test.

## 7. Known Limitations and Remaining Tests

The following areas have not been fully validated:

1. **All approved agents (live):** Only `skill-builder` was tested as an approved live delegation target inside the sandbox. The other nine were checked in the sandbox only at hook level (section 6A), not through live orchestrator delegation. Live delegation to those nine agents is NOT TESTED in the sandbox. Three of them (`agentic-workflow-designer`, `claude-config-specialist`, `mcp-specialist`) are present in the sandbox clone's `.claude/agents/`. Whether the six personal agents are available in the sandbox was not established, because the user-level agent directory there was not readable. Phase 7 Step 3 did not start a live Claude Code session in the sandbox.
2. **Permission bypass behavior:** NOT TESTED. The host setting is `disable`, but the sandbox clone predates that setting. Bypass behavior was not exercised.
3. **Fail-open behavior:** Malformed JSON and empty input were confirmed in the sandbox at hook level (section 6A). Internal-error and stdin-error paths are NOT TESTED because they cannot be triggered without modifying the hook or its environment. The effect of `onFailure: "block"` on a failed hook start was tested live in headless mode on the host (section 6C, Result 2); timeouts, crashes after start and the Docker Sandbox remain NOT TESTED.
4. **Agent availability:** The custom agents available inside the sandbox differ from those available in the host environment.
5. **Node.js dependency:** The hook requires Node.js to execute. Node.js 24 was installed inside the sandbox during this testing session.
6. **Deny-rule negation (Phase 7):** The `.env` deny rules in `.claude/settings.json` (`Read(.env)`, `Read(.env.*)`, `Read(!.env.example)`) were interpreted from the Claude Code documentation only. The documentation gives no minimum version for `!` negation and does not mention 2.1.326, so the carve-out is NOT TESTED at runtime. See `docs/PROJECT_SETTINGS_JSON_SETUP_GUIDE.md`, section 7.

These items should remain documented as limitations rather than being reported as completed tests.

## 8. Important Security Observations

- The hook performs validation before the Agent tool executes.
- Unauthorized delegation attempts were blocked before the requested agent started.
- The hook provides explicit error messages explaining why a request was rejected.
- Exact agent-name matching prevents differently capitalized names from being accepted.
- Missing `subagent_type` values are rejected.
- The hook does not automatically switch to another agent after a blocked request in the tests performed.

## 9. Conclusion

The Docker Sandbox environment was successfully established and used to perform isolated security testing of the Claude Code Agent Orchestrator.

The Agent Allowlist Hook successfully allowed the tested approved agent and blocked all tested unauthorized agent requests.

The tests also confirmed that incorrect agent names, different letter casing and missing `subagent_type` values are rejected.

Therefore, the core allowlist enforcement behavior has been successfully validated in the sandbox.

Additional testing is still required for permission-bypass behavior, all approved agents and sandbox-specific fail-open scenarios.

## 10. Next Steps

- Complete the Docker Sandbox setup documentation.
- Preserve the security test results in the project repository.
- Review the remaining validation limitations.
- Finalize Phase 4 – Subagents & Agent Collaboration (core allowlist enforcement validated; see sections 4 and 5).
- Finalize Phase 7 – Hook Reliability and Live Validation (sections 6A to 6C), then resolve the remaining items in section 7: bypass behavior in a refreshed sandbox clone, live delegation to the other approved agents, crash and timeout behavior with `onFailure: "block"`, and the internal-error path.
- Continue with the next roadmap phase after Phase 7 closeout. The roadmap statuses in `README.md` are out of date, so confirm the phase there first.
