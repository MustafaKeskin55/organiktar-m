import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  MapPin, 
  Star, 
  Search, 
  Filter, 
  ShieldCheck, 
  Store,
  ChevronDown
} from 'lucide-react';
import { producerApi } from '@/lib/api';
import type { Producer } from '@/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RichProducer extends Producer {
  coverImage: string;
  specialties: string[];
}

export function ProducersPage() {
  const [producers, setProducers] = useState<RichProducer[]>([]);
  const [filteredProducers, setFilteredProducers] = useState<RichProducer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tümü');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tümü');

  useEffect(() => {
    loadProducers();
  }, []);

  const loadProducers = async () => {
    try {
      const response = await producerApi.getAll();
      const rawProducers = response.data || [];

      // High-quality cover images and specialties mock arrays
      const farmBanners = [
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80'
      ];

      const specialtiesList = [
        ['Zeytinyağı', 'Sabun', 'Kuru Gıda'],
        ['Süt Ürünleri', 'Peynir', 'Tereyağı'],
        ['Sebze', 'Meyve', 'Yeşillik'],
        ['Bal', 'Reçel', 'Pekmez']
      ];

      const richProducers: RichProducer[] = rawProducers.map((prod: Producer, index: number) => {
        return {
          ...prod,
          coverImage: farmBanners[index % farmBanners.length],
          specialties: specialtiesList[index % specialtiesList.length]
        };
      });

      setProducers(richProducers);
      setFilteredProducers(richProducers);
    } catch (error) {
      console.error('Error loading producers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Search & Filter logic
  useEffect(() => {
    let result = producers;

    if (searchQuery.trim() !== '') {
      result = result.filter(prod => 
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        prod.story?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCity !== 'Tümü') {
      result = result.filter(prod => prod.location?.city === selectedCity);
    }

    if (selectedSpecialty !== 'Tümü') {
      result = result.filter(prod => prod.specialties.includes(selectedSpecialty));
    }

    setFilteredProducers(result);
  }, [searchQuery, selectedCity, selectedSpecialty, producers]);

  // Extract unique cities for filtering
  const cities = ['Tümü', ...Array.from(new Set(producers.map(p => p.location?.city).filter(Boolean)))];
  
  // Static list of popular specialties for filtering
  const specialties = ['Tümü', 'Zeytinyağı', 'Peynir', 'Sebze', 'Bal', 'Meyve', 'Süt Ürünleri'];

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col">
      {/* Universal Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 w-full pb-16">
        
        {/* Page Hero Banner Section */}
        <section className="bg-gradient-to-br from-green-50 via-emerald-50/30 to-white border-b border-green-100 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Toprağa Can Veren <span className="text-green-700">Üreticilerimiz</span>
            </h1>
            <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
              Emeğini sevgiyle harmanlayan yerel çiftçilerimiz, aile işletmelerimiz ve kadın kooperatiflerimizle tanışın.
            </p>
          </div>
        </section>

        {/* Filters and List Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          
          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Üretici adı veya hikaye ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-gray-50 border-gray-200 focus-visible:ring-green-600 rounded-xl"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* City Filter */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl h-11">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 font-semibold">Bölge:</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer pr-4"
                >
                  {cities.map((city, idx) => (
                    <option key={idx} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Specialty Filter */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl h-11">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 font-semibold">Ürün Türü:</span>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer pr-4"
                >
                  {specialties.map((spec, idx) => (
                    <option key={idx} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Producers Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent mb-3" />
              <span className="text-gray-500 font-medium text-sm">Üretici listesi güncelleniyor...</span>
            </div>
          ) : filteredProducers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-24 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">Eşleşen Üretici Bulunamadı</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">Seçtiğiniz filtreler veya arama sorgusu ile eşleşen bir üretici bulunamadı. Lütfen filtrelerinizi sıfırlamayı deneyin.</p>
              <Button 
                onClick={() => { setSearchQuery(''); setSelectedCity('Tümü'); setSelectedSpecialty('Tümü'); }} 
                className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                Filtreleri Temizle
              </Button>
            </div>
          ) : (
            /* Cards Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducers.map((producer) => (
                <Link key={producer.id} to={`/producer/${producer.id}`} className="group">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all duration-300 overflow-hidden flex flex-col h-full justify-between">
                    
                    {/* Card Cover Banner & Avatar */}
                    <div className="relative">
                      <div className="h-32 w-full overflow-hidden bg-gray-100">
                        <img 
                          src={producer.coverImage} 
                          alt="Çiftlik Görünümü" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      
                      {/* Floating Avatar */}
                      <div className="absolute left-6 -bottom-8">
                        <img
                          src={producer.image || '/placeholder-avatar.png'}
                          alt={producer.name}
                          className="w-16 h-16 rounded-xl object-cover border-4 border-white shadow-md bg-gray-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                          }}
                        />
                      </div>

                      {/* Verified Badge */}
                      {producer.isVerified && (
                        <div className="absolute right-4 top-4 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg border border-green-200 flex items-center shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-green-600 mr-1" />
                          <span className="text-[10px] font-bold text-green-800">Doğrulanmış</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-6 pt-10 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Name and Rating */}
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors leading-tight">
                            {producer.name}
                          </h3>
                          <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100 shrink-0">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-xs font-bold text-yellow-800">{producer.rating || 4.5}</span>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {producer.location?.city || 'Muğla'}, {producer.location?.district || 'Milas'}
                        </div>

                        {/* Story Excerpt */}
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed pt-2">
                          {producer.story || 'Taze, organik ve sürdürülebilir tarım standartlarında ürettiğimiz ürünlerimizi sizlerle buluşturuyoruz.'}
                        </p>
                      </div>

                      {/* Specialty Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {producer.specialties.map((spec, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="bg-gray-100 hover:bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Card Footer Toolbar */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 flex items-center">
                        <Store className="w-3.5 h-3.5 mr-1 text-green-600" /> {(producer as any).productsCount || 5} Aktif Ürün
                      </span>
                      <span className="text-green-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        İncele & Satın Al <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}

        </section>
      </main>
      <Footer />
    </div>
  );
}
