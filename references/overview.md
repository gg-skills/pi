# Pi Coding Agent — Overview

**Source:** https://pi.dev
**GitHub:** https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent
**npm:** https://www.npmjs.com/package/@mariozechner/pi-coding-agent
**Discord:** https://discord.com/invite/3cU7Bz4UPx
**Author:** Mario Zechner ([@mariozechner](https://mariozechner.at/))
**License:** MIT
**Stars:** 27,400+ (as of 2026-03-24)

---

## What is Pi?

Pi is a **minimal terminal-based coding agent** designed for maximum extensibility. Its philosophy is
"adapt pi to your workflows, not the other way around." Unlike other coding agents (Claude Code,
Codex, etc.), Pi deliberately omits opinionated features like sub-agents, plan mode, permission
popups, and MCP — instead exposing primitives that let you build those features yourself or install
community packages.

## Core Features

| Feature | Details |
|---------|---------|
| **Install** | `npm install -g @mariozechner/pi-coding-agent` |
| **Providers** | 15+ providers: Anthropic, OpenAI, Google, Azure, Bedrock, Mistral, Groq, Cerebras, xAI, Hugging Face, Kimi, MiniMax, OpenRouter, Ollama, and more |
| **Models** | Hundreds of models; switch mid-session with `/model` or `Ctrl+P` |
| **Sessions** | Tree-structured; navigate history with `/tree`; export with `/export` or share via `/share` |
| **Context** | AGENTS.md, SYSTEM.md, compaction, skills (on-demand), prompt templates |
| **Modes** | Interactive TUI, Print/JSON, RPC (stdin/stdout JSONL), SDK |
| **Extensions** | TypeScript modules; full API access to tools, commands, keyboard shortcuts, events, TUI |
| **Packages** | Bundle extensions/skills/prompts/themes; install from npm or git |

## What Pi Deliberately Leaves Out

- **No MCP** — use skills with READMEs, or build a MCP extension
- **No sub-agents** — spawn via tmux or build your own
- **No permission popups** — run in container, or build your own flow
- **No plan mode** — write to files or install a package
- **No built-in todos** — use TODO.md or build your own
- **No background bash** — use tmux for full observability

See the [philosophy blog post](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/) for full rationale.

## Four Operating Modes

1. **Interactive** — Full TUI experience
2. **Print/JSON** — `pi -p "query"` for scripts; `--mode json` for event streams
3. **RPC** — JSON over stdin/stdout for non-Node integrations (`pi --mode rpc`)
4. **SDK** — Embed pi in apps (see [clawdbot](https://github.com/clawdbot/clawdbot) example)
