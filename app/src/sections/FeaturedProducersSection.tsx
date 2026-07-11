import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProducerCard } from '@/components/ProducerCard';
import { useAppStore } from '@/store/appStore';

export function FeaturedProducersSection() {
  const { producers } = useAppStore();
  
  // En yüksek puanlı 3 üreticiyi göster
  const featuredProducers = [...producers]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <section className="bg-gradient-to-b from-green-50 to-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
              Öne Çıkan Üreticiler
            </h2>
            <p className="text-lg text-gray-600">
              Güvenilir, denenmiş yerel üreticilerimiz
            </p>
          </div>
          <Link
            to="/ureticiler"
            className="hidden items-center gap-1 text-sm font-medium text-green-600 hover:underline sm:flex"
          >
            Tüm Üreticiler
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducers.map((producer) => (
            <ProducerCard key={producer.id} producer={producer} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/ureticiler"
            className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:underline"
          >
            Tüm Üreticiler
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
