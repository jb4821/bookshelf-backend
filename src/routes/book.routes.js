import { Router } from "express";
import auth from "../middleware/auth.js";
import { getBooks, getBookById } from "../controllers/book.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book listing for users
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: List all available books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, getBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get book details
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get("/:id", auth, getBookById);

export default router;
