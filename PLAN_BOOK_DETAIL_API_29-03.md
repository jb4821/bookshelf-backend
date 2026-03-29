# Plan: Book Detail, Chapter Quotes & Quote Detail API Updates

> Based on frontend screenshots — book detail page, chapter quotes list, and quote detail (read more) page.

---

## Change 1: Book Detail API (`GET /books/:id`)

### Current Response

```json
{
  "id": "...",
  "title": "Sapiens",
  "author": "Yuval Noah Harari",
  "category": "Self Help",
  "coverImage": null,
  "price": "299",
  "totalQuotes": 31,
  "translationStatus": "NONE",
  "createdAt": "..."
}
```

### Required Response

```json
{
  "id": "...",
  "title": "Sapiens",
  "author": "Yuval Noah Harari",
  "coverImage": "https://s3.../sapiens-cover.jpg",
  "price": "299",
  "totalQuotes": 31,
  "translationStatus": "COMPLETED",

  "description": "A brief history of humankind, from the Stone Age to the present...",
  "rating": 4.6,
  "totalPages": 10,
  "publishedYear": 2011,

  "category": "History",
  "tags": ["History", "Science"],

  "chapters": [
    { "number": 1, "title": "An Animal of No Significance", "totalQuotes": 6 },
    { "number": 2, "title": "The Tree of Knowledge", "totalQuotes": 7 },
    { "number": 3, "title": "A Day in the Life of Adam and Eve", "totalQuotes": 5 },
    { "number": 4, "title": "History's Biggest Fraud", "totalQuotes": 6 },
    { "number": 5, "title": "History's Most Dangerous Secret", "totalQuotes": 7 }
  ],

  "createdAt": "..."
}
```

### DB Changes — Book Model

| Field | Type | Description |
|-------|------|-------------|
| `description` | `String?` | "About this book" text |
| `rating` | `Decimal?` | Average rating (e.g., 4.6) |
| `totalPages` | `Int?` | Total number of pages |
| `publishedYear` | `Int?` | Year of publication |
| `tags` | `Json?` | Array of tag strings, e.g. `["History", "Science"]` |

### Chapters (No DB change needed)

Already in `BookContent` table (`chapterNumber` + `chapterTitle`). Just aggregate in the API:
- Group by (chapterNumber, chapterTitle)
- Count quotes per chapter

---

## Change 2: Chapter Quotes List API (NEW)

> Screen: User taps a chapter → sees list of all quotes in that chapter

### Endpoint

```
GET /api/v1/books/:bookId/chapters/:chapterNumber/quotes
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "data": {
    "bookTitle": "Sapiens",
    "author": "Yuval Noah Harari",
    "chapterNumber": 1,
    "chapterTitle": "An Animal of No Significance",
    "quotes": [
      {
        "quoteIndex": 1,
        "quote": "History is something that very few people have been doing...",
        "shortDescription": "Most of human history has been made by a tiny mino...",
        "isRead": true
      },
      {
        "quoteIndex": 2,
        "quote": "Large numbers of strangers can cooperate successfully...",
        "shortDescription": "Shared fictions — money, nations, laws — are the invi...",
        "isRead": false
      }
    ]
  }
}
```

> Note: `quote` and `shortDescription` can be returned in full or truncated — frontend will truncate for display. The `isRead` flag tracks whether this user has read/opened this quote.

---

## Change 3: Quote Detail API (NEW)

> Screen: User taps "Read More →" on a quote → sees full quote detail

### Endpoint

