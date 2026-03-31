/**
 * Formats a number with leading zeros and adds dashes every 3 digits
 * @param number - The number to format
 * @param digitCount - The total number of digits the formatted string should have
 * @returns Formatted string with leading zeros and dashes
 *
 * Example: formatNumberWithDashes(999, 9) returns "000-000-999"
 */
export function formatNumberWithDashes(
  number: number,
  digitCount: number,
): string {
  // Convert number to string and pad with leading zeros
  const paddedNumber = number.toString().padStart(digitCount, '0');

  // Add dashes every 3 digits from right to left
  const result = [];
  for (let i = paddedNumber.length; i > 0; i -= 3) {
    const start = Math.max(0, i - 3);
    result.unshift(paddedNumber.slice(start, i));
  }

  return result.join('-');
}
