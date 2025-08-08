"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Check, X, Trash2, UserPlus, ArrowRight } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
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
      onBulkComplete();
    } catch (error) {
      console.error("Error updating opportunities:", error);
    } finally {
      setIsProcessing(false);
      setOperation(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedOpportunities.length} opportunities?`)) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedOpportunities.map(opp => 
          deleteOpportunity({ opportunityId: opp._id })
        )
      );
      onBulkComplete();
    } catch (error) {
      console.error("Error deleting opportunities:", error);
    } finally {
      setIsProcessing(false);
      setOperation(null);
    }
  };

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
              Total value: €{selectedOpportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString()}
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
                  onClick={() => setOperation("delete")}
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

            {operation === "delete" && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkDelete}
                  disabled={isProcessing}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? "Deleting..." : "Confirm Delete"}
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
    </div>
  );
}