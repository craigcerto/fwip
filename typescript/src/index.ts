/**
 * Refrase — your prompts, upgraded.
 *
 * Model-specific prompt optimization library.
 *
 * @example
 * ```ts
 * import { adapt, listModels } from "refrase";
 *
 * const result = adapt({ prompt: "You are a helpful assistant.", model: "claude-sonnet" });
 * console.log(result.system);
 * console.log(result.changes);
 *
 * const models = listModels();
 * ```
 */
export { adapt, listModels } from "./adapt.js";
export type {
  AdaptOptions,
  AdaptResult,
  Change,
  ModelEntry,
  ModelFamily,
  ModelInfo,
  TaskType,
} from "./types.js";
