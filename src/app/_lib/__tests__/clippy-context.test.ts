import { describe, it, expect } from "vitest";
import { buildPageContext } from "@/app/_lib/clippy-context";

describe("buildPageContext", () => {
  it("returns topic detail context with title, summary, and guidance", () => {
    const result = buildPageContext("topic-detail", {
      title: "Airway Management",
      summary: "Protocols for securing a patent airway.",
      guidance: "Begin with jaw thrust.",
    });
    expect(result).toContain("Airway Management");
    expect(result).toContain("Protocols for securing a patent airway.");
    expect(result).toContain("Begin with jaw thrust.");
  });

  it("returns generic context when page is topic-detail but topic is undefined", () => {
    const result = buildPageContext("topic-detail");
    expect(result).toContain("topic");
  });

  it("returns new topic context", () => {
    expect(buildPageContext("topic-new")).toBe("User is creating a new topic.");
  });

  it("returns topic list context", () => {
    expect(buildPageContext("topic-list")).toBe("User is browsing the topic list.");
  });

  it("returns default context for unknown pages", () => {
    expect(buildPageContext("unknown-page")).toBe(
      "User is on the Paramedic Learnings platform."
    );
  });
});
