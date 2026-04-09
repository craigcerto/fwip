/**
 * Restructure a prompt into XML-tagged sections (role, instructions, output_format).
 *
 * Produces byte-identical output to models/claude.ts:ClaudeAdapter.adaptSystem.
 *
 * The wrapXml helper produces: `<${tag}>\n${content}\n</${tag}>`
 *
 * Logic:
 * 1. Extract role from first line if it starts with "you are" (case insensitive).
 * 2. If no role line found, use params.default_role.
 * 3. Body = remaining lines after role extraction, trimmed.
 * 4. If params.simplify_body is true, simplify the body (NOT the role line).
 * 5. Build: wrapXml("role", roleLine) + "\n\n" + wrapXml("instructions", body)
 *          + "\n\n" + wrapXml("output_format", output_format_text)
 *
 * @param params.extract_role       - Whether to extract role from first line (default: true).
 * @param params.default_role       - Fallback role if none extracted (default: "You are a helpful assistant.").
 * @param params.output_format_text - Text for the output_format section (default: "Return structured output matching the schema.").
 * @param params.simplify_body      - Whether to simplify the body for smaller models (default: false).
 * @param params.simplify_max_steps - Max steps when simplifying (default: 5).
 */

import { simplify } from "./simplify.js";

function wrapXml(tag: string, content: string): string {
  return `<${tag}>\n${content}\n</${tag}>`;
}

export function xmlWrap(
  text: string,
  params: Record<string, unknown>,
): string {
  const extractRole = params.extract_role !== false;
  const defaultRole =
    (params.default_role as string | undefined) ??
    "You are a helpful assistant.";
  const outputFormatText =
    (params.output_format_text as string | undefined) ??
    "Return structured output matching the schema.";
  const simplifyBody = params.simplify_body === true;
  const simplifyMaxSteps =
    typeof params.simplify_max_steps === "number"
      ? params.simplify_max_steps
      : 5;

  let roleLine = "";
  let body = text;

  if (extractRole) {
    const firstLine = text.split("\n")[0].trim();
    if (firstLine.toLowerCase().startsWith("you are")) {
      roleLine = firstLine;
      body = text.split("\n").slice(1).join("\n").trim();
    }
  }

  if (!roleLine) {
    roleLine = defaultRole;
  }

  if (simplifyBody) {
    body = simplify(body, { max_steps: simplifyMaxSteps });
  }

  let adapted = wrapXml("role", roleLine);
  adapted += "\n\n" + wrapXml("instructions", body);
  adapted += "\n\n" + wrapXml("output_format", outputFormatText);

  return adapted;
}
