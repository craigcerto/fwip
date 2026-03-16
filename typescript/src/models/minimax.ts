import type { BaseAdapter } from "./base.js";
import type { Change, ModelInfo, TaskType } from "../types.js";
import { addJsonReinforcement } from "../helpers/index.js";

export class MiniMaxAdapter implements BaseAdapter {
  adaptSystem(system: string): string {
    let adapted = system;

    adapted +=
      "\n\nBefore producing your final output, verify:\n" +
      "- All required fields are present and correctly typed\n" +
      "- No information has been fabricated or inferred beyond the source data\n" +
      "- Output is well-structured and internally consistent";

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
        evidence: "MiniMax M2 responds well to contract-style verification",
        impact: "Fewer errors in structured output",
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
      family: "minimax",
      description: "MiniMax M2",
      adaptations: ["Self-verification checklist", "JSON reinforcement"],
    };
  }
}
