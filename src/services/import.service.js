import prisma from "../config/db.js";
import AppError from "../utils/appError.js";

/**
 * Flatten chapter-based quotes into sequential book_contents rows.
 *
 * Input JSON format:
 * {
 *   "chapters": [
 *     {
 *       "number": 1,
 *       "title": "Chapter Title",
 *       "quotes": [
 *         {
 *           "id": 1,
 *           "quote_en": "...",
 *           "short_description_en": "...",
 *           "quote_hi": "...",
 *           "short_description_hi": "..."
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * Output: array of { chapterNumber, chapterTitle, quoteIndex, quotes, descriptions }
 */
export const flattenQuotes = (jsonData) => {
  const rows = [];
  let quoteIndex = 1;

  for (const chapter of jsonData.chapters) {
    for (const quote of chapter.quotes) {
      // Extract all language keys dynamically
      const quotes = {};
      const descriptions = {};

      for (const [key, value] of Object.entries(quote)) {
        if (key === "id") continue;

        if (key.startsWith("quote_")) {
          const lang = key.replace("quote_", "");
          quotes[lang] = value;
        } else if (key.startsWith("short_description_")) {
          const lang = key.replace("short_description_", "");
          descriptions[lang] = value;
        }
      }

      rows.push({
        chapterNumber: chapter.number,
        chapterTitle: chapter.title || null,
        quoteIndex,
        quotes,
        descriptions,
      });

      quoteIndex++;
    }
  }

  return rows;
};

/**
 * Import flattened quotes into book_contents table.
 * Deletes existing content for the book before inserting.
 */
export const importQuotesToBook = async (bookId, jsonData) => {
  // Validate book exists
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    throw new AppError("Book not found", 404, "NOT_FOUND");
  }

  // Validate JSON structure
  if (!jsonData.chapters || !Array.isArray(jsonData.chapters)) {
    throw new AppError(
      "Invalid JSON: missing chapters array",
      400,
      "INVALID_JSON"
    );
  }

  // Flatten quotes
  const rows = flattenQuotes(jsonData);

  if (rows.length < 31) {
    throw new AppError(
      `Book must have at least 31 quotes. Found: ${rows.length}`,
      400,
      "INSUFFICIENT_QUOTES"
    );
  }

  // Delete existing content and insert new in a transaction
  await prisma.$transaction(async (tx) => {
    // Remove old content
    await tx.bookContent.deleteMany({ where: { bookId } });

    // Batch insert
    await tx.bookContent.createMany({
      data: rows.map((row) => ({
        bookId,
        chapterNumber: row.chapterNumber,
        chapterTitle: row.chapterTitle,
        quoteIndex: row.quoteIndex,
        quotes: row.quotes,
        descriptions: row.descriptions,
      })),
    });

    // Update total_quotes on the book
    await tx.book.update({
      where: { id: bookId },
      data: { totalQuotes: rows.length },
    });
  });

  return { totalQuotes: rows.length };
};
