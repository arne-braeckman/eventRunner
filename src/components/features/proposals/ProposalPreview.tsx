"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Send, 
  Calendar, 
  Users, 
  MapPin,
  Phone,
  Mail,
  Building
} from "lucide-react";
import { PdfGenerator, type ProposalPdfData } from "@/lib/utils/pdfGenerator";
import type { OpportunityWithContact } from "@/lib/types/opportunity";

interface ProposalPreviewProps {
  proposal: any;
  opportunity: OpportunityWithContact;
  template: any;
  onSendEmail?: () => void;
  onDownloadPdf?: () => void;
  isClientView?: boolean;
}

export function ProposalPreview({
  proposal,
  opportunity,
  template,
  onSendEmail,
  onDownloadPdf,
  isClientView = false
}: ProposalPreviewProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (onDownloadPdf) {
      onDownloadPdf();
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const pdfData: ProposalPdfData = {
        templateContent: template.content,
        opportunityData: opportunity,
        companyInfo: {
          name: "EventRunner",
          email: "info@eventrunner.com",
          phone: "+1 (555) 123-4567",
          address: "123 Event Street, City, State 12345"
        }
      };

      const pdfBlob = await PdfGenerator.generateProposalPdf(pdfData, {
        filename: `${opportunity.name}-proposal.pdf`,
        title: proposal.title,
      });

      PdfGenerator.downloadBlob(pdfBlob, `${opportunity.name}-proposal.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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

  const processTemplateContent = (content: string) => {
    const replacements: Record<string, string> = {
      '{{opportunity.name}}': opportunity.name || '',
      '{{opportunity.eventType}}': opportunity.eventType || '',
      '{{opportunity.guestCount}}': opportunity.guestCount?.toString() || '',
      '{{opportunity.value}}': formatCurrency(opportunity.value || 0),
      '{{opportunity.eventDate}}': opportunity.eventDate ? formatDate(opportunity.eventDate) : '',
      '{{contact.name}}': opportunity.contact?.name || '',
      '{{contact.company}}': opportunity.contact?.company || '',
      '{{contact.email}}': opportunity.contact?.email || '',
      '{{venue.room}}': opportunity.roomAssignment || '',
      '{{venue.requirements}}': opportunity.venueRequirements || '',
    };

    let processedContent = content;
    Object.entries(replacements).forEach(([placeholder, value]) => {
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });

    return processedContent;
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      {!isClientView && (
        <div className="flex gap-3 justify-end">
          {onSendEmail && (
            <Button onClick={onSendEmail} variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send to Client
            </Button>
          )}
          <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPdf ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      )}

      {/* Proposal Content */}
      <div ref={previewRef} className="bg-white rounded-lg">
        {/* Header */}
        <div className="text-center py-8 border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EventRunner</h1>
          <p className="text-gray-600">Professional Event Services</p>
        </div>

        {/* Proposal Title */}
        <div className="px-8 py-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {proposal.title || "Event Proposal"}
          </h2>
          <p className="text-gray-600">
            Prepared for {opportunity.contact.name}
            {opportunity.contact.company && ` - ${opportunity.contact.company}`}
          </p>
          {proposal.expiresAt && (
            <Badge variant="outline" className="mt-2">
              Valid until {formatDate(proposal.expiresAt)}
            </Badge>
          )}
        </div>

        <Separator />

        {/* Event Details */}
        <div className="px-8 py-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Event Date</p>
                  <p className="text-gray-600">
                    {opportunity.eventDate ? formatDate(opportunity.eventDate) : 'To be determined'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Guest Count</p>
                  <p className="text-gray-600">{opportunity.guestCount || 'To be determined'} guests</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Venue</p>
                  <p className="text-gray-600">{opportunity.roomAssignment || 'To be determined'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <Building className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Event Type</p>
                  <p className="text-gray-600">{opportunity.eventType}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Contact Email</p>
                  <p className="text-gray-600">{opportunity.contact.email}</p>
                </div>
              </div>
              {opportunity.requiresCatering && (
                <div className="flex items-start">
                  <div className="h-5 w-5 text-gray-400 mr-3 mt-0.5">🍽️</div>
                  <div>
                    <p className="font-medium text-gray-900">Catering</p>
                    <p className="text-gray-600">Full catering service included</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {opportunity.venueRequirements && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 mb-2">Special Requirements</p>
              <p className="text-gray-600">{opportunity.venueRequirements}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Template Content */}
        <div className="px-8 py-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Proposal Details</h3>
          {template.content?.sections?.map((section: any, index: number) => (
            <div key={index} className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {section.title}
              </h4>
              <div className="text-gray-600 whitespace-pre-wrap">
                {processTemplateContent(section.content || '')}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Investment Section */}
        <div className="px-8 py-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Investment</h3>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Total Investment</p>
                <p className="text-4xl font-bold text-green-700">
                  {formatCurrency(opportunity.value || 0)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  All-inclusive event package
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 text-center text-sm text-gray-600">
          <p>This proposal is valid for 30 days from the date of generation.</p>
          <p className="mt-2">Thank you for considering EventRunner for your special event.</p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="font-medium">EventRunner</p>
            <p>123 Event Street, City, State 12345</p>
            <p>📞 +1 (555) 123-4567 | 📧 info@eventrunner.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}