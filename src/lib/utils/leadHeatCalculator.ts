import { INTERACTION_TYPE_OPTIONS, LEAD_HEAT_THRESHOLDS, type LeadHeat, type InteractionType } from "../types/contact";

export function calculateLeadHeatScore(interactions: Array<{ type: InteractionType }>): number {
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