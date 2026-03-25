import prisma from "../config/db.js";
import AppError from "../utils/appError.js";

// ─── User Endpoints ──────────────────────────────────

export const getBooks = async (req, res, next) => {
  try {
    const books = await prisma.book.findMany({
      where: { isActive: true },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const data = books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category.name,
      coverImage: book.coverImage,
      price: book.price,
      totalQuotes: book.totalQuotes,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: { category: { select: { name: true } } },
    });

    if (!book || !book.isActive) {
      throw new AppError("Book not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      data: {
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category.name,
        coverImage: book.coverImage,
        price: book.price,
        totalQuotes: book.totalQuotes,
        translationStatus: book.translationStatus,
        createdAt: book.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin Endpoints ─────────────────────────────────

export const createBook = async (req, res, next) => {
  try {
    const { title, author, categoryId, coverImage, price } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new AppError("Category not found", 404, "INVALID_CATEGORY");
    }

    const book = await prisma.book.create({
      data: { title, author, categoryId, coverImage, price },
    });

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, author, categoryId, coverImage, price, isActive } =
      req.body;

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new AppError("Book not found", 404, "NOT_FOUND");
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new AppError("Category not found", 404, "INVALID_CATEGORY");
      }
    }

    const updated = await prisma.book.update({
      where: { id },
      data: { title, author, categoryId, coverImage, price, isActive },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new AppError("Book not found", 404, "NOT_FOUND");
    }

    await prisma.book.delete({ where: { id } });

    res.json({ success: true, data: { message: "Book deleted" } });
  } catch (error) {
    next(error);
  }
};
