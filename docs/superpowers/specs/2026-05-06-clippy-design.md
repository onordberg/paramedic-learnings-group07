# Clippy — Design Spec

**Date:** 2026-05-06  
**Status:** Approved  

---

## Overview

Add Clippy — the iconic Microsoft Office animated paperclip assistant — to the Paramedic Learnings app as an AI-powered, context-aware chat assistant backed by Claude. Clippy floats above the status bar in the bottom-right corner of the app window and is toggled via an icon in the existing status bar.

---

## Architecture & Data Flow

### State management

A `ClippyProvider` (React Context) is added to the root layout, wrapping the entire app. It holds:

- `isOpen: boolean` — whether the Clippy dialog is visible
- `messages: Message[]` — in-memory conversation history (lost on page refresh; intentional)
- `pageContext: string` — plain-English description of the current page and any relevant topic data

### Context injection

Each page that wants to give Clippy relevant context renders a zero-UI `SetClippyContext` client component at the top of its Server Component output. This component receives serialisable props (e.g., topic title, summary, guidance) from the server and calls `setPageContext(...)` on mount via the context. This keeps server components unchanged and avoids URL hacks.

### Message flow

1. User clicks the 📎 icon in the status bar → `isOpen` flips to `true`, Clippy appears with a `Greeting` animation and a context-aware opening balloon.
2. User types a message → appended to `messages` as a `user` entry, sent to `POST /api/clippy` along with the full message history and `pageContext`.
3. API route constructs a Claude prompt (system prompt + message history), calls `anthropic.messages.stream(...)`, and returns a `ReadableStream` of plain text chunks.
4. The client reads the stream with `response.body.getReader()` and appends each chunk to the in-progress `assistant` message in state — producing a live streaming effect.
5. While streaming, Clippy plays the `Thinking` animation; on completion he plays `Writing`.
6. On page navigation, `pageContext` updates automatically via `SetClippyContext`; message history persists for the session.

### API route

`POST /api/clippy`

- **Input:** `{ messages: { role: "user" | "assistant", content: string }[], pageContext: string }`
- **Model:** `claude-haiku-4-5-20251001`
- **Output:** streaming `ReadableStream` of plain text chunks
- **Rate limiting / auth:** none for now (internal tool, single-user context)

---

## Components

### `ClippyProvider` (`src/app/_components/ClippyProvider.tsx`)

Client component. React Context provider holding `isOpen`, `messages`, `pageContext` and their setters. Rendered once in `layout.tsx`, wrapping `{children}`.

### `ClippyButton` (`src/app/_components/ClippyButton.tsx`)

Client component. A small paperclip SVG icon rendered inside the existing `win-statusbar` in `layout.tsx`. Uses `win-status-panel` styling; border direction inverts (sunken) when `isOpen` is true to give the pressed appearance.

### `ClippyWidget` (`src/app/_components/ClippyWidget.tsx`)

Client component. The floating character + chat panel rendered inside `layout.tsx` (inside the provider). Composed of:

- **Character area:** `clippyjs` instance anchored bottom-right, above the status bar. Handles all original animations (`Greeting`, `Thinking`, `Writing`, `Wave`, `GetAttention`, etc.). Animation API: `agent.animate()` for random, `agent.play('AnimationName')` for specific, `agent.speak('text')` for balloon speech. The widget is positioned `absolute`; the parent app window container in `layout.tsx` (`win-raised flex flex-col flex-1`) must have `position: relative` added for the overlay to be correctly anchored.
- **Chat panel:** A Win 3.11-style window (`win-raised` + `win-titlebar`) that opens above the character. Contains:
  - Scrollable message history (`win-sunken-deep` inset area). User messages right-aligned in navy (`#000080`); Clippy replies left-aligned in yellow (`#ffffc0`).
  - Text input (`win-input`) + Send button (`win-btn`).
  - Close button (`✕`) in the title bar that sets `isOpen = false`.
