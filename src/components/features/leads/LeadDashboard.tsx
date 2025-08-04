"use client";

import { useState, useMemo } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUpIcon, TrendingDownIcon, UsersIcon, ThermometerIcon, 
  FilterIcon, RefreshCwIcon, DownloadIcon, EyeIcon, MessageSquareIcon,
  PhoneIcon, CalendarIcon, ExternalLinkIcon
} from 'lucide-react';
import { getLeadHeatColor, getHeatEmoji, getLeadHeatStylesFromScore } from '@/lib/utils/leadHeatCalculator';
import type { Contact, LeadSource, LeadHeat, ContactStatus } from '@/lib/types/contact';

interface DashboardFilters {
  dateRange: '7d' | '30d' | '90d' | 'all';
  leadSource?: LeadSource;
  leadHeat?: LeadHeat;
  status?: ContactStatus;
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
  heatScoreDistribution: Array<{
    range: string;
    count: number;
  }>;
  socialEngagementMetrics: {
    totalInteractions: number;
    avgInteractionsPerLead: number;
    topPlatforms: Array<{
      platform: string;
      interactions: number;
    }>;
    engagementTrend: Array<{
      date: string;
      interactions: number;
    }>;
  };
}

const HEAT_COLORS = {
  HOT: '#ef4444',
  WARM: '#f97316', 
  COLD: '#3b82f6'
};

