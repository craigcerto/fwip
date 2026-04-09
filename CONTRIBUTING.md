# Contributing to Refrase

Thank you for your interest in contributing! Refrase uses a config-driven architecture — most contributions are just JSON edits.

## Adding a New Model (to an existing family)

**Time: 2 minutes. No code changes.**

Edit the family's config JSON at `typescript/src/configs/{family}.json`:

```json
{
  "models": {
    "existing-model": { ... },
    "your-new-model": {
      "name": "Display Name",
      "variant": "variant-id",
      "tier": "flagship"
    }
  }
}
```

Then sync to Python: `./scripts/sync-configs.sh`

The new model inherits all family rules. Done.

## Adding a New Model Family (3 steps)

### 1. Create the config file

Create `typescript/src/configs/yourfamily.json`:

```json
{
  "family": "yourfamily",
  "provider": "Provider Name",
  "docs_url": "https://docs.provider.com/prompt-engineering",
  "models": {
    "yourmodel-large": { "name": "YourModel Large", "variant": "large", "tier": "flagship" },
    "yourmodel-small": { "name": "YourModel Small", "variant": "small", "tier": "fast" }
  },
  "rules": [
    {
      "id": "yourfamily-json-reinforce",
      "transform": "json_reinforce",
      "target": "system",
      "category": "best_practice",
      "description": "Added JSON output compliance instructions",
      "impact": "More reliable structured output",
      "when": { "variants": ["all"], "tasks": ["all"] },
      "params": { "tier": "standard" },
      "evidence": {
        "source": "Explicit JSON instructions improve schema adherence"
      }
    }
  ],
  "api_hints": []
}
```

**Rule categories** (be honest):
- `model_specific` — Documented by the provider (link to docs)
- `best_practice` — General technique applied because it helps this model
- `compensation` — Addresses a known model weakness

### 2. Register the config

Add the import to `typescript/src/configs/index.ts`:

```typescript
import yourfamily from "./yourfamily.json" with { type: "json" };

export const CONFIGS: Record<string, FamilyConfig> = {
  // ... existing ...
  yourfamily: yourfamily as unknown as FamilyConfig,
};
```

Add `"yourfamily"` to the `ModelFamily` type in `typescript/src/types.ts`.

### 3. Sync and test

```bash
./scripts/sync-configs.sh     # Copy configs to Python package
cd typescript && npm test      # TypeScript tests
cd python && pytest            # Python tests
```

## Adding a New Transform

If your model needs a prompt transformation that doesn't exist yet:

1. Create `typescript/src/transforms/yourTransform.ts`:
```typescript
export function yourTransform(text: string, params: Record<string, unknown>): string {
  // Pure function: takes text + params, returns transformed text
  return text + "\n\nYour transformation here";
}
```

2. Register in `typescript/src/transforms/index.ts`
3. Port to `python/refrase/transforms/your_transform.py`
4. Register in `python/refrase/transforms/__init__.py`
5. Reference from your config: `"transform": "your_transform"`

## Available Transforms

| Transform | Purpose |
|---|---|
| `append_text` | Append text after prompt |
| `prepend_text` | Prepend text before prompt |
| `xml_wrap` | Claude-style XML structuring with role extraction |
| `thinking_prefix` | `/think` or `/no_think` prefix (Qwen, Nemotron) |
| `json_reinforce` | JSON compliance instructions (standard or strong) |
| `simplify` | Reduce steps, strip examples for small models |
| `grounding` | Anti-hallucination rules |
| `self_verify` | Self-check verification checklist |
| `language_enforce` | Output language enforcement |
| `suppress_markers` | Suppress reasoning artifacts |
| `type_reinforce` | Schema type enforcement |
| `nested_object_fix` | Nested structure guidance |
| `markdown_structure` | Markdown section prefixes |
| `constraint_reorder` | Move constraints to optimal position |

## Evidence Standards

Every rule should have evidence. In order of strength:

1. **Official docs** — URL to provider documentation + direct quote
2. **Empirical** — Data from our benchmark or controlled testing
3. **Community** — Known behavior from community experience

Include a `url` wherever possible. Be specific enough to verify.

## Running Tests

```bash
# TypeScript
cd typescript && npm test

# Python
cd python && pytest tests/ -v --cov=refrase

# Cross-language parity
python tests/check-parity.py

# Sync configs before testing
./scripts/sync-configs.sh
```

## Guidelines

- Keep transforms deterministic (no LLM calls, no network)
- Both Python and TypeScript must produce identical output for the same inputs
- Target 90%+ test coverage
- Every rule needs evidence — no fabricated citations
- Use honest category labels
