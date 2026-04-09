/**
 * Reorder constraint-like lines to the end of the prompt.
 *
 * Currently a no-op placeholder for Phase 7 (Gemini constraint reordering).
 * Gemini currently applies no adaptations; this transform is reserved for
 * future research-backed constraint positioning.
 */
export function constraintReorder(
  text: string,
  _params: Record<string, unknown>,
): string {
  return text;
}
