"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CalendarX, Clock, MapPin, Users, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { DateConflict, AlternativeDateSuggestion, ConflictSeverity } from "@/lib/types/venue";

interface DateConflictAlertProps {
  conflicts: DateConflict[];
  alternativeDates?: AlternativeDateSuggestion[];
  onResolveConflict?: (conflictId: string, resolution: string) => void;
  onSelectAlternativeDate?: (suggestion: AlternativeDateSuggestion) => void;
  className?: string;
}

const severityConfig: Record<ConflictSeverity, { color: string; icon: any; priority: number }> = {
  LOW: { color: "bg-gray-100 text-gray-800 border-gray-300", icon: Clock, priority: 1 },
  MEDIUM: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: AlertTriangle, priority: 2 },
  HIGH: { color: "bg-orange-100 text-orange-800 border-orange-300", icon: AlertTriangle, priority: 3 },
  CRITICAL: { color: "bg-red-100 text-red-800 border-red-300", icon: XCircle, priority: 4 },
};

export function DateConflictAlert({ 
  conflicts, 
  alternativeDates = [], 
  onResolveConflict,
  onSelectAlternativeDate,
  className 
}: DateConflictAlertProps) {
  const [selectedConflict, setSelectedConflict] = useState<DateConflict | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  if (conflicts.length === 0) {
    return null;
  }

  // Sort conflicts by severity
  const sortedConflicts = [...conflicts].sort((a, b) => 
    severityConfig[b.severity].priority - severityConfig[a.severity].priority
  );

  const highestSeverity = sortedConflicts[0]?.severity || "LOW";
  const SeverityIcon = severityConfig[highestSeverity].icon;

  const formatDateTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  };

  const formatDuration = (start: number, end: number) => {
    const hours = Math.round((end - start) / (1000 * 60 * 60) * 10) / 10;
    return `${hours} hours`;
  };

  return (
    <div className={className}>
      <Alert className={`border-l-4 ${severityConfig[highestSeverity].color.replace('bg-', 'border-').replace('text-', '').replace('100', '500')}`}>
        <SeverityIcon className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          <span>Date Conflicts Detected</span>
          <Badge variant="outline" className={severityConfig[highestSeverity].color}>
            {highestSeverity}
          </Badge>
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>
            Found {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} for this date and time.
          </p>
          
          <div className="space-y-3">
            {sortedConflicts.map((conflict, index) => (
              <ConflictItem
                key={index}
                conflict={conflict}
                onResolve={() => setSelectedConflict(conflict)}
                formatDateTime={formatDateTime}
              />
            ))}
          </div>

          {alternativeDates.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-sm mb-3">Alternative Date Suggestions</h4>
              <div className="grid gap-2">
                {alternativeDates.slice(0, 3).map((suggestion, index) => (
                  <AlternativeDateCard
                    key={index}
                    suggestion={suggestion}
                    onSelect={() => onSelectAlternativeDate?.(suggestion)}
                    formatDateTime={formatDateTime}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
              
              {alternativeDates.length > 3 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2">
                      View All {alternativeDates.length} Suggestions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Alternative Date Suggestions</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                      {alternativeDates.map((suggestion, index) => (
                        <AlternativeDateCard
                          key={index}
                          suggestion={suggestion}
                          onSelect={() => onSelectAlternativeDate?.(suggestion)}
                          formatDateTime={formatDateTime}
                          formatDuration={formatDuration}
                          detailed
                        />
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Conflict Resolution Dialog */}
      {selectedConflict && (
        <Dialog open={!!selectedConflict} onOpenChange={(open) => !open && setSelectedConflict(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Conflict</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <ConflictDetailView conflict={selectedConflict} formatDateTime={formatDateTime} />
              
              <div className="space-y-2">
                <label htmlFor="resolution" className="text-sm font-medium">
                  Resolution Notes
                </label>
                <textarea
                  id="resolution"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how this conflict was resolved..."
                  className="w-full p-2 border rounded-md min-h-20"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedConflict(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    onResolveConflict?.(selectedConflict.booking?._id || '', resolutionNotes);
                    setSelectedConflict(null);
                    setResolutionNotes("");
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Resolved
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ConflictItem({ 
  conflict, 
  onResolve, 
  formatDateTime 
}: { 
  conflict: DateConflict; 
  onResolve: () => void; 
  formatDateTime: (timestamp: number) => string;
}) {
  const SeverityIcon = severityConfig[conflict.severity].icon;
  
  return (
    <Card className="border-l-4 border-l-red-500">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SeverityIcon className="w-4 h-4 text-red-600" />
              <Badge variant="outline" className={severityConfig[conflict.severity].color}>
                {conflict.type.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={severityConfig[conflict.severity].color}>
                {conflict.severity}
              </Badge>
            </div>
            
            {conflict.opportunity && (
              <div className="space-y-1 text-sm">
                <p className="font-medium">{conflict.opportunity.name}</p>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(conflict.opportunity.eventDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {conflict.opportunity.guestCount} guests
                  </div>
                  {conflict.opportunity.roomAssignment && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {conflict.opportunity.roomAssignment}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Button variant="outline" size="sm" onClick={onResolve}>
            Resolve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AlternativeDateCard({ 
  suggestion, 
  onSelect, 
  formatDateTime, 
  formatDuration,
  detailed = false 
}: { 
  suggestion: AlternativeDateSuggestion; 
  onSelect: () => void; 
  formatDateTime: (timestamp: number) => string;
  formatDuration: (start: number, end: number) => string;
  detailed?: boolean;
}) {
  return (
    <Card className={`cursor-pointer transition-colors hover:bg-gray-50 ${
      suggestion.isPreferredDate ? 'ring-2 ring-blue-500' : ''
    }`} onClick={onSelect}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatDateTime(suggestion.startTime)}</span>
              {suggestion.isPreferredDate && (
                <Badge variant="default" className="text-xs">
                  Preferred Date
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(suggestion.startTime, suggestion.endTime)}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {suggestion.venue.name}
              </div>
              {detailed && suggestion.venue.capacity && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Up to {suggestion.venue.capacity} guests
                </div>
              )}
            </div>
          </div>
          
          <Button variant="outline" size="sm">
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ConflictDetailView({ 
  conflict, 
  formatDateTime 
}: { 
  conflict: DateConflict; 
  formatDateTime: (timestamp: number) => string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">Conflict Type</h4>
        <p className="text-sm text-gray-600">{conflict.type.replace('_', ' ')}</p>
      </div>
      
      {conflict.opportunity && (
        <div>
          <h4 className="font-medium">Conflicting Event</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{conflict.opportunity.name}</p>
            <p>{formatDateTime(conflict.opportunity.eventDate)}</p>
            <p>{conflict.opportunity.guestCount} guests</p>
            {conflict.opportunity.roomAssignment && (
              <p>Venue: {conflict.opportunity.roomAssignment}</p>
            )}
          </div>
        </div>
      )}
      
      {conflict.booking && (
        <div>
          <h4 className="font-medium">Booking Details</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Status: {conflict.booking.bookingStatus}</p>
            <p>Time: {formatDateTime(conflict.booking.startTime)} - {formatDateTime(conflict.booking.endTime)}</p>
            {conflict.booking.notes && <p>Notes: {conflict.booking.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}