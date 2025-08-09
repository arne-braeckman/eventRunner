import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./auth";

// Create new proposal
export const createProposal = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    templateId: v.id("proposalTemplates"),
    title: v.string(),
    content: v.optional(v.object({})),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Only SALES and ADMIN roles can create proposals
    await requireRole(ctx, "SALES");
    
    const now = Date.now();
    
    // Verify the opportunity exists
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }
    
    // Verify the template exists
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }
    
    // Generate secure client access token
    const clientAccessToken = generateSecureToken();
    
    // Create proposal
    const proposalId = await ctx.db.insert("proposals", {
      opportunityId: args.opportunityId,
      templateId: args.templateId,
      title: args.title,
      status: "DRAFT",
      version: 1,
      content: args.content || template.content,
      clientAccessToken,
      expiresAt: args.expiresAt,
      createdAt: now,
      updatedAt: now,
    });
    
    // Log creation interaction
    await ctx.db.insert("proposalInteractions", {
      proposalId,
      type: "STATUS_CHANGED",
      userId: (await ctx.auth.getUserIdentity())?.subject as any,
      metadata: { previousStatus: null, newStatus: "DRAFT" },
      createdAt: now,
    });
    
    return proposalId;
  },
});

// Get all proposals with optional filtering
export const getAllProposals = query({
  args: {
    status: v.optional(v.union(
      v.literal("DRAFT"),
      v.literal("SENT"),
      v.literal("VIEWED"),
      v.literal("UNDER_REVIEW"),
      v.literal("ACCEPTED"),
      v.literal("REJECTED"),
      v.literal("EXPIRED")
    )),
    opportunityId: v.optional(v.id("opportunities")),
  },
  handler: async (ctx, args) => {
    // Check authentication but don't enforce roles for viewing proposals
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    let proposals = await ctx.db.query("proposals").collect();
    
    // Apply filters
    let filteredProposals = proposals;
    
    if (args.status !== undefined) {
      filteredProposals = filteredProposals.filter(proposal => proposal.status === args.status);
    }
    
    if (args.opportunityId !== undefined) {
      filteredProposals = filteredProposals.filter(proposal => proposal.opportunityId === args.opportunityId);
    }
    
    return filteredProposals;
  },
});

// Get single proposal by ID
export const getProposalById = query({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      return null;
    }
    
    // Get related data
    const opportunity = await ctx.db.get(proposal.opportunityId);
    const template = await ctx.db.get(proposal.templateId);
    const interactions = await ctx.db
      .query("proposalInteractions")
      .withIndex("by_proposal", (q) => q.eq("proposalId", args.proposalId))
      .collect();
    const comments = await ctx.db
      .query("proposalComments")
      .withIndex("by_proposal", (q) => q.eq("proposalId", args.proposalId))
      .collect();
    
    return {
      ...proposal,
      opportunity,
      template,
      interactions,
      comments,
    };
  },
});

// Get proposal by client access token (public endpoint)
export const getProposalByClientToken = query({
  args: { clientAccessToken: v.string() },
  handler: async (ctx, args) => {
    const proposal = await ctx.db
      .query("proposals")
      .withIndex("by_client_token", (q) => q.eq("clientAccessToken", args.clientAccessToken))
      .first();
    
    if (!proposal) {
      throw new Error("Proposal not found or access token invalid");
    }
    
    // Check if proposal is expired
    if (proposal.expiresAt && proposal.expiresAt < Date.now()) {
      throw new Error("Proposal has expired");
    }
    
    // Get related opportunity and template data (limited for client view)
    const opportunity = await ctx.db.get(proposal.opportunityId);
    const template = await ctx.db.get(proposal.templateId);
    
    // Get only client-facing comments
    const comments = await ctx.db
      .query("proposalComments")
      .withIndex("by_proposal", (q) => q.eq("proposalId", proposal._id))
      .filter((q) => q.eq(q.field("isInternal"), false))
      .collect();
    
    return {
      ...proposal,
      opportunity: opportunity ? {
        name: opportunity.name,
        eventType: opportunity.eventType,
        eventDate: opportunity.eventDate,
        guestCount: opportunity.guestCount,
      } : null,
      template: template ? {
        name: template.name,
      } : null,
      comments,
    };
  },
});

// Update proposal status
export const updateProposalStatus = mutation({
  args: {
    proposalId: v.id("proposals"),
    status: v.union(
      v.literal("DRAFT"),
      v.literal("SENT"),
      v.literal("VIEWED"),
      v.literal("UNDER_REVIEW"),
      v.literal("ACCEPTED"),
      v.literal("REJECTED"),
      v.literal("EXPIRED")
    ),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "SALES");
    
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    
    const now = Date.now();
    const previousStatus = proposal.status;
    
    // Update timestamps based on status changes
    const updates: any = {
      status: args.status,
      updatedAt: now,
    };
    
    if (args.status === "SENT" && !proposal.sentAt) {
      updates.sentAt = now;
    }
    if (args.status === "VIEWED" && !proposal.viewedAt) {
      updates.viewedAt = now;
    }
    if (["ACCEPTED", "REJECTED"].includes(args.status) && !proposal.respondedAt) {
      updates.respondedAt = now;
    }
    
    // Update proposal
    await ctx.db.patch(args.proposalId, updates);
    
    // Log status change interaction
    await ctx.db.insert("proposalInteractions", {
      proposalId: args.proposalId,
      type: "STATUS_CHANGED",
      userId: (await ctx.auth.getUserIdentity())?.subject as any,
      metadata: { 
        previousStatus, 
        newStatus: args.status,
        ...args.metadata 
      },
      createdAt: now,
    });
    
    // Auto-update opportunity stage based on proposal status
    if (args.status === "ACCEPTED") {
      const opportunity = await ctx.db.get(proposal.opportunityId);
      if (opportunity && opportunity.stage !== "CLOSED_WON") {
        await ctx.db.patch(proposal.opportunityId, {
          stage: "CLOSED_WON",
          updatedAt: now,
        });
      }
    }
    
    return args.proposalId;
  },
});

