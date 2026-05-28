# Pi Coding Agent — RPC Mode Protocol

**Source:** https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/docs/rpc.md

RPC mode enables headless operation of the coding agent via a JSON protocol over stdin/stdout.
Useful for embedding the agent in other applications, IDEs, or custom UIs.

> **Node.js users:** Consider using `AgentSession` directly from `@mariozechner/pi-coding-agent`
> instead of spawning a subprocess. See `src/core/agent-session.ts` for the API. For a typed
> subprocess client, see `src/modes/rpc/rpc-client.ts`.

---

## Starting RPC Mode

```bash
pi --mode rpc [options]
```

Common options:
- `--provider <name>`: Set the LLM provider
- `--model <pattern>`: Model ID (supports `provider/id` and optional `:thinking`)
- `--no-session`: Disable session persistence
- `--session-dir <path>`: Custom session storage directory

---

## Protocol Overview

- **Commands:** JSON objects sent to stdin, one per line
- **Responses:** JSON objects with `type: "response"` indicating command success/failure
- **Events:** Agent events streamed to stdout as JSON lines

All commands support an optional `id` field for request/response correlation.

### Framing

RPC mode uses strict JSONL semantics with LF (`\n`) as the only record delimiter.

- Split records on `\n` only
- Accept optional `\r\n` input by stripping a trailing `\r`
- Do **not** use generic line readers that treat Unicode separators as newlines (e.g., Node
  `readline` splits on `U+2028` and `U+2029`, which are valid inside JSON strings)

---

## Commands

### Prompting

#### prompt

Send a user prompt to the agent. Returns immediately; events stream asynchronously.

```json
{"id": "req-1", "type": "prompt", "message": "Hello, world!"}
```

With images:
```json
{"type": "prompt", "message": "What's in this image?", "images": [{"type": "image", "data": "base64-encoded-data", "mimeType": "image/png"}]}
```

**During streaming:** If the agent is already streaming, specify `streamingBehavior`:
```json
{"type": "prompt", "message": "New instruction", "streamingBehavior": "steer"}
```

- `"steer"`: Queue the message; delivered after current turn finishes tool calls, before next LLM call.
- `"followUp"`: Wait until agent finishes completely.

If the agent is streaming and no `streamingBehavior` is specified, the command returns an error.

**Extension commands** (e.g., `/mycommand`) execute immediately even during streaming.

**Input expansion:** Skill commands (`/skill:name`) and prompt templates (`/template`) are
expanded before sending.

Response:
```json
{"id": "req-1", "type": "response", "command": "prompt", "success": true}
```

#### steer

Queue a steering message while the agent is running. Delivered after the current assistant turn
finishes its tool calls, before the next LLM call. Extension commands not allowed (use `prompt`).

```json
{"type": "steer", "message": "Stop and do this instead"}
```

#### follow_up

Queue a follow-up message to be processed after the agent finishes.

```json
{"type": "follow_up", "message": "After you're done, also do this"}
```

#### abort

Abort the current agent operation.

```json
{"type": "abort"}
```

#### new_session

Start a fresh session. Can be cancelled by a `session_before_switch` extension event handler.

```json
{"type": "new_session"}
{"type": "new_session", "parentSession": "/path/to/parent-session.jsonl"}
```

Response includes `{"data": {"cancelled": false}}`.

---

### State

#### get_state

Get current session state.

```json
{"type": "get_state"}
```

Response:
```json
{
  "type": "response",
  "command": "get_state",
  "success": true,
  "data": {
    "model": {...},
    "thinkingLevel": "medium",
    "isStreaming": false,
    "isCompacting": false,
    "steeringMode": "all",
    "followUpMode": "one-at-a-time",
    "sessionFile": "/path/to/session.jsonl",
    "sessionId": "abc123",
    "sessionName": "my-feature-work",
    "autoCompactionEnabled": true,
    "messageCount": 5,
    "pendingMessageCount": 0
  }
}
```

#### get_messages

Get all messages in the conversation.

```json
{"type": "get_messages"}
```

---

### Model

#### set_model

```json
{"type": "set_model", "provider": "anthropic", "modelId": "claude-sonnet-4-20250514"}
```

#### cycle_model

Cycle to the next available model.

```json
{"type": "cycle_model"}
```

#### get_available_models

List all configured models.

```json
{"type": "get_available_models"}
```

---

### Thinking

#### set_thinking_level

```json
{"type": "set_thinking_level", "level": "high"}
```

Levels: `"off"`, `"minimal"`, `"low"`, `"medium"`, `"high"`, `"xhigh"` (xhigh: OpenAI codex-max only)

#### cycle_thinking_level

