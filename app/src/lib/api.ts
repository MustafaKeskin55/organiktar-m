// Backend API istemcisi
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT token ekleme
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('[API DEBUG] Token:', token ? token.substring(0, 30) + '...' : 'YOK');
    console.log('[API DEBUG] URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Hata yönetimi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      console.error('403 Forbidden - Yetkisiz erişim:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

// Toast utility
export const toast = {
  success: (message: string) => {
    console.log('✅ Success:', message);
    alert('✅ ' + message);
  },
  error: (message: string) => {
    console.log('❌ Error:', message);
    alert('❌ ' + message);
  },
  info: (message: string) => {
    console.log('ℹ️ Info:', message);
  },
};

// ============================================================================
// MOCK DATABASE & CLIENT SIDE DEMO LOGIC
// ============================================================================

export const USE_MOCK_FALLBACK = true; // Sunum için varsayılan olarak Mock API kullan

class MockDatabase {
  static init() {
    if (localStorage.getItem('mock_db_initialized')) return;

    // Seed Users
    localStorage.setItem('mock_users', JSON.stringify([
      { id: 1, name: 'Mustafa Peksin (Super Admin)', email: 'mustafakeksin@gmail.com', password: '123456', type: 'SUPER_ADMIN', phone: '05555555551', addresses: [], favorites: [], createdAt: new Date().toISOString(), isActive: true },
      { id: 10, name: 'Süper Yönetici', email: 'superadmin@example.com', password: '123456', type: 'SUPER_ADMIN', phone: '05555555550', addresses: [], favorites: [], createdAt: new Date().toISOString(), isActive: true },
      { id: 2, name: 'Ahmet Çiftçi (Üretici)', email: 'producer@example.com', password: '123456', type: 'PRODUCER', phone: '05555555552', addresses: [], favorites: [], createdAt: new Date().toISOString(), isActive: true },
      { id: 3, name: 'Müşteri Can (Tüketici)', email: 'consumer@example.com', password: '123456', type: 'CONSUMER', phone: '05555555553', addresses: [], favorites: [], createdAt: new Date().toISOString(), isActive: true },
      { id: 4, name: 'Finans Yöneticisi', email: 'finance@example.com', password: '123456', type: 'FINANCE', phone: '05555555554', addresses: [], favorites: [], createdAt: new Date().toISOString(), isActive: true },
      { id: 5, name: 'Genel Müdür (Manager)', email: 'manager@example.com', password: '123456', type: 'MANAGER', phone: '05555555555', addresses: [], favorites: [], createdAt: new Date().toISOString(), isActive: true },
      { id: 6, name: 'Ayşe Kaya (Üretici)', email: 'ayse@example.com', password: '123456', type: 'PRODUCER', phone: '05555555556', addresses: [], favorites: [], createdAt: new Date().toISOString(), isActive: true }
    ]));

    // Seed Products
    localStorage.setItem('mock_products', JSON.stringify([
      { id: '1', producerId: '2', producerName: 'Ahmet Çiftçi', producerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop', name: 'Organik Salkım Domates', description: 'Serada değil, tamamen açık alanda doğal gübreyle yetiştirilmiş salkım domates.', category: 'SEBZE', price: 45, unit: 'kg', stock: 150, images: ['https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&h=400&fit=crop'], rating: 4.8, reviewCount: 24, isOrganic: true, isSeasonal: true, isActive: true, createdAt: new Date().toISOString() },
      { id: '2', producerId: '2', producerName: 'Ahmet Çiftçi', producerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop', name: 'Çengelköy Salatalık', description: 'Kütür kütür, taze ve çok lezzetli Çengelköy salatalığı.', category: 'SEBZE', price: 30, unit: 'kg', stock: 80, images: ['https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop'], rating: 4.6, reviewCount: 15, isOrganic: true, isSeasonal: true, isActive: true, createdAt: new Date().toISOString() },
      { id: '3', producerId: '6', producerName: 'Ayşe Kaya', producerImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', name: 'Süzme Çiçek Balı', description: 'Muğla yaylalarından tamamen doğal süzme çiçek balı.', category: 'BAL', price: 250, unit: 'adet', stock: 40, images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop'], rating: 4.9, reviewCount: 32, isOrganic: true, isSeasonal: false, isActive: true, createdAt: new Date().toISOString() },
      { id: '4', producerId: '6', producerName: 'Ayşe Kaya', producerImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', name: 'Erken Hasat Zeytinyağı', description: 'Ayvalık zeytinlerinden soğuk sıkım yöntemiyle üretilmiş sızma zeytinyağı.', category: 'ZEYTINYAGI', price: 320, unit: 'litre', stock: 60, images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=400&fit=crop'], rating: 4.7, reviewCount: 18, isOrganic: true, isSeasonal: false, isActive: true, createdAt: new Date().toISOString() },
      { id: '5', producerId: '2', producerName: 'Ahmet Çiftçi', producerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop', name: 'Organik Çilek', description: 'Kokulu, tatlı ve tamamen doğal organik çilek.', category: 'MEYVE', price: 75, unit: 'kg', stock: 50, images: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=400&fit=crop'], rating: 4.5, reviewCount: 12, isOrganic: true, isSeasonal: true, isActive: true, createdAt: new Date().toISOString() }
    ]));

    // Seed Categories
    localStorage.setItem('mock_categories', JSON.stringify([
      { id: 1, slug: 'sebze', name: 'Sebze', description: 'Taze ve organik sebzeler', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', productCount: 2 },
      { id: 2, slug: 'meyve', name: 'Meyve', description: 'Dalından taze meyveler', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&h=300&fit=crop', productCount: 1 },
      { id: 3, slug: 'bakliyat', name: 'Bakliyat', description: 'Doğal kuru bakliyat ürünleri', image: 'https://images.unsplash.com/photo-1515942400420-2b98feb2a41a?w=400&h=300&fit=crop', productCount: 0 },
      { id: 4, slug: 'sut', name: 'Süt Ürünleri', description: 'Köy sütü ve doğal peynirler', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop', productCount: 0 },
      { id: 5, slug: 'zeytinyagi', name: 'Zeytinyağı', description: 'Soğuk sıkım zeytinyağı', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop', productCount: 1 }
    ]));

    // Seed Orders
    localStorage.setItem('mock_orders', JSON.stringify([
      {
        id: 1,
        orderNumber: 'ORD-1719876543',
        userId: '3',
        userName: 'Müşteri Can (Tüketici)',
        totalAmount: 370,
        deliveryFee: 15,
        status: 'teslim-edildi',
        paymentMethod: 'CARD',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        estimatedDelivery: new Date(Date.now() - 86400000 * 2).toISOString(),
        address: { title: 'Ev', city: 'İstanbul', district: 'Kadıköy', fullAddress: 'Moda Cd. No: 5' },
        items: [
          { productId: '1', productName: 'Organik Salkım Domates', quantity: 2, unitPrice: 45, totalPrice: 90 },
          { productId: '3', productName: 'Süzme Çiçek Balı', quantity: 1, unitPrice: 250, totalPrice: 250 }
        ]
      },
      {
        id: 2,
        orderNumber: 'ORD-1719912345',
        userId: '3',
        userName: 'Müşteri Can (Tüketici)',
        totalAmount: 135,
        deliveryFee: 15,
        status: 'beklemede',
        paymentMethod: 'TRANSFER',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
        address: { title: 'Ev', city: 'İstanbul', district: 'Kadıköy', fullAddress: 'Moda Cd. No: 5' },
        items: [
          { productId: '1', productName: 'Organik Salkım Domates', quantity: 3, unitPrice: 45, totalPrice: 135 }
        ]
      }
    ]));

    // Seed Messages
    localStorage.setItem('mock_messages', JSON.stringify([
      { id: 1, subject: 'Ürün İadesi', content: 'Merhaba, aldığım domatesler biraz ezilmiş geldi. İade talep ediyorum.', userId: 3, userEmail: 'consumer@example.com', createdAt: new Date().toISOString(), isRead: false, replies: [] }
    ]));

    // Seed Site Content
    localStorage.setItem('mock_site_content', JSON.stringify({
      hero_stats: {
        stats: [
          { icon: 'Leaf', value: '6+', label: 'Yerel Üretici', dynamic: true, source: 'producer_count' },
          { icon: 'Star', value: '10K+', label: 'Mutlu Müşteri', dynamic: true, source: 'consumer_count' },
          { icon: 'Truck', value: '50K+', label: 'Teslimat', dynamic: true, source: 'order_count' }
        ],
        floating_badge: { text: 'Yakınlarınızdaki', value: '6', suffix: '+ Üretici', dynamic: true, source: 'producer_count' }
      }
    }));

    // Seed Site Settings
    localStorage.setItem('mock_site_settings', JSON.stringify({
      commissionRate: 5,
      grossRevenue: 505,
      totalCommission: 25.25,
      netRevenue: 479.75,
      pendingPayment: 135,
      totalOrders: 2,
      completedOrders: 1,
      pendingOrders: 1,
      cancelledOrders: 0
    }));

    localStorage.setItem('mock_db_initialized', 'true');
  }

  static get(key: string) {
    this.init();
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  static set(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

// ============================================================================
// PRODUCT API
// ============================================================================
export const productApi = {
  getAll: async () => {
    if (USE_MOCK_FALLBACK) {
      return { data: MockDatabase.get('mock_products') };
    }
    const response = await apiClient.get('/products');
    return response.data;
  },
  
  getById: async (id: number) => {
    if (USE_MOCK_FALLBACK) {
      const products = MockDatabase.get('mock_products');
      const product = products.find((p: any) => String(p.id) === String(id));
      return { data: product };
    }
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  
  getByProducer: async (producerId: number) => {
    if (USE_MOCK_FALLBACK) {
      const products = MockDatabase.get('mock_products');
      const filtered = products.filter((p: any) => String(p.producerId) === String(producerId));
      return filtered; // returning the array directly as expected by pages
    }
    const response = await apiClient.get(`/products/producer/${producerId}`);
    return response.data;
  },
  
  getByCategory: async (category: string) => {
    if (USE_MOCK_FALLBACK) {
      const products = MockDatabase.get('mock_products');
      const filtered = products.filter((p: any) => String(p.category).toUpperCase() === category.toUpperCase());
      return { data: filtered };
    }
    const response = await apiClient.get(`/products/category/${category}`);
    return response.data;
  },
  
  create: async (data: any, producerId: number) => {
    if (USE_MOCK_FALLBACK) {
      const products = MockDatabase.get('mock_products');
      const producers = MockDatabase.get('mock_users').filter((u: any) => u.type === 'PRODUCER');
      const producer = producers.find((p: any) => String(p.id) === String(producerId)) || producers[0];
      
      const newProduct = {
        ...data,
        id: String(products.length + 1),
        producerId: String(producerId),
        producerName: producer ? producer.name : 'Bilinmeyen Çiftçi',
        producerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
        rating: 5.0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      products.push(newProduct);
      MockDatabase.set('mock_products', products);
      return { data: newProduct };
    }
    const response = await apiClient.post(`/products?producerId=${producerId}`, data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    if (USE_MOCK_FALLBACK) {
      const products = MockDatabase.get('mock_products');
      const idx = products.findIndex((p: any) => String(p.id) === String(id));
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...data };
        MockDatabase.set('mock_products', products);
        return { data: products[idx] };
      }
      throw new Error('Ürün bulunamadı');
    }
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    if (USE_MOCK_FALLBACK) {
      const products = MockDatabase.get('mock_products');
      const filtered = products.filter((p: any) => String(p.id) !== String(id));
      MockDatabase.set('mock_products', filtered);
      return { success: true };
    }
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
  
  deactivate: async (id: number) => {
    if (USE_MOCK_FALLBACK) {
      return productApi.update(id, { isActive: false });
    }
    const response = await apiClient.put(`/products/${id}/deactivate`);
    return response.data;
  },
  
  activate: async (id: number) => {
    if (USE_MOCK_FALLBACK) {
      return productApi.update(id, { isActive: true });
    }
    const response = await apiClient.put(`/products/${id}/activate`);
    return response.data;
  },
};

// ============================================================================
// USER API
// ============================================================================
export const userApi = {
  forgotPassword: async (email: string) => {
    if (USE_MOCK_FALLBACK) {
      return { success: true, message: 'Şifre sıfırlama e-postası gönderildi' };
    }
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  getAll: async () => {
    if (USE_MOCK_FALLBACK) {
      return MockDatabase.get('mock_users'); // pages expect the raw list
    }
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  getById: async (id: number) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const user = users.find((u: any) => String(u.id) === String(id));
      return { data: user };
    }
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) {
        throw { response: { data: { error: 'Geçersiz e-posta veya şifre' } } };
      }
      return {
        data: user,
        token: `mock.jwt.token.${user.id}.${user.type}`,
        expiresIn: 86400000,
        requiresPasswordChange: false
      };
    }
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: { name: string; email: string; password: string; phone?: string; type?: string }) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      if (users.some((u: any) => u.email === userData.email)) {
        throw { response: { data: { error: 'Bu e-posta adresi zaten kullanımda' } } };
      }
      const newUser = {
        id: users.length + 1,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        type: (userData.type || 'consumer').toUpperCase(),
        addresses: [],
        favorites: [],
        createdAt: new Date().toISOString(),
        isActive: true
      };
      users.push(newUser);
      MockDatabase.set('mock_users', users);
      return {
        data: newUser,
        token: `mock.jwt.token.${newUser.id}.${newUser.type}`,
        expiresIn: 86400000
      };
    }
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
  
  create: async (data: any) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const newUser = {
        ...data,
        id: users.length + 1,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      users.push(newUser);
      MockDatabase.set('mock_users', users);
      return { data: newUser };
    }
    const response = await apiClient.post('/users', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const idx = users.findIndex((u: any) => String(u.id) === String(id));
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...data };
        MockDatabase.set('mock_users', users);
        return { data: users[idx] };
      }
      throw new Error('Kullanıcı bulunamadı');
    }
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const filtered = users.filter((u: any) => String(u.id) !== String(id));
      MockDatabase.set('mock_users', filtered);
      return { success: true };
    }
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      return { 
        data: {
          total: users.length,
          producers: users.filter((u: any) => u.type === 'PRODUCER').length,
          consumers: users.filter((u: any) => u.type === 'CONSUMER').length,
        }
      };
    }
    const response = await apiClient.get('/users');
    const users = response.data;
    return { 
      data: {
        total: users.length,
        producers: users.filter((u: any) => u.type === 'producer').length,
        consumers: users.filter((u: any) => u.type === 'consumer').length,
      }
    };
  },
  
  changePassword: async (userId: number, passwordData: { currentPassword: string, newPassword: string }) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const user = users.find((u: any) => String(u.id) === String(userId));
      if (user && user.password === passwordData.currentPassword) {
        user.password = passwordData.newPassword;
        MockDatabase.set('mock_users', users);
        return { success: true };
      }
      throw new Error('Mevcut şifre hatalı');
    }
    const response = await apiClient.post(`/users/${userId}/change-password`, passwordData);
    return response.data;
  },
  
  sendMessageToAdmin: async (subject: string, content: string) => {
    if (USE_MOCK_FALLBACK) {
      const messages = MockDatabase.get('mock_messages');
      const newMsg = {
        id: messages.length + 1,
        subject,
        content,
        userId: 3,
        userEmail: 'consumer@example.com',
        createdAt: new Date().toISOString(),
        isRead: false,
        replies: []
      };
      messages.push(newMsg);
      MockDatabase.set('mock_messages', messages);
      return { data: newMsg };
    }
    const response = await apiClient.post('/messages/to-admin', { subject, content });
    return response.data;
  },
  
  getUserMessages: async () => {
    if (USE_MOCK_FALLBACK) {
      return { data: MockDatabase.get('mock_messages') };
    }
    const response = await apiClient.get('/messages/my-messages');
    return response.data;
  },
  
  getUnreadReplies: async () => {
    if (USE_MOCK_FALLBACK) {
      return { data: 0 };
    }
    const response = await apiClient.get('/messages/unread-replies');
    return response.data;
  },
  
  getUserMessageThread: async (messageId: number) => {
    if (USE_MOCK_FALLBACK) {
      const messages = MockDatabase.get('mock_messages');
      const msg = messages.find((m: any) => String(m.id) === String(messageId));
      return { data: msg };
    }
    const response = await apiClient.get(`/messages/thread/${messageId}`);
    return response.data;
  },
  
  markReplyAsRead: async (messageId: number) => {
    if (USE_MOCK_FALLBACK) {
      return { success: true };
    }
    const response = await apiClient.post(`/messages/${messageId}/mark-read`);
    return response.data;
  },
};

