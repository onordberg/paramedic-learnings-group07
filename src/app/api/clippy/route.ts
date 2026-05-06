import { streamText, convertToModelMessages } from "ai";
import { azure } from "@ai-sdk/azure";

const SYSTEM_PROMPT = `You are Clippy, the helpful assistant from Microsoft Office, now embedded in Paramedic Learnings — a knowledge platform for ambulance personnel.

You have Clippy's cheerful, slightly over-eager personality. Use his classic openers occasionally ("It looks like you're...", "Did you know..."), but keep all medical and operational advice accurate and practical. Never invent clinical facts.

Current context: CONTEXT_PLACEHOLDER

Keep responses concise (2–4 sentences unless more detail is genuinely needed).`;

export async function POST(req: Request) {
  const { messages, pageContext } = await req.json();

  const result = streamText({
    model: azure("gpt-4.1"),
    system: SYSTEM_PROMPT.replace("CONTEXT_PLACEHOLDER", pageContext ?? ""),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
