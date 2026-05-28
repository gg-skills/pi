# Pi Coding Agent — Custom Models Configuration

**Source:** https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/docs/models.md

Add custom providers and models (Ollama, vLLM, LM Studio, proxies) via `~/.pi/agent/models.json`.
The file hot-reloads each time you open `/model` — no restart needed.

---

## Minimal Example

For local models (Ollama, LM Studio, vLLM), only `id` is required per model:

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "models": [
        { "id": "llama3.1:8b" },
        { "id": "qwen2.5-coder:7b" }
      ]
    }
  }
}
```

The `apiKey` is required but Ollama ignores it; any value works.

For OpenAI-compatible servers that don't understand the `developer` role or `reasoning_effort`,
set `compat` flags:

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
      "models": [
        { "id": "gpt-oss:20b", "reasoning": true }
      ]
    }
  }
}
```

`compat` can be set at the provider level (applies to all models) or per-model to override.

## Full Example

Override defaults when you need specific values:

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "models": [
        {
          "id": "llama3.1:8b",
          "name": "Llama 3.1 8B (Local)",
          "reasoning": false,
          "input": ["text"],
          "contextWindow": 128000,
          "maxTokens": 32000,
          "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
        }
      ]
    }
  }
}
```

---

## Supported APIs

| API | Use for |
|-----|---------|
| `openai-completions` | OpenAI Chat Completions (most compatible) |
| `openai-responses` | OpenAI Responses API |
| `anthropic-messages` | Anthropic Messages API |
| `google-generative-ai` | Google Generative AI |

Set `api` at provider level (default for all models) or model level (per-model override).

---

## Provider Configuration

| Field | Description |
|-------|-------------|
| `baseUrl` | API endpoint URL |
| `api` | API type (see table above) |
| `apiKey` | API key (see Value Resolution below) |
| `headers` | Custom headers (see Value Resolution below) |
| `authHeader` | Set `true` to add `Authorization: Bearer` automatically |
| `models` | Array of model configurations |
| `modelOverrides` | Per-model overrides for built-in models on this provider |

### Value Resolution

`apiKey` and `headers` fields support three formats:

- **Shell command:** `"!command"` — executes and uses stdout
  ```json
  "apiKey": "!security find-generic-password -ws 'anthropic'"
  "apiKey": "!op read 'op://vault/item/credential'"
  ```
- **Environment variable:** uses the value of the named variable
  ```json
  "apiKey": "MY_API_KEY"
  ```
- **Literal value:** used directly
  ```json
  "apiKey": "sk-..."
  ```

### Custom Headers

```json
{
  "providers": {
    "custom-proxy": {
      "baseUrl": "https://proxy.example.com/v1",
      "apiKey": "MY_API_KEY",
      "api": "anthropic-messages",
      "headers": {
        "x-portkey-api-key": "PORTKEY_API_KEY",
        "x-secret": "!op read 'op://vault/item/secret'"
      },
      "models": [...]
    }
  }
}
```

---

## Model Configuration

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `id` | Yes | — | Model identifier (passed to the API) |
| `name` | No | `id` | Human-readable label; used for `--model` matching and status text |
| `api` | No | provider's `api` | Override provider's API for this model |
| `reasoning` | No | `false` | Supports extended thinking |
| `input` | No | `["text"]` | Input types: `["text"]` or `["text", "image"]` |
| `contextWindow` | No | `128000` | Context window size in tokens |
| `maxTokens` | No | `16384` | Maximum output tokens |
| `cost` | No | all zeros | `{"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0}` (per million tokens) |
| `compat` | No | provider `compat` | OpenAI compatibility overrides |

---

## Overriding Built-in Providers

Route a built-in provider through a proxy without redefining models:

```json
{
  "providers": {
    "anthropic": {
      "baseUrl": "https://my-proxy.example.com/v1"
    }
  }
}
```

All built-in Anthropic models remain available. Existing OAuth or API key auth continues to work.

To merge custom models into a built-in provider, include a `models` array. Merge semantics:
- Built-in models are kept.
- Custom models are upserted by `id`.
- A custom model `id` matching a built-in `id` replaces it; a new `id` is added alongside.

---

## Per-model Overrides

Use `modelOverrides` to customize specific built-in models without replacing the provider's full model list.

```json
{
  "providers": {
    "openrouter": {
      "modelOverrides": {
        "anthropic/claude-sonnet-4": {
          "name": "Claude Sonnet 4 (Bedrock Route)",
          "compat": {
            "openRouterRouting": {
              "only": ["amazon-bedrock"]
            }
          }
        }
      }
    }
  }
}
```

`modelOverrides` supports these fields per model: `name`, `reasoning`, `input`, `cost` (partial),
`contextWindow`, `maxTokens`, `headers`, `compat`. Unknown model IDs are silently ignored.

---

## OpenAI Compatibility

For providers with partial OpenAI compatibility, use the `compat` field at provider or model level:

```json
{
  "providers": {
    "local-llm": {
      "baseUrl": "http://localhost:8080/v1",
      "api": "openai-completions",
      "compat": {
        "supportsUsageInStreaming": false,
        "maxTokensField": "max_tokens"
      },
      "models": [...]
    }
  }
}
```

| Field | Description |
|-------|-------------|
| `supportsStore` | Provider supports `store` field |
| `supportsDeveloperRole` | Use `developer` vs `system` role |
| `supportsReasoningEffort` | Support for `reasoning_effort` parameter |
| `reasoningEffortMap` | Map pi thinking levels to provider-specific `reasoning_effort` values |
| `supportsUsageInStreaming` | Supports `stream_options: { include_usage: true }` (default: `true`) |
| `maxTokensField` | Use `max_completion_tokens` or `max_tokens` |
| `requiresToolResultName` | Include `name` on tool result messages |
| `requiresAssistantAfterToolResult` | Insert an assistant message before a user message after tool results |
| `requiresThinkingAsText` | Convert thinking blocks to plain text |
| `thinkingFormat` | Use `reasoning_effort`, `zai`, `qwen`, or `qwen-chat-template` |
| `supportsStrictMode` | Include the `strict` field in tool definitions |
| `openRouterRouting` | OpenRouter routing config for model/provider selection |
| `vercelGatewayRouting` | Vercel AI Gateway routing config (`only`, `order`) |

`qwen` uses top-level `enable_thinking`. Use `qwen-chat-template` for local Qwen-compatible
servers that require `chat_template_kwargs.enable_thinking`.

### OpenRouter Example

```json
{
  "providers": {
    "openrouter": {
      "baseUrl": "https://openrouter.ai/api/v1",
      "apiKey": "OPENROUTER_API_KEY",
      "api": "openai-completions",
      "models": [
        {
          "id": "openrouter/anthropic/claude-3.5-sonnet",
          "name": "OpenRouter Claude 3.5 Sonnet",
          "compat": {
            "openRouterRouting": {
              "order": ["anthropic"],
              "fallbacks": ["openai"]
            }
          }
        }
      ]
    }
  }
}
```

### Vercel AI Gateway Example

```json
{
  "providers": {
    "vercel-ai-gateway": {
      "baseUrl": "https://ai-gateway.vercel.sh/v1",
      "apiKey": "AI_GATEWAY_API_KEY",
      "api": "openai-completions",
      "models": [
        {
          "id": "moonshotai/kimi-k2.5",
          "name": "Kimi K2.5 (Fireworks via Vercel)",
          "reasoning": true,
          "input": ["text", "image"],
          "cost": { "input": 0.6, "output": 3, "cacheRead": 0, "cacheWrite": 0 },
          "contextWindow": 262144,
          "maxTokens": 262144,
          "compat": {
            "vercelGatewayRouting": {
              "only": ["fireworks", "novita"],
              "order": ["fireworks", "novita"]
            }
          }
        }
      ]
    }
  }
}
```

---

## Model Management: Two-File System

Pi separates model management into two concerns:

| File | Purpose | Location (project) | Location (global) |
|------|---------|-------------------|------------------|
| `models.json` | Provider definitions (baseUrl, apiKey, model list) | `.pi/models.json` | `~/.pi/agent/models.json` |
| `settings.json` | `enabledModels` patterns for Ctrl+P cycling | `.pi/settings.json` | `~/.pi/agent/settings.json` |

**Key principle:** `models.json` defines *what actually works* (credentials, endpoints, model IDs). `settings.json` / `enabledModels` defines *what appears in the model picker*. If a model is in `enabledModels` but not registered in any provider (built-in or custom), pi logs a "No models match pattern" warning at startup.

---

## Discovering Available Models via API

**Always query the provider's API directly** instead of relying on stale config or documentation. Model availability changes frequently.

### Step 1 — Find your API key

For providers configured with shell-command resolution in `models.json`:

```bash
# Example: read key from kilo's auth store
KEY=$(jq -r '."minimax-coding-plan".key' ~/.local/share/kilo/auth.json)
```

### Step 2 — Query the provider's `/models` endpoint

Most providers follow the OpenAI `/models` convention:

```bash
# MiniMax (direct)
curl -s -H "Authorization: Bearer $KEY" "https://api.minimaxi.chat/v1/models" \
  | jq -r '.data[].id' | sort

# NVIDIA
curl -s -H "Authorization: Bearer $KEY" "https://integrate.api.nvidia.com/v1/models" \
  | jq -r '.data[].id' | sort

# OpenAI-compatible proxies (e.g. Ollama, vLLM, Cloudflare AI Gateway)
curl -s -H "Authorization: Bearer $KEY" "https://your-proxy/v1/models" \
  | jq -r '.data[].id // .models[].id' | sort
```

### Step 3 — Register discovered models in `models.json`

Add or update the provider's `models` array with the IDs returned by the API:

```json
{
  "providers": {
    "my-provider": {
      "baseUrl": "https://api.provider.io/v1",
      "api": "openai-completions",
      "apiKey": "sk-your-key-here",
      "compat": {
        "supportsDeveloperRole": false,
        "supportsReasoningEffort": false
      },
      "models": [
        { "id": "model-id-from-api", "name": "Human Name", "reasoning": true, "input": ["text"], "contextWindow": 262144, "maxTokens": 131072 }
      ]
    }
  }
}
```

> **Note:** Model IDs must match exactly what the provider's API returns. A single-character mismatch (e.g., `MiniMax-M2.5` vs `minimax-m2.5`) will cause a runtime error.
>
> **Recommended naming convention for `name`:** Prefix every model with a short provider shorthand to distinguish same-model families across providers. Suggested format: `PREFIX/ModelName [Size]/[Context] [capability emoji]`.
>
> **Provider shorthands:** `MMX` = minimax (overridden to minimax-coding-plan endpoint), `NV` = nvidia, `ZAI` = zai, `K4C` = kimi-for-coding.
>
> **Capability tags:** `[R]` reasoning / extended thinking · `[C]` coding-specialized · `[V]` vision (image input) · `[HS]` highspeed / fast variant.
>
> **Naming convention for `name`:** `PREFIX/ModelName [size]/[context] [tags]`.
> Provider prefix: `MMX/` minimax-coding-plan · `NV/` nvidia · `ZAI/` zai · `K4C/` kimi-for-coding.
> Model name uses full capitalization per family (e.g. `MiniMax-M2.7`, `DeepSeek-V4-Pro`, `Qwen3-Coder`, `Codestral`, `CodeLLaMA`, `Gemma-3`). Brackets around size and context: `[174B]/[1M]`, `[128K]`, `[262K]`, `[131K]`.
>
> **API key format:** Hard-code the key directly as a string value. Do not use shell-command resolution (`!jq ...`) referencing external auth files — those files can be deleted or moved, breaking all providers. Instead, paste the key directly:
>
> ```json
> "apiKey": "sk-cp-..."
> ```
>
> Example full entry: `"name": "MMX/MiniMax-M2.7 [174B]/[1M] [R][HS]"` for MiniMax-M2.7-Highspeed via the overridden `minimax` provider.
>
> The `name` field is entirely user-controlled — it controls what appears in the Ctrl+P model picker and status line. Keep names concise; the full model ID is what actually gets sent to the API.

---

## Enabling Models for the Model Picker (Ctrl+P)

The `enabledModels` array in `settings.json` controls which models appear in the Ctrl+P cycling list. Patterns support wildcards (`*`).

### Locations

- **Project-level:** `.pi/settings.json` (takes precedence over global for this project)
- **Global:** `~/.pi/agent/settings.json` (fallback for all projects)

### Format

Model patterns use `provider/modelId` notation. If no `/` is present, pi searches all providers.

```json
{
  "defaultProvider": "minimax-coding-plan",
  "defaultModel": "MiniMax-M2.7-highspeed",
  "defaultThinkingLevel": "medium",
  "enabledModels": [
    "zai/glm-5-turbo",
    "minimax-coding-plan/MiniMax-M2.7-highspeed",
    "minimax-coding-plan/MiniMax-M2.7",
    "nvidia/moonshotai/kimi-k2.6",
    "anthropic/*",
    "openai/*"
  ]
}
```

### Common pitfalls

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Model ID has wrong casing | `"No models match pattern"` warning at startup | Query the API to get the exact ID (e.g., `MiniMax-M2.7-highspeed`, not `minimax-m2.7-highspeed`) |
| Provider name doesn't exist | `"No models match pattern"` warning at startup | Verify the provider is registered in `models.json` or is a built-in pi provider |
| Model ID doesn't match API | Runtime error when switching to that model | Query the provider's `/models` endpoint and use the exact returned ID |
| Custom provider uses `minimax` instead of `minimax-coding-plan` | Works in global but not project | Ensure the provider name in `models.json` matches the pattern used in `enabledModels` |

### Verifying enabled models

When pi starts, it prints loaded models. If a pattern in `enabledModels` doesn't match any known model, it logs:

```
Warning: No models match pattern "provider/model-id"
```

To verify a specific model is registered, switch to it with `/model provider/model-id` in the TUI — if it fails, the pattern doesn't match any known model.
