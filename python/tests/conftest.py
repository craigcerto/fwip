"""Shared test fixtures for Fwip tests."""

import pytest


@pytest.fixture
def sample_extraction_system():
    """Sample extraction system prompt."""
    return (
        "Extract comprehensive data from the provided document.\n"
        "\n"
        "EXTRACTION PRINCIPLES:\n"
        "- Extract all information as stated in the document\n"
        "- Use schema field descriptions as guidance\n"
        "- Use null for optional fields not explicitly stated\n"
        "- Use empty arrays [] for list fields with no data\n"
        "- Convert dates to YYYY-MM-DD format when possible\n"
        "\n"
        "Be thorough - capture all information present in the document."
    )


@pytest.fixture
def sample_analysis_system():
    """Sample analysis system prompt with numbered methodology."""
    return (
        "You are an analyst evaluating document quality.\n"
        "\n"
        "METHODOLOGY:\n"
        "\n"
        "1. EXTRACT ALL REQUIREMENTS\n"
        "   Parse the document and list EVERY requirement.\n"
        "\n"
        "2. ASSESS EACH REQUIREMENT\n"
        "   For EACH requirement: FULLY MET, PARTIALLY MET, or NOT MET.\n"
        "\n"
        "3. CREATE GAPS\n"
        "   For each NOT MET or PARTIALLY MET, create a gap.\n"
        "\n"
        "4. ASSIGN SEVERITY\n"
        "   Use the importance x coverage matrix.\n"
        "\n"
        "5. CALCULATE SCORE\n"
        "   Start at 100%, deduct per gap.\n"
        "\n"
        "6. GENERATE HIGHLIGHTS\n"
        "   Create a highlight for every requirement.\n"
        "\n"
        "7. IDENTIFY MATCHES\n"
        "   List all matched items."
    )


@pytest.fixture
def sample_generation_system():
    """Sample generation/writing system prompt."""
    return (
        "You are generating professional content as structured JSON.\n"
        "\n"
        "## PHILOSOPHY\n"
        "- Maximize impact using strong language\n"
        "- Maintain 100% truthfulness\n"
        "\n"
        "## CONTENT OPTIMIZATION\n"
        "### 1. ACHIEVEMENT FORMULA\n"
        'Pattern: "Accomplished [X] measured by [Y] by doing [Z]"\n'
        "\n"
        "### 2. QUANTIFICATION\n"
        "Include metrics wherever possible.\n"
        "\n"
        "### 3. KEYWORD INTEGRATION\n"
        "Naturally incorporate relevant keywords."
    )


@pytest.fixture
def sample_user_prompt():
    """Sample user prompt."""
    return "Analyze this document and extract all key information."
