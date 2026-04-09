/**
 * Prepend a thinking-mode control prefix (/think or /no_think).
 *
 * Produces byte-identical output to models/qwen.ts:QwenAdapter.getThinkPrefix.
 *
 * @param params.task_map          - Record<string, string> mapping task types to prefixes.
 *                                    Use "default" key as fallback.
 * @param params.variant_override  - Record<string, string> mapping variant substrings
 *                                    to fixed prefixes (checked first).
 * @param params.variant           - The model variant string (injected by engine).
 * @param params.task              - The task type string (injected by engine).
 */
export function thinkingPrefix(
  text: string,
  params: Record<string, unknown>,
): string {
  const variant = (params.variant as string | undefined) ?? "";
  const task = (params.task as string | undefined) ?? "";
  const taskMap = (params.task_map as Record<string, string> | undefined) ?? {};
  const variantOverride =
    (params.variant_override as Record<string, string> | undefined) ?? {};

  // Check variant overrides first (substring match)
  for (const [substring, prefix] of Object.entries(variantOverride)) {
    if (variant.includes(substring)) {
      return prefix + text;
    }
  }

  // Fall back to task map
  const prefix = taskMap[task] ?? taskMap["default"] ?? "/think\n";
  return prefix + text;
}
