import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock crypto module
vi.mock('crypto', () => ({
  default: {
    createHmac: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('mocked_hash'),
    }),
    timingSafeEqual: vi.fn().mockReturnValue(true),
  },
  createHmac: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('mocked_hash'),
  }),
  timingSafeEqual: vi.fn().mockReturnValue(true),
}));

describe('Webhook Handlers', () => {
  describe('WebhookSignatureVerifier', () => {
    it('should verify Facebook webhook signatures', () => {
      const { WebhookSignatureVerifier } = require('../../src/server/api/services/webhookHandlers');
      
      const payload = '{"test": "data"}';
      const signature = 'sha256=mocked_hash';
      const secret = 'test_secret';
      
      const isValid = WebhookSignatureVerifier.verifyFacebookSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('should verify Instagram webhook signatures', () => {
      const { WebhookSignatureVerifier } = require('../../src/server/api/services/webhookHandlers');
      
      const payload = '{"test": "data"}';
      const signature = 'sha256=mocked_hash';
      const secret = 'test_secret';
      
      const isValid = WebhookSignatureVerifier.verifyInstagramSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('should verify LinkedIn webhook signatures', () => {
      const { WebhookSignatureVerifier } = require('../../src/server/api/services/webhookHandlers');
      
      const payload = '{"test": "data"}';
      const signature = 'mocked_hash';
      const secret = 'test_secret';
      
      const isValid = WebhookSignatureVerifier.verifyLinkedInSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });
  });

  describe('FacebookWebhookHandler', () => {
    it('should process Facebook webhook payload', async () => {
      const { FacebookWebhookHandler } = require('../../src/server/api/services/webhookHandlers');
      
      const mockCtx = { db: null };
      const handler = new FacebookWebhookHandler(mockCtx);
      
      const payload = {
        object: 'page',
        entry: [
          {
            id: 'page123',
            time: Date.now(),
            changes: [
              {
                field: 'leadgen',
                value: {
                  leadgen_id: 'lead123',
                  form_id: 'form123',
                  field_data: [
                    { name: 'email', values: ['test@example.com'] },
                    { name: 'full_name', values: ['John Doe'] },
                  ],
                },
              },
            ],
          },
        ],
      };

      // Should not throw an error
      await expect(handler.processWebhook(payload)).resolves.not.toThrow();
    });

    it('should ignore non-page events', async () => {
      const { FacebookWebhookHandler } = require('../../src/server/api/services/webhookHandlers');
      
      const mockCtx = { db: null };
      const handler = new FacebookWebhookHandler(mockCtx);
      
      const payload = {
        object: 'user',
        entry: [],
      };

      // Should return early without processing
      await expect(handler.processWebhook(payload)).resolves.not.toThrow();
    });
  });

  describe('InstagramWebhookHandler', () => {
    it('should process Instagram webhook payload', async () => {
      const { InstagramWebhookHandler } = require('../../src/server/api/services/webhookHandlers');
      
      const mockCtx = { db: null };
      const handler = new InstagramWebhookHandler(mockCtx);
      
      const payload = {
        object: 'instagram',
        entry: [
          {
            id: 'business123',
            time: Date.now(),
            changes: [
              {
                field: 'comments',
                value: {
                  comment_id: 'comment123',
                  media_id: 'media123',
                  user_id: 'user123',
                  text: 'Great post!',
                },
              },
            ],
          },
        ],
      };

      // Should not throw an error
      await expect(handler.processWebhook(payload)).resolves.not.toThrow();
    });

    it('should ignore non-instagram events', async () => {
      const { InstagramWebhookHandler } = require('../../src/server/api/services/webhookHandlers');
      
      const mockCtx = { db: null };
      const handler = new InstagramWebhookHandler(mockCtx);
      
      const payload = {
        object: 'page',
        entry: [],
      };

      // Should return early without processing
      await expect(handler.processWebhook(payload)).resolves.not.toThrow();
    });
  });

  describe('LinkedInWebhookHandler', () => {
    it('should process LinkedIn webhook payload', async () => {
      const { LinkedInWebhookHandler } = require('../../src/server/api/services/webhookHandlers');
      
      const mockCtx = { db: null };
      const handler = new LinkedInWebhookHandler(mockCtx);
      
      const payload = {
        webhookId: 'webhook123',
        eventType: 'MEMBER_ENGAGEMENT',
        createdAt: Date.now(),
        data: {
          entityUrn: 'urn:li:entity:123',
          action: 'LIKE',
          memberUrn: 'urn:li:member:456',
        },
      };

      // Should not throw an error
      await expect(handler.processWebhook(payload)).resolves.not.toThrow();
    });

    it('should process LinkedIn lead events', async () => {
      const { LinkedInWebhookHandler } = require('../../src/server/api/services/webhookHandlers');
      
      const mockCtx = { db: null };
      const handler = new LinkedInWebhookHandler(mockCtx);
      
      const payload = {
        webhookId: 'webhook123',
        eventType: 'LEAD_EVENT',
        createdAt: Date.now(),
        data: {
          entityUrn: 'urn:li:lead:123',
          firstName: 'John',
          lastName: 'Doe',
          emailAddress: 'john@example.com',
          companyName: 'Test Company',
        },
      };

      // Should not throw an error
      await expect(handler.processWebhook(payload)).resolves.not.toThrow();
    });
  });

  describe('WebhookHandlerFactory', () => {
    it('should create platform-specific webhook handlers', () => {
      const { WebhookHandlerFactory } = require('../../src/server/api/services/webhookHandlers');
      
      const mockCtx = { db: null };
      
      const facebookHandler = WebhookHandlerFactory.createHandler('FACEBOOK', mockCtx);
      expect(facebookHandler.platform).toBe('FACEBOOK');
      
      const instagramHandler = WebhookHandlerFactory.createHandler('INSTAGRAM', mockCtx);
      expect(instagramHandler.platform).toBe('INSTAGRAM');
      
      const linkedinHandler = WebhookHandlerFactory.createHandler('LINKEDIN', mockCtx);
      expect(linkedinHandler.platform).toBe('LINKEDIN');
    });

    it('should throw error for unsupported platform', () => {
      const { WebhookHandlerFactory } = require('../../src/server/api/services/webhookHandlers');
      
      const mockCtx = { db: null };
      
      expect(() => {
        WebhookHandlerFactory.createHandler('UNSUPPORTED' as any, mockCtx);
      }).toThrow('Unsupported webhook platform: UNSUPPORTED');
    });
  });

  describe('WebhookRouter', () => {
    it('should register and handle webhooks for multiple platforms', async () => {
      const { WebhookRouter } = require('../../src/server/api/services/webhookHandlers');
      
      const mockCtx = { db: null };
      const router = new WebhookRouter(mockCtx);
      
      router.registerHandler('FACEBOOK');
      router.registerHandler('INSTAGRAM');
      
      // Mock NextRequest
      const mockRequest = {
        text: vi.fn().mockResolvedValue('{"test": "data"}'),
        headers: {
          get: vi.fn().mockReturnValue('sha256=mocked_hash'),
        },
      } as unknown as NextRequest;
      
      const result = await router.handleWebhook('FACEBOOK', mockRequest, 'test_secret');
      expect(result.success).toBe(true);
    });

    it('should handle webhook verification', async () => {
      const { WebhookRouter } = require('../../src/server/api/services/webhookHandlers');
      
      const mockCtx = { db: null };
      const router = new WebhookRouter(mockCtx);
      
      // Mock NextRequest with URL for verification
      const mockRequest = {
        url: 'https://example.com/webhook?hub.mode=subscribe&hub.verify_token=test_token&hub.challenge=challenge123',
      } as NextRequest;
      
      const result = await router.verifyWebhook('FACEBOOK', mockRequest, 'test_token');
      expect(result.success).toBe(true);
      expect(result.challenge).toBe('challenge123');
    });

    it('should fail verification with wrong token', async () => {
      const { WebhookRouter } = require('../../src/server/api/services/webhookHandlers');
      
      const mockCtx = { db: null };
      const router = new WebhookRouter(mockCtx);
      
      // Mock NextRequest with wrong verify token
      const mockRequest = {
        url: 'https://example.com/webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=challenge123',
      } as NextRequest;
      
      const result = await router.verifyWebhook('FACEBOOK', mockRequest, 'correct_token');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Verification failed');
    });
  });
});