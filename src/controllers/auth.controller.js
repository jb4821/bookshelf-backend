import prisma from "../config/db.js";
import { sendOtp, verifyOtp } from "../services/otp.service.js";
import {
  generateTokens,
  verifyRefreshToken,
} from "../services/token.service.js";
import AppError from "../utils/appError.js";

export const sendOtpHandler = async (req, res, next) => {
  try {
    const { phone } = req.body;

    await sendOtp(phone);

    res.json({
      success: true,
      data: { message: "OTP sent successfully" },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtpHandler = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const isValid = verifyOtp(phone, otp);
    if (!isValid) {
      throw new AppError("Invalid or expired OTP", 400, "INVALID_OTP");
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: { phone },
      });
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: {
        ...tokens,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          preferredLanguage: user.preferredLanguage,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400, "MISSING_TOKEN");
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(
        "Invalid or expired refresh token",
        401,
        "INVALID_REFRESH_TOKEN"
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};
