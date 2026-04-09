/**
 * Append nested object structure reinforcement.
 *
 * Produces byte-identical output to models/glm.ts:GLMAdapter.adaptSystem nested-object block.
 *
 * No params required.
 */
export function nestedObjectFix(
  text: string,
  _params: Record<string, unknown>,
): string {
  return (
    `${text}\n\n` +
    "Ensure all nested objects are properly structured. " +
    "Array fields must contain arrays, not single values. " +
    "Object fields must contain objects with all required sub-fields."
  );
}
