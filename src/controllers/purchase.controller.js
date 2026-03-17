import prisma from "../config/db.js";
import {
  verifyWithStore,
  parseDuration,
} from "../services/purchase.service.js";
import AppError from "../utils/appError.js";

export const verifyPurchase = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { purchaseToken, productId, platform, bookId } = req.body;

    // Verify book exists
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new AppError("Book not found", 404, "BOOK_NOT_FOUND");
    }

    // Check for duplicate purchase token
    if (purchaseToken) {
      const existing = await prisma.purchase.findFirst({
        where: { purchaseToken },
      });
      if (existing) {
        throw new AppError(
          "Purchase already verified",
          409,
          "DUPLICATE_PURCHASE"
        );
      }
    }

    // Verify with store API
    const verification = await verifyWithStore(
      purchaseToken,
      productId,
      platform
    );
    if (!verification.valid) {
      throw new AppError("Purchase verification failed", 400, "INVALID_PURCHASE");
    }

    // Calculate dates
    const durationDays = parseDuration(productId);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        bookId,
        durationDays,
        purchaseToken,
        platform,
        startDate,
        endDate,
        status: "ACTIVE",
      },
      include: {
        book: { select: { title: true, author: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: purchase.id,
        bookId: purchase.bookId,
        bookTitle: purchase.book.title,
        bookAuthor: purchase.book.author,
        durationDays: purchase.durationDays,
        startDate: purchase.startDate,
        endDate: purchase.endDate,
        status: purchase.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPurchases = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const purchases = await prisma.purchase.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = purchases.map((p) => ({
      id: p.id,
      bookId: p.bookId,
      bookTitle: p.book.title,
      bookAuthor: p.book.author,
      coverImage: p.book.coverImage,
      durationDays: p.durationDays,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
      createdAt: p.createdAt,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
