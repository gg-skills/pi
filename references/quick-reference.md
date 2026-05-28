# Pi Coding Agent — Quick Reference

Fast lookup for the most-used CLI flags, Extension API methods, RPC commands, and
model configuration fields. For full details, see the source files cited after
each entry.

---

## CLI Flags

| Flag | Purpose |
|------|---------|
| `pi` | Start interactive TUI |
| `pi -p "prompt"` | Print response and exit (non-interactive) |
| `pi -c` | Continue most recent session |
| `pi -r` | Browse and resume past sessions |
| `pi --mode json` | Stream all events as JSON lines |
| `pi --mode rpc` | RPC mode (stdin/stdout JSONL) |
| `pi --provider <name>` | Set LLM provider |
| `pi --model <id>` | Set model (supports `provider/id` and `:thinking`) |
| `pi --thinking <level>` | Set thinking level (`off` to `xhigh`) |
| `pi --tools <list>` | Limit built-in tools (e.g. `read,bash`) |
| `pi --no-extensions` | Disable all extensions |
| `pi --no-session` | Ephemeral mode (do not save) |
| `pi -e <path>` | Load extension from file, npm, or git |
| `pi @file.md "prompt"` | Include file content in prompt |

> Source: `installation-setup.md`

---

## Extension API

| Method | Purpose |
|--------|---------|
| `pi.registerTool(config)` | Add a tool the model can call |
| `pi.registerCommand(name, handler)` | Add a `/command` handler |
| `pi.registerFlag(name, config)` | Add a CLI flag |
| `pi.registerProvider(name, config)` | Register or override an LLM provider |
| `pi.on(event, handler)` | Listen to lifecycle events |
| `pi.setActiveTools(tools)` | Restrict available tools at runtime |
| `pi.appendEntry(key, data)` | Persist state in the session |
| `ctx.ui.setStatus(key, text)` | Update footer status bar |
| `ctx.ui.setWidget(key, lines)` | Add widget above editor |
| `ctx.ui.notify(msg, type)` | Show notification (`info`/`warning`/`error`) |
| `ctx.modelRegistry.find(provider, model)` | Find model for auxiliary calls |

Key events: `tool_call`, `session_before_compact`, `turn:start`, `turn:end`.

> Source: `extensions-deep-dive.md`

---

## RPC Commands

| Command | Purpose |
|---------|---------|
| `prompt` | Send user message; events stream asynchronously |
| `steer` | Queue steering message during agent execution |
| `follow_up` | Queue message to process after agent finishes |
| `abort` | Abort current agent operation |
| `get_state` | Get current session state |
| `get_messages` | Get all conversation messages |
| `set_model` | Change provider and model |
| `set_thinking_level` | Change thinking level |
| `compact` | Manually compact conversation context |
| `bash` | Execute shell command, add output to context |
| `get_session_stats` | Get token usage, cost, context window % |
| `export_html` | Export session to HTML |
| `get_commands` | List extension commands, prompts, skills |

Framing: strict LF-delimited JSONL. Do not use `readline` (splits on Unicode
separators valid inside JSON strings).

> Source: `rpc.md`

---

## Model Config (`models.json`)

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
      "models": [{ "id": "llama3.1:8b" }]
    }
  }
}
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `id` | Yes | — | Model identifier passed to API |
| `name` | No | `id` | Human-readable label |
| `api` | No | provider `api` | Override API for this model |
| `reasoning` | No | `false` | Supports extended thinking |
| `input` | No | `["text"]` | `["text"]` or `["text", "image"]` |
| `contextWindow` | No | `128000` | Context window in tokens |
| `maxTokens` | No | `16384` | Max output tokens |
| `cost` | No | all zeros | Per-million-token pricing |
| `compat` | No | provider `compat` | OpenAI compatibility overrides |

`apiKey` and `headers` support shell commands (`"!command"`), environment
variables, or literal values.

> Source: `models.md`
