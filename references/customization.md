# Pi Coding Agent — Customization Guide

## Overview

Pi is built around four customization primitives:
1. **Extensions** — TypeScript modules with full API access
2. **Skills** — On-demand capability packages (Markdown instructions + optional tools)
3. **Prompt Templates** — Reusable Markdown prompts
4. **Themes** — Visual customization

All of these can be bundled as **Pi Packages** and shared via npm or git.

---

## 1. Extensions

Extensions are TypeScript modules that hook into pi's full lifecycle.

### Extension Structure

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function(pi: ExtensionAPI) {
  // Register tools
  pi.registerTool({
    name: "my_tool",
    description: "Does something useful",
    parameters: { /* JSON schema */ },
    execute: async (params) => { /* ... */ }
  });

  // Register commands
  pi.registerCommand("/mycommand", async (args) => {
    // ...
  });

  // Add keyboard shortcuts
  pi.registerShortcut("ctrl+shift+m", { handler: () => { /* ... */ } });

  // Hook into events
  pi.on("turn_start", (event, ctx) => { /* ... */ });
  pi.on("turn_end", (event, ctx) => { /* ... */ });
  pi.on("before_agent_start", (event, ctx) => { /* ... */ });
  pi.on("input", (event, ctx) => { /* ... */ });

  // Add status bar
  ctx.ui.setStatus("my-ext", "custom status");

  // Add widget above editor
  ctx.ui.setWidget("my-ext", ["Line 1", "Line 2"]);
}
```

### Extension Discovery

Pi auto-discovers extensions from:
- `~/.pi/agent/extensions/` (global)
- `.pi/extensions/` (project)
- From installed pi packages

### Loading Extensions Explicitly

```bash
pi -e ./my-ext.ts              # from local file
pi -e npm:@foo/pi-tools        # from npm
pi -e git:github.com/user/repo # from git
```

Test without installing:

```bash
pi -e git:github.com/user/my-extension
```

Disable all extensions:

```bash
pi --no-extensions
```

### Extension API Capabilities

- **Tools** — Add new tools the model can call
- **Commands** — Add `/command` handlers
- **Keyboard shortcuts** — Register hotkeys
- **Events** — Listen to agent lifecycle events
- **Context injection** — Inject messages before each turn
- **History filtering** — Filter/transform message history (RAG, memory)
- **Custom compaction** — Override how context is summarized
- **TUI widgets** — Add status bars, overlays, custom editors
- **Providers** — Register custom LLM providers

### Example Extensions (Official)

All in `packages/coding-agent/examples/extensions/`:
- `subagent/` — Multi-agent spawning
- `plan-mode/` — Planning workflow
- `permission-gate.ts` — Permission confirmation
- `protected-paths.ts` — Path protection
- `ssh.ts` — SSH execution
- `sandbox/` — Sandboxed execution
- `custom-compaction.ts` — Custom context summarization
- `custom-provider-anthropic/` — Custom Anthropic proxy
- `custom-provider-gitlab-duo/` — GitLab Duo integration
- `custom-provider-qwen-cli/` — Qwen CLI integration
- `doom-overlay/` — Yes, Doom runs in pi's TUI

---

## 2. Skills

Skills follow the [Agent Skills standard](https://agentskills.io). They are on-demand capability
packages — loaded when explicitly invoked or auto-discovered when relevant.

### Skill Structure

```markdown
---
name: my-skill
description: Use this skill when the user asks about X
---

# My Skill

## Steps
1. Do this
2. Then that

