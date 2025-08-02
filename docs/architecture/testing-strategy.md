# Testing Strategy

## Testing Pyramid

```
                E2E Tests (Playwright)
               /                    \
          Integration Tests (tRPC)
         /                          \
    Frontend Unit Tests         Backend Unit Tests
    (Vitest + RTL)             (Vitest + Convex)
```

## Test Organization

### Frontend Tests
```
tests/
├── components/           # Component unit tests
│   ├── contacts/
│   ├── opportunities/
│   └── projects/
├── pages/               # Page integration tests
│   ├── contacts/
│   └── opportunities/
├── hooks/               # Custom hook tests
└── utils/               # Utility function tests
```

### Backend Tests
```
tests/
├── api/                 # tRPC procedure tests
│   ├── contact.test.ts
│   ├── opportunity.test.ts
│   └── project.test.ts
├── services/            # Business logic tests
└── utils/               # Server utility tests
```

### E2E Tests
```
e2e/
├── auth.spec.ts         # Authentication flows
├── contacts.spec.ts     # Contact management
├── crm.spec.ts         # Sales pipeline
├── projects.spec.ts     # Project collaboration
└── payments.spec.ts     # Payment processing
```

## Test Examples

### Frontend Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { ContactCard } from '@/components/features/contacts/ContactCard';

describe('ContactCard', () => {
  it('displays contact information correctly', () => {
    const contact = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      leadHeat: 75,
      status: 'LEAD' as const,
    };

    render(<ContactCard contact={contact} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
  });
});
```

### Backend tRPC Test
```typescript
import { describe, it, expect } from 'vitest';
import { createTRPCMsw } from 'msw-trpc';
import { appRouter } from '@/server/api/root';

describe('contact router', () => {
  it('creates contact successfully', async () => {
    const caller = appRouter.createCaller({
      session: mockSession,
      db: mockDb,
    });

    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      leadSource: 'WEBSITE' as const,
    };

    const result = await caller.contact.create(input);

    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
  });
});
```

### E2E Test
```typescript
import { test, expect } from '@playwright/test';

test('complete sales pipeline flow', async ({ page }) => {
  // Login
  await page.goto('/signin');
  await page.click('[data-testid="google-signin"]');
  
  // Create contact
  await page.goto('/contacts');
  await page.click('[data-testid="add-contact"]');
  await page.fill('[name="name"]', 'Test Client');
  await page.fill('[name="email"]', 'client@example.com');
  await page.click('[data-testid="save-contact"]');
  
  // Create opportunity
  await page.click('[data-testid="create-opportunity"]');
  await page.fill('[name="name"]', 'Wedding Event');
  await page.fill('[name="value"]', '5000');
  await page.click('[data-testid="save-opportunity"]');
  
  // Move through pipeline
  await page.goto('/opportunities');
  await page.dragAndDrop('[data-testid="opportunity-card"]', '[data-testid="qualified-column"]');
  
  await expect(page.locator('[data-testid="opportunity-card"]')).toBeInViewport();
});
```
