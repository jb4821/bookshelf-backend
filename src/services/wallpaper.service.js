import { createCanvas } from "canvas";
import sharp from "sharp";
import { wrapTextCentered } from "../utils/wrapText.js";

/**
 * Generate a lock screen wallpaper with quote and description.
 *
 * Layout (designed to avoid overlap with lock screen UI):
 * ┌──────────────────────┐
 * │                      │  ← Top 30% — reserved for clock/notifications
 * ├──────────────────────┤
 * │   "Quote text"       │  ← 35-50% — quote zone
 * │   — Book Title       │
 * │                      │
 * │   Description text   │  ← 55-75% — description zone
 * ├──────────────────────┤
 * │                      │  ← Bottom 20% — reserved for system buttons
 * └──────────────────────┘
 */
export const generateWallpaper = async ({
  quote,
  description,
  bookTitle,
  width,
  height,
}) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // ─── Background ────────────────────────────────────
  // Dark gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0a0a0a");
  gradient.addColorStop(0.5, "#1a1a2e");
  gradient.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // ─── Layout calculations ───────────────────────────
  const padding = width * 0.08;
  const maxTextWidth = width - padding * 2;
  const centerX = width / 2;

  // Scale font sizes based on screen width
  const scale = width / 1080;
  const quoteFontSize = Math.round(38 * scale);
  const bookFontSize = Math.round(24 * scale);
  const descFontSize = Math.round(28 * scale);

  // ─── Decorative line above quote ───────────────────
  const quoteStartY = height * 0.33;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - 40 * scale, quoteStartY - 30 * scale);
  ctx.lineTo(centerX + 40 * scale, quoteStartY - 30 * scale);
  ctx.stroke();

  // ─── Quote ─────────────────────────────────────────
  ctx.fillStyle = "#ffffff";
  ctx.font = `italic ${quoteFontSize}px "Georgia", serif`;

  const quoteLine = `"${quote}"`;
  const quoteLineHeight = quoteFontSize * 1.6;
  let currentY = wrapTextCentered(
    ctx,
    quoteLine,
    centerX,
    quoteStartY,
    maxTextWidth,
    quoteLineHeight
  );

  // ─── Book title ────────────────────────────────────
  currentY += 15 * scale;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = `${bookFontSize}px "Arial", sans-serif`;
  const titleText = `— ${bookTitle}`;
  const titleWidth = ctx.measureText(titleText).width;
  ctx.fillText(titleText, centerX - titleWidth / 2, currentY);

  // ─── Decorative line between quote and description ─
  currentY += 35 * scale;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.moveTo(centerX - 30 * scale, currentY);
  ctx.lineTo(centerX + 30 * scale, currentY);
  ctx.stroke();

  // ─── Description ───────────────────────────────────
  currentY += 35 * scale;
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = `${descFontSize}px "Arial", sans-serif`;
  const descLineHeight = descFontSize * 1.5;
  wrapTextCentered(
    ctx,
    description,
    centerX,
    currentY,
    maxTextWidth * 0.9,
    descLineHeight
  );

  // ─── Convert to image buffer ───────────────────────
  const buffer = canvas.toBuffer("image/png");

  return await sharp(buffer).png({ quality: 95 }).toBuffer();
};
