/**
 * Append type reinforcement instructions for code-focused models.
 *
 * Produces byte-identical output to models/mistral.ts:MistralAdapter.adaptDevstral.
 *
 * No params required.
 */
export function typeReinforce(
  text: string,
  _params: Record<string, unknown>,
): string {
  return (
    `${text}\n\n` +
    "Return your response as a valid JSON object. " +
    "Ensure all string fields contain strings, all number fields contain numbers, " +
    "and all array fields contain arrays. Type mismatches cause parsing errors."
  );
}
