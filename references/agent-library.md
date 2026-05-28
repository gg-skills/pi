# Pi Coding Agent — Agent Library

Ready-to-use agent configurations organized by use case.

---

## Agent Architecture: 3-Layer Mental Model

```
┌─────────────────────────────────────────────────────────────────┐
│  ORCHESTRATION LAYER         (multi-agent, task queueing)       │
│  pi-subagents / pi-teams / taskplane / @ifi/oh-pi-ant-colony   │
├─────────────────────────────────────────────────────────────────┤
│  CAPABILITY LAYER            (tools, skills, context)           │
│  pi-web-access / pi-mcp-adapter / pi-brain / pi-context        │
├─────────────────────────────────────────────────────────────────┤
│  SAFETY LAYER                (permissions, governance)         │
│  pi-permissions / @aliou/pi-guardrails / @grwnd/pi-governance  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Agent 1: Solo Deep-Research Agent

**Use case:** Autonomous web research, document synthesis, report generation

### Packages

```bash
pi install npm:pi-web-access           # web search, URL fetch, PDF, YouTube
pi install npm:@apmantza/greedysearch-pi # parallel search across Perplexity, Bing, Google
pi install npm:pi-subagents            # spawn parallel research instances
pi install npm:pi-brain                # versioned memory between sessions
pi install npm:pi-context              # agentic context management
```

### AGENTS.md Template

```markdown
# Research Agent

You are a deep-research agent. When given a research topic:

1. Use greedysearch to search Perplexity, Bing, and Google in parallel
2. Use pi-web-access to scrape and synthesize sources
3. Save findings to memory using pi-brain
4. Produce a structured report with citations

Always validate claims across at least 3 sources before including them.
```

---

## Agent 2: Full-Stack Codebase Manager

**Use case:** Managing large codebases with plan mode, code review, and testing

### Packages

```bash
pi install npm:@plannotator/pi-extension  # plan review with visual annotation
pi install npm:pi-plan-mode               # read-only exploration + plan editing
pi install npm:pi-rewind                  # checkpoint/restore before risky changes
pi install npm:pi-ask-user                # structured clarification dialogs
pi install npm:@aliou/pi-processes        # manage dev servers, watchers in background
pi install npm:pi-annotated-reply         # annotated responses with file sources + diffs
pi install npm:pi-permission-system       # granular tool call permissions
```

### AGENTS.md Template

```markdown
# Codebase Manager Agent

You are a senior engineer managing this codebase. Your approach:

## Before Changes
- Always use plan mode (/plan) to review before executing
- Use pi-rewind to checkpoint before any destructive operations
- Ask for clarification when requirements are ambiguous

## During Changes
- Run tests after every significant change
- Keep changes atomic and reviewable
- Never modify files outside the agreed scope

## Code Quality
- Follow existing conventions; read relevant code first
- Prefer explicit over implicit solutions
- Write self-documenting code
```

---

## Agent 3: Multi-Agent Swarm Coordinator

**Use case:** Parallel task execution across multiple pi instances

### Packages

```bash
pi install npm:pi-subagents             # delegate to subagents; chains + parallel
pi install npm:pi-messenger             # inter-agent messaging + file reservations
pi install npm:pi-mesh                  # presence, messaging, coordination
pi install npm:taskplane                # AI agent orchestration with checkpoints
pi install npm:pi-interactive-shell     # run agents in TUI overlays
```

### Architecture Pattern

```bash
# Terminal 1: Coordinator agent
pi "You are the coordinator. Use pi-subagents to spawn 3 workers:
    Worker A: Research X
    Worker B: Research Y
    Worker C: Review and synthesize A+B results"
