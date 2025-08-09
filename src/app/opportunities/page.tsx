"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { OpportunityPipeline } from "~/components/features/opportunities/OpportunityPipeline";
import { PipelineAnalytics } from "~/components/features/opportunities/PipelineAnalytics";
import { SalesPerformanceReport } from "~/components/features/opportunities/SalesPerformanceReport";
import { PipelineHealthIndicators } from "~/components/features/opportunities/PipelineHealthIndicators";
import { useState } from "react";
import { 
  BarChart3, 
  Activity, 
  Kanban,
  TrendingUp
} from "lucide-react";

export default function OpportunitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Authenticated>
          <OpportunitiesContent />
        </Authenticated>
        
        <Unauthenticated>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">Please sign in to view opportunities.</p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Sign In
              </button>
            </SignInButton>
          </div>
        </Unauthenticated>
      </div>
    </div>
  );
}

type TabView = "pipeline" | "analytics" | "performance" | "health";

const TABS = [
  { id: "pipeline" as TabView, label: "Pipeline", icon: Kanban, description: "Kanban board view" },
  { id: "analytics" as TabView, label: "Analytics", icon: BarChart3, description: "Pipeline metrics" },
  { id: "performance" as TabView, label: "Performance", icon: TrendingUp, description: "Team performance" },
  { id: "health" as TabView, label: "Health", icon: Activity, description: "Pipeline health" },
];

function OpportunitiesContent() {
  const [activeTab, setActiveTab] = useState<TabView>("pipeline");

  const renderContent = () => {
    switch (activeTab) {
      case "pipeline":
        return <OpportunityPipeline />;
      case "analytics":
        return <PipelineAnalytics />;
      case "performance":
        return <SalesPerformanceReport />;
      case "health":
        return <PipelineHealthIndicators />;
      default:
        return <OpportunityPipeline />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-1">
            Manage opportunities, analyze performance, and track pipeline health
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5 transition-colors
                  ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
}