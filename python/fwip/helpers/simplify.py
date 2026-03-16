"""Prompt simplification for smaller models."""

import re


def simplify_prompt(text: str, max_steps: int = 5) -> str:
    """Simplify a verbose prompt for smaller models.

    - Strips markdown headers down to plain labels
    - Limits numbered methodology steps
    - Removes verbose examples and edge-case guidance

    Args:
        text: The prompt text to simplify.
        max_steps: Maximum numbered steps to keep.

    Returns:
        Simplified prompt text.
    """
    lines = text.strip().split("\n")
    result = []
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
