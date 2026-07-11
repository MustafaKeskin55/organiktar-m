import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';

export function RoleSwitcher() {
  const navigate = useNavigate();
  const { user, currentRole, switchRole, hasMultipleRoles } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!user) return null;
  
  // Admin kullanıcı için ayrı gösterim - gizli URL
  if (user.type === 'admin') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-purple-700 hover:bg-purple-50"
        onClick={() => navigate('/yonetim-sistemi')}
      >
        <Shield className="h-4 w-4" />
        <span className="hidden sm:inline">Yönetim</span>
      </Button>
    );
  }
  
  // Çift rol kontrolü - mehmet@example.com hem satıcı hem alıcı
  const canSwitchRole = hasMultipleRoles();
  
  if (!canSwitchRole) {
    // Tek rol kullanıcısı için profil/satici linki
    if (user.type === 'producer') {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-green-700 hover:bg-green-50"
          onClick={() => navigate('/satici-panel')}
        >
          <Store className="h-4 w-4" />
          <span className="hidden sm:inline">Satıcı Paneli</span>
        </Button>
      );
    }
    return null;
  }
  
  // Çift rol kullanıcısı için rol değiştirme
  const handleRoleSwitch = (role: 'consumer' | 'producer') => {
    switchRole(role);
    setIsOpen(false);
    
    // Rol değişimine göre yönlendirme
    if (role === 'producer') {
      navigate('/satici-panel');
    } else {
      navigate('/');
    }
  };
  
  const getRoleIcon = () => {
    switch (currentRole) {
      case 'producer':
        return <Store className="h-4 w-4 text-green-600" />;
      case 'consumer':
        return <ShoppingBag className="h-4 w-4 text-blue-600" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };
  
  const getRoleLabel = () => {
    switch (currentRole) {
      case 'producer':
        return 'Satıcı Modu';
      case 'consumer':
        return 'Alıcı Modu';
      default:
        return 'Mod Seç';
    }
  };
  
  const getRoleBadgeColor = () => {
    switch (currentRole) {
      case 'producer':
        return 'bg-green-100 text-green-700';
      case 'consumer':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${getRoleBadgeColor()}`}
        >
          {getRoleIcon()}
          <span className="hidden sm:inline">{getRoleLabel()}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-gray-500">HESAP MODU</p>
          <p className="text-sm">{user.name}</p>
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleRoleSwitch('consumer')}
          className={`cursor-pointer ${currentRole === 'consumer' ? 'bg-blue-50' : ''}`}
        >
          <ShoppingBag className={`mr-2 h-4 w-4 ${currentRole === 'consumer' ? 'text-blue-600' : ''}`} />
          <div className="flex-1">
            <p className={currentRole === 'consumer' ? 'font-medium text-blue-700' : ''}>Alıcı Modu</p>
            <p className="text-xs text-gray-500">Ürünleri incele ve satın al</p>
          </div>
          {currentRole === 'consumer' && (
            <div className="h-2 w-2 rounded-full bg-blue-600" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleRoleSwitch('producer')}
          className={`cursor-pointer ${currentRole === 'producer' ? 'bg-green-50' : ''}`}
        >
          <Store className={`mr-2 h-4 w-4 ${currentRole === 'producer' ? 'text-green-600' : ''}`} />
          <div className="flex-1">
            <p className={currentRole === 'producer' ? 'font-medium text-green-700' : ''}>Satıcı Modu</p>
            <p className="text-xs text-gray-500">Ürünlerini yönet ve satış yap</p>
          </div>
          {currentRole === 'producer' && (
            <div className="h-2 w-2 rounded-full bg-green-600" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-3 py-2 text-xs text-gray-500">
          <p>Mod değiştirerek farklı özelliklere erişebilirsiniz.</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
