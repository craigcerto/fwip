/**
 * Append Magistral-specific marker suppression rules.
 *
 * Produces byte-identical output to models/mistral.ts:MistralAdapter.adaptMagistral.
 *
 * No params required.
 */
export function suppressMarkers(
  text: string,
  _params: Record<string, unknown>,
): string {
  return (
    `${text}\n\n` +
    "CRITICAL OUTPUT RULES:\n" +
    "- Respond with ONLY valid JSON matching the schema.\n" +
    "- Do NOT include any thinking, reasoning, or [THINK] blocks.\n" +
    "- Do NOT prefix your response with [TOOL_CALLS] or any markers.\n" +
    "- Your ENTIRE response must be parseable as a single JSON object.\n" +
    "- No markdown code fences. No explanation before or after.\n" +
    "- Include ALL required fields. Use null for unknown values."
  );
}
