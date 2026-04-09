"""Core types for the Refrase prompt adaptation library."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Literal, Optional


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


# Rule category indicating the basis for an adaptation.
RuleCategory = Literal["model_specific", "best_practice", "compensation"]


@dataclass
class Evidence:
    """Structured evidence citation for a rule."""
    source: str
    url: Optional[str] = None
    quote: Optional[str] = None
    finding: Optional[str] = None


@dataclass
class ApiHint:
    """Recommended API parameter for a model."""
    parameter: str
    value: Any
    reason: str
    evidence: Optional[Evidence] = None


@dataclass
class Change:
    """A single adaptation change applied to a prompt."""
    rule: str
    description: str
    evidence: str
    impact: str
    category: Optional[str] = None


@dataclass
class ModelInfo:
    """Metadata about a model family's adapter."""
    family: ModelFamily
    description: str
    adaptations: list[str] = field(default_factory=list)


@dataclass
class FamilyInfo:
    """Summary info about a model family."""
    family: str
    provider: str
    docs_url: Optional[str] = None
    model_count: int = 0
    rule_count: int = 0


@dataclass
class AdaptResult:
    """Result of adapting a prompt for a specific model."""
    system: str
    user: Optional[str]
    model_id: str
    model_family: ModelFamily
    changes: list[Change] = field(default_factory=list)
    api_hints: Optional[list[ApiHint]] = None
