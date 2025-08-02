# Database Schema

## Convex Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Contact and Lead Management
const contacts = defineTable({
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  leadSource: v.union(
    v.literal("WEBSITE"),
    v.literal("FACEBOOK"),
    v.literal("INSTAGRAM"),
    v.literal("LINKEDIN"),
    v.literal("REFERRAL"),
    v.literal("DIRECT"),
    v.literal("OTHER")
  ),
  leadHeat: v.number(),
  status: v.union(
    v.literal("UNQUALIFIED"),
    v.literal("PROSPECT"),
    v.literal("LEAD"),
    v.literal("QUALIFIED"),
    v.literal("CUSTOMER"),
    v.literal("LOST")
  ),
  socialProfiles: v.optional(v.any()),
  customFields: v.optional(v.any()),
  venueId: v.optional(v.string()),
})
  .index("by_email", ["email"])
  .index("by_status", ["status"])
  .index("by_leadHeat", ["leadHeat"])
  .index("by_venue", ["venueId"]);

// Sales Pipeline
const opportunities = defineTable({
  name: v.string(),
  contactId: v.id("contacts"),
  stage: v.string(),
  value: v.optional(v.number()),
  eventType: v.optional(v.string()),
  eventDate: v.optional(v.number()), // Unix timestamp
  guestCount: v.optional(v.number()),
  requiresCatering: v.boolean(),
  roomAssignment: v.optional(v.string()),
  customFields: v.optional(v.any()),
  venueId: v.optional(v.string()),
})
  .index("by_contact", ["contactId"])
  .index("by_stage", ["stage"])
  .index("by_eventDate", ["eventDate"])
  .index("by_venue", ["venueId"]);

// Project Management
const projects = defineTable({
  name: v.string(),
  opportunityId: v.id("opportunities"),
  status: v.union(
    v.literal("ACTIVE"),
    v.literal("COMPLETED"),
    v.literal("CANCELLED"),
    v.literal("ON_HOLD")
  ),
  startDate: v.number(), // Unix timestamp
  endDate: v.number(), // Unix timestamp
  clientLink: v.string(),
  settings: v.optional(v.any()),
  venueId: v.optional(v.string()),
})
  .index("by_opportunity", ["opportunityId"])
  .index("by_status", ["status"])
  .index("by_clientLink", ["clientLink"])
  .index("by_venue", ["venueId"]);

// Task Management
const tasks = defineTable({
  projectId: v.id("projects"),
  title: v.string(),
  description: v.optional(v.string()),
  status: v.union(
    v.literal("TODO"),
    v.literal("IN_PROGRESS"),
    v.literal("ON_HOLD"),
    v.literal("COMPLETED")
  ),
  assigneeId: v.id("users"),
  dueDate: v.optional(v.number()), // Unix timestamp
  isInternal: v.boolean(),
  position: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_status", ["status"])
  .index("by_assignee", ["assigneeId"])
  .index("by_dueDate", ["dueDate"]);

// User Management with Clerk authentication integration
const users = defineTable({
  name: v.optional(v.string()),
  email: v.string(),
  emailVerified: v.optional(v.number()), // Unix timestamp
  image: v.optional(v.string()),
  role: v.union(
    v.literal("ADMIN"),
    v.literal("SALES"),
    v.literal("PROJECT_MANAGER"),
    v.literal("STAFF"),
    v.literal("CLIENT")
  ),
  venueId: v.optional(v.string()),
  // Clerk handles authentication sessions via JWT tokens
})
  .index("by_email", ["email"])
  .index("by_venue", ["venueId"])
  .index("by_role", ["role"]);

// Messages for real-time chat
const messages = defineTable({
  projectId: v.id("projects"),
  senderId: v.id("users"),
  content: v.string(),
  messageType: v.union(v.literal("text"), v.literal("file"), v.literal("system")),
  metadata: v.optional(v.any()),
})
  .index("by_project", ["projectId"])
  .index("by_sender", ["senderId"]);

// Documents
const documents = defineTable({
  name: v.string(),
  type: v.string(),
  url: v.string(),
  opportunityId: v.optional(v.id("opportunities")),
  projectId: v.optional(v.id("projects")),
  contactId: v.optional(v.id("contacts")),
  isSigned: v.boolean(),
  signedAt: v.optional(v.number()), // Unix timestamp
  venueId: v.optional(v.string()),
})
  .index("by_opportunity", ["opportunityId"])
  .index("by_project", ["projectId"])
  .index("by_contact", ["contactId"])
  .index("by_venue", ["venueId"]);

// Payments
const payments = defineTable({
  opportunityId: v.id("opportunities"),
  amount: v.number(),
  dueDate: v.number(), // Unix timestamp
  status: v.union(
    v.literal("PENDING"),
    v.literal("PAID"),
    v.literal("OVERDUE"),
    v.literal("CANCELLED")
  ),
  paymentMethod: v.optional(v.string()),
  externalPaymentId: v.optional(v.string()),
  venueId: v.optional(v.string()),
})
  .index("by_opportunity", ["opportunityId"])
  .index("by_status", ["status"])
  .index("by_venue", ["venueId"]);

export default defineSchema({
  contacts,
  opportunities,
  projects,
  tasks,
  users,
  messages,
  documents,
  payments,
});
```
