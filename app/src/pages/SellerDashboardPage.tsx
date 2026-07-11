import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  DollarSign,
  Star,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ArrowUpRight,
  ChevronRight,
  Store,
  Settings,
  LogOut,
  BarChart3,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useAppStore } from '@/store/appStore';
import { adminApi, productApi, orderApi, toast } from '@/lib/api';
import { useLiveData } from '@/hooks/useLiveData';
import type { ProducerEarnings } from '@/types';

export function SellerDashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, currentRole } = useAuthStore();
  const { orders, fetchOrders, getOrdersByProducer } = useOrderStore();
  const { products, fetchProducts, getProductsByProducer, updateProduct, toggleProductActive } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Ürün düzenleme state'leri
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    description: string;
    price: number;
    stock: number;
    unit: string;
    category: string;
    isOrganic: boolean;
    isActive: boolean;
    images?: string[];
  }>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    unit: 'kg',
    category: 'SEBZE',
    isOrganic: false,
    isActive: true,
    images: [],
  });
  const [producerProductsList, setProducerProductsList] = useState<any[]>([]);
  const [producerOrdersList, setProducerOrdersList] = useState<any[]>([]);
  
  // Kazanç/Finans durumu
  const [earnings, setEarnings] = useState<ProducerEarnings | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  
  // Aylık satış verisi (backend'den gelecek)
  const [monthlySales, setMonthlySales] = useState<{ month: string; sales: number }[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  
  // Canlı veri durumu
  const [liveDataEnabled, setLiveDataEnabled] = useState(true);

  // Veri yükleme fonksiyonu - Store'ları senkronize et
  const refreshData = async () => {
    if (!liveDataEnabled) return;
    try {
      // Store'ları senkronize et
      await Promise.all([
        fetchProducts(),
        fetchOrders(),
        loadEarnings(),
      ]);
    } catch (error) {
      console.error('Veri senkronizasyon hatasi:', error);
    }
  };
  
  // Kazanç verilerini yükle
  const loadEarnings = async () => {
    if (!user?.id) return;
    try {
      setEarningsLoading(true);
      const producerId = user.type === 'producer' ? user.id : '1';
      const earningsData = await adminApi.getProducerEarnings(parseInt(producerId));
      setEarnings(earningsData);
    } catch (error) {
      console.error('Kazanç verisi yüklenirken hata:', error);
    } finally {
      setEarningsLoading(false);
    }
  };

  // Canlı veri yenileme - WebSocket yerine periyodik polling
  useLiveData({
    onRefresh: refreshData,
    interval: 5000, // Her 5 saniyede bir yenile
    refreshOnFocus: true, // Sayfa odaklanınca yenile
  });
  
  // Anlık güncelleme için useEffect
  useEffect(() => {
    if (user) {
      loadProducerData();
    }
  }, [user]);
  
  const loadProducerData = async () => {
    try {
      const producerId = user?.type === 'producer' ? user.id : '1';
      // Backend'den güncel ürünleri çek
      const response = await productApi.getAll();
      if (response.data) {
        // Sadece bu üreticiye ait ürünleri filtrele
        const myProducts = response.data.filter((p: any) => 
          p.producerId?.toString() === producerId?.toString()
        );
        setProducerProductsList(myProducts);
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    }
  };
  
  // Erişim kontrolü - useEffect içinde yönlendirme
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/giris');
      return;
    }
    
    // Admin her zaman satıcı paneline erişebilir
    // Producer veya currentRole producer ise erişim var
    const hasAccessCheck = user.type === 'admin' || user.type === 'producer' || currentRole === 'producer';
    
    if (!hasAccessCheck) {
      navigate('/profil');
      return;
    }
  }, [isAuthenticated, user, currentRole, navigate]);
  
  // Auth kontrolü - erken dönüş (render sırasında null kontrolü)
  if (!isAuthenticated || !user) {
    return null;
  }
  
  // Admin her zaman satıcı paneline erişebilir
  // Producer veya currentRole producer ise erişim var
  const hasAccess = user.type === 'admin' || user.type === 'producer' || currentRole === 'producer';
  if (!hasAccess) {
    return null;
  }
  
  // Demo satıcı için varsayılan ID
  const producerId = user.type === 'producer' ? user.id : '1';
  
  // Store'dan gelen canlı veriler
  const displayProducts = getProductsByProducer(producerId || '1');
  const displayOrders = getOrdersByProducer(producerId || '1');
  
  // İstatistikler - backend'den gelen canlı veri
  const totalSales = displayOrders
    .filter((o) => o.status === 'teslim-edildi')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  
  const totalOrders = displayOrders.length;
  const activeProducts = displayProducts.filter((p) => p.stock > 0 && p.isActive !== false).length;
  const totalReviews = displayProducts.reduce((sum, p) => sum + (p.reviewCount || 0), 0);
  
  // Aylık satış verisi - earnings'den dinamik olarak hesapla
  useEffect(() => {
    if (earnings?.monthlyEarnings) {
      const salesData = earnings.monthlyEarnings.map(m => ({
        month: m.month.split(' ')[0], // "Ocak 2026" -> "Ocak"
        sales: m.netRevenue
      }));
      setMonthlySales(salesData);
    }
  }, [earnings]);
  
  // Ürün düzenleme dialogunu aç
  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      unit: product.unit || 'kg',
      category: product.category || 'SEBZE',
      isOrganic: product.isOrganic || false,
      isActive: product.isActive !== false,
      images: product.images || [],
    });
    setShowEditDialog(true);
  };
  
  // Resim yükleme
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Basit bir base64 yükleme (gerçek uygulamada dosya sunucuya yüklenmeli)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProductForm(prev => ({
        ...prev,
        images: [...(prev.images || []), base64String],
      }));
    };
    reader.readAsDataURL(file);
  };
  
  // Resim silme
  const handleRemoveImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };
  
  // Ürün güncelle - Store kullanarak (optimistic update)
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    const success = await updateProduct(editingProduct.id, { ...productForm, category: productForm.category as any });
    if (success) {
      setShowEditDialog(false);
    }
  };
  
  // Ürünü pasife al (soft delete) - Store kullanarak
  const handleDeactivateProduct = async (productId: string) => {
    if (!confirm('Bu ürünü pasife almak istediğinize emin misiniz?')) return;
    await toggleProductActive(productId, false);
  };
  
  // Ürünü aktife al - Store kullanarak
  const handleActivateProduct = async (productId: string) => {
    await toggleProductActive(productId, true);
  };
  
  // Sipariş detayını aç
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const openOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };
  
  // Siparişi iptal et
  const handleCancelOrder = async (orderId: string | number) => {
    if (!confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      console.log('Satıcı: Sipariş iptal ediliyor:', orderId);
      
      // Eski demo siparişleri (ORD-XXX formatında) sadece local'de iptal edilir
      const isOldFormat = typeof orderId === 'string' && orderId.startsWith('ORD-');
      
      if (isOldFormat) {
        // Eski format - sadece local state güncelle, API çağrısı yapma
        console.log('Eski format sipariş (local only):', orderId);
        toast.success('Sipariş iptal edildi (local)');
        setProducerOrdersList(prev => 
          prev.map(o => o.id === orderId ? { ...o, status: 'IPTAL_EDILDI' as any } : o)
        );
        setShowOrderDialog(false);
        return;
      }
      
      // Yeni format - API'ye gönder
      const numericId = typeof orderId === 'number' ? orderId : parseInt(orderId);
      if (isNaN(numericId)) {
        toast.error('Geçersiz sipariş ID');
        return;
      }
      
      // Backend enum değeri: IPTAL_EDILDI
      await orderApi.updateStatus(numericId, 'IPTAL_EDILDI');
      toast.success('Sipariş iptal edildi');
      
      // Anlık güncelleme - yerel state'i güncelle
      setProducerOrdersList(prev => 
        prev.map(o => o.id === orderId ? { ...o, status: 'IPTAL_EDILDI' as any } : o)
      );
      
      setShowOrderDialog(false);
    } catch (error: any) {
      console.error('Satıcı: Sipariş iptal hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Bilinmeyen hata';
      toast.error(`Sipariş iptal hatası: ${errorMessage}`);
    }
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
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Store Card */}
                <div className="rounded-xl border bg-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <Store className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{user.name}</h2>
                      <p className="text-sm text-gray-500">Satıcı Hesabı</p>
                      <Badge className="mt-1 bg-green-100 text-green-700">Onaylı Satıcı</Badge>
                    </div>
                  </div>
                  
                  {/* Canlı Veri Durumu */}
                  <button
                    onClick={() => setLiveDataEnabled(!liveDataEnabled)}
                    className={`mt-4 flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                      liveDataEnabled 
                        ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                    }`}
                    title={liveDataEnabled ? 'Canlı veri aktif (5 sn)' : 'Canlı veri pasif'}
                  >
                    <RefreshCw className={`h-3 w-3 ${liveDataEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                    <span className="font-medium">{liveDataEnabled ? 'Canlı Veri' : 'Manuel Mod'}</span>
                    {liveDataEnabled && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    )}
                  </button>
                </div>
                
                {/* Navigation */}
                <div className="rounded-xl border bg-white p-2">
                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === 'dashboard'
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === 'products'
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Package className="h-5 w-5" />
                      Ürünlerim
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                        {displayProducts.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === 'orders'
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ShoppingBag className="h-5 w-5" />
                      Siparişler
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                        {displayOrders.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === 'analytics'
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart3 className="h-5 w-5" />
                      Analizler
                    </button>
                    <button
                      onClick={() => setActiveTab('earnings')}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        activeTab === 'earnings'
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Wallet className="h-5 w-5" />
                      Kazançlarım
                      {earnings && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                          %
                        </span>
                      )}
                    </button>
                  </nav>
                </div>
                
                <Link to="/profil">
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Hesap Ayarları
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                
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
                    <h2 className="text-2xl font-bold">Dashboard</h2>
                    <Link to="/urun-ekle">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Ürün Ekle
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Toplam Satış
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalSales.toFixed(2)} TL</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          +12.5% bu ay
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Toplam Sipariş
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          +8.2% bu ay
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Aktif Ürünler
                        </CardTitle>
                        <Package className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{activeProducts}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          Toplam {displayProducts.length} ürün
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          Değerlendirmeler
                        </CardTitle>
                        <Star className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalReviews}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          Toplam yorum
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
                      {displayOrders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between py-3 border-b last:border-0"
                        >
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{order.totalAmount.toFixed(2)} TL</p>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      ))}
                      {displayOrders.length === 0 && (
                        <p className="text-center text-gray-500 py-4">Henüz sipariş bulunmamaktadır.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Ürünlerim</h2>
                    <Link to="/urun-ekle">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Ürün Ekle
                      </Button>
                    </Link>
                  </div>
                  
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ürün</TableHead>
                          <TableHead>Fiyat</TableHead>
                          <TableHead>Stok</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>Değerlendirme</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayProducts.map((product) => (
                          <TableRow key={product.id} className={product.isActive === false ? 'opacity-50 bg-gray-50' : ''}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-gray-500">{product.category}</p>
                                  {product.isActive === false && (
                                    <Badge variant="destructive" className="text-xs mt-1">Pasif</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {product.price} TL / {product.unit}
                            </TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              {product.isActive === false ? (
                                <Badge variant="destructive">Pasif</Badge>
                              ) : product.stock > 0 ? (
                                <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                              ) : (
                                <Badge variant="secondary">Stokta Yok</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{product.rating}</span>
                                <span className="text-gray-500">({product.reviewCount})</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Link to={`/urun/${product.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openEditDialog(product)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                {product.isActive !== false ? (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleDeactivateProduct(product.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => handleActivateProduct(product.id)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {displayProducts.length === 0 && (
                      <div className="text-center py-8">
                        <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <p className="text-gray-600">Henüz ürününüz bulunmamaktadır.</p>
                        <Link to="/urun-ekle">
                          <Button className="mt-4 bg-green-600 hover:bg-green-700">
                            İlk Ürününü Ekle
                          </Button>
                        </Link>
                      </div>
                    )}
                  </Card>
                </div>
              )}
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Siparişler</h2>
                  
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sipariş No</TableHead>
                          <TableHead>Tarih</TableHead>
                          <TableHead>Ürünler</TableHead>
                          <TableHead>Tutar</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayOrders.map((order) => (
                          <TableRow key={order.id} className={order.status === 'iptal-edildi' ? 'opacity-50 bg-gray-50' : ''}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                            </TableCell>
                            <TableCell>
                              {order.items.length} ürün
                            </TableCell>
                            <TableCell>{order.totalAmount.toFixed(2)} TL</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openOrderDetail(order)}
                                >
                                  Detaylar
                                </Button>
                                {(order.status === 'beklemede' || order.status === 'onaylandi') && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleCancelOrder(order.id)}
                                  >
                                    İptal
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {displayOrders.length === 0 && (
                      <div className="text-center py-8">
                        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <p className="text-gray-600">Henüz sipariş bulunmamaktadır.</p>
                      </div>
                    )}
                  </Card>
                </div>
              )}
              
              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Satış Analizleri</h2>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Aylık Satışlar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {monthlySales.length > 0 ? (
                          <div className="space-y-4">
                            {monthlySales.map((month) => (
                              <div key={month.month} className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{month.month}</span>
                                <div className="flex items-center gap-4">
                                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-600"
                                      style={{ width: `${Math.min((month.sales / Math.max(...monthlySales.map(m => m.sales), 1)) * 100, 100)}%` }}
                                    />
                                  </div>
                                  <span className="font-medium">{month.sales.toLocaleString('tr-TR')} TL</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin" />
                            <p className="text-sm">Satış verileri yükleniyor...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Popüler Ürünler</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {displayProducts
                            .sort((a, b) => b.reviewCount - a.reviewCount)
                            .slice(0, 5)
                            .map((product, index) => (
                              <div key={product.id} className="flex items-center gap-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                                  {index + 1}
                                </span>
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{product.name}</p>
                                  <p className="text-xs text-gray-500">{product.reviewCount} değerlendirme</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{product.rating}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              {/* Earnings Tab */}
              {activeTab === 'earnings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Kazançlarım</h2>
                    {earnings && (
                      <Badge variant="outline" className="text-sm">
                        Komisyon Oranı: %{earnings.commissionRate}
                      </Badge>
                    )}
                  </div>
                  
                  {earningsLoading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-400" />
                      <p className="text-gray-600">Kazanç verileri yükleniyor...</p>
                    </div>
                  ) : earnings ? (
                    <>
                      {/* Özet Kartları */}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                              Brüt Kazanç
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {earnings.grossRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Tüm tamamlanan siparişler
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                              Komisyon Kesintisi
                            </CardTitle>
                            <Percent className="h-4 w-4 text-red-600" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                              -{earnings.totalCommission.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              %{earnings.commissionRate} komisyon oranı
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                              Net Kazanç
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-green-600" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              {earnings.netRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                              <TrendingUp className="inline h-3 w-3 mr-1" />
                              Komisyon sonrası
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                              Bekleyen Ödeme
                            </CardTitle>
                            <TrendingDown className="h-4 w-4 text-orange-600" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                              {earnings.pendingPayment.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Ödeme bekleyen tutar
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Sipariş İstatistikleri */}
                      <div className="grid gap-4 sm:grid-cols-4">
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-sm text-blue-600 mb-1">Toplam Sipariş</p>
                              <p className="text-3xl font-bold text-blue-700">{earnings.totalOrders}</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-sm text-green-600 mb-1">Tamamlanan</p>
                              <p className="text-3xl font-bold text-green-700">{earnings.completedOrders}</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-yellow-50 border-yellow-200">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-sm text-yellow-600 mb-1">Bekleyen</p>
                              <p className="text-3xl font-bold text-yellow-700">{earnings.pendingOrders}</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-red-50 border-red-200">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-sm text-red-600 mb-1">İptal Edilen</p>
                              <p className="text-3xl font-bold text-red-700">{earnings.cancelledOrders}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Aylık Kazanç Grafiği */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Aylık Kazanç Özeti (Son 6 Ay)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {earnings.monthlyEarnings.map((month) => (
                              <div key={month.month} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{month.month}</span>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500">{month.orderCount} sipariş</span>
                                    <span className="font-medium text-green-600">
                                      {month.netRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-600"
                                    style={{ width: `${Math.min((month.netRevenue / (earnings.netRevenue || 1)) * 100, 100)}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Brüt: {month.grossRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                                  <span>Komisyon: {month.commission.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Top Ürünler */}
                      {earnings.topProducts.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>En Çok Kazandıran Ürünler (Top 5)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {earnings.topProducts.map((product, index) => (
                                <div key={product.productId} className="flex items-center gap-4">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                                    {index + 1}
                                  </span>
                                  <img
                                    src={product.productImage || '/placeholder-product.png'}
                                    alt={product.productName}
                                    className="h-12 w-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{product.productName}</p>
                                    <p className="text-xs text-gray-500">{product.quantitySold} adet satıldı</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-green-600">
                                      {product.netRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Brüt: {product.grossRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Wallet className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                      <p className="text-gray-600">Henüz kazanç verisi bulunmamaktadır.</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Siparişleriniz tamamlandıkça kazanç bilgileriniz burada görünecektir.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Ürün Düzenleme Dialogu */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ürün Düzenle</DialogTitle>
            <DialogDescription>
              Ürün bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Ürün Adı</label>
              <Input 
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                placeholder="Ürün adı"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Açıklama</label>
              <Input 
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                placeholder="Ürün açıklaması"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Fiyat (TL)</label>
                <Input 
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                  placeholder="Fiyat"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stok</label>
                <Input 
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})}
                  placeholder="Stok miktarı"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Birim</label>
                <Input 
                  value={productForm.unit}
                  onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                  placeholder="kg, adet, vs."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kategori</label>
                <Input 
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  placeholder="Kategori"
                />
              </div>
            </div>
            
            {/* Ürün Görselleri */}
            <div>
              <label className="text-sm font-medium mb-2 block">Ürün Görselleri</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {productForm.images?.map((img, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={img} 
                      alt={`Ürün ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Resim yüklemek için dosya seçin (JPEG, PNG)
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="isOrganic"
                  checked={productForm.isOrganic}
                  onChange={(e) => setProductForm({...productForm, isOrganic: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isOrganic" className="text-sm">Organik Ürün</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="isActive"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm({...productForm, isActive: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm">Aktif</label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleUpdateProduct} 
              className="bg-green-600 hover:bg-green-700"
            >
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Sipariş Detay Dialogu */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Sipariş Detayı #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Sipariş bilgilerini görüntüleyin.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* Durum */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sipariş Durumu:</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              
              {/* Müşteri Bilgileri */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="font-medium mb-2">Müşteri Bilgileri</h4>
                <p className="text-sm">{selectedOrder.userName || 'Müşteri'}</p>
                <p className="text-sm text-gray-500">Sipariş No: #{selectedOrder.id}</p>
              </div>
              
              {/* Sipariş Ürünleri */}
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Ürünler</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product?.name} x {item.quantity}</span>
                      <span>{(item.quantity * item.price).toFixed(2)} TL</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Toplam</span>
                    <span>{selectedOrder.totalAmount?.toFixed(2)} TL</span>
                  </div>
                </div>
              </div>
              
              {/* Ödeme Bilgisi */}
              <div className="flex items-center justify-between text-sm">
                <span>Ödeme Yöntemi:</span>
                <span className="font-medium">
                  {selectedOrder.paymentMethod === 'card' && 'Kredi Kartı'}
                  {selectedOrder.paymentMethod === 'transfer' && 'Havale/EFT'}
                  {selectedOrder.paymentMethod === 'cod' && 'Kapıda Ödeme'}
                </span>
              </div>
              
              {/* İptal Butonu */}
              {(selectedOrder.status === 'beklemede' || selectedOrder.status === 'onaylandi') && (
                <div className="pt-4">
                  <Button 
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                  >
                    Siparişi İptal Et
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
