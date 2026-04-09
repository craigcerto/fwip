/**
 * Append JSON output reinforcement instructions.
 *
 * Produces byte-identical output to helpers/jsonReinforcement.ts:addJsonReinforcement.
 *
 * @param params.tier - When "strong", adds extra-strict JSON-only rules (equivalent to old tier3=true).
 */
export function jsonReinforce(
  text: string,
  params: Record<string, unknown>,
): string {
  const tier = params.tier as string | undefined;

  if (tier === "strong") {
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