```

### Alternative with tmux

```bash
tmux new-session -d -s pi-swarm
tmux send-keys -t pi-swarm "pi 'You are coordinator...'" Enter
tmux split-window -h
tmux send-keys -t pi-swarm "pi -c" Enter
tmux split-window -v
tmux send-keys -t pi-swarm "pi -c" Enter
```

---

## Agent 4: Codebase Audit & Security Agent

**Use case:** Security audits, code quality reviews, compliance checks

### Packages

```bash
pi install npm:@aliou/pi-guardrails      # prevent accidental destructive actions
pi install npm:@grwnd/pi-governance      # RBAC, audit trail, HITL
pi install npm:pi-permission-system      # granular tool call control
pi install npm:pi-sandbox                # OS-level sandboxing during audits
pi install npm:pi-annotated-reply        # annotated findings with file sources
pi install npm:@apmantza/greedysearch-pi # research CVEs and vulnerability databases
```

### AGENTS.md Template

```markdown
# Security Audit Agent

You are a security engineer conducting a codebase audit.

## Approach
- Start with read-only mode; no modifications unless explicitly authorized
- Focus on: authentication, authorization, input validation, secrets handling
- Cross-reference findings with CVE databases where relevant
- Provide remediation suggestions with severity ratings (CRITICAL/HIGH/MEDIUM/LOW)

## Output Format
For each finding:
- File + line number
- Vulnerability type
- Severity
- Exploitation scenario
- Recommended fix
- References
```

### CLI Invocation (read-only mode)

```bash
pi --tools read,grep,find,ls \
   --thinking high \
   -e npm:@aliou/pi-guardrails \
   "Conduct a security audit of this codebase. Focus on authentication flows."
```

---

## Agent 5: Persistent Memory Agent

**Use case:** Long-running projects where context must persist across sessions

### Packages

```bash
pi install npm:pi-brain                  # versioned memory with namespacing
pi install npm:napkin-ai                 # local-first, file-based knowledge system
pi install npm:pi-context                # agentic context management and injection
pi install npm:pi-subdir-context         # auto-load AGENTS.md from subdirs
pi install npm:@rhobot-dev/rho           # persistent memory + heartbeat check-ins + knowledge vault
```

### Memory Architecture

```
~/.pi/agent/
├── AGENTS.md              # Global permanent instructions
├── skills/
│   └── project-memory/
│       └── SKILL.md       # Project-specific knowledge
└── sessions/
    └── *.jsonl            # Tree-structured session history

.pi/
├── AGENTS.md              # Project instructions
└── memory/               # napkin-ai / pi-brain storage
    ├── decisions.md
    ├── architecture.md
    └── conventions.md
```

### Usage Pattern

```bash
# Session 1: Build feature
pi "Build feature X. When done, save key decisions to memory."

# Session 2: Continue (with context)
pi -c "Continue from yesterday. Load memory about feature X."
```

---

## Agent 6: CI/CD Pipeline Agent

**Use case:** Automated code review, testing, and deployment workflows

### Packages

```bash
pi install npm:pi-subagents              # parallel test runners
pi install npm:@aliou/pi-processes       # background process management
pi install npm:pi-permissions            # lock down to safe operations only
pi install npm:pi-annotated-reply        # structured test result reporting
```

### Print Mode for CI Integration

```bash
# Non-interactive mode for CI
pi --mode json -p "Review PR #$(PR_NUMBER) for:
  1. Breaking changes
  2. Security issues
  3. Performance regressions
  4. Missing tests
  Output as JSON: { issues: [], approved: boolean, summary: string }"

# Pipe code to pi
git diff main | pi -p "Review this diff. Output JSON: { approved: bool, issues: [] }"
```

### SDK Integration for Custom CI Bots

```typescript
import { createAgentSession, SessionManager, AuthStorage, ModelRegistry } from "@mariozechner/pi-coding-agent";

const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),
  authStorage: AuthStorage.fromEnv(), // PI_API_KEY etc.
  modelRegistry: new ModelRegistry(AuthStorage.fromEnv()),
});

const result = await session.prompt(`
  Review PR: ${prDiff}
  Return JSON: { approved: boolean, issues: string[] }
`);
```

---

## Agent 7: Domain Expert Agent (Custom Knowledge)

**Use case:** Creating a pi agent with deep domain knowledge via skills

### Structure

```
~/.pi/agent/skills/
└── my-domain/
    ├── SKILL.md          # Main skill definition
    ├── tools/
    │   └── domain-api.ts # Custom tool implementations
    └── references/
        ├── spec.md
        └── conventions.md
