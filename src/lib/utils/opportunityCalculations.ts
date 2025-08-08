import type { Opportunity, OpportunityStage } from "../types/opportunity";

// Revenue forecasting utilities
export interface RevenueForecasting {
  opportunities: Array<{
    opportunityId: string;
    name: string;
    stage: OpportunityStage;
    value: number;
    probability: number;
    weightedValue: number;
    expectedCloseDate?: number;
    eventDate: number;
  }>;
  summary: {
    totalOpportunities: number;
    totalValue: number;
    totalWeightedValue: number;
    averageProbability: number;
  };
}

export function calculateWeightedValue(opportunity: Opportunity): number {
  const probability = opportunity.probability || 0;
  return opportunity.value * (probability / 100);
}

export function calculateRevenueForecasting(opportunities: Opportunity[]): RevenueForecasting {
  const activeOpportunities = opportunities.filter(opp => opp.isActive);
  
  const forecastingData = activeOpportunities.map(opp => ({
    opportunityId: opp._id,
    name: opp.name,
    stage: opp.stage,
    value: opp.value,
    probability: opp.probability || 0,
    weightedValue: calculateWeightedValue(opp),
    expectedCloseDate: opp.expectedCloseDate,
    eventDate: opp.eventDate,
  }));

  const totalValue = activeOpportunities.reduce((sum, opp) => sum + opp.value, 0);
  const totalWeightedValue = forecastingData.reduce((sum, item) => sum + item.weightedValue, 0);
  const averageProbability = totalValue > 0 ? (totalWeightedValue / totalValue) * 100 : 0;

  return {
    opportunities: forecastingData,
    summary: {
      totalOpportunities: activeOpportunities.length,
      totalValue,
      totalWeightedValue,
      averageProbability,
    }
  };
}

// Pipeline stage calculations
export function getStageConversionRates(opportunities: Opportunity[]): Record<OpportunityStage, number> {
  const stageCounts = opportunities.reduce((acc, opp) => {
    acc[opp.stage] = (acc[opp.stage] || 0) + 1;
    return acc;
  }, {} as Record<OpportunityStage, number>);

  const totalOpportunities = opportunities.length;
  
  return {
    PROSPECT: (stageCounts.PROSPECT || 0) / totalOpportunities * 100,
    QUALIFIED: (stageCounts.QUALIFIED || 0) / totalOpportunities * 100,
    PROPOSAL: (stageCounts.PROPOSAL || 0) / totalOpportunities * 100,
    NEGOTIATION: (stageCounts.NEGOTIATION || 0) / totalOpportunities * 100,
    CLOSED_WON: (stageCounts.CLOSED_WON || 0) / totalOpportunities * 100,
    CLOSED_LOST: (stageCounts.CLOSED_LOST || 0) / totalOpportunities * 100,
  };
}

// Date conflict detection utilities
export function detectDateConflicts(
  opportunities: Opportunity[],
  targetDate: number,
  excludeOpportunityId?: string
): Opportunity[] {
  return opportunities.filter(opp => {
    if (!opp.isActive) return false;
    if (excludeOpportunityId && opp._id === excludeOpportunityId) return false;
    
    // Check if event dates match (same day)
    const targetDateStart = new Date(targetDate);
    targetDateStart.setHours(0, 0, 0, 0);
    
    const oppDateStart = new Date(opp.eventDate);
    oppDateStart.setHours(0, 0, 0, 0);
    
    return targetDateStart.getTime() === oppDateStart.getTime();
  });
}

// Opportunity value validation
export function validateOpportunityValue(
  value: number,
  eventType: string,
  guestCount: number
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  let isValid = true;

  // Minimum value checks based on event type
  const minimumValues: Record<string, number> = {
    WEDDING: 5000,
    CORPORATE: 2000,
    GALA: 10000,
    CONFERENCE: 3000,
    BIRTHDAY: 1000,
    ANNIVERSARY: 2000,
    OTHER: 500,
  };

  const expectedMinimum = minimumValues[eventType] || 500;
  if (value < expectedMinimum) {
    warnings.push(`Value seems low for ${eventType} events. Expected minimum: €${expectedMinimum.toLocaleString()}`);
  }

  // Per-guest value analysis
  const valuePerGuest = value / guestCount;
  const typicalPerGuestRanges: Record<string, { min: number; max: number }> = {
    WEDDING: { min: 80, max: 200 },
    CORPORATE: { min: 40, max: 150 },
    GALA: { min: 100, max: 300 },
    CONFERENCE: { min: 50, max: 120 },
    BIRTHDAY: { min: 30, max: 100 },
    ANNIVERSARY: { min: 50, max: 150 },
    OTHER: { min: 20, max: 100 },
  };

  const range = typicalPerGuestRanges[eventType] || { min: 20, max: 100 };
  if (valuePerGuest < range.min) {
    warnings.push(`Value per guest (€${valuePerGuest.toFixed(2)}) is below typical range (€${range.min}-€${range.max})`);
  } else if (valuePerGuest > range.max) {
    warnings.push(`Value per guest (€${valuePerGuest.toFixed(2)}) is above typical range (€${range.min}-€${range.max})`);
  }

  return { isValid, warnings };
}