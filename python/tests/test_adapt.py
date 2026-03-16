"""Tests for core adapt() routing and public API."""

import pytest

import fwip
from fwip.types import AdaptResult, ModelFamily


class TestAdaptBasic:
    def test_returns_adapt_result(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "deepseek-v3")
        assert isinstance(result, AdaptResult)

    def test_system_not_empty(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "deepseek-v3")
        assert len(result.system) > 0

    def test_user_none_when_not_provided(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "deepseek-v3")
        assert result.user is None

    def test_user_returned_when_provided(self, sample_extraction_system, sample_user_prompt):
        result = fwip.adapt(
            sample_extraction_system, "deepseek-v3", user_prompt=sample_user_prompt
        )
        assert result.user is not None

    def test_model_id_in_result(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "deepseek-v3")
        assert result.model_id == "deepseek-v3"

    def test_model_family_in_result(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "deepseek-v3")
        assert result.model_family == ModelFamily.DEEPSEEK

    def test_changes_list(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "deepseek-v3")
        assert isinstance(result.changes, list)
        assert len(result.changes) > 0

    def test_unknown_model_raises(self, sample_extraction_system):
        with pytest.raises(ValueError, match="Unknown model"):
            fwip.adapt(sample_extraction_system, "nonexistent-model")

    def test_invalid_task_raises(self, sample_extraction_system):
        with pytest.raises(ValueError, match="Invalid task"):
            fwip.adapt(sample_extraction_system, "deepseek-v3", task="invalid")

    def test_gemini_identity(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "gemini-pro")
        assert result.system == sample_extraction_system
        assert result.changes == []

    def test_all_task_types(self, sample_extraction_system):
        for task in ("extraction", "analysis", "generation", "code", "general"):
            result = fwip.adapt(sample_extraction_system, "claude-sonnet", task=task)
            assert isinstance(result, AdaptResult)


class TestListModels:
    def test_returns_list(self):
        models = fwip.list_models()
        assert isinstance(models, list)
        assert len(models) > 0

    def test_model_has_required_fields(self):
        models = fwip.list_models()
        for model in models:
            assert "id" in model
            assert "family" in model
            assert "variant" in model

    def test_known_models_present(self):
        models = fwip.list_models()
        ids = {m["id"] for m in models}
        assert "claude-sonnet" in ids
        assert "gpt-4o" in ids
        assert "qwen3-235b" in ids
        assert "gemini-pro" in ids
