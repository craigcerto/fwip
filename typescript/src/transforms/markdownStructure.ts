/**
 * Append markdown-structured analysis instructions.
 *
 * Used by Mistral Large for analysis/code tasks. Semantically distinct from
 * appendText to express intent in configs.
 *
 * @param params.content - The text to append.
 */
export function markdownStructure(
  text: string,
  params: Record<string, unknown>,
): string {
  const content = params.content as string;
  return `${text}\n\n${content}`;
}
