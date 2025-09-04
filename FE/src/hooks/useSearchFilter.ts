import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from './useDebounce';

export function useSearchFilter<T>(
  items: T[] | undefined,
  searchTerm: string,
  searchFields: (keyof T)[],
  debounceMs: number = 300
) {
  const [inputValue, setInputValue] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(inputValue, debounceMs);

  // Update input value when searchTerm prop changes
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Memoize filtered results to avoid unnecessary recalculations
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!debouncedSearchTerm) return items;

    const lowercasedSearch = debouncedSearchTerm.toLowerCase();
    
    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(lowercasedSearch);
      })
    );
  }, [items, debouncedSearchTerm, searchFields]);

  return {
    filteredItems,
    inputValue,
    setInputValue,
    debouncedSearchTerm
  };
}