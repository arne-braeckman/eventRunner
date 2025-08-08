import { describe, it, expect } from 'vitest';
import {
  calculateWeightedValue,
  calculateRevenueForecasting,
  getStageConversionRates,
  detectDateConflicts,
  validateOpportunityValue,
} from '../../src/lib/utils/opportunityCalculations';
import type { Opportunity } from '../../src/lib/types/opportunity';

describe('Opportunity Calculations', () => {
  const mockOpportunity: Opportunity = {
    _id: 'opp1' as any,
    name: 'Test Wedding',
    contactId: 'contact1' as any,
    stage: 'QUALIFIED',
    value: 10000,
    eventType: 'WEDDING',
    eventDate: Date.now(),
    guestCount: 100,
    requiresCatering: true,
    probability: 75,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  describe('calculateWeightedValue', () => {
    it('should calculate weighted value correctly', () => {
      const result = calculateWeightedValue(mockOpportunity);
      expect(result).toBe(7500); // 10000 * 0.75
    });

    it('should handle zero probability', () => {
      const opportunity = { ...mockOpportunity, probability: 0 };
      const result = calculateWeightedValue(opportunity);
      expect(result).toBe(0);
    });

    it('should handle undefined probability', () => {
      const opportunity = { ...mockOpportunity, probability: undefined };
      const result = calculateWeightedValue(opportunity);
      expect(result).toBe(0);
    });

    it('should handle 100% probability', () => {
      const opportunity = { ...mockOpportunity, probability: 100 };
      const result = calculateWeightedValue(opportunity);
      expect(result).toBe(10000);
    });
  });

  describe('calculateRevenueForecasting', () => {
    const opportunities: Opportunity[] = [
      {
        ...mockOpportunity,
        _id: 'opp1' as any,
        name: 'Wedding A',
        stage: 'NEGOTIATION',
        value: 15000,
        probability: 80,
        isActive: true,
      },
      {
        ...mockOpportunity,
        _id: 'opp2' as any,
        name: 'Corporate Event',
        stage: 'QUALIFIED',
        value: 8000,
        probability: 25,
        isActive: true,
      },
      {
        ...mockOpportunity,
        _id: 'opp3' as any,
        name: 'Inactive Wedding',
        stage: 'CLOSED_LOST',
        value: 12000,
        probability: 0,
        isActive: false, // Should be excluded
      },
    ];

    it('should calculate revenue forecasting correctly', () => {
      const result = calculateRevenueForecasting(opportunities);

      expect(result.opportunities).toHaveLength(2); // Only active opportunities
      expect(result.summary.totalOpportunities).toBe(2);
      expect(result.summary.totalValue).toBe(23000); // 15000 + 8000
      expect(result.summary.totalWeightedValue).toBe(14000); // (15000 * 0.8) + (8000 * 0.25)
      expect(result.summary.averageProbability).toBeCloseTo(60.87, 2); // (14000 / 23000) * 100
    });

    it('should handle empty opportunity list', () => {
      const result = calculateRevenueForecasting([]);

      expect(result.opportunities).toHaveLength(0);
      expect(result.summary.totalOpportunities).toBe(0);
      expect(result.summary.totalValue).toBe(0);
      expect(result.summary.totalWeightedValue).toBe(0);
      expect(result.summary.averageProbability).toBe(0);
    });

    it('should filter out inactive opportunities', () => {
      const result = calculateRevenueForecasting(opportunities);

      const inactiveFound = result.opportunities.find(opp => opp.name === 'Inactive Wedding');
      expect(inactiveFound).toBeUndefined();
    });
  });

  describe('getStageConversionRates', () => {
    const opportunities: Opportunity[] = [
      { ...mockOpportunity, _id: 'opp1' as any, stage: 'PROSPECT' },
      { ...mockOpportunity, _id: 'opp2' as any, stage: 'PROSPECT' },
      { ...mockOpportunity, _id: 'opp3' as any, stage: 'QUALIFIED' },
      { ...mockOpportunity, _id: 'opp4' as any, stage: 'PROPOSAL' },
      { ...mockOpportunity, _id: 'opp5' as any, stage: 'CLOSED_WON' },
    ];

    it('should calculate stage conversion rates correctly', () => {
      const rates = getStageConversionRates(opportunities);

      expect(rates.PROSPECT).toBe(40); // 2/5 * 100
      expect(rates.QUALIFIED).toBe(20); // 1/5 * 100
      expect(rates.PROPOSAL).toBe(20); // 1/5 * 100
      expect(rates.NEGOTIATION).toBe(0); // 0/5 * 100
      expect(rates.CLOSED_WON).toBe(20); // 1/5 * 100
      expect(rates.CLOSED_LOST).toBe(0); // 0/5 * 100
    });

    it('should handle empty opportunity list', () => {
      const rates = getStageConversionRates([]);

      Object.values(rates).forEach(rate => {
        expect(rate).toBeNaN(); // 0/0 = NaN
      });
    });
  });

  describe('detectDateConflicts', () => {
    const targetDate = new Date('2024-06-15').getTime();
    const differentDate = new Date('2024-06-16').getTime();

    const opportunities: Opportunity[] = [
      {
        ...mockOpportunity,
        _id: 'opp1' as any,
        name: 'Wedding A',
        eventDate: targetDate,
        isActive: true,
      },
      {
        ...mockOpportunity,
        _id: 'opp2' as any,
        name: 'Corporate Event',
        eventDate: targetDate,
        isActive: true,
      },
      {
        ...mockOpportunity,
        _id: 'opp3' as any,
        name: 'Different Date Event',
        eventDate: differentDate,
        isActive: true,
      },
      {
        ...mockOpportunity,
        _id: 'opp4' as any,
        name: 'Inactive Conflict',
        eventDate: targetDate,
        isActive: false, // Should be excluded
      },
    ];

    it('should detect date conflicts correctly', () => {
      const conflicts = detectDateConflicts(opportunities, targetDate);

      expect(conflicts).toHaveLength(2);
      expect(conflicts.map(c => c.name)).toEqual(['Wedding A', 'Corporate Event']);
    });

    it('should exclude specified opportunity from conflicts', () => {
      const conflicts = detectDateConflicts(opportunities, targetDate, 'opp1');

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].name).toBe('Corporate Event');
    });

    it('should exclude inactive opportunities', () => {
      const conflicts = detectDateConflicts(opportunities, targetDate);

      const inactiveFound = conflicts.find(c => c.name === 'Inactive Conflict');
      expect(inactiveFound).toBeUndefined();
    });

    it('should return empty array when no conflicts exist', () => {
      const noConflictDate = new Date('2024-12-25').getTime();
      const conflicts = detectDateConflicts(opportunities, noConflictDate);

      expect(conflicts).toHaveLength(0);
    });

    it('should match dates correctly ignoring time', () => {
      // Same date but different times
      const morningDate = new Date('2024-06-15T08:00:00').getTime();
      const eveningDate = new Date('2024-06-15T20:00:00').getTime();

      const timeOpportunities: Opportunity[] = [
        {
          ...mockOpportunity,
          _id: 'morning' as any,
          eventDate: morningDate,
          isActive: true,
        },
      ];

      const conflicts = detectDateConflicts(timeOpportunities, eveningDate);
      expect(conflicts).toHaveLength(1);
    });
  });

  describe('validateOpportunityValue', () => {
    it('should validate normal wedding value', () => {
      const result = validateOpportunityValue(12000, 'WEDDING', 100);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn about low value for event type', () => {
      const result = validateOpportunityValue(2000, 'WEDDING', 100);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        'Value seems low for WEDDING events. Expected minimum: €5,000'
      );
    });

    it('should warn about low value per guest', () => {
      const result = validateOpportunityValue(3000, 'WEDDING', 100); // €30 per guest

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('below typical range'))).toBe(true);
    });

    it('should warn about high value per guest', () => {
      const result = validateOpportunityValue(25000, 'WEDDING', 100); // €250 per guest

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('above typical range'))).toBe(true);
    });

    it('should handle corporate events correctly', () => {
      const result = validateOpportunityValue(5000, 'CORPORATE', 100); // €50 per guest

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle multiple warnings', () => {
      const result = validateOpportunityValue(1000, 'GALA', 100); // Low value + low per guest

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(1);
      expect(result.warnings.some(w => w.includes('seems low for GALA events'))).toBe(true);
      expect(result.warnings.some(w => w.includes('below typical range'))).toBe(true);
    });

    it('should handle unknown event type', () => {
      const result = validateOpportunityValue(300, 'UNKNOWN_TYPE', 20); // Below default minimum of 500

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('seems low for UNKNOWN_TYPE events'))).toBe(true);
    });
  });
});