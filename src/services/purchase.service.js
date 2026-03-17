import AppError from "../utils/appError.js";

/**
 * Verify purchase token with mobile store API.
 * Currently a stub — returns valid for dev mode.
 * TODO: Implement Google Play and Apple App Store verification in production.
 */
export const verifyWithStore = async (purchaseToken, productId, platform) => {
  if (platform === "GOOGLE_PLAY") {
    // TODO: Verify with Google Play Developer API
    // googleapis.com/androidpublisher/v3/applications/{packageName}/purchases/products/{productId}/tokens/{token}
    return { valid: true };
  }

  if (platform === "APP_STORE") {
    // TODO: Verify with Apple App Store Server API
    // api.storekit.itunes.apple.com/inApps/v1/transactions/{transactionId}
    return { valid: true };
  }

  throw new AppError("Invalid platform", 400, "INVALID_PLATFORM");
};

/**
 * Parse productId to extract duration.
 * Format: {book_slug}_{duration}
 * Examples: atomic_habits_monthly → 30, atomic_habits_yearly → 365
 */
export const parseDuration = (productId) => {
  const durationMap = {
    monthly: 30,
    quarterly: 90,
    yearly: 365,
  };

  const parts = productId.split("_");
  const durationKey = parts[parts.length - 1];

  return durationMap[durationKey] || 30;
};
