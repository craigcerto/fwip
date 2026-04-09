/** The type of task the prompt is designed for. */
export type TaskType =
  | "extraction"
  | "analysis"
  | "generation"
  | "code"
  | "general";

/** Supported model families. */
export type ModelFamily =
  | "claude"
  | "openai"
  | "gemini"
  | "qwen"
  | "deepseek"
  | "mistral"
  | "llama"
  | "kimi"
  | "glm"
  | "nemotron"
  | "minimax";

/** Rule category indicating the basis for an adaptation. */
export type RuleCategory = "model_specific" | "best_practice" | "compensation";

/** Structured evidence citation for a rule. */
export interface Evidence {
  /** Human-readable source description. */
  source: string;
  /** Verifiable URL to official documentation or research. */
  url?: string;
  /** Direct quote from the source. */
  quote?: string;
  /** Empirical finding description. */
  finding?: string;
}

/** Recommended API parameter for a model. */
export interface ApiHint {
  /** API parameter name (e.g., "temperature", "reasoning_effort"). */
  parameter: string;
  /** Recommended value. */
  value: string | number | boolean;
  /** Why this value is recommended. */
  reason: string;
  /** Source citation. */
  evidence?: Evidence;
}

/** A single adaptation change applied to a prompt. */
export interface Change {
  rule: string;
  description: string;
  evidence: string;
  impact: string;
  /** Whether this is model-specific, a best practice, or compensating for a weakness. */
  category?: RuleCategory;
}

/** Metadata about a model family's adapter. */
export interface ModelInfo {
  family: ModelFamily;
  description: string;
  adaptations: string[];
}

/** Result of adapting a prompt for a specific model. */
export interface AdaptResult {
  system: string;
  user: string | null;
  modelId: string;
  modelFamily: ModelFamily;
  changes: Change[];
  /** Recommended API parameters for optimal results with this model. */
  apiHints?: ApiHint[];
}

/** Options for the adapt() function. */
export interface AdaptOptions {
  prompt: string;
  model: string;
  task?: TaskType;
  userPrompt?: string;
}

/** Model entry returned by listModels(). */
export interface ModelEntry {
  id: string;
  family: string;
  variant: string;
  /** Human-readable display name. */
  name?: string;
  /** Model provider. */
  provider?: string;
}

/** Summary info about a model family. */
export interface FamilyInfo {
  family: string;
  provider: string;
  docsUrl?: string;
  modelCount: number;
  ruleCount: number;
}

// ── Config types (used internally by the engine and exported for extensibility) ──

/** Condition for when a rule should apply. */
export interface RuleWhen {
  /** Model variants this rule applies to. ["all"] means all variants. */
  variants?: string[];
  /** Task types this rule applies to. ["all"] means all tasks. */
  tasks?: string[];
}

/** A single rule in a family config. */
export interface RuleConfig {
  /** Unique rule identifier. */
  id: string;
  /** Name of the transform function to apply. */
  transform: string;
  /** Which prompt to transform. */
  target: "system" | "user" | "both";
  /** Rule category for honest labeling. */
  category: RuleCategory;
  /** Human-readable description of what this rule does. */
  description: string;
  /** Expected impact of the rule. */
  impact: string;
  /** Conditions for when this rule applies. */
  when: RuleWhen;
  /** Parameters passed to the transform function. */
  params?: Record<string, unknown>;
  /** Evidence citation for this rule. */
  evidence?: Evidence;
}

/** API hint in a family config. */
export interface ApiHintConfig {
  parameter: string;
  value: string | number | boolean;
  reason: string;
  when?: RuleWhen;
  evidence?: Evidence;
}

/** Model definition within a family config. */
export interface ModelConfig {
  /** Human-readable display name. */
  name: string;
  /** Variant identifier used for rule matching. */
  variant: string;
  /** Model tier (e.g., "flagship", "fast", "premium"). */
  tier?: string;
  /** Alternative model IDs that map to this model. */
  aliases?: string[];
}

/** Complete config for a model family. */
export interface FamilyConfig {
  /** Family identifier (e.g., "claude", "openai"). */
  family: string;
  /** Provider name (e.g., "Anthropic", "OpenAI"). */
  provider: string;
  /** URL to the provider's prompt engineering documentation. */
  docs_url?: string;
  /** All models in this family, keyed by model ID. */
  models: Record<string, ModelConfig>;
  /** Ordered list of adaptation rules. */
  rules: RuleConfig[];
  /** Recommended API parameters. */
  api_hints?: ApiHintConfig[];
}

/** Options for registerModel(). */
export interface ModelRegistration {
  /** Human-readable display name. */
  name: string;
  /** Variant identifier for rule matching. */
  variant: string;
  /** Model tier. */
  tier?: string;
  /** Alternative model IDs. */
  aliases?: string[];
}

/** Transform function signature. */
export type TransformFn = (text: string, params: Record<string, unknown>) => string;
