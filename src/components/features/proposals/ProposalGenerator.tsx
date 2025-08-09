"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  FileText, 
  Send, 
  Eye, 
  Download, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { TemplateLibrary } from "./TemplateLibrary";
import { TemplatePreview } from "./TemplatePreview";
import { PdfGenerator, type ProposalPdfData } from "@/lib/utils/pdfGenerator";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { OpportunityWithContact } from "@/lib/types/opportunity";

interface ProposalGeneratorProps {
  opportunity: OpportunityWithContact;
  onProposalCreated?: (proposalId: Id<"proposals">) => void;
}

interface ProposalForm {
  title: string;
  templateId: Id<"proposalTemplates"> | null;
  customMessage?: string;
  expiresInDays: number;
  sendToClient: boolean;
  clientEmail: string;
}

const DEFAULT_FORM: ProposalForm = {
  title: "",
  templateId: null,
  customMessage: "",
  expiresInDays: 30,
  sendToClient: true,
  clientEmail: "",
};

export function ProposalGenerator({ opportunity, onProposalCreated }: ProposalGeneratorProps) {
  const [form, setForm] = useState<ProposalForm>({
    ...DEFAULT_FORM,
    title: `Proposal for ${opportunity.name}`,
    clientEmail: opportunity.contact.email || "",
  });
  const [step, setStep] = useState<'template' | 'customize' | 'preview' | 'generate'>('template');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Get the selected template details
  const template = useQuery(
    api.proposalTemplates.getById,
    form.templateId ? { templateId: form.templateId } : "skip"
  );

  const createProposal = useMutation(api.proposals.createProposal);
  const sendProposalEmail = useMutation(api.proposals.sendProposalEmail);

  const handleTemplateSelect = (templateId: Id<"proposalTemplates">) => {
    setForm(prev => ({ ...prev, templateId }));
    setStep('customize');
  };

  const handleFormUpdate = (updates: Partial<ProposalForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const handleGenerateProposal = async () => {
    if (!form.templateId || !template) {
      return;
    }

    setIsGenerating(true);
    try {
      // Create proposal in database
      const proposalId = await createProposal({
        opportunityId: opportunity._id,
        templateId: form.templateId,
        title: form.title,
        customMessage: form.customMessage,
        expiresAt: Date.now() + (form.expiresInDays * 24 * 60 * 60 * 1000),
      });

      // Send email if requested
      if (form.sendToClient && form.clientEmail) {
        await sendProposalEmail({
          proposalId,
          clientEmail: form.clientEmail,
          customMessage: form.customMessage,
        });
      }

      onProposalCreated?.(proposalId);
      
      // Reset form
      setForm({
        ...DEFAULT_FORM,
        title: `Proposal for ${opportunity.name}`,
        clientEmail: opportunity.contact.email || "",
      });
      setStep('template');
      
    } catch (error) {
      console.error("Failed to generate proposal:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewProposal = () => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleDownloadPdf = async () => {
    if (!template) return;

    try {
      const pdfData: ProposalPdfData = {
        templateContent: template.content,
        opportunityData: opportunity,
        companyInfo: {
          name: "EventRunner", // This would come from company settings
          email: "info@eventrunner.com",
          phone: "+1 (555) 123-4567",
        }
      };

      const pdfBlob = await PdfGenerator.generateProposalPdf(pdfData, {
        filename: `${opportunity.name}-proposal.pdf`,
        title: form.title,
      });

      PdfGenerator.downloadBlob(pdfBlob, `${opportunity.name}-proposal.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'template':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
              <p className="text-gray-600">Select a proposal template to customize for this opportunity.</p>
            </div>
            <TemplateLibrary
              selectionMode={true}
              onTemplateSelect={handleTemplateSelect}
            />
          </div>
        );

      case 'customize':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Customize Proposal</h3>
                <p className="text-gray-600">Configure your proposal settings and content.</p>
              </div>
              <Button variant="outline" onClick={() => setStep('template')}>
                Change Template
              </Button>
            </div>

            {template && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Selected Template</CardTitle>
                      <p className="text-sm text-gray-600">{template.name}</p>
                    </div>
                    <div className="flex gap-2">
                      {template.eventTypes.map((eventType: string) => (
                        <Badge key={eventType} variant="secondary" className="text-xs">
                          {eventType.toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Proposal Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleFormUpdate({ title: e.target.value })}
                    placeholder="Enter proposal title"
                  />
                </div>

                <div>
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={form.clientEmail}
                    onChange={(e) => handleFormUpdate({ clientEmail: e.target.value })}
                    placeholder="client@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="expiresInDays">Expires In (Days)</Label>
                  <Select
                    value={form.expiresInDays.toString()}
                    onValueChange={(value) => handleFormUpdate({ expiresInDays: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                  <Textarea
                    id="customMessage"
                    value={form.customMessage}
                    onChange={(e) => handleFormUpdate({ customMessage: e.target.value })}
                    placeholder="Add a personal message to the client..."
                    rows={5}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendToClient"
                    checked={form.sendToClient}
                    onChange={(e) => handleFormUpdate({ sendToClient: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="sendToClient">Send email to client immediately</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handlePreviewProposal} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleDownloadPdf} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                onClick={handleGenerateProposal}
                disabled={isGenerating || !form.title.trim()}
                className="ml-auto"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate Proposal"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Generate Proposal</h2>
        <p className="text-gray-600">Create a professional proposal for {opportunity.name}</p>
      </div>

      {/* Opportunity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Opportunity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Client</Label>
              <p className="font-medium">{opportunity.contact.name}</p>
              <p className="text-sm text-gray-600">{opportunity.contact.company}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Event</Label>
              <p className="font-medium">{opportunity.eventType} Event</p>
              <p className="text-sm text-gray-600">
                {opportunity.eventDate ? new Date(opportunity.eventDate).toLocaleDateString() : 'Date TBD'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Value</Label>
              <p className="font-medium text-green-600">€{opportunity.value.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{opportunity.guestCount} guests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Progress */}
      <div className="flex items-center space-x-4 py-4">
        <div className={`flex items-center ${step === 'template' ? 'text-blue-600' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'template' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <span className="ml-2 font-medium">Select Template</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        <div className={`flex items-center ${step === 'customize' ? 'text-blue-600' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'customize' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <span className="ml-2 font-medium">Customize</span>
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Proposal Preview</DialogTitle>
            <DialogDescription>
              Preview how your proposal will appear to the client
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <TemplatePreview
              template={selectedTemplate}
              sampleData={opportunity}
              onClose={() => setPreviewOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}