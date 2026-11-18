# Agent Teams Beginner Guide

## 1. Introduction to Agent Teams

An **agent team** is a group of separate Claude Code sessions that work on one larger task together. One session is the **team lead**. The other sessions are **teammates**. Each teammate has its own context window (its own working memory) and can work at the same time as the others.

This guide explains how to set up, run and troubleshoot Agent Teams, using what this project actually tested. It is written for a beginner on Windows with PowerShell.

Agent Teams is an **experimental** Claude Code feature. It is off by default, and its behaviour may change between versions.

### 1.1 How to read the labels in this guide

Every important statement carries one of these labels, so you can tell how much to trust it.

| Label | Meaning |
|---|---|
| **Official** | Stated on the Claude Code documentation pages listed in [section 22](#22-further-learning-resources). Read on 18 November 2026. Check the live pages, because the feature is experimental |
| **Project** | A choice or configuration specific to this repository |
| **Validated** | Observed working in this project, with the evidence recorded in [tests/AGENT_TEAMS_VALIDATION_REPORT.md](../tests/AGENT_TEAMS_VALIDATION_REPORT.md) or [CLAUDE.md](../CLAUDE.md) |
| **Not validated** | Documented or planned, but not tested in this project. Do not rely on it without testing it yourself |

### 1.2 What this guide does not cover

- Split-pane display with tmux or iTerm2. Only the in-process mode was used here.
- External orchestration tools such as GSD and Gas Town. They are planned in the [README](../README.md) roadmap.

## 2. Agent Teams vs Normal Subagents

A **subagent** is a helper that the main session starts for one job. It does the job and returns a result. A **teammate** is a longer-lived, independent session that can message other teammates and share a task list.

| Question | Normal subagent | Agent Teams teammate |
|---|---|---|
| Own context window | Yes | Yes |
| Who it talks to | Only the session that started it | The lead and other teammates directly (**Official**) |
| Who coordinates | The main session manages all work | Teammates can claim tasks from a shared list (**Official**) |
| Cost | Lower | Higher, because each teammate is a full Claude instance (**Official**) |
| Needs the experimental setting | No | Yes (see [section 5](#5-enabling-agent-teams)) |

**Important for this project.** There were two different runs, and they used different mechanisms:

| Run | Mechanism | What it validated |
|---|---|---|
| Earlier supervised session | Agent Teams (a real team and shared task list) | Team setup, teammates joining from the custom agent files, shared task visibility, task claiming, shutdown on request |
| Greeting application run | Normal subagent delegation through the `Agent` tool | Choosing specialists from a requirement, parallel work on separate paths, review, independent tests |

The Greeting run did **not** use a shared task list. Do not treat it as proof of task claiming or teammate messaging. Section 20 shows how to run the same requirement as a team, and marks what is not validated.

## 3. Prerequisites and Supported Claude Code Version

1. **Windows with PowerShell.** The commands in this guide are PowerShell commands.
2. **Claude Code installed.** Check with:

   ```powershell
   claude --version
   ```

   Expected result: a version number such as `2.1.326 (Claude Code)`.
3. **Node.js** (the tests in the example use Node's built-in test runner). Check with `node --version`. The example was tested with Node 22.
4. **This repository cloned**, with the custom agents installed. See [PERSONAL_AGENTS_SETUP_GUIDE.md](PERSONAL_AGENTS_SETUP_GUIDE.md).

**Version support.**

- **Validated:** Claude Code `2.1.326`. This is the only version on which Agent Teams was tested in this project.
- **Official:** the documentation gives no minimum Claude Code version for Agent Teams. It does say `CLAUDE_CODE_ENABLE_TODO_TOOLS` needs version 2.1.233 or later.
- **Not validated:** any other version. If you use a newer version, repeat the checks in [section 21](#21-best-practices-and-checklist) before you trust the setup.

## 4. Understanding the Team Lead and Teammates

| Role | What it is | Responsibilities |
|---|---|---|
| **Team lead** | The main Claude Code session you start. Official docs call it the session that spawns teammates | Reads your requirement, splits it into tasks, chooses agents, assigns work and owned paths, checks results, reports to you |
| **Teammate** | A separate Claude Code instance started by the lead | Does its assigned task inside its owned paths and reports evidence |
| **Shared task list** | A list of work items with a status and an owner | Lets everyone see what is pending, in progress or completed |
| **Mailbox** | The messaging system between sessions (**Official**) | Delivers messages between the lead and teammates |

**Project rule:** the main session is the lead. You give the requirement once and do not need to name agents. The lead chooses them. See [CLAUDE.md](../CLAUDE.md) section 3.

A teammate does not see the lead's conversation. It gets only the prompt the lead gives it (**Official**), so every task prompt must be self-contained.

### 4.1 This project's agents

This project has 16 custom agents: 11 read-only advisory agents and 5 implementation agents. The five implementation agents can change files or run commands.

| Agent | Can edit files | Role |
|---|---|---|
| `backend-developer` | Yes | Server-side code and tests |
| `frontend-developer` | Yes | User-interface code and tests |
| `database-engineer` | Yes | Schemas and migrations (local or disposable databases only) |
| `documentation-engineer` | Yes | Documentation from verified facts |
| `test-runner` | No | Runs tests and reports exact results |
| Read-only agents (for example `code-reviewer`) | No | Analysis and review only |

The full list is in [CLAUDE.md](../CLAUDE.md) section 3. Agent files are in [agents/personal/](../agents/personal/) (reference copies) and `.claude/agents/` (project agents).

## 5. Enabling Agent Teams

**Official:** set the environment variable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` to `1`, either in your shell or in the `env` block of a settings file.

There are two ways to set it.

### 5.1 Session-scoped (validated)

Set the variable in your PowerShell window before you start Claude Code. This is the method used in this project's tests. See [section 6](#6-windows-powershell-setup).

### 5.2 In a settings file (official, not validated here)

The official documentation recommends the `env` key in a settings file such as `.claude/settings.json` or `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

This project did **not** validate settings-file enabling. The project's permission rules and hooks live in `.claude/settings.json`, and changing that file needs explicit user approval ([CLAUDE.md](../CLAUDE.md) section 4). Do not edit it just to follow this guide.

### 5.3 A known mistake in this repository

A settings file in the repository root contains the key `CLAUDE-CODE-EXPERIMENTAL_AGENT_TEAMS`. That name is mistyped (hyphens instead of underscores). A root-level `settings.json` is also not a documented settings location. This file did not enable Agent Teams in the tested session. Do not copy it. The environment variables in section 6 were set outside the repository settings.

## 6. Windows PowerShell Setup

Follow these steps in order.

1. Open a new PowerShell window.
2. Go to the repository folder:

   ```powershell
   cd <repo-root>
   ```

   Replace `<repo-root>` with the folder where you cloned the repository.
3. Set the two environment variables for this window:

   ```powershell
   $env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS="1"
   $env:CLAUDE_CODE_ENABLE_TODO_TOOLS="1"
   ```

4. Check one value (print only the variable you set, not the whole environment, because the environment can hold secrets):

   ```powershell
   $env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS
   ```

   Expected result: `1`.
5. Start Claude Code in in-process mode:

   ```powershell
   claude --teammate-mode in-process
   ```

   Expected result: an interactive Claude Code session opens in the same window.

**Session-scoped variables disappear.** A variable set with `$env:` lasts only for that PowerShell window. Open a new window and you must set both variables again. To keep them, use a persistent method, for example a settings-file `env` block (section 5.2) or a Windows user environment variable. Persistent methods were **not validated** in this project.

## 7. In-Process Teammate Mode

**In-process mode** means all teammates run inside your one terminal window. You switch between them with the keyboard. The alternative, split panes, shows each teammate in its own pane and needs tmux or iTerm2.

- **Official:** `--teammate-mode` accepts `in-process` (the default), `auto`, `tmux` or `iterm2`. The setting `teammateMode` does the same in a settings file.
- **Official:** the documentation says the `--teammate-mode` flag is experimental and does not appear in `claude --help`.
- **Observed:** the help output of the installed Claude Code 2.1.327 does not list the flag, which matches the documentation. This does not show the flag is missing.
- **Validated:** `claude --teammate-mode in-process` was the command used in the tested session.

Because `in-process` is the documented default, the flag is explicit rather than required.

### 7.1 Keyboard controls (Official, not validated here)

| Key | Action |
|---|---|
| Up / Down | Select a teammate in the panel below the prompt |
| Enter | Open the selected teammate and message it |
| Escape | Clear the selection, or interrupt the teammate you are viewing |
| `x` | Stop the selected teammate |
| `Ctrl+T` | Show or hide the task list |

## 8. Required Environment Variables and Their Purposes

| Variable | Value | Purpose | Status |
|---|---|---|---|
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | `1` | Turns the Agent Teams feature on. Without it, Claude does not form teams | **Official**, **Validated** |
| `CLAUDE_CODE_ENABLE_TODO_TOOLS` | `1` | Makes the task-tracking tools (`TaskCreate`, `TaskList`, `TaskGet`, `TaskUpdate`) available on every model | **Official** for the variable, **Validated** as set during the tested session |

Notes:

- The official documentation does not say Agent Teams needs `CLAUDE_CODE_ENABLE_TODO_TOOLS`. It only says the variable gives the task tools to models that do not have them by default. This project set it so the shared task list would be available, and the team worked. Whether it was strictly required was not tested.
- **Official:** a variable exported in your shell is not passed to teammates. A teammate gets the task tools from its own model's defaults. To set an environment variable for teammates, the documentation points to `--settings` with an `env` object. That route was not tested here.
- The two variables above are the only ones this project used for Agent Teams.

## 9. Starting a Claude Code Agent Teams Session

1. Complete [section 6](#6-windows-powershell-setup).
2. Start the session with `claude --teammate-mode in-process`.
3. Give the lead your requirement in plain language. You do not need to name agents.

**Official:** teammates are spawned only in an interactive session. With `-p` (non-interactive mode) Claude does not spawn teammates and runs named subagents as ordinary subagents.

**There is no documented command that confirms Agent Teams is on.** The practical check is to ask the lead to create a team (section 10) and see whether teammates appear in the panel below the prompt.

**Project safety settings that stay active.** The project settings disable `bypassPermissions` mode and include deny rules. **Official:** a new teammate starts in the lead's permission mode, and teammates' permission requests appear in the lead's session. Keep the session in a normal permission mode, and never approve a request just because an agent asked.

## 10. Creating a Team and Spawning Teammates

**Official:** there is no dedicated "create team" command. You describe the team in natural language, and Claude starts a teammate when it calls the `Agent` tool with a `name` while Agent Teams is enabled. Claude does not ask for confirmation first.

**Validated:** in the earlier supervised session the main session created a team as lead, and teammates joined from this project's custom agent definitions. The exact prompt used was not preserved in the repository.

An illustrative prompt (the pattern follows the official examples, but it is **not** the recorded prompt):

```text
Create a team for this requirement. Use the backend-developer agent for the API
and the frontend-developer agent for the page. Give each one its owned paths,
the API contract and the test command. Do not let them edit the same files.
```

Things to know:

- **Official:** to use a custom agent, name its type in the request. The teammate is limited to the `tools` listed in that agent file. `SendMessage` and the task tools are added for in-process teammates.
- **Official:** the agent file's `skills` field is **not** applied to teammates. Teammates load skills from project and user settings. Several agents in this project declare `project-conventions` in `skills`, so do not assume it is preloaded for teammates. Preloading was **not validated** ([CLAUDE.md](../CLAUDE.md) section 7).
- **Official:** a teammate does not see the lead's conversation, so include everything it needs in the spawn prompt.
- **Official:** start with 3 to 5 teammates. Cost grows with each active teammate. This project's examples used two.

## 11. Shared Task Management

**Official:** the task tools are:

| Tool | Purpose |
|---|---|
| `TaskCreate` | Creates a task |
| `TaskList` | Lists tasks and their status |
| `TaskGet` | Shows the full details of one task |
| `TaskUpdate` | Changes status, dependencies or details, or deletes a task |

**Official:** a task has one of three states: pending, in progress or completed. A task can depend on other tasks and shows as blocked until they finish. A teammate can claim the next unassigned, unblocked task, or the lead can assign one to a named teammate. Claiming uses file locking so two teammates cannot claim the same task.

**Validated:** in the earlier session, teammates saw the shared task list and one teammate claimed a task. The repository does not record which individual task tool calls were made, so this guide does not claim that each of the four tools was exercised.

**Official:** task status can lag. A teammate may forget to mark a task complete, which blocks tasks that depend on it. If a task looks stuck, ask the lead to check it and update the status.

### 11.1 What a good task contains

Write each task so it can stand alone:

1. **Owner:** one agent.
2. **Owned paths:** the only files or folders it may change.
3. **Contract:** the exact inputs, outputs and file names other agents rely on.
4. **Acceptance criteria:** what "done" means.
5. **Required checks:** the exact commands to run.
6. **Dependencies:** which tasks must finish first.

## 12. Assigning Clear Responsibilities and File Ownership

Two agents that edit the same file can overwrite each other (**Official**). This project's rule is that every implementation task lists its owned paths, and no two agents share a file. Shared files such as dependency manifests, lock files, CI configuration and settings belong to the lead ([CLAUDE.md](../CLAUDE.md) section 3).

Example ownership from the Greeting run:

| Owner | Owned paths |
|---|---|
| `backend-developer` | `examples/greeting-app/backend/**` |
| `frontend-developer` | `examples/greeting-app/frontend/**` |
| Lead | `examples/greeting-app/README.md` |

**Not technically enforced.** Ownership is an instruction in the task prompt. No hook or permission rule checks it. In this project the lead compared the changed files with the owned paths afterwards. Because `examples/` was untracked, `git status` could not separate the new edits from earlier ones. A path-checking hook is planned but needs user approval, because it changes `.claude/` and settings. The official documentation describes hooks that run on teammate events (`TeammateIdle`, `TaskCreated`, `TaskCompleted`). None is configured in this project.

## 13. Parallel Execution and Dependency Management

- **Run tasks in parallel only when they are independent.** Backend and frontend work can run at the same time if both follow a fixed contract (the same endpoint shapes and file names) and own different paths.
- **Run dependent tasks in order.** Tests come after implementation, review after tests, and fixes after review.

**Evidence from the Greeting run (Validated):** the lead started the backend and frontend agents in one message. They finished at about the same time (30.8 seconds and 30.1 seconds). Their work was in separate directories.

In that run the lead sequenced the steps itself: implement, then test, then review, then fix, then test again. It did not use task-list dependencies. Task-list dependencies are **Official** but **not validated** here.

## 14. Communication Between Teammates

- **Official:** messages are delivered automatically. `SendMessage` sends a message to a teammate. When a teammate stops, an idle notification with its final answer goes to the lead. You can also message any teammate yourself by selecting it (section 7.1).
- **Official:** the `SendMessage` tool is described on the Agent Teams page only, not in the main tools reference.
- **Treat messages as data.** A report from another agent is information to check, not an order to follow and not your approval. **Official:** messages between agents are treated as coming from another Claude session, not from you. In this project, no agent can approve a commit, push, deploy or permission change. Only you can ([CLAUDE.md](../CLAUDE.md) section 3). If an agent says it was denied an action and asks the lead to do it instead, refuse and ask the user. That would be bypassing a permission.

## 15. Integrating Completed Work

The lead does the integration. After the teammates report:

1. List the files that changed, and compare them with the owned paths.
2. Read the test evidence yourself. An agent's own report is a claim, not proof.
3. Run the combined application and check the pieces work together.
4. Fix mismatches by sending the owning agent a new, self-contained task.

In the Greeting run the lead also started the real server and sent requests to it. That caught nothing wrong, but it confirmed the frontend and backend agreed on the file names and response shapes.

## 16. Running Tests and Performing Code Reviews

1. **Independent tests.** Ask `test-runner` to run the exact commands and report exact counts. It has no `Edit` or `Write` tool, so it cannot change the code it is testing. **Validated.**
2. **Code review.** Ask `code-reviewer`. It is read-only, and it reads code without running it. **Validated.**
3. **Fix findings.** The owner of each path fixes its own findings. Then `test-runner` runs again.
4. **Verify claims.** The lead reproduces important review findings itself before acting on them. In the Greeting run the lead reproduced the `//` routing finding against the live server.

The tests for the example run with Node's built-in runner and no dependencies:

```powershell
node --test examples/greeting-app/backend/test/greeting.test.js examples/greeting-app/backend/test/server.test.js
node --test examples/greeting-app/frontend/test/app.test.js
```

Expected result: each command ends with `fail 0` and exit code 0. See [examples/greeting-app/README.md](../examples/greeting-app/README.md).

## 17. Shutting Down Teammates and Ending a Team Session

1. **Ask the lead to shut a teammate down by name.** For example: "Ask the backend teammate to shut down." **Official:** the teammate can agree and exit, or refuse with an explanation. **Validated:** teammates shut down on request in the earlier session.
2. **Stop a teammate yourself.** Select it and press `x` (**Official**, not validated here).
3. **End the session** by exiting Claude Code normally. **Official:** the team's configuration folder is removed when the session ends, and no separate cleanup command is documented. The shared task list folder stays on disk and is cleaned up by Claude Code's retention setting (`cleanupPeriodDays`).

**Not validated:** process-level shutdown. Teammates reported that they stopped, but nobody checked at the operating-system level that no teammate processes were left running. To check yourself after exiting, look at the running processes in Task Manager.

**Official limits that affect shutdown:** shutdown can be slow because a teammate finishes its current request first. In-process teammates are not restored by `/resume` or `/rewind`. If you resume a session, ask the lead to start new teammates.

## 18. Troubleshooting Common Problems

| Problem | Likely cause | What to do |
|---|---|---|
| No teammates appear, or Claude only uses normal subagents | The variable is not set in this window, or the session is non-interactive (`-p`) | Set the variable again (section 6) and start an interactive session |
| It worked yesterday, not today | Session variables last only for one PowerShell window | Set both variables again in the new window |
| `claude --help` does not show `--teammate-mode` | The flag is experimental and hidden (**Official**) | Expected. Use the flag as shown in section 6 |
| Settings file does not enable teams | The key is mistyped, or the file is not in a documented location | Use the exact name `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`. The root `settings.json` in this repository has a mistyped key and is not a documented location |
| Task tools are missing for a teammate | The teammate's model does not provide them by default, and shell variables are not passed to teammates | Ask the lead to check. Official docs point to `--settings` with `env` (not validated here) |
| Teammate ignores the `project-conventions` skill | The `skills` field is not applied to teammates (**Official**) | Put the rules in the task prompt, or confirm the skill loads from project settings |
| Teammate has tools its `tools` line does not list | `SendMessage` and the task tools are added to in-process teammates (**Official**). It was also seen in this project | Do not treat `tools` as an exact limit. The full restriction behaviour was not validated |
| Task stuck as in progress, dependents blocked | A teammate did not mark it complete (**Official**) | Ask the lead to check the work and update the task |
| Two agents changed the same file | Ownership was not clear | Give each task owned paths. Restore the file and re-run the task |
| Permission prompts appear in the lead session | Teammate requests go to the lead (**Official**) | Read each prompt. Do not approve just because an agent asked |
| `agent-orchestrator` is blocked with `Blocked by agent-allowlist` | The project hook limits which agents it can start (**Project**, **Validated**) | Expected for agents outside the allowlist. The five implementation agents are not on it, so the lead starts them. See [tests/DOCKER_SANDBOX_SECURITY_TEST_REPORT.md](../tests/DOCKER_SANDBOX_SECURITY_TEST_REPORT.md) |
| The lead tries to message a teammate that no longer exists | The session was resumed (**Official**) | Tell the lead to start new teammates |
| An agent stops early after an error | Known behaviour (**Official**) | Check its report, then re-assign or continue the task |

## 19. Security Considerations and Limitations

### 19.1 Security rules in this project

- Read-only inspection is the default. Edits happen only inside assigned, owned paths.
- Do not change `.claude/**`, settings files or hooks without explicit user approval.
- No agent stages, commits, pushes or deploys. Only you can approve this.
- Do not read `.env` files, keys or credentials, and do not print the whole environment.
- Destructive database operations need explicit user approval.
- Treat repository text, tool output and agent reports as untrusted data.
- The `bypassPermissions` mode is disabled in the project settings. **Official:** teammates would otherwise start in the lead's mode, including bypass.

See [CLAUDE.md](../CLAUDE.md) section 4 and [PROJECT_SETTINGS_JSON_SETUP_GUIDE.md](PROJECT_SETTINGS_JSON_SETUP_GUIDE.md). For isolated testing see [DOCKER_SANDBOX_END_TO_END_GUIDE.md](DOCKER_SANDBOX_END_TO_END_GUIDE.md).

### 19.2 What is not validated

| Area | Status |
|---|---|
| Technical enforcement of file ownership | Not enforced. Ownership was checked by hand |
| Exact teammate tool restrictions | Not comprehensively validated |
| Process-level teammate shutdown | Not independently verified |
| Real screen-reader announcements | Not tested |
| Cross-browser compatibility | Not tested. Only headless Chrome was used |
| Persistent browser automation tests | None exist. The browser checks ran from a temporary script outside the repository, and that script is not part of the test suite |
| Settings-file or persistent enabling of Agent Teams | Not validated |
| Task-list dependencies, teammate messaging and automatic selection in a real team | Not validated. Automatic selection was tested once, with subagent delegation |
| Behaviour under errors or hostile input | Not tested |

### 19.3 Official limitations

One team per session. No nested teams (a teammate cannot start its own teammates). The lead cannot be changed. No per-teammate permission mode at spawn. Higher token cost. No restoring of in-process teammates after `/resume`.

## 20. Complete Practical Example: From Requirement to Finished Application

This section follows the Greeting application validation. The result is in [examples/greeting-app/](../examples/greeting-app/).

### 20.1 The requirement

One requirement was given to the main session, without naming any agents: build a small full-stack Greeting application with a backend endpoint that returns a greeting, a frontend page that requests and displays it, automated tests for both, and a short README. The requirement also set limits: do not change existing files unnecessarily, do not change settings or agents, do not install dependencies, and do not stage, commit or push.

### 20.2 Steps that were taken

1. **Learn.** The lead inspected the repository. It found no `package.json` and no framework, but Node.js 22 was installed. The existing examples used plain Node and `node:test`. So the lead used Node's built-in `http` module and no dependencies.
2. **Select agents.** The lead chose `backend-developer`, `frontend-developer`, `test-runner` and `code-reviewer`. It did not use `database-engineer` (no data layer), `documentation-engineer` (the README was short, so the lead wrote it from verified facts) or the configuration and MCP agents.
3. **Write the contract and ownership.** The lead fixed the API shape (`GET /api/greeting?name=Ada` returns `{"message":"Hello, Ada!"}`, errors return `{"error":{"code","message"}}`) and the file names the frontend must use. It then gave each agent its owned paths (section 12).
4. **Delegate in parallel.** Both implementers started in one message and worked independently.
5. **Integrate.** The lead checked the changed files against the owned paths and ran the real server with live requests.
6. **Review.** `code-reviewer` found no critical, high or medium issues and five low findings.
7. **Fix.** The lead sent each owner a new task for its own paths: reject request targets that start with `//`, require HTTP 200 in the static-route tests, add HEAD tests, disable the submit button while a request runs, and ignore stale responses. Behaviour for blank names was kept as it was.
8. **Verify independently.** `test-runner` re-ran the tests.
9. **Browser check.** The lead drove headless Chrome against the real server.

This ran as subagent delegation. To run the same requirement as a real team, use the pattern in section 10. That version is **not validated**, because task-list dependencies and teammate messaging were not exercised in the Greeting run.

### 20.3 Results

| Check | Result | Manual or automated |
|---|---|---|
| Backend tests | 17 of 17 passed | Automated (`node --test`), re-run independently by `test-runner` |
| Frontend tests | 14 of 14 passed | Automated, re-run independently by `test-runner` |
| Live API requests | Greeting, blank name, 404 and `//` cases behaved as intended | Manual (`curl` by the lead) |
| Browser checks | 18 of 18 passed in headless Chrome | Automated script, run once by hand, not part of the repository |
| File ownership | Changed files matched owned paths | Manual comparison |
| Code review | No critical, high or medium issues. Five low findings, the relevant ones fixed | Agent review, one finding reproduced by the lead |

The browser checks covered: the page loading and its submit handler being wired, the button's real `disabled` attribute during a held request, Enter-key submission, the greeting display, blank-name behaviour, markup in a name shown as plain text, a network failure, and the live region's role and `aria-live` setting.

### 20.4 What stayed unverified

- Real screen-reader announcements. Only the markup and Chrome's accessibility tree were checked.
- Other browsers, and visual appearance.
- Repeatable browser tests. The script ran from a temporary folder outside the repository, which may be cleared. The request-in-flight and network-failure cases used the browser's request interception.
- Content-Security-Policy and Cache-Control headers were deliberately not added.
- Everything listed in section 19.2.

Full evidence is in [tests/AGENT_TEAMS_VALIDATION_REPORT.md](../tests/AGENT_TEAMS_VALIDATION_REPORT.md).

## 21. Best Practices and Checklist

**Best practices**

- Start small, with two or three teammates.
- Use a team only when work is independent. A single subagent or one session is cheaper for small tasks.
- Write a contract (names, shapes, commands) before parallel work starts.
- Give every implementation task owned paths, acceptance criteria and exact test commands.
- Let `test-runner` and `code-reviewer` check the work, and verify their key findings yourself.
- Never accept "tests pass" without seeing the command and the result.

**Checklist**

- [ ] I am using a validated Claude Code version, or I will repeat these checks on mine.
- [ ] Both environment variables are set in this PowerShell window.
- [ ] I started an interactive session, not `-p`.
- [ ] Every task has one owner, owned paths, acceptance criteria and test commands.
- [ ] Parallel tasks do not share a file.
- [ ] Changed files were compared with owned paths.
- [ ] `test-runner` re-ran the tests independently.
- [ ] A review was done and important findings were verified.
- [ ] Teammates were shut down, and I know that process-level shutdown is not verified.
- [ ] Nothing was staged, committed or pushed without my approval.
- [ ] The final report lists what was verified and what was not.

## 22. Further Learning Resources

**Official documentation** (check the live pages, because Agent Teams is experimental):

- Agent teams: <https://code.claude.com/docs/en/agent-teams>
- Environment variables: <https://code.claude.com/docs/en/env-vars>
- Settings reference: <https://code.claude.com/docs/en/settings-reference>
- CLI reference: <https://code.claude.com/docs/en/cli-reference>
- Tools reference: <https://code.claude.com/docs/en/tools-reference>
- Subagents: <https://code.claude.com/docs/en/sub-agents>

**In this repository**

- [README.md](../README.md): project overview and roadmap.
- [CLAUDE.md](../CLAUDE.md): rules for agents, current status and limitations.
- [tests/AGENT_TEAMS_VALIDATION_REPORT.md](../tests/AGENT_TEAMS_VALIDATION_REPORT.md): validation evidence.
- [PERSONAL_AGENTS_SETUP_GUIDE.md](PERSONAL_AGENTS_SETUP_GUIDE.md): creating and installing agents.
- [PROJECT_SETTINGS_JSON_SETUP_GUIDE.md](PROJECT_SETTINGS_JSON_SETUP_GUIDE.md): settings, permissions, hooks and skills.
- [DOCKER_SANDBOX_END_TO_END_GUIDE.md](DOCKER_SANDBOX_END_TO_END_GUIDE.md): isolated testing.
- [examples/greeting-app/README.md](../examples/greeting-app/README.md): how to run the example and its tests.
