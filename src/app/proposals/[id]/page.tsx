"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Send, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Download,
  Mail,
  Edit,
  Calendar,
  DollarSign,
  User,
  Building,
  Phone,
  MapPin,
  Clock4
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ProposalPreview } from "@/components/features/proposals/ProposalPreview";
import { ProposalComments } from "@/components/features/proposals/ProposalComments";
import { toast } from "sonner";

export default function ProposalDetailsPage() {
  const params = useParams();
  const proposalId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<"overview" | "preview" | "comments">("overview");
  
  // Get proposal details
  const proposal = useQuery(api.proposals.getProposalById, { proposalId });
  
  // Get opportunity details
  const opportunity = useQuery(
    api.opportunities.getOpportunityById, 
    proposal ? { opportunityId: proposal.opportunityId } : "skip"
  );
  
  // Get contact details
  const contact = useQuery(
    api.contacts.getContactById, 
    proposal ? { contactId: proposal.contactId } : "skip"
  );

  // Mutations
  const sendProposal = useMutation(api.proposals.sendProposal);
  const updateProposalStatus = useMutation(api.proposals.updateProposalStatus);
  const generatePDF = useMutation(api.proposals.generateProposalPDF);

  const [isLoading, setIsLoading] = useState(false);

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
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSendProposal = async () => {
    if (!proposal) return;
    
    setIsLoading(true);
    try {
      await sendProposal({ 
        proposalId: proposal._id,
        recipientEmail: contact?.email || "",
        customMessage: undefined
      });
      toast.success("Proposal sent successfully!");
    } catch (error) {
      toast.error("Failed to send proposal");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!proposal) return;
    
    setIsLoading(true);
    try {
      const result = await generatePDF({ proposalId: proposal._id });
      if (result.downloadUrl) {
        // Open download URL
        window.open(result.downloadUrl, '_blank');
        toast.success("PDF generated successfully!");
      }
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (proposal === undefined) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading proposal...</div>
        </div>
      </div>
    );
  }

  if (proposal === null) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Proposal not found. It may have been deleted or you don't have access to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isExpired = proposal.expiresAt && proposal.expiresAt < Date.now();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/proposals">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Proposals
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold">{opportunity?.name || "Proposal"}</h1>
            <p className="text-muted-foreground">
              Proposal for {contact?.name || "Unknown Client"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(proposal.status) as any} className="text-sm">
              <div className="flex items-center gap-2">
                {getStatusIcon(proposal.status)}
                {proposal.status}
              </div>
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Link href={`/proposals/${proposal._id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Proposal
            </Button>
          </Link>
          
          {proposal.status === "DRAFT" && (
            <Button onClick={handleSendProposal} disabled={isLoading}>
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? "Sending..." : "Send Proposal"}
            </Button>
          )}
          
          <Button variant="outline" onClick={handleGeneratePDF} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            {isLoading ? "Generating..." : "Download PDF"}
          </Button>
        </div>

        {/* Expired Warning */}
        {isExpired && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              This proposal expired on {formatDate(proposal.expiresAt!)}. 
              Consider extending the expiration date or creating a new proposal.
            </AlertDescription>
          </Alert>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "overview" 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "preview" 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "comments" 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Comments
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proposal Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Proposal Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Value</div>
                    <div className="text-2xl font-bold">{formatCurrency(proposal.totalValue)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Items</div>
                    <div className="text-2xl font-bold">{proposal.items?.length || 0}</div>
                  </div>
                </div>
                
                {proposal.validUntil && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Valid Until</div>
                    <div className="text-lg">{formatDate(proposal.validUntil)}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Details */}
            {opportunity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Event Type</div>
                      <div>{opportunity.eventType}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Guest Count</div>
                      <div>{opportunity.guestCount}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Event Date</div>
                    <div>{formatDate(opportunity.eventDate)}</div>
                  </div>
                  
                  {opportunity.description && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Description</div>
                      <div className="text-sm">{opportunity.description}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Proposal Items */}
            {proposal.items && proposal.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Proposal Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {proposal.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start py-3 border-b last:border-b-0">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {item.quantity}x {formatCurrency(item.price)}
                          </div>
                          <div className="text-sm font-bold">
                            {formatCurrency(item.quantity * item.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(proposal.totalValue)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            {contact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    {contact.company && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {contact.company}
                      </div>
                    )}
                  </div>
                  
                  {contact.email && (
                    <div className="text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  
                  {contact.phone && (
                    <div className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${contact.phone}`} className="hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock4 className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">{formatDateTime(proposal.createdAt)}</span>
                </div>
                
                {proposal.sentAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sent</span>
                    <span className="text-sm">{formatDateTime(proposal.sentAt)}</span>
                  </div>
                )}
                
                {proposal.viewedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">First Viewed</span>
                    <span className="text-sm">{formatDateTime(proposal.viewedAt)}</span>
                  </div>
                )}
                
                {proposal.respondedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Responded</span>
                    <span className="text-sm">{formatDateTime(proposal.respondedAt)}</span>
                  </div>
                )}
                
                {proposal.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {isExpired ? "Expired" : "Expires"}
                    </span>
                    <span className={`text-sm ${isExpired ? "text-red-600 font-medium" : ""}`}>
                      {formatDateTime(proposal.expiresAt)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <div>
          <ProposalPreview proposalId={proposal._id} />
        </div>
      )}

      {activeTab === "comments" && (
        <div>
          <ProposalComments proposalId={proposal._id} />
        </div>
      )}
    </div>
  );
}