import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, ArrowLeft, User, Mail, Phone, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Settings = () => {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!state.user) {
      toast.error('Please log in to access settings');
      navigate('/account');
    } else {
      // Load user metadata
      const metadata = state.user.user_metadata || {};
      setFormData({
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        phone: metadata.phone || ''
      });
    }
  }, [state.user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone
        }
      });

      if (error) throw error;

      toast.success('Settings updated successfully');
      
      // Refresh user data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Update context if needed
        window.location.reload(); // Simple refresh to update user data
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!state.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Account
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Account Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Account Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={state.user.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+253 77 12 34 56"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {loading ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Account Actions */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SettingsIcon size={20} />
              Account Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/account/addresses')}
                className="w-full flex items-center justify-start px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:border-yellow-500 hover:text-yellow-500 transition-colors min-h-[44px]"
              >
                Manage Addresses
              </button>
              <button
                onClick={() => navigate('/favorites')}
                className="w-full flex items-center justify-start px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:border-yellow-500 hover:text-yellow-500 transition-colors min-h-[44px]"
              >
                View Favorites
              </button>
              <button
                onClick={() => navigate('/account/orders')}
                className="w-full flex items-center justify-start px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:border-yellow-500 hover:text-yellow-500 transition-colors min-h-[44px]"
              >
                View Order History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

