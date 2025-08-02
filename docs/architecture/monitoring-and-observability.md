# Monitoring and Observability

## Monitoring Stack
- **Frontend Monitoring:** Vercel Analytics + Sentry for error tracking
- **Backend Monitoring:** Vercel Functions insights + custom logging
- **Database Monitoring:** Supabase built-in monitoring + query performance tracking
- **Performance Monitoring:** Core Web Vitals via Vercel, custom metrics via Axiom

## Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- JavaScript bundle size and load times
- API response times from client perspective
- User interaction success rates
- Real-time connection stability

**Backend Metrics:**
- tRPC procedure response times
- Database query performance
- Error rates by procedure
- Authentication success/failure rates
- File upload success rates
- External API integration health

**Business Metrics:**
- Contact conversion rates through pipeline
- Project completion rates
- Payment processing success rates
- User engagement with collaboration features
- System uptime and availability

## Logging Strategy
```typescript
// Structured logging with Axiom
import { Logger } from 'axiom-js';

const logger = new Logger({
  token: process.env.AXIOM_TOKEN,
  orgId: process.env.AXIOM_ORG_ID,
});

export const logContactCreated = (contact: Contact, userId: string) => {
  logger.info('Contact created', {
    contactId: contact.id,
    userId,
    leadSource: contact.leadSource,
    timestamp: new Date().toISOString(),
    metadata: {
      venueId: contact.venueId,
      hasPhone: !!contact.phone,
    },
  });
};

export const logError = (error: Error, context: Record<string, any>) => {
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });
};
```

---
