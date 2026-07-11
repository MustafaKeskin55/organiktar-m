import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'compact';
}

export function CategoryCard({ category, variant = 'default' }: CategoryCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        to={`/urunler?kategori=${category.slug}`}
        className="group flex items-center gap-3 rounded-lg border bg-white p-3 transition-all hover:border-green-300 hover:shadow-sm"
      >
        <div className="h-12 w-12 overflow-hidden rounded-lg">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-600">
            {category.name}
          </h3>
          <p className="text-xs text-gray-500">{category.productCount} ürün</p>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-green-600" />
      </Link>
    );
  }

  return (
    <Link
      to={`/urunler?kategori=${category.slug}`}
      className="group relative overflow-hidden rounded-xl"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="mb-1 text-lg font-semibold text-white group-hover:text-green-300">
          {category.name}
        </h3>
        <p className="text-sm text-white/80 line-clamp-1">{category.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-white/60">{category.productCount} ürün</span>
          <ArrowRight className="h-4 w-4 text-white/60 transition-all group-hover:translate-x-1 group-hover:text-green-300" />
        </div>
      </div>
    </Link>
  );
}
