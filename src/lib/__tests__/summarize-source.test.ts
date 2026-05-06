import { vi, describe, it, expect, beforeEach } from "vitest";

const messagesCreate = vi.hoisted(() => vi.fn());

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: messagesCreate } };
  }),
}));

// Import AFTER vi.mock so the mocked SDK is used.
import { summarizeSource } from "../summarize-source";

beforeEach(() => {
  messagesCreate.mockReset();
});

const baseInput = {
  title: "ROSC after 20-min CPR",
  sourceType: "debrief" as const,
  content: "Crew arrived at 02:14. Patient in VF...",
  metadata: null,
};

describe("summarizeSource", () => {
  it("returns the summary text and model id from the API response", async () => {
    messagesCreate.mockResolvedValue({
      model: "claude-sonnet-4-5-20250929",
      content: [{ type: "text", text: "- bullet 1\n- bullet 2\n- bullet 3" }],
    });

    const result = await summarizeSource(baseInput);

    expect(result.summary).toBe("- bullet 1\n- bullet 2\n- bullet 3");
    expect(result.modelId).toBe("claude-sonnet-4-5-20250929");
  });

  it("calls the API with claude-sonnet-4-6 and a max_tokens cap", async () => {
    messagesCreate.mockResolvedValue({
      model: "claude-sonnet-4-5-20250929",
      content: [{ type: "text", text: "- a\n- b\n- c" }],
    });

    await summarizeSource(baseInput);

    const args = messagesCreate.mock.calls[0][0];
    expect(args.model).toBe("claude-sonnet-4-6");
    expect(args.max_tokens).toBe(400);
  });

  it("includes source type, title, and content in the user message", async () => {
    messagesCreate.mockResolvedValue({
      model: "m",
      content: [{ type: "text", text: "- a\n- b\n- c" }],
    });

    await summarizeSource({
      title: "Lidocaine in cardiac arrest",
      sourceType: "research",
      content: "RCT 2024 showed...",
      metadata: null,
    });

    const args = messagesCreate.mock.calls[0][0];
    const userMsg = args.messages[0].content;
    expect(userMsg).toContain("Source type: research");
    expect(userMsg).toContain("Title: Lidocaine in cardiac arrest");
    expect(userMsg).toContain("RCT 2024 showed...");
  });

  it("includes metadata in the user message when provided", async () => {
    messagesCreate.mockResolvedValue({
      model: "m",
      content: [{ type: "text", text: "- a\n- b\n- c" }],
    });

    await summarizeSource({ ...baseInput, metadata: "DOI: 10.1234/xyz" });

    const userMsg = messagesCreate.mock.calls[0][0].messages[0].content;
    expect(userMsg).toContain("Metadata: DOI: 10.1234/xyz");
  });

  it("omits the metadata line when metadata is null", async () => {
    messagesCreate.mockResolvedValue({
      model: "m",
      content: [{ type: "text", text: "- a\n- b\n- c" }],
    });

    await summarizeSource(baseInput);

    const userMsg = messagesCreate.mock.calls[0][0].messages[0].content;
    expect(userMsg).not.toContain("Metadata:");
  });

  it("throws when the response has no text content block", async () => {
    messagesCreate.mockResolvedValue({
      model: "m",
      content: [],
    });

    await expect(summarizeSource(baseInput)).rejects.toThrow(/text/i);
  });

  it("throws when response.content is undefined", async () => {
    messagesCreate.mockResolvedValue({ model: "m", content: undefined });
    await expect(summarizeSource(baseInput)).rejects.toThrow(/text/i);
  });

  it("throws when the first content block is not type 'text'", async () => {
    messagesCreate.mockResolvedValue({
      model: "m",
      content: [{ type: "tool_use", id: "x", name: "y", input: {} }],
    });

    await expect(summarizeSource(baseInput)).rejects.toThrow(/text/i);
  });

  it("propagates API errors to the caller", async () => {
    messagesCreate.mockRejectedValue(new Error("API down"));

    await expect(summarizeSource(baseInput)).rejects.toThrow("API down");
  });
});
