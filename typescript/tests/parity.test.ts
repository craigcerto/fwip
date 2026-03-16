import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { adapt } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesPath = resolve(__dirname, "../../python/tests/test_fixtures.json");
const fixtures = JSON.parse(readFileSync(fixturesPath, "utf-8"));

const systemPrompts: Record<string, string> = {
  extraction: fixtures.fixtures.extraction_system,
  analysis: fixtures.fixtures.analysis_system,
  generation: fixtures.fixtures.generation_system,
};

describe("Python-TypeScript parity", () => {
  for (const [modelId, tasks] of Object.entries(
    fixtures.expected as Record<string, any>,
  )) {
    describe(modelId, () => {
      for (const [task, expectations] of Object.entries(
        tasks as Record<string, any>,
      )) {
        it(`${task}: matches expected behavior`, () => {
          const prompt = systemPrompts[task] || systemPrompts.extraction;
          const userPrompt = fixtures.fixtures.user_prompt;

          const result = adapt({
            prompt,
            model: modelId,
            task: task as any,
            userPrompt,
          });

          const exp = expectations as any;

          if (exp.system_contains) {
            for (const substr of exp.system_contains) {
              expect(result.system).toContain(substr);
            }
          }

          if (exp.system_not_contains) {
            for (const substr of exp.system_not_contains) {
              expect(result.system).not.toContain(substr);
            }
          }

          if (exp.system_starts_with) {
            expect(result.system.startsWith(exp.system_starts_with)).toBe(true);
          }

          if (exp.system_unchanged) {
            expect(result.system).toBe(prompt);
          }

          if (exp.user_unchanged) {
            expect(result.user).toBe(userPrompt);
          }

          if (exp.user_starts_with) {
            expect(result.user).not.toBeNull();
            expect(result.user!.startsWith(exp.user_starts_with)).toBe(true);
          }
        });
      }
    });
  }
});
