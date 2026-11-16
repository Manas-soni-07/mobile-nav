/**
 * ResortOS - Formatting Utilities
 */

/**
 * Format raw numbers as USD currency strings
 * e.g., 38650 -> "$38,650"
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '$0';
  return '$' + Math.round(amount).toLocaleString('en-US');
};

/**
 * Format currency with 2 decimal places (for ADR, RevPAR)
 * e.g., 372.5 -> "$372.50"
 */
export const formatCurrencyDetailed = (amount: number): string => {
  if (isNaN(amount)) return '$0.00';
  return (
    '$' +
    amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

/**
 * Format percentages
 * e.g., 65 -> "65%"
 */
export const formatPercentage = (percent: number): string => {
  if (isNaN(percent)) return '0%';
  return `${Math.round(percent)}%`;
};

/**
 * Format compact numbers
 * e.g., 14890 -> "$14.8k"
 */
export const formatCompactCurrency = (amount: number): string => {
  if (isNaN(amount)) return '$0';
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount);
};

/**
 * Format simple date string (YYYY-MM-DD to readable format)
 */
export const formatDate = (dateStr: string): string => {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${day}, ${year}`;
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};
