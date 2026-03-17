import AppError from "../utils/appError.js";

const adminAuth = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    throw new AppError("Admin access required", 403, "FORBIDDEN");
  }
  next();
};

export default adminAuth;
