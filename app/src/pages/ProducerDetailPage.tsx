import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Star, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { producerApi, productApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import type { Producer, Product } from '@/types';

export function ProducerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [producerRes, productsRes] = await Promise.all([
        producerApi.getById(parseInt(id!)),
        productApi.getByProducer(parseInt(id!)),
      ]);
      setProducer(producerRes.data || producerRes);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Yükleniyor...</div>;
  }

  if (!producer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Üretici bulunamadı</p>
        <Link to="/producers">
          <Button>Üreticilere Dön</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <Link to="/producers" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Tüm Üreticiler
          </Link>
        </div>
      </header>

      {/* Producer Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            <img
              src={producer.image || '/placeholder-avatar.png'}
              alt={producer.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{producer.name}</h1>
                {producer.isVerified && (
                  <Badge className="bg-green-600">Doğrulanmış</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {producer.location?.city}</span>
                <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-400" /> {producer.rating || 4.5}</span>
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(producer.createdAt).getFullYear()}'den beri</span>
              </div>
              <p className="text-gray-600 mt-4">{producer.story}</p>
              <div className="flex gap-4 mt-4 text-sm text-gray-500">
                {producer.email && <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {producer.email}</span>}
                {producer.phone && <span className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {producer.phone}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6">Üreticinin Ürünleri ({products.length})</h2>
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Henüz ürün eklenmemiş</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
