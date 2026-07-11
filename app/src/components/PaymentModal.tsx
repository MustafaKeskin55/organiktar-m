import { useState } from 'react';
import { X, CreditCard, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePaymentStore, type PaymentCard } from '@/store/paymentStore';
import { useAuthStore } from '@/store/authStore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PaymentModal({ isOpen, onClose, amount, onSuccess, onError }: PaymentModalProps) {
  const { user } = useAuthStore();
  const { processPayment, addCard, getUserCards, isProcessing } = usePaymentStore();
  
  const savedCards = user ? getUserCards(user.id) : [];
  const hasSavedCards = savedCards.length > 0;
  
  const [useNewCard, setUseNewCard] = useState(!hasSavedCards);
  const [selectedCardId, setSelectedCardId] = useState<string>(savedCards[0]?.id || '');
  
  const [cardData, setCardData] = useState<Partial<PaymentCard>>({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: true,
  });
  
  const [saveCard, setSaveCard] = useState(true);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    }
    return v;
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData({ ...cardData, cardNumber: formatted });
  };
  
  const validateCard = () => {
    const errors: string[] = [];
    
    const cardNumber = cardData.cardNumber?.replace(/\s/g, '') || '';
    if (cardNumber.length < 16) {
      errors.push('Kart numarası 16 haneli olmalıdır');
    }
    
    if (!cardData.cardHolder?.trim()) {
      errors.push('Kart sahibinin adı gereklidir');
    }
    
    if (!cardData.expiryMonth || !cardData.expiryYear) {
      errors.push('Son kullanma tarihi gereklidir');
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      errors.push('CVV kodu gereklidir');
    }
    
    return errors;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (useNewCard) {
      const errors = validateCard();
      if (errors.length > 0) {
        setError(errors[0]);
        return;
      }
    }
    
    try {
      // Ödeme işlemi
      await processPayment(
        'ORDER-' + Date.now(),
        user?.id || '',
        amount,
        'card',
        useNewCard ? cardData : undefined
      );
      
      // Kart kaydetme
      if (useNewCard && saveCard && user) {
        addCard({
          userId: user.id,
          cardNumber: cardData.cardNumber?.replace(/\s/g, '') || '',
          cardHolder: cardData.cardHolder || '',
          expiryMonth: cardData.expiryMonth || '',
          expiryYear: cardData.expiryYear || '',
          cvv: '', // CVV'yi kaydetmiyoruz (güvenlik)
          isDefault: savedCards.length === 0 || !!cardData.isDefault,
        });
      }
      
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ödeme işlemi başarısız oldu';
      setError(errorMessage);
      onError(errorMessage);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Ödeme</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Amount */}
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-center">
          <p className="text-sm text-gray-600">Ödenecek Tutar</p>
          <p className="text-3xl font-bold text-green-700">{amount.toFixed(2)} TL</p>
        </div>
        
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Saved Cards */}
          {hasSavedCards && !useNewCard && (
            <div className="mb-4 space-y-2">
              <Label>Kayıtlı Kartlar</Label>
              {savedCards.map((card) => (
                <label
                  key={card.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    selectedCardId === card.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="card"
                    value={card.id}
                    checked={selectedCardId === card.id}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="h-4 w-4 text-green-600"
                  />
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">**** **** **** {card.cardNumber.slice(-4)}</p>
                    <p className="text-xs text-gray-500">{card.cardHolder}</p>
                  </div>
                  {card.isDefault && (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      Varsayılan
                    </span>
                  )}
                </label>
              ))}
              
              <button
                type="button"
                onClick={() => setUseNewCard(true)}
                className="w-full rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                + Yeni Kart Ekle
              </button>
            </div>
          )}
          
          {/* New Card Form */}
          {useNewCard && (
            <div className="space-y-4">
              {hasSavedCards && (
                <button
                  type="button"
                  onClick={() => setUseNewCard(false)}
                  className="text-sm text-green-600 hover:underline"
                >
                  ← Kayıtlı kartlarımı kullan
                </button>
              )}
              
              <div>
                <Label htmlFor="cardNumber">Kart Numarası</Label>
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                />
              </div>
              
              <div>
                <Label htmlFor="cardHolder">Kart Sahibinin Adı</Label>
                <Input
                  id="cardHolder"
                  placeholder="Ad Soyad"
                  value={cardData.cardHolder}
                  onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">Ay</Label>
                  <Input
                    id="expiryMonth"
                    placeholder="MM"
                    maxLength={2}
                    value={cardData.expiryMonth}
                    onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryYear">Yıl</Label>
                  <Input
                    id="expiryYear"
                    placeholder="YY"
                    maxLength={2}
                    value={cardData.expiryYear}
                    onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={4}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                  />
                </div>
              </div>
              
              {hasSavedCards && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Bu kartı kaydet</span>
                </label>
              )}
            </div>
          )}
          
          <Button
            type="submit"
            className="mt-6 w-full bg-green-600 hover:bg-green-700"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                İşleniyor...
              </span>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Ödemeyi Tamamla ({amount.toFixed(2)} TL)
              </>
            )}
          </Button>
          
          <p className="mt-4 text-center text-xs text-gray-500">
            256-bit SSL şifreleme ile güvenli ödeme
          </p>
        </form>
      </div>
    </div>
  );
}
