"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingDown, 
  TrendingUp,
  Clock,
  Zap,
  Target,
  Activity,
  AlertCircle,
  Info,
  RefreshCw
} from "lucide-react";

interface PipelineHealthIndicatorsProps {
  className?: string;
}

interface HealthIndicator {
  id: string;
  title: string;
  status: "healthy" | "warning" | "critical" | "info";
  value: string | number;
  description: string;
  recommendation?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
}

interface Bottleneck {
  stage: string;
  avgDaysInStage: number;
  conversionRate: number;
  opportunityCount: number;
  severity: "low" | "medium" | "high";
  recommendation: string;
}

export function PipelineHealthIndicators({ className }: PipelineHealthIndicatorsProps) {
  const [refreshing, setRefreshing] = useState(false);

  const pipelineAnalytics = useQuery(api.opportunities.getPipelineAnalytics, {});
  const opportunities = useQuery(api.opportunities.getAllOpportunities, { isActive: true });

  const healthIndicators = useMemo(() => {
    if (!pipelineAnalytics || !opportunities) return [];

    const indicators: HealthIndicator[] = [];
    const { summary, stageMetrics, conversionRates } = pipelineAnalytics;

    // Overall Win Rate Health
    const winRateStatus = summary.winRate >= 30 ? "healthy" : summary.winRate >= 20 ? "warning" : "critical";
    indicators.push({
      id: "win-rate",
      title: "Overall Win Rate",
      status: winRateStatus,
      value: `${Math.round(summary.winRate)}%`,
      description: "Percentage of opportunities that close successfully",
      recommendation: winRateStatus !== "healthy" ? "Consider improving lead qualification and sales training" : undefined,
      trend: "stable", // Would need historical data for actual trend
    });

    // Pipeline Velocity
    const avgSalesCycle = summary.avgSalesCycle;
    const velocityStatus = avgSalesCycle <= 30 ? "healthy" : avgSalesCycle <= 60 ? "warning" : "critical";
    indicators.push({
      id: "sales-velocity",
      title: "Sales Cycle Length",
      status: velocityStatus,
      value: `${avgSalesCycle} days`,
      description: "Average time to close opportunities",
      recommendation: velocityStatus !== "healthy" ? "Focus on accelerating deal progression and removing blockers" : undefined,
    });

    // Pipeline Balance
    const activeOpps = opportunities.filter(opp => !["CLOSED_WON", "CLOSED_LOST"].includes(opp.stage));
    const prospectRatio = activeOpps.filter(opp => opp.stage === "PROSPECT").length / activeOpps.length;
    const balanceStatus = prospectRatio <= 0.4 ? "healthy" : prospectRatio <= 0.6 ? "warning" : "critical";
    indicators.push({
      id: "pipeline-balance",
      title: "Pipeline Balance",
      status: balanceStatus,
      value: `${Math.round(prospectRatio * 100)}%`,
      description: "Percentage of opportunities in early stages",
      recommendation: balanceStatus !== "healthy" ? "Increase focus on advancing prospects through the pipeline" : undefined,
    });

    // Conversion Rate Health
    const overallConversion = conversionRates.overallWinRate;
    const conversionStatus = overallConversion >= 25 ? "healthy" : overallConversion >= 15 ? "warning" : "critical";
    indicators.push({
      id: "conversion-health",
      title: "Conversion Health",
      status: conversionStatus,
      value: `${overallConversion}%`,
      description: "Overall pipeline conversion performance",
      recommendation: conversionStatus !== "healthy" ? "Review lead sources and qualification criteria" : undefined,
    });

    // Stale Opportunities
    const now = Date.now();
    const staleThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days
    const staleOpportunities = activeOpps.filter(opp => (now - opp.updatedAt) > staleThreshold);
    const staleStatus = staleOpportunities.length === 0 ? "healthy" : staleOpportunities.length <= 5 ? "warning" : "critical";
    indicators.push({
      id: "stale-opportunities",
      title: "Stale Opportunities",
      status: staleStatus,
      value: staleOpportunities.length,
      description: "Opportunities inactive for over 30 days",
      recommendation: staleStatus !== "healthy" ? "Review and update stale opportunities or mark as lost" : undefined,
    });

    // Revenue Concentration Risk
    const topOpportunityValue = Math.max(...activeOpps.map(opp => opp.value));
    const totalPipelineValue = activeOpps.reduce((sum, opp) => sum + opp.value, 0);
    const concentrationRisk = topOpportunityValue / totalPipelineValue;
    const concentrationStatus = concentrationRisk <= 0.3 ? "healthy" : concentrationRisk <= 0.5 ? "warning" : "critical";
    indicators.push({
      id: "concentration-risk",
      title: "Revenue Concentration",
      status: concentrationStatus,
      value: `${Math.round(concentrationRisk * 100)}%`,
      description: "Percentage of pipeline value in largest opportunity",
      recommendation: concentrationStatus !== "healthy" ? "Diversify pipeline to reduce dependency on single large deals" : undefined,
    });

    return indicators;
  }, [pipelineAnalytics, opportunities]);

  const bottlenecks = useMemo(() => {
    if (!pipelineAnalytics) return [];

    const { stageMetrics } = pipelineAnalytics;
    const bottlenecks: Bottleneck[] = [];

    stageMetrics.forEach(stage => {
      if (stage.count === 0) return;

      let severity: "low" | "medium" | "high" = "low";
      let recommendation = "";

      // Identify bottlenecks based on time spent in stage and conversion rates
      if (stage.avgDaysInStage > 45 && stage.count > 5) {
        severity = "high";
        recommendation = `Opportunities are spending too long in ${stage.stage}. Review stage requirements and provide additional support.`;
      } else if (stage.avgDaysInStage > 30 || stage.count > 10) {
        severity = "medium";
        recommendation = `Monitor ${stage.stage} stage for potential process improvements.`;
      }

      if (severity !== "low") {
        bottlenecks.push({
          stage: stage.stage,
          avgDaysInStage: stage.avgDaysInStage,
          conversionRate: 0, // Would need to calculate from historical data
          opportunityCount: stage.count,
          severity,
          recommendation,
        });
      }
    });

    return bottlenecks.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [pipelineAnalytics]);

  const overallHealthScore = useMemo(() => {
    if (healthIndicators.length === 0) return 0;
    
    const scores = healthIndicators.map(indicator => {
      switch (indicator.status) {
        case "healthy": return 100;
        case "warning": return 60;
        case "critical": return 20;
        default: return 80;
      }
    });
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [healthIndicators]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "critical": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "border-green-200 bg-green-50";
      case "warning": return "border-yellow-200 bg-yellow-50";
      case "critical": return "border-red-200 bg-red-50";
      default: return "border-blue-200 bg-blue-50";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (!pipelineAnalytics || !opportunities) {
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
          <h2 className="text-2xl font-bold text-gray-900">Pipeline Health</h2>
          <p className="text-sm text-gray-600">
            Real-time health indicators and bottleneck analysis
          </p>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Overall Pipeline Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-gray-900">{overallHealthScore}/100</p>
              <p className="text-sm text-gray-600">Health Score</p>
            </div>
            <div className="text-right">
              {overallHealthScore >= 80 && (
                <Badge className="bg-green-100 text-green-800">Excellent</Badge>
              )}
              {overallHealthScore >= 60 && overallHealthScore < 80 && (
                <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
              )}
              {overallHealthScore < 60 && (
                <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
              )}
            </div>
          </div>
          <Progress value={overallHealthScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthIndicators.map(indicator => (
          <Card key={indicator.id} className={getStatusColor(indicator.status)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{indicator.title}</h3>
                {getStatusIcon(indicator.status)}
              </div>
              
              <div className="mb-2">
                <p className="text-2xl font-bold text-gray-900">{indicator.value}</p>
                <p className="text-sm text-gray-600">{indicator.description}</p>
              </div>

              {indicator.trend && (
                <div className="flex items-center mb-2">
                  {indicator.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : indicator.trend === "down" ? (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  ) : null}
                  {indicator.trendValue && (
                    <span className="text-sm text-gray-600">
                      {indicator.trendValue}% vs last period
                    </span>
                  )}
                </div>
              )}

              {indicator.recommendation && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {indicator.recommendation}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottlenecks Analysis */}
      {bottlenecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Pipeline Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottlenecks.map((bottleneck, index) => (
                <div key={bottleneck.stage} className="flex items-start justify-between p-4 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Badge variant="outline" className={getSeverityColor(bottleneck.severity)}>
                        {bottleneck.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{bottleneck.stage.replace('_', ' ')}</h4>
                      <p className="text-sm text-gray-600 mt-1">{bottleneck.recommendation}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {bottleneck.avgDaysInStage} days avg
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {bottleneck.opportunityCount} opportunities
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {bottlenecks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bottlenecks Detected</h3>
            <p className="text-gray-600">
              Your pipeline is flowing smoothly with no significant bottlenecks identified.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}