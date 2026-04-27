# Canonical model-cards data

`model-cards.json` is the canonical source of truth for every model that Refrase supports. It captures, for each model:

- Identity: id, name, provider, family, release date
- Specs: context window, max output tokens, pricing
- Behavior: key capabilities, known limitations
- Prompting guidance: preferred instruction format, recommended practices, anti-patterns
- Sources: links to official provider documentation

Every claim traces to a cited source (provider docs, system cards, or Refrase evaluation data).

## What consumes this file

- **Refrase Adapter Lambda** — bundles a copy at build time. The LLM enhancer is given the relevant model card as context when it rewrites a user's prompt for that model, so this file *is* the prompt-engineering knowledge base the enhancer reads from.
- **refrase.cc website** — the same data renders on `/models/[slug]` (per-model prompting guides) and `/compare/[pair]` (subjective prompting comparisons).
- **Future v1.0 SDK clients (`refrase` on npm/PyPI)** — will read from the same file.

## Updating

If you're adding a new model or correcting/extending an existing one, edit this file and open a pull request. After merging:

1. The refrase-web repo's `lambda/adapter/model-cards.json` and `src/data/model-cards.json` should be re-synced (manual copy for now; a CI sync is on the roadmap).
2. The Adapter Lambda is redeployed via `lambda/adapter/deploy.sh` so the new card is picked up.

## Schema

See `model-cards.schema.json` (TODO) for the JSON schema. For now, follow the pattern of an existing entry — every field is optional except `id`, `name`, `provider`, `family`.
