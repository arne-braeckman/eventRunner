"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { OpportunityCard } from "./OpportunityCard";
import type { Opportunity, OpportunityStage } from "~/lib/types/opportunity";

interface KanbanColumnProps {
  id: OpportunityStage;
  title: string;
  color: string;
  opportunities: Opportunity[];
  onEditOpportunity?: (opportunity: Opportunity) => void;
  onDeleteOpportunity?: (opportunityId: string) => void;
  selectedOpportunities?: Opportunity[];
  onToggleSelection?: (opportunity: Opportunity) => void;
  isSelectionMode?: boolean;
}

export function KanbanColumn({ 
  id, 
  title, 
  color, 
  opportunities, 
  onEditOpportunity, 
  onDeleteOpportunity,
  selectedOpportunities = [],
  onToggleSelection,
  isSelectionMode = false
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const count = opportunities.length;

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col rounded-lg border-2 border-dashed p-4 min-h-[500px]
        ${color}
        ${isOver ? 'border-blue-500 bg-blue-50' : ''}
        transition-colors duration-200
      `}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-600">
            {count}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          €{totalValue.toLocaleString()}
        </div>
      </div>

      <SortableContext
        items={opportunities.map(opp => opp._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 flex-1">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity._id}
              opportunity={opportunity}
              onEdit={onEditOpportunity}
              onDelete={onDeleteOpportunity}
              isSelected={selectedOpportunities.some(selected => selected._id === opportunity._id)}
              onToggleSelection={onToggleSelection}
              isSelectionMode={isSelectionMode}
            />
          ))}
        </div>
      </SortableContext>

      {count === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p className="text-sm">Drop opportunities here</p>
        </div>
      )}
    </div>
  );
}