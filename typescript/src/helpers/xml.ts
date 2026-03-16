/** Wrap content in XML tags. */
export function wrapXml(tag: string, content: string): string {
  return `<${tag}>\n${content}\n</${tag}>`;
}
