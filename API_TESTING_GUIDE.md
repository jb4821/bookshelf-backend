# BookShelf API — Testing Guide

This guide walks you through testing **every endpoint** step by step using `curl` or any API client (Postman, Insomnia, Thunder Client).

> **Base URL:** `http://localhost:5000/api/v1`
> **Swagger UI:** `http://localhost:5000/api-docs`

---

## Setup

```bash
# Start the server
npm run dev
```

> **Dev OTP:** Use `1234` as OTP for all phone numbers in development mode.

---

## Step 1 — Authentication

### 1.1 Send OTP

```
POST /api/v1/auth/send-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": { "message": "OTP sent successfully" }
}
```

### 1.2 Verify OTP (Login / Register)

```
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "1234"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "phone": "+919876543210",
      "email": null,
      "preferredLanguage": "en",
      "role": "USER"
    }
  }
}
```

> **Save the `accessToken`** — you'll use it as `Bearer <token>` in all protected endpoints.

### 1.3 Refresh Token

```
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<your-refresh-token>"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-token...",
    "refreshToken": "new-refresh-token..."
  }
}
```

### 1.4 Test Validation Error

```
POST /api/v1/auth/send-otp
Content-Type: application/json

{
  "phone": "abc"
}
```

**Expected:** `400` — `"Invalid phone number format"`

---

## Step 2 — Create Admin User

To test admin endpoints, you need to make a user an ADMIN.

### Option A — Using psql

```sql
UPDATE users SET role = 'ADMIN' WHERE phone = '+919876543210';
```

### Option B — Using Prisma Studio

```bash
npx prisma studio
```

Open the browser, go to `users` table, change `role` to `ADMIN`.

> **After updating role**, you must **login again** (send-otp + verify-otp) to get a new token with `role: ADMIN`.

---

## Step 3 — Categories (Admin)

> **Header for all admin requests:**
> `Authorization: Bearer <admin-access-token>`

### 3.1 Create Category

```
POST /api/v1/admin/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Self Help"
}
```

**Expected:** `201` — Category created. **Save the `id`.**

### 3.2 Create More Categories

```json
{ "name": "Philosophy" }
{ "name": "Business" }
{ "name": "Psychology" }
```

### 3.3 List Categories

```
GET /api/v1/admin/categories
Authorization: Bearer <admin-token>
```

### 3.4 Update Category

```
PUT /api/v1/admin/categories/<category-id>
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Self-Help & Motivation"
}
```

### 3.5 Delete Category

```
DELETE /api/v1/admin/categories/<category-id>
Authorization: Bearer <admin-token>
```

> **Note:** Cannot delete a category that has books. You'll get: `400` — `"Cannot delete category with existing books"`

### 3.6 Test Duplicate Category

```
POST /api/v1/admin/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Self Help"
}
```

**Expected:** `409` — `"Category already exists"`

---

## Step 4 — Books (Admin)

### 4.1 Create Book

```
POST /api/v1/admin/books
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Atomic Habits",
  "author": "James Clear",
  "categoryId": "<category-id>",
  "price": 99
}
```

**Expected:** `201` — Book created. **Save the `id`.**

### 4.2 Update Book

```
PUT /api/v1/admin/books/<book-id>
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Atomic Habits - Updated Edition",
  "price": 149
}
```

### 4.3 Delete Book

```
DELETE /api/v1/admin/books/<book-id>
Authorization: Bearer <admin-token>
```

> **Warning:** This deletes the book and all its content (quotes). Use with caution.

---

## Step 5 — Import Quotes (Admin)

### 5.1 Import via Direct JSON

```
POST /api/v1/admin/books/<book-id>/import-json
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "data": {
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
            "quote_hi": "आदतें आत्म-सुधार का चक्रवृद्धि ब्याज हैं।",
            "short_description_hi": "छोटे दैनिक सुधार समय के साथ उल्लेखनीय परिणाम देते हैं।"
          },
          {
            "id": 2,
            "quote_en": "You do not rise to the level of your goals. You fall to the level of your systems.",
            "short_description_en": "Goals set direction, but systems determine progress.",
            "quote_hi": "आप अपने लक्ष्यों के स्तर तक नहीं उठते। आप अपनी प्रणालियों के स्तर तक गिरते हैं।",
            "short_description_hi": "लक्ष्य दिशा निर्धारित करते हैं, लेकिन सिस्टम प्रगति निर्धारित करते हैं।"
          }
        ]
      },
      {
        "number": 2,
        "title": "How Your Habits Shape Your Identity",
        "quotes": [
          {
            "id": 3,
            "quote_en": "Every action you take is a vote for the type of person you wish to become.",
            "short_description_en": "Your habits define your identity over time.",
            "quote_hi": "आपका हर कार्य उस प्रकार के व्यक्ति के लिए एक वोट है जो आप बनना चाहते हैं।",
            "short_description_hi": "आपकी आदतें समय के साथ आपकी पहचान को परिभाषित करती हैं।"
          }
        ]
      }
    ]
  }
}
```

