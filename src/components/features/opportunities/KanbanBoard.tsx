"use client";

import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { OpportunityCard } from "./OpportunityCard";
import type { Opportunity, OpportunityStage } from "~/lib/types/opportunity";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface KanbanBoardProps {
  opportunities: Opportunity[];
  onEditOpportunity?: (opportunity: Opportunity) => void;
  onDeleteOpportunity?: (opportunityId: string) => void;
  selectedOpportunities?: Opportunity[];
  onToggleSelection?: (opportunity: Opportunity) => void;
  isSelectionMode?: boolean;
}

const PIPELINE_STAGES: { id: OpportunityStage; title: string; color: string }[] = [
  { id: "PROSPECT", title: "Prospect", color: "bg-gray-100 border-gray-300" },
  { id: "QUALIFIED", title: "Qualified", color: "bg-blue-100 border-blue-300" },
  { id: "PROPOSAL", title: "Proposal", color: "bg-yellow-100 border-yellow-300" },
  { id: "NEGOTIATION", title: "Negotiation", color: "bg-orange-100 border-orange-300" },
  { id: "CLOSED_WON", title: "Closed Won", color: "bg-green-100 border-green-300" },
  { id: "CLOSED_LOST", title: "Closed Lost", color: "bg-red-100 border-red-300" },
];

export function KanbanBoard({ 
  opportunities, 
  onEditOpportunity, 
  onDeleteOpportunity, 
  selectedOpportunities = [], 
  onToggleSelection, 
  isSelectionMode = false 
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const updateOpportunityStage = useMutation(api.opportunities.updateOpportunityStage);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const groupedOpportunities = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = opportunities.filter(opp => opp.stage === stage.id);
    return acc;
  }, {} as Record<OpportunityStage, Opportunity[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeOpportunity = opportunities.find(opp => opp._id === active.id);
    const newStage = over.id as OpportunityStage;

    if (activeOpportunity && activeOpportunity.stage !== newStage) {
      try {
        await updateOpportunityStage({
          opportunityId: activeOpportunity._id,
          stage: newStage,
        });
      } catch (error) {
        console.error("Failed to update opportunity stage:", error);
      }
    }
  };

  const activeOpportunity = activeId 
    ? opportunities.find(opp => opp._id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 min-h-[600px]">
        {PIPELINE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            id={stage.id}
            title={stage.title}
            color={stage.color}
            opportunities={groupedOpportunities[stage.id] || []}
            onEditOpportunity={onEditOpportunity}
            onDeleteOpportunity={onDeleteOpportunity}
            selectedOpportunities={selectedOpportunities}
            onToggleSelection={onToggleSelection}
            isSelectionMode={isSelectionMode}
          />
        ))}
      </div>

      <DragOverlay>
        {activeOpportunity ? (
          <OpportunityCard 
            opportunity={activeOpportunity} 
            isDragging 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}