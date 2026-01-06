import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AddressForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useApp();
  const addressId = searchParams.get('id');
  const isEdit = !!addressId;

  const [formData, setFormData] = useState({
    label: '',
    full_name: '',
    street_address: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Djibouti',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Redirect if not logged in
  useEffect(() => {
    if (!state.user) {
      toast.error('Please log in to manage addresses');
      navigate('/account');
    }
  }, [state.user, navigate]);

  // Fetch address if editing
  useEffect(() => {
    if (isEdit && state.user && addressId) {
      fetchAddress();
    }
  }, [isEdit, state.user, addressId]);

  const fetchAddress = async () => {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('id', addressId)
        .eq('user_id', state.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          label: data.label || '',
          full_name: data.full_name || '',
          street_address: data.street_address || '',
          address_line_2: data.address_line_2 || '',
          city: data.city || '',
          state: data.state || '',
          postal_code: data.postal_code || '',
          country: data.country || 'Djibouti',
          phone: data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      toast.error('Failed to load address');
      navigate('/account/addresses');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name || !formData.street_address || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        // Update existing address
        const { error } = await supabase
          .from('user_addresses')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', addressId)
          .eq('user_id', state.user.id);

        if (error) throw error;
        toast.success('Address updated successfully');
      } else {
        // Create new address
        const { error } = await supabase
          .from('user_addresses')
          .insert([{
            user_id: state.user.id,
            ...formData
          }]);

        if (error) throw error;
        toast.success('Address saved successfully');
      }

      navigate('/account/addresses');
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  if (!state.user) {
    return null;
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 flex items-center justify-center">
        <div className="text-gray-600">Loading address...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/account/addresses')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Addresses
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Edit Address' : 'Add New Address'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update your shipping address' : 'Save a new shipping address for faster checkout'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Label (Optional)
            </label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              placeholder="e.g., Home, Work, Office"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="street_address"
              value={formData.street_address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Apartment, Suite, etc. (Optional)
            </label>
            <input
              type="text"
              name="address_line_2"
              value={formData.address_line_2}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                State/Region (Optional)
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Postal Code and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Postal Code (Optional)
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number (Optional)
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
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/account/addresses')}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:border-yellow-500 hover:text-yellow-500 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save size={18} />
                  {isEdit ? 'Update Address' : 'Save Address'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;

