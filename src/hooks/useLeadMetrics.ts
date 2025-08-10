import { useMemo } from 'react';
import { calculateLeadHeatScoreSimple } from '@/lib/utils/leadHeatCalculator';
import { LEAD_HEAT_THRESHOLDS } from '@/lib/types/contact';
import type { Contact, InteractionType } from '@/lib/types/contact';

interface DashboardFilters {
  dateRange: '7d' | '30d' | '90d' | 'all';
  leadSource?: string;
  leadHeat?: string;
  status?: string;
}

interface LeadMetrics {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  conversionRate: number;
  avgHeatScore: number;
  trendsData: Array<{
    date: string;
    hot: number;
    warm: number;
    cold: number;
    total: number;
  }>;
  sourceDistribution: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  socialEngagement: {
    totalInteractions: number;
    averagePerLead: number;
    topPlatform: string;
    growthRate: number;
  };
}

export function useLeadMetrics(contacts: Contact[] = [], interactions: any[] = [], filters: DashboardFilters): LeadMetrics {
  return useMemo(() => {
    // Filter contacts based on date range
    const now = Date.now();
    const dateFilterMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };
    
    const filteredContacts = contacts.filter(contact => {
      const ageMs = now - contact.createdAt;
      const withinDateRange = ageMs <= dateFilterMs[filters.dateRange];
      const matchesSource = !filters.leadSource || contact.leadSource === filters.leadSource;
      const matchesHeat = !filters.leadHeat || contact.leadHeat === filters.leadHeat;
      const matchesStatus = !filters.status || contact.status === filters.status;
      
      return withinDateRange && matchesSource && matchesHeat && matchesStatus;
    });

    const totalLeads = filteredContacts.length;
    const hotLeads = filteredContacts.filter(c => c.leadHeat === 'HOT').length;
    const warmLeads = filteredContacts.filter(c => c.leadHeat === 'WARM').length;
    const coldLeads = filteredContacts.filter(c => c.leadHeat === 'COLD').length;
    
    const customers = filteredContacts.filter(c => c.status === 'CUSTOMER').length;
    const conversionRate = totalLeads > 0 ? (customers / totalLeads) * 100 : 0;
    
    const avgHeatScore = totalLeads > 0 
      ? filteredContacts.reduce((sum, contact) => sum + (contact.leadHeatScore || 0), 0) / totalLeads
      : 0;

    // Generate trends data (mock implementation - should be based on historical data)
    const trendsData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Mock trend data - in real implementation, this would come from historical snapshots
      const totalForDay = Math.max(0, totalLeads + Math.floor(Math.random() * 10) - 5);
      const hotForDay = Math.floor(totalForDay * (hotLeads / Math.max(totalLeads, 1)));
      const warmForDay = Math.floor(totalForDay * (warmLeads / Math.max(totalLeads, 1)));
      const coldForDay = totalForDay - hotForDay - warmForDay;
      
      return {
        date: dateStr,
        hot: hotForDay,
        warm: warmForDay,
        cold: coldForDay,
        total: totalForDay
      };
    });

    // Source distribution
    const sourceCounts = filteredContacts.reduce((acc, contact) => {
      acc[contact.leadSource] = (acc[contact.leadSource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sourceDistribution = Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      count,
      percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0
    })).sort((a, b) => b.count - a.count);

    // Status distribution
    const statusCounts = filteredContacts.reduce((acc, contact) => {
      acc[contact.status] = (acc[contact.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0
    })).sort((a, b) => b.count - a.count);

    // Social engagement metrics
    const socialInteractions = interactions.filter(i => 
      ['SOCIAL_FOLLOW', 'SOCIAL_LIKE', 'SOCIAL_COMMENT', 'SOCIAL_MESSAGE'].includes(i.type)
    );
    
    const platformCounts = socialInteractions.reduce((acc, interaction) => {
      const platform = interaction.platform || 'UNKNOWN';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPlatform = Object.entries(platformCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    const socialEngagement = {
      totalInteractions: socialInteractions.length,
      averagePerLead: totalLeads > 0 ? socialInteractions.length / totalLeads : 0,
      topPlatform,
      growthRate: 12.5 // Mock - would calculate from historical data
    };

    return {
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      conversionRate,
      avgHeatScore,
      trendsData,
      sourceDistribution,
      statusDistribution,
      socialEngagement
    };
  }, [contacts, interactions, filters]);
}