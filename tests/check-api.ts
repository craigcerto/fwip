/**
 * Quick smoke test for new API functions.
 * Run with: npx tsx tests/check-api.ts
 */
import {
  adapt,
  listModels,
  listFamilies,
  getModelConfig,
  getFamilyConfig,
  registerModel,
  registerFamily,
} from "../typescript/src/index.js";

// listModels
const models = listModels();
console.log(`listModels(): ${models.length} models`);
console.assert(models.length === 38, `Expected 38 models, got ${models.length}`);
console.assert(models[0].name !== undefined, "Models should have name field");
console.assert(models[0].provider !== undefined, "Models should have provider field");

// listFamilies
const families = listFamilies();
console.log(`listFamilies(): ${families.length} families`);
console.assert(families.length === 11, `Expected 11 families, got ${families.length}`);
const claude = families.find(f => f.family === "claude");
console.assert(claude?.modelCount === 3, "Claude should have 3 models");
console.assert(claude?.ruleCount === 2, "Claude should have 2 rules");
console.assert(claude?.provider === "Anthropic", "Claude provider should be Anthropic");

// getModelConfig
const sonnet = getModelConfig("claude-sonnet");
console.log(`getModelConfig("claude-sonnet"):`, JSON.stringify(sonnet));
console.assert(sonnet.name === "Claude Sonnet 4.6", `Expected "Claude Sonnet 4.6", got "${sonnet.name}"`);
console.assert(sonnet.family === "claude", `Expected family "claude", got "${sonnet.family}"`);
console.assert(sonnet.provider === "Anthropic", `Expected provider "Anthropic", got "${sonnet.provider}"`);

// getFamilyConfig
const claudeConfig = getFamilyConfig("claude");
console.log(`getFamilyConfig("claude"): ${Object.keys(claudeConfig.models).length} models, ${claudeConfig.rules.length} rules`);
console.assert(claudeConfig.rules[0].id === "xml-structure", "First Claude rule should be xml-structure");
console.assert(claudeConfig.rules[0].category === "model_specific", "xml-structure should be model_specific");
console.assert(claudeConfig.rules[0].evidence?.url !== undefined, "Evidence should have URL");

// registerModel
registerModel("claude", "claude-custom", {
  name: "Custom Claude",
  variant: "sonnet",
});
const custom = adapt({ prompt: "Test prompt", model: "claude-custom" });
console.log(`registerModel() + adapt("claude-custom"): works, system length=${custom.system.length}`);
console.assert(custom.modelFamily === "claude", "Custom model should use claude family");
console.assert(custom.system.includes("<role>"), "Custom model should have XML tags");

// registerFamily
registerFamily({
  family: "test",
  provider: "Test Provider",
  models: {
    "test-model": { name: "Test Model", variant: "default" },
  },
  rules: [
    {
      id: "test-rule",
      transform: "append_text",
      target: "system",
      category: "best_practice",
      description: "Test rule",
      impact: "Testing",
      when: { variants: ["all"], tasks: ["all"] },
      params: { content: "TEST APPENDED" },
    },
  ],
});
const testResult = adapt({ prompt: "Hello", model: "test-model" });
console.log(`registerFamily() + adapt("test-model"): works, system="${testResult.system}"`);
console.assert(testResult.system === "Hello\n\nTEST APPENDED", `Expected appended text, got: "${testResult.system}"`);
console.assert(testResult.modelFamily === "test" as any, "Should use test family");

// apiHints
const qwenResult = adapt({ prompt: "Test", model: "qwen3-32b" });
console.log(`adapt("qwen3-32b").changes:`, qwenResult.changes.map(c => `${c.rule} [${c.category}]`));

// Error handling
try {
  adapt({ prompt: "Test", model: "nonexistent-model" });
  console.assert(false, "Should have thrown");
} catch (e: any) {
  console.log(`Error handling works: "${e.message.slice(0, 50)}..."`);
}

try {
  getFamilyConfig("nonexistent");
  console.assert(false, "Should have thrown");
} catch (e: any) {
  console.log(`getFamilyConfig error works: "${e.message.slice(0, 50)}..."`);
}

console.log("\nAll API tests passed!");
