import prisma from "../config/db.js";
import AppError from "../utils/appError.js";

// ─── User Endpoints ──────────────────────────────────

export const getBooks = async (req, res, next) => {
  try {
    const { search, categoryId } = req.query;
    const userId = req.user.userId;

    // Build dynamic where clause
    const where = { isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
      ];
    }

    const books = await prisma.book.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Get read counts for all books for this user
    const readCounts = await prisma.userQuoteRead.groupBy({
      by: ["bookId"],
      where: { userId },
      _count: { id: true },
    });

    const readMap = Object.fromEntries(
      readCounts.map((r) => [r.bookId, r._count.id])
    );

    const data = books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category.name,
      categoryId: book.categoryId,
      coverImage: book.coverImage,
      price: book.price,
      rating: book.rating,
      tags: book.tags,
      totalQuotes: book.totalQuotes,
      readQuotes: readMap[book.id] || 0,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        contents: {
          select: { chapterNumber: true, chapterTitle: true, quoteIndex: true },
          orderBy: { chapterNumber: "asc" },
        },
      },
    });

    if (!book || !book.isActive) {
      throw new AppError("Book not found", 404, "NOT_FOUND");
    }

    // Get read quotes for this book by this user
    const readQuotes = await prisma.userQuoteRead.findMany({
      where: { userId, bookId: id },
      select: { quoteIndex: true },
    });

    const readSet = new Set(readQuotes.map((r) => r.quoteIndex));

    // Aggregate chapters
    const chapterMap = new Map();
    for (const content of book.contents) {
      const key = content.chapterNumber;
      if (!chapterMap.has(key)) {
        chapterMap.set(key, {
          number: content.chapterNumber,
          title: content.chapterTitle,
          totalQuotes: 0,
          readQuotes: 0,
        });
      }
      const ch = chapterMap.get(key);
      ch.totalQuotes++;
      if (readSet.has(content.quoteIndex)) {
        ch.readQuotes++;
      }
    }

    res.json({
      success: true,
      data: {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        category: book.category.name,
        categoryId: book.categoryId,
        coverImage: book.coverImage,
        price: book.price,
        rating: book.rating,
        totalQuotes: book.totalQuotes,
        readQuotes: readSet.size,
        totalPages: book.totalPages,
        publishedYear: book.publishedYear,
        tags: book.tags,
        translationStatus: book.translationStatus,
        chapters: Array.from(chapterMap.values()),
        createdAt: book.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChapterQuotes = async (req, res, next) => {
  try {
    const { bookId, chapterNumber } = req.params;
    const userId = req.user.userId;

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, title: true, author: true, isActive: true },
    });

    if (!book || !book.isActive) {
      throw new AppError("Book not found", 404, "NOT_FOUND");
    }

    // Get user's preferred language
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLanguage: true },
    });
    const lang = user?.preferredLanguage || "en";

    const contents = await prisma.bookContent.findMany({
      where: { bookId, chapterNumber: parseInt(chapterNumber) },
      orderBy: { quoteIndex: "asc" },
    });

    if (contents.length === 0) {
      throw new AppError("Chapter not found", 404, "NOT_FOUND");
    }

    // Get read status for these quotes
    const readQuotes = await prisma.userQuoteRead.findMany({
      where: {
        userId,
        bookId,
        quoteIndex: { in: contents.map((c) => c.quoteIndex) },
      },
      select: { quoteIndex: true },
    });

    const readSet = new Set(readQuotes.map((r) => r.quoteIndex));

    const quotes = contents.map((c) => ({
      quoteIndex: c.quoteIndex,
      quote: c.quotes[lang] || c.quotes["en"] || "",
      shortDescription: c.descriptions[lang] || c.descriptions["en"] || "",
      isRead: readSet.has(c.quoteIndex),
    }));

    res.json({
      success: true,
      data: {
        bookTitle: book.title,
        author: book.author,
        chapterNumber: parseInt(chapterNumber),
        chapterTitle: contents[0].chapterTitle,
        quotes,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuoteDetail = async (req, res, next) => {
  try {
    const { bookId, quoteIndex } = req.params;
    const userId = req.user.userId;
    const idx = parseInt(quoteIndex);

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, title: true, author: true, isActive: true },
    });

    if (!book || !book.isActive) {
      throw new AppError("Book not found", 404, "NOT_FOUND");
    }

    const content = await prisma.bookContent.findUnique({
      where: { bookId_quoteIndex: { bookId, quoteIndex: idx } },
    });

    if (!content) {
      throw new AppError("Quote not found", 404, "NOT_FOUND");
    }

    // Get user's preferred language
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLanguage: true },
    });
    const lang = user?.preferredLanguage || "en";

    // Auto-mark as read (upsert to avoid duplicates)
    await prisma.userQuoteRead.upsert({
      where: {
        userId_bookId_quoteIndex: { userId, bookId, quoteIndex: idx },
      },
      update: { readAt: new Date() },
      create: { userId, bookId, quoteIndex: idx },
    });

    res.json({
      success: true,
      data: {
        bookTitle: book.title,
        author: book.author,
        chapterNumber: content.chapterNumber,
        chapterTitle: content.chapterTitle,
        quoteIndex: content.quoteIndex,
        quote: content.quotes[lang] || content.quotes["en"] || "",
        shortDescription:
          content.descriptions[lang] || content.descriptions["en"] || "",
        deepDive:
          content.deepDives?.[lang] || content.deepDives?.["en"] || null,
        realWorldExample:
          content.realWorldExamples?.[lang] ||
          content.realWorldExamples?.["en"] ||
          null,
        isRead: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin Endpoints ─────────────────────────────────

export const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      description,
      categoryId,
      coverImage,
      price,
      rating,
      totalPages,
      publishedYear,
      tags,
    } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new AppError("Category not found", 404, "INVALID_CATEGORY");
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        categoryId,
        coverImage,
        price,
        rating,
        totalPages,
        publishedYear,
        tags,
      },
    });

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      description,
      categoryId,
      coverImage,
      price,
      rating,
      totalPages,
      publishedYear,
      tags,
      isActive,
    } = req.body;

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
      data: {
        title,
        author,
        description,
        categoryId,
        coverImage,
        price,
        rating,
        totalPages,
        publishedYear,
        tags,
        isActive,
      },
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
