import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userApi } from '@/lib/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);
    try {
      await userApi.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt olurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4">
        <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Ana Sayfa
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-green-700">Organik Tarım</h1>
            <p className="text-gray-500 mt-2">Yeni hesap oluşturun</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Ad Soyad"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              required
            />
            <Input
              type="email"
              placeholder="E-posta"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
            />
            <Input
              placeholder="Telefon"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
            />
            <Input
              type="password"
              placeholder="Şifre"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required
            />
            <Input
              type="password"
              placeholder="Şifre Tekrar"
              value={form.confirmPassword}
              onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
              required
            />

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? 'Kaydediliyor...' : 'Kaydol'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
