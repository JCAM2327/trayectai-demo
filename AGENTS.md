# TrayectAI — AGENTS.md

## Next.js 16

Breaking changes in conventions, APIs, and file structure. Read `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

## Auth

Custom JWT auth (not NextAuth.js). Implementation:
- `lib/auth.ts` — `hashPassword`, `comparePassword` (bcryptjs), `createToken`, `verifyToken` (jose), `COOKIE_NAME`
- `lib/auth-context.tsx` — client-side `AuthProvider` + `useAuth()` hook
- Cookie name: `trayectai_session`, httpOnly, 7-day expiry
- Token payload: `{ id, email, fullName, careerId }`

API routes: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`.

## Middleware

`proxy.ts` is **inert** — Next.js only loads `middleware.ts` at root. Route protection is not active. To enable it, rename `proxy.ts` → `middleware.ts` and rename export `proxy` → `middleware`.

## All pages are `'use client'`

No server components. Data fetching via `@tanstack/react-query` (all pages). No server actions.

## Database

- **Prisma 6** + PostgreSQL (Supabase)
- `prisma/schema.prisma` — 10 models, 6 enums
- Migration: `npx prisma migrate dev --name <name>`
- Seed: `npm run prisma:seed` or `npx prisma db seed` (uses `ts-node` with `{module:"CommonJS"}`)
- Main seed: `prisma/seed.ts` (UNMDP university, 8 faculties, 38 careers, demo user)
- Standalone scripts (not in main seed): `prisma/seed-fceys-nuevas.ts`, `prisma/seed-ing-quimica.ts`, `prisma/seed-user.ts`
- Active `DATABASE_URL` in `.env` is the Supabase one (line 14, not the Prisma Postgres one on line 12)

## Core business logic

`lib/prerequisite-engine.ts` — resolves subject states (aprobada/regular/habilitada/bloqueada), simulates approval, recommends subjects, projects graduation date. Imported by API routes and pages.

## Theme system

Custom CSS variables (not Tailwind `dark:` variant). 3 themes + auto mode in `lib/themes.ts`. Setting stored in `localStorage` key `trayectai_theme`. Applied via `lib/useTheme.ts`.

## UI conventions

- All UI is inline-styled with CSS variables (`var(--bg)`, `var(--text)`, `var(--accent)`, etc.)
- No shadcn components are used in pages (badge.tsx and card.tsx exist but are dead code)
- Emoji icons instead of SVG/Lucide icons
- Spanish labels throughout

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build + TypeScript check |
| `npm run lint` | ESLint |
| `npx prisma db seed` | Run seed |
| `npx prisma migrate dev --name <name>` | Create + apply migration |
| `npx prisma studio` | Open Prisma Studio |

## Routes (Spanish)

`/` dashboard, `/plan` study plan, `/calendario` calendar, `/alertas` alerts, `/login`, `/onboarding` (4-step wizard), `/settings` theme picker.

## Tests

No test framework is configured. No tests exist.
