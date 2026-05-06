import Anthropic from "@anthropic-ai/sdk";
import type { Source } from "@/db/schema";

export type SummarizeSourceInput = Pick<
  Source,
  "title" | "sourceType" | "content" | "metadata"
>;

export interface SummarizeSourceResult {
  summary: string;
  modelId: string;
}

const SYSTEM_PROMPT = `You are an assistant helping topic owners triage incoming sources for ambulance operational guidance.

Produce 3-4 short bullet points capturing the key information a topic owner needs to assess this source. Adjust focus by source type:
- debrief: what happened in the field and what was learned
- research: findings and applicability to practice
- guideline: the recommendations made and to whom they apply
- incident_report: the events and outcomes

Reply with ONLY the bullets, one per line, each starting with "- ". No preamble, no closing remarks.`;

const client = new Anthropic();

export async function summarizeSource(
  input: SummarizeSourceInput
): Promise<SummarizeSourceResult> {
  const userMessage = [
    `Source type: ${input.sourceType}`,
    `Title: ${input.title}`,
    input.metadata ? `Metadata: ${input.metadata}` : null,
    "",
    "Content:",
    input.content,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content?.[0];
  if (!block || block.type !== "text") {
    throw new Error("Anthropic response had no text content block");
  }

  return { summary: block.text.trim(), modelId: response.model };
}
