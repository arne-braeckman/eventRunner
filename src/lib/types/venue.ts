import type { Id } from "../../../convex/_generated/dataModel";

export type BookingStatus = "AVAILABLE" | "TENTATIVE" | "CONFIRMED" | "BLOCKED";

export type ConflictType = 
  | "VENUE_DOUBLE_BOOKING"
  | "RESOURCE_CONFLICT" 
  | "STAFF_UNAVAILABLE"
  | "TIME_OVERLAP";

export type ConflictSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Venue {
  _id: Id<"venues">;
  name: string;
  description?: string;
  capacity: number;
  location?: string;
  amenities?: string[];
  hourlyRate?: number;
  dailyRate?: number;
  setupTime: number; // in minutes
  cleanupTime: number; // in minutes
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface VenueAvailability {
  _id: Id<"venueAvailability">;
  venueId: Id<"venues">;
  date: number; // timestamp for the date
  startTime: number; // timestamp
  endTime: number; // timestamp
  isBooked: boolean;
  opportunityId?: Id<"opportunities">;
  bookingStatus: BookingStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ConflictDetectionLog {
  _id: Id<"conflictDetectionLog">;
  opportunityId: Id<"opportunities">;
  conflictType: ConflictType;
  conflictingOpportunityId?: Id<"opportunities">;
  venueId?: Id<"venues">;
  conflictDate: number;
  severity: ConflictSeverity;
  isResolved: boolean;
  resolutionNotes?: string;
  detectedAt: number;
  resolvedAt?: number;
}

export interface DateConflict {
  type: "VENUE_CONFLICT" | "DATE_CONFLICT";
  booking?: VenueAvailability;
  opportunity?: any; // Opportunity type
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface AlternativeDateSuggestion {
  startTime: number;
  endTime: number;
  venue: Venue;
  isPreferredDate: boolean;
}

export interface VenueCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  venue: Venue;
  opportunity?: any; // Opportunity type
  status: BookingStatus;
  color: string;
}

// Venue filtering options
export const VENUE_AMENITIES = [
  "WIFI",
  "PROJECTOR", 
  "SOUND_SYSTEM",
  "CATERING_KITCHEN",
  "PARKING",
  "WHEELCHAIR_ACCESSIBLE",
  "OUTDOOR_SPACE",
  "STAGE",
  "DANCE_FLOOR",
  "BAR_SETUP"
] as const;

export type VenueAmenity = typeof VENUE_AMENITIES[number];

export interface VenueFilterOptions {
  capacity?: {
    min?: number;
    max?: number;
  };
  amenities?: VenueAmenity[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  availableOn?: number; // timestamp
  location?: string;
}

// Booking confirmation workflow
export interface BookingConfirmation {
  opportunityId: Id<"opportunities">;
  venueId: Id<"venues">;
  contactEmail: string;
  eventDetails: {
    name: string;
    date: number;
    duration: number;
    guestCount: number;
    specialRequirements?: string;
  };
  venue: {
    name: string;
    location?: string;
    amenities: string[];
  };
  pricing: {
    venueRate: number;
    totalCost: number;
    deposit?: number;
  };
}

// Calendar integration types
export interface CalendarSlot {
  start: number;
  end: number;
  isAvailable: boolean;
  bookingStatus?: BookingStatus;
  opportunity?: any;
}

export interface CalendarDay {
  date: number;
  slots: CalendarSlot[];
  hasConflicts: boolean;
  totalBookings: number;
}

export interface CalendarWeek {
  weekStart: number;
  weekEnd: number;
  days: CalendarDay[];
}

export const BOOKING_STATUS_COLORS = {
  AVAILABLE: "bg-green-100 text-green-800",
  TENTATIVE: "bg-yellow-100 text-yellow-800", 
  CONFIRMED: "bg-blue-100 text-blue-800",
  BLOCKED: "bg-red-100 text-red-800",
} as const;

export const CONFLICT_SEVERITY_COLORS = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800", 
  CRITICAL: "bg-red-100 text-red-800",
} as const;