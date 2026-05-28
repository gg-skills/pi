# Pi Coding Agent — Sessions & Branching

**Source:** https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/docs/session-format.md

Sessions are stored as JSONL files with a tree structure. Each entry has an `id` and
`parentId`, enabling in-place branching without creating new files.

## File Location

```
~/.pi/agent/sessions/--<path>--/<timestamp>_<uuid>.jsonl
```

Where `<path>` is the working directory with `/` replaced by `-`.

Delete sessions by removing `.jsonl` files, or interactively via `/resume` (select and press
`Ctrl+D`).

## Session Versions

- **v1**: Linear entry sequence (legacy, auto-migrated)
- **v2**: Tree structure with `id`/`parentId`
- **v3**: Renamed `hookMessage` role to `custom`

## Session Header

```json
{"type":"session","version":3,"id":"uuid","timestamp":"...","cwd":"/path"}
```

Forked sessions include `parentSession`:
```json
{"type":"session","version":3,"id":"uuid","timestamp":"...","cwd":"/path","parentSession":"/path/to/original.jsonl"}
```

## Message Types

| Type | Role | Content |
|------|------|---------|
| `user` | UserMessage | Text or image content blocks |
| `assistant` | AssistantMessage | Text, thinking, or toolCall blocks |
| `toolResult` | ToolResultMessage | Tool execution output |
| `bashExecution` | BashExecutionMessage | `!`/`!!` command output |
| `custom` | CustomMessage | Extension-injected content |
| `branchSummary` | BranchSummaryMessage | Abandoned branch summary |
| `compactionSummary` | CompactionSummaryMessage | Context compaction summary |

## CLI Session Options

| Flag | Description |
|------|-------------|
| `pi -c` | Continue most recent session |
| `pi -r` | Browse and select from past sessions |
| `pi --no-session` | Ephemeral mode (don't save) |
| `pi --session <path\|id>` | Use specific session file or partial UUID |
| `pi --fork <path\|id>` | Fork session into new session |
| `pi --session-dir <dir>` | Custom session storage directory |

## TUI Commands

| Command | Description |
|---------|-------------|
| `/tree` | Navigate session history tree in-place |
| `/fork` | Create new session from previous user message |
| `/clone` | Duplicate current branch into new session |
| `/compact [prompt]` | Manually compact context |
| `/name <name>` | Set session display name |
| `/session` | Show session info |
| `/export [file]` | Export session to HTML |
| `/share` | Upload as private GitHub gist |

## Tree Navigation (`/tree`)

- Search by typing
- Fold/unfold and jump between branches with `Ctrl+←`/`Ctrl+→` or `Alt+←`/`Alt+→`
- Page with `←`/`→`
- Filter modes (`Ctrl+O`): default → no-tools → user-only → labeled-only → all
- `Shift+L` to label entries as bookmarks
- `Shift+T` to toggle label timestamps

## Compaction

Long sessions exhaust context windows. Compaction summarizes older messages.

**Manual:** `/compact` or `/compact <custom instructions>`

**Automatic:** Enabled by default. Triggers on context overflow or when approaching limit.
Configure via `/settings` or `settings.json`:

```json
{
  "compaction": {
    "enabled": true,
    "reserveTokens": 16384,
    "keepRecentTokens": 20000
  }
}
```

**Custom compaction** via extension `session_before_compact` event.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PI_CODING_AGENT_SESSION_DIR` | Override session storage directory |
