# Pi Coding Agent — Package Inventory

**Total packages listed:** 832 (as of 2026-03-24)
**Source:** https://pi.dev/packages
**Find more:** `npm` keyword `pi-package` — https://www.npmjs.com/search?q=keywords%3Api-package

## Package Types

| Type | Description |
|------|-------------|
| **extension** | TypeScript module with full API access (tools, commands, events, TUI) |
| **skill** | On-demand capability package (SKILL.md + optional tools) |
| **theme** | Visual customization |
| **prompt** | Reusable prompt templates |

---

## Most Popular Packages

### All-in-One / Meta Packages

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `oh-pi` | 4,114 | One-click setup like oh-my-zsh for pi | `pi install npm:oh-pi` |
| `@ifi/oh-pi` | 1,379 | Alternative oh-my-zsh — extensions, themes, prompts, skills, ant-colony | `pi install npm:@ifi/oh-pi` |

### Multi-Agent / Orchestration

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `pi-subagents` | 9,796 | Delegate tasks to subagents; chains, parallel execution, TUI clarification | `pi install npm:pi-subagents` |
| `taskplane` | 4,371 | AI agent orchestration; parallel task execution with checkpoint discipline | `pi install npm:taskplane` |
| `pi-teams` | 3,637 | Agent teams for pi, ported from claude-code-teams-mcp | `pi install npm:pi-teams` |
| `@ifi/oh-pi-ant-colony` | 1,588 | Autonomous multi-agent swarm; adaptive concurrency, pheromone communication | `pi install npm:@ifi/oh-pi-ant-colony` |
| `@tintinweb/pi-subagents` | 1,888 | Claude Code-style autonomous sub-agents for pi | `pi install npm:@tintinweb/pi-subagents` |
| `pi-messenger` | 2,309 | Inter-agent messaging and file reservation system | `pi install npm:pi-messenger` |
| `pi-messenger-swarm` | 2,238 | Swarm-first multi-agent messaging and task orchestration | `pi install npm:pi-messenger-swarm` |
| `pi-mesh` | ~new | Multi-agent coordination — presence, messaging, file reservations | `pi install npm:pi-mesh` |
| `@e9n/pi-channels` | 1,815 | Two-way channel extension — route messages between agents and Telegram, webhooks | `pi install npm:@e9n/pi-channels` |

### MCP Integration

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `pi-mcp-adapter` | 4,283 | MCP (Model Context Protocol) adapter extension | `pi install npm:pi-mcp-adapter` |
| `@zhafron/pi-mcp-tools` | 889 | Universal MCP tools extension | `pi install npm:@zhafron/pi-mcp-tools` |
| `@sage-protocol/pi-adapter` | 945 | Sage Protocol MCP integration | `pi install npm:@sage-protocol/pi-adapter` |

### Web / Search

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `latchkey` | 33,524 | CLI tool that injects API credentials into curl requests | `pi install npm:latchkey` |
| `pi-web-access` | 3,355 | Web search, URL fetching, GitHub cloning, PDF, YouTube, video analysis | `pi install npm:pi-web-access` |
| `@apmantza/greedysearch-pi` | 3,220 | Parallel search on Perplexity, Bing Copilot, Google AI via CDP | `pi install npm:@apmantza/greedysearch-pi` |
| `@aliou/pi-linkup` | 1,039 | Web search via Linkup API | `pi install npm:@aliou/pi-linkup` |

### UI / Visual

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `@codexstar/pi-pompom` | 18,076 | 3D raymarched virtual pet, voice, ambient weather, AI side chat | `pi install npm:@codexstar/pi-pompom` |
| `pi-studio` | 5,055 | Two-pane browser workspace; prompt/response editing, annotations, Markdown/LaTeX preview | `pi install npm:pi-studio` |
| `pi-markdown-preview` | 4,343 | Rendered markdown + LaTeX preview; terminal, browser, PDF output | `pi install npm:pi-markdown-preview` |
| `@juanibiapina/pi-powerbar` | ~new | Persistent powerline status bar with left/right segments | `pi install npm:@juanibiapina/pi-powerbar` |
| `pi-powerline-footer` | 3,370 | Powerline-style status bar | `pi install npm:pi-powerline-footer` |
| `tau-mirror` | 930 | Web UI that mirrors your Pi terminal session in the browser | `pi install npm:tau-mirror` |
| `glimpseui` | 2,061 | Native micro-UI — cross-platform WebView windows with bidirectional JSON | `pi install npm:glimpseui` |
| `pi-tool-display` | 1,306 | Compact tool call rendering, diff visualization, output truncation | `pi install npm:pi-tool-display` |
| `@ifi/oh-pi-themes` | 1,675 | Themes: cyberpunk, nord, gruvbox, tokyo-night, catppuccin, and more | `pi install npm:@ifi/oh-pi-themes` |
| `pi-dj` | 2,366 | AI music suite — YouTube, radio (30k+ stations), Suno, Lyria AI, SoundCloud | `pi install npm:pi-dj` |
| `pi-vim` | 896 | Vim-style modal editing for Pi's TUI editor | `pi install npm:pi-vim` |

