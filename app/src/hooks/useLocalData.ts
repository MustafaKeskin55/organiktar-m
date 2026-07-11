// Bu dosya artık kullanılmıyor - backend-only moduna geçildi
// Veriler sadece backend'den çekiliyor

export const useLocalData = () => {
  // Backend-only mod - bu hook artık kullanılmıyor
  return {
    isOfflineMode: false,
    toggleOfflineMode: () => {},
    products: [],
    orders: [],
    addProduct: () => null,
    updateProduct: () => {},
    deleteProduct: () => {},
    activateProduct: () => {},
    deactivateProduct: () => {},
    addOrder: () => null,
    updateOrder: () => {},
    cancelOrder: () => {},
    clearAll: () => {},
  };
};
