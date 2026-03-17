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

## API Response Format

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "...", "errorCode": "..." }
```