> **Note:** You need **minimum 31 quotes** for import to succeed. The example above has only 3 — it will fail with `"Book must have at least 31 quotes"`. For testing, create a JSON with 31+ quotes.

### 5.2 Quick Test — Generate 31 Quotes

Use this Node.js script to generate test data:

```javascript
// Run: node generate-test-quotes.js
const data = {
  book: "Atomic Habits",
  author: "James Clear",
  chapters: [
    {
      number: 1,
      title: "The Power of Habits",
      quotes: Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        quote_en: `Quote ${i + 1}: Success is the product of daily habits.`,
        short_description_en: `Insight ${i + 1}: Focus on systems, not goals.`,
        quote_hi: `उद्धरण ${i + 1}: सफलता दैनिक आदतों का उत्पाद है।`,
        short_description_hi: `अंतर्दृष्टि ${i + 1}: लक्ष्यों पर नहीं, सिस्टम पर ध्यान दें।`
      }))
    },
    {
      number: 2,
      title: "Identity and Habits",
      quotes: Array.from({ length: 16 }, (_, i) => ({
        id: i + 16,
        quote_en: `Quote ${i + 16}: Your habits shape your identity.`,
        short_description_en: `Insight ${i + 16}: Become the person you want to be.`,
        quote_hi: `उद्धरण ${i + 16}: आपकी आदतें आपकी पहचान बनाती हैं।`,
        short_description_hi: `अंतर्दृष्टि ${i + 16}: वह व्यक्ति बनें जो आप बनना चाहते हैं।`
      }))
    }
  ]
};

console.log(JSON.stringify(data, null, 2));
```

Then use the output as the `data` field in the import request.

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Successfully imported 31 quotes",
    "totalQuotes": 31
  }
}
```

### 5.3 Import via S3 Key (when S3 is configured)

```
POST /api/v1/admin/books/<book-id>/import-json
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "s3Key": "imports/atomic-habits.json"
}
```

---

## Step 6 — Books (User)

> **Header:** `Authorization: Bearer <user-access-token>`

### 6.1 List All Books

```
GET /api/v1/books
Authorization: Bearer <user-token>
```

**Expected:** List of all active books with title, author, category, price, totalQuotes.

### 6.2 Get Book Details

```
GET /api/v1/books/<book-id>
Authorization: Bearer <user-token>
```

### 6.3 Test Without Token

```
GET /api/v1/books
```

**Expected:** `401` — `"Access token is required"`

---

## Step 7 — Purchases (User)

### 7.1 Verify Purchase

```
POST /api/v1/purchase/verify
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "purchaseToken": "test-token-001",
  "productId": "atomic_habits_monthly",
  "platform": "GOOGLE_PLAY",
  "bookId": "<book-id>"
}
```

**Expected:** `201` — Purchase created with 30-day duration.

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bookId": "uuid",
    "bookTitle": "Atomic Habits",
    "bookAuthor": "James Clear",
    "durationDays": 30,
    "startDate": "2026-03-17",
    "endDate": "2026-04-16",
    "status": "ACTIVE"
  }
}
```

> **Save the `id`** — you need it to set the active book.

**Product ID durations:**
| Product ID | Duration |
|---|---|
| `{book}_monthly` | 30 days |
| `{book}_quarterly` | 90 days |
| `{book}_yearly` | 365 days |

### 7.2 Test Duplicate Purchase

```
POST /api/v1/purchase/verify
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "purchaseToken": "test-token-001",
  "productId": "atomic_habits_monthly",
  "platform": "GOOGLE_PLAY",
  "bookId": "<book-id>"
}
```

