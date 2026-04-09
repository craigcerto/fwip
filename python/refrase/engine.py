"""Rule engine -- reads a family config and applies matching transforms in sequence."""

from typing import Any, Optional

from refrase.transforms import TRANSFORMS


def should_apply(when: dict[str, Any], variant: str, task: str) -> bool:
    """Check if a rule's conditions match the current variant and task."""
    variants = when.get("variants") or []
    variant_match = (
        len(variants) == 0
        or "all" in variants
        or variant in variants
    )
    tasks = when.get("tasks") or []
    task_match = (
        len(tasks) == 0
        or "all" in tasks
        or task in tasks
    )
    return variant_match and task_match


def apply_rules(
    config: dict[str, Any],
    model_id: str,
    variant: str,
    task: str,
    system_prompt: str,
    user_prompt: Optional[str] = None,
) -> dict[str, Any]:
    """Apply all matching rules from a family config to produce an AdaptResult dict.

    Returns:
        Dict with keys: system, user, model_id, model_family, changes, and
        optionally api_hints.
    """
    system = system_prompt
    user: Optional[str] = user_prompt
    changes: list[dict[str, Any]] = []
    api_hints: list[dict[str, Any]] = []

    for rule in config["rules"]:
        if not should_apply(rule["when"], variant, task):
            continue

        transform = TRANSFORMS.get(rule["transform"])
        if transform is None:
            raise ValueError(
                f'Unknown transform "{rule["transform"]}" in rule '
                f'"{rule["id"]}" for family "{config["family"]}"'
            )

        # Build params: merge rule params with engine context
        params: dict[str, Any] = {
            **(rule.get("params") or {}),
            "variant": variant,
            "task": task,
        }

        target = rule["target"]
        if target == "system" or target == "both":
            system = transform(system, params)
        if (target == "user" or target == "both") and user is not None:
            user = transform(user, params)

        evidence = rule.get("evidence") or {}
        changes.append({
            "rule": rule["id"],
            "description": rule["description"],
            "evidence": evidence.get("source", ""),
            "impact": rule["impact"],
            "category": rule.get("category"),
        })

    # Collect matching API hints
    for hint in config.get("api_hints") or []:
        hint_when = hint.get("when")
        if hint_when is None or should_apply(hint_when, variant, task):
            api_hints.append({
                "parameter": hint["parameter"],
                "value": hint["value"],
                "reason": hint["reason"],
                "evidence": hint.get("evidence"),
            })

    result: dict[str, Any] = {
        "system": system,
        "user": user,
        "model_id": model_id,
        "model_family": config["family"],
        "changes": changes,
    }

    if api_hints:
        result["api_hints"] = api_hints

    return result
