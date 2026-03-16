import type { BaseAdapter } from "./base.js";
import type { Change, ModelInfo, TaskType } from "../types.js";
import {
  addEnglishEnforcement,
  addJsonReinforcement,
  simplifyPrompt,
} from "../helpers/index.js";

export class QwenAdapter implements BaseAdapter {
  private getThinkPrefix(task: TaskType, modelVariant: string): string {
    if (modelVariant.includes("nothink")) return "/no_think\n";
    if (modelVariant.includes("think")) return "/think\n";
    return task === "extraction" ? "/no_think\n" : "/think\n";
  }

  adaptSystem(system: string, task: TaskType, modelVariant = ""): string {
    const is32b = modelVariant.includes("32b");
    const thinkPrefix = this.getThinkPrefix(task, modelVariant);

    let adapted = thinkPrefix + system;

    if (is32b) {
      adapted = addJsonReinforcement(adapted, true);
      adapted = simplifyPrompt(adapted, 5);
    } else {
      adapted = addJsonReinforcement(adapted);
    }

    return addEnglishEnforcement(adapted);
  }

  adaptUser(user: string, _task: TaskType, modelVariant = ""): string {
    if (modelVariant.includes("nothink")) return "/no_think\n" + user;
    return "/think\n" + user;
  }

  getChanges(task: TaskType, modelVariant = ""): Change[] {
    const thinkPrefix = this.getThinkPrefix(task, modelVariant);
    const changes: Change[] = [
      {
        rule: "thinking-mode",
        description: `Added ${thinkPrefix.trim()} prefix`,
        evidence: "Qwen3 supports /think and /no_think reasoning toggles",
        impact: "Optimized reasoning mode for task type",
      },
      {
        rule: "english-enforcement",
        description: "Added English-only output instruction",
        evidence: "Qwen3 is natively multilingual — may respond in Chinese",
        impact: "Consistent English output",
      },
    ];
    if (modelVariant.includes("32b")) {
      changes.push({
        rule: "tier3-reinforcement",
        description: "Added extra-strong JSON-only instructions",
        evidence: "32B variant uses JSON-prompt fallback (Tier 3)",
        impact: "Dramatically improved schema compliance",
      });
    }
    return changes;
  }

  getModelInfo(): ModelInfo {
    return {
      family: "qwen",
      description: "Alibaba Qwen3 models (235B, 32B, Coder)",
      adaptations: [
        "Thinking mode control (/think, /no_think)",
        "Tier 3 JSON reinforcement for 32B",
        "English enforcement",
        "Small model simplification",
      ],
    };
  }
}
