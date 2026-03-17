import { Router } from "express";
import Joi from "joi";
import validate from "../middleware/validate.js";
import {
  sendOtpHandler,
  verifyOtpHandler,
  refreshTokenHandler,
} from "../controllers/auth.controller.js";

const router = Router();

const sendOtpSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{6,14}$/)
    .required()
    .messages({ "string.pattern.base": "Invalid phone number format" }),
});

const verifyOtpSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{6,14}$/)
    .required(),
  otp: Joi.string().length(4).required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

router.post("/send-otp", validate(sendOtpSchema), sendOtpHandler);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpHandler);
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  refreshTokenHandler
);

export default router;
