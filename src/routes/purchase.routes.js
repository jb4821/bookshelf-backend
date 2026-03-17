import { Router } from "express";
import Joi from "joi";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  verifyPurchase,
  getPurchases,
} from "../controllers/purchase.controller.js";

const router = Router();

const verifyPurchaseSchema = Joi.object({
  purchaseToken: Joi.string().allow(null, ""),
  productId: Joi.string().required(),
  platform: Joi.string().valid("GOOGLE_PLAY", "APP_STORE").required(),
  bookId: Joi.string().uuid().required(),
});

/**
 * @swagger
 * tags:
 *   name: Purchases
 *   description: Purchase verification and history
 */

/**
 * @swagger
 * /purchase/verify:
 *   post:
 *     summary: Verify a mobile purchase
 *     description: |
 *       Verify a purchase made through Google Play or Apple App Store.
 *       Creates a purchase record if verification succeeds.
 *
 *       **Product ID format:** `{book_slug}_{duration}`
 *       - `atomic_habits_monthly` → 30 days
 *       - `atomic_habits_quarterly` → 90 days
 *       - `atomic_habits_yearly` → 365 days
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, platform, bookId]
 *             properties:
 *               purchaseToken:
 *                 type: string
 *                 description: Token received from mobile store
 *               productId:
 *                 type: string
 *                 example: atomic_habits_monthly
 *               platform:
 *                 type: string
 *                 enum: [GOOGLE_PLAY, APP_STORE]
 *               bookId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Purchase verified and created
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     bookId:
 *                       type: string
 *                       format: uuid
 *                     bookTitle:
 *                       type: string
 *                     bookAuthor:
 *                       type: string
 *                     durationDays:
 *                       type: integer
 *                       example: 30
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                       example: ACTIVE
 *       400:
 *         description: Verification failed or invalid platform
 *       404:
 *         description: Book not found
 *       409:
 *         description: Purchase already verified
 */
router.post("/verify", auth, validate(verifyPurchaseSchema), verifyPurchase);

/**
 * @swagger
 * /purchase:
 *   get:
 *     summary: Get purchase history
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's purchases
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       bookId:
 *                         type: string
 *                         format: uuid
 *                       bookTitle:
 *                         type: string
 *                       bookAuthor:
 *                         type: string
 *                       coverImage:
 *                         type: string
 *                       durationDays:
 *                         type: integer
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                       status:
 *                         type: string
 *                         enum: [ACTIVE, EXPIRED, REFUNDED]
 */
router.get("/", auth, getPurchases);

export default router;
