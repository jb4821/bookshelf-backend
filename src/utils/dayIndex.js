/**
 * Calculate the day index for a purchase.
 * day_index = (today - start_date) + 1
 *
 * If day_index exceeds total quotes, cycle back:
 * day_index = ((day_index - 1) % totalQuotes) + 1
 */
export const calculateDayIndex = (startDate, totalQuotes) => {
  const start = new Date(startDate);
  const today = new Date();

  // Reset time to midnight for accurate day calculation
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = today - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  let dayIndex = diffDays + 1;

  // Cycle if exceeds total quotes
  if (totalQuotes > 0 && dayIndex > totalQuotes) {
    dayIndex = ((dayIndex - 1) % totalQuotes) + 1;
  }

  return Math.max(1, dayIndex);
};
