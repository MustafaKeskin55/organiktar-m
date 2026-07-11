import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CategoryCard } from '@/components/CategoryCard';
import { useAppStore } from '@/store/appStore';

export function CategoriesSection() {
  const { categories } = useAppStore();

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
              Kategoriler
            </h2>
            <p className="text-lg text-gray-600">
              İhtiyacınız olan her kategoride doğal ürünler
            </p>
          </div>
          <Link
            to="/urunler"
            className="hidden items-center gap-1 text-sm font-medium text-green-600 hover:underline sm:flex"
          >
            Tümünü Gör
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/urunler"
            className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:underline"
          >
            Tümünü Gör
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
