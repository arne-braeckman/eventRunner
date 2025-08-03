import { describe, it, expect } from 'vitest';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '../../convex/_generated/api';
import schema from '../../convex/schema';

describe('Interactions API', () => {
  let t: ConvexTestingHelper<typeof schema>;

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema);
  });

  describe('createInteraction', () => {
    it('should create interaction and update contact lastInteractionAt', async () => {
      // Create a test contact first
      const contactId = await t.mutation(api.contacts.createContact, {
        name: 'Test Contact',
        email: 'test@example.com',
        leadSource: 'WEBSITE' as const,
      });

      const interactionData = {
        contactId,
        type: 'WEBSITE_VISIT' as const,
        platform: 'WEBSITE' as const,
        description: 'Viewed pricing page',
        metadata: {
          page: '/pricing',
          duration: 120
        }
      };

      const interactionId = await t.mutation(api.interactions.createInteraction, interactionData);
      expect(interactionId).toBeDefined();

      // Check that contact's lastInteractionAt was updated
      const contact = await t.query(api.contacts.getContactById, { contactId });
      expect(contact?.lastInteractionAt).toBeDefined();
      expect(contact?.lastInteractionAt).toBeGreaterThan(0);
    });

    it('should create social media interaction', async () => {
      const contactId = await t.mutation(api.contacts.createContact, {
        name: 'Social Contact',
        email: 'social@example.com',
        leadSource: 'INSTAGRAM' as const,
      });

      const interactionData = {
        contactId,
        type: 'SOCIAL_LIKE' as const,
        platform: 'INSTAGRAM' as const,
        description: 'Liked our latest post',
        metadata: {
          post_id: 'post123',
          post_type: 'image'
        }
      };

      const interactionId = await t.mutation(api.interactions.createInteraction, interactionData);
      expect(interactionId).toBeDefined();
    });
  });

  describe('getInteractionsByContact', () => {
    it('should retrieve interactions for a contact', async () => {
      const contactId = await t.mutation(api.contacts.createContact, {
        name: 'Test Contact',
        email: 'test@example.com',
        leadSource: 'WEBSITE' as const,
      });

      // Create multiple interactions
      await t.mutation(api.interactions.createInteraction, {
        contactId,
        type: 'WEBSITE_VISIT' as const,
        description: 'First visit',
      });

      await t.mutation(api.interactions.createInteraction, {
        contactId,
        type: 'INFO_REQUEST' as const,
        description: 'Requested info',
      });

      const result = await t.query(api.interactions.getInteractionsByContact, {
        contactId,
        limit: 10,
      });

      expect(result.interactions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
    });

    it('should handle pagination correctly', async () => {
      const contactId = await t.mutation(api.contacts.createContact, {
        name: 'Test Contact',
        email: 'test@example.com',
        leadSource: 'WEBSITE' as const,
      });

      // Create 5 interactions
      for (let i = 0; i < 5; i++) {
        await t.mutation(api.interactions.createInteraction, {
          contactId,
          type: 'WEBSITE_VISIT' as const,
          description: `Visit ${i + 1}`,
        });
      }

      const result = await t.query(api.interactions.getInteractionsByContact, {
        contactId,
        limit: 3,
        offset: 0,
      });

      expect(result.interactions).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('calculateContactHeatScore', () => {
    it('should calculate heat score correctly based on interactions', async () => {
      const contactId = await t.mutation(api.contacts.createContact, {
        name: 'Test Contact',
        email: 'test@example.com',
        leadSource: 'WEBSITE' as const,
      });

      // Create interactions worth 16 points (HOT threshold)
      await t.mutation(api.interactions.createInteraction, {
        contactId,
        type: 'SOCIAL_FOLLOW' as const, // 1 point
        platform: 'INSTAGRAM' as const,
      });

      await t.mutation(api.interactions.createInteraction, {
        contactId,
        type: 'INFO_REQUEST' as const, // 5 points
      });

      await t.mutation(api.interactions.createInteraction, {
        contactId,
        type: 'SITE_VISIT' as const, // 10 points
      });

      const result = await t.mutation(api.interactions.calculateContactHeatScore, {
        contactId,
      });

      expect(result.heatScore).toBe(16);
      expect(result.leadHeat).toBe('HOT');

      // Verify contact was updated
      const contact = await t.query(api.contacts.getContactById, { contactId });
      expect(contact?.leadHeatScore).toBe(16);
      expect(contact?.leadHeat).toBe('HOT');
    });

    it('should categorize heat levels correctly', async () => {
      const contactId = await t.mutation(api.contacts.createContact, {
        name: 'Test Contact',
        email: 'test@example.com',
        leadSource: 'WEBSITE' as const,
      });

      // Create interactions worth 8 points (WARM)
      await t.mutation(api.interactions.createInteraction, {
        contactId,
        type: 'PRICE_QUOTE' as const, // 8 points
      });

      const result = await t.mutation(api.interactions.calculateContactHeatScore, {
        contactId,
      });

      expect(result.heatScore).toBe(8);
      expect(result.leadHeat).toBe('WARM');
    });
  });

  describe('deleteInteraction', () => {
    it('should delete interaction and recalculate heat score', async () => {
      const contactId = await t.mutation(api.contacts.createContact, {
        name: 'Test Contact',
        email: 'test@example.com',
        leadSource: 'WEBSITE' as const,
      });

      const interactionId1 = await t.mutation(api.interactions.createInteraction, {
        contactId,
        type: 'SITE_VISIT' as const, // 10 points
      });

      const interactionId2 = await t.mutation(api.interactions.createInteraction, {
        contactId,
        type: 'PRICE_QUOTE' as const, // 8 points
      });

      // Calculate initial heat score (18 points = HOT)
      await t.mutation(api.interactions.calculateContactHeatScore, { contactId });
      
      let contact = await t.query(api.contacts.getContactById, { contactId });
      expect(contact?.leadHeat).toBe('HOT');

      // Delete the site visit interaction
      await t.mutation(api.interactions.deleteInteraction, {
        interactionId: interactionId1,
      });

      // Check that heat score was recalculated (8 points = WARM)
      contact = await t.query(api.contacts.getContactById, { contactId });
      expect(contact?.leadHeatScore).toBe(8);
      expect(contact?.leadHeat).toBe('WARM');
    });
  });
});