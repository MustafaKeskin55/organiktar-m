import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Search,
  LogOut, RefreshCw, Eye, Edit2, CheckCircle, Clock,
  AlertCircle, XCircle, Truck, Filter, Calendar, ArrowUpRight,
  ArrowDownRight, BadgeCheck, UserCheck, MessageSquare,
  ClipboardList, BarChart3, PieChart, TrendingUp, Bell,
  MapPin, Phone, Mail, MoreVertical, ChevronDown,
  ChevronRight, FileText, Printer, Download, CheckSquare, Menu
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
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { adminApi, userApi, productApi, orderApi, toast } from '@/lib/api';
import type { Product, Order } from '@/types';

interface OperationStats {
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  completedToday: number;
  totalUsers: number;
  activeProducts: number;
  lowStockAlert: number;
  customerMessages: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'operations', label: 'Operasyon Merkezi', icon: LayoutDashboard, badge: 0 },
  { id: 'orders', label: 'Sipariş Takibi', icon: ShoppingBag, badge: 0 },
  { id: 'products', label: 'Ürün İnceleme', icon: Package },
  { id: 'users', label: 'Kullanıcı Listesi', icon: Users },
  { id: 'producers', label: 'Üretici Yönetimi', icon: BadgeCheck },
  { id: 'support', label: 'Müşteri Destek', icon: MessageSquare, badge: 0 },
];

