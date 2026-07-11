import { Link } from 'react-router-dom';
import { Star, Plus, Leaf, Calendar, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  // Get image URL - handle both full URLs and relative paths
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder-product.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return `/uploads/${imagePath}`;
  };

  const mainImage = product.images && product.images.length > 0 
    ? getImageUrl(product.images[0]) 
    : '/placeholder-product.png';

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image Container */}
        <div className="relative aspect-[3/2] sm:aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-product.png';
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isOrganic && (
              <Badge className="bg-green-600 text-white text-xs">
                <Leaf className="w-3 h-3 mr-1" />
                Organik
              </Badge>
            )}
            {product.isSeasonal && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Sezonluk
              </Badge>
            )}
          </div>

          {/* Stock Badge */}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="absolute bottom-2 right-2 bg-orange-500 text-white text-xs">
              Son {product.stock} ürün
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="absolute bottom-2 right-2 bg-red-500 text-white text-xs">
              Stokta Yok
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4">
          {/* Producer Info */}
          <div className="flex items-center gap-2 mb-2">
            {product.producerImage ? (
              <img
                src={getImageUrl(product.producerImage)}
                alt={product.producerName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-xs font-medium">
                  {product.producerName?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-600 truncate">
              {product.producerName}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs sm:text-sm font-medium">{product.rating || 4.5}</span>
            <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
              ({product.reviewCount || 0} değerlendirme)
            </span>
          </div>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between mt-2 sm:mt-3">
            <div>
              <span className="text-base sm:text-xl font-bold text-green-700">
                ₺{product.price}
              </span>
              <span className="text-xs sm:text-sm text-gray-500"> / {product.unit}</span>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Sepete Ekle</span>
              <span className="sm:hidden">Ekle</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
