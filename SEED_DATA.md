# BookShelf — Seed Data Reference

> Use this guide to test the API with pre-seeded users, books, and purchases.
>
> **Base URL:** `https://bookshelf-backend-8ury.onrender.com/api/v1`
> **Swagger:** `https://bookshelf-backend-8ury.onrender.com/api-docs`
> **OTP for all users:** `1234`

---

## Users

| Role  | Name          | Phone          | Email                   | Language | Active Book          |
|-------|---------------|----------------|-------------------------|----------|----------------------|
| Admin | Admin         | +910000000000  | admin@bookshelf.com     | English  | —                    |
| User  | Rahul Sharma  | +911111111111  | rahul@example.com       | English  | Atomic Habits        |
| User  | Priya Patel   | +912222222222  | priya@example.com       | Hindi    | Deep Work            |
| User  | Amit Kumar    | +913333333333  | amit@example.com        | English  | The Power of Now     |
| User  | Sneha Gupta   | +914444444444  | sneha@example.com       | Hindi    | Atomic Habits        |
| User  | Vikram Singh  | +915555555555  | vikram@example.com      | English  | Think and Grow Rich  |
| User  | Neha Joshi    | +916666666666  | neha@example.com        | Hindi    | Rich Dad Poor Dad    |
| User  | Arjun Mehta   | +917777777777  | arjun@example.com       | English  | Deep Work            |
| User  | Kavya Reddy   | +918888888888  | kavya@example.com       | Hindi    | The Power of Now     |

> All users have notification preferences: `{ dailyReminder: true, newBooks: true }`

---

## Books

| Book                  | Author           | Category     | Price | Rating | Pages | Year | Tags                                  | Quotes |
|-----------------------|------------------|--------------|-------|--------|-------|------|---------------------------------------|--------|
| Atomic Habits         | James Clear      | Self Help    | ₹299  | 4.8    | 320   | 2018 | Self Help, Psychology, Productivity    | 31     |
| Deep Work             | Cal Newport      | Productivity | ₹249  | 4.6    | 296   | 2016 | Productivity, Focus, Career           | 31     |
| The Power of Now      | Eckhart Tolle    | Mindfulness  | ₹199  | 4.5    | 236   | 1997 | Mindfulness, Spirituality, Meditation | 31     |
| Think and Grow Rich   | Napoleon Hill    | Business     | ₹179  | 4.7    | 238   | 1937 | Business, Success, Wealth             | 31     |
| Rich Dad Poor Dad     | Robert Kiyosaki  | Finance      | ₹219  | 4.6    | 336   | 1997 | Finance, Investing, Money             | 31     |

> **Atomic Habits** and **Deep Work** have full 31 quotes seeded (EN + HI).
> Other books need quotes imported via admin API.

---

## Categories

`Self Help` · `Productivity` · `Mindfulness` · `Business` · `Finance`

---

## Purchase Scenarios

| User   | Book                | Duration | Platform     | Status   | Day in book |
|--------|---------------------|----------|--------------|----------|-------------|
| Rahul  | Atomic Habits       | 31-day   | Google Play  | Active   | Day 6       |
| Priya  | Deep Work           | 90-day   | App Store    | Active   | Day 11      |
| Amit   | The Power of Now    | 31-day   | Google Play  | Active   | Day 2       |
| Sneha  | Atomic Habits       | 90-day   | App Store    | Active   | Day 16      |
| Sneha  | Deep Work           | 31-day   | App Store    | Expired  | —           |
| Vikram | Think and Grow Rich | 31-day   | Google Play  | Active   | Day 4       |
| Neha   | Rich Dad Poor Dad   | 90-day   | App Store    | Active   | Day 21      |
| Arjun  | Atomic Habits       | 31-day   | Google Play  | Expired  | —           |
| Arjun  | Deep Work           | 31-day   | Google Play  | Active   | Day 8       |
| Kavya  | The Power of Now    | 31-day   | App Store    | Active   | Day 3       |

---

## All API Endpoints

### Auth
```
POST /auth/send-otp              { "phone": "+911111111111" }
POST /auth/verify-otp            { "phone": "+911111111111", "otp": "1234" }
POST /auth/refresh-token         { "refreshToken": "..." }
```

### User Profile
```
GET  /user/profile               → name, phone, email, language, notifications
PUT  /user/profile               { "name": "...", "preferredLanguage": "hi", "notifications": { "dailyReminder": false } }
```

### Books
```
GET  /books                      → All books (with readQuotes count)
GET  /books?search=atomic        → Search by title/author
GET  /books?categoryId=xxx       → Filter by category
GET  /books/:id                  → Book detail + chapters + reading progress
```

### Chapter Quotes & Quote Detail
```
GET  /books/:bookId/chapters/:chapterNumber/quotes   → List quotes with isRead flag
GET  /books/:bookId/quotes/:quoteIndex               → Full quote detail (auto-marks as read)
```

> Quote detail includes: `quote`, `shortDescription`, `deepDive`, `realWorldExample`, `isRead`

### Content
```
GET  /content/current            → Today's quote as JSON (null if no active book)
GET  /content/today?width=1080&height=2340   → Today's wallpaper as PNG image
```

### Purchases
```
POST /purchase/verify            → Verify a purchase
GET  /purchases                  → Purchase history
```

### Active Book
```
POST /active-book                → Set active book
GET  /active-book                → Get active book
```

### Admin
```
POST /admin/categories           → Create category
POST /admin/books                → Create book (now supports description, rating, totalPages, publishedYear, tags)
POST /admin/books/:bookId/import-json   → Import quotes (supports deep_dive_en, real_world_example_en)
```

---

## Useful Test Scenarios

| Scenario | How to test |
|----------|-------------|
| English user with active book | Login as Rahul (`+911111111111`) |
| Hindi user with active book | Login as Priya (`+912222222222`) |
| User with expired + active purchases | Arjun (`+917777777777`) or Sneha (`+914444444444`) |
| Get today's quote (JSON) | `GET /content/current` |
| Get today's wallpaper (image) | `GET /content/today?width=1080&height=2340` |
| View chapter quotes | `GET /books/00000000-0000-0000-0000-000000000b01/chapters/1/quotes` |
| View quote detail + mark read | `GET /books/00000000-0000-0000-0000-000000000b01/quotes/1` |
| Check reading progress | `GET /books/00000000-0000-0000-0000-000000000b01` → check `readQuotes` |
| Search books | `GET /books?search=atomic` |
| Update profile | `PUT /user/profile` with `{ "name": "Test User" }` |
| Admin access | Login with `+910000000000` |

---

## Seed Data IDs (fixed UUIDs)

All seed data uses fixed UUIDs with pattern `00000000-0000-0000-0000-00000000XXXX`:

| Type       | Name               | ID                                     |
|------------|--------------------|----------------------------------------|
| Book       | Atomic Habits      | `00000000-0000-0000-0000-000000000b01` |
| Book       | Deep Work          | `00000000-0000-0000-0000-000000000b02` |
| Book       | The Power of Now   | `00000000-0000-0000-0000-000000000b03` |
| Book       | Think and Grow Rich| `00000000-0000-0000-0000-000000000b04` |
| Book       | Rich Dad Poor Dad  | `00000000-0000-0000-0000-000000000b05` |
| User       | Admin              | `00000000-0000-0000-0000-000000000u01` |
| User       | Rahul              | `00000000-0000-0000-0000-000000000u02` |
| User       | Priya              | `00000000-0000-0000-0000-000000000u03` |

> Use these IDs directly in API calls for testing. Running `npm run seed` is safe — it only replaces seed data, not data added by other developers.
