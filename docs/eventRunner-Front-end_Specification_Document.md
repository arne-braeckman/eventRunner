# eventRunner UI/UX Specification

## Introduction

This document defines the user experience goals, information architecture, user flows, and visual design specifications for **eventRunner**'s user interface. Its primary goal is to serve as the foundation for visual design and frontend development, ensuring a cohesive and user-centered experience.

This specification is designed to work seamlessly with the **T3 Stack architecture** (Next.js 14, TypeScript, tRPC, Prisma, Tailwind CSS, NextAuth.js, and shadcn/ui) as defined in the system architecture document, providing a modern, type-safe, and component-based implementation approach.

## Overall UX Goals & Principles

### Target User Personas

The UI/UX design for `eventRunner` will primarily cater to the following user personas:

- **Micro Event Venues (1-10 Staff) in Belgium (Primary User):**

  - **Operational Profile:** These are primarily solopreneurs or family-run businesses operating event venues in Belgium. They function as core organizers, managing direct communication with customers and a diverse network of partners, and are fundamentally responsible for the smooth operation of each event.
  - **Technological Profile:** They are generally **not tech-savvy**, and often face a "lack of in-house technical expertise". They currently rely on fragmented manual tools or generic software that leads to inefficiencies.
  - **UI/UX Preferences:** Despite not being tech-savvy, they are highly **drawn to modern, clear user interfaces**. They appreciate "good-looking things" with strong aesthetics (e.g., "like Apple"), prioritizing a **clean UI** and **user-friendly, intuitive experiences** that minimize training requirements. Their need for ease of use is paramount to overcome barriers to adoption.
  - **Needs & Pain Points:** They require solutions that address fragmented operations, a lack of CRM/customer insights, limited standardization, and the need for simplified workflows.
  - **Interaction Goals:** Their main goals are to gain a sense of control, reduce anxiety over missed opportunities, achieve professional accomplishment, and foster confident, seamless interactions.

- **Clients of Event Venues (Secondary User):**
  - **Interaction Profile:** These are the end-customers who interact with the venue through `eventRunner`'s Project Link & Collaboration workspace (FR6) for event planning and communication.
  - **Expectations:** They expect seamless communication, clear progress tracking, and easy access to shared documents and project information.

### Key Usability Goals

The design of `eventRunner` will prioritize the following critical usability goals to ensure a positive and productive user experience:

- **Learnability & Intuitiveness:** New staff members must be able to successfully add a new contact (FR1) within **5 minutes** and perform all other basic steps (e.g., lead creation (FR1), opportunity creation (FR2), pipeline movements (FR2), and project creation (FR6)) without upfront training, relying solely on the guided tutorial (FR10).
- **Efficiency:** For experienced users, task completion should become "second nature," operating in an "autopilot mode" without requiring conscious thought. This supports the overall goal of "streamlining workflows" and enabling "operational efficiencies" by "unburdening" users.
- **Error Clarity & Recovery:** While specific error prevention strategies are to be determined, if an error does occur, the system must use **natural language** to help the user identify the issue clearly and provide sufficient explanation for reporting to support if needed.
- **Aesthetic Satisfaction:** Users must find the interface **visually appealing, clean, and a pleasure to use**, contributing directly to a positive and productive work experience. This aligns with the user persona's preference for "modern, clear UI," "good-looking things like Apple (aesthetics)," and a "clean UI".

### Core Design Principles

The design of `eventRunner` will be guided by the following core principles, ensuring a user experience that empowers and delights its target audience:

1.  **Clarity over Complexity:** The interface will prioritize clear, straightforward interactions and information presentation over intricate designs. This includes minimal visual clutter, clear hierarchies, and ample whitespace. Achieving this clarity is most critical in modules such as **sales pipelines (FR2), contact management (FR1), and project management (Kanban boards and schedule timelines from FR6)**. The design will ensure **easy-to-use interfaces for text input, chat (FR6/FR15), and navigation**. Terminology will primarily use **business jargon familiar to venue owners** where possible, avoiding technical jargon.
2.  **Consistency:** A consistent design language, interaction patterns, and visual elements will be applied throughout the entire application. This is paramount for **visual consistency of buttons, forms, colors, navigation, and so on**. If feasible, a **consistent structural hierarchy between different modules** should be maintained. This will reduce cognitive load, improve learnability, and contribute to a seamless and predictable user experience.
3.  **User Control:** The system will empower users with a strong sense of control over their data, workflows, and communication. This will be demonstrated through clear permission-based UI behavior: **users can only perform actions they are allowed to do, and fields will either be locked for editing or not visible at all if not permitted**. For automations (FR13), the user's control will manifest as the ability to **simply enable or disable automations**, abstracting the underlying complexity from the user interface.
4.  **Feedback and Responsiveness:** The system will provide clear, immediate, and understandable feedback for every user action, ensuring users know what is happening and that their inputs are acknowledged.
5.  **Progressive Disclosure:** Information and options will be revealed to the user only as they are needed, reducing initial clutter and guiding users through complex processes step-by-step.
6.  **Aesthetic Quality:** Beyond functionality, the design will strive for a modern, visually appealing, and clean aesthetic that contributes to a positive and productive work experience, aligning with user preferences for "good-looking things like Apple (aesthetics)".
7.  **Accessibility by Default:** The design will consider and adhere to basic web accessibility guidelines to ensure the application is usable by the widest possible audience.

## Information Architecture (IA)

### Site Map / Screen Inventory

This is a proposed hierarchical structure of `eventRunner`'s main screens and modules, intended to guide the Information Architecture and navigation design.

- **Dashboard** (Central homepage / Overview of key metrics)
- **Contact Management**
  - Contact List (Overview of all leads and clients)
  - **Contact Detail View** (Detailed view of individual contacts)
    - At the top: Contact image, Contact Name.
    - Sub-menu tabs underneath name:
      - **Contact Information (Default View):** Split view. Left pane: All contact information (name, email, address, etc. from FR1). Right pane: A timeline with all recorded touchpoints and interactions had with the contact (from FR1).
      - **Opportunities:** Split view. Left pane: Lead score history (from FR1). Right pane: A list of all linked opportunities (list view showing Name, State/Sales Stage (from FR2), and Value (from FR1/FR2)).
      - **Projects:** A list of projects attached to the contact.
      - **Files:** A list of files attached to the contact.
- **CRM (Sales Pipeline)**
  - Sales Pipeline Kanban Board (Visual representation of opportunities in stages)
  - **CRM Pipeline View**
    - Page title: Contact Name (similar structure to Contact Detail View).
    - Sub-menu tabs:
      - **Leads View:** A list view of all leads with columns for Contact, Lead Heat (from FR1), and Last Activity.
      - **Opportunities Page:** A list view of all opportunities with columns for Contact, Sales Stage (from FR2), Value (from FR2), Type of Event (from FR2), Last Activity, and Date of Event (from FR2).
      - **Sales Funnel View:** A Kanban-style view showing opportunities in their respective sales stages. Each Kanban card displays the opportunity's Name, Type of Event, Date of Event, and Value (from FR2).
- **Projects (Internal & Collaboration Hub)**
  - Project List (Overview of all active and past projects)
  - Project Detail View (Dedicated workspace for each project - accessible via project link for clients)
    - Kanban Board (Project-specific tasks, owners, deadlines)
    - Timeline/Schedule View (Visual project timeline)
    - Chat Panel (In-house project communication)
    - Files & Documents (Shared files and contracts)
    - Collaborative Rich-text Editor (for event details, agendas, etc.)
- **Documents (Template & Management)**
  - Document Library (Repository for templates, sales literature, generated documents)
  - Document Modal (Overlay for template selection, preview, e-signature workflow)
- **Payments**
  - Payment Dashboard (Overview of collected/outstanding/overdue payments)
  - Payment Requests List (List of all generated payment requests)
  - Payment Request Detail / Pop-ups (Detailed view or modals for specific payment requests)
- **Analytics**
  - Sales Analytics Dashboard (FR11)
  - Project Analytics Dashboard (FR11)
  - Payment Analytics Dashboard (FR11)
  - Customizable KPIs (FR11)
