import { describe, it, expect, vi } from 'vitest';

// Mock the social media services
vi.mock('../../src/server/api/services/socialMediaService', () => ({
  FacebookApiService: vi.fn().mockImplementation(() => ({
    validateConfig: vi.fn().mockResolvedValue(true),
    testConnection: vi.fn().mockResolvedValue(true),
    captureLeads: vi.fn().mockResolvedValue([]),
    getInteractions: vi.fn().mockResolvedValue([]),
  })),
  InstagramApiService: vi.fn().mockImplementation(() => ({
    validateConfig: vi.fn().mockResolvedValue(true),
    testConnection: vi.fn().mockResolvedValue(true),
    captureLeads: vi.fn().mockResolvedValue([]),
    getInteractions: vi.fn().mockResolvedValue([]),
  })),
  LinkedInApiService: vi.fn().mockImplementation(() => ({
    validateConfig: vi.fn().mockResolvedValue(true),
    testConnection: vi.fn().mockResolvedValue(true),
    captureLeads: vi.fn().mockResolvedValue([]),
    getInteractions: vi.fn().mockResolvedValue([]),
  })),
  SocialMediaManager: vi.fn().mockImplementation(() => ({
    testAllConnections: vi.fn().mockResolvedValue({
      FACEBOOK: true,
      INSTAGRAM: true,
      LINKEDIN: false,
    }),
    captureAllLeads: vi.fn().mockResolvedValue([
      {
        platform: 'FACEBOOK',
        email: 'test@example.com',
        name: 'Test Lead',
        formId: 'form123',
        metadata: { source: 'facebook_lead_form' },
      }
    ]),
    getContactInteractions: vi.fn().mockResolvedValue([
      {
        platform: 'INSTAGRAM',
        type: 'SOCIAL_LIKE',
        externalId: 'like123',
        timestamp: Date.now(),
        metadata: { post_id: 'post123' },
      }
    ]),
  })),
  SocialMediaApiError: Error,
  RateLimitExceededError: Error,
}));

