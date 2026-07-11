import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';

// Pages
import { HomePage } from '@/pages/HomePage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OrdersPage } from '@/pages/OrdersPage';
import { ProducersPage } from '@/pages/ProducersPage';
import { ProducerDetailPage } from '@/pages/ProducerDetailPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { SubscriptionPage } from '@/pages/SubscriptionPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ChangePasswordPage } from '@/pages/ChangePasswordPage';

// Pages additional
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { SellerDashboardPage } from '@/pages/SellerDashboardPage';
import { ProductManagePage } from '@/pages/ProductManagePage';

// Dashboards
import { SuperAdminDashboard } from '@/pages/dashboards/SuperAdminDashboard';
import { ManagerDashboard } from '@/pages/dashboards/ManagerDashboard';
import { FinanceDashboard } from '@/pages/dashboards/FinanceDashboard';
import { ProducerDashboard } from '@/pages/dashboards/ProducerDashboard';
import { ConsumerDashboard } from '@/pages/dashboards/ConsumerDashboard';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated, user, initialize } = useAuthStore();
  const { fetchProducts, fetchCategories } = useAppStore();

  // Check auth and fetch data on mount
  useEffect(() => {
    initialize();
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/urunler" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/producers" element={<ProducersPage />} />
          <Route path="/ureticiler" element={<ProducersPage />} />
          <Route path="/producer/:id" element={<ProducerDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/abonelik" element={<SubscriptionPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/giris" element={<LoginPage />} />
          <Route path="/admin/giris" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/sifremi-unuttum" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/sifre-degistir" element={<ChangePasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          
          {/* Protected Routes */}
          <Route path="/checkout" element={
            isAuthenticated ? <CheckoutPage /> : <Navigate to="/giris" />
          } />
          <Route path="/profile" element={
            isAuthenticated ? <ProfilePage /> : <Navigate to="/giris" />
          } />
          <Route path="/profil" element={
            isAuthenticated ? <ProfilePage /> : <Navigate to="/giris" />
          } />
          <Route path="/sepet" element={<CartPage />} />
          <Route path="/orders" element={
            isAuthenticated ? <OrdersPage /> : <Navigate to="/giris" />
          } />
          
          {/* Seller / Producer Routes */}
          <Route path="/satici-panel" element={
            isAuthenticated && user?.type?.toLowerCase() === 'producer' ?
              <SellerDashboardPage /> :
              <Navigate to="/giris" />
          } />
          <Route path="/urun-ekle" element={
            isAuthenticated && user?.type?.toLowerCase() === 'producer' ?
              <ProductManagePage /> :
              <Navigate to="/giris" />
          } />
          <Route path="/urun-duzenle/:id" element={
            isAuthenticated && user?.type?.toLowerCase() === 'producer' ?
              <ProductManagePage /> :
              <Navigate to="/giris" />
          } />

          {/* Admin Dashboards */}
          <Route path="/admin" element={
            isAuthenticated && ['SUPER_ADMIN', 'MANAGER', 'FINANCE'].includes(user?.type?.toUpperCase() || '') ?
              <AdminDashboardPage /> :
              <Navigate to="/admin/giris" />
          } />
          <Route path="/dashboard/super-admin" element={
            isAuthenticated && user?.type?.toUpperCase() === 'SUPER_ADMIN' ? 
              <SuperAdminDashboard /> : 
              <Navigate to="/admin/giris" />
          } />
          <Route path="/dashboard/manager" element={
            isAuthenticated && user?.type?.toUpperCase() === 'MANAGER' ? 
              <ManagerDashboard /> : 
              <Navigate to="/admin/giris" />
          } />
          <Route path="/dashboard/finance" element={
            isAuthenticated && user?.type?.toUpperCase() === 'FINANCE' ? 
              <FinanceDashboard /> : 
              <Navigate to="/admin/giris" />
          } />
          <Route path="/dashboard/producer" element={
            isAuthenticated && user?.type?.toUpperCase() === 'PRODUCER' ? 
              <ProducerDashboard /> : 
              <Navigate to="/login" />
          } />
          <Route path="/dashboard/consumer" element={
            isAuthenticated && user?.type?.toUpperCase() === 'CONSUMER' ? 
              <ConsumerDashboard /> : 
              <Navigate to="/login" />
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
