import type { Id } from "../../../convex/_generated/dataModel";

export type OpportunityStage = 
  | "PROSPECT"
  | "QUALIFIED" 
  | "PROPOSAL"
  | "NEGOTIATION"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export type EventType = 
  | "WEDDING"
  | "CORPORATE"
  | "BIRTHDAY"
  | "ANNIVERSARY"
  | "CONFERENCE"
  | "GALA"
  | "OTHER";

export interface Opportunity {
  _id: Id<"opportunities">;
  name: string;
  contactId: Id<"contacts">;
  stage: OpportunityStage;
  value: number;
  eventType: EventType;
  eventDate: number; // timestamp
  guestCount: number;
  requiresCatering: boolean;
  roomAssignment?: string;
  venueRequirements?: string;
  probability?: number; // 0-100 probability of closing
  expectedCloseDate?: number; // timestamp
  description?: string;
  assignedTo?: Id<"users">;
  customFields?: Record<string, any>;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface OpportunityWithContact extends Opportunity {
  contact: {
    _id: Id<"contacts">;
    name: string;
    email: string;
    company?: string;
  };
}

export const OPPORTUNITY_STAGE_OPTIONS = [
  { value: "PROSPECT", label: "Prospect", color: "bg-gray-100 text-gray-800" },
  { value: "QUALIFIED", label: "Qualified", color: "bg-blue-100 text-blue-800" },
  { value: "PROPOSAL", label: "Proposal", color: "bg-yellow-100 text-yellow-800" },
  { value: "NEGOTIATION", label: "Negotiation", color: "bg-orange-100 text-orange-800" },
  { value: "CLOSED_WON", label: "Closed Won", color: "bg-green-100 text-green-800" },
  { value: "CLOSED_LOST", label: "Closed Lost", color: "bg-red-100 text-red-800" }
] as const;

export const EVENT_TYPE_OPTIONS = [
  { value: "WEDDING", label: "Wedding", icon: "💒" },
  { value: "CORPORATE", label: "Corporate Event", icon: "🏢" },
  { value: "BIRTHDAY", label: "Birthday Party", icon: "🎂" },
  { value: "ANNIVERSARY", label: "Anniversary", icon: "💝" },
  { value: "CONFERENCE", label: "Conference", icon: "📊" },
  { value: "GALA", label: "Gala", icon: "✨" },
  { value: "OTHER", label: "Other", icon: "🎉" }
] as const;

export const ROOM_ASSIGNMENT_OPTIONS = [
  { value: "GRAND_BALLROOM", label: "Grand Ballroom" },
  { value: "CONFERENCE_ROOM_A", label: "Conference Room A" },
  { value: "CONFERENCE_ROOM_B", label: "Conference Room B" },
  { value: "GARDEN_PAVILION", label: "Garden Pavilion" },
  { value: "ROOFTOP_TERRACE", label: "Rooftop Terrace" },
  { value: "PRIVATE_DINING", label: "Private Dining Room" },
  { value: "TBD", label: "To Be Determined" }
] as const;

// Default probability values by stage
export const DEFAULT_STAGE_PROBABILITIES: Record<OpportunityStage, number> = {
  PROSPECT: 10,
  QUALIFIED: 25,
  PROPOSAL: 50,
  NEGOTIATION: 75,
  CLOSED_WON: 100,
  CLOSED_LOST: 0
} as const;

// Revenue forecasting utilities
export interface RevenueForecasting {
  weightedValue: number; // value * probability
  stage: OpportunityStage;
  expectedCloseDate?: number;
}

export const OPPORTUNITY_FILTERS = {
  STAGES: OPPORTUNITY_STAGE_OPTIONS,
  EVENT_TYPES: EVENT_TYPE_OPTIONS,
  VALUE_RANGES: [
    { min: 0, max: 1000, label: "Under €1,000" },
    { min: 1000, max: 5000, label: "€1,000 - €5,000" },
    { min: 5000, max: 10000, label: "€5,000 - €10,000" },
    { min: 10000, max: 25000, label: "€10,000 - €25,000" },
    { min: 25000, max: 50000, label: "€25,000 - €50,000" },
    { min: 50000, max: Infinity, label: "Over €50,000" }
  ]
} as const;