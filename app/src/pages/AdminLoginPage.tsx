import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, ArrowLeft, ArrowRight, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/lib/api';
import { isAdmin, getRoleLabel } from '@/lib/roles';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Toggle between role buttons and manual inputs
  const [showManualForm, setShowManualForm] = useState(false);

  const handleLoginSuccess = (userType: string) => {
    const role = userType?.toLowerCase();
    if (role === 'super_admin' || role === 'admin') {
      navigate('/admin');
    } else if (role === 'manager') {
      navigate('/dashboard/manager');
    } else if (role === 'finance') {
      navigate('/dashboard/finance');
    } else {
      navigate('/admin');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      const currentUser = useAuthStore.getState().user;
      
      if (!isAdmin(currentUser?.type)) {
        toast.error('Bu sayfa sadece yöneticiler içindir!');
        setIsLoading(false);
        return;
      }
      
      toast.success(`${getRoleLabel(currentUser?.type)} girişi başarılı!`);
      handleLoginSuccess(currentUser?.type || '');
    } catch (err) {
      setError('Geçersiz e-posta veya şifre');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError('');
    setIsLoading(true);
    setEmail(demoEmail);
    setPassword('123456');
    try {
      await login(demoEmail, '123456');
      const currentUser = useAuthStore.getState().user;
      
      if (!isAdmin(currentUser?.type)) {
        toast.error('Bu sayfa sadece yöneticiler içindir!');
        setIsLoading(false);
        return;
      }
      
      toast.success(`${getRoleLabel(currentUser?.type)} girişi başarılı!`);
      handleLoginSuccess(currentUser?.type || '');
    } catch (err) {
      setError('Geçersiz e-posta veya şifre');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Yönetici Girişi
          </CardTitle>
          <CardDescription className="text-slate-500">
            {showManualForm ? 'Yönetici bilgileriyle giriş yapın' : 'Hızlı Yönetici Seçenekleri'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!showManualForm ? (
            /* Admin Buttons List */
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin@example.com')}
                className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl transition-all duration-200 text-left group"
              >
                <div>
                  <span className="font-bold text-sm text-purple-700 block">Süper Admin</span>
                  <span className="text-xs text-purple-500">Tüm sistem ve genel ayarları yönetin</span>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-600 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager@example.com')}
                className="w-full flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl transition-all duration-200 text-left group"
              >
                <div>
                  <span className="font-bold text-sm text-amber-700 block">Sistem Müdürü (Manager)</span>
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
                  <span className="font-bold text-sm text-rose-700 block">Finans Müdürü</span>
                  <span className="text-xs text-rose-500">Gelir raporları ve komisyon bakiyeleri</span>
                </div>
                <ArrowRight className="w-5 h-5 text-rose-600 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ) : (
            /* Manual Admin Login */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">E-posta Adresi</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@organiktarim.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password">Şifre</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Şifremi unuttum
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Yönetici Girişi'}
              </Button>
            </form>
          )}

          <div className="flex flex-col items-center gap-3 pt-2 text-sm border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setError('');
                setShowManualForm(!showManualForm);
              }}
              className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
            >
              {showManualForm ? '← Hızlı Giriş Seçeneklerini Göster' : 'E-posta ve Şifre ile Giriş Yap'}
            </button>
            <a href="/" className="text-slate-400 hover:text-slate-600 hover:underline text-xs">
              ← Siteye geri dön
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Şifremi Unuttum Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-purple-600" />
              Şifre Sıfırlama
            </DialogTitle>
            <DialogDescription>
              E-posta adresinizi girin. Şifre sıfırlama talimatlarını gönderelim.
            </DialogDescription>
          </DialogHeader>
          
          {!resetSent ? (
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-posta Adresi</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="admin@organiktarim.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForgotPassword(false)}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={isSendingReset}
                >
                  Gönder
                </Button>
              </div>
            </form>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-green-600">E-posta Gönderildi!</p>
                <p className="text-sm text-muted-foreground">
                  Yeni şifre bilgileri gönderildi.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSent(false);
                  setResetEmail('');
                }}
              >
                Tamam
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
