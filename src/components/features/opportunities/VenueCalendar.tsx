"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, Clock, AlertTriangle } from "lucide-react";
import type { 
  Venue, 
  VenueAvailability, 
  VenueCalendarEvent, 
  CalendarDay, 
  CalendarWeek,
  BookingStatus 
} from "@/lib/types/venue";
import type { Opportunity } from "@/lib/types/opportunity";
import { BOOKING_STATUS_COLORS } from "@/lib/types/venue";

interface VenueCalendarProps {
  venues: Venue[];
  availabilitySlots: VenueAvailability[];
  opportunities: Opportunity[];
  selectedVenue?: Venue;
  onVenueChange?: (venue: Venue) => void;
  onTimeSlotSelect?: (startTime: number, endTime: number, venue: Venue) => void;
  onEventClick?: (event: VenueCalendarEvent) => void;
  className?: string;
}

export function VenueCalendar({
  venues,
  availabilitySlots,
  opportunities,
  selectedVenue,
  onVenueChange,
  onTimeSlotSelect,
  onEventClick,
  className
}: VenueCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedEvent, setSelectedEvent] = useState<VenueCalendarEvent | null>(null);

  const activeVenue = selectedVenue || venues[0];

  // Convert data to calendar events
  const calendarEvents = useMemo(() => {
    if (!activeVenue) return [];

    const events: VenueCalendarEvent[] = [];

    // Add venue availability slots
    availabilitySlots
      .filter(slot => slot.venueId === activeVenue._id)
      .forEach(slot => {
        const opportunity = slot.opportunityId 
          ? opportunities.find(opp => opp._id === slot.opportunityId)
          : null;

        events.push({
          id: slot._id,
          title: opportunity ? opportunity.name : `${slot.bookingStatus} Slot`,
          start: new Date(slot.startTime),
          end: new Date(slot.endTime),
          venue: activeVenue,
          opportunity,
          status: slot.bookingStatus,
          color: getStatusColor(slot.bookingStatus, !!opportunity),
        });
      });

    // Add unbooked opportunities as potential events
    opportunities
      .filter(opp => !availabilitySlots.some(slot => slot.opportunityId === opp._id))
      .forEach(opp => {
        events.push({
          id: `unbooked-${opp._id}`,
          title: `${opp.name} (Unbooked)`,
          start: new Date(opp.eventDate),
          end: new Date(opp.eventDate + 4 * 60 * 60 * 1000), // Default 4 hours
          venue: activeVenue,
          opportunity: opp,
          status: "AVAILABLE",
          color: "bg-gray-200 text-gray-700 border-gray-300",
        });
      });

    return events;
  }, [activeVenue, availabilitySlots, opportunities]);

  const weekData = useMemo(() => {
    return generateWeekData(currentDate, calendarEvents);
  }, [currentDate, calendarEvents]);

  const monthData = useMemo(() => {
    return generateMonthData(currentDate, calendarEvents);
  }, [currentDate, calendarEvents]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const formatDateRange = () => {
    if (viewMode === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const handleTimeSlotClick = (startTime: number, endTime: number) => {
    if (onTimeSlotSelect && activeVenue) {
      onTimeSlotSelect(startTime, endTime, activeVenue);
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Venue Calendar
            </CardTitle>
            
            <div className="flex items-center gap-4">
              {/* Venue Selector */}
              <Select 
                value={activeVenue?._id} 
                onValueChange={(venueId) => {
                  const venue = venues.find(v => v._id === venueId);
                  if (venue && onVenueChange) {
                    onVenueChange(venue);
                  }
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map(venue => (
                    <SelectItem key={venue._id} value={venue._id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {venue.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <Select value={viewMode} onValueChange={(mode) => setViewMode(mode as 'week' | 'month')}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <h3 className="font-semibold">{formatDateRange()}</h3>
            
            <div className="flex items-center gap-2">
              <StatusLegend />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === 'week' ? (
            <WeekView 
              weekData={weekData} 
              onTimeSlotClick={handleTimeSlotClick}
              onEventClick={(event) => {
                setSelectedEvent(event);
                onEventClick?.(event);
              }}
            />
          ) : (
            <MonthView 
              monthData={monthData}
              onEventClick={(event) => {
                setSelectedEvent(event);
                onEventClick?.(event);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
            </DialogHeader>
            <EventDetailView event={selectedEvent} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function WeekView({ 
  weekData, 
  onTimeSlotClick, 
  onEventClick 
}: { 
  weekData: CalendarWeek; 
  onTimeSlotClick: (startTime: number, endTime: number) => void;
  onEventClick: (event: VenueCalendarEvent) => void;
}) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* Header */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="p-2 text-sm font-medium">Time</div>
          {weekData.days.map((day, index) => (
            <div key={index} className="p-2 text-sm font-medium text-center border-b">
              <div>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="text-xs text-gray-500">
                {new Date(day.date).getDate()}
              </div>
              {day.hasConflicts && (
                <AlertTriangle className="w-3 h-3 text-red-500 mx-auto mt-1" />
              )}
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="space-y-1">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-1">
              <div className="p-2 text-sm text-gray-600 border-r">
                {hour}:00
              </div>
              {weekData.days.map((day, dayIndex) => {
                const slotStart = new Date(day.date);
                slotStart.setHours(hour, 0, 0, 0);
                const slotEnd = new Date(slotStart);
                slotEnd.setHours(hour + 1);

                const slotEvents = day.slots.filter(slot => {
                  const slotTime = new Date(slot.start);
                  return slotTime.getHours() === hour;
                });

                return (
                  <div 
                    key={dayIndex}
                    className="p-1 min-h-12 border border-gray-200 cursor-pointer hover:bg-gray-50 relative"
                    onClick={() => onTimeSlotClick(slotStart.getTime(), slotEnd.getTime())}
                  >
                    {slotEvents.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`absolute inset-1 p-1 rounded text-xs ${event.color} cursor-pointer z-10`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        {event.opportunity && (
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="w-2 h-2" />
                            <span>{event.opportunity.guestCount}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthView({ 
  monthData, 
  onEventClick 
}: { 
  monthData: any; 
  onEventClick: (event: VenueCalendarEvent) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-2 text-sm font-medium text-center border-b">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {monthData.weeks.map((week: any, weekIndex: number) => 
        week.days.map((day: CalendarDay, dayIndex: number) => (
          <div key={`${weekIndex}-${dayIndex}`} className="min-h-24 p-1 border border-gray-200">
            <div className="text-sm font-medium mb-1">
              {new Date(day.date).getDate()}
              {day.hasConflicts && (
                <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />
              )}
            </div>
            <div className="space-y-1">
              {day.slots.slice(0, 3).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  className={`text-xs p-1 rounded cursor-pointer ${event.color}`}
                  onClick={() => onEventClick(event)}
                >
                  {event.title}
                </div>
              ))}
              {day.slots.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{day.slots.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function StatusLegend() {
  const statuses: Array<{ status: BookingStatus; label: string }> = [
    { status: "AVAILABLE", label: "Available" },
    { status: "TENTATIVE", label: "Tentative" },
    { status: "CONFIRMED", label: "Confirmed" },
    { status: "BLOCKED", label: "Blocked" },
  ];

  return (
    <div className="flex items-center gap-4">
      {statuses.map(({ status, label }) => (
        <div key={status} className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${BOOKING_STATUS_COLORS[status].split(' ')[0]}`} />
          <span className="text-xs">{label}</span>
        </div>
      ))}
    </div>
  );
}

function EventDetailView({ event }: { event: VenueCalendarEvent }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">Event</h4>
        <p className="text-sm text-gray-600">{event.title}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Time</h4>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="w-3 h-3" />
          {event.start.toLocaleString()} - {event.end.toLocaleString()}
        </div>
      </div>

      <div>
        <h4 className="font-medium">Venue</h4>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-3 h-3" />
          {event.venue.name}
        </div>
      </div>

      <div>
        <h4 className="font-medium">Status</h4>
        <Badge variant="outline" className={BOOKING_STATUS_COLORS[event.status]}>
          {event.status}
        </Badge>
      </div>

      {event.opportunity && (
        <div>
          <h4 className="font-medium">Opportunity Details</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Type: {event.opportunity.eventType}</p>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.opportunity.guestCount} guests
            </div>
            <p>Value: €{event.opportunity.value.toLocaleString()}</p>
            {event.opportunity.description && (
              <p>Description: {event.opportunity.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getStatusColor(status: BookingStatus, hasOpportunity: boolean): string {
  if (hasOpportunity) {
    return status === "CONFIRMED" 
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-yellow-100 text-yellow-800 border-yellow-300";
  }
  return BOOKING_STATUS_COLORS[status];
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function generateWeekData(currentDate: Date, events: VenueCalendarEvent[]): CalendarWeek {
  const weekStart = getWeekStart(currentDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const days: CalendarDay[] = [];
  
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    
    const dayEvents = events.filter(event => 
      event.start.toDateString() === dayDate.toDateString()
    );

    days.push({
      date: dayDate.getTime(),
      slots: dayEvents,
      hasConflicts: dayEvents.some(event => event.status === "BLOCKED"),
      totalBookings: dayEvents.filter(event => 
        event.status === "CONFIRMED" || event.status === "TENTATIVE"
      ).length,
    });
  }

  return {
    weekStart: weekStart.getTime(),
    weekEnd: weekEnd.getTime(),
    days,
  };
}

function generateMonthData(currentDate: Date, events: VenueCalendarEvent[]) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const firstWeekStart = getWeekStart(monthStart);
  const lastWeekEnd = new Date(monthEnd);
  lastWeekEnd.setDate(lastWeekEnd.getDate() + (6 - lastWeekEnd.getDay()));

  const weeks = [];
  let currentWeek = new Date(firstWeekStart);

  while (currentWeek <= lastWeekEnd) {
    const weekData = generateWeekData(currentWeek, events);
    weeks.push(weekData);
    currentWeek.setDate(currentWeek.getDate() + 7);
  }

  return { weeks };
}