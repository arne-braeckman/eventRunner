"use client";

import { Search, Filter } from "lucide-react";
import type { OpportunityStage, EventType } from "~/lib/types/opportunity";

interface OpportunityFilterState {
  stage?: OpportunityStage;
  eventType?: EventType;
  searchTerm?: string;
}

interface OpportunityFiltersProps {
  filters: OpportunityFilterState;
  onFilterChange: (filters: OpportunityFilterState) => void;
}

const STAGE_OPTIONS: { value: OpportunityStage; label: string }[] = [
  { value: "PROSPECT", label: "Prospect" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CLOSED_WON", label: "Closed Won" },
  { value: "CLOSED_LOST", label: "Closed Lost" },
];

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "WEDDING", label: "Wedding" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "GALA", label: "Gala" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "BIRTHDAY", label: "Birthday" },
  { value: "ANNIVERSARY", label: "Anniversary" },
  { value: "OTHER", label: "Other" },
];

export function OpportunityFilters({ filters, onFilterChange }: OpportunityFiltersProps) {
  const updateFilter = (key: keyof OpportunityFilterState, value: string | undefined) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={filters.searchTerm || ""}
            onChange={(e) => updateFilter("searchTerm", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Stage Filter */}
        <select
          value={filters.stage || ""}
          onChange={(e) => updateFilter("stage", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All stages</option>
          {STAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Event Type Filter */}
        <select
          value={filters.eventType || ""}
          onChange={(e) => updateFilter("eventType", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All event types</option>
          {EVENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}