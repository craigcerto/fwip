"""Append type reinforcement instructions for code-focused models."""

from typing import Any


def type_reinforce(text: str, _params: dict[str, Any]) -> str:
    return (
        f"{text}\n\n"
        "Return your response as a valid JSON object. "
        "Ensure all string fields contain strings, all number fields contain numbers, "
        "and all array fields contain arrays. Type mismatches cause parsing errors."
    )
