/**
 * Draw text with word wrapping on a canvas context.
 * Returns the Y position after the last line (for stacking content below).
 */
export const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
  const words = text.split(" ");
  let line = "";

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, y);
      line = word + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line.trim(), x, y);
  return y + lineHeight;
};

/**
 * Draw text centered horizontally with word wrapping.
 * Returns the Y position after the last line.
 */
export const wrapTextCentered = (ctx, text, centerX, y, maxWidth, lineHeight) => {
  const words = text.split(" ");
  let line = "";

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line !== "") {
      const trimmed = line.trim();
      const lineWidth = ctx.measureText(trimmed).width;
      ctx.fillText(trimmed, centerX - lineWidth / 2, y);
      line = word + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  const trimmed = line.trim();
  const lineWidth = ctx.measureText(trimmed).width;
  ctx.fillText(trimmed, centerX - lineWidth / 2, y);
  return y + lineHeight;
};
