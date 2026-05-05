---
name: windows-311-style
description: Use when building a UI that should look like Windows 3.1/3.11 — classic gray palette, 3D beveled borders, teal desktop, title bars, dialogs, listviews, groupboxes, and status bars for web apps using CSS and React/HTML.
---

# Windows 3.11 UI Style

## Overview

Windows 3.1 (1992) has one visual trick at its core: **two-tone borders**. Every surface uses lighter edges on top/left and darker edges on bottom/right to simulate a light source from the upper-left. Nothing else creates the look. Get the border system right and the rest follows.

## Color Palette

| Role | Value | Notes |
|---|---|---|
| Desktop background | `#008080` | Use dithered — see below |
| Window / button face | `#c0c0c0` | Every surface |
| Active title bar | `#000080` | Flat navy — no gradient (gradients = Win95) |
| Title bar text | `#ffffff` | |
| Bright highlight | `#ffffff` | Top/left outer edge |
| Soft highlight | `#dfdfdf` | Top/left inner edge |
| Shadow | `#808080` | Bottom/right inner edge |
| Deep shadow | `#404040` | Bottom/right outer edge |
| Text | `#000000` | |
| Input background | `#ffffff` | |

## The 3D Border System

All 3D effects use **`border-color` shorthand** (top right bottom left). Never use `box-shadow: inset` as the primary border technique — it competes with real borders.

```css
/* Raised (buttons, panels, windows) */
.win-raised {
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
}

/* Double-raised for outer window chrome */
.win-raised-outer {
  border: 2px solid;
  border-color: #dfdfdf #404040 #404040 #dfdfdf;
}

/* Sunken (text inputs, listviews, content wells) */
.win-sunken {
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
}
```

Wrap windows in both: `win-raised-outer` outside, `win-raised` inside. This gives the authentic double-border look.

## The Dithered Desktop

The Win3.1 desktop is **not** flat `#008080` — it's a 2×2 checkerboard dither:

```css
body {
  background-color: #008080;
  background-image: repeating-conic-gradient(#007070 0% 25%, #008080 0% 50%);
  background-size: 4px 4px;
}
```

## Typography

- `font-family: 'MS Sans Serif', Tahoma, Arial, sans-serif`
- `font-size: 11px` — not 12px. Win3.1 used 8pt @ 96dpi = **11px**
- `line-height: 1.4`
- `cursor: default` on all UI chrome (no pointer cursor anywhere in Win3.x)

## Component Patterns

### Window Chrome

```html
<div class="win-raised-outer">
  <div class="win-raised" style="background:#c0c0c0">
    <div class="win-titlebar">
      <div class="win-titlebar-btn">─</div>
      <span>Window Title</span>
      <div style="display:flex;gap:2px">
        <div class="win-titlebar-btn">▼</div>
        <div class="win-titlebar-btn">▲</div>
      </div>
    </div>
    <nav class="win-menubar">...</nav>
    <main>...content...</main>
    <footer class="win-statusbar">
      <span class="win-status-panel" style="flex:1">Ready</span>
    </footer>
  </div>
</div>
```

### Button

```css
.win-btn {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 4px 16px;
  font-family: 'MS Sans Serif', Tahoma, Arial, sans-serif;
  font-size: 11px;
  min-width: 75px;
  cursor: default;
}
.win-btn:active {
  border-color: #808080 #ffffff #ffffff #808080;
  padding: 5px 15px 3px 17px; /* shift content 1px right-down */
}
.win-btn:focus {
  outline: 1px dotted #000000;
  outline-offset: -5px;
}
/* Default button (has extra outer black border) */
.win-btn-default { border-color: #000000 #808080 #808080 #000000; }
```

### Text Input / Textarea

```css
.win-input {
  background: #ffffff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  padding: 2px 4px;
  font-family: 'MS Sans Serif', Tahoma, Arial, sans-serif;
  font-size: 11px;
  outline: none;
  width: 100%;
}
```

### Listview (table-like list)

```css
.win-listview {
  background: #ffffff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  overflow: auto;
}
.win-listrow { padding: 3px 6px; border-bottom: 1px solid #e8e8e8; }
.win-listrow:hover { background: #000080; color: #ffffff; }
.win-listrow:hover * { color: #ffffff !important; }
```

