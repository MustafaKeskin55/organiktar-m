import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Truck, Leaf, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/appStore';
import { siteContentApi, userApi, orderApi } from '@/lib/api';
import { useState, useEffect } from 'react';

interface HeroStats {
  icon: string;
  value: string;
  label: string;
  dynamic?: boolean;
  source?: string;
}

interface FloatingBadge {
  text: string;
  value: string;
  suffix: string;
  dynamic?: boolean;
  source?: string;
}

export function HeroSection() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, products } = useAppStore();
  const [stats, setStats] = useState<HeroStats[]>([]);
  const [floatingBadge, setFloatingBadge] = useState<FloatingBadge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeroContent();
  }, []);

  const loadHeroContent = async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7940/ingest/6a4dfb92-ba5a-4ae9-ba29-c2fec46bfe5b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9f7ff'},body:JSON.stringify({sessionId:'a9f7ff',location:'HeroSection.tsx',message:'Loading hero content',data:{},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const content = await siteContentApi.getHeroStats();
      
      // Dinamik degerleri hesapla
      const [usersResponse, ordersResponse] = await Promise.all([
        userApi.getAll().catch(() => []),
        orderApi.getAll().catch(() => []),
      ]);
      
      const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || []);
      const orders = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse.data || []);
      
      const producerCount = users.filter((u: any) => u.type === 'PRODUCER').length;
      const consumerCount = users.filter((u: any) => u.type === 'CONSUMER').length;
      const orderCount = orders.length;
      
      // Istatistikleri guncelle
      const updatedStats = content.stats.map((stat: HeroStats) => {
        if (stat.dynamic) {
          switch (stat.source) {
            case 'producer_count':
              return { ...stat, value: producerCount > 0 ? `${producerCount}+` : '50+' };
            case 'consumer_count':
              return { ...stat, value: consumerCount > 0 ? `${consumerCount}+` : '10K+' };
            case 'order_count':
              return { ...stat, value: orderCount > 0 ? `${orderCount}+` : '50K+' };
            default:
              return stat;
          }
        }
        return stat;
      });
      
      // Floating badge'i guncelle
      if (content.floating_badge) {
        const badge = content.floating_badge;
        if (badge.dynamic && badge.source === 'producer_count') {
          badge.value = producerCount > 0 ? String(producerCount) : '50';
        }
        setFloatingBadge(badge);
      }
      
      setStats(updatedStats);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7940/ingest/6a4dfb92-ba5a-4ae9-ba29-c2fec46bfe5b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9f7ff'},body:JSON.stringify({sessionId:'a9f7ff',location:'HeroSection.tsx',message:'Hero content error',data:{error:String(error)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      console.error('Hero content yuklenirken hata:', error);
      // Fallback degerler
      setStats([
        { icon: 'Leaf', value: '500+', label: 'Yerel Uretici' },
        { icon: 'Star', value: '10K+', label: 'Mutlu Musteri' },
        { icon: 'Truck', value: '50K+', label: 'Teslimat' },
      ]);
      setFloatingBadge({ text: 'Yakinlarinizdaki', value: '50', suffix: '+ Uretici' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/urunler');
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Leaf': return Leaf;
      case 'Star': return Star;
      case 'Truck': return Truck;
      default: return Leaf;
    }
  };

  if (loading) {
    return (
      <section className="relative flex h-96 items-center justify-center bg-gradient-to-br from-green-50 via-white to-orange-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-orange-50">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-green-400 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-orange-400 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
                <Leaf className="h-4 w-4" />
                Dogal ve Taze Urunler
              </div>
              <h1 className="text-4xl font-bold leading-tight text-gray-900 lg:text-5xl xl:text-6xl">
                Ureticiden{' '}
                <span className="text-green-600">Dogrudan</span>{' '}
                Kapiniza
              </h1>
              <p className="text-lg text-gray-600 lg:text-xl">
                Yerel ciftcilerden taze, organik urunleri aracisiz alin.
                Hem ureticiyi destekleyin, hem saglikli beslenin.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Domates, zeytinyagi, bal..."
                  className="h-14 pl-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 bg-green-600 px-8 text-base hover:bg-green-700"
              >
                <Search className="mr-2 h-5 w-5" />
                Ara
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>Populer:</span>
              {['Organik Domates', 'Zeytinyagi', 'Koy Peyniri', 'Suzme Bal'].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSearchQuery(item);
                      navigate('/urunler');
                    }}
                    className="rounded-full bg-gray-100 px-3 py-1 transition-colors hover:bg-green-100 hover:text-green-700"
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-8">
              {stats.map((stat) => {
                const IconComponent = getIconComponent(stat.icon);
                return (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                      <IconComponent className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative grid grid-cols-2 gap-4">
              <div className="col-span-2 overflow-hidden rounded-2xl shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=400&fit=crop"
                  alt="Taze sebzeler"
                  className="h-64 w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-2xl shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&h=300&fit=crop"
                  alt="Ciftci"
                  className="h-48 w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-2xl shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop"
                  alt="Pazar"
                  className="h-48 w-full object-cover"
                />
              </div>
            </div>

            {floatingBadge && (
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{floatingBadge.text}</p>
                    <p className="text-lg font-bold text-green-600">{floatingBadge.value}{floatingBadge.suffix}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
