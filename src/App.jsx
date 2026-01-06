import { useState, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { EcommerceNav } from "./components";
import UJLoadingScreen from './components/NikeLoadingScreen';
import FavoriteNotification from './components/FavoriteNotification';
import ScrollToTop from './components/ScrollToTop';
import Footer from './sections/Footer';

// OPTIMIZATION: Lazy load pages for code splitting (like Tommy CK)
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Men = lazy(() => import('./pages/Men'));
const Women = lazy(() => import('./pages/Women'));
const Kids = lazy(() => import('./pages/Kids'));
const Brands = lazy(() => import('./pages/Brands'));
const Sale = lazy(() => import('./pages/Sale'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const PaymentMethodSelection = lazy(() => import('./pages/PaymentMethodSelection'));
const CheckoutWithCAC = lazy(() => import('./pages/CheckoutWithCAC'));
const CheckoutCOD = lazy(() => import('./pages/CheckoutCOD'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Cart = lazy(() => import('./pages/Cart'));
const TestPage = lazy(() => import('./pages/TestPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// Admin Pages - Lazy loaded (admin routes are less frequently accessed)
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const AdminLayout = lazy(() => import('./pages/admin/Layout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));

const AppContent = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { state, actions } = useApp();

  const handleLoadingComplete = () => {
    setIsInitialLoading(false);
  };

  // Only show loading on initial load AND when authLoading is true for login/register (not logout)
  if (isInitialLoading || (state.authLoading && !state.user)) {
    return <UJLoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <main className='relative min-h-screen'>
      <ScrollToTop />
      <Suspense fallback={<UJLoadingScreen />}>
        <Routes>
          {/* Admin Routes - No shop navbar */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
          
          {/* Public routes - With shop navbar and footer */}
          <Route path="*" element={
            <>
              <FavoriteNotification 
                isVisible={state.favoriteNotification.isVisible}
                message={state.favoriteNotification.message}
                type={state.favoriteNotification.type}
                onClose={actions.hideFavoriteNotification}
              />
              <EcommerceNav />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/men" element={<Men />} />
                <Route path="/women" element={<Women />} />
                <Route path="/kids" element={<Kids />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/sale" element={<Sale />} />
                <Route path="/product/:itemCode" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<PaymentMethodSelection />} />
                <Route path="/checkout/cacpay" element={<CheckoutWithCAC />} />
                <Route path="/checkout/cash-on-delivery" element={<CheckoutCOD />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                {/* Test route removed for production security */}
                {/* <Route path="/test" element={<TestPage />} /> */}
              </Routes>
              <section className='bg-black padding-x padding-t pb-8'>
                <Footer />
              </section>
            </>
          } />
        </Routes>
      </Suspense>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#000000',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          },
          success: {
            style: {
              background: '#f0f9ff',
              color: '#065f46',
              border: '1px solid #10b981',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #ef4444',
            },
          },
        }}
      />
    </main>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;
