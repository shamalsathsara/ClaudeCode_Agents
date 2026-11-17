#!/usr/bin/env node
'use strict';

// Automated tests for .claude/hooks/agent-allowlist.js
// Usage: node tests/test-agent-allowlist.js
// No external dependencies. Exits 0 if all tests pass, 1 otherwise.

const { spawnSync } = require('child_process');
const path = require('path');

const HOOK = path.join(__dirname, '..', '.claude', 'hooks', 'agent-allowlist.js');

const ALLOWED = [
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
];

const BLOCKED = ['general-purpose', 'Explore', 'Plan', 'claude', 'statusline-setup', 'agent-orchestrator'];

function payload(agentType, subagentType, extra) {
  const obj = { tool_name: 'Agent', tool_input: {} };
  if (agentType !== undefined) obj.agent_type = agentType;
  if (subagentType !== undefined) obj.tool_input.subagent_type = subagentType;
  return JSON.stringify(Object.assign(obj, extra || {}));
}

const tests = [];
function add(name, input, expectedCode, stderrContains) {
  tests.push({ name, input, expectedCode, stderrContains });
}

// Allowed agents (orchestrator caller)
for (const a of ALLOWED) add(`allowed: orchestrator -> ${a}`, payload('agent-orchestrator', a), 0);

// Blocked agents
for (const b of BLOCKED) add(`blocked: orchestrator -> ${b}`, payload('agent-orchestrator', b), 2, 'Blocked by agent-allowlist');

// Wrong-case names
add('wrong case: Code-Reviewer', payload('agent-orchestrator', 'Code-Reviewer'), 2, 'Blocked');
add('wrong case: PROJECT-ANALYZER', payload('agent-orchestrator', 'PROJECT-ANALYZER'), 2, 'Blocked');
add('wrong case: Skill-builder', payload('agent-orchestrator', 'Skill-builder'), 2, 'Blocked');

// Missing / invalid subagent_type
add('missing subagent_type', payload('agent-orchestrator', undefined), 2, 'explicit subagent_type');
add('empty subagent_type', payload('agent-orchestrator', ''), 2, 'explicit subagent_type');
add('non-string subagent_type', JSON.stringify({ agent_type: 'agent-orchestrator', tool_name: 'Agent', tool_input: { subagent_type: 5 } }), 2, 'explicit subagent_type');
add('missing tool_input', JSON.stringify({ agent_type: 'agent-orchestrator', tool_name: 'Agent' }), 2, 'explicit subagent_type');

// Non-orchestrator callers are never restricted
add('non-orchestrator: main session style (no agent_type) -> general-purpose', payload(undefined, 'general-purpose'), 0);
add('non-orchestrator: code-reviewer caller -> general-purpose', payload('code-reviewer', 'general-purpose'), 0);
add('non-orchestrator: other caller, missing subagent_type', payload('test-engineer', undefined), 0);
add('non-orchestrator: wrong-case caller "Agent-Orchestrator"', payload('Agent-Orchestrator', 'general-purpose'), 0);

// Missing agent_type
add('missing agent_type', JSON.stringify({ tool_name: 'Agent', tool_input: { subagent_type: 'general-purpose' } }), 0);

// Non-Agent tool from orchestrator is ignored
add('orchestrator with non-Agent tool_name', payload('agent-orchestrator', 'general-purpose', { tool_name: 'Read' }), 0);

// Malformed / empty / non-object input fails open
add('malformed JSON', '{not valid json', 0);
add('truncated JSON', '{"agent_type":"agent-orchestrator","tool_input":{', 0);
add('empty input', '', 0);
add('whitespace-only input', '   \n', 0);
add('JSON array', '[]', 0);
add('JSON null', 'null', 0);
add('JSON string', '"agent-orchestrator"', 0);

// Documented fail-open trade-offs (approved policy): unparseable or unidentifiable
// callers are NOT restricted. These tests record that behavior; they do not endorse it.
add('fail-open: BOM-prefixed orchestrator payload (JSON.parse fails)', '﻿' + payload('agent-orchestrator', 'general-purpose'), 0);
add('fail-open: non-string agent_type', JSON.stringify({ agent_type: 123, tool_name: 'Agent', tool_input: { subagent_type: 'general-purpose' } }), 0);

let passed = 0;
let failed = 0;

console.log(`Testing hook: ${HOOK}\n`);

tests.forEach((t, i) => {
  const r = spawnSync(process.execPath, [HOOK], { input: t.input, encoding: 'utf8', timeout: 10000 });
  const codeOk = r.status === t.expectedCode;
  const msgOk = !t.stderrContains || (r.stderr || '').includes(t.stderrContains);
  const ok = codeOk && msgOk;
  if (ok) passed++; else failed++;
  const num = String(i + 1).padStart(2, '0');
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${num} ${t.name} (expected exit ${t.expectedCode}, got ${r.status})`);
  if (!ok) {
    if (!msgOk) console.log(`       stderr missing "${t.stderrContains}"; got: ${(r.stderr || '').trim()}`);
    if (r.error) console.log(`       spawn error: ${r.error.message}`);
  }
});

console.log(`\nTotal: ${tests.length}  Passed: ${passed}  Failed: ${failed}`);
process.exit(failed === 0 ? 0 : 1);
