import { Link } from 'react-router-dom';
import { Star, MapPin, Package, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Producer } from '@/types';

interface ProducerCardProps {
  producer: Producer;
}

export function ProducerCard({ producer }: ProducerCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border bg-white transition-all duration-300 hover:shadow-lg">
      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-r from-green-100 to-green-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-20">🌾</span>
        </div>
      </div>

      {/* Profile Section */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-12 mb-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md">
            <img
              src={producer.image}
              alt={producer.name}
              className="h-full w-full object-cover"
            />
          </div>
          {producer.isVerified && (
            <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
              <BadgeCheck className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mb-4">
          <h3 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-green-600">
            {producer.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            {producer.location.city}, {producer.location.district}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">
              {producer.rating}
            </span>
            <span className="text-xs text-gray-400">({producer.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Package className="h-4 w-4" />
            {producer.products.length} ürün
          </div>
        </div>

        {/* Story Preview */}
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">
          {producer.story}
        </p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1">
          {producer.isVerified && (
            <Badge variant="secondary" className="text-xs">
              Doğrulanmış Üretici
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {producer.location.city}
          </Badge>
        </div>

        {/* CTA */}
        <Link to={`/uretici/${producer.id}`}>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            Ürünleri Gör
          </Button>
        </Link>
      </div>
    </div>
  );
}
