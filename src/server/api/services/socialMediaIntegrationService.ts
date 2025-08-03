import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  SocialMediaManager,
  type SocialMediaApiConfig,
  type LeadCaptureData,
  type SocialInteractionData,
  SocialMediaApiError,
  type SocialPlatform,
} from "./socialMediaService";
import type { InteractionType } from "../../../lib/types/contact";

// Configuration Management
export class SocialMediaConfigManager {
  private static instance: SocialMediaConfigManager;
  private config: SocialMediaApiConfig | null = null;

  private constructor() {}

  static getInstance(): SocialMediaConfigManager {
    if (!SocialMediaConfigManager.instance) {
      SocialMediaConfigManager.instance = new SocialMediaConfigManager();
    }
    return SocialMediaConfigManager.instance;
  }

  setConfig(config: SocialMediaApiConfig): void {
    this.config = config;
  }

  getConfig(): SocialMediaApiConfig {
    if (!this.config) {
      throw new Error("Social media configuration not initialized");
    }
    return this.config;
  }

  isConfigured(): boolean {
    return this.config !== null;
  }
}

// Lead Processing Service
export class LeadProcessingService {
  constructor(private ctx: any) {}

  async processLeadCaptureData(leadData: LeadCaptureData): Promise<Id<"contacts"> | null> {
    try {
      // Check if contact already exists by email
      if (leadData.email) {
        const existingContact = await this.ctx.db
          .query("contacts")
          .withIndex("by_email", (q: any) => q.eq("email", leadData.email))
          .first();

        if (existingContact) {
          // Update existing contact with new interaction
          await this.createLeadCaptureInteraction(existingContact._id, leadData);
          
          // Update last interaction time
          await this.ctx.db.patch(existingContact._id, {
            lastInteractionAt: Date.now(),
            updatedAt: Date.now(),
          });

          return existingContact._id;
        }
      }

      // Create new contact
      const contactData = {
        name: leadData.name || "Unknown Lead",
        email: leadData.email || "",
        phone: leadData.phone,
        company: leadData.company,
        leadSource: leadData.platform,
        leadHeat: "COLD" as const,
        leadHeatScore: 5, // INFO_REQUEST base score
        status: "UNQUALIFIED" as const,
        notes: leadData.message,
        socialProfiles: leadData.platform ? [{
          platform: leadData.platform,
          profileUrl: "",
          isConnected: true,
          lastSyncAt: Date.now(),
        }] : [],
        customFields: {
          leadCaptureSource: leadData.platform,
          formId: leadData.formId,
          adId: leadData.adId,
          campaignId: leadData.campaignId,
          ...leadData.metadata,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastInteractionAt: Date.now(),
      };

      const contactId = await this.ctx.db.insert("contacts", contactData);

      // Create lead capture interaction
      await this.createLeadCaptureInteraction(contactId, leadData);

      return contactId;
    } catch (error) {
      console.error("Error processing lead capture data:", error);
      return null;
    }
  }

  private async createLeadCaptureInteraction(
    contactId: Id<"contacts">,
    leadData: LeadCaptureData
  ): Promise<void> {
    await this.ctx.db.insert("interactions", {
      contactId,
      type: "INFO_REQUEST" as InteractionType,
      platform: leadData.platform,
      description: `Lead captured from ${leadData.platform}${leadData.formId ? ` (Form: ${leadData.formId})` : ''}`,
      metadata: {
        leadCaptureData: leadData,
        source: "social_media_api",
      },
      createdAt: Date.now(),
    });
  }

  async batchProcessLeads(leads: LeadCaptureData[]): Promise<{
    processed: number;
    created: number;
    updated: number;
    errors: number;
  }> {
    let processed = 0;
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const lead of leads) {
      try {
        const existingContact = lead.email
          ? await this.ctx.db
              .query("contacts")
              .withIndex("by_email", (q: any) => q.eq("email", lead.email))
              .first()
          : null;

        const result = await this.processLeadCaptureData(lead);
        
        if (result) {
          processed++;
          if (existingContact) {
            updated++;
          } else {
            created++;
          }
        } else {
          errors++;
        }
      } catch (error) {
        errors++;
        console.error("Error processing lead:", error);
      }
    }

    return { processed, created, updated, errors };
  }
}

