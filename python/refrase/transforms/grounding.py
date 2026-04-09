"""Append grounding rules that restrict the model to provided input data."""

from typing import Any


def grounding(text: str, _params: dict[str, Any]) -> str:
    return (
        f"{text}\n\n"
        "GROUNDING RULES:\n"
        "- Only use information explicitly present in the provided input data.\n"
        "- Do NOT infer, assume, or fabricate any details.\n"
        "- If information is not available, use null rather than guessing."
    )
