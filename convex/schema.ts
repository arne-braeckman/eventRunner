import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_assignedTo", ["assignedTo"]),
});