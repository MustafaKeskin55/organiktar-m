import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Calendar, 
  Leaf, 
  Truck, 
  RotateCcw, 
  Star,
  ArrowRight,
  Package,
  Sparkles
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


const subscriptionPlans = [
  {
    id: 'mini',
    name: 'Mini Sepet',
    price: 149,
    period: 'haftalık',
    description: 'Bekarlar ve çiftler için ideal',
    features: [
      '4-5 kg mevsim sebze & meyve',
      '2-3 çeşit ürün',
      'Ücretsiz teslimat',
      'İptal edilebilir',
    ],
    popular: false,
    color: 'bg-blue-50 border-blue-200',
    icon: Package,
  },
  {
    id: 'family',
    name: 'Aile Sepeti',
    price: 299,
    period: 'haftalık',
    description: '3-4 kişilik aileler için',
    features: [
      '8-10 kg mevsim sebze & meyve',
      '5-6 çeşit ürün',
      'Ücretsiz teslimat',
      'Öncelikli müşteri desteği',
      'İptal edilebilir',
    ],
    popular: true,
    color: 'bg-green-50 border-green-200',
    icon: Sparkles,
  },
  {
    id: 'organic',
    name: 'Organik Sepet',
    price: 449,
    period: 'haftalık',
    description: 'Tamamen organik ürünler',
    features: [
      '8-10 kg organik sebze & meyve',
      'Sertifikalı organik ürünler',
      'Ücretsiz teslimat',
      'Öncelikli müşteri desteği',
      'İptal edilebilir',
    ],
    popular: false,
    color: 'bg-purple-50 border-purple-200',
    icon: Leaf,
  },
];

const howItWorks = [
  {
    icon: Calendar,
    title: '1. Plan Seçin',
    description: 'İhtiyacınıza uygun haftalık sepet planını seçin.',
  },
  {
    icon: Leaf,
    title: '2. Hasat Edilsin',
    description: 'Üreticilerimiz en taze ürünleri hasat etsin.',
  },
  {
    icon: Truck,
    title: '3. Kapınıza Gelsin',
    description: 'Her hafta belirttiğiniz gün kapınıza teslim edilsin.',
  },
  {
    icon: RotateCcw,
    title: '4. Esnek Yönetim',
    description: 'Dilediğinizde duraklatın, iptal edin veya değiştirin.',
  },
];

const testimonials = [
  {
    name: 'Ayşe K.',
    location: 'Kadıköy, İstanbul',
    text: '3 aydır Aile Sepeti abonesiyim. Her hafta taze ürünler geliyor, çocuklarım çok seviyor.',
    rating: 5,
  },
  {
    name: 'Mehmet B.',
    location: 'Beşiktaş, İstanbul',
    text: 'Organik Sepet harika! Tamamen doğal ürünler, marketlerdekilerden çok daha lezzetli.',
    rating: 5,
  },
  {
    name: 'Zeynep T.',
    location: 'Üsküdar, İstanbul',
    text: 'Mini Sepet benim için ideal. Tek başıma yaşıyorum ve israf etmiyorum.',
    rating: 5,
  },
];

export function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-green-50 via-white to-orange-50 py-12 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 bg-green-100 text-green-800">
                <Calendar className="mr-1 h-3 w-3" />
                Haftalık Abonelik
              </Badge>
              <h1 className="mb-4 md:mb-6 text-3xl font-bold text-gray-900 lg:text-5xl">
                Taze Ürünler Kapınıza Gelsin
              </h1>
              <p className="mb-6 md:mb-8 text-sm md:text-lg text-gray-600">
                Her hafta seçtiğiniz gün, yerel üreticilerden taze sebze ve meyveler
                doğrudan kapınıza teslim edilsin. Abone olun, %20'ye varan indirim kazanın.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="#plans">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Planları İncele
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/urunler">
                  <Button size="lg" variant="outline">
                    Tekli Alışveriş
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white py-12 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-2 md:mb-4 text-2xl md:text-3xl font-bold text-gray-900">
                Nasıl Çalışır?
              </h2>
              <p className="text-gray-600">
                4 basit adımda haftalık taze ürüklere ulaşın
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <step.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section id="plans" className="bg-gray-50 py-12 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-2 md:mb-4 text-2xl md:text-3xl font-bold text-gray-900">
                Abonelik Planları
              </h2>
              <p className="text-gray-600">
                İhtiyacınıza en uygun planı seçin
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {subscriptionPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden transition-all hover:shadow-xl ${
                    plan.popular ? 'border-2 border-green-500 shadow-lg' : ''
                  } ${selectedPlan === plan.id ? 'ring-2 ring-green-500' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute right-0 top-0 bg-green-500 px-4 py-1 text-xs font-bold text-white">
                      EN POPÜLER
                    </div>
                  )}

                  <CardHeader className={`pb-4 ${plan.color}`}>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                      <plan.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6 pt-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price} TL
                      </span>
                      <span className="text-gray-500">/ {plan.period}</span>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      Abone Ol
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Benefits */}
            <div className="mt-8 md:mt-12 grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Taze ve Doğal</p>
                  <p className="text-sm text-gray-500">Hasat günü teslimat</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ücretsiz Teslimat</p>
                  <p className="text-sm text-gray-500">Kapınıza kadar</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <RotateCcw className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Esnek Plan</p>
                  <p className="text-sm text-gray-500">Dilediğinizde iptal</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">%20 İndirim</p>
                  <p className="text-sm text-gray-500">Abone özel fiyat</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-white py-12 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-2 md:mb-4 text-2xl md:text-3xl font-bold text-gray-900">
                Abonelerimiz Ne Diyor?
              </h2>
              <p className="text-gray-600">
                Binlerce mutlu abonemizin deneyimleri
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="rounded-xl border bg-gray-50 p-6"
                >
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-4 text-gray-700">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-green-600 to-green-700 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-2xl md:text-3xl font-bold text-white">
                Hemen Abone Olun, İlk Hafta %50 İndirimli!
              </h2>
              <p className="mb-6 md:mb-8 text-sm md:text-lg text-green-100">
                İlk aboneliğinizde geçerli, sınırlı süreli kampanya.
                Taze ürüklere hemen başlayın.
              </p>
              <Link to="/kayit">
                <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
                  Ücretsiz Abone Ol
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
