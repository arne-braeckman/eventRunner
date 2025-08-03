# Epic List (Revised)

* **Epic 1: Core System Foundation & Local Environment Setup.**
    * **Goal:** Establish the foundational T3 Stack infrastructure configured for local development, implement initial multi-user role management with Clerk authentication, and enable basic lead capture to ensure initial system access and data entry. This prioritizes rapid development through type-safe fullstack integration.
    * **Key FRs addressed (core setup):** FR7 (Multi-User Roles & Customization - core), initial aspects of FR1 (Contact & Lead Mgmt), fundamental NFRs (Deployment Flexibility - local, initial Security, Usability), and foundational setup for FR8 (Centralized Communication Integrations - e.g., web forms).
    * **Specifics for Core System Foundation & Local Environment Setup:**
        * The core T3 Stack components to be set up locally include a **Next.js 15 application** with **tRPC API routes**, **Convex database and functions**, and **Clerk authentication** with JWT integration.
        * Essential development tools for consistent local environment setup will include **Node.js runtime environment**, **pnpm package manager**, **Convex CLI**, and **Git** for version control.
        * The monorepo structure will contain a single Next.js application with organized directories for frontend components, tRPC routers, Convex schema and functions, and shared utilities.
    * **Initial Scope for Basic Lead Capture:**
        * "Basic lead capture" in this epic will strictly entail implementing **simple web (lead capture) forms** that store essential contact details (e.g., name, email, phone) directly into the local database (FR1).
        * **Social media integrations (from FR8)** and the **lead heat calculation system (from FR1)** are explicitly deferred to later epics.
    * **Initial Scope for Multi-User Role Management:**
        * For FR7, the absolute minimum roles to be functional in Epic 1 will be **Admin** and **Sales**.
        * Initial user authentication will utilize **Clerk with OAuth providers** (Google, GitHub, etc.) and JWT-based session management integrated with Convex (FR7). Advanced role-based permissions and additional authentication providers will be implemented in subsequent epics.
* **Epic 2: Lead Management, Sales Touchpoints & Social Integrations.**
    * **Goal:** Implement comprehensive lead management with rich data, dynamic lead heat indicators, and customer journey tracking, fully integrating social media channels (Facebook, Instagram, LinkedIn) and initial communication streams for effective early client inquiry and sales touchpoint engagement.
    * **Key FRs addressed:** FR1 (Contact & Lead Mgmt - full expanded detail), FR8 (Centralized Communication Integrations - *specifically Facebook, Instagram, LinkedIn aspects for lead capture/interaction*).
    * **Specifics for "Comprehensive Lead Management with Rich Data":**
        * While not explicitly identified as missed, to ensure robust lead profiles, essential initial data points to be captured beyond those in FR1 will include: **geographic location** (city/region), **preferred event type interest**, and **specific source details** (e.g., campaign, referral).
        * The system will capture contact information from social media pages and web forms primarily through **APIs or web scrapers**, with the potential to integrate **third-party tools** for this purpose.
    * **Specifics for "Dynamic Lead Heat Indicators & Customer Journey Tracking":**
        * A **foundational subset** of the detailed scoring factors (follows, likes, info requests, price quotes, site visits, event organization history from FR1) will be implemented for the initial lead heat calculation in this epic, depending on the feasibility of API integrations for each factor.
        * Initial customer journey milestones will be tracked as **labels on the contact page**: "Unqualified" for contacts created from social interactions with little to no direct engagement, and "Prospect" after a few interactions. Subsequent stages (Lead, Qualified Opportunity, Customer, Lost Deal) will be managed through the Kanban-style sales funnel (from FR2) in a later epic.
    * **Specifics for "Fully Integrating Social Media Channels (Facebook, Instagram, LinkedIn)":**
        * Core integration requirements for these platforms include finding and measuring **followers, post likes, and comments** as measured interactions linked to a contact. Direct message (DM) functionality through these social platforms must be **routed to a centralized inbox within `eventRunner`** and will automatically count as leads.
        * The system will attempt to match **Google Analytics website visit data** to contacts originating from social media to raise their lead heat score (this implies a new integration requirement for Google Analytics).
        * **Full bi-directional synchronization** is only expected for **DM's or private messages** in this epic; it is not yet required for public posts or comments.
    * **Specifics for "Initial Communication Streams for Sales Touchpoint Engagement":**
        * This epic will ensure initial email sending and receiving capabilities (linked to leads) are fully functional, alongside responses to web form submissions.
        * The system will support basic follow-up actions directly from the lead record.
* **Epic 3: Sales Pipeline & Opportunity Tracking.**
    * **Goal:** Deliver the fully customizable CRM sales pipeline with detailed opportunity card information, advanced date conflict management, and basic LLM-powered sales suggestions to efficiently track sales progression.
    * **Key FRs addressed:** FR2 (CRM Sales Pipeline Management - full expanded detail), FR3 (LLM-Powered Assistant - basic tier).
* **Epic 4: Proposal Generation & Tracking.**
    * **Goal:** Enable the generation and robust tracking of proposals, ensuring clear visibility of their follow-up statuses, and integrate foundational document template capabilities for sales literature.
    * **Key FRs addressed:** FR14 (Proposal Tracking & Visibility), initial FR4 (Document & Contract Management - proposals/sales literature).
* **Epic 5: Formal Agreements & Digital Signatures.**
    * **Goal:** Implement the full document and contract lifecycle management with secure e-signature capabilities, allowing for the digital formalization of client agreements.
    * **Key FRs addressed:** FR4 (Document & Contract Management - full e-signature/contracts, excluding payment links).
* **Epic 6: Core Financial Transactions (Logic Only).**
    * **Goal:** Implement the core logic for down payments and staged billing, including customizable payment schedules and automated reminders, without external payment gateway integrations in this phase.
    * **Key FRs addressed:** FR5 (Payment Management - core logic, internal management, reminders; *excluding gateway integrations*).
* **Epic 7: Client Project Collaboration Hub.**
    * **Goal:** Deliver the branded, project-specific shared workspace for clients, enabling seamless project-related communication via an in-house chat system, client-view Kanban boards, and centralized file sharing.
    * **Key FRs addressed:** FR6 (Project Link & Collaboration - full expanded detail), FR15 (Event-Specific Communication Workflow).
* **Epic 8: Operational Intelligence & Automation Core.**
    * **Goal:** Provide robust analytics and reporting across sales and projects, implement initial project automation features (e.g., lead time planning), and establish a comprehensive notification system for all users.
    * **Key FRs addressed:** FR11 (Robust Analytics & Reporting - core), FR13 (Project Automation), FR9 (Notifications System).
* **Epic 9: Payment Gateway Integrations & Enhanced Financial Reporting.**
    * **Goal:** Integrate `eventRunner` with external payment gateways (PayPal, Stripe, Belgian gateways) to support down payments and staged billing, and enhance analytics with comprehensive payment tracking and financial reporting.
    * **Key FRs addressed:** FR5 (Payment Management - *full gateway integrations*), FR11 (Robust Analytics & Reporting - payment tracking refinement).
* **Epic 10: Comprehensive Communication Channels & User Onboarding.**
    * **Goal:** Implement the tailored onboarding wizard for new venue staff and clients, and integrate advanced external communication channels (WhatsApp, full email integration, softphone) for a complete communication hub, supporting the shift to in-house project chat.
    * **Key FRs addressed:** FR10 (Onboarding Wizard - full expanded detail), FR8 (Centralized Communication Integrations - *excluding Facebook, Instagram, LinkedIn, which are now in Epic 2*).
