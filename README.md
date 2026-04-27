<p align="center">
  <img src="assets/refrase-banner.png" alt="Refrase" width="280" />
</p>

<h1 align="center">Refrase</h1>

<p align="center">
  <strong>Deterministic prompt transforms for 38 models, sourced from the official documentation of every provider.</strong>
  <br />
  <em>A small library that restructures your prompts the way each model was trained to read them. No LLM, no API calls, no latency.</em>
</p>

<p align="center">
  <a href="https://pypi.org/project/refrase/"><img src="https://img.shields.io/pypi/v/refrase" alt="PyPI" /></a>
  <a href="https://www.npmjs.com/package/refrase"><img src="https://img.shields.io/npm/v/refrase" alt="npm" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://github.com/craigcerto/refrase/actions/workflows/test.yml"><img src="https://github.com/craigcerto/refrase/actions/workflows/test.yml/badge.svg" alt="Tests" /></a>
  <a href="https://refrase.cc"><img src="https://img.shields.io/badge/website-refrase.cc-7c3aed" alt="Website" /></a>
</p>

<p align="center">
  <a href="https://refrase.cc">Website</a> · <a href="https://refrase.cc/enhance">Hosted enhancer</a> · <a href="https://refrase.cc/research">Research</a> · <a href="https://refrase.cc/docs/extension">Extension</a>
</p>

---

