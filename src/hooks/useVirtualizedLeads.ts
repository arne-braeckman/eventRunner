import { useMemo, useState, useCallback } from 'react';
import type { Contact } from '@/lib/types/contact';

interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  buffer: number; // Number of items to render outside visible area
}

interface VirtualizedResult {
  visibleItems: Contact[];
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  scrollHandler: (scrollTop: number) => void;
}

/**
 * Hook for virtualizing large lists of leads for better performance
 * Renders only visible items plus a buffer to prevent blank spaces during scrolling
 */
export function useVirtualizedLeads(
  items: Contact[],
  config: VirtualizationConfig
): VirtualizedResult {
  const [scrollTop, setScrollTop] = useState(0);

  const { itemHeight, containerHeight, buffer } = config;

  const virtualizedData = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);
    
    // Add buffer to prevent blank spaces
    const startIndex = Math.max(0, visibleStart - buffer);
    const endIndex = Math.min(items.length, visibleEnd + buffer);
    
    const visibleItems = items.slice(startIndex, endIndex);

    return {
      visibleItems,
      totalHeight,
      startIndex,
      endIndex,
      offsetY: startIndex * itemHeight
    };
  }, [items, scrollTop, itemHeight, containerHeight, buffer]);

  const scrollHandler = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
  }, []);

  return {
    visibleItems: virtualizedData.visibleItems,
    totalHeight: virtualizedData.totalHeight,
    startIndex: virtualizedData.startIndex,
    endIndex: virtualizedData.endIndex,
    scrollHandler
  };
}

/**
 * Hook for intelligent pagination of lead data
 * Automatically loads more data when approaching the end of current page
 */
export function useInfinitePagination<T>(
  data: T[],
  pageSize: number = 50,
  threshold: number = 10 // Items before end to trigger load
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const paginatedData = useMemo(() => {
    return data.slice(0, currentPage * pageSize);
  }, [data, currentPage, pageSize]);

  const loadMore = useCallback(async () => {
    if (isLoading || paginatedData.length >= data.length) return;
    
    setIsLoading(true);
    // Simulate async loading - in real app this would fetch from server
    await new Promise(resolve => setTimeout(resolve, 300));
    setCurrentPage(prev => prev + 1);
    setIsLoading(false);
  }, [isLoading, paginatedData.length, data.length]);

  const shouldLoadMore = useCallback((visibleEndIndex: number) => {
    const remainingItems = paginatedData.length - visibleEndIndex;
    return remainingItems <= threshold && paginatedData.length < data.length;
  }, [paginatedData.length, data.length, threshold]);

  return {
    paginatedData,
    isLoading,
    loadMore,
    shouldLoadMore,
    hasMore: paginatedData.length < data.length,
    currentPage
  };
}