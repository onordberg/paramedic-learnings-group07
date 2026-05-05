import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewTopicForm } from "@/app/_components/NewTopicForm";

// Mock the server action — we only test the form UI here
vi.mock("@/app/actions", () => ({
  createTopic: vi.fn(),
}));

// Mock next/navigation (used by SearchAndFilter, not needed here but avoids import errors)
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

describe("NewTopicForm", () => {
  it("renders an area select with all four options", () => {
    render(<NewTopicForm />);
    const select = screen.getByRole("combobox", { name: /area/i });
    expect(select).toBeTruthy();
    expect(screen.getByRole("option", { name: "Clinical" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Operational" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Safety" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Administrative" })).toBeTruthy();
  });

  it("renders a rationale textarea", () => {
    render(<NewTopicForm />);
    const rationale = screen.getByRole("textbox", { name: /rationale/i });
    expect(rationale).toBeTruthy();
  });

  it("renders rationale as optional (no asterisk or required indicator)", () => {
    render(<NewTopicForm />);
    const label = screen.getByText(/rationale/i);
    expect(label.textContent).toMatch(/optional/i);
  });
});
