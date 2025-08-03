"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

// Define the form schema
const leadCaptureSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  leadSource: z.enum(["WEBSITE", "FACEBOOK", "INSTAGRAM", "LINKEDIN", "REFERRAL", "DIRECT", "OTHER"]),
  leadHeat: z.enum(["COLD", "WARM", "HOT"]),
  notes: z.string().optional(),
});

type LeadCaptureForm = z.infer<typeof leadCaptureSchema>;

export function LeadCaptureForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const createContact = useMutation(api.contacts.createContact);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadCaptureForm>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: {
      leadSource: "WEBSITE",
      leadHeat: "WARM",
    },
  });

  const onSubmit = async (data: LeadCaptureForm) => {
    setIsSubmitting(true);
    setSubmitMessage(null);
    
    try {
      await createContact({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        company: data.company || undefined,
        leadSource: data.leadSource,
        leadHeat: data.leadHeat,
        notes: data.notes || undefined,
      });
      
      setSubmitMessage({ type: 'success', message: 'Contact created successfully!' });
      reset();
    } catch (error) {
      console.error('Error creating contact:', error);
      setSubmitMessage({ type: 'error', message: 'Failed to create contact. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Capture New Lead</h2>
      
      {submitMessage && (
        <div className={`mb-4 p-3 rounded ${
          submitMessage.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {submitMessage.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            {...register("name")}
            type="text"
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter contact name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            {...register("phone")}
            type="tel"
            id="phone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter phone number"
          />
        </div>

        {/* Company Field */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            {...register("company")}
            type="text"
            id="company"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter company name"
          />
        </div>

        {/* Lead Source Field */}
        <div>
          <label htmlFor="leadSource" className="block text-sm font-medium text-gray-700 mb-1">
            Lead Source *
          </label>
          <select
            {...register("leadSource")}
            id="leadSource"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="WEBSITE">Website</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="REFERRAL">Referral</option>
            <option value="DIRECT">Direct</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.leadSource && (
            <p className="mt-1 text-sm text-red-600">{errors.leadSource.message}</p>
          )}
        </div>

        {/* Lead Heat Field */}
        <div>
          <label htmlFor="leadHeat" className="block text-sm font-medium text-gray-700 mb-1">
            Lead Heat *
          </label>
          <select
            {...register("leadHeat")}
            id="leadHeat"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="COLD">Cold</option>
            <option value="WARM">Warm</option>
            <option value="HOT">Hot</option>
          </select>
          {errors.leadHeat && (
            <p className="mt-1 text-sm text-red-600">{errors.leadHeat.message}</p>
          )}
        </div>

        {/* Notes Field */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            {...register("notes")}
            id="notes"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional notes about this lead..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Contact...' : 'Create Contact'}
        </button>
      </form>
    </div>
  );
}