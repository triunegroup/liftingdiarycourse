# UI Coding Standards

## Component Library

This project uses **shadcn/ui** as the sole component library. All UI must be built using shadcn/ui components.

- **DO** use shadcn/ui components for all UI elements (buttons, cards, dialogs, inputs, etc.)
- **DO NOT** create custom components. If a shadcn/ui component does not exist for a use case, compose existing shadcn/ui components together.
- Add new shadcn/ui components via `npx shadcn@latest add <component>`

## Date Formatting

All date formatting must use **date-fns**.

- Format: `MMM d, yyyy` (e.g., `Feb 22, 2026`)
- Import `format` from `date-fns` for all date display

```ts
import { format } from "date-fns";

format(new Date(), "MMM d, yyyy"); // "Feb 22, 2026"
```
