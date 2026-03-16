# Contributing to Fwip

Thank you for your interest in contributing to Fwip! This guide explains how to add support for new model families.

## Adding a New Model Adapter (5 Steps)

### 1. Create the adapter file

Create `python/fwip/models/yourmodel.py`:

```python
from fwip.helpers import add_json_reinforcement
from fwip.models._base import BaseAdapter
from fwip.types import Change, ModelFamily, ModelInfo, TaskType


class YourModelAdapter(BaseAdapter):
    def adapt_system(self, system: str, task: TaskType, model_variant: str = "") -> str:
        adapted = system
        # Apply your model-specific adaptations here
        adapted = add_json_reinforcement(adapted)
        return adapted

    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        return [
            Change(
                rule="your-rule-name",
                description="What this adaptation does",
                evidence="Why this helps (link to docs, benchmarks, etc.)",
                impact="Expected improvement",
            ),
        ]

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            family=ModelFamily.YOURMODEL,  # Add to types.py first
            description="Your Model Family description",
            adaptations=["List of adaptations"],
        )
```

### 2. Add to the ModelFamily enum

In `python/fwip/types.py`, add your family:

```python
class ModelFamily(Enum):
    # ... existing families ...
    YOURMODEL = "yourmodel"
```

### 3. Register in the registry

In `python/fwip/registry.py`, add entries:

```python
from fwip.models.yourmodel import YourModelAdapter

_REGISTRY: dict[str, tuple[type[BaseAdapter], str, ModelFamily]] = {
    # ... existing entries ...
    "yourmodel-large": (YourModelAdapter, "large", ModelFamily.YOURMODEL),
    "yourmodel-small": (YourModelAdapter, "small", ModelFamily.YOURMODEL),
}
```

### 4. Add to models/__init__.py

```python
from fwip.models.yourmodel import YourModelAdapter
```

### 5. Write tests

Create `python/tests/test_models/test_yourmodel.py`:

```python
import fwip

class TestYourModelAdapter:
    def test_basic_adaptation(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "yourmodel-large")
        assert "JSON" in result.system  # or whatever your adapter does

    def test_changes_reported(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "yourmodel-large")
        assert len(result.changes) > 0
```

Also add entries to `python/tests/test_fixtures.json` for cross-language parity.

### 6. Mirror in TypeScript

Port the same adapter to `typescript/src/models/yourmodel.ts` with identical behavior.

## Running Tests

```bash
# Python
cd python && pytest tests/ -v --cov=fwip

# TypeScript
cd typescript && npx vitest run --coverage
```

## Guidelines

- Keep adapters deterministic (no LLM calls)
- Document the evidence for each adaptation rule
- Ensure both Python and TypeScript produce identical output for the same inputs
- Target 90%+ test coverage
