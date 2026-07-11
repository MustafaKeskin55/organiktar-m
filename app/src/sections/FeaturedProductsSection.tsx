import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useAppStore } from '@/store/appStore';

export function FeaturedProductsSection() {
  const { products } = useAppStore();
  
  // En yüksek puanlı 4 ürünü göster
  const featuredProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
              Öne Çıkan Ürünler
            </h2>
            <p className="text-lg text-gray-600">
              En çok beğenilen ve tercih edilen ürünler
            </p>
          </div>
          <Link
            to="/urunler"
            className="hidden items-center gap-1 text-sm font-medium text-green-600 hover:underline sm:flex"
          >
            Tüm Ürünler
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/urunler"
            className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:underline"
          >
            Tüm Ürünler
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
