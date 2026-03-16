"""Tests for remaining model adapters (Kimi, GLM, Nemotron, MiniMax, OpenAI, Llama, Gemini)."""

import fwip


class TestKimiAdapter:
    def test_k2_grounding(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "kimi-k2")
        system_lower = result.system.lower()
        assert "fabricate" in system_lower or "source material" in system_lower

    def test_enforces_english(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "kimi-k2")
        assert "English" in result.system


class TestGLMAdapter:
    def test_enforces_english(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "glm-4.7")
        assert "English" in result.system

    def test_nested_object_guidance(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "glm-4.7")
        assert "nested" in result.system.lower()

    def test_flash_simplifies(self, sample_analysis_system):
        flash = fwip.adapt(sample_analysis_system, "glm-4.7-flash", task="analysis")
        full = fwip.adapt(sample_analysis_system, "glm-4.7", task="analysis")
        assert len(flash.system) < len(full.system)


class TestNemotronAdapter:
    def test_9b_tier3(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "nemotron-9b")
        assert "ENTIRE response" in result.system

    def test_9b_adds_think(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "nemotron-9b")
        assert "/think" in result.system

    def test_30b_no_tier3(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "nemotron-30b")
        assert "ENTIRE response" not in result.system

    def test_12b_simplified(self, sample_analysis_system):
        result = fwip.adapt(sample_analysis_system, "nemotron-12b", task="analysis")
        assert "/think" in result.system


class TestMiniMaxAdapter:
    def test_self_verification(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "minimax-m2")
        assert "verify" in result.system.lower()


class TestOpenAIAdapter:
    def test_grounding_rules(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "gpt-4o")
        assert "GROUNDING" in result.system

    def test_reasoning_for_analysis(self, sample_analysis_system):
        result = fwip.adapt(sample_analysis_system, "gpt-4o", task="analysis")
        assert "Reasoning:" in result.system

    def test_no_reasoning_for_general(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "gpt-4o", task="general")
        assert "Reasoning:" not in result.system


class TestLlamaAdapter:
    def test_grounding(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "llama-3.1-405b")
        assert "GROUNDING" in result.system

    def test_small_simplifies(self, sample_analysis_system):
        small = fwip.adapt(sample_analysis_system, "llama-3.1-8b", task="analysis")
        large = fwip.adapt(sample_analysis_system, "llama-3.1-405b", task="analysis")
        assert len(small.system) <= len(large.system)


class TestGeminiAdapter:
    def test_identity(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "gemini-pro")
        assert result.system == sample_extraction_system
        assert result.changes == []

    def test_user_unchanged(self, sample_extraction_system, sample_user_prompt):
        result = fwip.adapt(
            sample_extraction_system, "gemini-pro", user_prompt=sample_user_prompt
        )
        assert result.user == sample_user_prompt
