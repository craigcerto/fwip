/**
 * Append a language enforcement instruction.
 *
 * Produces byte-identical output to helpers/language.ts:addEnglishEnforcement.
 *
 * @param params.language - The language to enforce (default: "English").
 */
export function languageEnforce(
  text: string,
  params: Record<string, unknown>,
): string {
  const language = (params.language as string | undefined) ?? "English";
  return `${text}\n\nIMPORTANT: All output must be in ${language}.`;
}