describe('Social Media API Integration', () => {

  describe('Social Media Service Factory', () => {
    it('should create platform-specific services', () => {
      const { SocialMediaServiceFactory } = require('../../src/server/api/services/socialMediaService');
      
      const facebookConfig = {
        appId: 'test_app_id',
        appSecret: 'test_secret',
        accessToken: 'test_token',
        webhookVerifyToken: 'verify_token',
      };

      const facebookService = SocialMediaServiceFactory.createService('FACEBOOK', facebookConfig);
      expect(facebookService).toBeDefined();
      expect(facebookService.platform).toBe('FACEBOOK');
    });

    it('should throw error for unsupported platform', () => {
      const { SocialMediaServiceFactory } = require('../../src/server/api/services/socialMediaService');
      
      expect(() => {
        SocialMediaServiceFactory.createService('UNSUPPORTED' as any, {});
      }).toThrow('Unsupported social media platform: UNSUPPORTED');
    });
  });

  describe('Lead Heat Calculation', () => {
    it('should calculate lead heat scores correctly', () => {
      const { calculateLeadHeatScore, getLeadHeatFromScore } = require('../../src/lib/utils/leadHeatCalculator');
      
      const interactions = [
        { type: 'SOCIAL_FOLLOW' }, // 1 point
        { type: 'WEBSITE_VISIT' }, // 2 points
        { type: 'INFO_REQUEST' }, // 5 points
      ];

      const score = calculateLeadHeatScore(interactions);
      expect(score).toBe(8);
      
      const heat = getLeadHeatFromScore(score);
      expect(heat).toBe('WARM');
    });

    it('should categorize heat levels correctly', () => {
      const { getLeadHeatFromScore } = require('../../src/lib/utils/leadHeatCalculator');
      
      expect(getLeadHeatFromScore(3)).toBe('COLD');
      expect(getLeadHeatFromScore(10)).toBe('WARM');
      expect(getLeadHeatFromScore(20)).toBe('HOT');
    });
  });

  describe('Social Media Integration Service', () => {
    it('should initialize configuration correctly', async () => {
      const { SocialMediaIntegrationService } = require('../../src/server/api/services/socialMediaIntegrationService');
      
      const config = {
        facebook: {
          appId: 'test_app_id',
          appSecret: 'test_secret',
          accessToken: 'test_token',
          webhookVerifyToken: 'verify_token',
        },
        instagram: {
          businessAccountId: 'business_id',
          accessToken: 'test_token',
        },
        linkedin: {
          clientId: 'client_id',
          clientSecret: 'client_secret',
          accessToken: 'test_token',
        },
      };

      const service = new SocialMediaIntegrationService({ db: null });
      await service.initializeConfiguration(config);
      
      // Should not throw an error
      expect(true).toBe(true);
    });

    it('should test platform connections', async () => {
      const { SocialMediaIntegrationService } = require('../../src/server/api/services/socialMediaIntegrationService');
      
      const service = new SocialMediaIntegrationService({ db: null });
      
      // Mock configuration
      await service.initializeConfiguration({
        facebook: { appId: 'test', appSecret: 'test', accessToken: 'test', webhookVerifyToken: 'test' },
        instagram: { businessAccountId: 'test', accessToken: 'test' },
        linkedin: { clientId: 'test', clientSecret: 'test', accessToken: 'test' },
      });

      const connections = await service.testPlatformConnections();
      
      expect(connections.FACEBOOK).toBe(true);
      expect(connections.INSTAGRAM).toBe(true);
      expect(connections.LINKEDIN).toBe(false);
    });
  });

  describe('Webhook Signature Verification', () => {
    it('should verify Facebook webhook signatures correctly', () => {
      const { WebhookSignatureVerifier } = require('../../src/server/api/services/webhookHandlers');
      
      const payload = '{"test": "data"}';
      const secret = 'test_secret';
      
      // Create a valid signature
      const crypto = require('crypto');
      const expectedSignature = 'sha256=' + 
        crypto.createHmac('sha256', secret)
          .update(payload)
          .digest('hex');
      
      const isValid = WebhookSignatureVerifier.verifyFacebookSignature(
        payload,
        expectedSignature,
        secret
      );
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid Facebook webhook signatures', () => {
      const { WebhookSignatureVerifier } = require('../../src/server/api/services/webhookHandlers');
      
      const payload = '{"test": "data"}';
      const secret = 'test_secret';
      const invalidSignature = 'sha256=invalid_signature';
      
      const isValid = WebhookSignatureVerifier.verifyFacebookSignature(
        payload,
        invalidSignature,
        secret
      );
      
      expect(isValid).toBe(false);
    });
  });

  describe('Lead Processing Service', () => {
    it('should process lead capture data and create contact', async () => {
      const { LeadProcessingService } = require('../../src/server/api/services/socialMediaIntegrationService');
      
      const mockCtx = {
        db: {
          query: vi.fn().mockReturnValue({
            withIndex: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(null), // No existing contact
            }),
          }),
          insert: vi.fn().mockResolvedValue('contact123'),
        },
      };

      const service = new LeadProcessingService(mockCtx);
      
      const leadData = {
        platform: 'FACEBOOK' as const,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        company: 'Test Company',
        message: 'Interested in services',
        formId: 'form123',
        metadata: { source: 'facebook_ad' },
      };

      const contactId = await service.processLeadCaptureData(leadData);
      
      expect(contactId).toBe('contact123');
      expect(mockCtx.db.insert).toHaveBeenCalledWith('contacts', expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
        leadSource: 'FACEBOOK',
        leadHeatScore: 5,
      }));
    });

    it('should update existing contact when email matches', async () => {
      const { LeadProcessingService } = require('../../src/server/api/services/socialMediaIntegrationService');
      
      const existingContact = {
        _id: 'existing123',
        email: 'john@example.com',
        name: 'John Doe',
      };

      const mockCtx = {
        db: {
          query: vi.fn().mockReturnValue({
            withIndex: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(existingContact),
            }),
          }),
          insert: vi.fn().mockResolvedValue('interaction123'),
          patch: vi.fn().mockResolvedValue(true),
        },
      };

      const service = new LeadProcessingService(mockCtx);
      
      const leadData = {
        platform: 'FACEBOOK' as const,
        email: 'john@example.com',
        name: 'John Doe',
        metadata: {},
      };

      const contactId = await service.processLeadCaptureData(leadData);
      
      expect(contactId).toBe('existing123');
      expect(mockCtx.db.patch).toHaveBeenCalledWith('existing123', expect.objectContaining({
        lastInteractionAt: expect.any(Number),
        updatedAt: expect.any(Number),
      }));
    });
  });

  describe('Rate Limiting', () => {
    it('should define rate limits for all platforms', () => {
      const { RATE_LIMITS } = require('../../src/server/api/services/socialMediaService');
      
      expect(RATE_LIMITS.FACEBOOK).toEqual({
        maxRequests: 200,
        windowMs: 3600000,
        platform: 'FACEBOOK',
      });
      
      expect(RATE_LIMITS.INSTAGRAM).toEqual({
        maxRequests: 200,
        windowMs: 3600000,
        platform: 'INSTAGRAM',
      });
      
      expect(RATE_LIMITS.LINKEDIN).toEqual({
        maxRequests: 100,
        windowMs: 86400000,
        platform: 'LINKEDIN',
      });
    });
  });

  describe('Error Handling', () => {
    it('should create SocialMediaApiError with correct properties', () => {
      const { SocialMediaApiError } = require('../../src/server/api/services/socialMediaService');
      
      const error = new SocialMediaApiError(
        'Test error',
        'FACEBOOK',
        429,
        3600
      );
      
      expect(error.message).toBe('Test error');
      expect(error.platform).toBe('FACEBOOK');
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(3600);
      expect(error.name).toBe('SocialMediaApiError');
    });

    it('should create RateLimitExceededError with correct properties', () => {
      const { RateLimitExceededError } = require('../../src/server/api/services/socialMediaService');
      
      const error = new RateLimitExceededError('LINKEDIN', 7200);
      
      expect(error.message).toBe('Rate limit exceeded for LINKEDIN');
      expect(error.platform).toBe('LINKEDIN');
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(7200);
      expect(error.name).toBe('RateLimitExceededError');
    });
  });
});