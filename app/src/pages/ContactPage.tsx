import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Universal Header */}
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">İletişim</h1>
          <p className="text-lg text-gray-600">Bize ulaşın, size yardımcı olalım</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">E-posta</h3>
                <p className="text-gray-600">info@organiktarm.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Telefon</h3>
                <p className="text-gray-600">+90 555 123 4567</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Adres</h3>
                <p className="text-gray-600">İstanbul, Türkiye</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Bize Yazın</h2>
            {sent ? (
              <div className="bg-green-100 text-green-700 p-4 rounded-lg">
                Mesajınız gönderildi! En kısa sürede dönüş yapacağız.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Adınız"
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
                <textarea
                  placeholder="Mesajınız"
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  className="w-full p-3 border rounded-lg min-h-[120px]"
                  required
                />
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" />
                  Gönder
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
