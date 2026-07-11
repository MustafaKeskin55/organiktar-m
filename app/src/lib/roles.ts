// Rol bazlı erişim kontrolü utility fonksiyonları

export type UserRole = 'super_admin' | 'manager' | 'finance' | 'producer' | 'consumer' | 'admin';

// Türkçe karakterleri İngilizce karakterlere çevir (Java backend uyumsuzluğu için)
function turkishToEnglish(str: string): string {
  return str
    .replace(/ı/g, 'i')  // ı -> i
    .replace(/İ/g, 'I')  // İ -> I
    .replace(/ş/g, 's')  // ş -> s
    .replace(/Ş/g, 'S')  // Ş -> S
    .replace(/ğ/g, 'g')  // ğ -> g
    .replace(/Ğ/g, 'G')  // Ğ -> G
    .replace(/ü/g, 'u')  // ü -> u
    .replace(/Ü/g, 'U')  // Ü -> U
    .replace(/ö/g, 'o')  // ö -> o
    .replace(/Ö/g, 'O')  // Ö -> O
    .replace(/ç/g, 'c')  // ç -> c
    .replace(/Ç/g, 'C'); // Ç -> C
}

// Kullanıcının rolünü normalize et (büyük/küçük harf ve Türkçe karakter farkını kaldır)
export function normalizeRole(role: string | undefined): UserRole | null {
  if (!role) return null;
  // Önce Türkçe karakterleri İngilizce'ye çevir, sonra lowercase yap
  const normalized = turkishToEnglish(role).toLowerCase().trim();
  
  // Eski 'admin' değerlerini 'super_admin' olarak kabul et
  if (normalized === 'admin' || normalized === 'super_admin') return 'super_admin';
  if (normalized === 'manager') return 'manager';
  if (normalized === 'finance') return 'finance';
  if (normalized === 'producer') return 'producer';
  if (normalized === 'consumer') return 'consumer';
  
  return null;
}

// Kullanıcı admin mi? (3 admin tipinden biri)
export function isAdmin(role: string | undefined): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'super_admin' || normalized === 'manager' || normalized === 'finance';
}

// Tam yetkili super admin mi?
export function isSuperAdmin(role: string | undefined): boolean {
  return normalizeRole(role) === 'super_admin';
}

// Sadece okuma yetkili manager mi?
export function isManager(role: string | undefined): boolean {
  return normalizeRole(role) === 'manager';
}

// Maliyeci mi?
export function isFinance(role: string | undefined): boolean {
  return normalizeRole(role) === 'finance';
}

// Yazma/Değiştirme yetkisi var mı?
export function canWrite(role: string | undefined): boolean {
  const normalized = normalizeRole(role);
  // Sadece super_admin yazma yetkisine sahip
  return normalized === 'super_admin';
}

// Silme yetkisi var mı?
export function canDelete(role: string | undefined): boolean {
  const normalized = normalizeRole(role);
  // Sadece super_admin silebilir
  return normalized === 'super_admin';
}

// Okuma yetkisi var mı? (Tüm adminler okuyabilir)
export function canRead(role: string | undefined): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'super_admin' || normalized === 'manager' || normalized === 'finance' || 
         normalized === 'producer' || normalized === 'consumer';
}

// Mali verileri görme yetkisi var mı? (super_admin + finance)
export function canViewFinancial(role: string | undefined): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'super_admin' || normalized === 'finance';
}

// Kullanıcı yönetimi yetkisi var mı?
export function canManageUsers(role: string | undefined): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'super_admin';
}

// Rolün Türkçe karşılığı
export function getRoleLabel(role: string | undefined): string {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case 'super_admin': return 'Site Yöneticisi';
    case 'manager': return 'Müdür (Okuma)';
    case 'finance': return 'Maliyeci';
    case 'producer': return 'Üretici';
    case 'consumer': return 'Tüketici';
    default: return 'Bilinmeyen';
  }
}

// Rolün yetki açıklaması
export function getRoleDescription(role: string | undefined): string {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case 'super_admin': 
      return 'Tam yetki: Kullanıcı yönetimi, ürün onaylama, sipariş yönetimi, silme işlemleri';
    case 'manager': 
      return 'Sadece okuma: Tüm verileri görüntüleyebilir, işlem yapamaz';
    case 'finance': 
      return 'Maliyeci: Mali kayıtlar, siparişler, ürün fiyatları görüntüleme (işlem yapamaz)';
    case 'producer': 
      return 'Üretici: Kendi ürünlerini yönetir, siparişleri görür';
    case 'consumer': 
      return 'Tüketici: Ürün satın alma, sipariş takibi';
    default: 
      return '';
  }
}
