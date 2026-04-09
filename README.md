<p align="center">
  <img src="assets/refrase-banner.png" alt="Refrase" width="280" />
</p>

<h1 align="center">Refrase</h1>

<p align="center">
  <strong>One prompt doesn't fit all models. Refrase fixes that.</strong>
</p>

<p align="center">
  <a href="https://refrase.cc/adapt">Try it live</a> &middot;
  <a href="https://refrase.cc">Website</a> &middot;
  <a href="https://refrase.cc/research">Research</a> &middot;
  <a href="https://refrase.cc/docs/extension">Browser Extension</a>
</p>

<p align="center">
  <a href="https://pypi.org/project/refrase/"><img src="https://img.shields.io/pypi/v/refrase" alt="PyPI" /></a>
  <a href="https://www.npmjs.com/package/refrase"><img src="https://img.shields.io/npm/v/refrase" alt="npm" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://github.com/craigcerto/fwip/actions/workflows/test.yml"><img src="https://github.com/craigcerto/fwip/actions/workflows/test.yml/badge.svg" alt="Tests" /></a>
</p>

---

Refrase restructures your prompts for the model you're actually using. Claude works best with XML tags. Qwen3 needs thinking-mode prefixes. Magistral emits markers that break your JSON. Every model has quirks — and we've researched all of them.

**No LLM. No API calls. No latency. Just better prompts.**

```bash
npm install refrase     # TypeScript/JavaScript
pip install refrase     # Python
```

```typescript
import { adapt } from "refrase";

const result = adapt({
  prompt: "You are a senior code reviewer. Review the code for bugs and security issues. Return findings as JSON.",
  model: "claude-sonnet",
});

console.log(result.system);
```

```xml
<role>
You are a senior code reviewer.
</role>

<instructions>
Review the code for bugs and security issues. Return findings as JSON.
</instructions>

<output_format>
Return structured output matching the schema.
</output_format>
```

Same prompt, different model:

```typescript
adapt({ prompt: same, model: "qwen3-32b", task: "extraction" });
// → /no_think
//   You are a senior code reviewer. Review the code for bugs...
//   CRITICAL OUTPUT RULES:
//   - Your ENTIRE response must be a single valid JSON object.
//   ...
//   IMPORTANT: All output must be in English.
```

```typescript
adapt({ prompt: same, model: "magistral-small" });
// → You are a senior code reviewer...
//   CRITICAL OUTPUT RULES:
//   - Do NOT include any thinking, reasoning, or [THINK] blocks.
//   - Do NOT prefix your response with [TOOL_CALLS] or any markers.
//   ...
```

Every model gets what it needs. Your prompt stays the same.

## How we know this works

We didn't guess. We read the official prompt engineering documentation from **every major model provider** — Anthropic, OpenAI, Google, Meta, Alibaba, DeepSeek, Mistral, Moonshot, Z.AI, NVIDIA, MiniMax. When a provider says "structure your prompts this way," that becomes a rule.

Then we tested it. **46 model configurations. 368 evaluation scenarios. Two independent judges. Cohen's kappa = 0.94.** The methodology, data, and findings are published at [refrase.cc/research](https://refrase.cc/research).

Every rule in this library traces to a verifiable source — an official doc URL or our benchmark data. No hand-waving.

## 38 models, 11 families

| Family | Models |
|---|---|
| **Claude** (Anthropic) | Sonnet 4.6, Opus 4.6, Haiku 4.5 |
| **GPT** (OpenAI) | GPT-4o, GPT-4o Mini, GPT-4, o1, o1 Mini, o3, o3 Mini |
| **Gemini** (Google) | 2.5 Pro, 2.5 Flash, Ultra |
| **Qwen** (Alibaba) | 235B, 32B, 32B NoThink, Coder |
| **DeepSeek** | V3, V3.1, V3.2 |
| **Mistral** | Large, Magistral, Devstral, Ministral 3B/8B/14B |
| **Llama** (Meta) | 3.1 405B/70B/8B, 3.2 3B |
| **Kimi** (Moonshot) | K2, K2.5 |
| **GLM** (Z.AI) | 4.7, 4.7 Flash |
| **Nemotron** (NVIDIA) | 30B, 12B, 9B |
| **MiniMax** | M2 |

Adding a model is editing a JSON file. [No code changes needed.](CONTRIBUTING.md)

## Use it everywhere

### In your code

```typescript
import { adapt, listModels } from "refrase";

// Adapt a prompt
const result = adapt({ prompt, model: "claude-sonnet", task: "extraction" });
// result.system  → adapted prompt
// result.changes → what changed and why, with evidence citations

// Explore models
const models = listModels(); // 38 models with name, family, provider

// Add your own models at runtime
import { registerModel } from "refrase";
registerModel("claude", "claude-my-finetune", { name: "My Claude", variant: "sonnet" });
```

```python
import refrase

result = refrase.adapt("Your prompt here", model="claude-sonnet", task="extraction")
print(result.system)
print(result.changes)
```

### In your browser

The [Refrase extension](https://refrase.cc/docs/extension) optimizes prompts right inside ChatGPT, Claude, Gemini — any AI chat. It auto-detects which model you're talking to.

<p align="center">
  <img src="assets/extension/02-popup-adapted.png" alt="Browser extension adapting a prompt for Claude" width="480" />
</p>

<p align="center">
  <img src="assets/extension/03-sidepanel-adapt.png" alt="Side panel with full adapter interface" width="480" />
</p>

### In Claude Desktop / Cursor (MCP)

```bash
npm install -g @refrase/mcp-server
```

```json
{ "mcpServers": { "refrase": { "command": "refrase-mcp-server" } } }
```

Three tools: `adapt_prompt`, `list_models`, `explain_adaptation`.

### On the web

[refrase.cc/adapt](https://refrase.cc/adapt) — paste a prompt, pick a model, see the transformation. No signup.

[refrase.cc/build](https://refrase.cc/build) — describe what you want in plain English. AI builds the optimal prompt for your target model.

## Under the hood

Refrase is config-driven. Every model's rules live in a JSON file:

```json
{
  "family": "claude",
  "provider": "Anthropic",
  "rules": [
    {
      "id": "claude-xml-wrap",
      "transform": "xml_wrap",
      "category": "model_specific",
      "description": "Restructured prompt with XML tags",
      "evidence": {
        "source": "Claude is trained to follow XML-tagged instructions",
        "url": "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags"
      }
    }
  ]
}
```

14 composable transforms (XML wrapping, thinking prefixes, JSON reinforcement, simplification, grounding, etc.) are mixed and matched per model. The engine reads the config, matches rules to your model and task, and applies transforms in sequence.

Both TypeScript and Python read the same configs and produce identical output — verified across all 190 model/task combinations.

```
refrase/
├── typescript/        # npm package
├── python/            # PyPI package
├── mcp-server/        # MCP server for Claude Desktop, Cursor
├── tests/             # 667 TS + 86 Python + 190 parity + 63 functional
└── .github/workflows/ # CI on Python 3.11-3.13 + Node 20
```

## Contributing

Adding a model = editing JSON. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
