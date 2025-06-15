import { Link } from 'wouter';
import { useCart } from '@/hooks/use-cart';
import { StarRating } from '@/components/ui/star-rating';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: `product-${product.id}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1
    });
    
    toast({
      title: "Item added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
      <Link href={`/product/${product.id}`} className="block relative overflow-hidden aspect-square">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-all hover:scale-105" 
        />
        {product.isCustomizable && (
          <div className="absolute top-2 right-2 bg-accent text-white text-xs py-1 px-2 rounded">
            Customizable
          </div>
        )}
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-heading font-bold text-lg">{product.name}</h3>
          <span className="font-accent font-medium text-primary">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3">By {product.artisanName}</p>
        <div className="flex items-center mb-3">
          <StarRating 
            rating={product.averageRating} 
            showCount={true} 
            count={product.reviewCount} 
          />
        </div>
        <button 
          onClick={handleAddToCart}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded transition-all flex items-center justify-center"
        >
          <i className="ri-shopping-cart-line mr-2"></i> Add to Cart
        </button>
      </div>
    </div>
  );
}
