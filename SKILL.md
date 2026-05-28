---
name: pi
description: when configuring, extending, troubleshooting pi coding agent — installation, CLI, extensions, providers, model config, package management, orchestration. Not for non-pi agents.
---

# GG → Pi → Coding Agent

> **Snapshot age:** collected `2026-03-24` (~42 days old as of 2026-05-05).
> Verify release-sensitive answers with `references/refresh-documentation.md` before
> responding with high confidence.

## Overview

Pi is a minimal terminal-based coding agent designed for maximum extensibility.
Unlike Claude Code or Codex, pi deliberately omits opinionated features (sub-agents,
plan mode, MCP, permission popups) and exposes primitives for building them yourself
or installing community packages.

Key facts:

- Install: `npm install -g @mariozechner/pi-coding-agent` (Node.js v20+)
- Config directory: `~/.pi/agent/` (override via `PI_CODING_AGENT_DIR`)
- Project-level config in `.pi/`
- 25+ built-in providers; custom providers via `models.json` or extension API
- Four modes: Interactive TUI, Print/JSON, RPC (JSONL), SDK
- 7 built-in tools: `read`, `bash`, `edit`, `write`, `grep`, `find`, `ls`
- Sessions stored as JSONL trees with branching (`/tree`, `/fork`, `/clone`)

