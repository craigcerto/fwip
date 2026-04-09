"""Append Magistral-specific marker suppression rules."""

from typing import Any


def suppress_markers(text: str, _params: dict[str, Any]) -> str:
    return (
        f"{text}\n\n"
        "CRITICAL OUTPUT RULES:\n"
        "- Respond with ONLY valid JSON matching the schema.\n"
        "- Do NOT include any thinking, reasoning, or [THINK] blocks.\n"
        "- Do NOT prefix your response with [TOOL_CALLS] or any markers.\n"
        "- Your ENTIRE response must be parseable as a single JSON object.\n"
        "- No markdown code fences. No explanation before or after.\n"
        "- Include ALL required fields. Use null for unknown values."
    )
