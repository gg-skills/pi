# Pi Coding Agent — Installation & Setup

## Requirements

- Node.js (recommend v20+; some packages like pi-pompom require v20)
- npm

## Installation

```bash
npm install -g @mariozechner/pi-coding-agent
```

This installs the `pi` binary globally.

> **Node version managers:** If you use `nvm`, `mise`, `fnm`, etc., set `npmCommand` in `settings.json`
> to pin to a stable npm context, e.g. `["mise", "exec", "node@20", "--", "npm"]`.

## First Run

```bash
pi
```

Pi starts in interactive mode, showing:
- Keyboard shortcuts header
- Loaded AGENTS.md files
- Loaded skills
- Footer: cwd, session name, token usage, cost, context %, current model

## Authentication

### API Keys (Recommended)

Set environment variables:

```bash
export ANTHROPIC_API_KEY="..."
export OPENAI_API_KEY="..."
export GOOGLE_API_KEY="..."
```

Pi reads API keys from environment variables by default. Override per-run with `--api-key <key>`.

### OAuth / Subscription Login

Pi supports OAuth login for providers that offer subscription-based access. This lets you use your existing web subscription instead of a separate API key.

**Supported subscriptions:**
- **Anthropic Claude Pro / Max** (including Max 5x and Max 20x tiers)
- OpenAI ChatGPT Plus / Pro
- GitHub Copilot

Run `/login` inside the TUI, select the provider, and authenticate. Your subscription quota applies to Pi sessions logged in this way.

**Important:** OAuth login does **not** mean unlimited usage. Pi still consumes tokens against your subscription quota exactly like the Claude web app or Claude Code. If you exhaust your quota, you must wait for the rate-limit window to reset or switch to an API key.

**Subscription vs API key:**
| Method | Best for | Billing | Limits |
|--------|----------|---------|--------|
| `/login` (OAuth) | Claude Pro/Max subscribers | Included in your existing plan | Subject to your plan's usage caps (Pro, Max 5x, Max 20x) |
| `ANTHROPIC_API_KEY` | API-only users or teams | Pay-per-use at console.anthropic.com | Hard credit limit based on API account balance |

**Claude Max tiers (as reference):**
- **Max 5x** (~$100/mo): 5x Pro usage limits
- **Max 20x** (~$200/mo): 20x Pro usage limits

If you hit subscription limits in Pi, you can fall back to an API key by setting `ANTHROPIC_API_KEY` and switching provider or model.

## Configuration

### Config Directory

All pi config lives in `~/.pi/agent/` by default. Override with `PI_CODING_AGENT_DIR`.

### Settings File

`~/.pi/agent/settings.json` — global settings for all projects.
`.pi/settings.json` — per-project override.

Key settings:

```json
{
  "theme": "default",
  "thinkingLevel": "auto",
  "steeringMode": "one-at-a-time",
  "followUpMode": "one-at-a-time",
  "transport": "auto",
  "npmCommand": ["npm"]
}
```

### Global AGENTS.md

Create `~/.pi/agent/AGENTS.md` with global instructions. Pi also loads project-level `AGENTS.md`
from parent dirs up to cwd.

### Editor Features

| Feature | How |
|---------|-----|
| File reference | Type `@` to fuzzy-search project files |
| Path completion | Tab to complete paths |
| Multi-line | Shift+Enter (or Ctrl+Enter on Windows Terminal) |
| Images | Ctrl+V to paste, or drag onto terminal |
| Bash commands | `!command` runs and sends output, `!!command` runs without sending |

### Message Queue

Submit messages while the agent is working:
- **Enter** queues a *steering* message
- **Alt+Enter** queues a *follow-up* message
- **Escape** aborts and restores queued messages to editor
- **Alt+Up** retrieves queued messages back to editor

### System Prompt Customization

| File | Behavior |
|------|----------|
| `~/.pi/agent/SYSTEM.md` | Replaces entire default system prompt globally |
| `.pi/SYSTEM.md` | Per-project override |
| `APPEND_SYSTEM.md` | Appends without replacing |

## CLI Reference

```bash
pi [options] [@files...] [messages...]
```

### Common Flags

