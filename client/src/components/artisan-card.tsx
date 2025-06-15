import { Link } from 'wouter';
import { Artisan } from '@shared/schema';

interface ArtisanCardProps {
  artisan: Artisan;
}

export function ArtisanCard({ artisan }: ArtisanCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg">
      <div className="aspect-video overflow-hidden">
        <img 
          src={artisan.imageUrl} 
          alt={`${artisan.name} - ${artisan.businessName}`} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="font-heading font-bold text-xl mb-2">{artisan.name}</h3>
        <p className="text-accent font-medium mb-3">{artisan.businessName}</p>
        <p className="text-gray-600 mb-4">{artisan.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {artisan.tags.map((tag, index) => (
            <span key={index} className="bg-secondary bg-opacity-50 text-primary-dark text-xs px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <Link 
          href={`/artisans/${artisan.id}`}
          className="text-primary hover:text-primary-dark font-medium flex items-center"
        >
          View {artisan.name.split(' ')[0]}'s Collection <i className="ri-arrow-right-line ml-1"></i>
        </Link>
      </div>
    </div>
  );
}
