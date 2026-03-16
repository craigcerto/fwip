/** Add English-only output enforcement for multilingual models. */
export function addEnglishEnforcement(text: string): string {
  return `${text}\n\nIMPORTANT: All output must be in English.`;
}
