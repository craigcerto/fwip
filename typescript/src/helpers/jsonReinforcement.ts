/**
 * Add JSON output reinforcement to a system prompt.
 *
 * For Tier 3 (JSON-prompt fallback) models, adds extra-strong
 * JSON-only output instructions.
 */
export function addJsonReinforcement(text: string, tier3 = false): string {
  if (tier3) {
    return (
      `${text}\n\n` +
      "CRITICAL OUTPUT RULES:\n" +
      "- Your ENTIRE response must be a single valid JSON object.\n" +
      "- Do NOT include any text before or after the JSON.\n" +
      "- Do NOT wrap the JSON in markdown code fences.\n" +
      "- Do NOT include any explanation, thinking, or commentary.\n" +
      "- Include ALL required fields from the schema. Missing fields cause errors.\n" +
      "- Use null for any field you cannot determine."
    );
  }
  return (
    `${text}\n\n` +
    "Return your response as valid JSON matching the provided schema. " +
    "Include ALL required fields. Use null for unknown values."
  );
}
