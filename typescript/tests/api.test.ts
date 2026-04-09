/**
 * Tests for new public API functions.
 */
import { describe, it, expect } from "vitest";
import {
  adapt,
  listModels,
  listFamilies,
  getModelConfig,
  getFamilyConfig,
  registerModel,
  registerFamily,
} from "../src/index.js";

describe("listModels", () => {
  it("returns 38 built-in models", () => {
    const models = listModels();
    expect(models.length).toBe(38);
  });

  it("models are sorted by ID", () => {
    const models = listModels();
    const ids = models.map((m) => m.id);
    expect(ids).toEqual([...ids].sort());
  });

  it("models include name and provider", () => {
    const models = listModels();
    for (const m of models) {
      expect(m.name).toBeDefined();
      expect(m.provider).toBeDefined();
      expect(m.family).toBeDefined();
      expect(m.variant).toBeDefined();
    }
  });
});

describe("listFamilies", () => {
  it("returns 11 built-in families", () => {
    const families = listFamilies();
    expect(families.length).toBe(11);
  });

  it("families include model and rule counts", () => {
    const families = listFamilies();
    const claude = families.find((f) => f.family === "claude");
    expect(claude).toBeDefined();
    expect(claude!.modelCount).toBe(3);
    expect(claude!.ruleCount).toBe(2);
    expect(claude!.provider).toBe("Anthropic");
  });

  it("gemini has 0 rules", () => {
    const families = listFamilies();
    const gemini = families.find((f) => f.family === "gemini");
    expect(gemini!.ruleCount).toBe(0);
  });
});

describe("getModelConfig", () => {
  it("returns config with family info", () => {
    const config = getModelConfig("claude-sonnet");
    expect(config.family).toBe("claude");
    expect(config.provider).toBe("Anthropic");
    expect(config.variant).toBe("sonnet");
    expect(config.name).toContain("Claude");
  });

  it("throws for unknown model", () => {
    expect(() => getModelConfig("nonexistent")).toThrow("Unknown model");
  });
});

describe("getFamilyConfig", () => {
  it("returns full family config", () => {
    const config = getFamilyConfig("claude");
    expect(config.family).toBe("claude");
    expect(Object.keys(config.models).length).toBe(3);
    expect(config.rules.length).toBe(2);
  });

  it("rules have required fields", () => {
    const config = getFamilyConfig("claude");
    for (const rule of config.rules) {
      expect(rule.id).toBeDefined();
      expect(rule.transform).toBeDefined();
      expect(rule.target).toBeDefined();
      expect(rule.category).toBeDefined();
      expect(rule.description).toBeDefined();
      expect(rule.when).toBeDefined();
    }
  });

  it("throws for unknown family", () => {
    expect(() => getFamilyConfig("nonexistent")).toThrow("Unknown family");
  });
});

describe("registerModel", () => {
  it("registers a new model in existing family", () => {
    registerModel("openai", "gpt-custom", {
      name: "Custom GPT",
      variant: "4o",
    });
    const result = adapt({ prompt: "Test", model: "gpt-custom" });
    expect(result.modelFamily).toBe("openai");
    expect(result.changes.length).toBeGreaterThan(0);
  });

  it("throws for unknown family", () => {
    expect(() =>
      registerModel("nonexistent", "model", {
        name: "Model",
        variant: "v1",
      }),
    ).toThrow("unknown family");
  });
});

describe("registerFamily", () => {
  it("registers a new family with custom rules", () => {
    registerFamily({
      family: "custom",
      provider: "Custom Corp",
      models: {
        "custom-model": { name: "Custom Model", variant: "default" },
      },
      rules: [
        {
          id: "custom-rule",
          transform: "append_text",
          target: "system",
          category: "best_practice",
          description: "Custom rule",
          impact: "Testing",
          when: { variants: ["all"], tasks: ["all"] },
          params: { content: "CUSTOM" },
        },
      ],
    });

    const result = adapt({ prompt: "Hello", model: "custom-model" });
    expect(result.system).toBe("Hello\n\nCUSTOM");
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].rule).toBe("custom-rule");
    expect(result.changes[0].category).toBe("best_practice");
  });
});

describe("adapt", () => {
  it("returns apiHints when model has them", () => {
    // Register a model with api hints
    registerFamily({
      family: "hinted",
      provider: "Test",
      models: { "hinted-model": { name: "Hinted", variant: "default" } },
      rules: [],
      api_hints: [
        {
          parameter: "temperature",
          value: 0.6,
          reason: "Test hint",
        },
      ],
    });
    const result = adapt({ prompt: "Test", model: "hinted-model" });
    expect(result.apiHints).toBeDefined();
    expect(result.apiHints!.length).toBe(1);
    expect(result.apiHints![0].parameter).toBe("temperature");
    expect(result.apiHints![0].value).toBe(0.6);
  });

  it("omits apiHints when model has none", () => {
    // Gemini now has api_hints — use a family without any
    const result = adapt({ prompt: "Test", model: "minimax-m2" });
    expect(result.apiHints).toBeUndefined();
  });

  it("changes include category", () => {
    const result = adapt({ prompt: "Test", model: "claude-sonnet" });
    expect(result.changes.length).toBeGreaterThan(0);
    for (const change of result.changes) {
      expect(change.category).toBeDefined();
    }
  });

  it("throws for invalid task", () => {
    expect(() =>
      adapt({ prompt: "Test", model: "claude-sonnet", task: "invalid" as any }),
    ).toThrow("Invalid task");
  });

  it("throws for unknown model", () => {
    expect(() => adapt({ prompt: "Test", model: "nonexistent" })).toThrow(
      "Unknown model",
    );
  });
});
