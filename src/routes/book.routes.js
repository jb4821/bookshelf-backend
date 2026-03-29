import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  getBooks,
  getBookById,
  getChapterQuotes,
  getQuoteDetail,
} from "../controllers/book.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book listing and details for users
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: List all available books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by book title or author (case-insensitive)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       author:
 *                         type: string
 *                       category:
 *                         type: string
 *                       categoryId:
 *                         type: string
 *                       coverImage:
 *                         type: string
 *                       price:
 *                         type: string
 *                       rating:
 *                         type: string
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                       totalQuotes:
 *                         type: integer
 *                       readQuotes:
 *                         type: integer
 */
router.get("/", auth, getBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get book details with chapters and reading progress
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book details with chapters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                     description:
 *                       type: string
 *                     category:
 *                       type: string
 *                     categoryId:
 *                       type: string
 *                     coverImage:
 *                       type: string
 *                     price:
 *                       type: string
 *                     rating:
 *                       type: string
 *                     totalQuotes:
 *                       type: integer
 *                     readQuotes:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     publishedYear:
 *                       type: integer
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     translationStatus:
 *                       type: string
 *                       enum: [NONE, IN_PROGRESS, COMPLETED, FAILED]
 *                     chapters:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           number:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           totalQuotes:
 *                             type: integer
 *                           readQuotes:
 *                             type: integer
 *       404:
 *         description: Book not found
 */
router.get("/:id", auth, getBookById);

/**
 * @swagger
 * /books/{bookId}/chapters/{chapterNumber}/quotes:
 *   get:
 *     summary: List all quotes in a chapter
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: chapterNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chapter quotes list with read status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookTitle:
 *                       type: string
 *                     author:
 *                       type: string
 *                     chapterNumber:
 *                       type: integer
 *                     chapterTitle:
 *                       type: string
 *                     quotes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           quoteIndex:
 *                             type: integer
 *                           quote:
 *                             type: string
 *                           shortDescription:
 *                             type: string
 *                           isRead:
 *                             type: boolean
 *       404:
 *         description: Book or chapter not found
 */
router.get("/:bookId/chapters/:chapterNumber/quotes", auth, getChapterQuotes);

/**
 * @swagger
 * /books/{bookId}/quotes/{quoteIndex}:
 *   get:
 *     summary: Get full quote detail (auto-marks as read)
 *     description: Returns the full quote with deep dive and real world example. Automatically marks the quote as read for the current user.
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: quoteIndex
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Full quote detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookTitle:
 *                       type: string
 *                     author:
 *                       type: string
 *                     chapterNumber:
 *                       type: integer
 *                     chapterTitle:
 *                       type: string
 *                     quoteIndex:
 *                       type: integer
 *                     quote:
 *                       type: string
 *                     shortDescription:
 *                       type: string
 *                     deepDive:
 *                       type: string
 *                       nullable: true
 *                     realWorldExample:
 *                       type: string
 *                       nullable: true
 *                     isRead:
 *                       type: boolean
 *       404:
 *         description: Book or quote not found
 */
router.get("/:bookId/quotes/:quoteIndex", auth, getQuoteDetail);

export default router;