// ============================================================================
// PRODUCER API (NEW)
// ============================================================================
export const producerApi = {
  getAll: async () => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      // Format as Producer profiles
      const producers = users.filter((u: any) => u.type === 'PRODUCER').map((u: any) => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
        phone: u.phone,
        location: {
          city: 'Muğla',
          district: 'Milas',
          address: 'Gökçeler Köyü No: 42',
          lat: 37.3,
          lng: 27.8
        },
        story: 'Kuşaklar boyu doğal tarım yapan ailemizin taze ürünlerini sizlerle paylaşıyoruz.',
        image: u.id === 6 
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop'
          : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop',
        rating: 4.8,
        reviewCount: 15,
        products: [],
        isVerified: true,
        createdAt: u.createdAt
      }));
      return { data: producers };
    }
    const response = await apiClient.get('/users/producers'); // Hypothetical path
    return response.data;
  },

  getById: async (id: number) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const u = users.find((user: any) => String(user.id) === String(id) && user.type === 'PRODUCER');
      if (u) {
        return {
          id: String(u.id),
          name: u.name,
          email: u.email,
          phone: u.phone,
          location: {
            city: 'Muğla',
            district: 'Milas',
            address: 'Gökçeler Köyü No: 42',
            lat: 37.3,
            lng: 27.8
          },
          story: 'Kuşaklar boyu doğal tarım yapan ailemizin taze ürünlerini sizlerle paylaşıyoruz.',
          image: u.id === 6 
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop'
            : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop',
          rating: 4.8,
          reviewCount: 15,
          products: [],
          isVerified: true,
          createdAt: u.createdAt
        };
      }
      throw new Error('Üretici bulunamadı');
    }
    const response = await apiClient.get(`/users/producers/${id}`);
    return response.data;
  }
};

