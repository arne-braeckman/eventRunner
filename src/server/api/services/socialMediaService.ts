import type { SocialPlatform, InteractionType } from "../../../lib/types/contact";

export type { SocialPlatform };

// Social Media API Configuration Types
export interface FacebookApiConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  webhookVerifyToken: string;
}

export interface InstagramApiConfig {
  businessAccountId: string;
  accessToken: string;
}

export interface LinkedInApiConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
}

export interface SocialMediaApiConfig {
  facebook: FacebookApiConfig;
  instagram: InstagramApiConfig;
  linkedin: LinkedInApiConfig;
}

// Social Media Interaction Data Types
export interface SocialInteractionData {
  platform: SocialPlatform;
  type: InteractionType;
  externalId: string;
  userId?: string;
  userHandle?: string;
  userEmail?: string;
  content?: string;
  metadata: Record<string, any>;
  timestamp: number;
}

export interface LeadCaptureData {
  platform: SocialPlatform;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  formId?: string;
  adId?: string;
  campaignId?: string;
  metadata: Record<string, any>;
}

// Rate Limiting Configuration
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  platform: SocialPlatform;
}

export const RATE_LIMITS: Record<SocialPlatform, RateLimitConfig> = {
  FACEBOOK: { maxRequests: 200, windowMs: 3600000, platform: 'FACEBOOK' }, // 200/hour
  INSTAGRAM: { maxRequests: 200, windowMs: 3600000, platform: 'INSTAGRAM' }, // 200/hour (shared with FB)
  LINKEDIN: { maxRequests: 100, windowMs: 86400000, platform: 'LINKEDIN' }, // 100/day
  TWITTER: { maxRequests: 300, windowMs: 900000, platform: 'TWITTER' }, // 300/15min
  TIKTOK: { maxRequests: 100, windowMs: 3600000, platform: 'TIKTOK' }, // 100/hour
};

// Error Types
export class SocialMediaApiError extends Error {
  constructor(
    message: string,
    public platform: SocialPlatform,
    public statusCode?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'SocialMediaApiError';
  }
}

export class RateLimitExceededError extends SocialMediaApiError {
  constructor(platform: SocialPlatform, retryAfter: number) {
    super(`Rate limit exceeded for ${platform}`, platform, 429, retryAfter);
    this.name = 'RateLimitExceededError';
  }
}

// Base Social Media Service
export abstract class BaseSocialMediaService {
  protected config: any;
  protected platform: SocialPlatform;

  constructor(config: any, platform: SocialPlatform) {
    this.config = config;
    this.platform = platform;
  }

  // Abstract methods to be implemented by platform-specific services
  abstract validateConfig(): Promise<boolean>;
  abstract captureLeads(since?: Date): Promise<LeadCaptureData[]>;
  abstract getInteractions(contactId: string, since?: Date): Promise<SocialInteractionData[]>;
  abstract testConnection(): Promise<boolean>;

  // Common error handling
  protected handleApiError(error: any, operation: string): never {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      throw new RateLimitExceededError(this.platform, error.retryAfter || 3600);
    }
    
    throw new SocialMediaApiError(
      `${this.platform} API error during ${operation}: ${error.message}`,
      this.platform,
      error.statusCode
    );
  }

  // Rate limiting check
  protected async checkRateLimit(): Promise<void> {
    const limit = RATE_LIMITS[this.platform];
    // Implementation would check against a rate limiting store (Redis, etc.)
    // For now, we'll implement a simple in-memory check
    
    // This would be implemented with actual rate limiting logic
    // using Redis or similar store in production
  }
}

