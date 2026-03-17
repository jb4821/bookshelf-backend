import { verifyAccessToken } from "../services/token.service.js";
import AppError from "../utils/appError.js";

const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Access token is required", 401, "UNAUTHORIZED");
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    throw new AppError("Invalid or expired access token", 401, "TOKEN_EXPIRED");
  }
};

export default auth;