// ============================================================================
// ORDER API
// ============================================================================
export const orderApi = {
  getAll: async () => {
    if (USE_MOCK_FALLBACK) {
      return MockDatabase.get('mock_orders'); // directly array
    }
    const response = await apiClient.get('/orders');
    return response.data;
  },
  
  getById: async (id: number) => {
    if (USE_MOCK_FALLBACK) {
      const orders = MockDatabase.get('mock_orders');
      const order = orders.find((o: any) => String(o.id) === String(id));
      return { data: order };
    }
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },
  
  getByConsumer: async (consumerId: number) => {
    if (USE_MOCK_FALLBACK) {
      const orders = MockDatabase.get('mock_orders');
      const filtered = orders.filter((o: any) => String(o.userId) === String(consumerId));
      return { data: filtered };
    }
    const response = await apiClient.get(`/orders/consumer/${consumerId}`);
    return response.data;
  },

  getByUser: async (userId: number | string) => {
    return orderApi.getByConsumer(typeof userId === 'string' ? parseInt(userId) : userId);
  },
  
  create: async (data: any) => {
    if (USE_MOCK_FALLBACK) {
      const orders = MockDatabase.get('mock_orders');
      const users = MockDatabase.get('mock_users');
      const user = users.find((u: any) => String(u.id) === String(data.userId)) || users[2];
      
      const newOrder = {
        ...data,
        id: orders.length + 1,
        orderNumber: `ORD-${Date.now()}`,
        userName: user ? user.name : 'Bilinmeyen Müşteri',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'beklemede'
      };
      orders.push(newOrder);
      MockDatabase.set('mock_orders', orders);
      return { data: newOrder };
    }
    const response = await apiClient.post('/orders', data);
    return response.data;
  },
  
  updateStatus: async (id: number, status: string) => {
    if (USE_MOCK_FALLBACK) {
      const orders = MockDatabase.get('mock_orders');
      const idx = orders.findIndex((o: any) => String(o.id) === String(id));
      if (idx !== -1) {
        orders[idx].status = status.toLowerCase().replace(/_/g, '-');
        MockDatabase.set('mock_orders', orders);
        return { data: orders[idx] };
      }
      throw new Error('Sipariş bulunamadı');
    }
    const response = await apiClient.put(`/orders/${id}/status?status=${status}`);
    return response.data;
  },
  
  delete: async (id: number) => {
    if (USE_MOCK_FALLBACK) {
      const orders = MockDatabase.get('mock_orders');
      const filtered = orders.filter((o: any) => String(o.id) !== String(id));
      MockDatabase.set('mock_orders', filtered);
      return { success: true };
    }
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },
  
  deleteMultiple: async (ids: number[]) => {
    if (USE_MOCK_FALLBACK) {
      const orders = MockDatabase.get('mock_orders');
      const stringIds = ids.map(String);
      const filtered = orders.filter((o: any) => !stringIds.includes(String(o.id)));
      MockDatabase.set('mock_orders', filtered);
      return { success: true };
    }
    const response = await apiClient.delete('/orders/batch', { data: ids });
    return response.data;
  },
};

