import { describe, it, expect } from "vitest";
import { adapt } from "../../src/index.js";

const system = "You are an analyst evaluating quality.\n\nMETHODOLOGY:\n\n1. Step one\n2. Step two\n3. Step three\n4. Step four\n5. Step five\n6. Step six\n7. Step seven";
const extraction = "Extract comprehensive data from the provided document.\n\nPRINCIPLES:\n- Use null for optional fields\n- Convert dates to YYYY-MM-DD";

describe("ClaudeAdapter", () => {
  it("uses XML tags", () => {
    const result = adapt({ prompt: extraction, model: "claude-sonnet" });
    expect(result.system).toContain("<role>");
    expect(result.system).toContain("</role>");
    expect(result.system).toContain("<instructions>");
    expect(result.system).toContain("</instructions>");
  });

  it("has output_format tag", () => {
    const result = adapt({ prompt: extraction, model: "claude-sonnet" });
    expect(result.system).toContain("<output_format>");
  });

  it("haiku simplifies", () => {
    const haiku = adapt({ prompt: system, model: "claude-haiku" });
    const sonnet = adapt({ prompt: system, model: "claude-sonnet" });
    expect(haiku.system.length).toBeLessThan(sonnet.system.length);
  });

  it("preserves core content", () => {
    const result = adapt({ prompt: extraction, model: "claude-sonnet" });
    expect(result.system).toContain("null");
    expect(result.system).toContain("YYYY-MM-DD");
  });

  it("extracts role", () => {
    const result = adapt({ prompt: system, model: "claude-sonnet" });
    expect(result.system).toContain("<role>");
    expect(result.system.toLowerCase()).toContain("analyst");
  });

  it("user unchanged", () => {
    const result = adapt({
      prompt: extraction,
      model: "claude-sonnet",
      userPrompt: "test",
    });
    expect(result.user).toBe("test");
  });

  it("changes include xml-structure", () => {
    const result = adapt({ prompt: extraction, model: "claude-sonnet" });
    const rules = result.changes.map((c) => c.rule);
    expect(rules).toContain("claude-xml-wrap");
  });

  it("haiku changes include simplification", () => {
    const result = adapt({ prompt: extraction, model: "claude-haiku" });
    const rules = result.changes.map((c) => c.rule);
    expect(rules).toContain("claude-xml-wrap-haiku");
  });
});
