"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from 'next/link';

type LeadSource = "WEBSITE" | "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "REFERRAL" | "DIRECT" | "OTHER";
type LeadHeat = "COLD" | "WARM" | "HOT";
type ContactStatus = "UNQUALIFIED" | "PROSPECT" | "LEAD" | "QUALIFIED" | "CUSTOMER" | "LOST";

interface ContactListProps {
  onExport?: (filteredContacts: any[]) => void;
}

export function ContactList({ onExport }: ContactListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // State from URL parameters
  const [appliedSearch, setAppliedSearch] = useState(searchParams?.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams?.get('search') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [leadSource, setLeadSource] = useState<LeadSource | ''>(
    (searchParams?.get('leadSource') as LeadSource) || ''
  );
  const [leadHeat, setLeadHeat] = useState<LeadHeat | ''>(
    (searchParams?.get('leadHeat') as LeadHeat) || ''
  );
  const [status, setStatus] = useState<ContactStatus | ''>(
    (searchParams?.get('status') as ContactStatus) || ''
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams?.get('page') || '1')
  );

  const limit = 20;
  const offset = (currentPage - 1) * limit;

  // Query with filters (using appliedSearch, not searchInput)
  const contactsData = useQuery(api.contacts.searchContacts, {
    search: appliedSearch || undefined,
    leadSource: leadSource || undefined,
    leadHeat: leadHeat || undefined,
    status: status || undefined,
    limit,
    offset,
  });

  // Query for search suggestions (limited results for dropdown)
  const suggestionsData = useQuery(api.contacts.searchContacts, {
    search: searchInput.length >= 2 ? searchInput : undefined,
    limit: 10,
    offset: 0,
  });

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (appliedSearch) params.set('search', appliedSearch);
    if (leadSource) params.set('leadSource', leadSource);
    if (leadHeat) params.set('leadHeat', leadHeat);
    if (status) params.set('status', status);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/contacts${newURL}`, { scroll: false });
  }, [appliedSearch, leadSource, leadHeat, status, currentPage, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Handle search input changes
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    setShowSuggestions(value.length >= 2);
  };

  // Apply search (when user selects suggestion or presses Enter)
  const applySearch = (searchValue: string) => {
    setAppliedSearch(searchValue);
    setSearchInput(searchValue);
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (filterType: string, value: any) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'leadSource':
        setLeadSource(value);
        break;
      case 'leadHeat':
        setLeadHeat(value);
        break;
      case 'status':
        setStatus(value);
        break;
    }
  };

  const clearFilters = () => {
    setAppliedSearch('');
    setSearchInput('');
    setLeadSource('');
    setLeadHeat('');
    setStatus('');
    setCurrentPage(1);
    setShowSuggestions(false);
  };

  const handleExport = () => {
    if (onExport && contactsData?.contacts) {
      onExport(contactsData.contacts);
    }
  };

  const totalPages = contactsData ? Math.ceil(contactsData.total / limit) : 0;
  const hasFilters = appliedSearch || leadSource || leadHeat || status;

  if (contactsData === undefined) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Contacts ({contactsData.total})
          </h2>
          <div className="flex gap-2">
            {onExport && (
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applySearch(searchInput);
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false);
                }
              }}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestionsData && suggestionsData.contacts.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {suggestionsData.contacts.map((contact) => (
                  <button
                    key={contact._id}
                    onClick={() => applySearch(contact.name)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.email}</div>
                  </button>
                ))}
                {searchInput && !suggestionsData.contacts.some(c => 
                  c.name.toLowerCase() === searchInput.toLowerCase() || 
                  c.email.toLowerCase() === searchInput.toLowerCase()
                ) && (
                  <button
                    onClick={() => applySearch(searchInput)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-t border-gray-200"
                  >
                    <div className="text-blue-600">Search for "{searchInput}"</div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Lead Source Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Source
            </label>
            <select
              value={leadSource}
              onChange={(e) => handleFilterChange('leadSource', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Sources</option>
              <option value="WEBSITE">Website</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="REFERRAL">Referral</option>
              <option value="DIRECT">Direct</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Lead Heat Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Heat
            </label>
            <select
              value={leadHeat}
              onChange={(e) => handleFilterChange('leadHeat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Heat Levels</option>
              <option value="HOT">Hot</option>
              <option value="WARM">Warm</option>
              <option value="COLD">Cold</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="UNQUALIFIED">Unqualified</option>
              <option value="PROSPECT">Prospect</option>
              <option value="LEAD">Lead</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CUSTOMER">Customer</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {contactsData.total} results found
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {contactsData.contacts.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contactsData.contacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.company || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.leadSource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      contact.leadHeat === 'HOT' ? 'bg-red-100 text-red-800' :
                      contact.leadHeat === 'WARM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {contact.leadHeat}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/contacts/${contact._id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {hasFilters ? 'No contacts found matching your filters.' : 'No contacts yet.'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters to see all contacts
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {offset + 1} to {Math.min(offset + limit, contactsData.total)} of {contactsData.total} contacts
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}