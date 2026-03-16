"""Qwen3 model family adapter."""

from refrase.helpers import (
    add_english_enforcement,
    add_json_reinforcement,
    simplify_prompt,
)
from refrase.models._base import BaseAdapter
from refrase.types import Change, ModelFamily, ModelInfo, TaskType


class QwenAdapter(BaseAdapter):
    """Adapter for Alibaba Qwen3 models.

    Key adaptations:
    - /think or /no_think prefix based on task and variant
    - Qwen3 32B: extra-strong schema compliance (Tier 3)
    - English enforcement (multilingual model)
    """

    def _get_think_prefix(self, task: TaskType, model_variant: str) -> str:
        """Determine thinking mode prefix."""
        if "nothink" in model_variant:
            return "/no_think\n"
        if "think" in model_variant:
            return "/think\n"
        # Default: nothink for extraction, think for everything else
        return "/no_think\n" if task == TaskType.EXTRACTION else "/think\n"

    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        is_32b = "32b" in model_variant

        think_prefix = self._get_think_prefix(task, model_variant)
        adapted = think_prefix + system

        if is_32b:
            adapted = add_json_reinforcement(adapted, tier3=True)
            adapted = simplify_prompt(adapted, max_steps=5)
        else:
            adapted = add_json_reinforcement(adapted)

        adapted = add_english_enforcement(adapted)
        return adapted

    def adapt_user(
        self,
        user: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        if "nothink" in model_variant:
            return "/no_think\n" + user
        return "/think\n" + user

    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        think_prefix = self._get_think_prefix(task, model_variant)
        changes = [
            Change(
                rule="thinking-mode",
                description=f"Added {think_prefix.strip()} prefix",
                evidence="Qwen3 supports /think and /no_think reasoning toggles",
                impact="Optimized reasoning mode for task type",
            ),
            Change(
                rule="english-enforcement",
                description="Added English-only output instruction",
                evidence="Qwen3 is natively multilingual — may respond in Chinese",
                impact="Consistent English output",
            ),
        ]
        if "32b" in model_variant:
            changes.append(Change(
                rule="tier3-reinforcement",
                description="Added extra-strong JSON-only instructions",
                evidence="32B variant uses JSON-prompt fallback (Tier 3)",
                impact="Dramatically improved schema compliance",
            ))
        return changes

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            family=ModelFamily.QWEN,
            description="Alibaba Qwen3 models (235B, 32B, Coder)",
            adaptations=[
                "Thinking mode control (/think, /no_think)",
                "Tier 3 JSON reinforcement for 32B",
                "English enforcement",
                "Small model simplification",
            ],
        )
