import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/Button';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const Orders = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!state.user) {
      toast.error('Please log in to view your orders');
      navigate('/account');
    }
  }, [state.user, navigate]);

  // Fetch orders
  useEffect(() => {
    if (state.user) {
      fetchOrders();
    }
  }, [state.user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders from urban_orders table (Urban Jungle orders)
      const { data, error } = await supabase
        .from('urban_orders')
        .select('*')
        .or(`customer_id.eq.${state.user.id},customer_email.eq.${state.user.email}`)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist or other error, set empty array
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Orders table may not exist or user has no orders');
          setOrders([]);
          return;
        }
        throw error;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.code !== '42P01' && !error.message?.includes('does not exist')) {
        toast.error('Failed to load orders');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) => {
    return `${Math.round(amount || 0).toLocaleString()} DJF`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      processing: { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
      shipped: { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
      processing: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { color: 'bg-orange-100 text-orange-800', label: 'Refunded' }
    };

    const config = statusConfig[paymentStatus] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!state.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
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
            My Orders
          </h1>
          <p className="text-gray-600">
            View and track your order history
          </p>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start shopping to see your orders here
            </p>
            <Button onClick={() => navigate('/shop')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      {getStatusBadge(order.status || order.delivery_status)}
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(order.total_amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                            ) : (
                              <Package className="text-gray-400" size={20} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name || item.item_name}</p>
                            <p className="text-gray-600">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-600 mt-2">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="border-t pt-4 mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Payment:</span> {order.payment_method || 'N/A'}
                  </div>
                  {order.delivery_status === 'delivered' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle size={16} />
                      Delivered
                    </div>
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

export default Orders;

