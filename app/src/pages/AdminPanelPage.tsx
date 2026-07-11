import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  Search,
  MoreHorizontal,
  Check,
  X,
  TrendingUp,
  DollarSign,
  Store,
  ChevronRight,
  Shield,
  UserCog,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useAppStore } from '@/store/appStore';
import { userApi } from '@/lib/api';
import type { User } from '@/types';

export function AdminPanelPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const { products, producers } = useAppStore();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedUser, _setSelectedUser] = useState<User | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedProduct, _setSelectedProduct] = useState(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedOrder, _setSelectedOrder] = useState(null);
  
  // Kullanicilari yukle
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await userApi.getAll();
      const users = Array.isArray(response) ? response : (response.data || []);
      setAllUsers(users);
    } catch (error) {
      console.error('Kullanicilar yuklenirken hata:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Admin erisim kontrolu
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/giris', { replace: true });
      return;
    }
    
    if (user?.type !== 'admin') {
      navigate('/', { replace: true });
      return;
    }
  }, [isAuthenticated, user, navigate]);
  
  // Auth kontrolü - erken dönüş (render sırasında null kontrolü)
  if (!isAuthenticated || user?.type !== 'admin') {
    return null;
  }
  
  // Istatistikler
  const stats = {
    totalUsers: allUsers.length,
    totalProducers: allUsers.filter(u => u.type === 'producer').length,
    totalConsumers: allUsers.filter(u => u.type === 'consumer').length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders
      .filter(o => o.status === 'teslim-edildi')
      .reduce((sum, o) => sum + o.totalAmount, 0),
    pendingOrders: orders.filter(o => o.status === 'beklemede').length,
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      'beklemede': { label: 'Beklemede', variant: 'secondary' },
      'onaylandi': { label: 'Onaylandı', variant: 'default' },
      'hazirlaniyor': { label: 'Hazırlanıyor', variant: 'outline' },
      'yolda': { label: 'Kargoda', variant: 'default' },
      'teslim-edildi': { label: 'Teslim Edildi', variant: 'default' },
      'iptal-edildi': { label: 'İptal Edildi', variant: 'destructive' },
    };
    
    const { label, variant } = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={variant}>{label}</Badge>;
  };
  
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.producerName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredOrders = orders.filter(o =>
    String(o.id).toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Admin Card */}
                <div className="rounded-xl border bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                      <Shield className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="font-semibold">{user.name}</h2>
                      <p className="text-sm text-white/80">Yönetici</p>
                      <Badge className="mt-1 bg-white/20 text-white">Admin</Badge>
                    </div>
                  </div>
                </div>
                
                {/* Navigation */}
                <div className="rounded-xl border bg-white p-2">
                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === 'dashboard'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === 'users'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Users className="h-5 w-5" />
                      Kullanıcılar
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs text-white">
                        {stats.totalUsers}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === 'orders'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ShoppingBag className="h-5 w-5" />
                      Siparişler
                      {stats.pendingOrders > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {stats.pendingOrders}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === 'products'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Package className="h-5 w-5" />
                      Ürünler
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs text-white">
                        {stats.totalProducts}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('producers')}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === 'producers'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Store className="h-5 w-5" />
                      Üreticiler
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs text-white">
                        {stats.totalProducers}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === 'settings'
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Settings className="h-5 w-5" />
                      Sistem Ayarları
                    </button>
                  </nav>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Yönetici Dashboard</h2>
                    <Badge className="bg-green-100 text-green-700">Sistem Aktif</Badge>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Toplam Kullanıcı
                        </CardTitle>
                        <Users className="h-4 w-4 text-purple-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <div className="flex gap-2 mt-1 text-xs text-gray-500">
                          <span>{stats.totalConsumers} Müşteri</span>
                          <span>•</span>
                          <span>{stats.totalProducers} Satıcı</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Toplam Sipariş
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-purple-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-orange-600 mt-1">
                          {stats.pendingOrders} bekleyen sipariş
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Toplam Gelir
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} TL</div>
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +15.3% bu ay
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Toplam Ürün
                        </CardTitle>
                        <Package className="h-4 w-4 text-purple-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          {producers.length} üretici tarafından
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Onaylı Üreticiler
                        </CardTitle>
                        <Store className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {producers.filter(p => p.isVerified).length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Toplam {producers.length} üretici
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Sistem Durumu
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">Aktif</div>
                        <p className="text-xs text-gray-500 mt-1">
                          Son kontrol: {new Date().toLocaleTimeString('tr-TR')}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Recent Orders */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Son Siparişler</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                        Tümünü Gör
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sipariş No</TableHead>
                            <TableHead>Müşteri</TableHead>
                            <TableHead>Tutar</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.slice(0, 5).map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell>
                                {allUsers.find(u => u.id === order.userId)?.name || 'Bilinmiyor'}
                              </TableCell>
                              <TableCell>{order.totalAmount.toFixed(2)} TL</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell>
                                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Kullanıcı Yönetimi</h2>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Kullanıcı ara..."
                          className="pl-10 w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kullanıcı</TableHead>
                          <TableHead>E-posta</TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Kayıt Tarihi</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((userItem) => (
                          <TableRow key={userItem.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                  <Users className="h-5 w-5 text-gray-600" />
                                </div>
                                <span className="font-medium">{userItem.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{userItem.email}</TableCell>
                            <TableCell>{userItem.phone}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={userItem.type === 'admin' ? 'destructive' : userItem.type === 'producer' ? 'default' : 'secondary'}
                              >
                                {userItem.type === 'admin' ? 'Admin' : userItem.type === 'producer' ? 'Satıcı' : 'Müşteri'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(userItem.createdAt).toLocaleDateString('tr-TR')}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <UserCog className="mr-2 h-4 w-4" />
                                    Düzenle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Ban className="mr-2 h-4 w-4" />
                                    Engelle
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              )}
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Sipariş Yönetimi</h2>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Sipariş ara..."
                          className="pl-10 w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sipariş No</TableHead>
                          <TableHead>Müşteri</TableHead>
                          <TableHead>Ürünler</TableHead>
                          <TableHead>Tutar</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>Tarih</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              {allUsers.find(u => u.id === order.userId)?.name || 'Bilinmiyor'}
                            </TableCell>
                            <TableCell>{order.items.length} ürün</TableCell>
                            <TableCell>{order.totalAmount.toFixed(2)} TL</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Detay
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              )}
              
              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Ürün Yönetimi</h2>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Ürün ara..."
                          className="pl-10 w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ürün</TableHead>
                          <TableHead>Üretici</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Fiyat</TableHead>
                          <TableHead>Stok</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                                <span className="font-medium">{product.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{product.producerName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.category}</Badge>
                            </TableCell>
                            <TableCell>{product.price} TL / {product.unit}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              {product.stock > 0 ? (
                                <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                              ) : (
                                <Badge variant="secondary">Stokta Yok</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              )}
              
              {/* Producers Tab */}
              {activeTab === 'producers' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Üretici Yönetimi</h2>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {producers.map((producer) => (
                      <Card key={producer.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <img
                              src={producer.image}
                              alt={producer.name}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{producer.name}</h3>
                                {producer.isVerified && (
                                  <Badge className="bg-green-100 text-green-700">Onaylı</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{producer.email}</p>
                              <p className="text-sm text-gray-500">{producer.location.city}</p>
                              <div className="mt-3 flex items-center gap-4 text-sm">
                                <span>Ürün: {producer.products.length}</span>
                                <span>Değerlendirme: {producer.rating}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                İncele
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Sistem Ayarları</h2>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Genel Ayarlar</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Site Bakım Modu</p>
                            <p className="text-sm text-gray-500">Siteyi bakım moduna al</p>
                          </div>
                          <Badge variant="outline">Kapalı</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Yeni Kayıtlar</p>
                            <p className="text-sm text-gray-500">Yeni kullanıcı kayıtlarına izin ver</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Açık</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Satıcı Onayları</p>
                            <p className="text-sm text-gray-500">Otomatik satıcı onayı</p>
                          </div>
                          <Badge variant="outline">Manuel</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Ödeme Ayarları</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Kredi Kartı Ödemeleri</p>
                            <p className="text-sm text-gray-500">3D Secure ile ödeme</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Havale/EFT</p>
                            <p className="text-sm text-gray-500">Banka havalesi ile ödeme</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Kapıda Ödeme</p>
                            <p className="text-sm text-gray-500">Nakit/kart ile kapıda ödeme</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Güvenlik</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">İki Faktörlü Doğrulama</p>
                            <p className="text-sm text-gray-500">Admin hesapları için 2FA zorunluluğu</p>
                          </div>
                          <Button variant="outline" size="sm">Yapılandır</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Oturum Yönetimi</p>
                            <p className="text-sm text-gray-500">Aktif oturumları görüntüle ve yönet</p>
                          </div>
                          <Button variant="outline" size="sm">Görüntüle</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
