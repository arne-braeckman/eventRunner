/**
 * Server-side sanitization utilities for Convex
 * These provide basic sanitization without requiring DOM parsing
 */

/**
 * Sanitizes plain text content to prevent XSS
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove HTML tags and escape dangerous characters
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, (match) => {
      switch (match) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        case '&': return '&amp;';
        default: return match;
      }
    })
    .trim();
}

/**
 * Sanitizes user names to prevent XSS and enforce reasonable limits
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Remove HTML tags, escape entities, and limit to reasonable characters
  return name
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .replace(/[^\w\s\-'.]/g, '') // Only allow word characters, spaces, hyphens, apostrophes, periods
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Remove any HTML tags and trim whitespace
  const cleaned = email.replace(/<[^>]*>/g, '').trim();
  
  // Validate email format
  if (!emailRegex.test(cleaned)) {
    return '';
  }

  // Additional length check
  if (cleaned.length > 254) {
    return '';
  }

  return cleaned;
}

/**
 * Sanitizes general metadata content
 */
export function sanitizeMetadata(metadata: any): any {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    // Sanitize string values
    if (typeof value === 'string') {
      sanitized[sanitizeText(key)] = sanitizeText(value);
    }
    // Pass through numbers and booleans
    else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[sanitizeText(key)] = value;
    }
    // Recursively sanitize nested objects
    else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[sanitizeText(key)] = sanitizeMetadata(value);
    }
    // Handle arrays
    else if (Array.isArray(value)) {
      sanitized[sanitizeText(key)] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : 
        typeof item === 'object' ? sanitizeMetadata(item) : item
      );
    }
  }

  return sanitized;
}

/**
 * Sanitizes proposal content with template placeholders
 */
export function sanitizeProposalContent(content: any): any {
  if (!content || typeof content !== 'object') {
    return {};
  }

  if (content.sections && Array.isArray(content.sections)) {
    return {
      ...content,
      sections: content.sections.map((section: any) => ({
        ...section,
        title: sanitizeText(section.title || ''),
        content: sanitizeText(section.content || ''),
        // Preserve other properties but sanitize string values
        ...Object.fromEntries(
          Object.entries(section).filter(([key]) => !['title', 'content'].includes(key))
            .map(([key, value]) => [
              key,
              typeof value === 'string' ? sanitizeText(value) : value
            ])
        )
      }))
    };
  }

  return sanitizeMetadata(content);
}

/**
 * Validates proposal status values
 */
export function validateProposalStatus(status: string): boolean {
  const validStatuses = ['DRAFT', 'SENT', 'VIEWED', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'];
  return validStatuses.includes(status);
}

/**
 * Sanitizes comment content
 */
export function sanitizeCommentContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove HTML tags but allow line breaks
  const sanitized = content
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove other HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .trim();

  // Limit length to prevent abuse
  return sanitized.substring(0, 2000);
}