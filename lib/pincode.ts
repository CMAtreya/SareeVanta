/**
 * Indian Postal PIN Code Sanitizer and Validator
 * Strictly enforces:
 * 1. Maximum length: 6 digits
 * 2. Minimum length: 6 digits for final validation
 * 3. Allowed characters: digits 0–9 only
 * 4. First digit: 1–9, not 0
 * 5. Spaces: disallowed / stripped
 * 6. Letters & Special characters: disallowed / stripped
 * 7. Paste: sanitize non-digits and leading zeros
 * 8. Typing validation: capped at 6 digits
 * 9. Final validation: exact 6-digit regex /^[1-9][0-9]{5}$/
 */

export function sanitizePincode(input: string): string {
  if (!input) return '';

  // 1. Remove all non-digit characters (spaces, letters, symbols)
  let clean = input.replace(/\D/g, '');

  // 2. Strip any leading zeros (first digit cannot be 0)
  clean = clean.replace(/^0+/, '');

  // 3. Limit to maximum 6 digits
  return clean.slice(0, 6);
}

export function validatePincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode);
}
