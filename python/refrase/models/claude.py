"""Claude model family adapter (Sonnet, Opus, Haiku)."""

from refrase.helpers import simplify_prompt, wrap_xml
from refrase.models._base import BaseAdapter
from refrase.types import Change, ModelFamily, ModelInfo, TaskType


class ClaudeAdapter(BaseAdapter):
    """Adapter for Anthropic Claude models.

    Key adaptations:
    - Restructure with XML tags (Claude's trained formatting mechanism)
    - Add role definition
    - Haiku: simplify for smaller capacity
    """

    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        is_haiku = "haiku" in model_variant

        # Extract first sentence as role definition if it starts with "You are"
        role_line = ""
        body = system
        first_line = system.split("\n")[0].strip()
        if first_line.lower().startswith("you are"):
            role_line = first_line
            body = "\n".join(system.split("\n")[1:]).strip()

        if not role_line:
            role_line = "You are a helpful assistant."

        # For Haiku, simplify the methodology
        if is_haiku:
            body = simplify_prompt(body, max_steps=5)

        # Build XML-structured prompt
        adapted = wrap_xml("role", role_line)
        adapted += "\n\n" + wrap_xml("instructions", body)
        adapted += "\n\n" + wrap_xml(
            "output_format",
            "Return structured output matching the schema.",
        )

        return adapted

    def adapt_user(
        self,
        user: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        return user

    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        changes = [
            Change(
                rule="xml-structure",
                description="Restructured prompt with XML tags",
                evidence="Claude models are trained to follow XML-tagged instructions",
                impact="Improved instruction following and section separation",
            ),
            Change(
                rule="role-extraction",
                description="Extracted role definition into <role> tag",
                evidence="Claude responds well to explicit role framing in XML",
                impact="Clearer persona adherence",
            ),
        ]
        if "haiku" in model_variant:
            changes.append(Change(
                rule="simplification",
                description="Simplified prompt for smaller model capacity",
                evidence="Haiku has fewer parameters — concise prompts perform better",
                impact="Reduced prompt length while preserving key instructions",
            ))
        return changes

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            family=ModelFamily.CLAUDE,
            description="Anthropic Claude models (Sonnet, Opus, Haiku)",
            adaptations=[
                "XML tag structuring",
                "Role extraction",
                "Haiku simplification",
                "Output format guidance",
            ],
        )
