<p align="center">
  <img src="https://raw.githubusercontent.com/craigcerto/refrase/main/assets/refrase-logo.png" alt="Refrase logo" width="120" />
</p>

<h1 align="center">Refrase</h1>

<p align="center">
  Model-specific prompt optimization for TypeScript and Python.
</p>

<p align="center">
  <a href="https://refrase.cc">Website</a>
  ·
  <a href="https://refrase.cc/enhance">Hosted app</a>
  ·
  <a href="https://www.npmjs.com/package/refrase">npm</a>
  ·
  <a href="https://pypi.org/project/refrase/">PyPI</a>
</p>

## What This Is

This repository contains the open-source Refrase libraries.

They run locally, make no LLM calls, and apply deterministic prompt transforms for different model families. Use this when you want model-aware prompt shaping inside your own code.

The hosted product at [refrase.cc](https://refrase.cc) is separate. It uses an LLM to rewrite prompts, powers the browser extension, and includes Quick and Guided modes.

## Install

TypeScript:

```bash
npm install refrase
```

Python:

```bash
pip install refrase
```

## TypeScript

```ts
import { adapt } from "refrase";

const result = adapt({
  prompt: "You are a senior code reviewer. Find bugs and security issues.",
  model: "claude-sonnet",
  task: "code",
});

console.log(result.system);
console.log(result.changes);
console.log(result.apiHints);
```

## Python

```python
import refrase

result = refrase.adapt(
    "You are a senior code reviewer. Find bugs and security issues.",
    model="claude-sonnet",
    task="code",
)

print(result.system)
print(result.changes)
print(result.api_hints)
```

## What It Does

- Adapts prompts for the conventions of specific model families.
- Adds model-specific structure such as XML sections, JSON reinforcement, language constraints, or reasoning-mode prefixes where appropriate.
- Returns a list of changes explaining what was modified and why.
- Provides API hints such as temperature or reasoning settings when the model config recommends them.
- Uses shared JSON configs for TypeScript and Python so both libraries stay in sync.

Supported families include Claude, OpenAI, Gemini, Qwen, DeepSeek, Mistral, Llama, Kimi, GLM, Nemotron, and MiniMax.

Use `listModels()` in TypeScript or `list_models()` in Python for the exact model IDs.

## Development

TypeScript:

```bash
cd typescript
npm install
npm test
```

Python:

```bash
cd python
pip install -e .
pytest
```

MCP server:

```bash
cd mcp-server
npm install
npm test
```

## License

[MIT](LICENSE)
