import { Link } from 'react-router-dom';
import { Leaf, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import webLogo from '@/logo/web-logo.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Hakkımızda', href: '/hakkimizda' },
      { name: 'Nasıl Çalışır?', href: '/nasil-calisir' },
      { name: 'Üretici Ol', href: '/uretici-ol' },
      { name: 'Blog', href: '/blog' },
    ],
    destek: [
      { name: 'SSS', href: '/sss' },
      { name: 'İletişim', href: '/iletisim' },
      { name: 'Kargo Takibi', href: '/kargo-takibi' },
      { name: 'İade Politikası', href: '/iade' },
    ],
    yasal: [
      { name: 'Kullanım Koşulları', href: '/kullanim-kosullari' },
      { name: 'Gizlilik Politikası', href: '/gizlilik' },
      { name: 'Çerez Politikası', href: '/cerezler' },
    ],
  };

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-20 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img 
                src={webLogo} 
                alt="ÇiftçidenKapına" 
                className="h-32 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="flex items-center gap-2"><div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-600"><span class="text-lg font-bold text-white">Ç</span></div><span class="text-xl font-bold text-green-800">ÇiftçidenKapına</span></div>';
                  }
                }}
              />
            </Link>
            <p className="text-sm text-gray-600">
              Yerel üreticileri doğrudan tüketicilerle buluşturan,
              sürdürülebilir bir gıda platformu.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-green-600 hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-green-600 hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-green-600 hover:text-white"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Platform
            </h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-green-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destek */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Destek
            </h3>
            <ul className="space-y-2">
              {footerLinks.destek.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-green-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              İletişim
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  Kadıköy, İstanbul, Türkiye
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                <a
                  href="tel:+902121234567"
                  className="text-sm text-gray-600 transition-colors hover:text-green-600"
                >
                  0212 123 45 67
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-600" />
                <a
                  href="mailto:info@ciftcidenkapina.com"
                  className="text-sm text-gray-600 transition-colors hover:text-green-600"
                >
                  info@ciftcidenkapina.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">
              {currentYear} ÇiftçidenKapına. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6">
              {footerLinks.yasal.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-xs text-gray-500 transition-colors hover:text-green-600"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