- **Settings (User & Venue Configuration)**
  - User Profile & Account Settings
  - Team Management (Users, Roles, Permissions - FR7)
  - Templates (Document, Project)
  - Integrations (Configuration for communication and payment gateways - FR8, FR5)
  - Venue Rooms Configuration (FR7 - for managing venue rooms and availability)
  - Notifications Settings (FR9)
  - Branding Settings (for customer portal layout and overall tool branding - FR6, FR7)
- **Notifications Panel** (Global access point for all system notifications)
- **Onboarding Wizard** (Pop-up / Modal for first-time users and clients - FR10)

```mermaid
graph TD
    A[Dashboard] --> B[Contact Management]
    B --> B1[Contact List]
    B --> B2[Contact Detail View]
    B2 --> B2a[Contact Info (Split View)]
    B2a --> B2a1[Contact Details]
    B2a --> B2a2[Touchpoint Timeline]
    B2 --> B2b[Opportunities (Split View)]
    B2b --> B2b1[Lead Score History]
    B2b --> B2b2[Linked Opportunities List]
    B2 --> B2c[Projects List]
    B2 --> B2d[Files List]

    A --> C[CRM]
    C --> C1[CRM Pipeline View]
    C1 --> C1a[Leads View]
    C1 --> C1b[Opportunities List]
    C1 --> C1c[Sales Funnel Kanban View]

    A --> D[Projects]
    D --> D1[Project List]
    D --> D2[Project Detail View]
    D2 --> D2a[Kanban Board]
    D2 --> D2b[Timeline View]
    D2 --> D2c[Chat Panel]
    D2 --> D2d[Files & Documents]
    D2 --> D2e[Collaborative Rich-text Editor]

    A --> E[Documents]
    E --> E1[Document Library]
    E --> E2[Document Modal]

    A --> F[Payments]
    F --> F1[Payment Dashboard]
    F --> F2[Payment Requests List]
    F --> F3[Payment Request Detail / Pop-ups]

    A --> G[Analytics]
    G --> G1[Sales Analytics Dashboard]
    G --> G2[Project Analytics Dashboard]
    G --> G3[Payment Analytics Dashboard]
    G --> G4[Customizable KPIs]

    A --> H[Settings]
    H --> H1[User Profile & Account Settings]
    H --> H2[Team Management]
    H --> H3[Templates]
    H --> H4[Integrations]
    H --> H5[Venue Rooms Configuration]
    H --> H6[Notifications Settings]
    H --> H7[Branding Settings]

    Sub[Notifications Panel (Global Access)]
    Modal[Onboarding Wizard (Pop-up / Modal)]


graph TD
    A[Client Interaction: Web Form, Social DM, Email, Call] --> B{eventRunner Captures & Centralizes Interaction}
    B --> C{New or Existing Contact?}
    C -->|New| C1[Create New Contact Record (FR1)]
    C1 --> D
    C -->|Existing| D[Link Interaction to Contact Record (FR8)]

    D --> E[Assign Status: Unqualified (FR1)]
    E --> F{Contact Requests Basic Info OR High Social Interaction}
    F --> G[Update Status: Prospect (FR1)]
    G --> H[Centralize Communications (FR8)]
    H --> I[System Updates Lead Heat (FR1)]
    I --> J{Prospect Requests Site Tour OR Basic Pricing}
    J --> K[Update Status: Lead (FR1)]
    K --> L[Sales Staff Generates Proposal (FR4)]
    L --> M[System Tracks Proposal Status (FR14)]
    M --> N[Sales Staff Sends Proposal (FR4)]
    N --> O[System Alerts for Unresponded Proposals (FR9)]
    O --> P[LLM/Rule-based Sales Suggestions (FR3)]
    P --> Q{Sales Staff Follows Up}
    Q --> R{Site Tour Completed OR Proposal Drafted/Sent?}
    R -->|YES| S[Update Status: Qualified (FR1)]
    S --> T[Move Opportunity to "Qualified" Stage (FR2)]
    T --> U[Enforce Required Fields for Stage (FR2)]
    U --> V[Date Conflict Check & Alert (FR2)]
    V --> W[Flow Ends: Qualified Opportunity]

    R -->|NO| X[Continue Nurturing/Mark Lost Deal]
    X --> Y[Flow Ends: Continue/Lost]

    H --> Z[Sales Staff Reviews Unqualified Contacts]
    Z --> G

    Z --> ZA[Mark as Lost Deal (FR1)]
    ZA --> ZB[Flow Ends: Lost Contact]


graph TD
    A[Sales/PM Confirms Opportunity "Customer" (FR1, FR2)] --> B[eventRunner Prompts Project Creation]
    B --> C[PM Initiates New Project (FR6)]
    C --> D{Apply Project Template?}
    D -->|YES| D1[PM Selects Template]
    D1 --> E
    D -->|NO| E[PM Manually Sets Up Project]

    E --> F[System Populates Kanban/Milestones (FR6, FR13)]
    F --> G[PM Decides Onboarding Choice (FR10)]
    G --> H{Guided Onboarding Selected?}
    H -->|GUIDED| I[System Generates Project Link (FR6)]
    I --> J[PM Sends Project Invite (FR8)]
    J --> K[Client Clicks Project Link & Accesses Workspace (FR6)]

    K --> L{Guided Onboarding Presented?}
    L -->|GUIDED| L1[Client Presented Onboarding Wizard (FR10)]
    L1 --> M[Client Engages with Kanban/Chat (FR6, FR15)]
    L -->|OPT-OUT| M

    M --> N[Staff/Client Use In-House Chat (FR6, FR15)]
    N --> O[System Links Comments to Tasks (FR6)]
    O --> P[LLM Summaries On-Demand (FR3, FR8)]
    P --> Q[Ongoing Collaborative Planning (FR6)]
    Q --> R[Flow Ends: Active Project Collaboration]

    H -->|OPT-OUT| S[System Generates Project Link (FR6)]
    S --> T[PM Sends Project Invite (FR8)]
    T --> K


graph TD
    A[Venue Staff Defines Payment Schedule (FR5)] --> B{Payment Milestone Reached OR Manual Trigger (FR5)}
    B --> C[eventRunner Generates Payment Request (FR5)]
    C --> D[eventRunner Delivers Request (Email/Client Portal) (FR5, FR6)]
    D --> E[eventRunner Sends Notifications (FR9)]

    E --> F[Client Receives Request]
    F --> G[Client Initiates Payment]
    G --> H[Redirect to Payment Gateway (FR5)]
    H --> I[Payment Processed by Gateway]

    I --> J[Gateway Sends Status Update to eventRunner (FR5)]
    J --> K[eventRunner Updates Payment Status (FR5)]
    K --> L[eventRunner Sends Payment Status Notifications (FR9)]

    L --> M[Payment Data Flows to Analytics (FR11)]
    M --> N[Venue Staff/Admin Views Payment Analytics (FR11)]

    K --> O{Payment Overdue?}
    O -->|YES| P[eventRunner Marks Overdue & Triggers Reminders (FR5, FR9)]
    P --> Q[Venue Staff Follows Up on Overdue Payment]
    Q --> R[Flow Ends: Payment Tracked/Managed]

    O -->|NO| R

graph TD
    A[Contract Preparation (FR4)] --> B{When to Send Contract?}
    B -->|Option A: With Proposal| C[Opportunity is Qualified]
    B -->|Option B: After Deal Won| D[Opportunity Status: Won / Customer (FR1, FR2)]

    C --> E[Staff Initiates Sending for E-signature]
    D --> E

    E --> F[eventRunner Integrates with E-signature Provider (FR4)]
    F --> G[eventRunner Sends Contract to Client (FR4)]
    G --> H[eventRunner Tracks Status: "Sent for Signature" (FR14)]
    H --> I[eventRunner Notifies Staff (FR9)]

    I --> J[Client Receives Contract Email]
    J --> K[Client Completes E-signature (FR4)]
    K --> L[E-signature Provider Confirms Signature]

    L --> M[Provider Sends Confirmation to eventRunner]
    M --> N[eventRunner Attaches Signed Contract to Customer (FR4)]
    N --> O[eventRunner Adds Signed Contract to Project Workspace (FR6)]
    O --> P[eventRunner Notifies Staff about Signed Contract (FR9)]

    P --> Q[Contract Signing Triggers Initial Payment Request (FR5)]
    Q --> R[eventRunner Sends Payment Notifications (FR9)]
    R --> S[Flow Ends: Formal Agreement Secured]

    S --> T[Ongoing Access & Mgmt of Docs in Project (FR4, FR6)]
```

