import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store, Package, ShoppingBag, DollarSign, TrendingUp,
  LogOut, Plus, Edit2, Eye, BarChart3, Star, Users,
  Leaf, AlertCircle, CheckCircle, Clock, Truck,
  ChevronRight, ArrowUpRight, ArrowDownRight, Image as ImageIcon,
  Grid3X3, List, Search, Filter, Download, Calendar,
  MapPin, Phone, Mail, FileText, Settings, BadgeCheck, Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { productApi, orderApi, toast } from '@/lib/api';
import type { Product, Order, Producer } from '@/types';

interface ProducerStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  commissionPaid: number;
  netEarnings: number;
  avgRating: number | null;
  totalCustomers: number;
  monthlyGrowth: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'overview', label: 'Özet', icon: BarChart3 },
  { id: 'products', label: 'Ürünlerim', icon: Package, badge: 0 },
  { id: 'orders', label: 'Siparişler', icon: ShoppingBag, badge: 0 },
  { id: 'earnings', label: 'Kazançlar', icon: DollarSign },
  { id: 'reviews', label: 'Değerlendirmeler', icon: Star },
  { id: 'profile', label: 'Profilim', icon: Store },
];

// Calculate daily revenue from orders for the last 30 days
function calculateDailyRevenue(orders: Order[]): { day: string; amount: number }[] {
  const dailyMap = new Map<string, number>();
  const today = new Date();

  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dailyMap.set(date.toISOString().split('T')[0], 0);
  }

  // Sum up orders by date
  orders.forEach(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    if (dailyMap.has(orderDate)) {
      const current = dailyMap.get(orderDate) || 0;
      dailyMap.set(orderDate, current + (order.totalAmount || 0));
    }
  });

  return Array.from(dailyMap.entries())
    .map(([day, amount]) => ({ day, amount }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

// Calculate category performance from products and orders
function calculateCategoryPerformance(products: Product[], orders: Order[]) {
  const categoryMap = new Map<string, { count: number; revenue: number }>();

  orders.forEach(order => {
      order.items?.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const category = product.category || 'Diğer';
          const existing = categoryMap.get(category) || { count: 0, revenue: 0 };
          existing.count += 1;
          existing.revenue += (item.unitPrice || item.totalPrice || 0) * (item.quantity || 0);
          categoryMap.set(category, existing);
        }
      });
  });

  const total = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.revenue, 0);
  const colors: Record<string, string> = {
    'sebze': 'bg-green-500',
    'meyve': 'bg-orange-500',
    'sut-urunleri': 'bg-blue-500',
    'et-urunleri': 'bg-red-500',
    'bakliyat': 'bg-yellow-500',
    'organik': 'bg-emerald-500',
    'diger': 'bg-gray-400',
  };

  return Array.from(categoryMap.entries())
    .map(([label, data]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, ' '),
      value: total > 0 ? Math.round((data.revenue / total) * 100) : 0,
      count: data.count,
      color: colors[label] || 'bg-gray-400',
    }))
    .sort((a, b) => b.value - a.value);
}

// Calculate monthly growth
function calculateMonthlyGrowth(orders: Order[]): number {
  const now = new Date();
  const thisMonth = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  });
  const lastMonth = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return orderDate.getMonth() === lastMonthDate.getMonth() && orderDate.getFullYear() === lastMonthDate.getFullYear();
  });

  const thisMonthRevenue = thisMonth.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const lastMonthRevenue = lastMonth.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  if (lastMonthRevenue === 0) return 0;
  return Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
}