// ============================================================================
// ADDRESS API
// ============================================================================
export const addressApi = {
  getByUser: async (userId: number) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const user = users.find((u: any) => String(u.id) === String(userId));
      return { data: user ? user.addresses || [] : [] };
    }
    const response = await apiClient.get(`/addresses/user/${userId}`);
    return response.data;
  },
  
  create: async (data: any) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const user = users.find((u: any) => String(u.id) === String(data.userId));
      if (user) {
        if (!user.addresses) user.addresses = [];
        const newAddress = {
          ...data,
          id: user.addresses.length + 1
        };
        user.addresses.push(newAddress);
        MockDatabase.set('mock_users', users);
        return { data: newAddress };
      }
      throw new Error('Kullanıcı bulunamadı');
    }
    const response = await apiClient.post('/addresses', data);
    return response.data;
  },
  
  update: async (id: number, data: any) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      for (const u of users) {
        const addrIdx = u.addresses?.findIndex((a: any) => String(a.id) === String(id));
        if (addrIdx !== undefined && addrIdx !== -1) {
          u.addresses[addrIdx] = { ...u.addresses[addrIdx], ...data };
          MockDatabase.set('mock_users', users);
          return { data: u.addresses[addrIdx] };
        }
      }
      throw new Error('Adres bulunamadı');
    }
    const response = await apiClient.put(`/addresses/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      for (const u of users) {
        const addrIdx = u.addresses?.findIndex((a: any) => String(a.id) === String(id));
        if (addrIdx !== undefined && addrIdx !== -1) {
          u.addresses.splice(addrIdx, 1);
          MockDatabase.set('mock_users', users);
          return { success: true };
        }
      }
      return { success: true };
    }
    const response = await apiClient.delete(`/addresses/${id}`);
    return response.data;
  },
};

// ============================================================================
// CATEGORY API
// ============================================================================
export const categoryApi = {
  getAll: async (includeInactive = false) => {
    if (USE_MOCK_FALLBACK) {
      return MockDatabase.get('mock_categories');
    }
    const response = await apiClient.get(`/categories?includeInactive=${includeInactive}`);
    return response.data;
  },
  
  getById: async (id: number) => {
    if (USE_MOCK_FALLBACK) {
      const categories = MockDatabase.get('mock_categories');
      const cat = categories.find((c: any) => String(c.id) === String(id));
      return { data: cat };
    }
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },
  
  getBySlug: async (slug: string) => {
    if (USE_MOCK_FALLBACK) {
      const categories = MockDatabase.get('mock_categories');
      const cat = categories.find((c: any) => c.slug === slug);
      return { data: cat };
    }
    const response = await apiClient.get(`/categories/slug/${slug}`);
    return response.data;
  },
};

// ============================================================================
// SITE CONTENT API
// ============================================================================
export const siteContentApi = {
  getHeroStats: async () => {
    if (USE_MOCK_FALLBACK) {
      return MockDatabase.get('mock_site_content').hero_stats;
    }
    const response = await apiClient.get('/site-content/hero-stats');
    return response.data;
  },
  
  getHowItWorks: async () => {
    if (USE_MOCK_FALLBACK) return [];
    const response = await apiClient.get('/site-content/how-it-works');
    return response.data;
  },
  
  getTestimonials: async () => {
    if (USE_MOCK_FALLBACK) return [];
    const response = await apiClient.get('/site-content/testimonials');
    return response.data;
  },
  
  getSubscriptionPlans: async () => {
    if (USE_MOCK_FALLBACK) return [];
    const response = await apiClient.get('/site-content/subscription-plans');
    return response.data;
  },
  
  getChatbotConfig: async () => {
    if (USE_MOCK_FALLBACK) return null;
    const response = await apiClient.get('/site-content/chatbot');
    return response.data;
  },
  
  getByKey: async (key: string) => {
    if (USE_MOCK_FALLBACK) return null;
    const response = await apiClient.get(`/site-content/${key}`);
    return response.data;
  },
};

// ============================================================================
// ADMIN API
// ============================================================================
export const adminApi = {
  getSiteSettings: async () => {
    if (USE_MOCK_FALLBACK) {
      return { data: MockDatabase.get('mock_site_settings') };
    }
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },
  
  updateSiteSettings: async (data: any) => {
    if (USE_MOCK_FALLBACK) {
      const settings = MockDatabase.get('mock_site_settings');
      const updated = { ...settings, ...data };
      MockDatabase.set('mock_site_settings', updated);
      return { data: updated };
    }
    const response = await apiClient.put('/admin/settings', data);
    return response.data;
  },
  
  updateCommissionRate: async (rate: number) => {
    if (USE_MOCK_FALLBACK) {
      return adminApi.updateSiteSettings({ commissionRate: rate });
    }
    const response = await apiClient.put(`/admin/settings/commission?rate=${rate}`);
    return response.data;
  },
  
  getPaymentSettings: async () => {
    if (USE_MOCK_FALLBACK) return { data: [] };
    const response = await apiClient.get('/admin/payment-settings');
    return response.data;
  },
  
  getActivePaymentSettings: async () => {
    if (USE_MOCK_FALLBACK) return { data: [] };
    const response = await apiClient.get('/admin/payment-settings/active');
    return response.data;
  },
  
  savePaymentSettings: async (data: any) => {
    if (USE_MOCK_FALLBACK) return { data };
    const response = await apiClient.post('/admin/payment-settings', data);
    return response.data;
  },
  
  updatePaymentSettings: async (id: number, data: any) => {
    if (USE_MOCK_FALLBACK) return { data };
    const response = await apiClient.put(`/admin/payment-settings/${id}`, data);
    return response.data;
  },
  
  deletePaymentSettings: async (id: number) => {
    if (USE_MOCK_FALLBACK) return;
    await apiClient.delete(`/admin/payment-settings/${id}`);
  },
  
  updateIbanInfo: async (bankName: string, accountHolder: string, iban: string) => {
    if (USE_MOCK_FALLBACK) return { data: { bankName, accountHolder, iban } };
    const response = await apiClient.put('/admin/payment-settings/iban', {
      bankName,
      accountHolder,
      iban
    });
    return response.data;
  },
  
  getDailyReports: async (limit: number = 30) => {
    if (USE_MOCK_FALLBACK) {
      const dayData = [];
      for (let i = limit; i >= 0; i--) {
        const dateStr = new Date(Date.now() - 86400000 * i).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        dayData.push({
          date: dateStr,
          revenue: 100 + Math.random() * 500,
          orders: Math.floor(2 + Math.random() * 8),
          commission: 5 + Math.random() * 25
        });
      }
      return { data: dayData };
    }
    const response = await apiClient.get(`/admin/reports/daily?limit=${limit}`);
    return response.data;
  },
  
  getMonthlyReports: async () => {
    if (USE_MOCK_FALLBACK) {
      return {
        data: [
          { month: 'Ocak', revenue: 4500, orders: 85, commission: 225 },
          { month: 'Şubat', revenue: 5200, orders: 98, commission: 260 },
          { month: 'Mart', revenue: 6100, orders: 110, commission: 305 },
          { month: 'Nisan', revenue: 5800, orders: 102, commission: 290 },
          { month: 'Mayıs', revenue: 7200, orders: 130, commission: 360 },
          { month: 'Haziran', revenue: 8500, orders: 154, commission: 425 }
        ]
      };
    }
    const response = await apiClient.get('/admin/reports/monthly');
    return response.data;
  },
  
  getDashboardStats: async () => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const products = MockDatabase.get('mock_products');
      const orders = MockDatabase.get('mock_orders');
      
      const producersCount = users.filter((u: any) => u.type === 'PRODUCER').length;
      const consumersCount = users.filter((u: any) => u.type === 'CONSUMER').length;
      
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
      
      return {
        data: {
          totalUsers: users.length,
          totalProducers: producersCount,
          totalConsumers: consumersCount,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          commissionEarned: totalRevenue * 0.05
        }
      };
    }
    const response = await apiClient.get('/admin/reports/dashboard');
    return response.data;
  },
  
  getRevenueSummary: async (startDate: string, endDate: string) => {
    if (USE_MOCK_FALLBACK) {
      return { data: { revenue: 505, commission: 25.25 } };
    }
    const response = await apiClient.get(`/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
  
  getAdminDashboardStats: async () => {
    if (USE_MOCK_FALLBACK) {
      return adminApi.getDashboardStats();
    }
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },
  
  getProducerEarnings: async (producerId: number) => {
    if (USE_MOCK_FALLBACK) {
      const orders = MockDatabase.get('mock_orders');
      const products = MockDatabase.get('mock_products');
      const producerProducts = products.filter((p: any) => String(p.producerId) === String(producerId));
      const producerProductIds = new Set(producerProducts.map((p: any) => String(p.id)));
      
      // Filter orders having items of this producer
      const myOrders = orders.filter((o: any) => 
        o.items?.some((item: any) => producerProductIds.has(String(item.productId)))
      );
      
      const grossRevenue = myOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
      const commissionRate = 5;
      const totalCommission = grossRevenue * 0.05;
      const netRevenue = grossRevenue - totalCommission;
      
      return {
        commissionRate,
        grossRevenue,
        totalCommission,
        netRevenue,
        pendingPayment: myOrders.filter((o: any) => o.status === 'beklemede').reduce((sum: number, o: any) => sum + o.totalAmount, 0),
        totalOrders: myOrders.length,
        completedOrders: myOrders.filter((o: any) => o.status === 'teslim-edildi').length,
        pendingOrders: myOrders.filter((o: any) => o.status === 'beklemede').length,
        cancelledOrders: myOrders.filter((o: any) => o.status === 'iptal-edildi').length,
        monthlyEarnings: [
          { month: 'Haziran', grossRevenue, netRevenue }
        ],
        topProducts: producerProducts.map((p: any) => ({
          productId: String(p.id),
          productName: p.name,
          quantity: 5,
          revenue: p.price * 5
        }))
      };
    }
    const response = await apiClient.get(`/admin/producer-earnings/${producerId}`);
    return response.data;
  },
  
  getAllUsersAdmin: async () => {
    if (USE_MOCK_FALLBACK) {
      return { data: MockDatabase.get('mock_users') };
    }
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
  
  searchUsers: async (query: string) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const filtered = users.filter((u: any) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));
      return { data: filtered };
    }
    const response = await apiClient.get(`/admin/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  toggleUserStatus: async (userId: number, active: boolean) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const u = users.find((user: any) => String(user.id) === String(userId));
      if (u) {
        u.isActive = active;
        MockDatabase.set('mock_users', users);
        return { data: u };
      }
      throw new Error('Kullanıcı bulunamadı');
    }
    const response = await apiClient.put(`/admin/users/${userId}/status?active=${active}`);
    return response.data;
  },
  
  resetUserPassword: async (userId: number) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const u = users.find((user: any) => String(user.id) === String(userId));
      if (u) {
        u.password = '123456';
        MockDatabase.set('mock_users', users);
        return { success: true, message: 'Şifre 123456 olarak sıfırlandı' };
      }
      throw new Error('Kullanıcı bulunamadı');
    }
    const response = await apiClient.put(`/admin/users/${userId}/reset-password`);
    return response.data;
  },
  
  updateUserRole: async (userId: number, role: string) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const u = users.find((user: any) => String(user.id) === String(userId));
      if (u) {
        u.type = role.toUpperCase();
        MockDatabase.set('mock_users', users);
        return { data: u };
      }
      throw new Error('Kullanıcı bulunamadı');
    }
    const response = await apiClient.put(`/admin/users/${userId}/role?role=${role}`);
    return response.data;
  },
  
  permanentlyDeleteUser: async (userId: number) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const filtered = users.filter((u: any) => String(u.id) !== String(userId));
      MockDatabase.set('mock_users', filtered);
      return { success: true };
    }
    const response = await apiClient.delete(`/admin/users/${userId}/delete`);
    return response.data;
  },
  
  sendEmailToUser: async (userId: number, subject: string, message: string) => {
    if (USE_MOCK_FALLBACK) {
      return { success: true, message: 'E-posta başarıyla gönderildi' };
    }
    const response = await apiClient.post(`/admin/users/${userId}/send-email`, {
      subject,
      message,
    });
    return response.data;
  },
  
  getEmailTemplates: async () => {
    if (USE_MOCK_FALLBACK) {
      return { data: [{ id: 1, name: 'Hoşgeldin E-postası', subject: 'Aramıza Hoşgeldiniz!' }] };
    }
    const response = await apiClient.get('/admin/email-templates');
    return response.data;
  },
  
  sendTemplateEmail: async (userId: number, template: string, subject: string, params: Record<string, string>) => {
    if (USE_MOCK_FALLBACK) {
      return { success: true };
    }
    const response = await apiClient.post(`/admin/users/${userId}/send-template-email?template=${template}&subject=${encodeURIComponent(subject)}`, params);
    return response.data;
  },
  
  getInactiveUsers: async (daysInactive: number = 30) => {
    if (USE_MOCK_FALLBACK) return { data: [] };
    const response = await apiClient.get(`/admin/users/inactive?daysInactive=${daysInactive}`);
    return response.data;
  },
  
  createRetentionPlan: async (userId: number) => {
    if (USE_MOCK_FALLBACK) return { data: { userId, status: 'PLAN_CREATED' } };
    const response = await apiClient.post(`/admin/users/${userId}/create-retention-plan`);
    return response.data;
  },
  
  getUserRetentionPlans: async (userId: number) => {
    if (USE_MOCK_FALLBACK) return { data: [] };
    const response = await apiClient.get(`/admin/users/${userId}/retention-plans`);
    return response.data;
  },
  
  getPendingRetentionPlans: async () => {
    if (USE_MOCK_FALLBACK) return { data: [] };
    const response = await apiClient.get('/admin/retention-plans/pending');
    return response.data;
  },
  
  updateUserCommissionRate: async (userId: number, rate: number) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const u = users.find((user: any) => String(user.id) === String(userId));
      if (u) {
        u.commissionRate = rate;
        MockDatabase.set('mock_users', users);
        return { data: u };
      }
      throw new Error('Kullanıcı bulunamadı');
    }
    const response = await apiClient.put(`/admin/users/${userId}/commission-rate?rate=${rate}`);
    return response.data;
  },
  
  getUserCommissionRate: async (userId: number) => {
    if (USE_MOCK_FALLBACK) {
      const users = MockDatabase.get('mock_users');
      const u = users.find((user: any) => String(user.id) === String(userId));
      return { data: u ? u.commissionRate || 5 : 5 };
    }
    const response = await apiClient.get(`/admin/users/${userId}/commission-rate`);
    return response.data;
  },
  
  triggerScheduledEmails: async () => {
    if (USE_MOCK_FALLBACK) return { success: true };
    const response = await apiClient.post('/admin/scheduled-emails/trigger');
    return response.data;
  },
  
  sendWelcomeEmailNow: async (userId: number) => {
    if (USE_MOCK_FALLBACK) return { success: true };
    const response = await apiClient.post(`/admin/users/${userId}/send-welcome-now`);
    return response.data;
  },
  
  getUserScheduledEmails: async (userId: number) => {
    if (USE_MOCK_FALLBACK) return { data: [] };
    const response = await apiClient.get(`/admin/scheduled-emails/user/${userId}`);
    return response.data;
  },
  
  getMessages: async () => {
    if (USE_MOCK_FALLBACK) {
      return { data: MockDatabase.get('mock_messages') };
    }
    const response = await apiClient.get('/admin/messages');
    return response.data;
  },
  
  getUnreadMessageCount: async () => {
    if (USE_MOCK_FALLBACK) {
      const messages = MockDatabase.get('mock_messages');
      return { data: messages.filter((m: any) => !m.isRead).length };
    }
    const response = await apiClient.get('/admin/messages/unread-count');
    return response.data;
  },
  
  replyToMessage: async (messageId: number, content: string) => {
    if (USE_MOCK_FALLBACK) {
      const messages = MockDatabase.get('mock_messages');
      const msg = messages.find((m: any) => String(m.id) === String(messageId));
      if (msg) {
        if (!msg.replies) msg.replies = [];
        msg.replies.push({
          content,
          createdAt: new Date().toISOString(),
          isAdminReply: true
        });
        MockDatabase.set('mock_messages', messages);
        return { data: msg };
      }
      throw new Error('Mesaj bulunamadı');
    }
    const response = await apiClient.post(`/admin/messages/${messageId}/reply`, { content });
    return response.data;
  },
  
  markMessageAsRead: async (messageId: number) => {
    if (USE_MOCK_FALLBACK) {
      const messages = MockDatabase.get('mock_messages');
      const msg = messages.find((m: any) => String(m.id) === String(messageId));
      if (msg) {
        msg.isRead = true;
        MockDatabase.set('mock_messages', messages);
      }
      return { success: true };
    }
    const response = await apiClient.post(`/admin/messages/${messageId}/mark-read`);
    return response.data;
  },
  
  getMessageThread: async (messageId: number) => {
    if (USE_MOCK_FALLBACK) {
      return adminApi.getMessages();
    }
    const response = await apiClient.get(`/admin/messages/thread/${messageId}`);
    return response.data;
  },
  
  getCoupons: async () => {
    if (USE_MOCK_FALLBACK) return { data: [] };
    const response = await apiClient.get('/admin/coupons');
    return response.data;
  },
  
  createCoupon: async (couponData: any) => {
    if (USE_MOCK_FALLBACK) return { data: couponData };
    const response = await apiClient.post('/admin/coupons', couponData);
    return response.data;
  },
  
  deactivateCoupon: async (couponId: number) => {
    if (USE_MOCK_FALLBACK) return { success: true };
    const response = await apiClient.put(`/admin/coupons/${couponId}/deactivate`);
    return response.data;
  },
  
  validateCoupon: async (code: string, orderAmount: number) => {
    if (USE_MOCK_FALLBACK) {
      if (code === 'ORGANIK10') {
        return { success: true, discountAmount: orderAmount * 0.10, code };
      }
      throw new Error('Geçersiz kupon kodu');
    }
    const response = await apiClient.post('/admin/coupons/validate', { code, orderAmount });
    return response.data;
  },
};
