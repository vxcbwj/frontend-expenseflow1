/**
 * Phone validation utility for Algerian phone numbers with international format support.
 * Defaults to Algerian format: +213 followed by 9 digits
 */

export const ALGERIAN_PHONE_PATTERN = /^\+213\d{9}$/;
export const INTERNATIONAL_PHONE_PATTERN = /^\+\d{4,15}$/;
export const PHONE_PLACEHOLDER = "+213 553 97 67 88";
export const PHONE_ERROR_MESSAGE =
  "Please enter a valid phone number. Algerian numbers must start with +213 followed by 9 digits.";

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
export const formatPhoneNumber = (value: string): string => {
  if (!value) return "";

  const digits = value.replace(/\D/g, "");

  // For Algerian numbers starting with 213
  if (digits.startsWith("213") && digits.length === 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
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
  pattern: "\\+213\\d{9}",
});
