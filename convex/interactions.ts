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

    // Automatically recalculate heat score
    await recalculateContactHeatScoreSimple(ctx, args.contactId);

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
    useAdvancedScoring: v.optional(v.boolean()),
    scoringConfig: v.optional(v.object({
      timeDecayEnabled: v.boolean(),
      timeDecayHalfLife: v.number(),
      recencyBoostEnabled: v.boolean(),
      recencyBoostWindow: v.number(),
      recencyBoostMultiplier: v.number(),
      frequencyBoostEnabled: v.boolean(),
      frequencyBoostThreshold: v.number(),
      frequencyBoostMultiplier: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Sales staff and above can trigger heat score calculations
    await requireRole(ctx, "SALES");

    // Get all interactions for this contact
    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();

    let heatScore: number;

    if (args.useAdvancedScoring) {
      // Use advanced scoring with configurable parameters
      const config = {
        baseWeights: {
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
        },
        timeDecayEnabled: args.scoringConfig?.timeDecayEnabled ?? true,
        timeDecayHalfLife: args.scoringConfig?.timeDecayHalfLife ?? 30,
        recencyBoostEnabled: args.scoringConfig?.recencyBoostEnabled ?? true,
        recencyBoostWindow: args.scoringConfig?.recencyBoostWindow ?? 7,
        recencyBoostMultiplier: args.scoringConfig?.recencyBoostMultiplier ?? 1.5,
        frequencyBoostEnabled: args.scoringConfig?.frequencyBoostEnabled ?? true,
        frequencyBoostThreshold: args.scoringConfig?.frequencyBoostThreshold ?? 3,
        frequencyBoostMultiplier: args.scoringConfig?.frequencyBoostMultiplier ?? 1.3,
      };

      heatScore = calculateAdvancedHeatScore(interactions, config);
    } else {
      // Use simple scoring for backward compatibility
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

      heatScore = interactions.reduce((total, interaction) => {
        return total + (interactionWeights[interaction.type] || 0);
      }, 0);
    }

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

    return { 
      heatScore, 
      leadHeat, 
      interactionCount: interactions.length,
      scoringMethod: args.useAdvancedScoring ? 'advanced' : 'simple'
    };
  },
});

// Helper function for advanced heat score calculation
function calculateAdvancedHeatScore(interactions: any[], config: any): number {
  if (interactions.length === 0) return 0;

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;

  let totalScore = 0;

  for (const interaction of interactions) {
    const createdAt = interaction.createdAt || now;
    const ageInDays = (now - createdAt) / dayMs;
    
    // Base score from interaction type
    let baseScore = config.baseWeights[interaction.type] || 0;
    
    // Time decay calculation
    if (config.timeDecayEnabled) {
      const decayFactor = Math.pow(0.5, ageInDays / config.timeDecayHalfLife);
      baseScore *= decayFactor;
    }
    
    // Recency boost
    if (config.recencyBoostEnabled && ageInDays <= config.recencyBoostWindow) {
      baseScore *= config.recencyBoostMultiplier;
    }
    
    totalScore += baseScore;
  }

  // Frequency boost
  if (config.frequencyBoostEnabled) {
    const weeklyInteractionCount = interactions.filter(i => {
      const age = (now - (i.createdAt || now)) / weekMs;
      return age <= 1;
    }).length;
    
    if (weeklyInteractionCount >= config.frequencyBoostThreshold) {
      totalScore *= config.frequencyBoostMultiplier;
    }
  }

  return Math.round(totalScore * 100) / 100;
}

// Helper function for automatic heat score recalculation
async function recalculateContactHeatScoreSimple(ctx: any, contactId: any): Promise<{ heatScore: number; leadHeat: "COLD" | "WARM" | "HOT" }> {
  // Get all interactions for this contact
  const interactions = await ctx.db
    .query("interactions")
    .withIndex("by_contact", (q: any) => q.eq("contactId", contactId))
    .collect();

  // Use simple scoring for automatic recalculation (performance)
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

  const heatScore = interactions.reduce((total: number, interaction: any) => {
    return total + (interactionWeights[interaction.type as keyof typeof interactionWeights] || 0);
  }, 0);

  // Determine heat level
  let leadHeat: "COLD" | "WARM" | "HOT" = "COLD";
  if (heatScore >= 16) {
    leadHeat = "HOT";
  } else if (heatScore >= 6) {
    leadHeat = "WARM";
  }

  // Update contact with new heat score
  await ctx.db.patch(contactId, {
    leadHeatScore: heatScore,
    leadHeat: leadHeat,
    updatedAt: Date.now(),
  });

  return { heatScore, leadHeat };
}

// Automatic heat score recalculation when interactions are added
export const recalculateHeatScoreOnInteraction = mutation({
  args: {
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    // This is called automatically when interactions are created/updated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    return await recalculateContactHeatScoreSimple(ctx, args.contactId);
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

    // Automatically recalculate heat score after deletion
    await recalculateContactHeatScoreSimple(ctx, interaction.contactId);

    return { success: true };
  },
});