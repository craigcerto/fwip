"""Registry of all built-in transform functions, keyed by config name."""

from typing import Any, Callable

from refrase.transforms.append_text import append_text
from refrase.transforms.prepend_text import prepend_text
from refrase.transforms.language_enforce import language_enforce
from refrase.transforms.json_reinforce import json_reinforce
from refrase.transforms.simplify import simplify
from refrase.transforms.grounding import grounding
from refrase.transforms.self_verify import self_verify
from refrase.transforms.xml_wrap import xml_wrap
from refrase.transforms.markdown_structure import markdown_structure
from refrase.transforms.thinking_prefix import thinking_prefix
from refrase.transforms.constraint_reorder import constraint_reorder
from refrase.transforms.suppress_markers import suppress_markers
from refrase.transforms.type_reinforce import type_reinforce
from refrase.transforms.nested_object_fix import nested_object_fix

TRANSFORMS: dict[str, Callable[[str, dict[str, Any]], str]] = {
    "append_text": append_text,
    "prepend_text": prepend_text,
    "language_enforce": language_enforce,
    "json_reinforce": json_reinforce,
    "simplify": simplify,
    "grounding": grounding,
    "self_verify": self_verify,
    "xml_wrap": xml_wrap,
    "markdown_structure": markdown_structure,
    "thinking_prefix": thinking_prefix,
    "constraint_reorder": constraint_reorder,
    "suppress_markers": suppress_markers,
    "type_reinforce": type_reinforce,
    "nested_object_fix": nested_object_fix,
}

__all__ = [
    "TRANSFORMS",
    "append_text",
    "prepend_text",
    "language_enforce",
    "json_reinforce",
    "simplify",
    "grounding",
    "self_verify",
    "xml_wrap",
    "markdown_structure",
    "thinking_prefix",
    "constraint_reorder",
    "suppress_markers",
    "type_reinforce",
    "nested_object_fix",
]
