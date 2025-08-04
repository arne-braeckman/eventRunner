import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./auth";

// Journey stage progression rules configuration
export interface StageProgressionRule {
  _id?: string;
  fromStage: string;
  toStage: string;
  triggerType: "INTERACTION_COUNT" | "TIME_BASED" | "LEAD_HEAT_INCREASE" | "FORM_SUBMISSION" | "EMAIL_ENGAGEMENT";
  triggerCondition: any; // Specific condition data based on trigger type
  isActive: boolean;
  priority: number; // Higher numbers take precedence
  createdAt: number;
  updatedAt: number;
}

// Interaction types that can trigger stage progression
const VALID_INTERACTION_TYPES = [
  "EMAIL_SENT", "EMAIL_OPENED", "EMAIL_CLICKED", "EMAIL_REPLIED",
  "PHONE_CALL", "MEETING_SCHEDULED", "MEETING_COMPLETED",
  "FORM_SUBMITTED", "WEBSITE_VISIT", "PROPOSAL_SENT", "CONTRACT_SENT",
  "PAYMENT_RECEIVED", "SOCIAL_MEDIA_ENGAGEMENT", "REFERRAL_GIVEN"
] as const;

// Default progression rules for a venue management system
const DEFAULT_PROGRESSION_RULES: Omit<StageProgressionRule, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    fromStage: "UNQUALIFIED",
    toStage: "PROSPECT",
    triggerType: "INTERACTION_COUNT",
    triggerCondition: {
      interactionTypes: ["FORM_SUBMITTED", "EMAIL_REPLIED", "PHONE_CALL"],
      minCount: 1
    },
    isActive: true,
    priority: 1
  },
  {
    fromStage: "PROSPECT", 
    toStage: "LEAD",
    triggerType: "INTERACTION_COUNT",
    triggerCondition: {
      interactionTypes: ["MEETING_SCHEDULED", "PROPOSAL_SENT"],
      minCount: 1
    },
    isActive: true,
    priority: 1
  },
  {
    fromStage: "LEAD",
    toStage: "QUALIFIED", 
    triggerType: "LEAD_HEAT_INCREASE",
    triggerCondition: {
      minHeatLevel: "WARM",
      requiredInteractions: ["MEETING_COMPLETED", "PROPOSAL_SENT"]
    },
    isActive: true,
    priority: 1
  },
  {
    fromStage: "QUALIFIED",
    toStage: "CUSTOMER",
    triggerType: "INTERACTION_COUNT",
    triggerCondition: {
      interactionTypes: ["CONTRACT_SENT", "PAYMENT_RECEIVED"],
      minCount: 1
    },
    isActive: true,
    priority: 1
  },
  {
    fromStage: "PROSPECT",
    toStage: "LOST",
    triggerType: "TIME_BASED",
    triggerCondition: {
      daysSinceLastInteraction: 90,
      noResponseToEmails: 3
    },
    isActive: true,
    priority: 2
  }
];

// Get all active progression rules
export const getProgressionRules = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    return await ctx.db
      .query("stageProgressionRules")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

