import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { producerApi } from '@/lib/api';
import type { Producer } from '@/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function ProducersPage() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducers();
  }, []);

  const loadProducers = async () => {
    try {
      const response = await producerApi.getAll();
      setProducers(response.data || []);
    } catch (error) {
      console.error('Error loading producers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Universal Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Değerli Üreticilerimiz</h1>
          <p className="text-sm text-gray-500 mt-1">Emeğini sevgiyle harmanlayan yerel çiftçilerimiz ve üretici kooperatiflerimiz</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
            <span className="ml-3 text-gray-500 font-medium">Üreticiler yükleniyor...</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {producers.map((producer) => (
              <Link key={producer.id} to={`/producer/${producer.id}`} className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-6 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-start gap-4">
                      <img
                        src={producer.image || '/placeholder-avatar.png'}
                        alt={producer.name}
                        className="w-16 h-16 rounded-full object-cover border border-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">{producer.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {producer.location?.city || 'Şehir'}, {producer.location?.district || 'İlçe'}
                        </div>
                        <div className="flex items-center mt-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold ml-1">{producer.rating || 4.5}</span>
                          <span className="text-sm text-gray-500 ml-1">({producer.reviewCount || 0} değerlendirme)</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-4 line-clamp-3 leading-relaxed">{producer.story}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-500">{(producer as any).products?.length || 5} Aktif Ürün</span>
                    <span className="text-green-600 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                      Hikayeyi & Ürünleri Gör <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
