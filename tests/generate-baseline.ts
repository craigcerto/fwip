/**
 * Generate v1 baseline snapshot of all adapt() outputs.
 * Run with: npx tsx tests/generate-baseline.ts
 */
import { adapt, listModels } from "../typescript/src/index.js";
import fs from "fs";

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

const TEST_USER_PROMPT = "Extract the key information from the following document and return structured JSON.";

const models = listModels();
const snapshot: Record<string, any> = {
  _generated: new Date().toISOString(),
  _version: "1.0.0",
  _models: models.length,
  _tasks: TASKS.length,
  _total: models.length * TASKS.length,
  results: {},
};

for (const model of models) {
  for (const task of TASKS) {
    const key = `${model.id}::${task}`;
    try {
      const result = adapt({
        prompt: TEST_SYSTEM_PROMPT,
        model: model.id,
        task,
        userPrompt: TEST_USER_PROMPT,
      });
      snapshot.results[key] = {
        system: result.system,
        user: result.user,
        modelId: result.modelId,
        modelFamily: result.modelFamily,
        changesCount: result.changes.length,
        changeRules: result.changes.map(c => c.rule),
      };
    } catch (err: any) {
      snapshot.results[key] = { error: err.message };
    }
  }
}

const json = JSON.stringify(snapshot, null, 2);
fs.writeFileSync("tests/snapshots/v1-baseline.json", json);
console.log(`Generated baseline: ${Object.keys(snapshot.results).length} results from ${models.length} models × ${TASKS.length} tasks`);
