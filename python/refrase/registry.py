"""Config-driven model registry.

Loads all built-in family configs at import time and builds a lookup index.
Supports runtime registration of custom models and families.
"""

import json
from importlib import resources
from typing import Any, Optional


# ── Internal state ──

_registry: dict[str, dict[str, Any]] = {}  # model_id -> RegistryEntry
_families: dict[str, dict[str, Any]] = {}  # family_name -> FamilyConfig


def _load_configs() -> dict[str, dict[str, Any]]:
    """Load all built-in JSON family configs from the configs/ package directory."""
    configs: dict[str, dict[str, Any]] = {}
    config_dir = resources.files("refrase") / "configs"
    for path in config_dir.iterdir():
        if hasattr(path, "name") and path.name.endswith(".json"):
            config = json.loads(path.read_text())
            configs[config["family"]] = config
    return configs


def _register_family_internal(config: dict[str, Any]) -> None:
    """Register a family and all its models in the internal registry."""
    _families[config["family"]] = config
    for model_id, model_cfg in config["models"].items():
        entry = {
            "family_config": config,
            "model_config": model_cfg,
            "model_id": model_id,
        }
        _registry[model_id] = entry
        # Register aliases
        for alias in model_cfg.get("aliases") or []:
            _registry[alias] = entry


def _init() -> None:
    """Initialize registry from built-in configs."""
    for config in _load_configs().values():
        _register_family_internal(config)


# Initialize on load
_init()


# ── Internal API ──

def _get_entry(model_id: str) -> tuple[dict[str, Any], dict[str, Any], str]:
    """Look up a registry entry by model ID.

    Returns:
        Tuple of (family_config, model_config, canonical_model_id).

    Raises:
        ValueError: If model_id is not found.
    """
    entry = _registry.get(model_id)
    if entry is None:
        available = ", ".join(sorted(_registry.keys()))
        raise ValueError(
            f'Unknown model: "{model_id}". Available models: {available}'
        )
    return entry["family_config"], entry["model_config"], entry["model_id"]


# ── Public API ──

def list_models() -> list[dict[str, Any]]:
    """List all registered models, sorted by ID.

    Returns:
        List of dicts with id, family, variant, name, provider.
    """
    seen: set[str] = set()
    entries: list[dict[str, Any]] = []

    for id_, entry in _registry.items():
        # Skip aliases (where the registered ID differs from the canonical modelId)
        if id_ != entry["model_id"]:
            continue
        if id_ in seen:
            continue
        seen.add(id_)

        entries.append({
            "id": id_,
            "family": entry["family_config"]["family"],
            "variant": entry["model_config"]["variant"],
            "name": entry["model_config"].get("name"),
            "provider": entry["family_config"].get("provider"),
        })

    return sorted(entries, key=lambda e: e["id"])


def list_families() -> list[dict[str, Any]]:
    """List all registered families with summary info.

    Returns:
        List of dicts with family, provider, docs_url, model_count, rule_count.
    """
    infos: list[dict[str, Any]] = []
    for config in _families.values():
        infos.append({
            "family": config["family"],
            "provider": config["provider"],
            "docs_url": config.get("docs_url"),
            "model_count": len(config["models"]),
            "rule_count": len(config["rules"]),
        })
    return sorted(infos, key=lambda i: i["family"])


def get_model_config(model_id: str) -> dict[str, Any]:
    """Get the full config for a specific model.

    Returns:
        Dict with model config fields plus family, provider, docs_url.
    """
    family_config, model_config, _ = _get_entry(model_id)
    return {
        **model_config,
        "family": family_config["family"],
        "provider": family_config["provider"],
        "docs_url": family_config.get("docs_url"),
    }


def get_family_config(family: str) -> dict[str, Any]:
    """Get the full family config.

    Raises:
        ValueError: If family is not found.
    """
    import copy
    config = _families.get(family)
    if config is None:
        available = ", ".join(sorted(_families.keys()))
        raise ValueError(
            f'Unknown family: "{family}". Available families: {available}'
        )
    return copy.deepcopy(config)


def register_model(
    family: str,
    model_id: str,
    config: dict[str, Any],
) -> None:
    """Register a custom model at runtime, associating it with an existing family.

    The model will inherit the family's rules and API hints.

    Args:
        family: The family name to associate the model with.
        model_id: The model identifier.
        config: Dict with name, variant, and optionally tier and aliases.

    Raises:
        ValueError: If the family is not found.
    """
    family_config = _families.get(family)
    if family_config is None:
        raise ValueError(
            f'Cannot register model "{model_id}": unknown family "{family}". '
            f"Register the family first with register_family()."
        )

    model_config = {
        "name": config["name"],
        "variant": config["variant"],
        "tier": config.get("tier"),
        "aliases": config.get("aliases"),
    }

    # Add to the family config's models
    family_config["models"][model_id] = model_config

    # Add to registry
    entry = {
        "family_config": family_config,
        "model_config": model_config,
        "model_id": model_id,
    }
    _registry[model_id] = entry

    for alias in config.get("aliases") or []:
        _registry[alias] = entry


def register_family(config: dict[str, Any]) -> None:
    """Register a custom model family at runtime with its own rules.

    If the family already exists, it will be overwritten.
    """
    _register_family_internal(config)
