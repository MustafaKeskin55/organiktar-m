import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Product, Producer, Category } from '@/types';
import { productApi, producerApi, categoryApi } from '@/lib/api';

// Helper to normalize product data from API
const normalizeProduct = (data: any): Product => ({
  ...data,
  id: String(data.id),
  price: Number(data.price),
  stock: Number(data.stock),
  images: Array.isArray(data.images) ? data.images : [],
  isOrganic: Boolean(data.isOrganic),
  isSeasonal: Boolean(data.isSeasonal),
  isActive: data.isActive !== false, // default true
});

interface AppState {
  products: Product[];
  producers: Producer[];
  categories: Category[];
  selectedCategory: string | null;
  selectedCity: string | null;
  searchQuery: string;
  isLoading: boolean;
  
  setSelectedCategory: (category: string | null) => void;
  setSelectedCity: (city: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  fetchProducts: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (productData: Partial<Product>, producerId?: number) => Promise<Product | null>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  toggleProductActive: (id: string, isActive: boolean) => Promise<boolean>;
  
  getFilteredProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  getProductsByProducer: (producerId: string) => Product[];
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      products: [],
      producers: [],
      categories: [],
      selectedCategory: null,
      selectedCity: null,
      searchQuery: '',
      isLoading: false,

      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSelectedCity: (city) => set({ selectedCity: city }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      fetchProducts: async () => {
        set({ isLoading: true });
        try {
          const response = await productApi.getAll();
          const products = (response.data || []).map(normalizeProduct);
          set({ products, isLoading: false });
        } catch (error) {
          console.error('Error fetching products:', error);
          set({ isLoading: false });
        }
      },

      refreshProducts: async () => {
        await get().fetchProducts();
      },

      fetchCategories: async () => {
        try {
          const response = await categoryApi.getAll();
          const categoriesList = Array.isArray(response) ? response : (response.data || []);
          set({ categories: categoriesList });
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      },

      createProduct: async (productData, producerId = 1) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticProduct = { 
          ...productData, 
          id: tempId,
          createdAt: new Date().toISOString()
        } as Product;
        
        set((state) => ({
          products: [optimisticProduct, ...state.products],
        }));
        
        try {
          const response = await productApi.create(productData, producerId);
          const newProduct = normalizeProduct(response.data || response);
          
          set((state) => ({
            products: state.products.map(p => 
              p.id === tempId ? newProduct : p
            ),
          }));
          
          return newProduct;
        } catch (error: any) {
          set((state) => ({
            products: state.products.filter(p => p.id !== tempId),
          }));
          throw error;
        }
      },

      updateProduct: async (id, productData) => {
        const oldProduct = get().products.find(p => p.id === id);
        if (!oldProduct) return null;
        
        const optimisticProduct = { ...oldProduct, ...productData };
        set((state) => ({
          products: state.products.map(p => 
            p.id === id ? optimisticProduct : p
          ),
        }));
        
        try {
          const response = await productApi.update(parseInt(id), productData);
          const updatedProduct = normalizeProduct(response.data || response);
          
          set((state) => ({
            products: state.products.map(p => 
              p.id === id ? updatedProduct : p
            ),
          }));
          
          return updatedProduct;
        } catch (error: any) {
          set((state) => ({
            products: state.products.map(p => 
              p.id === id ? oldProduct : p
            ),
          }));
          throw error;
        }
      },

      deleteProduct: async (id) => {
        const oldProducts = get().products;
        
        set((state) => ({
          products: state.products.filter(p => p.id !== id),
        }));
        
        try {
          await productApi.delete(parseInt(id));
          return true;
        } catch (error: any) {
          set({ products: oldProducts });
          throw error;
        }
      },

      toggleProductActive: async (id, isActive) => {
        const oldProduct = get().products.find(p => p.id === id);
        if (!oldProduct) return false;
        
        set((state) => ({
          products: state.products.map(p => 
            p.id === id ? { ...p, isActive } : p
          ),
        }));
        
        try {
          if (isActive) {
            await productApi.activate(parseInt(id));
          } else {
            await productApi.deactivate(parseInt(id));
          }
          return true;
        } catch (error: any) {
          set((state) => ({
            products: state.products.map(p => 
              p.id === id ? oldProduct : p
            ),
          }));
          throw error;
        }
      },

      getFilteredProducts: () => {
        const { products, selectedCategory, selectedCity } = get();
        return products.filter(p => {
          if (selectedCategory && p.category !== selectedCategory) return false;
          if (selectedCity && p.producerId) {
            // City filtering logic if needed
          }
          return true;
        });
      },

      getProductById: (id) => {
        return get().products.find(p => p.id === id);
      },

      getProductsByProducer: (producerId) => {
        return get().products.filter(p => String(p.producerId) === String(producerId));
      },
    }),
    { name: 'AppStore' }
  )
);
