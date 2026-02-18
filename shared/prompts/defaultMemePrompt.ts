import type { PromptEnvelope } from "@/shared/security/promptPolicy";

export function buildDefaultMemePrompt(envelope: PromptEnvelope): string {
  const styleExampleBlock = envelope.styleExamples.length > 0 ? envelope.styleExamples.join("\n- ") : "(none)";

  return [
    `Meme style context: ${envelope.styleContext}`,
    "Style examples:",
    `- ${styleExampleBlock}`,
    `User input: ${envelope.userInput}`,
    "Return exactly one line of comma + space separated Korean variants.",
    "Make a long list (target 24 to 40 items).",
    "The first item must be exactly the user input.",
    "Keep pronunciation close to the original input.",
    "Mutate across the whole phrase, not only the ending.",
    "Do not repeat identical items.",
    "Include at least 6 absurd playful variants with different literal meanings.",
    "Do not include explanations, labels, quotes, numbering, markdown, or URLs."
  ].join("\n");
}
