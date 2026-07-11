import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, DollarSign,
  Settings, LogOut, Search, TrendingUp, AlertCircle,
  CheckCircle, XCircle, RefreshCw, Plus, Trash2, Edit2,
  Lock, Mail, Bell, Shield, Activity, BarChart3, PieChart,
  Calendar, Download, Filter, MoreVertical, Eye, Ban,
  Check, ChevronDown, ChevronRight, Store, CreditCard,
  MessageSquare, Tag, UserCog, FileText, HelpCircle, Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { adminApi, userApi, productApi, orderApi, toast } from '@/lib/api';
import type { Product, Order } from '@/types';

// Admin Role Types
type AdminRole = 'super_admin' | 'manager' | 'finance';

// Dashboard Stats Interface
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  todayOrders: number;
  commissionRate: number;
  newUsersToday: number;
  lowStockProducts: number;
}

// Navigation Menu Item
interface MenuItem {
  id: string;
  label: string;
  icon: any;
  roles: AdminRole[];
  badge?: number;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'manager', 'finance'] },
  { id: 'orders', label: 'Siparişler', icon: ShoppingBag, roles: ['super_admin', 'manager', 'finance'] },
  { id: 'products', label: 'Ürünler', icon: Package, roles: ['super_admin', 'manager'] },
  { id: 'users', label: 'Kullanıcılar', icon: Users, roles: ['super_admin'] },
  { id: 'finance', label: 'Finans', icon: DollarSign, roles: ['super_admin', 'finance'] },
  { id: 'messages', label: 'Mesajlar', icon: MessageSquare, roles: ['super_admin', 'manager'], badge: 0 },
  { id: 'coupons', label: 'İndirim Kodları', icon: Tag, roles: ['super_admin'] },
  { id: 'settings', label: 'Site Ayarları', icon: Settings, roles: ['super_admin'] },
];

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, getToken, isTokenValid, isInitialized } = useAuthStore();

  // Admin Role
  const adminRole: AdminRole = (user?.type as AdminRole) || 'manager';
  const isSuperAdmin = adminRole === 'super_admin';
  const isFinance = adminRole === 'finance' || isSuperAdmin;

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data States
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0,
    pendingOrders: 0, todayOrders: 0, commissionRate: 5, newUsersToday: 0, lowStockProducts: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Dialog States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Auto-refresh interval (30 seconds)
  const AUTO_REFRESH_INTERVAL = 30000;

  // Auth Check - wait for initialization
  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || !isTokenValid()) {
      logout();
      navigate('/admin/giris');
      return;
    }

    // Check if user is admin
    const allowedRoles = ['super_admin', 'manager', 'finance', 'admin'];
    if (!allowedRoles.includes(user?.type || '')) {
      navigate('/');
      return;
    }

    setAuthChecked(true);
  }, [isInitialized, isAuthenticated, user, navigate, logout, isTokenValid]);

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    if (!authChecked || !isTokenValid()) return;

    try {
      setRefreshing(true);

      // Fetch stats
      const statsRes = await adminApi.getAdminDashboardStats();
      setStats(prev => ({ ...prev, ...statsRes }));

      // Fetch orders
      const ordersRes = await orderApi.getAll();
      setOrders(ordersRes || []);

      // Fetch products (super_admin and manager only)
      if (isSuperAdmin || adminRole === 'manager') {
        const productsRes = await productApi.getAll();
        setProducts(productsRes || []);
      }

      // Fetch users (super_admin only)
      if (isSuperAdmin) {
        const usersRes = await adminApi.getAllUsersAdmin();
        setUsers(usersRes || []);
      }

      // Fetch messages (super_admin and manager)
      if (isSuperAdmin || adminRole === 'manager') {
        const messagesRes = await adminApi.getMessages();
        setMessages(messagesRes || []);
      }

      // Fetch coupons (super_admin only)
      if (isSuperAdmin) {
        const couponsRes = await adminApi.getCoupons();
        setCoupons(couponsRes || []);
      }

      // Fetch settings
      const settingsRes = await adminApi.getSiteSettings();
      setSettings(settingsRes || {});

    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      if (error.response?.status === 401) {
        toast.error('Oturum süreniz doldu, lütfen tekrar giriş yapın');
        logout();
        navigate('/admin/giris');
      } else {
        toast.error('Veriler yüklenirken hata oluştu');
      }
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [authChecked, isTokenValid, logout, navigate, isSuperAdmin, adminRole]);

  // Initial Load and Auto-refresh
  useEffect(() => {
    if (!authChecked) return;
    fetchDashboardData();

    // Auto-refresh interval
    const interval = setInterval(fetchDashboardData, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchDashboardData, authChecked]);

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/admin/giris');
  };

  // Handle Password Reset
  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword || newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }
    setIsResettingPassword(true);
    try {
      await adminApi.resetUserPassword(selectedUser.id);
      toast.success(`${selectedUser.name} kullanıcısının şifresi başarıyla sıfırlandı (Yeni şifre: 123456)`);
      setShowPasswordResetDialog(false);
      setNewPassword('');
    } catch (error: any) {
      toast.error('Şifre sıfırlanırken hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Filter menu items by role
  const allowedMenuItems = MENU_ITEMS.filter(item => item.roles.includes(adminRole));

  // Dashboard Overview Component
  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('tr-TR')} TL</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingOrders} bekleyen</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kullanıcılar</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+{stats.newUsersToday} bugün</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ürünler</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{stats.lowStockProducts} az stok</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Son Siparişler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">Sipariş #{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.userName || 'Bilinmiyor'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={order.status === 'tamamlandi' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                  <span className="font-medium">{order.totalAmount} TL</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-muted-foreground">Henüz sipariş yok</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Orders Management Component
  const OrdersManagement = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tüm Siparişler ({orders.length})</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Sipariş #{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.userName || 'Bilinmiyor'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={
                  order.status === 'tamamlandi' ? 'default' :
                  order.status === 'beklemede' ? 'secondary' :
                  order.status === 'iptal' ? 'destructive' : 'outline'
                }>
                  {order.status}
                </Badge>
                <span className="font-bold">{order.totalAmount?.toFixed(2)} TL</span>
                {isSuperAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(order); setShowOrderDialog(true); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Henüz sipariş bulunmuyor</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Products Management Component
  const ProductsManagement = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tüm Ürünler ({products.length})</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          {isSuperAdmin && (
            <Button size="sm" onClick={() => { setSelectedProduct(null); setShowProductDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Ürün
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-4">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-12 w-12 rounded object-cover" />
                ) : (
                  <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.producerName}</p>
                  <p className="text-sm text-green-600 font-medium">{product.price} TL / {product.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={product.isActive !== false ? 'default' : 'secondary'}>
                  {product.isActive !== false ? 'Aktif' : 'Pasif'}
                </Badge>
                {isSuperAdmin && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedProduct(product); setShowProductDialog(true); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Henüz ürün bulunmuyor</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Users Management Component
  const UsersManagement = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tüm Kullanıcılar ({users.length})</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  <Badge variant="outline" className="mt-1">{u.type}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={u.isActive !== false ? 'default' : 'secondary'}>
                  {u.isActive !== false ? 'Aktif' : 'Pasif'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(u); setShowUserDialog(true); }}>
                  <UserCog className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setSelectedUser(u); setShowPasswordResetDialog(true); }}
                  title="Şifre Sıfırla"
                >
                  <Lock className="h-4 w-4 text-orange-500" />
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Henüz kullanıcı bulunmuyor</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Finance Component
  const FinanceOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Komisyon Oranı</CardTitle>
            <Percent className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{stats.commissionRate}</div>
            <p className="text-xs text-muted-foreground">Site ayarlarından değiştirilebilir</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('tr-TR')} TL</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Kazanç</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalRevenue * (stats.commissionRate / 100)).toLocaleString('tr-TR')} TL
            </div>
            <p className="text-xs text-muted-foreground">Komisyonlar üzerinden</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sipariş Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Toplam Sipariş</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Tamamlanan</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'tamamlandi').length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Bugün</p>
              <p className="text-2xl font-bold text-blue-600">{stats.todayOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Site Settings Component
  const SiteSettings = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Site Ayarları</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Komisyon Oranı (%)</Label>
            <Input 
              type="number" 
              value={stats.commissionRate} 
              onChange={(e) => setStats({ ...stats, commissionRate: parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Site Adı</Label>
            <Input value={settings.siteName || 'ÇiftçidenKapına'} readOnly />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium">Banka Hesap Bilgileri</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Banka Adı</Label>
              <Input value={settings.bankName || ''} placeholder="Ziraat Bankası" />
            </div>
            <div className="space-y-2">
              <Label>Hesap Sahibi</Label>
              <Input value={settings.accountHolder || ''} placeholder="Şirket Adı" />
            </div>
            <div className="space-y-2">
              <Label>IBAN</Label>
              <Input value={settings.iban || ''} placeholder="TR00 0000..." />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline">İptal</Button>
          <Button onClick={() => toast.success('Ayarlar kaydedildi')}>Kaydet</Button>
        </div>
      </CardContent>
    </Card>
  );

  // Messages Management Component
  const MessagesManagement = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tüm Mesajlar ({messages.length})</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${msg.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
                  <MessageSquare className={`h-5 w-5 ${msg.isRead ? 'text-gray-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className="font-medium">{msg.subject || 'Konu Yok'}</p>
                  <p className="text-sm text-muted-foreground">{msg.senderName || msg.senderEmail}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={msg.isRead ? 'secondary' : 'default'}>
                  {msg.isRead ? 'Okundu' : 'Yeni'}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Henüz mesaj bulunmuyor</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Coupons Management Component
  const CouponsManagement = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>İndirim Kodları ({coupons.length})</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Button size="sm" onClick={() => toast.info('Kupon oluşturma modalı yakında')}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kupon
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${coupon.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Tag className={`h-5 w-5 ${coupon.isActive ? 'text-green-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-medium font-mono bg-gray-100 px-2 py-1 rounded inline-block">{coupon.code}</p>
                  <p className="text-sm text-muted-foreground mt-1">{coupon.description || 'Açıklama yok'}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{coupon.discountType === 'PERCENTAGE' ? '%' + coupon.discountValue : coupon.discountValue + ' TL'}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(coupon.startDate).toLocaleDateString('tr-TR')} - {new Date(coupon.endDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                  {coupon.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Ban className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {coupons.length === 0 && (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Henüz kupon bulunmuyor</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => toast.info('Kupon oluşturma yakında')}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Kuponu Oluştur
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Yönetim paneli yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-bold">Yönetim Paneli</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{getToken() ? 'Oturum Aktif' : 'Oturum Kapalı'}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {allowedMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === item.id 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <Badge variant={activeTab === item.id ? 'secondary' : 'default'} className="text-xs">
                  {item.badge}
                </Badge>
              ) : null}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-sm font-medium text-green-600">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 lg:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <LayoutDashboard className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold">Yönetim Paneli</h1>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <h2 className="text-lg font-semibold">
                {MENU_ITEMS.find(m => m.id === activeTab)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                {refreshing ? 'Senkronizasyon...' : 'Canlı'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={fetchDashboardData} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'orders' && <OrdersManagement />}
          {activeTab === 'products' && <ProductsManagement />}
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'finance' && <FinanceOverview />}
          {activeTab === 'settings' && <SiteSettings />}
          {activeTab === 'messages' && <MessagesManagement />}
          {activeTab === 'coupons' && <CouponsManagement />}
        </div>
      </main>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kullanıcı Detayları</DialogTitle>
            <DialogDescription>{selectedUser?.name} - {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span>
                <p className="font-medium">{selectedUser?.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tip:</span>
                <p className="font-medium">{selectedUser?.type}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Telefon:</span>
                <p className="font-medium">{selectedUser?.phone || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Durum:</span>
                <Badge variant={selectedUser?.isActive !== false ? 'default' : 'secondary'}>
                  {selectedUser?.isActive !== false ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>Kapat</Button>
            <Button 
              variant="destructive" 
              onClick={() => { setShowUserDialog(false); setShowPasswordResetDialog(true); }}
            >
              <Lock className="h-4 w-4 mr-2" />
              Şifre Sıfırla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Şifre Sıfırlama</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} kullanıcısının şifresini sıfırlayın.
              <br />
              <span className="text-sm text-muted-foreground">
                (Varsayılan yeni şifre: 123456)
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Yeni Şifre (Opsiyonel - varsayılan: 123456)</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Yeni şifre girin (boş bırakırsanız 123456 olur)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Backend şifreyi otomatik olarak &quot;123456&quot; yapacaktır.
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPasswordResetDialog(false)}>İptal</Button>
            <Button 
              variant="destructive" 
              onClick={handleResetPassword}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sıfırlanıyor...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Şifreyi Sıfırla
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white">
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="font-bold">Yönetim Paneli</h1>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-1">
              {allowedMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    activeTab === item.id 
                      ? 'bg-green-600 text-white' 
                      : 'text-gray-600'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
