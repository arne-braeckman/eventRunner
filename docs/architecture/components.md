# Components

## Frontend Architecture Components

### Core Application Structure
**Responsibility:** Main application shell with navigation, authentication, and routing
**Key Interfaces:**
- App Router pages and layouts
- Global navigation component
- Authentication wrapper
- Protected route guards

**Dependencies:** Clerk authentication, React Query (via tRPC)
**Technology Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS

### Contact Management Module
**Responsibility:** Lead capture, contact management, and customer journey tracking
**Key Interfaces:**
- Contact list with filtering and search
- Contact detail view with interaction timeline
- Lead heat visualization
- Social media integration panels

**Dependencies:** tRPC contact router, Convex Contact model
**Technology Stack:** React Server Components, shadcn/ui, Zustand for UI state

### CRM Pipeline Module  
**Responsibility:** Sales opportunity management with Kanban-style pipeline
**Key Interfaces:**
- Drag-and-drop Kanban board
- Opportunity detail modals
- Stage progression validation
- Date conflict detection

**Dependencies:** tRPC opportunity router, real-time updates via Convex
**Technology Stack:** @dnd-kit for drag-and-drop, React Query for optimistic updates

### Project Collaboration Hub
**Responsibility:** Client-facing project workspace with real-time communication
**Key Interfaces:**
- Project-specific client portal
- Real-time chat component
- Task management Kanban board
- File sharing interface

**Dependencies:** Convex realtime, tRPC project router, Cloudinary for file uploads
**Technology Stack:** WebSocket connections, React Suspense for real-time UI

### Document Management System
**Responsibility:** Template generation, e-signature workflow, and document storage
**Key Interfaces:**
- Template library browser
- Document preview and editor
- E-signature integration modal
- Version history tracking

**Dependencies:** DocuSign API, Cloudinary storage, PDF.js for preview
**Technology Stack:** React PDF viewer, form handling with React Hook Form
