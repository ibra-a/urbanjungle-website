import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Heart, 
  ShoppingBag, 
  Settings, 
  Database,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';

const TestPage = () => {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('checking');
  const [apiTests, setApiTests] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    await testAuth();
    await testApiHealth();
    await testProducts();
    await testFavorites();
  };

  const testAuth = async () => {
    setAuthStatus('checking');
    const token = localStorage.getItem('nike_token');
    
    if (!token) {
      setAuthStatus('no_token');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setUser(data.user);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('invalid_token');
          localStorage.removeItem('nike_token');
        }
      } else {
        setAuthStatus('auth_failed');
        localStorage.removeItem('nike_token');
      }
    } catch (error) {
      console.error('Auth test failed:', error);
      setAuthStatus('error');
    }
  };

  const testApiHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      
      setApiTests(prev => ({
        ...prev,
        health: {
          status: response.ok ? 'success' : 'failed',
          data: data
        }
      }));
    } catch (error) {
      setApiTests(prev => ({
        ...prev,
        health: {
          status: 'error',
          error: error.message
        }
      }));
    }
  };

  const testProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      
      setProducts(data.products || []);
      setApiTests(prev => ({
        ...prev,
        products: {
          status: response.ok ? 'success' : 'failed',
          count: data.products?.length || 0
        }
      }));
    } catch (error) {
      setApiTests(prev => ({
        ...prev,
        products: {
          status: 'error',
          error: error.message
        }
      }));
    }
  };

  const testFavorites = async () => {
    const token = localStorage.getItem('nike_token');
    if (!token) {
      setApiTests(prev => ({
        ...prev,
        favorites: {
          status: 'no_auth',
          message: 'No authentication token'
        }
      }));
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
        setApiTests(prev => ({
          ...prev,
          favorites: {
            status: 'success',
            count: data.favorites?.length || 0
          }
        }));
      } else {
        setApiTests(prev => ({
          ...prev,
          favorites: {
            status: 'failed',
            error: 'Failed to fetch favorites'
          }
        }));
      }
    } catch (error) {
      setApiTests(prev => ({
        ...prev,
        favorites: {
          status: 'error',
          error: error.message
        }
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem('nike_token');
    setUser(null);
    setAuthStatus('no_token');
    setFavorites([]);
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'error':
      case 'auth_failed':
      case 'invalid_token':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nike App Test Page</h1>
                <p className="text-gray-600">Development testing and debugging</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-500" />
            Authentication Status
          </h2>
          
          <div className="flex items-center gap-3 mb-4">
            <StatusIcon status={authStatus} />
            <span className="font-medium">
              {authStatus === 'authenticated' && 'Authenticated'}
              {authStatus === 'no_token' && 'Not logged in'}
              {authStatus === 'checking' && 'Checking...'}
              {authStatus === 'invalid_token' && 'Invalid token'}
              {authStatus === 'auth_failed' && 'Authentication failed'}
              {authStatus === 'error' && 'Error occurred'}
            </span>
          </div>

          {user && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          )}

          {authStatus === 'authenticated' && (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          )}
        </div>

        {/* API Tests */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-green-500" />
            API Endpoints
          </h2>

          <div className="space-y-4">
            {/* Health Check */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <StatusIcon status={apiTests.health?.status} />
                <span>Health Check</span>
              </div>
              <span className="text-sm text-gray-600">
                {apiTests.health?.status === 'success' && 'API is healthy'}
                {apiTests.health?.status === 'error' && apiTests.health.error}
              </span>
            </div>

            {/* Products */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <StatusIcon status={apiTests.products?.status} />
                <span>Products API</span>
              </div>
              <span className="text-sm text-gray-600">
                {apiTests.products?.status === 'success' && `${apiTests.products.count} products loaded`}
                {apiTests.products?.status === 'error' && apiTests.products.error}
              </span>
            </div>

            {/* Favorites */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <StatusIcon status={apiTests.favorites?.status} />
                <span>Favorites API</span>
              </div>
              <span className="text-sm text-gray-600">
                {apiTests.favorites?.status === 'success' && `${apiTests.favorites.count} favorites`}
                {apiTests.favorites?.status === 'no_auth' && 'Requires authentication'}
                {apiTests.favorites?.status === 'error' && apiTests.favorites.error}
              </span>
            </div>
          </div>
        </div>

        {/* Favorites List */}
        {favorites.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Your Favorites ({favorites.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.slice(0, 6).map((favorite) => (
                <div key={favorite.product_id} className="border border-gray-200 rounded-xl p-3">
                  <p className="font-medium text-sm">{favorite.product_name}</p>
                  <p className="text-gray-600 text-xs">ID: {favorite.product_id}</p>
                  {favorite.product_price && (
                    <p className="text-green-600 font-medium text-sm">
                      ${parseFloat(favorite.product_price).toFixed(2)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {favorites.length > 6 && (
              <button
                onClick={() => navigate('/favorites')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                View All Favorites
              </button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/shop')}
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <ShoppingBag className="w-5 h-5 text-blue-500" />
              <span>Go to Shop</span>
            </button>
            
            <button
              onClick={() => navigate('/favorites')}
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <Heart className="w-5 h-5 text-red-500" />
              <span>View Favorites</span>
            </button>

            <button
              onClick={runTests}
              className="p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-3"
            >
              <Settings className="w-5 h-5" />
              <span>Refresh Tests</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 