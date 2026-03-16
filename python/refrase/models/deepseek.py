"""DeepSeek model family adapter (V3.x)."""

from refrase.helpers import add_json_reinforcement
from refrase.models._base import BaseAdapter
from refrase.types import Change, ModelFamily, ModelInfo, TaskType


class DeepSeekAdapter(BaseAdapter):
    """Adapter for DeepSeek V3.x models.

    Key adaptations:
    - Keep numbered methodology steps (existing format works well)
    - Be concise and direct
    - Add self-check instructions
    - Standard JSON guidance
    """

    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        adapted = system

        adapted += (
            "\n\nBefore your final answer, verify:\n"
            "- All required fields are present in your response\n"
            "- No fields contain placeholder or example values\n"
            "- All data is extracted from the provided source material"
        )

        adapted = add_json_reinforcement(adapted)
        return adapted

    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        return [
            Change(
                rule="self-verification",
                description="Added self-verification checklist",
                evidence="DeepSeek models respond well to self-check instructions",
                impact="Fewer missing fields and placeholder values",
            ),
            Change(
                rule="json-reinforcement",
                description="Added JSON output compliance instructions",
                evidence="Explicit JSON instructions improve schema adherence",
                impact="More reliable structured output",
            ),
        ]

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            family=ModelFamily.DEEPSEEK,
            description="DeepSeek V3.x models",
            adaptations=[
                "Self-verification checklist",
                "JSON reinforcement",
                "Preserved methodology structure",
            ],
        )