```json
{"type": "cycle_thinking_level"}
```

---

### Queue Modes

#### set_steering_mode

Control how steering messages are delivered.

```json
{"type": "set_steering_mode", "mode": "one-at-a-time"}
```

- `"all"`: Deliver all steering messages after current turn finishes its tool calls
- `"one-at-a-time"`: Deliver one steering message per completed assistant turn (default)

#### set_follow_up_mode

Control how follow-up messages are delivered.

```json
{"type": "set_follow_up_mode", "mode": "one-at-a-time"}
```

- `"all"`: Deliver all follow-up messages when agent finishes
- `"one-at-a-time"`: Deliver one follow-up message per agent completion (default)

---

### Compaction

#### compact

Manually compact conversation context.

```json
{"type": "compact"}
{"type": "compact", "customInstructions": "Focus on code changes"}
```

Response includes `{"data": {"summary": "...", "firstKeptEntryId": "...", "tokensBefore": 150000}}`.

#### set_auto_compaction

```json
{"type": "set_auto_compaction", "enabled": true}
```

---

### Retry

#### set_auto_retry

Enable/disable automatic retry on transient errors (overloaded, rate limit, 5xx).

```json
{"type": "set_auto_retry", "enabled": true}
```

#### abort_retry

```json
{"type": "abort_retry"}
```

---

### Bash

#### bash

Execute a shell command and add output to conversation context.

```json
{"type": "bash", "command": "ls -la"}
```

Response:
```json
{
  "type": "response",
  "command": "bash",
  "success": true,
  "data": {
    "output": "total 48\ndrwxr-xr-x ...",
    "exitCode": 0,
    "cancelled": false,
    "truncated": false
  }
}
```

**How bash results reach the LLM:** The `bash` command executes immediately and creates a
`BashExecutionMessage` internally. This does NOT emit an event. On the next `prompt` command, all
`BashExecutionMessage` entries are converted to a user message with format:

```
Ran `ls -la`
```
total 48
drwxr-xr-x ...
```
```

Multiple bash commands can be executed before a prompt; all outputs are included in the next prompt.

#### abort_bash

```json
{"type": "abort_bash"}
```

---

### Session

#### get_session_stats

Get token usage, cost statistics, and current context window usage.

```json
{"type": "get_session_stats"}
```

Response:
```json
{
  "data": {
    "sessionFile": "/path/to/session.jsonl",
    "sessionId": "abc123",
    "userMessages": 5,
    "assistantMessages": 5,
    "toolCalls": 12,
    "totalMessages": 22,
    "tokens": { "input": 50000, "output": 10000, "cacheRead": 40000, "cacheWrite": 5000, "total": 105000 },
    "cost": 0.45,
    "contextUsage": { "tokens": 60000, "contextWindow": 200000, "percent": 30 }
  }
}
```

`contextUsage` is omitted when no model is available. `contextUsage.tokens` and `.percent` are
`null` immediately after compaction until a fresh post-compaction response provides valid usage data.

#### export_html

```json
{"type": "export_html"}
{"type": "export_html", "outputPath": "/tmp/session.html"}
```

#### switch_session

```json
{"type": "switch_session", "sessionPath": "/path/to/session.jsonl"}
```

#### fork

Create a new fork from a previous user message.

```json
{"type": "fork", "entryId": "abc123"}
```

#### get_fork_messages

Get user messages available for forking.

```json
{"type": "get_fork_messages"}
```

#### get_last_assistant_text

```json
{"type": "get_last_assistant_text"}
```

Returns `{"text": null}` if no assistant messages exist.

#### set_session_name

```json
{"type": "set_session_name", "name": "my-feature-work"}
```

---

### Commands

#### get_commands

Get available commands (extension commands, prompt templates, skills).

```json
{"type": "get_commands"}
```

Response includes an array of commands:

```json
{
  "commands": [
    {"name": "session-name", "description": "Set or clear session name", "source": "extension", "path": "..."},
    {"name": "fix-tests", "description": "Fix failing tests", "source": "prompt", "location": "project", "path": "..."},
    {"name": "skill:brave-search", "description": "Web search via Brave API", "source": "skill", "location": "user", "path": "..."}
  ]
}
```

Each command:
- `source`: `"extension"` (via `pi.registerCommand()`), `"prompt"` (`.md` template), or `"skill"`
- `location`: `"user"` (`~/.pi/agent/`), `"project"` (`./.pi/agent/`), or `"path"` (explicit CLI)

> Built-in TUI commands (`/settings`, `/hotkeys`, etc.) are not included — they only work in
> interactive mode.

---

## Events

