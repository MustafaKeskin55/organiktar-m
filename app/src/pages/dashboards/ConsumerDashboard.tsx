import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, ShoppingBag, Heart, MapPin, CreditCard, Settings,
  LogOut, Package, Clock, CheckCircle, Truck, Star,
  ChevronRight, Search, Filter, Calendar, Download,
  Edit2, Plus, Trash2, Bell, Shield, HelpCircle,
  ArrowRight, Gift, Ticket, Sparkles, Home, Phone,
  Mail, FileText, ExternalLink, Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { orderApi, userApi, toast } from '@/lib/api';
import type { Order, Product, Address } from '@/types';

interface ConsumerStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
  savedAmount: number;
  favoriteCount: number;
  loyaltyPoints: number;
  memberSince: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'overview', label: 'Hesabım', icon: User },
  { id: 'orders', label: 'Siparişlerim', icon: ShoppingBag, badge: 0 },
  { id: 'favorites', label: 'Favorilerim', icon: Heart, badge: 0 },
  { id: 'addresses', label: 'Adreslerim', icon: MapPin },
  { id: 'payments', label: 'Ödeme Yöntemleri', icon: CreditCard },
  { id: 'coupons', label: 'Kuponlarım', icon: Ticket },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export function ConsumerDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isTokenValid, updateUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<ConsumerStats>({
    totalOrders: 0, activeOrders: 0, completedOrders: 0,
    totalSpent: 0, savedAmount: 0, favoriteCount: 0,
    loyaltyPoints: 0, memberSince: '2024'
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!isTokenValid()) {
      logout();
      navigate('/giris');
      return;
    }

    try {
      setRefreshing(true);
      const userId = user?.id;

      // Fetch user's orders
      const ordersRes = await orderApi.getByConsumer(parseInt(userId || '0'));

      // Calculate stats
      const totalSpent = ordersRes?.reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0) || 0;
      const activeCount = ordersRes?.filter((o: Order) => 
        ['beklemede', 'onaylandi', 'hazirlaniyor', 'yolda'].includes(o.status)
      ).length || 0;
      const completedCount = ordersRes?.filter((o: Order) => o.status === 'teslim-edildi').length || 0;

      setStats({
        totalOrders: ordersRes?.length || 0,
        activeOrders: activeCount,
        completedOrders: completedCount,
        totalSpent: totalSpent,
        savedAmount: totalSpent * 0.05, // 5% savings estimate
        favoriteCount: user?.favorites?.length || 0,
        loyaltyPoints: Math.floor(totalSpent / 10),
        memberSince: user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : '2024'
      });

      setOrders(ordersRes || []);
      setAddresses(user?.addresses || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Oturum süreniz doldu');
        logout();
        navigate('/giris');
      }
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [isTokenValid, logout, navigate, user?.id, user?.favorites, user?.addresses, user?.createdAt]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    logout();
    navigate('/giris');
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'beklemede': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'onaylandi': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'hazirlaniyor': return <Package className="h-5 w-5 text-purple-500" />;
      case 'yolda': return <Truck className="h-5 w-5 text-orange-500" />;
      case 'teslim-edildi': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getOrderStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      'beklemede': 'Onay Bekliyor',
      'onaylandi': 'Onaylandı',
      'hazirlaniyor': 'Hazırlanıyor',
      'yolda': 'Kargoda',
      'teslim-edildi': 'Teslim Edildi',
      'iptal-edildi': 'İptal Edildi'
    };
    return statuses[status] || status;
  };

  // Overview Tab
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white/20">
                <AvatarFallback className="bg-white/20 text-white text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-slate-300">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-white/10 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {stats.loyaltyPoints} Puan
                  </Badge>
                  <span className="text-xs text-slate-400">Üye since {stats.memberSince}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto" onClick={() => setShowEditProfile(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('orders')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Siparişlerim</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeOrders} aktif sipariş
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('favorites')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favorilerim</p>
                <p className="text-2xl font-bold">{stats.favoriteCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-red-100">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Kaydedilen ürünler</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Harcama</p>
                <p className="text-2xl font-bold">{stats.totalSpent.toLocaleString('tr-TR')} TL</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {stats.savedAmount.toFixed(0)} TL tasarruf
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('coupons')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kuponlarım</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Ticket className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aktif kupon</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Son Siparişlerim</CardTitle>
            <CardDescription>Son 3 siparişiniz</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
            Tümünü Gör
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-gray-100">
                    {getOrderStatusIcon(order.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Sipariş #{order.id}</span>
                      <Badge variant={order.status === 'teslim-edildi' ? 'default' : 'secondary'}>
                        {getOrderStatusText(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')} • {order.items?.length || 0} ürün
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{order.totalAmount?.toFixed(2)} TL</p>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                    Detaylar
                  </Button>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Henüz siparişiniz yok</p>
                <Button className="mt-4" onClick={() => navigate('/urunler')}>
                  Alışverişe Başla
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Sadakat Programı</CardTitle>
          <CardDescription>1000 puana ulaştığınızda 50 TL kupon kazanın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Mevcut Puan: <strong>{stats.loyaltyPoints}</strong></span>
              <span>Hedef: <strong>1000</strong></span>
            </div>
            <Progress value={(stats.loyaltyPoints / 1000) * 100} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {1000 - stats.loyaltyPoints} puan daha kazanarak 50 TL değerinde kupon kazanabilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Orders Tab
  const OrdersTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tüm Siparişlerim ({orders.length})</h3>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="completed">Tamamlanan</SelectItem>
              <SelectItem value="cancelled">İptal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Sipariş #{order.id}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <Badge variant={order.status === 'teslim-edildi' ? 'default' : 'secondary'}>
                  {getOrderStatusText(order.status)}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-gray-100">
                    {getOrderStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="font-medium">{order.items?.length || 0} ürün</p>
                    <p className="text-sm text-muted-foreground">Teslimat: {order.estimatedDelivery || 'Belirtilmemiş'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{order.totalAmount?.toFixed(2)} TL</p>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    Sipariş Detayı
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Henüz siparişiniz yok</h3>
            <p className="text-muted-foreground mb-4">Hemen alışverişe başlayın!</p>
            <Button onClick={() => navigate('/urunler')}>Ürünleri Keşfet</Button>
          </Card>
        )}
      </div>
    </div>
  );

  // Addresses Tab
  const AddressesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kayıtlı Adreslerim ({addresses.length})</h3>
        <Button onClick={() => setShowAddAddress(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Adres
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id} className={`relative ${address.isDefault ? 'border-green-500' : ''}`}>
            {address.isDefault && (
              <Badge className="absolute top-2 right-2 bg-green-100 text-green-700">
                Varsayılan
              </Badge>
            )}
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Home className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{address.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{address.fullAddress}</p>
                  <p className="text-sm text-muted-foreground">{address.district}, {address.city}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">Düzenle</Button>
                    {!address.isDefault && (
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Address Card */}
        <Card className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setShowAddAddress(true)}>
          <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[180px]">
            <div className="p-3 rounded-full bg-gray-100 mb-2">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">Yeni Adres Ekle</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Coupons Tab
  const CouponsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Kuponlarım</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { code: 'HOSGELDIN50', discount: '50 TL', minOrder: '250 TL', expiry: '31.12.2024', type: 'Hoş Geldin' },
          { code: 'ORGANIK20', discount: '%20', minOrder: '100 TL', expiry: '30.06.2024', type: 'Organik Ürünler' },
          { code: 'SADAKAT100', discount: '100 TL', minOrder: '500 TL', expiry: '15.07.2024', type: 'Sadakat' },
        ].map((coupon, i) => (
          <Card key={i} className="overflow-hidden border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">{coupon.type}</Badge>
                  <h4 className="font-bold text-xl text-purple-600">{coupon.discount}</h4>
                  <p className="text-sm text-muted-foreground">İndirim</p>
                </div>
                <Ticket className="h-8 w-8 text-purple-200" />
              </div>
              <Separator className="my-3" />
              <div className="space-y-1 text-sm">
                <p><strong>Kod:</strong> {coupon.code}</p>
                <p className="text-muted-foreground">Min. sipariş: {coupon.minOrder}</p>
                <p className="text-muted-foreground">Son kullanma: {coupon.expiry}</p>
              </div>
              <Button className="w-full mt-3" variant="outline">Kullan</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-slate-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h1 className="font-bold">Hesabım</h1>
              <p className="text-xs text-muted-foreground">Müşteri Paneli</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <Badge variant={activeTab === item.id ? 'default' : 'secondary'} className="text-xs">
                  {item.badge}
                </Badge>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <header className="sticky top-0 z-10 bg-white border-b px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <User className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <h1 className="font-bold">Hesabım</h1>
                        <p className="text-xs text-muted-foreground">Müşteri Paneli</p>
                      </div>
                    </div>
                  </div>
                  <nav className="flex-1 p-2 space-y-1">
                    {MENU_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          activeTab === item.id
                            ? 'bg-slate-100 text-slate-900 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge ? (
                          <Badge variant={activeTab === item.id ? 'default' : 'secondary'} className="text-xs">
                            {item.badge}
                          </Badge>
                        ) : null}
                      </button>
                    ))}
                  </nav>
                  <div className="p-4 border-t absolute bottom-0 w-full bg-white">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Çıkış Yap
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <h2 className="text-xl font-semibold">
                {MENU_ITEMS.find(i => i.id === activeTab)?.label}
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchDashboardData} disabled={refreshing}>
              <div className={`${refreshing ? 'animate-spin' : ''}`}>
                <Sparkles className="h-4 w-4" />
              </div>
            </Button>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'addresses' && <AddressesTab />}
          {activeTab === 'coupons' && <CouponsTab />}
          {['favorites', 'payments', 'settings'].includes(activeTab) && (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Bu modül yakında aktif olacak</p>
            </Card>
          )}
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profilimi Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ad Soyad</Label>
              <Input defaultValue={user?.name} />
            </div>
            <div>
              <Label>E-posta</Label>
              <Input defaultValue={user?.email} type="email" />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input defaultValue={user?.phone} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>İptal</Button>
            <Button onClick={() => { toast.success('Profil güncellendi'); setShowEditProfile(false); }}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
