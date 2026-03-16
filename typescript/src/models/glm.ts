import type { BaseAdapter } from "./base.js";
import type { Change, ModelInfo, TaskType } from "../types.js";
import {
  addEnglishEnforcement,
  addJsonReinforcement,
  simplifyPrompt,
} from "../helpers/index.js";

export class GLMAdapter implements BaseAdapter {
  adaptSystem(system: string, _task: TaskType, modelVariant = ""): string {
    const isFlash = modelVariant.includes("flash");

    let adapted = isFlash ? simplifyPrompt(system, 5) : system;

    adapted +=
      "\n\nEnsure all nested objects are properly structured. " +
      "Array fields must contain arrays, not single values. " +
      "Object fields must contain objects with all required sub-fields.";

    adapted = addJsonReinforcement(adapted);
    return addEnglishEnforcement(adapted);
  }

  adaptUser(user: string): string {
    return user;
  }

  getChanges(_task: TaskType, modelVariant = ""): Change[] {
    const changes: Change[] = [];
    if (modelVariant.includes("flash")) {
      changes.push({
        rule: "simplification",
        description: "Simplified prompt for Flash variant",
        evidence: "GLM Flash is smaller — concise prompts perform better",
        impact: "Reduced prompt length while preserving key instructions",
      });
    }
    changes.push(
      {
        rule: "nested-object-fix",
        description: "Added nested object structure reinforcement",
        evidence: "GLM has a known nested object serialization bug",
        impact: "Correct nested object and array structure",
      },
      {
        rule: "english-enforcement",
        description: "Added English-only output instruction",
        evidence: "GLM is natively bilingual Chinese/English",
        impact: "Consistent English output",
      },
      {
        rule: "json-reinforcement",
        description: "Added JSON output compliance instructions",
        evidence: "Explicit JSON instructions improve schema adherence",
        impact: "More reliable structured output",
      },
    );
    return changes;
  }

  getModelInfo(): ModelInfo {
    return {
      family: "glm",
      description: "Z.AI GLM models (4.7, 4.7 Flash)",
      adaptations: [
        "Nested object reinforcement",
        "English enforcement",
        "Flash simplification",
        "JSON reinforcement",
      ],
    };
  }
}