### Voice / Audio

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `@codexstar/pi-listen` | 5,113 | Hold-to-talk voice input — Deepgram cloud or 19 offline models | `pi install npm:@codexstar/pi-listen` |
| `@swairshah/pi-talk` | 700 | Text-to-speech via Loqui | `pi install npm:@swairshah/pi-talk` |
| `pi-smart-voice-notify` | 721 | Smart voice, sound, and desktop notifications (Windows-optimized) | `pi install npm:pi-smart-voice-notify` |

### Plan Mode / Workflow

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `@plannotator/pi-extension` | 4,594 | Interactive plan review with visual annotation | `pi install npm:@plannotator/pi-extension` |
| `hive-agent` | 1,626 | Lightweight feature tracker for AI coding agents | `pi install npm:hive-agent` |
| `pi-plan-mode` | 733 | Read-only exploration with plan file editing | `pi install npm:pi-plan-mode` |
| `@brain0pia/pi-ultrathink` | ~new | /ultrathink review loops with conditional git commits | `pi install npm:@brain0pia/pi-ultrathink` |
| `@guwidoe/pi-prompt-suggester` | 3,486 | Intent-aware next-prompt suggestion | `pi install npm:@guwidoe/pi-prompt-suggester` |

### Security / Permissions

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `pi-permissions` | ~new | Configurable allow/deny permission rules for tool calls | `pi install npm:pi-permissions` |
| `@aliou/pi-guardrails` | 2,371 | Security hooks to reduce accidental destructive actions | `pi install npm:@aliou/pi-guardrails` |
| `@melihmucuk/leash` | ~new | Security guardrails for AI coding agents | `pi install npm:@melihmucuk/leash` |
| `pi-sandbox` | 918 | OS-level sandboxing with interactive permission prompts | `pi install npm:pi-sandbox` |
| `pi-permission-system` | 1,227 | Permission enforcement extension | `pi install npm:pi-permission-system` |
| `@grwnd/pi-governance` | 1,429 | Governance, RBAC, audit, and HITL for Pi-based coding agents | `pi install npm:@grwnd/pi-governance` |

### Context / Memory

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `pi-context` | 1,239 | Agentic context management | `pi install npm:pi-context` |
| `pi-token-burden` | 1,040 | Shows token-budget breakdown of assembled system prompt | `pi install npm:pi-token-burden` |
| `pi-rtk` | ~700 | RTK token reduction — 60-90% reduction via intelligent output filtering | `pi install npm:pi-rtk` |
| `pi-brain` | 847 | Versioned memory extension | `pi install npm:pi-brain` |
| `napkin-ai` | 731 | Local-first, file-based knowledge system for agents | `pi install npm:napkin-ai` |
| `pi-subdir-context` | 755 | Auto-load AGENTS.md from subdirectories | `pi install npm:pi-subdir-context` |

### Research / AI Subagents

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `pi-librarian` | 1,765 | GitHub research subagent package | `pi install npm:pi-librarian` |
| `pi-finder-subagent` | 1,077 | Read-only local workspace scout subagent | `pi install npm:pi-finder-subagent` |
| `@rhobot-dev/rho` | 904 | AI agent with persistent memory, heartbeat check-ins, knowledge vault | `pi install npm:@rhobot-dev/rho` |

### Custom Models / Providers

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `@aliou/pi-synthetic` | 1,276 | Access open-source models via Synthetic.new OpenAI-compatible API | `pi install npm:@aliou/pi-synthetic` |
| `@bonsai-ai/pi-extension` | 1,171 | Bonsai provider extension | `pi install npm:@bonsai-ai/pi-extension` |
| `@0xkobold/pi-ollama` | 836 | Ollama extension — local + cloud Ollama support with model management | `pi install npm:@0xkobold/pi-ollama` |
| `pi-cursor-agent` | 716 | Cursor Agent provider extension | `pi install npm:pi-cursor-agent` |
| `@aliou/pi-ts-aperture` | 1,052 | Route Pi LLM providers through Tailscale Aperture | `pi install npm:@aliou/pi-ts-aperture` |
| `@victor-software-house/pi-multicodex` | 1,579 | Codex account rotation extension | `pi install npm:@victor-software-house/pi-multicodex` |

