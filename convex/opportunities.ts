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

// Enhanced date and venue conflict detection
export const getDateConflicts = query({
  args: {
    eventDate: v.number(),
    venueId: v.optional(v.id("venues")),
    eventDuration: v.optional(v.number()), // in milliseconds
    excludeOpportunityId: v.optional(v.id("opportunities")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const conflicts = [];
    const eventStart = args.eventDate;
    const eventEnd = args.eventDate + (args.eventDuration || 4 * 60 * 60 * 1000); // Default 4 hours
    
    // Check venue availability conflicts
    if (args.venueId) {
      const venueConflicts = await ctx.db
        .query("venueAvailability")
        .withIndex("by_venue", (q) => q.eq("venueId", args.venueId!))
        .filter((q) => 
          q.and(
            q.or(
              q.and(q.gte(q.field("startTime"), eventStart), q.lt(q.field("startTime"), eventEnd)),
              q.and(q.gt(q.field("endTime"), eventStart), q.lte(q.field("endTime"), eventEnd)),
              q.and(q.lte(q.field("startTime"), eventStart), q.gte(q.field("endTime"), eventEnd))
            ),
            q.or(
              q.eq(q.field("bookingStatus"), "CONFIRMED"),
              q.eq(q.field("bookingStatus"), "TENTATIVE")
            )
          )
        )
        .collect();
      
      for (const booking of venueConflicts) {
        if (booking.opportunityId && booking.opportunityId !== args.excludeOpportunityId) {
          const conflictingOpp = await ctx.db.get(booking.opportunityId);
          conflicts.push({
            type: "VENUE_CONFLICT",
            booking,
            opportunity: conflictingOpp,
            severity: booking.bookingStatus === "CONFIRMED" ? "HIGH" : "MEDIUM",
          });
        }
      }
    }
    
    // Check opportunity date conflicts (same date, regardless of venue)
    let dateConflicts = await ctx.db
      .query("opportunities")
      .withIndex("by_event_date", (q) => q.eq("eventDate", args.eventDate))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Exclude the current opportunity if provided
    if (args.excludeOpportunityId) {
      dateConflicts = dateConflicts.filter(opp => opp._id !== args.excludeOpportunityId);
    }
    
    for (const opp of dateConflicts) {
      conflicts.push({
        type: "DATE_CONFLICT",
        opportunity: opp,
        severity: "LOW",
      });
    }
    
    return conflicts;
  },
});

// Book venue for opportunity
export const bookVenueForOpportunity = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    venueId: v.id("venues"),
    eventDuration: v.number(), // in milliseconds
    bookingStatus: v.optional(v.union(
      v.literal("TENTATIVE"),
      v.literal("CONFIRMED")
    )),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "SALES");
    
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }
    
    const venue = await ctx.db.get(args.venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }
    
    // Check for conflicts first
    const conflicts = await ctx.db
      .query("venueAvailability")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .filter((q) => 
        q.and(
          q.or(
            q.and(q.gte(q.field("startTime"), opportunity.eventDate), q.lt(q.field("startTime"), opportunity.eventDate + args.eventDuration)),
            q.and(q.gt(q.field("endTime"), opportunity.eventDate), q.lte(q.field("endTime"), opportunity.eventDate + args.eventDuration)),
            q.and(q.lte(q.field("startTime"), opportunity.eventDate), q.gte(q.field("endTime"), opportunity.eventDate + args.eventDuration))
          ),
          q.or(
            q.eq(q.field("bookingStatus"), "CONFIRMED"),
            q.eq(q.field("bookingStatus"), "TENTATIVE")
          )
        )
      )
      .collect();
    
    if (conflicts.length > 0) {
      // Log the conflict
      await ctx.db.insert("conflictDetectionLog", {
        opportunityId: args.opportunityId,
        conflictType: "VENUE_DOUBLE_BOOKING",
        conflictingOpportunityId: conflicts[0]?.opportunityId,
        venueId: args.venueId,
        conflictDate: opportunity.eventDate,
        severity: "HIGH",
        isResolved: false,
        detectedAt: Date.now(),
      });
      
      throw new Error("Venue booking conflict detected. Cannot book overlapping time slot.");
    }
    
    const now = Date.now();
    const startTime = opportunity.eventDate - (venue.setupTime * 60 * 1000);
    const endTime = opportunity.eventDate + args.eventDuration + (venue.cleanupTime * 60 * 1000);
    
    // Create venue booking
    const bookingId = await ctx.db.insert("venueAvailability", {
      venueId: args.venueId,
      date: opportunity.eventDate,
      startTime,
      endTime,
      isBooked: args.bookingStatus === "CONFIRMED",
      opportunityId: args.opportunityId,
      bookingStatus: args.bookingStatus || "TENTATIVE",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
    
    // Update opportunity with venue assignment
    await ctx.db.patch(args.opportunityId, {
      roomAssignment: venue.name,
      updatedAt: now,
    });
    
    return bookingId;
  },
});

