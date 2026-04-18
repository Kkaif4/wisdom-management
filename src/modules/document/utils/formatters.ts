/**
 * Standard utility for formatting currency (INR).
 */
export const formatCurrency = (num: number | string | any): string => {
  const value = typeof num === "number" ? num : Number(num);
  if (isNaN(value)) return "₹ 0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a date to locale-specific string.
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Safe number formatting without scientific notation.
 */
export const formatNumber = (
  num: number | string | any,
  decimals: number = 2,
): string => {
  const value = typeof num === "number" ? num : Number(num);
  if (isNaN(value)) return "0.00";

  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false, // For simple numbers in excel cells
  });
};
