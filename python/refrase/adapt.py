"""Core adaptation routing — the main entry point for Fwip."""

from typing import Optional

from refrase.registry import get_adapter, list_models as _list_models
from refrase.types import AdaptResult, TaskType


def adapt(
    prompt: str,
    model: str,
    task: str = "general",
    user_prompt: Optional[str] = None,
) -> AdaptResult:
    """Adapt a prompt for a specific model.

    This is the main entry point for the Fwip library.

    Args:
        prompt: The system/instruction prompt to adapt.
        model: The target model ID (e.g., "claude-sonnet", "qwen3-32b").
        task: The task type — one of "extraction", "analysis", "generation",
              "code", "general". Defaults to "general".
        user_prompt: Optional user prompt to adapt alongside the system prompt.

    Returns:
        AdaptResult with adapted prompts, model info, and list of changes.

    Raises:
        ValueError: If model ID is not found or task type is invalid.

    Examples:
        >>> import refrase
        >>> result = fwip.adapt("You are a helpful assistant.", "claude-sonnet")
        >>> print(result.system)
        <role>
        You are a helpful assistant.
        </role>
        ...

        >>> result = fwip.adapt("Extract data from this document.", "qwen3-32b", task="extraction")
        >>> print(result.changes)
        [Change(rule='thinking-mode', ...), ...]
    """
    # Validate task type
    try:
        task_type = TaskType(task)
    except ValueError:
        valid = ", ".join(t.value for t in TaskType)
        raise ValueError(f"Invalid task: {task!r}. Must be one of: {valid}")

    # Get adapter for this model
    adapter, variant, _family = get_adapter(model)

    # Run adaptation
    return adapter.adapt(
        system=prompt,
        task=task_type,
        model_id=model,
        model_variant=variant,
        user=user_prompt,
    )


def list_models() -> list[dict[str, str]]:
    """List all supported models.

    Returns:
        List of dicts with id, family, and variant for each registered model.
    """
    return _list_models()
