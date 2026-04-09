/**
 * Functional test: Verify adapt() produces sensible, correct output for real prompts.
 * Not just regression — actually check the content makes sense.
 */
import { adapt, listModels, listFamilies, getModelConfig, getFamilyConfig } from "../typescript/src/index.js";

let pass = 0;
let fail = 0;
const failures: string[] = [];

function assert(condition: boolean, msg: string) {
  if (condition) {
    pass++;
  } else {
    fail++;
    failures.push(`FAIL: ${msg}`);
  }
}

// ─── 1. Claude: XML wrapping works correctly ───

const claude = adapt({
  prompt: "You are a data analyst. Extract metrics from the quarterly report.\n\n1. Read carefully\n2. Identify KPIs\n3. Format as JSON",
  model: "claude-sonnet",
  task: "extraction",
});

assert(claude.system.startsWith("<role>"), "Claude system should start with <role> tag");
assert(claude.system.includes("<role>\nYou are a data analyst."), "Claude should extract role from first line");
assert(claude.system.includes("<instructions>"), "Claude should have <instructions> tag");
assert(claude.system.includes("<output_format>"), "Claude should have <output_format> tag");
assert(!claude.system.includes("You are a data analyst.\n\n"), "Role line should NOT remain in instructions body");
assert(claude.user === null, "Claude user should be null when not provided");
assert(claude.modelFamily === "claude", "Family should be claude");
assert(claude.changes.length > 0, "Claude should have changes");
assert(claude.changes.some(c => c.category === "model_specific"), "Claude changes should include model_specific");

// Claude with user prompt
const claudeUser = adapt({
  prompt: "You are an assistant.",
  model: "claude-sonnet",
  userPrompt: "Help me with this document.",
});
assert(claudeUser.user === "Help me with this document.", "Claude should pass user prompt through unchanged");

// Claude Haiku — should simplify
const haiku = adapt({
  prompt: "You are a specialist.\n\n## Methodology\n1. Step one\n2. Step two\n3. Step three\n4. Step four\n5. Step five\n6. Step six\n7. Step seven\n8. Step eight",
  model: "claude-haiku",
});
assert(!haiku.system.includes("Step eight"), "Haiku should simplify and remove steps beyond 5");
assert(!haiku.system.includes("##"), "Haiku should strip markdown headers");
assert(haiku.system.includes("<role>"), "Haiku should still have XML tags");

// ─── 2. Qwen: Thinking prefix + language enforcement ───

const qwen = adapt({
  prompt: "Analyze this dataset.",
  model: "qwen3-235b",
  task: "analysis",
});
assert(qwen.system.startsWith("/think\n"), "Qwen 235b analysis should start with /think");
assert(qwen.system.includes("IMPORTANT: All output must be in English"), "Qwen should enforce English");
assert(qwen.system.includes("valid JSON"), "Qwen should have JSON reinforcement");

const qwenExtract = adapt({
  prompt: "Extract data.",
  model: "qwen3-235b",
  task: "extraction",
});
assert(qwenExtract.system.startsWith("/no_think\n"), "Qwen 235b extraction should start with /no_think");

const qwenNothink = adapt({
  prompt: "Extract data.",
  model: "qwen3-32b-nothink",
  task: "analysis",
});
assert(qwenNothink.system.startsWith("/no_think\n"), "Qwen 32b-nothink should always use /no_think regardless of task");

// Qwen user prompt
const qwenUser = adapt({
  prompt: "System",
  model: "qwen3-235b",
  task: "general",
  userPrompt: "User question",
});
assert(qwenUser.user?.startsWith("/think\n"), "Qwen user prompt should have /think prefix");

const qwenNothinkUser = adapt({
  prompt: "System",
  model: "qwen3-32b-nothink",
  userPrompt: "User question",
});
assert(qwenNothinkUser.user?.startsWith("/no_think\n"), "Qwen nothink user should have /no_think prefix");

// ─── 3. Gemini: No changes but has api_hints ───

const gemini = adapt({
  prompt: "Do something.",
  model: "gemini-pro",
});
assert(gemini.system === "Do something.", "Gemini should return prompt unchanged");
assert(gemini.changes.length === 0, "Gemini should have no changes");
assert(gemini.apiHints !== undefined && gemini.apiHints.length > 0, "Gemini should have api_hints (temperature)");
assert(gemini.apiHints?.[0].parameter === "temperature", "Gemini api hint should be temperature");
assert(gemini.apiHints?.[0].value === 1.0, "Gemini temperature should be 1.0");

// ─── 4. OpenAI: Grounding + reasoning for analysis ───

const gpt = adapt({
  prompt: "Evaluate the proposal.",
  model: "gpt-4o",
  task: "analysis",
});
assert(gpt.system.includes("Reasoning: high"), "GPT-4o analysis should have Reasoning: high prefix");
assert(gpt.system.includes("GROUNDING RULES"), "GPT-4o should have grounding rules");
assert(gpt.system.includes("valid JSON"), "GPT-4o should have JSON reinforcement");

const gptGeneral = adapt({
  prompt: "Write a story.",
  model: "gpt-4o",
  task: "general",
});
assert(!gptGeneral.system.includes("Reasoning: high"), "GPT-4o general should NOT have Reasoning: high");

// Mini simplification
const mini = adapt({
  prompt: "You are a helper.\n\n## Big Section\n1. One\n2. Two\n3. Three\n4. Four\n5. Five\n6. Six\n7. Seven",
  model: "gpt-4o-mini",
});
assert(!mini.system.includes("Seven"), "GPT-4o-mini should simplify and cut steps beyond 5");

// o-series api hints
const o3 = adapt({ prompt: "Solve this.", model: "o3", task: "analysis" });
assert(o3.apiHints?.some(h => h.parameter === "reasoning_effort"), "o3 should have reasoning_effort api hint");

