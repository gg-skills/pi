# Pi Coding Agent — Community Packages Deep Dive

**Source:** GitHub READMEs + npm pages for top 8 packages
**Captured:** 2026-03-24

---

## pi-subagents (9,796 downloads/mo)

**GitHub:** github.com/nicobailon/pi-subagents
**Install:** `pi install npm:pi-subagents`

Multi-agent delegation with three execution modes, TUI progress, and agent discovery.

### Execution Modes

| Mode | Schema | Behavior |
|------|--------|----------|
| Single | `{ agent: "name", task: "..." }` | One subagent, isolated context |
| Parallel | `{ tasks: [{ agent, task }, ...] }` | Up to 8 tasks, 4 concurrent |
| Chain | `{ chain: [{ agent, task: "... {previous} ..." }] }` | Sequential, output piped forward |

### Agent Definition (YAML frontmatter in `.md`)

```yaml
# .pi/agents/scout.md
---
name: scout
description: Fast codebase recon
tools: read, grep, find, ls, bash, mcp:chrome-devtools
model: claude-haiku-4-5
thinking: high
skill: safe-bash, chrome-devtools
output: context.md
defaultReads: context.md
defaultProgress: true
---
Your system prompt goes here (the markdown body).
```

### Agent Discovery

| Scope | Path | Priority |
|-------|------|----------|
| Builtin | `~/.pi/agent/extensions/subagent/agents/` | Lowest |
| User | `~/.pi/agent/agents/{name}.md` | Medium |
| Project | `.pi/agents/{name}.md` (searches up tree) | Highest |

**Builtin agents:** scout, planner, worker, reviewer, context-builder, researcher, delegate.

### Extension Sandboxing

```yaml
extensions:                            # empty = --no-extensions
extensions: /path/ext-a.ts, /path/ext-b.ts  # allowlist
# absent = all extensions load
```

### MCP Integration (requires pi-mcp-adapter)

```yaml
tools: read, bash, mcp:chrome-devtools           # all tools from server
tools: read, bash, mcp:github/search_repositories # specific tool
```

---

## Taskplane (4,371 downloads/mo)

**GitHub:** github.com/HenryLach/taskplane
**Install:** `pi install npm:taskplane`

Multi-agent orchestration using git worktrees for filesystem isolation, dependency-aware
wave scheduling, web dashboard, and reviewer-driven quality gates.

### Architecture

```
Task Packets (PROMPT.md + STATUS.md)
         │
    ┌────┴─────┐
    │ Scheduler │  ← dependency graph → wave scheduling
    └────┬─────┘
         │
    ┌────┴────────┐
    │ Worker Agents│  ← tmux sessions, model auto-detect
    └────┬────────┘
         │
    ┌────┴──────────┐
    │ Reviewer Agents│  ← cross-model review at step boundaries
    └────┬──────────┘
         │
    ┌────┴───────────┐
    │ Merge & Integrate│  ← automated merge to orch branch
    └────────────────┘
```

### Key Features

- **Git worktree isolation** — each worker runs in its own worktree
- **Persistent context** — auto-detects model context window (1M for Opus, 200K for Bedrock)
- **Checkpoint discipline** — step boundary commits; work is never lost on crash
- **Cross-model review** — reviewer uses different model than worker
- **Web dashboard** — live SSE streaming at `taskplane dashboard`
- **Supervisor agent** — monitors batch, handles failures, can resume/pause/abort

### Quickstart

```bash
taskplane init --preset full
taskplane dashboard       # in separate terminal
# In pi: /orch run --batch my-batch
```

---

## pi-mcp-adapter (4,283 downloads/mo)

**GitHub:** github.com/nicobailon/pi-mcp-adapter
**Install:** `pi install npm:pi-mcp-adapter`

MCP (Model Context Protocol) bridge for pi. One proxy tool (~200 tokens) instead of registering
hundreds of individual MCP tools. On-demand server discovery.

### Core Concept

Instead of burning 10k+ tokens per MCP server in the system prompt:

```
mcp({ search: "screenshot" })          # discover tools
mcp({ tool: "take_screenshot", args: '{"format": "png"}' })  # call tool
```

Two calls instead of 26 tools cluttering context.

### Config (`~/.pi/agent/mcp.json`)

```json
{
  "settings": { "toolPrefix": "server", "idleTimeout": 10 },
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"],
      "lifecycle": "lazy"
    }
  }
}
```

### Lifecycle Modes

| Mode | Connect | Reconnect | Idle Timeout |
|------|---------|-----------|-------------|
| `lazy` (default) | On first call | No | Yes |
| `eager` | At startup | No | Optional |
| `keep-alive` | At startup | Yes (health checks) | No |

### Direct Tools Mode

For frequently-used servers, register tools directly instead of via proxy:

```json
{
  "directTools": true,           // all tools from server
  "directTools": ["search_*"],   // glob pattern matching
  "directTools": ["tool1", "tool2"]  // specific tools
}
```

---

## @plannotator/pi-extension (4,594 downloads/mo)

**GitHub:** github.com/backnotprop/plannotator
**Install:** `pi install npm:@plannotator/pi-extension`

Interactive visual plan review with inline annotations. Also supports code review,
file annotation, and team sharing.

### Features

| Feature | Trigger | Description |
|---------|---------|-------------|
| Visual Plan Review | Built-in hook | Approve/deny with annotations |
| Plan Diff | Automatic | See revisions between plan versions |
| Code Review | `/plannotator-review` | Git diffs or remote PRs |
| Annotate File | `/plannotator-annotate` | Annotate any markdown file |
| Annotate Last Message | `/plannotator-last` | Annotate agent's last response |

