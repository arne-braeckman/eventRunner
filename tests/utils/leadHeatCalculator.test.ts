import { describe, it, expect } from 'vitest';
import { 
  calculateLeadHeatScore, 
  calculateLeadHeatScoreSimple,
  getLeadHeatFromScore, 
  getLeadHeatColor,
  getLeadHeatStyles,
  getHeatScoreProgress,
  getHeatEmoji,
  calculateHeatTrend,
  DEFAULT_SCORING_CONFIG,
  type LeadScoringConfig
} from '../../src/lib/utils/leadHeatCalculator';
import type { InteractionType } from '../../src/lib/types/contact';

describe('leadHeatCalculator', () => {
  describe('calculateLeadHeatScoreSimple (legacy)', () => {
    it('should calculate correct score for single interactions', () => {
      const socialFollow = [{ type: 'SOCIAL_FOLLOW' as InteractionType }];
      expect(calculateLeadHeatScoreSimple(socialFollow)).toBe(1);

      const siteVisit = [{ type: 'SITE_VISIT' as InteractionType }];
      expect(calculateLeadHeatScoreSimple(siteVisit)).toBe(10);

      const priceQuote = [{ type: 'PRICE_QUOTE' as InteractionType }];
      expect(calculateLeadHeatScoreSimple(priceQuote)).toBe(8);
    });

    it('should calculate correct score for multiple interactions', () => {
      const interactions = [
        { type: 'SOCIAL_FOLLOW' as InteractionType }, // 1
        { type: 'WEBSITE_VISIT' as InteractionType }, // 2
        { type: 'INFO_REQUEST' as InteractionType }, // 5
        { type: 'PRICE_QUOTE' as InteractionType }, // 8
      ];
      expect(calculateLeadHeatScoreSimple(interactions)).toBe(16);
    });

    it('should return 0 for empty interactions', () => {
      expect(calculateLeadHeatScoreSimple([])).toBe(0);
    });
  });

  describe('calculateLeadHeatScore (advanced)', () => {
    it('should calculate score with time decay', () => {
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
      
      const interactions = [
        { type: 'SITE_VISIT' as InteractionType, createdAt: now }, // Recent: 10 points
        { type: 'SITE_VISIT' as InteractionType, createdAt: oneDayAgo }, // 1 day old: ~9.8 points
        { type: 'SITE_VISIT' as InteractionType, createdAt: oneWeekAgo }, // 1 week old: ~8.4 points
      ];

      const score = calculateLeadHeatScore(interactions);
      expect(score).toBeGreaterThan(25); // Should be enhanced by recency boost
      expect(score).toBeLessThan(60); // But still reasonable
    });

    it('should apply recency boost', () => {
      const now = Date.now();
      const recentInteraction = [{ type: 'SITE_VISIT' as InteractionType, createdAt: now }];
      const oldInteraction = [{ type: 'SITE_VISIT' as InteractionType, createdAt: now - (30 * 24 * 60 * 60 * 1000) }];

      const recentScore = calculateLeadHeatScore(recentInteraction);
      const oldScore = calculateLeadHeatScore(oldInteraction);

      expect(recentScore).toBeGreaterThan(oldScore);
    });

    it('should apply frequency boost', () => {
      const now = Date.now();
      const highFrequencyInteractions = [
        { type: 'SOCIAL_LIKE' as InteractionType, createdAt: now },
        { type: 'SOCIAL_LIKE' as InteractionType, createdAt: now - (1 * 24 * 60 * 60 * 1000) },
        { type: 'SOCIAL_LIKE' as InteractionType, createdAt: now - (2 * 24 * 60 * 60 * 1000) },
        { type: 'SOCIAL_LIKE' as InteractionType, createdAt: now - (3 * 24 * 60 * 60 * 1000) },
      ];

      const lowFrequencyInteractions = [
        { type: 'SOCIAL_LIKE' as InteractionType, createdAt: now - (10 * 24 * 60 * 60 * 1000) },
      ];

      const highFrequencyScore = calculateLeadHeatScore(highFrequencyInteractions);
      const lowFrequencyScore = calculateLeadHeatScore(lowFrequencyInteractions);

      expect(highFrequencyScore).toBeGreaterThan(lowFrequencyScore);
    });

    it('should work with custom configuration', () => {
      const customConfig: LeadScoringConfig = {
        ...DEFAULT_SCORING_CONFIG,
        timeDecayEnabled: false,
        recencyBoostEnabled: false,
        frequencyBoostEnabled: false,
      };

      const interactions = [
        { type: 'SITE_VISIT' as InteractionType, createdAt: Date.now() - (30 * 24 * 60 * 60 * 1000) },
      ];

      const score = calculateLeadHeatScore(interactions, customConfig);
      expect(score).toBe(10); // Should be exact base weight without modifiers
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

  describe('getLeadHeatStyles', () => {
    it('should return comprehensive styles for HOT leads', () => {
      const styles = getLeadHeatStyles('HOT');
      expect(styles.badge).toBe('bg-red-100 text-red-800 border-red-200');
      expect(styles.progress).toBe('bg-red-500');
      expect(styles.icon).toBe('text-red-500');
      expect(styles.bgGradient).toBe('bg-gradient-to-r from-red-50 to-red-100');
    });

    it('should return comprehensive styles for WARM leads', () => {
      const styles = getLeadHeatStyles('WARM');
      expect(styles.badge).toBe('bg-orange-100 text-orange-800 border-orange-200');
      expect(styles.progress).toBe('bg-orange-500');
    });

    it('should return comprehensive styles for COLD leads', () => {
      const styles = getLeadHeatStyles('COLD');
      expect(styles.badge).toBe('bg-blue-100 text-blue-800 border-blue-200');
      expect(styles.progress).toBe('bg-blue-500');
    });
  });

  describe('getHeatScoreProgress', () => {
    it('should return correct progress percentage for different scores', () => {
      expect(getHeatScoreProgress(0)).toBe(0); // COLD minimum
      expect(getHeatScoreProgress(5)).toBe(35); // COLD maximum
      
      expect(getHeatScoreProgress(6)).toBe(35); // WARM minimum
      expect(getHeatScoreProgress(10)).toBeCloseTo(52.78, 1); // WARM middle
      expect(getHeatScoreProgress(15)).toBe(75); // WARM maximum
      
      expect(getHeatScoreProgress(16)).toBe(75); // HOT minimum
      expect(getHeatScoreProgress(20)).toBe(85); // HOT middle
      expect(getHeatScoreProgress(26)).toBe(100); // HOT cap
    });
  });

  describe('getHeatEmoji', () => {
    it('should return correct emojis for each heat level', () => {
      expect(getHeatEmoji('HOT')).toBe('🔥');
      expect(getHeatEmoji('WARM')).toBe('🌤️');
      expect(getHeatEmoji('COLD')).toBe('❄️');
      expect(getHeatEmoji('UNKNOWN' as any)).toBe('⚪');
    });
  });

  describe('calculateHeatTrend', () => {
    it('should calculate upward trend correctly', () => {
      const trend = calculateHeatTrend(12, 10);
      expect(trend.trend).toBe('up');
      expect(trend.percentage).toBe(20);
      expect(trend.description).toBe('Increased by 20%');
    });

    it('should calculate downward trend correctly', () => {
      const trend = calculateHeatTrend(8, 10);
      expect(trend.trend).toBe('down');
      expect(trend.percentage).toBe(20);
      expect(trend.description).toBe('Decreased by 20%');
    });

    it('should handle stable trends', () => {
      const trend = calculateHeatTrend(10.2, 10);
      expect(trend.trend).toBe('stable');
      expect(trend.percentage).toBe(0);
      expect(trend.description).toBe('No significant change');
    });

    it('should handle new leads', () => {
      const trend = calculateHeatTrend(10, 0);
      expect(trend.trend).toBe('stable');
      expect(trend.description).toBe('New lead');
    });
  });
});