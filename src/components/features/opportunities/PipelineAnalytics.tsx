"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  Users,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import type { Opportunity, OpportunityStage } from "@/lib/types/opportunity";

interface PipelineAnalyticsProps {
  className?: string;
}

interface StageMetrics {
  stage: OpportunityStage;
  count: number;
  value: number;
  weightedValue: number;
  avgProbability: number;
  avgDaysInStage: number;
  conversionRate: number;
}

interface TimeRangeFilter {
  value: string;
  label: string;
  days: number;
}

const TIME_RANGES: TimeRangeFilter[] = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "6m", label: "Last 6 months", days: 180 },
  { value: "1y", label: "Last year", days: 365 },
  { value: "all", label: "All time", days: 0 },
];

const STAGE_COLORS: Record<OpportunityStage, string> = {
  PROSPECT: "bg-gray-500",
  QUALIFIED: "bg-blue-500", 
  PROPOSAL: "bg-yellow-500",
  NEGOTIATION: "bg-orange-500",
  CLOSED_WON: "bg-green-500",
  CLOSED_LOST: "bg-red-500",
};

export function PipelineAnalytics({ className }: PipelineAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [refreshing, setRefreshing] = useState(false);

  const opportunities = useQuery(api.opportunities.getAllOpportunities, { isActive: true });
  const revenueForecasting = useQuery(api.opportunities.getRevenueForecasting, {});

  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange);
    if (!selectedRange || selectedRange.days === 0) return opportunities;

    const cutoffDate = Date.now() - (selectedRange.days * 24 * 60 * 60 * 1000);
    return opportunities.filter(opp => opp.createdAt >= cutoffDate);
  }, [opportunities, timeRange]);

  const stageMetrics = useMemo(() => {
    if (!filteredOpportunities || !opportunities) return [];

    const stages: OpportunityStage[] = ["PROSPECT", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];
    
    return stages.map(stage => {
      const stageOpps = filteredOpportunities.filter(opp => opp.stage === stage);
      const totalValue = stageOpps.reduce((sum, opp) => sum + opp.value, 0);
      const totalWeightedValue = stageOpps.reduce((sum, opp) => sum + (opp.value * ((opp.probability || 0) / 100)), 0);
      const avgProbability = stageOpps.length > 0 
        ? stageOpps.reduce((sum, opp) => sum + (opp.probability || 0), 0) / stageOpps.length
        : 0;

      // Calculate average days in stage
      const now = Date.now();
      const avgDaysInStage = stageOpps.length > 0
        ? stageOpps.reduce((sum, opp) => sum + ((now - opp.updatedAt) / (24 * 60 * 60 * 1000)), 0) / stageOpps.length
        : 0;

      // Calculate conversion rate (to next stage or closed won)
      const nextStageIndex = stages.indexOf(stage) + 1;
      const nextStageOpps = nextStageIndex < stages.length 
        ? opportunities.filter(opp => opp.stage === stages[nextStageIndex] || opp.stage === "CLOSED_WON")
        : [];
      const conversionRate = stageOpps.length > 0 
        ? (nextStageOpps.length / (stageOpps.length + nextStageOpps.length)) * 100
        : 0;

      return {
        stage,
        count: stageOpps.length,
        value: totalValue,
        weightedValue: totalWeightedValue,
        avgProbability,
        avgDaysInStage: Math.round(avgDaysInStage),
        conversionRate: Math.round(conversionRate),
      };
    });
  }, [filteredOpportunities, opportunities]);

  const overallMetrics = useMemo(() => {
    if (!filteredOpportunities) return null;

    const totalOpportunities = filteredOpportunities.length;
    const totalValue = filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const totalWeightedValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.value * ((opp.probability || 0) / 100)), 0);
    const avgDealSize = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
    
    const closedWon = filteredOpportunities.filter(opp => opp.stage === "CLOSED_WON");
    const winRate = totalOpportunities > 0 ? (closedWon.length / totalOpportunities) * 100 : 0;
    
    const activeOpportunities = filteredOpportunities.filter(opp => 
      !["CLOSED_WON", "CLOSED_LOST"].includes(opp.stage)
    );
    
    // Calculate average sales cycle length
    const avgSalesCycle = closedWon.length > 0
      ? closedWon.reduce((sum, opp) => sum + ((opp.updatedAt - opp.createdAt) / (24 * 60 * 60 * 1000)), 0) / closedWon.length
      : 0;

    return {
      totalOpportunities,
      totalValue,
      totalWeightedValue,
      avgDealSize,
      winRate,
      activeOpportunities: activeOpportunities.length,
      avgSalesCycle: Math.round(avgSalesCycle),
      closedWonValue: closedWon.reduce((sum, opp) => sum + opp.value, 0),
    };
  }, [filteredOpportunities]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting analytics data...", { stageMetrics, overallMetrics });
  };

  if (!opportunities || !overallMetrics) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pipeline Analytics</h2>
          <p className="text-sm text-gray-600">
            Sales performance metrics and insights
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Pipeline Value"
          value={`€${overallMetrics.totalValue.toLocaleString()}`}
          change={12.5}
          icon={DollarSign}
          trend="up"
        />
        
        <MetricCard
          title="Weighted Pipeline"
          value={`€${Math.round(overallMetrics.totalWeightedValue).toLocaleString()}`}
          change={8.3}
          icon={Target}
          trend="up"
        />
        
        <MetricCard
          title="Win Rate"
          value={`${Math.round(overallMetrics.winRate)}%`}
          change={-2.1}
          icon={TrendingUp}
          trend="down"
        />
        
        <MetricCard
          title="Avg Deal Size"
          value={`€${Math.round(overallMetrics.avgDealSize).toLocaleString()}`}
          change={15.7}
          icon={BarChart3}
          trend="up"
        />
      </div>

      {/* Pipeline Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Pipeline Stage Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stageMetrics.map(stage => (
                <div key={stage.stage} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage.stage]}`} />
                    <div>
                      <p className="font-medium text-sm">{stage.stage.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-600">
                        {stage.count} opportunities • {stage.avgDaysInStage} avg days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">€{stage.value.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">{stage.conversionRate}% conversion</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Revenue Closed</p>
                  <p className="text-xs text-gray-600">This period</p>
                </div>
              </div>
              <p className="font-medium text-lg text-green-700">
                €{overallMetrics.closedWonValue.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Avg Sales Cycle</p>
                  <p className="text-xs text-gray-600">Days to close</p>
                </div>
              </div>
              <p className="font-medium text-lg text-blue-700">
                {overallMetrics.avgSalesCycle} days
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-sm">Active Opportunities</p>
                  <p className="text-xs text-gray-600">In pipeline</p>
                </div>
              </div>
              <p className="font-medium text-lg text-orange-700">
                {overallMetrics.activeOpportunities}
              </p>
            </div>

            {/* Pipeline Health Warning */}
            {overallMetrics.winRate < 20 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-sm text-red-800">Low Win Rate Alert</p>
                  <p className="text-xs text-red-600">Consider reviewing qualification criteria</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Forecasting */}
      {revenueForecasting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Revenue Forecasting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Total Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{revenueForecasting.summary.totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {revenueForecasting.summary.totalOpportunities} opportunities
                </p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <p className="text-sm text-blue-600 mb-2">Weighted Forecast</p>
                <p className="text-2xl font-bold text-blue-700">
                  €{Math.round(revenueForecasting.summary.totalWeightedValue).toLocaleString()}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {Math.round(revenueForecasting.summary.averageProbability)}% avg probability
                </p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-green-50">
                <p className="text-sm text-green-600 mb-2">Expected Revenue</p>
                <p className="text-2xl font-bold text-green-700">
                  €{Math.round(revenueForecasting.summary.totalWeightedValue * 0.8).toLocaleString()}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Conservative estimate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend 
}: {
  title: string;
  value: string;
  change: number;
  icon: any;
  trend: 'up' | 'down';
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Icon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="mt-4 flex items-center">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-600 ml-1">
            vs previous period
          </span>
        </div>
      </CardContent>
    </Card>
  );
}