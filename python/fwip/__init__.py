"""Fwip — your prompts, upgraded.

Model-specific prompt optimization library.

Usage:
    >>> import fwip
    >>> result = fwip.adapt("You are a helpful assistant.", "claude-sonnet")
    >>> print(result.system)
    >>> print(result.changes)

    >>> models = fwip.list_models()
"""

from fwip.adapt import adapt, list_models
from fwip.types import AdaptResult, Change, ModelFamily, ModelInfo, TaskType

__version__ = "0.1.0"

__all__ = [
    "adapt",
    "list_models",
    "AdaptResult",
    "Change",
    "ModelFamily",
    "ModelInfo",
    "TaskType",
]
