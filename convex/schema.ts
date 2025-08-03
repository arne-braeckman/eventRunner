import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
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
    leadHeatScore: v.number(),
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
    socialProfiles: v.array(v.object({
      platform: v.union(
        v.literal("FACEBOOK"),
        v.literal("INSTAGRAM"),
        v.literal("LINKEDIN"),
        v.literal("TWITTER"),
        v.literal("TIKTOK")
      ),
      profileUrl: v.string(),
      username: v.optional(v.string()),
      isConnected: v.boolean(),
      lastSyncAt: v.optional(v.number()),
    })),
    customFields: v.object({}),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastInteractionAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_leadHeat", ["leadHeat"])
    .index("by_leadHeatScore", ["leadHeatScore"])
    .index("by_lastInteractionAt", ["lastInteractionAt"]),

  interactions: defineTable({
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
    metadata: v.object({}),
    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_contact", ["contactId"])
    .index("by_contact_type", ["contactId", "type"])
    .index("by_contact_createdAt", ["contactId", "createdAt"])
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),
});