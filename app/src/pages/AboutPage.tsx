import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Truck, 
  Users, 
  Award, 
  ShieldCheck, 
  Heart, 
  Globe, 
  TrendingUp 
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AboutPage() {
  const stats = [
    { value: '500+', label: 'Yerel Üretici' },
    { value: '15,000+', label: 'Aktif Tüketici' },
    { value: '50,000+', label: 'Mutlu Teslimat' },
    { value: '45+', label: 'Farklı İlçe' }
  ];

  const milestones = [
    {
      year: '2024',
      title: 'Tohumlar Serpildi',
      desc: 'Sadece 5 yerel üreticiyle Milas\'ta ufak bir kooperatif desteği olarak başladık.'
    },
    {
      year: '2025',
      title: 'Bölgeler Arası Köprü',
      desc: 'Ege ve Akdeniz genelinde 100+ çiftçiyi tek bir çatı altında birleştirmeyi başardık.'
    },
    {
      year: '2026',
      title: 'Yeşil Gelecek Ödülü',
      desc: 'Karbon ayak izini azaltan paketleme modellerimiz ile Çevre Koruma ödülüne layık görüldük.'
    }
  ];

  const values = [
    {
      icon: <Leaf className="w-6 h-6 text-green-600" />,
      title: '%100 Doğal Üretim',
      desc: 'Toprağımızı kimyasal gübre ve ilaçlardan uzak tutarak, en saf haliyle tarım yapıyoruz.'
    },
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      title: 'Adil Ticaret (Fair Trade)',
      desc: 'Aracıları ortadan kaldırarak çiftçilerimizin emeğinin tam karşılığını almasını sağlıyoruz.'
    },
    {
      icon: <Globe className="w-6 h-6 text-green-600" />,
      title: 'Sürdürülebilirlik',
      desc: 'Gelecek nesillere yaşanabilir bir dünya bırakmak adına geleneksel ekolojiyi koruyoruz.'
    },
    {
      icon: <Award className="w-6 h-6 text-green-600" />,
      title: 'Şeffaf Tedarik',
      desc: 'Tükettiğiniz her ürünün hangi çiftlikten, hangi ellerle toplandığını açıkça görebilirsiniz.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col">
      {/* Universal Header */}
      <Header />

      <main className="flex-1 w-full pb-16">
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-900 to-emerald-950 py-12 md:py-24 text-white text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
            <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/20 px-3.5 py-1 text-xs rounded-full">Hikayemiz</Badge>
            <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight">Doğal Yaşam, <span className="text-green-400">Sağlıklı Gelecek</span></h1>
            <p className="text-sm md:text-xl text-green-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
              ÇiftçidenKapına olarak, yerel üreticilerin el emeğini koruyor ve en doğal besinleri hiçbir aracı olmadan doğrudan mutfağınıza taşıyoruz.
            </p>
          </div>
        </section>

        {/* Stats Grid Bar */}
        <section className="max-w-6xl mx-auto px-4 -mt-8 md:-mt-10 relative z-20">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <span className="block text-2xl md:text-3.5xl font-extrabold text-green-700 tracking-tight">{stat.value}</span>
                <span className="text-xs md:text-sm font-semibold text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Brand Mission & Vision */}
        <section className="max-w-6xl mx-auto px-4 py-8 md:py-16 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Toprağın Gücü ve Emeğin Hikayesi</h2>
            <div className="text-gray-600 leading-relaxed space-y-4 text-sm md:text-base">
              <p>
                Gelişen teknoloji ve endüstriyel tarım modelleri, ne yazık ki yediğimiz besinlerin doğallığını kaybetmesine ve küçük çiftçilerimizin pazar payını yitirmesine sebep oldu.
              </p>
              <p>
                ÇiftçidenKapına, bu döngüyü kırmak için doğan bir harekettir. Biz, Muğla'nın zeytinliklerinden, Kars'ın meralarına kadar uzanan geniş bir coğrafyada; ata tohumuyla üretim yapan, kimyasal ilaç kullanmayan ve geleneksel yöntemleri yaşatan çiftçilerimizi dijital dünya ile buluşturuyoruz.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/producers">
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md shadow-green-100 px-6 py-5 font-semibold">
                  Üreticilerimizi Keşfedin
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative aspect-video md:aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-gray-200/50 shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80" 
              alt="Çiftçi ve toprak" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Core Values Section */}
        <section className="bg-green-50/50 border-y border-green-100/50 py-8 md:py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12 space-y-2 md:space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Temel Değerlerimiz</h2>
              <p className="text-sm text-gray-500">Bizleri yönlendiren, toprağa ve üreticiye olan bağlılığımızı gösteren prensiplerimiz.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((val, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                    {val.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{val.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline / Milestones */}
        <section className="max-w-5xl mx-auto px-4 py-8 md:py-16">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-16 space-y-2 md:space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Yolculuğumuz</h2>
            <p className="text-sm text-gray-500">Küçük bir çiftlik kooperatifi hayalinden bugünkü teknoloji platformuna uzanan hikayemiz.</p>
          </div>

          <div className="relative border-l-2 border-green-200 ml-4 md:ml-32 space-y-12">
            {milestones.map((stone, idx) => (
              <div key={idx} className="relative pl-6 md:pl-10">
                {/* Year Badge on Left for Desktop */}
                <div className="hidden md:flex absolute -left-32 top-0 w-24 justify-end text-right">
                  <span className="text-2xl font-black text-green-700 tracking-tight">{stone.year}</span>
                </div>
                
                {/* Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-green-600 border-4 border-white shadow-sm" />
                
                {/* Mobile Year Badge */}
                <span className="block md:hidden text-lg font-black text-green-700 mb-1">{stone.year}</span>
                
                {/* Content */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-2 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 text-base md:text-lg">{stone.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{stone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
