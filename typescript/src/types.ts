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

/** A single adaptation change applied to a prompt. */
export interface Change {
  rule: string;
  description: string;
  evidence: string;
  impact: string;
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
}
