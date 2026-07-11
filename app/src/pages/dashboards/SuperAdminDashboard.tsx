import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, DollarSign, 
  Settings, LogOut, Search, Plus, Edit2, Trash2, 
  CheckCircle, XCircle, Image as ImageIcon, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import type { Product } from '@/types';

// Category options
const CATEGORIES = [
  { value: 'SEBZE', label: 'Sebze' },
  { value: 'MEYVE', label: 'Meyve' },
  { value: 'BAKLIYAT', label: 'Bakliyat' },
  { value: 'SUT', label: 'Süt Ürünleri' },
  { value: 'ET', label: 'Et Ürünleri' },
  { value: 'ZEYTINYAGI', label: 'Zeytinyağı' },
  { value: 'BAL', label: 'Bal' },
  { value: 'BAHARAT', label: 'Baharat' },
  { value: 'DIGER', label: 'Diğer' },
];

// Unit options
const UNITS = ['kg', 'gr', 'lt', 'ml', 'adet', 'paket', 'kasa'];

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { 
    products, 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    toggleProductActive,
    isLoading 
  } = useAppStore();

  const [activeMenu, setActiveMenu] = useState<'products' | 'orders' | 'users' | 'dashboard'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    unit: 'kg',
    category: 'SEBZE',
    isOrganic: false,
    isSeasonal: false,
    images: [] as string[],
    producerId: '1',
  });
  const [imageUrl, setImageUrl] = useState('');

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.producerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open edit dialog
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      unit: product.unit || 'kg',
      category: product.category || 'SEBZE',
      isOrganic: product.isOrganic || false,
      isSeasonal: product.isSeasonal || false,
      images: product.images || [],
      producerId: String(product.producerId || '1'),
    });
    setShowProductDialog(true);
  };

  // Open create dialog
  const openCreateDialog = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      unit: 'kg',
      category: 'SEBZE',
      isOrganic: false,
      isSeasonal: false,
      images: [],
      producerId: '1',
    });
    setShowProductDialog(true);
  };

  // Save product (create or update)
  const handleSave = async () => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: productForm.name,
          description: productForm.description,
          price: productForm.price,
          stock: productForm.stock,
          unit: productForm.unit,
          category: productForm.category as any,
          isOrganic: productForm.isOrganic,
          isSeasonal: productForm.isSeasonal,
          images: productForm.images,
        });
      } else {
        await createProduct({
          name: productForm.name,
          description: productForm.description,
          price: productForm.price,
          stock: productForm.stock,
          unit: productForm.unit,
          category: productForm.category as any,
          isOrganic: productForm.isOrganic,
          isSeasonal: productForm.isSeasonal,
          images: productForm.images,
        }, parseInt(productForm.producerId));
      }
      setShowProductDialog(false);
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme hatası: ' + (error as Error).message);
    }
  };

  // Delete product
  const handleDelete = async (product: Product) => {
    if (!confirm(`"${product.name}" ürününü silmek istediğinize emin misiniz?`)) return;
    try {
      await deleteProduct(product.id);
      fetchProducts();
    } catch (error) {
      alert('Silme hatası: ' + (error as Error).message);
    }
  };

  // Toggle active status
  const handleToggleActive = async (product: Product) => {
    try {
      await toggleProductActive(product.id, !product.isActive);
      fetchProducts();
    } catch (error) {
      alert('Durum değiştirme hatası: ' + (error as Error).message);
    }
  };

  // Add image URL
  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, imageUrl.trim()]
    }));
    setImageUrl('');
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Get image URL helper
  const getImageUrl = (path: string) => {
    if (!path) return '/placeholder-product.png';
    if (path.startsWith('http')) return path;
    return `/uploads/${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-green-700">Organik Tarım</h1>
          <p className="text-sm text-gray-500">Super Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeMenu === 'dashboard' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveMenu('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeMenu === 'products' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5" />
            Ürünler
          </button>
          
          <button
            onClick={() => setActiveMenu('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeMenu === 'orders' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Siparişler
          </button>
          
          <button
            onClick={() => setActiveMenu('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeMenu === 'users' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            Kullanıcılar
          </button>
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700 font-medium">{user?.name?.charAt(0) || 'S'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Super Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-2" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Products Section */}
          {activeMenu === 'products' && (
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Ürün Yönetimi</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Tüm ürünleri yönetin ve düzenleyin</p>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ürün ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                    <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Ürün
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Yükleniyor...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <div 
                          key={product.id} 
                          className={`bg-white rounded-lg border overflow-hidden ${!product.isActive ? 'opacity-60' : ''}`}
                        >
                          {/* Product Image */}
                          <div className="relative aspect-square bg-gray-100">
                            <img
                              src={getImageUrl(product.images?.[0])}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-product.png';
                              }}
                            />
                            {!product.isActive && (
                              <Badge className="absolute top-2 left-2 bg-gray-500">Pasif</Badge>
                            )}
                            {product.isOrganic && (
                              <Badge className="absolute top-2 right-2 bg-green-600">Organik</Badge>
                            )}
                          </div>
                          
                          {/* Product Info */}
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold">{product.name}</h3>
                                <p className="text-sm text-gray-500">{product.producerName}</p>
                                <p className="text-lg font-bold text-green-700 mt-2">
                                  ₺{product.price} <span className="text-sm font-normal text-gray-500">/ {product.unit}</span>
                                </p>
                                <p className="text-sm text-gray-500">Stok: {product.stock}</p>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openEditDialog(product)}
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Düzenle
                              </Button>
                              <Button 
                                variant={product.isActive ? "destructive" : "outline"}
                                size="sm"
                                onClick={() => handleToggleActive(product)}
                              >
                                {product.isActive ? (
                                  <><XCircle className="w-4 h-4 mr-1" /> Pasif</>
                                ) : (
                                  <><CheckCircle className="w-4 h-4 mr-1" /> Aktif</>
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(product)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other sections placeholder */}
          {activeMenu !== 'products' && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Bu bölüm yapım aşamasında
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Product Edit/Create Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
            <DialogDescription>
              Ürün bilgilerini girin ve kaydedin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Ürün Adı *</label>
                <Input 
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="Örn: Organik Domates"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kategori *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Fiyat (₺) *</label>
                <Input 
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stok *</label>
                <Input 
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Birim *</label>
                <select
                  value={productForm.unit}
                  onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Açıklama</label>
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                className="w-full p-2 border rounded-lg min-h-[80px]"
                placeholder="Ürün açıklaması..."
              />
            </div>

            {/* Checkboxes */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.isOrganic}
                  onChange={(e) => setProductForm({...productForm, isOrganic: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">Organik Ürün</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.isSeasonal}
                  onChange={(e) => setProductForm({...productForm, isSeasonal: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">Sezonluk Ürün</span>
              </label>
            </div>

            {/* Images */}
            <div>
              <label className="text-sm font-medium">Ürün Görselleri</label>
              <div className="flex gap-2 mt-2">
                <Input 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Görsel URL'si girin..."
                />
                <Button type="button" onClick={handleAddImage} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Image Preview */}
              {productForm.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {productForm.images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImageUrl(img)}
                        alt={`Ürün ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.png';
                        }}
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
              disabled={!productForm.name || productForm.price <= 0}
            >
              {editingProduct ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
