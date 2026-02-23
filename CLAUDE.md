# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Docs-First Rule

**Before writing ANY code, ALWAYS read and follow the relevant documentation in the [`docs/`](docs/) directory.** The docs files define the standards, patterns, and constraints for this project. Every code change must conform to the guidance in those files. If a docs file covers the area you're working in, treat it as the authoritative source of truth.

Current docs:
- [`docs/ui.md`](docs/ui.md) — UI components, styling, and layout standards
- [`docs/db.md`](docs/db.md) — Database schema, queries, and conventions
- [`docs/auth.md`](docs/auth.md) — Authentication with Clerk
- [`docs/routing.md`](docs/routing.md) — App Router routes, file conventions, and Server Actions

## Project Overview

A lifting diary web application built with Next.js 16.1.6, React 19, and TypeScript. Currently in early development (bootstrapped from create-next-app).

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm start         # Start production server
npm run lint      # Run ESLint
```

No test framework is configured yet.

## Architecture

- **Next.js App Router** with file-based routing in `src/app/`
- **Tailwind CSS v4** via PostCSS for styling
- **Path alias**: `@/*` maps to `./src/*`
- Server Components by default; use `"use client"` directive for client components
- Dark mode support via CSS custom properties in `globals.css`
- Geist font family loaded via `next/font`

## UI Standards

All UI coding standards are defined in [`docs/ui.md`](docs/ui.md). Key rules:

- **Only shadcn/ui components** — no custom components
- **date-fns** for all date formatting (`MMM d, yyyy` → `Feb 22, 2026`)

## Key Config

- TypeScript strict mode enabled
- ESLint with Next.js core web vitals + TypeScript (flat config in `eslint.config.mjs`)
- `next.config.ts` is minimal (default)
