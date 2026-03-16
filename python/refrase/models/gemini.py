"""Gemini model family adapter (identity — prompts are already optimized for Gemini)."""

from refrase.models._base import BaseAdapter
from refrase.types import Change, ModelFamily, ModelInfo, TaskType


class GeminiAdapter(BaseAdapter):
    """Identity adapter for Google Gemini models.

    Gemini is the baseline — prompts are already optimized for this family.
    No changes are applied.
    """

    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        return system

    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        return []

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            family=ModelFamily.GEMINI,
            description="Google Gemini models (baseline — no adaptation needed)",
            adaptations=[],
        )