## Notes
- Any context or instructions
```

Optionally include tool implementations (TypeScript files alongside the SKILL.md).

### Skill Discovery

Pi auto-discovers skills from:
- `~/.pi/agent/skills/` (global)
- `~/.agents/skills/` (global alternative)
- `.pi/skills/` (project)
- `.agents/skills/` (project alternative, walks up from cwd)

### Invoking Skills

- `/skill:name` — explicitly invoke a skill
- Agent auto-loads relevant skills based on context

### Official Pi Skills (bundled)

Available in `~/.pi/agent/skills/pi-skills/`:
- `brave-search` — Web search via Brave API
- `browser-tools` — Browser automation
- `gccli` — Git commit CLI
- `gdcli` — Git diff CLI
- `gmcli` — Git merge CLI
- `transcribe` — Audio transcription
- `vscode` — VS Code integration
- `youtube-transcript` — YouTube transcript extraction

---

## 3. Prompt Templates

Reusable Markdown prompts. Type `/name` in the TUI to expand.

### Template Structure

```markdown
---
description: Review staged git changes
argument-hint: "<focus-area>"
---
Review the staged changes (`git diff --cached`). Focus on: $1
```

### Positional Arguments

| Syntax | Meaning |
|--------|---------|
| `$1`, `$2`, ... | Positional args |
| `$@` or `$ARGUMENTS` | All args joined |
| `${@:N}` | Args from Nth position (1-indexed) |
| `${@:N:L}` | L args starting at N |

### Template Discovery

- `~/.pi/agent/prompts/` (global)
- `.pi/prompts/` (project)
- From installed pi packages

### Invoking

Type `/templatename` in the editor to expand the template inline.

---

## 4. Themes

Themes customize pi's visual appearance.

### Theme Structure

```json
{
  "colors": {
    "userMessage": "#00ff00",
    "assistantMessage": "#00aaff",
    "toolCall": "#ffaa00",
    "error": "#ff4444"
  },
  "borderStyle": "rounded"
}
```

Place in `~/.pi/agent/themes/` or `.pi/themes/`. Themes hot-reload automatically.

---

## 5. Pi Packages

Bundle extensions, skills, prompts, and themes into installable packages.

### Package Structure (package.json)

```json
{
  "name": "my-pi-package",
  "keywords": ["pi-package"],
  "pi": {
    "extensions": ["./extensions"],
    "skills": ["./skills"],
    "prompts": ["./prompts"],
    "themes": ["./themes"]
  }
}
```

Without the `pi` key, pi auto-discovers from conventional directories.

### Install Commands

```bash
pi install npm:@foo/pi-tools          # from npm
pi install git:github.com/user/repo   # from git
pi install git:github.com/user/repo@1.2.3  # pinned version
pi install git:github.com/user/repo@tag    # by tag

pi list      # list installed packages
pi update    # update all packages (skips pinned)
pi remove npm:@foo/pi-tools
pi config    # enable/disable extensions/skills/prompts/themes
```

Project-local installation:

```bash
pi install -l npm:@foo/pi-tools  # installs to .pi/ instead of global
```

### Gallery Metadata

For [pi.dev/packages](https://pi.dev/packages) previews, add to `package.json`:

```json
{
  "keywords": ["pi-package"],
  "pi": {
    "video": "https://example.com/demo.mp4",
    "image": "https://example.com/screenshot.png"
  }
}
```

### Dependencies

Runtime deps belong in `dependencies`. Core pi packages should be in `peerDependencies` with `"*"` range (do not bundle them): `@mariozechner/pi-ai`, `@mariozechner/pi-agent-core`, `@mariozechner/pi-coding-agent`, `@mariozechner/pi-tui`, `typebox`.

Other pi packages must be bundled via `bundledDependencies`.

### Publishing

1. Add `"pi-package"` to `keywords` in `package.json`
2. Publish to npm: `npm publish`
3. Find/share on [pi.dev/packages](https://pi.dev/packages) or npm with keyword `pi-package`

---

## 6. Context Engineering

### AGENTS.md

Pi loads `AGENTS.md` (or `CLAUDE.md`) at startup:
1. `~/.pi/agent/AGENTS.md` (global)
2. Parent directories (walking up from cwd)
3. Current directory (`.pi/AGENTS.md` or `AGENTS.md`)

All matching files are concatenated.

### Compaction

Pi auto-summarizes older messages when approaching context limit.

**Manual:** `/compact` or `/compact My custom instructions`

**Automatic:** Enabled by default. Configure via `/settings` or `settings.json`.

**Custom compaction** via extension:

```typescript
pi.setCompactionHandler(async (messages) => {
  // Custom summarization logic
  return summarizedMessages;
});
```

---

## 7. Custom Providers

### Via models.json

`~/.pi/agent/models.json` — add Ollama, vLLM, LM Studio, proxies. See `models.md` for the full
configuration reference.

### Via Extension

```typescript
pi.registerProvider("my-provider", {
  baseUrl: "https://api.example.com",
  apiKey: "MY_API_KEY",
  api: "openai-completions",
  models: [
    {
      id: "my-model",
      name: "My Model",
      reasoning: false,
      input: ["text", "image"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 128000,
      maxTokens: 4096
    }
  ]
});
```

Override existing provider (proxy):

```typescript
pi.registerProvider("anthropic", {
  baseUrl: "https://my-proxy.example.com"
});
```

See `custom-provider.md` for the full extension-based provider API.

---

## 8. Programmatic Usage (SDK)

```typescript
import { AuthStorage, createAgentSession, ModelRegistry, SessionManager } from "@mariozechner/pi-coding-agent";

const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),
  authStorage: AuthStorage.create(),
  modelRegistry: new ModelRegistry(authStorage),
});

await session.prompt("What files are in the current directory?");
```

See [docs/sdk.md](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/docs/sdk.md)
and [clawdbot](https://github.com/clawdbot/clawdbot) for a real-world example.

---

## 9. RPC Mode

For non-Node.js integrations, use RPC mode over stdin/stdout:

```bash
pi --mode rpc
```

Strict LF-delimited JSONL framing. Do not use readline (splits on Unicode separators). See
`rpc.md` for the full protocol reference.