// Interaction Synchronization Service
export class InteractionSyncService {
  constructor(private ctx: any) {}

  async syncContactInteractions(
    contactId: Id<"contacts">,
    platform?: SocialPlatform,
    since?: Date
  ): Promise<{ synced: number; errors: number }> {
    try {
      const configManager = SocialMediaConfigManager.getInstance();
      if (!configManager.isConfigured()) {
        throw new Error("Social media configuration not available");
      }

      const socialManager = new SocialMediaManager(configManager.getConfig());
      const interactions = await socialManager.getContactInteractions(contactId, platform, since);

      let synced = 0;
      let errors = 0;

      for (const interaction of interactions) {
        try {
          await this.createInteractionFromSocialData(contactId, interaction);
          synced++;
        } catch (error) {
          errors++;
          console.error("Error creating interaction:", error);
        }
      }

      // Update contact's last interaction time if we synced any interactions
      if (synced > 0) {
        const latestInteraction = interactions.reduce((latest, current) =>
          current.timestamp > latest.timestamp ? current : latest
        );

        await this.ctx.db.patch(contactId, {
          lastInteractionAt: latestInteraction.timestamp,
          updatedAt: Date.now(),
        });

        // Recalculate heat score
        await this.recalculateContactHeatScore(contactId);
      }

      return { synced, errors };
    } catch (error) {
      console.error("Error syncing interactions:", error);
      return { synced: 0, errors: 1 };
    }
  }

  private async createInteractionFromSocialData(
    contactId: Id<"contacts">,
    socialData: SocialInteractionData
  ): Promise<void> {
    // Check if interaction already exists to avoid duplicates
    const existingInteraction = await this.ctx.db
      .query("interactions")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("contactId"), contactId),
          q.eq(q.field("metadata.externalId"), socialData.externalId)
        )
      )
      .first();

    if (existingInteraction) {
      return; // Skip duplicate
    }

    await this.ctx.db.insert("interactions", {
      contactId,
      type: socialData.type,
      platform: socialData.platform,
      description: socialData.content || `${socialData.type} on ${socialData.platform}`,
      metadata: {
        externalId: socialData.externalId,
        userId: socialData.userId,
        userHandle: socialData.userHandle,
        source: "social_media_sync",
        originalData: socialData.metadata,
      },
      createdAt: socialData.timestamp,
    });
  }

  private async recalculateContactHeatScore(contactId: Id<"contacts">): Promise<void> {
    // Get all interactions for this contact
    const interactions = await this.ctx.db
      .query("interactions")
      .withIndex("by_contact", (q: any) => q.eq("contactId", contactId))
      .collect();

    // Calculate heat score
    const interactionWeights = {
      SOCIAL_FOLLOW: 1,
      SOCIAL_LIKE: 1,
      SOCIAL_COMMENT: 2,
      SOCIAL_MESSAGE: 3,
      WEBSITE_VISIT: 2,
      INFO_REQUEST: 5,
      PRICE_QUOTE: 8,
      SITE_VISIT: 10,
      EMAIL_OPEN: 1,
      EMAIL_CLICK: 2,
      PHONE_CALL: 5,
      MEETING: 8,
      OTHER: 1,
    };

    const heatScore = interactions.reduce((total: number, interaction: any) => {
      return total + (interactionWeights[interaction.type as keyof typeof interactionWeights] || 0);
    }, 0);

    // Determine heat level
    let leadHeat: "COLD" | "WARM" | "HOT" = "COLD";
    if (heatScore >= 16) {
      leadHeat = "HOT";
    } else if (heatScore >= 6) {
      leadHeat = "WARM";
    }

    // Update contact
    await this.ctx.db.patch(contactId, {
      leadHeatScore: heatScore,
      leadHeat: leadHeat,
      updatedAt: Date.now(),
    });
  }

  async syncAllContactsInteractions(
    since?: Date,
    platform?: SocialPlatform
  ): Promise<{ totalContacts: number; totalSynced: number; totalErrors: number }> {
    // Get all contacts that have social profiles for the specified platform
    const contacts = await this.ctx.db.query("contacts").collect();
    
    let totalContacts = 0;
    let totalSynced = 0;
    let totalErrors = 0;

    for (const contact of contacts) {
      // Skip contacts without social profiles for the specified platform
      if (platform && !contact.socialProfiles?.some((profile: any) => profile.platform === platform)) {
        continue;
      }

      totalContacts++;
      const result = await this.syncContactInteractions(contact._id, platform, since);
      totalSynced += result.synced;
      totalErrors += result.errors;
    }

    return { totalContacts, totalSynced, totalErrors };
  }
}

