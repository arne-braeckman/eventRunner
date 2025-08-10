"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { Check, X, Trash2, UserPlus, ArrowRight } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/hooks/useToast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { Opportunity, OpportunityStage } from "~/lib/types/opportunity";

interface BulkOperationsProps {
  selectedOpportunities: Opportunity[];
  onClearSelection: () => void;
  onBulkComplete: () => void;
}

const STAGE_OPTIONS: { value: OpportunityStage; label: string }[] = [
  { value: "PROSPECT", label: "Prospect" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CLOSED_WON", label: "Closed Won" },
  { value: "CLOSED_LOST", label: "Closed Lost" },
];

export function BulkOperations({ 
  selectedOpportunities, 
  onClearSelection, 
  onBulkComplete 
}: BulkOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [operation, setOperation] = useState<"stage" | "delete" | "assign" | null>(null);
  const [targetStage, setTargetStage] = useState<OpportunityStage>("QUALIFIED");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  
  const updateOpportunityStage = useMutation(api.opportunities.updateOpportunityStage);
  const deleteOpportunity = useMutation(api.opportunities.deleteOpportunity);

  const handleBulkStageUpdate = async () => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedOpportunities.map(opp => 
          updateOpportunityStage({
            opportunityId: opp._id,
            stage: targetStage,
          })
        )
      );
      
      toast({
        type: 'success',
        title: 'Bulk Update Complete',
        description: `Successfully updated ${selectedOpportunities.length} opportunities to ${STAGE_OPTIONS.find(s => s.value === targetStage)?.label}.`
      });
      
      onBulkComplete();
    } catch (error) {
      console.error("Error updating opportunities:", error);
      toast({
        type: 'error',
        title: 'Update Failed',
        description: 'Failed to update some opportunities. Please try again.'
      });
    } finally {
      setIsProcessing(false);
      setOperation(null);
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedOpportunities.map(opp => 
          deleteOpportunity({ opportunityId: opp._id })
        )
      );
      
      toast({
        type: 'success',
        title: 'Bulk Delete Complete',
        description: `Successfully deleted ${selectedOpportunities.length} opportunities.`
      });
      
      onBulkComplete();
    } catch (error) {
      console.error("Error deleting opportunities:", error);
      toast({
        type: 'error',
        title: 'Delete Failed',
        description: 'Failed to delete some opportunities. Please try again.'
      });
    } finally {
      setIsProcessing(false);
      setOperation(null);
      setShowDeleteConfirm(false);
    }
  };

  const totalValue = useMemo(() => 
    selectedOpportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString(),
    [selectedOpportunities]
  );

  if (selectedOpportunities.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">
                {selectedOpportunities.length} opportunities selected
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              Total value: €{totalValue}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {operation === null && (
              <>
                <button
                  onClick={() => setOperation("stage")}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Move to Stage
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </>
            )}

            {operation === "stage" && (
              <div className="flex items-center space-x-2">
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value as OpportunityStage)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {STAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleBulkStageUpdate}
                  disabled={isProcessing}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Update"}
                </button>
                
                <button
                  onClick={() => setOperation(null)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
            
            <button
              onClick={onClearSelection}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Delete Opportunities"
        description={`Are you sure you want to delete ${selectedOpportunities.length} opportunities? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete All"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}