// Create or update a progression rule
export const upsertProgressionRule = mutation({
  args: {
    ruleId: v.optional(v.id("stageProgressionRules")),
    fromStage: v.union(
      v.literal("UNQUALIFIED"),
      v.literal("PROSPECT"), 
      v.literal("LEAD"),
      v.literal("QUALIFIED"),
      v.literal("CUSTOMER")
    ),
    toStage: v.union(
      v.literal("PROSPECT"),
      v.literal("LEAD"),
      v.literal("QUALIFIED"),
      v.literal("CUSTOMER"),
      v.literal("LOST")
    ),
    triggerType: v.union(
      v.literal("INTERACTION_COUNT"),
      v.literal("TIME_BASED"),
      v.literal("LEAD_HEAT_INCREASE"),
      v.literal("FORM_SUBMISSION"),
      v.literal("EMAIL_ENGAGEMENT")
    ),
    triggerCondition: v.any(),
    isActive: v.boolean(),
    priority: v.number(),
  },
  handler: async (ctx, args) => {
    // Only admins can manage progression rules
    await requireRole(ctx, "ADMIN");
    
    const now = Date.now();
    
    if (args.ruleId) {
      // Update existing rule
      return await ctx.db.patch(args.ruleId, {
        fromStage: args.fromStage,
        toStage: args.toStage,
        triggerType: args.triggerType,
        triggerCondition: args.triggerCondition,
        isActive: args.isActive,
        priority: args.priority,
        updatedAt: now,
      });
    } else {
      // Create new rule
      return await ctx.db.insert("stageProgressionRules", {
        fromStage: args.fromStage,
        toStage: args.toStage,
        triggerType: args.triggerType,
        triggerCondition: args.triggerCondition,
        isActive: args.isActive,
        priority: args.priority,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Initialize default progression rules (run once during setup)
export const initializeDefaultRules = mutation({
  handler: async (ctx) => {
    await requireRole(ctx, "ADMIN");
    
    const existingRules = await ctx.db.query("stageProgressionRules").collect();
    if (existingRules.length > 0) {
      return { message: "Default rules already exist", count: existingRules.length };
    }
    
    const now = Date.now();
    let created = 0;
    
    for (const rule of DEFAULT_PROGRESSION_RULES) {
      await ctx.db.insert("stageProgressionRules", {
        ...rule,
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }
    
    return { message: `Created ${created} default progression rules`, count: created };
  },
});

// Evaluate if a contact should progress to the next stage
export const evaluateStageProgression = mutation({
  args: {
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Get contact current state
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // Get all active progression rules for current stage
    const applicableRules = await ctx.db
      .query("stageProgressionRules")
      .filter((q) => 
        q.and(
          q.eq(q.field("fromStage"), contact.status),
          q.eq(q.field("isActive"), true)
        )
      )
      .order("desc") // Higher priority first
      .collect();

    if (applicableRules.length === 0) {
      return { 
        progressionMade: false, 
        message: "No applicable progression rules found",
        currentStage: contact.status 
      };
    }

    // Get contact interactions for evaluation
    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();

    // Evaluate each rule in priority order
    for (const rule of applicableRules) {
      const shouldProgress = await evaluateRule(ctx, contact, rule, interactions);
      
      if (shouldProgress) {
        // Update contact stage
        await ctx.db.patch(args.contactId, {
          status: rule.toStage as any,
          updatedAt: Date.now(),
        });

        // Log the stage progression
        await ctx.db.insert("interactions", {
          contactId: args.contactId,
          type: "STAGE_PROGRESSION",
          description: `Automatically progressed from ${rule.fromStage} to ${rule.toStage}`,
          metadata: {
            ruleId: rule._id,
            triggerType: rule.triggerType,
            triggerCondition: rule.triggerCondition,
            automated: true
          },
          timestamp: Date.now(),
        });

        return {
          progressionMade: true,
          fromStage: rule.fromStage,
          toStage: rule.toStage,
          ruleApplied: rule._id,
          message: `Contact progressed from ${rule.fromStage} to ${rule.toStage}`
        };
      }
    }

    return { 
      progressionMade: false, 
      message: "No progression rules were triggered",
      currentStage: contact.status,
      rulesEvaluated: applicableRules.length
    };
  },
});

// Helper function to evaluate a specific rule
async function evaluateRule(
  ctx: any, 
  contact: any, 
  rule: StageProgressionRule, 
  interactions: any[]
): Promise<boolean> {
  const now = Date.now();
  
  switch (rule.triggerType) {
    case "INTERACTION_COUNT": {
      const { interactionTypes, minCount } = rule.triggerCondition;
      const matchingInteractions = interactions.filter(i => 
        interactionTypes.includes(i.type)
      );
      return matchingInteractions.length >= minCount;
    }

    case "TIME_BASED": {
      const { daysSinceLastInteraction, noResponseToEmails } = rule.triggerCondition;
      const lastInteraction = interactions
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      if (!lastInteraction) return false;
      
      const daysSince = (now - lastInteraction.timestamp) / (1000 * 60 * 60 * 24);
      const emailsWithoutResponse = interactions
        .filter(i => i.type === "EMAIL_SENT")
        .filter(email => {
          // Check if there's a reply after this email
          const repliesAfter = interactions.filter(i => 
            i.type === "EMAIL_REPLIED" && i.timestamp > email.timestamp
          );
          return repliesAfter.length === 0;
        });
      
      return daysSince >= daysSinceLastInteraction && 
             emailsWithoutResponse.length >= noResponseToEmails;
    }

    case "LEAD_HEAT_INCREASE": {
      const { minHeatLevel, requiredInteractions } = rule.triggerCondition;
      const heatLevels = { "COLD": 1, "WARM": 2, "HOT": 3 };
      const hasMinHeat = heatLevels[contact.leadHeat as keyof typeof heatLevels] >= 
                        heatLevels[minHeatLevel as keyof typeof heatLevels];
      
      const hasRequiredInteractions = requiredInteractions.every((reqType: string) =>
        interactions.some(i => i.type === reqType)
      );
      
      return hasMinHeat && hasRequiredInteractions;
    }

    case "FORM_SUBMISSION": {
      return interactions.some(i => i.type === "FORM_SUBMITTED");
    }

    case "EMAIL_ENGAGEMENT": {
      const { minEngagementScore } = rule.triggerCondition;
      const emailInteractions = interactions.filter(i => 
        ["EMAIL_OPENED", "EMAIL_CLICKED", "EMAIL_REPLIED"].includes(i.type)
      );
      const engagementScore = emailInteractions.length;
      return engagementScore >= minEngagementScore;
    }

    default:
      return false;
  }
}

// Run progression evaluation for all active contacts
export const runBulkStageProgression = mutation({
  handler: async (ctx) => {
    // Only admins or system can run bulk progression
    await requireRole(ctx, "ADMIN");
    
    const activeContacts = await ctx.db
      .query("contacts")
      .filter((q) => 
        q.neq(q.field("status"), "CUSTOMER") && 
        q.neq(q.field("status"), "LOST")
      )
      .collect();

    let progressionsMade = 0;
    const results = [];

    for (const contact of activeContacts) {
      try {
        // Evaluate progression rules for this contact
        const applicableRules = await ctx.db
          .query("stageProgressionRules")
          .filter((q) => 
            q.and(
              q.eq(q.field("fromStage"), contact.status),
              q.eq(q.field("isActive"), true)
            )
          )
          .order("desc")
          .collect();

        if (applicableRules.length === 0) {
          continue;
        }

        // Get contact interactions for evaluation
        const interactions = await ctx.db
          .query("interactions")
          .withIndex("by_contact", (q) => q.eq("contactId", contact._id))
          .collect();

        // Evaluate each rule in priority order
        let progressionMade = false;
        let fromStage = contact.status;
        let toStage = contact.status;
        let ruleApplied = null;

        for (const rule of applicableRules) {
          const shouldProgress = await evaluateRule(ctx, contact, rule, interactions);
          
          if (shouldProgress) {
            // Update contact stage
            await ctx.db.patch(contact._id, {
              status: rule.toStage as any,
              updatedAt: Date.now(),
            });

            // Log the stage progression
            await ctx.db.insert("interactions", {
              contactId: contact._id,
              type: "STAGE_PROGRESSION",
              description: `Automatically progressed from ${rule.fromStage} to ${rule.toStage}`,
              metadata: {
                ruleId: rule._id,
                triggerType: rule.triggerType,
                triggerCondition: rule.triggerCondition,
                automated: true
              },
              timestamp: Date.now(),
              createdAt: Date.now(),
            });

            progressionMade = true;
            fromStage = rule.fromStage;
            toStage = rule.toStage;
            ruleApplied = rule._id;
            break;
          }
        }

        if (progressionMade) {
          progressionsMade++;
          results.push({
            contactId: contact._id,
            contactName: contact.name,
            progressionMade: true,
            fromStage,
            toStage,
            ruleApplied,
            message: `Contact progressed from ${fromStage} to ${toStage}`
          });
        }
      } catch (error) {
        results.push({
          contactId: contact._id,
          contactName: contact.name,
          error: error instanceof Error ? error.message : "Unknown error",
          progressionMade: false
        });
      }
    }

    return {
      totalContactsEvaluated: activeContacts.length,
      progressionsMade,
      results: results.filter(r => r.progressionMade || r.error)
    };
  },
});

// Get progression history for a contact
export const getContactProgressionHistory = query({
  args: {
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    return await ctx.db
      .query("interactions")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .filter((q) => q.eq(q.field("type"), "STAGE_PROGRESSION"))
      .order("desc")
      .collect();
  },
});