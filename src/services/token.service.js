import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiry,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiry,
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtAccessSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwtRefreshSecret);
};

export const generateTokens = (user) => {
  const payload = { userId: user.id, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