## T3 Stack Implementation Guidelines

### Technical Foundation

This frontend specification is implemented using the **T3 Stack** which provides the following technical benefits aligned with our UX goals:

#### **Next.js 14 App Router**
- **Server Components** for optimal performance and SEO
- **Client Components** for interactive elements
- **Parallel Routes** for complex layouts like split-view contact details
- **Intercepting Routes** for modal workflows (document preview, payment forms)

#### **TypeScript + tRPC Integration**
- **End-to-end type safety** eliminates UI bugs from data mismatches
- **Auto-completion** improves developer experience and reduces errors
- **Runtime validation** ensures data integrity between frontend and backend

#### **Tailwind CSS + shadcn/ui**
- **Utility-first approach** enables rapid UI development
- **Consistent design system** through shadcn/ui components
- **Responsive design** built-in for desktop and mobile experiences
- **Custom theming** for venue branding requirements

### Component Architecture Implementation

#### **Page-Level Components** (Next.js App Router)
```typescript
// Contact Management Pages
src/app/(dashboard)/contacts/
├── page.tsx                    # Contact list with filtering/search
├── [id]/
│   ├── page.tsx                # Contact detail view with tabs
│   └── loading.tsx             # Loading states for better UX

// CRM Pipeline Pages  
src/app/(dashboard)/opportunities/
├── page.tsx                    # Kanban board view
└── [id]/
    └── page.tsx                # Opportunity detail modal

// Project Collaboration
src/app/(dashboard)/projects/
├── page.tsx                    # Project list
└── [id]/
    ├── page.tsx                # Internal project view
    └── client/
        └── page.tsx            # Client-facing portal
```

