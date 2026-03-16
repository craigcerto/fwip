import type { BaseAdapter } from "./base.js";
import type { Change, ModelInfo, TaskType } from "../types.js";
import { wrapXml, simplifyPrompt } from "../helpers/index.js";

export class ClaudeAdapter implements BaseAdapter {
  adaptSystem(system: string, task: TaskType, modelVariant = ""): string {
    const isHaiku = modelVariant.includes("haiku");

    let roleLine = "";
    let body = system;
    const firstLine = system.split("\n")[0].trim();
    if (firstLine.toLowerCase().startsWith("you are")) {
      roleLine = firstLine;
      body = system.split("\n").slice(1).join("\n").trim();
    }

    if (!roleLine) {
      roleLine = "You are a helpful assistant.";
    }

    if (isHaiku) {
      body = simplifyPrompt(body, 5);
    }

    let adapted = wrapXml("role", roleLine);
    adapted += "\n\n" + wrapXml("instructions", body);
    adapted += "\n\n" + wrapXml("output_format", "Return structured output matching the schema.");

    return adapted;
  }

  adaptUser(user: string, _task: TaskType, _modelVariant = ""): string {
    return user;
  }

  getChanges(task: TaskType, modelVariant = ""): Change[] {
    const changes: Change[] = [
      {
        rule: "xml-structure",
        description: "Restructured prompt with XML tags",
        evidence: "Claude models are trained to follow XML-tagged instructions",
        impact: "Improved instruction following and section separation",
      },
      {
        rule: "role-extraction",
        description: "Extracted role definition into <role> tag",
        evidence: "Claude responds well to explicit role framing in XML",
        impact: "Clearer persona adherence",
      },
    ];
    if (modelVariant.includes("haiku")) {
      changes.push({
        rule: "simplification",
        description: "Simplified prompt for smaller model capacity",
        evidence: "Haiku has fewer parameters — concise prompts perform better",
        impact: "Reduced prompt length while preserving key instructions",
      });
    }
    return changes;
  }

  getModelInfo(): ModelInfo {
    return {
      family: "claude",
      description: "Anthropic Claude models (Sonnet, Opus, Haiku)",
      adaptations: [
        "XML tag structuring",
        "Role extraction",
        "Haiku simplification",
        "Output format guidance",
      ],
    };
  }
}
