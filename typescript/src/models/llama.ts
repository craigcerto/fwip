import type { BaseAdapter } from "./base.js";
import type { Change, ModelInfo, TaskType } from "../types.js";
import { addJsonReinforcement, simplifyPrompt } from "../helpers/index.js";

export class LlamaAdapter implements BaseAdapter {
  adaptSystem(system: string, _task: TaskType, modelVariant = ""): string {
    const isSmall = ["8b", "3b"].some((s) => modelVariant.includes(s));

    let adapted = isSmall ? simplifyPrompt(system, 5) : system;

    adapted +=
      "\n\nGROUNDING RULES:\n" +
      "- Only use information explicitly present in the provided input data.\n" +
      "- Do NOT infer, assume, or fabricate any details.\n" +
      "- If information is not available, use null rather than guessing.";

    return addJsonReinforcement(adapted);
  }

  adaptUser(user: string): string {
    return user;
  }

  getChanges(_task: TaskType, modelVariant = ""): Change[] {
    const changes: Change[] = [];
    if (["8b", "3b"].some((s) => modelVariant.includes(s))) {
      changes.push({
        rule: "simplification",
        description: "Simplified prompt for smaller model capacity",
        evidence: "Small Llama models perform better with concise prompts",
        impact: "Reduced prompt length while preserving key instructions",
      });
    }
    changes.push(
      {
        rule: "grounding",
        description: "Added grounding rules to reduce hallucination",
        evidence: "Llama models benefit from explicit grounding instructions",
        impact: "Reduced fabrication of unsupported details",
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
      family: "llama",
      description: "Meta Llama models",
      adaptations: [
        "Markdown structure",
        "Grounding rules",
        "JSON reinforcement",
        "Small model simplification",
      ],
    };
  }
}
