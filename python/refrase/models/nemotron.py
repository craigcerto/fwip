"""Nemotron model family adapter (9B, 12B VL, 30B)."""

from refrase.helpers import add_json_reinforcement, simplify_prompt
from refrase.models._base import BaseAdapter
from refrase.types import Change, ModelFamily, ModelInfo, TaskType


class NemotronAdapter(BaseAdapter):
    """Adapter for NVIDIA Nemotron models.

    Key adaptations:
    - 9B/12B: Tier 3 JSON prompt fallback, /think toggle, simplified prompts
    - 30B: Standard adaptation with tool use support
    """

    def _get_think_prefix(self, model_variant: str) -> str:
        """Determine thinking mode prefix for small models."""
        if "nothink" in model_variant:
            return "/no_think\n"
        return "/think\n"

    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        is_9b = "9b" in model_variant
        is_12b = "12b" in model_variant
        is_small = is_9b or is_12b

        if is_small:
            think_prefix = self._get_think_prefix(model_variant)
            adapted = think_prefix + simplify_prompt(system, max_steps=3)
            adapted = add_json_reinforcement(adapted, tier3=True)
        else:
            adapted = system
            adapted = add_json_reinforcement(adapted)

        return adapted

    def adapt_user(
        self,
        user: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        is_small = "9b" in model_variant or "12b" in model_variant
        if is_small:
            prefix = "/no_think\n" if "nothink" in model_variant else "/think\n"
            return prefix + simplify_prompt(user, max_steps=3)
        return user

    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        is_small = "9b" in model_variant or "12b" in model_variant

        if is_small:
            return [
                Change(
                    rule="thinking-mode",
                    description=f"Added {self._get_think_prefix(model_variant).strip()} prefix",
                    evidence="Nemotron 9B/12B support /think and /no_think toggles",
                    impact="Optimized reasoning mode",
                ),
                Change(
                    rule="simplification",
                    description="Simplified prompt for small model capacity",
                    evidence="9B/12B have limited attention layers",
                    impact="Reduced prompt length",
                ),
                Change(
                    rule="tier3-reinforcement",
                    description="Added extra-strong JSON-only instructions",
                    evidence="9B/12B use JSON-prompt fallback (Tier 3)",
                    impact="Improved schema compliance",
                ),
            ]
        return [
            Change(
                rule="json-reinforcement",
                description="Added JSON output compliance instructions",
                evidence="Explicit JSON instructions improve schema adherence",
                impact="More reliable structured output",
            ),
        ]

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            family=ModelFamily.NEMOTRON,
            description="NVIDIA Nemotron models (9B, 12B VL, 30B)",
            adaptations=[
                "9B/12B: thinking mode control",
                "9B/12B: Tier 3 JSON reinforcement",
                "9B/12B: prompt simplification",
                "30B: standard JSON reinforcement",
            ],
        )
