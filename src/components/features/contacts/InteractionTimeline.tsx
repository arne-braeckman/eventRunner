import { useState, useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CalendarIcon, 
  FilterIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  PhoneIcon,
  MailIcon,
  MessageSquareIcon,
  MousePointerClickIcon,
  UsersIcon,
  QuoteIcon,
  MapPinIcon,
  EyeIcon,
  PlusIcon,
  MoreHorizontalIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { INTERACTION_TYPE_OPTIONS, SOCIAL_PLATFORM_OPTIONS } from '@/lib/types/contact';
import type { InteractionType, SocialPlatform } from '@/lib/types/contact';

export interface TimelineInteraction {
  _id: string;
  contactId: string;
  type: InteractionType;
  platform?: SocialPlatform;
  description?: string;
  metadata: Record<string, any>;
  createdAt: number;
  createdBy?: string;
}

interface InteractionTimelineProps {
  interactions: TimelineInteraction[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showFilters?: boolean;
  contactName?: string;
  className?: string;
}

interface TimelineFilters {
  type?: InteractionType;
  platform?: SocialPlatform;
  dateRange?: 'all' | '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export function InteractionTimeline({
  interactions,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  showFilters = true,
  contactName,
  className
}: InteractionTimelineProps) {
  const [filters, setFilters] = useState<TimelineFilters>({
    dateRange: 'all'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter interactions based on current filters
  const filteredInteractions = useMemo(() => {
    let filtered = [...interactions];

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(interaction => interaction.type === filters.type);
    }

    // Filter by platform
    if (filters.platform) {
      filtered = filtered.filter(interaction => interaction.platform === filters.platform);
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = Date.now();
      let cutoffDate: number;

      switch (filters.dateRange) {
        case '7d':
          cutoffDate = now - (7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoffDate = now - (30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          cutoffDate = now - (90 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          if (filters.startDate) {
            const startTime = new Date(filters.startDate).getTime();
            filtered = filtered.filter(interaction => interaction.createdAt >= startTime);
          }
          if (filters.endDate) {
            const endTime = new Date(filters.endDate).getTime() + (24 * 60 * 60 * 1000); // End of day
            filtered = filtered.filter(interaction => interaction.createdAt <= endTime);
          }
          return filtered;
        default:
          return filtered;
      }

      filtered = filtered.filter(interaction => interaction.createdAt >= cutoffDate);
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(interaction => 
        interaction.description?.toLowerCase().includes(searchTerm) ||
        interaction.type.toLowerCase().includes(searchTerm) ||
        interaction.platform?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [interactions, filters]);

  const getInteractionIcon = (type: InteractionType, platform?: SocialPlatform) => {
    switch (type) {
      case 'PHONE_CALL':
        return <PhoneIcon className="h-4 w-4" />;
      case 'EMAIL_OPEN':
      case 'EMAIL_CLICK':
        return <MailIcon className="h-4 w-4" />;
      case 'SOCIAL_MESSAGE':
        return <MessageSquareIcon className="h-4 w-4" />;
      case 'WEBSITE_VISIT':
        return <MousePointerClickIcon className="h-4 w-4" />;
      case 'MEETING':
        return <UsersIcon className="h-4 w-4" />;
      case 'PRICE_QUOTE':
        return <QuoteIcon className="h-4 w-4" />;
      case 'SITE_VISIT':
        return <MapPinIcon className="h-4 w-4" />;
      case 'INFO_REQUEST':
        return <EyeIcon className="h-4 w-4" />;
      default:
        return <PlusIcon className="h-4 w-4" />;
    }
  };

  const getInteractionTypeLabel = (type: InteractionType) => {
    const option = INTERACTION_TYPE_OPTIONS.find(opt => opt.value === type);
    return option?.label || type;
  };

  const getPlatformLabel = (platform?: SocialPlatform) => {
    if (!platform) return null;
    const option = SOCIAL_PLATFORM_OPTIONS.find(opt => opt.value === platform);
    return option?.label || platform;
  };

  const getInteractionWeight = (type: InteractionType) => {
    const option = INTERACTION_TYPE_OPTIONS.find(opt => opt.value === type);
    return option?.weight || 0;
  };

  const resetFilters = () => {
    setFilters({ dateRange: 'all' });
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = filters.type || filters.platform || filters.dateRange !== 'all' || filters.search;

  if (isLoading && interactions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Interaction Timeline</CardTitle>
          <CardDescription>Loading interaction history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Interaction Timeline</CardTitle>
            <CardDescription>
              {contactName ? `Interaction history for ${contactName}` : 'Interaction history'}
              {filteredInteractions.length !== interactions.length && (
                <span className="ml-2">
                  ({filteredInteractions.length} of {interactions.length} shown)
                </span>
              )}
            </CardDescription>
          </div>
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
              {showAdvancedFilters ? (
                <ChevronUpIcon className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              )}
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && showAdvancedFilters && (
          <div className="pt-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Interaction Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type-filter">Interaction Type</Label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      type: value === 'all' ? undefined : value as InteractionType 
                    }))
                  }
                >
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {INTERACTION_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform Filter */}
              <div className="space-y-2">
                <Label htmlFor="platform-filter">Platform</Label>
                <Select
                  value={filters.platform || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      platform: value === 'all' ? undefined : value as SocialPlatform 
                    }))
                  }
                >
                  <SelectTrigger id="platform-filter">
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All platforms</SelectItem>
                    {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label htmlFor="date-filter">Date Range</Label>
                <Select
                  value={filters.dateRange || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      dateRange: value as TimelineFilters['dateRange']
                    }))
                  }
                >
                  <SelectTrigger id="date-filter">
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Filter */}
              <div className="space-y-2">
                <Label htmlFor="search-filter">Search</Label>
                <Input
                  id="search-filter"
                  placeholder="Search interactions..."
                  value={filters.search || ''}
                  onChange={(e) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      search: e.target.value || undefined 
                    }))
                  }
                />
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => 
                      setFilters(prev => ({ 
                        ...prev, 
                        startDate: e.target.value || undefined 
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => 
                      setFilters(prev => ({ 
                        ...prev, 
                        endDate: e.target.value || undefined 
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Filter Actions */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredInteractions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquareIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasActiveFilters ? 'No matching interactions' : 'No interactions yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more results.'
                : 'Interactions will appear here as they occur.'
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>

              {/* Timeline items */}
              <div className="space-y-6">
                {filteredInteractions.map((interaction, index) => (
                  <div key={interaction._id} className="relative flex items-start space-x-4">
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-sm">
                        {getInteractionIcon(interaction.type, interaction.platform)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {getInteractionTypeLabel(interaction.type)}
                            </Badge>
                            {interaction.platform && (
                              <Badge variant="outline" className="text-xs">
                                {getPlatformLabel(interaction.platform)}
                              </Badge>
                            )}
                            <span className="text-xs text-green-600 font-medium">
                              +{getInteractionWeight(interaction.type)} pts
                            </span>
                          </div>
                          
                          {interaction.description && (
                            <p className="text-sm text-gray-900 mb-2">
                              {interaction.description}
                            </p>
                          )}

                          {/* Metadata */}
                          {interaction.metadata && Object.keys(interaction.metadata).length > 0 && (
                            <div className="text-xs text-gray-500 space-y-1">
                              {interaction.metadata.source && (
                                <div>Source: {interaction.metadata.source}</div>
                              )}
                              {interaction.metadata.entryNotes && (
                                <div>Notes: {interaction.metadata.entryNotes}</div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <CalendarIcon className="h-3 w-3" />
                          <time 
                            dateTime={new Date(interaction.createdAt).toISOString()}
                            title={format(new Date(interaction.createdAt), 'PPpp')}
                          >
                            {formatDistanceToNow(new Date(interaction.createdAt), { addSuffix: true })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Statistics component for interaction analytics
interface InteractionStatsProps {
  interactions: TimelineInteraction[];
  className?: string;
}

export function InteractionStats({ interactions, className }: InteractionStatsProps) {
  const stats = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const monthMs = 30 * 24 * 60 * 60 * 1000;

    const thisWeek = interactions.filter(i => (now - i.createdAt) <= weekMs);
    const thisMonth = interactions.filter(i => (now - i.createdAt) <= monthMs);

    const typeStats = interactions.reduce((acc, interaction) => {
      acc[interaction.type] = (acc[interaction.type] || 0) + 1;
      return acc;
    }, {} as Record<InteractionType, number>);

    const platformStats = interactions.reduce((acc, interaction) => {
      if (interaction.platform) {
        acc[interaction.platform] = (acc[interaction.platform] || 0) + 1;
      }
      return acc;
    }, {} as Record<SocialPlatform, number>);

    const totalScore = (interactions || []).reduce((total, interaction) => {
      const option = INTERACTION_TYPE_OPTIONS.find(opt => opt.value === interaction.type);
      return total + (option?.weight || 0);
    }, 0);

    return {
      total: interactions.length,
      thisWeek: thisWeek.length,
      thisMonth: thisMonth.length,
      totalScore,
      typeStats,
      platformStats,
      mostCommonType: Object.entries(typeStats).sort(([,a], [,b]) => b - a)[0]?.[0],
      mostCommonPlatform: Object.entries(platformStats).sort(([,a], [,b]) => b - a)[0]?.[0],
    };
  }, [interactions]);

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Total Interactions</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.thisWeek}</div>
          <p className="text-xs text-muted-foreground">This Week</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{stats.thisMonth}</div>
          <p className="text-xs text-muted-foreground">This Month</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.totalScore}</div>
          <p className="text-xs text-muted-foreground">Heat Score Points</p>
        </CardContent>
      </Card>
    </div>
  );
}