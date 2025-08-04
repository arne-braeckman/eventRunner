import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./auth";

export const createInteraction = mutation({
  args: {
    contactId: v.id("contacts"),
    type: v.union(
      v.literal("SOCIAL_FOLLOW"),
      v.literal("SOCIAL_LIKE"),
      v.literal("SOCIAL_COMMENT"),
      v.literal("SOCIAL_MESSAGE"),
      v.literal("WEBSITE_VISIT"),
      v.literal("INFO_REQUEST"),
      v.literal("PRICE_QUOTE"),
      v.literal("SITE_VISIT"),
      v.literal("EMAIL_OPEN"),
      v.literal("EMAIL_CLICK"),
      v.literal("PHONE_CALL"),
      v.literal("MEETING"),
      v.literal("OTHER")
    ),
    platform: v.optional(v.union(
      v.literal("FACEBOOK"),
      v.literal("INSTAGRAM"),
      v.literal("LINKEDIN"),
      v.literal("TWITTER"),
      v.literal("TIKTOK")
    )),
    description: v.optional(v.string()),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    // All authenticated staff can create interactions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const now = Date.now();
    
    // Create the interaction
    const interactionId = await ctx.db.insert("interactions", {
      contactId: args.contactId,
      type: args.type,
      platform: args.platform,
      description: args.description,
      metadata: args.metadata || {},
      createdAt: now,
      createdBy: identity.subject as any,
    });

    // Update contact's lastInteractionAt
    await ctx.db.patch(args.contactId, {
      lastInteractionAt: now,
      updatedAt: now,
    });

    return interactionId;
  },
});

export const getInteractionsByContact = query({
  args: {
    contactId: v.id("contacts"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_contact_createdAt", (q) => q.eq("contactId", args.contactId))
      .order("desc")
      .collect();

    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const total = interactions.length;
    const paginatedInteractions = interactions.slice(offset, offset + limit);

    return {
      interactions: paginatedInteractions,
      total,
      hasMore: offset + limit < total,
    };
  },
});

export const getInteractionsByType = query({
  args: {
    type: v.union(
      v.literal("SOCIAL_FOLLOW"),
      v.literal("SOCIAL_LIKE"),
      v.literal("SOCIAL_COMMENT"),
      v.literal("SOCIAL_MESSAGE"),
      v.literal("WEBSITE_VISIT"),
      v.literal("INFO_REQUEST"),
      v.literal("PRICE_QUOTE"),
      v.literal("SITE_VISIT"),
      v.literal("EMAIL_OPEN"),
      v.literal("EMAIL_CLICK"),
      v.literal("PHONE_CALL"),
      v.literal("MEETING"),
      v.literal("OTHER")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    return await ctx.db
      .query("interactions")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .order("desc")
      .take(args.limit || 50);
  },
});

export const calculateContactHeatScore = mutation({
  args: {
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    // Sales staff and above can trigger heat score calculations
    await requireRole(ctx, "SALES");

    // Get all interactions for this contact
    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();

    // Calculate heat score based on interaction weights
    const interactionWeights = {
      SOCIAL_FOLLOW: 1,
      SOCIAL_LIKE: 1,
      SOCIAL_COMMENT: 2,
      SOCIAL_MESSAGE: 3,
      WEBSITE_VISIT: 2,
      INFO_REQUEST: 5,
      PRICE_QUOTE: 8,
      SITE_VISIT: 10,
      EMAIL_OPEN: 1,
      EMAIL_CLICK: 2,
      PHONE_CALL: 5,
      MEETING: 8,
      OTHER: 1,
    };

    const heatScore = interactions.reduce((total, interaction) => {
      return total + (interactionWeights[interaction.type] || 0);
    }, 0);

    // Determine heat level
    let leadHeat: "COLD" | "WARM" | "HOT" = "COLD";
    if (heatScore >= 16) {
      leadHeat = "HOT";
    } else if (heatScore >= 6) {
      leadHeat = "WARM";
    }

    // Update contact with new heat score
    await ctx.db.patch(args.contactId, {
      leadHeatScore: heatScore,
      leadHeat: leadHeat,
      updatedAt: Date.now(),
    });

    return { heatScore, leadHeat };
  },
});

export const deleteInteraction = mutation({
  args: {
    interactionId: v.id("interactions"),
  },
  handler: async (ctx, args) => {
    // Sales staff and above can delete interactions
    await requireRole(ctx, "SALES");

    const interaction = await ctx.db.get(args.interactionId);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    await ctx.db.delete(args.interactionId);

    // Recalculate heat score for the contact
    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_contact", (q) => q.eq("contactId", interaction.contactId))
      .collect();

    const interactionWeights = {
      SOCIAL_FOLLOW: 1,
      SOCIAL_LIKE: 1,
      SOCIAL_COMMENT: 2,
      SOCIAL_MESSAGE: 3,
      WEBSITE_VISIT: 2,
      INFO_REQUEST: 5,
      PRICE_QUOTE: 8,
      SITE_VISIT: 10,
      EMAIL_OPEN: 1,
      EMAIL_CLICK: 2,
      PHONE_CALL: 5,
      MEETING: 8,
      OTHER: 1,
    };

    const heatScore = interactions.reduce((total, inter) => {
      return total + (interactionWeights[inter.type] || 0);
    }, 0);

    let leadHeat: "COLD" | "WARM" | "HOT" = "COLD";
    if (heatScore >= 16) {
      leadHeat = "HOT";
    } else if (heatScore >= 6) {
      leadHeat = "WARM";
    }

    await ctx.db.patch(interaction.contactId, {
      leadHeatScore: heatScore,
      leadHeat: leadHeat,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});