/**
 * Formats a number as a currency string based on the provided currency code.
 * Defaults to Algerian Dinar (DZD) and fr-DZ locale as the primary market is Algeria.
 */
import { DEFAULT_CURRENCY_CODE } from "./constants";

export const formatCurrency = (
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
): string => {
  const locale = "fr-DZ";

  try {
    if (currencyCode.toUpperCase() === DEFAULT_CURRENCY_CODE) {
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.round(amount));
      return `${formatted} دج`;
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (err) {
    // Fallback if the browser doesn't cleanly support the currency token
    if (currencyCode.toUpperCase() === DEFAULT_CURRENCY_CODE) {
      return `${Math.round(amount)} دج`;
    }
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
};
