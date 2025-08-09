"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Target,
  Calendar,
  Award,
  BarChart3,
  Download,
  Filter,
  Crown
} from "lucide-react";

interface SalesPerformanceReportProps {
  className?: string;
}

interface TeamMember {
  userId: string;
  name: string;
  email: string;
  totalOpportunities: number;
  closedWon: number;
  totalValue: number;
  closedValue: number;
  winRate: number;
  avgDealSize: number;
  avgSalesCycle: number;
}

const TIME_RANGES = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "6m", label: "Last 6 months", days: 180 },
  { value: "1y", label: "Last year", days: 365 },
  { value: "all", label: "All time", days: 0 },
];

const METRICS = [
  { key: "closedValue", label: "Revenue", icon: DollarSign, format: "currency" },
  { key: "winRate", label: "Win Rate", icon: Target, format: "percentage" },
  { key: "avgDealSize", label: "Avg Deal Size", icon: BarChart3, format: "currency" },
  { key: "avgSalesCycle", label: "Sales Cycle", icon: Calendar, format: "days" },
];

export function SalesPerformanceReport({ className }: SalesPerformanceReportProps) {
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [sortBy, setSortBy] = useState<string>("closedValue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const salesPerformance = useQuery(api.opportunities.getSalesPerformance, {
    startDate: timeRange !== "all" ? Date.now() - (TIME_RANGES.find(r => r.value === timeRange)?.days || 30) * 24 * 60 * 60 * 1000 : undefined,
    endDate: Date.now()
  });

  const pipelineAnalytics = useQuery(api.opportunities.getPipelineAnalytics, {
    startDate: timeRange !== "all" ? Date.now() - (TIME_RANGES.find(r => r.value === timeRange)?.days || 30) * 24 * 60 * 60 * 1000 : undefined,
    endDate: Date.now()
  });

  const sortedPerformance = useMemo(() => {
    if (!salesPerformance) return [];
    
    return [...salesPerformance].sort((a, b) => {
      const aValue = a[sortBy as keyof TeamMember] as number;
      const bValue = b[sortBy as keyof TeamMember] as number;
      
      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });
  }, [salesPerformance, sortBy, sortOrder]);

  const teamSummary = useMemo(() => {
    if (!salesPerformance) return null;

    const totalRevenue = salesPerformance.reduce((sum, member) => sum + member.closedValue, 0);
    const totalOpportunities = salesPerformance.reduce((sum, member) => sum + member.totalOpportunities, 0);
    const totalClosedWon = salesPerformance.reduce((sum, member) => sum + member.closedWon, 0);
    const avgWinRate = salesPerformance.length > 0 
      ? salesPerformance.reduce((sum, member) => sum + member.winRate, 0) / salesPerformance.length 
      : 0;

    return {
      totalMembers: salesPerformance.length,
      totalRevenue,
      totalOpportunities,
      totalClosedWon,
      avgWinRate,
      topPerformer: sortedPerformance[0],
      activeMembersThisPeriod: salesPerformance.filter(member => member.totalOpportunities > 0).length,
    };
  }, [salesPerformance, sortedPerformance]);

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "currency":
        return `€${value.toLocaleString()}`;
      case "percentage":
        return `${Math.round(value)}%`;
      case "days":
        return `${Math.round(value)} days`;
      default:
        return value.toString();
    }
  };

  const getPerformanceLevel = (winRate: number, avgDealSize: number, avgTeamWinRate: number, avgTeamDealSize: number) => {
    if (winRate >= avgTeamWinRate * 1.2 && avgDealSize >= avgTeamDealSize * 1.2) {
      return { level: "Excellent", color: "bg-green-100 text-green-800", icon: Crown };
    } else if (winRate >= avgTeamWinRate && avgDealSize >= avgTeamDealSize) {
      return { level: "Good", color: "bg-blue-100 text-blue-800", icon: Award };
    } else if (winRate >= avgTeamWinRate * 0.8 && avgDealSize >= avgTeamDealSize * 0.8) {
      return { level: "Average", color: "bg-yellow-100 text-yellow-800", icon: Target };
    } else {
      return { level: "Needs Improvement", color: "bg-red-100 text-red-800", icon: TrendingUp };
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting sales performance data...", { salesPerformance, teamSummary });
  };

  if (!salesPerformance || !teamSummary) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const avgTeamWinRate = teamSummary.avgWinRate;
  const avgTeamDealSize = salesPerformance.length > 0 
    ? salesPerformance.reduce((sum, member) => sum + member.avgDealSize, 0) / salesPerformance.length 
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Performance Report</h2>
          <p className="text-sm text-gray-600">
            Team and individual performance metrics
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
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{teamSummary.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {teamSummary.totalClosedWon} deals closed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Win Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(teamSummary.avgWinRate)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {teamSummary.totalOpportunities} total opportunities
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamSummary.activeMembersThisPeriod}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              out of {teamSummary.totalMembers} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Performer</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {teamSummary.topPerformer?.name || "N/A"}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              €{teamSummary.topPerformer?.closedValue.toLocaleString() || "0"} revenue
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Controls */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Sort by:</span>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map(metric => (
                <SelectItem key={metric.key} value={metric.key}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          >
            {sortOrder === "desc" ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          {sortedPerformance.length} team members
        </div>
      </div>

      {/* Individual Performance */}
      <div className="space-y-4">
        {sortedPerformance.map((member, index) => {
          const performance = getPerformanceLevel(member.winRate, member.avgDealSize, avgTeamWinRate, avgTeamDealSize);
          const PerformanceIcon = performance.icon;
          
          return (
            <Card key={member.userId}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          <AvatarInitials name={member.name} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>

                    <Badge variant="secondary" className={performance.color}>
                      <PerformanceIcon className="w-3 h-3 mr-1" />
                      {performance.level}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                  {METRICS.map(metric => {
                    const value = member[metric.key as keyof TeamMember] as number;
                    const MetricIcon = metric.icon;
                    
                    return (
                      <div key={metric.key} className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <MetricIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                          {formatValue(value, metric.format)}
                        </p>
                        
                        {/* Progress bar for win rate */}
                        {metric.key === "winRate" && (
                          <Progress 
                            value={value} 
                            className="mt-2 h-2" 
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{member.totalOpportunities}</span> total opportunities • 
                    <span className="font-medium text-green-600 ml-1">{member.closedWon}</span> won
                  </div>
                  
                  {member.winRate > avgTeamWinRate && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Above Average
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedPerformance.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sales Data</h3>
            <p className="text-gray-600">
              No sales team members have opportunities in the selected time period.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}