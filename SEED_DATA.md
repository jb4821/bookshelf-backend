# BookShelf — Seed Data Reference

> Use this guide to test the API with pre-seeded users, books, and purchases.
>
> **Base URL:** `https://bookshelf-backend-8ury.onrender.com/api/v1`
> **Swagger:** `https://bookshelf-backend-8ury.onrender.com/api-docs`
> **OTP for all users:** `1234`

---

## Users

| Role  | Phone          | Email                   | Language | Active Book          | Purchase Status |
|-------|----------------|-------------------------|----------|----------------------|-----------------|
| Admin | +910000000000  | admin@bookshelf.com     | English  | —                    | —               |
| User  | +911111111111  | rahul@example.com       | English  | Atomic Habits        | Active (31-day) |
| User  | +912222222222  | priya@example.com       | Hindi    | Deep Work            | Active (90-day) |
| User  | +913333333333  | amit@example.com        | English  | The Power of Now     | Active (31-day) |
| User  | +914444444444  | sneha@example.com       | Hindi    | Atomic Habits        | Active (90-day) |
| User  | +915555555555  | vikram@example.com      | English  | Think and Grow Rich  | Active (31-day) |
| User  | +916666666666  | neha@example.com        | Hindi    | Rich Dad Poor Dad    | Active (90-day) |
| User  | +917777777777  | arjun@example.com       | English  | Deep Work            | Active (31-day) |
| User  | +918888888888  | kavya@example.com       | Hindi    | The Power of Now     | Active (31-day) |

---

## Books

| Book                  | Author           | Category    | Price  | Quotes | Status |
|-----------------------|------------------|-------------|--------|--------|--------|
| Atomic Habits         | James Clear      | Self Help   | ₹299   | 31     | Active |
| Deep Work             | Cal Newport      | Productivity| ₹249   | 31     | Active |
| The Power of Now      | Eckhart Tolle    | Mindfulness | ₹199   | 31     | Active |
| Think and Grow Rich   | Napoleon Hill    | Business    | ₹179   | 31     | Active |
| Rich Dad Poor Dad     | Robert Kiyosaki  | Finance     | ₹219   | 31     | Active |

> **Note:** Atomic Habits and Deep Work have full 31 quotes seeded (EN + HI).
> Other books have placeholder content — quotes need to be imported via admin API.

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

## How to Login (for testing)

```
POST /api/v1/auth/send-otp
{ "phone": "+911111111111" }

POST /api/v1/auth/verify-otp
{ "phone": "+911111111111", "otp": "1234" }
```

Returns `accessToken` and `refreshToken`. Use `accessToken` as Bearer token for all protected endpoints.

---

## Useful Test Scenarios

| Scenario | Use this user |
|----------|---------------|
| English user with active book | Rahul (`+911111111111`) |
| Hindi user with active book | Priya (`+912222222222`) |
| User with expired + active purchase history | Arjun (`+917777777777`) or Sneha (`+914444444444`) |
| 90-day subscription | Priya, Sneha, or Neha |
| Admin access | `+910000000000` |
| Get today's wallpaper | Any user with active book |

---

## Get Today's Wallpaper

```
GET /api/v1/content/today?width=1080&height=2340
Authorization: Bearer <accessToken>
```

Returns a PNG image sized for the device screen.

---

## Admin Login

```
Phone : +910000000000
OTP   : 1234
```

Admin can:
- Create/update categories and books
- Import quotes from JSON
- Access all admin endpoints under `/api/v1/admin/`
