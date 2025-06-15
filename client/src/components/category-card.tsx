import { Link } from 'wouter';
import { Category } from '@shared/schema';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`} className="group">
      <div className="relative overflow-hidden rounded-lg aspect-square mb-2">
        <img 
          src={category.imageUrl} 
          alt={`${category.name} category`} 
          className="w-full h-full object-cover transition-all group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all"></div>
      </div>
      <h3 className="font-accent text-center font-medium">{category.name}</h3>
    </Link>
  );
}
