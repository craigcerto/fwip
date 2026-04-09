import { describe, it, expect } from "vitest";
import {
  xmlWrap,
  simplify,
  jsonReinforce,
  languageEnforce,
} from "../src/transforms/index.js";

describe("xmlWrap", () => {
  it("wraps content in XML tags with role extraction", () => {
    const result = xmlWrap("You are an expert.\nDo things.", {});
    expect(result).toContain("<role>\nYou are an expert.\n</role>");
    expect(result).toContain("<instructions>\nDo things.\n</instructions>");
    expect(result).toContain("<output_format>");
  });

  it("uses default role when none found", () => {
    const result = xmlWrap("Just some instructions.", {});
    expect(result).toContain(
      "<role>\nYou are a helpful assistant.\n</role>",
    );
  });
});

describe("simplify", () => {
  it("limits numbered steps", () => {
    const text =
      "Intro\n1. Step one\n2. Step two\n3. Step three\n4. Step four\n5. Step five\n6. Step six";
    const result = simplify(text, { max_steps: 3 });
    expect(result).toContain("Step one");
    expect(result).toContain("Step three");
    expect(result).not.toContain("Step six");
  });

  it("strips markdown headers", () => {
    const result = simplify("## Section Header\nContent", {});
    expect(result).not.toContain("##");
    expect(result).toContain("Section Header");
    expect(result).toContain("Content");
  });

  it("handles empty string", () => {
    expect(simplify("", {})).toBe("");
  });
});

describe("jsonReinforce", () => {
  it("adds basic JSON guidance", () => {
    const result = jsonReinforce("Base prompt", {});
    expect(result).toContain("valid JSON");
    expect(result).toContain("Base prompt");
  });

  it("adds strong guidance", () => {
    const result = jsonReinforce("Base prompt", { tier: "strong" });
    expect(result).toContain("ENTIRE response");
    expect(result).toContain("markdown code fences");
  });

  it("strong is longer than standard", () => {
    const basic = jsonReinforce("Base prompt", {});
    const strong = jsonReinforce("Base prompt", { tier: "strong" });
    expect(strong.length).toBeGreaterThan(basic.length);
  });
});

describe("languageEnforce", () => {
  it("adds English instruction", () => {
    const result = languageEnforce("Base prompt", {});
    expect(result).toContain("English");
    expect(result).toContain("Base prompt");
  });
});
