"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Eye, Copy, Archive, Clock } from "lucide-react";
import { TemplateEditor } from "./TemplateEditor";
import { TemplatePreview } from "./TemplatePreview";
import type { Id } from "../../../../convex/_generated/dataModel";

type EventType = "WEDDING" | "CORPORATE" | "BIRTHDAY" | "ANNIVERSARY" | "CONFERENCE" | "GALA" | "OTHER";

interface TemplateLibraryProps {
  onTemplateSelect?: (templateId: Id<"proposalTemplates">) => void;
  selectionMode?: boolean;
}

export function TemplateLibrary({ onTemplateSelect, selectionMode = false }: TemplateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | "ALL">("ALL");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Id<"proposalTemplates"> | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Query templates with filters
  const templates = useQuery(api.proposalTemplates.getAllTemplates, {
    eventType: eventTypeFilter !== "ALL" ? eventTypeFilter : undefined,
    isActive: showInactive ? undefined : true,
  });

  const deleteTemplate = useMutation(api.proposalTemplates.deleteTemplate);
  const createTemplateVersion = useMutation(api.proposalTemplates.createTemplateVersion);

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDeleteTemplate = async (templateId: Id<"proposalTemplates">) => {
    if (confirm("Are you sure you want to archive this template?")) {
      try {
        await deleteTemplate({ templateId });
      } catch (error) {
        console.error("Failed to archive template:", error);
      }
    }
  };

  const handleDuplicateTemplate = async (template: any) => {
    try {
      await createTemplateVersion({
        templateId: template._id,
        name: `${template.name} (Copy)`,
        content: template.content,
      });
    } catch (error) {
      console.error("Failed to duplicate template:", error);
    }
  };

  const eventTypeColors = {
    WEDDING: "bg-pink-100 text-pink-800",
    CORPORATE: "bg-blue-100 text-blue-800",
    BIRTHDAY: "bg-yellow-100 text-yellow-800",
    ANNIVERSARY: "bg-purple-100 text-purple-800",
    CONFERENCE: "bg-green-100 text-green-800",
    GALA: "bg-red-100 text-red-800",
    OTHER: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
          <p className="text-gray-600">Manage and organize your proposal templates</p>
        </div>
        {!selectionMode && (
          <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedTemplate(null)}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>
                  {selectedTemplate ? "Edit Template" : "Create New Template"}
                </DialogTitle>
                <DialogDescription>
                  Create a reusable proposal template with dynamic fields
                </DialogDescription>
              </DialogHeader>
              <TemplateEditor
                templateId={selectedTemplate}
                onSave={() => {
                  setEditorOpen(false);
                  setSelectedTemplate(null);
                }}
                onCancel={() => {
                  setEditorOpen(false);
                  setSelectedTemplate(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={eventTypeFilter} onValueChange={(value) => setEventTypeFilter(value as EventType | "ALL")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Event Types</SelectItem>
            <SelectItem value="WEDDING">Wedding</SelectItem>
            <SelectItem value="CORPORATE">Corporate</SelectItem>
            <SelectItem value="BIRTHDAY">Birthday</SelectItem>
            <SelectItem value="ANNIVERSARY">Anniversary</SelectItem>
            <SelectItem value="CONFERENCE">Conference</SelectItem>
            <SelectItem value="GALA">Gala</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
        {!selectionMode && (
          <Button
            variant="outline"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? "Hide Archived" : "Show Archived"}
          </Button>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold truncate">
                  {template.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    v{template.version}
                  </Badge>
                  {!template.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Archived
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {template.eventTypes.map((eventType) => (
                  <Badge
                    key={eventType}
                    variant="secondary"
                    className={`text-xs ${eventTypeColors[eventType as EventType]}`}
                  >
                    {eventType.toLowerCase()}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock className="h-4 w-4 mr-1" />
                Updated {new Date(template.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                {selectionMode && onTemplateSelect ? (
                  <Button
                    onClick={() => onTemplateSelect(template._id)}
                    className="w-full"
                  >
                    Select
                  </Button>
                ) : (
                  <>
                    <Dialog open={previewOpen && selectedTemplate === template._id} onOpenChange={setPreviewOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTemplate(template._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle>Template Preview: {template.name}</DialogTitle>
                        </DialogHeader>
                        <TemplatePreview
                          template={template}
                          onClose={() => {
                            setPreviewOpen(false);
                            setSelectedTemplate(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template._id);
                        setEditorOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    {template.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template._id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {templates?.length === 0
              ? "No templates found. Create your first template to get started."
              : "No templates match your search criteria."}
          </div>
        </div>
      )}
    </div>
  );
}