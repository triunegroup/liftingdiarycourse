# Authentication Standards

## Stack

- **Clerk** (`@clerk/nextjs`) for all authentication and user management
- Sign-in and sign-up use **modal mode** (no dedicated auth pages)

## File Structure

| File | Purpose |
|---|---|
| `src/proxy.ts` | `clerkMiddleware()` — runs on all non-static routes |
| `src/app/layout.tsx` | `ClerkProvider` wraps the entire app; header renders auth buttons |

## Environment

Requires these variables in `.env`:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Client Components

Use Clerk's pre-built components for all auth UI. Do not build custom auth forms.

```tsx
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

// Show content only to signed-out users
<SignedOut>
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</SignedOut>

// Show content only to signed-in users
<SignedIn>
  <UserButton />
</SignedIn>
```

- **DO** use `mode="modal"` on `SignInButton` and `SignUpButton`
- **DO** use `<SignedIn>` / `<SignedOut>` to conditionally render UI
- **DO NOT** create custom sign-in/sign-up pages or forms

## Server-Side Auth

Use `auth()` from `@clerk/nextjs/server` to get the current user in Server Components and Server Actions.

```ts
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const { userId } = await auth();
if (!userId) redirect("/");
```

- **DO** call `auth()` at the top of every protected Server Component or Server Action
- **DO** redirect unauthenticated users to `"/"` (home page)
- **DO** pass `userId` when querying user-scoped data (e.g., `workouts.userId`)
- **DO NOT** trust client-supplied user IDs — always read from `auth()`

## Proxy (Middleware)

`src/proxy.ts` exports `clerkMiddleware()` which handles session management on all matched routes. The matcher skips static assets and Next.js internals.

- **DO NOT** rename `proxy.ts` to `middleware.ts` — Next.js 16 uses `proxy.ts`
- **DO NOT** add custom route protection logic in the proxy — protect routes in Server Components via `auth()` instead
