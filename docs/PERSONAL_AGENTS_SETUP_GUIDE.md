# Personal Agents Setup Guide

## 1. Introduction

This guide explains how to create, configure, install, and verify Personal Agents in Claude Code.

Personal Agents are reusable AI subagents that can be accessed across different software projects. They help developers perform specialized tasks such as project analysis, code reviews, debugging, testing, security analysis, and technical documentation.

This guide documents the complete setup process used in the Claude Code Agentic AI Engineering project.

## 2. Prerequisites

Before starting, make sure you have:

- Windows operating system.
- Visual Studio Code installed.
- Claude Code extension installed and configured.
- Git installed.
- PowerShell available in VS Code.
- A working Claude Code subscription or account with access to Claude Code.

## 3. Understanding Personal Agent Locations

Claude Code supports different locations for custom subagents.

| Location | Purpose |
|---|---|
| `~/.claude/agents/` | Personal Agents available across projects |
| `.claude/agents/` | Project-specific Agents available within one project |

For this setup, Personal Agents are stored in:

```text
C:\Users\<USERNAME>\.claude\agents\
```

The `~` symbol represents the current user's home directory.

## 4. Repository Structure

First, create a dedicated repository to maintain agent definitions and documentation.

Example structure:

```text
ClaudeCode_Agent/
│
├── README.md
│
├── agents/
│   ├── personal/
│   │   ├── project-analyzer.md
│   │   ├── code-reviewer.md
│   │   ├── debugging-assistant.md
│   │   ├── documentation-writer.md
│   │   ├── test-engineer.md
│   │   └── security-auditor.md
│   │
│   └── project-templates/
│
├── docs/
│
├── templates/
│
└── .claude/
    └── agents/
```

**Important:** The repository's `agents/personal/` folder stores portable agent definitions. It is not the live Claude Code Personal Agent directory.

The live Personal Agent directory is `~/.claude/agents/`.

## 5. Creating a Personal Agent

Each custom agent is defined in an individual Markdown file.

For example:

```text
agents/personal/project-analyzer.md
```

An agent definition contains two main parts:

1. YAML frontmatter – Defines the agent's identity, description, and available tools.
2. Markdown instructions – Defines the agent's role, responsibilities, workflow, and safety rules.

### Example Agent Definition

```yaml
---
name: project-analyzer
description: Analyzes software projects, understands their architecture, technology stack, database, APIs, business logic, and development workflows. Use when starting work on an unfamiliar project or when a comprehensive project analysis is needed.
tools: Read, Grep, Glob
---
```

The Markdown body contains the agent's actual instructions.

Example:

```markdown
# Role

You are a Senior Software Project Analyst and Technical Architect.

Your responsibility is to understand unfamiliar software projects
and prepare a comprehensive project understanding report.

# Responsibilities

- Inspect project structure.
- Identify the technology stack.
- Understand the architecture.
- Analyze database structure.
- Review API endpoints.
- Understand business logic.
- Identify security requirements.
- Review testing and deployment workflows.

# Safety Rules

- Perform read-only analysis.
- Never modify, create, or delete files.
- Use only the available read and search tools.
- Do not invent missing technical information.
```

## 6. Understanding Agent Permissions

The `tools` field in YAML frontmatter controls which tools the agent can access.

For our initial Personal Agent collection, we use:

```yaml
tools: Read, Grep, Glob
```

These tools support:

| Tool | Purpose |
|---|---|
| Read | Read file contents |
| Grep | Search file contents |
| Glob | Find files using patterns |

We use these restrictions because our initial agents are designed for read-only analysis and recommendations.

**Important:** Instructions inside the Markdown body are not a replacement for tool permissions. Tool restrictions should be configured in the YAML frontmatter.

If the `tools` field is omitted, the agent inherits the tools available to subagents by default. Therefore, explicitly defining the allowed tools is important for our read-only agent design.

## 7. Personal Agents Created in This Project

The following six Personal Agents were created.

| Agent | Main Responsibility |
|---|---|
| `project-analyzer` | Understands project structure, architecture, technology stack, database, APIs, and business logic. |
| `code-reviewer` | Reviews source code for bugs, security issues, performance problems, and maintainability. |
| `debugging-assistant` | Investigates errors, traces execution flows, and identifies root causes. |
| `documentation-writer` | Prepares technical documentation, setup guides, API documentation, and developer guides. |
| `test-engineer` | Designs test strategies, test cases, edge cases, and coverage recommendations. |
| `security-auditor` | Reviews authentication, authorization, data handling, configuration, and application security risks. |

All six agents use the read-only tool configuration:

```yaml
tools: Read, Grep, Glob
```

## 8. Installing Personal Agents

After creating an agent definition inside the repository, copy it into Claude Code's Personal Agent directory.

### Step 1 – Open PowerShell

Open the repository in VS Code.

Open the integrated PowerShell terminal and make sure the current directory is the repository root.

Example:

```powershell
I:\Projects\ClaudeCode_Agent
```

### Step 2 – Create the Personal Agent directory

Run:

```powershell
$targetDir = Join-Path $env:USERPROFILE ".claude\agents"

New-Item -ItemType Directory -Force -Path $targetDir
```

This creates the directory if it does not already exist.

### Step 3 – Install an individual agent

For example, to install `project-analyzer`:

