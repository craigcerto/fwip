<p align="center">
  <img src="assets/refrase-banner.png" alt="Refrase" width="400" />
</p>

<h1 align="center">Refrase</h1>

<p align="center"><strong>Your prompts, upgraded.</strong></p>

[![PyPI](https://img.shields.io/pypi/v/refrase)](https://pypi.org/project/refrase/)
[![npm](https://img.shields.io/npm/v/refrase)](https://www.npmjs.com/package/refrase)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/craigcerto/refrase/actions/workflows/test.yml/badge.svg)](https://github.com/craigcerto/refrase/actions/workflows/test.yml)

Refrase optimizes your AI prompts for specific models using research-backed, model-specific rules. No LLM required — deterministic and instant.

Every rule traces to [official model documentation](#evidence) or our [46-model empirical evaluation](https://refrase.cc/research). Every rule is honestly labeled as `model_specific`, `best_practice`, or `compensation`.

## Why?

Models are trained differently. Claude handles XML tags natively. Qwen3 needs `/think` prefixes. Gemini 3 degrades below temperature 1.0. Magistral emits `[TOOL_CALLS]` markers that break JSON parsing.

Refrase knows these differences and handles them automatically.

## Quick Start

### TypeScript

```bash
npm install refrase
```

```typescript
import { adapt } from "refrase";

const result = adapt({
  prompt: "You are a helpful data analyst. Extract all key metrics from the report.",
  model: "claude-sonnet",
  task: "extraction",
});

console.log(result.system);
// <role>
// You are a helpful data analyst.
// </role>
//
// <instructions>
// Extract all key metrics from the report.
// </instructions>
//
// <output_format>
// Return structured output matching the schema.
// </output_format>

console.log(result.changes);
// [{ rule: "claude-xml-wrap", category: "model_specific", description: "...", evidence: "..." }]

console.log(result.apiHints);
// [{ parameter: "max_tokens", value: 8192, reason: "Claude requires explicit max_tokens" }]
```

### Python

```bash
pip install refrase
```

```python
import refrase

result = refrase.adapt(
    "You are a helpful data analyst. Extract all key metrics from the report.",
    model="claude-sonnet",
    task="extraction",
)

print(result.system)
print(result.changes)
print(result.api_hints)
```

## API

### Core

```typescript
// Adapt a prompt for a specific model
adapt({ prompt, model, task?, userPrompt? }) → AdaptResult

// List all supported models
listModels() → ModelEntry[]
```

### Model Exploration

```typescript
// Get config for a specific model (rules, evidence, family info)
getModelConfig("claude-sonnet") → { name, variant, family, provider, docsUrl, ... }

// Get full family config (all models + all rules)
getFamilyConfig("claude") → FamilyConfig

// List all families with summary info
listFamilies() → FamilyInfo[]
```

### Runtime Registration

```typescript
// Add a custom model to an existing family (inherits family rules)
registerModel("claude", "claude-custom", { name: "Custom Claude", variant: "sonnet" });

// Register a complete custom family with its own rules
registerFamily({
  family: "my-model",
  provider: "My Company",
  models: { "my-model-v1": { name: "My Model v1", variant: "default" } },
  rules: [
    {
      id: "my-rule",
      transform: "json_reinforce",
      target: "system",
      category: "best_practice",
      description: "Added JSON compliance instructions",
      impact: "More reliable structured output",
      when: { variants: ["all"], tasks: ["all"] },
      params: { tier: "standard" },
    },
  ],
});
```

## AdaptResult

```typescript
{
  system: string;           // Adapted system prompt
  user: string | null;      // Adapted user prompt (if provided)
  modelId: string;          // Target model ID
  modelFamily: string;      // Model family (claude, openai, etc.)
  changes: Change[];        // What was changed, with evidence and category
  apiHints?: ApiHint[];     // Recommended API parameters for this model
}
```

### Changes (honestly labeled)

Each change includes a `category` indicating why it was applied:

| Category | Meaning | Example |
|---|---|---|
| `model_specific` | Documented by the model provider | Claude XML tags, Qwen `/think` prefix |
| `best_practice` | General technique that helps this model | JSON reinforcement for models without native schema |
| `compensation` | Addresses a known model weakness | DeepSeek field verification, GLM nested object fix |

### API Hints

Recommended API parameters that can't be applied via prompt text:

```typescript
// Example: Qwen3
{ parameter: "temperature", value: 0.6, reason: "Greedy decoding causes endless repetitions" }

// Example: Gemini 3
{ parameter: "temperature", value: 1.0, reason: "Values below 1.0 cause degradation" }

// Example: OpenAI o-series
{ parameter: "reasoning_effort", value: "medium", reason: "Controls internal reasoning depth" }
```

## Supported Models

11 families, 38 models:

| Family | Models | Key Adaptations |
|---|---|---|
| **Claude** | Sonnet 4.6, Opus 4.6, Haiku 4.5 | XML tags, role extraction, Haiku simplification |
| **OpenAI** | GPT-4o, GPT-4o Mini, GPT-4, o1, o3 | Grounding rules, reasoning hints, JSON reinforcement |
| **Gemini** | 2.5 Pro, 2.5 Flash, Ultra | API hint: temperature must stay 1.0 |
| **Qwen** | 235B, 32B, 32B NoThink, Coder | `/think` `/no_think` control, English enforcement, strong JSON for 32B |
| **DeepSeek** | V3, V3.1, V3.2 | Self-verification, JSON reinforcement |
| **Mistral** | Large, Magistral, Devstral, Ministral 3B/8B/14B | Marker suppression, type fixes, small model simplification |
| **Llama** | 3.1 405B/70B/8B, 3.2 3B | Grounding, small model simplification |
| **Kimi** | K2, K2.5 | Source grounding (K2), English enforcement |
| **GLM** | 4.7, 4.7 Flash | Nested object fix, English enforcement, Flash simplification |
| **Nemotron** | 30B, 12B, 9B | Thinking mode, strong JSON for small, simplification |
| **MiniMax** | M2 | Self-verification |

## Architecture

Refrase is **config-driven**. Every model's behavior is defined in a JSON config file, not code.

```
configs/
├── claude.json       # Rules, evidence, API hints for all Claude models
├── openai.json       # Rules for GPT-4o, o1, o3, etc.
├── gemini.json       # API hints (temperature = 1.0)
├── qwen.json         # /think prefixes, English enforcement, etc.
└── ...               # 11 families total

transforms/           # 14 composable pure functions
├── xml_wrap          # Claude XML structuring
├── thinking_prefix   # Qwen/Nemotron /think control
├── json_reinforce    # Standard or strong JSON compliance
├── simplify          # Small model prompt reduction
├── grounding         # Anti-hallucination rules
└── ...               # 14 transforms total
```

**Adding a model** = editing a JSON file. No code changes needed.

**Updating a rule** = editing a JSON file. Both Python and TypeScript reflect the change immediately.

## Evidence

Every rule links to its source:

| Source Type | Example |
|---|---|
| **Official docs** | [Anthropic XML tags guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags) |
| **Model cards** | [Qwen3 32B — HuggingFace](https://huggingface.co/Qwen/Qwen3-32B) |
| **API docs** | [DeepSeek JSON mode](https://api-docs.deepseek.com/guides/json_mode) |
| **Empirical eval** | [Refrase 46-model benchmark](https://refrase.cc/research) |

## Task Types

| Task | When to Use |
|---|---|
| `extraction` | Pulling structured data from documents |
| `analysis` | Evaluating, comparing, or reasoning about data |
| `generation` | Creating content, writing, summarizing |
| `code` | Writing or reviewing code |
| `general` | Everything else (default) |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — adding a new model is just adding entries to a JSON config file.

## Research

Refrase's adaptation rules are derived from:
1. **Official model documentation** from every provider (Anthropic, OpenAI, Google, Meta, Alibaba, etc.)
2. **Empirical testing** across 46 model configurations on structured output tasks with dual-judge evaluation (Cohen's kappa = 0.94)

Read the full methodology at [refrase.cc/research](https://refrase.cc/research).

## License

MIT
