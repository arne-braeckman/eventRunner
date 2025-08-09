"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Save, 
  X, 
  Plus, 
  Minus, 
  Eye, 
  Code, 
  Type, 
  Hash,
  Calendar,
  DollarSign,
  Users,
  MapPin
} from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

type EventType = "WEDDING" | "CORPORATE" | "BIRTHDAY" | "ANNIVERSARY" | "CONFERENCE" | "GALA" | "OTHER";

interface TemplateEditorProps {
  templateId?: Id<"proposalTemplates"> | null;
  onSave: () => void;
  onCancel: () => void;
}

interface DynamicField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "date" | "currency";
  placeholder?: string;
  required: boolean;
}

interface TemplateSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface TemplateContent {
  sections: TemplateSection[];
  dynamicFields: DynamicField[];
  styles: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

const PREDEFINED_FIELDS: DynamicField[] = [
  { id: "client_name", name: "client_name", label: "Client Name", type: "text", required: true },
  { id: "event_name", name: "event_name", label: "Event Name", type: "text", required: true },
  { id: "event_date", name: "event_date", label: "Event Date", type: "date", required: true },
  { id: "guest_count", name: "guest_count", label: "Guest Count", type: "number", required: true },
  { id: "event_value", name: "event_value", label: "Event Value", type: "currency", required: true },
  { id: "venue_name", name: "venue_name", label: "Venue", type: "text", required: false },
  { id: "event_type", name: "event_type", label: "Event Type", type: "text", required: true },
  { id: "company_name", name: "company_name", label: "Company Name", type: "text", required: false },
  { id: "contact_email", name: "contact_email", label: "Contact Email", type: "text", required: false },
  { id: "contact_phone", name: "contact_phone", label: "Contact Phone", type: "text", required: false },
];

export function TemplateEditor({ templateId, onSave, onCancel }: TemplateEditorProps) {
  const [templateName, setTemplateName] = useState("");
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);
  const [content, setContent] = useState<TemplateContent>({
    sections: [
      { id: "intro", title: "Introduction", content: "", order: 1 },
      { id: "details", title: "Event Details", content: "", order: 2 },
      { id: "pricing", title: "Pricing", content: "", order: 3 },
      { id: "terms", title: "Terms & Conditions", content: "", order: 4 },
    ],
    dynamicFields: [],
    styles: {
      primaryColor: "#3B82F6",
      secondaryColor: "#64748B",
      fontFamily: "Inter",
    },
  });
  const [activeTab, setActiveTab] = useState("editor");

  // Load existing template if editing
  const existingTemplate = useQuery(
    api.proposalTemplates.getTemplateById,
    templateId ? { templateId } : "skip"
  );

  const createTemplate = useMutation(api.proposalTemplates.createTemplate);
  const updateTemplate = useMutation(api.proposalTemplates.updateTemplate);

  useEffect(() => {
    if (existingTemplate) {
      setTemplateName(existingTemplate.name);
      setSelectedEventTypes(existingTemplate.eventTypes as EventType[]);
      setContent(existingTemplate.content as TemplateContent);
    }
  }, [existingTemplate]);

  const handleSave = async () => {
    if (!templateName.trim() || selectedEventTypes.length === 0) {
      alert("Please provide a template name and select at least one event type.");
      return;
    }

    try {
      if (templateId) {
        await updateTemplate({
          templateId,
          name: templateName,
          eventTypes: selectedEventTypes,
          content: content as any,
        });
      } else {
        await createTemplate({
          name: templateName,
          eventTypes: selectedEventTypes,
          content: content as any,
        });
      }
      onSave();
    } catch (error) {
      console.error("Failed to save template:", error);
      alert("Failed to save template. Please try again.");
    }
  };

