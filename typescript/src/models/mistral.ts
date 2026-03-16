import type { BaseAdapter } from "./base.js";
import type { Change, ModelInfo, TaskType } from "../types.js";
import { addJsonReinforcement, simplifyPrompt } from "../helpers/index.js";

export class MistralAdapter implements BaseAdapter {
  adaptSystem(system: string, task: TaskType, modelVariant = ""): string {
    if (modelVariant.includes("magistral")) return this.adaptMagistral(system);
    if (modelVariant.includes("devstral")) return this.adaptDevstral(system);
    if (modelVariant.includes("ministral"))
      return this.adaptMinistral(system, modelVariant);
    return this.adaptLarge(system, task);
  }

  adaptUser(user: string, _task: TaskType, modelVariant = ""): string {
    if (modelVariant.includes("ministral") && modelVariant.includes("3b")) {
      return simplifyPrompt(user, 3);
    }
    return user;
  }

  private adaptLarge(system: string, task: TaskType): string {
    let adapted = system;
    if (task === "analysis" || task === "code") {
      adapted +=
        "\n\nIMPORTANT: Work through this analysis methodically. " +
        "For each requirement, assess evidence before assigning a status.";
    }
    return addJsonReinforcement(adapted);
  }

  private adaptMagistral(system: string): string {
    return (
      `${system}\n\n` +
      "CRITICAL OUTPUT RULES:\n" +
      "- Respond with ONLY valid JSON matching the schema.\n" +
      "- Do NOT include any thinking, reasoning, or [THINK] blocks.\n" +
      "- Do NOT prefix your response with [TOOL_CALLS] or any markers.\n" +
      "- Your ENTIRE response must be parseable as a single JSON object.\n" +
      "- No markdown code fences. No explanation before or after.\n" +
      "- Include ALL required fields. Use null for unknown values."
    );
  }

  private adaptDevstral(system: string): string {
    return (
      `${system}\n\n` +
      "Return your response as a valid JSON object. " +
      "Ensure all string fields contain strings, all number fields contain numbers, " +
      "and all array fields contain arrays. Type mismatches cause parsing errors."
    );
  }

  private adaptMinistral(system: string, modelVariant: string): string {
    const is3b = modelVariant.includes("3b");
    const is8b = modelVariant.includes("8b");

    let adapted: string;
    if (is3b) {
      adapted = simplifyPrompt(system, 3);
    } else if (is8b) {
      adapted = simplifyPrompt(system, 4);
    } else {
      adapted = system;
    }
    return addJsonReinforcement(adapted);
  }

  getChanges(task: TaskType, modelVariant = ""): Change[] {
    if (modelVariant.includes("magistral")) {
      return [
        {
          rule: "suppress-markers",
          description: "Suppressed [TOOL_CALLS] and [THINK] output markers",
          evidence:
            "Magistral emits reasoning/tool markers that break JSON parsing",
          impact: "Clean JSON output without extraneous markers",
        },
        {
          rule: "tier3-reinforcement",
          description: "Added ultra-strong JSON-only instructions",
          evidence:
            "Magistral is a reasoning model — needs explicit JSON-only directives",
          impact: "Reliable structured output from reasoning model",
        },
      ];
    }
    if (modelVariant.includes("devstral")) {
      return [
        {
          rule: "type-reinforcement",
          description: "Added explicit field type instructions",
          evidence: "Devstral has a known type coercion bug in tool args",
          impact: "Correct field types in structured output",
        },
      ];
    }
    if (modelVariant.includes("ministral")) {
      const changes: Change[] = [];
      if (["3b", "8b"].some((s) => modelVariant.includes(s))) {
        changes.push({
          rule: "simplification",
          description: "Simplified prompt for small model capacity",
          evidence:
            "Ministral 3B/8B have limited attention — concise prompts perform better",
          impact: "Reduced prompt length while preserving key instructions",
        });
      }
      changes.push({
        rule: "json-reinforcement",
        description: "Added JSON output compliance instructions",
        evidence: "Small models need explicit JSON guidance",
        impact: "More reliable structured output",
      });
      return changes;
    }
    // Mistral Large
    const changes: Change[] = [
      {
        rule: "json-reinforcement",
        description: "Added JSON output compliance instructions",
        evidence: "Explicit JSON instructions improve schema adherence",
        impact: "More reliable structured output",
      },
    ];
    if (task === "analysis" || task === "code") {
      changes.push({
        rule: "step-by-step",
        description: "Added methodical analysis instruction",
        evidence:
          "Mistral Large has no thinking mode — explicit step-by-step improves analysis",
        impact: "More thorough requirement-by-requirement analysis",
      });
    }
    return changes;
  }

  getModelInfo(): ModelInfo {
    return {
      family: "mistral",
      description: "Mistral models (Large, Magistral, Devstral, Ministral)",
      adaptations: [
        "Large: step-by-step for analysis",
        "Magistral: suppress [TOOL_CALLS] and [THINK]",
        "Devstral: type reinforcement for code model",
        "Ministral: simplification for 3B/8B/14B",
        "JSON reinforcement",
      ],
    };
  }
}