export function LeadDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: '30d'
  });
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all contacts for dashboard analytics
  const allContacts = useQuery(api.contacts.getAllContacts);
  
  // Fetch recent interactions for social engagement metrics
  const recentInteractions = useQuery(api.interactions.getInteractionAnalytics, {
    startDate: getDateRangeStart(filters.dateRange) ?? undefined,
    endDate: Date.now()
  });

  // Calculate dashboard metrics
  const metrics: LeadMetrics = useMemo(() => {
    if (!allContacts || !recentInteractions) {
      return getEmptyMetrics();
    }

    // Filter contacts based on current filters
    let filteredContacts = [...allContacts];
    
    if (filters.leadSource) {
      filteredContacts = filteredContacts.filter(c => c.leadSource === filters.leadSource);
    }
    if (filters.leadHeat) {
      filteredContacts = filteredContacts.filter(c => c.leadHeat === filters.leadHeat);
    }
    if (filters.status) {
      filteredContacts = filteredContacts.filter(c => c.status === filters.status);
    }

    // Filter by date range
    const dateRangeStart = getDateRangeStart(filters.dateRange);
    if (dateRangeStart) {
      filteredContacts = filteredContacts.filter(c => c.createdAt >= dateRangeStart);
    }

    // Calculate basic metrics
    const totalLeads = filteredContacts.length;
    const hotLeads = filteredContacts.filter(c => c.leadHeat === 'HOT').length;
    const warmLeads = filteredContacts.filter(c => c.leadHeat === 'WARM').length;
    const coldLeads = filteredContacts.filter(c => c.leadHeat === 'COLD').length;
    const qualifiedLeads = filteredContacts.filter(c => ['QUALIFIED', 'CUSTOMER'].includes(c.status)).length;
    const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    const avgHeatScore = totalLeads > 0 
      ? filteredContacts.reduce((sum, c) => sum + (c.leadHeatScore || 0), 0) / totalLeads 
      : 0;

    // Generate trends data (last 30 days)
    const trendsData = generateTrendsData(filteredContacts);

    // Calculate source distribution
    const sourceStats = filteredContacts.reduce((acc, contact) => {
      acc[contact.leadSource] = (acc[contact.leadSource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sourceDistribution = Object.entries(sourceStats).map(([source, count]) => ({
      source,
      count,
      percentage: (count / totalLeads) * 100
    })).sort((a, b) => b.count - a.count);

    // Calculate status distribution
    const statusStats = filteredContacts.reduce((acc, contact) => {
      acc[contact.status] = (acc[contact.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusStats).map(([status, count]) => ({
      status,
      count,
      percentage: (count / totalLeads) * 100
    })).sort((a, b) => b.count - a.count);

    // Calculate heat score distribution
    const heatScoreDistribution = [
      { range: '0-5 (Cold)', count: filteredContacts.filter(c => (c.leadHeatScore || 0) <= 5).length },
      { range: '6-15 (Warm)', count: filteredContacts.filter(c => (c.leadHeatScore || 0) >= 6 && (c.leadHeatScore || 0) <= 15).length },
      { range: '16+ (Hot)', count: filteredContacts.filter(c => (c.leadHeatScore || 0) >= 16).length },
    ];

    // Social engagement metrics
    const socialEngagementMetrics = {
      totalInteractions: recentInteractions.totalInteractions || 0,
      avgInteractionsPerLead: totalLeads > 0 ? (recentInteractions.totalInteractions || 0) / totalLeads : 0,
      topPlatforms: Object.entries(recentInteractions.interactionsByPlatform || {})
        .map(([platform, interactions]) => ({ platform, interactions }))
        .sort((a, b) => b.interactions - a.interactions)
        .slice(0, 5),
      engagementTrend: generateEngagementTrend(recentInteractions)
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
      heatScoreDistribution,
      socialEngagementMetrics
    };
  }, [allContacts, recentInteractions, filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const exportData = () => {
    // Create CSV export functionality
    const csvData = allContacts?.map(contact => ({
      Name: contact.name,
      Email: contact.email,
      Company: contact.company || '',
      'Lead Source': contact.leadSource,
      'Lead Heat': contact.leadHeat,
      'Heat Score': contact.leadHeatScore || 0,
      Status: contact.status,
      'Created At': new Date(contact.createdAt).toLocaleDateString()
    }));

    if (csvData) {
      downloadCSV(csvData, 'lead-dashboard-export.csv');
    }
  };

  // Show loading skeleton only if data is explicitly undefined (still loading)
  // If data is empty array, show the dashboard with empty state
  if (allContacts === undefined || recentInteractions === undefined) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Debug Info:</strong> 
          <span className="ml-2">
            Contacts: {allContacts === undefined ? 'Loading...' : `${allContacts?.length || 0} found`} | 
            Interactions: {recentInteractions === undefined ? 'Loading...' : 'Loaded'}
          </span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Dashboard</h1>
          <p className="text-gray-600">Comprehensive lead analytics and heat visualization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Dashboard Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  dateRange: value as DashboardFilters['dateRange'] 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lead Source</Label>
              <Select
                value={filters.leadSource || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  leadSource: value === 'all' ? undefined : value as LeadSource
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="WEBSITE">Website</SelectItem>
                  <SelectItem value="FACEBOOK">Facebook</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                  <SelectItem value="REFERRAL">Referral</SelectItem>
                  <SelectItem value="DIRECT">Direct</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lead Heat</Label>
              <Select
                value={filters.leadHeat || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  leadHeat: value === 'all' ? undefined : value as LeadHeat
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Heat Levels</SelectItem>
                  <SelectItem value="HOT">🔥 Hot</SelectItem>
                  <SelectItem value="WARM">🌤️ Warm</SelectItem>
                  <SelectItem value="COLD">❄️ Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  status: value === 'all' ? undefined : value as ContactStatus
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="UNQUALIFIED">Unqualified</SelectItem>
                  <SelectItem value="PROSPECT">Prospect</SelectItem>
                  <SelectItem value="LEAD">Lead</SelectItem>
                  <SelectItem value="QUALIFIED">Qualified</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Leads"
          value={metrics.totalLeads}
          icon={<UsersIcon className="h-8 w-8" />}
          trend="+12%"
          trendDirection="up"
        />
        <MetricCard
          title="Hot Leads"
          value={metrics.hotLeads}
          icon={<ThermometerIcon className="h-8 w-8 text-red-500" />}
          trend="+8%"
          trendDirection="up"
          color="red"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={<TrendingUpIcon className="h-8 w-8 text-green-500" />}
          trend="+2.3%"
          trendDirection="up"
          color="green"
        />
        <MetricCard
          title="Avg Heat Score"
          value={metrics.avgHeatScore.toFixed(1)}
          icon={<ThermometerIcon className="h-8 w-8 text-orange-500" />}
          trend="+5.2"
          trendDirection="up"
          color="orange"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Heat Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Heat Trends</CardTitle>
            <CardDescription>Lead distribution over time by heat level</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={metrics.trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="hot" 
                    stackId="1" 
                    stroke={HEAT_COLORS.HOT} 
                    fill={HEAT_COLORS.HOT} 
                    fillOpacity={0.6}
                    name="Hot Leads"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="warm" 
                    stackId="1" 
                    stroke={HEAT_COLORS.WARM} 
                    fill={HEAT_COLORS.WARM} 
                    fillOpacity={0.6}
                    name="Warm Leads"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cold" 
                    stackId="1" 
                    stroke={HEAT_COLORS.COLD} 
                    fill={HEAT_COLORS.COLD} 
                    fillOpacity={0.6}
                    name="Cold Leads"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Source Distribution</CardTitle>
            <CardDescription>Where your leads are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={metrics.sourceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.source}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {metrics.sourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getSourceColor(entry.source)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Social Engagement</CardTitle>
            <CardDescription>Social media interaction trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.socialEngagementMetrics.totalInteractions}
                  </div>
                  <div className="text-sm text-gray-500">Total Interactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.socialEngagementMetrics.avgInteractionsPerLead.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">Avg per Lead</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Top Platforms:</h4>
                {metrics.socialEngagementMetrics.topPlatforms.map((platform, index) => (
                  <div key={platform.platform} className="flex items-center justify-between">
                    <span className="text-sm">{platform.platform}</span>
                    <Badge variant="secondary">{platform.interactions}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heat Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Heat Score Distribution</CardTitle>
            <CardDescription>Distribution of lead heat scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={metrics.heatScoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Components
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  color?: 'red' | 'green' | 'orange' | 'blue';
}

function MetricCard({ title, value, icon, trend, trendDirection, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className={`flex items-center text-sm ${
                trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendDirection === 'up' ? 
                  <TrendingUpIcon className="h-4 w-4 mr-1" /> : 
                  <TrendingDownIcon className="h-4 w-4 mr-1" />
                }
                {trend}
              </div>
            )}
          </div>
          <div className={`${getColorClass(color)}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Helper Functions
function getDateRangeStart(range: DashboardFilters['dateRange']): number | null {
  const now = Date.now();
  switch (range) {
    case '7d':
      return now - (7 * 24 * 60 * 60 * 1000);
    case '30d':
      return now - (30 * 24 * 60 * 60 * 1000);
    case '90d':
      return now - (90 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
}

function getEmptyMetrics(): LeadMetrics {
  return {
    totalLeads: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
    conversionRate: 0,
    avgHeatScore: 0,
    trendsData: [],
    sourceDistribution: [],
    statusDistribution: [],
    heatScoreDistribution: [],
    socialEngagementMetrics: {
      totalInteractions: 0,
      avgInteractionsPerLead: 0,
      topPlatforms: [],
      engagementTrend: []
    }
  };
}

function generateTrendsData(contacts: Contact[]) {
  // Generate last 30 days of data
  const days = 30;
  const now = new Date();
  const trendsData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayContacts = contacts.filter(c => {
      const contactDate = new Date(c.createdAt);
      return contactDate.toISOString().split('T')[0] === dateStr;
    });

    trendsData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hot: dayContacts.filter(c => c.leadHeat === 'HOT').length,
      warm: dayContacts.filter(c => c.leadHeat === 'WARM').length,
      cold: dayContacts.filter(c => c.leadHeat === 'COLD').length,
      total: dayContacts.length
    });
  }

  return trendsData;
}

function generateEngagementTrend(interactions: any) {
  // Placeholder for engagement trend data
  return [];
}

function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    WEBSITE: '#3b82f6',
    FACEBOOK: '#1877f2',
    INSTAGRAM: '#e4405f',
    LINKEDIN: '#0077b5',
    REFERRAL: '#10b981',
    DIRECT: '#6366f1',
    OTHER: '#6b7280'
  };
  return colors[source] || '#6b7280';
}

function getColorClass(color?: string): string {
  switch (color) {
    case 'red':
      return 'text-red-500';
    case 'green':
      return 'text-green-500';
    case 'orange':
      return 'text-orange-500';
    case 'blue':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
}

function downloadCSV(data: any[], filename: string) {
  const csvContent = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}