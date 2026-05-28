# Pi Coding Agent — Settings Reference

**Source:** https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/docs/settings.md

Pi uses JSON settings with project settings overriding global settings.

| Location | Scope |
|----------|-------|
| `~/.pi/agent/settings.json` | Global (all projects) |
| `.pi/settings.json` | Project (overrides global) |

Nested objects are merged (not replaced).

## Model & Thinking

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `defaultProvider` | string | — | Default provider name |
| `defaultModel` | string | — | Default model ID |
| `defaultThinkingLevel` | string | — | `off`, `minimal`, `low`, `medium`, `high`, `xhigh` |
| `hideThinkingBlock` | boolean | `false` | Hide thinking blocks in output |
| `thinkingBudgets` | object | — | Custom token budgets per level |

```json
{
  "thinkingBudgets": {
    "minimal": 1024,
    "low": 4096,
    "medium": 10240,
    "high": 32768
  }
}
```

## UI & Display

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `theme` | string | `"dark"` | Theme name |
| `quietStartup` | boolean | `false` | Hide startup header |
| `collapseChangelog` | boolean | `false` | Condensed changelog after updates |
| `enableInstallTelemetry` | boolean | `true` | Anonymous install ping |
| `doubleEscapeAction` | string | `"tree"` | `"tree"`, `"fork"`, or `"none"` |
| `treeFilterMode` | string | `"default"` | Default `/tree` filter |
| `editorPaddingX` | number | `0` | Horizontal padding (0-3) |
| `autocompleteMaxVisible` | number | `5` | Max autocomplete items (3-20) |
| `showHardwareCursor` | boolean | `false` | Show terminal cursor |

## Telemetry & Updates

- `enableInstallTelemetry`: controls anonymous ping to `https://pi.dev/api/report-install`
- `PI_SKIP_VERSION_CHECK=1`: skip version check
- `PI_OFFLINE=1` or `--offline`: disable ALL startup network ops
- `PI_TELEMETRY=0`: disable install telemetry

## Compaction

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `compaction.enabled` | boolean | `true` | Enable auto-compaction |
| `compaction.reserveTokens` | number | `16384` | Tokens reserved for LLM response |
| `compaction.keepRecentTokens` | number | `20000` | Recent tokens to keep |

## Branch Summary

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `branchSummary.reserveTokens` | number | `16384` | Tokens reserved for summarization |
| `branchSummary.skipPrompt` | boolean | `false` | Skip "Summarize branch?" prompt |

## Retry

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `retry.enabled` | boolean | `true` | Auto retry on transient errors |
| `retry.maxRetries` | number | `3` | Max agent-level retries |
| `retry.baseDelayMs` | number | `2000` | Exponential backoff base (2s, 4s, 8s) |
| `retry.provider.timeoutMs` | number | SDK default | Request timeout |
| `retry.provider.maxRetries` | number | SDK default | Provider retry attempts |
| `retry.provider.maxRetryDelayMs` | number | `60000` | Max server-requested delay cap |

## Message Delivery

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `steeringMode` | string | `"one-at-a-time"` | `"all"` or `"one-at-a-time"` |
| `followUpMode` | string | `"one-at-a-time"` | `"all"` or `"one-at-a-time"` |
| `transport` | string | `"sse"` | `"sse"`, `"websocket"`, or `"auto"` |

## Terminal & Images

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `terminal.showImages` | boolean | `true` | Show images in terminal |
| `terminal.imageWidthCells` | number | `60` | Preferred inline image width |
| `terminal.clearOnShrink` | boolean | `false` | Clear empty rows when shrinking |
| `images.autoResize` | boolean | `true` | Resize images to 2000x2000 max |
| `images.blockImages` | boolean | `false` | Block all images from LLM |

## Shell

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `shellPath` | string | — | Custom shell path |
| `shellCommandPrefix` | string | — | Prefix for every bash command |
| `npmCommand` | string[] | — | npm wrapper command, e.g. `["mise", "exec", "node@20", "--", "npm"]` |

## Sessions

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `sessionDir` | string | — | Session storage directory (accepts `~`) |

## Model Cycling

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `enabledModels` | string[] | — | Patterns for Ctrl+P cycling |

```json
{ "enabledModels": ["claude-*", "gpt-4o", "gemini-2*"] }
```

## Markdown

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `markdown.codeBlockIndent` | string | `"  "` | Indentation for code blocks |

## Resources

Paths in global settings resolve relative to `~/.pi/agent`. Paths in project settings resolve
relative to `.pi/`. Absolute paths and `~` are supported.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `packages` | array | `[]` | npm/git packages to load |
| `extensions` | string[] | `[]` | Local extension paths |
| `skills` | string[] | `[]` | Local skill paths |
| `prompts` | string[] | `[]` | Local prompt template paths |
| `themes` | string[] | `[]` | Local theme paths |
| `enableSkillCommands` | boolean | `true` | Register `/skill:name` commands |

Arrays support glob patterns and exclusions:
- `!pattern` to exclude
- `+path` to force-include exact path
- `-path` to force-exclude exact path

### Package Filtering

```json
{
  "packages": [
    "npm:simple-pkg",
    {
      "source": "npm:my-package",
      "skills": ["brave-search"],
      "extensions": []
    }
  ]
}
```

## Example

```json
{
  "defaultProvider": "anthropic",
  "defaultModel": "claude-sonnet-4-20250514",
  "defaultThinkingLevel": "medium",
  "theme": "dark",
  "compaction": {
    "enabled": true,
    "reserveTokens": 16384,
    "keepRecentTokens": 20000
  },
  "retry": {
    "enabled": true,
    "maxRetries": 3
  },
  "enabledModels": ["claude-*", "gpt-4o"],
  "packages": ["pi-skills"]
}
```
