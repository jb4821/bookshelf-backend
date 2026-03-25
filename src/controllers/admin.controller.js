import { getJsonFromS3 } from "../services/s3.service.js";
import { importQuotesToBook } from "../services/import.service.js";
import AppError from "../utils/appError.js";

export const importBookJson = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { s3Key, data, targetLanguages } = req.body;

    let jsonData;

    if (data) {
      // Direct JSON upload (useful for dev/testing)
      jsonData = data;
    } else if (s3Key) {
      // Fetch from S3
      jsonData = await getJsonFromS3(s3Key);
    } else {
      throw new AppError(
        "Provide either s3Key or data in request body",
        400,
        "MISSING_INPUT"
      );
    }

    const result = await importQuotesToBook(bookId, jsonData, targetLanguages);

    res.json({
      success: true,
      data: {
        message: result.translating
          ? `Successfully imported ${result.totalQuotes} quotes. Translation in progress — English fallback available immediately.`
          : `Successfully imported ${result.totalQuotes} quotes`,
        totalQuotes: result.totalQuotes,
        translating: result.translating,
      },
    });
  } catch (error) {
    next(error);
  }
};
