import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./auth";

// Create new proposal template
export const createTemplate = mutation({
  args: {
    name: v.string(),
    eventTypes: v.array(v.union(
      v.literal("WEDDING"),
      v.literal("CORPORATE"),
      v.literal("BIRTHDAY"),
      v.literal("ANNIVERSARY"),
      v.literal("CONFERENCE"),
      v.literal("GALA"),
      v.literal("OTHER")
    )),
    content: v.object({}),
  },
  handler: async (ctx, args) => {
    // Only SALES and ADMIN roles can create templates
    await requireRole(ctx, "SALES");
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const now = Date.now();
    
    return await ctx.db.insert("proposalTemplates", {
      name: args.name,
      eventTypes: args.eventTypes,
      content: args.content,
      version: 1,
      isActive: true,
      createdBy: identity.subject as any,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all proposal templates
export const getAllTemplates = query({
  args: {
    eventType: v.optional(v.union(
      v.literal("WEDDING"),
      v.literal("CORPORATE"),
      v.literal("BIRTHDAY"),
      v.literal("ANNIVERSARY"),
      v.literal("CONFERENCE"),
      v.literal("GALA"),
      v.literal("OTHER")
    )),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check authentication but don't enforce roles for viewing templates
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    let templates = await ctx.db.query("proposalTemplates").collect();
    
    // Apply filters
    let filteredTemplates = templates;
    
    if (args.eventType !== undefined) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.eventTypes.includes(args.eventType!)
      );
    }
    
    if (args.isActive !== undefined) {
      filteredTemplates = filteredTemplates.filter(template => template.isActive === args.isActive);
    }
    
    return filteredTemplates;
  },
});

// Get template by ID
export const getTemplateById = query({
  args: { templateId: v.id("proposalTemplates") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    return await ctx.db.get(args.templateId);
  },
});

// Update proposal template
export const updateTemplate = mutation({
  args: {
    templateId: v.id("proposalTemplates"),
    name: v.optional(v.string()),
    eventTypes: v.optional(v.array(v.union(
      v.literal("WEDDING"),
      v.literal("CORPORATE"),
      v.literal("BIRTHDAY"),
      v.literal("ANNIVERSARY"),
      v.literal("CONFERENCE"),
      v.literal("GALA"),
      v.literal("OTHER")
    ))),
    content: v.optional(v.object({})),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "SALES");
    
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }
    
    const updateData: any = {
      updatedAt: Date.now(),
    };
    
    // Only update fields that are provided
    if (args.name !== undefined) updateData.name = args.name;
    if (args.eventTypes !== undefined) updateData.eventTypes = args.eventTypes;
    if (args.content !== undefined) updateData.content = args.content;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;
    
    return await ctx.db.patch(args.templateId, updateData);
  },
});

// Create new template version
export const createTemplateVersion = mutation({
  args: {
    templateId: v.id("proposalTemplates"),
    name: v.optional(v.string()),
    content: v.object({}),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "SALES");
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const originalTemplate = await ctx.db.get(args.templateId);
    if (!originalTemplate) {
      throw new Error("Template not found");
    }
    
    const now = Date.now();
    
    // Create new version with incremented version number
    return await ctx.db.insert("proposalTemplates", {
      name: args.name || originalTemplate.name,
      eventTypes: originalTemplate.eventTypes,
      content: args.content,
      version: originalTemplate.version + 1,
      isActive: true,
      createdBy: identity.subject as any,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get template versions
export const getTemplateVersions = query({
  args: { 
    templateName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const versions = await ctx.db
      .query("proposalTemplates")
      .filter((q) => q.eq(q.field("name"), args.templateName))
      .collect();
    
    // Sort by version number descending
    return versions.sort((a, b) => b.version - a.version);
  },
});

// Delete template (soft delete)
export const deleteTemplate = mutation({
  args: { templateId: v.id("proposalTemplates") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "ADMIN"); // Only admins can delete templates
    
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }
    
    // Soft delete by setting isActive to false
    return await ctx.db.patch(args.templateId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

// Get templates suitable for a specific opportunity
export const getTemplatesForOpportunity = query({
  args: { opportunityId: v.id("opportunities") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    // Get the opportunity to determine event type
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }
    
    // Get all active templates that support this event type
    const templates = await ctx.db
      .query("proposalTemplates")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .collect();
    
    // Filter templates that support this event type
    const suitableTemplates = templates.filter(template =>
      template.eventTypes.includes(opportunity.eventType)
    );
    
    return suitableTemplates;
  },
});