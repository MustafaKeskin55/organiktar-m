import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Truck, Sprout, Loader2 } from 'lucide-react';
import { siteContentApi } from '@/lib/api';

interface Step {
  icon: string;
  title: string;
  description: string;
  color: string;
}

export function HowItWorksSection() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    try {
      const content = await siteContentApi.getHowItWorks();
      setSteps(content.steps || []);
    } catch (error) {
      console.error('How it works yuklenirken hata:', error);
      // Fallback
      setSteps([
        { icon: 'Search', title: 'Kesfet', description: 'Yakinlarinizdaki ureticileri kesfedin.', color: 'bg-blue-100 text-blue-600' },
        { icon: 'ShoppingCart', title: 'Siparis Ver', description: 'Urunleri sepete ekleyin.', color: 'bg-green-100 text-green-600' },
        { icon: 'Truck', title: 'Kapiniza Gelsin', description: 'Teslimat yapilsin.', color: 'bg-orange-100 text-orange-600' },
        { icon: 'Sprout', title: 'Destek Olun', description: 'Yerel ureticileri destekleyin.', color: 'bg-purple-100 text-purple-600' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Search': return Search;
      case 'ShoppingCart': return ShoppingCart;
      case 'Truck': return Truck;
      case 'Sprout': return Sprout;
      default: return Search;
    }
  };

  if (loading) {
    return (
      <section className="flex h-64 items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </section>
    );
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            Nasil Calisir?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {steps.length} basit adimda taze, dogal urunlere ulasin
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const IconComponent = getIconComponent(step.icon);
            return (
              <div key={step.title} className="relative">
                <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                  {index + 1}
                </div>

                <div className="rounded-xl border bg-gray-50 p-6 transition-all hover:shadow-lg">
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${step.color}`}>
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-4 hidden h-0.5 w-8 bg-gray-200 lg:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