// Update proposal content
export const updateProposal = mutation({
  args: {
    proposalId: v.id("proposals"),
    title: v.optional(v.string()),
    content: v.optional(v.object({})),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "SALES");
    
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    
    const updateData: any = {
      updatedAt: Date.now(),
    };
    
    // Only update fields that are provided
    if (args.title !== undefined) updateData.title = args.title;
    if (args.content !== undefined) updateData.content = args.content;
    if (args.expiresAt !== undefined) updateData.expiresAt = args.expiresAt;
    
    return await ctx.db.patch(args.proposalId, updateData);
  },
});

// Add comment to proposal
export const addProposalComment = mutation({
  args: {
    proposalId: v.id("proposals"),
    content: v.string(),
    isInternal: v.boolean(),
    // For client comments (when isInternal = false)
    authorName: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    
    const now = Date.now();
    let authorId = null;
    
    // For internal comments, require authentication
    if (args.isInternal) {
      await requireRole(ctx, "SALES");
      const identity = await ctx.auth.getUserIdentity();
      authorId = identity?.subject as any;
    }
    
    const commentId = await ctx.db.insert("proposalComments", {
      proposalId: args.proposalId,
      content: args.content,
      isInternal: args.isInternal,
      authorId,
      authorName: args.authorName,
      authorEmail: args.authorEmail,
      createdAt: now,
      updatedAt: now,
    });
    
    // Log comment interaction
    await ctx.db.insert("proposalInteractions", {
      proposalId: args.proposalId,
      type: "COMMENT_ADDED",
      userId: authorId,
      metadata: { isInternal: args.isInternal },
      createdAt: now,
    });
    
    return commentId;
  },
});

// Track client view of proposal
export const trackProposalView = mutation({
  args: {
    clientAccessToken: v.string(),
    clientInfo: v.optional(v.object({
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db
      .query("proposals")
      .withIndex("by_client_token", (q) => q.eq("clientAccessToken", args.clientAccessToken))
      .first();
    
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    
    const now = Date.now();
    
    // Update proposal view timestamp if first view
    if (!proposal.viewedAt) {
      await ctx.db.patch(proposal._id, {
        viewedAt: now,
        status: proposal.status === "SENT" ? "VIEWED" : proposal.status,
        updatedAt: now,
      });
    }
    
    // Log view interaction
    await ctx.db.insert("proposalInteractions", {
      proposalId: proposal._id,
      type: "VIEWED",
      clientInfo: args.clientInfo,
      metadata: { firstView: !proposal.viewedAt },
      createdAt: now,
    });
    
    return proposal._id;
  },
});

// Get proposals requiring follow-up (for reminder system)
export const getProposalsRequiringFollowUp = query({
  handler: async (ctx) => {
    await requireRole(ctx, "SALES");
    
    const now = Date.now();
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    // Get proposals that are sent but not viewed after 3 days, or viewed but no response after 7 days
    const proposals = await ctx.db.query("proposals").collect();
    
    const followUpRequired = proposals.filter(proposal => {
      // Skip if already responded or expired
      if (["ACCEPTED", "REJECTED", "EXPIRED"].includes(proposal.status)) {
        return false;
      }
      
      // Sent but not viewed after 3 days
      if (proposal.status === "SENT" && proposal.sentAt && proposal.sentAt < threeDaysAgo) {
        return true;
      }
      
      // Viewed but no response after 7 days
      if (["VIEWED", "UNDER_REVIEW"].includes(proposal.status) && 
          proposal.viewedAt && proposal.viewedAt < sevenDaysAgo) {
        return true;
      }
      
      return false;
    });
    
    return followUpRequired;
  },
});

// Send proposal email to client
export const sendProposalEmail = mutation({
  args: {
    proposalId: v.id("proposals"),
    clientEmail: v.string(),
    customMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "SALES");
    
    // Get proposal with template details
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposal not found");
    }

    // Get opportunity details
    const opportunity = await ctx.db.get(proposal.opportunityId);
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }

    // Get contact details
    const contact = await ctx.db.get(opportunity.contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // Log email sent interaction
    await ctx.db.insert("proposalInteractions", {
      proposalId: args.proposalId,
      type: "EMAIL_SENT",
      metadata: {
        to: args.clientEmail,
        customMessage: args.customMessage,
        clientName: contact.name,
        opportunityName: opportunity.name,
      },
      createdAt: Date.now(),
    });

    // Update proposal status to SENT
    await ctx.db.patch(args.proposalId, {
      status: "SENT",
      sentAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Return email data for frontend to handle actual sending
    return { 
      success: true,
      emailData: {
        proposalId: args.proposalId,
        clientName: contact.name,
        clientEmail: args.clientEmail,
        proposalTitle: proposal.title,
        opportunityName: opportunity.name,
        customMessage: args.customMessage,
        clientAccessToken: proposal.clientAccessToken,
        expiresAt: proposal.expiresAt,
      }
    };
  },
});

// Utility function to generate secure tokens
function generateSecureToken(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}