"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { KanbanBoard } from "./KanbanBoard";
import { OpportunityFilters } from "./OpportunityFilters";
import { OpportunityForm } from "./OpportunityForm";
import { BulkOperations } from "./BulkOperations";
import { useToast } from "@/hooks/useToast";
import type { OpportunityStage, Opportunity, EventType } from "~/lib/types/opportunity";
import type { Id } from "../../../../convex/_generated/dataModel";

interface OpportunityFilterState {
  stage?: OpportunityStage;
  eventType?: EventType;
  searchTerm?: string;
}

export function OpportunityPipeline() {
  const [filters, setFilters] = useState<OpportunityFilterState>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [selectedOpportunities, setSelectedOpportunities] = useState<Opportunity[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { toast } = useToast();
  
  const opportunities = useQuery(api.opportunities.getAllOpportunities, filters);
  const deleteOpportunity = useMutation(api.opportunities.deleteOpportunity);

  const handleFilterChange = useCallback((newFilters: OpportunityFilterState) => {
    setFilters(newFilters);
  }, []);

  const handleEditOpportunity = useCallback((opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
  }, []);

  const handleDeleteOpportunity = useCallback(async (opportunityId: string) => {
    try {
      await deleteOpportunity({ opportunityId: opportunityId as Id<"opportunities"> });
      toast({
        type: 'success',
        title: 'Opportunity Deleted',
        description: 'The opportunity has been deleted successfully.'
      });
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      toast({
        type: 'error',
        title: 'Delete Failed',
        description: 'Failed to delete opportunity. Please try again.'
      });
    }
  }, [deleteOpportunity, toast]);

  const handleCloseForm = useCallback(() => {
    setShowCreateForm(false);
    setEditingOpportunity(null);
  }, []);

  const handleToggleSelection = useCallback((opportunity: Opportunity) => {
    setSelectedOpportunities(prev => {
      const isSelected = prev.some(opp => opp._id === opportunity._id);
      if (isSelected) {
        return prev.filter(opp => opp._id !== opportunity._id);
      } else {
        return [...prev, opportunity];
      }
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedOpportunities([]);
    setIsSelectionMode(false);
  }, []);

  const handleBulkComplete = useCallback(() => {
    setSelectedOpportunities([]);
    setIsSelectionMode(false);
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode);
    if (!isSelectionMode) {
      setSelectedOpportunities([]);
    }
  }, [isSelectionMode]);

  // Memoize total value calculation only when opportunities exist
  const totalValue = useMemo(() => {
    if (!opportunities) return '0';
    return opportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString();
  }, [opportunities]);

  if (opportunities === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Pipeline Overview
          </h2>
          <p className="text-sm text-gray-600">
            {opportunities.length} opportunities • Total value: €{totalValue}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSelectionMode}
            className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSelectionMode 
                ? 'border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-100' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            {isSelectionMode ? 'Exit Selection' : 'Select Multiple'}
          </button>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Opportunity
          </button>
        </div>
      </div>

      <OpportunityFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
      />
      
      <KanbanBoard 
        opportunities={opportunities || []} 
        onEditOpportunity={handleEditOpportunity}
        onDeleteOpportunity={handleDeleteOpportunity}
        selectedOpportunities={selectedOpportunities}
        onToggleSelection={handleToggleSelection}
        isSelectionMode={isSelectionMode}
      />

      <OpportunityForm
        isOpen={showCreateForm || !!editingOpportunity}
        onClose={handleCloseForm}
        initialData={editingOpportunity ? {
          name: editingOpportunity.name,
          contactId: editingOpportunity.contactId,
          stage: editingOpportunity.stage,
          value: editingOpportunity.value,
          eventType: editingOpportunity.eventType,
          eventDate: new Date(editingOpportunity.eventDate).toISOString().split('T')[0],
          guestCount: editingOpportunity.guestCount,
          requiresCatering: editingOpportunity.requiresCatering,
          venueRequirements: editingOpportunity.venueRequirements,
          description: editingOpportunity.description,
          expectedCloseDate: editingOpportunity.expectedCloseDate 
            ? new Date(editingOpportunity.expectedCloseDate).toISOString().split('T')[0] 
            : undefined,
        } : undefined}
        opportunityId={editingOpportunity?._id}
      />

      <BulkOperations
        selectedOpportunities={selectedOpportunities}
        onClearSelection={handleClearSelection}
        onBulkComplete={handleBulkComplete}
      />
    </div>
  );
}