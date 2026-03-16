"""Tests for helper functions."""

from fwip.helpers import (
    add_english_enforcement,
    add_json_reinforcement,
    simplify_prompt,
    wrap_xml,
)


class TestWrapXml:
    def test_basic(self):
        result = wrap_xml("role", "You are an expert.")
        assert result == "<role>\nYou are an expert.\n</role>"

    def test_multiline(self):
        result = wrap_xml("instructions", "Step 1\nStep 2")
        assert "<instructions>" in result
        assert "</instructions>" in result
        assert "Step 1\nStep 2" in result


class TestSimplifyPrompt:
    def test_limits_steps(self):
        text = "Intro\n1. Step one\n2. Step two\n3. Step three\n4. Step four\n5. Step five\n6. Step six"
        result = simplify_prompt(text, max_steps=3)
        assert "Step one" in result
        assert "Step three" in result
        assert "Step six" not in result

    def test_strips_markdown_headers(self):
        text = "## Section Header\nContent"
        result = simplify_prompt(text)
        assert "##" not in result
        assert "Section Header" in result
        assert "Content" in result

    def test_skips_example_blocks(self):
        text = "Intro\nExample: something\n- detail 1\n- detail 2\n\nNext section"
        result = simplify_prompt(text)
        assert "Intro" in result
        assert "Next section" in result
        assert "detail 1" not in result

    def test_empty_string(self):
        result = simplify_prompt("")
        assert result == ""


class TestJsonReinforcement:
    def test_basic(self):
        result = add_json_reinforcement("Base prompt")
        assert "valid JSON" in result
        assert "Base prompt" in result

    def test_tier3(self):
        result = add_json_reinforcement("Base prompt", tier3=True)
        assert "ENTIRE response" in result
        assert "markdown code fences" in result
        assert "Base prompt" in result

    def test_tier3_stronger(self):
        basic = add_json_reinforcement("Base prompt")
        tier3 = add_json_reinforcement("Base prompt", tier3=True)
        assert len(tier3) > len(basic)


class TestEnglishEnforcement:
    def test_adds_english(self):
        result = add_english_enforcement("Base prompt")
        assert "English" in result
        assert "Base prompt" in result
