"""Tests for DeepSeek adapter."""

import fwip


class TestDeepSeekAdapter:
    def test_adds_self_verification(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "deepseek-v3")
        assert "verify" in result.system.lower()

    def test_adds_json(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "deepseek-v3")
        assert "JSON" in result.system

    def test_preserves_methodology(self, sample_analysis_system):
        result = fwip.adapt(sample_analysis_system, "deepseek-v3", task="analysis")
        assert "METHODOLOGY" in result.system
