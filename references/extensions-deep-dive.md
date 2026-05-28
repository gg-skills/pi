# Pi Coding Agent — Extension API Deep Dive

**Source:** `github.com/badlogic/pi-mono/packages/coding-agent/examples/extensions/`
**Captured:** 2026-03-24

## Start Here

For most use cases, these three examples cover the most instructive patterns:

| Use case | Example file | Lines | Why read it |
|----------|-------------|-------|-------------|
| Permission enforcement | `permission-gate.ts` + `protected-paths.ts` | 33 + 29 | Minimal `tool_call` event pattern; easiest starting point |
| Tool restriction + TUI widgets | `plan-mode/` | 339 | Shows `setActiveTools`, `setStatus`, `setWidget`, `appendEntry` together |
| Cross-model context management | `custom-compaction.ts` | 112 | Shows `session_before_compact`, `modelRegistry.find`, full compaction override |

Read the full sections below for all 10 examples plus composition patterns.

---

## Extension API Surface

Pi extensions are TypeScript modules that receive an `ExtensionAPI` instance (`pi`).
Extensions are loaded via [jiti](https://github.com/unjs/jiti) — TypeScript works without
compilation. Node.js built-ins (`node:fs`, `node:path`, etc.) are available.

| Method | Purpose |
|--------|---------|
| `pi.registerTool(config)` | Add tools the model can call |
| `pi.registerCommand(name, handler)` | Add `/command` handlers |
| `pi.registerFlag(name, config)` | Add CLI flags |
| `pi.registerShortcut(key, handler)` | Add keyboard shortcuts |
| `pi.registerProvider(name, config)` | Register/override LLM providers |
| `pi.on(event, handler)` | Listen to lifecycle events |
| `pi.setActiveTools(tools)` | Restrict available tools |
| `pi.appendEntry(key, data)` | Persist state in session |
| `ctx.ui.notify(msg, type)` | Show notifications |
| `ctx.ui.select(prompt, options)` | Interactive prompts |
| `ctx.ui.confirm(title, message)` | Yes/no dialog |
| `ctx.ui.input(prompt, placeholder?)` | Text input dialog |
| `ctx.ui.editor(options?)` | Multi-line editor dialog |
| `ctx.ui.setStatus(key, text)` | Update footer status bar |
| `ctx.ui.setWidget(key, lines)` | Add widget above editor |
| `ctx.ui.custom(factory, options)` | Full custom UI/overlay |
| `ctx.modelRegistry.find(provider, model)` | Find model for auxiliary calls |
| `ctx.getSystemPrompt()` | Get current system prompt string |
| `ctx.compact(options?)` | Trigger compaction |
| `ctx.shutdown()` | Request graceful shutdown |

### Key Events

| Event | When | Use |
|-------|------|-----|
| `input` | User input received (before skill/template expansion) | Transform, intercept, or handle |
| `before_agent_start` | After user submits prompt, before agent loop | Inject messages, modify system prompt |
| `agent_start` / `agent_end` | Per user prompt | Setup, cleanup |
| `turn_start` / `turn_end` | Per LLM turn | Inject context, log |
| `message_start` / `message_update` / `message_end` | Per message lifecycle | Stream processing, replacement |
| `tool_execution_start` / `tool_execution_update` / `tool_execution_end` | Tool execution lifecycle | Progress tracking |
| `tool_call` | Before any tool executes | **Block, modify, or log** tool calls |
| `tool_result` | After tool execution finishes | **Modify result** before display |
| `context` | Before each LLM call | Filter/prune messages non-destructively |
| `before_provider_request` | Before HTTP request sent | Inspect/replace provider payload |
| `after_provider_response` | After HTTP response received | Debug headers, rate limits |
| `user_bash` | User executes `!` or `!!` | Intercept or replace bash operations |
| `session_before_compact` | Before context compaction | Custom summarization strategy |
| `session_compact` | After compaction completes | Post-compaction cleanup |
| `session_before_tree` | Before `/tree` navigation | Cancel or customize branch summary |
| `session_tree` | After `/tree` navigation | Track branch switches |
| `session_before_switch` | Before `/new` or `/resume` | Cancel session replacement |
| `session_before_fork` | Before `/fork` or `/clone` | Cancel fork/clone |
| `session_start` / `session_shutdown` | Session lifecycle | Init, cleanup |
| `resources_discover` | After session start | Contribute skill/prompt/theme paths |
| `model_select` | Model changes | Update UI for model-specific behavior |
| `thinking_level_select` | Thinking level changes | Update UI |

### ExtensionCommandContext (commands only)

Command handlers receive `ExtensionCommandContext`, which adds session control:

| Method | Purpose |
|--------|---------|
| `ctx.waitForIdle()` | Wait for agent to finish streaming |
| `ctx.newSession(options?)` | Create new session (with optional parent) |
| `ctx.fork(entryId, options?)` | Fork from specific entry |
| `ctx.navigateTree(targetId, options?)` | Navigate to point in session tree |
| `ctx.switchSession(path, options?)` | Switch to different session file |

⚠️ **Session replacement footgun:** After `newSession`, `fork`, or `switchSession`, the
old `pi`/`ctx` references are stale. Use only the replacement-session `ctx` inside
`withSession` callbacks.

---

## 1. Subagent Extension (985 lines)

**File:** `examples/extensions/subagent/index.ts`
**Purpose:** Delegate tasks to isolated pi instances with separate context windows.

### Three Modes

```typescript
// Single agent
{ agent: "name", task: "..." }

// Parallel (up to 8 tasks, 4 concurrent)
{ tasks: [{ agent: "name", task: "..." }, ...] }

// Chain (output from one → input to next)
{ chain: [{ agent: "name", task: "... {previous} ..." }, ...] }
```

### Architecture

- Spawns `pi -p --mode json` child processes
- Each subagent gets isolated context window
- Agents discovered from `.pi/agents/` YAML files defining role, model, tools, scope
- JSON mode captures structured results
- Displays live TUI widgets with per-agent progress, token usage, and cost
- `MAX_PARALLEL_TASKS = 8`, `MAX_CONCURRENCY = 4`

### Agent Config (YAML)

```yaml
# .pi/agents/researcher.yaml
name: researcher
description: Research and analyze code
model: claude-opus-4-5
thinking: high
scope: read-only
tools: [read, grep, find, ls]
```

### Key Patterns

- Uses `withFileMutationQueue()` for safe concurrent file writes
- Agents resolve by name using `discoverAgents()` which scans `.pi/agents/` and `~/.pi/agent/agents/`
- Supports custom SYSTEM.md per agent scope

---

## 2. Plan Mode Extension (339 lines)

**File:** `examples/extensions/plan-mode/index.ts`
**Purpose:** Read-only exploration mode for safe code analysis.

### Features

- `/plan` command or `Ctrl+Alt+P` to toggle
- Plan mode restricts tools to: `read`, `bash`, `grep`, `find`, `ls`, `questionnaire`
- Bash restricted to allowlisted read-only commands (via `isSafeCommand()`)
- Extracts numbered plan steps from `Plan:` sections in assistant messages
- `[DONE:n]` markers to complete steps during execution
- Progress tracking widget (☑/☐ checklist) in TUI

### Key API Patterns

```typescript
// Toggle available tools
pi.setActiveTools(PLAN_MODE_TOOLS);   // restrict
pi.setActiveTools(NORMAL_MODE_TOOLS); // restore

// Register CLI flag
pi.registerFlag("plan", { type: "boolean", default: false });

// UI status bar
ctx.ui.setStatus("plan-mode", ctx.ui.theme.fg("warning", "⏸ plan"));

// UI widget (above editor)
ctx.ui.setWidget("plan-todos", todoLines);

// Persist state in session
pi.appendEntry("plan-mode", { enabled, todos, executing });
```

---

## 3. Permission Gate (33 lines)

**File:** `examples/extensions/permission-gate.ts`
**Purpose:** Prompts confirmation before dangerous bash commands.

```typescript
pi.on("tool_call", async (event, ctx) => {
  if (event.toolName !== "bash") return undefined;
  const command = event.input.command as string;
  const isDangerous = dangerousPatterns.some(p => p.test(command));

  if (isDangerous) {
    if (!ctx.hasUI) {
      return { block: true, reason: "Dangerous command blocked (no UI)" };
    }
    const choice = await ctx.ui.select(`⚠️ Dangerous: ${command}\nAllow?`, ["Yes", "No"]);
    if (choice !== "Yes") return { block: true, reason: "Blocked by user" };
  }
  return undefined;
});
```

**Patterns detected:** `rm -rf`, `sudo`, `chmod/chown 777`

---

## 4. Protected Paths (29 lines)

**File:** `examples/extensions/protected-paths.ts`
**Purpose:** Block write/edit operations to sensitive paths.

```typescript
const protectedPaths = [".env", ".git/", "node_modules/"];

pi.on("tool_call", async (event, ctx) => {
  if (event.toolName !== "write" && event.toolName !== "edit") return undefined;
  const path = event.input.path as string;
  if (protectedPaths.some(p => path.includes(p))) {
    return { block: true, reason: `Path "${path}" is protected` };
  }
  return undefined;
});
```

---

## 5. Custom Compaction (112 lines)

**File:** `examples/extensions/custom-compaction.ts`
**Purpose:** Replace default compaction with a full AI summary using a different (cheaper) model.

```typescript
pi.on("session_before_compact", async (event, ctx) => {
  const model = ctx.modelRegistry.find("google", "gemini-2.5-flash");
  const apiKey = await ctx.modelRegistry.getApiKey(model);

  // Serialize ALL messages to text
  const conversationText = serializeConversation(convertToLlm(allMessages));

  // Summarize with Gemini Flash (cheaper than conversation model)
  const response = await complete(model, { messages: summaryMessages }, {
    apiKey, maxTokens: 8192, signal
  });

  return {
    compaction: { summary, firstKeptEntryId, tokensBefore }
  };
});
```

Uses `@mariozechner/pi-ai` `complete()` directly. Demonstrates cross-model orchestration and
`convertToLlm()` / `serializeConversation()` utilities.

---

## 6. Sandbox Extension (316 lines)

**File:** `examples/extensions/sandbox/index.ts`
**Purpose:** OS-level sandboxing for bash commands.

### Config (`.pi/sandbox.json`)

```json
{
  "enabled": true,
  "network": {
    "allowedDomains": ["github.com", "*.github.com"],
    "deniedDomains": []
  },
  "filesystem": {
    "denyRead": ["~/.ssh", "~/.aws"],
    "allowWrite": [".", "/tmp"],
    "denyWrite": [".env"]
  }
}
```

- Uses `@anthropic-ai/sandbox-runtime` (`SandboxManager`)
- macOS: `sandbox-exec`; Linux: `bubblewrap`
- Merges global (`~/.pi/agent/sandbox.json`) + project (`.pi/sandbox.json`) configs
- `/sandbox` command shows current config

---

## 7. SSH Extension (219 lines)

**File:** `examples/extensions/ssh.ts`
**Purpose:** Execute commands on remote servers via SSH.

Adds `ssh_bash` tool that:
- Connects via `ssh` child process
- Supports host, command, user, port, identity file
- Returns stdout/stderr from remote execution
- Adds `/ssh` command for managing connections

---

## 8. Custom Provider Extensions

### Anthropic Proxy (603 lines)

**File:** `examples/extensions/custom-provider-anthropic/index.ts`
**Purpose:** Route Anthropic through a corporate proxy, add custom headers, or modify requests.

```typescript
pi.registerProvider("anthropic", {
  baseUrl: "https://proxy.example.com",
  headers: { "X-Custom-Header": "value" }
});
```

Full implementation includes OAuth flow, streaming adapter, and cost tracking.

### GitLab Duo (348 lines)

**File:** `examples/extensions/custom-provider-gitlab-duo/index.ts`
**Purpose:** Use GitLab Duo as a model provider with GitLab-specific auth.

Implements `CustomStreamFn` for GitLab's non-standard API format. Demonstrates how to build
providers for APIs that don't follow OpenAI/Anthropic conventions.

---

## 9. Doom Overlay (73 lines)

**File:** `examples/extensions/doom-overlay/index.ts`
**Purpose:** Play DOOM as a TUI overlay — demonstrates full custom rendering at 35 FPS.

```typescript
await ctx.ui.custom(
  (tui, _theme, _keybindings, done) => {
    return new DoomOverlayComponent(tui, engine, () => done(undefined), isResume);
  },
  {
    overlay: true,
    overlayOptions: {
      width: "75%", maxHeight: "95%", anchor: "center", margin: { top: 1 }
    }
  }
);
```

- Auto-downloads WAD file
- Persistent engine instance survives between invocations

---

## Extension API Composition Patterns

### Safety Layer

Combine `permission-gate.ts` + `protected-paths.ts` + `sandbox/` for defense-in-depth:
- Permission gate: user confirmation for dangerous commands
- Protected paths: block writes to sensitive files
- Sandbox: OS-level filesystem/network restrictions

### Context Management

Use `custom-compaction.ts` + plan-mode + AGENTS.md:
- Plan mode: read-only exploration → produce plan
- Custom compaction: domain-aware summarization
- AGENTS.md: persistent project instructions

### Multi-Agent

Subagent + SSH:
- Spawn local subagents for parallel work
- Route some tasks to remote servers via SSH
- Chain results between agents

### Custom Provider

Register proxied or custom API providers:
- Corporate proxy: override `baseUrl`
- Non-standard APIs: implement `CustomStreamFn`
- OAuth: integrate enterprise auth flows
