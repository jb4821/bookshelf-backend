import prisma from "../config/db.js";
import AppError from "../utils/appError.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      throw new AppError("Category already exists", 409, "DUPLICATE_CATEGORY");
    }

    const category = await prisma.category.create({ data: { name } });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new AppError("Category not found", 404, "NOT_FOUND");
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new AppError("Category not found", 404, "NOT_FOUND");
    }

    // Check if any books use this category
    const bookCount = await prisma.book.count({
      where: { categoryId: id },
    });
    if (bookCount > 0) {
      throw new AppError(
        "Cannot delete category with existing books",
        400,
        "CATEGORY_IN_USE"
      );
    }

    await prisma.category.delete({ where: { id } });

    res.json({ success: true, data: { message: "Category deleted" } });
  } catch (error) {
    next(error);
  }
};
