import { describe, it, expect } from 'vitest';
import { calculateLeadHeatScore, getLeadHeatFromScore, getLeadHeatColor } from '../../src/lib/utils/leadHeatCalculator';
import type { InteractionType } from '../../src/lib/types/contact';

describe('leadHeatCalculator', () => {
  describe('calculateLeadHeatScore', () => {
    it('should calculate correct score for single interactions', () => {
      const socialFollow = [{ type: 'SOCIAL_FOLLOW' as InteractionType }];
      expect(calculateLeadHeatScore(socialFollow)).toBe(1);

      const siteVisit = [{ type: 'SITE_VISIT' as InteractionType }];
      expect(calculateLeadHeatScore(siteVisit)).toBe(10);

      const priceQuote = [{ type: 'PRICE_QUOTE' as InteractionType }];
      expect(calculateLeadHeatScore(priceQuote)).toBe(8);
    });

    it('should calculate correct score for multiple interactions', () => {
      const interactions = [
        { type: 'SOCIAL_FOLLOW' as InteractionType }, // 1
        { type: 'WEBSITE_VISIT' as InteractionType }, // 2
        { type: 'INFO_REQUEST' as InteractionType }, // 5
        { type: 'PRICE_QUOTE' as InteractionType }, // 8
      ];
      expect(calculateLeadHeatScore(interactions)).toBe(16);
    });

    it('should return 0 for empty interactions', () => {
      expect(calculateLeadHeatScore([])).toBe(0);
    });

    it('should handle unknown interaction types gracefully', () => {
      const interactions = [
        { type: 'UNKNOWN_TYPE' as any },
        { type: 'SOCIAL_FOLLOW' as InteractionType },
      ];
      expect(calculateLeadHeatScore(interactions)).toBe(1);
    });
  });

  describe('getLeadHeatFromScore', () => {
    it('should return COLD for scores 0-5', () => {
      expect(getLeadHeatFromScore(0)).toBe('COLD');
      expect(getLeadHeatFromScore(3)).toBe('COLD');
      expect(getLeadHeatFromScore(5)).toBe('COLD');
    });

    it('should return WARM for scores 6-15', () => {
      expect(getLeadHeatFromScore(6)).toBe('WARM');
      expect(getLeadHeatFromScore(10)).toBe('WARM');
      expect(getLeadHeatFromScore(15)).toBe('WARM');
    });

    it('should return HOT for scores 16+', () => {
      expect(getLeadHeatFromScore(16)).toBe('HOT');
      expect(getLeadHeatFromScore(25)).toBe('HOT');
      expect(getLeadHeatFromScore(100)).toBe('HOT');
    });
  });

  describe('getLeadHeatColor', () => {
    it('should return correct color classes for each heat level', () => {
      expect(getLeadHeatColor('HOT')).toBe('text-red-600 bg-red-50');
      expect(getLeadHeatColor('WARM')).toBe('text-orange-600 bg-orange-50');
      expect(getLeadHeatColor('COLD')).toBe('text-blue-600 bg-blue-50');
    });

    it('should return default color for unknown heat level', () => {
      expect(getLeadHeatColor('UNKNOWN' as any)).toBe('text-gray-600 bg-gray-50');
    });
  });
});