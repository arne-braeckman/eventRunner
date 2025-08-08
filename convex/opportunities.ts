import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./auth";

// Create new opportunity
export const createOpportunity = mutation({
  args: {
    name: v.string(),
    contactId: v.id("contacts"),
    stage: v.optional(v.union(
      v.literal("PROSPECT"),
      v.literal("QUALIFIED"),
      v.literal("PROPOSAL"),
      v.literal("NEGOTIATION"),
      v.literal("CLOSED_WON"),
      v.literal("CLOSED_LOST")
    )),
    value: v.number(),
    eventType: v.union(
      v.literal("WEDDING"),
      v.literal("CORPORATE"),
      v.literal("BIRTHDAY"),
      v.literal("ANNIVERSARY"),
      v.literal("CONFERENCE"),
      v.literal("GALA"),
      v.literal("OTHER")
    ),
    eventDate: v.number(), // timestamp
    guestCount: v.number(),
    requiresCatering: v.boolean(),
    roomAssignment: v.optional(v.string()),
    venueRequirements: v.optional(v.string()),
    probability: v.optional(v.number()),
    expectedCloseDate: v.optional(v.number()),
    description: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    customFields: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    // Only SALES and ADMIN roles can create opportunities
    await requireRole(ctx, "SALES");
    
    const now = Date.now();
    
    // Verify the contact exists
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }
    
    // Set default probability based on stage
    const defaultProbabilities = {
      PROSPECT: 10,
      QUALIFIED: 25,
      PROPOSAL: 50,
      NEGOTIATION: 75,
      CLOSED_WON: 100,
      CLOSED_LOST: 0
    };
    
    const stage = args.stage || "PROSPECT";
    const probability = args.probability !== undefined ? args.probability : defaultProbabilities[stage];
    
    return await ctx.db.insert("opportunities", {
      name: args.name,
      contactId: args.contactId,
      stage,
      value: args.value,
      eventType: args.eventType,
      eventDate: args.eventDate,
      guestCount: args.guestCount,
      requiresCatering: args.requiresCatering,
      roomAssignment: args.roomAssignment,
      venueRequirements: args.venueRequirements,
      probability,
      expectedCloseDate: args.expectedCloseDate,
      description: args.description,
      assignedTo: args.assignedTo,
      customFields: args.customFields || {},
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all opportunities with optional filtering
export const getAllOpportunities = query({
  args: {
    stage: v.optional(v.union(
      v.literal("PROSPECT"),
      v.literal("QUALIFIED"),
      v.literal("PROPOSAL"),
      v.literal("NEGOTIATION"),
      v.literal("CLOSED_WON"),
      v.literal("CLOSED_LOST")
    )),
    eventType: v.optional(v.union(
      v.literal("WEDDING"),
      v.literal("CORPORATE"),
      v.literal("BIRTHDAY"),
      v.literal("ANNIVERSARY"),
      v.literal("CONFERENCE"),
      v.literal("GALA"),
      v.literal("OTHER")
    )),
    assignedTo: v.optional(v.id("users")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check authentication but don't enforce roles for viewing opportunities
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    let opportunities = await ctx.db.query("opportunities").collect();
    
    // Apply filters
    let filteredOpportunities = opportunities;
    
    if (args.stage !== undefined) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.stage === args.stage);
    }
    
    if (args.eventType !== undefined) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.eventType === args.eventType);
    }
    
    if (args.assignedTo !== undefined) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.assignedTo === args.assignedTo);
    }
    
    if (args.isActive !== undefined) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.isActive === args.isActive);
    }
    
    return filteredOpportunities;
  },
});

// Get opportunities by contact
export const getOpportunitiesByContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    return await ctx.db
      .query("opportunities")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();
  },
});

// Get single opportunity by ID
export const getOpportunityById = query({
  args: { opportunityId: v.id("opportunities") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    return await ctx.db.get(args.opportunityId);
  },
});

// Update opportunity stage
export const updateOpportunityStage = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    stage: v.union(
      v.literal("PROSPECT"),
      v.literal("QUALIFIED"),
      v.literal("PROPOSAL"),
      v.literal("NEGOTIATION"),
      v.literal("CLOSED_WON"),
      v.literal("CLOSED_LOST")
    ),
    probability: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "SALES");
    
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }
    
    // Auto-set probability based on stage if not provided
    const defaultProbabilities = {
      PROSPECT: 10,
      QUALIFIED: 25,
      PROPOSAL: 50,
      NEGOTIATION: 75,
      CLOSED_WON: 100,
      CLOSED_LOST: 0
    };
    
    const probability = args.probability !== undefined ? args.probability : defaultProbabilities[args.stage];
    
    return await ctx.db.patch(args.opportunityId, {
      stage: args.stage,
      probability,
      updatedAt: Date.now(),
    });
  },
});

