"""Model registry — maps human-readable model IDs to adapters."""

from refrase.models import (
    ClaudeAdapter,
    DeepSeekAdapter,
    GeminiAdapter,
    GLMAdapter,
    KimiAdapter,
    LlamaAdapter,
    MiniMaxAdapter,
    MistralAdapter,
    NemotronAdapter,
    OpenAIAdapter,
    QwenAdapter,
)
from refrase.models._base import BaseAdapter
from refrase.types import ModelFamily

# Model ID → (adapter_class, model_variant, model_family)
_REGISTRY: dict[str, tuple[type[BaseAdapter], str, ModelFamily]] = {
    # Claude
    "claude-sonnet": (ClaudeAdapter, "sonnet", ModelFamily.CLAUDE),
    "claude-opus": (ClaudeAdapter, "opus", ModelFamily.CLAUDE),
    "claude-haiku": (ClaudeAdapter, "haiku", ModelFamily.CLAUDE),
    # OpenAI
    "gpt-4o": (OpenAIAdapter, "4o", ModelFamily.OPENAI),
    "gpt-4o-mini": (OpenAIAdapter, "mini", ModelFamily.OPENAI),
    "gpt-4": (OpenAIAdapter, "4", ModelFamily.OPENAI),
    "o1": (OpenAIAdapter, "o1", ModelFamily.OPENAI),
    "o1-mini": (OpenAIAdapter, "mini", ModelFamily.OPENAI),
    "o3": (OpenAIAdapter, "o3", ModelFamily.OPENAI),
    "o3-mini": (OpenAIAdapter, "mini", ModelFamily.OPENAI),
    # Gemini
    "gemini-pro": (GeminiAdapter, "pro", ModelFamily.GEMINI),
    "gemini-flash": (GeminiAdapter, "flash", ModelFamily.GEMINI),
    "gemini-ultra": (GeminiAdapter, "ultra", ModelFamily.GEMINI),
    # Qwen
    "qwen3-235b": (QwenAdapter, "235b", ModelFamily.QWEN),
    "qwen3-32b": (QwenAdapter, "32b", ModelFamily.QWEN),
    "qwen3-32b-nothink": (QwenAdapter, "32b-nothink", ModelFamily.QWEN),
    "qwen3-coder": (QwenAdapter, "coder", ModelFamily.QWEN),
    # DeepSeek
    "deepseek-v3": (DeepSeekAdapter, "v3", ModelFamily.DEEPSEEK),
    "deepseek-v3.1": (DeepSeekAdapter, "v3.1", ModelFamily.DEEPSEEK),
    "deepseek-v3.2": (DeepSeekAdapter, "v3.2", ModelFamily.DEEPSEEK),
    # Mistral
    "mistral-large": (MistralAdapter, "large", ModelFamily.MISTRAL),
    "magistral-small": (MistralAdapter, "magistral", ModelFamily.MISTRAL),
    "devstral": (MistralAdapter, "devstral", ModelFamily.MISTRAL),
    "ministral-14b": (MistralAdapter, "ministral-14b", ModelFamily.MISTRAL),
    "ministral-8b": (MistralAdapter, "ministral-8b", ModelFamily.MISTRAL),
    "ministral-3b": (MistralAdapter, "ministral-3b", ModelFamily.MISTRAL),
    # Llama
    "llama-3.1-405b": (LlamaAdapter, "405b", ModelFamily.LLAMA),
    "llama-3.1-70b": (LlamaAdapter, "70b", ModelFamily.LLAMA),
    "llama-3.1-8b": (LlamaAdapter, "8b", ModelFamily.LLAMA),
    "llama-3.2-3b": (LlamaAdapter, "3b", ModelFamily.LLAMA),
    # Kimi
    "kimi-k2": (KimiAdapter, "k2", ModelFamily.KIMI),
    "kimi-k2.5": (KimiAdapter, "k25", ModelFamily.KIMI),
    # GLM
    "glm-4.7": (GLMAdapter, "4.7", ModelFamily.GLM),
    "glm-4.7-flash": (GLMAdapter, "flash", ModelFamily.GLM),
    # Nemotron
    "nemotron-30b": (NemotronAdapter, "30b", ModelFamily.NEMOTRON),
    "nemotron-12b": (NemotronAdapter, "12b", ModelFamily.NEMOTRON),
    "nemotron-9b": (NemotronAdapter, "9b", ModelFamily.NEMOTRON),
    # MiniMax
    "minimax-m2": (MiniMaxAdapter, "m2", ModelFamily.MINIMAX),
}


def get_adapter(model_id: str) -> tuple[BaseAdapter, str, ModelFamily]:
    """Get the adapter instance, variant, and family for a model ID.

    Args:
        model_id: Human-readable model ID (e.g., "claude-sonnet", "qwen3-32b").

    Returns:
        Tuple of (adapter_instance, model_variant, model_family).

    Raises:
        ValueError: If model_id is not found in the registry.
    """
    if model_id not in _REGISTRY:
        raise ValueError(
            f"Unknown model: {model_id!r}. "
            f"Available models: {', '.join(sorted(_REGISTRY.keys()))}"
        )
    adapter_cls, variant, family = _REGISTRY[model_id]
    return adapter_cls(), variant, family


def list_models() -> list[dict[str, str]]:
    """List all registered models.

    Returns:
        List of dicts with id, family, and variant for each model.
    """
    return [
        {"id": model_id, "family": family.value, "variant": variant}
        for model_id, (_, variant, family) in sorted(_REGISTRY.items())
    ]


def list_families() -> list[str]:
    """List all supported model families.

    Returns:
        Sorted list of unique model family names.
    """
    return sorted({family.value for _, (_, _, family) in _REGISTRY.items()})
