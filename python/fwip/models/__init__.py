"""Model-specific prompt adapters."""

from fwip.models._base import BaseAdapter
from fwip.models.claude import ClaudeAdapter
from fwip.models.openai import OpenAIAdapter
from fwip.models.gemini import GeminiAdapter
from fwip.models.qwen import QwenAdapter
from fwip.models.deepseek import DeepSeekAdapter
from fwip.models.mistral import MistralAdapter
from fwip.models.llama import LlamaAdapter
from fwip.models.kimi import KimiAdapter
from fwip.models.glm import GLMAdapter
from fwip.models.nemotron import NemotronAdapter
from fwip.models.minimax import MiniMaxAdapter

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
