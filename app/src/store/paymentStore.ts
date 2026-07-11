import { create } from 'zustand';

export interface PaymentCard {
  id: string;
  userId: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  isDefault: boolean;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  paymentMethod: 'card' | 'transfer' | 'cod';
  cardLastFour?: string;
  createdAt: string;
}

interface PaymentState {
  savedCards: PaymentCard[];
  transactions: PaymentTransaction[];
  isProcessing: boolean;
  addCard: (card: Omit<PaymentCard, 'id'>) => void;
  removeCard: (cardId: string) => void;
  setDefaultCard: (cardId: string) => void;
  processPayment: (orderId: string, userId: string, amount: number, paymentMethod: string, cardData?: Partial<PaymentCard>) => Promise<PaymentTransaction>;
  getUserCards: (userId: string) => PaymentCard[];
  getUserTransactions: (userId: string) => PaymentTransaction[];
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  savedCards: [],
  transactions: [],
  isProcessing: false,

  addCard: (card) => {
    const newCard: PaymentCard = {
      ...card,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    set((state) => ({
      savedCards: [...state.savedCards, newCard],
    }));
  },

  removeCard: (cardId) => {
    set((state) => ({
      savedCards: state.savedCards.filter((c) => c.id !== cardId),
    }));
  },

  setDefaultCard: (cardId) => {
    const { savedCards } = get();
    const userId = savedCards.find((c) => c.id === cardId)?.userId;
    
    if (!userId) return;
    
    set((state) => ({
      savedCards: state.savedCards.map((c) =>
        c.userId === userId
          ? { ...c, isDefault: c.id === cardId }
          : c
      ),
    }));
  },

  processPayment: async (orderId, userId, amount, paymentMethod, cardData) => {
    set({ isProcessing: true });
    
    // Ödeme simülasyonu - gerçek entegrasyonda burada Stripe/Iyzico vb. çağrılır
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.1; // %90 başarı oranı simülasyonu
    
    const transaction: PaymentTransaction = {
      id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      orderId,
      userId,
      amount,
      status: success ? 'success' : 'failed',
      paymentMethod: paymentMethod as 'card' | 'transfer' | 'cod',
      cardLastFour: cardData?.cardNumber?.slice(-4),
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      transactions: [transaction, ...state.transactions],
      isProcessing: false,
    }));
    
    if (!success) {
      throw new Error('Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    }
    
    return transaction;
  },

  getUserCards: (userId) => {
    return get().savedCards.filter((card) => card.userId === userId);
  },

  getUserTransactions: (userId) => {
    return get().transactions.filter((t) => t.userId === userId);
  },
}));
