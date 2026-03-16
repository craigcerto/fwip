"""Core types for the Fwip prompt adaptation library."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class TaskType(Enum):
    """The type of task the prompt is designed for."""
    EXTRACTION = "extraction"
    ANALYSIS = "analysis"
    GENERATION = "generation"
    CODE = "code"
    GENERAL = "general"


class ModelFamily(Enum):
    """Supported model families."""
    CLAUDE = "claude"
    OPENAI = "openai"
    GEMINI = "gemini"
    QWEN = "qwen"
    DEEPSEEK = "deepseek"
    MISTRAL = "mistral"
    LLAMA = "llama"
    KIMI = "kimi"
    GLM = "glm"
    NEMOTRON = "nemotron"
    MINIMAX = "minimax"


@dataclass
class Change:
    """A single adaptation change applied to a prompt."""
    rule: str
    description: str
    evidence: str
    impact: str


@dataclass
class ModelInfo:
    """Metadata about a model family's adapter."""
    family: ModelFamily
    description: str
    adaptations: list[str] = field(default_factory=list)


@dataclass
class AdaptResult:
    """Result of adapting a prompt for a specific model."""
    system: str
    user: Optional[str]
    model_id: str
    model_family: ModelFamily
    changes: list[Change] = field(default_factory=list)
