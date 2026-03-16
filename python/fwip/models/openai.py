"""OpenAI GPT model family adapter."""

from fwip.helpers import add_json_reinforcement, simplify_prompt
from fwip.models._base import BaseAdapter
from fwip.types import Change, ModelFamily, ModelInfo, TaskType


class OpenAIAdapter(BaseAdapter):
    """Adapter for OpenAI GPT models (GPT-4o, GPT-4, o1, o3).

    Key adaptations:
    - Markdown structure with clear section headers
    - Step-by-step reasoning guidance
    - Strong grounding instructions to reduce hallucination
    - Smaller models get simplified prompts
    """

    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        is_small = any(s in model_variant for s in ("mini", "20b"))

        if is_small:
            adapted = simplify_prompt(system, max_steps=5)
        else:
            adapted = system

        # GPT models respond to reasoning level hints
        if task in (TaskType.ANALYSIS, TaskType.CODE):
            adapted = f"Reasoning: high\n\n{adapted}"

        # Grounding rules
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
                evidence="GPT models benefit from explicit grounding instructions",
                impact="Reduced fabrication of unsupported details",
            ),
            Change(
                rule="json-reinforcement",
                description="Added JSON output compliance instructions",
                evidence="Explicit JSON instructions improve schema adherence",
                impact="More reliable structured output",
            ),
        ]
        if task in (TaskType.ANALYSIS, TaskType.CODE):
            changes.append(Change(
                rule="reasoning-hint",
                description="Added reasoning level hint for complex tasks",
                evidence="GPT models respond to reasoning level directives",
                impact="Higher quality analysis and code output",
            ))
        return changes

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            family=ModelFamily.OPENAI,
            description="OpenAI GPT models (GPT-4o, GPT-4, o1, o3)",
            adaptations=[
                "Markdown structure",
                "Reasoning level hints",
                "Grounding rules",
                "JSON reinforcement",
                "Small model simplification",
            ],
        )
