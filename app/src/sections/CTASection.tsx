import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Store, ShoppingBag } from 'lucide-react';

export function CTASection() {
  return (
    <section className="bg-gradient-to-br from-green-600 to-green-700 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            Yerel Üreticileri Desteklemeye Hazır mısınız?
          </h2>
          <p className="mb-8 text-lg text-green-100">
            Hemen ücretsiz hesap oluşturun, yakınınızdaki üreticileri keşfedin,
            taze ürünlere ulaşın.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/kayit">
              <Button
                size="lg"
                className="h-14 bg-white px-8 text-base text-green-700 hover:bg-green-50"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Alışverişe Başla
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/uretici-ol">
              <Button
                size="lg"
                variant="outline"
                className="h-14 border-2 border-white bg-transparent px-8 text-base text-white hover:bg-white/10"
              >
                <Store className="mr-2 h-5 w-5" />
                Üretici Ol
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-green-200">
            Ücretsiz kayıt. Kredi kartı gerekmez.
          </p>
        </div>
      </div>
    </section>
  );
}
