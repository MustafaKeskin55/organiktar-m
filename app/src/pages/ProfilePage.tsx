import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, ArrowLeft, Package, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Giriş yapmanız gerekiyor</p>
        <Link to="/login">
          <Button>Giriş Yap</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Ana Sayfa
          </Link>
          <h1 className="text-lg font-semibold">Profilim</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${activeTab === 'profile' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'}`}
            >
              <User className="w-5 h-5" /> Profilim
            </button>
            <Link to="/orders">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100">
                <Package className="w-5 h-5" /> Siparişlerim
              </button>
            </Link>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${activeTab === 'addresses' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'}`}
            >
              <MapPin className="w-5 h-5" /> Adreslerim
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100">
              <Heart className="w-5 h-5" /> Favorilerim
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100">
              <Settings className="w-5 h-5" /> Ayarlar
            </button>
            <Button variant="outline" className="w-full mt-4" onClick={logout}>
              Çıkış Yap
            </Button>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Kişisel Bilgiler</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-700">{user.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{user.type}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ad Soyad</label>
                    <Input value={user.name} readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-medium">E-posta</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <Input value={user.email} readOnly />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefon</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <Input value={user.phone || '-'} readOnly />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Kayıtlı Adreslerim</h2>
                  <Button size="sm">Yeni Adres Ekle</Button>
                </div>
                {user.addresses?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Henüz kayıtlı adresiniz yok</p>
                ) : (
                  <div className="space-y-4">
                    {user.addresses?.map((addr) => (
                      <div key={addr.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{addr.title}</p>
                            <p className="text-sm text-gray-500">{addr.fullAddress}</p>
                            <p className="text-sm text-gray-500">{addr.district}, {addr.city}</p>
                          </div>
                          {addr.isDefault && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Varsayılan</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
