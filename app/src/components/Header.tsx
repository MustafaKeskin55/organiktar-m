import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, MapPin, LogOut, Store, Package, Heart, Plus, Shield, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useAppStore } from '@/store/appStore';
import { isAdmin, getRoleLabel } from '@/lib/roles';
import { RoleSwitcher } from './RoleSwitcher';
import webLogo from '@/logo/web-logo.png';

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { searchQuery, setSearchQuery } = useAppStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/urunler');
    setIsSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Ürünler', href: '/urunler' },
    { name: 'Üreticiler', href: '/ureticiler' },
    { name: 'Abonelik', href: '/abonelik' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Web Logo - Navbar */}
          <Link to="/" className="flex items-center">
            <img 
              src={webLogo} 
              alt="ÇiftçidenKapına" 
              className="h-24 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-600"><span class="text-lg font-bold text-white">Ç</span></div><span class="ml-2 hidden text-xl font-bold text-green-800 sm:inline">ÇiftçidenKapına</span>';
                }
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-green-600"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Ürün veya üretici ara..."
                  className="w-64 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart - Show for all users and guests */}
            <Link to="/sepet">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-medium text-white">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </Link>
            
            {/* Role Switcher - for dual role users */}
            {isAuthenticated && <RoleSwitcher />}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                    {user?.type === 'producer' && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full bg-green-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {/* Tüm yönetici rolleri için badge */}
                    {isAdmin(user?.type) && (
                      <Badge className="mt-1 bg-purple-100 text-purple-700 text-xs">
                        {getRoleLabel(user?.type)}
                      </Badge>
                    )}
                    {user?.type?.toLowerCase() === 'producer' && (
                      <Badge className="mt-1 bg-green-100 text-green-700 text-xs">Satıcı Hesabı</Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Admin Menu Items - 3 farklı yönetici rolü */}
                  {isAdmin(user?.type) && (
                    <>
                      <p className="px-2 py-1 text-xs font-semibold text-purple-600">YÖNETİM</p>
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-700">
                          {getRoleLabel(user?.type)} Paneli
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={() => navigate('/profil')}>
                    <User className="mr-2 h-4 w-4" />
                    Profilim
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profil')}>
                    <Package className="mr-2 h-4 w-4" />
                    Siparişlerim
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profil')}>
                    <Heart className="mr-2 h-4 w-4" />
                    Favorilerim
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profil')}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Adreslerim
                  </DropdownMenuItem>
                  
                  {/* Seller Menu Items - for producers or dual role users in producer mode */}
                  {(user?.type === 'producer') && (
                    <>
                      <DropdownMenuSeparator />
                      <p className="px-2 py-1 text-xs font-semibold text-gray-500">SATICI MENÜSÜ</p>
                      <DropdownMenuItem onClick={() => navigate('/satici-panel')}>
                        <Store className="mr-2 h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-700">Satıcı Paneli</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/urun-ekle')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Ürün Ekle
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/giris">
                <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                  Giriş Yap
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4">
                  {/* Mobile Logo */}
                  <div className="flex items-center justify-center border-b pb-4">
                    <img 
                      src={webLogo} 
                      alt="ÇiftçidenKapına" 
                      className="h-20 w-auto object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-lg font-bold text-green-800">Menü</span>';
                        }
                      }}
                    />
                  </div>
                  
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Ara..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>

                  {/* Mobile Nav Links */}
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </nav>

                  {isAuthenticated ? (
                    <div className="border-t pt-4">
                      <div className="mb-3 flex items-center gap-3 px-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <nav className="flex flex-col gap-1">
                        <Link
                          to="/profil"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <User className="h-4 w-4" />
                          Profilim
                        </Link>
                        <Link
                          to="/profil"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <Package className="h-4 w-4" />
                          Siparişlerim
                        </Link>
                        <Link
                          to="/profil"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <Heart className="h-4 w-4" />
                          Favorilerim
                        </Link>
                        
                        {/* Admin Mobile Menu - 3 farklı yönetici rolü */}
                        {isAdmin(user?.type) && (
                          <>
                            <div className="my-2 border-t border-purple-200" />
                            <p className="px-4 text-xs font-semibold text-purple-600">YÖNETİM</p>
                            <Link
                              to="/admin"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-purple-700 hover:bg-purple-50"
                            >
                              <Shield className="h-4 w-4" />
                              {getRoleLabel(user?.type)} Paneli
                            </Link>
                          </>
                        )}
                        
                        {user?.type === 'producer' && (
                          <>
                            <div className="my-2 border-t" />
                            <p className="px-4 text-xs font-semibold text-gray-500">SATICI MENÜSÜ</p>
                            <Link
                              to="/satici-panel"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-50"
                            >
                              <Store className="h-4 w-4" />
                              Satıcı Paneli
                            </Link>
                            <Link
                              to="/urun-ekle"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                              <Plus className="h-4 w-4" />
                              Yeni Ürün Ekle
                            </Link>
                          </>
                        )}
                        
                        <div className="my-2 border-t" />
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Çıkış Yap
                        </button>
                      </nav>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 pt-4">
                      <Link to="/giris" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          Giriş Yap
                        </Button>
                      </Link>
                      <Link to="/kayit" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Kayıt Ol
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="border-t py-3 md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Ürün veya üretici ara..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
