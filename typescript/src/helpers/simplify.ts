/**
 * Simplify a verbose prompt for smaller models.
 *
 * - Strips markdown headers down to plain labels
 * - Limits numbered methodology steps
 * - Removes verbose examples and edge-case guidance
 */
export function simplifyPrompt(text: string, maxSteps = 5): string {
  const lines = text.trim().split("\n");
  const result: string[] = [];
  let stepCount = 0;
  let inExampleBlock = false;

  for (let line of lines) {
    const stripped = line.trim();

    // Skip example blocks
    if (stripped.toLowerCase().startsWith("example") && stripped.includes(":")) {
      inExampleBlock = true;
      continue;
    }
    if (inExampleBlock && (stripped === "" || stripped.startsWith("-"))) {
      if (stripped === "") {
        inExampleBlock = false;
      }
      continue;
    }

    // Count numbered steps, skip beyond max
    if (/^\d+\.\s/.test(stripped)) {
      stepCount++;
      if (stepCount > maxSteps) {
        continue;
      }
    }

    // Convert markdown headers to plain labels
    line = line.replace(/^#{1,4}\s+/, "");

    result.push(line);
  }

  return result.join("\n").trim();
}