#### **Feature Components** (Reusable UI Modules)
```typescript
// Contact Management
src/components/features/contacts/
├── ContactCard.tsx             # Individual contact display
├── ContactList.tsx             # Filterable contact grid/list
├── ContactForm.tsx             # Contact creation/editing
├── LeadHeatIndicator.tsx       # Visual lead heat display
└── InteractionTimeline.tsx     # Contact interaction history

// CRM Pipeline
src/components/features/opportunities/
├── KanbanBoard.tsx             # Drag-and-drop pipeline
├── OpportunityCard.tsx         # Opportunity display card
├── StageColumn.tsx             # Pipeline stage container
├── DateConflictAlert.tsx       # Date conflict warnings
└── OpportunityForm.tsx         # Opportunity creation/editing

// Project Collaboration
src/components/features/projects/
├── ProjectKanban.tsx           # Project task board
├── ChatPanel.tsx               # Real-time messaging
├── TaskCard.tsx                # Individual task display
├── FileUpload.tsx              # Document sharing
└── ClientPortal.tsx            # Client-facing workspace
```

### Design System Implementation

#### **shadcn/ui Base Components**
The UI specification leverages shadcn/ui components for consistency:

- **Navigation:** `NavigationMenu`, `Breadcrumb`, `Tabs`
- **Data Display:** `Table`, `Card`, `Badge`, `Avatar`
- **Forms:** `Form`, `Input`, `Select`, `Textarea`, `Checkbox`
- **Feedback:** `Toast`, `Alert`, `Progress`, `Skeleton`
- **Layout:** `Sheet`, `Dialog`, `Popover`, `Separator`
- **Interactive:** `Button`, `DropdownMenu`, `Switch`, `Slider`

