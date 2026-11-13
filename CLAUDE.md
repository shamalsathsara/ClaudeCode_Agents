# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

An R&D workspace for learning, creating, configuring, and managing Claude Code AI agents (subagents). The goal is to explore how specialized agents can improve developer productivity. Agents are still being designed and built; there is no application code, build, or test setup yet.

## Repository Layout

- `README.md` – project overview, agent setup structure, planned agents, learning roadmap.
- `.claude/agents/` – (to be created) project-specific agent definitions.

## Agent Conventions

- Personal agents live in `~/.claude/agents/`; project-specific agents live in `.claude/agents/`.
- Each agent is a single Markdown file with YAML frontmatter (`name`, `description`, optional `tools`, `model`) followed by the system prompt.
- Use lowercase kebab-case names (e.g. `code-review-agent`) and make the filename match the `name`.
- Write the `description` so it clearly states when the agent should be invoked.
- Grant each agent only the tools it needs (e.g. read-only agents should not get Edit/Write/Bash).

## Planned Agents

Code Research, Code Review, Debugging, Testing, Security Review, Documentation.

## Working Guidelines

- Keep `README.md` in sync when agents are added or the roadmap changes.
- Prefer small, single-purpose agents over broad ones.
- Commit messages follow a `type: summary` style (e.g. `docs: Create a README file`).
