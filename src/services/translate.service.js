import translate from "google-translate-api-x";

const DEFAULT_TARGET_LANGUAGES = ["hi", "gu", "mr", "ta", "te", "bn"];

/**
 * Translate a single text string to a target language.
 * Returns the original text if translation fails.
 */
const translateText = async (text, targetLang) => {
  try {
    const result = await translate(text, { to: targetLang });
    return result.text;
  } catch (error) {
    console.warn(
      `Translation failed for "${text.substring(0, 30)}..." to ${targetLang}:`,
      error.message
    );
    return null;
  }
};

/**
 * Small delay to avoid rate limiting.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Translate all quotes and descriptions in a flattened rows array.
 * Only translates missing languages — if a language already exists, it's kept.
 *
 * @param {Array} rows - Flattened quote rows from flattenQuotes()
 * @param {string[]} targetLanguages - Language codes to translate into
 * @returns {Array} rows with translated quotes/descriptions added
 */
export const translateQuotes = async (
  rows,
  targetLanguages = DEFAULT_TARGET_LANGUAGES
) => {
  console.log(
    `Translating ${rows.length} quotes to ${targetLanguages.length} languages: [${targetLanguages.join(", ")}]`
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    for (const lang of targetLanguages) {
      // Skip if this language already has content
      if (row.quotes[lang]) continue;

      // Translate quote
      const englishQuote = row.quotes.en;
      if (englishQuote) {
        const translated = await translateText(englishQuote, lang);
        if (translated) row.quotes[lang] = translated;
      }

      // Translate description
      const englishDesc = row.descriptions.en;
      if (englishDesc && !row.descriptions[lang]) {
        const translated = await translateText(englishDesc, lang);
        if (translated) row.descriptions[lang] = translated;
      }

      // Small delay between translations to avoid rate limiting
      await delay(100);
    }

    // Log progress every 10 quotes
    if ((i + 1) % 10 === 0 || i === rows.length - 1) {
      console.log(`  Translated ${i + 1}/${rows.length} quotes`);
    }
  }

  console.log("Translation complete!");
  return rows;
};

export { DEFAULT_TARGET_LANGUAGES };
