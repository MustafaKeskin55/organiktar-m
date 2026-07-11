import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Leaf, Truck, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { siteContentApi } from '@/lib/api';

interface Plan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
}

export function SubscriptionSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const content = await siteContentApi.getSubscriptionPlans();
      setPlans(content.plans || []);
    } catch (error) {
      console.error('Plans yuklenirken hata:', error);
      // Fallback
      setPlans([
        { name: 'Mini Sepet', price: 149, period: 'haftalik', description: 'Bekarlar ve ciftler icin', features: ['4-5 kg sebze & meyve', '2-3 cesit', 'Ucretsiz teslimat'], popular: false },
        { name: 'Aile Sepeti', price: 299, period: 'haftalik', description: '3-4 kisilik aileler', features: ['8-10 kg sebze & meyve', '5-6 cesit', 'Ucretsiz teslimat'], popular: true },
        { name: 'Organik Sepet', price: 449, period: 'haftalik', description: 'Tamamen organik', features: ['8-10 kg organik', 'Sertifikali', 'Ucretsiz teslimat'], popular: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="flex h-64 items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
            <Calendar className="h-4 w-4" />
            Haftalik Abonelik
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            Abonelik Sepetleri
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Her hafta taze, mevsimine uygun urunler kapiniza gelsin.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all hover:shadow-xl ${
                plan.popular ? 'border-2 border-green-500 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute right-0 top-0 bg-green-500 px-4 py-1 text-xs font-bold text-white">
                  EN POPULER
                </div>
              )}

              <CardHeader className="pb-4">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
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

                <Link to="/abonelik">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    Abone Ol
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Taze ve Dogal</p>
              <p className="text-sm text-gray-500">Hasat gunu teslimat</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Ucretsiz Teslimat</p>
              <p className="text-sm text-gray-500">Kapiniza kadar</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Esnek Plan</p>
              <p className="text-sm text-gray-500">Dilediginizde iptal</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
