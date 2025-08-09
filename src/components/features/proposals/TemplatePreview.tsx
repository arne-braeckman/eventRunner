"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Eye, Download } from "lucide-react";

interface TemplatePreviewProps {
  template: {
    _id: string;
    name: string;
    eventTypes: string[];
    content: any;
    version: number;
    createdAt: number;
    updatedAt: number;
  };
  onClose: () => void;
  sampleData?: Record<string, any>;
}

interface SampleDataField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "currency";
  value: string | number;
}

const DEFAULT_SAMPLE_DATA: SampleDataField[] = [
  { name: "client_name", label: "Client Name", type: "text", value: "John & Sarah Smith" },
  { name: "event_name", label: "Event Name", type: "text", value: "Smith Wedding Celebration" },
  { name: "event_date", label: "Event Date", type: "date", value: "2024-06-15" },
  { name: "guest_count", label: "Guest Count", type: "number", value: 150 },
  { name: "event_value", label: "Event Value", type: "currency", value: 25000 },
  { name: "venue_name", label: "Venue", type: "text", value: "Grand Ballroom" },
  { name: "event_type", label: "Event Type", type: "text", value: "Wedding" },
  { name: "company_name", label: "Company Name", type: "text", value: "Smith Industries" },
  { name: "contact_email", label: "Contact Email", type: "text", value: "john@example.com" },
  { name: "contact_phone", label: "Contact Phone", type: "text", value: "(555) 123-4567" },
];

export function TemplatePreview({ template, onClose, sampleData }: TemplatePreviewProps) {
  const [customSampleData, setCustomSampleData] = useState<Record<string, any>>(
    sampleData || DEFAULT_SAMPLE_DATA.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.value,
    }), {})
  );
  const [activeTab, setActiveTab] = useState("preview");

  const content = template.content as {
    sections: Array<{ id: string; title: string; content: string; order: number }>;
    dynamicFields: Array<{ id: string; name: string; label: string; type: string; required: boolean }>;
    styles?: { primaryColor: string; secondaryColor: string; fontFamily: string };
  };

  const renderContent = (text: string) => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, fieldName) => {
      const value = customSampleData[fieldName];
      if (value !== undefined && value !== null) {
        // Format the value based on field type
        const field = content.dynamicFields?.find(f => f.name === fieldName);
        if (field?.type === "currency" && typeof value === "number") {
          return `$${value.toLocaleString()}`;
        }
        if (field?.type === "date" && value) {
          return new Date(value).toLocaleDateString();
        }
        return String(value);
      }
      return `[${fieldName}]`;
    });
  };

  const updateSampleData = (fieldName: string, value: any) => {
    setCustomSampleData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const formatFieldValue = (field: SampleDataField, value: any): string => {
    switch (field.type) {
      case "currency":
        return typeof value === "number" ? value.toString() : value;
      case "date":
        return value instanceof Date ? value.toISOString().split('T')[0] : value;
      default:
        return String(value);
    }
  };

  const exportAsPdf = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll just open a print dialog
    window.print();
  };

  return (
    <div className="h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{template.name}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>Version {template.version}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Updated {new Date(template.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {template.eventTypes.map(type => (
              <Badge key={type} variant="outline">
                {type.toLowerCase()}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="flex-shrink-0 grid w-full grid-cols-3">
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="sample-data">
              <FileText className="h-4 w-4 mr-2" />
              Sample Data
            </TabsTrigger>
            <TabsTrigger value="raw">
              <FileText className="h-4 w-4 mr-2" />
              Raw Template
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="preview" className="h-full p-4">
              <ScrollArea className="h-full">
                <div 
                  className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg p-8"
                  style={{
                    fontFamily: content.styles?.fontFamily || "Inter",
                    color: content.styles?.secondaryColor || "#64748B",
                  }}
                >
                  {/* Template Header */}
                  <div className="mb-8 text-center">
                    <h1 
                      className="text-3xl font-bold mb-4"
                      style={{ color: content.styles?.primaryColor || "#3B82F6" }}
                    >
                      {template.name}
                    </h1>
                    <div className="text-gray-500">
                      Generated on {new Date().toLocaleDateString()}
                    </div>
                  </div>

                  {/* Template Sections */}
                  {content.sections
                    ?.sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <div key={section.id} className="mb-8">
                        <h2 
                          className="text-2xl font-semibold mb-4 pb-2 border-b"
                          style={{ 
                            color: content.styles?.primaryColor || "#3B82F6",
                            borderColor: content.styles?.primaryColor || "#3B82F6",
                          }}
                        >
                          {section.title}
                        </h2>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {renderContent(section.content)}
                        </div>
                      </div>
                    ))}

                  {/* Footer */}
                  <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>This proposal is valid for 30 days from the date of issue.</p>
                    <p className="mt-2">Generated using {template.name} v{template.version}</p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sample-data" className="h-full p-4">
              <ScrollArea className="h-full">
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Sample Data</h3>
                    <p className="text-gray-600">
                      Modify the sample data below to see how the template renders with different values.
                    </p>
                  </div>

                  {DEFAULT_SAMPLE_DATA.map((field) => (
                    <Card key={field.name}>
                      <CardContent className="p-4">
                        <Label htmlFor={field.name}>{field.label}</Label>
                        <Input
                          id={field.name}
                          type={field.type === "currency" || field.type === "number" ? "number" : field.type}
                          value={formatFieldValue(field, customSampleData[field.name] || "")}
                          onChange={(e) => {
                            const value = field.type === "number" || field.type === "currency" 
                              ? parseFloat(e.target.value) || 0 
                              : e.target.value;
                            updateSampleData(field.name, value);
                          }}
                          className="mt-1"
                        />
                        <div className="text-sm text-gray-500 mt-1">
                          Template variable: <code>{`{{${field.name}}}`}</code>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="raw" className="h-full p-4">
              <ScrollArea className="h-full">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Raw Template Structure</h3>
                    <p className="text-gray-600">
                      This shows the raw template content with dynamic field placeholders.
                    </p>
                  </div>

                  {content.sections?.map((section) => (
                    <Card key={section.id} className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">
                          {section.content}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Dynamic Fields Reference */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Available Dynamic Fields</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {content.dynamicFields?.map((field) => (
                          <div key={field.id} className="text-sm">
                            <code className="bg-gray-100 px-2 py-1 rounded">{`{{${field.name}}}`}</code>
                            <span className="ml-2 text-gray-600">{field.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAsPdf}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
}