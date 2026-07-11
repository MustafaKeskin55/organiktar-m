import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ProductCard';
import { useAppStore } from '@/store/appStore';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function ProductsPage() {
  const { 
    products, 
    fetchProducts, 
    setSelectedCategory, 
    selectedCategory, 
    searchQuery, 
    setSearchQuery, 
    categories 
  } = useAppStore();
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || 
                         p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category?.toLowerCase() === selectedCategory?.toLowerCase();
    return matchesSearch && matchesCategory && p.isActive !== false;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Universal Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Page Title & Breadcrumb */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Organik Ürünler</h1>
          <p className="text-sm text-gray-500 mt-1">Yerel üreticilerimizden taze ve doğal lezzetler</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün veya üretici ara..."
                className="pl-10 h-11"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 ${showFilters ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Kategoriler
            </Button>
          </div>

          {/* Dynamic Category Filters */}
          {showFilters && (
            <div className="bg-white p-6 rounded-xl border shadow-sm transition-all animate-in fade-in-50 duration-200">
              <h3 className="font-semibold text-gray-800 mb-3">Tüm Kategoriler</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !selectedCategory
                      ? 'bg-green-600 text-white shadow-sm ring-2 ring-green-600 ring-offset-2'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tüm Ürünler
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat.slug
                        ? 'bg-green-600 text-white shadow-sm ring-2 ring-green-600 ring-offset-2'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm font-medium text-gray-500">
            Toplam <span className="text-gray-900 font-bold">{filteredProducts.length}</span> ürün listeleniyor
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed p-8 shadow-sm">
            <p className="text-gray-400 text-lg mb-2">Aradığınız kriterlere uygun ürün bulunamadı.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="mt-2"
            >
              Filtreleri Temizle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
