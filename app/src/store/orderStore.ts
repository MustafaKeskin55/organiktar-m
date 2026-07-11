import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order } from '@/types';
import { orderApi, toast } from '@/lib/api';
import { useAppStore } from '@/store/appStore';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  lastUpdated: number;
  
  // Actions
  setOrders: (orders: Order[]) => void;
  fetchOrders: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  
  // CRUD with API
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string | number, status: Order['status']) => Promise<boolean>;
  cancelOrder: (orderId: string | number) => Promise<boolean>;
  deleteOrder: (orderId: string | number) => Promise<boolean>;
  
  // Getters
  getOrdersByUser: (userId: string) => Order[];
  getOrdersByProducer: (producerId: string) => Order[];
  getOrderById: (orderId: string | number) => Order | undefined;
  
  // Sync
  syncOrder: (order: Order) => void;
  removeOrder: (orderId: string | number) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      lastUpdated: 0,

      setOrders: (orders: Order[]) => {
        set({ orders, lastUpdated: Date.now() });
      },

      fetchOrders: async () => {
        const now = Date.now();
        if (now - get().lastUpdated < 30000 && get().orders.length > 0) {
          return;
        }
        
        set({ isLoading: true });
        try {
          const response = await orderApi.getAll();
          const orders = Array.isArray(response) ? response : (response.data || []);
          set({ orders: orders.map(normalizeOrder), isLoading: false, lastUpdated: Date.now() });
        } catch (error) {
          console.error('Siparisler yuklenirken hata:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      refreshOrders: async () => {
        set({ lastUpdated: 0 });
        await get().fetchOrders();
      },

      createOrder: async (orderData) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticOrder = {
          ...orderData,
          id: tempId,
          orderNumber: `ORD-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'beklemede',
        } as Order;
        
        // Optimistic update
        set((state) => ({
          orders: [optimisticOrder, ...state.orders],
        }));
        
        try {
          const response = await orderApi.create(orderData);
          const newOrder = normalizeOrder(response.data || response);
          
          set((state) => ({
            orders: state.orders.map(o => o.id === tempId ? newOrder : o),
          }));
          
          return newOrder;
        } catch (error: any) {
          set((state) => ({
            orders: state.orders.filter(o => o.id !== tempId),
          }));
          toast.error(error.response?.data?.message || 'Siparis olusturulurken hata');
          return null;
        }
      },

      updateOrderStatus: async (orderId, status) => {
        const id = orderId.toString();
        const oldOrder = get().orders.find(o => o.id.toString() === id);
        if (!oldOrder) return false;
        
        // Optimistic update
        set((state) => ({
          orders: state.orders.map(o => 
            o.id.toString() === id ? { ...o, status } : o
          ),
        }));
        
        try {
          const backendStatus = status.toUpperCase().replace(/-/g, '_');
          await orderApi.updateStatus(parseInt(id) || 0, backendStatus);
          toast.success(`Siparis durumu: ${status}`);
          return true;
        } catch (error: any) {
          set((state) => ({
            orders: state.orders.map(o => 
              o.id.toString() === id ? oldOrder : o
            ),
          }));
          toast.error(error.response?.data?.message || 'Durum guncellenirken hata');
          return false;
        }
      },

      cancelOrder: async (orderId) => {
        const id = orderId.toString();
        return get().updateOrderStatus(id, 'iptal-edildi');
      },

      deleteOrder: async (orderId) => {
        const id = orderId.toString();
        const oldOrders = get().orders;
        
        set((state) => ({
          orders: state.orders.filter(o => o.id.toString() !== id),
        }));
        
        try {
          await orderApi.delete(parseInt(id) || 0);
          toast.success('Siparis basariyla silindi');
          return true;
        } catch (error: any) {
          set({ orders: oldOrders });
          toast.error(error.response?.data?.message || 'Siparis silinirken hata');
          return false;
        }
      },

      getOrdersByUser: (userId) => {
        return get().orders.filter((order) => order.userId === userId);
      },

      getOrdersByProducer: (producerId) => {
        const products = useAppStore.getState().products;
        return get().orders.filter((order) =>
          order.items?.some((item) => {
            const product = products.find(p => String(p.id) === String(item.productId));
            return product && String(product.producerId) === String(producerId);
          })
        );
      },

      getOrderById: (orderId) => {
        return get().orders.find(o => o.id.toString() === orderId.toString());
      },

      syncOrder: (order: Order) => {
        set((state) => ({
          orders: state.orders.map(o => 
            o.id === order.id ? order : o
          ),
        }));
      },

      removeOrder: (orderId: string | number) => {
        const id = orderId.toString();
        set((state) => ({
          orders: state.orders.filter(o => o.id.toString() !== id),
        }));
      },
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({ 
        orders: state.orders,
        lastUpdated: state.lastUpdated
      }),
    }
  )
);

function normalizeOrder(o: any): Order {
  return {
    id: o.id?.toString() || '',
    orderNumber: o.orderNumber || `ORD-${o.id}`,
    userId: o.userId?.toString() || '',
    userName: o.userName || '',
    items: o.items || [],
    totalAmount: o.totalAmount || 0,
    deliveryFee: o.deliveryFee || 0,
    status: o.status?.toLowerCase().replace(/_/g, '-') || 'beklemede',
    address: o.address || {},
    paymentMethod: o.paymentMethod || '',
    createdAt: o.createdAt || new Date().toISOString(),
    estimatedDelivery: o.estimatedDelivery || '',
  };
}
