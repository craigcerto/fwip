"""Tests for Qwen adaptation (config-driven)."""

import refrase


class TestQwenAdapter:
    def test_no_think_for_extraction(self, sample_extraction_system):
        result = refrase.adapt(sample_extraction_system, "qwen3-235b", task="extraction")
        assert result.system.startswith("/no_think")

    def test_think_for_analysis(self, sample_analysis_system):
        result = refrase.adapt(sample_analysis_system, "qwen3-235b", task="analysis")
        assert result.system.startswith("/think")

    def test_32b_strong_json(self, sample_extraction_system):
        result = refrase.adapt(sample_extraction_system, "qwen3-32b", task="extraction")
        assert "ENTIRE response" in result.system

    def test_enforces_english(self, sample_extraction_system):
        result = refrase.adapt(sample_extraction_system, "qwen3-235b")
        assert "English" in result.system

    def test_user_gets_think_prefix(self, sample_analysis_system, sample_user_prompt):
        result = refrase.adapt(
            sample_analysis_system, "qwen3-235b", task="analysis",
            user_prompt=sample_user_prompt,
        )
        assert result.user is not None
        assert result.user.startswith("/think")

    def test_nothink_variant(self, sample_extraction_system, sample_user_prompt):
        result = refrase.adapt(
            sample_extraction_system, "qwen3-32b-nothink",
            user_prompt=sample_user_prompt,
        )
        assert result.user is not None
        assert result.user.startswith("/no_think")
