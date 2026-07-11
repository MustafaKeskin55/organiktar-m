import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, DollarSign, 
  Settings, LogOut, Search, TrendingUp,
  Eye, CheckCircle, XCircle, Wallet, Landmark,
  Percent, ArrowRight, Download, Calendar,
  MapPin, Check, RefreshCw, Trash2, Mail, Sparkles, Send, CheckCircle2,
  MessageSquare, Ticket, Tag, Copy, Edit2, Plus, Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useOrderStore } from '@/store/orderStore';
import { userApi, adminApi, toast } from '@/lib/api';
import { useLiveData } from '@/hooks/useLiveData';
import { isSuperAdmin, isManager, isFinance, isAdmin, getRoleLabel, canWrite } from '@/lib/roles';
import type { Product, Order } from '@/types';

type MenuItem = 'dashboard' | 'orders' | 'products' | 'users' | 'finance' | 'settings' | 'messages' | 'coupons';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isInitialized, isAuthenticated } = useAuthStore();
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Store integration
  const { 
    products, 
    fetchProducts,
    refreshProducts,
    updateProduct: updateProductInStore,
    createProduct: createProductInStore,
    deleteProduct: deleteProductInStore,
    toggleProductActive: toggleProductActiveInStore,
    isLoading: productsLoading 
  } = useAppStore();
  
  const { 
    orders, 
    fetchOrders,
    refreshOrders,
    updateOrderStatus: updateOrderStatusInStore, 
    cancelOrder: cancelOrderInStore,
    deleteOrder: deleteOrderInStore,
    isLoading: ordersLoading 
  } = useOrderStore();
  
  // Local state
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    todayOrders: 0,
  });

  // Dialogs
  const [showSettings, setShowSettings] = useState(false);
  const [commissionRate, setCommissionRate] = useState(5);
  const [shippingFee, setShippingFee] = useState(29.99);
  const [bankInfo, setBankInfo] = useState({ bankName: '', accountHolder: '', iban: '' });
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [, setSiteSettingsLoading] = useState(false);
  
  // Product Edit Dialog
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    unit: 'kg',
    category: 'SEBZE',
    isOrganic: false,
    images: [] as string[],
    producerId: '',
  });
  
  // Order Detail Dialog
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // User Management Dialogs (Super Admin)
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: '', message: '', template: 'CUSTOM' });
  const [resetPasswordResult, setResetPasswordResult] = useState<{ tempPassword: string } | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  // Email Templates - Statik liste (backend'den gelen isimlerle eşleşir)
  const [emailTemplates, setEmailTemplates] = useState<Array<{name: string, displayName: string}>>([
    { name: 'WELCOME', displayName: 'Hoş Geldiniz' },
    { name: 'PASSWORD_RESET', displayName: 'Şifre Sıfırlama' },
    { name: 'PASSWORD_CHANGED', displayName: 'Şifre Değiştirildi' },
    { name: 'ORDER_CONFIRMATION', displayName: 'Sipariş Onayı' },
    { name: 'ORDER_STATUS_UPDATE', displayName: 'Sipariş Durumu' },
    { name: 'PROMOTION', displayName: 'Kampanya/İndirim' },
    { name: 'BIRTHDAY', displayName: 'Doğum Günü' },
    { name: 'HOLIDAY', displayName: 'Özel Gün' },
    { name: 'CUSTOM', displayName: 'Özel Mesaj' },
  ]);
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({});
  
  // Messages State
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [showMessageReplyDialog, setShowMessageReplyDialog] = useState(false);
  const [replyForm, setReplyForm] = useState({ content: '' });
  
  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: '',
    usageLimit: '',
    perUserLimit: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  
  // Canlı veri durumu
  const [liveDataEnabled, setLiveDataEnabled] = useState(true);

  // Auth kontrolü - kullanıcı yüklenmeden yönlendirme yapma
  useEffect(() => {
    // Auth store henüz initialize olmadıysa bekle
    if (!isInitialized) return;

    // Kullanıcı null ise (giriş yapılmamış), login sayfasına yönlendir
    if (!user) {
      navigate('/admin/giris');
      return;
    }

    // Kullanıcı admin değilse hata göster ve ana sayfaya yönlendir
    if (!isAdmin(user.type)) {
      toast.error('Bu sayfa sadece yöneticiler içindir!');
      navigate('/');
      return;
    }

    // Auth kontrolü tamamlandı
    setAuthChecked(true);
    loadData();
  }, [user, isInitialized, navigate]);

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Store'ları senkronize et - cache bypass (canlı veri)
      if (forceRefresh) {
        await Promise.all([
          refreshProducts(),
          refreshOrders(),
        ]);
      } else {
        await Promise.all([
          fetchProducts(),
          fetchOrders(),
        ]);
      }
      
      // Site settings çek (komisyon, kargo ücreti vb.)
      try {
        const settings = await adminApi.getSiteSettings();
        if (settings) {
          setCommissionRate(settings.commissionRate || 5);
          setShippingFee(settings.shippingFee || 29.99);
          setBankInfo({
            bankName: settings.bankName || '',
            accountHolder: settings.accountHolder || '',
            iban: settings.iban || '',
          });
        }
      } catch (error) {
        console.error('Site ayarlari yuklenirken hata:', error);
      }
      
      // Admin kullanıcı verilerini çek (sadece super admin)
      if (isSuperAdmin(user?.type)) {
        try {
          console.log('Super admin: Kullanicilar cekiliyor...');
          const usersData = await adminApi.getAllUsersAdmin();
          console.log('Kullanici verisi:', usersData);
          const userList = Array.isArray(usersData) ? usersData : (usersData.data || []);
          setUsers(userList);
          console.log('Kullanicilar yuklendi:', userList.length);
        } catch (error: any) {
          console.error('Kullanicilar yuklenirken hata:', error);
          toast.error('Kullanıcılar yüklenemedi: ' + (error.response?.data?.message || error.message));
        }
        
        // Mesajları çek
        try {
          const messagesData = await adminApi.getMessages();
          setMessages(messagesData || []);
          const unreadCount = await adminApi.getUnreadMessageCount();
          setUnreadMessageCount(unreadCount?.count || 0);
        } catch (error) {
          console.error('Mesajlar yuklenirken hata:', error);
        }
        
        // Kuponları çek
        try {
          const couponsData = await adminApi.getCoupons();
          setCoupons(couponsData || []);
        } catch (error) {
          console.error('Kuponlar yuklenirken hata:', error);
        }
      } else {
        // Normal admin için basic kullanıcı listesi
        try {
          console.log('Normal admin: Kullanicilar cekiliyor...');
          const data = await userApi.getAll();
          console.log('Kullanici verisi:', data);
          const userList = Array.isArray(data) ? data : (data.data || []);
          setUsers(userList);
          console.log('Kullanicilar yuklendi:', userList.length);
        } catch (error: any) {
          console.error('Kullanicilar yuklenirken hata:', error);
          toast.error('Kullanıcılar yüklenemedi: ' + (error.response?.data?.message || error.message));
        }
      }
      
    } catch (error) {
      toast.error('Veri yuklenirken hata olustu');
      console.error('Veri yukleme hatasi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Istatistikleri store'dan otomatik hesapla
  useEffect(() => {
    const totalRev = orders.reduce((sum, o) => 
      o.status !== 'iptal-edildi' ? sum + (o.totalAmount || 0) : sum, 0);
    const today = new Date().toDateString();
    
    setStats({
      totalRevenue: totalRev,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalProducts: products.length,
      pendingOrders: orders.filter(o => o.status === 'beklemede').length,
      todayOrders: orders.filter(o => new Date(o.createdAt).toDateString() === today).length,
    });
  }, [orders, products, users]);

  // Periyodik yenileme - canlı veri (cache bypass)
  useLiveData({
    onRefresh: () => {
      if (liveDataEnabled) {
        loadData(true); // forceRefresh = true
      }
    },
    interval: 5000,
    refreshOnFocus: true,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // ========== MESAJ FONKSİYONLARI ==========
  
  const handleMarkMessageAsRead = async (messageId: number) => {
    try {
      await adminApi.markMessageAsRead(messageId);
      toast.success('Mesaj okundu olarak işaretlendi');
      loadData(true);
    } catch (error: any) {
      toast.error('Hata: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleReplyToMessage = async () => {
    if (!selectedMessage || !replyForm.content.trim()) return;
    
    try {
      await adminApi.replyToMessage(selectedMessage.id, replyForm.content);
      toast.success('Yanıt gönderildi');
      setShowMessageReplyDialog(false);
      setReplyForm({ content: '' });
      setSelectedMessage(null);
      loadData(true);
    } catch (error: any) {
      toast.error('Hata: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // ========== KUPON FONKSİYONLARI ==========
  
  const handleCreateCoupon = async () => {
    try {
      if (!couponForm.code.trim()) {
        toast.error('Kod alanı zorunlu');
        return;
      }
      
      const data = {
        ...couponForm,
        discountValue: Number(couponForm.discountValue),
        minOrderAmount: Number(couponForm.minOrderAmount),
        maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : null,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null,
        perUserLimit: Number(couponForm.perUserLimit),
        startDate: new Date(couponForm.startDate).toISOString(),
        endDate: new Date(couponForm.endDate).toISOString(),
      };
      
      await adminApi.createCoupon(data);
      toast.success('İndirim kodu oluşturuldu');
      setShowCouponDialog(false);
      setCouponForm({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscountAmount: '',
        usageLimit: '',
        perUserLimit: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      loadData(true);
    } catch (error: any) {
      toast.error('Hata: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleDeactivateCoupon = async (couponId: number) => {
    if (!confirm('Bu kuponu pasif yapmak istediğinize emin misiniz?')) return;
    
    try {
      await adminApi.deactivateCoupon(couponId);
      toast.success('Kupon pasife alındı');
      loadData(true);
    } catch (error: any) {
      toast.error('Hata: ' + (error.response?.data?.message || error.message));
    }
  };

  // Ürün düzenleme dialogunu aç
  const openEditProductDialog = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      unit: product.unit || 'kg',
      category: product.category || 'SEBZE',
      isOrganic: product.isOrganic || false,
      images: (product.images as string[]) || [],
      producerId: String(product.producerId || ''),
    });
    setShowProductDialog(true);
  };
  
  // Resim yükleme
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
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

  // Ürünü güncelle - Store kullanarak (optimistic update)
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    const productData = {
      ...productForm,
      category: productForm.category as any,
    };
    
    const success = await updateProductInStore(editingProduct.id, productData);
    if (success) {
      setShowProductDialog(false);
      setEditingProduct(null);
    }
  };

  // Yeni ürün ekle - Store kullanarak
  const handleCreateProduct = async () => {
    if (!productForm.name || productForm.price <= 0) {
      toast.error('Ürün adı ve fiyat zorunludur');
      return;
    }
    
    const productData = {
      ...productForm,
      category: productForm.category as any,
      isActive: true,
    };
    
    const success = await createProductInStore(productData);
    if (success) {
      setShowProductDialog(false);
      setEditingProduct(null);
      // Form temizle
      setProductForm({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        unit: 'kg',
        category: 'SEBZE',
        isOrganic: false,
        images: [],
        producerId: '',
      });
    }
  };

  // Ürünü tamamen sil - Store kullanarak
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Bu ürünü KALICI OLARAK silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return;
    await deleteProductInStore(productId.toString());
  };

  // Ürünü pasife al (soft delete) - Store kullanarak
  const handleDeactivateProduct = async (productId: number) => {
    if (!confirm('Bu ürünü pasife almak istediğinize emin misiniz?')) return;
    await toggleProductActiveInStore(productId.toString(), false);
  };

  // Ürünü aktife al - Store kullanarak
  const handleActivateProduct = async (productId: number) => {
    await toggleProductActiveInStore(productId.toString(), true);
  };

  // Sipariş detayını aç
  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };
  
  // Sipariş durumunu güncelle - Store kullanarak (optimistic update)
  const handleUpdateOrderStatus = async (orderId: string | number, status: string) => {
    if (!canWrite(user?.type)) {
      toast.error('Bu işlem için yazma yetkisi gereklidir');
      return;
    }
    await updateOrderStatusInStore(orderId, status as Order['status']);
  };
  
  // Siparişi iptal et - Store kullanarak
  const handleCancelOrder = async (orderId: string | number) => {
    if (!canWrite(user?.type)) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }
    
    if (!confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) {
      return;
    }
    
    const success = await cancelOrderInStore(orderId);
    if (success) {
      setShowOrderDialog(false);
    }
  };
  
  // Siparişi kalıcı sil - Store kullanarak (sadece super admin)
  const handleDeleteOrder = async (orderId: string | number) => {
    if (!isSuperAdmin(user?.type)) {
      toast.error('Bu işlem için super admin yetkisi gereklidir');
      return;
    }
    
    if (!confirm('⚠️ BU İŞLEM GERİ ALINAMAZ!\n\nBu siparişi kalıcı olarak silmek istediğinize emin misiniz?')) {
      return;
    }
    
    const success = await deleteOrderInStore(orderId);
    if (success) {
      setShowOrderDialog(false);
    }
  };

  // ==================== USER MANAGEMENT (SUPER ADMIN) ====================
  
  // Kullanıcıyı pasife al/aktif et
  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    if (!isSuperAdmin(user?.type)) {
      toast.error('Bu işlem için super admin yetkisi gereklidir');
      return;
    }
    
    const action = currentStatus ? 'pasife almak' : 'aktif etmek';
    if (!confirm(`Bu kullanıcıyı ${action} istediğinize emin misiniz?`)) {
      return;
    }
    
    try {
      await adminApi.toggleUserStatus(userId, !currentStatus);
      toast.success(`Kullanıcı ${currentStatus ? 'pasife alındı' : 'aktif edildi'}`);
      
      // Kullanıcı listesini güncelle
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isActive: !currentStatus } : u
      ));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'İşlem başarısız');
    }
  };
  
  // Şifre sıfırla
  const handleResetPassword = async () => {
    if (!selectedUser || !isSuperAdmin(user?.type)) return;
    
    try {
      const result = await adminApi.resetUserPassword(selectedUser.id);
      setResetPasswordResult(result);
      toast.success('Şifre başarıyla sıfırlandı');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Şifre sıfırlanamadı');
    }
  };
  
  // Rol güncelle
  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    if (!isSuperAdmin(user?.type)) {
      toast.error('Bu işlem için super admin yetkisi gereklidir');
      return;
    }
    
    if (!confirm(`Kullanıcı rolünü "${newRole}" olarak değiştirmek istediğinize emin misiniz?`)) {
      return;
    }
    
    try {
      await adminApi.updateUserRole(userId, newRole);
      toast.success('Rol başarıyla güncellendi');
      
      // Kullanıcı listesini güncelle
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, type: newRole } : u
      ));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Rol güncellenemedi');
    }
  };
  
  // Kullanıcıyı kalıcı sil
  const handlePermanentlyDeleteUser = async (userId: number) => {
    if (!isSuperAdmin(user?.type)) {
      toast.error('Bu işlem için super admin yetkisi gereklidir');
      return;
    }
    
    if (!confirm('⚠️ BU İŞLEM GERİ ALINAMAZ!\n\nBu kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await adminApi.permanentlyDeleteUser(userId);
      toast.success('Kullanıcı kalıcı olarak silindi');
      
      // Kullanıcı listesinden kaldır
      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowUserDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kullanıcı silinemedi');
    }
  };
  
  // E-posta gönder
  // Email şablonları statik tanımlı - API'den doğrulama yapılabilir
  const loadEmailTemplates = async () => {
    try {
      const templates = await adminApi.getEmailTemplates();
      // API'den gelen şablon isimleriyle statik listeyi senkronize et
      if (templates && Array.isArray(templates) && templates.length > 0) {
        console.log('Email templates API\'den yüklendi:', templates);
      }
    } catch (error) {
      console.log('Email templates API\'den yüklenemedi, statik liste kullanılıyor');
    }
  };

  // Şablon değiştiğinde formu güncelle
  const handleTemplateChange = (templateName: string) => {
    const template = emailTemplates.find(t => t.name === templateName);
    if (!template) return;
    
    // Şablon bazlı otomatik konu ve içerik ayarla
    const templateDefaults: Record<string, { subject: string; message: string; params: string[] }> = {
      'WELCOME': {
        subject: 'Hoş Geldiniz - ÇiftçidenKapına',
        message: 'Aramıza katıldığınız için teşekkür ederiz! ÇiftçidenKapına ailesine hoş geldiniz.',
        params: []
      },
      'PASSWORD_RESET': {
        subject: 'Şifreniz Sıfırlandı',
        message: 'Geçici şifreniz oluşturuldu. İlk girişinizde yeni şifre belirlemelisiniz.',
        params: ['tempPassword']
      },
      'PASSWORD_CHANGED': {
        subject: 'Şifreniz Değiştirildi',
        message: 'Hesap şifreniz başarıyla değiştirildi.',
        params: []
      },
      'ORDER_CONFIRMATION': {
        subject: 'Siparişiniz Alındı',
        message: 'Siparişiniz başarıyla alındı ve en kısa sürede hazırlanacak.',
        params: ['orderNumber', 'totalAmount']
      },
      'ORDER_STATUS_UPDATE': {
        subject: 'Sipariş Durumu Güncellemesi',
        message: 'Siparişinizin durumu güncellendi.',
        params: ['orderNumber', 'newStatus']
      },
      'PROMOTION': {
        subject: '🎉 Özel İndirim Fırsatı!',
        message: 'Size özel hazırladığımız indirim kampanyasını kaçırmayın!',
        params: ['discountCode', 'discountPercentage', 'validUntil']
      },
      'BIRTHDAY': {
        subject: '🎂 Doğum Gününüz Kutlu Olsun!',
        message: 'Doğum gününüzde size %20 indirim hediye!',
        params: []
      },
      'HOLIDAY': {
        subject: '🎊 Özel Gün İndirimi',
        message: 'Özel gün fırsatlarını kaçırmayın!',
        params: ['holidayName', 'specialOffer']
      },
      'CUSTOM': {
        subject: '',
        message: '',
        params: []
      }
    };
    
    const defaults = templateDefaults[templateName] || templateDefaults['CUSTOM'];
    setEmailForm({
      subject: defaults.subject,
      message: defaults.message,
      template: templateName
    });
    
    // Parametreleri sıfırla
    const newParams: Record<string, string> = {};
    defaults.params.forEach(p => newParams[p] = '');
    setTemplateParams(newParams);
  };

  const handleSendEmail = async () => {
    if (!selectedUser || !isSuperAdmin(user?.type)) return;
    
    if (!emailForm.subject.trim()) {
      toast.error('Konu alanı zorunludur');
      return;
    }
    
    if (emailForm.template === 'CUSTOM' && !emailForm.message.trim()) {
      toast.error('Mesaj alanı zorunludur');
      return;
    }
    
    try {
      // Eğer şablon seçildiyse şablon email gönder
      if (emailForm.template !== 'CUSTOM') {
        await adminApi.sendTemplateEmail(
          selectedUser.id, 
          emailForm.template, 
          emailForm.subject,
          templateParams
        );
      } else {
        // Özel mesaj gönder
        await adminApi.sendEmailToUser(selectedUser.id, emailForm.subject, emailForm.message);
      }
      
      toast.success('✅ E-posta başarıyla gönderildi!');
      setShowEmailDialog(false);
      setEmailForm({ subject: '', message: '', template: 'CUSTOM' });
      setTemplateParams({});
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'E-posta gönderilemedi');
    }
  };
  
  // Kullanıcı ara
  const handleSearchUsers = async () => {
    if (!userSearchQuery.trim()) {
      // Boşsa tüm kullanıcıları getir
      try {
        const data = await adminApi.getAllUsersAdmin();
        setUsers(data || []);
      } catch (error) {
        toast.error('Kullanıcılar yüklenemedi');
      }
      return;
    }
    
    try {
      const data = await adminApi.searchUsers(userSearchQuery);
      setUsers(data || []);
    } catch (error) {
      toast.error('Arama yapılamadı');
    }
  };
  
  // Kullanıcı detayını aç
  const openUserDetail = (userData: any) => {
    setSelectedUser(userData);
    setShowUserDialog(true);
    setResetPasswordResult(null);
  };

  const saveSettings = async () => {
    try {
      setSiteSettingsLoading(true);
      
      // Backend'e ayarları kaydet
      await adminApi.updateSiteSettings({
        commissionRate: commissionRate,
        shippingFee: shippingFee,
      });
      
      toast.success('Ayarlar başarıyla kaydedildi');
      setShowSettings(false);
      
      // Verileri yenile - tüm sayfalarda güncel değerler görünsün
      await loadData(true);
    } catch (error: any) {
      console.error('Ayarlar kaydedilirken hata:', error);
      toast.error('Ayarlar kaydedilemedi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSiteSettingsLoading(false);
    }
  };

  const saveBankInfo = async () => {
    try {
      await adminApi.updateSiteSettings({
        bankName: bankInfo.bankName,
        accountHolder: bankInfo.accountHolder,
        iban: bankInfo.iban,
      });
      toast.success('Banka bilgileri kaydedildi');
      setShowBankDialog(false);
    } catch (error: any) {
      toast.error('Banka bilgileri kaydedilemedi: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading || productsLoading || ordersLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard' as MenuItem, label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'orders' as MenuItem, label: 'Siparişler', icon: ShoppingBag, show: true },
    { id: 'products' as MenuItem, label: 'Ürünler', icon: Package, show: isSuperAdmin(user?.type) || isManager(user?.type) },
    { id: 'users' as MenuItem, label: 'Kullanıcılar', icon: Users, show: isSuperAdmin(user?.type) },
    { id: 'messages' as MenuItem, label: 'Mesajlar', icon: MessageSquare, show: isSuperAdmin(user?.type) },
    { id: 'coupons' as MenuItem, label: 'İndirim Kodları', icon: Ticket, show: isSuperAdmin(user?.type) },
    { id: 'finance' as MenuItem, label: 'Finans', icon: DollarSign, show: isSuperAdmin(user?.type) || isFinance(user?.type) },
    { id: 'settings' as MenuItem, label: 'Ayarlar', icon: Settings, show: isSuperAdmin(user?.type) },
  ].filter(item => item.show);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${showMobileMenu ? 'fixed inset-0 z-50' : 'hidden'} lg:flex lg:flex-col lg:w-64 bg-white border-r`}>
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Organik Tarım</h1>
            <p className="text-xs text-gray-500">{getRoleLabel(user?.type)}</p>
          </div>
          <button 
            className="lg:hidden ml-auto"
            onClick={() => setShowMobileMenu(false)}
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeMenu === item.id 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setShowMobileMenu(true)}
            >
              <LayoutDashboard className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {menuItems.find(m => m.id === activeMenu)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Manuel Yenile Butonu */}
            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
              title="Verileri Yenile"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Yenile</span>
            </button>
            
            {/* Canlı Veri Durumu */}
            <button
              onClick={() => setLiveDataEnabled(!liveDataEnabled)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors ${
                liveDataEnabled 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={liveDataEnabled ? 'Canlı veri aktif (5 sn)' : 'Canlı veri pasif'}
            >
              <RefreshCw className={`h-3 w-3 ${liveDataEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              <span>{liveDataEnabled ? 'Canlı' : 'Manuel'}</span>
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <span>{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard 
                  title="Toplam Gelir" 
                  value={`₺${stats.totalRevenue.toLocaleString('tr-TR', {maximumFractionDigits: 0})}`}
                  icon={DollarSign}
                  trend="up"
                />
                <StatCard 
                  title="Toplam Sipariş" 
                  value={stats.totalOrders.toString()}
                  icon={ShoppingBag}
                />
                <StatCard 
                  title="Bugün Sipariş" 
                  value={stats.todayOrders.toString()}
                  icon={Calendar}
                  trend="up"
                />
                <StatCard 
                  title="Bekleyen" 
                  value={stats.pendingOrders.toString()}
                  icon={TrendingUp}
                  alert={stats.pendingOrders > 0}
                />
                <StatCard 
                  title="Toplam Ürün" 
                  value={stats.totalProducts.toString()}
                  icon={Package}
                />
                <StatCard 
                  title="Kullanıcı" 
                  value={stats.totalUsers.toString()}
                  icon={Users}
                />
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Son Siparişler</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveMenu('orders')}
                  >
                    Tümünü Gör
                    <ArrowRight className="ml-2 h-4 w-4" />
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
                        <TableHead className="text-right">İşlem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.userName}</TableCell>
                          <TableCell>₺{order.totalAmount?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'teslim-edildi' ? 'default' : 
                              order.status === 'iptal-edildi' ? 'destructive' : 
                              order.status === 'beklemede' ? 'secondary' :
                              'outline'
                            }>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setActiveMenu('orders')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {recentOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            Henüz sipariş yok
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionCard 
                  title="Komisyon Ayarı"
                  description={`Mevcut: %${commissionRate}`}
                  icon={Percent}
                  onClick={() => setShowSettings(true)}
                  color="blue"
                  adminOnly
                  isAdmin={isSuperAdmin(user?.type)}
                />
                <ActionCard 
                  title="Banka Bilgileri"
                  description={bankInfo.iban ? 'IBAN tanımlı' : 'IBAN tanımla'}
                  icon={Landmark}
                  onClick={() => setShowBankDialog(true)}
                  color="green"
                  adminOnly
                  isAdmin={isSuperAdmin(user?.type)}
                />
                <ActionCard 
                  title="Raporlar"
                  description="Finansal raporları gör"
                  icon={Download}
                  onClick={() => setActiveMenu('finance')}
                  color="purple"
                />
              </div>
            </div>
          )}

          {activeMenu === 'orders' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sipariş Yönetimi</CardTitle>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Sipariş no veya müşteri ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
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
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter(o => 
                        o.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        String(o.id).includes(searchQuery)
                      )
                      .map((order) => (
                      <TableRow key={order.id} className={order.status === 'iptal-edildi' ? 'opacity-50' : ''}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.userName || 'Müşteri'}</TableCell>
                        <TableCell>₺{order.totalAmount?.toFixed(2)}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {/* Sipariş Detay */}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openOrderDetail(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {canWrite(user?.type) && (
                              <>
                                {/* Durum İlerletme Butonları */}
                                {order.status === 'beklemede' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="bg-green-100 hover:bg-green-200"
                                      onClick={() => handleUpdateOrderStatus(order.id, 'onaylandi')}
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleCancelOrder(order.id)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                
                                {order.status === 'onaylandi' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="bg-blue-100 hover:bg-blue-200"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'hazirlaniyor')}
                                  >
                                    <Package className="h-4 w-4 text-blue-600" />
                                  </Button>
                                )}
                                
                                {order.status === 'hazirlaniyor' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="bg-yellow-100 hover:bg-yellow-200"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'yolda')}
                                  >
                                    <MapPin className="h-4 w-4 text-yellow-600" />
                                  </Button>
                                )}
                                
                                {order.status === 'yolda' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="bg-purple-100 hover:bg-purple-200"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'teslim-edildi')}
                                  >
                                    <Check className="h-4 w-4 text-purple-600" />
                                  </Button>
                                )}
                              </>
                            )}
                            
                            {/* Kalıcı Sil Butonu - Sadece Super Admin */}
                            {isSuperAdmin(user?.type) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-red-100 hover:bg-red-200 text-red-600 border-red-200"
                                onClick={() => handleDeleteOrder(order.id)}
                                title="Siparişi Kalıcı Sil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeMenu === 'products' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ürün Listesi</CardTitle>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ürün ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  {canWrite(user?.type) && (
                    <Button 
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: '',
                          description: '',
                          price: 0,
                          stock: 0,
                          unit: 'kg',
                          category: 'SEBZE',
                          isOrganic: false,
                          images: [],
                          producerId: '',
                        });
                        setShowProductDialog(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Yeni Ürün
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ürün</TableHead>
                      <TableHead>Üretici</TableHead>
                      <TableHead>Fiyat</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Durum</TableHead>
                      {canWrite(user?.type) && <TableHead>İşlemler</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products
                      .filter(p => 
                        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.producerName?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((product) => (
                      <TableRow key={product.id} className={!product.isActive ? 'opacity-50' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {product.name}
                            {!product.isActive && (
                              <Badge variant="secondary" className="text-xs">Pasif</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{product.producerName}</TableCell>
                        <TableCell>₺{product.price}</TableCell>
                        <TableCell>{product.stock} {product.unit}</TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        {canWrite(user?.type) && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openEditProductDialog(product)}
                                title="Düzenle"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              {product.isActive ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="bg-yellow-100 hover:bg-yellow-200"
                                  onClick={() => handleDeactivateProduct(Number(product.id))}
                                  title="Pasife Al"
                                >
                                  <XCircle className="h-4 w-4 text-yellow-600" />
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="bg-green-100 hover:bg-green-200"
                                  onClick={() => handleActivateProduct(Number(product.id))}
                                  title="Aktife Al"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteProduct(Number(product.id))}
                                title="Kalıcı Sil"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeMenu === 'users' && isSuperAdmin(user?.type) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Kullanıcı Yönetimi</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Kullanıcı ara..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-64"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                    />
                    <Button variant="outline" onClick={handleSearchUsers}>
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={async () => {
                      const data = await adminApi.getAllUsersAdmin();
                      setUsers(data || []);
                      setUserSearchQuery('');
                    }}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Kayıt</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className={!u.isActive ? 'opacity-50' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {u.name}
                            {!u.isActive && (
                              <Badge variant="secondary" className="text-xs">Pasif</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            u.type === 'SUPER_ADMIN' ? 'destructive' :
                            u.type === 'MANAGER' ? 'outline' :
                            u.type === 'FINANCE' ? 'secondary' :
                            'default'
                          }>
                            {getRoleLabel(u.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.isActive !== false ? 'default' : 'secondary'}>
                            {u.isActive !== false ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openUserDetail(u)}
                              title="Detaylar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant={u.isActive !== false ? "destructive" : "outline"}
                              className={u.isActive === false ? "bg-green-100 hover:bg-green-200" : ""}
                              onClick={() => handleToggleUserStatus(u.id, u.isActive !== false)}
                              title={u.isActive !== false ? "Pasife Al" : "Aktif Et"}
                            >
                              {u.isActive !== false ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeMenu === 'finance' && (isSuperAdmin(user?.type) || isFinance(user?.type)) && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Toplam Gelir</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₺{stats.totalRevenue.toLocaleString('tr-TR')}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Wallet className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Komisyon Oranı</p>
                        <p className="text-2xl font-bold text-blue-600">%{commissionRate}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Percent className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Kargo Ücreti</p>
                        <p className="text-2xl font-bold text-purple-600">₺{shippingFee}</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Banka Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Banka</p>
                      <p className="font-medium">{bankInfo.bankName || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hesap Sahibi</p>
                      <p className="font-medium">{bankInfo.accountHolder || 'Belirtilmemiş'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">IBAN</p>
                      <p className="font-medium font-mono">{bankInfo.iban || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                  {isSuperAdmin(user?.type) && (
                    <Button onClick={() => setShowBankDialog(true)}>
                      <Landmark className="mr-2 h-4 w-4" />
                      Düzenle
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === 'settings' && isSuperAdmin(user?.type) && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Genel Ayarlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Komisyon Oranı (%)</label>
                      <Input 
                        type="number" 
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Kargo Ücreti (₺)</label>
                      <Input 
                        type="number" 
                        value={shippingFee}
                        onChange={(e) => setShippingFee(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <Button onClick={saveSettings}>Kaydet</Button>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* MESAJLAR BÖLÜMÜ */}
          {activeMenu === 'messages' && isSuperAdmin(user?.type) && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Müşteri Mesajları</CardTitle>
                    {unreadMessageCount > 0 && (
                      <Badge className="bg-red-500">{unreadMessageCount} Yeni</Badge>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => loadData(true)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Yenile
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Henüz mesaj yok</p>
                    ) : (
                      messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`p-4 border rounded-lg ${msg.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{msg.sender?.name || 'Bilinmiyor'}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-500">{msg.sender?.email}</span>
                                <span className="text-gray-400">•</span>
                                <Badge variant="outline">{msg.messageType}</Badge>
                                {!msg.isRead && <Badge className="bg-blue-500">Yeni</Badge>}
                              </div>
                              <h4 className="font-medium mb-2">{msg.subject || 'Konu yok'}</h4>
                              <p className="text-gray-600 text-sm mb-3">{msg.content}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Calendar className="h-3 w-3" />
                                {new Date(msg.createdAt).toLocaleString('tr-TR')}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedMessage(msg);
                                  setShowMessageReplyDialog(true);
                                }}
                              >
                                Yanıtla
                              </Button>
                              {!msg.isRead && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleMarkMessageAsRead(msg.id)}
                                >
                                  Okundu
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* İNDİRİM KODLARI BÖLÜMÜ */}
          {activeMenu === 'coupons' && isSuperAdmin(user?.type) && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>İndirim Kodları</CardTitle>
                  <Button onClick={() => setShowCouponDialog(true)}>
                    <Tag className="h-4 w-4 mr-2" />
                    Yeni Kod Oluştur
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.length === 0 ? (
                      <p className="text-gray-500 col-span-3 text-center py-8">Henüz indirim kodu yok</p>
                    ) : (
                      coupons.map((coupon) => (
                        <div key={coupon.id} className={`p-4 border rounded-lg ${coupon.isActive ? 'bg-white' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={`${coupon.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                              {coupon.isActive ? 'Aktif' : 'Pasif'}
                            </Badge>
                            <span className="text-xs text-gray-500">{coupon.usageCount} kullanım</span>
                          </div>
                          <div className="text-center mb-4">
                            <div className="text-2xl font-bold text-green-600 font-mono bg-green-50 p-2 rounded">
                              {coupon.code}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>
                          <div className="space-y-1 text-xs text-gray-500 mb-4">
                            <p>İndirim: {coupon.discountType === 'PERCENTAGE' ? `%${coupon.discountValue}` : `₺${coupon.discountValue}`}</p>
                            <p>Min. Tutar: ₺{coupon.minOrderAmount}</p>
                            <p>Max. İndirim: ₺{coupon.maxDiscountAmount || 'Sınırsız'}</p>
                            <p>Kullanım: {coupon.usageLimit || 'Sınırsız'}</p>
                            <p>Kullanıcı Başına: {coupon.perUserLimit}</p>
                          </div>
                          <div className="text-xs text-gray-400 mb-3">
                            {new Date(coupon.startDate).toLocaleDateString('tr-TR')} - {new Date(coupon.endDate).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                navigator.clipboard.writeText(coupon.code);
                                toast.success('Kod kopyalandı!');
                              }}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Kopyala
                            </Button>
                            {coupon.isActive && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeactivateCoupon(coupon.id)}
                              >
                                Pasif Yap
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ayarları Düzenle</DialogTitle>
            <DialogDescription>
              Komisyon ve kargo ayarlarını güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Komisyon Oranı (%)</label>
              <Input 
                type="number" 
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kargo Ücreti (₺)</label>
              <Input 
                type="number" 
                value={shippingFee}
                onChange={(e) => setShippingFee(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSettings(false)}>İptal</Button>
            <Button onClick={saveSettings}>Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Banka Bilgileri</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Banka Adı</label>
              <Input 
                value={bankInfo.bankName}
                onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hesap Sahibi</label>
              <Input 
                value={bankInfo.accountHolder}
                onChange={(e) => setBankInfo({...bankInfo, accountHolder: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">IBAN</label>
              <Input 
                value={bankInfo.iban}
                onChange={(e) => setBankInfo({...bankInfo, iban: e.target.value})}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBankDialog(false)}>İptal</Button>
            <Button onClick={saveBankInfo}>Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Edit Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Ürün bilgilerini güncelleyin.' : 'Yeni ürün bilgilerini girin.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Ürün Adı</label>
              <Input 
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Açıklama</label>
              <Input 
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Fiyat (₺)</label>
                <Input 
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stok</label>
                <Input 
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Birim</label>
                <Input 
                  value={productForm.unit}
                  onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kategori</label>
                <Input 
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                />
              </div>
            </div>
            
            {/* Ürün Görselleri */}
            <div>
              <label className="text-sm font-medium mb-2 block">Ürün Görselleri</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {productForm.images?.map((img: string, index: number) => (
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
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="isOrganic"
                checked={productForm.isOrganic}
                onChange={(e) => setProductForm({...productForm, isOrganic: e.target.checked})}
                className="rounded border-gray-300"
              />
              <label htmlFor="isOrganic" className="text-sm font-medium">Organik Ürün</label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>İptal</Button>
            <Button 
              onClick={editingProduct ? handleUpdateProduct : handleCreateProduct} 
              className="bg-green-600 hover:bg-green-700"
            >
              {editingProduct ? 'Kaydet' : 'Oluştur'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Sipariş Detayı #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Sipariş bilgilerini görüntüleyin ve yönetin.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* Durum */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sipariş Durumu:</span>
                <OrderStatusBadge status={selectedOrder.status} />
              </div>
              
              {/* Müşteri Bilgileri */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="font-medium mb-2">Müşteri Bilgileri</h4>
                <p className="text-sm">{selectedOrder.userName || 'Müşteri'}</p>
                <p className="text-sm text-gray-500">Sipariş No: #{selectedOrder.id}</p>
              </div>
              
              {/* Teslimat Adresi */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="font-medium mb-2">Teslimat Adresi</h4>
                <p className="text-sm">{selectedOrder.address?.title}</p>
                <p className="text-sm text-gray-500">
                  {selectedOrder.address?.fullAddress}, {selectedOrder.address?.district}, {selectedOrder.address?.city}
                </p>
              </div>
              
              {/* Sipariş Ürünleri */}
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Ürünler</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.productName || 'Bilinmeyen Ürün'} x {item.quantity}</span>
                      <span>₺{((item.unitPrice || item.totalPrice || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Toplam</span>
                  <span>₺{selectedOrder.totalAmount?.toFixed(2)}</span>
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
              
              {/* Admin İşlemleri */}
              {canWrite(user?.type) && selectedOrder.status !== 'iptal-edildi' && selectedOrder.status !== 'teslim-edildi' && (
                <div className="flex gap-2 pt-4">
                  {selectedOrder.status === 'beklemede' && (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleUpdateOrderStatus(selectedOrder.id, 'onaylandi');
                        setShowOrderDialog(false);
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Onayla
                    </Button>
                  )}
                  
                  {selectedOrder.status === 'onaylandi' && (
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        handleUpdateOrderStatus(selectedOrder.id, 'hazirlaniyor');
                        setShowOrderDialog(false);
                      }}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Hazırlanıyor
                    </Button>
                  )}
                  
                  {selectedOrder.status === 'hazirlaniyor' && (
                    <Button 
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => {
                        handleUpdateOrderStatus(selectedOrder.id, 'yolda');
                        setShowOrderDialog(false);
                      }}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Yolda
                    </Button>
                  )}
                  
                  {selectedOrder.status === 'yolda' && (
                    <Button 
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        handleUpdateOrderStatus(selectedOrder.id, 'teslim-edildi');
                        setShowOrderDialog(false);
                      }}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Teslim Edildi
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleCancelOrder(selectedOrder.id);
                      setShowOrderDialog(false);
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    İptal
                  </Button>
                </div>
              )}
              
              {/* Kalıcı Sil Butonu - Sadece Super Admin */}
              {isSuperAdmin(user?.type) && (
                <div className="flex gap-2 pt-4 border-t mt-4">
                  <Button 
                    variant="destructive"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      handleDeleteOrder(selectedOrder.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Siparişi Kalıcı Sil
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

      {/* ==================== USER MANAGEMENT DIALOGS ==================== */}
      
      {/* User Detail Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl">Kullanıcı Detayları</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} - {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* User Info Card */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ad Soyad</label>
                    <p className="text-lg font-semibold text-gray-900 mt-0.5">{selectedUser.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={
                      selectedUser.type === 'SUPER_ADMIN' ? 'destructive' :
                      selectedUser.type === 'MANAGER' ? 'outline' :
                      selectedUser.type === 'FINANCE' ? 'secondary' :
                      'default'
                    }>
                      {getRoleLabel(selectedUser.type)}
                    </Badge>
                    <Badge variant={selectedUser.isActive !== false ? 'default' : 'secondary'}>
                      {selectedUser.isActive !== false ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-xs font-medium text-gray-500">E-posta</label>
                    <p className="text-gray-900 mt-0.5">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Telefon</label>
                    <p className="text-gray-900 mt-0.5">{selectedUser.phone || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500">Kayıt Tarihi</label>
                    <p className="text-gray-900 mt-0.5">
                      {new Date(selectedUser.createdAt).toLocaleDateString('tr-TR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Actions Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-gray-900 uppercase tracking-wide">Hızlı İşlemler</h4>
                
                {/* Primary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedUser.isActive !== false ? "destructive" : "default"}
                    onClick={() => {
                      handleToggleUserStatus(selectedUser.id, selectedUser.isActive !== false);
                      setShowUserDialog(false);
                    }}
                    className="w-full h-11"
                    size="sm"
                  >
                    {selectedUser.isActive !== false ? (
                      <><XCircle className="h-4 w-4 mr-2" /> Pasife Al</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-2" /> Aktif Et</>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUserDialog(false);
                      setShowResetPasswordDialog(true);
                      handleResetPassword();
                    }}
                    className="w-full h-11"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Şifre Sıfırla
                  </Button>
                </div>
                
                {/* Role Section */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rol Değiştir</label>
                  <div className="flex flex-wrap gap-2">
                    {['CONSUMER', 'PRODUCER', 'ADMIN', 'MANAGER', 'FINANCE', 'SUPER_ADMIN'].map((role) => (
                      <Button
                        key={role}
                        size="sm"
                        variant={selectedUser.type?.toUpperCase() === role ? 'default' : 'outline'}
                        onClick={() => handleUpdateUserRole(selectedUser.id, role)}
                        disabled={selectedUser.type?.toUpperCase() === role}
                        className="text-xs h-8 px-3"
                      >
                        {getRoleLabel(role.toLowerCase())}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Divider */}
                <div className="border-t pt-4 space-y-3">
                  {/* Send Email */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUserDialog(false);
                      setShowEmailDialog(true);
                    }}
                    className="w-full h-11"
                    size="sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    E-posta Gönder
                  </Button>
                  
                  {/* Delete User - Danger Zone */}
                  <div className="pt-2 border-t border-red-100">
                    <Button
                      variant="destructive"
                      onClick={() => handlePermanentlyDeleteUser(selectedUser.id)}
                      className="w-full bg-red-600 hover:bg-red-700 h-11"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Kullanıcıyı Kalıcı Sil
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowUserDialog(false)} size="sm">
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Result Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifre Sıfırlandı</DialogTitle>
            <DialogDescription>
              Kullanıcının şifresi başarıyla sıfırlandı.
            </DialogDescription>
          </DialogHeader>
          
          {resetPasswordResult && (
            <div className="py-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Geçici Şifre:</p>
                <p className="text-xl font-mono font-bold text-gray-900 select-all">
                  {resetPasswordResult.tempPassword}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Bu şifreyi güvenli bir şekilde kullanıcıya iletin. Bu pencere kapatıldıktan sonra şifreyi tekrar göremezsiniz!
                </p>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(resetPasswordResult.tempPassword);
                    toast.success('Şifre panoya kopyalandı');
                  }}
                >
                  📋 Kopyala
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowResetPasswordDialog(false);
                    setShowEmailDialog(true);
                    setEmailForm(prev => ({
                      ...prev,
                      subject: 'Şifreniz Sıfırlandı',
                      message: `Merhaba,\n\nHesabınızın şifresi yönetici tarafından sıfırlandı.\n\nGeçici Şifreniz: ${resetPasswordResult.tempPassword}\n\nGüvenliğiniz için lütfen giriş yaptıktan sonra şifrenizi değiştirin.\n\nİyi günler dileriz.`
                    }));
                  }}
                >
                  ✉️ Mail Gönder
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => setShowResetPasswordDialog(false)}>
              Tamam
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={(open) => {
        setShowEmailDialog(open);
        if (open) loadEmailTemplates();
      }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              Kullanıcıya E-posta Gönder
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.name} ({selectedUser?.email}) kullanıcısına e-posta gönderin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Template Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                E-posta Şablonu
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                <button
                  onClick={() => handleTemplateChange('CUSTOM')}
                  className={`p-3 rounded-lg text-left text-sm transition-all ${
                    emailForm.template === 'CUSTOM'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white hover:bg-green-50 border'
                  }`}
                >
                  <div className="font-medium">✏️ Özel Mesaj</div>
                  <div className="text-xs opacity-80 mt-1">Kendi mesajınızı yazın</div>
                </button>
                
                {emailTemplates.filter(t => t.name !== 'CUSTOM').map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleTemplateChange(template.name)}
                    className={`p-3 rounded-lg text-left text-sm transition-all ${
                      emailForm.template === template.name
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white hover:bg-green-50 border'
                    }`}
                  >
                    <div className="font-medium">
                      {template.name === 'WELCOME' && '👋'}
                      {template.name === 'PASSWORD_RESET' && '🔐'}
                      {template.name === 'PASSWORD_CHANGED' && '✅'}
                      {template.name === 'ORDER_CONFIRMATION' && '📦'}
                      {template.name === 'ORDER_STATUS_UPDATE' && '🚚'}
                      {template.name === 'PROMOTION' && '🎉'}
                      {template.name === 'BIRTHDAY' && '🎂'}
                      {template.name === 'HOLIDAY' && '🎊'}
                      {' '}{template.displayName}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                      {template.name === 'WELCOME' && 'Yeni üyelere'}
                      {template.name === 'PASSWORD_RESET' && 'Şifre sıfırlama'}
                      {template.name === 'PASSWORD_CHANGED' && 'Şifre değişimi'}
                      {template.name === 'ORDER_CONFIRMATION' && 'Sipariş onayı'}
                      {template.name === 'ORDER_STATUS_UPDATE' && 'Durum güncelleme'}
                      {template.name === 'PROMOTION' && 'Kampanya/indirim'}
                      {template.name === 'BIRTHDAY' && 'Doğum günü'}
                      {template.name === 'HOLIDAY' && 'Özel gün'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Konu</label>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                placeholder="E-posta konusu..."
                className="mt-1"
              />
            </div>
            
            {/* Template Parameters */}
            {Object.keys(templateParams).length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Şablon Parametreleri
                </label>
                {Object.entries(templateParams).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs text-amber-700 capitalize">
                      {key === 'tempPassword' && 'Geçici Şifre'}
                      {key === 'orderNumber' && 'Sipariş No'}
                      {key === 'totalAmount' && 'Toplam Tutar'}
                      {key === 'newStatus' && 'Yeni Durum'}
                      {key === 'discountCode' && 'İndirim Kodu'}
                      {key === 'discountPercentage' && 'İndirim %'}
                      {key === 'validUntil' && 'Son Kullanma'}
                      {key === 'holidayName' && 'Özel Gün Adı'}
                      {key === 'specialOffer' && 'Özel Fırsat'}
                      {!['tempPassword', 'orderNumber', 'totalAmount', 'newStatus', 'discountCode', 'discountPercentage', 'validUntil', 'holidayName', 'specialOffer'].includes(key) && key}
                    </label>
                    <Input
                      value={value}
                      onChange={(e) => setTemplateParams({...templateParams, [key]: e.target.value})}
                      placeholder={`${key} girin...`}
                      className="mt-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {emailForm.template === 'CUSTOM' && (
              <div>
                <label className="text-sm font-medium">Mesaj</label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                  placeholder="Mesajınızı yazın..."
                  rows={6}
                  className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent mt-1"
                />
              </div>
            )}
            
            {emailForm.template !== 'CUSTOM' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 font-medium text-sm">
                  <Mail className="h-4 w-4" />
                  <span>Şık Kurumsal E-posta Şablonu</span>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Seçilen şablon modern, mobil uyumlu ve kurumsal tasarımda otomatik olarak hazırlanacaktır.
                  Site logosu ve renkleri otomatik uygulanır.
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Responsive tasarım</span>
                  <span className="mx-1">•</span>
                  <span>Şık animasyonlar</span>
                  <span className="mx-1">•</span>
                  <span>Sosyal medya linkleri</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2 border-t">
            <Button variant="outline" onClick={() => {
              setShowEmailDialog(false);
              setTemplateParams({});
            }}>
              İptal
            </Button>
            <Button 
              onClick={handleSendEmail} 
              disabled={!emailForm.subject.trim() || (emailForm.template === 'CUSTOM' && !emailForm.message.trim())}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Gönder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Message Reply Dialog */}
      <MessageReplyDialog
        open={showMessageReplyDialog}
        onClose={() => {
          setShowMessageReplyDialog(false);
          setSelectedMessage(null);
          setReplyForm({ content: '' });
        }}
        message={selectedMessage}
        replyContent={replyForm.content}
        setReplyContent={(content) => setReplyForm({ content })}
        onSubmit={handleReplyToMessage}
      />
      
      {/* Create Coupon Dialog */}
      <CreateCouponDialog
        open={showCouponDialog}
        onClose={() => setShowCouponDialog(false)}
        form={couponForm}
        setForm={setCouponForm}
        onSubmit={handleCreateCoupon}
      />
    </div>
  );
}

// Simple Stat Card
function StatCard({ title, value, icon: Icon, alert, trend }: {
  title: string;
  value: string;
  icon: any;
  alert?: boolean;
  trend?: string;
}) {
  return (
    <Card className={alert ? 'border-orange-300' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${
            alert ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Action Card
function ActionCard({ title, description, icon: Icon, onClick, color, adminOnly, isAdmin }: {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
  color: string;
  adminOnly?: boolean;
  isAdmin?: boolean;
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  };

  if (adminOnly && !isAdmin) return null;

  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 rounded-lg text-left transition-colors ${colors[color as keyof typeof colors]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm mt-1 opacity-80">{description}</p>
        </div>
        <Icon className="h-5 w-5" />
      </div>
    </button>
  );
}

// Order Status Badge Component
function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'beklemede': { label: 'Beklemede', variant: 'secondary' },
    'onaylandi': { label: 'Onaylandı', variant: 'default' },
    'hazirlaniyor': { label: 'Hazırlanıyor', variant: 'secondary' },
    'yolda': { label: 'Yolda', variant: 'outline' },
    'teslim-edildi': { label: 'Teslim Edildi', variant: 'default' },
    'iptal-edildi': { label: 'İptal Edildi', variant: 'destructive' },
  };

  const config = statusConfig[status] || { label: status, variant: 'secondary' };
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Dialog Components
function MessageReplyDialog({ 
  open, 
  onClose, 
  message, 
  replyContent, 
  setReplyContent, 
  onSubmit 
}: { 
  open: boolean; 
  onClose: () => void; 
  message: any; 
  replyContent: string; 
  setReplyContent: (content: string) => void; 
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mesajı Yanıtla</DialogTitle>
          <DialogDescription>
            {message?.sender?.name} kullanıcısına yanıt gönderin
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">Orijinal Mesaj:</p>
            <p className="text-sm text-gray-800 mt-1">{message?.subject}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Yanıtınız</label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Yanıtınızı yazın..."
              rows={5}
              className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button 
            onClick={onSubmit} 
            disabled={!replyContent.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Gönder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateCouponDialog({ 
  open, 
  onClose, 
  form, 
  setForm, 
  onSubmit 
}: { 
  open: boolean; 
  onClose: () => void; 
  form: any; 
  setForm: (form: any) => void; 
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni İndirim Kodu Oluştur</DialogTitle>
          <DialogDescription>
            Müşterileriniz için yeni bir indirim kodu oluşturun
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kod <span className="text-red-500">*</span></label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="INDIRIM20"
            />
            <p className="text-xs text-gray-500">Boş bırakırsanız otomatik oluşturulur</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Açıklama</label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Kampanya açıklaması..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">İndirim Tipi</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="PERCENTAGE">Yüzde (%)</option>
                <option value="FIXED">Sabit Tutar (₺)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">İndirim Değeri</label>
              <Input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Min. Sipariş Tutarı (₺)</label>
              <Input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max. İndirim (₺)</label>
              <Input
                type="number"
                value={form.maxDiscountAmount}
                onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                placeholder="Sınırsız için boş bırakın"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Toplam Kullanım Limiti</label>
              <Input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                placeholder="Sınırsız için boş bırakın"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kullanıcı Başına Limit</label>
              <Input
                type="number"
                value={form.perUserLimit}
                onChange={(e) => setForm({ ...form, perUserLimit: Number(e.target.value) })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Başlangıç Tarihi</label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bitiş Tarihi</label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button 
            onClick={onSubmit}
            className="bg-green-600 hover:bg-green-700"
          >
            <Tag className="h-4 w-4 mr-2" />
            Oluştur
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