// Cancel venue booking for opportunity
export const cancelVenueBooking = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    venueId: v.optional(v.id("venues")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "SALES");
    
    // Find existing booking
    const bookings = await ctx.db
      .query("venueAvailability")
      .withIndex("by_opportunity", (q) => q.eq("opportunityId", args.opportunityId))
      .collect();
    
    let booking = bookings[0];
    if (args.venueId) {
      booking = bookings.find(b => b.venueId === args.venueId);
    }
    
    if (!booking) {
      throw new Error("Venue booking not found");
    }
    
    // Update booking to available
    await ctx.db.patch(booking._id, {
      isBooked: false,
      opportunityId: undefined,
      bookingStatus: "AVAILABLE",
      updatedAt: Date.now(),
    });
    
    // Update opportunity to remove venue assignment
    await ctx.db.patch(args.opportunityId, {
      roomAssignment: undefined,
      updatedAt: Date.now(),
    });
    
    return booking._id;
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

// Advanced pipeline analytics
export const getPipelineAnalytics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    groupBy: v.optional(v.union(
      v.literal("stage"),
      v.literal("eventType"),
      v.literal("assignedTo"),
      v.literal("month")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const opportunities = await ctx.db.query("opportunities")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Filter by date range if provided
    let filteredOpportunities = opportunities;
    if (args.startDate || args.endDate) {
      filteredOpportunities = opportunities.filter(opp => {
        if (args.startDate && opp.createdAt < args.startDate) return false;
        if (args.endDate && opp.createdAt > args.endDate) return false;
        return true;
      });
    }
    
    // Stage-wise metrics
    const stageMetrics = ["PROSPECT", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"].map(stage => {
      const stageOpps = filteredOpportunities.filter(opp => opp.stage === stage);
      const totalValue = stageOpps.reduce((sum, opp) => sum + opp.value, 0);
      const avgDaysInStage = stageOpps.length > 0 
        ? stageOpps.reduce((sum, opp) => sum + ((Date.now() - opp.updatedAt) / (24 * 60 * 60 * 1000)), 0) / stageOpps.length
        : 0;
      
      return {
        stage,
        count: stageOpps.length,
        value: totalValue,
        weightedValue: stageOpps.reduce((sum, opp) => sum + (opp.value * ((opp.probability || 0) / 100)), 0),
        avgProbability: stageOpps.length > 0 ? stageOpps.reduce((sum, opp) => sum + (opp.probability || 0), 0) / stageOpps.length : 0,
        avgDaysInStage: Math.round(avgDaysInStage),
      };
    });
    
    // Conversion rates between stages
    const conversionRates = {
      prospectToQualified: calculateConversionRate(filteredOpportunities, "PROSPECT", "QUALIFIED"),
      qualifiedToProposal: calculateConversionRate(filteredOpportunities, "QUALIFIED", "PROPOSAL"),
      proposalToNegotiation: calculateConversionRate(filteredOpportunities, "PROPOSAL", "NEGOTIATION"),
      negotiationToClosed: calculateConversionRate(filteredOpportunities, "NEGOTIATION", "CLOSED_WON"),
      overallWinRate: calculateWinRate(filteredOpportunities),
    };
    
    // Monthly trends (last 12 months)
    const monthlyTrends = generateMonthlyTrends(opportunities);
    
    // Performance by event type
    const eventTypeMetrics = ["WEDDING", "CORPORATE", "GALA", "CONFERENCE", "BIRTHDAY", "ANNIVERSARY", "OTHER"].map(eventType => {
      const typeOpps = filteredOpportunities.filter(opp => opp.eventType === eventType);
      return {
        eventType,
        count: typeOpps.length,
        value: typeOpps.reduce((sum, opp) => sum + opp.value, 0),
        avgValue: typeOpps.length > 0 ? typeOpps.reduce((sum, opp) => sum + opp.value, 0) / typeOpps.length : 0,
        winRate: calculateWinRate(typeOpps),
      };
    }).filter(metric => metric.count > 0);
    
    return {
      stageMetrics,
      conversionRates,
      monthlyTrends,
      eventTypeMetrics,
      summary: {
        totalOpportunities: filteredOpportunities.length,
        totalValue: filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0),
        avgDealSize: filteredOpportunities.length > 0 ? filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0) / filteredOpportunities.length : 0,
        winRate: calculateWinRate(filteredOpportunities),
        avgSalesCycle: calculateAvgSalesCycle(filteredOpportunities),
      }
    };
  },
});