Events are streamed to stdout as JSON lines. Events do NOT include an `id` field.

| Event | Description |
|-------|-------------|
| `agent_start` | Agent begins processing |
| `agent_end` | Agent completes (includes all generated messages) |
| `turn_start` | New turn begins |
| `turn_end` | Turn completes (includes assistant message and tool results) |
| `message_start` | Message begins |
| `message_update` | Streaming update (text/thinking/toolcall deltas) |
| `message_end` | Message completes |
| `tool_execution_start` | Tool begins execution |
| `tool_execution_update` | Tool execution progress (streaming output) |
| `tool_execution_end` | Tool completes |
| `auto_compaction_start` | Auto-compaction begins |
| `auto_compaction_end` | Auto-compaction completes |
| `auto_retry_start` | Auto-retry begins (after transient error) |
| `auto_retry_end` | Auto-retry completes (success or final failure) |
| `extension_error` | Extension threw an error |

### message_update (Streaming)

```json
{
  "type": "message_update",
  "message": {...},
  "assistantMessageEvent": {
    "type": "text_delta",
    "contentIndex": 0,
    "delta": "Hello ",
    "partial": {...}
  }
}
```

Delta types: `start`, `text_start`, `text_delta`, `text_end`, `thinking_start`, `thinking_delta`,
`thinking_end`, `toolcall_start`, `toolcall_delta`, `toolcall_end`, `done`, `error`.

### tool_execution_update

```json
{
  "type": "tool_execution_update",
  "toolCallId": "call_abc123",
  "toolName": "bash",
  "args": {"command": "ls -la"},
  "partialResult": {
    "content": [{"type": "text", "text": "partial output so far..."}],
    "details": {"truncation": null, "fullOutputPath": null}
  }
}
```

`partialResult` contains the **accumulated** output (not just the delta) — replace display on each
update. Use `toolCallId` to correlate events.

### auto_compaction_end

`reason` field on start event: `"threshold"` (context getting large) or `"overflow"` (exceeded limit).

If `reason` was `"overflow"` and compaction succeeds, `willRetry: true` and the agent will
automatically retry the prompt.

### auto_retry_start / auto_retry_end

```json
{"type": "auto_retry_start", "attempt": 1, "maxAttempts": 3, "delayMs": 2000, "errorMessage": "..."}
{"type": "auto_retry_end", "success": true, "attempt": 2}
```

---

## Extension UI Protocol

In RPC mode, extensions that call `ctx.ui.select()`, `ctx.ui.confirm()`, etc. emit
`extension_ui_request` events on stdout and block until the client sends back an
`extension_ui_response` on stdin with the matching `id`.

**Dialog methods** (block until response): `select`, `confirm`, `input`, `editor`
**Fire-and-forget** (no response expected): `notify`, `setStatus`, `setWidget`, `setTitle`,
`set_editor_text`

If a dialog method includes a `timeout` field (milliseconds), the agent auto-resolves with a
default value when the timeout expires.

### Extension UI Requests (stdout)

```json
{"type": "extension_ui_request", "id": "uuid-1", "method": "select", "title": "Allow dangerous command?", "options": ["Allow", "Block"], "timeout": 10000}
{"type": "extension_ui_request", "id": "uuid-2", "method": "confirm", "title": "Clear session?", "message": "All messages will be lost.", "timeout": 5000}
{"type": "extension_ui_request", "id": "uuid-3", "method": "input", "title": "Enter a value", "placeholder": "type something..."}
{"type": "extension_ui_request", "id": "uuid-4", "method": "editor", "title": "Edit some text", "prefill": "Line 1\nLine 2"}
{"type": "extension_ui_request", "id": "uuid-5", "method": "notify", "message": "Command blocked", "notifyType": "warning"}
{"type": "extension_ui_request", "id": "uuid-6", "method": "setStatus", "statusKey": "my-ext", "statusText": "Turn 3 running..."}
{"type": "extension_ui_request", "id": "uuid-7", "method": "setWidget", "widgetKey": "my-ext", "widgetLines": ["--- Widget ---", "Line 1"], "widgetPlacement": "aboveEditor"}
{"type": "extension_ui_request", "id": "uuid-8", "method": "setTitle", "title": "pi - my project"}
{"type": "extension_ui_request", "id": "uuid-9", "method": "set_editor_text", "text": "prefilled text"}
```

`notifyType`: `"info"` (default), `"warning"`, or `"error"`.
`widgetPlacement`: `"aboveEditor"` (default) or `"belowEditor"`.

### Extension UI Responses (stdin)

