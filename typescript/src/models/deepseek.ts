import type { BaseAdapter } from "./base.js";
import type { Change, ModelInfo, TaskType } from "../types.js";
import { addJsonReinforcement } from "../helpers/index.js";

export class DeepSeekAdapter implements BaseAdapter {
  adaptSystem(system: string): string {
    let adapted = system;

    adapted +=
      "\n\nBefore your final answer, verify:\n" +
      "- All required fields are present in your response\n" +
      "- No fields contain placeholder or example values\n" +
      "- All data is extracted from the provided source material";

    return addJsonReinforcement(adapted);
  }

  adaptUser(user: string): string {
    return user;
  }

  getChanges(): Change[] {
    return [
      {
        rule: "self-verification",
        description: "Added self-verification checklist",
        evidence: "DeepSeek models respond well to self-check instructions",
        impact: "Fewer missing fields and placeholder values",
      },
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
      family: "deepseek",
      description: "DeepSeek V3.x models",
      adaptations: [
        "Self-verification checklist",
        "JSON reinforcement",
        "Preserved methodology structure",
      ],
    };
  }
}
