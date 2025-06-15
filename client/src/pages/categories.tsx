import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFilter } from '@/hooks/use-filter';
import { ProductCard } from '@/components/product-card';
import { ProductFilters } from '@/components/product-filters';
import { Button } from '@/components/ui/button';
import { Category, Product, Artisan } from '@shared/schema';
import { filterProducts } from '@/lib/utils';

export default function Categories() {
  const { 
    filters, 
    appliedFilters, 
    applyFilters 
  } = useFilter();

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch all products
  const { 
    data: products = [], 
    isLoading: productsLoading,
    isError: productsError 
  } = useQuery<Product[]>({
    queryKey: ['/api/products', appliedFilters],
  });

  // Fetch artisans
  const { data: artisans = [] } = useQuery<Artisan[]>({
    queryKey: ['/api/artisans'],
  });

  // Apply filters when component mounts to ensure we have the right data
  useEffect(() => {
    applyFilters();
  }, []);

  // Filter products client-side (in addition to server filtering)
  const filteredProducts = filterProducts(products, appliedFilters);

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-3xl font-bold text-center mb-4">All Products</h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Browse our collection of handcrafted artisanal products
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="w-full lg:w-1/4">
            <ProductFilters 
              categories={categories} 
              artisans={artisans}
            />
          </div>
          
          {/* Products grid */}
          <div className="w-full lg:w-3/4">
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-lg p-4">
                    <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : productsError ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Error loading products. Please try again later.</p>
                <Button onClick={() => window.location.reload()}>Refresh</Button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="font-heading text-xl font-bold mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">We couldn't find any products that match your current filters.</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
