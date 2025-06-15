import { useState, useCallback } from 'react';
import { ProductFilter } from '@shared/schema';

export function useFilter() {
  const [filters, setFilters] = useState<ProductFilter>({
    categoryIds: [],
    artisanIds: [],
    priceRanges: [],
    searchQuery: '',
    isCustomizable: undefined
  });
  
  const [appliedFilters, setAppliedFilters] = useState<ProductFilter>({
    categoryIds: [],
    artisanIds: [],
    priceRanges: [],
    searchQuery: '',
    isCustomizable: undefined
  });

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const toggleCategory = useCallback((categoryId: number) => {
    setFilters(prev => {
      const currentCategories = prev.categoryIds || [];
      return {
        ...prev,
        categoryIds: currentCategories.includes(categoryId)
          ? currentCategories.filter(id => id !== categoryId)
          : [...currentCategories, categoryId]
      };
    });
  }, []);

  const toggleArtisan = useCallback((artisanId: number) => {
    setFilters(prev => {
      const currentArtisans = prev.artisanIds || [];
      return {
        ...prev,
        artisanIds: currentArtisans.includes(artisanId)
          ? currentArtisans.filter(id => id !== artisanId)
          : [...currentArtisans, artisanId]
      };
    });
  }, []);

  const togglePriceRange = useCallback((range: [number, number]) => {
    setFilters(prev => {
      const currentRanges = prev.priceRanges || [];
      const exists = currentRanges.some(([min, max]) => min === range[0] && max === range[1]);
      
      return {
        ...prev,
        priceRanges: exists
          ? currentRanges.filter(([min, max]) => !(min === range[0] && max === range[1]))
          : [...currentRanges, range]
      };
    });
  }, []);

  const toggleCustomizable = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      isCustomizable: prev.isCustomizable === undefined ? true : undefined
    }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters({
      categoryIds: [],
      artisanIds: [],
      priceRanges: [],
      searchQuery: '',
      isCustomizable: undefined
    });
    setAppliedFilters({
      categoryIds: [],
      artisanIds: [],
      priceRanges: [],
      searchQuery: '',
      isCustomizable: undefined
    });
  }, []);

  return {
    filters,
    appliedFilters,
    setSearchQuery,
    toggleCategory,
    toggleArtisan,
    togglePriceRange,
    toggleCustomizable,
    applyFilters,
    resetFilters
  };
}