```powershell
$source = ".\agents\personal\project-analyzer.md"
$targetDir = Join-Path $env:USERPROFILE ".claude\agents"
$target = Join-Path $targetDir "project-analyzer.md"

New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

if (Test-Path $target) {
    Write-Host "Agent already exists. Not overwriting it."
} else {
    Copy-Item $source $target
    Write-Host "project-analyzer installed successfully!"
}
```

Repeat this process for each agent, changing the filename.

### Step 4 – Install all six agents

The following PowerShell script installs all six agents.

It skips existing destination files to avoid accidental overwriting.

Run this script from the repository root:

```powershell
$agents = @(
    "project-analyzer",
    "code-reviewer",
    "debugging-assistant",
    "documentation-writer",
    "test-engineer",
    "security-auditor"
)

$sourceDir = ".\agents\personal"
$targetDir = Join-Path $env:USERPROFILE ".claude\agents"

New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

foreach ($agent in $agents) {

    $source = Join-Path $sourceDir "$agent.md"
    $target = Join-Path $targetDir "$agent.md"

    if (-not (Test-Path $source)) {
        Write-Host "[SOURCE MISSING] $agent" -ForegroundColor Red
        continue
    }

    if (Test-Path $target) {
        Write-Host "[ALREADY EXISTS] $agent" -ForegroundColor Yellow
        continue
    }

    Copy-Item $source $target

    Write-Host "[INSTALLED] $agent" -ForegroundColor Green
}
```

**Note:** If an agent definition is updated later, the updated source file must be copied to the Personal Agent directory. The installation script above intentionally does not overwrite existing files.

## 9. Verifying Installed Agents

After installation, verify that all expected agent files exist in the Personal Agent directory.

Run:

```powershell
$agentDir = Join-Path $env:USERPROFILE ".claude\agents"

$agents = @(
    "project-analyzer",
    "code-reviewer",
    "debugging-assistant",
    "documentation-writer",
    "test-engineer",
    "security-auditor"
)

foreach ($agent in $agents) {

    $file = Join-Path $agentDir "$agent.md"

    if (Test-Path $file) {
        Write-Host "[INSTALLED] $agent" -ForegroundColor Green
    } else {
        Write-Host "[MISSING] $agent" -ForegroundColor Red
    }
}
```

Expected result:

```text
[INSTALLED] project-analyzer
[INSTALLED] code-reviewer
[INSTALLED] debugging-assistant
[INSTALLED] documentation-writer
[INSTALLED] test-engineer
[INSTALLED] security-auditor
```

This confirms that the expected files exist. It does not, by itself, prove that each agent has been successfully invoked.

## 10. Loading and Discovering Agents

After installing agents:

1. Open or restart the Claude Code session if necessary.
2. Ask Claude Code to use a specific custom subagent.
3. Check whether the expected agent is discovered and invoked.

Example request:

```text
Use the project-analyzer subagent to analyze this project.

Perform a read-only analysis.
Do not modify, create, or delete any files.

Prepare a structured Project Understanding Report.
```

Claude Code can also discover and delegate tasks to subagents based on their descriptions.

**Note:** The `/agents` wizard has been removed in newer Claude Code versions. Custom subagents can be created or updated by asking Claude Code, or by editing their Markdown files directly.

If the Personal Agent directory did not exist when Claude Code started, restart Claude Code after creating it so the new directory can be loaded.

## 11. Updating an Existing Agent

When an agent needs improvement:

1. Edit the original definition in `agents/personal/`.
2. Review the YAML frontmatter and Markdown instructions.
3. Save the updated definition.
4. Copy the updated file into `~/.claude/agents/`.
5. Reload or restart Claude Code if needed.
6. Verify the updated agent.

Always maintain the repository copy as the source of truth.

## 12. Troubleshooting

### Agent is not discovered

Possible causes:

- Incorrect Personal Agent directory.
- Incorrect Markdown filename.
- Invalid YAML frontmatter.
- Missing `name` or `description`.
- Claude Code has not reloaded the agent directory.

Recommended actions:

- Verify the file location.
- Check YAML frontmatter.
- Confirm the filename and agent name.
- Restart Claude Code if necessary.

### Agent exists in the repository but not in the Personal Agent directory

The repository definition and installed definition are separate files.

Copy the agent definition to:

```text
%USERPROFILE%\.claude\agents\
```

### Changes are not reflected

Check whether the updated repository file has been copied into the Personal Agent directory.

## 13. Important Design Principles

The following principles were used when creating this Personal Agent collection:

- Keep agent responsibilities specialized and clearly defined.
- Use descriptive agent names and descriptions.
- Apply least-privilege tool permissions.
- Keep read-only agents restricted to read and search tools.
- Avoid duplicating responsibilities between agents.
- Maintain reusable definitions inside the repository.
- Keep installed Personal Agent definitions synchronized with repository definitions.
- Test actual agent behavior separately from checking whether files exist.

## 14. Current Implementation Status

The following six Personal Agent definitions have been created and installed:

- Project Analyzer
- Code Reviewer
- Debugging Assistant
- Documentation Writer
- Test Engineer
- Security Auditor

File installation has been verified for all six agents.

Individual behavior testing and evaluation are separate pending activities.

## 15. Official Documentation

Claude Code – Subagents:

https://code.claude.com/docs/en/sub-agents

This is the official reference for custom subagent configuration, locations, permissions, and usage.

---

**End of Guide**