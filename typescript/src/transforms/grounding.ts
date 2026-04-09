/**
 * Append grounding rules that restrict the model to provided input data.
 *
 * No params required.
 */
export function grounding(
  text: string,
  _params: Record<string, unknown>,
): string {
  return (
    `${text}\n\n` +
    "GROUNDING RULES:\n" +
    "- Only use information explicitly present in the provided input data.\n" +
    "- Do NOT infer, assume, or fabricate any details.\n" +
    "- If information is not available, use null rather than guessing."
  );
}
