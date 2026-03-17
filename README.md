# BookShelf — Daily Book Insights Wallpaper App

A Node.js backend API that delivers daily book insights as lock screen wallpapers. Users purchase books and receive a new wallpaper each day containing a quote and insight from their active book.

## Tech Stack

- **Runtime:** Node.js (v22+)
- **Framework:** Express.js
- **ORM:** Prisma v7
- **Database:** PostgreSQL 16
- **Image Generation:** canvas + sharp
- **Storage:** Amazon S3
- **Auth:** JWT (OTP-based login)
- **API Docs:** Swagger UI

## Getting Started

### Prerequisites

- Node.js v22+
- PostgreSQL 16
- npm

### Installation

```bash
# Clone the repository
git clone git@github.com:jb4821/bookshelf-backend.git
cd bookshelf-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and other config

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and update the values:

| Variable            | Description                    |
| ------------------- | ------------------------------ |
| `PORT`              | Server port (default: 5000)    |
| `DATABASE_URL`      | PostgreSQL connection string   |
| `JWT_ACCESS_SECRET` | Secret for access tokens       |
| `JWT_REFRESH_SECRET`| Secret for refresh tokens      |
| `AWS_REGION`        | AWS region for S3              |
| `S3_BUCKET_NAME`    | S3 bucket name                 |

See `.env.example` for the full list.

## Development Notes

- **Dev OTP:** Use `1234` as OTP for all phone numbers in development mode (`NODE_ENV=development`).
- **S3 is optional:** Wallpaper images are returned directly in the API response when S3 is not configured.

## Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start dev server with nodemon      |
| `npm start`      | Start production server            |

## API Documentation (Swagger)

Once the server is running, open Swagger UI in your browser:

```
http://localhost:5000/api-docs
```

You can view all endpoints, request/response schemas, and test APIs directly from the browser.

## API Endpoints

Base URL: `/api/v1`

| Method | Endpoint                           | Auth     | Description              |
| ------ | ---------------------------------- | -------- | ------------------------ |
| GET    | `/health`                          | Public   | Health check             |
| POST   | `/auth/send-otp`                   | Public   | Send OTP                 |
| POST   | `/auth/verify-otp`                 | Public   | Verify OTP & get tokens  |
| POST   | `/auth/refresh-token`              | Public   | Refresh access token     |
| GET    | `/books`                           | Required | List books               |
| GET    | `/books/:id`                       | Required | Book details             |
| POST   | `/active-book`                     | Required | Set active book          |
| GET    | `/active-book`                     | Required | Get active book          |
| POST   | `/purchase/verify`                 | Required | Verify purchase          |
| GET    | `/purchases`                       | Required | Purchase history         |
| GET    | `/content/today?width=W&height=H`  | Required | Get today's wallpaper    |
| POST   | `/admin/books`                     | Admin    | Create book              |
| POST   | `/admin/books/:bookId/import-json` | Admin    | Import quotes from JSON  |

## Project Structure

```
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Migration files
├── src/
│   ├── app.js                     # Express app setup
│   ├── server.js                  # Entry point
│   ├── config/                    # DB, S3, env config
│   ├── middleware/                # Auth, error handler
│   ├── routes/                    # Route definitions
│   ├── controllers/               # Request handlers
│   ├── services/                  # Business logic
│   ├── utils/                     # Helpers
│   └── jobs/                      # Cron jobs
├── .env.example
├── ARCHITECTURE.md                # Full architecture doc
└── package.json
```

## Documentation

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full system architecture, database design, API details, and implementation phases.

## License

ISC