- Invisible when `isOpen` is false (CSS `display: none`; the `clippyjs` instance is hidden too).

### `SetClippyContext` (`src/app/_components/SetClippyContext.tsx`)

Client component. Accepts a single `context: string` prop. On mount, calls `setPageContext(context)` from `ClippyProvider`. No rendered output.

Placed in:
- `src/app/topics/[id]/page.tsx` — passes `"User is reading the topic '{title}'. Summary: {summary}. Guidance: {guidance}"`.
- `src/app/topics/new/page.tsx` — passes `"User is creating a new topic."`.
- `src/app/topics/page.tsx` — passes `"User is browsing the topic list."`.

### `buildPageContext` (`src/app/_lib/clippy-context.ts`)

Pure function. Maps `(page: string, topic?: TopicData)` to a plain-English context string. This is the only logic worth unit testing in isolation.

---

## Claude Integration

### System prompt

```
You are Clippy, the helpful assistant from Microsoft Office, now embedded in
Paramedic Learnings — a knowledge platform for ambulance personnel.

You have Clippy's cheerful, slightly over-eager personality. Use his classic
openers occasionally ("It looks like you're...", "Did you know..."), but keep
all medical and operational advice accurate and practical. Never invent
clinical facts.

Current context: <CONTEXT_PLACEHOLDER>

Keep responses concise (2–4 sentences unless more detail is genuinely needed).
```

`<CONTEXT_PLACEHOLDER>` is substituted at runtime with the string returned by `buildPageContext()`. Example: `"User is reading the topic 'Airway Management'. Summary: Protocols for... Guidance: Begin with jaw thrust..."`

### Dependency

Add `anthropic` package if not already present (CLAUDE.md notes it is used for AI integration in Stories 12–15, so it may already be installed).

---

## Visual Design

Clippy uses the **authentic Microsoft Office character** via `clippyjs`, which ships the original Microsoft Agent sprite sheets from Office 97/2000. This gives all original animations rather than a CSS approximation.

The chat panel follows the existing Win 3.11 CSS classes from `globals.css`:
- `win-raised` border on the panel window
- `win-titlebar` with `#000080` background for the title bar
- `win-sunken-deep` for the message history area
- `win-btn` for the Send button
- `win-status-panel` + sunken border for the status bar toggle icon

---

## Error Handling

If the `/api/clippy` request fails:

- Append a Clippy message to the history: *"Hmm, something seems to have gone wrong. Want to try again?"*
- Clippy plays the `GetAttention` animation.
- No toast or modal — the error surfaces inline in the conversation.

---

## Testing

| What | How |
|---|---|
| `buildPageContext()` | Unit tests covering all page variants (topic detail, new topic, list, default) |
| `ClippyWidget` open/close | Component test: clicking `ClippyButton` toggles visibility |
| `ClippyWidget` message send | Component test: submitting a message appends it to the history, disables input during streaming |
| `/api/clippy` route | Not tested directly — thin wrapper; test at the component level with mocked fetch |

---

## Files to Create / Modify

| Action | Path |
|---|---|
| Create | `src/app/_components/ClippyProvider.tsx` |
| Create | `src/app/_components/ClippyButton.tsx` |
| Create | `src/app/_components/ClippyWidget.tsx` |
| Create | `src/app/_components/SetClippyContext.tsx` |
| Create | `src/app/_lib/clippy-context.ts` |
| Create | `src/app/api/clippy/route.ts` |
| Create | `src/app/_components/__tests__/ClippyWidget.test.tsx` |
| Modify | `src/app/layout.tsx` — add `ClippyProvider`, `ClippyButton`, `ClippyWidget` |
| Modify | `src/app/topics/[id]/page.tsx` — add `SetClippyContext` |
| Modify | `src/app/topics/page.tsx` — add `SetClippyContext` |
| Modify | `src/app/topics/new/page.tsx` — add `SetClippyContext` |
| Install | `clippyjs` (npm) |
