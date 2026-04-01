# BookShelf — Project Context

## What is this?

A Node.js backend for the **Daily Book Insights Wallpaper App**. Users purchase books, and each day they receive a wallpaper with a quote + insight from their active book.

## Tech Stack

- **Runtime:** Node.js (v22)
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Image Generation:** canvas + sharp
- **Storage:** Amazon S3
- **Auth:** JWT (access + refresh tokens)
- **Language:** JavaScript (ES Modules)

## Common Commands

```bash
npm run dev              # Start dev server with nodemon
npm start                # Start production server
npx prisma migrate dev   # Run database migrations
npx prisma studio        # Open Prisma GUI for database
npx prisma generate      # Regenerate Prisma client after schema change
```

## Project Structure

- `prisma/` — Schema and migrations
- `src/config/` — DB, S3, env configuration
- `src/middleware/` — Auth, error handler, validation
- `src/routes/` — Express route definitions
- `src/controllers/` — Request handlers
- `src/services/` — Business logic
- `src/utils/` — Helper functions
- `src/jobs/` — Cron jobs (purchase expiry)

## Key Business Rules

- Minimum **31 quotes per book** (monthly subscription model)
- **One active book per user** at a time (enforced at DB level)
- **Language fallback:** if user's preferred language not in JSONB, use `en`
- **Wallpaper caching:** always check S3 before generating
- **Day index cycling:** if day > total_quotes, use `((day - 1) % total) + 1`

## Conventions

- API base path: `/api/v1`
- Files: camelCase (`auth.controller.js`)
- DB tables/columns: snake_case
- API URLs: kebab-case (`/active-book`)
- JS variables: camelCase
- Constants/env vars: UPPER_SNAKE_CASE
- Git branches: `feature/`, `fix/`, `chore/`
- Commits: `feat:`, `fix:`, `chore:`, `docs:`

## Rules

- **Swagger:** Whenever a route/controller is added or modified, always update the Swagger JSDoc comments in the corresponding route file (`src/routes/*.js`). Never skip this step.
- **Seed data:** Uses fixed UUIDs (`00000000-0000-0000-0000-...`). Only deletes seed data on re-run, not other developers' data.
- **Migrations:** Run `npm run migrate:neon` locally before pushing. Render build does NOT run migrations.
- **Hosted DB:** Neon (free tier). Seed hosted DB with `npm run seed:neon`.

## API Response Format

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "...", "errorCode": "..." }
```
