# Frontend Architecture

## Component Architecture

### Component Organization
```
src/
  components/
    ui/              # shadcn/ui base components
    auth/            # Clerk authentication components (SignInButton, SignOutButton, AuthStatus)
    forms/           # Form components with react-hook-form
    tables/          # Data table components
    charts/          # Analytics visualization components
    layout/          # Layout and navigation components
    providers/       # React context providers (Clerk, Convex, tRPC)
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

### Route Organization (Next.js 15 App Router)
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
  (auth)/               # Route group for auth pages (handled by Clerk)  
  layout.tsx            # Root layout with ClerkProvider
  page.tsx             # Homepage/dashboard
```

### Protected Route Pattern with Clerk
```typescript
// middleware.ts - Clerk-based route protection
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/api/trpc(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Clerk Authentication Components
```typescript
// components/auth/AuthStatus.tsx - Authentication status component
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

export function AuthStatus() {
  const { isLoaded, isSignedIn, user } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser, isSignedIn ? {} : "skip");

  if (!isLoaded) return <div>Loading...</div>;

  if (!isSignedIn) {
    return (
      <div className="flex gap-4">
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span>Welcome, {user?.fullName || user?.emailAddresses[0]?.emailAddress}!</span>
      {user?.imageUrl && (
        <img src={user.imageUrl} alt="Profile" className="w-8 h-8 rounded-full" />
      )}
      <SignOutButton />
    </div>
  );
}
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
