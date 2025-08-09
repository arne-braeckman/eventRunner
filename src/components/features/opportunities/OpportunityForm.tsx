"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { X, Calendar, Users, Euro, MapPin, Clock, FileText } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { OpportunityStage, EventType } from "~/lib/types/opportunity";

interface OpportunityFormData {
  name: string;
  contactId: Id<"contacts">;
  stage: OpportunityStage;
  value: number;
  eventType: EventType;
  eventDate: string;
  guestCount: number;
  requiresCatering: boolean;
  venueRequirements?: string;
  description?: string;
  expectedCloseDate?: string;
}

interface OpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<OpportunityFormData>;
  opportunityId?: Id<"opportunities">;
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
  { value: "CORPORATE", label: "Corporate Event" },
  { value: "GALA", label: "Gala" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "BIRTHDAY", label: "Birthday Party" },
  { value: "ANNIVERSARY", label: "Anniversary" },
  { value: "OTHER", label: "Other" },
];

export function OpportunityForm({ 
  isOpen, 
  onClose, 
  initialData, 
  opportunityId 
}: OpportunityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const contacts = useQuery(api.contacts.getAllContacts, {});
  const createOpportunity = useMutation(api.opportunities.createOpportunity);
  const updateOpportunity = useMutation(api.opportunities.updateOpportunity);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<OpportunityFormData>({
    defaultValues: {
      stage: "PROSPECT",
      eventType: "WEDDING",
      requiresCatering: false,
      ...initialData,
    },
  });

  const isEditing = !!opportunityId;

  const onSubmit = async (data: OpportunityFormData) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        eventDate: new Date(data.eventDate).getTime(),
        expectedCloseDate: data.expectedCloseDate 
          ? new Date(data.expectedCloseDate).getTime() 
          : undefined,
      };

      if (isEditing && opportunityId) {
        await updateOpportunity({
          opportunityId,
          ...formattedData,
        });
      } else {
        await createOpportunity(formattedData);
      }

      reset();
      onClose();
    } catch (error) {
      console.error("Error saving opportunity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventType = watch("eventType");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Opportunity" : "Create New Opportunity"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opportunity Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Opportunity Name *
              </label>
              <input
                type="text"
                {...register("name", { required: "Opportunity name is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter opportunity name..."
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact *
              </label>
              <select
                {...register("contactId", { required: "Contact is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a contact...</option>
                {contacts?.map((contact) => (
                  <option key={contact._id} value={contact._id}>
                    {contact.name} ({contact.email})
                  </option>
                ))}
              </select>
              {errors.contactId && (
                <p className="mt-1 text-sm text-red-600">{errors.contactId.message}</p>
              )}
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pipeline Stage *
              </label>
              <select
                {...register("stage", { required: "Stage is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                {...register("eventType", { required: "Event type is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Opportunity Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Euro className="w-4 h-4 inline mr-1" />
                Opportunity Value *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("value", { 
                  required: "Value is required",
                  min: { value: 0, message: "Value must be positive" },
                  valueAsNumber: true
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Event Date *
                </label>
                <input
                  type="date"
                  {...register("eventDate", { required: "Event date is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.eventDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>
                )}
              </div>

              {/* Expected Close Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Expected Close Date
                </label>
                <input
                  type="date"
                  {...register("expectedCloseDate")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Guest Count *
                </label>
                <input
                  type="number"
                  min="1"
                  {...register("guestCount", { 
                    required: "Guest count is required",
                    min: { value: 1, message: "Must have at least 1 guest" },
                    valueAsNumber: true
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
                {errors.guestCount && (
                  <p className="mt-1 text-sm text-red-600">{errors.guestCount.message}</p>
                )}
              </div>

              {/* Catering */}
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  {...register("requiresCatering")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Requires catering
                </label>
              </div>
            </div>

            {/* Venue Requirements */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Venue Requirements
              </label>
              <textarea
                rows={3}
                {...register("venueRequirements")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe venue requirements, location preferences, etc..."
              />
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                {...register("description")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes about this opportunity..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update Opportunity" : "Create Opportunity")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}