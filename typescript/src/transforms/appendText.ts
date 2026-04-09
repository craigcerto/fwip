/**
 * Append content after the prompt text, separated by a blank line.
 *
 * @param params.content - The text to append.
 */
export function appendText(
  text: string,
  params: Record<string, unknown>,
): string {
  const content = params.content as string;
  return `${text}\n\n${content}`;
}
