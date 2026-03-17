# BookShelf — Daily Book Insights Wallpaper App

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Flow](#system-flow)
- [Database Design](#database-design)
- [API Design](#api-design)
- [Authentication](#authentication)
- [Mobile Purchase Verification](#mobile-purchase-verification)
- [Content & Wallpaper Generation](#content--wallpaper-generation)
- [Image Storage (S3)](#image-storage-s3)
- [Admin APIs](#admin-apis)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Implementation Phases](#implementation-phases)
- [Rules & Conventions](#rules--conventions)
- [Future Improvements](#future-improvements)

---

## Overview

This system delivers **daily insights from books as lock screen wallpapers**.

Each day the user receives a wallpaper image containing:

- A **quote** from the book
- A **short description / insight**

The mobile app downloads the image and automatically sets it as the **lock screen wallpaper**.

---

## Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Runtime        | Node.js (v20+)                    |
| Framework      | Express.js                        |
| Language       | JavaScript (ES Modules)           |
| Database       | PostgreSQL (v15+)                 |
| ORM            | Prisma                            |
| Auth           | JWT (access + refresh tokens)     |
| Image Gen      | `canvas` + `sharp`                |
| Storage        | Amazon S3                         |
| OTP Service    | Twilio / AWS SNS (TBD)           |
| Scheduler      | node-cron                         |
| Validation     | Joi / Zod                         |
| Environment    | dotenv                            |

---

## System Flow

```
User purchases book (via mobile store)
    ↓
Backend verifies purchase with Google Play / Apple App Store
    ↓
Purchase record created in DB
    ↓
User selects active book
    ↓
Daily wallpaper request from mobile app
    ↓
Backend calculates day_index from purchase start_date
    ↓
Fetch quote + description for that day
    ↓
Check S3 — if wallpaper already exists, return URL
    ↓
If not — generate wallpaper dynamically
    ↓
Upload to S3
    ↓
Return wallpaper URL to mobile app
```

---

## Database Design

### ER Diagram (Text)

```
Users ──< Purchases ──< Active_Books
            │
            └──> Books ──> Categories
                   │
                   └──< Book_Contents

Templates (standalone)
```

---

### 1. Users

| Column             | Type                    | Notes                              |
| ------------------ | ----------------------- | ---------------------------------- |
| id                 | UUID (PK)               | Auto-generated                     |
| phone              | VARCHAR(20)             | Unique, used for OTP login         |
| email              | VARCHAR(255)            | Optional                           |
| preferred_language | VARCHAR(5) DEFAULT 'en' | Fallback to `en` if not available  |
| role               | ENUM('USER', 'ADMIN')   | Default: USER                      |
| created_at         | TIMESTAMP               | Auto-set                           |
| updated_at         | TIMESTAMP               | Auto-set                           |

---

### 2. Categories

| Column | Type         | Notes          |
| ------ | ------------ | -------------- |
| id     | UUID (PK)    | Auto-generated |
| name   | VARCHAR(100) | Unique         |

---

### 3. Books

| Column       | Type          | Notes                                       |
| ------------ | ------------- | ------------------------------------------- |
| id           | UUID (PK)     | Auto-generated                              |
| title        | VARCHAR(255)  |                                             |
| author       | VARCHAR(255)  |                                             |
| category_id  | UUID (FK)     | References Categories                       |
| cover_image  | VARCHAR(500)  | S3 URL                                      |
| price        | DECIMAL(10,2) |                                             |
| total_quotes | INT           | Denormalized count to avoid COUNT queries   |
| is_active    | BOOLEAN       | Whether book is visible to users            |
| created_at   | TIMESTAMP     |                                             |

**Rules:**

- Each book must contain **minimum 31 quotes** (users purchase monthly subscriptions).
- `total_quotes` must be updated when quotes are imported.

---

### 4. Book Contents

| Column         | Type      | Notes                                  |
| -------------- | --------- | -------------------------------------- |
| id             | UUID (PK) | Auto-generated                         |
| book_id        | UUID (FK) | References Books                       |
| chapter_number | INT       |                                        |
| chapter_title  | VARCHAR   |                                        |
| quote_index    | INT       | Global index across the book (1, 2..)  |
| quotes         | JSONB     | `{ "en": "...", "hi": "..." }`         |
| descriptions   | JSONB     | `{ "en": "...", "hi": "..." }`         |
| created_at     | TIMESTAMP |                                        |

**Required Index:**

```sql
CREATE UNIQUE INDEX idx_book_quote ON book_contents (book_id, quote_index);
```

> This is the **hottest query** in the system — every wallpaper request hits this index.

---

### 5. Purchases

| Column         | Type                                  | Notes                     |
| -------------- | ------------------------------------- | ------------------------- |
| id             | UUID (PK)                             |                           |
| user_id        | UUID (FK)                             | References Users          |
| book_id        | UUID (FK)                             | References Books          |
| duration_days  | INT                                   | e.g., 30, 90, 365        |
| purchase_token | VARCHAR                               | Token from mobile store   |
| platform       | ENUM('GOOGLE_PLAY', 'APP_STORE')      | Which store               |
| start_date     | DATE                                  |                           |
| end_date       | DATE                                  | Calculated: start + duration |
| status         | ENUM('ACTIVE', 'EXPIRED', 'REFUNDED') | Default: ACTIVE           |
| created_at     | TIMESTAMP                             |                           |

**Index:**

```sql
CREATE INDEX idx_purchases_user_status ON purchases (user_id, status);
```

---

### 6. Active Books

| Column      | Type        | Notes                                  |
| ----------- | ----------- | -------------------------------------- |
| user_id     | UUID (PK)   | References Users — **UNIQUE** (one active book per user) |
| purchase_id | UUID (FK)   | References Purchases                   |
| updated_at  | TIMESTAMP   |                                        |

**Why a separate table?**

- User can purchase multiple books
- Only **one** book can be active at a time
- Purchase history must remain intact
- Using `user_id` as PK enforces the one-active-book constraint at DB level

---

### 7. Templates (New)

| Column         | Type          | Notes                               |
| -------------- | ------------- | ----------------------------------- |
| id             | UUID (PK)     |                                     |
| name           | VARCHAR(100)  | e.g., "dark-minimal", "gradient"    |
| s3_key         | VARCHAR(500)  | Path to template image in S3        |
| is_default     | BOOLEAN       | One template marked as default      |
| created_at     | TIMESTAMP     |                                     |

---

### Full SQL Schema

```sql
-- Run these in order

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    preferred_language VARCHAR(5) DEFAULT 'en',
    role VARCHAR(10) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    category_id UUID REFERENCES categories(id),
    cover_image VARCHAR(500),
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_quotes INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE book_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    chapter_title VARCHAR(255),
    quote_index INT NOT NULL,
    quotes JSONB NOT NULL,
    descriptions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_book_quote ON book_contents (book_id, quote_index);

CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    book_id UUID NOT NULL REFERENCES books(id),
    duration_days INT NOT NULL,
    purchase_token VARCHAR(500),
    platform VARCHAR(20) CHECK (platform IN ('GOOGLE_PLAY', 'APP_STORE')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(10) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'REFUNDED')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_purchases_user_status ON purchases (user_id, status);

CREATE TABLE active_books (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    purchase_id UUID NOT NULL REFERENCES purchases(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Design

Base URL: `/api/v1`

### Authentication

| Method | Endpoint              | Auth     | Description                  |
| ------ | --------------------- | -------- | ---------------------------- |
| POST   | `/auth/send-otp`      | Public   | Send OTP to phone number     |
| POST   | `/auth/verify-otp`    | Public   | Verify OTP, return JWT tokens|
| POST   | `/auth/refresh-token` | Public   | Refresh access token         |

**Token Strategy:**

- Access token — short-lived (15 min), sent in `Authorization: Bearer <token>` header
- Refresh token — long-lived (30 days), stored securely on device
- JWT payload: `{ userId, role }`

---

### Books

| Method | Endpoint     | Auth     | Description              |
| ------ | ------------ | -------- | ------------------------ |
| GET    | `/books`     | Required | List available books     |
| GET    | `/books/:id` | Required | Get single book details  |

**GET /books response:**

```json
{
  "books": [
    {
      "id": "uuid",
      "title": "Atomic Habits",
      "author": "James Clear",
      "category": "Self Help",
      "coverImage": "https://s3.../cover.jpg",
      "price": 99.00,
      "totalQuotes": 35
    }
  ]
}
```

---

### Active Book

| Method | Endpoint       | Auth     | Description           |
| ------ | -------------- | -------- | --------------------- |
| POST   | `/active-book` | Required | Set active book       |
| GET    | `/active-book` | Required | Get current active book |

**POST /active-book request:**

```json
{
  "purchaseId": "uuid"
}
```

**Validation:** Purchase must belong to user and be ACTIVE (not expired).

---

### Purchases

| Method | Endpoint            | Auth     | Description            |
| ------ | ------------------- | -------- | ---------------------- |
| POST   | `/purchase/verify`  | Required | Verify mobile purchase |
| GET    | `/purchases`        | Required | List user's purchases  |

---

### Content (Wallpaper)

| Method | Endpoint                                  | Auth     | Description                |
| ------ | ----------------------------------------- | -------- | -------------------------- |
| GET    | `/content/today?width=1080&height=2400`   | Required | Get today's wallpaper URL  |

---

### Admin

| Method | Endpoint                            | Auth  | Description           |
| ------ | ----------------------------------- | ----- | --------------------- |
| POST   | `/admin/books`                      | Admin | Create a book         |
| PUT    | `/admin/books/:id`                  | Admin | Update a book         |
| POST   | `/admin/books/:bookId/import-json`  | Admin | Import quotes from JSON |
| POST   | `/admin/categories`                 | Admin | Create a category     |
| POST   | `/admin/templates`                  | Admin | Upload a template     |

---

## Authentication

### OTP Login Flow

```
Mobile app → POST /auth/send-otp { phone: "+91..." }
    ↓
Backend sends OTP via SMS service (Twilio / AWS SNS)
    ↓
Mobile app → POST /auth/verify-otp { phone: "+91...", otp: "1234" }
    ↓
Backend verifies OTP
    ↓
If new user → create user record
    ↓
Return { accessToken, refreshToken, user }
```

### Auth Middleware

Every protected route must pass through auth middleware that:

1. Extracts JWT from `Authorization: Bearer <token>` header
2. Verifies token signature and expiry
3. Attaches `req.user = { userId, role }` to the request
4. For admin routes — additionally checks `role === 'ADMIN'`

---

## Mobile Purchase Verification

### Platforms

- Google Play (Android)
- Apple App Store (iOS)

### Flow

```
User purchases in mobile app
    ↓
Mobile app receives purchase_token from store
    ↓
Mobile sends to backend: POST /purchase/verify
{
  "purchaseToken": "...",
  "productId": "atomic_habits_monthly",
  "platform": "GOOGLE_PLAY"
}
    ↓
Backend verifies token with store API:
  - Google: googleapis.com/androidpublisher
  - Apple: api.storekit.itunes.apple.com
    ↓
If valid → create purchase record in DB
    ↓
Return purchase details to mobile
```

### Product ID Convention

```
{book_slug}_{duration}
```

Examples:

- `atomic_habits_monthly` → 30 days
- `atomic_habits_yearly` → 365 days

---

## Content & Wallpaper Generation

### GET /content/today — Full Flow

```
1. Get user from JWT
2. Find user's active book (from active_books table)
3. Validate purchase is still ACTIVE and not expired
4. Calculate day_index:
       day_index = (today - purchase.start_date) + 1
5. Build S3 key:
       generated/{bookId}_{quoteIndex}_{lang}_{width}_{height}.jpg
6. Check S3 — if image exists, return URL immediately
7. If not — fetch quote from book_contents WHERE book_id = ? AND quote_index = ?
8. Generate wallpaper image
9. Upload to S3
10. Return image URL
```

### Day Index Calculation

```
day_index = (today - purchase.start_date) + 1

Example (start_date = March 1):
  March 1  → day_index = 1  → Quote 1
  March 2  → day_index = 2  → Quote 2
  March 30 → day_index = 30 → Quote 30
```

**Edge case:** If `day_index > total_quotes`, cycle back: `day_index = ((day_index - 1) % total_quotes) + 1`

### Wallpaper Generation Code

```javascript
import { createCanvas, loadImage } from "canvas";
import sharp from "sharp";

export async function generateWallpaper({ templatePath, quote, summary, width, height }) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Draw template background
  const template = await loadImage(templatePath);
  ctx.drawImage(template, 0, 0, width, height);

  // Draw quote
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px Sans";
  wrapText(ctx, quote, width * 0.1, height * 0.5, width * 0.8, 60);

  // Draw description
  ctx.font = "32px Sans";
  wrapText(ctx, summary, width * 0.1, height * 0.7, width * 0.8, 40);

  // Convert to JPEG
  const buffer = canvas.toBuffer();
  return await sharp(buffer).jpeg({ quality: 95 }).toBuffer();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line !== "") {
      ctx.fillText(line, x, y);
      line = word + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
```

### Race Condition Prevention

When multiple users request the same wallpaper simultaneously:

```
Request 1 → Check S3 → not found → generate → upload
Request 2 → Check S3 → not found → generate → upload (duplicate!)
```

**Solution:** Use an in-memory lock per S3 key during generation:

```javascript
const generationLocks = new Map();

async function getOrGenerateWallpaper(s3Key, generateFn) {
  // Check S3 first
  const existing = await checkS3(s3Key);
  if (existing) return existing;

  // If already being generated, wait for it
  if (generationLocks.has(s3Key)) {
    return await generationLocks.get(s3Key);
  }

  // Generate with lock
  const promise = generateFn();
  generationLocks.set(s3Key, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    generationLocks.delete(s3Key);
  }
}
```

---

## Image Storage (S3)

### Bucket Structure

```
bookshelf-assets/
├── generated/                          # Generated wallpapers
│   └── {bookId}_{quoteIndex}_{lang}_{width}_{height}.jpg
│
├── imports/                            # Book content JSON files
│   └── {book-slug}.json
│
├── covers/                             # Book cover images
│   └── {bookId}.jpg
│
└── templates/                          # Wallpaper templates
    └── {templateName}.png
```

### S3 Key Examples

```
generated/550e8400_1_en_1080_2400.jpg
generated/550e8400_15_hi_1080_2400.jpg
imports/atomic-habits.json
covers/550e8400.jpg
templates/dark-minimal.png
```

---

## Admin APIs

### Import Quotes Flow

```
POST /admin/books/:bookId/import-json
{
  "s3Key": "imports/atomic-habits.json"
}
```

**Steps:**

1. Fetch JSON file from S3 using the provided key
2. Validate JSON structure
3. Flatten chapter quotes into rows with global `quote_index`
4. Transform `quote_en`, `quote_hi` → JSONB format `{ "en": "...", "hi": "..." }`
5. Batch insert into `book_contents` table
6. Update `books.total_quotes` with the count

### Import JSON Structure

```json
{
  "book": "Atomic Habits",
  "author": "James Clear",
  "chapters": [
    {
      "number": 1,
      "title": "The Surprising Power of Atomic Habits",
      "quotes": [
        {
          "id": 1,
          "quote_en": "Habits are the compound interest of self-improvement.",
          "short_description_en": "Small daily improvements lead to remarkable results over time.",
          "quote_hi": "...",
          "short_description_hi": "..."
        }
      ]
    }
  ]
}
```

### Flattening Logic

```
Chapter 1, Quote 1 → quote_index: 1
Chapter 1, Quote 2 → quote_index: 2
Chapter 2, Quote 1 → quote_index: 3
...
```

The `quote_index` is a **global sequential number** across the entire book, not per chapter.

---

## Project Structure

```
bookshelf-backend/
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Auto-generated migration files
│
├── src/
│   ├── app.js                     # Express app setup
│   ├── server.js                  # Entry point — starts server
│   │
│   ├── config/
│   │   ├── db.js                  # Prisma client instance
│   │   ├── s3.js                  # AWS S3 client
│   │   └── env.js                 # Environment variable loader
│   │
│   ├── middleware/
│   │   ├── auth.js                # JWT verification middleware
│   │   ├── adminAuth.js           # Admin role check
│   │   ├── errorHandler.js        # Global error handler
│   │   └── validate.js            # Request validation middleware
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── book.routes.js
│   │   ├── activeBook.routes.js
│   │   ├── purchase.routes.js
│   │   ├── content.routes.js
│   │   └── admin.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── book.controller.js
│   │   ├── activeBook.controller.js
│   │   ├── purchase.controller.js
│   │   ├── content.controller.js
│   │   └── admin.controller.js
│   │
│   ├── services/
│   │   ├── otp.service.js         # Send & verify OTP
│   │   ├── token.service.js       # JWT sign & verify
│   │   ├── purchase.service.js    # Store verification logic
│   │   ├── wallpaper.service.js   # Image generation logic
│   │   ├── s3.service.js          # S3 upload/download/check
│   │   └── import.service.js      # JSON import & flatten logic
│   │
│   ├── utils/
│   │   ├── dayIndex.js            # Day index calculation
│   │   ├── wrapText.js            # Canvas text wrapping helper
│   │   └── appError.js            # Custom error class
│   │
│   └── jobs/
│       └── expirePurchases.js     # Cron job: ACTIVE → EXPIRED
│
├── .env.example
├── .gitignore
├── package.json
└── ARCHITECTURE.md
```

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bookshelf

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# AWS S3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=bookshelf-assets

# OTP (Twilio example)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Google Play verification
GOOGLE_SERVICE_ACCOUNT_KEY=path/to/service-account.json

# Apple App Store verification
APPLE_SHARED_SECRET=your-shared-secret
```

---

## Implementation Phases

### Phase 1 — Foundation (Week 1)

- [ ] Initialize Node.js project with Express
- [ ] Set up Prisma with PostgreSQL
- [ ] Create database schema and run migrations
- [ ] Set up project structure (folders, config files)
- [ ] Implement global error handler middleware
- [ ] Set up environment variables

### Phase 2 — Authentication (Week 1-2)

- [ ] OTP send & verify endpoints
- [ ] JWT token generation (access + refresh)
- [ ] Auth middleware for protected routes
- [ ] Admin auth middleware
- [ ] User CRUD

### Phase 3 — Books & Categories (Week 2)

- [ ] Category CRUD (admin)
- [ ] Book CRUD (admin)
- [ ] GET /books (user — list books)
- [ ] GET /books/:id (user — book details)

### Phase 4 — Content Import (Week 2-3)

- [ ] S3 service (upload, download, check existence)
- [ ] JSON import endpoint
- [ ] Flatten quotes logic (chapter quotes → global quote_index)
- [ ] Transform flat keys to JSONB format
- [ ] Batch insert into book_contents
- [ ] Update total_quotes on book

### Phase 5 — Purchases (Week 3)

- [ ] Google Play purchase verification
- [ ] Apple App Store purchase verification
- [ ] POST /purchase/verify endpoint
- [ ] GET /purchases endpoint
- [ ] Cron job: expire purchases where end_date < today

### Phase 6 — Active Book & Wallpaper (Week 3-4)

- [ ] POST /active-book (set active book)
- [ ] GET /active-book (get active book)
- [ ] Day index calculation
- [ ] Wallpaper generation (canvas + sharp)
- [ ] S3 caching (check before generate)
- [ ] Race condition prevention (in-memory lock)
- [ ] GET /content/today endpoint

### Phase 7 — Polish & Deploy (Week 4)

- [ ] Request validation on all endpoints
- [ ] API rate limiting
- [ ] Error response standardization
- [ ] Deployment setup (EC2 / Railway / Render)
- [ ] PM2 / process manager setup
- [ ] Test all endpoints end-to-end

---

## Rules & Conventions

### API Response Format

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Human readable error message",
  "errorCode": "PURCHASE_EXPIRED"
}
```

### HTTP Status Codes

| Code | Usage                            |
| ---- | -------------------------------- |
| 200  | Success                          |
| 201  | Created (new resource)           |
| 400  | Bad request / validation error   |
| 401  | Unauthorized (no token / expired)|
| 403  | Forbidden (wrong role)           |
| 404  | Not found                        |
| 409  | Conflict (duplicate)             |
| 500  | Internal server error            |

### Naming Conventions

| What               | Convention           | Example                  |
| ------------------ | -------------------- | ------------------------ |
| Files              | camelCase            | `auth.controller.js`     |
| DB tables          | snake_case           | `book_contents`          |
| DB columns         | snake_case           | `quote_index`            |
| API URLs           | kebab-case           | `/active-book`           |
| JS variables       | camelCase            | `dayIndex`               |
| JS constants       | UPPER_SNAKE          | `JWT_ACCESS_SECRET`      |
| Environment vars   | UPPER_SNAKE          | `DATABASE_URL`           |

### Git Conventions

- Branch naming: `feature/auth`, `fix/purchase-expiry`, `chore/setup-prisma`
- Commit messages: `feat: add OTP login`, `fix: wallpaper race condition`
- Never push directly to `main` — use pull requests

### Important Business Rules

1. **Minimum 31 quotes per book** — enforced during import
2. **One active book per user** — enforced at DB level (PK constraint)
3. **Language fallback** — if user's `preferred_language` is not in JSONB, use `en`
4. **Purchase expiry** — cron job runs daily to mark expired purchases
5. **Wallpaper cache** — always check S3 before generating a new image
6. **Day index cycling** — if day exceeds total quotes, cycle: `((day - 1) % total) + 1`

---

## Future Improvements

- [ ] CDN (CloudFront) in front of S3 for faster delivery
- [ ] Batch insert optimization for large content imports
- [ ] API rate limiting per user
- [ ] Content scraping protection
- [ ] Push notifications for daily wallpaper reminder
- [ ] Multiple template selection per user
- [ ] Analytics dashboard (most popular books, daily active users)
- [ ] Subscription renewal reminders
