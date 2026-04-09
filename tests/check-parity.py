"""Cross-language parity test: Python output must match TypeScript v1 baseline."""
import json
import sys
sys.path.insert(0, "python")

from refrase import adapt

TASKS = ["extraction", "analysis", "generation", "code", "general"]

TEST_SYSTEM = """You are an expert data extraction specialist.

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

Return a JSON object with all extracted fields."""

TEST_USER = "Extract the key information from the following document and return structured JSON."

with open("tests/snapshots/v1-baseline.json") as f:
    baseline = json.load(f)

models = list(set(k.split("::")[0] for k in baseline["results"]))
passed = 0
failed = 0
failures = []

for model_id in sorted(models):
    for task in TASKS:
        key = f"{model_id}::{task}"
        expected = baseline["results"].get(key)
        if not expected or "error" in expected:
            continue

        try:
            result = adapt(TEST_SYSTEM, model_id, task=task, user_prompt=TEST_USER)
            ok = True
            diffs = []

            if result.system != expected["system"]:
                ok = False
                # Find first difference
                min_len = min(len(result.system), len(expected["system"]))
                diff_pos = min_len
                for i in range(min_len):
                    if result.system[i] != expected["system"][i]:
                        diff_pos = i
                        break
                ctx = 40
                start = max(0, diff_pos - ctx)
                diffs.append(
                    f"  SYSTEM differs at pos {diff_pos}/{len(expected['system'])}:\n"
                    f"    expected: ...{repr(expected['system'][start:diff_pos+ctx])}...\n"
                    f"    got:      ...{repr(result.system[start:diff_pos+ctx])}..."
                )

            if result.user != expected["user"]:
                ok = False
                diffs.append(f"  USER differs")

            if ok:
                passed += 1
            else:
                failed += 1
                failures.append(f"FAIL: {key}\n" + "\n".join(diffs))
        except Exception as e:
            failed += 1
            failures.append(f"ERROR: {key} — {e}")

print(f"\nPython Parity Test: {passed} pass, {failed} fail out of {passed + failed}")

if failures:
    print("\n--- FAILURES ---\n")
    for f in failures:
        print(f)
        print()
    sys.exit(1)
else:
    print("All Python outputs match TypeScript v1 baseline!")
