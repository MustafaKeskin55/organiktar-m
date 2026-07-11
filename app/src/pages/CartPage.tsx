import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Universal Header */}
      <Header />

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Sepetiniz Henüz Boş</h2>
          <p className="text-gray-500 mt-2 text-center">Organik ürünleri keşfetmek ve sepetinize eklemek için hemen alışverişe başlayın.</p>
          <Link to="/urunler" className="mt-6">
            <Button className="bg-green-600 hover:bg-green-700 px-6 h-11">Alışverişe Başla</Button>
          </Link>
        </div>
      ) : (
        <main className="max-w-3xl mx-auto px-4 py-4 md:py-8 flex-1 w-full">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-4 md:mb-6">Sepetim ({items.length} ürün)</h1>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="bg-white rounded-xl p-3 md:p-4 flex flex-col sm:flex-row items-center gap-3 md:gap-4 border shadow-sm">
                <img
                  src={item.product.images?.[0] ? 
                    (item.product.images[0].startsWith('http') ? item.product.images[0] : `/uploads/${item.product.images[0]}`)
                    : '/placeholder-product.png'}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-gray-900">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{item.product.producerName}</p>
                  <p className="text-green-700 font-semibold mt-1">₺{item.product.price} / {item.product.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg border transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg border transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="text-right min-w-[80px] font-bold text-gray-900 text-lg">
                  ₺{(item.product.price * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border p-4 md:p-6 mt-4 md:mt-6 shadow-sm">
            <div className="flex justify-between items-center text-base md:text-lg font-bold mb-4 md:mb-6">
              <span className="text-gray-700">Toplam Sepet Tutarı</span>
              <span className="text-2xl text-green-700">₺{getTotalPrice().toFixed(2)}</span>
            </div>
            <Link to="/checkout">
              <Button className="w-full bg-green-600 hover:bg-green-700 py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl">
                Siparişi Tamamla
              </Button>
            </Link>
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
}
