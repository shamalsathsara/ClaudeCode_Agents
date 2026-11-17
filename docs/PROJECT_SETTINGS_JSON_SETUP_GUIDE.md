# Claude Code Project Settings Guide (`settings.json`)

A beginner-friendly guide to creating, configuring, validating and maintaining project-level settings in Claude Code.

**Audience:** developers who are new to Claude Code.
**Based on:** the official Claude Code documentation, read on 2026-11-17 for Claude Code 2.1.325. Settings behavior changes between releases, so check the linked pages if something here does not match your version. Some details were not re-checked against the live pages. They are listed in the note at the end of this guide.

## How to read this guide

Statements are labeled so you can tell what is official and what is advice:

- **Documented**: stated in the official documentation.
- **Recommendation**: advice from this guide. It is a reasonable practice, not a rule from the docs.

---

## Table of contents

1. [Introduction to Claude Code settings](#1-introduction-to-claude-code-settings)
2. [Settings files and other configuration files](#2-settings-files-and-other-configuration-files)
3. [Project directory structure](#3-project-directory-structure)
4. [Creating `.claude/settings.json` step by step](#4-creating-claudesettingsjson-step-by-step)
5. [The main settings explained](#5-the-main-settings-explained)
6. [Practical JSON examples](#6-practical-json-examples)
7. [How permission rules work](#7-how-permission-rules-work)
8. [Configuring hooks safely](#8-configuring-hooks-safely)
9. [Validating JSON syntax](#9-validating-json-syntax)
10. [Verifying that settings are loaded](#10-verifying-that-settings-are-loaded)
11. [Common mistakes and troubleshooting](#11-common-mistakes-and-troubleshooting)
12. [Security best practices](#12-security-best-practices)
13. [Reusable starter template](#13-reusable-starter-template)
14. [Understanding Claude Code Skills](#14-understanding-claude-code-skills)
15. [Official documentation links](#15-official-documentation-links)

---

## 1. Introduction to Claude Code settings

Claude Code reads configuration from JSON files called **settings files**. They control things that must be enforced, such as:

- which tools and commands Claude may use without asking, must ask about, or may never use (**permissions**)
- how much freedom a session starts with (**permission mode**)
- commands that run automatically at certain moments (**hooks**)
- environment variables for every session (**env**)

Settings are different from instructions. A settings file is configuration that Claude Code enforces. A `CLAUDE.md` file is context that Claude reads and tries to follow (see [section 2](#other-configuration-files)).

**Documented:** settings files are strict JSON. A `//` comment or a trailing comma is a syntax error.

---

## 2. Settings files and other configuration files

### Settings files

| Scope | Location | Who it affects | Share through git? |
|---|---|---|---|
| **User** | `~/.claude/settings.json` | You, in every project on this machine | No |
| **Project (shared)** | `.claude/settings.json` | Everyone who works in the project | Yes, commit it |
| **Project (local)** | `.claude/settings.local.json` | You, in this project only | No, keep it out of git |
| **Managed** | `managed-settings.json`, device management, or server-managed settings | Everyone in an organization | Set by administrators |

On Windows, `~` is your user profile folder, for example `C:\Users\YourName`.

**Documented:**

- Claude Code keeps `.claude/settings.local.json` out of git when *it* creates the file. If you create the file by hand, add it to `.gitignore` yourself.
- **Project-level settings live in `.claude/settings.json`.** The documentation does not list a standalone `settings.json` in the project root as a settings file, so do not rely on one. A root-level `settings.json` is not documented as being read.

### Precedence: which file wins

**Documented**, from highest to lowest priority:

1. Managed settings
2. Command line (`--settings`)
3. Project local settings (`.claude/settings.local.json`)
4. Shared project settings (`.claude/settings.json`)
5. User settings (`~/.claude/settings.json`)

Two rules matter most for beginners:

- **List settings are combined, not replaced.** If `permissions.allow` appears in several files, Claude Code merges the lists.
- **Deny always wins.** A deny rule from any scope is checked before allow rules. A user-level deny blocks a project-level allow.

### Other configuration files

| File | Purpose | Enforced? |
|---|---|---|
| `CLAUDE.md` or `.claude/CLAUDE.md` | Team instructions for the project ("we do it this way here") | No. Claude treats it as context. |
| `~/.claude/CLAUDE.md` | Your personal instructions for all projects | No |
| `CLAUDE.local.md` | Your personal instructions for one project. Add it to `.gitignore`. | No |
| `.claude/agents/*.md` | Project subagent definitions | See the sub-agents docs |
| `.claude/skills/<name>/SKILL.md` | Project skills | See the skills docs |

**Documented:** Claude Code treats `CLAUDE.md` files as context, not enforced configuration. To block an action regardless of what Claude decides, use permissions or a hook, not `CLAUDE.md`. You can run `/init` to generate a starting `CLAUDE.md`.

---

## 3. Project directory structure

A typical project that uses Claude Code project settings:

```text
my-project/
├── .claude/
│   ├── settings.json          # shared project settings (commit this)
│   ├── settings.local.json    # your personal overrides (do NOT commit)
│   ├── hooks/                 # hook scripts, if you use hooks
│   ├── agents/                # project subagents, optional
│   └── skills/                # project skills, optional
├── CLAUDE.md                  # project instructions for Claude
├── .gitignore                 # should list .claude/settings.local.json
└── ... your source code ...
```

Key points:

- `settings.json` goes **inside** the `.claude/` folder, not in the project root.
- Only `settings.json` is shared with the team. Keep personal exceptions in `settings.local.json`.

---

## 4. Creating `.claude/settings.json` step by step

These commands use Windows PowerShell and run from the project root. Run them in your own project, not blindly.

**Step 1.** Go to your project root.

```powershell
Set-Location C:\path\to\my-project
```

**Step 2.** Create the `.claude` folder if it does not exist. `-Force` here only prevents an error if the folder already exists.

```powershell
New-Item -ItemType Directory -Force .claude | Out-Null
```

**Step 3.** Create the settings file only if it does not already exist. This check avoids overwriting an existing file. The command writes UTF-8 **without** a byte-order mark (BOM), because a BOM at the start of the file can make strict JSON parsers fail. In Windows PowerShell 5.1, `Set-Content -Encoding utf8` adds a BOM, so this guide avoids it.

```powershell
if (-not (Test-Path .claude\settings.json)) { [System.IO.File]::WriteAllText("$PWD\.claude\settings.json", "{}") }
```

**Step 4.** Open `.claude\settings.json` in your editor and add your settings. Start with the small template in [section 13](#13-reusable-starter-template).

**Step 5.** Keep personal overrides out of git. This adds the entry only if it is not already in `.gitignore`, so running it twice does not duplicate it. If you prefer, edit `.gitignore` by hand instead.

```powershell
if (-not (Test-Path .gitignore) -or -not (Select-String -Path .gitignore -SimpleMatch ".claude/settings.local.json" -Quiet)) { Add-Content -Path .gitignore -Value "`n.claude/settings.local.json" }
```

**Step 6.** Validate the JSON ([section 9](#9-validating-json-syntax)), then confirm Claude Code loaded it ([section 10](#10-verifying-that-settings-are-loaded)).

**Documented:** Claude Code watches settings files and applies most edits to a running session without a restart, including permissions and hooks. If a change does not appear after a few seconds, restart the session.

---

## 5. The main settings explained

### 5.1 Permissions: `allow`, `ask`, `deny`

Permissions decide what Claude may do with each tool.

| List | What it does |
|---|---|
| `allow` | Lets Claude use the matching tool or command without asking you first. |
| `ask` | Asks you to confirm each time. |
| `deny` | Blocks the matching tool or command. |

**Documented:** rules are checked in the order **deny, then ask, then allow**, and the first match decides. More specific rules do not jump the queue, so an `allow` rule cannot carve an exception out of a `deny` rule.

**An important point about `allow`:** an `allow` rule is a *convenience*. It removes a prompt. It does not add abilities, and it does not restrict anything. The documentation notes that `deny` and `ask` rules only restrict, which is why they apply right away, while `allow` rules and a few other settings apply only after each teammate trusts the folder. If you want to *limit* what Claude can do, use `ask` and `deny` (and, for hard guarantees, sandboxing or a hook).

### 5.2 Permission modes and `defaultMode`

A **permission mode** sets how much Claude can do before it asks. Set the starting mode for new sessions with `permissions.defaultMode`.

| Mode | What runs without asking (documented summary) |
|---|---|
| `default` | Reads only. Shown as "Manual" in the CLI. |
| `acceptEdits` | Reads, file edits, and common filesystem commands such as `mkdir`, `touch`, `mv`, `cp`. |
| `plan` | Reads only. Claude plans without making changes. |
| `auto` | Everything, with background safety checks by a classifier. |
| `dontAsk` | Only pre-approved tools. Anything that would prompt is denied. Meant for locked-down CI and scripts. |
| `bypassPermissions` | Everything. For isolated containers and VMs only. |

**Documented:**

- Pressing Shift+Tab in a session cycles modes. You can also start with `claude --permission-mode plan`.
- `auto` and `bypassPermissions` set in `.claude/settings.json` or `.claude/settings.local.json` **do not take effect**. The session starts in Manual mode. The other values apply from any settings file.
- `bypassPermissions` offers no protection against prompt injection or unintended actions. The docs say to use it only in isolated environments such as containers or VMs.
- To block `bypassPermissions` mode, set `permissions.disableBypassPermissionsMode` to `"disable"`. It is most useful in managed settings where users cannot override it, but the docs say it can be set in any settings file.

**Recommendation:** leave `defaultMode` unset (so it stays `default`) for normal development. Do not enable automatic or bypass modes by default. Use `plan` or `acceptEdits` deliberately for a specific task, not as a project-wide default you never revisit.

### 5.3 Hooks

A **hook** is a command that Claude Code runs automatically at a lifecycle event, for example before a tool runs (`PreToolUse`). Hooks can block actions, add checks or log activity. They are powerful, and they run commands on your computer, so read [section 8](#8-configuring-hooks-safely) before adding one.

### 5.4 Environment variables and project configuration

The `env` key sets environment variables for every session and its subprocesses.

```json
{
  "env": {
    "API_TIMEOUT_MS": "1200000"
  }
}
```

**Documented:**

- Values are literal strings. No shell processes them, so `~` or `$HOME` stays as typed.
- Variables in `.claude/settings.json` apply to everyone on the project and are checked into source control. Most `env` values in project settings apply only after the folder is trusted.
- Some variables cannot be set from project or local settings, such as `CLAUDE_CONFIG_DIR` and the OpenTelemetry exporter variables.

**Recommendation:** treat `.claude/settings.json` as public to your team. Do not put API keys or other secrets in it. Put personal or sensitive values in `.claude/settings.local.json` (kept out of git) or in your shell environment.

Other commonly used keys (documented, in the settings reference): `model` (the model new sessions start with) and `permissions.additionalDirectories` (extra directories Claude may access). `includeCoAuthoredBy` is deprecated in favor of `attribution`.

---

## 6. Practical JSON examples

Each example is a complete, valid `.claude/settings.json`. Remember that JSON allows no comments, so the explanations are outside the code.

### Example A: a cautious starting point

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(git status)",
      "Bash(git diff *)"
    ],
    "ask": [
      "Bash(git push *)"
    ],
    "deny": [
      "Read(**/.env)",
      "Read(**/.env.*)"
    ]
  }
}
```

What it does:

- `$schema` gives your editor autocomplete and inline validation. The docs say the schema can lag behind the newest releases, so a warning on a recently added key does not necessarily mean your configuration is wrong.
- `git status` and any `git diff ...` run without a prompt. The `*` matches any arguments, so `git diff *` also matches options you may not expect (for example `git diff --output=<file>` writes a file). For a stricter setup use exact forms such as `git diff` and `git diff --staged`.
- `git push ...` always asks first.
- Claude's file tools cannot read `.env` files. The `**/` prefix makes the rule match at any depth, while a `./` prefix would cover only the project root. See the limits of this in [section 7](#how-bash-rules-and-read-rules-differ).

### Example B: a locked-down CI-style configuration

```json
{
  "permissions": {
    "defaultMode": "dontAsk",
    "allow": [
      "Bash(npm test)",
      "Bash(npm run lint)"
    ]
  }
}
```

What it does: starts in `dontAsk` mode, which denies anything that is not pre-approved. Bash commands other than the two listed are denied, and other tools may still be restricted. Run `/permissions` to see exactly what remains allowed. Use a mode like this only when you understand exactly what is pre-approved.

### Example C: environment variable for the project

```json
{
  "env": {
    "API_TIMEOUT_MS": "1200000"
  }
}
```

What it does: sets one non-secret variable for every session in this project.

---

## 7. How permission rules work

### Rule format

A rule is either a tool name, or a tool name with a specifier in parentheses:

- `Bash` matches every use of the Bash tool.
- `Bash(npm run build)` matches only that command.
- `Read(./.env)` matches reads of that file.

### Exact commands versus wildcards

**Documented:**

| Rule | Matches | Does not match |
|---|---|---|
| `Bash(npm run build)` | exactly `npm run build` | `npm run build --watch` |
| `Bash(npm run *)` | `npm run build`, `npm run test --watch`, and bare `npm run` | `npm install` |
| `Bash(ls *)` | `ls -la` and `ls` | `lsof` |
| `Bash(ls*)` | `ls -la` **and** `lsof` | |

The space before `*` matters: with a space, the command word must end at that point. A trailing `:*` (for example `Bash(ls:*)`) is an equivalent older way to write a trailing wildcard, and it is recognized only at the end of a pattern.

So `Bash(git status)` is exact, while `Bash(git status *)` also matches `git status -s`.

### Compound commands and wrappers

**Documented:**

- Claude Code recognizes command separators (`&&`, `||`, `;`, `|`, `|&`, `&`, newlines). A rule like `Bash(safe-cmd *)` does not give permission to run `safe-cmd && other-cmd`, because every part must be allowed.
- Some wrappers are stripped before matching, such as `timeout`, `time`, `nice`, `nohup`, `stdbuf`, `command` and `builtin`. So `Bash(npm test *)` also matches `timeout 30 npm test`.
- A built-in set of read-only commands (such as `ls`, `cat`, `grep` and `find`) runs without a prompt. The set is not configurable. To require a prompt for one of them, add an `ask` or `deny` rule.

### How Bash rules and Read rules differ

**Documented:** a Bash `deny` or `ask` rule is not a security boundary around a program. For example, `Bash(rm *)` stops `rm -rf build/` but not `/bin/rm -rf build/` or `bash -c 'rm -rf build/'`. For hard guarantees, the docs point to sandboxing or a `PreToolUse` hook.

A `Read` deny rule blocks Claude's **file tools** from reading a path. The docs word it as blocking file tools, and `cat` is a Bash command, so **Recommendation:** do not assume `Read(./.env)` also stops `cat .env` in Bash. Add a matching Bash `deny` rule if that matters, and prefer sandboxing for sensitive material.

### Path patterns for `Read` and `Edit`

**Documented**, gitignore-style:

| Pattern | Meaning |
|---|---|
| `//path` | Absolute path from the filesystem root |
| `~/path` | From your home folder |
| `/path` | Relative to the settings source. In project settings this resolves to the project root. |
| `path` or `./path` | Relative to the current directory |

Bare names match at any depth, so `Read(.env)` and `Read(**/.env)` are equivalent. A path such as `/Users/alice/file` is not absolute. Use `//Users/alice/file`.

### Negation (`!`) carve-outs and this project's `.env` rules

**Documented** (permissions page, as relayed by a documentation check during Phase 7):

- A `deny` or `ask` pattern that starts with `!` is a gitignore negation. It carves the paths it matches out of the `path` or `./path` rules listed before it, in the same settings file. A `!` rule listed first carves nothing out.
- The carve-out reaches only rules from the same source. It cannot cancel a deny from user, managed or other settings files.
- An `allow` rule cannot carve an exception out of a `deny` rule. Deny is checked first.
- `*` matches within a single path segment, so `.env.*` matches `.env.example`. It does not match a file named exactly `.env`.

This project's `.claude/settings.json` deny list contains these three rules, in this order:

```json
"Read(.env)",
"Read(.env.*)",
"Read(!.env.example)"
```

**Interpretation of those rules:**

| File | Result |
|---|---|
| `.env` | Blocked by `Read(.env)` |
| `.env.local`, `.env.production` | Blocked by `Read(.env.*)` |
| `.env.example` | Matched by `.env.*`, then carved out by `!.env.example`, so no deny rule applies |
| `.env.example.bak` | Blocked, because `!.env.example` does not match it |

Notes:

- The `!` rule must stay after `.env.*` and in the same file. Moving it earlier or to another settings file removes the carve-out.
- "No deny rule applies" is not an explicit allow. The file is then handled by the normal read behavior.
- These rules cover Claude's file tools and the file commands the docs say Claude Code recognizes in Bash. They do not cover a script that opens files itself. The conservative advice in the "How Bash rules and Read rules differ" section above still applies to indirect reads. Use the sandbox for hard guarantees.

**Version-specific verification limitation:** the documentation gives no minimum version for `!` negation and does not mention Claude Code 2.1.326, the version installed during Phase 7. The interpretation above comes from the documentation. It has not been verified at runtime on 2.1.326. A successful read of `.env.example` is consistent with the carve-out but does not prove which rule matched, so it is not counted as a test. A runtime check would need a dummy `.env` and `.env.example` in a disposable project with a fresh session, and it has not been done. User-level and managed settings were not inspected, and a deny there would not be reopened by this carve-out.

**`.env.example` is a permission-testing fixture, not an environment template.** It contains only `TEST_VALUE=example`. Its purpose is to exercise the `.gitignore` exception (`!.env.example`) and the `Read(!.env.example)` carve-out above. The project has no runtime environment variables, so the file does not describe any, and it should not be copied as a starting point for real configuration. Never put real secrets in it.

### Web rules

`WebFetch(domain:example.com)` matches only that host. `WebFetch(domain:*.example.com)` matches subdomains but not `example.com` itself.

### Precedence recap

- Order of checking: **deny, then ask, then allow**. The first match decides.
- Scopes merge. A deny in any scope blocks, even if another scope allows.
- `allow` rules and `additionalDirectories` in project settings apply only after the folder is trusted. `deny` and `ask` apply immediately.

---

## 8. Configuring hooks safely

### Read this first

A hook runs a command on your computer, using your account's permissions. A hook can read, change or delete files, call the network, or block Claude's tool calls. **Recommendation:**

- Review every hook before you add it and before you trust a repository that contains hooks. The hook's script is code.
- Treat `.claude/settings.json` and `.claude/hooks/` changes in pull requests like source-code changes.
- Keep matchers as narrow as possible.
- Never paste a hook from an untrusted source without reading it.

The hooks reference has more detail about hook security. This guide did not verify the exact warning wording, so read the [hooks reference](https://code.claude.com/docs/en/hooks) in full before relying on hooks in production.

### Structure

**Documented:** hooks have three levels: an event, a matcher group, and one or more handlers.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/check-command.js"],
            "onFailure": "block"
          }
        ]
      }
    ]
  }
}
```

What each part does:

- `PreToolUse`: the event. It runs before a tool call.
- `matcher`: which tool. Names are case-sensitive, and a misspelled name fails silently. Use `|` to match several tools.
- `type: "command"`: run a command.
- `command` and `args` (exec form): runs the program directly with no shell. On Windows, `command` must resolve to a real executable such as `node.exe`. A `.cmd` or `.bat` shim cannot be run this way.
- `onFailure: "block"`: if the hook itself fails, the action is blocked. Requires Claude Code 2.1.295 or later.

### Exit codes

**Documented:**

- **Exit code 2 blocks the action.** The hook's standard error text is shown to Claude as the reason.
- Exit code 1 and other non-zero codes are non-blocking errors and the action goes ahead. If your hook enforces a policy, use exit code 2.
- Exit code 0 from a `PreToolUse` hook does not approve the action. The call still goes through the normal permission flow.
- A timed-out hook does not block by default. With `onFailure: "block"`, a hook that fails to start, exits with an error other than 2, prints invalid JSON or times out blocks the action. Only the failure-to-start case was tested live (Claude Code 2.1.326, headless mode); crash and timeout behavior is documented but was not independently tested. Check the [hooks reference](https://code.claude.com/docs/en/hooks) for the exact wording, because this guide relied on a summary of it.
- `onFailure: "block"` needs Claude Code v2.1.295 or later. On older versions the field is not documented, so do not assume it is enforced. The version installed for the Phase 7 checks was 2.1.326.

### Failure policy of the agent allowlist hook

The `agent-allowlist.js` hook deliberately mixes fail-open and fail-closed behavior. This policy was approved in Phase 7.

| Situation | Result | Why |
|---|---|---|
| Valid call from the main session or any caller other than `agent-orchestrator` | Allowed (exit 0) | The main session must never be blocked |
| `agent-orchestrator` requests an allowlisted agent | Allowed (exit 0) | Intended use |
| `agent-orchestrator` requests any other agent, or sets no `subagent_type` | Blocked (exit 2) | The purpose of the hook |
| Malformed JSON, empty input, non-object input, internal error | Allowed (exit 0, fail-open) | The caller cannot be identified, and blocking would also block the main session |
| Hook cannot start (for example the executable is missing) | Blocked by `onFailure: "block"` | Configured in `.claude/settings.json`. Tested live in Phase 7 (Claude Code 2.1.326, headless mode). |
| Hook crashes after starting, exits with a non-2 error, or times out | Documented to be blocked by `onFailure: "block"` | Not independently tested |

Security trade-off of the fail-open rows:

- The hook identifies the orchestrator only through the `agent_type` field in its input. If that field is missing, renamed or unreadable, the restriction is silently not applied.
- Concretely, a payload with a leading UTF-8 byte order mark fails to parse, so the hook allows it. The automated test script records this.
- The docs describe `agent_type` as present when a hook fires inside a subagent, but give no version in which it was introduced. A Claude Code upgrade could change this without any error.
- No `timeout` is set in the hook entry, so the documented default (600 seconds) applies.

Required canary: after every Claude Code upgrade, run the live check in which `agent-orchestrator` attempts to delegate to `general-purpose` and confirm the message `Blocked by agent-allowlist` appears. The steps are Test 02 in `docs/DOCKER_SANDBOX_END_TO_END_GUIDE.md`.

### A simple example: block force pushes

This example blocks any Bash command that contains `git push --force`. It is only an illustration of how a hook works. **It is not a security boundary** because a command can be reworded or run indirectly.

Save as `.claude/hooks/check-command.js`:

```javascript
'use strict';

// Reads the hook input (JSON) from standard input.
const chunks = [];
process.stdin.on('data', (c) => chunks.push(c));
process.stdin.on('end', () => {
  let command = '';
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    command = String((input.tool_input && input.tool_input.command) || '');
  } catch (_) {
    process.exit(0); // unreadable input: do not block
  }

  if (/git\s+push\b.*--force/.test(command)) {
    process.stderr.write('Blocked: force pushes are not allowed in this project.\n');
    process.exit(2); // exit code 2 blocks the tool call
  }
  process.exit(0);
});
```

Register it with the JSON shown in the structure example above. Notes:

- The script does not log the command or the input. Avoid logging hook input, because it can contain sensitive text.
- Node.js must be installed and on your PATH.
- `${CLAUDE_PROJECT_DIR}` is the project root. The docs show path variables in exec-form `args` only for plugin paths, so test the `${CLAUDE_PROJECT_DIR}` form in your own setup, including when your path contains spaces.
- The pattern is intentionally narrow. It does not catch `-f` or `+refspec` forms, and it allows the call when the input cannot be read (it fails open). A real policy hook should cover more cases and decide deliberately whether to fail closed.

### Test a hook before you trust it

1. Run `/hooks` to confirm Claude Code sees the hook (it is a read-only browser).
2. Trigger a case that should be blocked and confirm the message appears.
3. Trigger a case that should be allowed and confirm it is not blocked.
4. Check what happens if the script has a syntax error or Node is missing. With `onFailure: "block"` the matching tool calls are blocked, which can stop real work, so know the effect before you commit the file.

### Turning hooks off

`"disableAllHooks": true` temporarily disables all hooks without removing them. Note that the value left after precedence applies is the one used, so a project file can override a user file.

---

## 9. Validating JSON syntax

Settings files are strict JSON. Validate after every edit.

**Option 1: Node.js (strict, recommended).** Prints an error message with the position if the file is invalid.

```powershell
node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8')); console.log('JSON OK')"
```

**Option 2: Python.**

```powershell
python -m json.tool .claude\settings.json
```

This prints the formatted JSON if it is valid, and an error if not.

**Option 3: PowerShell.** Useful as a quick check, but prefer a strict parser such as Node when you need to be sure.

```powershell
Get-Content .claude\settings.json -Raw | ConvertFrom-Json | Out-Null; if ($?) { "JSON OK" }
```

**Option 4: your editor.** Add the `$schema` line (see example A) to get inline validation in VS Code, Cursor and other editors that support JSON Schema.

Common JSON mistakes: a trailing comma after the last item, a comment, single quotes instead of double quotes, unescaped backslashes in paths (write `\\` for each backslash, or use forward slashes), and a byte-order mark (BOM) at the start of the file.

Also validate your hook script's syntax:

```powershell
node --check .claude\hooks\check-command.js
```

---

## 10. Verifying that settings are loaded

Valid JSON does not prove Claude Code is using it. Check from inside a session.

| Command | What it shows |
|---|---|
| `/permissions` | The allow, ask and deny rules in effect, and which settings file each came from. |
| `/doctor` | A setup checkup, including invalid settings files, with proposed fixes. It asks before applying a fix. |
| `/hooks` | A read-only list of active hooks. |
| `/status` | Which settings sources are active. |
| `/memory` | Where your `CLAUDE.md` files are. |

From a terminal, `claude doctor` prints read-only diagnostics, including settings validation errors, without starting a session. The command `claude --setting-sources user` starts with only the settings sources you list, which is useful to test whether a problem comes from project settings.

**Documented behavior for invalid settings:**

- A **Settings Error** means a file has invalid JSON or a value the schema rejects. An interactive session shows a dialog.
- A **Settings Warning** means individual entries failed, such as a malformed permission rule or an unknown hook event. Claude Code skips those entries and keeps the rest of the file.
- In non-interactive (`-p`) runs, broken files or values are skipped silently, so run `claude doctor` to see what was dropped.

---

## 11. Common mistakes and troubleshooting

| Problem | Likely cause | What to do |
|---|---|---|
| Settings seem to be ignored | The file is a root-level `settings.json`, or it is not in `.claude/` | Move it to `.claude/settings.json`. |
| Rules or hooks do not apply | Invalid JSON (trailing comma, comment) | Validate ([section 9](#9-validating-json-syntax)) and run `/doctor`. |
| An `allow` rule does not take effect for a teammate | `allow` rules apply only after the folder is trusted | Ask them to trust the folder, and confirm with `/permissions`. |
| `defaultMode: "auto"` or `"bypassPermissions"` does nothing | These values are ignored in project and local settings | Expected. Do not rely on them. |
| `Bash(ls*)` allowed something unexpected like `lsof` | The missing space before `*` | Write `Bash(ls *)`. |
| An allow rule does not override a deny rule | Deny is checked first | Remove or narrow the deny rule. |
| A rule written for `git status` allowed or asked about more than you expected | Wildcards match more than the exact command | Use the exact form when you want exactly one command. |
| `Read(./.env)` did not stop `cat .env` | Read rules apply to file tools, not to Bash | Add a Bash deny rule and consider sandboxing. |
| A hook never fires | Matcher misspelled or wrong case | Check the tool name case. Use `/hooks` to confirm the hook is listed. |
| Hook blocks or errors on Windows | Exec form needs a real `.exe`; Node missing; bad path | Use `command: "node"`, check `node --version`, validate the script with `node --check`. |
| A hook that should block does not | Exit code other than 2 | Use exit code 2 to block. Exit 1 is a non-blocking error. |
| `settings.local.json` got committed | The file was created by hand and not ignored | Add it to `.gitignore`. If it was committed, remove it from git tracking and review its contents. |
| A change does not seem to apply | The file watcher missed the edit | Wait a few seconds, then restart the session. |
| Editor warns about a valid key | The schema lags behind new releases | Check the official docs for the key. |

---

## 12. Security best practices

These mix documented guidance and recommendations, labeled accordingly.

1. **Prefer `ask` and `deny` for safety.** Remember `allow` removes prompts. (Documented behavior, recommended habit.)
2. **Start strict and open up deliberately.** Add `allow` rules for commands you have actually reviewed. (Recommendation.)
3. **Protect secrets.** Deny reads of `.env` and similar files (the documented examples are `Read(./.env)` and `Read(./.env.*)`, which cover only the project root; use `Read(**/.env)` to match at any depth). Do not store secrets in `.claude/settings.json`. (Documented example, recommended habit.)
4. **Do not treat Bash rules as a boundary.** For hard guarantees, use sandboxing (the `/sandbox` command) or a `PreToolUse` hook. (Documented.)
5. **Review hooks like code.** They run commands as you. Review `.claude/settings.json` and `.claude/hooks/` changes in pull requests. (Recommendation.)
6. **Be careful with untrusted repositories.** Project settings can contain hooks and permission rules. In an interactive session Claude Code shows a workspace trust dialog before you trust a folder. A `-p` (non-interactive) session shows no trust dialog, so review project settings and hooks before running `claude -p` in a repository you do not trust. (Documented.)
7. **Do not enable `bypassPermissions` for everyday work.** Use it only in isolated containers or VMs. You can set `permissions.disableBypassPermissionsMode` to `"disable"` to block it. (Documented.)
8. **Keep personal exceptions local.** Use `.claude/settings.local.json` so personal exceptions do not need a commit. Make sure it is git-ignored. (Documented.)
9. **Audit regularly.** Use `/permissions` to review the rules in effect. (Documented.)
10. **Use managed settings for organizations.** They cannot be overridden by users. (Documented.)
11. **Do not copy settings blindly.** A configuration written for one repository, including any example in this guide, may allow or block the wrong things for yours. Start from the small template below and add only what you understand. (Recommendation.)

---

## 13. Reusable starter template

A deliberately small, generic starting point for a new project. It contains no hooks, no `defaultMode`, and no allowances beyond two read-only git commands. Adjust it to your project.

Save as `.claude/settings.json`:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(git status)",
      "Bash(git diff)"
    ],
    "ask": [
      "Bash(git push *)",
      "Bash(git commit *)"
    ],
    "deny": [
      "Read(**/.env)",
      "Read(**/.env.*)",
      "Read(**/secrets/**)"
    ]
  }
}
```

How to adapt it:

- **Add language tools** you trust, for example `"Bash(npm test)"` or `"Bash(dotnet test)"`, as exact commands first, and widen to a wildcard only when needed.
- **Add `ask` rules** for commands that change state or the network, such as installs and deploys.
- **Add `deny` rules** for files and paths that must not be read. Remember these apply to file tools, not to Bash.
- **Do not add a hook** until you have a clear need and have reviewed it ([section 8](#8-configuring-hooks-safely)).
- **Do not add `defaultMode`** unless you have a specific reason. `auto` and `bypassPermissions` are ignored in project settings anyway.

Optional companion step: create a small `CLAUDE.md` (for example with `/init`) for team instructions, and add `.claude/settings.local.json` to `.gitignore`.

Finish by running the checks in [section 9](#9-validating-json-syntax) and [section 10](#10-verifying-that-settings-are-loaded).

---

## 14. Understanding Claude Code Skills

Settings tell Claude Code what it is *allowed* to do. **Skills** teach it *how your project does things*. This section explains skills and how they fit with the settings you just learned.

The examples below are **illustrations** of the idea. The skill and agent names are made up for this guide, and you should adapt them to your own project. The one exception is `project-conventions`, which exists in `.claude/skills/project-conventions/SKILL.md` in this repository and is deliberately generic.

### 14.1 What a skill is

**Documented:** a skill is a folder that contains a `SKILL.md` file. The file has two parts:

1. **YAML frontmatter** between `---` lines at the very top, with fields such as `name` and `description`.
2. **Instructions** in Markdown that Claude follows when the skill is used.

A skill can also hold supporting files, such as longer reference notes, examples and scripts, in the same folder.

```text
.claude/skills/api-contract/
├── SKILL.md          # required: short overview and the main instructions
├── reference.md      # optional: loaded only when needed
└── scripts/          # optional: helper scripts that Claude can run
```

Think of a skill as a **reusable playbook**: standing knowledge ("our API error format"), a repeatable workflow ("how we add a database migration"), or a checklist ("what to verify before a pull request"). You write it once, and Claude can use it in any session or by any agent that can reach it.

**Documented limits worth knowing:**

- The frontmatter must start on line 1 of `SKILL.md`. If it does not parse, the skill loads without its fields, so Claude cannot match it by description.
- Keep `SKILL.md` under 500 lines and move detail into supporting files.
- The `description` plus `when_to_use` text is cut off at 1,536 characters in the skill listing, so put the key use case first.

### 14.2 Skills, agents and subagents: the differences

These three words are often confused.

| | **Skill** | **Agent / subagent** |
|---|---|---|
| What it is | A folder of instructions and supporting files | A separate Claude worker with its own role |
| Defined in | `.claude/skills/<name>/SKILL.md` | `.claude/agents/<name>.md` |
| Does it have its own context window? | No by default. Its text is loaded into the conversation that uses it. | Yes. A subagent starts with a fresh context. |
| Does it have its own tool list and prompt? | No (it can pre-approve tools for a turn, but does not define a worker) | Yes, via `tools`, a system prompt and more |
| Purpose | Share **knowledge and procedures** | Do **work** in isolation and report back |
| Analogy | A recipe or runbook | A team member who follows recipes |

**Documented:** a subagent does **not** inherit the skills that its parent already invoked. It starts with a fresh context. That is why the `skills:` field (see [14.5](#145-preloading-skills-into-a-subagent-with-skills)) exists.

A skill can also run *inside* a subagent: setting `context: fork` in the skill's frontmatter makes the skill's content the task prompt for a new subagent of the type named in its `agent` field (default `general-purpose`). Use this only for skills that describe a task with a result. A skill that is only guidelines gives no useful output when forked.

### 14.3 An agent without skills versus with skills

Imagine a `backend-developer` subagent asked to "add an endpoint to create an order".

| | **Without skills** | **With skills** |
|---|---|---|
| Project rules | Guesses, or relies on whatever its prompt happens to say | Follows your written `project-conventions` and `api-contract` skills |
| Consistency | Each agent may name things and format errors differently | Every agent that uses the skill follows the same rules |
| Updating a rule | Edit every agent's prompt | Edit one `SKILL.md` |
| Agent prompt size | Grows large as rules accumulate | Stays short and focused on the role |
| Review | Rules are buried in prompts | Rules are visible files reviewed in pull requests |
| Risk | Wrong style or wrong pattern | A badly written skill spreads a mistake widely, so review skills like code |

Skills are guidance, not enforcement. **Documented:** if a rule must always hold, use a hook or a permission rule rather than a skill. The docs say skills are guidance while hooks run deterministically.

### 14.4 How agents discover and invoke skills

**Documented:**

- **Discovery.** Claude is shown a listing of every available skill's name and a shortened description. The listing is limited to about 1% of the model's context window, and descriptions of the least-used skills are dropped first when space is short. The names are always listed.
- **Automatic use.** When a request matches a skill's description, Claude can load the skill. Write descriptions that say what the skill does and when to use it ("Use when adding or changing an API endpoint").
- **Manual use.** You can run a skill by typing `/skill-name` at the **start** of a message.
- **Control.** Two frontmatter fields set who can invoke a skill: `disable-model-invocation: true` means only you can invoke it (good for risky workflows such as deployment), and `user-invocable: false` hides it from the `/` menu while Claude can still use it.
- **Loading.** The full body is read only when the skill is invoked. Supporting files load only when needed.
- **Where skills live.** Personal skills are in `~/.claude/skills/<name>/SKILL.md` and project skills are in `.claude/skills/<name>/SKILL.md`. Skills from plugins are namespaced as `/plugin-name:skill-name`. If the same name exists at several levels, enterprise beats personal and personal beats project.
- **Subagents discovering skills.** Without a `skills:` field, a subagent can still discover and use project, personal and plugin skills through the `Skill` tool. To stop that, leave `Skill` out of its `tools` list. This works only when the agent defines a `tools` list. An agent with no `tools` field inherits the session's tools.
- **Reloading.** Edits to an existing skill folder reload live. A newly created top-level skills folder may need `/reload-skills`.

### 14.5 Preloading skills into a subagent with `skills:`

By default a subagent finds skills on its own, which depends on descriptions matching. To guarantee a subagent has certain knowledge from the first moment, list the skills in its `skills:` field.

**Documented:**

- The **full content** of each listed skill is injected into the subagent when it starts. This is preloading, not just a listing.
- You can list up to 32 distinct skills.
- Built-in agents do not preload skills.
- You cannot preload a skill that has `disable-model-invocation: true`.
- A listed skill that is missing or disabled is skipped, with a warning in the debug log. Use `claude --debug` if a preloaded skill seems absent.

Example subagent, saved as `.claude/agents/backend-developer.md` (an illustration, not a file that exists in this repository):

```markdown
---
name: backend-developer
description: Implements and tests server-side features. Use when a task involves APIs, business logic or the database layer.
tools: Read, Grep, Glob, Edit, Write
skills:
  - project-conventions
  - api-contract
---

You are a backend developer for this project.
Follow the loaded skills exactly. If a task conflicts with them, stop and report the conflict.
```

Choose the tool list on purpose. This agent can edit files but has no `Bash`, so it cannot run shell commands.

### 14.6 How skills work with hooks, permissions and MCP servers

Think of four layers. Each does a different job.

| Layer | Job | Strength |
|---|---|---|
| **Skills** | Tell Claude *how* to do things | Guidance. Claude may not always follow it perfectly. |
| **Permissions** (`allow` / `ask` / `deny`) | Decide which tools and commands are allowed | Enforced by Claude Code. Deny always wins. |
| **Hooks** | Run your own checks at lifecycle events and block actions | Enforced when the hook exits with code 2 |
| **MCP servers** | Give Claude extra tools, such as a database or issue tracker | Tools still go through permissions |

**Skills and hooks.** **Documented:** a skill can carry its own `hooks:` in its frontmatter. They register when the skill is invoked and last for the rest of the session. Hooks for a subagent run only while that subagent is running. A project skill's hooks and `allowed-tools` apply even in non-interactive runs in an untrusted folder, so **review a skill's frontmatter before you run Claude Code in a repository you do not trust.**

**Skills and permissions.**

- **Documented:** a skill's `allowed-tools` field **pre-approves** tools for the turn in which the skill runs. It is **not** a restriction. A tool that is not listed can still be used, subject to your normal permission rules. Pre-approval lasts until your next message.
- **Documented:** you can control skills themselves with permission rules. `Skill(commit)` matches one skill, `Skill(deploy *)` matches a skill name followed by any arguments, and denying the `Skill` tool disables all skills.
- **Recommendation:** use `allowed-tools` for narrow, reviewed commands only, for example `Bash(npm test)`, and keep `ask` and `deny` rules in your settings for anything risky. Mark deployment-style skills with `disable-model-invocation: true`.

**Skills and MCP servers.** **Documented:** MCP tools are named `mcp__<server>__<tool>`, and a skill can pre-approve one through `allowed-tools` using that name. Tools from an MCP server bundled inside a plugin use a longer name that includes the plugin name, for example `mcp__plugin_<plugin>_<server>__<tool>`. A skill describes *when and how* to use the tool, and permissions still decide whether it may run.

**Skills and plugins.** **Documented:** a plugin can bundle skills, hooks and MCP servers together so a team can install them as one unit. Plugin skills are namespaced, so they do not collide with your own.

### 14.7 A simple architecture diagram

```text
 You (or the main Claude session)
          |
          |  asks for: "Add an 'orders' feature"
          v
 +-----------------------------+
 |  Main session / orchestrator|----> sees the skill LISTING (names + descriptions)
 +--------------+--------------+      and can load a skill when a request matches
                |
                |  delegates tasks to subagents
      +---------+----------+
      v                    v
 +----------------+   +-----------------+
 | backend-       |   | frontend-       |       Each subagent has:
 | developer      |   | developer       |       - its own context window
 | skills:        |   | skills:         |       - its own tools list
 |  - conventions |   |  - conventions  |       - preloaded skills (skills:)
 |  - api-contract|   |  - api-contract |
 +-------+--------+   +--------+--------+
         |                     |
         +----------+----------+
                    v
        Every tool call is checked by:
        PreToolUse hooks  ->  permission rules (deny > ask > allow)  ->  runs
                    |
                    +--> built-in tools, and MCP server tools (mcp__server__tool)

 Shared knowledge lives in files:   .claude/skills/<name>/SKILL.md
 Settings and enforcement live in:  .claude/settings.json
```

**Documented:** `PreToolUse` hooks run before the permission check. A hook that exits with code 0 does not approve the call, and the call still goes through the normal permission rules (see [section 8](#8-configuring-hooks-safely)).

### 14.8 A practical full-stack example

**Goal:** a team builds a web shop with a database, a REST API and a web interface. They want several agents to work in a consistent way.

**Step 1: write a few small skills** under `.claude/skills/`:

| Skill | Content |
|---|---|
| `project-conventions` | Inspect the project, follow its own conventions, and meet a definition of done |
| `api-contract` | Define the endpoint (path, request, response, error shape) before writing code |
| `db-migration` | How schema changes are written, reviewed and rolled back. Mark manual-only. |
| `pr-checklist` | What to check before a pull request is opened |

**Step 2: write one skill properly.** Here is `api-contract/SKILL.md`:

```markdown
---
name: api-contract
description: Defines and changes REST API contracts for this project. Use when adding or changing an API endpoint, request or response shape, or error format.
---

# API contract rules

1. Write the contract first: method, path, request body, response body, error cases.
2. Use the standard error shape: `{ "error": { "code": "...", "message": "..." } }`.
3. Never change an existing response field in place. Add a new field instead.
4. After the contract is agreed, implement the backend, then the frontend client.
5. List which tests cover each endpoint before finishing.
```

**Step 3: give agents the right skills.** `backend-developer` and `frontend-developer` list `project-conventions` and `api-contract` in `skills:`, so both start with the same rules. A `db-migration` skill is marked `disable-model-invocation: true` and is run by a person with `/db-migration`.

**Step 4: keep enforcement in settings and hooks, not in skills.** For example:

- `ask` rules for `git push` and for installs, and `deny` rules for reading `.env` files (see [section 7](#7-how-permission-rules-work)).
- A reviewed hook that blocks dangerous commands ([section 8](#8-configuring-hooks-safely)).
- Subagent `tools` lists that give each agent only what it needs.

**Step 5: ask for the feature.** Claude breaks "add an orders feature" into tasks. The backend agent follows `api-contract`, the frontend agent uses the same contract, and every tool call still goes through permissions and hooks. When the team changes the error format, they edit one `SKILL.md`.

**Step 6: test the skills.** Check that each skill triggers on the requests it should and not on unrelated ones, and that preloaded skills really appear in the subagent. The docs describe `/context` and `/doctor` (to see listing cost), `claude --debug` (to see why a skill did not load) and `claude plugin validate` for frontmatter problems.

### 14.9 Beginner tips

- Start with **one or two** short skills, not twenty. Every skill adds a name and description to the listing.
- Write the `description` for the moment a user would ask, in their words.
- Write standing instructions ("run the tests after every edit"), not one-time steps. Once a skill loads, its text stays in the conversation.
- Put the most important instructions near the top of `SKILL.md`. After the context is compacted, only the first part of each skill is kept.
- Treat skills like code: review them in pull requests, because they steer Claude and can carry hooks.
- If a skill does not trigger, check the description first, then `/doctor` and `claude --debug`.

---

## 15. Official documentation links

- Skills: <https://code.claude.com/docs/en/skills>
- Subagents (the `skills:` field): <https://code.claude.com/docs/en/sub-agents>
- Plugin components (skills, hooks, MCP servers in plugins): <https://code.claude.com/docs/en/plugins/components>
- Settings: <https://code.claude.com/docs/en/settings>
- Settings reference: <https://code.claude.com/docs/en/settings-reference>
- Permissions: <https://code.claude.com/docs/en/permissions>
- Permission modes: <https://code.claude.com/docs/en/permission-modes>
- Hooks reference: <https://code.claude.com/docs/en/hooks>
- Hooks guide: <https://code.claude.com/docs/en/hooks-guide>
- Memory and `CLAUDE.md`: <https://code.claude.com/docs/en/memory>
- Environment variables: <https://code.claude.com/docs/en/env-vars>
- CLI reference: <https://code.claude.com/docs/en/cli-reference>
- Debug your configuration: <https://code.claude.com/docs/en/debug-your-config>
- Security: <https://code.claude.com/docs/en/security>
- Settings JSON Schema: <https://json.schemastore.org/claude-code-settings.json>

> **Note:** parts of the hooks and settings-reference pages were read only partially when this guide was written. In particular, the exact wording of the hooks security warning, the `statusLine` format, and the `cleanupPeriodDays` default were not verified and are not stated here. For the skills section, the skills page was read in two parts and the middle was returned as a summary, so check the skills page directly for exact wording, and the Windows details for skills are thin in the docs. The following claims were not re-checked against the live pages and should be verified for your version: the list of commands that `acceptEdits` allows, the list of command wrappers that are stripped before matching, the deprecation of `includeCoAuthoredBy` in favor of `attribution`, the roughly 1% skill-listing budget, the 32-skill preload limit, how much of a skill is kept after compaction, the `/reload-skills` command, the `claude plugin validate` command, and that built-in agents do not preload skills.
