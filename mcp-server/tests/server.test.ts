import { describe, it, expect } from "vitest";
import { adapt, listModels } from "fwip";

// We test the core logic that the MCP server wraps, since testing
// the actual MCP server requires stdio transport setup.

describe("MCP server tools logic", () => {
  describe("adapt_prompt", () => {
    it("adapts a prompt for claude-sonnet", () => {
      const result = adapt({
        prompt: "You are a helpful assistant.",
        model: "claude-sonnet",
      });
      expect(result.system).toContain("<role>");
      expect(result.changes.length).toBeGreaterThan(0);
    });

    it("handles user prompt", () => {
      const result = adapt({
        prompt: "You are a helpful assistant.",
        model: "claude-sonnet",
        userPrompt: "Help me write code.",
      });
      expect(result.user).toBe("Help me write code.");
    });

    it("handles all task types", () => {
      for (const task of [
        "extraction",
        "analysis",
        "generation",
        "code",
        "general",
      ] as const) {
        const result = adapt({
          prompt: "Test prompt.",
          model: "claude-sonnet",
          task,
        });
        expect(result.system.length).toBeGreaterThan(0);
      }
    });

    it("throws on invalid model", () => {
      expect(() =>
        adapt({ prompt: "Test", model: "nonexistent" }),
      ).toThrow("Unknown model");
    });

    it("throws on invalid task", () => {
      expect(() =>
        adapt({ prompt: "Test", model: "claude-sonnet", task: "invalid" as any }),
      ).toThrow("Invalid task");
    });
  });

  describe("list_models", () => {
    it("returns all registered models", () => {
      const models = listModels();
      expect(models.length).toBeGreaterThan(30);
    });

    it("models have required fields", () => {
      for (const model of listModels()) {
        expect(model).toHaveProperty("id");
        expect(model).toHaveProperty("family");
        expect(model).toHaveProperty("variant");
      }
    });

    it("includes models from all families", () => {
      const families = new Set(listModels().map((m) => m.family));
      expect(families.size).toBe(11);
    });
  });

  describe("explain_adaptation", () => {
    it("returns changes for claude-sonnet", () => {
      const result = adapt({
        prompt: "You are a helpful assistant.",
        model: "claude-sonnet",
        task: "general",
      });
      const rules = result.changes.map((c) => c.rule);
      expect(rules).toContain("xml-structure");
      expect(rules).toContain("role-extraction");
    });

    it("returns empty changes for gemini", () => {
      const result = adapt({
        prompt: "You are a helpful assistant.",
        model: "gemini-pro",
        task: "general",
      });
      expect(result.changes).toHaveLength(0);
    });

    it("each change has all fields", () => {
      const result = adapt({
        prompt: "You are a helpful assistant.",
        model: "qwen3-235b",
        task: "analysis",
      });
      for (const change of result.changes) {
        expect(change).toHaveProperty("rule");
        expect(change).toHaveProperty("description");
        expect(change).toHaveProperty("evidence");
        expect(change).toHaveProperty("impact");
      }
    });
  });
});
