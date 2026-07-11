import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Truck, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { useAppStore } from '@/store/appStore';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function HomePage() {
  const { products, fetchProducts } = useAppStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Featured products (first 4 active products)
  const featuredProducts = products
    .filter(p => p.isActive !== false)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Universal Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-10 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
            <div>
              <h1 className="text-2xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-6">
                Doğal Ürünler,<br />
                <span className="text-green-700">Doğrudan Üreticiden</span>
              </h1>
              <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-8">
                Taze, organik ve kaliteli ürünleri yerel üreticilerden alın. 
                Sağlıklı yaşam için doğal seçim.
              </p>
              <div className="flex gap-3 md:gap-4">
                <Link to="/products">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 md:h-11 md:px-6 md:text-base">
                    Ürünleri Keşfet
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/producers">
                  <Button size="sm" variant="outline" className="md:h-11 md:px-6 md:text-base">
                    Üreticilerimiz
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="/hero-image.jpg" 
                alt="Organik ürünler"
                className="rounded-2xl shadow-xl w-full object-cover h-[400px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <Leaf className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">100% Organik</h3>
              <p className="text-xs md:text-sm text-gray-500">Sertifikalı organik ürünler</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <Truck className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Hızlı Teslimat</h3>
              <p className="text-xs md:text-sm text-gray-500">Aynı gün kapınıza teslim</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Güvenilir</h3>
              <p className="text-xs md:text-sm text-gray-500">Doğrulanmış üreticiler</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">7/24 Destek</h3>
              <p className="text-xs md:text-sm text-gray-500">Her zaman yanınızdayız</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-4 md:mb-8">
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-gray-900">Öne Çıkan Ürünler</h2>
              <p className="text-gray-500 mt-1 text-xs md:text-base">Bu haftanın en popüler ürünleri</p>
            </div>
            <Link to="/products" className="text-green-600 hover:text-green-700 flex items-center">
              Tümünü Gör
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
