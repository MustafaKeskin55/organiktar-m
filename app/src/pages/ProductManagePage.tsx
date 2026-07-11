import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  X,
  Check,
  Leaf,
  Sun,
  ImageIcon,
  Save,
  Loader2,
  Trash2,
  Camera,
  Upload,
  FileImage,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { productApi, categoryApi, toast } from '@/lib/api';
import type { Product, ProductCategory, Category } from '@/types';

const units = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'gr', label: 'Gram (gr)' },
  { value: 'adet', label: 'Adet' },
  { value: 'litre', label: 'Litre (L)' },
  { value: 'demet', label: 'Demet' },
  { value: 'koli', label: 'Koli' },
  { value: 'paket', label: 'Paket' },
];

export function ProductManagePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  
  const isEditing = !!id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'images'>('basic');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as ProductCategory | '',
    price: '',
    unit: 'kg',
    stock: '',
    images: [] as string[],
    isOrganic: false,
    isSeasonal: false,
    harvestDate: '',
  });
  
  const [imageUrl, setImageUrl] = useState('');

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoryApi.getAll();
      const cats = Array.isArray(response) ? response : (response.data || []);
      setCategories(cats);
    } catch (error) {
      console.error('Kategoriler yuklenirken hata:', error);
      toast.error('Kategoriler yuklenemedi');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load existing product data when editing
  useEffect(() => {
    if (isEditing && id) {
      loadProduct(parseInt(id));
    }
  }, [isEditing, id]);

  const loadProduct = async (productId: number) => {
    try {
      setIsLoading(true);
      const response = await productApi.getById(productId);
      const product = response.data;
      
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category as ProductCategory,
        price: product.price.toString(),
        unit: product.unit,
        stock: product.stock.toString(),
        images: product.images || [],
        isOrganic: product.isOrganic || false,
        isSeasonal: product.isSeasonal || false,
        harvestDate: product.harvestDate || '',
      });
    } catch (error) {
      toast.error('Ürün bilgileri yüklenemedi');
      navigate('/satici-panel');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth check
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/giris');
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Dosyayı base64'e çevir
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Dosya işleme fonksiyonu
  const processFiles = async (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      toast.error('Lütfen geçerli bir resim dosyası seçin (JPG, PNG, GIF)');
      return;
    }

    setUploadProgress(0);
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      
      // Dosya boyutu kontrolü (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} dosyası çok büyük (max 5MB)`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, base64],
        }));
        setUploadProgress(((i + 1) / imageFiles.length) * 100);
      } catch (error) {
        toast.error(`${file.name} yüklenirken hata oluştu`);
      }
    }
    
    setUploadProgress(null);
    toast.success(`${imageFiles.length} görsel başarıyla eklendi`);
  };

  // Sürükle bırak event handler'ları
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  // Dosya seçme input'u handler'ı
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // URL ile görsel ekleme
  const addImage = () => {
    if (imageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()],
      }));
      setImageUrl('');
      toast.success('Resim eklendi');
    }
  };

  // Görsel silme
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    toast.success('Resim kaldırıldı');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Ürün adı zorunludur');
      setActiveTab('basic');
      return false;
    }
    if (!formData.category) {
      toast.error('Kategori seçimi zorunludur');
      setActiveTab('basic');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Geçerli bir fiyat giriniz');
      setActiveTab('basic');
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error('Geçerli bir stok miktarı giriniz');
      setActiveTab('basic');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user?.id) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    try {
      setIsSaving(true);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock: parseInt(formData.stock),
        images: formData.images,
        isOrganic: formData.isOrganic,
        isSeasonal: formData.isSeasonal,
        harvestDate: formData.harvestDate || null,
      };

      if (isEditing && id) {
        await productApi.update(parseInt(id), productData);
        toast.success('Ürün başarıyla güncellendi!');
      } else {
        await productApi.create(productData, parseInt(user.id));
        toast.success('Ürün başarıyla eklendi!');
      }
      
      navigate('/satici-panel');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !id) return;
    
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        setIsSaving(true);
        await productApi.delete(parseInt(id));
        toast.success('Ürün silindi');
        navigate('/satici-panel');
      } catch (error) {
        toast.error('Ürün silinemedi');
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4 -ml-4 text-gray-600"
              onClick={() => navigate('/satici-panel')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Satıcı Paneline Dön
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                </h1>
                <p className="mt-2 text-gray-600">
                  {isEditing 
                    ? 'Ürün bilgilerini güncelleyin' 
                    : 'Çiftliğinizden yeni bir ürün ekleyin'}
                </p>
              </div>
              
              <div className="flex gap-3">
                {isEditing && (
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSaving}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </Button>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditing ? 'Güncelle' : 'Kaydet'}
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Tabs */}
          <div className="mb-8">
            <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              {[
                { id: 'basic', label: 'Temel Bilgiler', icon: Check },
                { id: 'details', label: 'Detaylar', icon: Leaf },
                { id: 'images', label: 'Görseller', icon: ImageIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-green-700 shadow'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      Temel Bilgiler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Product Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Ürün Adı <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Örn: Organik Domates"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="h-12"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label>
                        Kategori <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                        disabled={categoriesLoading}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={categoriesLoading ? 'Kategoriler yukleniyor...' : 'Kategori secin'} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.slug} value={cat.slug}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Category Quick Select */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {categories.map((cat) => (
                          <button
                            key={cat.slug}
                            onClick={() => handleInputChange('category', cat.slug)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              formData.category === cat.slug
                                ? 'bg-green-100 text-green-700 ring-2 ring-green-500 ring-offset-1'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price and Unit */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="price">
                          Fiyat (₺) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Birim</Label>
                        <Select
                          value={formData.unit}
                          onValueChange={(value) => handleInputChange('unit', value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((u) => (
                              <SelectItem key={u.value} value={u.value}>
                                {u.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="space-y-2">
                      <Label htmlFor="stock">
                        Stok Miktarı <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.stock}
                        onChange={(e) => handleInputChange('stock', e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      Ürün Detayları
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Ürün Açıklaması</Label>
                      <Textarea
                        id="description"
                        placeholder="Ürününüz hakkında detaylı bilgi verin..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="min-h-[150px] resize-none"
                      />
                      <p className="text-xs text-gray-500">
                        {formData.description.length}/500 karakter
                      </p>
                    </div>

                    <Separator />

                    {/* Toggles */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Özellikler</h4>
                      
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-green-100 p-2">
                            <Leaf className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Organik Ürün</p>
                            <p className="text-sm text-gray-500">Kimyasal içermez</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.isOrganic}
                          onCheckedChange={(checked) => handleInputChange('isOrganic', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-orange-100 p-2">
                            <Sun className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">Mevsim Ürünü</p>
                            <p className="text-sm text-gray-500">Mevsiminde hasat edildi</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.isSeasonal}
                          onCheckedChange={(checked) => handleInputChange('isSeasonal', checked)}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Harvest Date */}
                    <div className="space-y-2">
                      <Label htmlFor="harvestDate">Hasat Tarihi</Label>
                      <Input
                        id="harvestDate"
                        type="date"
                        value={formData.harvestDate}
                        onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-green-600" />
                      Ürün Görselleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Sürükle Bırak Alanı */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative rounded-xl border-2 border-dashed p-8 transition-all ${
                        isDragging
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                      <div className="text-center">
                        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
                          isDragging ? 'bg-green-100' : 'bg-white'
                        }`}>
                          <Upload className={`h-8 w-8 transition-colors ${
                            isDragging ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {isDragging ? 'Görselleri Buraya Bırakın' : 'Görsel Yükleyin'}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Sürükle bırak yapın veya seçmek için tıklayın
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          JPG, PNG, GIF • Max 5MB • Çoklu seçim yapabilirsiniz
                        </p>
                      </div>
                    </div>

                    {/* Yükleme Progress Bar */}
                    {uploadProgress !== null && (
                      <div className="rounded-lg bg-blue-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">Yükleniyor...</span>
                          <span className="text-sm text-blue-700">{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-blue-200">
                          <div 
                            className="h-2 rounded-full bg-blue-600 transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Veya URL ile Ekle */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-500">veya URL ile Ekle</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="h-12"
                        />
                        <Button
                          type="button"
                          onClick={addImage}
                          variant="outline"
                          className="h-12 px-4"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Image Grid */}
                    {formData.images.length > 0 && (
                      <div>
                        <h4 className="mb-4 font-medium text-gray-900">
                          Yüklenen Görseller ({formData.images.length})
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {formData.images.map((url, index) => (
                            <div
                              key={index}
                              className="group relative aspect-square overflow-hidden rounded-xl border bg-gray-100"
                            >
                              <img
                                src={url}
                                alt={`Ürün görseli ${index + 1}`}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              {index === 0 && (
                                <Badge className="absolute left-2 top-2 bg-green-600">
                                  Ana Görsel
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {formData.images.length === 0 && !uploadProgress && (
                      <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900">Henüz görsel eklenmedi</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Ürününüzü daha çekici hale getirmek için görseller ekleyin
                        </p>
                      </div>
                    )}

                    {/* Tips */}
                    <div className="rounded-lg bg-blue-50 p-4">
                      <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-900">
                        <FileImage className="h-4 w-4" />
                        İpuçları
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-800">
                        <li>• En az 1 görsel ekleyin (zorunlu değil ama önerilir)</li>
                        <li>• İlk eklediğiniz görsel ana görsel olarak kullanılacak</li>
                        <li>• Net ve aydınlık fotoğraflar tercih edin</li>
                        <li>• Ürünü farklı açılardan gösteren görseller ekleyin</li>
                        <li>• Max 5MB, JPG/PNG/GIF formatları desteklenir</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Önizleme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border bg-white overflow-hidden">
                    {/* Image Preview */}
                    <div className="aspect-square bg-gray-100 relative">
                      {formData.images.length > 0 ? (
                        <img
                          src={formData.images[0]}
                          alt="Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute left-2 top-2 flex flex-col gap-1">
                        {formData.isOrganic && (
                          <Badge className="bg-green-600">
                            <Leaf className="mr-1 h-3 w-3" />
                            Organik
                          </Badge>
                        )}
                        {formData.isSeasonal && (
                          <Badge className="bg-orange-500">
                            <Sun className="mr-1 h-3 w-3" />
                            Mevsim
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Info Preview */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {formData.name || 'Ürün Adı'}
                      </h3>
                      
                      {formData.category && (
                        <p className="mt-1 text-sm text-gray-500">
                          {categories.find(c => c.slug === formData.category)?.name}
                        </p>
                      )}
                      
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-green-600">
                          {formData.price ? `₺${parseFloat(formData.price).toFixed(2)}` : '₺0.00'}
                        </span>
                        <span className="text-sm text-gray-500">/ {formData.unit}</span>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500">
                        Stok: {formData.stock || 0} {formData.unit}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Görsel Sayısı</span>
                      <span className="font-medium">{formData.images.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Kategori</span>
                      <span className="font-medium">
                        {formData.category 
                          ? categories.find(c => c.slug === formData.category)?.name 
                          : 'Seçilmedi'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Organik</span>
                      <span className="font-medium">{formData.isOrganic ? 'Evet' : 'Hayır'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