```
GET /api/v1/books/:bookId/quotes/:quoteIndex
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "data": {
    "bookTitle": "Sapiens",
    "author": "Yuval Noah Harari",
    "chapterNumber": 1,
    "chapterTitle": "An Animal of No Significance",
    "quoteIndex": 1,
    "quote": "History is something that very few people have been doing while everyone else was ploughing fields and carrying water buckets.",
    "shortDescription": "Most of human history has been made by a tiny minority while the majority simply survived.",
    "deepDive": "When we read about history, we read about kings, generals, philosophers, and inventors. But for every Caesar there were a million farmers who never left their village...",
    "realWorldExample": "The Egyptian pyramids are perhaps the most famous monuments in human history, attributed to pharaohs like Khufu and Khafre. Yet they were built by tens of thousands of workers...",
    "isRead": true
  }
}
```

### DB Changes — BookContent Model

| Field | Type | Description |
|-------|------|-------------|
| `deepDives` | `Json` | `{ "en": "...", "hi": "..." }` — Detailed explanation |
| `realWorldExamples` | `Json` | `{ "en": "...", "hi": "..." }` — Practical real-world example |

> These follow the same JSONB pattern as `quotes` and `descriptions` for multi-language support.

---

## Change 4: Mark Quote as Read API (NEW)

> Tracks which quotes a user has read/opened.

### Endpoint

```
POST /api/v1/books/:bookId/quotes/:quoteIndex/read
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "data": { "message": "Quote marked as read" }
}
```

### DB Changes — New `UserQuoteRead` Model

```prisma
model UserQuoteRead {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  bookId    String   @map("book_id")
  quoteIndex Int     @map("quote_index")
  readAt    DateTime @default(now()) @map("read_at")

  user User @relation(fields: [userId], references: [id])
  book Book @relation(fields: [bookId], references: [id])

  @@unique([userId, bookId, quoteIndex])
  @@map("user_quote_reads")
}
```

---

## Change 5: Import JSON Format Update

The admin import JSON needs two new fields per quote:

```json
{
  "chapters": [
    {
      "number": 1,
      "title": "An Animal of No Significance",
      "quotes": [
        {
          "id": 1,
          "quote_en": "History is something that...",
          "short_description_en": "Most of human history...",
          "deep_dive_en": "When we read about history...",
          "real_world_example_en": "The Egyptian pyramids..."
        }
      ]
    }
  ]
}
```

> Auto-translation will also translate `deepDive` and `realWorldExample` fields.

---

## Summary of All DB Changes

### Modified Models

**Book** — add 5 fields:
- `description String?`
- `rating Decimal?`
- `totalPages Int?`
- `publishedYear Int?`
- `tags Json?`

**BookContent** — add 2 fields:
- `deepDives Json?`
- `realWorldExamples Json?`

### New Model

**UserQuoteRead** — tracks read status per user per quote

### New Relations

- `User` → `UserQuoteRead[]`
- `Book` → `UserQuoteRead[]`

---

## New API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/books/:id` | Required | Book detail (UPDATED — new fields + chapters) |
| GET | `/books/:bookId/chapters/:chapterNumber/quotes` | Required | List quotes in a chapter |
| GET | `/books/:bookId/quotes/:quoteIndex` | Required | Quote detail (full + deep dive + example) |
| POST | `/books/:bookId/quotes/:quoteIndex/read` | Required | Mark quote as read |

---

## Implementation Steps

1. Update `prisma/schema.prisma` — add new fields + UserQuoteRead model
2. Run migration
3. Update `import.service.js` — handle `deep_dive_*` and `real_world_example_*` fields
4. Update `translate.service.js` — translate deepDive and realWorldExample too
5. Update `book.controller.js` — getBookById with new fields + chapters
6. Create new controller/routes for chapter quotes, quote detail, mark read
7. Update seed data with new fields
8. Update Swagger docs
9. Test locally
10. Commit & push

---

## Change 6: Book List API Update (`GET /books`)

### Current Response

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Atomic Habits",
      "author": "James Clear",
      "category": "Self Help",
      "coverImage": null,
      "price": "299",
      "totalQuotes": 31
    }
  ]
}
```

### Required Response

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Atomic Habits",
      "author": "James Clear",
      "category": "Self Help",
      "categoryId": "cat-self-help",
      "coverImage": null,
      "price": "299",
      "totalQuotes": 31,
      "rating": 4.8,
      "tags": ["Self Help", "Psychology"]
    }
  ]
}
```