export function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isTokenValid, isInitialized } = useAuthStore();

  const [activeTab, setActiveTab] = useState('operations');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<OperationStats>({
    pendingOrders: 0, processingOrders: 0, shippedOrders: 0, completedToday: 0,
    totalUsers: 0, activeProducts: 0, lowStockAlert: 0, customerMessages: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth kontrolü - initialize olmadan API çağrısı yapma
  useEffect(() => {
    if (!isInitialized) return;

    if (!isTokenValid()) {
      logout();
      navigate('/admin/giris');
      return;
    }

    setAuthChecked(true);
  }, [isInitialized, isTokenValid, logout, navigate]);

  const fetchDashboardData = useCallback(async () => {
    if (!authChecked || !isTokenValid()) return;

    try {
      setRefreshing(true);
      const [statsRes, ordersRes, productsRes, usersRes] = await Promise.all([
        adminApi.getAdminDashboardStats(),
        orderApi.getAll(),
        productApi.getAll(),
        adminApi.getAllUsersAdmin().catch(() => [])
      ]);

      setStats({
        pendingOrders: ordersRes?.filter((o: Order) => o.status === 'beklemede').length || 0,
        processingOrders: ordersRes?.filter((o: Order) => o.status === 'hazirlaniyor').length || 0,
        shippedOrders: ordersRes?.filter((o: Order) => o.status === 'yolda').length || 0,
        completedToday: ordersRes?.filter((o: Order) =>
          o.status === 'teslim-edildi' && new Date(o.createdAt).toDateString() === new Date().toDateString()
        ).length || 0,
        totalUsers: usersRes?.length || 0,
        activeProducts: productsRes?.filter((p: Product) => p.isActive !== false).length || 0,
        lowStockAlert: productsRes?.filter((p: Product) => p.stock < 10).length || 0,
        customerMessages: 0
      });

      setOrders(ordersRes || []);
      setProducts(productsRes || []);
      setUsers(usersRes || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Oturum süreniz doldu');
        logout();
        navigate('/admin/giris');
      }
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [authChecked, isTokenValid, logout, navigate]);

  useEffect(() => {
    if (!authChecked) return;
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, authChecked]);

  const handleLogout = () => {
    logout();
    navigate('/admin/giris');
  };

  const updateOrderStatus = async (orderId: string | number, newStatus: string) => {
    try {
      await orderApi.updateStatus(typeof orderId === 'string' ? parseInt(orderId) : orderId, newStatus);
      toast.success(`Sipariş durumu güncellendi: ${newStatus}`);
      fetchDashboardData();
      setShowOrderDetail(false);
    } catch (error) {
      toast.error('Durum güncellenirken hata oluştu');
    }
  };

  // Operations Center Tab
  const OperationsCenterTab = () => (
    <div className="space-y-6">
      {/* Priority Alerts */}
      {(stats.pendingOrders > 0 || stats.lowStockAlert > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.pendingOrders > 0 && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-yellow-800">{stats.pendingOrders} Bekleyen Sipariş</p>
                  <p className="text-sm text-yellow-600">Onay bekleyen siparişler var</p>
                </div>
                <Button size="sm" onClick={() => setActiveTab('orders')}>İncele</Button>
              </CardContent>
            </Card>
          )}
          {stats.lowStockAlert > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-800">{stats.lowStockAlert} Düşük Stok Uyarısı</p>
                  <p className="text-sm text-red-600">Stoğu azalan ürünler</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('products')}>İncele</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bekleyen</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hazırlanıyor</p>
                <p className="text-2xl font-bold">{stats.processingOrders}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yolda</p>
                <p className="text-2xl font-bold">{stats.shippedOrders}</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bugün Tamamlanan</p>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Sipariş Akışı</CardTitle>
          <CardDescription>Güncel sipariş durumları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
            <div className="relative grid grid-cols-4 gap-4">
              {[
                { label: 'Bekleyen', count: stats.pendingOrders, color: 'bg-yellow-500', icon: Clock },
                { label: 'Onaylandı', count: orders.filter(o => o.status === 'onaylandi').length, color: 'bg-blue-500', icon: CheckCircle },
                { label: 'Hazırlanıyor', count: stats.processingOrders, color: 'bg-purple-500', icon: Package },
                { label: 'Kargoda', count: stats.shippedOrders, color: 'bg-orange-500', icon: Truck },
              ].map((step, i) => (
                <div key={step.label} className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full ${step.color} flex items-center justify-center text-white shadow-lg mb-2 relative z-10`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-sm">{step.label}</p>
                  <p className="text-lg font-bold">{step.count}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Son Siparişler</CardTitle>
            <CardDescription>En son gelen siparişler</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
            Tümünü Gör
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                onClick={() => { setSelectedOrder(order); setShowOrderDetail(true); }}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              >
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
                    <p className="text-sm text-muted-foreground">{order.userName || 'Bilinmiyor'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.totalAmount} TL</p>
                  <Badge variant={order.status === 'beklemede' ? 'secondary' : 'default'} className="text-xs">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Orders Tab
  const OrdersTab = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sipariş Yönetimi</CardTitle>
          <CardDescription>Tüm siparişleri takip edin</CardDescription>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Sipariş ara..." className="w-64" />
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="pending">Bekleyen</SelectItem>
              <SelectItem value="processing">Hazırlanıyor</SelectItem>
              <SelectItem value="shipped">Kargoda</SelectItem>
              <SelectItem value="delivered">Teslim Edildi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => { setSelectedOrder(order); setShowOrderDetail(true); }}
              className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {(order.userName || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Sipariş #{order.id}</span>
                    <Badge
                      variant={
                        order.status === 'teslim-edildi' ? 'default' :
                        order.status === 'beklemede' ? 'secondary' :
                        order.status === 'iptal-edildi' ? 'destructive' : 'outline'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      {order.userName || 'Bilinmiyor'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-lg">{order.totalAmount} TL</p>
                  <p className="text-xs text-muted-foreground">{order.items?.length || 0} ürün</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Products Tab
  const ProductsTab = () => (
    <div className="space-y-6">
      {/* Product Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Aktif Ürünler</p>
            <p className="text-2xl font-bold">{stats.activeProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Düşük Stok</p>
            <p className="text-2xl font-bold text-red-600">{stats.lowStockAlert}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Toplam Ürün</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ürün Listesi</CardTitle>
            <CardDescription>Tüm ürünleri görüntüleyin</CardDescription>
          </div>
          <Input placeholder="Ürün ara..." className="w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border">
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
                    <p className="text-sm text-muted-foreground">{product.producerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{product.price} TL</p>
                    <p className={`text-sm ${product.stock < 10 ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                      Stok: {product.stock}
                    </p>
                  </div>
                  <Badge variant={product.isActive !== false ? 'default' : 'secondary'}>
                    {product.isActive !== false ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Users Tab
  const UsersTab = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Kullanıcı Listesi</CardTitle>
          <CardDescription>Tüm kayıtlı kullanıcılar</CardDescription>
        </div>
        <Input placeholder="Kullanıcı ara..." className="w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {u.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{u.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {u.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{u.type}</Badge>
                <Badge variant={u.isActive !== false ? 'default' : 'secondary'}>
                  {u.isActive !== false ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold">Operasyon</h1>
              <p className="text-xs text-muted-foreground">Yönetici Paneli</p>
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
                  ? 'bg-blue-50 text-blue-700 font-medium'
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
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {user?.name?.charAt(0).toUpperCase() || 'M'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Operasyon Yöneticisi</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış
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
                      <div className="p-2 rounded-lg bg-blue-100">
                        <ClipboardList className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h1 className="font-bold">Operasyon</h1>
                        <p className="text-xs text-muted-foreground">Yönetici Paneli</p>
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
                            ? 'bg-blue-50 text-blue-700 font-medium'
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
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'operations' && <OperationsCenterTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'users' && <UsersTab />}
          {['producers', 'support'].includes(activeTab) && (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Bu modül yakında aktif olacak</p>
            </Card>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sipariş Detayı #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar>
                  <AvatarFallback>{(selectedOrder.userName || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedOrder.userName || 'Bilinmiyor'}</p>
                  <p className="text-sm text-muted-foreground">{new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-sm">Sipariş Durumu</p>
                <div className="flex gap-2">
                  {['beklemede', 'onaylandi', 'hazirlaniyor', 'yolda', 'teslim-edildi'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder.id!, status)}
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedOrder.status === status
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-sm">Ürünler</p>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.productName || 'Bilinmeyen Ürün'} x {item.quantity}</span>
                    <span>{(item.unitPrice || item.totalPrice || 0) * item.quantity} TL</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t flex justify-between font-bold">
                <span>Toplam</span>
                <span>{selectedOrder.totalAmount} TL</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
