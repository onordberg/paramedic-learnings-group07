# Source Summary Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user submits a source (debrief, research finding, guideline, or incident report), Claude generates a 3–4 bullet summary that's stored alongside the source and shown on the detail page, clearly labeled as AI-generated. (Story 12.)

**Architecture:** Per [ADR-002](../../adr/002-ai-source-summary.md). Two nullable columns added to `sources` (`summary`, `summary_model`). New `src/lib/summarize-source.ts` wraps the Anthropic SDK and owns the prompt template. The `createSource` server action calls it synchronously after insert, inside a try/catch — submission still succeeds if Claude is unavailable; the row keeps a null summary. The source detail page renders an "AI Summary" groupbox above the existing content, with a provenance footer showing the model id.

**Tech Stack:** Next.js 16 (App Router) + TypeScript, Drizzle ORM + Postgres, `@anthropic-ai/sdk`, Vitest (unit tests with module mocking).

---

## File Map

**Create:**
- `src/lib/summarize-source.ts` — module that takes source fields and returns `{ summary, modelId }` from Claude
- `src/lib/__tests__/summarize-source.test.ts` — unit tests with `@anthropic-ai/sdk` mocked
- `drizzle/0006_<auto>.sql` — generated migration adding two columns to `sources`
- `drizzle/meta/0006_snapshot.json` — drizzle snapshot

**Modify:**
- `src/db/schema.ts` — add `summary`, `summaryModel` columns to `sources`
- `src/app/source-actions.ts` — call `summarizeSource` after insert; update row on success; log + continue on failure
- `src/app/sources/[id]/page.tsx` — select new columns; render "AI Summary" groupbox with bullets + provenance, or null-state placeholder
- `package.json` / `package-lock.json` — add `@anthropic-ai/sdk`
- `CLAUDE.md` — document `ANTHROPIC_API_KEY` env var

---

## Task 1: Install Anthropic SDK and document env var

**Files:**
- Modify: `package.json`, `package-lock.json` (auto-updated by npm)
- Modify: `CLAUDE.md`

- [ ] **Step 1: Install the SDK**

Run from the repo root:

```bash
npm install @anthropic-ai/sdk
```

Expected: `package.json` gains `"@anthropic-ai/sdk": "^<version>"` under `dependencies`. `package-lock.json` is updated.

- [ ] **Step 2: Verify the dependency is recorded**

```bash
grep "@anthropic-ai/sdk" package.json
```

Expected: one line printed showing the dependency entry under `"dependencies"`.

- [ ] **Step 3: Document the env var in CLAUDE.md**

Edit `CLAUDE.md`. Find the existing line (around line 51):

```
**AI integration** — Stories 12–15 require calling an LLM (summary generation, conflict flagging, proposal drafting). Use the Anthropic SDK (`anthropic` package) with `claude-sonnet-4-6` or `claude-haiku-4-5-20251001` as appropriate; add it as a dependency when needed.
```

Replace with:

```
**AI integration** — Stories 12–15 require calling an LLM (summary generation, conflict flagging, proposal drafting). Use the Anthropic SDK (`@anthropic-ai/sdk` package) with `claude-sonnet-4-6` or `claude-haiku-4-5-20251001` as appropriate. Set `ANTHROPIC_API_KEY` in `.env.local`; the SDK reads it automatically.
```

The two changes from the original line: package name `anthropic` → `@anthropic-ai/sdk` (correct npm name), and a new sentence telling the reader where to put the API key.

- [ ] **Step 4: Confirm `.env.local` setup locally**

This is a manual sanity check — do NOT commit anything.

```bash
grep -c "^ANTHROPIC_API_KEY=" .env.local 2>/dev/null || echo "missing"
```

