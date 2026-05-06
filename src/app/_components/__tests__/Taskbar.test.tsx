// src/app/_components/__tests__/Taskbar.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { Taskbar } from "@/app/_components/Taskbar";
import {
  WindowStateProvider,
  MinimizeButton,
  WindowBody,
} from "@/app/_components/WindowStateContext";

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

const setPathname = (path: string) =>
  (usePathname as Mock).mockReturnValue(path);

// All Taskbar renders need a WindowStateProvider since Taskbar calls useWindowState()
function renderTaskbar() {
  return render(
    <WindowStateProvider>
      <Taskbar />
    </WindowStateProvider>
  );
}

// Helper to render a minimized window for restore tests
function renderMinimizedTaskbar() {
  render(
    <WindowStateProvider>
      <MinimizeButton />
      <WindowBody><span>window content</span></WindowBody>
      <Taskbar />
    </WindowStateProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Minimize" }));
  // window is now hidden
}

describe("Taskbar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the Start button with the Windows logo image", () => {
    setPathname("/");
    renderTaskbar();
    expect(screen.getByText("Start")).toBeTruthy();
    expect(screen.getByAltText("Windows")).toBeTruthy();
  });

  it("marks Topics as active on /", () => {
    setPathname("/");
    renderTaskbar();
    const link = screen.getByRole("link", { name: /^topics$/i });
    expect(link.className).toContain("win-btn-active");
  });

  it("marks Topics as active on /topics/123", () => {
    setPathname("/topics/123");
    renderTaskbar();
    const link = screen.getByRole("link", { name: /^topics$/i });
    expect(link.className).toContain("win-btn-active");
  });

  it("marks Notifications as active on /notifications", () => {
    setPathname("/notifications");
    renderTaskbar();
    const link = screen.getByRole("link", { name: /^notifications$/i });
    expect(link.className).toContain("win-btn-active");
  });

  it("does not mark Topics as active on /notifications", () => {
    setPathname("/notifications");
    renderTaskbar();
    const link = screen.getByRole("link", { name: /^topics$/i });
    expect(link.className).not.toContain("win-btn-active");
  });

  it("does not mark Notifications as active on /topics", () => {
    setPathname("/topics");
    renderTaskbar();
    const link = screen.getByRole("link", { name: /^notifications$/i });
    expect(link.className).not.toContain("win-btn-active");
  });

  it("renders a clock that shows a time string after mount", () => {
    setPathname("/");
    renderTaskbar();
    act(() => { vi.advanceTimersByTime(0); });
    const clock = screen.getByTestId("taskbar-clock");
    expect(clock.textContent).toMatch(/\d{1,2}:\d{2}/);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(clock.textContent).toMatch(/\d{1,2}:\d{2}/);
  });

  it("renders Topics link with href /topics", () => {
    setPathname("/");
    renderTaskbar();
    const link = screen.getByRole("link", { name: /^topics$/i });
    expect(link.getAttribute("href")).toBe("/topics");
  });

  it("renders Notifications link with href /notifications", () => {
    setPathname("/");
    renderTaskbar();
    const link = screen.getByRole("link", { name: /^notifications$/i });
    expect(link.getAttribute("href")).toBe("/notifications");
  });

  it("clicking Topics restores the window when minimized", () => {
    setPathname("/");
    renderMinimizedTaskbar();
    fireEvent.click(screen.getByRole("link", { name: /^topics$/i }));
    expect(screen.getByText("window content")).toBeTruthy();
  });

  it("clicking Notifications restores the window when minimized", () => {
    setPathname("/");
    renderMinimizedTaskbar();
    fireEvent.click(screen.getByRole("link", { name: /^notifications$/i }));
    expect(screen.getByText("window content")).toBeTruthy();
  });

  it("renders the Paramedic Learnings pinned app button", () => {
    setPathname("/");
    renderTaskbar();
    expect(screen.getByRole("button", { name: /paramedic learnings/i })).toBeTruthy();
  });

  it("Paramedic Learnings button does not have win-btn-active when window is open", () => {
    setPathname("/");
    renderTaskbar();
    const btn = screen.getByRole("button", { name: /paramedic learnings/i });
    expect(btn.className).not.toContain("win-btn-active");
  });

  it("Paramedic Learnings button has win-btn-active when window is minimized", () => {
    setPathname("/");
    renderMinimizedTaskbar();
    const btn = screen.getByRole("button", { name: /paramedic learnings/i });
    expect(btn.className).toContain("win-btn-active");
  });

  it("clicking Paramedic Learnings button minimizes the window when open", () => {
    setPathname("/");
    render(
      <WindowStateProvider>
        <WindowBody><span>window content</span></WindowBody>
        <Taskbar />
      </WindowStateProvider>
    );
    expect(screen.getByText("window content")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /paramedic learnings/i }));
    expect(screen.queryByText("window content")).toBeNull();
  });

  it("clicking Paramedic Learnings button restores the window when minimized", () => {
    setPathname("/");
    renderMinimizedTaskbar();
    fireEvent.click(screen.getByRole("button", { name: /paramedic learnings/i }));
    expect(screen.getByText("window content")).toBeTruthy();
  });

  it("all taskbar buttons share a uniform height of 28px", () => {
    setPathname("/");
    renderTaskbar();
    const topics = screen.getByRole("link", { name: /^topics$/i });
    const notifications = screen.getByRole("link", { name: /^notifications$/i });
    const paramedic = screen.getByRole("button", { name: /paramedic learnings/i });
    const start = screen.getByRole("button", { name: /start/i });
    // Asserting inline style directly — height is locked via style prop (not a class) to guarantee specificity
    expect(topics.style.height).toBe("28px");
    expect(notifications.style.height).toBe("28px");
    expect(paramedic.style.height).toBe("28px");
    expect(start.style.height).toBe("28px");
  });
});
