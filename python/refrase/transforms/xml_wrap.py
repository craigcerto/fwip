"""Restructure a prompt into XML-tagged sections (role, instructions, output_format).

Logic:
1. Extract role from first line if it starts with "you are" (case insensitive).
2. If no role line found, use params.default_role.
3. Body = remaining lines after role extraction, trimmed.
4. If params.simplify_body is true, simplify the body (NOT the role line).
5. Build: wrapXml("role", roleLine) + "\\n\\n" + wrapXml("instructions", body)
         + "\\n\\n" + wrapXml("output_format", output_format_text)
"""

from typing import Any

from refrase.transforms.simplify import simplify


def _wrap_xml(tag: str, content: str) -> str:
    return f"<{tag}>\n{content}\n</{tag}>"


def xml_wrap(text: str, params: dict[str, Any]) -> str:
    extract_role = params.get("extract_role") is not False
    default_role = params.get("default_role", "You are a helpful assistant.")
    output_format_text = params.get(
        "output_format_text", "Return structured output matching the schema."
    )
    simplify_body = params.get("simplify_body") is True
    simplify_max_steps = params.get("simplify_max_steps", 5)
    if not isinstance(simplify_max_steps, (int, float)):
        simplify_max_steps = 5
    simplify_max_steps = int(simplify_max_steps)

    role_line = ""
    body = text

    if extract_role:
        first_line = text.split("\n")[0].strip()
        if first_line.lower().startswith("you are"):
            role_line = first_line
            body = "\n".join(text.split("\n")[1:]).strip()

    if not role_line:
        role_line = default_role

    if simplify_body:
        body = simplify(body, {"max_steps": simplify_max_steps})

    adapted = _wrap_xml("role", role_line)
    adapted += "\n\n" + _wrap_xml("instructions", body)
    adapted += "\n\n" + _wrap_xml("output_format", output_format_text)

    return adapted
