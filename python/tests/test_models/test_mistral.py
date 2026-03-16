"""Tests for Mistral adapter (Large, Magistral, Devstral, Ministral)."""

import refrase


class TestMistralLargeAdapter:
    def test_adds_json(self, sample_extraction_system):
        result = refrase.adapt(sample_extraction_system, "mistral-large")
        assert "JSON" in result.system

    def test_analysis_adds_step_by_step(self, sample_analysis_system):
        result = refrase.adapt(sample_analysis_system, "mistral-large", task="analysis")
        assert "methodically" in result.system


class TestMagistralAdapter:
    def test_suppresses_tool_calls(self, sample_extraction_system):
        result = refrase.adapt(sample_extraction_system, "magistral-small")
        assert "[TOOL_CALLS]" in result.system
        assert "Do NOT" in result.system

    def test_suppresses_think_blocks(self, sample_extraction_system):
        result = refrase.adapt(sample_extraction_system, "magistral-small")
        assert "[THINK]" in result.system


class TestMinistralAdapter:
    def test_3b_simplifies(self, sample_analysis_system):
        result_3b = refrase.adapt(sample_analysis_system, "ministral-3b", task="analysis")
        result_14b = refrase.adapt(sample_analysis_system, "ministral-14b", task="analysis")
        assert len(result_3b.system) < len(result_14b.system)

    def test_all_sizes_have_json(self, sample_extraction_system):
        for model_id in ("ministral-3b", "ministral-8b", "ministral-14b"):
            result = refrase.adapt(sample_extraction_system, model_id)
            assert "JSON" in result.system

    def test_3b_simplifies_user(self, sample_analysis_system, sample_user_prompt):
        result = refrase.adapt(
            sample_analysis_system, "ministral-3b", task="analysis",
            user_prompt=sample_user_prompt,
        )
        assert result.user is not None


class TestDevstralAdapter:
    def test_type_reinforcement(self, sample_extraction_system):
        result = refrase.adapt(sample_extraction_system, "devstral")
        assert "string fields" in result.system or "Type mismatches" in result.system
