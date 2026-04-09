# Changelog

## [0.2.0] - 2026-04-08

### Changed
- **Config-driven architecture** — All model rules are now defined in JSON config files, not code. Adding a model = editing JSON.
- **Composable transforms** — 14 pure functions replace 11 hardcoded adapter classes
- **Rule engine** — Reads configs, matches rules by variant + task, applies transforms in sequence
- **Honest labeling** — Every rule is categorized as `model_specific`, `best_practice`, or `compensation`

### Added
- **API hints** — Recommended API parameters per model (temperature, reasoning_effort, max_tokens, etc.)
- **Evidence URLs** — Rules link to official documentation from Anthropic, OpenAI, Google, Qwen, DeepSeek, Kimi, NVIDIA
- **New API functions**: `listFamilies()`, `getModelConfig()`, `getFamilyConfig()`, `registerModel()`, `registerFamily()`
- **Runtime registration** — Add custom models or entire families at runtime
- **Gemini rules** — Temperature = 1.0 API hint (Gemini 3 degrades below 1.0)
- **OpenAI o-series** — `reasoning_effort` API hint
- **Qwen API hints** — Temperature 0.6 (greedy causes repetition), top_p 0.95
- **Kimi API hint** — Temperature 0.6 (Muon optimizer optimum)
- **Nemotron API hint** — `reasoning_budget` for 9B/12B
- **Config sync script** — `scripts/sync-configs.sh` keeps TS and Python configs identical

### Removed
- 11 adapter classes (`models/` directory)
- 4 helper modules (`helpers/` directory)
- ~800 lines of hardcoded adapter logic replaced by 11 JSON configs + 14 transform functions

### Fixed
- Gemini adapter no longer pretends to support Gemini while doing nothing — now has real API hints
- OpenAI "Reasoning: high" prompt text documented as prompt-level hint (not the API parameter)
- All evidence citations are verifiable (no more fabricated percentages)

## [0.1.0] - 2026-03-16

### Added
- Initial release of Refrase prompt optimization library
- 11 model family adapters: Claude, OpenAI, Gemini, Qwen, DeepSeek, Mistral, Llama, Kimi, GLM, Nemotron, MiniMax
- 39 model variants registered
- 5 task types: extraction, analysis, generation, code, general
- Helper utilities: XML wrapping, prompt simplification, JSON reinforcement, English enforcement
- Python package with 97%+ test coverage
- Shared test fixtures for cross-language parity verification
