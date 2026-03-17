import prisma from "../config/db.js";
import AppError from "../utils/appError.js";

export const setActiveBook = async (req, res, next) => {
  try {
    const { purchaseId } = req.body;
    const userId = req.user.userId;

    // Verify purchase belongs to user and is active
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { book: { include: { category: { select: { name: true } } } } },
    });

    if (!purchase || purchase.userId !== userId) {
      throw new AppError("Purchase not found", 404, "NOT_FOUND");
    }

    if (purchase.status !== "ACTIVE") {
      throw new AppError("Purchase is not active", 400, "PURCHASE_NOT_ACTIVE");
    }

    if (new Date(purchase.endDate) < new Date()) {
      throw new AppError("Purchase has expired", 400, "PURCHASE_EXPIRED");
    }

    // Upsert active book (user_id is PK, so only one active book per user)
    const activeBook = await prisma.activeBook.upsert({
      where: { userId },
      update: { purchaseId },
      create: { userId, purchaseId },
      include: {
        purchase: {
          include: {
            book: { include: { category: { select: { name: true } } } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        bookId: activeBook.purchase.bookId,
        title: activeBook.purchase.book.title,
        author: activeBook.purchase.book.author,
        category: activeBook.purchase.book.category.name,
        coverImage: activeBook.purchase.book.coverImage,
        startDate: activeBook.purchase.startDate,
        endDate: activeBook.purchase.endDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveBook = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const activeBook = await prisma.activeBook.findUnique({
      where: { userId },
      include: {
        purchase: {
          include: {
            book: { include: { category: { select: { name: true } } } },
          },
        },
      },
    });

    if (!activeBook) {
      throw new AppError("No active book set", 404, "NO_ACTIVE_BOOK");
    }

    res.json({
      success: true,
      data: {
        bookId: activeBook.purchase.bookId,
        title: activeBook.purchase.book.title,
        author: activeBook.purchase.book.author,
        category: activeBook.purchase.book.category.name,
        coverImage: activeBook.purchase.book.coverImage,
        startDate: activeBook.purchase.startDate,
        endDate: activeBook.purchase.endDate,
        totalQuotes: activeBook.purchase.book.totalQuotes,
      },
    });
  } catch (error) {
    next(error);
  }
};
