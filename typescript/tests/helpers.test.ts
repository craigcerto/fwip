import { describe, it, expect } from "vitest";
import { wrapXml } from "../src/helpers/xml.js";
import { simplifyPrompt } from "../src/helpers/simplify.js";
import { addJsonReinforcement } from "../src/helpers/jsonReinforcement.js";
import { addEnglishEnforcement } from "../src/helpers/language.js";

describe("wrapXml", () => {
  it("wraps content in XML tags", () => {
    expect(wrapXml("role", "You are an expert.")).toBe(
      "<role>\nYou are an expert.\n</role>",
    );
  });

  it("handles multiline content", () => {
    const result = wrapXml("instructions", "Step 1\nStep 2");
    expect(result).toContain("<instructions>");
    expect(result).toContain("</instructions>");
    expect(result).toContain("Step 1\nStep 2");
  });
});

describe("simplifyPrompt", () => {
  it("limits numbered steps", () => {
    const text =
      "Intro\n1. Step one\n2. Step two\n3. Step three\n4. Step four\n5. Step five\n6. Step six";
    const result = simplifyPrompt(text, 3);
    expect(result).toContain("Step one");
    expect(result).toContain("Step three");
    expect(result).not.toContain("Step six");
  });

  it("strips markdown headers", () => {
    const result = simplifyPrompt("## Section Header\nContent");
    expect(result).not.toContain("##");
    expect(result).toContain("Section Header");
    expect(result).toContain("Content");
  });

  it("handles empty string", () => {
    expect(simplifyPrompt("")).toBe("");
  });
});

describe("addJsonReinforcement", () => {
  it("adds basic JSON guidance", () => {
    const result = addJsonReinforcement("Base prompt");
    expect(result).toContain("valid JSON");
    expect(result).toContain("Base prompt");
  });

  it("adds tier3 strong guidance", () => {
    const result = addJsonReinforcement("Base prompt", true);
    expect(result).toContain("ENTIRE response");
    expect(result).toContain("markdown code fences");
  });

  it("tier3 is longer than basic", () => {
    const basic = addJsonReinforcement("Base prompt");
    const tier3 = addJsonReinforcement("Base prompt", true);
    expect(tier3.length).toBeGreaterThan(basic.length);
  });
});

describe("addEnglishEnforcement", () => {
  it("adds English instruction", () => {
    const result = addEnglishEnforcement("Base prompt");
    expect(result).toContain("English");
    expect(result).toContain("Base prompt");
  });
});
