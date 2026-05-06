# Taskbar Pinned App Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Paramedic Learnings" button to the taskbar that is always visible, shows as pressed when the window is minimized, and toggles minimize/restore on click.

**Architecture:** `TaskbarButton` gains an `onClick` prop for the non-href (button) branch. `Taskbar` destructures `isMinimized` and `minimize` from the existing `useWindowState()` call and renders the pinned button between the separator and Topics. No new files, no changes outside these two files.

**Tech Stack:** React 19, Next.js 16 App Router, TypeScript, Vitest + React Testing Library

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `src/app/_components/Taskbar.tsx` | Add `onClick` to `TaskbarButton`; add pinned app button |
| Modify | `src/app/_components/__tests__/Taskbar.test.tsx` | Add 5 new tests for pinned button behavior |

---

## Task 1: Pinned app button — tests first, then implementation

**Files:**
- Modify: `src/app/_components/Taskbar.tsx`
- Modify: `src/app/_components/__tests__/Taskbar.test.tsx`

- [ ] **Step 1: Add the 5 new tests to Taskbar.test.tsx**

Insert these 5 tests after the existing `"clicking Notifications restores the window when minimized"` test (before the closing `});` of the `describe` block):

```tsx
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
```

- [ ] **Step 2: Run the new tests — expect them to fail**

```bash
npm test -- Taskbar
```

Expected: 11 existing tests pass, 5 new tests fail (button not rendered yet).

- [ ] **Step 3: Replace the entire contents of Taskbar.tsx**

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
  onClick,
}: {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
  extraStyle?: React.CSSProperties;
  onBeforeNavigate?: () => void;
  onClick?: () => void;
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
    <button type="button" className={className} style={style} onClick={onClick}>
      {children}
    </button>
  );
}

export function Taskbar() {
  const pathname = usePathname();
  const { isMinimized, minimize, restore } = useWindowState();
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

      {/* Pinned app button — reflects window state, toggles minimize/restore */}
      <TaskbarButton
        active={isMinimized}
        onClick={() => (isMinimized ? restore() : minimize())}
        extraStyle={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/PARAME~1.SVG" alt="" width={20} height={20} style={{ imageRendering: "pixelated" }} />
        Paramedic Learnings
      </TaskbarButton>

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

- [ ] **Step 4: Run all tests — expect all 16 pass**

```bash
npm test -- Taskbar
```

Expected: all 16 tests pass (11 existing + 5 new).

- [ ] **Step 5: Run the full test suite**

```bash
npm test
```

Expected: all 39+ tests pass across all test files.

- [ ] **Step 6: Commit**

```bash
git add src/app/_components/Taskbar.tsx src/app/_components/__tests__/Taskbar.test.tsx
git commit -m "feat: add pinned Paramedic Learnings button to taskbar — reflects minimized state"
```
