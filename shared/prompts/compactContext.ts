import type { PromptEnvelope } from "@/shared/security/promptPolicy";

const EXAMPLE_LIMIT = 2;
const EXAMPLE_VARIANT_LIMIT = 4;

export function buildCompactStyleContext(envelope: PromptEnvelope): string {
  const compactExamples = envelope.styleExamples
    .slice(0, EXAMPLE_LIMIT)
    .map(compactExample)
    .filter(Boolean)
    .join(" | ");

  return compactExamples || "none";
}

function compactExample(example: string): string {
  return example
    .split(",")
    .map((variant) => variant.trim())
    .filter(Boolean)
    .slice(0, EXAMPLE_VARIANT_LIMIT)
    .join(", ");
}
