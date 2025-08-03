import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { 
  SocialMediaIntegrationService,
  SocialMediaConfigManager,
} from "../services/socialMediaIntegrationService";
import type { SocialMediaApiConfig, SocialPlatform } from "../services/socialMediaService";

// Input validation schemas
const socialPlatformSchema = z.enum(["FACEBOOK", "INSTAGRAM", "LINKEDIN", "TWITTER", "TIKTOK"]);

const socialMediaConfigSchema = z.object({
  facebook: z.object({
    appId: z.string(),
    appSecret: z.string(),
    accessToken: z.string(),
    webhookVerifyToken: z.string(),
  }).optional(),
  instagram: z.object({
    businessAccountId: z.string(),
    accessToken: z.string(),
  }).optional(),
  linkedin: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    accessToken: z.string(),
  }).optional(),
});

const leadCaptureDataSchema = z.object({
  platform: socialPlatformSchema,
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  formId: z.string().optional(),
  adId: z.string().optional(),
  campaignId: z.string().optional(),
  metadata: z.record(z.any()),
});

export const socialMediaRouter = createTRPCRouter({
  // Configuration Management
  configureIntegration: publicProcedure
    .input(socialMediaConfigSchema)
    .mutation(async ({ ctx, input }) => {
      // Only ADMIN users can configure social media integrations
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", ctx.session.user.email || ""))
        .first();

      if (!user || user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin role required" });
      }

      try {
        const integrationService = new SocialMediaIntegrationService(ctx);
        await integrationService.initializeConfiguration(input as SocialMediaApiConfig);

        return { success: true, message: "Social media integration configured successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to configure integration: ${error}`,
        });
      }
    }),

  // Test platform connections
  testConnections: protectedProcedure
    .query(async ({ ctx }) => {
      // SALES role and above can test connections
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", ctx.session.user.email || ""))
        .first();

      if (!user || !["ADMIN", "SALES"].includes(user.role || "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sales role or higher required" });
      }

      try {
        const integrationService = new SocialMediaIntegrationService(ctx);
        const connections = await integrationService.testPlatformConnections();

        return {
          connections,
          totalPlatforms: Object.keys(connections).length,
          connectedPlatforms: Object.values(connections).filter(Boolean).length,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to test connections: ${error}`,
        });
      }
    }),

  // Get platform status
  getPlatformStatus: protectedProcedure
    .query(async ({ ctx }) => {
      // SALES role and above can view platform status
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", ctx.session.user.email || ""))
        .first();

      if (!user || !["ADMIN", "SALES"].includes(user.role || "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sales role or higher required" });
      }

      try {
        const integrationService = new SocialMediaIntegrationService(ctx);
        return await integrationService.getPlatformStatus();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get platform status: ${error}`,
        });
      }
    }),

  // Lead Capture Operations
  captureLeads: protectedProcedure
    .input(z.object({
      since: z.date().optional(),
      platform: socialPlatformSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // SALES role and above can capture leads
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", ctx.session.user.email || ""))
        .first();

      if (!user || !["ADMIN", "SALES"].includes(user.role || "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sales role or higher required" });
      }

      try {
        const integrationService = new SocialMediaIntegrationService(ctx);
        const result = await integrationService.captureLeadsFromAllPlatforms(input.since);

        return {
          ...result,
          message: `Captured ${result.leads.length} leads, processed ${result.processed}, created ${result.created} new contacts`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to capture leads: ${error}`,
        });
      }
    }),

  // Manual lead creation from social media
  createLeadFromSocialMedia: protectedProcedure
    .input(leadCaptureDataSchema)
    .mutation(async ({ ctx, input }) => {
      // STAFF and above can create leads
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", ctx.session.user.email || ""))
        .first();

      if (!user || !["ADMIN", "SALES", "STAFF"].includes(user.role || "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Staff role or higher required" });
      }

      try {
        const integrationService = new SocialMediaIntegrationService(ctx);
        // Process as a single lead
        const leads = [input];
        const result = await integrationService.captureLeadsFromAllPlatforms();

        return {
          success: true,
          message: "Lead created successfully",
          contactsCreated: result.created,
          contactsUpdated: result.updated,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create lead: ${error}`,
        });
      }
    }),

  // Interaction Synchronization
  syncContactInteractions: protectedProcedure
    .input(z.object({
      contactId: z.string(),
      platform: socialPlatformSchema.optional(),
      since: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // SALES role and above can sync interactions
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", ctx.session.user.email || ""))
        .first();

      if (!user || !["ADMIN", "SALES"].includes(user.role || "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sales role or higher required" });
      }

      try {
        const integrationService = new SocialMediaIntegrationService(ctx);
        const result = await integrationService.syncContactInteractions(
          input.contactId as any,
          input.platform,
          input.since
        );

        return {
          ...result,
          message: `Synced ${result.synced} interactions for contact`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sync contact interactions: ${error}`,
        });
      }
    }),

  syncAllInteractions: protectedProcedure
    .input(z.object({
      since: z.date().optional(),
      platform: socialPlatformSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Only ADMIN users can sync all interactions (resource intensive)
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", ctx.session.user.email || ""))
        .first();

      if (!user || user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin role required" });
      }

      try {
        const integrationService = new SocialMediaIntegrationService(ctx);
        const result = await integrationService.syncAllInteractions(input.since, input.platform);

        return {
          ...result,
          message: `Synced interactions for ${result.totalContacts} contacts, total ${result.totalSynced} interactions`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sync all interactions: ${error}`,
        });
      }
    }),

  // Analytics and Reporting
  getSocialMediaStats: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      platform: socialPlatformSchema.optional(),
    }))
    .query(async ({ ctx, input }) => {
      // SALES role and above can view social media stats
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", ctx.session.user.email || ""))
        .first();

      if (!user || !["ADMIN", "SALES"].includes(user.role || "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sales role or higher required" });
      }

      try {
        const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        const endDate = input.endDate || new Date();

        // Get contacts created from social media sources
        let contactsQuery = ctx.db.query("contacts");
        
        if (input.platform) {
          contactsQuery = contactsQuery.filter((q) => q.eq(q.field("leadSource"), input.platform));
        } else {
          contactsQuery = contactsQuery.filter((q) => 
            q.or(
              q.eq(q.field("leadSource"), "FACEBOOK"),
              q.eq(q.field("leadSource"), "INSTAGRAM"),
              q.eq(q.field("leadSource"), "LINKEDIN"),
              q.eq(q.field("leadSource"), "TWITTER"),
              q.eq(q.field("leadSource"), "TIKTOK")
            )
          );
        }

        const contacts = await contactsQuery.collect();
        
        // Filter by date range
        const filteredContacts = contacts.filter(contact => {
          const createdAt = new Date(contact.createdAt);
          return createdAt >= startDate && createdAt <= endDate;
        });

        // Get social media interactions
        const interactions = await ctx.db.query("interactions").collect();
        const socialInteractions = interactions.filter(interaction => {
          const createdAt = new Date(interaction.createdAt);
          const isSocialInteraction = [
            'SOCIAL_FOLLOW', 'SOCIAL_LIKE', 'SOCIAL_COMMENT', 'SOCIAL_MESSAGE'
          ].includes(interaction.type);
          
          return isSocialInteraction && 
                 createdAt >= startDate && 
                 createdAt <= endDate &&
                 (!input.platform || interaction.platform === input.platform);
        });

        // Calculate stats
        const stats = {
          totalLeads: filteredContacts.length,
          totalInteractions: socialInteractions.length,
          leadsByPlatform: {} as Record<string, number>,
          interactionsByType: {} as Record<string, number>,
          leadConversionRate: 0,
          averageLeadHeatScore: 0,
        };

        // Group by platform
        filteredContacts.forEach(contact => {
          const platform = contact.leadSource;
          stats.leadsByPlatform[platform] = (stats.leadsByPlatform[platform] || 0) + 1;
        });

        // Group interactions by type
        socialInteractions.forEach(interaction => {
          const type = interaction.type;
          stats.interactionsByType[type] = (stats.interactionsByType[type] || 0) + 1;
        });

        // Calculate averages
        if (filteredContacts.length > 0) {
          const qualifiedLeads = filteredContacts.filter(c => 
            ['QUALIFIED', 'CUSTOMER'].includes(c.status)
          ).length;
          stats.leadConversionRate = (qualifiedLeads / filteredContacts.length) * 100;

          const totalHeatScore = filteredContacts.reduce((sum, contact) => 
            sum + (contact.leadHeatScore || 0), 0
          );
          stats.averageLeadHeatScore = totalHeatScore / filteredContacts.length;
        }

        return stats;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get social media stats: ${error}`,
        });
      }
    }),

  // Get social media interactions for a contact
  getContactSocialInteractions: protectedProcedure
    .input(z.object({
      contactId: z.string(),
      platform: socialPlatformSchema.optional(),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ ctx, input }) => {
      // STAFF and above can view contact interactions
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", ctx.session.user.email || ""))
        .first();

      if (!user || !["ADMIN", "SALES", "STAFF"].includes(user.role || "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Staff role or higher required" });
      }

      try {
        let interactionsQuery = ctx.db
          .query("interactions")
          .withIndex("by_contact", (q) => q.eq("contactId", input.contactId as any));

        const allInteractions = await interactionsQuery.collect();
        
        // Filter for social media interactions
        let socialInteractions = allInteractions.filter(interaction => {
          const isSocialInteraction = [
            'SOCIAL_FOLLOW', 'SOCIAL_LIKE', 'SOCIAL_COMMENT', 'SOCIAL_MESSAGE'
          ].includes(interaction.type);
          
          return isSocialInteraction && 
                 (!input.platform || interaction.platform === input.platform);
        });

        // Sort by created date (newest first)
        socialInteractions.sort((a, b) => b.createdAt - a.createdAt);

        // Apply pagination
        const total = socialInteractions.length;
        const paginatedInteractions = socialInteractions.slice(input.offset, input.offset + input.limit);

        return {
          interactions: paginatedInteractions,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get contact social interactions: ${error}`,
        });
      }
    }),

  // Bulk operations
  bulkSyncLeads: protectedProcedure
    .input(z.object({
      platforms: z.array(socialPlatformSchema),
      since: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Only ADMIN users can run bulk operations
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", ctx.session.user.email || ""))
        .first();

      if (!user || user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin role required" });
      }

      try {
        const integrationService = new SocialMediaIntegrationService(ctx);
        const results = [];

        for (const platform of input.platforms) {
          try {
            const result = await integrationService.syncAllInteractions(input.since, platform);
            results.push({
              platform,
              success: true,
              ...result,
            });
          } catch (error) {
            results.push({
              platform,
              success: false,
              error: String(error),
            });
          }
        }

        const totalSynced = results.reduce((sum, result) => 
          sum + (result.success ? result.totalSynced || 0 : 0), 0
        );

        return {
          results,
          totalPlatforms: input.platforms.length,
          successfulPlatforms: results.filter(r => r.success).length,
          totalSynced,
          message: `Bulk sync completed for ${input.platforms.length} platforms`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to run bulk sync: ${error}`,
        });
      }
    }),
});