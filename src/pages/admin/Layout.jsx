import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, LogOut, Store, ExternalLink, Bell, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AdminLayout = () => {
  const location = useLocation();
  const { actions, state } = useApp();
  const [adminEmail, setAdminEmail] = useState('');
  
  useEffect(() => {
    if (state.user) {
      setAdminEmail(state.user.email);
    }
  }, [state.user]);
  
  const navItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/products', icon: Package, label: 'Products' },
  ];
  
  const handleLogout = async () => {
    await actions.signOut();
    window.location.href = '/';
  };
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Admin Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-gray-800 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Urban Jungle</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* View Store Link */}
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Store</span>
            </a>
            
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg">
              <User className="w-5 h-5 text-gray-400" />
              <div className="text-sm">
                <div className="text-white font-medium">Admin</div>
                <div className="text-gray-400 text-xs">{adminEmail}</div>
              </div>
            </div>
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-black text-white min-h-screen fixed left-0 top-16 border-r border-gray-800">
          <nav className="px-4 py-6">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                    isActive
                      ? 'bg-white text-black font-semibold' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 bg-gray-900 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

