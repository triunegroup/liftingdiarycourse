# Database Standards

## Stack

- **Drizzle ORM** (`drizzle-orm`) with the Neon HTTP adapter (`drizzle-orm/neon-http`)
- **Neon serverless PostgreSQL** (`@neondatabase/serverless`)
- **Drizzle Kit** (`drizzle-kit`) for migrations and schema management

## File Structure

| File | Purpose |
|---|---|
| `src/db/schema.ts` | All table definitions, relations, and inferred types |
| `src/db/index.ts` | Database client — exports a single `db` instance |
| `drizzle.config.ts` | Drizzle Kit config (schema path, migration output, credentials) |

## Schema Overview

Three tables with a parent-child hierarchy:

```
workouts (1) → (many) exercises (1) → (many) sets
```

- **workouts** — a training session; scoped to `userId` (from Clerk)
- **exercises** — an exercise within a workout (e.g., "Bench Press")
- **sets** — a single set within an exercise (weight, reps, type)

All foreign keys use `onDelete: "cascade"` — deleting a workout removes its exercises and sets.

## Types

Every table exports a **select** type and an **insert** type from `src/db/schema.ts`:

```ts
import type { Workout, NewWorkout } from "@/db/schema";
```

- Use `Workout`, `Exercise`, `Set` for data read from the database
- Use `NewWorkout`, `NewExercise`, `NewSet` for inserts

## Commands

```bash
npm run db:generate   # Generate migration files from schema changes
npm run db:migrate    # Run pending migrations
npm run db:push       # Push schema directly (dev only, skips migrations)
npm run db:studio     # Open Drizzle Studio GUI
```

## Querying Rules

- **DO** use the Drizzle query API or Drizzle SQL builder for all database access
- **DO** import `db` from `@/db` — never create a second client
- **DO NOT** write raw SQL strings or use any other query library

```ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

// Select
const userWorkouts = await db.query.workouts.findMany({
  where: eq(workouts.userId, userId),
  with: { exercises: { with: { sets: true } } },
});

// Insert
await db.insert(workouts).values({ userId, name: "Push Day" });
```

## Schema Conventions

When adding or modifying tables, follow these patterns:

- **Table names**: lowercase plural (`workouts`, `exercises`, `sets`)
- **Column names**: camelCase in TypeScript, snake_case in the database (Drizzle maps automatically)
- **Primary key**: `serial("id").primaryKey()` on every table
- **Timestamps**: every table gets `createdAt` (`defaultNow`, not null). Add `updatedAt` on tables that support edits.
- **Foreign keys**: always set `onDelete: "cascade"` for child tables
- **Indexes**: add an index on every foreign key column and any column used in `where` clauses
- **Relations**: define Drizzle `relations()` for every foreign key so `db.query` can use `with`
- **Types**: export `$inferSelect` and `$inferInsert` types for every new table

## Environment

Requires `DATABASE_URL` in `.env` pointing to a Neon connection string.
