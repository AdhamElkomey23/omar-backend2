import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateProductId(length = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function calculateRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Number((sum / ratings.length).toFixed(1));
}

// Function to filter products based on provided filters
export function filterProducts<T extends {
  categoryId: number;
  artisanId: number;
  price: number;
  isCustomizable: boolean;
}>(
  products: T[],
  filters: {
    categoryIds?: number[];
    artisanIds?: number[];
    priceRanges?: [number, number][];
    isCustomizable?: boolean;
    searchQuery?: string;
  }
): T[] {
  return products.filter(product => {
    // Filter by category
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      if (!filters.categoryIds.includes(product.categoryId)) {
        return false;
      }
    }

    // Filter by artisan
    if (filters.artisanIds && filters.artisanIds.length > 0) {
      if (!filters.artisanIds.includes(product.artisanId)) {
        return false;
      }
    }

    // Filter by price range
    if (filters.priceRanges && filters.priceRanges.length > 0) {
      const priceMatch = filters.priceRanges.some(([min, max]) => {
        return product.price >= min && (max === Infinity || product.price <= max);
      });
      if (!priceMatch) {
        return false;
      }
    }

    // Filter by customizable
    if (filters.isCustomizable !== undefined) {
      if (product.isCustomizable !== filters.isCustomizable) {
        return false;
      }
    }

    // Search filtering would be added here, but we're handling search on the server side

    return true;
  });
}
