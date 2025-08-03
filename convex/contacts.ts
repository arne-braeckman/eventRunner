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
    leadHeat: v.union(
      v.literal("COLD"),
      v.literal("WARM"),
      v.literal("HOT")
    ),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
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
      leadHeat: args.leadHeat,
      status: "UNQUALIFIED",
      notes: args.notes,
      assignedTo: args.assignedTo,
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