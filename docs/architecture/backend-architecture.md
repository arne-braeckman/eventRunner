# Backend Architecture

## Service Architecture (tRPC-based)

Since the T3 Stack uses a monolithic approach with tRPC, the "backend" is integrated into the Next.js application through API routes and server-side functions.

### tRPC Router Organization
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
  auth.ts             # Convex Auth configuration
  convex.ts          # Convex client instance
```

### Server-side Function Template
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

## Database Architecture

### Convex Integration
```typescript
// convex/schema.ts - Type-safe database schema
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("ADMIN"),
      v.literal("SALES"), 
      v.literal("PROJECT_MANAGER"),
      v.literal("STAFF"),
      v.literal("CLIENT")
    )),
  }).index("email", ["email"]),

  contacts: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    leadSource: v.union(
      v.literal("WEBSITE"),
      v.literal("FACEBOOK"),
      v.literal("INSTAGRAM"), 
      v.literal("LINKEDIN"),
      v.literal("REFERRAL"),
      v.literal("DIRECT"),
      v.literal("OTHER")
    ),
    leadHeat: v.union(
      v.literal("COLD"),
      v.literal("WARM"),
      v.literal("HOT")
    ),
    status: v.union(
      v.literal("UNQUALIFIED"),
      v.literal("PROSPECT"),
      v.literal("LEAD"),
      v.literal("QUALIFIED"),
      v.literal("CUSTOMER"),
      v.literal("LOST")
    ),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_assignedTo", ["assignedTo"]),
});
```

### Data Access Patterns
```typescript
// convex/contacts.ts - Convex data access functions
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./auth";

export const createContact = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    leadSource: v.union(v.literal("WEBSITE"), v.literal("FACEBOOK"), /* ... */),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    
    // Get user to check permissions
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email || ""))
      .first();
    
    if (!user || !['ADMIN', 'SALES'].includes(user.role || '')) {
      throw new Error("Unauthorized: insufficient permissions");
    }
    
    return await ctx.db.insert("contacts", {
      ...args,
      assignedTo: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getContacts = query({
  args: {
    status: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    let contacts = ctx.db.query("contacts");
    
    if (args.status) {
      contacts = contacts.withIndex("by_status", (q) => q.eq("status", args.status));
    }
    
    const results = await contacts.collect();
    
    // Client-side filtering for search (or use full-text search)
    if (args.search) {
      return results.filter(contact => 
        contact.name.toLowerCase().includes(args.search!.toLowerCase()) ||
        contact.email.toLowerCase().includes(args.search!.toLowerCase())
      );
    }
    
    return results;
  },
});

export const calculateLeadHeat = mutation({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    // Get contact's interactions (assuming interactions table exists)
    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();
    
    // Calculate heat score
    const heat = interactions.reduce((score, interaction) => {
      const scores = {
        SOCIAL_FOLLOW: 1,
        SOCIAL_LIKE: 1,
        WEBSITE_VISIT: 2,
        INFO_REQUEST: 5,
        PRICE_QUOTE: 8,
        SITE_VISIT: 10,
      };
      return score + (scores[interaction.type as keyof typeof scores] ?? 0);
    }, 0);
    
    // Update contact with calculated heat
    await ctx.db.patch(args.contactId, {
      leadHeat: heat > 15 ? "HOT" : heat > 5 ? "WARM" : "COLD",
      updatedAt: Date.now(),
    });
    
    return heat;
  },
});
```

## Authentication and Authorization

### Clerk Integration Configuration
```typescript
// middleware.ts - Next.js App Router middleware
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Convex Authentication Setup
```typescript
// convex.json - Convex authentication configuration
{
  "functions": "convex/",
  "authInfo": [
    {
      "domain": "https://clerk.dev",
      "applicationID": "convex"
    }
  ]
}
```

### Convex Auth Helper Functions
```typescript
// convex/auth.ts - Convex authentication helpers
import type { UserIdentity } from "convex/server";
import { query } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Look up user in Convex database
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email || ""))
      .first();
    
    return existingUser;
  },
});

export const requireAuth = async (ctx: any): Promise<UserIdentity> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  return identity;
};
```

### tRPC Context with Clerk
```typescript
// server/api/trpc.ts - tRPC context with Clerk authentication
import { auth } from "@clerk/nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { userId } = await auth();

  return {
    userId,
    // Convex client will use Clerk JWT automatically
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const protectedProcedure = t.procedure.use(
  async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
      ctx: {
        userId: ctx.userId,
      },
    });
  }
);
```
