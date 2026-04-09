/**
 * Regression tests: Verify new config-driven engine matches v1 baseline.
 */
import { describe, it, expect } from "vitest";
import { adapt, listModels } from "../src/index.js";
import baseline from "../../tests/snapshots/v1-baseline.json";

const TASKS = ["extraction", "analysis", "generation", "code", "general"] as const;

const TEST_SYSTEM_PROMPT = `You are an expert data extraction specialist.

## Methodology
1. Read the document carefully
2. Identify all key entities
3. Extract structured data
4. Validate completeness
5. Format as JSON
6. Cross-reference sources
7. Handle edge cases
8. Final quality check

Example: Extract name, title, and company from a business card.
- Name: "John Smith"
- Title: "Senior Engineer"

Return a JSON object with all extracted fields.`;

const TEST_USER_PROMPT =
  "Extract the key information from the following document and return structured JSON.";

describe("Regression: v2 matches v1 baseline", () => {
  const models = listModels();

  for (const model of models) {
    for (const task of TASKS) {
      const key = `${model.id}::${task}`;
      const expected = (baseline as any).results[key];

      if (!expected || expected.error) continue;

      it(`${key}: system prompt matches`, () => {
        const result = adapt({
          prompt: TEST_SYSTEM_PROMPT,
          model: model.id,
          task,
          userPrompt: TEST_USER_PROMPT,
        });
        expect(result.system).toBe(expected.system);
      });

      it(`${key}: user prompt matches`, () => {
        const result = adapt({
          prompt: TEST_SYSTEM_PROMPT,
          model: model.id,
          task,
          userPrompt: TEST_USER_PROMPT,
        });
        expect(result.user).toBe(expected.user);
      });

      it(`${key}: model family matches`, () => {
        const result = adapt({
          prompt: TEST_SYSTEM_PROMPT,
          model: model.id,
          task,
          userPrompt: TEST_USER_PROMPT,
        });
        expect(result.modelFamily).toBe(expected.modelFamily);
      });
    }
  }
});
