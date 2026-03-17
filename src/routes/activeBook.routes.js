import { Router } from "express";
import Joi from "joi";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  setActiveBook,
  getActiveBook,
} from "../controllers/activeBook.controller.js";

const router = Router();

const setActiveBookSchema = Joi.object({
  purchaseId: Joi.string().uuid().required(),
});

/**
 * @swagger
 * tags:
 *   name: Active Book
 *   description: Manage user's currently active book
 */

/**
 * @swagger
 * /active-book:
 *   post:
 *     summary: Set active book
 *     description: Set which purchased book the user wants to receive daily wallpapers from.
 *     tags: [Active Book]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [purchaseId]
 *             properties:
 *               purchaseId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of an active purchase
 *     responses:
 *       200:
 *         description: Active book set successfully
 *         content:
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
 *                     bookId:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                     category:
 *                       type: string
 *                     coverImage:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *       400:
 *         description: Purchase not active or expired
 *       404:
 *         description: Purchase not found
 */
router.post("/", auth, validate(setActiveBookSchema), setActiveBook);

/**
 * @swagger
 * /active-book:
 *   get:
 *     summary: Get current active book
 *     tags: [Active Book]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active book details
 *         content:
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
 *                     bookId:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                     category:
 *                       type: string
 *                     coverImage:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     totalQuotes:
 *                       type: integer
 *       404:
 *         description: No active book set
 */
router.get("/", auth, getActiveBook);

export default router;
