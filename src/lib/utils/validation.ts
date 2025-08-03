import type { Id } from "../../../convex/_generated/dataModel";

/**
 * Validates if a string appears to be a valid Convex ID format
 * Convex IDs are typically alphanumeric strings with specific length/pattern
 */
export function isValidConvexId(id: unknown): id is Id<any> {
  return typeof id === 'string' && 
         id.length > 10 && 
         /^[a-zA-Z0-9]+$/.test(id) &&
         !id.includes('invalid');
}

/**
 * Email validation using a more comprehensive regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation (basic format check)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Should have at least 10 digits
  return digitsOnly.length >= 10;
}