For a direct command lookup, see [Quick Commands](#quick-commands) below.

## Guidance Alignment

- Snapshot verified: `2026-03-24`. Verify post-`2026-03-24` behavior with
  `references/refresh-documentation.md`.
- High-churn content (model lists, package download counts, version numbers): always
  verify before stating specifics.
- For live docs, verify against official pi.dev documentation or use a web research tool.

## When to Use This Skill

**TRIGGER when:**

- User asks about `pi` CLI commands, flags, or configuration
- Working with pi extensions, skills, prompts, themes, or packages
- Customizing models, providers, or model proxies (Ollama, vLLM, OpenRouter)
- Building or debugging a pi extension (TypeScript, ExtensionAPI)
- Integrating pi via RPC or SDK in another application
- Setting up multi-agent orchestration with pi-subagents, taskplane, or pi-teams

**SKIP when:**

- The task is about a different coding agent (Claude Code, Codex, Cursor, etc.)
- General Node.js or TypeScript questions unrelated to pi
- npm package management questions unrelated to pi packages

## Common Misconceptions

| # | Misconception | Correction | Key concept |
|---|---------------|------------|-------------|
| 1 | Pi has built-in MCP support | Pi deliberately omits MCP; use `pi-mcp-adapter` or build a custom extension | Minimal core philosophy |
| 2 | Pi has native sub-agent delegation | No built-in subagents; use `pi-subagents` package or spawn tmux sessions | Extensibility over features |
| 3 | `--api-key` is not a valid CLI flag | It IS valid: `pi --api-key <key>` overrides env vars for that run | Env-based auth |
| 4 | `readline` can parse RPC JSONL output | Do NOT use Node `readline`; it splits on Unicode separators valid inside JSON | LF-only JSONL framing |
| 5 | Extensions require compilation | Extensions are loaded as TypeScript at runtime; no build step needed | Runtime TS loading |
| 6 | Claude Max subscription requires an API key to work in Pi | Pi supports `/login` OAuth for Claude Pro/Max directly; no separate API key needed | Subscription OAuth auth |
| 7 | Sessions auto-save | Explicitly save with `/save` or Ctrl+S | Manual persistence |

## Quick Commands

| Task | Command |
|------|---------|
| Continue last session | `pi -c` |
| Non-interactive scripting | `pi -p "prompt"` |
| Stream events as JSON | `pi --mode json -p "prompt"` |
| Read-only analysis mode | `pi --tools read,grep,find,ls -p "prompt"` |
| Disable extensions (debug) | `pi --no-extensions` |
| Extend prompt cache | `PI_CACHE_RETENTION=long pi` |
| Switch models mid-session | `/model` in TUI or `Ctrl+L` |
| Reload extensions/skills | `/reload` in TUI |
| Disable startup network | `PI_OFFLINE=1 pi` or `--offline` |
| Use purpose-specific agent | `source ~/.pi/agents/run.zsh` then `pi-general "task"` (community convention, not built-in) | Multi-agent configs in `~/.pi/agents/` |

For the full CLI surface, see `references/installation-setup.md`. For RPC commands,
see `references/rpc.md`.

## Command Decision Guide

| Scenario | Recommended approach |
|----------|---------------------|
| One-off script execution | `pi -p "prompt"` |
| CI pipeline or automation | `pi --mode json` or `pi --mode rpc` |
| Embed in another Node.js app | SDK (`@mariozechner/pi-coding-agent`) |
| Embed in Python/other runtime | RPC mode (`pi --mode rpc`) |
| Restrict to safe tools only | `pi --tools read,grep,find,ls` |
| Run with custom local model | `pi --provider ollama --model llama3.1:8b` |
| Debug extension issues | `pi --no-extensions` to isolate |

**Rule of thumb:** Interactive for exploration, Print/JSON for scripts, RPC for
foreign-language integrations, SDK for Node.js embedding.

## Non-Negotiable Policy

1. **Canonical source:** [pi.dev](https://pi.dev) and
   [github.com/badlogic/pi-mono](https://github.com/badlogic/pi-mono) are the only
   authoritative sources.
2. **Read before reconstructing:** Never reconstruct shell commands, CLI flags, or
   setup steps from memory. Always read the relevant reference file first.
3. **Embedded source of truth:** `references/` is the authoritative local corpus.
   Load only the subset the task requires.
4. **Install command:** `npm install -g @mariozechner/pi-coding-agent`. Always verify
   Node.js v20+.
5. **Config directory:** `~/.pi/agent/` (override via `PI_CODING_AGENT_DIR`).
   Project-level config in `.pi/`.
6. **RPC framing:** Strict LF-delimited JSONL. Do not use Node `readline`.
7. **Staleness rule:** For any answer about models, package counts, or the current
   version, treat bundled data as likely stale and verify with the research skill
   before stating specifics.

## Pi Quality Checklist

Use this checklist before and during any pi configuration or troubleshooting.

| # | Checklist Item | Why It Matters | Gate |
|---|---------------|---------------|------|
| 1 | **Canonical source verified** — pi.dev or pi-mono consulted | Prevents stale info | Pre-command |
| 2 | **Node version checked** — v20+ required | Install success | Pre-command |
| 3 | **Config directory known** — ~/.pi/agent/ or custom | Path correctness | Pre-command |
| 4 | **Auth method chosen** — Env var, --api-key, or OAuth | Prevents auth failures | Pre-command |
| 5 | **Reference files loaded** — Only needed subset from references/ | Efficiency | Draft |
| 6 | **RPC framing correct** — LF-delimited JSONL, not readline | Data parsing | Draft |
| 7 | **Extension runtime loaded** — TypeScript at runtime, no build | Correct workflow | Draft |
| 8 | **Session saved** — /save or Ctrl+S before exit | Persistence | Closeout |

### Quality Tiers

| Tier | Criteria | Use When |
|------|----------|----------|
| **Minimal** | Items 1-3, 8 | Quick query |
| **Standard** | Items 1-5, 8 | Extension authoring |
| **Full** | All 8 items | RPC/SDK integration |

### Pre-Command Verification

```
□ pi.dev or pi-mono consulted for authoritative answer
□ Node.js v20+ verified
□ Config directory confirmed
□ Auth method selected (env/flag/OAuth)
□ Reference files loaded (subset only)
```

## Pi Consistency Validator

Before finalizing, verify:

### Consistency Check Matrix

| Check | What to Verify | How to Fix |
|-------|---------------|------------|
| **Source vs Staleness** | Post-snapshot info verified against live docs | Re-verify |
| **Auth vs Flag** | Correct auth method for the task | Switch auth |
| **RPC vs Framing** | JSONL framing, not readline | Use correct parser |
| **Extension vs Build** | Runtime TS loading, no compilation | Remove build |

### Red Flags (Never Present)

- [ ] Using pre-snapshot info without live verification
- [ ] readline for RPC JSONL parsing
- [ ] Build step for extensions (runtime TS loading)
- [ ] Node.js < v20 for pi installation
- [ ] Session not saved before exit

## Workflow

### 1. Classify the request

| Task type | Load these files | Skip |
|-----------|-----------------|------|
| Install / setup / CLI | `installation-setup.md` | `rpc.md`, `custom-provider.md` |
| Extension authoring / API | `extensions-deep-dive.md`, `customization.md` | `models.md` |
| Custom models / providers | `models.md`, `custom-providers-setup.md`, `custom-provider.md` | `packages-inventory.md` |
| RPC / SDK / non-interactive | `rpc.md`, `customization.md` | `extensions-deep-dive.md` |
| Package discovery / install | `packages-inventory.md` | `agent-library.md` |
| Community package usage | `community-packages.md` | `extensions-deep-dive.md` |
| Multi-agent / orchestration | `agent-library.md`, `community-packages.md` | `models.md` |
| Skills authoring | `customization.md` | `rpc.md` |
| MCP integration | `community-packages.md` | `agent-library.md` |
| Security / permissions | `community-packages.md`, `extensions-deep-dive.md` | `packages-inventory.md` |
| Sessions / branching / compaction | `sessions-branching.md` | `agent-library.md` |
| TUI / custom UI / overlays | `tui-components.md`, `extensions-deep-dive.md` | `models.md` |
| Settings / configuration | `settings-reference.md`, `installation-setup.md` | `rpc.md` |
| Diagnostic / inspection-first | Run `pi -v` and `pi -h` before loading any files | — |

For diagnostic requests, run the inspection commands first before loading any
reference files. Load only the subset the task needs.

### 2. Start with the fastest local path

1. Use the workflow routing table above to identify the relevant `references/*.md`
   file.
2. Open and read that file.
3. If the embedded docs do not cover it, fetch live docs using the URLs in
   `references/research-provenance.md`.

### 3. Refresh when drift is detected or requested

- Check https://github.com/badlogic/pi-mono/releases or
  `npm view @mariozechner/pi-coding-agent version`.
- If a newer relevant release exists, or the user explicitly asks for latest
  behavior:
  - Use a web research tool to scrape current docs,
  - Update the relevant `references/*.md` files,
  - Add an entry to `references/research-provenance.md`.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `pi` command not found after install | npm global bin not on PATH | Add `$(npm prefix -g)/bin` to PATH or use `npx pi` |
| Extensions not loading | Wrong directory or missing `pi` key in package.json | Place in `~/.pi/agent/extensions/` or `.pi/extensions/`; verify `package.json` has `"keywords": ["pi-package"]` |
| Model switch fails with "not found" | Custom `models.json` syntax error | Validate JSON; check `baseUrl` and `api` fields match provider type |
| `Warning: No models match pattern` at startup | `enabledModels` entry doesn't match any known model | Query the provider's `/models` API and use the exact ID; verify provider name matches `models.json` |
| Model works in global but not project | Project `.pi/settings.json` overrides global | Add model to project's `enabledModels` or remove project-level `settings.json` |
| RPC client parses JSON incorrectly | Using `readline` or splitting on `\r\n` without stripping `\r` | Split on `\n` only; strip trailing `\r` per line |
| High API costs per session | Short prompt cache retention | Set `PI_CACHE_RETENTION=long` before running pi |
| OAuth login loops infinitely | `refreshToken` not returning updated `expires` | Ensure `refreshToken` returns `{ refresh, access, expires: Date.now() + expiresIn * 1000 }` |
| Update check fails in air-gapped env | Pi contacts `pi.dev` at startup | Set `PI_SKIP_VERSION_CHECK=1` or `PI_OFFLINE=1` |
| Install telemetry unwanted | Pi sends anonymous version ping after install | Set `PI_TELEMETRY=0` or `enableInstallTelemetry: false` in settings |

## Common Pitfalls

1. **Forgetting `--api-key` is a valid CLI flag.** Pi DOES accept `--api-key <key>`
   as a CLI flag (overrides env vars for that run). See `installation-setup.md`.
   However, env vars (`ANTHROPIC_API_KEY`, etc.) are the recommended approach.
2. **Writing extensions without checking the event lifecycle.** Extensions must
   handle `tool_call`, `turn:start`, `turn:end`, and `session_before_compact`
   correctly. See `extensions-deep-dive.md` for patterns.
3. **Forgetting `compat` flags for local models.** Ollama/vLLM often fail on
   `developer` role or `reasoning_effort`. Set `supportsDeveloperRole: false` and
   `supportsReasoningEffort: false` in `models.json`. See `models.md`.
4. **Assuming `pi-subagents` is built-in.** Subagent delegation requires
   `pi install npm:pi-subagents`. See `agent-library.md`.
5. **Using `readline` for RPC integration.** Node `readline` splits on Unicode line
   separators that are valid inside JSON strings. Implement a manual `\n` splitter.
   See `rpc.md`.
6. **Misunderstanding session persistence.** Sessions auto-save as JSONL files.
   Use `--no-session` for ephemeral mode. Use `pi -c` to continue last session.
4. **Loading all extensions at once for debugging.** Use `pi --no-extensions` to
   isolate whether a bug is in pi core or an extension.
5. **Using `readline` for RPC integration.** Node `readline` splits on Unicode line
   separators that are valid inside JSON strings. Implement a manual `\n` splitter.
   See `rpc.md`.
6. **Forgetting extension TypeScript is loaded via jiti.** No build step needed, but
   `package.json` with dependencies must be next to the extension. Run `npm install`
   in the extension directory.

## Local Corpus Layout

`references/` is flat (no subfolders). Total: 17 files.

### Meta

- `research-provenance.md` — capture date, canonical source URLs, update history
- `refresh-documentation.md` — how to refresh this skill's docs corpus

### Operational references

- `overview.md` — what pi is, philosophy, features, four operating modes
- `installation-setup.md` — install, CLI flags, env vars, keyboard shortcuts, TUI commands
- `quick-reference.md` — most-used CLI flags, Extension API methods, RPC commands, and model config fields at a glance
- `customization.md` — extensions, skills, prompts, themes, pi packages, SDK, RPC overview
- `extensions-deep-dive.md` — Extension API surface + 10 official example patterns
- `custom-provider.md` — programmatic provider extension via `registerProvider` API (OAuth, streaming, per-model overrides)
- `models.md` — `models.json` schema reference + two-file model management (project vs global `settings.json`/`enabledModels`) + API discovery workflow
- `custom-providers-setup.md` — step-by-step setup for kimi-for-coding, minimax-coding-plan, and nvidia providers (API endpoints, auth, model list, how to add new models)
- `rpc.md` — full RPC protocol documentation (commands, events, types, example clients)
- `sessions-branching.md` — JSONL tree format, `/tree`, `/fork`, `/clone`, compaction
- `tui-components.md` — Component interface, overlays, built-ins, keyboard, theming
- `settings-reference.md` — Complete settings.json reference

### Package and agent references

- `packages-inventory.md` — 832 community packages categorized by type
- `community-packages.md` — detailed docs for top 8 community packages
- `agent-library.md` — 9 ready-to-use agent configurations with package lists

## Temporary Files

If this skill needs to create temporary files, place them under
`.tmp/pi/YYYY-MM-DD-{subject}`. The root `.tmp/`
directory is already gitignored. Do not create top-level dotfile temp directories.
