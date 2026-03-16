#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { adapt, listModels, type TaskType, type Change } from "refrase";

const VALID_TASKS: TaskType[] = [
  "extraction",
  "analysis",
  "generation",
  "code",
  "general",
];

const server = new Server(
  {
    name: "refrase",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "adapt_prompt",
      description:
        "Adapt a prompt for a specific AI model. Returns the optimized prompt and a list of changes made.",
      inputSchema: {
        type: "object" as const,
        properties: {
          prompt: {
            type: "string",
            description: "The system/instruction prompt to adapt",
          },
          model: {
            type: "string",
            description:
              'Target model ID (e.g., "claude-sonnet", "gpt-4o", "qwen3-235b")',
          },
          task: {
            type: "string",
            enum: VALID_TASKS,
            description:
              "Task type: extraction, analysis, generation, code, or general (default: general)",
          },
          user_prompt: {
            type: "string",
            description: "Optional user prompt to adapt alongside the system prompt",
          },
        },
        required: ["prompt", "model"],
      },
    },
    {
      name: "list_models",
      description:
        "List all supported models with their family and variant information.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "explain_adaptation",
      description:
        "Explain what adaptations are applied for a specific model family and why.",
      inputSchema: {
        type: "object" as const,
        properties: {
          model: {
            type: "string",
            description:
              'Model ID to explain adaptations for (e.g., "claude-sonnet")',
          },
        },
        required: ["model"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "adapt_prompt": {
      const { prompt, model, task = "general", user_prompt } = args as {
        prompt: string;
        model: string;
        task?: string;
        user_prompt?: string;
      };

      try {
        const result = adapt({
          prompt,
          model,
          task: task as TaskType,
          userPrompt: user_prompt,
        });

        const changesText = result.changes
          .map(
            (c: Change) =>
              `- **${c.rule}**: ${c.description}\n  Evidence: ${c.evidence}\n  Impact: ${c.impact}`,
          )
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: [
                `## Adapted for ${model} (${result.modelFamily})`,
                "",
                "### System Prompt",
                "```",
                result.system,
                "```",
                "",
                ...(result.user
                  ? ["### User Prompt", "```", result.user, "```", ""]
                  : []),
                `### Changes (${result.changes.length})`,
                changesText || "No changes (identity adapter).",
              ].join("\n"),
            },
          ],
        };
      } catch (e: any) {
        return {
          content: [{ type: "text", text: `Error: ${e.message}` }],
          isError: true,
        };
      }
    }

    case "list_models": {
      const models = listModels();
      const byFamily: Record<string, string[]> = {};
      for (const m of models) {
        (byFamily[m.family] ??= []).push(m.id);
      }

      const text = Object.entries(byFamily)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([family, ids]) => `**${family}**: ${ids.join(", ")}`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `## Supported Models (${models.length})\n\n${text}`,
          },
        ],
      };
    }

    case "explain_adaptation": {
      const { model } = args as { model: string };

      try {
        // Adapt a sample prompt to get the model info and changes
        const result = adapt({
          prompt: "You are a helpful assistant.",
          model,
          task: "general",
        });

        const info = result.changes;
        const changesText = info
          .map(
            (c) =>
              `### ${c.rule}\n${c.description}\n\n**Evidence:** ${c.evidence}\n**Impact:** ${c.impact}`,
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text: [
                `## Adaptations for ${model} (${result.modelFamily})`,
                "",
                changesText || "This is an identity adapter — no changes are applied.",
              ].join("\n"),
            },
          ],
        };
      } catch (e: any) {
        return {
          content: [{ type: "text", text: `Error: ${e.message}` }],
          isError: true,
        };
      }
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
