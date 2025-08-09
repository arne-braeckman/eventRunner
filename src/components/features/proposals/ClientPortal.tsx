"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle,
  Calendar,
  Users,
  MapPin,
  Building,
  Mail,
  MessageCircle,
  AlertCircle,
  Clock,
  Shield,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Edit
} from "lucide-react";
import { ProposalComments } from "./ProposalComments";
import { PdfGenerator, type ProposalPdfData } from "@/lib/utils/pdfGenerator";
import { cn } from "@/lib/utils";

interface ClientPortalProps {
  proposal: any;
  token: string;
}

export function ClientPortal({ proposal, token }: ClientPortalProps) {
  const [acceptanceDialogOpen, setAcceptanceDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Mutations
  const updateProposalStatus = useMutation(api.proposals.updateProposalStatus);
  const addComment = useMutation(api.proposals.addProposalComment);

  const isExpired = proposal.expiresAt && proposal.expiresAt < Date.now();
  const isFinalized = ["ACCEPTED", "REJECTED", "EXPIRED"].includes(proposal.status);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const pdfData: ProposalPdfData = {
        templateContent: proposal.template?.content || { sections: [] },
        opportunityData: {
          ...proposal.opportunity,
          contact: {
            name: clientName || "Client",
            email: clientEmail || "",
            company: clientCompany || ""
          },
          value: proposal.opportunity?.value || 0
        },
        companyInfo: {
          name: "EventRunner",
          email: "info@eventrunner.com",
          phone: "+1 (555) 123-4567",
          address: "123 Event Street, City, State 12345"
        }
      };

      const pdfBlob = await PdfGenerator.generateProposalPdf(pdfData, {
        filename: `${proposal.title}-proposal.pdf`,
        title: proposal.title,
      });

      PdfGenerator.downloadBlob(pdfBlob, `${proposal.title}-proposal.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleAcceptProposal = async () => {
    if (!clientName || !clientEmail) {
      alert("Please provide your name and email");
      return;
    }

    setIsSubmitting(true);
    try {
      // Update proposal status
      await updateProposalStatus({
        proposalId: proposal._id,
        status: "ACCEPTED",
        metadata: {
          clientName,
          clientEmail,
          clientCompany,
          acceptedAt: Date.now()
        }
      });

      // Add acceptance comment if feedback provided
      if (feedbackMessage) {
        await addComment({
          proposalId: proposal._id,
          content: `Proposal accepted! ${feedbackMessage}`,
          isInternal: false,
          authorName: clientName,
          authorEmail: clientEmail,
        });
      }

      setAcceptanceDialogOpen(false);
      // Reload to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Failed to accept proposal:", error);
      alert("Failed to accept proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectProposal = async () => {
    if (!clientName || !clientEmail) {
      alert("Please provide your name and email");
      return;
    }

    setIsSubmitting(true);
    try {
      // Update proposal status
      await updateProposalStatus({
        proposalId: proposal._id,
        status: "REJECTED",
        metadata: {
          clientName,
          clientEmail,
          clientCompany,
          rejectedAt: Date.now(),
          reason: feedbackMessage
        }
      });

      // Add rejection comment if feedback provided
      if (feedbackMessage) {
        await addComment({
          proposalId: proposal._id,
          content: `Proposal declined. Reason: ${feedbackMessage}`,
          isInternal: false,
          authorName: clientName,
          authorEmail: clientEmail,
        });
      }

      setRejectionDialogOpen(false);
      // Reload to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Failed to reject proposal:", error);
      alert("Failed to decline proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const processTemplateContent = (content: string) => {
    if (!content) return "";
    
    const opportunity = proposal.opportunity || {};
    const replacements: Record<string, string> = {
      '{{opportunity.name}}': opportunity.name || '',
      '{{opportunity.eventType}}': opportunity.eventType || '',
      '{{opportunity.guestCount}}': opportunity.guestCount?.toString() || '',
      '{{opportunity.value}}': opportunity.value ? formatCurrency(opportunity.value) : '',
      '{{opportunity.eventDate}}': opportunity.eventDate ? formatDate(opportunity.eventDate) : '',
      '{{contact.name}}': clientName || '',
      '{{contact.company}}': clientCompany || '',
      '{{contact.email}}': clientEmail || '',
    };

    let processedContent = content;
    Object.entries(replacements).forEach(([placeholder, value]) => {
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });

    return processedContent;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EventRunner</h1>
              <p className="text-gray-600">Professional Event Services</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Secure Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Banner */}
        {proposal.status === "ACCEPTED" && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Proposal Accepted</p>
                  <p className="text-sm text-green-700">
                    Thank you for accepting our proposal. We'll be in touch soon to finalize the details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {proposal.status === "REJECTED" && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Proposal Declined</p>
                  <p className="text-sm text-red-700">
                    Thank you for considering our services. We hope to work with you in the future.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isExpired && proposal.status !== "ACCEPTED" && proposal.status !== "REJECTED" && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">Proposal Expired</p>
                  <p className="text-sm text-orange-700">
                    This proposal has expired. Please contact us if you'd like to receive an updated proposal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Proposal Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proposal Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                    <p className="text-gray-600 mt-2">
                      Prepared on {formatDate(proposal.createdAt)}
                    </p>
                  </div>
                  <Badge variant={isExpired ? "destructive" : "outline"}>
                    {isExpired ? "Expired" : `Valid until ${formatDate(proposal.expiresAt)}`}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Event Date</p>
                        <p className="text-gray-600">
                          {proposal.opportunity?.eventDate 
                            ? formatDate(proposal.opportunity.eventDate) 
                            : 'To be determined'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Guest Count</p>
                        <p className="text-gray-600">
                          {proposal.opportunity?.guestCount || 'To be determined'} guests
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Building className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Event Type</p>
                        <p className="text-gray-600">{proposal.opportunity?.eventType || 'Event'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Venue</p>
                        <p className="text-gray-600">EventRunner Event Center</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proposal Content */}
            <Card>
              <CardHeader>
                <CardTitle>Proposal Details</CardTitle>
              </CardHeader>
              <CardContent>
                {proposal.content?.sections?.map((section: any, index: number) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-wrap text-gray-700">
                        {processTemplateContent(section.content || '')}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-600">No additional details available.</p>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <ProposalComments
              proposalId={proposal._id}
              comments={proposal.comments || []}
              isClientView={true}
              clientName={clientName}
              clientEmail={clientEmail}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">Total Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-700">
                    {formatCurrency(proposal.opportunity?.value || 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">All-inclusive package</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadingPdf ? "Generating..." : "Download PDF"}
                </Button>

                {!isFinalized && !isExpired && (
                  <>
                    <Separator />
                    
                    <Dialog open={acceptanceDialogOpen} onOpenChange={setAcceptanceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Accept Proposal
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Accept Proposal</DialogTitle>
                          <DialogDescription>
                            Please provide your information to accept this proposal.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Your Name *</Label>
                            <Input
                              id="name"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={clientEmail}
                              onChange={(e) => setClientEmail(e.target.value)}
                              placeholder="john@example.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="company">Company (Optional)</Label>
                            <Input
                              id="company"
                              value={clientCompany}
                              onChange={(e) => setClientCompany(e.target.value)}
                              placeholder="Company Name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="feedback">Additional Comments (Optional)</Label>
                            <Textarea
                              id="feedback"
                              value={feedbackMessage}
                              onChange={(e) => setFeedbackMessage(e.target.value)}
                              placeholder="Any additional comments or special requests..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={handleAcceptProposal}
                              disabled={isSubmitting || !clientName || !clientEmail}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {isSubmitting ? "Accepting..." : "Confirm Acceptance"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setAcceptanceDialogOpen(false)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Decline Proposal
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Decline Proposal</DialogTitle>
                          <DialogDescription>
                            We'd appreciate your feedback on why this proposal doesn't meet your needs.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="reject-name">Your Name *</Label>
                            <Input
                              id="reject-name"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="reject-email">Email Address *</Label>
                            <Input
                              id="reject-email"
                              type="email"
                              value={clientEmail}
                              onChange={(e) => setClientEmail(e.target.value)}
                              placeholder="john@example.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="reject-company">Company (Optional)</Label>
                            <Input
                              id="reject-company"
                              value={clientCompany}
                              onChange={(e) => setClientCompany(e.target.value)}
                              placeholder="Company Name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reject-feedback">Reason for Declining (Optional)</Label>
                            <Textarea
                              id="reject-feedback"
                              value={feedbackMessage}
                              onChange={(e) => setFeedbackMessage(e.target.value)}
                              placeholder="Please let us know why this proposal doesn't meet your needs..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="destructive"
                              onClick={handleRejectProposal}
                              disabled={isSubmitting || !clientName || !clientEmail}
                              className="flex-1"
                            >
                              {isSubmitting ? "Declining..." : "Confirm Decline"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setRejectionDialogOpen(false)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Our team is here to help you plan the perfect event.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>info@eventrunner.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Secure Portal</p>
                    <p className="text-xs text-blue-700 mt-1">
                      This is a secure, private link for reviewing your proposal. 
                      Do not share this link with others.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">EventRunner</h2>
            <p className="text-gray-400 text-sm">Professional Event Services Since 2020</p>
            <div className="mt-4 text-xs text-gray-500">
              © {new Date().getFullYear()} EventRunner. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}