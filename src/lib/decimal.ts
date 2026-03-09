import { Prisma } from "@/prisma/generated";

/**
 * Parses a value into a Prisma.Decimal and rounds it to exactly 2 decimal places.
 * Uses ROUND_HALF_UP logic (standard rounding).
 *
 * @param val - The amount to parse (string or number)
 * @returns A Prisma.Decimal rounded to 2 decimal places
 */
export function parseDecimal(
  val: string | number | Prisma.Decimal,
): Prisma.Decimal {
  if (val === undefined || val === null || val === "") {
    return new Prisma.Decimal(0);
  }

  const decimal = new Prisma.Decimal(val);

  // Round to 2 decimal places
  return decimal.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

/**
 * Formats a Decimal value to a standard currency string (INR).
 * This can be used on the backend for logs or consistent response formatting.
 */
export function formatCurrency(val: Prisma.Decimal | number): string {
  const amount = typeof val === "number" ? val : val.toNumber();
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
