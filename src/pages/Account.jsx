import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, MapPin, Settings, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import toast from 'react-hot-toast';

const Account = () => {
  const { state, actions } = useApp();
  const navigate = useNavigate();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!state.user) {
      toast.error('Please log in to access your account');
      navigate('/');
    }
  }, [state.user, navigate]);

  const handleLogout = async () => {
    try {
      await actions.logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  if (!state.user) {
    return null;
  }

  const menuItems = [
    {
      icon: ShoppingBag,
      title: 'Orders',
      description: 'View your order history',
      link: '/account/orders',
      count: 0
    },
    {
      icon: Heart,
      title: 'Favorites',
      description: 'Your saved items',
      link: '/favorites',
      count: state.favorites?.length || 0
    },
    {
      icon: MapPin,
      title: 'Addresses',
      description: 'Manage shipping addresses',
      link: '/account/addresses',
      count: 0
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Account preferences',
      link: '/account/settings',
      count: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage 
                src={state.user.user_metadata?.avatar_url || state.user.user_metadata?.picture} 
                alt={state.user.email || 'User'}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-3xl font-bold">
              {state.user.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back!
              </h1>
              <p className="text-gray-600">{state.user.email}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 min-h-[44px]"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Favorites</p>
                <p className="text-3xl font-bold text-gray-900">{state.favorites?.length || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Heart className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cart Items</p>
                <p className="text-3xl font-bold text-gray-900">{state.cart?.itemCount || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingBag className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <item.icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                    {item.count !== null && item.count > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Account;

