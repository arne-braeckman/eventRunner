import { describe, it, expect, beforeEach, vi } from 'vitest';
import { convexTest } from 'convex-test';
import schema from '../../convex/schema';
import * as opportunities from '../../convex/opportunities';

describe('Opportunity API', () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(async () => {
    t = convexTest(schema, { opportunities });
    await t.run(async (ctx) => {
      // Create test user
      await ctx.db.insert('users', {
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'ADMIN',
      });
      
      // Create test contact
      await ctx.db.insert('contacts', {
        name: 'John Doe',
        email: 'john@test.com',
        leadSource: 'WEBSITE',
        leadHeat: 'WARM',
        leadHeatScore: 10,
        status: 'QUALIFIED',
        assignedTo: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });
  });

  describe('createOpportunity', () => {
    it('should create a new opportunity successfully', async () => {
      const result = await t.run(async (ctx) => {
        // Mock authentication
        vi.mocked(ctx.auth.getUserIdentity).mockResolvedValue({
          tokenIdentifier: 'test-token',
          subject: 'test-user',
          email: 'admin@test.com',
        });

        const contacts = await ctx.db.query('contacts').collect();
        const contact = contacts[0];

        const opportunityData = {
          name: 'Wedding Event 2024',
          contactId: contact._id,
          stage: 'QUALIFIED' as const,
          value: 15000,
          eventType: 'WEDDING' as const,
          eventDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
          guestCount: 120,
          requiresCatering: true,
          description: 'Beautiful summer wedding',
        };

        return await opportunities.createOpportunity(ctx, opportunityData);
      });

      expect(result).toBeDefined();
      
      const opportunity = await t.run(async (ctx) => {
        return await ctx.db.get(result);
      });

      expect(opportunity).toMatchObject({
        name: 'Wedding Event 2024',
        stage: 'QUALIFIED',
        value: 15000,
        eventType: 'WEDDING',
        guestCount: 120,
        requiresCatering: true,
        isActive: true,
        probability: 25, // Default for QUALIFIED stage
      });
    });

    it('should throw error for non-existent contact', async () => {
      await expect(
        t.run(async (ctx) => {
          vi.mocked(ctx.auth.getUserIdentity).mockResolvedValue({
            tokenIdentifier: 'test-token',
            subject: 'test-user',
            email: 'admin@test.com',
          });

          return await opportunities.createOpportunity(ctx, {
            name: 'Test Opportunity',
            contactId: 'non-existent-id' as any,
            value: 5000,
            eventType: 'CORPORATE' as const,
            eventDate: Date.now(),
            guestCount: 50,
            requiresCatering: false,
          });
        })
      ).rejects.toThrow('Contact not found');
    });

    it('should set default probability based on stage', async () => {
      const result = await t.run(async (ctx) => {
        vi.mocked(ctx.auth.getUserIdentity).mockResolvedValue({
          tokenIdentifier: 'test-token',
          subject: 'test-user',
          email: 'admin@test.com',
        });

        const contacts = await ctx.db.query('contacts').collect();
        const contact = contacts[0];

        return await api.opportunities.createOpportunity(ctx, {
          name: 'Test Opportunity',
          contactId: contact._id,
          stage: 'PROPOSAL' as const,
          value: 5000,
          eventType: 'CORPORATE' as const,
          eventDate: Date.now(),
          guestCount: 50,
          requiresCatering: false,
        });
      });

      const opportunity = await t.run(async (ctx) => {
        return await ctx.db.get(result);
      });

      expect(opportunity?.probability).toBe(50); // Default for PROPOSAL stage
    });
  });

  describe('getAllOpportunities', () => {
    beforeEach(async () => {
      await t.run(async (ctx) => {
        const contacts = await ctx.db.query('contacts').collect();
        const contact = contacts[0];

        // Create multiple test opportunities
        await ctx.db.insert('opportunities', {
          name: 'Wedding A',
          contactId: contact._id,
          stage: 'QUALIFIED',
          value: 10000,
          eventType: 'WEDDING',
          eventDate: Date.now(),
          guestCount: 100,
          requiresCatering: true,
          probability: 25,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        await ctx.db.insert('opportunities', {
          name: 'Corporate B',
          contactId: contact._id,
          stage: 'PROPOSAL',
          value: 5000,
          eventType: 'CORPORATE',
          eventDate: Date.now(),
          guestCount: 50,
          requiresCatering: false,
          probability: 50,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    });

    it('should return all opportunities when no filters applied', async () => {
      const opportunities = await t.run(async (ctx) => {
        vi.mocked(ctx.auth.getUserIdentity).mockResolvedValue({
          tokenIdentifier: 'test-token',
          subject: 'test-user',
          email: 'admin@test.com',
        });

        return await opportunities.getAllOpportunities(ctx, {});
      });

      expect(opportunities).toHaveLength(2);
    });

    it('should filter opportunities by stage', async () => {
      const opportunities = await t.run(async (ctx) => {
        vi.mocked(ctx.auth.getUserIdentity).mockResolvedValue({
          tokenIdentifier: 'test-token',
          subject: 'test-user',
          email: 'admin@test.com',
        });

        return await opportunities.getAllOpportunities(ctx, {
          stage: 'QUALIFIED',
        });
      });

      expect(opportunities).toHaveLength(1);
      expect(opportunities[0].stage).toBe('QUALIFIED');
    });

    it('should filter opportunities by event type', async () => {
      const opportunities = await t.run(async (ctx) => {
        vi.mocked(ctx.auth.getUserIdentity).mockResolvedValue({
          tokenIdentifier: 'test-token',
          subject: 'test-user',
          email: 'admin@test.com',
        });

        return await opportunities.getAllOpportunities(ctx, {
          eventType: 'CORPORATE',
        });
      });

      expect(opportunities).toHaveLength(1);
      expect(opportunities[0].eventType).toBe('CORPORATE');
    });
  });

  describe('updateOpportunityStage', () => {
    let opportunityId: any;

    beforeEach(async () => {
      opportunityId = await t.run(async (ctx) => {
        const contacts = await ctx.db.query('contacts').collect();
        const contact = contacts[0];

        return await ctx.db.insert('opportunities', {
          name: 'Test Opportunity',
          contactId: contact._id,
          stage: 'QUALIFIED',
          value: 8000,
          eventType: 'WEDDING',
          eventDate: Date.now(),
          guestCount: 80,
          requiresCatering: true,
          probability: 25,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    });

    it('should update stage and auto-set probability', async () => {
      await t.run(async (ctx) => {
        vi.mocked(ctx.auth.getUserIdentity).mockResolvedValue({
          tokenIdentifier: 'test-token',
          subject: 'test-user',
          email: 'admin@test.com',
        });

        await opportunities.updateOpportunityStage(ctx, {
          opportunityId,
          stage: 'NEGOTIATION',
        });
      });

      const opportunity = await t.run(async (ctx) => {
        return await ctx.db.get(opportunityId);
      });

      expect(opportunity?.stage).toBe('NEGOTIATION');
      expect(opportunity?.probability).toBe(75); // Default for NEGOTIATION
    });

    it('should use custom probability when provided', async () => {
      await t.run(async (ctx) => {
        vi.mocked(ctx.auth.getUserIdentity).mockResolvedValue({
          tokenIdentifier: 'test-token',
          subject: 'test-user',
          email: 'admin@test.com',
        });

        await opportunities.updateOpportunityStage(ctx, {
          opportunityId,
          stage: 'NEGOTIATION',
          probability: 85,
        });
      });

      const opportunity = await t.run(async (ctx) => {
        return await ctx.db.get(opportunityId);
      });

      expect(opportunity?.stage).toBe('NEGOTIATION');
      expect(opportunity?.probability).toBe(85);
    });
  });

  describe('getDateConflicts', () => {
    beforeEach(async () => {
      await t.run(async (ctx) => {
        const contacts = await ctx.db.query('contacts').collect();
        const contact = contacts[0];

        const eventDate = new Date('2024-06-15').getTime();

        // Create opportunities with same event date
        await ctx.db.insert('opportunities', {
          name: 'Wedding A',
          contactId: contact._id,
          stage: 'QUALIFIED',
          value: 10000,
          eventType: 'WEDDING',
          eventDate,
          guestCount: 100,
          requiresCatering: true,
          probability: 25,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        await ctx.db.insert('opportunities', {
          name: 'Corporate Event',
          contactId: contact._id,
          stage: 'PROPOSAL',
          value: 5000,
          eventType: 'CORPORATE',
          eventDate,
          guestCount: 50,
          requiresCatering: false,
          probability: 50,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    });

    it('should detect date conflicts', async () => {
      const conflicts = await t.run(async (ctx) => {
        vi.mocked(ctx.auth.getUserIdentity).mockResolvedValue({
          tokenIdentifier: 'test-token',
          subject: 'test-user',
          email: 'admin@test.com',
        });

        return await opportunities.getDateConflicts(ctx, {
          eventDate: new Date('2024-06-15').getTime(),
        });
      });

      expect(conflicts).toHaveLength(2);
    });

    it('should exclude specified opportunity from conflicts', async () => {
      const opportunities = await t.run(async (ctx) => {
        return await ctx.db.query('opportunities').collect();
      });

      const excludeId = opportunities[0]._id;

      const conflicts = await t.run(async (ctx) => {
        vi.mocked(ctx.auth.getUserIdentity).mockResolvedValue({
          tokenIdentifier: 'test-token',
          subject: 'test-user',
          email: 'admin@test.com',
        });

        return await opportunities.getDateConflicts(ctx, {
          eventDate: new Date('2024-06-15').getTime(),
          excludeOpportunityId: excludeId,
        });
      });

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]._id).not.toBe(excludeId);
    });
  });

  describe('getRevenueForecasting', () => {
    beforeEach(async () => {
      await t.run(async (ctx) => {
        const contacts = await ctx.db.query('contacts').collect();
        const contact = contacts[0];

        const now = Date.now();
        const futureDate = now + (30 * 24 * 60 * 60 * 1000);

        await ctx.db.insert('opportunities', {
          name: 'High Value Wedding',
          contactId: contact._id,
          stage: 'NEGOTIATION',
          value: 20000,
          eventType: 'WEDDING',
          eventDate: futureDate,
          guestCount: 150,
          requiresCatering: true,
          probability: 75,
          expectedCloseDate: futureDate,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });

        await ctx.db.insert('opportunities', {
          name: 'Corporate Event',
          contactId: contact._id,
          stage: 'QUALIFIED',
          value: 8000,
          eventType: 'CORPORATE',
          eventDate: futureDate,
          guestCount: 80,
          requiresCatering: false,
          probability: 25,
          expectedCloseDate: futureDate,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      });
    });

    it('should calculate revenue forecasting correctly', async () => {
      const forecasting = await t.run(async (ctx) => {
        vi.mocked(ctx.auth.getUserIdentity).mockResolvedValue({
          tokenIdentifier: 'test-token',
          subject: 'test-user',
          email: 'admin@test.com',
        });

        return await opportunities.getRevenueForecasting(ctx, {});
      });

      expect(forecasting.summary.totalOpportunities).toBe(2);
      expect(forecasting.summary.totalValue).toBe(28000);
      expect(forecasting.summary.totalWeightedValue).toBe(17000); // (20000 * 0.75) + (8000 * 0.25)
      expect(forecasting.opportunities).toHaveLength(2);
    });
  });
});