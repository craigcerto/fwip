"""Tests for the config-driven model registry."""

import pytest

from refrase.registry import (
    _get_entry,
    get_family_config,
    get_model_config,
    list_families,
    list_models,
    register_family,
    register_model,
)


class TestGetEntry:
    def test_returns_tuple(self):
        family_config, model_config, model_id = _get_entry("claude-sonnet")
        assert isinstance(family_config, dict)
        assert isinstance(model_config, dict)
        assert isinstance(model_id, str)

    def test_claude_family(self):
        family_config, _, _ = _get_entry("claude-sonnet")
        assert family_config["family"] == "claude"

    def test_openai_family(self):
        family_config, _, _ = _get_entry("gpt-4o")
        assert family_config["family"] == "openai"

    def test_unknown_raises(self):
        with pytest.raises(ValueError, match="Unknown model"):
            _get_entry("not-a-model")

    def test_error_lists_available(self):
        with pytest.raises(ValueError, match="claude-sonnet"):
            _get_entry("not-a-model")


class TestListModels:
    def test_returns_list(self):
        models = list_models()
        assert isinstance(models, list)
        assert len(models) > 30  # We have ~38 models

    def test_sorted(self):
        models = list_models()
        ids = [m["id"] for m in models]
        assert ids == sorted(ids)

    def test_has_required_fields(self):
        models = list_models()
        for model in models:
            assert "id" in model
            assert "family" in model
            assert "variant" in model


class TestListFamilies:
    def test_returns_list(self):
        families = list_families()
        assert isinstance(families, list)

    def test_contains_all_families(self):
        families = list_families()
        family_names = {f["family"] for f in families}
        expected = {"claude", "openai", "gemini", "qwen", "deepseek", "mistral",
                    "llama", "kimi", "glm", "nemotron", "minimax"}
        assert expected == family_names

    def test_family_has_summary_fields(self):
        families = list_families()
        for f in families:
            assert "family" in f
            assert "provider" in f
            assert "model_count" in f
            assert "rule_count" in f


class TestGetModelConfig:
    def test_returns_dict(self):
        config = get_model_config("claude-sonnet")
        assert isinstance(config, dict)
        assert config["family"] == "claude"
        assert config["provider"] == "Anthropic"
        assert "variant" in config

    def test_unknown_raises(self):
        with pytest.raises(ValueError, match="Unknown model"):
            get_model_config("not-a-model")


class TestGetFamilyConfig:
    def test_returns_dict(self):
        config = get_family_config("claude")
        assert config["family"] == "claude"
        assert "rules" in config
        assert "models" in config

    def test_unknown_raises(self):
        with pytest.raises(ValueError, match="Unknown family"):
            get_family_config("not-a-family")


class TestRegisterModel:
    def test_register_and_lookup(self):
        register_model("claude", "claude-test-custom", {
            "name": "Test Custom",
            "variant": "sonnet",
        })
        config = get_model_config("claude-test-custom")
        assert config["name"] == "Test Custom"
        assert config["family"] == "claude"

    def test_unknown_family_raises(self):
        with pytest.raises(ValueError, match="unknown family"):
            register_model("nonexistent-family", "test-model", {
                "name": "Test",
                "variant": "test",
            })


class TestRegisterFamily:
    def test_register_and_lookup(self):
        register_family({
            "family": "test-family",
            "provider": "TestCo",
            "models": {
                "test-model-1": {"name": "Test Model 1", "variant": "base"},
            },
            "rules": [],
        })
        config = get_family_config("test-family")
        assert config["family"] == "test-family"
        assert config["provider"] == "TestCo"
