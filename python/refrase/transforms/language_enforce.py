"""Append a language enforcement instruction."""

from typing import Any


def language_enforce(text: str, params: dict[str, Any]) -> str:
    language = params.get("language", "English")
    return f"{text}\n\nIMPORTANT: All output must be in {language}."
