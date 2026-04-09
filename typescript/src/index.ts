/**
 * Refrase — your prompts, upgraded.
 *
 * Model-specific prompt optimization library.
 *
 * @example
 * ```ts
 * import { adapt, listModels, getModelConfig } from "refrase";
 *
 * const result = adapt({ prompt: "You are a helpful assistant.", model: "claude-sonnet" });
 * console.log(result.system);
 * console.log(result.changes);
 * console.log(result.apiHints);
 *
 * const models = listModels();
 * const config = getModelConfig("claude-sonnet");
 * ```
 */
export { adapt, listModels } from "./adapt.js";
export {
  listFamilies,
  getModelConfig,
  getFamilyConfig,
  registerModel,
  registerFamily,
} from "./registry.js";
export type {
  AdaptOptions,
  AdaptResult,
  ApiHint,
  Change,
  Evidence,
  FamilyConfig,
  FamilyInfo,
  ModelConfig,
  ModelEntry,
  ModelFamily,
  ModelInfo,
  ModelRegistration,
  RuleCategory,
  RuleConfig,
  RuleWhen,
  TaskType,
  TransformFn,
} from "./types.js";
