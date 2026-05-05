import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchAndFilter } from "@/app/_components/SearchAndFilter";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "q") return "";
      if (key === "area") return "";
      return null;
    },
  }),
}));

describe("SearchAndFilter", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a search input", () => {
    render(<SearchAndFilter />);
    expect(screen.getByPlaceholderText(/search by title/i)).toBeTruthy();
  });

  it("renders All chip as active by default", () => {
    render(<SearchAndFilter />);
    const allBtn = screen.getByRole("button", { name: "All" });
    expect(allBtn.className).toContain("win-btn-active");
  });

  it("renders all four area chips", () => {
    render(<SearchAndFilter />);
    expect(screen.getByRole("button", { name: "Clinical" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Operational" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Safety" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Administrative" })).toBeTruthy();
  });

  it("calls router.replace when area chip is clicked", () => {
    render(<SearchAndFilter />);
    fireEvent.click(screen.getByRole("button", { name: "Clinical" }));
    expect(mockReplace).toHaveBeenCalledWith("/?area=Clinical", { scroll: false });
  });

  it("calls router.replace when search input changes (after debounce)", () => {
    render(<SearchAndFilter />);
    fireEvent.change(screen.getByPlaceholderText(/search by title/i), {
      target: { value: "cardiac" },
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(mockReplace).toHaveBeenCalledWith("/?q=cardiac", { scroll: false });
  });
});