// Sales performance by team member
export const getSalesPerformance = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const opportunities = await ctx.db.query("opportunities")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const users = await ctx.db.query("users").collect();
    
    // Filter by date range if provided
    let filteredOpportunities = opportunities;
    if (args.startDate || args.endDate) {
      filteredOpportunities = opportunities.filter(opp => {
        if (args.startDate && opp.createdAt < args.startDate) return false;
        if (args.endDate && opp.createdAt > args.endDate) return false;
        return true;
      });
    }
    
    const performanceByUser = users.map(user => {
      const userOpps = filteredOpportunities.filter(opp => opp.assignedTo === user._id);
      const closedWon = userOpps.filter(opp => opp.stage === "CLOSED_WON");
      
      return {
        userId: user._id,
        name: user.name || user.email,
        email: user.email,
        totalOpportunities: userOpps.length,
        closedWon: closedWon.length,
        totalValue: userOpps.reduce((sum, opp) => sum + opp.value, 0),
        closedValue: closedWon.reduce((sum, opp) => sum + opp.value, 0),
        winRate: userOpps.length > 0 ? (closedWon.length / userOpps.length) * 100 : 0,
        avgDealSize: userOpps.length > 0 ? userOpps.reduce((sum, opp) => sum + opp.value, 0) / userOpps.length : 0,
        avgSalesCycle: calculateAvgSalesCycle(closedWon),
      };
    }).filter(perf => perf.totalOpportunities > 0);
    
    return performanceByUser.sort((a, b) => b.closedValue - a.closedValue);
  },
});

// Helper functions
function calculateConversionRate(opportunities: any[], fromStage: string, toStage: string): number {
  const fromStageOpps = opportunities.filter(opp => opp.stage === fromStage);
  const toStageOpps = opportunities.filter(opp => opp.stage === toStage);
  
  if (fromStageOpps.length === 0) return 0;
  return Math.round((toStageOpps.length / (fromStageOpps.length + toStageOpps.length)) * 100);
}

function calculateWinRate(opportunities: any[]): number {
  if (opportunities.length === 0) return 0;
  const closedWon = opportunities.filter(opp => opp.stage === "CLOSED_WON").length;
  return Math.round((closedWon / opportunities.length) * 100);
}

function calculateAvgSalesCycle(opportunities: any[]): number {
  const closedOpps = opportunities.filter(opp => opp.stage === "CLOSED_WON");
  if (closedOpps.length === 0) return 0;
  
  const totalDays = closedOpps.reduce((sum, opp) => {
    return sum + ((opp.updatedAt - opp.createdAt) / (24 * 60 * 60 * 1000));
  }, 0);
  
  return Math.round(totalDays / closedOpps.length);
}

function generateMonthlyTrends(opportunities: any[]): any[] {
  const now = new Date();
  const trends = [];
  
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthOpps = opportunities.filter(opp => {
      const oppDate = new Date(opp.createdAt);
      return oppDate >= monthStart && oppDate <= monthEnd;
    });
    
    const closedWon = monthOpps.filter(opp => opp.stage === "CLOSED_WON");
    
    trends.push({
      month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
      totalOpportunities: monthOpps.length,
      totalValue: monthOpps.reduce((sum, opp) => sum + opp.value, 0),
      closedWon: closedWon.length,
      closedValue: closedWon.reduce((sum, opp) => sum + opp.value, 0),
      winRate: monthOpps.length > 0 ? (closedWon.length / monthOpps.length) * 100 : 0,
    });
  }
  
  return trends;
}