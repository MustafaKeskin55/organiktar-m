import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Leaf, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userApi } from '@/lib/api';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await userApi.forgotPassword(email);
      setIsSuccess(true);
      toast.success('Geçici şifre e-posta adresinize gönderildi!');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-gradient-to-br from-green-600 to-green-700 p-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <Leaf className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-xl font-bold text-white">ÇiftçidenKapına</span>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white">
            Yerel üreticilerden doğrudan kapınıza
          </h2>
          <p className="text-lg text-green-100">
            Taze, organik ürünleri aracısız alın. Hem üreticiyi destekleyin, 
            hem sağlıklı beslenin.
          </p>
          <div className="flex gap-4">
            <div className="rounded-lg bg-white/10 p-4">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-green-100">Yerel Üretici</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-sm text-green-100">Mutlu Müşteri</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-green-200">
          © 2024 ÇiftçidenKapına. Tüm hakları saklıdır.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate('/giris')}
            className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Giriş sayfasına dön
          </button>

          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-green-800">ÇiftçidenKapına</span>
          </div>

          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                E-posta Gönderildi!
              </h1>
              <p className="text-gray-600 mb-6">
                <strong>{email}</strong> adresine geçici bir şifre gönderdik. 
                Lütfen gelen kutunuzu kontrol edin ve gelen şifre ile giriş yapın.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/giris')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Giriş Sayfasına Git
                </Button>
                <p className="text-sm text-gray-500">
                  E-posta gelmedi mi? Spam klasörünü kontrol edin veya{' '}
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="text-green-600 hover:underline"
                  >
                    tekrar deneyin
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Şifremi Unuttum</h1>
                <p className="mt-2 text-gray-600">
                  E-posta adresinizi girin, size geçici bir şifre gönderelim.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta Adresi</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Gönderiliyor...' : 'Geçici Şifre Gönder'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Şifrenizi hatırladınız mı?{' '}
                  <Link to="/giris" className="font-medium text-green-600 hover:underline">
                    Giriş yapın
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}