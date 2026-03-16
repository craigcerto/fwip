"""MiniMax model family adapter (M2)."""

from refrase.helpers import add_json_reinforcement
from refrase.models._base import BaseAdapter
from refrase.types import Change, ModelFamily, ModelInfo, TaskType


class MiniMaxAdapter(BaseAdapter):
    """Adapter for MiniMax M2.

    Key adaptations:
    - Contract-style prompts with success criteria
    - Self-verification instructions
    """

    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        adapted = system

        adapted += (
            "\n\nBefore producing your final output, verify:\n"
            "- All required fields are present and correctly typed\n"
            "- No information has been fabricated or inferred beyond the source data\n"
            "- Output is well-structured and internally consistent"
        )

        adapted = add_json_reinforcement(adapted)
        return adapted

    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        return [
            Change(
                rule="self-verification",
                description="Added self-verification checklist",
                evidence="MiniMax M2 responds well to contract-style verification",
                impact="Fewer errors in structured output",
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
            family=ModelFamily.MINIMAX,
            description="MiniMax M2",
            adaptations=[
                "Self-verification checklist",
                "JSON reinforcement",
            ],
        )
