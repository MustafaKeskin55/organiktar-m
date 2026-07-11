import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Calendar, 
  Award, 
  MessageSquare, 
  ShieldCheck, 
  Users, 
  Clock, 
  Truck,
  Heart,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { producerApi, productApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import type { Producer, Product } from '@/types';
import { toast } from 'sonner';

interface RichProducer extends Producer {
  coverImage: string;
  gallery: string[];
  badges: string[];
  reviews: Array<{
    id: number;
    author: string;
    rating: number;
    date: string;
    comment: string;
  }>;
  stats: {
    happyCustomers: string;
    responseRate: string;
    deliveryTime: string;
  };
}

export function ProducerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [producer, setProducer] = useState<RichProducer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'story' | 'reviews'>('products');

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
      
      const fetchedProducer = producerRes.data || producerRes;
      
      // High-quality farm banners and mock data based on producer ID to keep it consistent
      const farmBanners = [
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80'
      ];
      
      const farmGalleries = [
        [
          'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=600&q=80'
        ],
        [
          'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1488459718432-36c55e79926e?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80'
        ]
      ];

      const producerId = parseInt(id!);
      const coverImage = farmBanners[producerId % farmBanners.length];
      const gallery = farmGalleries[producerId % farmGalleries.length];

      const richProducer: RichProducer = {
        ...fetchedProducer,
        coverImage,
        gallery,
        badges: ['100% Organik', 'Ata Tohumu', 'Sürdürülebilir Tarım', 'Yerel Üretim'],
        reviews: [
          { id: 1, author: 'Ahmet Yilmaz', rating: 5, date: '24 Haziran 2026', comment: 'Harika ve taze ürünler! Paketleme de çok özenliydi, kesinlikle tekrar sipariş vereceğim.' },
          { id: 2, author: 'Elif Kaya', rating: 4, date: '12 Haziran 2026', comment: 'Zamanında ulaştı. Domatesler tam çocukluğumun kokusu gibiydi, çok lezzetli.' },
          { id: 3, author: 'Mehmet Aslan', rating: 5, date: '02 Haziran 2026', comment: 'Zeytinyağı tek kelimeyle mükemmel. Emeğinize sağlık.' }
        ],
        stats: {
          happyCustomers: '1.2K+',
          responseRate: '98%',
          deliveryTime: '1-2 Gün'
        }
      };

      setProducer(richProducer);
      setProducts(productsRes.data || productsRes || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = () => {
    toast.success('Mesaj gönderme penceresi açıldı (Demo)', {
      description: `${producer?.name} üreticisine sorunuz iletilecek.`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent mb-4" />
        <span className="text-gray-600 font-medium">Üretici profili yükleniyor...</span>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4 text-lg">Üretici bulunamadı</p>
        <Link to="/producers">
          <Button className="bg-green-600 hover:bg-green-700">Üreticilere Dön</Button>
        </Link>
      </div>
    );
  }

  const averageRating = (producer.reviews.reduce((acc, rev) => acc + rev.rating, 0) / producer.reviews.length).toFixed(1);

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Navigation Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/producers" className="flex items-center text-gray-600 hover:text-green-700 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Tüm Üreticiler
          </Link>
          <div className="flex items-center gap-2">
            {producer.isVerified && (
              <span className="flex items-center text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 fill-green-100" /> Doğrulanmış Üretici
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero Cover Banner */}
      <div className="relative h-40 md:h-80 w-full overflow-hidden">
        <img 
          src={producer.coverImage} 
          alt="Çiftlik Görünümü" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      </div>

      {/* Profile Card Container (Overlapping Banner) */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 md:-mt-32 relative z-20 mb-6 md:mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="relative">
              <img
                src={producer.image || '/placeholder-avatar.png'}
                alt={producer.name}
                className="w-24 h-24 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-white shadow-md bg-gray-50"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                }}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
                <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{producer.name}</h1>
                {producer.isVerified && (
                  <Badge className="bg-green-600 hover:bg-green-600 text-white shadow-sm px-2.5 py-0.5 rounded-md">Doğrulanmış</Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-600">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-gray-400" /> {producer.location?.city || 'Muğla'}, {producer.location?.district || 'Milas'}</span>
                <span className="flex items-center"><Star className="w-4 h-4 mr-1.5 fill-yellow-400 text-yellow-400" /> {producer.rating || averageRating} ({producer.reviews.length} Değerlendirme)</span>
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5 text-gray-400" /> {producer.createdAt ? new Date(producer.createdAt).getFullYear() : '2026'}'dan beri aktif</span>
              </div>

              <p className="text-gray-600 max-w-2xl leading-relaxed text-sm md:text-base line-clamp-2 md:line-clamp-none">
                {producer.story || 'Doğal, ilaçsız ve geleneksel yöntemlerle ürettiğimiz ürünlerimizi doğrudan kapınıza ulaştırıyoruz.'}
              </p>
            </div>

            {/* CTA Box */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
              <Button 
                onClick={handleAskQuestion} 
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center py-3 md:py-5 rounded-xl font-semibold shadow-md shadow-green-100 transition-all text-sm md:text-base"
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Üreticiye Soru Sor
              </Button>
              <div className="text-center text-xs text-gray-400 w-full">
                Ortalama cevap süresi: <strong>{producer.stats.responseRate}</strong>
              </div>
            </div>
          </div>

          {/* Quick Stats Toolbar */}
          <div className="grid grid-cols-3 border-t border-gray-100 mt-8 pt-6 gap-4 text-center">
            <div>
              <div className="flex justify-center mb-1 text-green-600"><Users className="w-5 h-5" /></div>
              <span className="block text-lg font-bold text-gray-900">{producer.stats.happyCustomers}</span>
              <span className="text-xs text-gray-500 font-medium">Mutlu Müşteri</span>
            </div>
            <div>
              <div className="flex justify-center mb-1 text-green-600"><Store className="w-5 h-5" /></div>
              <span className="block text-lg font-bold text-gray-900">{products.length}</span>
              <span className="text-xs text-gray-500 font-medium">Aktif Ürün</span>
            </div>
            <div>
              <div className="flex justify-center mb-1 text-green-600"><Truck className="w-5 h-5" /></div>
              <span className="block text-lg font-bold text-gray-900">{producer.stats.deliveryTime}</span>
              <span className="text-xs text-gray-500 font-medium">Gönderim Süresi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (Left/Center) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Header */}
            <div className="bg-white rounded-xl border border-gray-100 p-1 md:p-2 flex gap-1 md:gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
              <button 
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'products' 
                    ? 'bg-green-600 text-white shadow-md shadow-green-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Ürünleri ({products.length})
              </button>
              <button 
                onClick={() => setActiveTab('story')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'story' 
                    ? 'bg-green-600 text-white shadow-md shadow-green-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Biz Kimiz & Galeri
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'reviews' 
                    ? 'bg-green-600 text-white shadow-md shadow-green-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Değerlendirmeler ({producer.reviews.length})
              </button>
            </div>

            {/* Tab: Products */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Taze ve Doğal Ürünler</h2>
                  <span className="text-sm font-medium text-gray-500">{products.length} ürün listeleniyor</span>
                </div>
                {products.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
                    <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-800 mb-1">Henüz Ürün Yok</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">Bu üretici henüz satışta olan bir ürün eklememiş. En kısa sürede güncellenecektir.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 md:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Story */}
            {activeTab === 'story' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-green-600" /> Çiftlik Hikayemiz & Felsefemiz
                  </h3>
                  <div className="text-gray-600 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                      {producer.story || 'Çiftliğimizde nesiller boyu aktarılan geleneksel yöntemlerle, doğaya saygılı ve kimyasal ilaç kullanmadan üretim yapıyoruz.'}
                    </p>
                    <p>
                      Bizim için tarım sadece bir iş değil, toprağa ve geleceğe duyduğumuz saygının bir ifadesidir. Yerel ata tohumlarımızı koruyor, doğal su kaynaklarımızı verimli kullanarak sürdürülebilirliği destekliyoruz. Her bir meyve, sebze ve organik mamulümüzü dalından koptuğu günün tazeliğiyle sofranıza sunuyoruz.
                    </p>
                  </div>
                </div>

                {/* Gallery */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Çiftlikten Kareler</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {producer.gallery.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 group border border-gray-100">
                        <img 
                          src={imgUrl} 
                          alt={`Çiftlikten galeri resmi ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-8 space-y-6 md:space-y-8">
                {/* Review Header Stats */}
                <div className="flex flex-col sm:flex-row gap-6 items-center bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="text-center sm:border-r border-gray-200 sm:pr-8">
                    <span className="block text-4xl font-extrabold text-gray-900">{averageRating}</span>
                    <div className="flex justify-center my-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= Math.round(parseFloat(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{producer.reviews.length} Değerlendirme</span>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <h4 className="text-sm font-bold text-gray-800 mb-1 text-center sm:text-left">Müşteri Memnuniyeti</h4>
                    <p className="text-sm text-gray-500 text-center sm:text-left">Alıcıların tamamı bu üreticinin paketleme özeni, ürün tazeliği ve hızlı kargolama özelliklerinden memnun kaldı.</p>
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-6 divide-y divide-gray-100">
                  {producer.reviews.map((review) => (
                    <div key={review.id} className="pt-6 first:pt-0 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-sm">{review.author}</span>
                        <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Column (Right) */}
          <div className="space-y-6">
            
            {/* Farming Specialties */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center border-b pb-3">
                <ShieldCheck className="w-5 h-5 mr-2 text-green-600" /> Çiftlik Özellikleri
              </h3>
              <div className="flex flex-wrap gap-2">
                {producer.badges.map((badge, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-green-800 bg-green-50 border border-green-100"
                  >
                    <Heart className="w-3.5 h-3.5 mr-1 fill-green-100 text-green-600" /> {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact & Map Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 space-y-5">
              <h3 className="font-bold text-gray-900 text-base flex items-center border-b pb-3">
                <MapPin className="w-5 h-5 mr-2 text-green-600" /> İletişim & Lokasyon
              </h3>

              {/* Styled Mock Map */}
              <div className="relative h-40 bg-green-50 rounded-xl overflow-hidden border border-green-100 flex flex-col items-center justify-center p-4 text-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#16a34a_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shadow-lg text-white mb-2 relative animate-bounce">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="block font-bold text-xs text-green-900">{producer.location?.city || 'Muğla'}, {producer.location?.district || 'Milas'}</span>
                <span className="block text-[10px] text-green-700/80 mt-0.5">Detaylı lokasyon sipariş sonrasında paylaşılır.</span>
              </div>

              {/* Details List */}
              <div className="space-y-3.5 text-sm">
                {producer.phone && (
                  <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Phone className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="font-medium truncate">{producer.phone}</span>
                  </div>
                )}
                {producer.email && (
                  <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Mail className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="font-medium truncate">{producer.email}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
