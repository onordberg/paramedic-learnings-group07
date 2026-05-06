# Minimize Button Design

**Date:** 2026-05-06

## Overview

Wire up the `─` minimize button in the outer app window's Win 3.11 title bar. Clicking it hides the window content; clicking any taskbar button restores the window and navigates.

## Scope

Only the **outer app window** (the `win-raised` shell in `layout.tsx`) gets a working minimize button. Inner page-level title bars (Login, Register, Topics, Notifications, etc.) keep their `─` buttons decorative — they are sub-panels inside the app, not independent OS-level windows.

## Behavior

### Minimize
- User clicks `─` in the outer title bar
- The nav bar, main content area, and footer disappear (`WindowBody` renders `null`)
- The title bar strip remains visible
- The taskbar remains visible at the bottom

### Restore
- User clicks any taskbar button (Topics or Notifications)
- `restore()` is called before the Link navigation fires
- The window content reappears
- Next.js routes to the clicked page

### State
- `useState(false)` in `WindowStateProvider` — no persistence
- Refreshing the page always opens the window (expected browser behavior)
- `▼` and `▲` title bar buttons remain decorative

## Architecture

```
layout.tsx (server component — calls auth())
└── <WindowStateProvider>           "use client" — owns isMinimized state
    └── <div.win-raised-outer>
        └── <div.win-raised>
            ├── <div.win-titlebar>
            │   └── <MinimizeButton />    "use client" — calls minimize()
            ├── <WindowBody>              "use client" — renders null when minimized
            │   ├── <nav.win-menubar>
            │   ├── <main>
            │   └── <footer.win-statusbar>
            └── (nothing when minimized)
└── <Taskbar />                     already "use client" — calls restore() on click
```

## Files

### New: `src/app/_components/WindowStateContext.tsx`

Single `"use client"` file exporting four things:

| Export | Description |
|---|---|
| `WindowStateProvider` | Wraps children; owns `useState(false)`; provides `{ isMinimized, minimize, restore }` via context |
| `useWindowState()` | Hook; throws if used outside provider |
| `MinimizeButton` | `<button class="win-titlebar-btn">─</button>`; calls `minimize()` on click |
| `WindowBody` | Renders `{children}` when not minimized, `null` when minimized; fragment wrapper (no extra DOM node) |

### Modified: `src/app/layout.tsx`

Two targeted changes:
1. Replace the decorative `─` div in the title bar with `<MinimizeButton />`
2. Wrap `<nav>`, `<main>`, and `<footer>` in `<WindowBody>`, and wrap the full body content in `<WindowStateProvider>`

### Modified: `src/app/_components/Taskbar.tsx`

One targeted change:
- Add optional `onBeforeNavigate?: () => void` prop to `TaskbarButton`
- When present, an `onClick` handler calls it before the `<Link>` fires
- Topics and Notifications buttons pass `restore` (from `useWindowState()`) as `onBeforeNavigate`

## Out of Scope

- Inner page title bar minimize buttons (Login, Register, Topics, Notifications pages)
- Minimize animation
- Persisting minimized state across page refreshes
- `▼` / `▲` button functionality
