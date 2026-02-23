# Routing Standards

## Framework

This project uses the **Next.js App Router** with file-based routing in `src/app/`.

## Current Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/dashboard` | Protected | Main workout view (date picker + workout list) |

## File Conventions

Each route directory can contain these files:

| File | Purpose |
|---|---|
| `page.tsx` | Route UI (Server Component by default) |
| `layout.tsx` | Shared layout wrapping child routes |
| `actions.ts` | Server Actions for the route's data mutations and queries |
| `loading.tsx` | Suspense fallback shown while the page loads |
| `error.tsx` | Error boundary for the route |

- **DO** keep `page.tsx` as a Server Component — fetch data directly in it
- **DO** co-locate Server Actions in an `actions.ts` file next to the page that uses them
- **DO** co-locate client components (e.g., `date-picker.tsx`, `workout-card.tsx`) next to the page that uses them
- **DO NOT** create a shared `components/` folder for route-specific components — keep them in the route directory
- **DO NOT** create API routes (`route.ts`) unless an external client needs the endpoint — use Server Actions instead

## Protected Routes

Routes that require authentication follow this pattern at the top of `page.tsx`:

```ts
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const { userId } = await auth();
if (!userId) redirect("/");
```

- **DO** add this guard to every protected page's Server Component
- **DO NOT** rely on the proxy (middleware) alone for route protection — always check `auth()` in the page

See [`docs/auth.md`](auth.md) for full authentication standards.

## Search Params

Use search params (not path segments) for filter/state values that don't define a unique resource. The dashboard uses `?date=YYYY-MM-DD` for date selection.

```ts
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  // ...
}
```

- **DO** type `searchParams` as `Promise<{ ... }>` (Next.js 16 async params)
- **DO** provide sensible defaults when a param is missing

## Server Actions

All data fetching and mutations go in `actions.ts` files co-located with the route.

```ts
"use server";

import { db } from "@/db";
```

- **DO** mark action files with `"use server"` at the top
- **DO** accept `userId` as a parameter — the caller reads it from `auth()`
- **DO NOT** call `auth()` inside a shared action — let the page handle authentication so actions stay reusable

See [`docs/db.md`](db.md) for query patterns.