// Main Social Media Integration Service
export class SocialMediaIntegrationService {
  private leadProcessor: LeadProcessingService;
  private interactionSync: InteractionSyncService;
  private socialManager: SocialMediaManager | null = null;

  constructor(private ctx: any) {
    this.leadProcessor = new LeadProcessingService(ctx);
    this.interactionSync = new InteractionSyncService(ctx);
  }

  private getSocialManager(): SocialMediaManager {
    if (!this.socialManager) {
      const configManager = SocialMediaConfigManager.getInstance();
      if (!configManager.isConfigured()) {
        throw new Error("Social media configuration not initialized");
      }
      this.socialManager = new SocialMediaManager(configManager.getConfig());
    }
    return this.socialManager;
  }

  // Initialize configuration
  async initializeConfiguration(config: SocialMediaApiConfig): Promise<void> {
    const configManager = SocialMediaConfigManager.getInstance();
    configManager.setConfig(config);
    this.socialManager = new SocialMediaManager(config);
  }

  // Test all platform connections
  async testPlatformConnections(): Promise<Record<SocialPlatform, boolean>> {
    try {
      const manager = this.getSocialManager();
      return await manager.testAllConnections();
    } catch (error) {
      throw new SocialMediaApiError("Failed to test platform connections", "FACEBOOK");
    }
  }

  // Capture leads from all platforms
  async captureLeadsFromAllPlatforms(since?: Date): Promise<{
    leads: LeadCaptureData[];
    processed: number;
    created: number;
    updated: number;
    errors: number;
  }> {
    try {
      const manager = this.getSocialManager();
      const leads = await manager.captureAllLeads(since);
      
      if (leads.length === 0) {
        return { leads: [], processed: 0, created: 0, updated: 0, errors: 0 };
      }

      const processingResult = await this.leadProcessor.batchProcessLeads(leads);
      
      return {
        leads,
        ...processingResult,
      };
    } catch (error) {
      throw new SocialMediaApiError("Failed to capture leads", "FACEBOOK");
    }
  }

  // Sync interactions for a specific contact
  async syncContactInteractions(
    contactId: Id<"contacts">,
    platform?: SocialPlatform,
    since?: Date
  ): Promise<{ synced: number; errors: number }> {
    return await this.interactionSync.syncContactInteractions(contactId, platform, since);
  }

  // Sync interactions for all contacts
  async syncAllInteractions(
    since?: Date,
    platform?: SocialPlatform
  ): Promise<{ totalContacts: number; totalSynced: number; totalErrors: number }> {
    return await this.interactionSync.syncAllContactsInteractions(since, platform);
  }

  // Get platform status
  async getPlatformStatus(): Promise<{
    platforms: Record<SocialPlatform, { connected: boolean; lastSync?: Date; error?: string }>;
    totalConnected: number;
  }> {
    try {
      const connections = await this.testPlatformConnections();
      const platforms: Record<string, any> = {};
      let totalConnected = 0;

      for (const [platform, connected] of Object.entries(connections)) {
        platforms[platform] = {
          connected,
          lastSync: new Date(), // This would be stored in config/database
        };
        if (connected) totalConnected++;
      }

      return { platforms: platforms as Record<SocialPlatform, any>, totalConnected };
    } catch (error) {
      throw new SocialMediaApiError("Failed to get platform status", "FACEBOOK");
    }
  }
}