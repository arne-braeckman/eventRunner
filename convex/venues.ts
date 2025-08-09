import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Venue CRUD operations
export const createVenue = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    capacity: v.number(),
    location: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    hourlyRate: v.optional(v.number()),
    dailyRate: v.optional(v.number()),
    setupTime: v.number(),
    cleanupTime: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("venues", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getVenues = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("venues");
    
    if (args.activeOnly) {
      query = query.withIndex("by_isActive", (q) => q.eq("isActive", true));
    }
    
    return await query.order("desc").collect();
  },
});

export const updateVenue = mutation({
  args: {
    id: v.id("venues"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    capacity: v.optional(v.number()),
    location: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    hourlyRate: v.optional(v.number()),
    dailyRate: v.optional(v.number()),
    setupTime: v.optional(v.number()),
    cleanupTime: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Venue availability management
export const createAvailabilitySlot = mutation({
  args: {
    venueId: v.id("venues"),
    date: v.number(),
    startTime: v.number(),
    endTime: v.number(),
    bookingStatus: v.optional(v.union(
      v.literal("AVAILABLE"),
      v.literal("TENTATIVE"),
      v.literal("CONFIRMED"),
      v.literal("BLOCKED")
    )),
    opportunityId: v.optional(v.id("opportunities")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("venueAvailability", {
      ...args,
      isBooked: args.bookingStatus === "CONFIRMED",
      bookingStatus: args.bookingStatus || "AVAILABLE",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getVenueAvailability = query({
  args: {
    venueId: v.optional(v.id("venues")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    bookingStatus: v.optional(v.union(
      v.literal("AVAILABLE"),
      v.literal("TENTATIVE"),
      v.literal("CONFIRMED"),
      v.literal("BLOCKED")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("venueAvailability");
    
    if (args.venueId) {
      query = query.withIndex("by_venue", (q) => q.eq("venueId", args.venueId));
    }
    
    if (args.bookingStatus) {
      query = query.withIndex("by_booking_status", (q) => q.eq("bookingStatus", args.bookingStatus));
    }
    
    const slots = await query.collect();
    
    // Filter by date range if provided
    return slots.filter(slot => {
      if (args.startDate && slot.startTime < args.startDate) return false;
      if (args.endDate && slot.endTime > args.endDate) return false;
      return true;
    });
  },
});

export const updateAvailabilitySlot = mutation({
  args: {
    id: v.id("venueAvailability"),
    bookingStatus: v.optional(v.union(
      v.literal("AVAILABLE"),
      v.literal("TENTATIVE"),
      v.literal("CONFIRMED"),
      v.literal("BLOCKED")
    )),
    opportunityId: v.optional(v.id("opportunities")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      isBooked: args.bookingStatus === "CONFIRMED",
      updatedAt: Date.now(),
    });
  },
});

// Date conflict detection
export const checkDateConflicts = query({
  args: {
    venueId: v.optional(v.id("venues")),
    startTime: v.number(),
    endTime: v.number(),
    excludeOpportunityId: v.optional(v.id("opportunities")),
  },
  handler: async (ctx, args) => {
    const conflicts = [];
    
    // Get existing bookings that overlap with the requested time
    const existingBookings = await ctx.db
      .query("venueAvailability")
      .withIndex("by_date_range", (q) => 
        q.gte("startTime", args.startTime - 24 * 60 * 60 * 1000) // Check 1 day before
         .lte("endTime", args.endTime + 24 * 60 * 60 * 1000) // Check 1 day after
      )
      .collect();
    
    for (const booking of existingBookings) {
      // Skip if same opportunity
      if (args.excludeOpportunityId && booking.opportunityId === args.excludeOpportunityId) {
        continue;
      }
      
      // Skip if different venue (if venue specified)
      if (args.venueId && booking.venueId !== args.venueId) {
        continue;
      }
      
      // Check for time overlap
      const hasOverlap = (
        (args.startTime >= booking.startTime && args.startTime < booking.endTime) ||
        (args.endTime > booking.startTime && args.endTime <= booking.endTime) ||
        (args.startTime <= booking.startTime && args.endTime >= booking.endTime)
      );
      
      if (hasOverlap && (booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "TENTATIVE")) {
        const venue = await ctx.db.get(booking.venueId);
        const opportunity = booking.opportunityId ? await ctx.db.get(booking.opportunityId) : null;
        
        conflicts.push({
          conflictType: "VENUE_DOUBLE_BOOKING" as const,
          booking,
          venue,
          opportunity,
          overlapStart: Math.max(args.startTime, booking.startTime),
          overlapEnd: Math.min(args.endTime, booking.endTime),
        });
      }
    }
    
    return conflicts;
  },
});

export const logConflict = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    conflictType: v.union(
      v.literal("VENUE_DOUBLE_BOOKING"),
      v.literal("RESOURCE_CONFLICT"),
      v.literal("STAFF_UNAVAILABLE"),
      v.literal("TIME_OVERLAP")
    ),
    conflictingOpportunityId: v.optional(v.id("opportunities")),
    venueId: v.optional(v.id("venues")),
    conflictDate: v.number(),
    severity: v.union(
      v.literal("LOW"),
      v.literal("MEDIUM"),
      v.literal("HIGH"),
      v.literal("CRITICAL")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conflictDetectionLog", {
      ...args,
      isResolved: false,
      detectedAt: Date.now(),
    });
  },
});

export const resolveConflict = mutation({
  args: {
    conflictId: v.id("conflictDetectionLog"),
    resolutionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.conflictId, {
      isResolved: true,
      resolvedAt: Date.now(),
      resolutionNotes: args.resolutionNotes,
    });
  },
});

export const getConflicts = query({
  args: {
    opportunityId: v.optional(v.id("opportunities")),
    venueId: v.optional(v.id("venues")),
    unresolvedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("conflictDetectionLog");
    
    if (args.opportunityId) {
      query = query.withIndex("by_opportunity", (q) => q.eq("opportunityId", args.opportunityId));
    }
    
    if (args.venueId) {
      query = query.withIndex("by_venue", (q) => q.eq("venueId", args.venueId));
    }
    
    if (args.unresolvedOnly) {
      query = query.withIndex("by_is_resolved", (q) => q.eq("isResolved", false));
    }
    
    return await query.order("desc").collect();
  },
});

// Suggest alternative dates for conflicted bookings
export const suggestAlternativeDates = query({
  args: {
    venueId: v.id("venues"),
    preferredDate: v.number(),
    duration: v.number(), // in milliseconds
    searchRange: v.optional(v.number()), // days to search before/after, default 14
  },
  handler: async (ctx, args) => {
    const searchRange = args.searchRange || 14;
    const searchStart = args.preferredDate - (searchRange * 24 * 60 * 60 * 1000);
    const searchEnd = args.preferredDate + (searchRange * 24 * 60 * 60 * 1000);
    
    const venue = await ctx.db.get(args.venueId);
    if (!venue) return [];
    
    const existingBookings = await ctx.db
      .query("venueAvailability")
      .withIndex("by_venue_date", (q) => q.eq("venueId", args.venueId))
      .filter((q) => 
        q.and(
          q.gte(q.field("startTime"), searchStart),
          q.lte(q.field("endTime"), searchEnd)
        )
      )
      .collect();
    
    const suggestions = [];
    
    // Generate time slots for each day in the search range
    for (let day = searchStart; day <= searchEnd; day += 24 * 60 * 60 * 1000) {
      const dayStart = new Date(day).setHours(9, 0, 0, 0); // 9 AM
      const dayEnd = new Date(day).setHours(22, 0, 0, 0); // 10 PM
      
      // Check availability for this day
      const dayBookings = existingBookings.filter(booking => 
        booking.startTime >= dayStart && booking.endTime <= dayEnd + 24 * 60 * 60 * 1000
      );
      
      // Find available time slots
      let currentTime = dayStart;
      while (currentTime + args.duration <= dayEnd) {
        const slotEnd = currentTime + args.duration + venue.setupTime * 60 * 1000 + venue.cleanupTime * 60 * 1000;
        
        const hasConflict = dayBookings.some(booking => 
          (currentTime >= booking.startTime && currentTime < booking.endTime) ||
          (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
          (currentTime <= booking.startTime && slotEnd >= booking.endTime)
        );
        
        if (!hasConflict) {
          suggestions.push({
            startTime: currentTime,
            endTime: currentTime + args.duration,
            venue,
            isPreferredDate: Math.abs(currentTime - args.preferredDate) < 24 * 60 * 60 * 1000,
          });
        }
        
        currentTime += 60 * 60 * 1000; // Move to next hour
      }
    }
    
    return suggestions.sort((a, b) => 
      Math.abs(a.startTime - args.preferredDate) - Math.abs(b.startTime - args.preferredDate)
    );
  },
});