import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Leaf, Calendar, ShoppingCart, Star, MessageSquare, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/appStore';
import { useCartStore } from '@/store/cartStore';
import { productApi, toast } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCartStore();
  const { products, fetchProducts } = useAppStore();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'info' | 'farmer' | 'reviews'>('info');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, products]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productApi.getById(parseInt(id!));
      setProduct(response.data || response);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`${product.name} sepetinize eklendi!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
          <span className="ml-3 text-gray-500 font-medium">Ürün bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <p className="text-gray-500 mb-4 font-medium">Ürün bulunamadı.</p>
          <Link to="/urunler">
            <Button className="bg-green-600 hover:bg-green-700">Tüm Ürünlere Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getImageUrl = (path: string) => {
    if (!path) return '/placeholder-product.png';
    if (path.startsWith('http')) return path;
    if (path.startsWith('data:image')) return path;
    return `/uploads/${path}`;
  };

  // Filter 4 related products in the same category (excluding current product)
  const relatedProducts = products
    .filter((p: any) => p.category?.toLowerCase() === product.category?.toLowerCase() && String(p.id) !== String(product.id))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Universal Header */}
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 flex-1 w-full">
        {/* Breadcrumbs */}
        <div className="mb-4 md:mb-6">
          <Link to="/urunler" className="inline-flex items-center text-sm text-gray-600 hover:text-green-600 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Ürünlere Dön
          </Link>
        </div>

        {/* Product Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100 mb-6 md:mb-10">
          
          {/* Left Column: Images */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden border">
              <img
                src={getImageUrl(product.images?.[0])}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-product.png';
                }}
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.isOrganic && (
                  <Badge className="bg-green-600 text-white px-3 py-1 text-xs shadow-sm font-semibold">
                    <Leaf className="w-3.5 h-3.5 mr-1" />
                    %100 Organik
                  </Badge>
                )}
                {product.isSeasonal && (
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Mevsiminde
                  </Badge>
                )}
              </div>
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img: string, idx: number) => (
                  <button key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 hover:border-green-500 transition-colors focus:outline-none">
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Order Details */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs md:text-sm font-semibold text-green-700 uppercase tracking-wider">{product.category}</p>
                <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 mt-1">{product.name}</h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2 flex items-center gap-1.5">
                  Üretici: <span className="font-semibold text-gray-800 hover:underline cursor-pointer">{product.producerName || 'Yerel Çiftçi'}</span>
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 py-2 border-y border-gray-100">
                <span className="text-2xl md:text-4xl font-extrabold text-green-700">₺{product.price}</span>
                <span className="text-gray-500 text-base md:text-lg">/ {product.unit || 'kg'}</span>
                {product.stock > 0 ? (
                  <Badge className="ml-4 bg-green-50 text-green-700 border border-green-200 hover:bg-green-50">Stokta Var</Badge>
                ) : (
                  <Badge className="ml-4 bg-red-50 text-red-700 border border-red-200 hover:bg-red-50">Tükendi</Badge>
                )}
              </div>

              {/* Short Bio */}
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {product.description || 'Kimyasal ilaç kalıntısı barındırmayan, geleneksel tarım yöntemleriyle yerel topraklarımızda üretilmiş taze organik mahsul.'}
              </p>

              {/* Features Summary */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-500 block">Stok Adedi</span>
                  <span className="font-semibold text-gray-800">{product.stock || 80} {product.unit || 'kg'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Hasat Zamanı</span>
                  <span className="font-semibold text-gray-800">Günlük Hasat</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Sepete Ekle Button */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="font-bold text-gray-700 text-sm">Adet / Miktar:</span>
                <div className="flex items-center border rounded-xl overflow-hidden bg-white shadow-sm h-11">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 min-w-[50px] text-center font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 md:gap-3">
                <Button
                  size="lg"
                  disabled={product.stock === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 md:py-3 h-10 md:h-12 shadow-sm rounded-xl text-sm md:text-base"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Sepete Ekle
                </Button>
                <Button size="lg" variant="outline" className="h-10 w-10 md:h-12 md:w-12 p-0 rounded-xl hover:text-red-500">
                  <Heart className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-10 w-10 md:h-12 md:w-12 p-0 rounded-xl hover:text-blue-500">
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs Panel */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8 md:mb-12">
          {/* Tab Links */}
          <div className="flex overflow-x-auto whitespace-nowrap border-b text-xs md:text-sm font-semibold hide-scrollbar">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 md:py-4 px-2 md:px-4 text-center border-b-2 transition-all ${
                activeTab === 'info'
                  ? 'border-green-600 text-green-700 bg-green-50/10'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Detaylar
            </button>
            <button
              onClick={() => setActiveTab('farmer')}
              className={`flex-1 py-3 md:py-4 px-2 md:px-4 text-center border-b-2 transition-all ${
                activeTab === 'farmer'
                  ? 'border-green-600 text-green-700 bg-green-50/10'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Çiftçi Hikayesi
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-3 md:py-4 px-2 md:px-4 text-center border-b-2 transition-all ${
                activeTab === 'reviews'
                  ? 'border-green-600 text-green-700 bg-green-50/10'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Yorumlar (3)
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-4 sm:p-6 md:p-8 leading-relaxed">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-6 text-center">
                  <div className="p-4 rounded-xl bg-green-50/40 border border-green-100 flex flex-col items-center">
                    <ShieldCheck className="w-8 h-8 text-green-600 mb-2" />
                    <h4 className="font-bold text-gray-900 text-sm">GDO ve Katkısız</h4>
                    <p className="text-xs text-gray-500 mt-1">Tamamen doğal tohumlardan, hormonsuz üretim.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 flex flex-col items-center">
                    <Truck className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-bold text-gray-900 text-sm">Aynı Gün Hasat & Kargo</h4>
                    <p className="text-xs text-gray-500 mt-1">Sabah erken saatlerde toplanıp gün içerisinde gönderilir.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-100 flex flex-col items-center">
                    <RefreshCw className="w-8 h-8 text-orange-600 mb-2" />
                    <h4 className="font-bold text-gray-900 text-sm">Tazelik Garantisi</h4>
                    <p className="text-xs text-gray-500 mt-1">Hasarlı veya beğenmediğiniz ürünlerde koşulsuz iade.</p>
                  </div>
                </div>
                <div className="space-y-3 pt-4">
                  <h3 className="font-bold text-gray-900 text-lg">Organik Detayları</h3>
                  <p className="text-gray-600">
                    Bu ürün, geleneksel tarım teknikleri gözetilerek, hiçbir sentetik gübre, böcek ilacı (pestisit) ya da kimyasal büyütücü madde kullanılmadan yetiştirilmiştir. Toprağımızın taze mineralleri ile beslenen bitkilerden elde edilen mahsulümüz, vitamin ve aromatik değerini son ana kadar korur.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'farmer' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                  <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center text-2xl font-bold text-green-700">
                    {product.producerName?.charAt(0) || 'Ç'}
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <h4 className="font-bold text-gray-900 text-lg">{product.producerName || 'Yerel Çiftçimiz'}</h4>
                    <p className="text-sm text-gray-500">Aile Çiftliği — Çengelköy, İstanbul</p>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sertifikalı Üretici</Badge>
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <h3 className="font-bold text-gray-900 text-base">Bizim Hikayemiz</h3>
                  <p className="text-gray-600 text-sm">
                    Üreticimiz {product.producerName || 'Yerel Çiftçimiz'}, 20 yılı aşkın süredir ata tohumlarını koruyarak geleneksel yöntemlerle tarım yapmaktadır. Amacımız, topraklarımızın bereketini en taze ve temiz haliyle sofralarınıza doğrudan ulaştırmaktır. Ürünü satın alarak yerel üreticilerimizin tarımsal kalkınmasına doğrudan katkı sağlarsınız.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-6 rounded-2xl border">
                  <div className="text-center sm:pr-8 sm:border-r border-gray-200">
                    <p className="text-5xl font-extrabold text-gray-900">4.8</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">5 üzerinden puan</p>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex justify-center sm:justify-start items-center gap-0.5 text-yellow-400 mb-1">
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Bu ürüne 3 değerlendirme yapıldı</p>
                  </div>
                </div>

                {/* Review Items */}
                <div className="divide-y divide-gray-100 space-y-4 pt-2">
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-800">Merve T.</span>
                      <span className="text-gray-400">2 gün önce</span>
                    </div>
                    <div className="flex text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Gerçekten kütür kütür ve çok taze. Salatalık kokusu bütün mutfağı sardı, çocukluğumuzdaki salatalıklar gibi lezzetli. Paketleme son derece özenliydi.
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-800">Burak Y.</span>
                      <span className="text-gray-400">1 hafta önce</span>
                    </div>
                    <div className="flex text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Hızlı ve hasarsız ulaştı. Satıcı son derece ilgiliydi. Tereddüt etmeden sipariş verebilirsiniz.
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-800">Ayşe K.</span>
                      <span className="text-gray-400">2 hafta önce</span>
                    </div>
                    <div className="flex text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 text-gray-200" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Çok lezzetli, sadece biraz boyutu ufaktı ama katkı maddesi barındırmayan doğal ürün olduğu için oldukça normal karşılıyorum. Beğendim.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">Benzer Ürünler</h2>
              <Link to="/urunler" className="text-green-600 hover:text-green-700 font-semibold text-xs md:text-sm">Tümünü Gör</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Premium Footer */}
      <Footer />
    </div>
  );
}