### Groupbox (labeled panel)

```css
.win-groupbox {
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  padding: 16px 8px 8px;
  position: relative;
}
.win-groupbox-title {
  position: absolute;
  top: -8px; left: 8px;
  background: #c0c0c0;
  padding: 0 4px;
  font-size: 11px;
}
```

### Status Bar

```css
.win-statusbar {
  background: #c0c0c0;
  border-top: 1px solid #808080;
  display: flex;
  gap: 2px;
  padding: 2px;
}
.win-status-panel {
  border: 1px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  padding: 1px 6px;
  font-size: 11px;
}
```

### Separator

```css
.win-separator {
  border: 0;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #ffffff;
  margin: 6px 0;
}
```

### Scrollbars (Chromium only)

```css
::-webkit-scrollbar { width: 17px; height: 17px; }
::-webkit-scrollbar-track {
  background: #c0c0c0;
  background-image: repeating-conic-gradient(#a0a0a0 0% 25%, #c0c0c0 0% 50%);
  background-size: 4px 4px;
}
::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
}
```

## Common Mistakes

| Mistake | Correct approach |
|---|---|
| Flat `#008080` desktop | Use `repeating-conic-gradient` dither |
| `font-size: 12px` | Use `11px` (8pt @ 96dpi) |
| `box-shadow: inset` for 3D borders | Use `border-color` 4-value shorthand |
| Single border on window | Use `win-raised-outer` + `win-raised` nested |
| Gradient on title bar | Flat `#000080` only — gradients are Win95+ |
| `cursor: pointer` on buttons | `cursor: default` everywhere in Win3.x |
| Hover effects on buttons | Win3.1 had none — only `:active` state |
| Forgetting status bar | Most Win3.x apps had one |
| `font-size` overrides on child elements | `body` sets 11px; only override where needed |
| Tailwind color utilities for these values | These hex values won't match Tailwind defaults — use inline styles or CSS custom properties |
| Tailwind spacing utilities on Win-styled elements | `px-4` on `.win-btn` overrides CSS padding and silently breaks the `:active` shift — use CSS-only padding on Win components |
| `border-radius` on any element | Win3.1 had none — always add `border-radius: 0` or ensure no Tailwind `rounded` class is applied |
| Using `box-shadow` because "it's close enough" | It is not close enough — `box-shadow` cannot produce two different colors on opposite sides. The entire bevel effect requires `border-color` shorthand. |

## Rationalizations to Reject

These arguments will be made. They are wrong.

| Rationalization | Why it fails |
|---|---|
| "Tailwind is already installed, let's use it for everything" | Tailwind's gray palette (`gray-300` = `#d1d5db`) doesn't match Win3.11 values. Use Tailwind for layout (`flex`, `gap`, `p-`) but never for border colors on Win-styled components |
| "The exact hex values don't matter, close enough is fine" | The entire 3D effect depends on specific contrast ratios between `#ffffff`/`#dfdfdf` and `#808080`/`#404040`. Wrong values produce a flat gray box, not a beveled surface |
| "`box-shadow` achieves the same visual result" | It does not. `box-shadow` applies the same color to all sides. Two-tone bevels require different colors per side — only `border-color` shorthand does this |
| "Rounded corners look more modern / the client prefers them" | Rounded corners are Win95+. Adding `border-radius` breaks the period-correct look. The skill is for Win3.11 specifically |
| "We don't have time to write a separate CSS system" | You need ~80 lines of CSS. That's not a system. Define the classes once in a `<style>` block or globals file |
| "Gradient title bars look better" | Gradients are Win95+. Win3.11 title bars are flat `#000080`. Period |

## Red Flags — Stop and Fix

If you find yourself doing any of these, you are implementing it wrong:

- Adding `rounded` or `border-radius` to any Win-styled element
- Using Tailwind `shadow-*` utilities instead of `border-color` shorthand
- Using `hover:` Tailwind variants on buttons (Win3.1 had no hover states)
- Using Tailwind `px-*` / `py-*` directly on an element that also has a `.win-btn` CSS class
- Using `#d1d5db`, `#9ca3af`, or any Tailwind gray instead of `#c0c0c0`, `#808080`, `#404040`
- Using `background: linear-gradient(...)` on a title bar
- Omitting the status bar because "it's just a simple dialog"
