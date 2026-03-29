import { Router } from "express";
import auth from "../middleware/auth.js";
import { getTodayContent, getCurrentQuote } from "../controllers/content.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Daily wallpaper content
 */

/**
 * @swagger
 * /content/today:
 *   get:
 *     summary: Get today's wallpaper
 *     description: |
 *       Returns today's wallpaper image based on the user's active book and purchase day.
 *
 *       **How it works:**
 *       1. Finds the user's active book
 *       2. Calculates which quote to show based on days since purchase
 *       3. Generates a wallpaper at the requested screen size
 *       4. Returns the image (PNG) directly or S3 URL if configured
 *
 *       **Lock screen safe zones:**
 *       - Top 30% is kept empty (clock/notifications area)
 *       - Quote is placed in the middle zone (35-55%)
 *       - Description below the quote (55-75%)
 *       - Bottom 20% kept empty (system buttons)
 *
 *       Common screen sizes:
 *       - iPhone 15 Pro: 1179x2556
 *       - iPhone 14: 1170x2532
 *       - Samsung S24: 1080x2340
 *       - Pixel 8: 1080x2400
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: width
 *         schema:
 *           type: integer
 *           default: 1080
 *         description: Screen width in pixels
 *       - in: query
 *         name: height
 *         schema:
 *           type: integer
 *           default: 2340
 *         description: Screen height in pixels
 *     responses:
 *       200:
 *         description: Wallpaper image (PNG) or JSON with S3 URL
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       description: S3 URL of the generated wallpaper
 *                     dayIndex:
 *                       type: integer
 *                       example: 1
 *                     bookTitle:
 *                       type: string
 *                       example: Atomic Habits
 *       400:
 *         description: Purchase not active or expired
 *       404:
 *         description: No active book or no content for today
 */
router.get("/today", auth, getTodayContent);

/**
 * @swagger
 * /content/current:
 *   get:
 *     summary: Get today's quote as JSON data
 *     description: |
 *       Returns today's quote data based on the user's active book.
 *       Returns `null` if the user has no active book.
 *       Unlike `/content/today` which returns a wallpaper image, this returns JSON for the app's reading screen.
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's quote data or null
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   nullable: true
 *                   type: object
 *                   properties:
 *                     bookId:
 *                       type: string
 *                     bookTitle:
 *                       type: string
 *                     author:
 *                       type: string
 *                     coverImage:
 *                       type: string
 *                       nullable: true
 *                     chapterNumber:
 *                       type: integer
 *                     chapterTitle:
 *                       type: string
 *                     quoteIndex:
 *                       type: integer
 *                     dayNumber:
 *                       type: integer
 *                     totalQuotes:
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
 */
router.get("/current", auth, getCurrentQuote);

export default router;