**Expected:** `409` — `"Purchase already verified"`

### 7.3 Purchase History

```
GET /api/v1/purchase
Authorization: Bearer <user-token>
```

---

## Step 8 — Active Book (User)

### 8.1 Set Active Book

```
POST /api/v1/active-book
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "purchaseId": "<purchase-id>"
}
```

**Expected:** `200` — Active book set with book details.

### 8.2 Get Active Book

```
GET /api/v1/active-book
Authorization: Bearer <user-token>
```

### 8.3 Test Without Active Book

Login with a new phone number (no purchases) and try:

```
GET /api/v1/active-book
Authorization: Bearer <new-user-token>
```

**Expected:** `404` — `"No active book set"`

---

## Step 9 — Get Today's Wallpaper (User)

### 9.1 Get Wallpaper (Samsung S24)

```
GET /api/v1/content/today?width=1080&height=2340
Authorization: Bearer <user-token>
```

**Expected:** Returns a **PNG image** directly (when S3 is not configured).

### 9.2 Get Wallpaper (iPhone 15 Pro)

```
GET /api/v1/content/today?width=1179&height=2556
Authorization: Bearer <user-token>
```

### 9.3 Get Wallpaper (Pixel 8)

```
GET /api/v1/content/today?width=1080&height=2400
Authorization: Bearer <user-token>
```

### 9.4 Default Size (no params)

```
GET /api/v1/content/today
Authorization: Bearer <user-token>
```

**Expected:** Uses default `1080x2340`.

### 9.5 Test Without Active Book

**Expected:** `404` — `"No active book set"`

### 9.6 Test With Expired Purchase

**Expected:** `400` — `"Purchase has expired"`

### 9.7 Save Wallpaper to File (curl)

```bash
curl -o wallpaper.png "http://localhost:5000/api/v1/content/today?width=1080&height=2340" \
  -H "Authorization: Bearer <user-token>"
```

---

## Step 10 — Error Cases to Test

| Test Case | Endpoint | Expected |
|---|---|---|
| No token | Any protected route | `401` — `"Access token is required"` |
| Expired token | Any protected route | `401` — `"Invalid or expired access token"` |
| User on admin route | Any `/admin/*` route | `403` — `"Admin access required"` |
| Invalid phone | `POST /auth/send-otp` | `400` — `"Invalid phone number format"` |
| Wrong OTP | `POST /auth/verify-otp` | `400` — `"Invalid or expired OTP"` |
| Duplicate category | `POST /admin/categories` | `409` — `"Category already exists"` |
| Invalid category ID | `POST /admin/books` | `404` — `"Category not found"` |
| Book not found | `GET /books/invalid-uuid` | `404` — `"Book not found"` |
| < 31 quotes | `POST /admin/books/:id/import-json` | `400` — `"Book must have at least 31 quotes"` |
| Duplicate token | `POST /purchase/verify` | `409` — `"Purchase already verified"` |
| No active book | `GET /content/today` | `404` — `"No active book set"` |

---

## Complete Test Flow (Quick)

Here's the fastest path to test everything end-to-end:

```
1. POST /auth/send-otp          → { phone: "+919876543210" }
2. POST /auth/verify-otp        → { phone, otp: "1234" } → save token
3. Update user to ADMIN in DB
4. POST /auth/send-otp          → re-login
5. POST /auth/verify-otp        → save admin token
6. POST /admin/categories       → { name: "Self Help" } → save category ID
7. POST /admin/books            → { title, categoryId, price } → save book ID
8. POST /admin/books/:id/import-json → { data: { chapters... } } (31+ quotes)
9. POST /purchase/verify        → { bookId, productId, platform } → save purchase ID
10. POST /active-book           → { purchaseId }
11. GET /content/today?width=1080&height=2340 → wallpaper image!
```

---

## Postman / Thunder Client Tips

1. Create an **environment** with variables:
   - `base_url` = `http://localhost:5000/api/v1`
   - `token` = (set after login)
   - `admin_token` = (set after admin login)
   - `book_id` = (set after creating book)
   - `purchase_id` = (set after purchase)

2. Set `Authorization` header globally:
   - `Bearer {{token}}` for user endpoints
   - `Bearer {{admin_token}}` for admin endpoints

3. For wallpaper endpoint, set response type to **binary/image** to preview the wallpaper.
