# Refrase

**Your prompts, upgraded.**

[![PyPI](https://img.shields.io/pypi/v/refrase)](https://pypi.org/project/refrase/)
[![npm](https://img.shields.io/npm/v/refrase)](https://www.npmjs.com/package/refrase)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/craigcerto/refrase/actions/workflows/test.yml/badge.svg)](https://github.com/craigcerto/refrase/actions/workflows/test.yml)

Refrase optimizes your AI prompts for specific models using research-backed, model-specific formatting rules. No LLM required — it's deterministic and instant.

## Why?

Most developers write one prompt and hope it works on every model. But models were trained on different data with different RLHF processes. Claude works best with XML tags. Qwen3 needs `/think` prefixes. Mistral's Magistral emits `[TOOL_CALLS]` markers that break JSON parsing. Refrase handles all of this automatically.

## Quick Start

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
# <role>
# You are a helpful data analyst.
# </role>
#
# <instructions>
# Extract all key metrics from the report.
# </instructions>
#
# <output_format>
# Return structured output matching the schema.
# </output_format>

print(result.changes)
# [Change(rule='xml-structure', description='Restructured prompt with XML tags', ...)]
```

### TypeScript

```bash
npm install refrase
```

```typescript
import { adapt } from "refrase";

const result = adapt({
  prompt: "You are a helpful data analyst. Extract all key metrics.",
  model: "claude-sonnet",
  task: "extraction",
});

console.log(result.system);
console.log(result.changes);
```

## Before / After

| Model | Before | After |
|---|---|---|
| **Claude Sonnet** | Plain text prompt | XML-tagged `<role>`, `<instructions>`, `<output_format>` |
| **Qwen3 32B** | No thinking directive | `/no_think` prefix + Tier 3 JSON reinforcement + English enforcement |
| **Magistral** | Standard prompt | Suppressed `[TOOL_CALLS]` and `[THINK]` markers + ultra-strong JSON-only |
| **GLM 4.7 Flash** | Verbose prompt | Simplified + nested object fix + English enforcement |
| **Nemotron 9B** | Full prompt | `/think` prefix + simplified to 3 steps + Tier 3 JSON reinforcement |

## Supported Models

11 model families, 39+ model variants:

| Family | Models | Key Adaptations |
|---|---|---|
| **Claude** | Sonnet, Opus, Haiku | XML tags, role extraction, Haiku simplification |
| **OpenAI** | GPT-4o, o1, o3 | Reasoning hints, grounding rules |
| **Gemini** | Pro, Flash, Ultra | Identity (baseline — no changes) |
| **Qwen** | 235B, 32B, Coder | Thinking mode, Tier 3 for 32B, English enforcement |
| **DeepSeek** | V3, V3.1, V3.2 | Self-verification, JSON reinforcement |
| **Mistral** | Large, Magistral, Devstral, Ministral | Marker suppression, type fixes, simplification |
| **Llama** | 405B, 70B, 8B, 3B | Grounding, small model simplification |
| **Kimi** | K2, K2.5 | Source grounding, English enforcement |
| **GLM** | 4.7, 4.7 Flash | Nested object fix, English, Flash simplification |
| **Nemotron** | 30B, 12B, 9B | Thinking mode, Tier 3 for small, simplification |
| **MiniMax** | M2 | Self-verification, contract-style |

## Task Types

| Task | When to Use |
|---|---|
| `extraction` | Pulling structured data from documents |
| `analysis` | Evaluating, comparing, or reasoning about data |
| `generation` | Creating content, writing, summarizing |
| `code` | Writing or reviewing code |
| `general` | Everything else (default) |

## MCP Server

```bash
npm install -g @refrase/mcp-server
```

Add to your MCP config:

```json
{
  "mcpServers": {
    "refrase": {
      "command": "refrase-mcp-server"
    }
  }
}
```

## Adding New Model Adapters

See [CONTRIBUTING.md](CONTRIBUTING.md) for a 5-step guide to adding support for new models.

## Research

Refrase's adaptation rules are derived from empirical testing across 46 model configurations on structured output tasks. Research paper coming soon.

## License

MIT
