import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { orderApi } from '@/lib/api';

export function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [address, setAddress] = useState({
    title: 'Ev Adresi',
    fullAddress: user?.addresses?.[0]?.fullAddress || '',
    city: user?.addresses?.[0]?.city || '',
    district: user?.addresses?.[0]?.district || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('CARD');

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        address,
        paymentMethod,
      };
      await orderApi.create(orderData);
      clearCart();
      setStep(3); // Success
    } catch (error) {
      alert('Sipariş oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Sepetiniz boş</p>
        <Link to="/products">
          <Button>Alışverişe Başla</Button>
        </Link>
      </div>
    );
  }

  // Success Page
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Siparişiniz Alındı!</h2>
          <p className="text-gray-500 mb-6">Siparişiniz başarıyla oluşturuldu. En kısa sürede kargoya verilecektir.</p>
          <div className="space-y-2">
            <Link to="/orders">
              <Button className="w-full bg-green-600 hover:bg-green-700">Siparişlerimi Gör</Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="w-full">Alışverişe Devam Et</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link to="/cart" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Sepete Dön
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>1</div>
          <div className="w-16 h-1 bg-gray-200 mx-2">
            <div className={`h-full bg-green-600 ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>2</div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Teslimat Adresi
            </h2>
            <div className="space-y-4">
              <Input
                placeholder="Adres Başlığı"
                value={address.title}
                onChange={(e) => setAddress({...address, title: e.target.value})}
              />
              <Input
                placeholder="Şehir"
                value={address.city}
                onChange={(e) => setAddress({...address, city: e.target.value})}
              />
              <Input
                placeholder="İlçe"
                value={address.district}
                onChange={(e) => setAddress({...address, district: e.target.value})}
              />
              <textarea
                placeholder="Açık Adres"
                value={address.fullAddress}
                onChange={(e) => setAddress({...address, fullAddress: e.target.value})}
                className="w-full p-3 border rounded-lg min-h-[100px]"
              />
            </div>
            <Button 
              className="w-full mt-6 bg-green-600 hover:bg-green-700" 
              onClick={() => setStep(2)}
              disabled={!address.city || !address.fullAddress}
            >
              Devam Et
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Ödeme Yöntemi
            </h2>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Kredi Kartı</p>
                  <p className="text-sm text-gray-500">Güvenli ödeme</p>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="TRANSFER"
                  checked={paymentMethod === 'TRANSFER'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Havale/EFT</p>
                  <p className="text-sm text-gray-500">Banka transferi</p>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="CASH"
                  checked={paymentMethod === 'CASH'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Kapıda Ödeme</p>
                  <p className="text-sm text-gray-500">Nakit veya kredi kartı</p>
                </div>
              </label>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Toplam</span>
                <span>₺{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 w-full" onClick={() => setStep(1)}>
                Geri
              </Button>
              <Button 
                className="flex-1 w-full bg-green-600 hover:bg-green-700" 
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'İşleniyor...' : 'Siparişi Tamamla'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
