// Üretici (Çiftçi) Tipi
export interface Producer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    city: string;
    district: string;
    address: string;
    lat: number;
    lng: number;
  };
  story: string;
  image: string;
  rating: number;
  reviewCount: number;
  products: string[];
  isVerified: boolean;
  createdAt: string;
}

// Ürün Tipi
export interface Product {
  id: string;
  producerId: string;
  producerName: string;
  producerImage: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isOrganic: boolean;
  isSeasonal: boolean;
  isActive?: boolean;
  harvestDate?: string;
  createdAt: string;
}

// Ürün Kategorileri
export type ProductCategory = 
  | 'SEBZE'
  | 'MEYVE'
  | 'BAKLIYAT'
  | 'SUT'
  | 'ET'
  | 'ZEYTINYAGI'
  | 'BAL'
  | 'BAHARAT'
  | 'DIGER';

// Kullanıcı Tipi (tüm roller dahil)
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'CONSUMER' | 'PRODUCER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | 'FINANCE' | string;
  addresses: Address[];
  favorites: string[];
  createdAt: string;
  forcePasswordChange?: boolean;
}

// Adres Tipi
export interface Address {
  id: string;
  title: string;
  city: string;
  district: string;
  neighborhood: string;
  fullAddress: string;
  isDefault: boolean;
}

// Sepet Tipi
export interface CartItem {
  product: Product;
  quantity: number;
}

// Sipariş Öğesi Tipi
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Sipariş Tipi
export interface Order {
  id: string | number;
  orderNumber?: string;
  userId: string;
  userName?: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  status: OrderStatus;
  address: Address;
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery: string;
}

// Sipariş Durumları
export type OrderStatus = 
  | 'beklemede'
  | 'onaylandi'
  | 'hazirlaniyor'
  | 'yolda'
  | 'teslim-edildi'
  | 'iptal-edildi'
  | 'tamamlandi'
  | 'iptal'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | string;

// Site Ayarları
export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  deliveryFee: number;
  minOrderAmount: number;
}

// Kategori Arayüzü
export interface Category {
  id: string | number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  iconName?: string;
  displayOrder?: number;
  isActive?: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Üretici Kazanç Arayüzü
export interface ProducerEarnings {
  commissionRate: number;
  grossRevenue: number;
  totalCommission: number;
  netRevenue: number;
  pendingPayment: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  monthlyEarnings: {
    month: string;
    grossRevenue: number;
    netRevenue: number;
    orderCount?: number;
    commission?: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
    productImage?: string;
    quantitySold?: number;
    netRevenue?: number;
    grossRevenue?: number;
  }[];
}

