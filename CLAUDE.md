# Paramedic Learnings

## Project Overview

A learning-sharing platform for ambulance personnel (ambulansepersonell). Paramedics can document field experiences and learnings so the whole team benefits from shared knowledge.

This project is used as a hands-on use case during a two-day agentic development course covering skills, MCPs, AI workflows, and Claude MD.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React + Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod

## Project Structure

```
src/
  app/           -> Next.js App Router pages and server actions
    actions.ts   -> Server actions for CRUD operations
    page.tsx     -> Main landing page
    layout.tsx   -> Root layout with header/footer
  components/    -> Reusable React components
    LearningCard.tsx  -> Displays a single learning
    LearningForm.tsx  -> Form for submitting new learnings
  db/            -> Database layer
    schema.ts    -> Drizzle schema definitions
    index.ts     -> Database connection
  lib/           -> Shared utilities
    validations.ts -> Zod schemas for input validation
drizzle/         -> Generated migrations
```

## Key Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npx drizzle-kit generate  # Generate migrations
npx drizzle-kit migrate   # Run migrations
npx drizzle-kit studio    # Open Drizzle Studio (DB browser)
```

## Database

The app uses PostgreSQL with Drizzle ORM. Copy `.env.example` to `.env.local` and update `DATABASE_URL`.

### Schema

- **learnings**: Core table -- `id`, `title`, `description`, `author`, `createdAt`, `updatedAt`

## Code Conventions

- Use server actions (in `actions.ts`) for data mutations
- Validate all input with Zod schemas before database operations
- Components are in `src/components/` -- one component per file
- Use Tailwind CSS for styling, no CSS modules
- Prefer `async` server components where possible
