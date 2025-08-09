"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Send, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Bell,
  ChevronRight,
  Calendar,
  TrendingUp,
  Users
} from "lucide-react";
import { ProposalCard } from "./ProposalCard";
import { ProposalStatusTracker } from "./ProposalStatusTracker";
import { ProposalGenerator } from "./ProposalGenerator";
import type { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type ProposalStatus = 
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

interface ProposalPipelineProps {
  opportunityId?: Id<"opportunities">;
  viewMode?: "pipeline" | "list" | "calendar";
}

const STATUS_COLUMNS: ProposalStatus[] = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "UNDER_REVIEW",
  "ACCEPTED"
];

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    icon: FileText,
    color: "bg-gray-100 text-gray-700 border-gray-300",
  },
  SENT: {
    label: "Sent",
    icon: Send,
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  VIEWED: {
    label: "Viewed",
    icon: Eye,
    color: "bg-purple-100 text-purple-700 border-purple-300",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle,
    color: "bg-green-100 text-green-700 border-green-300",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-100 text-red-700 border-red-300",
  },
  EXPIRED: {
    label: "Expired",
    icon: AlertCircle,
    color: "bg-orange-100 text-orange-700 border-orange-300",
  },
};

export function ProposalPipeline({ 
  opportunityId, 
  viewMode = "pipeline" 
}: ProposalPipelineProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "ALL">("ALL");
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch proposals with real-time updates
  const proposals = useQuery(api.proposals.getAllProposals, {
    opportunityId,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  // Fetch proposals requiring follow-up
  const followUpProposals = useQuery(api.proposals.getProposalsRequiringFollowUp);

  // Mutations
  const updateProposalStatus = useMutation(api.proposals.updateProposalStatus);
  const sendProposalEmail = useMutation(api.proposals.sendProposalEmail);

  // Auto-refresh for real-time updates
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Convex queries automatically refresh, this is just for UI updates
      console.log("Refreshing proposal data...");
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter proposals based on search
  const filteredProposals = proposals?.filter(proposal => {
    if (!searchTerm) return true;
    return proposal.title.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  // Group proposals by status for pipeline view
  const proposalsByStatus = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = filteredProposals.filter(p => p.status === status);
    return acc;
  }, {} as Record<ProposalStatus, any[]>);

  // Add rejected and expired to the grouped proposals
  proposalsByStatus.REJECTED = filteredProposals.filter(p => p.status === "REJECTED");
  proposalsByStatus.EXPIRED = filteredProposals.filter(p => p.status === "EXPIRED");

  // Calculate metrics
  const metrics = {
    total: proposals?.length || 0,
    accepted: proposals?.filter(p => p.status === "ACCEPTED").length || 0,
    pending: proposals?.filter(p => ["SENT", "VIEWED", "UNDER_REVIEW"].includes(p.status)).length || 0,
    requireFollowUp: followUpProposals?.length || 0,
    conversionRate: proposals?.length ? 
      Math.round((proposals.filter(p => p.status === "ACCEPTED").length / proposals.length) * 100) : 0,
  };

  const handleStatusUpdate = async (proposalId: Id<"proposals">, newStatus: ProposalStatus) => {
    try {
      await updateProposalStatus({
        proposalId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update proposal status:", error);
    }
  };

  const handleSendReminder = async (proposal: any) => {
    try {
      // Get contact email from opportunity
      const opportunity = await fetch(`/api/opportunities/${proposal.opportunityId}`);
      const data = await opportunity.json();
      
      await sendProposalEmail({
        proposalId: proposal._id,
        clientEmail: data.contact.email,
        customMessage: "Just following up on the proposal we sent. Please let us know if you have any questions.",
      });
    } catch (error) {
      console.error("Failed to send reminder:", error);
    }
  };

  const renderPipelineView = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Proposals</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{metrics.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-up Alerts */}
      {followUpProposals && followUpProposals.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              Proposals Requiring Follow-up ({followUpProposals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {followUpProposals.slice(0, 3).map((proposal) => (
                <div key={proposal._id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div>
                    <p className="font-medium">{proposal.title}</p>
                    <p className="text-sm text-gray-600">
                      {proposal.status === "SENT" ? "Not viewed yet" : "No response yet"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendReminder(proposal)}
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    Send Reminder
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pipeline Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((status) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const proposalsInStatus = proposalsByStatus[status];
          
          return (
            <div key={status} className="flex-1 min-w-[300px]">
              <div className={cn(
                "rounded-t-lg p-3 flex items-center justify-between",
                config.color.replace('text-', 'bg-').replace('700', '50')
              )}>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <h3 className="font-semibold">{config.label}</h3>
                </div>
                <Badge variant="secondary">{proposalsInStatus.length}</Badge>
              </div>
              
              <div className="bg-gray-50 min-h-[400px] p-2 space-y-2 rounded-b-lg">
                {proposalsInStatus.map((proposal) => (
                  <Card 
                    key={proposal._id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedProposal(proposal);
                      setDetailsOpen(true);
                    }}
                  >
                    <CardContent className="p-3">
                      <p className="font-medium text-sm mb-1">{proposal.title}</p>
                      <p className="text-xs text-gray-600 mb-2">
                        Created {new Date(proposal.createdAt).toLocaleDateString()}
                      </p>
                      {proposal.expiresAt && (
                        <Badge variant="outline" className="text-xs">
                          Expires {new Date(proposal.expiresAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rejected/Expired Section */}
      {(proposalsByStatus.REJECTED.length > 0 || proposalsByStatus.EXPIRED.length > 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Closed Proposals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposalsByStatus.REJECTED.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Rejected ({proposalsByStatus.REJECTED.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {proposalsByStatus.REJECTED.slice(0, 3).map((proposal) => (
                    <div key={proposal._id} className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                         onClick={() => {
                           setSelectedProposal(proposal);
                           setDetailsOpen(true);
                         }}>
                      <p className="text-sm font-medium">{proposal.title}</p>
                      <p className="text-xs text-gray-600">
                        Rejected {new Date(proposal.respondedAt || proposal.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {proposalsByStatus.EXPIRED.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Expired ({proposalsByStatus.EXPIRED.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {proposalsByStatus.EXPIRED.slice(0, 3).map((proposal) => (
                    <div key={proposal._id} className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                         onClick={() => {
                           setSelectedProposal(proposal);
                           setDetailsOpen(true);
                         }}>
                      <p className="text-sm font-medium">{proposal.title}</p>
                      <p className="text-xs text-gray-600">
                        Expired {new Date(proposal.expiresAt || proposal.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredProposals.map((proposal) => (
        <ProposalCard
          key={proposal._id}
          proposal={proposal}
          onClick={() => {
            setSelectedProposal(proposal);
            setDetailsOpen(true);
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Proposal Pipeline</h2>
          <p className="text-gray-600">Manage and track all your proposals</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(autoRefresh && "bg-blue-50")}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", autoRefresh && "animate-spin")} />
            {autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
          </Button>
          <Button onClick={() => setGeneratorOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            New Proposal
          </Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProposalStatus | "ALL")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={currentViewMode} onValueChange={(value) => setCurrentViewMode(value as any)}>
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      {currentViewMode === "pipeline" ? renderPipelineView() : renderListView()}

      {/* Proposal Details Dialog */}
      {selectedProposal && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProposal.title}</DialogTitle>
              <DialogDescription>
                Proposal details and status tracking
              </DialogDescription>
            </DialogHeader>
            <ProposalStatusTracker
              currentStatus={selectedProposal.status}
              interactions={[]}
              sentAt={selectedProposal.sentAt}
              viewedAt={selectedProposal.viewedAt}
              respondedAt={selectedProposal.respondedAt}
              expiresAt={selectedProposal.expiresAt}
              onStatusUpdate={(newStatus) => handleStatusUpdate(selectedProposal._id, newStatus)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Proposal Generator Dialog */}
      <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate New Proposal</DialogTitle>
            <DialogDescription>
              Create a new proposal from a template
            </DialogDescription>
          </DialogHeader>
          {/* This would need an opportunity selector or be passed an opportunity */}
          <div className="py-4">
            <p className="text-center text-gray-600">
              Please select an opportunity from the opportunities page to generate a proposal.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}