### Query Parameters (all optional)

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `search` | `String` | `?search=atomic` | Search by book title or author (case-insensitive, partial match) |
| `categoryId` | `String` | `?categoryId=uuid-here` | Filter books by category |

### Example Requests

```
GET /api/v1/books                                    → All books
GET /api/v1/books?search=atomic                      → Search by title/author
GET /api/v1/books?categoryId=cat-self-help            → Filter by category
GET /api/v1/books?search=james&categoryId=cat-self-help → Both combined
```

### Controller Changes (book.controller.js)

- Add `categoryId` to the response object
- Read `req.query.search` and `req.query.categoryId`
- Build dynamic `where` clause:
  - `search` → `OR: [{ title: contains }, { author: contains }]` (case-insensitive)
  - `categoryId` → `{ categoryId: value }`
- Add `rating` and `tags` to response (new Book fields)

---

## Change 7: Reading Progress (Total vs Read Quotes)

> Show how many quotes the user has read out of total — useful for progress bars and stats.

### Where to show

**Book List API** (`GET /books`):
```json
{
  "id": "...",
  "title": "Atomic Habits",
  "totalQuotes": 31,
  "readQuotes": 12
}
```

**Book Detail API** (`GET /books/:id`):
```json
{
  "id": "...",
  "title": "Atomic Habits",
  "totalQuotes": 31,
  "readQuotes": 12,
  "chapters": [
    { "number": 1, "title": "The Fundamentals", "totalQuotes": 6, "readQuotes": 4 },
    { "number": 2, "title": "The 2nd Law", "totalQuotes": 7, "readQuotes": 3 }
  ]
}
```

### How it works

- `totalQuotes` — already exists on the Book model
- `readQuotes` — count from `UserQuoteRead` table (Change 4) where `userId` = current user and `bookId` = this book
- Per chapter: group `UserQuoteRead` by chapterNumber (join via BookContent)

### No extra DB change needed

Uses the `UserQuoteRead` model (already planned in Change 4). Just needs a count query per book/chapter.

---

## Change 8: Current Quote API (NEW)

> Single API that returns today's quote directly. If no active book, returns `null`. Used for home screen / widget.

### Endpoint

```
GET /api/v1/content/current
Authorization: Bearer <token>
```

### Response (with active book)

```json
{
  "success": true,
  "data": {
    "bookId": "book-atomic-habits",
    "bookTitle": "Atomic Habits",
    "author": "James Clear",
    "coverImage": "https://...",
    "chapterNumber": 1,
    "chapterTitle": "The Fundamentals",
    "quoteIndex": 6,
    "dayNumber": 6,
    "totalQuotes": 31,
    "quote": "The seed of every habit is a single, tiny decision.",
    "shortDescription": "Starting small and simple is the key to building a habit that lasts.",
    "deepDive": "When we think about building new habits...",
    "realWorldExample": "Consider how Jerry Seinfeld...",
    "isRead": false
  }
}
```

### Response (no active book)

```json
{
  "success": true,
  "data": null
}
```

### How it works

1. Get user's active book (from `ActiveBook` → `Purchase` → `Book`)
2. If no active book → return `null`
3. Calculate day index (same logic as wallpaper endpoint)
4. Fetch the quote at that index from `BookContent`
5. Apply language preference (fallback to "en")
6. Check `UserQuoteRead` for `isRead` status
7. Return all quote data

### Difference from existing `/content/today`

| | `/content/today` | `/content/current` |
|---|---|---|
| Returns | PNG wallpaper image | JSON quote data |
| Purpose | Lock screen wallpaper | App home screen / reading |
| Params | `width`, `height` required | None needed |

---

## Change 9: User Profile API (NEW)

### Endpoints

