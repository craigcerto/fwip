"""Prepend a thinking-mode control prefix (/think or /no_think).

Checks variant_override first (substring match on variant), then falls back
to task_map lookup.
"""

from typing import Any


def thinking_prefix(text: str, params: dict[str, Any]) -> str:
    variant = params.get("variant", "")
    task = params.get("task", "")
    task_map: dict[str, str] = params.get("task_map", {})
    variant_override: dict[str, str] = params.get("variant_override", {})

    # Check variant overrides first (substring match)
    for substring, prefix in variant_override.items():
        if substring in variant:
            return prefix + text

    # Fall back to task map
    prefix = task_map.get(task, task_map.get("default", "/think\n"))
    return prefix + text
