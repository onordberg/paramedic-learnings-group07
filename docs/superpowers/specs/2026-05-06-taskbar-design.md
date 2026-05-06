# Win 3.11 Taskbar — Design Spec

**Date:** 2026-05-06
**Status:** Approved

## Goal

Add a Windows 3.11-style taskbar pinned to the bottom of the viewport, sitting on the teal desktop outside the floating app window. The taskbar shows which top-level section is currently open (Topics or Notifications) and provides a live clock.

## What changes — and what doesn't

| Part | Change |
|---|---|
| App window (title bar, nav, content, status bar) | **No change** |
| `layout.tsx` — body padding | Add `pb-8` (32px) so the teal desktop scrolls clear of the taskbar |
| New `Taskbar` client component | New file: `src/app/_components/Taskbar.tsx` |
| Windows logo asset | Move to `public/images/windows-logo.webp` (rename to remove spaces) |

## Taskbar anatomy (left → right)

1. **Start button** — decorative, no routing. Styled as a raised Win button. Shows the Windows 3.1 logo (`public/images/windows-logo.webp`, rendered via Next.js `<Image>` at 20×20px) followed by the text "Start". If the logo has a white background rather than transparency, it is acceptable — consistent with the era's aesthetic.
2. **Vertical separator** — 1px `#808080` line with 1px `#ffffff` right edge (classic Win divider).
3. **Topics button** — routes to `/topics`. Active (current section) = sunken border + 1px padding shift matching `.win-btn-active`. Inactive = standard raised border.
4. **Notifications button** — routes to `/notifications`. Same active/inactive logic.
5. **Clock** — right-aligned, sunken panel, live time updated every second via `setInterval`.

## Active section detection

- `usePathname()` from `next/navigation`.
- Topics button is active when pathname is `/` or starts with `/topics`.
- Notifications button is active when pathname is `/notifications`.

## Component structure

```
src/app/_components/Taskbar.tsx   ← "use client", single file
```

- `usePathname()` for active detection.
- `useState<string>` + `useEffect` with `setInterval(1000)` for the clock, initialised to `""` to avoid hydration mismatch (renders only after mount).
- Taskbar div: `position: fixed; bottom: 0; left: 0; right: 0; z-index: 50`.
- Styling uses existing `globals.css` primitives: `win-raised` borders, same `#c0c0c0` background, `win-btn-active` sunken state.

## Layout integration

In `src/app/layout.tsx`:
- Import and render `<Taskbar />` as the last child of `<body>`.
- Add `pb-8` to the body className so the teal desktop area has enough clearance below the floating window.
- The floating window div itself is **not modified**.

## Routing behaviour

The taskbar buttons are `<Link>` elements styled as buttons — they navigate without a full page reload (Next.js client-side navigation). The active state re-renders reactively via `usePathname()`.

## Out of scope

- Start button menu or any dropdown.
- Additional taskbar buttons beyond Topics and Notifications.
- Any change to the app window size, title bar, menu bar, or status bar.
