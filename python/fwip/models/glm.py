"""GLM model family adapter (4.7, 4.7 Flash)."""

from fwip.helpers import (
    add_english_enforcement,
    add_json_reinforcement,
    simplify_prompt,
)
from fwip.models._base import BaseAdapter
from fwip.types import Change, ModelFamily, ModelInfo, TaskType


class GLMAdapter(BaseAdapter):
    """Adapter for Z.AI GLM models.

    Key adaptations:
    - Enforce English output (natively bilingual Chinese/English)
    - Reinforce nested object field types (known serialization bug)
    - Flash: simpler prompts for smaller model
    """

    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        is_flash = "flash" in model_variant

        if is_flash:
            adapted = simplify_prompt(system, max_steps=5)
        else:
            adapted = system

        # Nested object serialization bug workaround
        adapted += (
            "\n\nEnsure all nested objects are properly structured. "
            "Array fields must contain arrays, not single values. "
            "Object fields must contain objects with all required sub-fields."
        )

        adapted = add_json_reinforcement(adapted)
        adapted = add_english_enforcement(adapted)
        return adapted

    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        changes = [
            Change(
                rule="nested-object-fix",
                description="Added nested object structure reinforcement",
                evidence="GLM has a known nested object serialization bug",
                impact="Correct nested object and array structure",
            ),
            Change(
                rule="english-enforcement",
                description="Added English-only output instruction",
                evidence="GLM is natively bilingual Chinese/English",
                impact="Consistent English output",
            ),
            Change(
                rule="json-reinforcement",
                description="Added JSON output compliance instructions",
                evidence="Explicit JSON instructions improve schema adherence",
                impact="More reliable structured output",
            ),
        ]
        if "flash" in model_variant:
            changes.insert(0, Change(
                rule="simplification",
                description="Simplified prompt for Flash variant",
                evidence="GLM Flash is smaller — concise prompts perform better",
                impact="Reduced prompt length while preserving key instructions",
            ))
        return changes

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            family=ModelFamily.GLM,
            description="Z.AI GLM models (4.7, 4.7 Flash)",
            adaptations=[
                "Nested object reinforcement",
                "English enforcement",
                "Flash simplification",
                "JSON reinforcement",
            ],
        )
