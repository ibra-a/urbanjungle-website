// Urban Jungle App.jsx configuration

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@gabfashion/ecommerce-backend'
import { Toaster } from 'react-hot-toast'
import { backend } from './config/backend'

// Import your Urban Jungle components
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import FavoritesPage from './pages/FavoritesPage'
import CheckoutPage from './pages/CheckoutPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'

function App() {
  return (
    <AppProvider backend={backend}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                borderRadius: '8px',
              },
            }}
          />
        </div>
      </Router>
    </AppProvider>
  )
}

export default App
