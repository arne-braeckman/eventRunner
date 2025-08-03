# Technical Assumptions

This section outlines the foundational technical decisions that will guide the Architect in designing `eventRunner`'s system. These choices will serve as key constraints and architectural guidelines.

* **Repository Structure: Monorepo (T3 Stack)**
    * **Rationale:** A monorepo structure using the T3 Stack approach provides unified development experience with shared types and utilities. This simplifies dependency management, ensures consistency across the fullstack application, and accelerates development velocity through end-to-end type safety.
* **Service Architecture: Monolithic Fullstack Application**
    * **Rationale:** A unified Next.js application with integrated API routes provides simpler deployment, better developer experience, and optimal performance for eventRunner's requirements. The T3 Stack's type-safe architecture ensures scalability while maintaining development simplicity, which is crucial for rapid iteration and feature delivery.
* **Testing Requirements: Comprehensive Testing Strategy**
    * **Rationale:** Multi-layered testing approach including unit tests (Vitest), integration tests (tRPC), and end-to-end tests (Playwright) to ensure reliability. This strategy leverages TypeScript's compile-time guarantees while providing runtime confidence through comprehensive test coverage.
* **T3 Technology Stack Selection:**
    * **Frontend Framework: Next.js 15**
        * **Rationale:** Next.js provides a complete fullstack framework with App Router, React Server Components, and optimal performance. It enables server-side rendering, static generation, and seamless API integration, perfect for eventRunner's dynamic web application needs.
    * **Type Safety: TypeScript + tRPC**
        * **Rationale:** End-to-end type safety from database to UI eliminates entire classes of bugs and provides excellent developer experience. tRPC ensures API contracts are enforced at compile time, reducing integration errors.
    * **Database: Convex Serverless Database**
        * **Rationale:** Convex provides a complete backend-as-a-service with real-time capabilities built-in. It offers type-safe database access, automatic scaling, and real-time subscriptions essential for collaborative features. The serverless architecture eliminates database management overhead while providing excellent TypeScript integration and enhanced security through function-level access control.
    * **Hosting Platform: Vercel**
        * **Rationale:** Vercel is optimized for Next.js applications, providing edge functions, automatic scaling, and seamless deployment. It offers excellent performance for European users and integrates perfectly with the T3 Stack architecture.
    * **Authentication: Clerk**
        * **Rationale:** Clerk provides enterprise-grade authentication with comprehensive user management, multiple OAuth providers (Google, GitHub, etc.), and seamless JWT integration with Convex. It offers superior developer experience, built-in security features, hosted user management dashboard, and eliminates authentication infrastructure overhead. Clerk's JWT tokens integrate perfectly with Convex's authentication system, providing end-to-end security while maintaining excellent scalability and compliance.
