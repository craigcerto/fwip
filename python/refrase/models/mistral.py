"""Mistral model family adapter (Large, Magistral, Devstral, Ministral).

Consolidates 4 separate CareerCatalyst adapters into one file:
- Mistral Large 3 (675B)
- Magistral Small (reasoning model)
- Devstral 2 (123B, code-optimized)
- Ministral (14B, 8B, 3B)
"""

from refrase.helpers import add_json_reinforcement, simplify_prompt
from refrase.models._base import BaseAdapter
from refrase.types import Change, ModelFamily, ModelInfo, TaskType


class MistralAdapter(BaseAdapter):
    """Adapter for the Mistral model family.

    Handles all Mistral variants through the model_variant parameter:
    - "large": Mistral Large 3 — step-by-step for analysis
    - "magistral": Magistral Small — suppress [TOOL_CALLS] and [THINK] blocks
    - "devstral": Devstral 2 — code-focused framing, type reinforcement
    - "ministral-3b", "ministral-8b", "ministral-14b": small models, simplified
    """

    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        if "magistral" in model_variant:
            return self._adapt_magistral(system, task)
        if "devstral" in model_variant:
            return self._adapt_devstral(system, task)
        if "ministral" in model_variant:
            return self._adapt_ministral(system, task, model_variant)
        # Default: Mistral Large
        return self._adapt_large(system, task)

    def adapt_user(
        self,
        user: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        if "ministral" in model_variant and "3b" in model_variant:
            return simplify_prompt(user, max_steps=3)
        return user

    def _adapt_large(self, system: str, task: TaskType) -> str:
        adapted = system

        if task in (TaskType.ANALYSIS, TaskType.CODE):
            adapted += (
                "\n\nIMPORTANT: Work through this analysis methodically. "
                "For each requirement, assess evidence before assigning a status."
            )

        return add_json_reinforcement(adapted)

    def _adapt_magistral(self, system: str, task: TaskType) -> str:
        return (
            f"{system}\n\n"
            "CRITICAL OUTPUT RULES:\n"
            "- Respond with ONLY valid JSON matching the schema.\n"
            "- Do NOT include any thinking, reasoning, or [THINK] blocks.\n"
            "- Do NOT prefix your response with [TOOL_CALLS] or any markers.\n"
            "- Your ENTIRE response must be parseable as a single JSON object.\n"
            "- No markdown code fences. No explanation before or after.\n"
            "- Include ALL required fields. Use null for unknown values."
        )

    def _adapt_devstral(self, system: str, task: TaskType) -> str:
        return (
            f"{system}\n\n"
            "Return your response as a valid JSON object. "
            "Ensure all string fields contain strings, all number fields contain numbers, "
            "and all array fields contain arrays. Type mismatches cause parsing errors."
        )

    def _adapt_ministral(
        self, system: str, task: TaskType, model_variant: str
    ) -> str:
        is_3b = "3b" in model_variant
        is_8b = "8b" in model_variant

        if is_3b:
            adapted = simplify_prompt(system, max_steps=3)
        elif is_8b:
            adapted = simplify_prompt(system, max_steps=4)
        else:
            adapted = system

        return add_json_reinforcement(adapted)

    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        if "magistral" in model_variant:
            return [
                Change(
                    rule="suppress-markers",
                    description="Suppressed [TOOL_CALLS] and [THINK] output markers",
                    evidence="Magistral emits reasoning/tool markers that break JSON parsing",
                    impact="Clean JSON output without extraneous markers",
                ),
                Change(
                    rule="tier3-reinforcement",
                    description="Added ultra-strong JSON-only instructions",
                    evidence="Magistral is a reasoning model — needs explicit JSON-only directives",
                    impact="Reliable structured output from reasoning model",
                ),
            ]
        if "devstral" in model_variant:
            return [
                Change(
                    rule="type-reinforcement",
                    description="Added explicit field type instructions",
                    evidence="Devstral has a known type coercion bug in tool args",
                    impact="Correct field types in structured output",
                ),
            ]
        if "ministral" in model_variant:
            changes = [
                Change(
                    rule="json-reinforcement",
                    description="Added JSON output compliance instructions",
                    evidence="Small models need explicit JSON guidance",
                    impact="More reliable structured output",
                ),
            ]
            if any(s in model_variant for s in ("3b", "8b")):
                changes.insert(0, Change(
                    rule="simplification",
                    description="Simplified prompt for small model capacity",
                    evidence="Ministral 3B/8B have limited attention — concise prompts perform better",
                    impact="Reduced prompt length while preserving key instructions",
                ))
            return changes
        # Mistral Large
        changes = [
            Change(
                rule="json-reinforcement",
                description="Added JSON output compliance instructions",
                evidence="Explicit JSON instructions improve schema adherence",
                impact="More reliable structured output",
            ),
        ]
        if task in (TaskType.ANALYSIS, TaskType.CODE):
            changes.append(Change(
                rule="step-by-step",
                description="Added methodical analysis instruction",
                evidence="Mistral Large has no thinking mode — explicit step-by-step improves analysis",
                impact="More thorough requirement-by-requirement analysis",
            ))
        return changes

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            family=ModelFamily.MISTRAL,
            description="Mistral models (Large, Magistral, Devstral, Ministral)",
            adaptations=[
                "Large: step-by-step for analysis",
                "Magistral: suppress [TOOL_CALLS] and [THINK]",
                "Devstral: type reinforcement for code model",
                "Ministral: simplification for 3B/8B/14B",
                "JSON reinforcement",
            ],
        )
