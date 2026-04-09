"""Append content after the prompt text, separated by a blank line."""

from typing import Any


def append_text(text: str, params: dict[str, Any]) -> str:
    content = params["content"]
    return f"{text}\n\n{content}"
