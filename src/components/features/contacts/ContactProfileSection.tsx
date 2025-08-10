"use client";

import React, { useMemo } from 'react';
import { MapPinIcon, CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Contact } from '~/lib/types/contact';
import { EVENT_TYPE_OPTIONS, GEOGRAPHIC_REGIONS } from '~/lib/types/contact';

interface ContactProfileSectionProps {
  contact: Contact;
}

export function ContactProfileSection({ contact }: ContactProfileSectionProps) {
  // Memoize label lookups for performance
  const { geographicLabel, eventTypeLabel, hasPreferences } = useMemo(() => {
    const geographicLabel = contact.geographicLocation 
      ? GEOGRAPHIC_REGIONS.find(r => r.value === contact.geographicLocation)?.label || contact.geographicLocation
      : null;

    const eventTypeLabel = contact.preferredEventType
      ? EVENT_TYPE_OPTIONS.find(e => e.value === contact.preferredEventType)?.label || contact.preferredEventType
      : null;

    return {
      geographicLabel,
      eventTypeLabel,
      hasPreferences: Boolean(geographicLabel || eventTypeLabel)
    };
  }, [contact.geographicLocation, contact.preferredEventType]);

  // If neither field has data, don't render the section
  if (!hasPreferences) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5" />
          Preferences & Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {geographicLabel && (
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Geographic Location</p>
                <Badge variant="secondary" className="mt-1">
                  {geographicLabel}
                </Badge>
              </div>
            </div>
          )}

          {eventTypeLabel && (
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Preferred Event Type</p>
                <Badge variant="secondary" className="mt-1">
                  {eventTypeLabel}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}