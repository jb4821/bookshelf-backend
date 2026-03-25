-- CreateEnum
CREATE TYPE "TranslationStatus" AS ENUM ('NONE', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "translation_status" "TranslationStatus" NOT NULL DEFAULT 'NONE';
