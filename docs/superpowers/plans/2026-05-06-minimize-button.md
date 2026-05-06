# Minimize Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the `─` button in the outer Win 3.11 title bar so clicking it hides the entire app window, leaving only the teal desktop and taskbar visible; clicking any taskbar nav button restores the window and navigates.

**Architecture:** A `WindowStateContext` client module owns `isMinimized` state with `minimize()`/`restore()`. `WindowBody` wraps the entire outer window and renders `null` when minimized. `Taskbar` calls `restore()` via `onBeforeNavigate` before any Link navigation. `layout.tsx` stays a server component — only two `div`s are swapped for client components.

**Tech Stack:** React 19, Next.js 16 App Router, TypeScript, Vitest + React Testing Library

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/app/_components/WindowStateContext.tsx` | Context, provider, hook, `MinimizeButton`, `WindowBody` |
| Create | `src/app/_components/__tests__/WindowStateContext.test.tsx` | Tests for all four exports |
| Modify | `src/app/_components/Taskbar.tsx` | Add `onBeforeNavigate` prop; call `restore()` on nav clicks |
| Modify | `src/app/_components/__tests__/Taskbar.test.tsx` | Wrap renders in `WindowStateProvider`; add restore tests |
| Modify | `src/app/layout.tsx` | Wire in provider, `WindowBody`, `MinimizeButton` |

---

## Task 1: WindowStateContext — tests first

**Files:**
- Create: `src/app/_components/WindowStateContext.tsx`
- Create: `src/app/_components/__tests__/WindowStateContext.test.tsx`

- [ ] **Step 1: Create a stub file so the test import resolves**

Create `src/app/_components/WindowStateContext.tsx` with only this content:

```tsx
"use client";

