# API Specification

## tRPC Router Structure

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
      // Implementation with Convex
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
// Convex handles real-time automatically, integrated with Clerk authentication
export const getProjectMessages = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    // Clerk JWT authentication via Convex
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    return await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    projectId: v.id("projects"),
    content: v.string(),
    messageType: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, content, messageType = "text" }) => {
    // Clerk authentication integration
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    // Get user from Convex database using Clerk identity
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email || ""))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return await ctx.db.insert("messages", {
      projectId,
      senderId: user._id,
      content,
      messageType,
      createdAt: Date.now(),
    });
  },
});
```

## Authentication Integration

### tRPC Context with Clerk

```typescript
// server/api/trpc.ts - tRPC context with Clerk authentication
import { auth } from "@clerk/nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { userId } = await auth();

  return {
    userId,
    // Convex client will automatically use Clerk JWT tokens
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const publicProcedure = t.procedure;
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

### Convex Functions with Clerk Authentication

```typescript
// convex/auth.ts - Helper functions for Clerk authentication
import type { UserIdentity } from "convex/server";

export const requireAuth = async (ctx: any): Promise<UserIdentity> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  return identity;
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    // Look up user in Convex database
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email || ""))
      .first();
  },
});
```

### Authentication Flow

1. **Client Authentication**: Clerk handles OAuth providers (Google, GitHub) and JWT token management
2. **tRPC Middleware**: Validates Clerk user session for protected procedures
3. **Convex Integration**: Clerk JWT tokens are automatically validated by Convex `ctx.auth.getUserIdentity()`
4. **User Resolution**: Convex functions look up users in database using Clerk identity email
5. **Permission Checks**: Role-based authorization implemented in individual Convex functions
