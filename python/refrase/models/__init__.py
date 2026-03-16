"""Model-specific prompt adapters."""

from refrase.models._base import BaseAdapter
from refrase.models.claude import ClaudeAdapter
from refrase.models.openai import OpenAIAdapter
from refrase.models.gemini import GeminiAdapter
from refrase.models.qwen import QwenAdapter
from refrase.models.deepseek import DeepSeekAdapter
from refrase.models.mistral import MistralAdapter
from refrase.models.llama import LlamaAdapter
from refrase.models.kimi import KimiAdapter
from refrase.models.glm import GLMAdapter
from refrase.models.nemotron import NemotronAdapter
from refrase.models.minimax import MiniMaxAdapter

__all__ = [
    "BaseAdapter",
    "ClaudeAdapter",
    "OpenAIAdapter",
    "GeminiAdapter",
    "QwenAdapter",
    "DeepSeekAdapter",
    "MistralAdapter",
    "LlamaAdapter",
    "KimiAdapter",
    "GLMAdapter",
    "NemotronAdapter",
    "MiniMaxAdapter",
]
