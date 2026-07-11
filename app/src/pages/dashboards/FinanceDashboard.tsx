import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp,
  ArrowDownRight, ArrowUpRight, Wallet, CreditCard,
  LogOut, RefreshCw, FileText, Calculator, Percent,
  CheckCircle, LineChart, Download, Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/authStore';
import { adminApi, orderApi, toast, productApi, userApi } from '@/lib/api';
import type { Order, Product } from '@/types';

interface FinanceStats {
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number;
  pendingPayments: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  avgCommissionRate: number;
  totalOrders: number;
  pendingOrders: number;
}

interface DailyReport {
  reportDate: string;
  totalRevenue: number;
  totalOrders: number;
  newUsers: number;
}

interface ProducerStats {
  id: string;
  name: string;
  orders: number;
  sales: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'overview', label: 'Finansal Özet', icon: LineChart },
  { id: 'revenue', label: 'Gelir Analizi', icon: TrendingUp },
  { id: 'commissions', label: 'Komisyonlar', icon: Percent },
  { id: 'payments', label: 'Ödeme Takibi', icon: CreditCard },
  { id: 'reports', label: 'Raporlar', icon: FileText },
];

// Calculate trend data from daily reports
function calculateTrend(reports: DailyReport[]): { value: number; isPositive: boolean } {
  if (reports.length < 2) return { value: 0, isPositive: true };
  const current = reports[0]?.totalRevenue || 0;
  const previous = reports[1]?.totalRevenue || 1;
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
}

