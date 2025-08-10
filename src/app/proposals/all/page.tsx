"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Send, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter,
  ArrowLeft,
  SortAsc,
  SortDesc
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

type SortField = "createdAt" | "totalValue" | "status" | "clientName";
type SortDirection = "asc" | "desc";

export default function AllProposalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Get all proposals
  const proposals = useQuery(api.proposals.getAllProposals, {});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <FileText className="h-4 w-4 text-gray-500" />;
      case "SENT":
        return <Send className="h-4 w-4 text-blue-500" />;
      case "VIEWED":
        return <Eye className="h-4 w-4 text-green-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "APPROVED":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "EXPIRED":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "secondary";
      case "SENT":
        return "default";
      case "VIEWED":
        return "default";
      case "PENDING":
        return "warning";
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "destructive";
      case "EXPIRED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter and sort proposals
  const filteredAndSortedProposals = useMemo(() => {
    if (!proposals) return [];

    let filtered = proposals.filter((proposal) => {
      const matchesSearch = 
        proposal.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.opportunityName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || proposal.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort proposals
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "createdAt") {
        aValue = a.createdAt;
        bValue = b.createdAt;
      } else if (sortField === "totalValue") {
        aValue = a.totalValue;
        bValue = b.totalValue;
      } else if (sortField === "status") {
        aValue = a.status;
        bValue = b.status;
      } else if (sortField === "clientName") {
        aValue = a.clientName;
        bValue = b.clientName;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [proposals, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <SortAsc className="h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/proposals">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">All Proposals</h1>
            </div>
            <p className="text-muted-foreground">
              Complete list of all proposals with filtering and search
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by client name or opportunity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="VIEWED">Viewed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedProposals.length} of {proposals?.length || 0} proposals
        </div>
      </div>

      {/* Proposals Table */}
      {proposals === undefined ? (
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading proposals...</div>
        </div>
      ) : filteredAndSortedProposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Proposals Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search criteria or filters"
                : "No proposals have been created yet"
              }
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/proposals">
                <Button>Create First Proposal</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Desktop Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
            <button
              onClick={() => handleSort("clientName")}
              className="col-span-3 flex items-center gap-1 text-left hover:text-foreground"
            >
              Client / Opportunity
              {getSortIcon("clientName")}
            </button>
            <button
              onClick={() => handleSort("status")}
              className="col-span-2 flex items-center gap-1 text-left hover:text-foreground"
            >
              Status
              {getSortIcon("status")}
            </button>
            <button
              onClick={() => handleSort("totalValue")}
              className="col-span-2 flex items-center gap-1 text-left hover:text-foreground"
            >
              Value
              {getSortIcon("totalValue")}
            </button>
            <button
              onClick={() => handleSort("createdAt")}
              className="col-span-2 flex items-center gap-1 text-left hover:text-foreground"
            >
              Created
              {getSortIcon("createdAt")}
            </button>
            <div className="col-span-2 text-left">Last Activity</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          {/* Proposals List */}
          {filteredAndSortedProposals.map((proposal) => (
            <Card key={proposal._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{proposal.clientName}</h3>
                      <p className="text-sm text-muted-foreground">{proposal.opportunityName}</p>
                    </div>
                    <Badge variant={getStatusColor(proposal.status) as any}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(proposal.status)}
                        {proposal.status}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Value:</span>
                      <div className="font-medium">{formatCurrency(proposal.totalValue)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <div>{formatDate(proposal.createdAt)}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/proposals/${proposal._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/proposals/${proposal._id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <div className="font-semibold">{proposal.clientName}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {proposal.opportunityName}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <Badge variant={getStatusColor(proposal.status) as any}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(proposal.status)}
                        {proposal.status}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="col-span-2 font-medium">
                    {formatCurrency(proposal.totalValue)}
                  </div>
                  
                  <div className="col-span-2 text-sm">
                    {formatDate(proposal.createdAt)}
                  </div>
                  
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {proposal.sentAt ? formatDate(proposal.sentAt) : 
                     proposal.viewedAt ? formatDate(proposal.viewedAt) : 
                     "No activity"}
                  </div>
                  
                  <div className="col-span-1 flex gap-1">
                    <Link href={`/proposals/${proposal._id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}