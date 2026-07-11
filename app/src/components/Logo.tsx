import { Leaf } from 'lucide-react';

interface LogoProps {
  variant?: 'web' | 'mobile';
  showText?: boolean;
  className?: string;
}

export function Logo({ variant = 'web', showText = true, className = '' }: LogoProps) {
  // Web logo - navbar için (daha büyük, metinli)
  if (variant === 'web') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        {showText && (
          <span className="text-xl font-bold text-green-800">
            ÇiftçidenKapına
          </span>
        )}
      </div>
    );
  }

  // Mobile logo - mobil menü için (kompakt, sadece ikon veya kısa)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
        <Leaf className="h-4 w-4 text-white" />
      </div>
      {showText && (
        <span className="text-lg font-bold text-green-800">
          ÇiftçidenKapına
        </span>
      )}
    </div>
  );
}

// Logo resim kullanmak isterseniz:
// 1. Web logo için: /public/logo-web.png (240x60px önerilir)
// 2. Mobile logo için: /public/logo-mobile.png (120x40px önerilir)

export function LogoImage({ variant = 'web', className = '' }: { variant?: 'web' | 'mobile'; className?: string }) {
  const src = variant === 'web' ? '/logo-web.png' : '/logo-mobile.png';
  const alt = 'ÇiftçidenKapına';
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`object-contain ${className}`}
      onError={(e) => {
        // Resim yoksa fallback olarak metin göster
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = '<span class="text-xl font-bold text-green-800">ÇiftçidenKapına</span>';
        }
      }}
    />
  );
}