export function ProducerDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isTokenValid, isInitialized } = useAuthStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<ProducerStats>({
    totalProducts: 0, activeProducts: 0, totalOrders: 0, pendingOrders: 0,
    totalRevenue: 0, commissionPaid: 0, netEarnings: 0, avgRating: null,
    totalCustomers: 0, monthlyGrowth: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth kontrolü - initialize olmadan API çağrısı yapma
  useEffect(() => {
    if (!isInitialized) return;

    if (!isTokenValid()) {
      logout();
      navigate('/giris');
      return;
    }

    setAuthChecked(true);
  }, [isInitialized, isTokenValid, logout, navigate]);

  const fetchDashboardData = useCallback(async () => {
    if (!authChecked || !isTokenValid()) return;

    try {
      setRefreshing(true);
      const userId = user?.id;

      // Fetch producer's products
      const productsRes = await productApi.getByProducer(parseInt(userId || '0'));

      // Fetch all orders and filter by producer's products
      const ordersRes = await orderApi.getAll();
      const producerProductIds = new Set(productsRes?.map((p: Product) => p.id));

      const producerOrders = ordersRes?.filter((o: Order) =>
        o.items?.some((item) => producerProductIds.has(item.productId))
      ) || [];

      const totalRevenue = producerOrders.reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0);
      const commission = totalRevenue * 0.05;

      setStats({
        totalProducts: productsRes?.length || 0,
        activeProducts: productsRes?.filter((p: Product) => p.isActive !== false).length || 0,
        totalOrders: producerOrders.length,
        pendingOrders: producerOrders.filter((o: Order) => o.status === 'beklemede').length,
        totalRevenue: totalRevenue,
        commissionPaid: commission,
        netEarnings: totalRevenue - commission,
        avgRating: null, // Rating system not implemented yet
        totalCustomers: new Set(producerOrders.map((o: Order) => o.userId)).size,
        monthlyGrowth: calculateMonthlyGrowth(producerOrders)
      });

      setProducts(productsRes || []);
      setOrders(producerOrders);
    } catch (error: any) {
      console.error('Producer dashboard error:', error);
      if (error.response?.status === 401) {
        toast.error('Oturum süreniz doldu');
        logout();
        navigate('/giris');
      } else {
        toast.error('Veriler yüklenirken hata oluştu');
      }
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [authChecked, isTokenValid, logout, navigate, user?.id]);

  useEffect(() => {
    if (!authChecked) return;
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, authChecked]);

  const handleLogout = () => {
    logout();
    navigate('/giris');
  };

  // Memoized calculations
  const dailyRevenue = useMemo(() => calculateDailyRevenue(orders), [orders]);
  const categoryPerformance = useMemo(() => calculateCategoryPerformance(products, orders), [products, orders]);

  // Overview Tab
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-green-100">Hoş Geldiniz,</p>
                <h2 className="text-2xl font-bold mt-1">{user?.name}</h2>
                <p className="text-green-100 mt-2 flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  Onaylı Üretici
                </p>
              </div>
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white/20">
              <AvatarFallback className="bg-white/20 text-white text-xl">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Kazanç</p>
                <p className="text-2xl font-bold">{stats.netEarnings.toLocaleString('tr-TR')} TL</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className={`flex items-center text-xs mt-1 ${stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.monthlyGrowth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              %{Math.abs(stats.monthlyGrowth)} bu ay
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Siparişler</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingOrders} bekleyen
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ürünlerim</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeProducts} aktif
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Müşteriler</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
              <div className="p-2 rounded-lg bg-orange-100">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Benzersiz müşteri
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gelir Trendi</CardTitle>
            <CardDescription>Son 30 gün kazanç grafiği</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end gap-1">
              {dailyRevenue.length > 0 ? (
                dailyRevenue.map((day, i) => {
                  const maxAmount = Math.max(...dailyRevenue.map(d => d.amount), 1);
                  const height = (day.amount / maxAmount) * 180;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                      <div
                        className="w-full bg-green-200 rounded-t-sm transition-all group-hover:bg-green-400"
                        style={{ height: `${Math.max(height, 3)}px` }}
                        title={`${new Date(day.day).toLocaleDateString('tr-TR')}: ${day.amount.toLocaleString('tr-TR')} TL`}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Henüz sipariş verisi yok
                </div>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>30 gün önce</span>
              <span>Bugün</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kategori Performansı</CardTitle>
            <CardDescription>Ürün kategorilerine göre satış</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPerformance.length > 0 ? (
                categoryPerformance.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span>%{item.value} ({item.count} sipariş)</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full ${item.color} transition-all`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Henüz kategori verisi yok
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Son Siparişler</CardTitle>
            <CardDescription>Son 5 sipariş</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
            Tümünü Gör
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    order.status === 'beklemede' ? 'bg-yellow-100' :
                    order.status === 'hazirlaniyor' ? 'bg-blue-100' :
                    order.status === 'yolda' ? 'bg-purple-100' :
                    'bg-green-100'
                  }`}>
                    {order.status === 'beklemede' ? <Clock className="h-4 w-4 text-yellow-600" /> :
                     order.status === 'hazirlaniyor' ? <Package className="h-4 w-4 text-blue-600" /> :
                     order.status === 'yolda' ? <Truck className="h-4 w-4 text-purple-600" /> :
                     <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <div>
                    <p className="font-medium">#{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.items?.length || 0} ürün</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.totalAmount} TL</p>
                  <Badge variant="outline" className="text-xs">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Henüz sipariş yok</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Products Tab
  const ProductsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => setShowAddProduct(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Ürün
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2" variant={product.isActive !== false ? 'default' : 'secondary'}>
                  {product.isActive !== false ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-green-600 text-lg">{product.price} TL</span>
                  <span className={`text-sm ${product.stock < 10 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    Stok: {product.stock}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit2 className="h-3 w-3 mr-1" />
                    Düzenle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{product.price} TL</p>
                      <p className={`text-sm ${product.stock < 10 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        Stok: {product.stock}
                      </p>
                    </div>
                    <Badge variant={product.isActive !== false ? 'default' : 'secondary'}>
                      {product.isActive !== false ? 'Aktif' : 'Pasif'}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Orders Tab
  const OrdersTab = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Siparişlerim</CardTitle>
          <CardDescription>Size gelen tüm siparişler</CardDescription>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Bekleyen</SelectItem>
            <SelectItem value="processing">Hazırlanıyor</SelectItem>
            <SelectItem value="shipped">Kargoda</SelectItem>
            <SelectItem value="delivered">Tamamlandı</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{(order.userName || 'M').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">#{order.id}</span>
                    <Badge variant={
                      order.status === 'teslim-edildi' ? 'default' :
                      order.status === 'beklemede' ? 'secondary' :
                      'outline'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.userName || 'Müşteri'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{order.totalAmount} TL</p>
                <p className="text-xs text-muted-foreground">{order.items?.length || 0} ürün</p>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Henüz sipariş yok</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Store className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="font-bold">Üretici Paneli</h1>
              <p className="text-xs text-muted-foreground">Üretim Yönetimi</p>
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
                  ? 'bg-green-50 text-green-700 font-medium'
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
                      <div className="p-2 rounded-lg bg-green-100">
                        <Store className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h1 className="font-bold">Üretici Paneli</h1>
                        <p className="text-xs text-muted-foreground">Üretim Yönetimi</p>
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
                            ? 'bg-green-50 text-green-700 font-medium'
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
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={fetchDashboardData} disabled={refreshing}>
                <div className={`${refreshing ? 'animate-spin' : ''}`}>
                  <TrendingUp className="h-4 w-4" />
                </div>
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {['earnings', 'reviews', 'profile'].includes(activeTab) && (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Bu modül yakında aktif olacak</p>
            </Card>
          )}
        </div>
      </main>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Ürün Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ürün Adı</Label>
              <Input placeholder="Ürün adı girin" />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Input placeholder="Ürün açıklaması" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fiyat (TL)</Label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div>
                <Label>Stok</Label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)}>İptal</Button>
            <Button onClick={() => { toast.success('Ürün eklendi'); setShowAddProduct(false); }}>Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
