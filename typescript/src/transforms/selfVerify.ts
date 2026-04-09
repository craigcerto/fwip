/**
 * Append a self-verification checklist.
 *
 * Produces byte-identical output to the DeepSeek and MiniMax adapter verification blocks.
 *
 * @param params.style - "deepseek" (default) or "minimax" variant.
 */
export function selfVerify(
  text: string,
  params: Record<string, unknown>,
): string {
  const style = (params.style as string | undefined) ?? "deepseek";

  if (style === "minimax") {
    return (
      text +
      "\n\nBefore producing your final output, verify:\n" +
      "- All required fields are present and correctly typed\n" +
      "- No information has been fabricated or inferred beyond the source data\n" +
      "- Output is well-structured and internally consistent"
    );
  }

  // deepseek (default)
  return (
    text +
    "\n\nBefore your final answer, verify:\n" +
    "- All required fields are present in your response\n" +
    "- No fields contain placeholder or example values\n" +
    "- All data is extracted from the provided source material"
  );
}
