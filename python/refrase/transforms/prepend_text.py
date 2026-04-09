"""Prepend content before the prompt text, separated by a newline."""

from typing import Any


def prepend_text(text: str, params: dict[str, Any]) -> str:
    content = params["content"]
    return f"{content}\n{text}"
