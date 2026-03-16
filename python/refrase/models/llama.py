"""Llama model family adapter."""

from refrase.helpers import add_json_reinforcement, simplify_prompt
from refrase.models._base import BaseAdapter
from refrase.types import Change, ModelFamily, ModelInfo, TaskType


class LlamaAdapter(BaseAdapter):
    """Adapter for Meta Llama models.

    Key adaptations:
    - Markdown structure with clear headers
    - Grounding instructions to reduce hallucination
    - Smaller models get simplified prompts
    """

    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        is_small = any(s in model_variant for s in ("8b", "3b"))

        if is_small:
            adapted = simplify_prompt(system, max_steps=5)
        else:
            adapted = system

        # Grounding instructions
        adapted += (
            "\n\nGROUNDING RULES:\n"
            "- Only use information explicitly present in the provided input data.\n"
            "- Do NOT infer, assume, or fabricate any details.\n"
            "- If information is not available, use null rather than guessing."
        )

        adapted = add_json_reinforcement(adapted)
        return adapted

    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        changes = [
            Change(
                rule="grounding",
                description="Added grounding rules to reduce hallucination",
                evidence="Llama models benefit from explicit grounding instructions",
                impact="Reduced fabrication of unsupported details",
            ),
            Change(
                rule="json-reinforcement",
                description="Added JSON output compliance instructions",
                evidence="Explicit JSON instructions improve schema adherence",
                impact="More reliable structured output",
            ),
        ]
        if any(s in model_variant for s in ("8b", "3b")):
            changes.insert(0, Change(
                rule="simplification",
                description="Simplified prompt for smaller model capacity",
                evidence="Small Llama models perform better with concise prompts",
                impact="Reduced prompt length while preserving key instructions",
            ))
        return changes

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            family=ModelFamily.LLAMA,
            description="Meta Llama models",
            adaptations=[
                "Markdown structure",
                "Grounding rules",
                "JSON reinforcement",
                "Small model simplification",
            ],
        )