// Facebook Business API Service
export class FacebookApiService extends BaseSocialMediaService {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: FacebookApiConfig) {
    super(config, 'FACEBOOK');
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/me?access_token=${this.config.accessToken}`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.checkRateLimit();
      const response = await fetch(
        `${this.baseUrl}/me?fields=id,name&access_token=${this.config.accessToken}`
      );
      return response.ok;
    } catch (error) {
      this.handleApiError(error, 'connection test');
    }
  }

  async captureLeads(since?: Date): Promise<LeadCaptureData[]> {
    try {
      await this.checkRateLimit();
      
      // Get lead forms
      const formsResponse = await fetch(
        `${this.baseUrl}/${this.config.appId}/leadgen_forms?access_token=${this.config.accessToken}`
      );
      
      if (!formsResponse.ok) {
        throw new Error(`Failed to fetch lead forms: ${formsResponse.statusText}`);
      }
      
      const forms = await formsResponse.json();
      const leads: LeadCaptureData[] = [];
      
      // For each form, get leads
      for (const form of forms.data || []) {
        const leadsResponse = await fetch(
          `${this.baseUrl}/${form.id}/leads?access_token=${this.config.accessToken}${
            since ? `&filtering=[{field:"time_created",operator:"GREATER_THAN",value:${Math.floor(since.getTime() / 1000)}}]` : ''
          }`
        );
        
        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          
          for (const lead of leadsData.data || []) {
            const leadData: LeadCaptureData = {
              platform: 'FACEBOOK',
              formId: form.id,
              adId: lead.ad_id,
              campaignId: lead.campaign_id,
              metadata: {
                leadId: lead.id,
                formName: form.name,
                createdTime: lead.created_time,
                fieldData: lead.field_data
              }
            };
            
            // Parse field data
            for (const field of lead.field_data || []) {
              switch (field.name.toLowerCase()) {
                case 'email':
                  leadData.email = field.values[0];
                  break;
                case 'full_name':
                case 'name':
                  leadData.name = field.values[0];
                  break;
                case 'phone_number':
                case 'phone':
                  leadData.phone = field.values[0];
                  break;
                case 'company_name':
                case 'company':
                  leadData.company = field.values[0];
                  break;
                case 'message':
                  leadData.message = field.values[0];
                  break;
              }
            }
            
            leads.push(leadData);
          }
        }
      }
      
      return leads;
    } catch (error) {
      this.handleApiError(error, 'lead capture');
    }
  }

  async getInteractions(contactId: string, since?: Date): Promise<SocialInteractionData[]> {
    // This would require mapping contactId to Facebook user ID
    // and fetching their interactions with our page/content
    try {
      await this.checkRateLimit();
      
      // Implementation would fetch page insights, post interactions, etc.
      // For now, return empty array as this requires more complex setup
      return [];
    } catch (error) {
      this.handleApiError(error, 'interaction fetching');
    }
  }
}

// Instagram Business API Service
export class InstagramApiService extends BaseSocialMediaService {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: InstagramApiConfig) {
    super(config, 'INSTAGRAM');
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.businessAccountId}?fields=id,username&access_token=${this.config.accessToken}`
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.checkRateLimit();
      const response = await fetch(
        `${this.baseUrl}/${this.config.businessAccountId}?fields=id,username,name&access_token=${this.config.accessToken}`
      );
      return response.ok;
    } catch (error) {
      this.handleApiError(error, 'connection test');
    }
  }

  async captureLeads(since?: Date): Promise<LeadCaptureData[]> {
    // Instagram leads would come through Instagram messaging or story interactions
    // This requires webhooks setup and is more complex than form-based leads
    return [];
  }

  async getInteractions(contactId: string, since?: Date): Promise<SocialInteractionData[]> {
    try {
      await this.checkRateLimit();
      
      // Get media insights and interactions
      const mediaResponse = await fetch(
        `${this.baseUrl}/${this.config.businessAccountId}/media?fields=id,media_type,timestamp,like_count,comments_count&access_token=${this.config.accessToken}${
          since ? `&since=${Math.floor(since.getTime() / 1000)}` : ''
        }`
      );
      
      if (!mediaResponse.ok) {
        throw new Error(`Failed to fetch media: ${mediaResponse.statusText}`);
      }
      
      const media = await mediaResponse.json();
      const interactions: SocialInteractionData[] = [];
      
      // This is simplified - real implementation would need to track specific user interactions
      for (const post of media.data || []) {
        if (post.like_count > 0) {
          interactions.push({
            platform: 'INSTAGRAM',
            type: 'SOCIAL_LIKE',
            externalId: post.id,
            metadata: {
              mediaType: post.media_type,
              timestamp: post.timestamp,
              likeCount: post.like_count
            },
            timestamp: new Date(post.timestamp).getTime()
          });
        }
      }
      
      return interactions;
    } catch (error) {
      this.handleApiError(error, 'interaction fetching');
    }
  }
}

