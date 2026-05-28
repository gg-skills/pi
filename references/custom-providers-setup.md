# Pi Coding Agent — Custom Provider Setup

**Source:** Live provider API discovery + `~/.pi/agent/models.json`.

> **Multi-agent setup:** This repo uses purpose-specific agents in `~/.pi/agents/`.
> See `~/.pi/agents/README.md` for the full agent catalogue.

This file covers the four providers in the active config, in resolution priority order:
[minimax (overridden)](#1-minimax-overridden--unlimited),
[kimi-for-coding](#2-kimi-for-coding-limited),
[zai](#3-zai),
[nvidia](#4-nvidia).

**Naming convention:** `PREFIX/ModelName [size]/[context] [tags]`

| Prefix | Provider (in `settings.json`) | Note |
|--------|------|-----|
| `MMX/` | `minimax/*` | Overrides built-in `minimax` provider |
| `K4C/` | `kimi-for-coding/*` | Limited usage — use sparingly |
| `ZAI/` | `zai/*` | Secondary fallback |
| `NV/` | `nvidia/*` | Opportunistic use |

Capability tags: `[R]` reasoning · `[C]` coding-specialized · `[V]` vision · `[HS]` highspeed.

Size/context brackets: `[174B]/[1M]`, `[128K]`, `[262K]`, `[131K]`, etc.

---

## Architecture: Why `minimax` is overridden

The built-in `minimax` provider (`defaultModelPerProvider` entry: `minimax → MiniMax-M2.7`)
is overridden in `models.json` to route to `minimax-coding-plan`'s API endpoint
(`https://api.minimaxi.chat/v1`). This means:

- `defaultProvider: "minimax"` + `defaultModel: "MiniMax-M2.7-highspeed"` uses our unlimited endpoint
- The fallback chain (built-in provider iteration) automatically covers: `minimax` → `moonshotai` → `zai` → `deepseek` → other built-ins
- `minimax-coding-plan` is NOT used as a provider name in `settings.json` — use `minimax` instead

---

## 1. MiniMax (overridden — unlimited)

**Endpoint:** `https://api.minimaxi.chat/v1` (OpenAI-compatible)
**API key:** Hard-coded in `~/.pi/agent/models.json`
**Settings prefix:** `MMX/` · Provider name in `enabledModels`: `minimax/`
**How to query:**
```bash
curl -s -H "Authorization: Bearer <key>" "https://api.minimaxi.chat/v1/models"
```

| Model ID (for `enabledModels`) | Display Name | Context | Tags |
|----------|-------------|---------|------|
| `minimax/MiniMax-M2.7-highspeed` | `MMX/MiniMax-M2.7-Highspeed [174B]/[1M] [R][HS]` | 1M | `[R][HS]` |
| `minimax/MiniMax-M2.7` | `MMX/MiniMax-M2.7 [174B]/[1M] [R]` | 1M | `[R]` |
| `minimax/MiniMax-M2.5-highspeed` | `MMX/MiniMax-M2.5-Highspeed [76B]/[1M] [R][HS]` | 1M | `[R][HS]` |
| `minimax/MiniMax-M2.5` | `MMX/MiniMax-M2.5 [76B]/[1M] [R]` | 1M | `[R]` |
| `minimax/MiniMax-M2.1-highspeed` | `MMX/MiniMax-M2.1-Highspeed [43B]/[1M] [R][HS]` | 1M | `[R][HS]` |
| `minimax/MiniMax-M2.1` | `MMX/MiniMax-M2.1 [43B]/[1M] [R]` | 1M | `[R]` |
| `minimax/MiniMax-M2` | `MMX/MiniMax-M2 [20B]/[1M] [R]` | 1M | `[R]` |

**Model selection guide:**
- Default / complex tasks: `MiniMax-M2.7-Highspeed` — best quality + unlimited
- Fast iteration / review: `MiniMax-M2.5-Highspeed` or `MiniMax-M2.1-Highspeed`
- Large codebase context (1M token): any MiniMax model

---

## 2. Kimi for Coding (limited)

**Endpoint:** `https://api.kimi.com/coding/v1` (OpenAI-compatible)
**API key:** Hard-coded in `~/.pi/agent/models.json`
**Settings prefix:** `K4C/` · Provider name in `enabledModels`: `kimi-for-coding`
**How to query:**
```bash
curl -s -H "Authorization: Bearer <key>" "https://api.kimi.com/coding/v1/models"
```

| Model ID | Display Name | Context | Tags |
|----------|-------------|---------|------|
| `kimi-for-coding/kimi-for-coding` | `K4C/Kimi-K2.6 [262K] [R][C][V]` | 262K | `[R][C][V]` |

**Note:** Usage is limited. Prefer `NV/Kimi-K2.6` on NVIDIA for the same model
with more generous limits. Kimi for Coding is the only route if NVIDIA is unavailable.

---

## 3. ZAI

**Endpoint:** `https://open.bigmodel.cn/api/paas/v4` (OpenAI-compatible)
**API key:** Hard-coded in `~/.pi/agent/models.json`
**Settings prefix:** `ZAI/` · Provider name in `enabledModels`: `zai/`
**How to query:**
```bash
curl -s -H "Authorization: Bearer <key>" "https://open.bigmodel.cn/api/paas/v4/models"
```

| Model ID | Display Name | Context | Tags |
|----------|-------------|---------|------|
| `zai/glm-5-turbo` | `ZAI/GLM-5-Turbo [128K] [R][HS]` | 128K | `[R][HS]` |
| `zai/glm-5` | `ZAI/GLM-5 [128K] [R]` | 128K | `[R]` |
| `zai/glm-4.7-flash` | `ZAI/GLM-4.7-Flash [128K] [HS]` | 128K | `[HS]` |
| `zai/glm-4.7` | `ZAI/GLM-4.7 [128K]` | 128K | — |
| `zai/glm-4.6v` | `ZAI/GLM-4.6V [128K] [V]` | 128K | `[V]` |
| `zai/glm-4.6` | `ZAI/GLM-4.6 [128K]` | 128K | — |
| `zai/glm-4.5-air` | `ZAI/GLM-4.5-Air [128K] [HS]` | 128K | `[HS]` |
| `zai/glm-4.5` | `ZAI/GLM-4.5 [128K]` | 128K | — |

---

## 4. NVIDIA

**Endpoint:** `https://integrate.api.nvidia.com/v1` (OpenAI-compatible)
**API key:** Hard-coded in `~/.pi/agent/models.json`
**Settings prefix:** `NV/` · Provider name in `enabledModels`: `nvidia/`
**How to query:**
```bash
curl -s -H "Authorization: Bearer <key>" "https://integrate.api.nvidia.com/v1/models" | jq -r '.data[].id' | sort
```

NVIDIA has 100+ models. Use as an opportunistic provider when MiniMax/ZAI are unavailable
or for specialized models not available elsewhere. Re-query periodically.

### Top-tier / Reasoning (frontier fallbacks)

| Model ID | Display Name | Context | Tags |
|----------|-------------|---------|------|
| `nvidia/moonshotai/kimi-k2.6` | `NV/Kimi-K2.6 [262K] [R][C]` | 262K | `[R][C]` |
| `nvidia/moonshotai/kimi-k2-thinking` | `NV/Kimi-K2-Thinking [131K] [R][C]` | 131K | `[R][C]` |
| `nvidia/deepseek-ai/deepseek-v4-pro` | `NV/DeepSeek-V4-Pro [1M] [R][C]` | 1M | `[R][C]` |
| `nvidia/deepseek-ai/deepseek-v4-flash` | `NV/DeepSeek-V4-Flash [1M] [R][HS]` | 1M | `[R][HS]` |

### Coding-specialized

| Model ID | Display Name | Context | Tags |
|----------|-------------|---------|------|
| `nvidia/qwen/qwen3-coder-480b-a35b-instruct` | `NV/Qwen3-Coder-480B-A35B [262K] [R][C]` | 262K | `[R][C]` |
| `nvidia/mistralai/devstral-2-123b-instruct-2512` | `NV/Devstral-2-123B [262K] [C]` | 262K | `[C]` |
| `nvidia/mistralai/codestral-22b-instruct-v0.1` | `NV/Codestral-22B [131K] [C]` | 131K | `[C]` |
| `nvidia/meta/codellama-70b` | `NV/CodeLLaMA-70B [131K] [C]` | 131K | `[C]` |
| `nvidia/google/codegemma-7b` | `NV/CodeGemma-7B [131K] [C]` | 131K | `[C]` |
| `nvidia/bigcode/starcoder2-15b` | `NV/StarCoder2-15B [131K] [C]` | 131K | `[C]` |
| `nvidia/microsoft/phi-4-mini-instruct` | `NV/Phi-4-Mini-4B [131K] [C]` | 131K | `[C]` |

### Multimodal (vision)

| Model ID | Display Name | Context | Tags |
|----------|-------------|---------|------|
| `nvidia/meta/llama-3.2-90b-vision-instruct` | `NV/Llama-3.2-Vision-90B [131K] [V]` | 131K | `[V]` |
| `nvidia/meta/llama-3.2-11b-vision-instruct` | `NV/Llama-3.2-Vision-11B [131K] [V]` | 131K | `[V]` |
| `nvidia/microsoft/phi-4-multimodal-instruct` | `NV/Phi-4-Multimodal-14B [131K] [V]` | 131K | `[V]` |

### General-purpose

| Model ID | Display Name | Context | Tags |
|----------|-------------|---------|------|
| `nvidia/meta/llama-4-maverick-17b-128e-instruct` | `NV/Llama-4-Maverick-17B [131K]` | 131K | — |
| `nvidia/meta/llama-3.3-70b-instruct` | `NV/Llama-3.3-70B [131K]` | 131K | — |
| `nvidia/meta/llama-3.1-405b-instruct` | `NV/Llama-3.1-405B [131K]` | 131K | — |
| `nvidia/meta/llama-3.1-70b-instruct` | `NV/Llama-3.1-70B [131K]` | 131K | — |
| `nvidia/mistralai/mistral-large-3-675b-instruct-2512` | `NV/Mistral-Large-3-675B [131K]` | 131K | — |
| `nvidia/mistralai/mistral-large-2-instruct` | `NV/Mistral-Large-2 [131K]` | 131K | — |
| `nvidia/mistralai/mixtral-8x22b-instruct-v0.1` | `NV/Mixtral-8x22B [131K]` | 131K | — |
| `nvidia/qwen/qwen3.5-122b-a10b` | `NV/Qwen-3.5-122B [131K]` | 131K | — |
| `nvidia/openai/gpt-oss-120b` | `NV/GPT-OSS-120B [131K]` | 131K | — |
| `nvidia/z-ai/glm-5.1` | `NV/ZAI-GLM-5.1 [128K] [R]` | 128K | `[R]` |
| `nvidia/minimaxai/minimax-m2.7` | `NV/MiniMax-M2.7 [174B]/[1M] [R]` | 1M | `[R]` |
| `nvidia/minimaxai/minimax-m2.5` | `NV/MiniMax-M2.5 [76B]/[1M] [R]` | 1M | `[R]` |

---

## Default Configuration

The active `settings.json` uses:

```json
{
  "defaultProvider": "minimax",
  "defaultModel": "MiniMax-M2.7-highspeed",
  "defaultThinkingLevel": "medium",
  "retry": {
    "enabled": true,
    "maxRetries": 3,
    "baseDelayMs": 2000
  }
}
```

**Resolution priority:** `defaultProvider` + `defaultModel` (explicit) → fallback chain
(iterates built-in providers in `defaultModelPerProvider` order: `minimax` → `moonshotai` → `zai` → `deepseek` → ...).
Since `minimax` is overridden to our endpoint, it is tried first.

---

## API Key Management

API keys are hard-coded directly in `~/.pi/agent/models.json`. Do not reference external
auth files. To rotate: update the `apiKey` field, then `/reload` in the TUI.

**Never commit `models.json` to version control with real keys.**