```json
{"type": "extension_ui_response", "id": "uuid-1", "value": "Allow"}         // select, input, editor
{"type": "extension_ui_response", "id": "uuid-2", "confirmed": true}         // confirm
{"type": "extension_ui_response", "id": "uuid-3", "cancelled": true}         // any dialog
```

> `ctx.hasUI` is `true` in RPC mode because dialog and fire-and-forget methods are functional
> via this sub-protocol.

---

## Error Handling

Failed commands:
```json
{"type": "response", "command": "set_model", "success": false, "error": "Model not found: invalid/model"}
```

Parse errors:
```json
{"type": "response", "command": "parse", "success": false, "error": "Failed to parse command: ..."}
```

---

## Types

### Model

```json
{
  "id": "claude-sonnet-4-20250514",
  "name": "Claude Sonnet 4",
  "api": "anthropic-messages",
  "provider": "anthropic",
  "baseUrl": "https://api.anthropic.com",
  "reasoning": true,
  "input": ["text", "image"],
  "contextWindow": 200000,
  "maxTokens": 16384,
  "cost": { "input": 3.0, "output": 15.0, "cacheRead": 0.3, "cacheWrite": 3.75 }
}
```

### UserMessage

```json
{"role": "user", "content": "Hello!", "timestamp": 1733234567890, "attachments": []}
```

`content` can be a string or an array of `TextContent`/`ImageContent` blocks.

### AssistantMessage

```json
{
  "role": "assistant",
  "content": [
    {"type": "text", "text": "Hello! How can I help?"},
    {"type": "thinking", "thinking": "User is greeting me..."},
    {"type": "toolCall", "id": "call_123", "name": "bash", "arguments": {"command": "ls"}}
  ],
  "api": "anthropic-messages",
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "usage": {
    "input": 100, "output": 50, "cacheRead": 0, "cacheWrite": 0,
    "cost": {"input": 0.0003, "output": 0.00075, "cacheRead": 0, "cacheWrite": 0, "total": 0.00105}
  },
  "stopReason": "stop",
  "timestamp": 1733234567890
}
```

Stop reasons: `"stop"`, `"length"`, `"toolUse"`, `"error"`, `"aborted"`

### ToolResultMessage

```json
{
  "role": "toolResult",
  "toolCallId": "call_123",
  "toolName": "bash",
  "content": [{"type": "text", "text": "total 48\ndrwxr-xr-x ..."}],
  "isError": false,
  "timestamp": 1733234567890
}
```

### BashExecutionMessage

Created by the `bash` RPC command (not by LLM tool calls):

```json
{
  "role": "bashExecution",
  "command": "ls -la",
  "output": "total 48\ndrwxr-xr-x ...",
  "exitCode": 0,
  "cancelled": false,
  "truncated": false,
  "fullOutputPath": null,
  "timestamp": 1733234567890
}
```

---

## Example: Basic Client (Python)

```python
import subprocess
import json

proc = subprocess.Popen(
  ["pi", "--mode", "rpc", "--no-session"],
  stdin=subprocess.PIPE,
  stdout=subprocess.PIPE,
  text=True
)

def send(cmd):
  proc.stdin.write(json.dumps(cmd) + "\n")
  proc.stdin.flush()

def read_events():
  for line in proc.stdout:
    yield json.loads(line)

send({"type": "prompt", "message": "Hello!"})

for event in read_events():
  if event.get("type") == "message_update":
    delta = event.get("assistantMessageEvent", {})
    if delta.get("type") == "text_delta":
      print(delta["delta"], end="", flush=True)

  if event.get("type") == "agent_end":
    print()
    break
```

## Example: Interactive Client (Node.js)

```javascript
const { spawn } = require("child_process");
const { StringDecoder } = require("string_decoder");

const agent = spawn("pi", ["--mode", "rpc", "--no-session"]);

function attachJsonlReader(stream, onLine) {
  const decoder = new StringDecoder("utf8");
  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += typeof chunk === "string" ? chunk : decoder.write(chunk);
    while (true) {
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex === -1) break;
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      onLine(line);
    }
  });
}

attachJsonlReader(agent.stdout, (line) => {
  const event = JSON.parse(line);
  if (event.type === "message_update") {
    const { assistantMessageEvent } = event;
    if (assistantMessageEvent.type === "text_delta") {
      process.stdout.write(assistantMessageEvent.delta);
    }
  }
});

agent.stdin.write(JSON.stringify({ type: "prompt", message: "Hello" }) + "\n");
process.on("SIGINT", () => {
  agent.stdin.write(JSON.stringify({ type: "abort" }) + "\n");
});
```

For a complete typed client implementation, see
[`src/modes/rpc/rpc-client.ts`](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/src/modes/rpc/rpc-client.ts).
