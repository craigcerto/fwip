import { describe, it, expect } from "vitest";
import { adapt } from "../../src/index.js";

const extraction = "Extract data from this document.\n\nPRINCIPLES:\n- Use null\n- Be thorough";
const analysis = "You are an analyst.\n\nMETHODOLOGY:\n1. Step one\n2. Step two\n3. Step three\n4. Step four\n5. Step five\n6. Step six\n7. Step seven";

describe("QwenAdapter", () => {
  it("no_think for extraction", () => {
    const r = adapt({ prompt: extraction, model: "qwen3-235b", task: "extraction" });
    expect(r.system.startsWith("/no_think")).toBe(true);
  });
  it("think for analysis", () => {
    const r = adapt({ prompt: analysis, model: "qwen3-235b", task: "analysis" });
    expect(r.system.startsWith("/think")).toBe(true);
  });
  it("32b has tier3", () => {
    const r = adapt({ prompt: extraction, model: "qwen3-32b", task: "extraction" });
    expect(r.system).toContain("ENTIRE response");
  });
  it("enforces English", () => {
    const r = adapt({ prompt: extraction, model: "qwen3-235b" });
    expect(r.system).toContain("English");
  });
  it("user gets think prefix", () => {
    const r = adapt({ prompt: analysis, model: "qwen3-235b", task: "analysis", userPrompt: "test" });
    expect(r.user!.startsWith("/think")).toBe(true);
  });
  it("nothink variant", () => {
    const r = adapt({ prompt: extraction, model: "qwen3-32b-nothink", userPrompt: "test" });
    expect(r.user!.startsWith("/no_think")).toBe(true);
  });
});

describe("DeepSeekAdapter", () => {
  it("adds self-verification", () => {
    const r = adapt({ prompt: extraction, model: "deepseek-v3" });
    expect(r.system.toLowerCase()).toContain("verify");
  });
  it("adds JSON", () => {
    const r = adapt({ prompt: extraction, model: "deepseek-v3" });
    expect(r.system).toContain("JSON");
  });
});

describe("MistralAdapter", () => {
  it("large adds JSON", () => {
    const r = adapt({ prompt: extraction, model: "mistral-large" });
    expect(r.system).toContain("JSON");
  });
  it("large adds step-by-step for analysis", () => {
    const r = adapt({ prompt: analysis, model: "mistral-large", task: "analysis" });
    expect(r.system).toContain("methodically");
  });
  it("magistral suppresses tool calls", () => {
    const r = adapt({ prompt: extraction, model: "magistral-small" });
    expect(r.system).toContain("[TOOL_CALLS]");
    expect(r.system).toContain("[THINK]");
  });
  it("ministral 3b simplifies", () => {
    const r3b = adapt({ prompt: analysis, model: "ministral-3b", task: "analysis" });
    const r14b = adapt({ prompt: analysis, model: "ministral-14b", task: "analysis" });
    expect(r3b.system.length).toBeLessThan(r14b.system.length);
  });
  it("devstral type reinforcement", () => {
    const r = adapt({ prompt: extraction, model: "devstral" });
    expect(r.system).toContain("Type mismatches");
  });
});

describe("KimiAdapter", () => {
  it("k2 grounding", () => {
    const r = adapt({ prompt: extraction, model: "kimi-k2" });
    expect(r.system.toLowerCase()).toContain("fabricate");
  });
  it("enforces English", () => {
    const r = adapt({ prompt: extraction, model: "kimi-k2" });
    expect(r.system).toContain("English");
  });
});

describe("GLMAdapter", () => {
  it("enforces English", () => {
    const r = adapt({ prompt: extraction, model: "glm-4.7" });
    expect(r.system).toContain("English");
  });
  it("nested object guidance", () => {
    const r = adapt({ prompt: extraction, model: "glm-4.7" });
    expect(r.system.toLowerCase()).toContain("nested");
  });
  it("flash simplifies", () => {
    const flash = adapt({ prompt: analysis, model: "glm-4.7-flash", task: "analysis" });
    const full = adapt({ prompt: analysis, model: "glm-4.7", task: "analysis" });
    expect(flash.system.length).toBeLessThan(full.system.length);
  });
});

describe("NemotronAdapter", () => {
  it("9b has tier3", () => {
    const r = adapt({ prompt: extraction, model: "nemotron-9b" });
    expect(r.system).toContain("ENTIRE response");
  });
  it("9b has think", () => {
    const r = adapt({ prompt: extraction, model: "nemotron-9b" });
    expect(r.system).toContain("/think");
  });
  it("30b no tier3", () => {
    const r = adapt({ prompt: extraction, model: "nemotron-30b" });
    expect(r.system).not.toContain("ENTIRE response");
  });
});

describe("MiniMaxAdapter", () => {
  it("self verification", () => {
    const r = adapt({ prompt: extraction, model: "minimax-m2" });
    expect(r.system.toLowerCase()).toContain("verify");
  });
});

describe("OpenAIAdapter", () => {
  it("grounding rules", () => {
    const r = adapt({ prompt: extraction, model: "gpt-4o" });
    expect(r.system).toContain("GROUNDING");
  });
  it("reasoning for analysis", () => {
    const r = adapt({ prompt: analysis, model: "gpt-4o", task: "analysis" });
    expect(r.system).toContain("Reasoning:");
  });
  it("no reasoning for general", () => {
    const r = adapt({ prompt: extraction, model: "gpt-4o", task: "general" });
    expect(r.system).not.toContain("Reasoning:");
  });
});

describe("LlamaAdapter", () => {
  it("grounding", () => {
    const r = adapt({ prompt: extraction, model: "llama-3.1-405b" });
    expect(r.system).toContain("GROUNDING");
  });
  it("small simplifies", () => {
    const small = adapt({ prompt: analysis, model: "llama-3.1-8b", task: "analysis" });
    const large = adapt({ prompt: analysis, model: "llama-3.1-405b", task: "analysis" });
    expect(small.system.length).toBeLessThanOrEqual(large.system.length);
  });
});

describe("GeminiAdapter", () => {
  it("identity", () => {
    const r = adapt({ prompt: extraction, model: "gemini-pro" });
    expect(r.system).toBe(extraction);
    expect(r.changes).toHaveLength(0);
  });
  it("user unchanged", () => {
    const r = adapt({ prompt: extraction, model: "gemini-pro", userPrompt: "test" });
    expect(r.user).toBe("test");
  });
});
