import DOMPurify from 'dompurify';

// Client-side only - DOMPurify requires window object
let purify: typeof DOMPurify | null = null;

if (typeof window !== 'undefined') {
  purify = DOMPurify;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string, options?: any): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const defaultOptions = {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'div', 'span', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u',
      'ul', 'ol', 'li',
      'blockquote',
      'a'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'style'],
    ALLOW_DATA_ATTR: false,
    ...options
  };

  // Fallback sanitization for server-side or when DOMPurify is not available
  if (!purify) {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/<iframe[^>]*>/gi, '')
      .replace(/<object[^>]*>/gi, '')
      .replace(/<embed[^>]*>/gi, '');
  }

  try {
    return String(purify.sanitize(html, defaultOptions));
  } catch (error) {
    console.error('HTML sanitization failed:', error);
    // Fallback to basic sanitization
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }
}

/**
 * Sanitizes plain text content to prevent XSS
 * @param text - The text to sanitize
 * @returns Sanitized text string
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Escape HTML entities
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates and sanitizes email addresses
 * @param email - The email to validate and sanitize
 * @returns Sanitized email or empty string if invalid
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

  return cleaned;
}

/**
 * Sanitizes user names to prevent XSS
 * @param name - The name to sanitize
 * @returns Sanitized name string
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Remove HTML tags, escape entities, and limit to reasonable characters
  return name
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Sanitizes URLs to prevent javascript: and other dangerous protocols
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
  const cleaned = url.trim().toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (cleaned.startsWith(protocol)) {
      return '';
    }
  }

  // Only allow http, https, mailto, and tel protocols
  const allowedProtocolRegex = /^(https?|mailto|tel):/i;
  
  if (url.includes(':') && !allowedProtocolRegex.test(url)) {
    return '';
  }

  return url.trim().substring(0, 2048); // Limit URL length
}

/**
 * Validates and sanitizes proposal template placeholders
 * @param content - Template content with placeholders
 * @param replacements - Object containing replacement values
 * @returns Sanitized content with safe placeholder replacements
 */
export function sanitizeTemplateContent(content: string, replacements: Record<string, string>): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let sanitizedContent = content;

  // Process each replacement with sanitization
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const sanitizedValue = sanitizeText(value || '');
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    sanitizedContent = sanitizedContent.replace(regex, sanitizedValue);
  });

  // Final sanitization of the entire content
  return sanitizeHtml(sanitizedContent, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'iframe'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'style', 'href', 'src']
  });
}