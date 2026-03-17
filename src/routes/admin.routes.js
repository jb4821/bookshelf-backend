import { Router } from "express";
import Joi from "joi";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import validate from "../middleware/validate.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import {
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/book.controller.js";

const router = Router();

// All admin routes require auth + admin role
router.use(auth, adminAuth);

// ─── Validation Schemas ──────────────────────────────

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
});

const createBookSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  author: Joi.string().max(255).allow(null, ""),
  categoryId: Joi.string().uuid().required(),
  coverImage: Joi.string().uri().allow(null, ""),
  price: Joi.number().min(0).required(),
});

const updateBookSchema = Joi.object({
  title: Joi.string().min(1).max(255),
  author: Joi.string().max(255).allow(null, ""),
  categoryId: Joi.string().uuid(),
  coverImage: Joi.string().uri().allow(null, ""),
  price: Joi.number().min(0),
  isActive: Joi.boolean(),
}).min(1);

// ─── Category Routes ─────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin endpoints (requires ADMIN role)
 */

/**
 * @swagger
 * /admin/categories:
 *   post:
 *     summary: Create a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Self Help
 *     responses:
 *       201:
 *         description: Category created
 *       409:
 *         description: Category already exists
 */
router.post("/categories", validate(categorySchema), createCategory);

/**
 * @swagger
 * /admin/categories:
 *   get:
 *     summary: List all categories
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/categories", getCategories);

/**
 * @swagger
 * /admin/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 */
router.put("/categories/:id", validate(categorySchema), updateCategory);

/**
 * @swagger
 * /admin/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category deleted
 *       400:
 *         description: Category has books, cannot delete
 *       404:
 *         description: Category not found
 */
router.delete("/categories/:id", deleteCategory);

// ─── Book Routes ─────────────────────────────────────

/**
 * @swagger
 * /admin/books:
 *   post:
 *     summary: Create a book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, categoryId, price]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Atomic Habits
 *               author:
 *                 type: string
 *                 example: James Clear
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               coverImage:
 *                 type: string
 *                 format: uri
 *               price:
 *                 type: number
 *                 example: 99
 *     responses:
 *       201:
 *         description: Book created
 *       404:
 *         description: Category not found
 */
router.post("/books", validate(createBookSchema), createBook);

/**
 * @swagger
 * /admin/books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               coverImage:
 *                 type: string
 *                 format: uri
 *               price:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Book updated
 *       404:
 *         description: Book or category not found
 */
router.put("/books/:id", validate(updateBookSchema), updateBook);

/**
 * @swagger
 * /admin/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Book deleted
 *       404:
 *         description: Book not found
 */
router.delete("/books/:id", deleteBook);

export default router;
