import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { useOrderStore } from '@/store/orderStore';

interface UseLiveDataOptions {
  onRefresh?: () => void;
  interval?: number;
  refreshOnFocus?: boolean;
  autoSync?: boolean;
}

// Store'ları dinleyen ve senkronize eden canlı veri hook'u
export function useLiveData(options: UseLiveDataOptions = {}) {
  const { 
    onRefresh, 
    interval = 5000, 
    refreshOnFocus = true,
    autoSync = true 
  } = options;
  
  const intervalRef = useRef<any>(null);
  const isVisibleRef = useRef(true);
  const lastSyncRef = useRef(0);
  
  // Store actions
  const refreshProducts = useAppStore((state) => state.refreshProducts);
  const refreshOrders = useOrderStore((state) => state.refreshOrders);

  const syncAll = useCallback(async () => {
    const now = Date.now();
    // 5 saniyeden kısa sürede tekrar sync yapma
    if (now - lastSyncRef.current < 5000) return;
    
    lastSyncRef.current = now;
    console.log('🔄 Tum store\'lar senkronize ediliyor...');
    
    try {
      await Promise.all([
        refreshProducts().catch(e => console.error('Urun senkronizasyon hatasi:', e)),
        refreshOrders().catch(e => console.error('Siparis senkronizasyon hatasi:', e)),
      ]);
      
      onRefresh?.();
    } catch (error) {
      console.error('Senkronizasyon hatasi:', error);
    }
  }, [refreshProducts, refreshOrders, onRefresh]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(() => {
      if (isVisibleRef.current && autoSync) {
        syncAll();
      }
    }, interval);
  }, [syncAll, interval, autoSync]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const manualRefresh = useCallback(() => {
    console.log('🔄 Manuel senkronizasyon...');
    syncAll();
  }, [syncAll]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      isVisibleRef.current = isVisible;
      
      if (isVisible && refreshOnFocus) {
        console.log('👁️ Sayfa aktif, senkronizasyon baslatiliyor...');
        syncAll();
        startPolling();
      } else if (!isVisible) {
        console.log('😴 Sayfa arka planda');
        stopPolling();
      }
    };

    const handleFocus = () => {
      if (refreshOnFocus) {
        syncAll();
        startPolling();
      }
    };

    const handleOnline = () => {
      console.log('🌐 Baglanti aktif');
      syncAll();
      startPolling();
    };

    const handleOffline = () => {
      console.log('❌ Baglanti yok');
      stopPolling();
    };

    // Event listener'lar
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // İlk senkronizasyon
    if (autoSync) {
      syncAll();
      startPolling();
    }

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncAll, refreshOnFocus, startPolling, stopPolling, autoSync]);

  return {
    refresh: manualRefresh,
    syncAll,
    start: startPolling,
    stop: stopPolling,
  };
}

// Sadece ürünler için
export function useLiveProducts(options: Omit<UseLiveDataOptions, 'onRefresh'> & { onRefresh?: () => void } = {}) {
  const refreshProducts = useAppStore((state) => state.refreshProducts);
  
  return useLiveData({
    ...options,
    onRefresh: () => {
      refreshProducts();
      options.onRefresh?.();
    },
  });
}

// Sadece siparişler için
export function useLiveOrders(options: Omit<UseLiveDataOptions, 'onRefresh'> & { onRefresh?: () => void } = {}) {
  const refreshOrders = useOrderStore((state) => state.refreshOrders);
  
  return useLiveData({
    ...options,
    onRefresh: () => {
      refreshOrders();
      options.onRefresh?.();
    },
  });
}
