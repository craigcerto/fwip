import type { TransformFn } from "../types.js";

import { appendText } from "./appendText.js";
import { prependText } from "./prependText.js";
import { languageEnforce } from "./languageEnforce.js";
import { jsonReinforce } from "./jsonReinforce.js";
import { simplify } from "./simplify.js";
import { grounding } from "./grounding.js";
import { selfVerify } from "./selfVerify.js";
import { xmlWrap } from "./xmlWrap.js";
import { markdownStructure } from "./markdownStructure.js";
import { thinkingPrefix } from "./thinkingPrefix.js";
import { constraintReorder } from "./constraintReorder.js";
import { suppressMarkers } from "./suppressMarkers.js";
import { typeReinforce } from "./typeReinforce.js";
import { nestedObjectFix } from "./nestedObjectFix.js";

/** Registry of all built-in transform functions, keyed by config name. */
export const TRANSFORMS: Record<string, TransformFn> = {
  append_text: appendText,
  prepend_text: prependText,
  language_enforce: languageEnforce,
  json_reinforce: jsonReinforce,
  simplify: simplify,
  grounding: grounding,
  self_verify: selfVerify,
  xml_wrap: xmlWrap,
  markdown_structure: markdownStructure,
  thinking_prefix: thinkingPrefix,
  constraint_reorder: constraintReorder,
  suppress_markers: suppressMarkers,
  type_reinforce: typeReinforce,
  nested_object_fix: nestedObjectFix,
};

// Re-export individual transforms for direct import
export {
  appendText,
  prependText,
  languageEnforce,
  jsonReinforce,
  simplify,
  grounding,
  selfVerify,
  xmlWrap,
  markdownStructure,
  thinkingPrefix,
  constraintReorder,
  suppressMarkers,
  typeReinforce,
  nestedObjectFix,
};
