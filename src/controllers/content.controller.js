import prisma from "../config/db.js";
import { calculateDayIndex } from "../utils/dayIndex.js";
import { generateWallpaper } from "../services/wallpaper.service.js";
import { uploadToS3, existsInS3, getS3Url } from "../services/s3.service.js";
import AppError from "../utils/appError.js";
import env from "../config/env.js";

// In-memory lock to prevent duplicate generation
const generationLocks = new Map();

export const getTodayContent = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const width = parseInt(req.query.width) || 1080;
    const height = parseInt(req.query.height) || 2340;

    // 1. Get user's active book
    const activeBook = await prisma.activeBook.findUnique({
      where: { userId },
      include: {
        purchase: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!activeBook) {
      throw new AppError("No active book set", 404, "NO_ACTIVE_BOOK");
    }

    const { purchase } = activeBook;

    // 2. Check purchase is still active
    if (purchase.status !== "ACTIVE") {
      throw new AppError("Purchase is not active", 400, "PURCHASE_NOT_ACTIVE");
    }

    if (new Date(purchase.endDate) < new Date()) {
      throw new AppError("Purchase has expired", 400, "PURCHASE_EXPIRED");
    }

    // 3. Calculate day index
    const book = purchase.book;
    const dayIndex = calculateDayIndex(purchase.startDate, book.totalQuotes);

    // 4. Get user's preferred language
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLanguage: true },
    });
    const lang = user?.preferredLanguage || "en";

    // 5. Build S3 key
    const s3Key = `generated/${book.id}_${dayIndex}_${lang}_${width}_${height}.png`;

    // 6. Check S3 cache (skip if S3 not configured)
    const s3Configured = env.awsAccessKeyId && env.awsAccessKeyId !== "your-key";

    if (s3Configured) {
      const exists = await existsInS3(s3Key);
      if (exists) {
        return res.json({
          success: true,
          data: {
            imageUrl: getS3Url(s3Key),
            dayIndex,
            bookTitle: book.title,
          },
        });
      }
    }

    // 7. Prevent race condition with in-memory lock
    if (generationLocks.has(s3Key)) {
      const imageBuffer = await generationLocks.get(s3Key);
      res.set("Content-Type", "image/png");
      return res.send(imageBuffer);
    }

    // 8. Fetch quote for today
    const content = await prisma.bookContent.findFirst({
      where: { bookId: book.id, quoteIndex: dayIndex },
    });

    if (!content) {
      throw new AppError("No content found for today", 404, "NO_CONTENT");
    }

    // 9. Get text in user's language (fallback to English)
    const quote = content.quotes[lang] || content.quotes["en"] || "";
    const description =
      content.descriptions[lang] || content.descriptions["en"] || "";

    // 10. Generate wallpaper
    const generatePromise = generateWallpaper({
      quote,
      description,
      bookTitle: book.title,
      width,
      height,
    });

    generationLocks.set(s3Key, generatePromise);

    let imageBuffer;
    try {
      imageBuffer = await generatePromise;
    } finally {
      generationLocks.delete(s3Key);
    }

    // 11. Upload to S3 (if configured)
    if (s3Configured) {
      const imageUrl = await uploadToS3(s3Key, imageBuffer, "image/png");
      return res.json({
        success: true,
        data: {
          imageUrl,
          dayIndex,
          bookTitle: book.title,
        },
      });
    }

    // 12. If S3 not configured, return image directly
    res.set("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (error) {
    next(error);
  }
};
