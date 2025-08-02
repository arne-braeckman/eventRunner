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
// Convex handles real-time automatically, no need for manual subscriptions
export const getProjectMessages = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    await requireAuth(ctx);
    
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
    const user = await requireAuth(ctx);
    
    return await ctx.db.insert("messages", {
      projectId,
      senderId: user._id,
      content,
      messageType,
    });
  },
});
```
