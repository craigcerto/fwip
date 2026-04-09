"""Simplify a verbose prompt for smaller models.

- Strips markdown headers down to plain labels
- Limits numbered methodology steps
- Removes verbose examples and edge-case guidance
"""

import re
from typing import Any


def simplify(text: str, params: dict[str, Any]) -> str:
    max_steps = params.get("max_steps", 5)
    if not isinstance(max_steps, (int, float)):
        max_steps = 5
    max_steps = int(max_steps)

    lines = text.strip().split("\n")
    result: list[str] = []
    step_count = 0
    in_example_block = False

    for line in lines:
        stripped = line.strip()

        # Skip example blocks
        if stripped.lower().startswith("example") and ":" in stripped:
            in_example_block = True
            continue
        if in_example_block and (stripped == "" or stripped.startswith("-")):
            if stripped == "":
                in_example_block = False
            continue

        # Count numbered steps, skip beyond max
        if re.match(r"^\d+\.\s", stripped):
            step_count += 1
            if step_count > max_steps:
                continue

        # Convert markdown headers to plain labels
        line = re.sub(r"^#{1,4}\s+", "", line)

        result.append(line)

    return "\n".join(result).strip()
