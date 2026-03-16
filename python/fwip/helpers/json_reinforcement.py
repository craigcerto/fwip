"""JSON output reinforcement for structured output compliance."""


def add_json_reinforcement(text: str, tier3: bool = False) -> str:
    """Add JSON output reinforcement to a system prompt.

    For Tier 3 (JSON-prompt fallback) models, adds extra-strong
    JSON-only output instructions.

    Args:
        text: The system prompt text to augment.
        tier3: If True, add extra-strong reinforcement for models that
               fall back to JSON-in-prompt structured output.

    Returns:
        System prompt with JSON reinforcement appended.
    """
    if tier3:
        return (
            f"{text}\n\n"
            "CRITICAL OUTPUT RULES:\n"
            "- Your ENTIRE response must be a single valid JSON object.\n"
            "- Do NOT include any text before or after the JSON.\n"
            "- Do NOT wrap the JSON in markdown code fences.\n"
            "- Do NOT include any explanation, thinking, or commentary.\n"
            "- Include ALL required fields from the schema. Missing fields cause errors.\n"
            "- Use null for any field you cannot determine."
        )
    return (
        f"{text}\n\n"
        "Return your response as valid JSON matching the provided schema. "
        "Include ALL required fields. Use null for unknown values."
    )
