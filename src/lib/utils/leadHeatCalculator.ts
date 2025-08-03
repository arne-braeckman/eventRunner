import { INTERACTION_TYPE_OPTIONS, LEAD_HEAT_THRESHOLDS, type LeadHeat, type InteractionType } from "../types/contact";

// Configurable weight multipliers for different scenarios
export interface LeadScoringConfig {
  baseWeights: Record<InteractionType, number>;
  timeDecayEnabled: boolean;
  timeDecayHalfLife: number; // days
  recencyBoostEnabled: boolean;
  recencyBoostWindow: number; // days
  recencyBoostMultiplier: number;
  frequencyBoostEnabled: boolean;
  frequencyBoostThreshold: number; // interactions per week
  frequencyBoostMultiplier: number;
}

export const DEFAULT_SCORING_CONFIG: LeadScoringConfig = {
  baseWeights: {
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
  },
  timeDecayEnabled: true,
  timeDecayHalfLife: 30, // 30 days
  recencyBoostEnabled: true,
  recencyBoostWindow: 7, // 7 days
  recencyBoostMultiplier: 1.5,
  frequencyBoostEnabled: true,
  frequencyBoostThreshold: 3, // 3 interactions per week
  frequencyBoostMultiplier: 1.3,
};

export function calculateLeadHeatScore(
  interactions: Array<{ type: InteractionType; createdAt?: number }>,
  config: LeadScoringConfig = DEFAULT_SCORING_CONFIG
): number {
  if (interactions.length === 0) return 0;

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;

  let totalScore = 0;
  const recentInteractions = [];

  for (const interaction of interactions) {
    const createdAt = interaction.createdAt || now;
    const ageInDays = (now - createdAt) / dayMs;
    
    // Base score from interaction type
    let baseScore = config.baseWeights[interaction.type] || 0;
    
    // Time decay calculation
    if (config.timeDecayEnabled) {
      const decayFactor = Math.pow(0.5, ageInDays / config.timeDecayHalfLife);
      baseScore *= decayFactor;
    }
    
    // Recency boost
    if (config.recencyBoostEnabled && ageInDays <= config.recencyBoostWindow) {
      baseScore *= config.recencyBoostMultiplier;
      recentInteractions.push(interaction);
    }
    
    totalScore += baseScore;
  }

  // Frequency boost
  if (config.frequencyBoostEnabled) {
    const weeklyInteractionCount = interactions.filter(i => {
      const age = (now - (i.createdAt || now)) / weekMs;
      return age <= 1;
    }).length;
    
    if (weeklyInteractionCount >= config.frequencyBoostThreshold) {
      totalScore *= config.frequencyBoostMultiplier;
    }
  }

  return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
}

// Legacy function for backward compatibility
export function calculateLeadHeatScoreSimple(interactions: Array<{ type: InteractionType }>): number {
  return interactions.reduce((total, interaction) => {
    const interactionConfig = INTERACTION_TYPE_OPTIONS.find(option => option.value === interaction.type);
    return total + (interactionConfig?.weight || 0);
  }, 0);
}

export function getLeadHeatFromScore(score: number): LeadHeat {
  if (score >= LEAD_HEAT_THRESHOLDS.HOT.min) return "HOT";
  if (score >= LEAD_HEAT_THRESHOLDS.WARM.min) return "WARM";
  return "COLD";
}

// Visual heat indicators
export interface HeatIndicatorStyles {
  badge: string;
  progress: string;
  border: string;
  icon: string;
  bgGradient: string;
}

export function getLeadHeatColor(heat: LeadHeat): string {
  switch (heat) {
    case "HOT":
      return "text-red-600 bg-red-50";
    case "WARM":
      return "text-orange-600 bg-orange-50";
    case "COLD":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

export function getLeadHeatScoreColor(score: number): string {
  const heat = getLeadHeatFromScore(score);
  return getLeadHeatColor(heat);
}

export function getLeadHeatStyles(heat: LeadHeat): HeatIndicatorStyles {
  switch (heat) {
    case "HOT":
      return {
        badge: "bg-red-100 text-red-800 border-red-200",
        progress: "bg-red-500",
        border: "border-red-300",
        icon: "text-red-500",
        bgGradient: "bg-gradient-to-r from-red-50 to-red-100",
      };
    case "WARM":
      return {
        badge: "bg-orange-100 text-orange-800 border-orange-200",
        progress: "bg-orange-500",
        border: "border-orange-300",
        icon: "text-orange-500",
        bgGradient: "bg-gradient-to-r from-orange-50 to-orange-100",
      };
    case "COLD":
      return {
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        progress: "bg-blue-500",
        border: "border-blue-300",
        icon: "text-blue-500",
        bgGradient: "bg-gradient-to-r from-blue-50 to-blue-100",
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-800 border-gray-200",
        progress: "bg-gray-500",
        border: "border-gray-300",
        icon: "text-gray-500",
        bgGradient: "bg-gradient-to-r from-gray-50 to-gray-100",
      };
  }
}

export function getLeadHeatStylesFromScore(score: number): HeatIndicatorStyles {
  const heat = getLeadHeatFromScore(score);
  return getLeadHeatStyles(heat);
}

// Heat score progress calculation (0-100%)
export function getHeatScoreProgress(score: number): number {
  if (score >= LEAD_HEAT_THRESHOLDS.HOT.min) {
    // HOT: 16+ maps to 75-100%
    const progressInHot = Math.min((score - 16) / 10, 1); // Cap at score 26 for 100%
    return 75 + (progressInHot * 25);
  } else if (score >= LEAD_HEAT_THRESHOLDS.WARM.min) {
    // WARM: 6-15 maps to 35-75%
    const progressInWarm = (score - 6) / 9; // 9 is the range (15-6)
    return 35 + (progressInWarm * 40);
  } else {
    // COLD: 0-5 maps to 0-35%
    const progressInCold = score / 5;
    return progressInCold * 35;
  }
}

// Heat emoji indicators
export function getHeatEmoji(heat: LeadHeat): string {
  switch (heat) {
    case "HOT":
      return "🔥";
    case "WARM":
      return "🌤️";
    case "COLD":
      return "❄️";
    default:
      return "⚪";
  }
}

// Heat description for accessibility
export function getHeatDescription(heat: LeadHeat, score: number): string {
  switch (heat) {
    case "HOT":
      return `Hot lead with score ${score}. High engagement and strong interest.`;
    case "WARM":
      return `Warm lead with score ${score}. Moderate engagement and potential interest.`;
    case "COLD":
      return `Cold lead with score ${score}. Low engagement or new contact.`;
    default:
      return `Lead with score ${score}. Engagement level unknown.`;
  }
}

// Trend calculation for heat score changes
export function calculateHeatTrend(currentScore: number, previousScore: number): {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  description: string;
} {
  if (previousScore === 0) {
    return {
      trend: 'stable',
      percentage: 0,
      description: 'New lead'
    };
  }

  const difference = currentScore - previousScore;
  const percentage = Math.abs((difference / previousScore) * 100);

  if (Math.abs(difference) < 0.5) {
    return {
      trend: 'stable',
      percentage: 0,
      description: 'No significant change'
    };
  }

  return {
    trend: difference > 0 ? 'up' : 'down',
    percentage: Math.round(percentage),
    description: difference > 0 
      ? `Increased by ${Math.round(percentage)}%`
      : `Decreased by ${Math.round(percentage)}%`
  };
}