// ─── 5. DeepSeek: Self-verification ───

const ds = adapt({ prompt: "Extract info.", model: "deepseek-v3" });
assert(ds.system.includes("Before your final answer, verify"), "DeepSeek should have self-verification");
assert(ds.system.includes("valid JSON"), "DeepSeek should have JSON reinforcement");

// ─── 6. Mistral variants ───

const magistral = adapt({ prompt: "Parse this.", model: "magistral-small" });
assert(magistral.system.includes("CRITICAL OUTPUT RULES"), "Magistral should have suppress markers");
assert(magistral.system.includes("[TOOL_CALLS]"), "Magistral should mention TOOL_CALLS suppression");

const devstral = adapt({ prompt: "Fix the code.", model: "devstral" });
assert(devstral.system.includes("string fields contain strings"), "Devstral should have type reinforcement");

const ministral3b = adapt({ prompt: "You are a specialist.\n\n1. A\n2. B\n3. C\n4. D\n5. E\n6. F", model: "ministral-3b" });
assert(!ministral3b.system.includes("6. F"), "Ministral 3B should simplify to max 3 steps");

// Ministral 3b user prompt simplification
const m3bUser = adapt({ prompt: "Sys", model: "ministral-3b", userPrompt: "1. A\n2. B\n3. C\n4. D\n5. E" });
assert(!m3bUser.user?.includes("5. E"), "Ministral 3B should simplify user prompt too");

// ─── 7. Nemotron: Small model handling ───

const nem9b = adapt({ prompt: "Analyze.", model: "nemotron-9b" });
assert(nem9b.system.includes("/think"), "Nemotron 9B should have /think prefix");
assert(nem9b.system.includes("CRITICAL OUTPUT RULES"), "Nemotron 9B should have strong JSON reinforcement");

const nem30b = adapt({ prompt: "Analyze.", model: "nemotron-30b" });
assert(!nem30b.system.includes("/think"), "Nemotron 30B should NOT have /think prefix");
assert(nem30b.system.includes("valid JSON"), "Nemotron 30B should have standard JSON reinforcement");

// ─── 8. GLM: Nested object fix + English ───

const glm = adapt({ prompt: "Process data.", model: "glm-4.7" });
assert(glm.system.includes("nested objects are properly structured"), "GLM should have nested object fix");
assert(glm.system.includes("English"), "GLM should enforce English");

// ─── 9. Kimi: K2 grounding vs K2.5 ───

const k2 = adapt({ prompt: "Analyze.", model: "kimi-k2" });
assert(k2.system.includes("Reference only the provided source material"), "Kimi K2 should have source grounding");

const k25 = adapt({ prompt: "Analyze.", model: "kimi-k2.5" });
assert(!k25.system.includes("Reference only the provided source material"), "Kimi K2.5 should NOT have K2 grounding");
assert(k25.system.includes("English"), "Kimi K2.5 should still enforce English");

// ─── 10. MiniMax: Self-verification ───

const mm = adapt({ prompt: "Generate output.", model: "minimax-m2" });
assert(mm.system.includes("Before producing your final output, verify"), "MiniMax should have self-verification (minimax style)");
assert(!mm.system.includes("Before your final answer"), "MiniMax should NOT use deepseek-style verification");

// ─── 11. API functions ───

const models = listModels();
assert(models.length === 38, `listModels should return 38, got ${models.length}`);
assert(models.every(m => m.id && m.family && m.variant), "Every model should have id, family, variant");
assert(models.every(m => m.name), "Every model should have a display name");
assert(models.every(m => m.provider), "Every model should have a provider");

const families = listFamilies();
assert(families.length === 11, `listFamilies should return 11, got ${families.length}`);

const sonnetConfig = getModelConfig("claude-sonnet");
assert(sonnetConfig.name === "Claude Sonnet 4.6", `Sonnet name should be "Claude Sonnet 4.6", got "${sonnetConfig.name}"`);
assert(sonnetConfig.family === "claude", "Sonnet family should be claude");

const claudeFamily = getFamilyConfig("claude");
assert(claudeFamily.rules.length === 2, `Claude should have 2 rules, got ${claudeFamily.rules.length}`);
assert(claudeFamily.rules.every(r => r.evidence), "Every Claude rule should have evidence");

// ─── 12. Edge cases ───

// Empty prompt
const empty = adapt({ prompt: "", model: "claude-sonnet" });
assert(empty.system.includes("<role>"), "Empty prompt should still produce XML structure");

// Very long prompt
const longPrompt = "You are an expert.\n\n" + Array.from({length: 100}, (_, i) => `${i+1}. Step ${i+1}`).join("\n");
const longHaiku = adapt({ prompt: longPrompt, model: "claude-haiku" });
assert(!longHaiku.system.includes("Step 100"), "Haiku should truncate long step lists");

// Prompt with no "You are" — should use default role
const noRole = adapt({ prompt: "Extract data from the document.", model: "claude-sonnet" });
assert(noRole.system.includes("You are a helpful assistant"), "Should use default role when no 'You are' found");

// Error handling
try {
  adapt({ prompt: "Test", model: "nonexistent" });
  assert(false, "Should throw for unknown model");
} catch {
  assert(true, "Throws for unknown model");
}

try {
  adapt({ prompt: "Test", model: "claude-sonnet", task: "invalid" as any });
  assert(false, "Should throw for invalid task");
} catch {
  assert(true, "Throws for invalid task");
}

// ─── Results ───

console.log(`\nFunctional Test: ${pass} pass, ${fail} fail\n`);
if (failures.length > 0) {
  for (const f of failures) console.log(f);
  process.exit(1);
} else {
  console.log("All functional tests passed!");
}
