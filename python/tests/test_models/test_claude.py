"""Tests for Claude adapter."""

import fwip


class TestClaudeAdapter:
    def test_uses_xml_tags(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "claude-sonnet")
        assert "<role>" in result.system
        assert "</role>" in result.system
        assert "<instructions>" in result.system
        assert "</instructions>" in result.system

    def test_has_output_format_tag(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "claude-sonnet")
        assert "<output_format>" in result.system

    def test_haiku_simplifies(self, sample_analysis_system):
        haiku = fwip.adapt(sample_analysis_system, "claude-haiku")
        sonnet = fwip.adapt(sample_analysis_system, "claude-sonnet")
        assert len(haiku.system) < len(sonnet.system)

    def test_preserves_core_content(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "claude-sonnet")
        assert "null" in result.system
        assert "YYYY-MM-DD" in result.system

    def test_role_extracted(self, sample_analysis_system):
        result = fwip.adapt(sample_analysis_system, "claude-sonnet")
        assert "<role>" in result.system
        assert "analyst" in result.system.lower()

    def test_user_unchanged(self, sample_extraction_system, sample_user_prompt):
        result = fwip.adapt(sample_extraction_system, "claude-sonnet", user_prompt=sample_user_prompt)
        assert result.user == sample_user_prompt

    def test_changes_include_xml(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "claude-sonnet")
        rules = [c.rule for c in result.changes]
        assert "xml-structure" in rules

    def test_haiku_changes_include_simplification(self, sample_extraction_system):
        result = fwip.adapt(sample_extraction_system, "claude-haiku")
        rules = [c.rule for c in result.changes]
        assert "simplification" in rules