```

### SKILL.md Template

```markdown
---
name: my-domain-expert
description: Use this skill when working with [domain]. Provides specialized
  knowledge and tools for [specific tasks].
---

# Domain Expert Skill

## When to Use
- When user asks about [domain concepts]
- When working with [domain files/formats]
- When [specific scenarios]

## Domain Knowledge
[Inline reference material, conventions, common patterns]

## Tools Available
- `domain_query` - Query the domain API
- `domain_validate` - Validate domain-specific structures

## Steps for Common Tasks

### Task A
1. Step 1
2. Step 2
```

### Real Examples from Community

- `@marcfargas/odoo-skills` — Odoo ERP (5,200+ validated lines)
- `@ifi/oh-pi-skills` — web-search, debug-helper, git-workflow
- Built-in: brave-search, browser-tools, vscode, transcribe, youtube-transcript

---

## Agent 8: Local Model Agent (Privacy-First)

**Use case:** Running entirely locally with Ollama/vLLM for sensitive codebases

### Setup

```bash
# Install Ollama
brew install ollama
ollama pull qwen2.5-coder:32b

# Configure pi
cat > ~/.pi/agent/models.json << 'EOF'
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
        { "id": "qwen2.5-coder:32b", "name": "Qwen2.5 Coder 32B (Local)" },
        { "id": "llama3.1:8b", "name": "Llama 3.1 8B (Local, Fast)" }
      ]
    }
  }
}
EOF

# Add packages
pi install npm:@0xkobold/pi-ollama      # unified Ollama management
pi install npm:pi-permissions           # local permission control
pi install npm:@aliou/pi-guardrails     # safety hooks
```

### CLI Invocation

```bash
pi --provider ollama --model qwen2.5-coder:32b "Help me refactor this function"
```

---

## Agent 9: Enterprise Governance Agent

**Use case:** Team deployments requiring audit trails, RBAC, and HITL

### Packages

```bash
pi install npm:@grwnd/pi-governance    # RBAC, audit, HITL
pi install npm:pi-permissions          # allow/deny rules
pi install npm:@aliou/pi-guardrails    # destructive action prevention
pi install npm:@aliou/pi-ts-aperture   # route LLM through Tailscale/corporate proxy
pi install npm:pi-interview            # structured clarification before risky ops
```

### Enterprise Configuration

```json
// .pi/settings.json
{
  "npmCommand": ["mise", "exec", "node@20", "--", "npm"],
  "steeringMode": "one-at-a-time",
  "followUpMode": "one-at-a-time"
}
```

```typescript
// Override provider through corporate proxy
pi.registerProvider("anthropic", {
  baseUrl: "https://anthropic-proxy.corp.example.com",
  headers: {
    "X-Corp-Auth": process.env.CORP_TOKEN
  }
});
```

---

## Capability Matrix

| Capability | Best Package(s) |
|-----------|----------------|
| Web search | `pi-web-access`, `@apmantza/greedysearch-pi` |
| Multi-agent | `pi-subagents`, `pi-teams`, `taskplane` |
| Swarm | `@ifi/oh-pi-ant-colony`, `pi-messenger-swarm` |
| Memory | `pi-brain`, `napkin-ai`, `@rhobot-dev/rho` |
| MCP | `pi-mcp-adapter`, `@zhafron/pi-mcp-tools` |
| Plan mode | `@plannotator/pi-extension`, `pi-plan-mode` |
| Permissions | `pi-permissions`, `@aliou/pi-guardrails`, `@grwnd/pi-governance` |
| Local models | `@0xkobold/pi-ollama` + `models.json` |
| Voice input | `@codexstar/pi-listen` |
| TTS | `@swairshah/pi-talk` |
| Checkpoints | `pi-rewind` |
| Background procs | `@aliou/pi-processes` |
| Visual status | `pi-powerline-footer`, `@juanibiapina/pi-powerbar` |
| Browser workspace | `pi-studio`, `tau-mirror` |
| Telegram relay | `pi-telebridge` |
| CI/CD integration | SDK + `--mode json` |
