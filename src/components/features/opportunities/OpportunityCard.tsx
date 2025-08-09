"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Calendar, 
  Users, 
  Euro, 
  MapPin, 
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  AlertTriangle
} from "lucide-react";
import type { Opportunity } from "~/lib/types/opportunity";
import { format } from "date-fns";

interface OpportunityCardProps {
  opportunity: Opportunity;
  isDragging?: boolean;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunityId: string) => void;
  isSelected?: boolean;
  onToggleSelection?: (opportunity: Opportunity) => void;
  isSelectionMode?: boolean;
  allOpportunities?: Opportunity[];
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  WEDDING: "bg-pink-100 text-pink-800",
  CORPORATE: "bg-blue-100 text-blue-800",
  GALA: "bg-purple-100 text-purple-800",
  CONFERENCE: "bg-green-100 text-green-800",
  BIRTHDAY: "bg-yellow-100 text-yellow-800",
  ANNIVERSARY: "bg-indigo-100 text-indigo-800",
  OTHER: "bg-gray-100 text-gray-800",
};

export function OpportunityCard({ 
  opportunity, 
  isDragging, 
  onEdit, 
  onDelete, 
  isSelected, 
  onToggleSelection, 
  isSelectionMode,
  allOpportunities = []
}: OpportunityCardProps) {
  const [showActions, setShowActions] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: opportunity._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const eventTypeColor = EVENT_TYPE_COLORS[opportunity.eventType] || EVENT_TYPE_COLORS.OTHER;
  
  // Check for date conflicts with other opportunities
  const hasDateConflict = allOpportunities.some(opp => 
    opp._id !== opportunity._id && 
    opp.isActive && 
    new Date(opp.eventDate).toDateString() === new Date(opportunity.eventDate).toDateString()
  );
  
  const conflictingOpportunities = allOpportunities.filter(opp =>
    opp._id !== opportunity._id && 
    opp.isActive && 
    new Date(opp.eventDate).toDateString() === new Date(opportunity.eventDate).toDateString()
  );

  if (isDragging || isSortableDragging) {
    return (
      <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300 p-4 opacity-50 rotate-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 truncate">{opportunity.name}</h4>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all cursor-grab active:cursor-grabbing
        ${isSelected ? 'border-blue-500 bg-blue-50' : hasDateConflict ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}
        ${isSelectionMode ? 'cursor-pointer' : ''}
        ${hasDateConflict ? 'ring-1 ring-orange-200' : ''}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={(e) => {
        if (isSelectionMode && e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
          onToggleSelection?.(opportunity);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          {isSelectionMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection?.(opportunity);
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          )}
          <h4 className="font-semibold text-gray-900 truncate">{opportunity.name}</h4>
        </div>
        
        {showActions && !isSelectionMode && (
          <div className="flex items-center space-x-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(opportunity);
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Edit opportunity"
            >
              <Edit className="w-4 h-4 text-gray-500" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to delete this opportunity?")) {
                  onDelete?.(opportunity._id);
                }
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Delete opportunity"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* Event Type Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${eventTypeColor}`}>
          {opportunity.eventType.toLowerCase().replace('_', ' ')}
        </span>
      </div>

      {/* Value and Probability */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <Euro className="w-4 h-4 mr-1" />
          <span className="font-medium">€{opportunity.value.toLocaleString()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">{opportunity.probability || 0}%</span>
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-2 text-sm text-gray-600">
        {/* Event Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{format(new Date(opportunity.eventDate), 'MMM dd, yyyy')}</span>
          </div>
          {hasDateConflict && (
            <div className="flex items-center" title={`Date conflict with ${conflictingOpportunities.length} other opportunity/opportunities`}>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-orange-600 ml-1">{conflictingOpportunities.length}</span>
            </div>
          )}
        </div>

        {/* Guest Count */}
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          <span>{opportunity.guestCount} guests</span>
        </div>

        {/* Venue Requirements */}
        {opportunity.venueRequirements && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="truncate">{opportunity.venueRequirements}</span>
          </div>
        )}

        {/* Expected Close Date */}
        {opportunity.expectedCloseDate && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>Close: {format(new Date(opportunity.expectedCloseDate), 'MMM dd')}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {opportunity.description && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">{opportunity.description}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Updated {format(new Date(opportunity.updatedAt), 'MMM dd')}
        </div>
        
        {opportunity.assignedTo && (
          <div className="flex items-center text-xs text-gray-500">
            <User className="w-3 h-3 mr-1" />
            <span>Assigned</span>
          </div>
        )}
      </div>
    </div>
  );
}