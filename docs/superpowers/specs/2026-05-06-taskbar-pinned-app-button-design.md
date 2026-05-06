# Taskbar Pinned App Button Design

**Date:** 2026-05-06

## Overview

Add a permanently-visible "Paramedic Learnings" button to the taskbar that reflects window state: normal/raised when the window is open, pressed/active when minimized. Clicking toggles: minimizes when open, restores when minimized.

## Scope

Changes are confined to `Taskbar.tsx` and its test file. No new files, no new exports from `WindowStateContext`.

## Behavior

- The button is always rendered (not conditional on window state)
- **Window open:** normal raised style (`win-btn win-btn-sm`); clicking calls `minimize()`
- **Window minimized:** pressed/sunken style (`win-btn win-btn-sm win-btn-active`); clicking calls `restore()`
- Label: Windows logo image + "Paramedic Learnings" text (reuses the logo already used by Start)
- Position: immediately after the separator, before Topics

```
[Start] | [Paramedic Learnings] | [Topics] [🔔 Notifications]    [12:00]
```

## Architecture

The change is entirely within `Taskbar.tsx`. `Taskbar` already calls `useWindowState()` — we add `isMinimized` and `minimize` to the existing destructure.

`TaskbarButton` gains an `onClick?: () => void` prop for the non-href case (the `<button>` branch). The pinned app button uses `active={isMinimized}` (existing prop) and `onClick={() => isMinimized ? restore() : minimize()}`.

No new component, no new file, no new export from `WindowStateContext`.

## Files

### Modified: `src/app/_components/Taskbar.tsx`

Two targeted changes:
1. Add `onClick?: () => void` to `TaskbarButton` props; pass it to the `<button>` element in the non-href branch
2. Destructure `isMinimized` and `minimize` from `useWindowState()` alongside the existing `restore`
3. Render the pinned app button after the separator:

```tsx
<TaskbarButton
  active={isMinimized}
  onClick={() => (isMinimized ? restore() : minimize())}
  extraStyle={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}
>
  <Image src="/images/windows-logo.webp" alt="" width={20} height={20} />
  Paramedic Learnings
</TaskbarButton>
```

### Modified: `src/app/_components/__tests__/Taskbar.test.tsx`

Five new tests:
1. Pinned app button always renders
2. Does not have `win-btn-active` when window is open
3. Has `win-btn-active` when window is minimized
4. Clicking when open hides `WindowBody` content (minimizes)
5. Clicking when minimized shows `WindowBody` content (restores)

## Out of Scope

- Changing the appearance of Topics or Notifications buttons when minimized
- Persisting minimized state
- Any change to `WindowStateContext.tsx` or `layout.tsx`
