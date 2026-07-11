import { create } from 'zustand';
import { adminApi } from '@/lib/api';

interface SettingsState {
  commissionRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  minOrderAmount: number;
  bankName: string;
  accountHolder: string;
  iban: string;
  isLoading: boolean;
  
  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Omit<SettingsState, 'isLoading' | 'fetchSettings' | 'updateSettings'>>) => Promise<boolean>;
  getShippingFee: (orderTotal: number) => number;
}

export const useSettingsStore = create<SettingsState>()(
  (set, get) => ({
    commissionRate: 5,
    shippingFee: 29.99,
    freeShippingThreshold: 250,
    minOrderAmount: 50,
    bankName: '',
    accountHolder: '',
    iban: '',
    isLoading: false,

    fetchSettings: async () => {
      try {
        set({ isLoading: true });
        const settings = await adminApi.getSiteSettings();
        
        if (settings) {
          set({
            commissionRate: settings.commissionRate || 5,
            shippingFee: settings.shippingFee || 29.99,
            freeShippingThreshold: settings.freeShippingThreshold || 250,
            minOrderAmount: settings.minOrderAmount || 50,
            bankName: settings.bankName || '',
            accountHolder: settings.accountHolder || '',
            iban: settings.iban || '',
          });
        }
      } catch (error) {
        console.error('Ayarlar yuklenirken hata:', error);
      } finally {
        set({ isLoading: false });
      }
    },

    updateSettings: async (newSettings) => {
      try {
        set({ isLoading: true });
        await adminApi.updateSiteSettings(newSettings);
        set({ ...newSettings });
        return true;
      } catch (error) {
        console.error('Ayarlar guncellenirken hata:', error);
        return false;
      } finally {
        set({ isLoading: false });
      }
    },

    getShippingFee: (orderTotal: number) => {
      const { shippingFee, freeShippingThreshold } = get();
      return orderTotal >= freeShippingThreshold ? 0 : shippingFee;
    },
  })
);
