import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const Addresses = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!state.user) {
      toast.error('Please log in to access your addresses');
      navigate('/account');
    }
  }, [state.user, navigate]);

  // Fetch addresses from Supabase
  useEffect(() => {
    if (state.user) {
      fetchAddresses();
    }
  }, [state.user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', state.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Check if table doesn't exist (common error)
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('user_addresses table does not exist yet. Please run the migration.');
          setAddresses([]);
          return;
        }
        throw error;
      }
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Only show error if it's not a table missing error
      if (error.code !== '42P01' && !error.message?.includes('does not exist')) {
        toast.error('Failed to load addresses');
      }
      setAddresses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', state.user.id);

      if (error) throw error;
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  if (!state.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Account
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Addresses
              </h1>
              <p className="text-gray-600">
                Manage your shipping addresses for faster checkout
              </p>
            </div>
            <Button
              onClick={() => navigate('/account/addresses/new')}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              Add New Address
            </Button>
          </div>
        </div>

        {/* Addresses List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No addresses saved
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first address to make checkout faster
            </p>
            <Button
              onClick={() => navigate('/account/addresses/new')}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-gray-400" size={20} />
                    <h3 className="font-bold text-gray-900">
                      {address.label || 'Home Address'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/account/addresses/edit?id=${address.id}`)}
                      className="p-2"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <div className="text-gray-600 space-y-1">
                  <p>{address.full_name || address.name}</p>
                  <p>{address.street_address}</p>
                  {address.address_line_2 && <p>{address.address_line_2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p>{address.country}</p>
                  {address.phone && (
                    <p className="mt-2 text-sm">Phone: {address.phone}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;

