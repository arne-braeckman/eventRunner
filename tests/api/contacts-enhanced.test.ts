import { describe, it, expect } from 'vitest';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '../../convex/_generated/api';
import schema from '../../convex/schema';

describe('Enhanced Contacts API', () => {
  let t: ConvexTestingHelper<typeof schema>;

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema);
  });

  describe('createContact with enhanced fields', () => {
    it('should create contact with social profiles and custom fields', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        leadSource: 'WEBSITE' as const,
        socialProfiles: [
          {
            platform: 'LINKEDIN' as const,
            profileUrl: 'https://linkedin.com/in/johndoe',
            username: 'johndoe',
            isConnected: true,
          }
        ],
        customFields: {
          industry: 'Technology',
          company_size: '50-100',
          budget: '10000-50000'
        }
      };

      const contactId = await t.mutation(api.contacts.createContact, contactData);
      expect(contactId).toBeDefined();

      const contact = await t.query(api.contacts.getContactById, { contactId });
      expect(contact).toBeDefined();
      expect(contact?.name).toBe('John Doe');
      expect(contact?.leadHeatScore).toBe(0);
      expect(contact?.leadHeat).toBe('COLD');
      expect(contact?.socialProfiles).toHaveLength(1);
      expect(contact?.socialProfiles[0].platform).toBe('LINKEDIN');
      expect(contact?.customFields.industry).toBe('Technology');
    });

    it('should create contact with default values when optional fields are omitted', async () => {
      const contactData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        leadSource: 'FACEBOOK' as const,
      };

      const contactId = await t.mutation(api.contacts.createContact, contactData);
      const contact = await t.query(api.contacts.getContactById, { contactId });
      
      expect(contact?.leadHeatScore).toBe(0);
      expect(contact?.leadHeat).toBe('COLD');
      expect(contact?.socialProfiles).toEqual([]);
      expect(contact?.customFields).toEqual({});
    });
  });

  describe('updateContact with enhanced fields', () => {
    it('should update social profiles and custom fields', async () => {
      const contactId = await t.mutation(api.contacts.createContact, {
        name: 'Test User',
        email: 'test@example.com',
        leadSource: 'WEBSITE' as const,
      });

      const updatedData = {
        contactId,
        socialProfiles: [
          {
            platform: 'INSTAGRAM' as const,
            profileUrl: 'https://instagram.com/testuser',
            username: 'testuser',
            isConnected: false,
          }
        ],
        customFields: {
          notes: 'Very interested in premium package',
          preferred_contact: 'email'
        },
        leadHeatScore: 5,
        leadHeat: 'COLD' as const,
      };

      await t.mutation(api.contacts.updateContact, updatedData);
      
      const contact = await t.query(api.contacts.getContactById, { contactId });
      expect(contact?.socialProfiles).toHaveLength(1);
      expect(contact?.socialProfiles[0].platform).toBe('INSTAGRAM');
      expect(contact?.customFields.notes).toBe('Very interested in premium package');
      expect(contact?.leadHeatScore).toBe(5);
    });
  });
});