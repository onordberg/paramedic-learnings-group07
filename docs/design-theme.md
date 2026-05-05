# Design Theme — Paramedic Learnings

**Scope:** Visual design language for Story 1 and the foundation for all subsequent UI work.  
**Date:** 2026-05-05  
**Personality:** Clinical and trustworthy — precise, high-contrast, professional medical software.

---

## Implementation strategy

Theme values are defined as CSS custom properties inside a Tailwind v4 `@theme` block in `src/app/globals.css`. This makes them available as first-class Tailwind utilities (`text-primary`, `bg-surface-raised`, etc.) across all components. Changing a token in one place updates the entire UI — no grep-and-replace across component files.

Components must use the semantic token utilities, not raw Tailwind color names like `blue-600`. This keeps palette changes cheap.

---

## Color palette

| Role | Token | Tailwind source | Hex |
|---|---|---|---|
| Primary action | `--color-primary` | `blue-600` | `#2563eb` |
| Primary hover | `--color-primary-hover` | `blue-700` | `#1d4ed8` |
| Primary subtle bg | `--color-primary-subtle` | `blue-50` | `#eff6ff` |
| Page background | `--color-surface` | `slate-50` | `#f8fafc` |
| Card / raised surface | `--color-surface-raised` | `white` | `#ffffff` |
| Border | `--color-border` | `slate-200` | `#e2e8f0` |
| Primary text | `--color-text` | `slate-900` | `#0f172a` |
| Muted text | `--color-text-muted` | `slate-500` | `#64748b` |
| Danger | `--color-danger` | `red-600` | `#dc2626` |
| Success | `--color-success` | `green-600` | `#16a34a` |

---

## Typography

Font family: **Geist Sans** (body) and **Geist Mono** (code/metadata) — already loaded via `next/font/google` in `layout.tsx`. No additional fonts.

| Role | Tailwind classes | Notes |
|---|---|---|
| Page heading (h1) | `text-3xl font-bold tracking-tight text-text` | Tight tracking for clinical precision |
| Section heading (h2) | `text-xl font-semibold text-text` | |
| Card title (h3) | `text-base font-semibold text-text` | |
| Body text | `text-sm text-text` | Default for paragraphs and field values |
| Supporting label | `text-xs text-text-muted uppercase tracking-wide` | "Created by", "Last updated", etc. |
| Code / metadata | `font-mono text-sm text-text` | |

---

## Shape and spacing

**Border radius:** `rounded` (4px) on all interactive elements — inputs, buttons, cards, badges. No larger radius values unless building a full modal overlay.

**Content width:** `max-w-4xl mx-auto px-6` — matches the existing header constraint.

**Vertical rhythm:** multiples of 4.
- `gap-4` between list items
- `gap-6` between page sections
- `py-8` for page-level vertical padding

---

## Component patterns

### Buttons

```
Primary:   bg-primary text-white px-4 py-2 rounded font-medium hover:bg-primary-hover transition-colors
Secondary: border border-border text-text bg-surface-raised px-4 py-2 rounded hover:bg-surface transition-colors
Danger:    bg-danger text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition-colors
```

### Form inputs

```
Input / textarea: border border-border rounded px-3 py-2 text-sm w-full
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  placeholder:text-text-muted
```

### Cards

```
bg-surface-raised border border-border rounded p-4
```

### Badges

```
Success: bg-green-50 text-success text-xs font-medium px-2 py-0.5 rounded
Danger:  bg-red-50 text-danger text-xs font-medium px-2 py-0.5 rounded
Neutral: bg-slate-100 text-text-muted text-xs font-medium px-2 py-0.5 rounded
```

### Muted metadata labels

```
text-xs text-text-muted uppercase tracking-wide
```

---

## globals.css @theme block

Add this inside `src/app/globals.css` to register the tokens:

```css
@theme {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-subtle: #eff6ff;
  --color-surface: #f8fafc;
  --color-surface-raised: #ffffff;
  --color-border: #e2e8f0;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-danger: #dc2626;
  --color-success: #16a34a;
}
```
