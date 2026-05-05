# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Paramedic Learnings is a knowledge platform for ambulance personnel to capture and improve operational guidance ("topics") through AI-assisted analysis and human approval. This is a course project — the infrastructure is wired up and the domain is yours to build, following the user stories in `docs/user-stories.md`.

## Development Commands

```bash
# Start Postgres via Docker (port 15432)
docker compose up -d

# Install dependencies
npm install

# Start dev server
npm run dev

# Lint
npm run lint

# Run tests (Vitest + React Testing Library)
npm test

# Build for production
npm run build
```

### Database (Drizzle ORM)

After adding or modifying tables in `src/db/schema.ts`:

```bash
npx drizzle-kit generate   # generate migration files into ./drizzle/
npx drizzle-kit migrate    # apply migrations to the database
```

## Architecture

**Stack:** Next.js 16 (App Router) + TypeScript, React 19, Tailwind CSS v4, PostgreSQL + Drizzle ORM, Zod.

**App Router conventions** — pages go in `src/app/`, using Next.js file-based routing (`page.tsx`, `layout.tsx`, `route.ts` for API routes). Server Components are the default; add `"use client"` only where interactivity requires it.

**Next.js 16 async APIs** — `searchParams` and `params` in page components are `Promise`s; always `await` them. Client components calling `useSearchParams()` require a `<Suspense>` wrapper in the parent Server Component.

**`"use server"` files** — may only export async functions. Exporting a Zod schema or any non-async value from a `"use server"` file causes a runtime crash. Put shared schemas/constants in `src/app/_lib/` instead.

**Database layer** — `src/db/schema.ts` is the single source of truth for the data model. `src/db/index.ts` exports `db`, the Drizzle client, which reads `DATABASE_URL` from `.env.local`. The default Docker setup uses `postgresql://postgres:postgres@localhost:15432/paramedic_learnings`. When adding a `NOT NULL` column to a non-empty table, include `.default(...)` in both the schema and the migration SQL to avoid a constraint violation on existing rows.

**Domain model** (from the user stories): the core entities are **topics** (operational guidance, versioned), **sources** (debrief reports, research findings), **change proposals** (AI-generated drafts linking sources to a topic update), and **approvals** (human decisions on proposals). Stories 1–6 establish topics; Stories 9–18 build the "AI proposes, human approves" loop.

**AI integration** — Stories 12–15 require calling an LLM (summary generation, conflict flagging, proposal drafting). Use the Anthropic SDK (`anthropic` package) with `claude-sonnet-4-6` or `claude-haiku-4-5-20251001` as appropriate; add it as a dependency when needed.

## Key Paths

| Path | Purpose |
|---|---|
| `src/db/schema.ts` | Drizzle table definitions — start here for data modelling |
| `src/db/index.ts` | Drizzle client export (`db`) |
| `docs/user-stories.md` | Full feature backlog — source of truth for what to build |
| `docs/inspiration-skills/` | Example Claude Code skills for reference (not auto-loaded) |
| `drizzle/` | Generated migration files (created by `drizzle-kit generate`) |
