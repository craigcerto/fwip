import type { BaseAdapter } from "./base.js";
import type { Change, ModelInfo, TaskType } from "../types.js";
import { addEnglishEnforcement, addJsonReinforcement } from "../helpers/index.js";

export class KimiAdapter implements BaseAdapter {
  adaptSystem(system: string, _task: TaskType, modelVariant = ""): string {
    const isK2Thinking =
      modelVariant.includes("k2") && !modelVariant.includes("k25");

    let adapted = system;
    if (isK2Thinking) {
      adapted +=
        "\n\nReference only the provided source material. " +
        "Do NOT fabricate information not present in the input data.";
    }

    adapted = addJsonReinforcement(adapted);
    return addEnglishEnforcement(adapted);
  }

  adaptUser(user: string): string {
    return user;
  }

  getChanges(_task: TaskType, modelVariant = ""): Change[] {
    const changes: Change[] = [];
    if (modelVariant.includes("k2") && !modelVariant.includes("k25")) {
      changes.push({
        rule: "grounding",
        description: "Added source material grounding instruction",
        evidence:
          "K2 Thinking always reasons — explicit grounding reduces hallucination",
        impact: "Output grounded in provided data",
      });
    }
    changes.push(
      {
        rule: "json-reinforcement",
        description: "Added JSON output compliance instructions",
        evidence: "Explicit JSON instructions improve schema adherence",
        impact: "More reliable structured output",
      },
      {
        rule: "english-enforcement",
        description: "Added English-only output instruction",
        evidence: "Kimi is multilingual — may respond in Chinese",
        impact: "Consistent English output",
      },
    );
    return changes;
  }

  getModelInfo(): ModelInfo {
    return {
      family: "kimi",
      description: "Moonshot Kimi models (K2, K2.5)",
      adaptations: [
        "K2: source material grounding",
        "English enforcement",
        "JSON reinforcement",
      ],
    };
  }
}