| Flag | Description |
|------|-------------|
| `pi` | Start interactive TUI |
| `pi "message"` | Interactive with initial prompt |
| `pi -p "message"` | Print response and exit (non-interactive) |
| `pi -c` | Continue most recent session |
| `pi -r` | Browse and resume past sessions |
| `--mode json` | Stream all events as JSON lines |
| `--mode rpc` | RPC mode (stdin/stdout JSONL) |
| `--provider anthropic` | Specify provider |
| `--model claude-opus-4-5` | Specify model |
| `--thinking high` | Set thinking level |
| `--api-key <key>` | API key (overrides env vars) |
| `--models <patterns>` | Comma-separated model patterns for Ctrl+P cycling |
| `--no-session` | Ephemeral mode (don't save) |
| `--session <path\|id>` | Use specific session file or partial UUID |
| `--fork <path\|id>` | Fork session into new session |
| `--tools read,bash` | Limit built-in tools |
| `--no-tools` | Disable all built-in tools |
| `--no-builtin-tools` | Disable built-in tools, keep extension tools |
| `--no-extensions` | Disable extension discovery |
| `--no-skills` | Disable skill discovery |
| `--no-prompt-templates` | Disable prompt template discovery |
| `--no-themes` | Disable theme discovery |
| `--no-context-files` | Disable AGENTS.md discovery |
| `--system-prompt <text>` | Replace default system prompt |
| `--append-system-prompt <text>` | Append to system prompt |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

### Built-in Tools

`read`, `bash`, `edit`, `write`, `grep`, `find`, `ls`

Bash shortcuts in editor:
- `!command` — run and send output to LLM
- `!!command` — run without sending to LLM

### File Arguments

Prefix with `@` to include file content in message:

```bash
pi @prompt.md "Answer this"
pi -p @screenshot.png "What's in this image?"
pi @code.ts @test.ts "Review these files"
```

### Pipe stdin

```bash
cat README.md | pi -p "Summarize this text"
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PI_CODING_AGENT_DIR` | Override config dir (default: `~/.pi/agent`) |
| `PI_CODING_AGENT_SESSION_DIR` | Override session storage directory |
| `PI_PACKAGE_DIR` | Override package dir |
| `PI_SKIP_VERSION_CHECK` | Skip startup version check |
| `PI_TELEMETRY` | Override install telemetry (`0`/`1`) |
| `PI_OFFLINE` | Disable all startup network ops |
| `PI_CACHE_RETENTION` | Set to `long` for extended prompt cache (Anthropic: 1h, OpenAI: 24h) |
| `VISUAL`, `EDITOR` | External editor for Ctrl+G |

## Model Selection

### Switching Models Mid-Session

- `/model` — opens model picker
- `Ctrl+L` — open model selector
- `Ctrl+P` / `Shift+Ctrl+P` — cycle favorite models

### CLI Model Selection

```bash
pi --provider openai --model gpt-4o "help me"
pi --model openai/gpt-4o "help me"          # provider prefix
pi --model sonnet:high "hard problem"        # with thinking level
pi --models "claude-*,gpt-4o"              # restrict cycling
```

### Custom Models (Ollama, vLLM, LM Studio)

Create `~/.pi/agent/models.json`:

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "compat": {
        "supportsDeveloperRole": false,
        "supportsReasoningEffort": false
      },
      "models": [
        { "id": "llama3.1:8b" },
        { "id": "qwen2.5-coder:7b" }
      ]
    }
  }
}
```

Hot-reloads on opening `/model`. No restart required. See `models.md` for the full schema.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+C` | Clear editor |
| `Ctrl+C` twice | Quit |
| `Escape` | Cancel/abort |
| `Escape` twice | Open `/tree` |
| `Ctrl+L` | Open model selector |
| `Ctrl+P` / `Shift+Ctrl+P` | Cycle models |
| `Shift+Tab` | Cycle thinking level |
| `Ctrl+O` | Collapse/expand tool output |
| `Ctrl+T` | Collapse/expand thinking blocks |
| `Ctrl+K` | Delete line |
| `Ctrl+G` | Open external editor |
| `Enter` | Send steering message (interrupts agent mid-work) |
| `Alt+Enter` | Send follow-up (waits for agent to finish) |

Customize via `~/.pi/agent/keybindings.json`. See `/hotkeys` for full list.

## TUI Commands

| Command | Description |
|---------|-------------|
| `/login`, `/logout` | OAuth authentication |
| `/model` | Switch models |
| `/settings` | Open settings UI |
| `/resume` | Pick from previous sessions |
| `/new` | Start new session |
| `/tree` | Navigate session history tree |
| `/fork` | Fork current session |
| `/compact [prompt]` | Manually compact context |
| `/export [file]` | Export session to HTML |
| `/share` | Upload to GitHub gist, get shareable URL |
| `/copy` | Copy last assistant message |
| `/reload` | Reload extensions, skills, prompts |
| `/hotkeys` | Show all keyboard shortcuts |
| `/changelog` | Display version history |
| `/quit`, `/exit` | Quit pi |

## Quick Setup Examples

```bash
# Interactive with Claude Opus
pi --model anthropic/claude-opus-4-5

# Non-interactive code review
pi -p "Review all .ts files for security issues"

# Read-only analysis mode
pi --tools read,grep,find,ls -p "Analyze the codebase structure"

# High-thinking complex problem
pi --thinking high "Design a distributed caching architecture"

# Use Ollama locally
pi --provider ollama --model llama3.1:8b "Help me debug this"
```
