"""Language enforcement for multilingual models."""


def add_english_enforcement(text: str) -> str:
    """Add English-only output enforcement for multilingual models.

    Args:
        text: The system prompt text to augment.

    Returns:
        System prompt with English enforcement appended.
    """
    return f"{text}\n\nIMPORTANT: All output must be in English."
