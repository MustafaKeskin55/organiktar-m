import { Link } from 'react-router-dom';
import { Leaf, Truck, Users, Award } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Universal Header */}
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hakkımızda</h1>
          <p className="text-lg text-gray-600">
            Organik Tarım olarak amacımız, yerel üreticileri tüketicilerle buluşturmak ve 
            sağlıklı, doğal ürünlere erişimi kolaylaştırmaktır.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">100% Organik</h3>
            <p className="text-gray-600">Tüm ürünlerimiz doğal ve kimyasalsız üretilmektedir.</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <Truck className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Hızlı Teslimat</h3>
            <p className="text-gray-600">Siparişleriniz aynı gün veya ertesi gün kapınızda.</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Yerel Üreticiler</h3>
            <p className="text-gray-600">Bölgesel çiftçileri destekleyerek sürdürülebilir tarımı teşvik ediyoruz.</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Kalite Garantisi</h3>
            <p className="text-gray-600">Tüm ürünlerimiz kalite kontrolünden geçmektedir.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Misyonumuz</h2>
          <p className="text-gray-600 leading-relaxed">
            Türkiye'nin her köşesindeki yerel üreticileri, sağlıklı yaşam arayan tüketicilerle buluşturuyoruz. 
            Ara zincirleri ortadan kaldırarak hem üreticiye adil fiyat, hem tüketiciye uygun fiyat ve taze ürün sunuyoruz.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
