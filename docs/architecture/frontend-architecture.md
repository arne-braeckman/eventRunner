# Frontend Architecture

## Component Architecture

### Component Organization
```
src/
  components/
    ui/              # shadcn/ui base components
    forms/           # Form components with react-hook-form
    tables/          # Data table components
    charts/          # Analytics visualization components
    layout/          # Layout and navigation components
    features/        # Feature-specific component groups
      contacts/      # Contact management components
      opportunities/ # CRM pipeline components  
      projects/      # Project management components
      documents/     # Document management components
      payments/      # Payment-related components
```

### Component Template
```typescript
import { type FC } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  // Add specific props
}

export const Component: FC<ComponentProps> = ({ 
  className,
  ...props 
}) => {
  return (
    <div className={cn("default-styles", className)}>
      {/* Component content */}
    </div>
  );
};
```

## State Management Architecture

### State Structure
```typescript
// Global client state with Zustand
interface AppState {
  // UI state
  sidebarOpen: boolean;
  currentProject: string | null;
  notifications: Notification[];
  
  // Actions
  toggleSidebar: () => void;
  setCurrentProject: (projectId: string | null) => void;
  addNotification: (notification: Notification) => void;
}

// Server state managed by tRPC/React Query
// Automatically cached and synchronized
```

### State Management Patterns
- **Server State:** Managed by tRPC with React Query under the hood
- **UI State:** Zustand for lightweight client-side state
- **Form State:** React Hook Form for form management
- **Real-time State:** Convex subscriptions for live updates

## Routing Architecture

### Route Organization (Next.js 14 App Router)
```
src/app/
  (dashboard)/           # Route group for authenticated pages
    contacts/
      page.tsx          # Contact list page
      [id]/
        page.tsx        # Contact detail page
    opportunities/
      page.tsx          # CRM pipeline page
    projects/
      page.tsx          # Project list page
      [id]/
        page.tsx        # Project detail page
        client/
          page.tsx      # Client-facing project portal
    analytics/
      page.tsx          # Analytics dashboard
    settings/
      page.tsx          # Settings page
  api/
    trpc/
      [trpc]/
        route.ts        # tRPC API handler
    auth/
      [...nextauth]/
        route.ts        # NextAuth.js handler
  (auth)/               # Route group for auth pages  
    signin/
      page.tsx          # Sign in page
  layout.tsx            # Root layout
  page.tsx             # Homepage/dashboard
```

### Protected Route Pattern
```typescript
// Middleware-based protection with NextAuth.js
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Additional middleware logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Authorization logic based on route
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN';
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/api/trpc/:path*']
};
```

## Frontend Services Layer

### tRPC Client Setup
```typescript
import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/api/root';

export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers() {
            return {
              // Add auth headers if needed
            };
          },
        }),
      ],
    };
  },
  ssr: false, // Disable SSR for client-side queries
});
```

### Service Example
```typescript
// Contact service using tRPC
export const useContacts = () => {
  const utils = api.useContext();
  
  const contacts = api.contact.getAll.useQuery();
  
  const createContact = api.contact.create.useMutation({
    onSuccess: () => {
      utils.contact.getAll.invalidate();
    },
  });
  
  const updateContact = api.contact.update.useMutation({
    onSuccess: (data) => {
      utils.contact.getById.setData(data.id, data);
      utils.contact.getAll.invalidate();
    },
  });
  
  return {
    contacts: contacts.data ?? [],
    isLoading: contacts.isLoading,
    createContact: createContact.mutate,
    updateContact: updateContact.mutate,
    isCreating: createContact.isLoading,
    isUpdating: updateContact.isLoading,
  };
};
```
