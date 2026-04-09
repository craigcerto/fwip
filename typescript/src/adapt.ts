import { _getEntry, listModels as _listModels } from "./registry.js";
import { applyRules } from "./engine.js";
import type { AdaptOptions, AdaptResult, ModelEntry, TaskType } from "./types.js";

const VALID_TASKS: TaskType[] = [
  "extraction",
  "analysis",
  "generation",
  "code",
  "general",
];

/**
 * Adapt a prompt for a specific model.
 *
 * @example
 * ```ts
 * import { adapt } from "refrase";
 * const result = adapt({ prompt: "You are a helpful assistant.", model: "claude-sonnet" });
 * console.log(result.system);
 * ```
 */
export function adapt(options: AdaptOptions): AdaptResult {
  const { prompt, model, task = "general", userPrompt } = options;

  if (!VALID_TASKS.includes(task)) {
    throw new Error(
      `Invalid task: "${task}". Must be one of: ${VALID_TASKS.join(", ")}`,
    );
  }

  const entry = _getEntry(model);

  return applyRules(
    entry.familyConfig,
    model,
    entry.modelConfig.variant,
    task,
    prompt,
    userPrompt,
  );
}

/** List all supported models. */
export function listModels(): ModelEntry[] {
  return _listModels();
}
