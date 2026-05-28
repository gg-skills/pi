# Research Provenance

## Current Snapshot

- **Date:** 2026-03-24
- **Method:** Firecrawl CLI (scrape, map, search) + GitHub raw content
- **Sources:** pi.dev, github.com/badlogic/pi-mono, mariozechner.at, npmjs.com
- **Coverage:** Core docs, 10 official extension examples, 8 community package READMEs, 832-package inventory

## Canonical Sources

| Resource | URL |
|----------|-----|
| Official docs | https://pi.dev |
| GitHub repo | https://github.com/badlogic/pi-mono |
| Releases / changelog | https://github.com/badlogic/pi-mono/releases |
| npm package | https://www.npmjs.com/package/@mariozechner/pi-coding-agent |
| Package directory | https://pi.dev/packages |

## Update History

| Date | What Changed |
|------|-------------|
| 2026-03-24 | Initial corpus |
| 2026-05-05 | Corrections + additions from official docs (`2026-05-04` npm install):
| | - Fixed: `--api-key` IS a valid CLI flag (was listed as misconception) |
| | - Fixed: `registerKeyBinding` → `registerShortcut`, removed `onBeforeTurn`/`addStatusBar` (not real API) |
| | - Added: 3 new reference files (`sessions-branching.md`, `tui-components.md`, `settings-reference.md`) |
| | - Added: Missing events (`input`, `before_agent_start`, `context`, `before_provider_request`, `after_provider_response`, `user_bash`, `tool_execution_*`, `thinking_level_select`, `model_select`) |
| | - Added: `ExtensionCommandContext` session control methods |
| | - Added: Prompt template positional arguments (`$1`, `$@`, etc.) |
| | - Added: Editor features (`@` fuzzy search, `!`/`!!` bash, message queue) |
| | - Added: Telemetry env vars (`PI_OFFLINE`, `PI_TELEMETRY`, `PI_SKIP_VERSION_CHECK`) |
| | - Added: Package gallery metadata, `bundledDependencies`, `peerDependencies` guidance |