// Calculate category distribution from orders and products
function calculateCategoryDistribution(orders: Order[], products: Product[]) {
  const categoryMap = new Map<string, { amount: number; count: number }>();

  orders.forEach(order => {
    order.items?.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const category = product.category || 'Diğer';
        const existing = categoryMap.get(category) || { amount: 0, count: 0 };
        existing.amount += (item.unitPrice || item.totalPrice || 0) * (item.quantity || 0);
        existing.count += 1;
        categoryMap.set(category, existing);
      }
    });
  });

  const total = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.amount, 0);
  const colors: Record<string, string> = {
    'sebze': 'bg-emerald-500',
    'meyve': 'bg-orange-500',
    'sut-urunleri': 'bg-blue-500',
    'et-urunleri': 'bg-red-500',
    'bakliyat': 'bg-yellow-500',
    'diger': 'bg-gray-400',
  };

  return Array.from(categoryMap.entries())
    .map(([label, data]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, ' '),
      value: total > 0 ? Math.round((data.amount / total) * 100) : 0,
      amount: data.amount,
      color: colors[label] || 'bg-gray-400',
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

export function FinanceDashboard() {
  const navigate = useNavigate();
  const { user, logout, isTokenValid, isInitialized } = useAuthStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0, totalCommission: 0, netRevenue: 0,
    pendingPayments: 0, todayRevenue: 0, weeklyRevenue: 0,
    monthlyRevenue: 0, avgCommissionRate: 5, totalOrders: 0, pendingOrders: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [producers, setProducers] = useState<ProducerStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
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

      // Fetch all required data
      const [statsRes, ordersRes, productsRes, dailyRes, usersRes] = await Promise.all([
        adminApi.getAdminDashboardStats(),
        orderApi.getAll(),
        productApi.getAll(),
        adminApi.getDailyReports(30).catch(() => []),
        userApi.getAll().catch(() => []),
      ]);

      const ordersList = ordersRes || [];
      const productsList = productsRes || [];
      const reportsList = dailyRes || [];
      const usersList = usersRes || [];

      // Calculate real stats
      const revenue = ordersList.reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0);
      const commissionRate = statsRes?.commissionRate || 5;
      const commission = revenue * (commissionRate / 100);

      // Calculate today's revenue
      const today = new Date().toDateString();
      const todayRev = ordersList
        .filter((o: Order) => new Date(o.createdAt).toDateString() === today)
        .reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0);

      // Calculate weekly revenue (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyRev = ordersList
        .filter((o: Order) => new Date(o.createdAt) >= weekAgo)
        .reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0);

      // Calculate monthly revenue (last 30 days)
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const monthlyRev = ordersList
        .filter((o: Order) => new Date(o.createdAt) >= monthAgo)
        .reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0);

      // Calculate pending payments
      const pendingRev = ordersList
        .filter((o: Order) => o.status === 'beklemede' || o.status === 'hazirlaniyor')
        .reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0);

      setStats({
        totalRevenue: revenue,
        totalCommission: commission,
        netRevenue: revenue - commission,
        pendingPayments: pendingRev,
        todayRevenue: todayRev,
        weeklyRevenue: weeklyRev,
        monthlyRevenue: monthlyRev,
        avgCommissionRate: commissionRate,
        totalOrders: ordersList.length,
        pendingOrders: ordersList.filter((o: Order) => o.status === 'beklemede').length,
      });

      setOrders(ordersList);
      setProducts(productsList);
      setDailyReports(reportsList);

      // Calculate producer stats from users and orders
      const producerUsers = usersList.filter((u: any) => u.type === 'producer');
      const producerStats: ProducerStats[] = producerUsers.map((p: any) => {
        // Calculate orders for this producer by checking order items
        const producerOrders = ordersList.filter((o: Order) =>
          o.items?.some((item: any) => {
            const product = productsList.find((prod: Product) => prod.id === (item.product?.id || item.productId));
            return product && (product as any).producerId === p.id;
          })
        );
        const sales = producerOrders.reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0);
        return {
          id: p.id,
          name: p.name,
          orders: producerOrders.length,
          sales: sales,
        };
      }).sort((a: ProducerStats, b: ProducerStats) => b.sales - a.sales).slice(0, 10);

      setProducers(producerStats);

    } catch (error: any) {
      console.error('Dashboard veri hatası:', error);
      if (error.response?.status === 401) {
        toast.error('Oturum süreniz doldu');
        logout();
        navigate('/admin/giris');
      } else {
        toast.error('Veriler yüklenirken hata oluştu');
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

  // Memoized calculations
  const categoryDistribution = useMemo(() =>
    calculateCategoryDistribution(orders, products),
    [orders, products]
  );

  const trend = useMemo(() =>
    calculateTrend(dailyReports),
    [dailyReports]
  );

  // Overview Tab
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Toplam Gelir</p>
                <p className="text-3xl font-bold mt-1">{stats.totalRevenue.toLocaleString('tr-TR')} TL</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-100">
              <TrendingUp className="h-4 w-4 mr-1" />
              {stats.totalOrders} sipariş
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Toplam Komisyon</p>
                <p className="text-3xl font-bold mt-1">{Math.round(stats.totalCommission).toLocaleString('tr-TR')} TL</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <Percent className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-100">
              <span>Ortalama %{stats.avgCommissionRate} komisyon</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Net Kazanç</p>
                <p className="text-3xl font-bold mt-1">{Math.round(stats.netRevenue).toLocaleString('tr-TR')} TL</p>
              </div>
              <div className="p-3 rounded-full bg-white/20">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-100">
              <CheckCircle className="h-4 w-4 mr-1" />
              Platform net kazancı
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time-based Revenue */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bugün</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.todayRevenue.toLocaleString('tr-TR')} TL</p>
            <div className={`flex items-center text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {trend.value}% günlük
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bu Hafta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.weeklyRevenue.toLocaleString('tr-TR')} TL</p>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              Son 7 gün
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bu Ay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString('tr-TR')} TL</p>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              Son 30 gün
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gelir Trendi</CardTitle>
            <CardDescription>Son 30 günlük gelir grafiği</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-end gap-1">
              {dailyReports.length > 0 ? (
                dailyReports.slice(0, 30).reverse().map((report, i) => {
                  const maxRevenue = Math.max(...dailyReports.map(r => r.totalRevenue), 1);
                  const height = (report.totalRevenue / maxRevenue) * 200;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                      <div className="relative w-full">
                        <div
                          className="w-full bg-emerald-200 rounded-t-sm transition-all group-hover:bg-emerald-400"
                          style={{ height: `${Math.max(height, 5)}px` }}
                          title={`${new Date(report.reportDate).toLocaleDateString('tr-TR')}: ${report.totalRevenue.toLocaleString('tr-TR')} TL`}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Henüz veri yok
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
            <CardTitle>Gelir Dağılımı</CardTitle>
            <CardDescription>Kategori bazlı dağılım</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryDistribution.length > 0 ? (
                categoryDistribution.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <div className="text-right">
                        <span className="font-semibold">{Math.round(item.amount).toLocaleString('tr-TR')} TL</span>
                        <span className="text-muted-foreground ml-2">({item.value}%)</span>
                      </div>
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

      {/* Commission Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Üretici Performansı</CardTitle>
          <CardDescription>Üretici bazlı satış ve komisyon dağılımı</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Üretici</TableHead>
                <TableHead>Sipariş Sayısı</TableHead>
                <TableHead>Toplam Satış</TableHead>
                <TableHead>Komisyon (%{stats.avgCommissionRate})</TableHead>
                <TableHead>Net Ödeme</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {producers.length > 0 ? (
                producers.map((producer) => (
                  <TableRow key={producer.id}>
                    <TableCell className="font-medium">{producer.name}</TableCell>
                    <TableCell>{producer.orders}</TableCell>
                    <TableCell>{producer.sales.toLocaleString('tr-TR')} TL</TableCell>
                    <TableCell className="text-orange-600">
                      -{Math.round(producer.sales * stats.avgCommissionRate / 100).toLocaleString('tr-TR')} TL
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {Math.round(producer.sales * (100 - stats.avgCommissionRate) / 100).toLocaleString('tr-TR')} TL
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Henüz üretici verisi yok
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Revenue Tab
  const RevenueTab = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gelir Detayları</CardTitle>
          <CardDescription>Tüm gelir kayıtları</CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Son 7 Gün</SelectItem>
              <SelectItem value="30d">Son 30 Gün</SelectItem>
              <SelectItem value="90d">Son 3 Ay</SelectItem>
              <SelectItem value="1y">Son 1 Yıl</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Sipariş</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Ürün Sayısı</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.slice(0, 50).map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.userName || 'Bilinmiyor'}</TableCell>
                  <TableCell>{order.items?.length || 0}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {order.totalAmount?.toFixed(2)} TL
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Henüz sipariş yok
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  // Commissions Tab
  const CommissionsTab = () => {
    // Calculate monthly commission from daily reports
    const monthlyData = useMemo(() => {
      const monthMap = new Map<string, number>();
      dailyReports.forEach(report => {
        const date = new Date(report.reportDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthMap.get(monthKey) || 0;
        monthMap.set(monthKey, existing + (report.totalRevenue || 0));
      });

      return Array.from(monthMap.entries())
        .map(([month, revenue]) => ({
          month: new Date(month + '-01').toLocaleDateString('tr-TR', { month: 'long' }),
          commission: Math.round(revenue * (stats.avgCommissionRate / 100)),
        }))
        .slice(0, 6)
        .reverse();
    }, [dailyReports, stats.avgCommissionRate]);

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Komisyon Oranı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray={`${stats.avgCommissionRate}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">%{stats.avgCommissionRate}</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">Site genelinde varsayılan komisyon oranı</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aylık Komisyon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {monthlyData.length > 0 ? (
                monthlyData.map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{m.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${Math.min((m.commission / Math.max(...monthlyData.map(d => d.commission))) * 100, 100)}%` }} />
                      </div>
                      <span className="text-sm font-medium">{m.commission.toLocaleString('tr-TR')} TL</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Henüz veri yok
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Komisyon Özeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Toplam Komisyon</p>
                <p className="text-2xl font-bold text-emerald-600">{Math.round(stats.totalCommission).toLocaleString('tr-TR')} TL</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Bekleyen Ödeme</p>
                <p className="text-2xl font-bold text-yellow-600">{Math.round(stats.pendingPayments * (stats.avgCommissionRate / 100)).toLocaleString('tr-TR')} TL</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Tahmini Aylık</p>
                <p className="text-2xl font-bold text-blue-600">
                  {monthlyData.length > 0
                    ? Math.round(monthlyData.reduce((sum, m) => sum + m.commission, 0) / monthlyData.length).toLocaleString('tr-TR')
                    : '0'} TL
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Ort. Komisyon/Sipariş</p>
                <p className="text-2xl font-bold">
                  {stats.totalOrders > 0
                    ? Math.round(stats.totalCommission / stats.totalOrders).toLocaleString('tr-TR')
                    : '0'} TL
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Calculator className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-bold">Finans</h1>
              <p className="text-xs text-muted-foreground">Maliye Paneli</p>
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
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'F'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Maliyeci</p>
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
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <Calculator className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h1 className="font-bold">Finans</h1>
                        <p className="text-xs text-muted-foreground">Maliye Paneli</p>
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
                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{item.label}</span>
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
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'revenue' && <RevenueTab />}
          {activeTab === 'commissions' && <CommissionsTab />}
          {['payments', 'reports'].includes(activeTab) && (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Bu modül yakında aktif olacak</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
