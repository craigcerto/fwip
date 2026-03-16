import type { BaseAdapter } from "./base.js";
import type { Change, ModelInfo, TaskType } from "../types.js";
import { addJsonReinforcement, simplifyPrompt } from "../helpers/index.js";

export class NemotronAdapter implements BaseAdapter {
  private getThinkPrefix(modelVariant: string): string {
    if (modelVariant.includes("nothink")) return "/no_think\n";
    return "/think\n";
  }

  adaptSystem(system: string, _task: TaskType, modelVariant = ""): string {
    const isSmall =
      modelVariant.includes("9b") || modelVariant.includes("12b");

    if (isSmall) {
      const thinkPrefix = this.getThinkPrefix(modelVariant);
      let adapted = thinkPrefix + simplifyPrompt(system, 3);
      return addJsonReinforcement(adapted, true);
    }

    return addJsonReinforcement(system);
  }

  adaptUser(user: string, _task: TaskType, modelVariant = ""): string {
    const isSmall =
      modelVariant.includes("9b") || modelVariant.includes("12b");
    if (isSmall) {
      const prefix = modelVariant.includes("nothink")
        ? "/no_think\n"
        : "/think\n";
      return prefix + simplifyPrompt(user, 3);
    }
    return user;
  }

  getChanges(_task: TaskType, modelVariant = ""): Change[] {
    const isSmall =
      modelVariant.includes("9b") || modelVariant.includes("12b");

    if (isSmall) {
      return [
        {
          rule: "thinking-mode",
          description: `Added ${this.getThinkPrefix(modelVariant).trim()} prefix`,
          evidence: "Nemotron 9B/12B support /think and /no_think toggles",
          impact: "Optimized reasoning mode",
        },
        {
          rule: "simplification",
          description: "Simplified prompt for small model capacity",
          evidence: "9B/12B have limited attention layers",
          impact: "Reduced prompt length",
        },
        {
          rule: "tier3-reinforcement",
          description: "Added extra-strong JSON-only instructions",
          evidence: "9B/12B use JSON-prompt fallback (Tier 3)",
          impact: "Improved schema compliance",
        },
      ];
    }
    return [
      {
        rule: "json-reinforcement",
        description: "Added JSON output compliance instructions",
        evidence: "Explicit JSON instructions improve schema adherence",
        impact: "More reliable structured output",
      },
    ];
  }

  getModelInfo(): ModelInfo {
    return {
      family: "nemotron",
      description: "NVIDIA Nemotron models (9B, 12B VL, 30B)",
      adaptations: [
        "9B/12B: thinking mode control",
        "9B/12B: Tier 3 JSON reinforcement",
        "9B/12B: prompt simplification",
        "30B: standard JSON reinforcement",
      ],
    };
  }
}
