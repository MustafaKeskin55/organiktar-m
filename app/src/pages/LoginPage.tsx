import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toggle between role-based button login and manual form login
  const [showManualForm, setShowManualForm] = useState(false);

  const handleLoginSuccess = (userType: string) => {
    const role = userType?.toLowerCase();
    if (role === 'super_admin' || role === 'admin') {
      navigate('/admin');
    } else if (role === 'manager') {
      navigate('/dashboard/manager');
    } else if (role === 'finance') {
      navigate('/dashboard/finance');
    } else if (role === 'producer') {
      navigate('/satici-panel');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await login(email, password);
      if (result) {
        const currentUser = useAuthStore.getState().user;
        handleLoginSuccess(currentUser?.type || 'consumer');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.');
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError(null);
    setEmail(demoEmail);
    setPassword('123456');
    try {
      const result = await login(demoEmail, '123456');
      if (result) {
        const currentUser = useAuthStore.getState().user;
        handleLoginSuccess(currentUser?.type || 'consumer');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Giriş başarısız.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center font-medium text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Ana Sayfa
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-green-700">Organik Tarım</h1>
            <p className="text-sm text-gray-500 mt-1">
              {showManualForm ? 'Hesabınıza giriş yapın' : 'Hızlı Giriş Seçenekleri'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {!showManualForm ? (
            /* Premium Role Cards Panel */
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin@example.com')}
                className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl transition-all duration-200 text-left group"
              >
                <div>
                  <span className="font-bold text-sm text-purple-700 block">Süper Admin Girişi</span>
                  <span className="text-xs text-purple-500">Tüm sistemi ve genel ayarları yönetin</span>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-600 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('producer@example.com')}
                className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100/80 border border-green-200 rounded-xl transition-all duration-200 text-left group"
              >
                <div>
                  <span className="font-bold text-sm text-green-700 block">Üretici / Çiftçi Girişi</span>
                  <span className="text-xs text-green-500">Ürün ekleyin ve siparişleri takip edin</span>
                </div>
                <ArrowRight className="w-5 h-5 text-green-600 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('consumer@example.com')}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl transition-all duration-200 text-left group"
              >
                <div>
                  <span className="font-bold text-sm text-blue-700 block">Tüketici / Müşteri Girişi</span>
                  <span className="text-xs text-blue-500">Taze doğal ürünler seçip sipariş edin</span>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager@example.com')}
                className="w-full flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl transition-all duration-200 text-left group"
              >
                <div>
                  <span className="font-bold text-sm text-amber-700 block">Sistem Müdürü Girişi</span>
                  <span className="text-xs text-amber-500">Onay kuyrukları ve operasyon takipleri</span>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-600 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('finance@example.com')}
                className="w-full flex items-center justify-between p-4 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all duration-200 text-left group"
              >
                <div>
                  <span className="font-bold text-sm text-rose-700 block">Finans Yöneticisi Girişi</span>
                  <span className="text-xs text-rose-500">Komisyon raporları ve bakiye dağıtımları</span>
                </div>
                <ArrowRight className="w-5 h-5 text-rose-600 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ) : (
            /* Manual Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">E-posta</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="isim@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Şifre</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>
          )}

          {/* Toggle Button */}
          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setShowManualForm(!showManualForm);
              }}
              className="text-green-600 hover:text-green-700 font-medium hover:underline"
            >
              {showManualForm ? '← Hızlı Giriş Seçeneklerini Göster' : 'E-posta ve Şifre ile Giriş Yap'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
