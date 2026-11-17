# Docker Sandbox & Agent Allowlist Security Test Report

**Date:** 17 November 2026  
**Project:** Claude Code Agentic AI Engineering R&D  
**Phase:** Phase 4 – Subagents & Agent Collaboration

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

## 7. Known Limitations and Remaining Tests

The following areas have not been fully validated:

1. **All approved agents:** Only `skill-builder` was successfully tested as an approved delegation target inside the sandbox. All ten allowlisted agents have not been individually tested live.
2. **Permission bypass behavior:** The `bypassPermissions` scenario has not been tested.
3. **Fail-open behavior:** Malformed input and internal-error handling were tested synthetically on the host, but not through live sandbox tests.
4. **Agent availability:** The custom agents available inside the sandbox differ from those available in the host environment.
5. **Node.js dependency:** The hook requires Node.js to execute. Node.js 24 was installed inside the sandbox during this testing session.

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
- Finalize Phase 4 – Subagents & Agent Collaboration.
- Proceed to Phase 5 – MCP Servers.
