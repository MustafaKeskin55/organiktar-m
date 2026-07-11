import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { orderApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Order } from '@/types';

const STATUS_CONFIG = {
  PENDING: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  PREPARING: { label: 'Hazırlanıyor', color: 'bg-purple-100 text-purple-800', icon: Package },
  SHIPPED: { label: 'Kargoda', color: 'bg-orange-100 text-orange-800', icon: Truck },
  DELIVERED: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await orderApi.getByUser(user!.id);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Giriş yapmanız gerekiyor</p>
        <Link to="/login">
          <Button>Giriş Yap</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Ana Sayfa
          </Link>
          <h1 className="text-lg font-semibold">Siparişlerim</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 md:py-8">
        {loading ? (
          <div className="text-center py-12">Yükleniyor...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Henüz Siparişiniz Yok</h2>
            <p className="text-gray-500 mt-2">İlk siparişinizi vermek için ürünlere göz atın</p>
            <Link to="/products" className="mt-6 inline-block">
              <Button>Alışverişe Başla</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = status.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-lg p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Sipariş No</p>
                      <p className="font-semibold">{order.orderNumber || `ORD-${order.id}`}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">Ürünler</p>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.productName} x {item.quantity}</span>
                          <span className="font-medium">₺{item.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t mt-4 pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Toplam</p>
                      <p className="text-xl font-bold text-green-700">₺{order.totalAmount}</p>
                    </div>
                    <Button variant="outline" size="sm">Detaylar</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
