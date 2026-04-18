/**
 * Converts a number to its Indian English word representation.
 * Example: 15500 → "Fifteen Thousand Five Hundred Only"
 */
export function amountToWords(amount: number): string {
  if (amount === 0) return "Zero Only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function twoDigits(n: number): string {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }

  function threeDigits(n: number): string {
    if (n === 0) return "";
    if (n < 100) return twoDigits(n);
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " " + twoDigits(n % 100) : "")
    );
  }

  // Indian numbering: Crore, Lakh, Thousand, Hundred
  const wholeAmount = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - wholeAmount) * 100);

  let result = "";

  const crore = Math.floor(wholeAmount / 10000000);
  const lakh = Math.floor((wholeAmount % 10000000) / 100000);
  const thousand = Math.floor((wholeAmount % 100000) / 1000);
  const remainder = wholeAmount % 1000;

  if (crore > 0) result += twoDigits(crore) + " Crore ";
  if (lakh > 0) result += twoDigits(lakh) + " Lakh ";
  if (thousand > 0) result += twoDigits(thousand) + " Thousand ";
  if (remainder > 0) result += threeDigits(remainder);

  result = result.trim();

  if (paise > 0) {
    result += " and " + twoDigits(paise) + " Paise";
  }

  return (amount < 0 ? "Minus " : "") + result + " Only";
}
