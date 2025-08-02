# eventRunner Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for **eventRunner**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach uses the **T3 Stack** methodology, combining Next.js, TypeScript, tRPC, Prisma, Tailwind CSS, and NextAuth.js to create a modern, type-safe, and developer-friendly fullstack application optimized for event venue businesses.

### Starter Template or Existing Project

**Decision:** Greenfield project using Create T3 App as the foundation
- **Template:** [Create T3 App](https://create.t3.gg/) with all options enabled
- **Rationale:** T3 Stack provides excellent type safety, developer experience, and rapid development capabilities perfect for the complex CRM and project management features required by eventRunner

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-01 | 1.0 | Initial T3 Stack architecture document | Winston (AI Architect) |

## High Level Architecture

### Technical Summary

The **eventRunner** application will be built as a **monolithic T3 Stack application** deployed on **Vercel**. The system consists of a **Next.js fullstack application** with integrated API routes using **tRPC** for type-safe client-server communication, **Prisma** for database management with **PostgreSQL**, and **NextAuth.js** for authentication. This architecture is designed to support eventRunner's core mission of providing an all-in-one web application for event venue businesses, enabling efficient customer journey management, streamlined workflows, seamless collaboration, and timely revenue realization through a unified, type-safe development experience.

### Platform and Infrastructure Choice

**Platform:** Vercel (primary) with fallback to Azure
**Key Services:** 
- **Vercel**: Hosting, edge functions, static assets, CI/CD
- **Supabase**: PostgreSQL database, authentication provider, real-time subscriptions
- **Cloudinary**: File storage and image optimization
- **Resend**: Email delivery service
- **Stripe**: Payment processing

**Deployment Host and Regions:** Vercel edge network with European regions prioritized for Belgian user base compliance with GDPR data residency requirements.

### Repository Structure

**Structure:** Monorepo (T3 Stack approach)
**Monorepo Tool:** Built-in Next.js workspace capabilities
**Package Organization:** Single repository containing:
- `/src/app` - Next.js 14 App Router pages and layouts
- `/src/components` - Reusable UI components with shadcn/ui
- `/src/server` - tRPC routers and server-side logic
- `/src/lib` - Shared utilities and configurations
- `/prisma` - Database schema and migrations

### High Level Architecture Diagram

```mermaid
graph TD
    User[Users: Staff & Clients] --> NextApp[Next.js 14 App]
    
    subgraph Vercel_Environment[Vercel Environment]
        NextApp --> AppRouter[App Router Pages]
        NextApp --> APIRoutes[API Routes + tRPC]
        NextApp --> ServerComponents[React Server Components]
        NextApp --> ClientComponents[Client Components]
    end
    
    subgraph Database_Layer[Database Layer]
        APIRoutes --> Prisma[Prisma ORM]
        Prisma --> Supabase[(Supabase PostgreSQL)]
    end
    
    subgraph Authentication[Authentication]
        NextApp --> NextAuth[NextAuth.js]
        NextAuth --> AuthProviders[OAuth Providers]
        NextAuth --> Supabase
    end
    
    subgraph External_Services[External Services]
        APIRoutes --> Stripe[Stripe Payments]
        APIRoutes --> Resend[Resend Email]
        APIRoutes --> Cloudinary[Cloudinary Storage]
        APIRoutes --> SocialAPIs[Social Media APIs]
        APIRoutes --> DocuSign[DocuSign E-signatures]
    end
    
    subgraph Real_Time[Real-time Features]
        ClientComponents --> Supabase_Realtime[Supabase Realtime]
        Supabase_Realtime --> Supabase
    end
```

### Architectural Patterns

- **Fullstack Framework Pattern:** Next.js provides unified frontend and backend in a single codebase
- **End-to-End Type Safety:** TypeScript + tRPC ensures type safety from database to UI
- **Server-First Architecture:** React Server Components for optimal performance
- **Component-Based UI:** shadcn/ui components with Tailwind CSS for consistent design
- **Database-First Design:** Prisma schema drives TypeScript types and API structure
- **Authentication-as-a-Service:** NextAuth.js handles all authentication flows
- **Real-time Communication:** Supabase realtime for live chat and collaboration features

## Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Framework | Next.js | 14.x | Full-stack React framework | App Router, Server Components, optimal performance |
| Frontend Language | TypeScript | 5.x | Type-safe JavaScript | End-to-end type safety, better DX |
| UI Component Library | shadcn/ui | Latest | Pre-built accessible components | Consistent design, accessibility built-in |
| CSS Framework | Tailwind CSS | 3.x | Utility-first CSS | Rapid UI development, design system |
| State Management | React Query + Zustand | Latest | Server state + client state | Built into tRPC, lightweight client state |
| Backend Framework | tRPC | 10.x | Type-safe API framework | End-to-end type safety, excellent DX |
| Runtime | Node.js | 18.x | JavaScript runtime | Vercel compatibility, T3 standard |
| Database | PostgreSQL | 15.x | Relational database | Complex relationships, ACID compliance |
| Database ORM | Prisma | 5.x | Type-safe database client | Schema-first, excellent TypeScript integration |
| Authentication | NextAuth.js | 4.x | Authentication library | Built for Next.js, multiple providers |
| File Storage | Cloudinary | Latest | Media management | Image optimization, CDN delivery |
| Email Service | Resend | Latest | Transactional emails | Developer-friendly, reliable delivery |
| Payment Processing | Stripe | Latest | Payment gateway | European support, comprehensive features |
| Hosting Platform | Vercel | Latest | Serverless hosting | Optimal Next.js hosting, edge functions |
| Testing Framework | Vitest + Playwright | Latest | Unit and E2E testing | Fast execution, TypeScript support |
| Build Tool | Next.js Built-in | Latest | Bundling and optimization | Integrated with framework |
| CI/CD | Vercel + GitHub Actions | Latest | Continuous deployment | Integrated deployment pipeline |
| Monitoring | Vercel Analytics | Latest | Performance monitoring | Built-in monitoring and analytics |
| Logging | Axiom | Latest | Structured logging | Vercel integration, query capabilities |

## Data Models

### Core Business Entities

#### Contact Model
**Purpose:** Central repository for all leads, prospects, and clients with comprehensive interaction tracking

**Key Attributes:**
- id: string (UUID) - Unique identifier
- name: string - Full contact name
- email: string - Primary email address
- phone: string - Primary phone number
- leadSource: enum - Origin of the contact
- leadHeat: number - Calculated engagement score
- status: enum - Customer journey stage
- socialProfiles: json - Social media account links
- customFields: json - Flexible additional data

```typescript
interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  leadSource: LeadSource;
  leadHeat: number;
  status: ContactStatus;
  socialProfiles: SocialProfile[];
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  opportunities: Opportunity[];
  projects: Project[];
  interactions: Interaction[];
}

enum ContactStatus {
  UNQUALIFIED = "unqualified",
  PROSPECT = "prospect", 
  LEAD = "lead",
  QUALIFIED = "qualified",
  CUSTOMER = "customer",
  LOST = "lost"
}
```

#### Opportunity Model
**Purpose:** Sales pipeline management with customizable stages and detailed tracking

```typescript
interface Opportunity {
  id: string;
  name: string;
  contactId: string;
  stage: string;
  value: number;
  eventType: string;
  eventDate: Date;
  guestCount: number;
  requiresCatering: boolean;
  roomAssignment?: string;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  contact: Contact;
  project?: Project;
  documents: Document[];
  payments: Payment[];
}
```

#### Project Model
**Purpose:** Post-sale project management with collaborative features

```typescript
interface Project {
  id: string;
  name: string;
  opportunityId: string;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  clientLink: string; // Unique client access URL
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  opportunity: Opportunity;
  tasks: Task[];
  messages: Message[];
  documents: Document[];
  participants: ProjectParticipant[];
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId: string;
  dueDate?: Date;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  project: Project;
  assignee: User;
  comments: TaskComment[];
}
```

## API Specification

### tRPC Router Structure

Based on the T3 Stack approach, all APIs are defined using tRPC routers with full TypeScript type safety:

```typescript
// Main router aggregating all sub-routers
export const appRouter = router({
  contact: contactRouter,
  opportunity: opportunityRouter,  
  project: projectRouter,
  document: documentRouter,
  payment: paymentRouter,
  user: userRouter,
  analytics: analyticsRouter,
});

// Contact management router
export const contactRouter = router({
  // Queries
  getAll: publicProcedure
    .input(z.object({ 
      page: z.number().default(1),
      search: z.string().optional(),
      status: z.nativeEnum(ContactStatus).optional()
    }))
    .query(async ({ input, ctx }) => {
      // Implementation with Prisma
    }),
    
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: id, ctx }) => {
      // Implementation
    }),
    
  // Mutations  
  create: protectedProcedure
    .input(contactCreateSchema)
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),
    
  update: protectedProcedure
    .input(contactUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),
    
  updateLeadHeat: protectedProcedure
    .input(z.object({ id: z.string(), interactions: z.array(interactionSchema) }))
    .mutation(async ({ input, ctx }) => {
      // Lead heat calculation logic
    }),
});

// Real-time subscriptions for project collaboration
export const projectRouter = router({
  getMessages: protectedProcedure
    .input(z.string()) // projectId
    .subscription(async ({ input: projectId }) => {
      // Supabase realtime subscription
    }),
    
  sendMessage: protectedProcedure
    .input(messageCreateSchema)
    .mutation(async ({ input, ctx }) => {
      // Send message and trigger realtime update
    }),
});
```

## Components

### Frontend Architecture Components

#### Core Application Structure
**Responsibility:** Main application shell with navigation, authentication, and routing
**Key Interfaces:**
- App Router pages and layouts
- Global navigation component
- Authentication wrapper
- Protected route guards

**Dependencies:** NextAuth.js, React Query (via tRPC)
**Technology Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS

#### Contact Management Module
**Responsibility:** Lead capture, contact management, and customer journey tracking
**Key Interfaces:**
- Contact list with filtering and search
- Contact detail view with interaction timeline
- Lead heat visualization
- Social media integration panels

**Dependencies:** tRPC contact router, Prisma Contact model
**Technology Stack:** React Server Components, shadcn/ui, Zustand for UI state

#### CRM Pipeline Module  
**Responsibility:** Sales opportunity management with Kanban-style pipeline
**Key Interfaces:**
- Drag-and-drop Kanban board
- Opportunity detail modals
- Stage progression validation
- Date conflict detection

**Dependencies:** tRPC opportunity router, real-time updates via Supabase
**Technology Stack:** @dnd-kit for drag-and-drop, React Query for optimistic updates

#### Project Collaboration Hub
**Responsibility:** Client-facing project workspace with real-time communication
**Key Interfaces:**
- Project-specific client portal
- Real-time chat component
- Task management Kanban board
- File sharing interface

**Dependencies:** Supabase realtime, tRPC project router, Cloudinary for file uploads
**Technology Stack:** WebSocket connections, React Suspense for real-time UI

#### Document Management System
**Responsibility:** Template generation, e-signature workflow, and document storage
**Key Interfaces:**
- Template library browser
- Document preview and editor
- E-signature integration modal
- Version history tracking

**Dependencies:** DocuSign API, Cloudinary storage, PDF.js for preview
**Technology Stack:** React PDF viewer, form handling with React Hook Form

## External APIs

### DocuSign API
- **Purpose:** E-signature capabilities for contracts and agreements
- **Documentation:** https://developers.docusign.com/
- **Base URL:** https://demo.docusign.net/restapi/v2.1
- **Authentication:** OAuth 2.0
- **Rate Limits:** 1000 requests/hour per integration
- **Key Endpoints Used:**
  - `POST /accounts/{accountId}/envelopes` - Send documents for signature
  - `GET /accounts/{accountId}/envelopes/{envelopeId}` - Check signature status
- **Integration Notes:** Webhook endpoints required for status updates

### Stripe API
- **Purpose:** Payment processing including Belgian payment methods
- **Documentation:** https://stripe.com/docs/api
- **Base URL:** https://api.stripe.com/v1
- **Authentication:** API Keys (publishable + secret)
- **Rate Limits:** 100 requests/second
- **Key Endpoints Used:**
  - `POST /payment_intents` - Create payment intent
  - `POST /customers` - Create customer records
  - `GET /payment_intents/{id}` - Retrieve payment status
- **Integration Notes:** Webhook endpoints for payment status updates, support for Bancontact and other EU payment methods

### Social Media APIs
- **Purpose:** Lead capture and engagement tracking from social platforms
- **Platforms:** Facebook Graph API, Instagram Basic Display API, LinkedIn API
- **Rate Limits:** Varies by platform (typically 200-600 requests/hour)
- **Integration Notes:** OAuth flows required, webhook subscriptions for real-time updates

## Core Workflows

### Sales Pipeline Workflow
```mermaid
sequenceDiagram
    participant User as Venue Staff
    participant App as Next.js App
    participant tRPC as tRPC API
    participant DB as PostgreSQL
    participant External as External APIs
    
    User->>App: Create new opportunity
    App->>tRPC: opportunity.create(data)
    tRPC->>DB: INSERT opportunity
    tRPC->>DB: UPDATE contact status
    DB-->>tRPC: Return created opportunity
    tRPC-->>App: Opportunity data
    App-->>User: Show opportunity in pipeline
    
    User->>App: Move opportunity to next stage
    App->>tRPC: opportunity.updateStage(id, stage)
    tRPC->>DB: Validate required fields
    alt Missing required fields
        tRPC-->>App: Validation error
        App-->>User: Show required fields modal
    else Fields complete
        tRPC->>DB: UPDATE opportunity stage
        tRPC->>External: Trigger automation (if configured)
        DB-->>tRPC: Updated opportunity
        tRPC-->>App: Success response
        App-->>User: Update UI optimistically
    end
```

### Real-time Project Collaboration
```mermaid
sequenceDiagram
    participant Client as Client User
    participant Staff as Venue Staff  
    participant App as Next.js App
    participant Supabase as Supabase Realtime
    participant DB as PostgreSQL
    
    Client->>App: Send chat message
    App->>DB: INSERT message
    App->>Supabase: Broadcast message
    Supabase-->>Staff: Real-time message
    Supabase-->>Client: Message confirmation
    
    Staff->>App: Update task status
    App->>DB: UPDATE task
    App->>Supabase: Broadcast task change
    Supabase-->>Client: Real-time task update
    Supabase-->>Staff: Update confirmation
```

## Database Schema

### Prisma Schema Definition

```prisma
// Contact and Lead Management
model Contact {
  id              String          @id @default(cuid())
  name            String
  email           String          @unique
  phone           String?
  leadSource      LeadSource
  leadHeat        Int             @default(0)
  status          ContactStatus   @default(UNQUALIFIED)
  socialProfiles  Json?
  customFields    Json?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // Relations
  opportunities   Opportunity[]
  projects        Project[]
  interactions    Interaction[]
  
  @@map("contacts")
  @@index([status])
  @@index([leadHeat])
  @@index([createdAt])
}

// Sales Pipeline
model Opportunity {
  id              String      @id @default(cuid())
  name            String
  contactId       String
  stage           String      @default("prospect")
  value           Decimal?
  eventType       String?
  eventDate       DateTime?
  guestCount      Int?
  requiresCatering Boolean    @default(false)
  roomAssignment  String?
  customFields    Json?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relations
  contact         Contact     @relation(fields: [contactId], references: [id], onDelete: Cascade)
  project         Project?
  documents       Document[]
  payments        Payment[]
  
  @@map("opportunities")
  @@index([stage])
  @@index([eventDate])
  @@index([contactId])
}

// Project Management
model Project {
  id            String              @id @default(cuid())
  name          String
  opportunityId String              @unique
  status        ProjectStatus       @default(ACTIVE)
  startDate     DateTime
  endDate       DateTime
  clientLink    String              @unique @default(cuid())
  settings      Json?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  
  // Relations
  opportunity   Opportunity         @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  tasks         Task[]
  messages      Message[]
  documents     Document[]
  participants  ProjectParticipant[]
  
  @@map("projects")
  @@index([status])
  @@index([clientLink])
}

// Task Management  
model Task {
  id          String        @id @default(cuid())
  projectId   String
  title       String
  description String?
  status      TaskStatus    @default(TODO)
  assigneeId  String
  dueDate     DateTime?
  isInternal  Boolean       @default(false)
  position    Int           @default(0)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // Relations
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee    User          @relation(fields: [assigneeId], references: [id])
  comments    TaskComment[]
  
  @@map("tasks")
  @@index([projectId])
  @@index([status])
  @@index([assigneeId])
  @@index([dueDate])
}

// User Management with NextAuth.js integration
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(STAFF)
  venueId       String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // NextAuth.js relations
  accounts      Account[]
  sessions      Session[]
  
  // Application relations
  venue         Venue?              @relation(fields: [venueId], references: [id])
  assignedTasks Task[]
  sentMessages  Message[]
  
  @@map("users")
}

// Enums
enum ContactStatus {
  UNQUALIFIED
  PROSPECT
  LEAD
  QUALIFIED
  CUSTOMER
  LOST
}

enum LeadSource {
  WEBSITE
  FACEBOOK
  INSTAGRAM
  LINKEDIN
  REFERRAL
  DIRECT
  OTHER
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  CANCELLED
  ON_HOLD
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  ON_HOLD
  COMPLETED
}

enum UserRole {
  ADMIN
  SALES
  PROJECT_MANAGER
  STAFF
  CLIENT
}
```

## Frontend Architecture

### Component Architecture

#### Component Organization
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

#### Component Template
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

### State Management Architecture

#### State Structure
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

#### State Management Patterns
- **Server State:** Managed by tRPC with React Query under the hood
- **UI State:** Zustand for lightweight client-side state
- **Form State:** React Hook Form for form management
- **Real-time State:** Supabase subscriptions for live updates

### Routing Architecture

#### Route Organization (Next.js 14 App Router)
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

#### Protected Route Pattern
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

### Frontend Services Layer

#### tRPC Client Setup
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

#### Service Example
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

## Backend Architecture

### Service Architecture (tRPC-based)

Since the T3 Stack uses a monolithic approach with tRPC, the "backend" is integrated into the Next.js application through API routes and server-side functions.

#### tRPC Router Organization
```
src/server/
  api/
    routers/
      contact.ts        # Contact management procedures
      opportunity.ts    # CRM pipeline procedures
      project.ts        # Project management procedures
      document.ts       # Document handling procedures
      payment.ts        # Payment processing procedures
      analytics.ts      # Reporting procedures
      user.ts          # User management procedures
    root.ts            # Main router combining all sub-routers
    trpc.ts           # tRPC configuration and context
  auth.ts             # NextAuth.js configuration
  db.ts              # Prisma client instance
```

#### Server-side Function Template
```typescript
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const contactRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      leadSource: z.enum(['WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'REFERRAL', 'DIRECT', 'OTHER']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user permissions
      if (!['ADMIN', 'SALES'].includes(ctx.session.user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      // Business logic
      const contact = await ctx.db.contact.create({
        data: {
          ...input,
          venueId: ctx.session.user.venueId,
        },
      });
      
      // Trigger side effects (webhooks, notifications, etc.)
      await triggerLeadNotification(contact);
      
      return contact;
    }),
});
```

### Database Architecture

#### Prisma Integration
```typescript
// Database client setup
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

#### Data Access Patterns
```typescript
// Repository-like pattern using Prisma
export class ContactService {
  constructor(private db: PrismaClient) {}
  
  async findMany(filters: ContactFilters) {
    return this.db.contact.findMany({
      where: {
        venueId: filters.venueId,
        status: filters.status,
        OR: filters.search ? [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        opportunities: true,
        _count: {
          select: { interactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  
  async calculateLeadHeat(contactId: string) {
    const interactions = await this.db.interaction.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
    });
    
    // Lead heat calculation logic
    const heat = interactions.reduce((score, interaction) => {
      return score + this.getInteractionScore(interaction.type);
    }, 0);
    
    await this.db.contact.update({
      where: { id: contactId },
      data: { leadHeat: heat },
    });
    
    return heat;
  }
  
  private getInteractionScore(type: InteractionType): number {
    const scores = {
      SOCIAL_FOLLOW: 1,
      SOCIAL_LIKE: 1,
      WEBSITE_VISIT: 2,
      INFO_REQUEST: 5,
      PRICE_QUOTE: 8,
      SITE_VISIT: 10,
    };
    return scores[type] ?? 0;
  }
}
```

### Authentication and Authorization

#### NextAuth.js Configuration
```typescript
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { db } from '@/server/db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.venueId = user.venueId;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.venueId = token.venueId;
      }
      return session;
    },
  },
};
```

#### Authorization Middleware
```typescript
import { type GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '@/server/auth';
import { TRPCError } from '@trpc/server';

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const session = await getServerAuthSession({ req, res });

  return {
    session,
    db,
  };
};

export const protectedProcedure = publicProcedure.use(
  ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  }
);
```

## Unified Project Structure

```
eventRunner/
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── README.md                       # Project documentation
├── next.config.js                  # Next.js configuration
├── package.json                    # Dependencies and scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── prisma/                         # Database schema and migrations
│   ├── schema.prisma              # Prisma schema definition
│   ├── migrations/                # Database migrations
│   └── seed.ts                    # Database seeding script
├── public/                         # Static assets
│   ├── favicon.ico
│   └── images/
├── src/                           # Source code
│   ├── app/                       # Next.js 14 App Router
│   │   ├── (dashboard)/           # Authenticated routes group
│   │   │   ├── contacts/
│   │   │   │   ├── page.tsx       # Contact list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Contact details
│   │   │   ├── opportunities/
│   │   │   │   └── page.tsx       # CRM pipeline
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx       # Project list
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Project details
│   │   │   │       └── client/
│   │   │   │           └── page.tsx # Client portal
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx       # Analytics dashboard
│   │   │   └── settings/
│   │   │       └── page.tsx       # Settings
│   │   ├── (auth)/                # Authentication routes
│   │   │   └── signin/
│   │   │       └── page.tsx       # Sign in page
│   │   ├── api/                   # API routes
│   │   │   ├── trpc/
│   │   │   │   └── [trpc]/
│   │   │   │       └── route.ts   # tRPC handler
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts   # NextAuth handler
│   │   ├── globals.css            # Global CSS styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Homepage
│   ├── components/                # React components
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── forms/                 # Form components
│   │   ├── tables/                # Data tables
│   │   ├── charts/                # Analytics charts
│   │   └── features/              # Feature-specific components
│   │       ├── contacts/
│   │       ├── opportunities/
│   │       ├── projects/
│   │       ├── documents/
│   │       └── payments/
│   ├── lib/                       # Utility libraries
│   │   ├── utils.ts               # Common utilities
│   │   ├── validations.ts         # Zod schemas
│   │   └── constants.ts           # Application constants
│   ├── server/                    # Server-side code
│   │   ├── api/                   # tRPC routers
│   │   │   ├── routers/
│   │   │   │   ├── contact.ts
│   │   │   │   ├── opportunity.ts
│   │   │   │   ├── project.ts
│   │   │   │   ├── document.ts
│   │   │   │   ├── payment.ts
│   │   │   │   └── analytics.ts
│   │   │   ├── root.ts            # Main router
│   │   │   └── trpc.ts            # tRPC setup
│   │   ├── auth.ts                # NextAuth configuration
│   │   └── db.ts                  # Prisma client
│   ├── styles/                    # Additional stylesheets
│   └── types/                     # TypeScript type definitions
├── tests/                         # Test files
│   ├── __mocks__/
│   ├── components/
│   ├── pages/
│   └── api/
└── docs/                          # Documentation
    ├── architecture.md            # This document
    ├── api.md                     # API documentation
    └── deployment.md              # Deployment guide
```

## Development Workflow

### Local Development Setup

#### Prerequisites
```bash
# Install Node.js 18+
node --version

# Install pnpm (recommended package manager)
npm install -g pnpm

# Verify installations
pnpm --version
```

#### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd eventRunner

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Set up database
pnpm db:push
pnpm db:seed

# Generate Prisma client
pnpm db:generate
```

#### Development Commands
```bash
# Start development server (all services)
pnpm dev

# Database operations
pnpm db:studio    # Open Prisma Studio
pnpm db:migrate   # Run migrations
pnpm db:reset     # Reset database

# Type checking
pnpm type-check

# Run tests
pnpm test         # Unit tests
pnpm test:e2e     # E2E tests with Playwright
```

### Environment Configuration

#### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/eventrunner"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# External Services
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
DOCUSIGN_CLIENT_ID="your-docusign-client-id"
DOCUSIGN_CLIENT_SECRET="your-docusign-client-secret"
RESEND_API_KEY="re_..."
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Social Media APIs
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
```

## Deployment Architecture

### Deployment Strategy

**Frontend & Backend Deployment:**
- **Platform:** Vercel (primary deployment platform)
- **Build Command:** `pnpm build`
- **Output Directory:** `.next` (handled automatically by Vercel)
- **Edge Functions:** API routes automatically deployed as serverless functions

**Database Deployment:**
- **Platform:** Supabase (managed PostgreSQL)
- **Migration Strategy:** Prisma migrations via GitHub Actions
- **Backup Strategy:** Automated daily backups via Supabase

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3000/api | Local development |
| Preview | https://eventrunner-git-feature.vercel.app | Same (integrated) | Feature branch testing |
| Production | https://eventrunner.com | Same (integrated) | Live environment |

## Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers: Strict content security policy preventing XSS
- XSS Prevention: React's built-in XSS protection + input sanitization
- Secure Storage: HTTP-only cookies for sessions, secure local storage for non-sensitive data

**Backend Security:**
- Input Validation: Zod schema validation on all tRPC procedures
- Rate Limiting: Vercel's built-in rate limiting + custom middleware for API abuse prevention
- CORS Policy: Strict CORS configuration for API endpoints

**Authentication Security:**
- Token Storage: HTTP-only cookies for session tokens via NextAuth.js
- Session Management: JWT tokens with secure refresh rotation
- Password Policy: OAuth-first approach, secure fallback for email/password

**Database Security:**
- Connection Security: TLS-encrypted connections to Supabase
- Row Level Security: Prisma middleware for multi-tenant data isolation
- Data Encryption: Encryption at rest via Supabase, sensitive data hashing

### Performance Optimization

**Frontend Performance:**
- Bundle Size Target: < 200KB initial bundle via Next.js automatic splitting
- Loading Strategy: React Suspense + lazy loading for route-based code splitting
- Caching Strategy: React Query caching + Next.js static generation where possible

**Backend Performance:**
- Response Time Target: < 200ms API response time for 95th percentile
- Database Optimization: Prisma query optimization + strategic indexes
- Caching Strategy: React Query for client-side, Redis for server-side caching of expensive operations

**Real-time Performance:**
- WebSocket Optimization: Supabase realtime with selective subscriptions
- State Synchronization: Optimistic updates with conflict resolution
- Memory Management: Automatic cleanup of stale subscriptions

## Testing Strategy

### Testing Pyramid

```
                E2E Tests (Playwright)
               /                    \
          Integration Tests (tRPC)
         /                          \
    Frontend Unit Tests         Backend Unit Tests
    (Vitest + RTL)             (Vitest + Prisma)
```

### Test Organization

#### Frontend Tests
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

#### Backend Tests
```
tests/
├── api/                 # tRPC procedure tests
│   ├── contact.test.ts
│   ├── opportunity.test.ts
│   └── project.test.ts
├── services/            # Business logic tests
└── utils/               # Server utility tests
```

#### E2E Tests
```
e2e/
├── auth.spec.ts         # Authentication flows
├── contacts.spec.ts     # Contact management
├── crm.spec.ts         # Sales pipeline
├── projects.spec.ts     # Project collaboration
└── payments.spec.ts     # Payment processing
```

### Test Examples

#### Frontend Component Test
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

#### Backend tRPC Test
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

#### E2E Test
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

## Coding Standards

### Critical Fullstack Rules

- **Type Safety:** Always use TypeScript interfaces for all data structures, never use `any` type
- **API Consistency:** All API endpoints must be defined through tRPC routers with proper input validation
- **Database Access:** Never query database directly from components, always use tRPC procedures
- **Authentication:** Check user permissions in all protected tRPC procedures using middleware
- **Error Handling:** All tRPC procedures must use proper error codes (UNAUTHORIZED, FORBIDDEN, etc.)
- **Real-time Updates:** Use Supabase realtime subscriptions for collaborative features, not polling
- **File Uploads:** Always validate file types and sizes, use Cloudinary for processing
- **Environment Variables:** Access env vars only through validated config objects, never process.env directly

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `ContactCard.tsx` |
| Hooks | camelCase with 'use' | `useContacts.ts` |
| tRPC Procedures | camelCase | `contact.getById` |
| Database Tables | snake_case | `contact_interactions` |
| API Routes | kebab-case | `/api/trpc/contact.getById` |
| Environment Variables | SCREAMING_SNAKE_CASE | `DATABASE_URL` |

## Error Handling Strategy

### Error Flow
```mermaid
sequenceDiagram
    participant Client as React Component
    participant tRPC as tRPC Client
    participant Server as tRPC Server
    participant DB as Database
    
    Client->>tRPC: API call with invalid data
    tRPC->>Server: Request with validation
    Server->>Server: Zod validation fails
    Server-->>tRPC: TRPCError (BAD_REQUEST)
    tRPC-->>Client: Formatted error object
    Client->>Client: Display user-friendly message
    
    Client->>tRPC: API call (unauthorized)
    tRPC->>Server: Request
    Server->>Server: Auth middleware check
    Server-->>tRPC: TRPCError (UNAUTHORIZED)
    tRPC-->>Client: Auth error
    Client->>Client: Redirect to login
```

### Error Response Format
```typescript
interface ApiError {
  error: {
    code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR';
    message: string;
    data?: {
      code: string;
      httpStatus: number;
      stack?: string;
      path: string;
      zodError?: z.ZodError;
    };
  };
}
```

### Frontend Error Handling
```typescript
import { toast } from '@/components/ui/use-toast';

export const useErrorHandler = () => {
  const handleError = (error: unknown) => {
    if (error instanceof TRPCClientError) {
      switch (error.data?.code) {
        case 'UNAUTHORIZED':
          toast({
            title: 'Authentication Required',
            description: 'Please sign in to continue',
            variant: 'destructive',
          });
          // Redirect to login
          break;
        case 'FORBIDDEN':
          toast({
            title: 'Access Denied',
            description: 'You do not have permission for this action',
            variant: 'destructive', 
          });
          break;
        case 'BAD_REQUEST':
          toast({
            title: 'Invalid Input',
            description: error.message,
            variant: 'destructive',
          });
          break;
        default:
          toast({
            title: 'Something went wrong',
            description: 'Please try again later',
            variant: 'destructive',
          });
      }
    }
  };
  
  return { handleError };
};
```

### Backend Error Handling
```typescript
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const contactRouter = createTRPCRouter({
  create: protectedProcedure
    .input(contactCreateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate user permissions
        if (!['ADMIN', 'SALES'].includes(ctx.session.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to create contacts',
          });
        }
        
        // Check for duplicate email
        const existing = await ctx.db.contact.findUnique({
          where: { email: input.email },
        });
        
        if (existing) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'A contact with this email already exists',
          });
        }
        
        const contact = await ctx.db.contact.create({
          data: {
            ...input,
            venueId: ctx.session.user.venueId,
          },
        });
        
        return contact;
        
      } catch (error) {
        // Handle Prisma errors
        if (error instanceof PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database error occurred',
            cause: error,
          });
        }
        
        // Re-throw tRPC errors
        if (error instanceof TRPCError) {
          throw error;
        }
        
        // Handle unexpected errors
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          cause: error,
        });
      }
    }),
});
```

## Monitoring and Observability

### Monitoring Stack
- **Frontend Monitoring:** Vercel Analytics + Sentry for error tracking
- **Backend Monitoring:** Vercel Functions insights + custom logging
- **Database Monitoring:** Supabase built-in monitoring + query performance tracking
- **Performance Monitoring:** Core Web Vitals via Vercel, custom metrics via Axiom

### Key Metrics

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

### Logging Strategy
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

## Architecture Document Complete

This comprehensive architecture document defines eventRunner's complete technical foundation using the T3 Stack approach. The architecture provides:

- **Type-safe fullstack development** with TypeScript, tRPC, and Prisma
- **Modern deployment strategy** optimized for Vercel and edge computing
- **Scalable real-time features** via Supabase for collaboration
- **Comprehensive security model** with NextAuth.js and proper authorization
- **Developer-friendly experience** with excellent tooling and testing strategies
- **Production-ready monitoring** and error handling

The T3 Stack choice significantly simplifies the architecture compared to the original microservices approach while maintaining all the powerful features required by the PRD, making it ideal for rapid development and deployment of eventRunner's complex business requirements.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "arch-1", "content": "Process Introduction section with starter template evaluation", "status": "completed", "priority": "high"}, {"id": "arch-2", "content": "Define high-level architecture including technical summary and platform choices", "status": "completed", "priority": "high"}, {"id": "arch-3", "content": "Finalize tech stack selection with user input", "status": "completed", "priority": "high"}, {"id": "arch-4", "content": "Design data models based on PRD requirements", "status": "completed", "priority": "medium"}, {"id": "arch-5", "content": "Create API specification based on chosen API style", "status": "completed", "priority": "medium"}, {"id": "arch-6", "content": "Define system components and relationships", "status": "completed", "priority": "medium"}, {"id": "arch-7", "content": "Complete frontend and backend architecture sections", "status": "completed", "priority": "medium"}, {"id": "arch-8", "content": "Define deployment, security, and testing strategies", "status": "completed", "priority": "low"}]