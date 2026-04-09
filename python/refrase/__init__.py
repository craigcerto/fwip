"""Refrase -- your prompts, upgraded.

Model-specific prompt optimization library.

Usage:
    >>> import refrase
    >>> result = refrase.adapt("You are a helpful assistant.", "claude-sonnet")
    >>> print(result.system)
    >>> print(result.changes)

    >>> models = refrase.list_models()
    >>> families = refrase.list_families()
"""

from refrase.adapt import adapt, list_models
from refrase.registry import (
    get_family_config,
    get_model_config,
    list_families,
    register_family,
    register_model,
)
from refrase.types import (
    AdaptResult,
    ApiHint,
    Change,
    Evidence,
    FamilyInfo,
    ModelFamily,
    ModelInfo,
    TaskType,
)

__version__ = "0.1.0"

__all__ = [
    # Core functions
    "adapt",
    "list_models",
    "list_families",
    "get_model_config",
    "get_family_config",
    "register_model",
    "register_family",
    # Types
    "AdaptResult",
    "ApiHint",
    "Change",
    "Evidence",
    "FamilyInfo",
    "ModelFamily",
    "ModelInfo",
    "TaskType",
]
