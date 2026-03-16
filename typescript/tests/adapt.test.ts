import { describe, it, expect } from "vitest";
import { adapt, listModels } from "../src/index.js";

describe("adapt", () => {
  const system = "Extract data from this document.";

  it("returns an AdaptResult", () => {
    const result = adapt({ prompt: system, model: "deepseek-v3" });
    expect(result).toHaveProperty("system");
    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("modelId");
    expect(result).toHaveProperty("modelFamily");
    expect(result).toHaveProperty("changes");
  });

  it("system is not empty", () => {
    const result = adapt({ prompt: system, model: "deepseek-v3" });
    expect(result.system.length).toBeGreaterThan(0);
  });

  it("user is null when not provided", () => {
    const result = adapt({ prompt: system, model: "deepseek-v3" });
    expect(result.user).toBeNull();
  });

  it("user is returned when provided", () => {
    const result = adapt({
      prompt: system,
      model: "deepseek-v3",
      userPrompt: "User input",
    });
    expect(result.user).not.toBeNull();
  });

  it("modelId is correct", () => {
    const result = adapt({ prompt: system, model: "deepseek-v3" });
    expect(result.modelId).toBe("deepseek-v3");
  });

  it("modelFamily is correct", () => {
    const result = adapt({ prompt: system, model: "deepseek-v3" });
    expect(result.modelFamily).toBe("deepseek");
  });

  it("changes is a non-empty array", () => {
    const result = adapt({ prompt: system, model: "deepseek-v3" });
    expect(Array.isArray(result.changes)).toBe(true);
    expect(result.changes.length).toBeGreaterThan(0);
  });

  it("throws on unknown model", () => {
    expect(() =>
      adapt({ prompt: system, model: "nonexistent-model" }),
    ).toThrow("Unknown model");
  });

  it("throws on invalid task", () => {
    expect(() =>
      adapt({ prompt: system, model: "deepseek-v3", task: "invalid" as any }),
    ).toThrow("Invalid task");
  });

  it("gemini is identity", () => {
    const result = adapt({ prompt: system, model: "gemini-pro" });
    expect(result.system).toBe(system);
    expect(result.changes).toHaveLength(0);
  });

  it("supports all task types", () => {
    for (const task of [
      "extraction",
      "analysis",
      "generation",
      "code",
      "general",
    ] as const) {
      const result = adapt({ prompt: system, model: "claude-sonnet", task });
      expect(result.system.length).toBeGreaterThan(0);
    }
  });
});

describe("listModels", () => {
  it("returns a non-empty array", () => {
    const models = listModels();
    expect(models.length).toBeGreaterThan(0);
  });

  it("each model has required fields", () => {
    for (const model of listModels()) {
      expect(model).toHaveProperty("id");
      expect(model).toHaveProperty("family");
      expect(model).toHaveProperty("variant");
    }
  });

  it("includes known models", () => {
    const ids = new Set(listModels().map((m) => m.id));
    expect(ids.has("claude-sonnet")).toBe(true);
    expect(ids.has("gpt-4o")).toBe(true);
    expect(ids.has("qwen3-235b")).toBe(true);
    expect(ids.has("gemini-pro")).toBe(true);
  });
});
