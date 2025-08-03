import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./auth";

export const createContact = mutation({
  args: {
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
    leadHeat: v.optional(v.union(
      v.literal("COLD"),
      v.literal("WARM"),
      v.literal("HOT")
    )),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
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
  },
  handler: async (ctx, args) => {
    // All authenticated staff can create contacts
    await requireRole(ctx, "STAFF");
    
    const now = Date.now();
    
    return await ctx.db.insert("contacts", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      company: args.company,
      leadSource: args.leadSource,
      leadHeat: args.leadHeat || "COLD",
      leadHeatScore: 0,
      status: "UNQUALIFIED",
      notes: args.notes,
      assignedTo: args.assignedTo,
      socialProfiles: args.socialProfiles || [],
      customFields: args.customFields || {},
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getContactByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getAllContacts = query({
  handler: async (ctx) => {
    // Check authentication but don't enforce roles for viewing contacts
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    return await ctx.db.query("contacts").collect();
  },
});

export const getContactsByStatus = query({
  args: {
    status: v.union(
      v.literal("UNQUALIFIED"),
      v.literal("PROSPECT"),
      v.literal("LEAD"),
      v.literal("QUALIFIED"),
      v.literal("CUSTOMER"),
      v.literal("LOST")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const updateContactStatus = mutation({
  args: {
    contactId: v.id("contacts"),
    status: v.union(
      v.literal("UNQUALIFIED"),
      v.literal("PROSPECT"),
      v.literal("LEAD"),
      v.literal("QUALIFIED"),
      v.literal("CUSTOMER"),
      v.literal("LOST")
    ),
  },
  handler: async (ctx, args) => {
    // Sales staff and above can update contact status
    await requireRole(ctx, "SALES");
    
    return await ctx.db.patch(args.contactId, { 
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const assignContact = mutation({
  args: {
    contactId: v.id("contacts"),
    assignedTo: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Sales staff and above can assign contacts
    await requireRole(ctx, "SALES");
    
    return await ctx.db.patch(args.contactId, { 
      assignedTo: args.assignedTo,
      updatedAt: Date.now(),
    });
  },
});

export const getContactById = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    return await ctx.db.get(args.contactId);
  },
});

export const searchContacts = query({
  args: {
    search: v.optional(v.string()),
    leadSource: v.optional(v.union(
      v.literal("WEBSITE"),
      v.literal("FACEBOOK"),
      v.literal("INSTAGRAM"), 
      v.literal("LINKEDIN"),
      v.literal("REFERRAL"),
      v.literal("DIRECT"),
      v.literal("OTHER")
    )),
    leadHeat: v.optional(v.union(
      v.literal("COLD"),
      v.literal("WARM"),
      v.literal("HOT")
    )),
    status: v.optional(v.union(
      v.literal("UNQUALIFIED"),
      v.literal("PROSPECT"),
      v.literal("LEAD"),
      v.literal("QUALIFIED"),
      v.literal("CUSTOMER"),
      v.literal("LOST")
    )),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    let query = ctx.db.query("contacts");
    
    // Apply filters
    if (args.leadSource) {
      query = query.filter((q) => q.eq(q.field("leadSource"), args.leadSource));
    }
    if (args.leadHeat) {
      query = query.filter((q) => q.eq(q.field("leadHeat"), args.leadHeat));
    }
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    let contacts = await query.collect();
    
    // Apply search filter on name and email
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      contacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 20;
    const total = contacts.length;
    const paginatedContacts = contacts.slice(offset, offset + limit);
    
    return {
      contacts: paginatedContacts,
      total,
      hasMore: offset + limit < total,
    };
  },
});

export const updateContact = mutation({
  args: {
    contactId: v.id("contacts"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    leadSource: v.optional(v.union(
      v.literal("WEBSITE"),
      v.literal("FACEBOOK"),
      v.literal("INSTAGRAM"), 
      v.literal("LINKEDIN"),
      v.literal("REFERRAL"),
      v.literal("DIRECT"),
      v.literal("OTHER")
    )),
    leadHeat: v.optional(v.union(
      v.literal("COLD"),
      v.literal("WARM"),
      v.literal("HOT")
    )),
    leadHeatScore: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("UNQUALIFIED"),
      v.literal("PROSPECT"),
      v.literal("LEAD"),
      v.literal("QUALIFIED"),
      v.literal("CUSTOMER"),
      v.literal("LOST")
    )),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
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
    lastInteractionAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Staff and above can update basic contact info, Sales and above can update status
    if (args.status) {
      await requireRole(ctx, "SALES");
    } else {
      await requireRole(ctx, "STAFF");
    }
    
    const { contactId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    return await ctx.db.patch(contactId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});