### Sharing

- **Small plans** — encoded in URL hash (no server)
- **Large plans** — AES-256-GCM encrypted, zero-knowledge storage, auto-delete after 7 days
- Self-hostable

---

## oh-pi (4,114 downloads/mo)

**npm:** oh-pi
**Install:** `pi install npm:oh-pi`

One-install meta package (like oh-my-zsh for pi). Bundles curated extensions, themes, and skills.
Acts as an opinionated starter pack — reduces setup from 10+ individual packages to a single install.

---

## pi-web-access (3,355 downloads/mo)

**GitHub:** github.com/nicobailon/pi-web-access
**Install:** `pi install npm:pi-web-access`

Web search, content extraction, video understanding, and GitHub cloning. Zero config with a
Chromium browser.

### Tools

| Tool | Purpose |
|------|---------|
| `web_search` | Search via Perplexity/Gemini with fallback chain |
| `fetch_content` | Scrape URLs, PDFs, GitHub repos, YouTube |
| `get_search_content` | Deep-dive into a search citation |

### Fallback Chains

```
web_search: Perplexity → Gemini API → Gemini Web
fetch_content: Direct → Jina Reader → Gemini extraction
YouTube: Gemini Web → Gemini API → Perplexity
```

### Key Features

- **Zero config** — reads browser session cookies from Chrome/Arc/Helium
- **Video understanding** — transcripts, visual descriptions, frame extraction (requires ffmpeg)
- **GitHub cloning** — clones repos locally instead of scraping HTML
- **Smart fallbacks** — "something always works"

### Config (`~/.pi/web-search.json`)

```json
{
  "perplexityApiKey": "pplx-...",
  "geminiApiKey": "AIza..."
}
```

---

## pi-teams (3,637 downloads/mo)

**GitHub:** github.com/burggraf/pi-teams
**Install:** `pi install npm:pi-teams`

Multi-agent teams in terminal panes (tmux, Zellij, iTerm2, WezTerm, Windows Terminal).
Shared task board, inter-agent messaging, autonomous work cycles.

### Architecture

- **Team Lead** (you) — manages the team from primary pane
- **Teammates** — spawned in split panes, each with its own pi instance
- **Task Board** — persistent shared task list
- **Messaging** — direct agent-to-agent and broadcast

### Quickstart

```
"Create a team named 'my-team' using 'gpt-4o'"
"Spawn 'security-bot' to scan for vulnerabilities"
"Create a task for security-bot: 'Audit auth endpoints'"
```

### Advanced Features

- **Predefined teams** — `teams.yaml` templates
- **Plan approval mode** — require approval before code changes
- **Quality gate hooks** — automated scripts on task completion
- **Thinking level control** — per-teammate off/minimal/low/medium/high

---

## @aliou/pi-guardrails (2,371 downloads/mo)

**GitHub:** github.com/aliou/pi-guardrails
**Install:** `pi install npm:@aliou/pi-guardrails`

Defense-in-depth security hooks: file protection policies, dangerous command detection,
and optional command explanation via LLM.

### Features

| Feature | Description |
|---------|-------------|
| Policies | Named file-protection rules with per-rule protection levels |
| Permission Gate | Detects dangerous bash commands, asks for confirmation |
| Command Explainer | Optional small LLM to explain dangerous commands inline |

### Config Priority

`memory (session) > local (.pi/extensions/guardrails.json) > global (~/.pi/agent/extensions/guardrails.json) > defaults`

### Config Schema

```json
{
  "enabled": true,
  "features": { "policies": true, "permissionGate": true },
  "policies": {
    "rules": [{
      "id": "secret-files",
      "patterns": [{ "pattern": ".env" }, { "pattern": ".env.local" }],
      "allowedPatterns": [{ "pattern": ".env.example" }],
      "protection": "noAccess",
      "onlyIfExists": true
    }]
  },
  "permissionGate": {
    "patterns": [
      { "pattern": "rm -rf", "description": "recursive force delete" },
      { "pattern": "sudo", "description": "superuser command" }
    ],
    "requireConfirmation": true,
    "explainCommands": false
  }
}
```

### Protection Levels

| Level | `read` | `write` | `edit` | `bash cat` |
|-------|--------|---------|--------|-----------|
| `noAccess` | ❌ | ❌ | ❌ | ❌ |
| `readOnly` | ✅ | ❌ | ❌ | ✅ |
| `confirm` | ✅ | ⚠️ ask | ⚠️ ask | ✅ |

---

## Recommended Combinations

### Full-Stack Team Setup

```bash
pi install npm:pi-subagents          # multi-agent delegation
pi install npm:pi-mcp-adapter        # MCP protocol bridge
pi install npm:pi-web-access         # web search + scraping
pi install npm:@aliou/pi-guardrails  # security hooks
pi install npm:@plannotator/pi-extension  # plan review
```

### Enterprise Orchestration

```bash
pi install npm:taskplane              # wave-based orchestration
pi install npm:pi-teams               # terminal pane teams
pi install npm:@aliou/pi-guardrails   # protection policies
```

### Solo Developer

```bash
pi install npm:oh-pi                  # curated starter pack
pi install npm:pi-web-access          # web search
pi install npm:@plannotator/pi-extension  # plan review
```
