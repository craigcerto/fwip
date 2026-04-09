/**
 * Prepend content before the prompt text, separated by a newline.
 *
 * @param params.content - The text to prepend.
 */
export function prependText(
  text: string,
  params: Record<string, unknown>,
): string {
  const content = params.content as string;
  return `${content}\n${text}`;
}
