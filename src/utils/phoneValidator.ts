/**
 * Phone validation utility for Algerian phone numbers with international format support.
 * Defaults to Algerian format: +213 followed by 9 digits
 */

export const ALGERIAN_MOBILE_LOCAL = /^0[5-7]\d{8}$/;
export const ALGERIAN_LANDLINE_LOCAL = /^0[2-4]\d{7}$/;
export const ALGERIAN_PHONE_PATTERN = /^\+213(?:[5-7]\d{8}|[2-4]\d{7})$/;
export const INTERNATIONAL_PHONE_PATTERN = /^\+\d{4,15}$/;
export const PHONE_PLACEHOLDER = "+213 661 00 00 00";
export const PHONE_ERROR_MESSAGE =
  "Please enter a valid Algerian phone number. Mobile numbers use +2135 / +2136 / +2137 and landlines use +2132x–+2134x.";

/**
 * Validates a phone number string
 * @param value - Phone number to validate (can be empty for optional fields)
 * @returns true if valid or empty, false if invalid
 */
export const isValidPhoneNumber = (value: string): boolean => {
  // Allow empty values for optional phone fields
  if (!value) return true;

  const normalized = value.replace(/\s+/g, "");

  // Check for Algerian format first (primary)
  if (ALGERIAN_PHONE_PATTERN.test(normalized)) return true;

  // Allow other international formats as fallback
  return INTERNATIONAL_PHONE_PATTERN.test(normalized);
};

/**
 * Format a phone number for display
 * @param value - Raw phone number string
 * @returns Formatted phone number
 */
const formatAlgerianDigits = (digits: string): string => {
  const national = digits.slice(3);
  if (national.length === 9) {
    return `+213 ${national.slice(0, 3)} ${national.slice(3, 5)} ${national.slice(5, 7)} ${national.slice(7)}`;
  }

  if (national.length === 8) {
    return `+213 ${national.slice(0, 2)} ${national.slice(2, 4)} ${national.slice(4, 6)} ${national.slice(6)}`;
  }

  return `+213 ${national}`;
};

export const formatPhoneNumber = (value: string): string => {
  if (!value) return "";

  const digits = value.replace(/\D/g, "");

  // Normalize local Algerian numbers: mobile (10 digits) and landline (9 digits)
  if (digits.startsWith("0") && (digits.length === 10 || digits.length === 9)) {
    return formatAlgerianDigits(`213${digits.slice(1)}`);
  }

  // Normalize international Algerian numbers like 00213661000000 -> +213 661 00 00 00
  if (
    digits.startsWith("00213") &&
    (digits.length === 13 || digits.length === 14)
  ) {
    return formatAlgerianDigits(digits.slice(2));
  }

  // For Algerian numbers starting with 213
  if (
    digits.startsWith("213") &&
    (digits.length === 11 || digits.length === 12)
  ) {
    return formatAlgerianDigits(digits);
  }

  // Fallback: return as-is
  return value;
};

/**
 * Get phone input attributes for consistent form fields
 * @returns Object with type, placeholder, and pattern attributes
 */
export const getPhoneInputProps = () => ({
  type: "tel",
  placeholder: PHONE_PLACEHOLDER,
  pattern: "\\+213\\d{8,9}",
});