// Update opportunity details
export const updateOpportunity = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    name: v.optional(v.string()),
    value: v.optional(v.number()),
    eventType: v.optional(v.union(
      v.literal("WEDDING"),
      v.literal("CORPORATE"),
      v.literal("BIRTHDAY"),
      v.literal("ANNIVERSARY"),
      v.literal("CONFERENCE"),
      v.literal("GALA"),
      v.literal("OTHER")
    )),
    eventDate: v.optional(v.number()),
    guestCount: v.optional(v.number()),
    requiresCatering: v.optional(v.boolean()),
    roomAssignment: v.optional(v.string()),
    venueRequirements: v.optional(v.string()),
    probability: v.optional(v.number()),
    expectedCloseDate: v.optional(v.number()),
    description: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    customFields: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "SALES");
    
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }
    
    const updateData: any = {
      updatedAt: Date.now(),
    };
    
    // Only update fields that are provided
    if (args.name !== undefined) updateData.name = args.name;
    if (args.value !== undefined) updateData.value = args.value;
    if (args.eventType !== undefined) updateData.eventType = args.eventType;
    if (args.eventDate !== undefined) updateData.eventDate = args.eventDate;
    if (args.guestCount !== undefined) updateData.guestCount = args.guestCount;
    if (args.requiresCatering !== undefined) updateData.requiresCatering = args.requiresCatering;
    if (args.roomAssignment !== undefined) updateData.roomAssignment = args.roomAssignment;
    if (args.venueRequirements !== undefined) updateData.venueRequirements = args.venueRequirements;
    if (args.probability !== undefined) updateData.probability = args.probability;
    if (args.expectedCloseDate !== undefined) updateData.expectedCloseDate = args.expectedCloseDate;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.assignedTo !== undefined) updateData.assignedTo = args.assignedTo;
    if (args.customFields !== undefined) updateData.customFields = args.customFields;
    
    return await ctx.db.patch(args.opportunityId, updateData);
  },
});

// Soft delete opportunity (set isActive to false)
export const deleteOpportunity = mutation({
  args: { opportunityId: v.id("opportunities") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "SALES");
    
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }
    
    return await ctx.db.patch(args.opportunityId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

// Get opportunities with date conflicts (same event date)
export const getDateConflicts = query({
  args: {
    eventDate: v.number(),
    excludeOpportunityId: v.optional(v.id("opportunities")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    let conflicts = await ctx.db
      .query("opportunities")
      .withIndex("by_event_date", (q) => q.eq("eventDate", args.eventDate))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Exclude the current opportunity if provided
    if (args.excludeOpportunityId) {
      conflicts = conflicts.filter(opp => opp._id !== args.excludeOpportunityId);
    }
    
    return conflicts;
  },
});

// Revenue forecasting query
export const getRevenueForecasting = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    let query = ctx.db.query("opportunities").filter((q) => q.eq(q.field("isActive"), true));
    
    const opportunities = await query.collect();
    
    // Filter by date range if provided
    let filteredOpportunities = opportunities;
    if (args.startDate || args.endDate) {
      filteredOpportunities = opportunities.filter(opp => {
        const closeDate = opp.expectedCloseDate || opp.eventDate;
        if (args.startDate && closeDate < args.startDate) return false;
        if (args.endDate && closeDate > args.endDate) return false;
        return true;
      });
    }
    
    // Calculate weighted values
    const forecasting = filteredOpportunities.map(opp => ({
      opportunityId: opp._id,
      name: opp.name,
      stage: opp.stage,
      value: opp.value,
      probability: opp.probability || 0,
      weightedValue: opp.value * ((opp.probability || 0) / 100),
      expectedCloseDate: opp.expectedCloseDate,
      eventDate: opp.eventDate,
    }));
    
    const totalValue = filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const totalWeightedValue = forecasting.reduce((sum, item) => sum + item.weightedValue, 0);
    
    return {
      opportunities: forecasting,
      summary: {
        totalOpportunities: filteredOpportunities.length,
        totalValue,
        totalWeightedValue,
        averageProbability: totalValue > 0 ? (totalWeightedValue / totalValue) * 100 : 0,
      }
    };
  },
});