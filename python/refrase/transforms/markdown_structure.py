"""Append markdown-structured analysis instructions."""

from typing import Any


def markdown_structure(text: str, params: dict[str, Any]) -> str:
    content = params["content"]
    return f"{text}\n\n{content}"
