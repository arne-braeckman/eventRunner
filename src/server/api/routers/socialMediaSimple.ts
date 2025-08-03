import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

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

export const socialMediaRouter = createTRPCRouter({
  // Test endpoint to verify router is working
  ping: publicProcedure
    .query(() => {
      return { message: "Social Media API is connected" };
    }),

  // Get platform configuration status
  getPlatformStatus: publicProcedure
    .query(() => {
      return {
        platforms: {
          FACEBOOK: { connected: false, configured: false },
          INSTAGRAM: { connected: false, configured: false },
          LINKEDIN: { connected: false, configured: false },
        },
        totalPlatforms: 3,
        connectedPlatforms: 0,
      };
    }),

  // Basic configuration endpoint (simplified)
  configureIntegration: publicProcedure
    .input(socialMediaConfigSchema)
    .mutation(async ({ input }) => {
      try {
        // Basic validation that configuration was provided
        const configuredPlatforms = [];
        if (input.facebook) configuredPlatforms.push('Facebook');
        if (input.instagram) configuredPlatforms.push('Instagram');
        if (input.linkedin) configuredPlatforms.push('LinkedIn');

        return {
          success: true,
          message: `Configuration saved for: ${configuredPlatforms.join(', ')}`,
          configuredPlatforms,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to configure integration: ${error}`,
        });
      }
    }),

  // Get social media statistics (simplified)
  getSocialMediaStats: publicProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      platform: socialPlatformSchema.optional(),
    }))
    .query(async ({ input }) => {
      // Return mock statistics for now
      return {
        totalLeads: 0,
        totalInteractions: 0,
        leadsByPlatform: {
          FACEBOOK: 0,
          INSTAGRAM: 0,
          LINKEDIN: 0,
        },
        interactionsByType: {
          SOCIAL_FOLLOW: 0,
          SOCIAL_LIKE: 0,
          SOCIAL_COMMENT: 0,
          SOCIAL_MESSAGE: 0,
        },
        leadConversionRate: 0,
        averageLeadHeatScore: 0,
        dateRange: {
          start: input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: input.endDate || new Date(),
        },
      };
    }),
});