### Background Processes / Shell

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `@aliou/pi-processes` | 1,800 | Manage background processes from Pi (dev servers, watchers, log tailers) | `pi install npm:@aliou/pi-processes` |
| `@juanibiapina/pi-gob` | ~new | Managing gob background jobs | `pi install npm:@juanibiapina/pi-gob` |
| `pi-interactive-shell` | 2,142 | Run AI coding agents in pi TUI overlays | `pi install npm:pi-interactive-shell` |
| `pi-cmux` | 823 | cmux-powered terminal integrations | `pi install npm:pi-cmux` |

### Git / Worktrees

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `@zenobius/pi-worktrees` | 801 | Worktrees extension for Pi | `pi install npm:@zenobius/pi-worktrees` |
| `pi-worktree` | 747 | Git worktree management — create isolated workspaces, launch in cmux/tmux | `pi install npm:pi-worktree` |
| `pi-rewind` | 1,361 | Checkpoint/rewind per-tool snapshots, /rewind command, safe restore, redo stack | `pi install npm:pi-rewind` |

### Developer Tools

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `pi-extmgr` | 2,385 | Enhanced UX for managing local extensions and community packages | `pi install npm:pi-extmgr` |
| `@juanibiapina/pi-extension-settings` | 2,148 | Centralized settings management across extensions | `pi install npm:@juanibiapina/pi-extension-settings` |
| `pi-updater` | 1,088 | Codex-style auto-updater for pi | `pi install npm:pi-updater` |
| `pi-ask-user` | 1,329 | Interactive ask_user tool with multi-select and freeform input | `pi install npm:pi-ask-user` |
| `@marcfargas/pi-test-harness` | 1,294 | Test harness for pi extensions | `pi install npm:@marcfargas/pi-test-harness` |
| `pi-annotated-reply` | 1,211 | Annotated reply workflow — model responses, file sources, git diffs | `pi install npm:pi-annotated-reply` |
| `pi-interview` | 1,221 | Interactive interview form extension | `pi install npm:pi-interview` |
| `@artale/pi-arena` | 730 | Model benchmarking — hallucination tracking, leaderboards, task templates | `pi install npm:@artale/pi-arena` |

### Notifications / Integrations

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `pi-telebridge` | 839 | Two-way relay between Pi session and a Telegram bot | `pi install npm:pi-telebridge` |
| `pi-minimax-tools` | 859 | MiniMax web_search and understand_image tools | `pi install npm:pi-minimax-tools` |
| `pi-repoprompt-mcp` | 877 | Token-efficient RepoPrompt integration with branch-safe workspace management | `pi install npm:pi-repoprompt-mcp` |

### Domain-Specific Skills

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `@marcfargas/odoo-skills` | 790 | Battle-tested Odoo knowledge modules — 5,200+ lines validated against Odoo v17 | `pi install npm:@marcfargas/odoo-skills` |
| `@ifi/oh-pi-skills` | 1,562 | Skill packs: web-search, debug-helper, git-workflow, and more | `pi install npm:@ifi/oh-pi-skills` |
| `@ifi/oh-pi-extensions` | 1,567 | Core extensions: safe-guard, git-guard, auto-session, custom-footer | `pi install npm:@ifi/oh-pi-extensions` |
| `@ifi/oh-pi-prompts` | 1,539 | Prompt templates: review, fix, explain, refactor, test, commit | `pi install npm:@ifi/oh-pi-prompts` |
| `@normful/picadillo` | 1,859 | Skills & extensions: run-in-tmux, parrot, mulch, overstory | `pi install npm:@normful/picadillo` |

### Personal / Community Bundles

| Package | Downloads/mo | Description | Install |
|---------|-------------|-------------|---------|
| `mitsupi` | 722 | Armin Ronacher's (mitsuhiko) pi commands, skills, extensions, themes | `pi install npm:mitsupi` |
| `@bdsqqq/pi` | 1,156 | Extensions and core utilities | `pi install npm:@bdsqqq/pi` |
| `@manojlds/ralphi` | 1,120 | Ralph extension with skill commands and fresh-context loop sessions | `pi install npm:@manojlds/ralphi` |

---

## Recommended Starter Pack for Teams

```bash
# Core workflow
pi install npm:pi-subagents           # multi-agent delegation
pi install npm:pi-mcp-adapter         # MCP protocol support
pi install npm:@aliou/pi-guardrails   # security hooks
pi install npm:pi-permissions         # granular permission control

# Productivity
pi install npm:@plannotator/pi-extension   # plan review
pi install npm:pi-rewind                  # checkpoint/restore
pi install npm:@guwidoe/pi-prompt-suggester # intent-aware suggestions

# UI & Experience
pi install npm:pi-powerline-footer    # status bar
pi install npm:pi-studio              # browser workspace
pi install npm:@ifi/oh-pi-themes      # color themes

# Memory & Context
pi install npm:pi-context             # context management
pi install npm:pi-brain               # versioned memory
```
