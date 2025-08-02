# Unified Project Structure

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
│   ├── schema.ts                  # Convex schema definition
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
│   │   │           └── route.ts   # Convex Auth handler
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
│   │   ├── auth.ts                # Convex Auth configuration
│   │   └── convex.ts              # Convex client
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
