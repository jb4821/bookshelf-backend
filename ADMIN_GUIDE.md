# BookShelf — Admin API Guide

> How to add categories, books, and import quotes using the admin API.
>
> **Base URL:** `https://bookshelf-backend-8ury.onrender.com/api/v1`
> **Swagger:** `https://bookshelf-backend-8ury.onrender.com/api-docs`

---

## Step 1: Login as Admin

```
POST /auth/send-otp
{ "phone": "+910000000000" }

POST /auth/verify-otp
{ "phone": "+910000000000", "otp": "1234" }
```

Save the `accessToken` from the response. Use it as `Authorization: Bearer <accessToken>` in all admin requests.

---

## Step 2: Create a Category (optional — 5 already seeded)

**Create:**
```
POST /admin/categories
Authorization: Bearer <accessToken>

{ "name": "History" }
```

**Get All Categories:**
```
GET /admin/categories
Authorization: Bearer <accessToken>
```

**Update:**
```
PUT /admin/categories/:id
Authorization: Bearer <accessToken>

{ "name": "Updated Name" }
```

**Delete:**
```
DELETE /admin/categories/:id
Authorization: Bearer <accessToken>
```

**Seeded Categories:**

| Category     | ID                                     |
|--------------|----------------------------------------|
| Self Help    | `00000000-0000-0000-0000-000000000c01` |
| Productivity | `00000000-0000-0000-0000-000000000c02` |
| Mindfulness  | `00000000-0000-0000-0000-000000000c03` |
| Business     | `00000000-0000-0000-0000-000000000c04` |
| Finance      | `00000000-0000-0000-0000-000000000c05` |

---

## Step 3: Create a Book

```
POST /admin/books
Authorization: Bearer <accessToken>

{
  "title": "Sapiens",
  "author": "Yuval Noah Harari",
  "description": "A brief history of humankind, from the Stone Age to the present.",
  "categoryId": "00000000-0000-0000-0000-000000000c01",
  "price": 299,
  "rating": 4.6,
  "totalPages": 443,
  "publishedYear": 2011,
  "tags": ["History", "Science"]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Book title |
| `author` | No | Author name |
| `description` | No | "About this book" text |
| `categoryId` | Yes | UUID of category |
| `price` | Yes | Price in INR |
| `rating` | No | Rating out of 5 (e.g., 4.6) |
| `totalPages` | No | Number of pages in the book |
| `publishedYear` | No | Year of publication |
| `tags` | No | Array of tag strings |
| `coverImage` | No | URL of book cover image |

Save the `id` from the response — you need it for importing quotes.

---

## Step 4: Import Quotes to the Book

```
POST /admin/books/:bookId/import-json
Authorization: Bearer <accessToken>
```

### JSON Structure

```json
{
  "data": {
    "chapters": [
      {
        "number": 1,
        "title": "An Animal of No Significance",
        "quotes": [
          {
            "id": 1,
            "quote_en": "History is something that very few people have been doing while everyone else was ploughing fields.",
            "short_description_en": "Most of human history has been made by a tiny minority.",
            "deep_dive_en": "When we read about history, we read about kings and generals. But for every Caesar there were a million farmers who never left their village...",
            "real_world_example_en": "The Egyptian pyramids were built by tens of thousands of workers whose names are lost to history..."
          },
          {
            "id": 2,
            "quote_en": "Large numbers of strangers can cooperate by believing in common myths.",
            "short_description_en": "Shared fictions like money and nations hold society together.",
            "deep_dive_en": "Unlike animals, humans can cooperate in large numbers because we believe in shared stories...",
            "real_world_example_en": "A dollar bill is just paper, yet billions of people accept it as valuable..."
          }
        ]
      },
      {
        "number": 2,
        "title": "The Tree of Knowledge",
        "quotes": [
          {
            "id": 3,
            "quote_en": "The Cognitive Revolution is what made history possible.",
            "short_description_en": "Human imagination changed everything.",
            "deep_dive_en": "About 70,000 years ago, something changed in the minds of Homo sapiens...",
            "real_world_example_en": "Every corporation, religion, and nation exists only in our collective imagination..."
          }
        ]
      }
    ]
  }
}
```

### How Chapters & Quotes Work

- `number: 1` = Chapter 1, `number: 2` = Chapter 2, and so on
- Each chapter has a `title` and an array of `quotes`
- Minimum **1 quote per chapter**, no maximum
- The `id` field is just for ordering within the JSON
- The backend assigns `quoteIndex` sequentially across all chapters:
  - Chapter 1 (10 quotes) → quoteIndex 1–10
  - Chapter 2 (8 quotes) → quoteIndex 11–18
  - Chapter 3 (13 quotes) → quoteIndex 19–31
- **Total quotes across all chapters must be at least 31**

### Quote Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Order number (just for JSON structure) |
| `quote_en` | Yes | The quote text in English |
| `short_description_en` | Yes | Short explanation of the quote |
| `deep_dive_en` | No | Detailed analysis/explanation |
| `real_world_example_en` | No | Practical real-world example |

### Auto-Translation

- Write everything in **English only**
- The API automatically translates to **6 languages**: Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali
- Translation runs in **background** — the API responds immediately
- To override default languages, pass `targetLanguages` in the request:
  ```json
  {
    "targetLanguages": ["hi", "gu"],
    "data": { "chapters": [...] }
  }
  ```

### Check Translation Status

```
GET /books/:bookId
Authorization: Bearer <accessToken>
```

Check the `translationStatus` field:
- `NONE` — No translation requested
- `IN_PROGRESS` — Translation running in background
- `COMPLETED` — All translations done
- `FAILED` — Translation failed (English still available)

---

## Complete Flow (Quick Summary)

```
1. Login as admin        → POST /auth/send-otp + /auth/verify-otp
2. Create category       → POST /admin/categories (or use existing)
3. Create book           → POST /admin/books
4. Import 31+ quotes     → POST /admin/books/:bookId/import-json
5. Check translation     → GET /books/:bookId → translationStatus
```

Done! The book is now available for users to purchase and read.
