/**
 * Config loader — imports all family configs and exports them as a single record.
 *
 * JSON files are resolved at build time via tsconfig resolveJsonModule: true.
 */
import type { FamilyConfig } from "../types.js";

import claude from "./claude.json" with { type: "json" };
import openai from "./openai.json" with { type: "json" };
import gemini from "./gemini.json" with { type: "json" };
import qwen from "./qwen.json" with { type: "json" };
import deepseek from "./deepseek.json" with { type: "json" };
import mistral from "./mistral.json" with { type: "json" };
import llama from "./llama.json" with { type: "json" };
import kimi from "./kimi.json" with { type: "json" };
import glm from "./glm.json" with { type: "json" };
import nemotron from "./nemotron.json" with { type: "json" };
import minimax from "./minimax.json" with { type: "json" };

/** All built-in family configs, keyed by family name. */
export const CONFIGS: Record<string, FamilyConfig> = {
  claude: claude as unknown as FamilyConfig,
  openai: openai as unknown as FamilyConfig,
  gemini: gemini as unknown as FamilyConfig,
  qwen: qwen as unknown as FamilyConfig,
  deepseek: deepseek as unknown as FamilyConfig,
  mistral: mistral as unknown as FamilyConfig,
  llama: llama as unknown as FamilyConfig,
  kimi: kimi as unknown as FamilyConfig,
  glm: glm as unknown as FamilyConfig,
  nemotron: nemotron as unknown as FamilyConfig,
  minimax: minimax as unknown as FamilyConfig,
};
