import { useState } from 'react';
import { useFilter } from '@/hooks/use-filter';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Category, Artisan } from '@shared/schema';

interface ProductFiltersProps {
  categories: Category[];
  artisans: Artisan[];
}

export function ProductFilters({ categories, artisans }: ProductFiltersProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [artisansOpen, setArtisansOpen] = useState(true);
  
  const { 
    filters, 
    setSearchQuery, 
    toggleCategory, 
    toggleArtisan, 
    togglePriceRange, 
    applyFilters,
    resetFilters
  } = useFilter();

  const priceRanges = [
    { label: 'Under $25', value: [0, 25] },
    { label: '$25 to $50', value: [25, 50] },
    { label: '$50 to $100', value: [50, 100] },
    { label: '$100 to $200', value: [100, 200] },
    { label: '$200 & Above', value: [200, Infinity] }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <div className="bg-neutral p-6 rounded-lg sticky top-24">
      <div className="mb-6">
        <h3 className="font-heading font-bold text-xl mb-3">Search</h3>
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button 
            type="submit"
            variant="ghost" 
            size="icon" 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
          >
            <i className="ri-search-line"></i>
          </Button>
        </form>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-heading font-bold text-xl">Categories</h3>
          <button 
            onClick={() => setCategoriesOpen(!categoriesOpen)} 
            className="text-gray-500 hover:text-primary"
          >
            <i className={`ri-arrow-${categoriesOpen ? 'up' : 'down'}-s-line`}></i>
          </button>
        </div>
        {categoriesOpen && (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`category-${category.id}`} 
                  checked={filters.categoryIds?.includes(category.id) || false}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <Label 
                  htmlFor={`category-${category.id}`}
                  className="cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-heading font-bold text-xl">Price Range</h3>
          <button 
            onClick={() => setPriceOpen(!priceOpen)} 
            className="text-gray-500 hover:text-primary"
          >
            <i className={`ri-arrow-${priceOpen ? 'up' : 'down'}-s-line`}></i>
          </button>
        </div>
        {priceOpen && (
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox 
                  id={`price-${index}`} 
                  checked={filters.priceRanges?.some(([min, max]) => 
                    min === range.value[0] && max === range.value[1]
                  ) || false}
                  onCheckedChange={() => togglePriceRange(range.value as [number, number])}
                />
                <Label 
                  htmlFor={`price-${index}`}
                  className="cursor-pointer"
                >
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-heading font-bold text-xl">Artisan</h3>
          <button 
            onClick={() => setArtisansOpen(!artisansOpen)} 
            className="text-gray-500 hover:text-primary"
          >
            <i className={`ri-arrow-${artisansOpen ? 'up' : 'down'}-s-line`}></i>
          </button>
        </div>
        {artisansOpen && (
          <div className="space-y-2">
            {artisans.map((artisan) => (
              <div key={artisan.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`artisan-${artisan.id}`} 
                  checked={filters.artisanIds?.includes(artisan.id) || false}
                  onCheckedChange={() => toggleArtisan(artisan.id)}
                />
                <Label 
                  htmlFor={`artisan-${artisan.id}`}
                  className="cursor-pointer"
                >
                  {artisan.businessName}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={applyFilters}
          className="flex-1 bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-md transition-all"
        >
          Apply Filters
        </Button>
        
        <Button 
          onClick={resetFilters}
          variant="outline"
          className="bg-white text-accent border-accent hover:bg-accent hover:text-white py-2 px-4 rounded-md transition-all"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
