-- AlterTable
ALTER TABLE "book_contents" ADD COLUMN     "deep_dives" JSONB,
ADD COLUMN     "real_world_examples" JSONB;

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "description" TEXT,
ADD COLUMN     "published_year" INTEGER,
ADD COLUMN     "rating" DECIMAL(2,1),
ADD COLUMN     "tags" JSONB,
ADD COLUMN     "total_pages" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "name" TEXT,
ADD COLUMN     "notifications" JSONB NOT NULL DEFAULT '{"dailyReminder": true, "newBooks": true}';

-- CreateTable
CREATE TABLE "user_quote_reads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "quote_index" INTEGER NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_quote_reads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_quote_reads_user_id_book_id_quote_index_key" ON "user_quote_reads"("user_id", "book_id", "quote_index");

-- AddForeignKey
ALTER TABLE "user_quote_reads" ADD CONSTRAINT "user_quote_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quote_reads" ADD CONSTRAINT "user_quote_reads_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
