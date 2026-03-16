import type { BaseAdapter } from "./base.js";
import type { Change, ModelInfo, TaskType } from "../types.js";

export class GeminiAdapter implements BaseAdapter {
  adaptSystem(system: string): string {
    return system;
  }

  adaptUser(user: string): string {
    return user;
  }

  getChanges(): Change[] {
    return [];
  }

  getModelInfo(): ModelInfo {
    return {
      family: "gemini",
      description: "Google Gemini models (baseline — no adaptation needed)",
      adaptations: [],
    };
  }
}