> ### 🟣 Library vs. hosted product
>
> This repo is the **open-source library**: deterministic, runs locally, no network calls. It applies prompt transforms based on each provider's official documentation.
>
> [**refrase.cc**](https://refrase.cc) is the **hosted product**: an LLM-powered enhancer (Claude Haiku on AWS Bedrock) with a Quick mode, a multi-turn Guided mode, and [paired-A/B research](https://refrase.cc/research) across three frontier models. The two are complementary — use the library when you want a free, deterministic, instant transform; use the hosted product when you want a model to *rewrite* your prompt.
>
> A v1.0 of this package will ship as a thin client for the hosted API. Until then, v0.x stays as the deterministic library.

<p align="center">
  <a href="https://refrase.cc/enhance">
    <img src="assets/demo.gif" alt="Refrase — same prompt, different optimizations for Claude, GPT-4o, Gemini Pro, and Llama" width="700" />
  </a>
</p>

## What this library does

Every model is trained to follow prompts a little differently. Claude was post-trained on XML-tagged instructions. Qwen3 surfaces thinking-mode markers. Mistral Magistral emits `[THINK]` and `[TOOL_CALLS]` markers that break downstream JSON parsers. Gemini 3 degrades quality below `temperature=1.0`.

Refrase reads the *official prompt-engineering documentation* from every major provider, distills the rules into 11 JSON config files, and applies them as 14 composable transforms. Same prompt in, model-appropriate prompt out — every rule has a citation back to the source it came from.

```bash
npm install refrase     # or: pip install refrase
```

## See it in action

Same prompt. Three models. Three completely different transforms.

**Your prompt:**
```
You are a senior code reviewer. Review the code for bugs and security issues. Return findings as JSON.
```

<table>
<tr>
<td><strong>Claude Sonnet</strong></td>
<td><strong>Qwen3 32B</strong></td>
<td><strong>Magistral</strong></td>
</tr>
<tr>
<td>

```xml
<role>
You are a senior code reviewer.
</role>

<instructions>
Review the code for bugs and
security issues. Return findings
as JSON.
</instructions>

<output_format>
Return structured output matching
the schema.
</output_format>
```

</td>
<td>

```
/no_think
You are a senior code reviewer.
Review the code for bugs and
security issues. Return findings
as JSON.

CRITICAL OUTPUT RULES:
- Your ENTIRE response must be a
  single valid JSON object.
- Do NOT include any text before
  or after the JSON.
...

IMPORTANT: All output must be in
English.
```

</td>
<td>

```
You are a senior code reviewer.
Review the code for bugs and
security issues. Return findings
as JSON.

CRITICAL OUTPUT RULES:
- Do NOT include any thinking,
  reasoning, or [THINK] blocks.
- Do NOT prefix your response
  with [TOOL_CALLS] or any
  markers.
...
```

</td>
</tr>
<tr>
<td>XML tags — Claude's native format (<a href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags">source</a>)</td>
<td>Thinking prefix + JSON lockdown + English enforcement (<a href="https://huggingface.co/Qwen/Qwen3-32B">source</a>)</td>
<td>Marker suppression — Magistral emits [THINK] and [TOOL_CALLS] that break parsing (<a href="https://docs.mistral.ai/capabilities/reasoning/native">source</a>)</td>
</tr>
</table>

<details>
<summary><strong>More examples: DeepSeek, Nemotron, Kimi, GLM…</strong></summary>

| Model | What Refrase does | Why |
|---|---|---|
| **DeepSeek V3** | Adds self-verification checklist | Tends to drop required fields ([docs](https://api-docs.deepseek.com/guides/json_mode)) |
| **Nemotron 9B** | `/think` prefix + simplified to 3 steps + strong JSON | Small model needs thinking mode + concise prompts |
| **Kimi K2** | Source grounding + English enforcement | K2 always reasons — needs explicit grounding. Multilingual model. |
| **GLM 4.7 Flash** | Simplified + nested-object fix + English | Nested object serialization bug + bilingual model |
| **Llama 3.1 8B** | Simplified + grounding rules | Small model prone to hallucination |
| **MiniMax M2** | Contract-style self-verification | Responds well to explicit verification checklists |

</details>

## Quick start

```typescript
import { adapt } from "refrase";

const result = adapt({
  prompt: "You are a data analyst. Extract key metrics from the quarterly report.",
  model: "claude-sonnet",
  task: "extraction",
});

result.system;   // → adapted prompt (XML tags, thinking prefixes, etc.)
result.changes;  // → what changed and why, with evidence citations
result.apiHints; // → recommended API params (temperature, max_tokens, etc.)
```

```python
import refrase

result = refrase.adapt(
    "You are a data analyst. Extract key metrics from the quarterly report.",
    model="claude-sonnet",
    task="extraction",
)
```

5 task types: `extraction` · `analysis` · `generation` · `code` · `general`

## Features

| | Feature | Description |
|---|---|---|
| 📄 | **Sourced from docs** | Every rule has a verifiable citation to the provider's official prompt-engineering documentation. |
| ⚡ | **Instant** | Pure functions, no LLM calls, no network. Sub-millisecond on a laptop. |
| 🏷️ | **Honestly labeled** | Each change is tagged `model_specific`, `best_practice`, or `compensation`. |
| 📋 | **API hints** | Tells you what API params to set (temperature, reasoning_effort, etc.) |
| 🔌 | **38 models** | 11 families: Claude, OpenAI, Gemini, Qwen, DeepSeek, Mistral, Llama, Kimi, GLM, Nemotron, MiniMax. |
| 🧩 | **Extensible** | Add models by editing JSON. Register custom families at runtime. |
| 🌐 | **Cross-platform** | TypeScript + Python with identical output, verified by parity tests. |
| 🖥️ | **MCP server** | Works in Claude Desktop, Cursor, and any MCP client. |

## Use it everywhere

<table>
<tr>
<td width="50%">

### 💻 In your code

```bash
npm install refrase
# or
pip install refrase
```

[Full API docs →](#api)

</td>
<td width="50%">

### 🌐 On the web

**[refrase.cc/enhance](https://refrase.cc/enhance)** — the hosted, LLM-powered enhancer. Quick mode rewrites your prompt; Guided mode asks targeted clarifying questions.

</td>
</tr>
<tr>
<td>

### 🧩 In Claude Desktop / Cursor

```bash
npm install -g @refrase/mcp-server
```

```json
{
  "mcpServers": {
    "refrase": {
      "command": "refrase-mcp-server"
    }
  }
}
```

</td>
<td>

### 🧭 In your browser

Auto-detects ChatGPT, Claude, Gemini. Optimizes prompts in any text field.

<a href="https://refrase.cc/docs/extension">
  <img src="assets/extension/02-popup-adapted.png" alt="Browser extension" width="360" />
</a>

</td>
</tr>
</table>

## 38 models supported

| Family | Provider | Models |
|---|---|---|
| **Claude** | Anthropic | Sonnet 4.6 · Opus 4.6 · Haiku 4.5 |
| **GPT** | OpenAI | GPT-4o · GPT-4o Mini · GPT-4 · o1 · o1 Mini · o3 · o3 Mini |
| **Gemini** | Google | 2.5 Pro · 2.5 Flash · Ultra |
| **Qwen** | Alibaba | 235B · 32B · 32B NoThink · Coder |
| **DeepSeek** | DeepSeek | V3 · V3.1 · V3.2 |
| **Mistral** | Mistral AI | Large · Magistral · Devstral · Ministral 3B/8B/14B |
| **Llama** | Meta | 3.1 405B/70B/8B · 3.2 3B |
| **Kimi** | Moonshot AI | K2 · K2.5 |
| **GLM** | Z.AI | 4.7 · 4.7 Flash |
| **Nemotron** | NVIDIA | 30B · 12B · 9B |
| **MiniMax** | MiniMax | M2 |

> **Adding a model = editing a JSON file.** No code changes. [See how →](CONTRIBUTING.md)

## Where the rules come from

Every transform in this library traces back to official, citable documentation:

- **Anthropic** — [Use XML tags](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags), [system prompts](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts)
- **OpenAI** — [Prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering), reasoning model API docs
- **Google** — Gemini prompt engineering best practices, temperature behaviour notes
- **Alibaba (Qwen)** — [Qwen3-32B model card](https://huggingface.co/Qwen/Qwen3-32B) for thinking-mode markers and JSON guidance
- **DeepSeek** — [JSON mode guide](https://api-docs.deepseek.com/guides/json_mode)
- **Mistral** — [Native reasoning docs](https://docs.mistral.ai/capabilities/reasoning/native) for marker behaviour
- **Moonshot AI**, **NVIDIA**, **Z.AI**, **Meta**, **MiniMax** — provider docs and model cards

If a rule doesn't have a verifiable source, it doesn't ship.

## Want LLM-powered enhancement instead?

If you'd rather have a model *rewrite* your prompt — taking a half-thought "write me an email about a delay" and turning it into a fully specified prompt with role, instructions, output format, and tone — that's what the hosted product at **[refrase.cc](https://refrase.cc)** does. It uses Claude Haiku 4.5 on AWS Bedrock, has Quick and multi-turn Guided modes, and is validated by paired-A/B research on three frontier models:

- **Claude Sonnet 4.6:** +15.4% quality (8/8 scenarios, p&lt;0.01)
- **Mistral Large 3:** +44.7% (6/8 wins, p≈0.06)
- **DeepSeek V3.2:** +4.7% (5/8 wins, n.s.)
- **Combined:** 19 of 24 paired comparisons favored the enhanced prompt (p≈0.003)

Full methodology, raw data, and limitations: **[refrase.cc/research](https://refrase.cc/research)**.

## API

<details>
<summary><strong>Core: adapt() and listModels()</strong></summary>

```typescript
import { adapt, listModels } from "refrase";

const result = adapt({
  prompt: "Your system prompt",
  model: "claude-sonnet",
  task: "extraction",       // optional, default: "general"
  userPrompt: "User input", // optional
});

// result.system    → adapted system prompt
// result.user      → adapted user prompt (or null)
// result.changes   → [{ rule, description, evidence, impact, category }]
// result.apiHints  → [{ parameter, value, reason }] (or undefined)
// result.modelId   → "claude-sonnet"
// result.modelFamily → "claude"

const models = listModels();
// → [{ id, family, variant, name, provider }, ...]
```

</details>

<details>
<summary><strong>Explore: getModelConfig(), getFamilyConfig(), listFamilies()</strong></summary>

```typescript
import { getModelConfig, getFamilyConfig, listFamilies } from "refrase";

getModelConfig("claude-sonnet");
// → { name: "Claude Sonnet 4.6", variant: "sonnet", family: "claude", provider: "Anthropic" }

getFamilyConfig("claude");
// → { family, provider, docs_url, models: {...}, rules: [...], api_hints: [...] }

listFamilies();
// → [{ family: "claude", provider: "Anthropic", modelCount: 3, ruleCount: 2 }, ...]
```

</details>

<details>
<summary><strong>Extend: registerModel(), registerFamily()</strong></summary>

```typescript
import { registerModel, registerFamily } from "refrase";

// Add a fine-tune to an existing family (inherits all rules)
registerModel("claude", "claude-my-finetune", { name: "My Claude", variant: "sonnet" });

// Register a completely new family
registerFamily({
  family: "my-model",
  provider: "My Company",
  models: { "my-model-v1": { name: "My Model", variant: "default" } },
  rules: [{
    id: "my-rule", transform: "json_reinforce", target: "system",
    category: "best_practice", description: "JSON compliance",
    impact: "Reliable structured output",
    when: { variants: ["all"], tasks: ["all"] }, params: { tier: "standard" },
  }],
});
```

</details>

## How it works

Config-driven. Every model's rules live in a JSON file, not code:

```json
{
  "family": "claude",
  "rules": [{
    "transform": "xml_wrap",
    "category": "model_specific",
    "evidence": {
      "source": "Claude is trained to follow XML-tagged instructions",
      "url": "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags"
    }
  }]
}
```

14 composable transforms get mixed and matched per model. The engine reads the config, matches rules to your model + task, and applies transforms in sequence. Both TypeScript and Python read the same configs.

## Contributing

Adding a model is just editing JSON. No code changes. See [CONTRIBUTING.md](CONTRIBUTING.md).

We also welcome new transforms, evidence citations, and bug reports. Check [open issues](https://github.com/craigcerto/refrase/issues) for good first contributions.

## Star history

If Refrase saves you time or makes your prompts better, **[give it a ⭐](https://github.com/craigcerto/refrase)**. It helps others find the project.

## License

[MIT](LICENSE) — use it however you want.
