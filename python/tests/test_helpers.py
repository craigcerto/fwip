"""Tests for transform functions (replacement for old helper tests)."""

from refrase.transforms import simplify, xml_wrap, json_reinforce, language_enforce
from refrase.transforms.xml_wrap import _wrap_xml


class TestWrapXml:
    def test_basic(self):
        result = _wrap_xml("role", "You are an expert.")
        assert result == "<role>\nYou are an expert.\n</role>"

    def test_multiline(self):
        result = _wrap_xml("instructions", "Step 1\nStep 2")
        assert "<instructions>" in result
        assert "</instructions>" in result
        assert "Step 1\nStep 2" in result


class TestSimplifyPrompt:
    def test_limits_steps(self):
        text = "Intro\n1. Step one\n2. Step two\n3. Step three\n4. Step four\n5. Step five\n6. Step six"
        result = simplify(text, {"max_steps": 3})
        assert "Step one" in result
        assert "Step three" in result
        assert "Step six" not in result

    def test_strips_markdown_headers(self):
        text = "## Section Header\nContent"
        result = simplify(text, {})
        assert "##" not in result
        assert "Section Header" in result
        assert "Content" in result

    def test_skips_example_blocks(self):
        text = "Intro\nExample: something\n- detail 1\n- detail 2\n\nNext section"
        result = simplify(text, {})
        assert "Intro" in result
        assert "Next section" in result
        assert "detail 1" not in result

    def test_empty_string(self):
        result = simplify("", {})
        assert result == ""


class TestJsonReinforcement:
    def test_basic(self):
        result = json_reinforce("Base prompt", {})
        assert "valid JSON" in result
        assert "Base prompt" in result

    def test_strong_tier(self):
        result = json_reinforce("Base prompt", {"tier": "strong"})
        assert "ENTIRE response" in result
        assert "markdown code fences" in result
        assert "Base prompt" in result

    def test_strong_tier_longer(self):
        basic = json_reinforce("Base prompt", {})
        strong = json_reinforce("Base prompt", {"tier": "strong"})
        assert len(strong) > len(basic)


class TestLanguageEnforcement:
    def test_adds_english(self):
        result = language_enforce("Base prompt", {})
        assert "English" in result
        assert "Base prompt" in result
