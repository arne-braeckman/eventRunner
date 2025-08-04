"use client";

import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { ContactStatus } from '~/lib/types/contact';
import { ChevronRightIcon, CheckIcon } from 'lucide-react';

const JOURNEY_STAGES: { value: ContactStatus; label: string; description: string; color: string }[] = [
  { 
    value: 'UNQUALIFIED', 
    label: 'Unqualified', 
    description: 'Contact unknown or minimal indirect interaction',
    color: 'bg-gray-200 text-gray-800'
  },
  { 
    value: 'PROSPECT', 
    label: 'Prospect', 
    description: 'Contact aware of venue, following on social media',
    color: 'bg-blue-200 text-blue-800'
  },
  { 
    value: 'LEAD', 
    label: 'Lead', 
    description: 'Direct interaction occurred, asked for information',
    color: 'bg-yellow-200 text-yellow-800'
  },
  { 
    value: 'QUALIFIED', 
    label: 'Qualified', 
    description: 'Explicit interest demonstrated, formal proposal sent',
    color: 'bg-orange-200 text-orange-800'
  },
  { 
    value: 'CUSTOMER', 
    label: 'Customer', 
    description: 'Agreement signed',
    color: 'bg-green-200 text-green-800'
  },
  { 
    value: 'LOST', 
    label: 'Lost Deal', 
    description: 'Customer turned down offer, moved back to prospect stage',
    color: 'bg-red-200 text-red-800'
  }
];

interface ContactJourneyStageProps {
  contactId: Id<"contacts">;
  currentStatus: ContactStatus;
  onStatusUpdate?: (newStatus: ContactStatus) => void;
  readonly?: boolean;
}

export function ContactJourneyStage({ 
  contactId, 
  currentStatus, 
  onStatusUpdate,
  readonly = false 
}: ContactJourneyStageProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateContactStatus = useMutation(api.contacts.updateContactStatus);

  const currentStageIndex = JOURNEY_STAGES.findIndex(stage => stage.value === currentStatus);

  const handleStageChange = async (newStatus: ContactStatus) => {
    if (readonly || newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      await updateContactStatus({
        contactId,
        status: newStatus
      });
      onStatusUpdate?.(newStatus);
    } catch (error) {
      console.error('Failed to update contact status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Customer Journey Stage</h3>
        <p className="text-sm text-gray-600 mt-1">
          Track the customer's progress through the sales pipeline
        </p>
      </div>

      {/* Journey Stage Progress Bar */}
      <div className="mb-6">
        <div className="relative flex items-center justify-between mb-2">
          {JOURNEY_STAGES.slice(0, 5).map((stage, index) => {
            const isActive = stage.value === currentStatus;
            const isPassed = index < currentStageIndex && currentStatus !== 'LOST';
            const isClickable = !readonly && !isUpdating;

            return (
              <div key={stage.value} className="flex flex-col items-center flex-1 relative">
                <button
                  onClick={() => handleStageChange(stage.value)}
                  disabled={!isClickable}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors z-10 ${
                    isActive 
                      ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2' 
                      : isPassed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  title={`${stage.label}: ${stage.description}`}
                >
                  {isPassed ? <CheckIcon className="w-4 h-4" /> : index + 1}
                </button>
                <span className={`text-xs mt-1 text-center max-w-16 leading-tight ${
                  isActive ? 'font-semibold text-blue-600' : 'text-gray-500'
                }`}>
                  {stage.label}
                </span>
                {index < 4 && (
                  <div className="absolute top-4 left-1/2 transform translate-x-4 flex items-center">
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 -ml-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Stage Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Current Stage:</span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            JOURNEY_STAGES.find(s => s.value === currentStatus)?.color
          }`}>
            {JOURNEY_STAGES.find(s => s.value === currentStatus)?.label}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {JOURNEY_STAGES.find(s => s.value === currentStatus)?.description}
        </p>
      </div>

      {/* Lost Deal Status */}
      {currentStatus === 'LOST' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">L</span>
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">Lost Deal</h4>
              <p className="text-sm text-red-700">Customer turned down offer</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!readonly && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions:</h4>
          <div className="flex flex-wrap gap-2">
            {currentStatus !== 'QUALIFIED' && currentStatus !== 'CUSTOMER' && (
              <button
                onClick={() => handleStageChange('QUALIFIED')}
                disabled={isUpdating}
                className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full hover:bg-orange-200 disabled:opacity-50"
              >
                Mark as Qualified
              </button>
            )}
            {currentStatus !== 'CUSTOMER' && (
              <button
                onClick={() => handleStageChange('CUSTOMER')}
                disabled={isUpdating}
                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 disabled:opacity-50"
              >
                Mark as Customer
              </button>
            )}
            {currentStatus !== 'LOST' && (
              <button
                onClick={() => handleStageChange('LOST')}
                disabled={isUpdating}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 disabled:opacity-50"
              >
                Mark as Lost
              </button>
            )}
          </div>
        </div>
      )}

      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-sm text-gray-600">Updating...</div>
        </div>
      )}
    </div>
  );
}