---
name: windows-311-style
description: Use when building a UI that should look like Windows 3.1/3.11 — classic gray palette, 3D beveled borders, teal desktop, title bars, dialogs, listviews, groupboxes, and status bars for web apps using CSS and React/HTML.
---

# Windows 3.11 UI Style

## Overview

Windows 3.1 (1992) has one visual trick at its core: **two-tone borders**. Every surface uses lighter edges on top/left and darker edges on bottom/right to simulate a light source from the upper-left. Get the border system right and the rest follows.

## Color Palette

| Role | Value | Notes |
|---|---|---|
| Desktop | `#008080` | Dithered — see below |
| Surface | `#c0c0c0` | Every panel, button, window |
| Title bar | `#000080` | Flat navy — no gradient (gradients = Win95) |
| Bright highlight | `#ffffff` | Top/left outer edge |
| Soft highlight | `#dfdfdf` | Top/left inner edge |
| Shadow | `#808080` | Bottom/right inner edge |
| Deep shadow | `#404040` | Bottom/right outer edge |

## The 3D Border System

All 3D effects use **`border-color` shorthand** (top right bottom left). Never use `box-shadow`.

```css
.win-raised       { border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; }
.win-raised-outer { border: 2px solid; border-color: #dfdfdf #404040 #404040 #dfdfdf; }
.win-sunken       { border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; }
```

Windows use **both**: `win-raised-outer` wrapping `win-raised`. This gives the authentic double-border chrome.

## Dithered Desktop

The Win3.1 desktop is a 2×2 checkerboard, not flat `#008080`:

```css
body {
  background-color: #008080;
  background-image: repeating-conic-gradient(#007070 0% 25%, #008080 0% 50%);
  background-size: 4px 4px;
}
```

## Typography

- `font-family: 'MS Sans Serif', Tahoma, Arial, sans-serif`
- `font-size: 11px` — not 12px (8pt @ 96dpi = 11px)
- `cursor: default` on all UI chrome — no pointer cursor anywhere in Win3.x

## Component Patterns

All ready-to-use CSS classes (button, input, listview, groupbox, status bar, scrollbars, etc.) are in **`components.css`** in this skill directory. Copy it into your project's global stylesheet.

## Common Mistakes

| Mistake | Correct approach |
|---|---|
| Flat `#008080` desktop | Use `repeating-conic-gradient` dither |
| `font-size: 12px` | Use `11px` (8pt @ 96dpi) |
| `box-shadow` for 3D borders | Use `border-color` 4-value shorthand — `box-shadow` cannot produce two colors on opposite sides |
| Single border on window | Use `win-raised-outer` + `win-raised` nested |
| Gradient on title bar | Flat `#000080` only — gradients are Win95+ |
| `cursor: pointer` on buttons | `cursor: default` everywhere |
| Hover effects on buttons | Win3.1 had none — only `:active` state |
| Forgetting status bar | Most Win3.x apps had one |
| Tailwind color utilities | Tailwind grays (`gray-300` = `#d1d5db`) don't match; use inline styles or CSS custom properties |
| Tailwind `px-*`/`py-*` on `.win-btn` | Overrides CSS padding and silently breaks the `:active` shift — use CSS-only padding on Win components |
| `border-radius` anywhere | Win3.1 had none — add `border-radius: 0` explicitly or ban `rounded` classes |

## Rationalizations to Reject

| Rationalization | Why it fails |
|---|---|
| "Use Tailwind for everything — it's already installed" | Tailwind's palette doesn't match. Use Tailwind for layout (`flex`, `gap`) only, never for border colors on Win-styled elements |
| "Hex values don't matter, close enough is fine" | Wrong values produce a flat gray box. The 3D effect depends on specific contrast ratios |
| "`box-shadow` achieves the same result" | It does not — it applies one color to all sides. Two-tone bevels require `border-color` shorthand |
| "Rounded corners look more modern" | Win95+. Not Win3.11. The skill is period-specific |
| "No time for a separate CSS system" | It's ~80 lines. Define once in a globals file |

## Red Flags — Stop and Fix

- Adding `rounded` or `border-radius` to any Win-styled element
- Using Tailwind `shadow-*` instead of `border-color` shorthand
- Using `hover:` Tailwind variants on buttons
- Using Tailwind `px-*`/`py-*` on an element with a `.win-btn` CSS class
- Using `background: linear-gradient(...)` on a title bar
- Omitting the status bar because "it's just a simple dialog"
