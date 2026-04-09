"""Append nested object structure reinforcement."""

from typing import Any


def nested_object_fix(text: str, _params: dict[str, Any]) -> str:
    return (
        f"{text}\n\n"
        "Ensure all nested objects are properly structured. "
        "Array fields must contain arrays, not single values. "
        "Object fields must contain objects with all required sub-fields."
    )
