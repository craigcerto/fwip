/**
 * Regression test: Compare new config-driven engine against v1 baseline.
 * Run with: npx tsx tests/check-regression.ts
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

const baseline = JSON.parse(fs.readFileSync("tests/snapshots/v1-baseline.json", "utf-8"));

const models = listModels();
let pass = 0;
let fail = 0;
const failures: string[] = [];

for (const model of models) {
  for (const task of TASKS) {
    const key = `${model.id}::${task}`;
    const expected = baseline.results[key];

    if (!expected) {
      // Model might be new (not in baseline)
      continue;
    }

    if (expected.error) {
      // Baseline had an error — skip
      continue;
    }

    try {
      const result = adapt({
        prompt: TEST_SYSTEM_PROMPT,
        model: model.id,
        task,
        userPrompt: TEST_USER_PROMPT,
      });

      let ok = true;
      const diffs: string[] = [];

      if (result.system !== expected.system) {
        ok = false;
        // Find first difference
        const minLen = Math.min(result.system.length, expected.system.length);
        let diffPos = -1;
        for (let i = 0; i < minLen; i++) {
          if (result.system[i] !== expected.system[i]) {
            diffPos = i;
            break;
          }
        }
        if (diffPos === -1) diffPos = minLen;

        const ctx = 40;
        const start = Math.max(0, diffPos - ctx);
        diffs.push(
          `  SYSTEM differs at pos ${diffPos}/${expected.system.length}:\n` +
          `    expected: ...${JSON.stringify(expected.system.slice(start, diffPos + ctx))}...\n` +
          `    got:      ...${JSON.stringify(result.system.slice(start, diffPos + ctx))}...`
        );
      }

      if (result.user !== expected.user) {
        ok = false;
        diffs.push(`  USER differs:\n    expected: ${JSON.stringify(expected.user?.slice(0, 100))}\n    got:      ${JSON.stringify(result.user?.slice(0, 100))}`);
      }

      if (result.modelFamily !== expected.modelFamily) {
        ok = false;
        diffs.push(`  FAMILY: expected "${expected.modelFamily}", got "${result.modelFamily}"`);
      }

      if (ok) {
        pass++;
      } else {
        fail++;
        failures.push(`FAIL: ${key}\n${diffs.join("\n")}`);
      }
    } catch (err: any) {
      fail++;
      failures.push(`ERROR: ${key} — ${err.message}`);
    }
  }
}

console.log(`\nRegression Test Results: ${pass} pass, ${fail} fail out of ${pass + fail} total`);

if (failures.length > 0) {
  console.log(`\n--- FAILURES ---\n`);
  for (const f of failures) {
    console.log(f);
    console.log();
  }
  process.exit(1);
} else {
  console.log("All outputs match v1 baseline!");
}
