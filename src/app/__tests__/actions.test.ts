import { describe, it, expect } from "vitest";
import { CreateTopicSchema } from "@/app/_lib/create-topic-schema";

const validInput = {
  title: "Cardiac Arrest Protocol",
  summary: "Guide for managing ROSC",
  guidance: "Step 1: confirm ROSC...",
  area: "Clinical" as const,
  createdBy: "J. Hansen",
};

describe("CreateTopicSchema", () => {
  it("accepts a valid topic without rationale", () => {
    const result = CreateTopicSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts a valid topic with rationale", () => {
    const result = CreateTopicSchema.safeParse({
      ...validInput,
      rationale: "Based on ILCOR 2021 guidelines.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = CreateTopicSchema.safeParse({ ...validInput, title: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Title is required");
  });

  it("rejects missing summary", () => {
    const result = CreateTopicSchema.safeParse({ ...validInput, summary: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Summary is required");
  });

  it("rejects missing guidance", () => {
    const result = CreateTopicSchema.safeParse({ ...validInput, guidance: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Guidance is required");
  });

  it("rejects invalid area value", () => {
    const result = CreateTopicSchema.safeParse({ ...validInput, area: "Unknown" });
    expect(result.success).toBe(false);
  });

  it("rejects missing area", () => {
    const result = CreateTopicSchema.safeParse({ ...validInput, area: undefined });
    expect(result.success).toBe(false);
  });

  it("rejects missing createdBy", () => {
    const result = CreateTopicSchema.safeParse({ ...validInput, createdBy: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Your name is required");
  });

  it("accepts all four area values", () => {
    const areas = ["Clinical", "Operational", "Safety", "Administrative"] as const;
    for (const area of areas) {
      const result = CreateTopicSchema.safeParse({ ...validInput, area });
      expect(result.success).toBe(true);
    }
  });
});
