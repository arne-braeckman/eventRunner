import type { Id } from "../../../convex/_generated/dataModel";

export type LeadSource = "WEBSITE" | "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "REFERRAL" | "DIRECT" | "OTHER";
export type LeadHeat = "COLD" | "WARM" | "HOT";
export type ContactStatus = "UNQUALIFIED" | "PROSPECT" | "LEAD" | "QUALIFIED" | "CUSTOMER" | "LOST";
export type SocialPlatform = "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "TWITTER" | "TIKTOK";
export type InteractionType = 
  | "SOCIAL_FOLLOW" 
  | "SOCIAL_LIKE" 
  | "SOCIAL_COMMENT" 
  | "SOCIAL_MESSAGE"
  | "WEBSITE_VISIT" 
  | "INFO_REQUEST" 
  | "PRICE_QUOTE" 
  | "SITE_VISIT"
  | "EMAIL_OPEN"
  | "EMAIL_CLICK"
  | "PHONE_CALL"
  | "MEETING"
  | "OTHER";

export interface SocialProfile {
  platform: SocialPlatform;
  profileUrl: string;
  username?: string;
  isConnected: boolean;
  lastSyncAt?: number;
}

export interface Interaction {
  _id: Id<"interactions">;
  contactId: Id<"contacts">;
  type: InteractionType;
  platform?: SocialPlatform;
  description?: string;
  metadata: Record<string, any>;
  createdAt: number;
  createdBy?: Id<"users">;
}

export interface Contact {
  _id: Id<"contacts">;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  leadSource: LeadSource;
  leadHeat: LeadHeat;
  leadHeatScore?: number;
  status: ContactStatus;
  notes?: string;
  assignedTo?: Id<"users">;
  socialProfiles?: SocialProfile[];
  customFields?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  lastInteractionAt?: number;
}

export const LEAD_SOURCE_OPTIONS = [
  { value: "WEBSITE", label: "Website" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "REFERRAL", label: "Referral" },
  { value: "DIRECT", label: "Direct" },
  { value: "OTHER", label: "Other" }
] as const;

export const LEAD_HEAT_OPTIONS = [
  { value: "HOT", label: "Hot" },
  { value: "WARM", label: "Warm" },
  { value: "COLD", label: "Cold" }
] as const;

export const CONTACT_STATUS_OPTIONS = [
  { value: "UNQUALIFIED", label: "Unqualified" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "LEAD", label: "Lead" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "LOST", label: "Lost" }
] as const;

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "TWITTER", label: "Twitter" },
  { value: "TIKTOK", label: "TikTok" }
] as const;

export const INTERACTION_TYPE_OPTIONS = [
  { value: "SOCIAL_FOLLOW", label: "Social Follow", weight: 1 },
  { value: "SOCIAL_LIKE", label: "Social Like", weight: 1 },
  { value: "SOCIAL_COMMENT", label: "Social Comment", weight: 2 },
  { value: "SOCIAL_MESSAGE", label: "Social Message", weight: 3 },
  { value: "WEBSITE_VISIT", label: "Website Visit", weight: 2 },
  { value: "INFO_REQUEST", label: "Info Request", weight: 5 },
  { value: "PRICE_QUOTE", label: "Price Quote", weight: 8 },
  { value: "SITE_VISIT", label: "Site Visit", weight: 10 },
  { value: "EMAIL_OPEN", label: "Email Open", weight: 1 },
  { value: "EMAIL_CLICK", label: "Email Click", weight: 2 },
  { value: "PHONE_CALL", label: "Phone Call", weight: 5 },
  { value: "MEETING", label: "Meeting", weight: 8 },
  { value: "OTHER", label: "Other", weight: 1 }
] as const;

export const LEAD_HEAT_THRESHOLDS = {
  COLD: { min: 0, max: 5 },
  WARM: { min: 6, max: 15 },
  HOT: { min: 16, max: Infinity }
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  SUGGESTIONS_LIMIT: 10,
  MIN_SEARCH_LENGTH: 2
} as const;