// LinkedIn Sales Navigator API Service
export class LinkedInApiService extends BaseSocialMediaService {
  private baseUrl = 'https://api.linkedin.com/v2';

  constructor(config: LinkedInApiConfig) {
    super(config, 'LINKEDIN');
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.checkRateLimit();
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      return response.ok;
    } catch (error) {
      this.handleApiError(error, 'connection test');
    }
  }

  async captureLeads(since?: Date): Promise<LeadCaptureData[]> {
    try {
      await this.checkRateLimit();
      
      // LinkedIn lead capture typically comes from Lead Gen Forms
      // This requires LinkedIn Marketing API access
      const response = await fetch(`${this.baseUrl}/adForms`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch LinkedIn forms: ${response.statusText}`);
      }
      
      // Implementation would process LinkedIn lead forms
      // For now, return empty array as this requires enterprise access
      return [];
    } catch (error) {
      this.handleApiError(error, 'lead capture');
    }
  }

  async getInteractions(contactId: string, since?: Date): Promise<SocialInteractionData[]> {
    // LinkedIn interaction tracking requires Sales Navigator API
    // This is typically limited to connection requests, messages, and profile views
    try {
      await this.checkRateLimit();
      
      // Implementation would require mapping contactId to LinkedIn profile
      // and fetching interaction data through Sales Navigator API
      return [];
    } catch (error) {
      this.handleApiError(error, 'interaction fetching');
    }
  }
}

// Social Media Service Factory
export class SocialMediaServiceFactory {
  static createService(platform: SocialPlatform, config: any): BaseSocialMediaService {
    switch (platform) {
      case 'FACEBOOK':
        return new FacebookApiService(config);
      case 'INSTAGRAM':
        return new InstagramApiService(config);
      case 'LINKEDIN':
        return new LinkedInApiService(config);
      default:
        throw new Error(`Unsupported social media platform: ${platform}`);
    }
  }
}

// Main Social Media Manager
export class SocialMediaManager {
  private services: Map<SocialPlatform, BaseSocialMediaService> = new Map();
  
  constructor(private config: SocialMediaApiConfig) {
    this.initializeServices();
  }
  
  private initializeServices(): void {
    if (this.config.facebook) {
      this.services.set('FACEBOOK', new FacebookApiService(this.config.facebook));
    }
    if (this.config.instagram) {
      this.services.set('INSTAGRAM', new InstagramApiService(this.config.instagram));
    }
    if (this.config.linkedin) {
      this.services.set('LINKEDIN', new LinkedInApiService(this.config.linkedin));
    }
  }
  
  async testAllConnections(): Promise<Record<SocialPlatform, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [platform, service] of this.services) {
      try {
        results[platform] = await service.testConnection();
      } catch (error) {
        results[platform] = false;
      }
    }
    
    return results as Record<SocialPlatform, boolean>;
  }
  
  async captureAllLeads(since?: Date): Promise<LeadCaptureData[]> {
    const allLeads: LeadCaptureData[] = [];
    
    for (const [platform, service] of this.services) {
      try {
        const leads = await service.captureLeads(since);
        allLeads.push(...leads);
      } catch (error) {
        console.error(`Error capturing leads from ${platform}:`, error);
      }
    }
    
    return allLeads;
  }
  
  async getContactInteractions(contactId: string, platform?: SocialPlatform, since?: Date): Promise<SocialInteractionData[]> {
    const interactions: SocialInteractionData[] = [];
    
    if (platform && this.services.has(platform)) {
      const service = this.services.get(platform)!;
      try {
        const platformInteractions = await service.getInteractions(contactId, since);
        interactions.push(...platformInteractions);
      } catch (error) {
        console.error(`Error fetching interactions from ${platform}:`, error);
      }
    } else {
      // Get interactions from all platforms
      for (const [platformName, service] of this.services) {
        try {
          const platformInteractions = await service.getInteractions(contactId, since);
          interactions.push(...platformInteractions);
        } catch (error) {
          console.error(`Error fetching interactions from ${platformName}:`, error);
        }
      }
    }
    
    return interactions;
  }
}