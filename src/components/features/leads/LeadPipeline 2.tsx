import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreHorizontalIcon, UserIcon, MailIcon, PhoneIcon, BuildingIcon,
  ThermometerIcon, CalendarIcon, TrendingUpIcon, MessageSquareIcon,
  FilterIcon, RefreshCwIcon
} from 'lucide-react';
import { getLeadHeatColor, getHeatEmoji, getLeadHeatStylesFromScore } from '@/lib/utils/leadHeatCalculator';
import type { Contact, ContactStatus, LeadHeat } from '@/lib/types/contact';
import { format } from 'date-fns';

interface PipelineColumn {
  id: ContactStatus;
  title: string;
  description: string;
  color: string;
  contacts: Contact[];
}

interface DraggedContact {
  id: string;
  contact: Contact;
}

const PIPELINE_STAGES: Omit<PipelineColumn, 'contacts'>[] = [
  {
    id: 'UNQUALIFIED',
    title: 'Unqualified',
    description: 'New leads to be qualified',
    color: 'bg-gray-100 border-gray-300'
  },
  {
    id: 'PROSPECT',
    title: 'Prospect',
    description: 'Potential leads showing interest',
    color: 'bg-blue-100 border-blue-300'
  },
  {
    id: 'LEAD',
    title: 'Lead',
    description: 'Qualified leads in nurturing',
    color: 'bg-yellow-100 border-yellow-300'
  },
  {
    id: 'QUALIFIED',
    title: 'Qualified',
    description: 'Ready for proposal/demo',
    color: 'bg-orange-100 border-orange-300'
  },
  {
    id: 'CUSTOMER',
    title: 'Customer',
    description: 'Converted leads',
    color: 'bg-green-100 border-green-300'
  },
  {
    id: 'LOST',
    title: 'Lost',
    description: 'Leads that didn\'t convert',
    color: 'bg-red-100 border-red-300'
  }
];