#### **Custom Theme Configuration**
```typescript
// tailwind.config.js - Venue branding support
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary brand colors (customizable per venue)
        primary: {
          50: 'hsl(var(--primary-50))',
          500: 'hsl(var(--primary-500))',
          900: 'hsl(var(--primary-900))',
        },
        // Semantic colors for lead heat, status indicators
        heat: {
          cold: 'hsl(var(--heat-cold))',
          warm: 'hsl(var(--heat-warm))',
          hot: 'hsl(var(--heat-hot))',
        },
        status: {
          available: 'hsl(var(--status-available))',
          conflict: 'hsl(var(--status-conflict))',
          booked: 'hsl(var(--status-booked))',
        }
      }
    }
  }
}
```

### State Management Implementation

#### **Server State via tRPC**
```typescript
// Contact data fetching with optimistic updates
const ContactList = () => {
  const { data: contacts, isLoading } = api.contact.getAll.useQuery();
  const createContact = api.contact.create.useMutation({
    onMutate: async (newContact) => {
      // Optimistic update for immediate UI feedback
      await utils.contact.getAll.cancel();
      const previousContacts = utils.contact.getAll.getData();
      utils.contact.getAll.setData(undefined, (old) => [
        ...old ?? [], 
        { ...newContact, id: 'temp', createdAt: new Date() }
      ]);
      return { previousContacts };
    },
    onError: (err, newContact, context) => {
      // Rollback on error
      utils.contact.getAll.setData(undefined, context?.previousContacts);
    },
    onSettled: () => {
      // Always refetch after mutation
      utils.contact.getAll.invalidate();
    },
  });
};
```

#### **Client State via Zustand**
```typescript
// UI state management for complex interactions
interface UIState {
  // Kanban board state
  selectedOpportunity: string | null;
  draggedItem: { id: string; type: 'opportunity' | 'task' } | null;
  
  // Navigation state
  sidebarCollapsed: boolean;
  currentProjectId: string | null;
  
  // Modal/overlay state
  activeModal: 'contact-form' | 'opportunity-detail' | null;
  
  // Actions
  setSelectedOpportunity: (id: string | null) => void;
  toggleSidebar: () => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}
```

### Real-time Features Implementation

#### **Supabase Integration for Live Updates**
```typescript
// Real-time project collaboration
const ProjectChat = ({ projectId }: { projectId: string }) => {
  const { data: messages } = api.project.getMessages.useQuery({ projectId });
  
  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      }, (payload) => {
        // Update local state with new message
        utils.project.getMessages.setData({ projectId }, (old) => [
          ...old ?? [],
          payload.new as Message
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);
};
```

### Performance Optimization

#### **Next.js Optimization Features**
- **Image Optimization:** `next/image` for automatic optimization
- **Code Splitting:** Route-based and component-based lazy loading
- **Server Components:** Reduce client-side JavaScript bundle
- **Streaming:** Progressive page loading with Suspense boundaries

#### **User Experience Optimizations**
```typescript
// Loading states and skeleton screens
const ContactListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-20 w-full" />
    ))}
  </div>
);

// Error boundaries for graceful failure
const ContactListWithErrorBoundary = () => (
  <ErrorBoundary fallback={<ContactListError />}>
    <Suspense fallback={<ContactListSkeleton />}>
      <ContactList />
    </Suspense>
  </ErrorBoundary>
);
```

### Accessibility Implementation

#### **Built-in Accessibility Features**
- **Keyboard Navigation:** Full keyboard support for all interactive elements
- **Screen Reader Support:** Proper ARIA labels and semantic HTML
- **Focus Management:** Logical focus flow and visible focus indicators
- **Color Contrast:** WCAG AA compliant color combinations
- **Responsive Design:** Mobile-first approach with touch-friendly targets

#### **shadcn/ui Accessibility Benefits**
All shadcn/ui components come with accessibility features built-in:
- **Form validation** with clear error messages
- **Modal management** with focus trapping
- **Dropdown menus** with proper keyboard navigation
- **Data tables** with sorting and filtering announcements

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-01 | 1.1 | Added T3 Stack implementation guidelines and technical specifications | Winston (AI Architect) |
