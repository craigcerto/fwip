"""Tests for the model registry."""

import pytest

from refrase.registry import get_adapter, list_families, list_models
from refrase.models._base import BaseAdapter
from refrase.types import ModelFamily


class TestGetAdapter:
    def test_returns_tuple(self):
        adapter, variant, family = get_adapter("claude-sonnet")
        assert isinstance(adapter, BaseAdapter)
        assert isinstance(variant, str)
        assert isinstance(family, ModelFamily)

    def test_claude_family(self):
        _, _, family = get_adapter("claude-sonnet")
        assert family == ModelFamily.CLAUDE

    def test_openai_family(self):
        _, _, family = get_adapter("gpt-4o")
        assert family == ModelFamily.OPENAI

    def test_unknown_raises(self):
        with pytest.raises(ValueError, match="Unknown model"):
            get_adapter("not-a-model")

    def test_error_lists_available(self):
        with pytest.raises(ValueError, match="claude-sonnet"):
            get_adapter("not-a-model")


class TestListModels:
    def test_returns_list(self):
        models = list_models()
        assert isinstance(models, list)
        assert len(models) > 30  # We have 39 models

    def test_sorted(self):
        models = list_models()
        ids = [m["id"] for m in models]
        assert ids == sorted(ids)


class TestListFamilies:
    def test_returns_list(self):
        families = list_families()
        assert isinstance(families, list)

    def test_contains_all_families(self):
        families = list_families()
        expected = {"claude", "openai", "gemini", "qwen", "deepseek", "mistral",
                    "llama", "kimi", "glm", "nemotron", "minimax"}
        assert expected == set(families)
