import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LeadSource, LeadHeat, ContactStatus } from '~/lib/types/contact';

export interface ContactFilters {
  search: string;
  leadSource: LeadSource | '';
  leadHeat: LeadHeat | '';
  status: ContactStatus | '';
  geographicLocation: string;
  preferredEventType: string;
}

export function useContactFilters(limit: number = 20) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL parameters
  const [appliedSearch, setAppliedSearch] = useState(searchParams?.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams?.get('search') || '');
  const [leadSource, setLeadSource] = useState<LeadSource | ''>(
    (searchParams?.get('leadSource') as LeadSource) || ''
  );
  const [leadHeat, setLeadHeat] = useState<LeadHeat | ''>(
    (searchParams?.get('leadHeat') as LeadHeat) || ''
  );
  const [status, setStatus] = useState<ContactStatus | ''>(
    (searchParams?.get('status') as ContactStatus) || ''
  );
  const [geographicLocation, setGeographicLocation] = useState<string>(
    searchParams?.get('geographicLocation') || ''
  );
  const [preferredEventType, setPreferredEventType] = useState<string>(
    searchParams?.get('preferredEventType') || ''
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams?.get('page') || '1')
  );

  const offset = useMemo(() => (currentPage - 1) * limit, [currentPage, limit]);

  const filters = useMemo<ContactFilters>(() => ({
    search: appliedSearch,
    leadSource,
    leadHeat,
    status,
    geographicLocation,
    preferredEventType
  }), [appliedSearch, leadSource, leadHeat, status, geographicLocation, preferredEventType]);

  const hasFilters = useMemo(() => 
    appliedSearch || leadSource || leadHeat || status || geographicLocation || preferredEventType,
    [appliedSearch, leadSource, leadHeat, status, geographicLocation, preferredEventType]
  );

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (appliedSearch) params.set('search', appliedSearch);
    if (leadSource) params.set('leadSource', leadSource);
    if (leadHeat) params.set('leadHeat', leadHeat);
    if (status) params.set('status', status);
    if (geographicLocation) params.set('geographicLocation', geographicLocation);
    if (preferredEventType) params.set('preferredEventType', preferredEventType);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/contacts${newURL}`, { scroll: false });
  }, [appliedSearch, leadSource, leadHeat, status, geographicLocation, preferredEventType, currentPage, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const handleFilterChange = useCallback((filterType: keyof Omit<ContactFilters, 'search'>, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'leadSource':
        setLeadSource(value as LeadSource | '');
        break;
      case 'leadHeat':
        setLeadHeat(value as LeadHeat | '');
        break;
      case 'status':
        setStatus(value as ContactStatus | '');
        break;
      case 'geographicLocation':
        setGeographicLocation(value);
        break;
      case 'preferredEventType':
        setPreferredEventType(value);
        break;
    }
  }, []);

  const applySearch = useCallback((searchValue: string) => {
    setAppliedSearch(searchValue);
    setSearchInput(searchValue);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setAppliedSearch('');
    setSearchInput('');
    setLeadSource('');
    setLeadHeat('');
    setStatus('');
    setGeographicLocation('');
    setPreferredEventType('');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    // Filter state
    filters,
    searchInput,
    currentPage,
    offset,
    hasFilters,
    
    // Filter actions
    setSearchInput,
    handleFilterChange,
    applySearch,
    clearFilters,
    handlePageChange,
    
    // Pagination helpers
    goToNextPage: useCallback(() => setCurrentPage(prev => prev + 1), []),
    goToPrevPage: useCallback(() => setCurrentPage(prev => Math.max(1, prev - 1)), []),
  };
}