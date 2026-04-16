/**
 * Formats a number as a currency string based on the provided currency code.
 * Defaults to Algerian Dinar (DZD) and fr-DZ locale as the primary market is Algeria.
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = "DZD",
): string => {
  const locale = "fr-DZ";

  try {
    if (currencyCode.toUpperCase() === "DZD") {
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
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
    if (currencyCode.toUpperCase() === "DZD") {
      return `${amount.toFixed(2)} دج`;
    }
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
};
