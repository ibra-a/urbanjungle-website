import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Phone, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import gabLogo from '../../assets/logos/GABFASHIONLOGOUPDATED.jpeg';
import AdminFooter from '../../components/AdminFooter';

const DriverLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Verify driver credentials
      const { data: driver, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('phone', phone)
        .eq('pin', pin)
        .eq('is_active', true)
        .single();

      if (error || !driver) {
        toast.error('Invalid phone number or PIN');
        return;
      }

      // Store driver session in localStorage
      localStorage.setItem('driver_session', JSON.stringify({
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        vehicle_type: driver.vehicle_type
      }));

      toast.success(`Welcome, ${driver.name}!`);
      navigate('/driver/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={gabLogo} 
            alt="GAB Fashion House" 
            className="h-20 w-auto mx-auto mb-4 rounded-lg"
          />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Truck className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Driver Portal</h1>
          </div>
          <p className="text-gray-400">Urban Jungle Delivery</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Driver Login</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+253 77 12 34 56"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  maxLength="4"
                  pattern="\d{4}"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 4-digit PIN"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Enter your 4-digit PIN</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have access? Contact admin
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2025 GAB Fashion House. All rights reserved.</p>
        </div>
        </div>
      </div>
      <AdminFooter />
    </div>
  );
};

export default DriverLogin;
