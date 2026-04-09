"""Core adaptation routing -- the main entry point for Refrase."""

from typing import Optional

from refrase.engine import apply_rules
from refrase.registry import _get_entry, list_models as _list_models
from refrase.types import AdaptResult, ApiHint, Change, Evidence, ModelFamily, TaskType


def adapt(
    prompt: str,
    model: str,
    task: str = "general",
    user_prompt: Optional[str] = None,
) -> AdaptResult:
    """Adapt a prompt for a specific model.

    This is the main entry point for the Refrase library.

    Args:
        prompt: The system/instruction prompt to adapt.
        model: The target model ID (e.g., "claude-sonnet", "qwen3-32b").
        task: The task type -- one of "extraction", "analysis", "generation",
              "code", "general". Defaults to "general".
        user_prompt: Optional user prompt to adapt alongside the system prompt.

    Returns:
        AdaptResult with adapted prompts, model info, and list of changes.

    Raises:
        ValueError: If model ID is not found or task type is invalid.

    Examples:
        >>> import refrase
        >>> result = refrase.adapt("You are a helpful assistant.", "claude-sonnet")
        >>> print(result.system)
        <role>
        You are a helpful assistant.
        </role>
        ...

        >>> result = refrase.adapt("Extract data.", "qwen3-32b", task="extraction")
        >>> print(result.changes)
        [Change(rule='...', ...), ...]
    """
    # Validate task type
    try:
        TaskType(task)
    except ValueError:
        valid = ", ".join(t.value for t in TaskType)
        raise ValueError(f"Invalid task: {task!r}. Must be one of: {valid}")

    # Look up model in registry
    family_config, model_config, canonical_id = _get_entry(model)

    # Run the rule engine
    result = apply_rules(
        config=family_config,
        model_id=model,
        variant=model_config["variant"],
        task=task,
        system_prompt=prompt,
        user_prompt=user_prompt,
    )

    # Convert raw dicts to typed dataclasses
    changes = [
        Change(
            rule=c["rule"],
            description=c["description"],
            evidence=c["evidence"],
            impact=c["impact"],
            category=c.get("category"),
        )
        for c in result["changes"]
    ]

    api_hints = None
    if "api_hints" in result:
        api_hints = [
            ApiHint(
                parameter=h["parameter"],
                value=h["value"],
                reason=h["reason"],
                evidence=(
                    Evidence(**h["evidence"]) if h.get("evidence") else None
                ),
            )
            for h in result["api_hints"]
        ]

    return AdaptResult(
        system=result["system"],
        user=result["user"],
        model_id=result["model_id"],
        model_family=ModelFamily(result["model_family"]),
        changes=changes,
        api_hints=api_hints,
    )


def list_models() -> list[dict[str, str]]:
    """List all supported models.

    Returns:
        List of dicts with id, family, variant, name, and provider for each model.
    """
    return _list_models()
