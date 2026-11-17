#!/usr/bin/env node
'use strict';

// PreToolUse hook (matcher: "Agent").
// Restricts which subagent types the `agent-orchestrator` subagent may spawn.
// Every other caller (main session, other subagents) is never restricted.
//
// Exit codes: 0 = allow / not our business, 2 = block (stderr is shown to Claude).
// Input is never logged; only the target type name appears in a block message.

const CALLER = 'agent-orchestrator';

const ALLOWED = new Set([
  'project-analyzer',
  'security-auditor',
  'code-reviewer',
  'test-engineer',
  'debugging-assistant',
  'documentation-writer',
  'agentic-workflow-designer',
  'mcp-specialist',
  'claude-config-specialist',
  'skill-builder',
]);

function finish(code, message) {
  if (message) {
    process.stderr.write(message + '\n', () => process.exit(code));
  } else {
    process.exit(code);
  }
}

function decide(raw) {
  let input;
  try {
    input = JSON.parse(raw);
  } catch (_) {
    // Malformed input: caller unknown, so do not restrict (protects the main session).
    return { code: 0 };
  }

  if (!input || typeof input !== 'object' || Array.isArray(input)) return { code: 0 };

  // Only the orchestrator is restricted.
  if (input.agent_type !== CALLER) return { code: 0 };

  // Defensive: the matcher should already limit this to the Agent tool.
  if (typeof input.tool_name === 'string' && input.tool_name !== 'Agent') return { code: 0 };

  const toolInput = input.tool_input;
  const target =
    toolInput && typeof toolInput === 'object' ? toolInput.subagent_type : undefined;

  if (typeof target !== 'string' || target.length === 0) {
    return {
      code: 2,
      message:
        'Blocked by agent-allowlist: agent-orchestrator must set an explicit subagent_type. ' +
        'Allowed: ' + Array.from(ALLOWED).join(', ') + '.',
    };
  }

  if (!ALLOWED.has(target)) {
    // Cap length so an odd value cannot flood the message.
    const shown = JSON.stringify(target.slice(0, 64));
    return {
      code: 2,
      message:
        'Blocked by agent-allowlist: agent-orchestrator may not spawn subagent type ' + shown + '. ' +
        'Allowed: ' + Array.from(ALLOWED).join(', ') + '.',
    };
  }

  return { code: 0 };
}

try {
  const chunks = [];
  process.stdin.on('data', (c) => chunks.push(c));
  process.stdin.on('error', () => finish(0));
  process.stdin.on('end', () => {
    try {
      const result = decide(Buffer.concat(chunks).toString('utf8'));
      finish(result.code, result.message);
    } catch (_) {
      // Unexpected internal error: fail open so the main session is never blocked.
      finish(0);
    }
  });
} catch (_) {
  finish(0);
}
