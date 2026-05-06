// src/app/_components/__tests__/Taskbar.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { Taskbar } from "@/app/_components/Taskbar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

// next/image doesn't render in jsdom — replace with a plain <img>
vi.mock("next/image", () => ({
  default: ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

// next/link renders as a plain <a> in jsdom — no mock needed

const setPathname = (path: string) =>
  (usePathname as Mock).mockReturnValue(path);

describe("Taskbar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the Start button with the Windows logo image", () => {
    setPathname("/");
    render(<Taskbar />);
    expect(screen.getByText("Start")).toBeTruthy();
    expect(screen.getByAltText("Windows")).toBeTruthy();
  });

  it("marks Topics as active on /", () => {
    setPathname("/");
    render(<Taskbar />);
    const link = screen.getByRole("link", { name: /^topics$/i });
    expect(link.className).toContain("win-btn-active");
  });

  it("marks Topics as active on /topics/123", () => {
    setPathname("/topics/123");
    render(<Taskbar />);
    const link = screen.getByRole("link", { name: /^topics$/i });
    expect(link.className).toContain("win-btn-active");
  });

  it("marks Notifications as active on /notifications", () => {
    setPathname("/notifications");
    render(<Taskbar />);
    const link = screen.getByRole("link", { name: /^notifications$/i });
    expect(link.className).toContain("win-btn-active");
  });

  it("does not mark Topics as active on /notifications", () => {
    setPathname("/notifications");
    render(<Taskbar />);
    const link = screen.getByRole("link", { name: /^topics$/i });
    expect(link.className).not.toContain("win-btn-active");
  });

  it("does not mark Notifications as active on /topics", () => {
    setPathname("/topics");
    render(<Taskbar />);
    const link = screen.getByRole("link", { name: /^notifications$/i });
    expect(link.className).not.toContain("win-btn-active");
  });

  it("renders a clock that shows a time string after mount", () => {
    setPathname("/");
    render(<Taskbar />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    const clock = screen.getByTestId("taskbar-clock");
    expect(clock.textContent).toMatch(/\d{1,2}:\d{2}/);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(clock.textContent).toMatch(/\d{1,2}:\d{2}/);
  });

  it("renders Topics link with href /topics", () => {
    setPathname("/");
    render(<Taskbar />);
    const link = screen.getByRole("link", { name: /^topics$/i });
    expect(link.getAttribute("href")).toBe("/topics");
  });

  it("renders Notifications link with href /notifications", () => {
    setPathname("/");
    render(<Taskbar />);
    const link = screen.getByRole("link", { name: /^notifications$/i });
    expect(link.getAttribute("href")).toBe("/notifications");
  });
});
