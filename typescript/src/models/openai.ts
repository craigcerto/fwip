import type { BaseAdapter } from "./base.js";
import type { Change, ModelInfo, TaskType } from "../types.js";
import { addJsonReinforcement, simplifyPrompt } from "../helpers/index.js";

export class OpenAIAdapter implements BaseAdapter {
  adaptSystem(system: string, task: TaskType, modelVariant = ""): string {
    const isSmall = ["mini", "20b"].some((s) => modelVariant.includes(s));

    let adapted = isSmall ? simplifyPrompt(system, 5) : system;

    if (task === "analysis" || task === "code") {
      adapted = `Reasoning: high\n\n${adapted}`;
    }

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

  getChanges(task: TaskType): Change[] {
    const changes: Change[] = [
      {
        rule: "grounding",
        description: "Added grounding rules to reduce hallucination",
        evidence: "GPT models benefit from explicit grounding instructions",
        impact: "Reduced fabrication of unsupported details",
      },
      {
        rule: "json-reinforcement",
        description: "Added JSON output compliance instructions",
        evidence: "Explicit JSON instructions improve schema adherence",
        impact: "More reliable structured output",
      },
    ];
    if (task === "analysis" || task === "code") {
      changes.push({
        rule: "reasoning-hint",
        description: "Added reasoning level hint for complex tasks",
        evidence: "GPT models respond to reasoning level directives",
        impact: "Higher quality analysis and code output",
      });
    }
    return changes;
  }

  getModelInfo(): ModelInfo {
    return {
      family: "openai",
      description: "OpenAI GPT models (GPT-4o, GPT-4, o1, o3)",
      adaptations: [
        "Markdown structure",
        "Reasoning level hints",
        "Grounding rules",
        "JSON reinforcement",
        "Small model simplification",
      ],
    };
  }
}
