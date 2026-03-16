import type { AdaptResult, Change, ModelFamily, ModelInfo, TaskType } from "../types.js";

/** Abstract base for model-specific prompt adapters. */
export interface BaseAdapter {
  adaptSystem(system: string, task: TaskType, modelVariant?: string): string;
  adaptUser(user: string, task: TaskType, modelVariant?: string): string;
  getChanges(task: TaskType, modelVariant?: string): Change[];
  getModelInfo(): ModelInfo;
}

/** Run the full adaptation pipeline using an adapter. */
export function runAdapt(
  adapter: BaseAdapter,
  system: string,
  task: TaskType,
  modelId: string,
  modelVariant: string,
  user?: string,
): AdaptResult {
  const adaptedSystem = adapter.adaptSystem(system, task, modelVariant);
  const adaptedUser = user ? adapter.adaptUser(user, task, modelVariant) : null;
  const changes = adapter.getChanges(task, modelVariant);
  const info = adapter.getModelInfo();

  return {
    system: adaptedSystem,
    user: adaptedUser,
    modelId,
    modelFamily: info.family,
    changes,
  };
}
