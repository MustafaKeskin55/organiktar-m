import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/lib/api';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, needsPasswordChange, changePassword, logout } = useAuthStore();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // If user doesn't need password change, redirect to home
  if (!needsPasswordChange && !user?.forcePasswordChange) {
    navigate('/');
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Tüm alanları doldurun');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalı');
      return;
    }
    
    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Şifreniz başarıyla değiştirildi!');
      
      // Show success and redirect after a delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Şifre değiştirme başarısız');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Şifre Değiştirme Zorunlu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p className="font-medium mb-1">Geçici şifre ile giriş yaptınız.</p>
            <p>Güvenliğiniz için lütfen yeni bir şifre belirleyin.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mevcut Şifre (Geçici Şifre)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Geçici şifrenizi girin"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yeni Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Yeni şifrenizi girin"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Yeni şifrenizi tekrar girin"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Değiştiriliyor...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Şifreyi Değiştir
                </span>
              )}
            </Button>
          </form>
          
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full text-gray-500"
              onClick={() => {
                logout();
                navigate('/giris');
              }}
            >
              Çıkış Yap
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
