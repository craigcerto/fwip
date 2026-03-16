import type { BaseAdapter } from "./models/base.js";
import type { ModelEntry, ModelFamily } from "./types.js";

import { ClaudeAdapter } from "./models/claude.js";
import { OpenAIAdapter } from "./models/openai.js";
import { GeminiAdapter } from "./models/gemini.js";
import { QwenAdapter } from "./models/qwen.js";
import { DeepSeekAdapter } from "./models/deepseek.js";
import { MistralAdapter } from "./models/mistral.js";
import { LlamaAdapter } from "./models/llama.js";
import { KimiAdapter } from "./models/kimi.js";
import { GLMAdapter } from "./models/glm.js";
import { NemotronAdapter } from "./models/nemotron.js";
import { MiniMaxAdapter } from "./models/minimax.js";

type RegistryEntry = [new () => BaseAdapter, string, ModelFamily];

const REGISTRY: Record<string, RegistryEntry> = {
  // Claude
  "claude-sonnet": [ClaudeAdapter, "sonnet", "claude"],
  "claude-opus": [ClaudeAdapter, "opus", "claude"],
  "claude-haiku": [ClaudeAdapter, "haiku", "claude"],
  // OpenAI
  "gpt-4o": [OpenAIAdapter, "4o", "openai"],
  "gpt-4o-mini": [OpenAIAdapter, "mini", "openai"],
  "gpt-4": [OpenAIAdapter, "4", "openai"],
  "o1": [OpenAIAdapter, "o1", "openai"],
  "o1-mini": [OpenAIAdapter, "mini", "openai"],
  "o3": [OpenAIAdapter, "o3", "openai"],
  "o3-mini": [OpenAIAdapter, "mini", "openai"],
  // Gemini
  "gemini-pro": [GeminiAdapter, "pro", "gemini"],
  "gemini-flash": [GeminiAdapter, "flash", "gemini"],
  "gemini-ultra": [GeminiAdapter, "ultra", "gemini"],
  // Qwen
  "qwen3-235b": [QwenAdapter, "235b", "qwen"],
  "qwen3-32b": [QwenAdapter, "32b", "qwen"],
  "qwen3-32b-nothink": [QwenAdapter, "32b-nothink", "qwen"],
  "qwen3-coder": [QwenAdapter, "coder", "qwen"],
  // DeepSeek
  "deepseek-v3": [DeepSeekAdapter, "v3", "deepseek"],
  "deepseek-v3.1": [DeepSeekAdapter, "v3.1", "deepseek"],
  "deepseek-v3.2": [DeepSeekAdapter, "v3.2", "deepseek"],
  // Mistral
  "mistral-large": [MistralAdapter, "large", "mistral"],
  "magistral-small": [MistralAdapter, "magistral", "mistral"],
  "devstral": [MistralAdapter, "devstral", "mistral"],
  "ministral-14b": [MistralAdapter, "ministral-14b", "mistral"],
  "ministral-8b": [MistralAdapter, "ministral-8b", "mistral"],
  "ministral-3b": [MistralAdapter, "ministral-3b", "mistral"],
  // Llama
  "llama-3.1-405b": [LlamaAdapter, "405b", "llama"],
  "llama-3.1-70b": [LlamaAdapter, "70b", "llama"],
  "llama-3.1-8b": [LlamaAdapter, "8b", "llama"],
  "llama-3.2-3b": [LlamaAdapter, "3b", "llama"],
  // Kimi
  "kimi-k2": [KimiAdapter, "k2", "kimi"],
  "kimi-k2.5": [KimiAdapter, "k25", "kimi"],
  // GLM
  "glm-4.7": [GLMAdapter, "4.7", "glm"],
  "glm-4.7-flash": [GLMAdapter, "flash", "glm"],
  // Nemotron
  "nemotron-30b": [NemotronAdapter, "30b", "nemotron"],
  "nemotron-12b": [NemotronAdapter, "12b", "nemotron"],
  "nemotron-9b": [NemotronAdapter, "9b", "nemotron"],
  // MiniMax
  "minimax-m2": [MiniMaxAdapter, "m2", "minimax"],
};

export function getAdapter(
  modelId: string,
): { adapter: BaseAdapter; variant: string; family: ModelFamily } {
  const entry = REGISTRY[modelId];
  if (!entry) {
    const available = Object.keys(REGISTRY).sort().join(", ");
    throw new Error(
      `Unknown model: "${modelId}". Available models: ${available}`,
    );
  }
  const [AdapterClass, variant, family] = entry;
  return { adapter: new AdapterClass(), variant, family };
}

export function listModels(): ModelEntry[] {
  return Object.entries(REGISTRY)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, [, variant, family]]) => ({ id, family, variant }));
}

export function listFamilies(): string[] {
  const families = new Set<string>();
  for (const [, [, , family]] of Object.entries(REGISTRY)) {
    families.add(family);
  }
  return [...families].sort();
}
