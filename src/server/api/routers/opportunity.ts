import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { api } from "../../../../convex/_generated/api";
import { ConvexError } from "convex/values";

// Zod schemas for validation
const opportunityStageSchema = z.enum([
  "PROSPECT",
  "QUALIFIED", 
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST"
]);

const eventTypeSchema = z.enum([
  "WEDDING",
  "CORPORATE",
  "BIRTHDAY",
  "ANNIVERSARY",
  "CONFERENCE",
  "GALA",
  "OTHER"
]);

export const opportunityRouter = createTRPCRouter({
  // Create new opportunity
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1, "Opportunity name is required"),
      contactId: z.string().min(1, "Contact ID is required"),
      stage: opportunityStageSchema.optional(),
      value: z.number().min(0, "Value must be positive"),
      eventType: eventTypeSchema,
      eventDate: z.number().min(0, "Event date is required"),
      guestCount: z.number().min(1, "Guest count must be at least 1"),
      requiresCatering: z.boolean(),
      roomAssignment: z.string().optional(),
      probability: z.number().min(0).max(100).optional(),
      expectedCloseDate: z.number().optional(),
      description: z.string().optional(),
      assignedTo: z.string().optional(),
      customFields: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Note: Authentication is handled by Convex requireRole in the mutation
        const convex = ctx.convex;
        return await convex.mutation(api.opportunities.createOpportunity, {
          ...input,
          contactId: input.contactId as any, // Type assertion for Convex ID
          assignedTo: input.assignedTo as any,
        });
      } catch (error) {
        if (error instanceof ConvexError) {
          throw new Error(error.data);
        }
        throw error;
      }
    }),

  // Get all opportunities with filtering
  getAll: publicProcedure
    .input(z.object({
      stage: opportunityStageSchema.optional(),
      eventType: eventTypeSchema.optional(),
      assignedTo: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const convex = ctx.convex;
        return await convex.query(api.opportunities.getAllOpportunities, {
          ...input,
          assignedTo: input.assignedTo as any,
        });
      } catch (error) {
        if (error instanceof ConvexError) {
          throw new Error(error.data);
        }
        throw error;
      }
    }),

  // Get opportunities by contact
  getByContact: publicProcedure
    .input(z.object({
      contactId: z.string().min(1, "Contact ID is required"),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const convex = ctx.convex;
        return await convex.query(api.opportunities.getOpportunitiesByContact, {
          contactId: input.contactId as any,
        });
      } catch (error) {
        if (error instanceof ConvexError) {
          throw new Error(error.data);
        }
        throw error;
      }
    }),

  // Get single opportunity by ID
  getById: publicProcedure
    .input(z.object({
      opportunityId: z.string().min(1, "Opportunity ID is required"),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const convex = ctx.convex;
        return await convex.query(api.opportunities.getOpportunityById, {
          opportunityId: input.opportunityId as any,
        });
      } catch (error) {
        if (error instanceof ConvexError) {
          throw new Error(error.data);
        }
        throw error;
      }
    }),

  // Update opportunity stage
  updateStage: publicProcedure
    .input(z.object({
      opportunityId: z.string().min(1, "Opportunity ID is required"),
      stage: opportunityStageSchema,
      probability: z.number().min(0).max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const convex = ctx.convex;
        return await convex.mutation(api.opportunities.updateOpportunityStage, {
          ...input,
          opportunityId: input.opportunityId as any,
        });
      } catch (error) {
        if (error instanceof ConvexError) {
          throw new Error(error.data);
        }
        throw error;
      }
    }),

  // Update opportunity details
  update: publicProcedure
    .input(z.object({
      opportunityId: z.string().min(1, "Opportunity ID is required"),
      name: z.string().min(1).optional(),
      value: z.number().min(0).optional(),
      eventType: eventTypeSchema.optional(),
      eventDate: z.number().optional(),
      guestCount: z.number().min(1).optional(),
      requiresCatering: z.boolean().optional(),
      roomAssignment: z.string().optional(),
      probability: z.number().min(0).max(100).optional(),
      expectedCloseDate: z.number().optional(),
      description: z.string().optional(),
      assignedTo: z.string().optional(),
      customFields: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const convex = ctx.convex;
        return await convex.mutation(api.opportunities.updateOpportunity, {
          ...input,
          opportunityId: input.opportunityId as any,
          assignedTo: input.assignedTo as any,
        });
      } catch (error) {
        if (error instanceof ConvexError) {
          throw new Error(error.data);
        }
        throw error;
      }
    }),

  // Soft delete opportunity
  delete: publicProcedure
    .input(z.object({
      opportunityId: z.string().min(1, "Opportunity ID is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const convex = ctx.convex;
        return await convex.mutation(api.opportunities.deleteOpportunity, {
          opportunityId: input.opportunityId as any,
        });
      } catch (error) {
        if (error instanceof ConvexError) {
          throw new Error(error.data);
        }
        throw error;
      }
    }),

  // Get date conflicts
  getDateConflicts: publicProcedure
    .input(z.object({
      eventDate: z.number().min(0, "Event date is required"),
      excludeOpportunityId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const convex = ctx.convex;
        return await convex.query(api.opportunities.getDateConflicts, {
          ...input,
          excludeOpportunityId: input.excludeOpportunityId as any,
        });
      } catch (error) {
        if (error instanceof ConvexError) {
          throw new Error(error.data);
        }
        throw error;
      }
    }),

  // Revenue forecasting
  getRevenueForecasting: publicProcedure
    .input(z.object({
      startDate: z.number().optional(),
      endDate: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const convex = ctx.convex;
        return await convex.query(api.opportunities.getRevenueForecasting, input);
      } catch (error) {
        if (error instanceof ConvexError) {
          throw new Error(error.data);
        }
        throw error;
      }
    }),
});