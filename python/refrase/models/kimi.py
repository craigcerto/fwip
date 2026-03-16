"""Kimi model family adapter (K2, K2.5)."""

from refrase.helpers import add_english_enforcement, add_json_reinforcement
from refrase.models._base import BaseAdapter
from refrase.types import Change, ModelFamily, ModelInfo, TaskType


class KimiAdapter(BaseAdapter):
    """Adapter for Moonshot Kimi models.

    Key adaptations:
    - K2 Thinking: frame as high-level objectives (always reasons)
    - Add citation/grounding requirements to reduce hallucination
    - Enforce language consistency
    """

    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        is_k2_thinking = "k2" in model_variant and "k25" not in model_variant

        if is_k2_thinking:
            adapted = system
            adapted += (
                "\n\nReference only the provided source material. "
                "Do NOT fabricate information not present in the input data."
            )
        else:
            adapted = system

        adapted = add_json_reinforcement(adapted)
        adapted = add_english_enforcement(adapted)
        return adapted

    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        changes = [
            Change(
                rule="json-reinforcement",
                description="Added JSON output compliance instructions",
                evidence="Explicit JSON instructions improve schema adherence",
                impact="More reliable structured output",
            ),
            Change(
                rule="english-enforcement",
                description="Added English-only output instruction",
                evidence="Kimi is multilingual — may respond in Chinese",
                impact="Consistent English output",
            ),
        ]
        if "k2" in model_variant and "k25" not in model_variant:
            changes.insert(0, Change(
                rule="grounding",
                description="Added source material grounding instruction",
                evidence="K2 Thinking always reasons — explicit grounding reduces hallucination",
                impact="Output grounded in provided data",
            ))
        return changes

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            family=ModelFamily.KIMI,
            description="Moonshot Kimi models (K2, K2.5)",
            adaptations=[
                "K2: source material grounding",
                "English enforcement",
                "JSON reinforcement",
            ],
        )
