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
    leadHeatScore: v.optional(v.number()),
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
    geographicLocation: v.optional(v.string()),
    preferredEventType: v.optional(v.string()),
    socialProfiles: v.optional(v.array(v.object({
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
    }))),
    customFields: v.optional(v.object({})),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastInteractionAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_leadHeat", ["leadHeat"])
    .index("by_leadHeatScore", ["leadHeatScore"])
    .index("by_lastInteractionAt", ["lastInteractionAt"])
    .index("by_geographicLocation", ["geographicLocation"])
    .index("by_preferredEventType", ["preferredEventType"]),

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
      v.literal("OTHER"),
      // New interaction types for journey stage management
      v.literal("EMAIL_SENT"),
      v.literal("EMAIL_OPENED"),
      v.literal("EMAIL_CLICKED"),
      v.literal("EMAIL_REPLIED"),
      v.literal("MEETING_SCHEDULED"),
      v.literal("MEETING_COMPLETED"),
      v.literal("FORM_SUBMITTED"),
      v.literal("PROPOSAL_SENT"),
      v.literal("CONTRACT_SENT"),
      v.literal("PAYMENT_RECEIVED"),
      v.literal("SOCIAL_MEDIA_ENGAGEMENT"),
      v.literal("REFERRAL_GIVEN"),
      v.literal("STAGE_PROGRESSION")
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
    timestamp: v.optional(v.number()), // For backwards compatibility, use timestamp or createdAt
    createdAt: v.number(),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_contact", ["contactId"])
    .index("by_contact_type", ["contactId", "type"])
    .index("by_contact_createdAt", ["contactId", "createdAt"])
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),

  opportunities: defineTable({
    name: v.string(),
    contactId: v.id("contacts"),
    stage: v.union(
      v.literal("PROSPECT"),
      v.literal("QUALIFIED"),
      v.literal("PROPOSAL"),
      v.literal("NEGOTIATION"),
      v.literal("CLOSED_WON"),
      v.literal("CLOSED_LOST")
    ),
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
    probability: v.optional(v.number()), // 0-100 probability of closing
    expectedCloseDate: v.optional(v.number()), // timestamp
    description: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    customFields: v.optional(v.object({})),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_contact", ["contactId"])
    .index("by_stage", ["stage"])
    .index("by_event_date", ["eventDate"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_value", ["value"])
    .index("by_event_type", ["eventType"])
    .index("by_is_active", ["isActive"])
    .index("by_expected_close_date", ["expectedCloseDate"]),

  stageProgressionRules: defineTable({
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
    triggerCondition: v.any(), // Flexible condition object based on trigger type
    isActive: v.boolean(),
    priority: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_fromStage", ["fromStage"])
    .index("by_isActive", ["isActive"])
    .index("by_priority", ["priority"]),
});