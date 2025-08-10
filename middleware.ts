import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default clerkMiddleware((auth, req: NextRequest) => {
  // Get the response from Clerk middleware
  const response = NextResponse.next();

  // Add security headers
  response.headers.set(
    'Content-Security-Policy',
    [
      // Only allow scripts from same origin and specific trusted domains
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://clerk.com https://*.clerk.accounts.dev",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: http:",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      // Connect to Convex and Clerk services
      "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://clerk.com https://*.clerk.accounts.dev https://*.clerk.com",
    ].join('; ')
  );

  // Add X-Frame-Options to prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Add X-Content-Type-Options to prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Add Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add X-XSS-Protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Add additional security for client portal routes
  if (req.nextUrl.pathname.startsWith('/portal/')) {
    // More restrictive CSP for client portal
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval'", // Remove unsafe-inline for portal
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data:",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud",
      ].join('; ')
    );

    // Add cache control for client portal (prevent caching sensitive data)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