export function WindowStateProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function useWindowState() {
  throw new Error("useWindowState must be used inside WindowStateProvider");
}
export function MinimizeButton() {
  return null;
}
export function WindowBody({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Write the tests**

Create `src/app/_components/__tests__/WindowStateContext.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  WindowStateProvider,
  useWindowState,
  MinimizeButton,
  WindowBody,
} from "@/app/_components/WindowStateContext";

// Renders context values as data attributes so tests can inspect state
function Inspector() {
  const { isMinimized, minimize, restore } = useWindowState();
  return (
    <div data-testid="inspector" data-minimized={String(isMinimized)}>
      <button onClick={minimize}>minimize</button>
      <button onClick={restore}>restore</button>
    </div>
  );
}

describe("useWindowState", () => {
  it("throws when used outside WindowStateProvider", () => {
    const consoleError = console.error;
    console.error = () => {};
    expect(() => render(<Inspector />)).toThrow(
      "useWindowState must be used inside WindowStateProvider"
    );
    console.error = consoleError;
  });

  it("starts with isMinimized false", () => {
    render(<WindowStateProvider><Inspector /></WindowStateProvider>);
    expect(screen.getByTestId("inspector").dataset.minimized).toBe("false");
  });

  it("minimize() sets isMinimized to true", () => {
    render(<WindowStateProvider><Inspector /></WindowStateProvider>);
    fireEvent.click(screen.getByRole("button", { name: "minimize" }));
    expect(screen.getByTestId("inspector").dataset.minimized).toBe("true");
  });

  it("restore() sets isMinimized back to false", () => {
    render(<WindowStateProvider><Inspector /></WindowStateProvider>);
    fireEvent.click(screen.getByRole("button", { name: "minimize" }));
    fireEvent.click(screen.getByRole("button", { name: "restore" }));
    expect(screen.getByTestId("inspector").dataset.minimized).toBe("false");
  });
});

describe("MinimizeButton", () => {
  it("renders a button with the minimize glyph", () => {
    render(
      <WindowStateProvider>
        <MinimizeButton />
      </WindowStateProvider>
    );
    expect(screen.getByRole("button", { name: "─" })).toBeTruthy();
  });

  it("calls minimize() on click", () => {
    render(
      <WindowStateProvider>
        <MinimizeButton />
        <Inspector />
      </WindowStateProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "─" }));
    expect(screen.getByTestId("inspector").dataset.minimized).toBe("true");
  });
});

describe("WindowBody", () => {
  it("renders children when not minimized", () => {
    render(
      <WindowStateProvider>
        <WindowBody><span>content</span></WindowBody>
      </WindowStateProvider>
    );
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("renders null when minimized", () => {
    render(
      <WindowStateProvider>
        <MinimizeButton />
        <WindowBody><span>content</span></WindowBody>
      </WindowStateProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "─" }));
    expect(screen.queryByText("content")).toBeNull();
  });
});
```

- [ ] **Step 3: Run the tests — expect failures**

```bash
npm test -- WindowStateContext
```

Expected: multiple failures — stubs don't implement behavior yet.

- [ ] **Step 4: Implement WindowStateContext**

Replace the entire contents of `src/app/_components/WindowStateContext.tsx`:

```tsx
"use client";

import { createContext, useContext, useState } from "react";

interface WindowState {
  isMinimized: boolean;
  minimize: () => void;
  restore: () => void;
}

const WindowStateContext = createContext<WindowState | null>(null);

export function WindowStateProvider({ children }: { children: React.ReactNode }) {
  const [isMinimized, setIsMinimized] = useState(false);
  return (
    <WindowStateContext.Provider
      value={{
        isMinimized,
        minimize: () => setIsMinimized(true),
        restore: () => setIsMinimized(false),
      }}
    >
      {children}
    </WindowStateContext.Provider>
  );
}

export function useWindowState(): WindowState {
  const ctx = useContext(WindowStateContext);
  if (!ctx) throw new Error("useWindowState must be used inside WindowStateProvider");
  return ctx;
}

export function MinimizeButton() {
  const { minimize } = useWindowState();
  return (
    <button
      type="button"
      className="win-titlebar-btn"
      style={{ fontSize: "9px" }}
      onClick={minimize}
    >
      ─
    </button>
  );
}

export function WindowBody({ children }: { children: React.ReactNode }) {
  const { isMinimized } = useWindowState();
  if (isMinimized) return null;
  return <>{children}</>;
}
```

- [ ] **Step 5: Run the tests — expect all pass**

```bash
npm test -- WindowStateContext
```

Expected: all 8 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/_components/WindowStateContext.tsx src/app/_components/__tests__/WindowStateContext.test.tsx
git commit -m "feat: add WindowStateContext with minimize/restore state"
```

---

## Task 2: Update Taskbar to call restore() on navigation

**Files:**
- Modify: `src/app/_components/Taskbar.tsx`
- Modify: `src/app/_components/__tests__/Taskbar.test.tsx`

- [ ] **Step 1: Update Taskbar.test.tsx**

Replace the entire contents of `src/app/_components/__tests__/Taskbar.test.tsx`:

```tsx
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
    render(
      <WindowStateProvider>
        <MinimizeButton />
        <WindowBody><span>window content</span></WindowBody>
        <Taskbar />
      </WindowStateProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "─" }));
    expect(screen.queryByText("window content")).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: /^topics$/i }));
    expect(screen.getByText("window content")).toBeTruthy();
  });

  it("clicking Notifications restores the window when minimized", () => {
    setPathname("/");
    render(
      <WindowStateProvider>
        <MinimizeButton />
        <WindowBody><span>window content</span></WindowBody>
        <Taskbar />
      </WindowStateProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "─" }));
    expect(screen.queryByText("window content")).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: /^notifications$/i }));
    expect(screen.getByText("window content")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the tests — expect the two new restore tests to fail**

```bash
npm test -- Taskbar
```

Expected: 9 existing tests pass, 2 new restore tests fail (Taskbar doesn't call `restore()` yet).

- [ ] **Step 3: Update Taskbar.tsx**

Replace the entire contents of `src/app/_components/Taskbar.tsx`:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useWindowState } from "@/app/_components/WindowStateContext";

function TaskbarButton({
  href,
  active,
  children,
  extraStyle,
  onBeforeNavigate,
}: {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
  extraStyle?: React.CSSProperties;
  onBeforeNavigate?: () => void;
}) {
  const className = active
    ? "win-btn win-btn-sm win-btn-active"
    : "win-btn win-btn-sm";
  // Padding locked on all taskbar buttons to prevent :active pseudo-class jitter
  const style: React.CSSProperties = { padding: "2px 8px", ...extraStyle };

  if (href) {
    return (
      <Link href={href} className={className} style={style} onClick={onBeforeNavigate}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} style={style}>
      {children}
    </button>
  );
}

export function Taskbar() {
  const pathname = usePathname();
  const { restore } = useWindowState();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const topicsActive =
    pathname === "/" ||
    pathname === "/topics" ||
    pathname.startsWith("/topics/");
  const notificationsActive = pathname === "/notifications";

  return (
    <div
      className="win-raised"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#c0c0c0",
        display: "flex",
        alignItems: "center",
        gap: "3px",
        padding: "2px 4px",
        zIndex: 50,
        borderBottom: "none",
        borderLeft: "none",
        borderRight: "none",
      }}
    >
      {/* Start button — decorative, no routing */}
      <TaskbarButton extraStyle={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}>
        <Image
          src="/images/windows-logo.webp"
          alt="Windows"
          width={20}
          height={20}
        />
        Start
      </TaskbarButton>

      {/* Separator */}
      <div
        style={{
          width: "1px",
          height: "20px",
          background: "#808080",
          borderRight: "1px solid #ffffff",
          margin: "0 2px",
          flexShrink: 0,
        }}
      />

      <TaskbarButton href="/topics" active={topicsActive} onBeforeNavigate={restore}>
        Topics
      </TaskbarButton>

      <TaskbarButton
        href="/notifications"
        active={notificationsActive}
        extraStyle={{ display: "flex", alignItems: "center", gap: "4px" }}
        onBeforeNavigate={restore}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/bell-win311.svg" alt="" width={20} height={20} style={{ imageRendering: "pixelated" }} />
        Notifications
      </TaskbarButton>

      {/* Clock */}
      <span
        className="win-status-panel"
        data-testid="taskbar-clock"
        style={{ marginLeft: "auto" }}
      >
        {clock}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests — expect all pass**

```bash
npm test -- Taskbar
```

Expected: all 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/_components/Taskbar.tsx src/app/_components/__tests__/Taskbar.test.tsx
git commit -m "feat: taskbar calls restore() on navigation when window is minimized"
```

---

## Task 3: Wire up layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

No new unit tests — `layout.tsx` is a server component; integration is verified manually via the dev server.

- [ ] **Step 1: Update layout.tsx**

Replace the entire contents of `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NotificationBadge } from "@/app/_components/NotificationBadge";
import { auth, signOut } from "@/auth";
import { Taskbar } from "@/app/_components/Taskbar";
import {
  WindowStateProvider,
  WindowBody,
  MinimizeButton,
} from "@/app/_components/WindowStateContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paramedic Learnings",
  description:
    "A knowledge platform for ambulance personnel: capture and improve operational guidance with AI-assisted analysis and human approval.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="h-full">
      <body
        className="min-h-full flex flex-col items-center p-4 pb-10"
        style={{
          background: "#008080",
          backgroundImage:
            "repeating-conic-gradient(#007070 0% 25%, #008080 0% 50%)",
          backgroundSize: "4px 4px",
        }}
      >
        <WindowStateProvider>
          <WindowBody>
            <div
              className="win-raised-outer w-full max-w-5xl flex flex-col"
              style={{ minHeight: "calc(100vh - 3.5rem)" }}
            >
              <div className="win-raised flex flex-col flex-1" style={{ background: "#c0c0c0" }}>
                <div className="win-titlebar">
                  <div className="flex items-center gap-1">
                    <MinimizeButton />
                    <span>Paramedic Learnings</span>
                  </div>
                  <div className="flex gap-0.5">
                    <div className="win-titlebar-btn">▼</div>
                    <div className="win-titlebar-btn">▲</div>
                  </div>
                </div>

                <nav className="win-menubar">
                  <Link href="/" className="win-menu-item">
                    <u>T</u>opics
                  </Link>
                  <Link href="/topics/new" className="win-menu-item">
                    <u>N</u>ew Topic
                  </Link>
                  <Link href="/notifications" className="win-menu-item">
                    Notifications
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/login" });
                    }}
                    style={{ marginLeft: "auto" }}
                  >
                    <button type="submit" className="win-menu-item">
                      Sign Out
                    </button>
                  </form>
                </nav>

                <main className="flex-1 p-3 overflow-auto" style={{ background: "#c0c0c0" }}>
                  {children}
                </main>

                <footer className="win-statusbar">
                  <span className="win-status-panel" style={{ flex: 1 }}>
                    {session ? `Signed in as ${session.user.name}` : "Ready"}
                  </span>
                  <Suspense fallback={null}>
                    <NotificationBadge />
                  </Suspense>
                  <span className="win-status-panel">Paramedic Learnings v1.0</span>
                </footer>
              </div>
            </div>
          </WindowBody>
          <Taskbar />
        </WindowStateProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Start the dev server and manually verify**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
1. Click `─` in the title bar → entire window disappears, teal desktop + taskbar remain
2. Click "Topics" in taskbar → window reappears, navigates to /topics
3. Click `─` again → window disappears
4. Click "Notifications" in taskbar → window reappears, navigates to /notifications
5. Refresh page → window is open (state is not persisted)

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wire minimize button — window hides and restores via taskbar"
```