Expected: `1` (key present). If `missing` or `0`, add `ANTHROPIC_API_KEY=sk-ant-...` to `.env.local` before continuing past Task 4 (Tasks 1–3 don't hit the real API).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json CLAUDE.md
git commit -m "chore: add @anthropic-ai/sdk dependency and document API key"
```

---

## Task 2: Add summary columns to schema and generate migration

**Files:**
- Modify: `src/db/schema.ts:45-56` (the `sources` table definition)
- Create: `drizzle/0006_<auto>.sql` (generated)
- Create: `drizzle/meta/0006_snapshot.json` (generated)

- [ ] **Step 1: Add the columns to the Drizzle schema**

Edit `src/db/schema.ts`. The existing `sources` table block ends like this:

```ts
export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  sourceType: sourceTypeEnum("source_type").notNull(),
  date: timestamp("date", { withTimezone: true }),
  content: text("content").notNull(),
  metadata: text("metadata"),
  submittedById: uuid("submitted_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

Add two nullable columns before the closing brace:

```ts
export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  sourceType: sourceTypeEnum("source_type").notNull(),
  date: timestamp("date", { withTimezone: true }),
  content: text("content").notNull(),
  metadata: text("metadata"),
  submittedById: uuid("submitted_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  summary: text("summary"),
  summaryModel: text("summary_model"),
});
```

No change to the `Source` exported type — Drizzle picks up the new columns automatically.

- [ ] **Step 2: Generate the migration**

Make sure Postgres is running (`docker compose up -d`). Then:

```bash
npx drizzle-kit generate
```

Expected: a new file `drizzle/0006_<adjective_name>.sql` is created containing two ALTER TABLE statements, plus a snapshot `drizzle/meta/0006_snapshot.json`. The SQL should look like:

```sql
ALTER TABLE "sources" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "summary_model" text;
```

If the generated SQL contains anything else (e.g., constraints on other tables), inspect — it likely means an unrelated drift. Do not proceed until the migration only adds these two columns.

- [ ] **Step 3: Apply the migration to the dev database**

```bash
npx drizzle-kit migrate
```

Expected: success message; new columns visible in the `sources` table.

- [ ] **Step 4: Verify the columns exist**

```bash
docker compose exec -T postgres psql -U postgres -d paramedic_learnings -c "\d sources" | grep -E "^\s*(summary|summary_model)\s"
```

Expected: two lines printed, one for `summary` and one for `summary_model`, both `text` and nullable.

- [ ] **Step 5: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat: add summary columns to sources schema (migration 0006)"
```

---

## Task 3: Implement `summarizeSource` (TDD)

**Files:**
- Create: `src/lib/__tests__/summarize-source.test.ts`
- Create: `src/lib/summarize-source.ts`

This task uses TDD. We mock `@anthropic-ai/sdk` so the test never touches the real network and doesn't need an API key.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/summarize-source.test.ts`:

```ts
import { vi, describe, it, expect, beforeEach } from "vitest";

const messagesCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: messagesCreate },
  })),
}));

// Import AFTER vi.mock so the mocked SDK is used.
import { summarizeSource } from "../summarize-source";

beforeEach(() => {
  messagesCreate.mockReset();
});

const baseInput = {
  title: "ROSC after 20-min CPR",
  sourceType: "debrief" as const,
  content: "Crew arrived at 02:14. Patient in VF...",
  metadata: null,
};

describe("summarizeSource", () => {
  it("returns the summary text and model id from the API response", async () => {
    messagesCreate.mockResolvedValue({
      model: "claude-sonnet-4-5-20250929",
      content: [{ type: "text", text: "- bullet 1\n- bullet 2\n- bullet 3" }],
    });

    const result = await summarizeSource(baseInput);

    expect(result.summary).toBe("- bullet 1\n- bullet 2\n- bullet 3");
    expect(result.modelId).toBe("claude-sonnet-4-5-20250929");
  });

  it("calls the API with claude-sonnet-4-6 and a max_tokens cap", async () => {
    messagesCreate.mockResolvedValue({
      model: "claude-sonnet-4-5-20250929",
      content: [{ type: "text", text: "- a\n- b\n- c" }],
    });

    await summarizeSource(baseInput);

    const args = messagesCreate.mock.calls[0][0];
    expect(args.model).toBe("claude-sonnet-4-6");
    expect(args.max_tokens).toBe(400);
  });

  it("includes source type, title, and content in the user message", async () => {
    messagesCreate.mockResolvedValue({
      model: "m",
      content: [{ type: "text", text: "- a\n- b\n- c" }],
    });

    await summarizeSource({
      title: "Lidocaine in cardiac arrest",
      sourceType: "research",
      content: "RCT 2024 showed...",
      metadata: null,
    });

    const args = messagesCreate.mock.calls[0][0];
    const userMsg = args.messages[0].content;
    expect(userMsg).toContain("Source type: research");
    expect(userMsg).toContain("Title: Lidocaine in cardiac arrest");
    expect(userMsg).toContain("RCT 2024 showed...");
  });

  it("includes metadata in the user message when provided", async () => {
    messagesCreate.mockResolvedValue({
      model: "m",
      content: [{ type: "text", text: "- a\n- b\n- c" }],
    });

    await summarizeSource({ ...baseInput, metadata: "DOI: 10.1234/xyz" });

    const userMsg = messagesCreate.mock.calls[0][0].messages[0].content;
    expect(userMsg).toContain("Metadata: DOI: 10.1234/xyz");
  });

  it("omits the metadata line when metadata is null", async () => {
    messagesCreate.mockResolvedValue({
      model: "m",
      content: [{ type: "text", text: "- a\n- b\n- c" }],
    });

    await summarizeSource(baseInput);

    const userMsg = messagesCreate.mock.calls[0][0].messages[0].content;
    expect(userMsg).not.toContain("Metadata:");
  });

  it("throws when the response has no text content block", async () => {
    messagesCreate.mockResolvedValue({
      model: "m",
      content: [],
    });

    await expect(summarizeSource(baseInput)).rejects.toThrow(/text/i);
  });

  it("throws when the first content block is not type 'text'", async () => {
    messagesCreate.mockResolvedValue({
      model: "m",
      content: [{ type: "tool_use", id: "x", name: "y", input: {} }],
    });

    await expect(summarizeSource(baseInput)).rejects.toThrow(/text/i);
  });

  it("propagates API errors to the caller", async () => {
    messagesCreate.mockRejectedValue(new Error("API down"));

    await expect(summarizeSource(baseInput)).rejects.toThrow("API down");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- src/lib/__tests__/summarize-source.test.ts
```

Expected: FAIL with an error like "Failed to resolve import '../summarize-source'" — the module doesn't exist yet.

- [ ] **Step 3: Implement `summarizeSource`**

Create `src/lib/summarize-source.ts`:

```ts
import Anthropic from "@anthropic-ai/sdk";
import type { Source } from "@/db/schema";

export type SummarizeSourceInput = Pick<
  Source,
  "title" | "sourceType" | "content" | "metadata"
>;

export interface SummarizeSourceResult {
  summary: string;
  modelId: string;
}

const SYSTEM_PROMPT = `You are an assistant helping topic owners triage incoming sources for ambulance operational guidance.

Produce 3-4 short bullet points capturing the key information a topic owner needs to assess this source. Adjust focus by source type:
- debrief: what happened in the field and what was learned
- research: findings and applicability to practice
- guideline: the recommendations made and to whom they apply
- incident_report: the events and outcomes

Reply with ONLY the bullets, one per line, each starting with "- ". No preamble, no closing remarks.`;

const client = new Anthropic();

export async function summarizeSource(
  input: SummarizeSourceInput
): Promise<SummarizeSourceResult> {
  const userMessage = [
    `Source type: ${input.sourceType}`,
    `Title: ${input.title}`,
    input.metadata ? `Metadata: ${input.metadata}` : null,
    "",
    "Content:",
    input.content,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content[0];
  if (!block || block.type !== "text") {
    throw new Error("Anthropic response had no text content block");
  }

  return { summary: block.text.trim(), modelId: response.model };
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- src/lib/__tests__/summarize-source.test.ts
```

Expected: all 8 tests PASS.

- [ ] **Step 5: Run full test suite to make sure nothing else broke**

```bash
npm test
```

Expected: all tests PASS (existing tests + the 8 new ones).

- [ ] **Step 6: Commit**

```bash
git add src/lib/summarize-source.ts src/lib/__tests__/summarize-source.test.ts
git commit -m "feat: add summarizeSource module with prompt and Anthropic call"
```

---

## Task 4: Wire `summarizeSource` into `createSource`

**Files:**
- Modify: `src/app/source-actions.ts`

This task is verified manually via the running app, not via unit tests — the existing codebase doesn't have a DB-mocking pattern for server actions, and adding one for a single integration point is more infrastructure than it's worth (per the project rule against unnecessary abstractions).

- [ ] **Step 1: Modify the action to call the summarizer**

Open `src/app/source-actions.ts`. The full current file:

```ts
"use server";

import { db } from "@/db";
import { sources } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { CreateSourceSchema } from "@/app/_lib/create-source-schema";
import { auth } from "@/auth";

export type CreateSourceState = {
  error?: string;
  success?: boolean;
  id?: string;
};

export async function createSource(
  _prevState: CreateSourceState,
  formData: FormData
): Promise<CreateSourceState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const rawDate = formData.get("date") as string | null;
  const sourceType = formData.get("sourceType") as string | null;
  let parsedDate: Date | undefined;
  if (sourceType === "debrief") {
    if (!rawDate) return { error: "Date is required for debrief reports" };
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return { error: "Invalid date" };
    parsedDate = d;
  }

  const result = CreateSourceSchema.safeParse({
    title: formData.get("title"),
    sourceType,
    date: parsedDate,
    content: formData.get("content"),
    metadata: formData.get("metadata") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const [inserted] = await db
      .insert(sources)
      .values({ ...result.data, submittedById: session.user.id })
      .returning({ id: sources.id });

    if (!inserted) return { error: "Failed to create source" };

    revalidatePath("/sources");
    return { success: true, id: inserted.id };
  } catch {
    return { error: "Database error — please try again." };
  }
}
```

Add the `eq` import from `drizzle-orm`, the `summarizeSource` import, and a new try/catch block between the successful insert and the `revalidatePath` call. Replace the file's contents with:

```ts
"use server";

import { db } from "@/db";
import { sources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CreateSourceSchema } from "@/app/_lib/create-source-schema";
import { auth } from "@/auth";
import { summarizeSource } from "@/lib/summarize-source";

export type CreateSourceState = {
  error?: string;
  success?: boolean;
  id?: string;
};

export async function createSource(
  _prevState: CreateSourceState,
  formData: FormData
): Promise<CreateSourceState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const rawDate = formData.get("date") as string | null;
  const sourceType = formData.get("sourceType") as string | null;
  let parsedDate: Date | undefined;
  if (sourceType === "debrief") {
    if (!rawDate) return { error: "Date is required for debrief reports" };
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return { error: "Invalid date" };
    parsedDate = d;
  }

  const result = CreateSourceSchema.safeParse({
    title: formData.get("title"),
    sourceType,
    date: parsedDate,
    content: formData.get("content"),
    metadata: formData.get("metadata") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  let insertedId: string;
  try {
    const [inserted] = await db
      .insert(sources)
      .values({ ...result.data, submittedById: session.user.id })
      .returning({ id: sources.id });

    if (!inserted) return { error: "Failed to create source" };
    insertedId = inserted.id;
  } catch {
    return { error: "Database error — please try again." };
  }

  try {
    const { summary, modelId } = await summarizeSource({
      title: result.data.title,
      sourceType: result.data.sourceType,
      content: result.data.content,
      metadata: result.data.metadata ?? null,
    });
    await db
      .update(sources)
      .set({ summary, summaryModel: modelId })
      .where(eq(sources.id, insertedId));
  } catch (err) {
    console.error("[summarize-source] failed", { sourceId: insertedId, err });
    // Submission still succeeds; summary stays null.
  }

  revalidatePath("/sources");
  return { success: true, id: insertedId };
}
```

Two structural changes from the original:

1. The original try/catch wraps the insert AND the success return. We split it: the insert keeps its own try/catch (which now sets `insertedId`), and the summary call gets its own try/catch that catches separately so an LLM failure does not get reported as "Database error."
2. `revalidatePath` and the success return now run *after* the summary attempt, so a successful summary is visible immediately after redirect (cache for `/sources` is busted by then).

- [ ] **Step 2: Run lint and full tests**

```bash
npm run lint && npm test
```

Expected: no lint errors, all tests still passing. (Tests don't cover this file directly, but a typing or import error here would fail the test run.)

- [ ] **Step 3: Manual verification — happy path**

Make sure `ANTHROPIC_API_KEY` is set in `.env.local` and Postgres is running. Then:

```bash
npm run dev
```

In the browser:
1. Log in (or register) at `http://localhost:3000`.
2. Navigate to `/sources/new`.
3. Submit a debrief report with a non-trivial `content` field (e.g., a few sentences describing a realistic-sounding incident).
4. After the form submits, you'll land on `/sources/<id>`. **Note:** the detail page UI for the summary doesn't exist yet (Task 5) — the summary is invisible at this point but should be in the DB.

Verify in the database:

```bash
docker compose exec -T postgres psql -U postgres -d paramedic_learnings -c \
  "select id, summary, summary_model from sources order by created_at desc limit 1;"
```

Expected: the most recent row has a non-null `summary` (a multi-line string starting with `- `) and a non-null `summary_model` (e.g., `claude-sonnet-4-5-20250929`).

- [ ] **Step 4: Manual verification — failure path**

Stop the dev server, temporarily change `ANTHROPIC_API_KEY` in `.env.local` to a clearly invalid value (e.g., `sk-ant-invalid`), and restart `npm run dev`. Submit another source. Expected:

- The form submission **succeeds** — you land on the detail page.
- The terminal running `npm run dev` shows a `[summarize-source] failed` log line with the source id and the API error.
- The DB row for that source has `null` for `summary` and `summary_model`.

Restore your real API key in `.env.local` after this check.

- [ ] **Step 5: Commit**

```bash
git add src/app/source-actions.ts
git commit -m "feat: generate AI summary on source submission"
```

---

## Task 5: Render summary on the source detail page

**Files:**
- Modify: `src/app/sources/[id]/page.tsx`

- [ ] **Step 1: Add the new columns to the select**

Open `src/app/sources/[id]/page.tsx`. Find the existing `db.select({...})` block (lines 15–29):

```ts
const [row] = await db
  .select({
    id: sources.id,
    title: sources.title,
    sourceType: sources.sourceType,
    date: sources.date,
    content: sources.content,
    metadata: sources.metadata,
    createdAt: sources.createdAt,
    submittedByName: users.name,
  })
  .from(sources)
  .leftJoin(users, eq(sources.submittedById, users.id))
  .where(eq(sources.id, id))
  .limit(1);
```

Add `summary` and `summaryModel`:

```ts
const [row] = await db
  .select({
    id: sources.id,
    title: sources.title,
    sourceType: sources.sourceType,
    date: sources.date,
    content: sources.content,
    metadata: sources.metadata,
    createdAt: sources.createdAt,
    submittedByName: users.name,
    summary: sources.summary,
    summaryModel: sources.summaryModel,
  })
  .from(sources)
  .leftJoin(users, eq(sources.submittedById, users.id))
  .where(eq(sources.id, id))
  .limit(1);
```

- [ ] **Step 2: Render the AI Summary groupbox above the existing Content groupbox**

In the same file, find the existing `{/* Content */}` block (around line 88):

```tsx
{/* Content */}
<div className="win-groupbox" style={{ marginTop: 0, marginBottom: "8px" }}>
  <span className="win-groupbox-title">
    {row.sourceType === "research" ? "Summary" : "Content"}
  </span>
  <div className="win-sunken" style={{ background: "#ffffff", padding: "6px 8px" }}>
    <p style={{ fontSize: "11px", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
      {row.content}
    </p>
  </div>
</div>
```

Note: the current page uses the title "Summary" for research sources and "Content" otherwise. With the AI summary added, that's confusing. Change the title back to "Content" unconditionally so the human-written body is always called "Content," and use "AI Summary" for the new groupbox. Replace the block above with:

```tsx
{/* AI Summary */}
<div className="win-groupbox" style={{ marginTop: 0, marginBottom: "8px" }}>
  <span className="win-groupbox-title">AI Summary</span>
  <div className="win-sunken" style={{ background: "#ffffff", padding: "6px 8px" }}>
    {row.summary ? (
      <>
        <p style={{ fontSize: "11px", whiteSpace: "pre-wrap", lineHeight: "1.6", margin: 0 }}>
          {row.summary}
        </p>
        <p style={{ fontSize: "10px", color: "#808080", marginTop: "6px", fontStyle: "italic" }}>
          Generated by {row.summaryModel}
        </p>
      </>
    ) : (
      <p style={{ fontSize: "11px", color: "#808080", fontStyle: "italic", margin: 0 }}>
        Summary not available.
      </p>
    )}
  </div>
</div>

{/* Content */}
<div className="win-groupbox" style={{ marginBottom: "8px" }}>
  <span className="win-groupbox-title">Content</span>
  <div className="win-sunken" style={{ background: "#ffffff", padding: "6px 8px" }}>
    <p style={{ fontSize: "11px", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
      {row.content}
    </p>
  </div>
</div>
```

- [ ] **Step 3: Run lint and tests**

```bash
npm run lint && npm test
```

Expected: no lint errors, all tests passing.

- [ ] **Step 4: Manual verification — happy path**

Restart `npm run dev` if it's not running. Open the detail page for the source you submitted in Task 4 Step 3. Expected:

- An "AI Summary" groupbox appears above the "Content" groupbox.
- The summary is rendered as 3–4 lines, each starting with `- `, in the white sunken inner panel.
- A small italic gray line below reads `Generated by claude-sonnet-4-5-20250929` (or whatever exact model id was returned).
- The "Content" groupbox below shows the original full text the user submitted.

- [ ] **Step 5: Manual verification — null state**

Open the detail page for the source you submitted in Task 4 Step 4 (the one with the invalid API key). Expected:

- The "AI Summary" groupbox still appears.
- Inside it, an italic gray line reads `Summary not available.` — no provenance footer.
- The "Content" groupbox below renders normally.

- [ ] **Step 6: Manual verification — pre-existing sources**

Open the detail page for any source created *before* this feature (e.g., one already in the DB from earlier story work, where `summary IS NULL`). Expected: same null-state as Step 5 — "Summary not available." This confirms the feature is backward-compatible without backfill.

- [ ] **Step 7: Commit**

```bash
git add src/app/sources/[id]/page.tsx
git commit -m "feat: render AI summary on source detail page"
```

---

## Self-Review Notes

- **Spec coverage (vs. ADR-002 requirements):**
  - "Generate a 3–4 bullet summary using Claude" → Task 3 (system prompt explicitly instructs 3–4 bullets).
  - "Store summary alongside source" → Task 2 (schema), Task 4 (write).
  - "Show that the summary is system-generated incl. model" → Task 5 (groupbox title "AI Summary" + provenance footer with `summaryModel`).
  - "Display the summary on the source detail page" → Task 5.
  - "Trigger automatically on submission" → Task 4.
  - "Submission must succeed if LLM fails" → Task 4 try/catch + manual verification Step 4.
  - "Cover all four source types via one mechanism" → Task 3 (single prompt with type-aware instructions; tests cover `debrief` and `research`).
  - "No manual regenerate, no separate table, keep it simple" → reflected in scope.

- **Type consistency:** `summarizeSource` returns `{ summary, modelId }`; both consumers (the action in Task 4, the schema columns `summary`/`summary_model` in Task 2) match. Drizzle camelCases `summary_model` to `summaryModel` in TypeScript.

- **Why no Vitest test for `createSource` in Task 4:** the existing codebase tests pure logic (Zod schemas, components) and does not unit-test server actions that hit `db` or `auth`. Mocking those for one new code path would be more new infrastructure than the change is worth, and runs counter to the project's "no abstractions beyond what the task requires" rule. Manual verification of both happy and failure paths is the trade.