  const addSection = () => {
    const newSection: TemplateSection = {
      id: `section_${Date.now()}`,
      title: "New Section",
      content: "",
      order: content.sections.length + 1,
    };
    setContent(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const updateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    }));
  };

  const removeSection = (sectionId: string) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId),
    }));
  };

  const addDynamicField = (field: DynamicField) => {
    if (!content.dynamicFields.some(f => f.id === field.id)) {
      setContent(prev => ({
        ...prev,
        dynamicFields: [...prev.dynamicFields, field],
      }));
    }
  };

  const removeDynamicField = (fieldId: string) => {
    setContent(prev => ({
      ...prev,
      dynamicFields: prev.dynamicFields.filter(field => field.id !== fieldId),
    }));
  };

  const insertFieldReference = (sectionId: string, fieldName: string) => {
    const fieldRef = `{{${fieldName}}}`;
    updateSection(sectionId, {
      content: content.sections.find(s => s.id === sectionId)?.content + fieldRef || fieldRef,
    });
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "text": return Type;
      case "number": return Hash;
      case "date": return Calendar;
      case "currency": return DollarSign;
      default: return Type;
    }
  };

  return (
    <div className="h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name..."
            />
          </div>
          <div>
            <Label>Event Types</Label>
            <Select
              onValueChange={(value) => {
                if (value && !selectedEventTypes.includes(value as EventType)) {
                  setSelectedEventTypes(prev => [...prev, value as EventType]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add event types..." />
              </SelectTrigger>
              <SelectContent>
                {["WEDDING", "CORPORATE", "BIRTHDAY", "ANNIVERSARY", "CONFERENCE", "GALA", "OTHER"]
                  .filter(type => !selectedEventTypes.includes(type as EventType))
                  .map(type => (
                    <SelectItem key={type} value={type}>
                      {type.toLowerCase()}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedEventTypes.map(type => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setSelectedEventTypes(prev => prev.filter(t => t !== type))}
                >
                  {type.toLowerCase()}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="flex-shrink-0 grid w-full grid-cols-3">
            <TabsTrigger value="editor">
              <Code className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="fields">
              <Hash className="h-4 w-4 mr-2" />
              Dynamic Fields
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="editor" className="h-full p-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {content.sections.map((section) => (
                    <Card key={section.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <Input
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            className="font-semibold text-lg border-none p-0 h-auto"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(section.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={section.content}
                          onChange={(e) => updateSection(section.id, { content: e.target.value })}
                          placeholder="Enter section content... Use {{field_name}} for dynamic fields."
                          className="min-h-32 resize-y"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {content.dynamicFields.map((field) => (
                            <Button
                              key={field.id}
                              variant="outline"
                              size="sm"
                              onClick={() => insertFieldReference(section.id, field.name)}
                            >
                              {field.label}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button onClick={addSection} variant="dashed" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="fields" className="h-full p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Available Fields</h3>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {PREDEFINED_FIELDS.map((field) => {
                        const Icon = getFieldIcon(field.type);
                        const isAdded = content.dynamicFields.some(f => f.id === field.id);
                        return (
                          <Card
                            key={field.id}
                            className={`cursor-pointer transition-colors ${
                              isAdded ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                            }`}
                            onClick={() => addDynamicField(field)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <div className="font-medium">{field.label}</div>
                                    <div className="text-sm text-gray-500">
                                      {field.type} {field.required && "• Required"}
                                    </div>
                                  </div>
                                </div>
                                {isAdded && (
                                  <Badge variant="secondary" className="text-xs">
                                    Added
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Template Fields</h3>
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {content.dynamicFields.map((field) => {
                        const Icon = getFieldIcon(field.type);
                        return (
                          <Card key={field.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <div className="font-medium">{field.label}</div>
                                    <div className="text-sm text-gray-500">
                                      {`{{${field.name}}}`}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDynamicField(field.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="h-full p-4">
              <ScrollArea className="h-full">
                <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-6">
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {templateName || "Template Preview"}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      {selectedEventTypes.map(type => (
                        <Badge key={type} variant="outline">
                          {type.toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {content.sections.map((section) => (
                    <div key={section.id} className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        {section.title}
                      </h2>
                      <div className="text-gray-600 whitespace-pre-wrap">
                        {section.content.replace(/\{\{(\w+)\}\}/g, (match, fieldName) => {
                          const field = content.dynamicFields.find(f => f.name === fieldName);
                          return field ? `[${field.label}]` : match;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>
    </div>
  );
}