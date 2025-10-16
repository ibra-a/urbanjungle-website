import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { EcommerceNav } from "./components";
import NikeLoadingScreen from './components/NikeLoadingScreen';
import FavoriteNotification from './components/FavoriteNotification';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Men from './pages/Men';
import Women from './pages/Women';
import Kids from './pages/Kids';
import Brands from './pages/Brands';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Favorites from './pages/Favorites';
import Cart from './pages/Cart';
import TestPage from './pages/TestPage';

// Admin Pages
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';

const AppContent = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { state, actions } = useApp();

  const handleLoadingComplete = () => {
    setIsInitialLoading(false);
  };

  // Only show loading on initial load AND when authLoading is true for login/register (not logout)
  if (isInitialLoading || (state.authLoading && !state.user)) {
    return <NikeLoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <main className='relative min-h-screen'>
      <Routes>
        {/* Admin Routes - No shop navbar */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
        </Route>
        
        {/* Public routes - With shop navbar */}
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
              <Route path="/product/:itemCode" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/test" element={<TestPage />} />
            </Routes>
          </>
        } />
      </Routes>
      
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