export function LeadPipeline() {
  const [activeContact, setActiveContact] = useState<DraggedContact | null>(null);
  const [filter, setFilter] = useState<{
    heat?: LeadHeat;
    source?: string;
  }>({});

  // Fetch all contacts
  const allContacts = useQuery(api.contacts.getAllContacts);
  
  // Mutation to update contact status
  const updateContactStatus = useMutation(api.contacts.updateContactStatus);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Organize contacts into pipeline columns
  const pipelineData: PipelineColumn[] = useMemo(() => {
    if (!allContacts) return PIPELINE_STAGES.map(stage => ({ ...stage, contacts: [] }));

    // Filter contacts based on current filters
    let filteredContacts = [...allContacts];
    
    if (filter.heat) {
      filteredContacts = filteredContacts.filter(c => c.leadHeat === filter.heat);
    }
    if (filter.source) {
      filteredContacts = filteredContacts.filter(c => c.leadSource === filter.source);
    }

    return PIPELINE_STAGES.map(stage => ({
      ...stage,
      contacts: filteredContacts
        .filter(contact => contact.status === stage.id)
        .sort((a, b) => {
          // Sort by heat score (descending), then by creation date (newest first)
          const heatDiff = (b.leadHeatScore || 0) - (a.leadHeatScore || 0);
          if (heatDiff !== 0) return heatDiff;
          return b.createdAt - a.createdAt;
        })
    }));
  }, [allContacts, filter]);

  // Calculate pipeline metrics
  const metrics = useMemo(() => {
    const totalContacts = allContacts?.length || 0;
    const conversionRate = totalContacts > 0 
      ? ((allContacts?.filter(c => c.status === 'CUSTOMER').length || 0) / totalContacts) * 100 
      : 0;
    
    const avgTimeInPipeline = 0; // TODO: Calculate based on status change history
    const hotLeadsInPipeline = allContacts?.filter(c => 
      c.leadHeat === 'HOT' && !['CUSTOMER', 'LOST'].includes(c.status)
    ).length || 0;

    return {
      totalContacts,
      conversionRate: conversionRate.toFixed(1),
      avgTimeInPipeline,
      hotLeadsInPipeline
    };
  }, [allContacts]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const contact = allContacts?.find(c => c._id === active.id);
    if (contact) {
      setActiveContact({
        id: active.id as string,
        contact
      });
    }
  }, [allContacts]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !activeContact) {
      setActiveContact(null);
      return;
    }

    const newStatus = over.id as ContactStatus;
    const contact = activeContact.contact;

    // Only update if status actually changed
    if (contact.status !== newStatus) {
      try {
        await updateContactStatus({
          contactId: contact._id,
          status: newStatus
        });
      } catch (error) {
        console.error('Failed to update contact status:', error);
        // TODO: Show error toast
      }
    }

    setActiveContact(null);
  }, [activeContact, updateContactStatus]);

  const clearFilters = () => {
    setFilter({});
  };

  if (!allContacts) {
    return <PipelineSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
          <p className="text-gray-600">Drag and drop leads between pipeline stages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{metrics.totalContacts}</p>
              </div>
              <UserIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold">{metrics.hotLeadsInPipeline}</p>
              </div>
              <ThermometerIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Pipeline Time</p>
                <p className="text-2xl font-bold">{metrics.avgTimeInPipeline}d</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Pipeline Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <Button
                variant={filter.heat === 'HOT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(prev => ({ 
                  ...prev, 
                  heat: prev.heat === 'HOT' ? undefined : 'HOT' 
                }))}
              >
                🔥 Hot Leads
              </Button>
              <Button
                variant={filter.heat === 'WARM' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(prev => ({ 
                  ...prev, 
                  heat: prev.heat === 'WARM' ? undefined : 'WARM' 
                }))}
              >
                🌤️ Warm Leads
              </Button>
              <Button
                variant={filter.heat === 'COLD' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(prev => ({ 
                  ...prev, 
                  heat: prev.heat === 'COLD' ? undefined : 'COLD' 
                }))}
              >
                ❄️ Cold Leads
              </Button>
            </div>
            
            {(filter.heat || filter.source) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {pipelineData.map((column) => (
            <PipelineColumn
              key={column.id}
              column={column}
              contacts={column.contacts}
            />
          ))}
        </div>

        <DragOverlay>
          {activeContact ? (
            <ContactCard contact={activeContact.contact} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Pipeline Column Component
interface PipelineColumnProps {
  column: PipelineColumn;
  contacts: Contact[];
}

function PipelineColumn({ column, contacts }: PipelineColumnProps) {
  return (
    <Card className={`${column.color} min-h-[600px]`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{column.title}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {contacts.length}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm">
          {column.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <SortableContext
          items={contacts.map(contact => contact._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {contacts.map((contact) => (
              <DroppableArea key={contact._id} id={column.id}>
                <SortableContactCard contact={contact} />
              </DroppableArea>
            ))}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

// Droppable Area Component
interface DroppableAreaProps {
  id: ContactStatus;
  children: React.ReactNode;
}

function DroppableArea({ id, children }: DroppableAreaProps) {
  return (
    <div>
      {children}
    </div>
  );
}

// Sortable Contact Card Component
interface SortableContactCardProps {
  contact: Contact;
}

function SortableContactCard({ contact }: SortableContactCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contact._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <ContactCard contact={contact} isDragging={isDragging} />
    </div>
  );
}

// Contact Card Component
interface ContactCardProps {
  contact: Contact;
  isDragging?: boolean;
}

function ContactCard({ contact, isDragging = false }: ContactCardProps) {
  const heatStyles = getLeadHeatStylesFromScore(contact.leadHeatScore || 0);
  const heatEmoji = getHeatEmoji(contact.leadHeat);

  return (
    <Card className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
      isDragging ? 'shadow-lg rotate-2' : ''
    }`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {contact.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {contact.email}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <span className="text-lg">{heatEmoji}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${heatStyles.badge}`}
              >
                {contact.leadHeatScore || 0}
              </Badge>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            {contact.company && (
              <div className="flex items-center text-sm text-gray-600">
                <BuildingIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{contact.company}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{contact.phone}</span>
              </div>
            )}
          </div>

          {/* Lead Source */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {contact.leadSource}
            </Badge>
            <span className="text-xs text-gray-400">
              {format(new Date(contact.createdAt), 'MMM d')}
            </span>
          </div>

          {/* Heat Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${heatStyles.progress}`}
              style={{ 
                width: `${Math.min((contact.leadHeatScore || 0) / 25 * 100, 100)}%` 
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
              <MessageSquareIcon className="h-3 w-3 mr-1" />
              Contact
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
              <MoreHorizontalIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pipeline Skeleton Component
function PipelineSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-96 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Avatar Component (if not available)
function Avatar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-full bg-gray-100 ${className}`}>
      {children}
    </div>
  );
}

function AvatarFallback({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-gray-700">{children}</span>;
}