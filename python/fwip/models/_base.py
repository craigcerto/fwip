"""Base adapter interface for all model-family adapters."""

from abc import ABC, abstractmethod
from typing import Optional

from fwip.types import AdaptResult, Change, ModelFamily, ModelInfo, TaskType


class BaseAdapter(ABC):
    """Abstract base class for model-specific prompt adapters.

    To add a new model adapter:
    1. Create a new file in fwip/models/ (e.g., mymodel.py)
    2. Subclass BaseAdapter
    3. Implement adapt_system(), adapt_user(), get_changes(), get_model_info()
    4. Register the adapter in fwip/registry.py
    5. Add tests in tests/test_models/
    """

    @abstractmethod
    def adapt_system(
        self,
        system: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        """Adapt the system prompt for this model family.

        Args:
            system: The base system prompt text.
            task: The task type (extraction, analysis, generation, code, general).
            model_variant: Optional model variant (e.g., "haiku", "32b", "flash").

        Returns:
            The adapted system prompt.
        """

    def adapt_user(
        self,
        user: str,
        task: TaskType,
        model_variant: str = "",
    ) -> str:
        """Adapt the user prompt for this model family.

        Default implementation returns the user prompt unchanged.
        Override in subclasses that need user prompt adaptation.

        Args:
            user: The base user prompt text.
            task: The task type.
            model_variant: Optional model variant.

        Returns:
            The adapted user prompt.
        """
        return user

    @abstractmethod
    def get_changes(self, task: TaskType, model_variant: str = "") -> list[Change]:
        """Return the list of changes this adapter applies.

        Args:
            task: The task type.
            model_variant: Optional model variant.

        Returns:
            List of Change objects describing what was modified and why.
        """

    @abstractmethod
    def get_model_info(self) -> ModelInfo:
        """Return metadata about this model family's adapter.

        Returns:
            ModelInfo with family, description, and list of adaptations.
        """

    def adapt(
        self,
        system: str,
        task: TaskType,
        model_id: str,
        model_variant: str = "",
        user: Optional[str] = None,
    ) -> AdaptResult:
        """Full adaptation pipeline — adapts system and user prompts.

        Args:
            system: The base system prompt.
            task: The task type.
            model_id: The model identifier string.
            model_variant: Optional model variant.
            user: Optional user prompt to adapt.

        Returns:
            AdaptResult with adapted prompts, model info, and change list.
        """
        adapted_system = self.adapt_system(system, task, model_variant)
        adapted_user = self.adapt_user(user, task, model_variant) if user else None
        changes = self.get_changes(task, model_variant)
        info = self.get_model_info()

        return AdaptResult(
            system=adapted_system,
            user=adapted_user,
            model_id=model_id,
            model_family=info.family,
            changes=changes,
        )
