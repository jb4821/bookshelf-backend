import { Router } from "express";
import auth from "../middleware/auth.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile management
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
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
 *                     name:
 *                       type: string
 *                       nullable: true
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                       nullable: true
 *                     preferredLanguage:
 *                       type: string
 *                       example: en
 *                     notifications:
 *                       type: object
 *                       properties:
 *                         dailyReminder:
 *                           type: boolean
 *                         newBooks:
 *                           type: boolean
 *   put:
 *     summary: Update current user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               preferredLanguage:
 *                 type: string
 *                 example: hi
 *               notifications:
 *                 type: object
 *                 properties:
 *                   dailyReminder:
 *                     type: boolean
 *                   newBooks:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Updated user profile
 */

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

export default router;