```
GET  /api/v1/user/profile          → Get user profile
PUT  /api/v1/user/profile          → Update user profile
```

### GET Response

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Rahul Sharma",
    "phone": "+911111111111",
    "email": "rahul@example.com",
    "preferredLanguage": "en",
    "notifications": {
      "dailyReminder": true,
      "newBooks": true
    }
  }
}
```

### PUT Request (all fields optional)

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "preferredLanguage": "hi",
  "notifications": {
    "dailyReminder": false,
    "newBooks": true
  }
}
```

### DB Changes — User Model

| Field | Type | Description |
|-------|------|-------------|
| `name` | `String?` | User's display name |
| `notifications` | `Json` | `{ "dailyReminder": true, "newBooks": true }` — default both `true` |

> `phone`, `email`, `preferredLanguage` already exist on the User model.

---

## Questions — Resolved

| # | Question | Decision | Reason |
|---|----------|----------|--------|
| 1 | Is `tags` just for display or do users filter by tags? | **Display only** | No filter-by-tag screen in screenshots. Category filter already covers filtering. |
| 2 | Is `rating` a fixed value set by admin, or calculated from user reviews? | **Admin-set** | No "Rate this book" UI in screenshots. Rating is book metadata, not user-generated. |
| 3 | Does "10 pages" refer to actual book pages or total quotes/days? | **Actual book pages (metadata)** | Just display info about the physical book. `totalQuotes` is separate. |
| 4 | Should `deepDive` and `realWorldExample` be written by admin or auto-generated? | **Written by admin in import JSON** | These are rich, curated content. Auto-translation handles multi-language. |
| 5 | Should "Read More" auto-mark as read? | **Yes, auto-mark** | When user opens quote detail (`GET /quotes/:quoteIndex`), backend marks it as read automatically. No separate button needed. |
| 6 | Should chapter quotes list return full or truncated text? | **Full text** | API always returns full data. Frontend truncates for display on their side. |

---

## Final Summary

### Total DB Changes

**Modified Models:**
- **User** — add `name`, `notifications`
- **Book** — add `description`, `rating`, `totalPages`, `publishedYear`, `tags`
- **BookContent** — add `deepDives`, `realWorldExamples`

**New Model:**
- **UserQuoteRead** — tracks read status per user per quote

### All API Changes

| # | Method | Endpoint | Type | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/books` | UPDATE | Add categoryId, rating, tags, readQuotes + search/categoryId filters |
| 2 | GET | `/books/:id` | UPDATE | Add description, rating, pages, year, tags, chapters with readQuotes |
| 3 | GET | `/books/:bookId/chapters/:chapterNumber/quotes` | NEW | Chapter quotes list with isRead flag |
| 4 | GET | `/books/:bookId/quotes/:quoteIndex` | NEW | Quote detail + deepDive + realWorldExample (auto-marks as read) |
| 5 | GET | `/content/current` | NEW | Today's quote as JSON (returns null if no active book) |
| 6 | GET | `/user/profile` | NEW | User profile with name, phone, language, notifications |
| 7 | PUT | `/user/profile` | NEW | Update user profile |

### Import JSON Update

Admin now provides 4 content fields per quote (English only, auto-translated):
- `quote_en`, `short_description_en`, `deep_dive_en`, `real_world_example_en`

### Implementation Order

1. Schema changes + migration (all DB changes in one migration)
2. User profile API (Change 9) — simplest, no dependencies
3. Book list API update (Change 6) — search + filter
4. Book detail API update (Change 1) — new fields + chapters
5. Chapter quotes + Quote detail + Mark read (Changes 2, 3, 4) — interconnected
6. Import JSON update (Change 5) — handle new fields + translation
7. Current quote API (Change 8) — depends on new BookContent fields
8. Reading progress (Change 7) — add readQuotes counts to book list + detail
9. Update seed data, Swagger docs, test
10. Commit & push
