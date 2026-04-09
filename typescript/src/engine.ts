/**
 * Rule engine — reads a family config and applies matching transforms in sequence.
 */
import { TRANSFORMS } from "./transforms/index.js";
import type {
  AdaptResult,
  ApiHint,
  Change,
  FamilyConfig,
  ModelFamily,
  RuleConfig,
  RuleWhen,
  TaskType,
} from "./types.js";

/**
 * Check if a rule's conditions match the current variant and task.
 */
function shouldApply(when: RuleWhen, variant: string, task: TaskType): boolean {
  const variantMatch =
    !when.variants ||
    when.variants.length === 0 ||
    when.variants.includes("all") ||
    when.variants.includes(variant);
  const taskMatch =
    !when.tasks ||
    when.tasks.length === 0 ||
    when.tasks.includes("all") ||
    when.tasks.includes(task);
  return variantMatch && taskMatch;
}

/**
 * Apply all matching rules from a family config to produce an AdaptResult.
 */
export function applyRules(
  config: FamilyConfig,
  modelId: string,
  variant: string,
  task: TaskType,
  systemPrompt: string,
  userPrompt?: string,
): AdaptResult {
  let system = systemPrompt;
  let user: string | null = userPrompt ?? null;
  const changes: Change[] = [];
  const apiHints: ApiHint[] = [];

  for (const rule of config.rules) {
    if (!shouldApply(rule.when, variant, task)) continue;

    const transform = TRANSFORMS[rule.transform];
    if (!transform) {
      throw new Error(
        `Unknown transform "${rule.transform}" in rule "${rule.id}" for family "${config.family}"`,
      );
    }

    // Build params: merge rule params with engine context
    const params: Record<string, unknown> = {
      ...rule.params,
      variant,
      task,
    };

    if (rule.target === "system" || rule.target === "both") {
      system = transform(system, params);
    }
    if ((rule.target === "user" || rule.target === "both") && user !== null) {
      user = transform(user, params);
    }

    changes.push({
      rule: rule.id,
      description: rule.description,
      evidence: rule.evidence?.source ?? "",
      impact: rule.impact,
      category: rule.category,
    });
  }

  // Collect matching API hints
  for (const hint of config.api_hints ?? []) {
    if (!hint.when || shouldApply(hint.when, variant, task)) {
      apiHints.push({
        parameter: hint.parameter,
        value: hint.value,
        reason: hint.reason,
        evidence: hint.evidence,
      });
    }
  }

  const result: AdaptResult = {
    system,
    user,
    modelId,
    modelFamily: config.family as ModelFamily,
    changes,
  };

  if (apiHints.length > 0) {
    result.apiHints = apiHints;
  }

  return result;
}
