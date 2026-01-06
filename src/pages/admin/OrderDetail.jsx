import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { ArrowLeft, RefreshCw, X, Package, Truck, CheckCircle, Clock, AlertCircle, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import DeliveryManager from '../../components/admin/DeliveryManager';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const syncToERP = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/sync-order-to-erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order.id,
          store: order.store_name === 'Urban Jungle' ? 'urban' : 'tommy'
        })
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Order synced to ERPNext successfully');
        loadOrder(); // Reload to get updated ERP status
      } else {
        toast.error(result.error || 'Failed to sync order');
      }
    } catch (error) {
      console.error('Error syncing order:', error);
      toast.error('Failed to sync order to ERPNext');
    } finally {
      setSyncing(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          delivery_status: newStatus === 'pending' ? 'pending' : 
                         newStatus === 'processing' ? 'ready' :
                         newStatus === 'shipped' ? 'out_for_delivery' :
                         newStatus === 'completed' ? 'delivered' :
                         newStatus === 'cancelled' ? 'cancelled' : 
                         undefined
        })
        .eq('id', orderId);
      
      if (error) throw error;
      toast.success('Order status updated');
      loadOrder();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-400 mb-6">The order you're looking for doesn't exist.</p>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : (order.order_items || []);
  const shippingAddress = typeof order.shipping_address === 'object' 
    ? order.shipping_address 
    : { address: order.shipping_address || 'N/A' };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'processing': return 'bg-blue-900/50 text-blue-300 border-blue-700';
      case 'shipped': return 'bg-purple-900/50 text-purple-300 border-purple-700';
      case 'pending': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'cancelled': return 'bg-red-900/50 text-red-300 border-red-700';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'pending': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order #{order.id.slice(0, 8)}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded border ${getStatusColor(order.status)}`}>
                  {order.status?.toUpperCase() || 'UNKNOWN'}
                </span>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded border ${getPaymentStatusColor(order.payment_status)}`}>
                  {order.payment_status === 'paid' ? 'PAID' : order.payment_status === 'pending' ? 'PENDING PAYMENT' : 'UNKNOWN'}
                </span>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded ${
                  order.store_name === 'Urban Jungle'
                    ? 'bg-green-900/50 text-green-300 border border-green-700'
                    : 'bg-red-900/50 text-red-300 border border-red-700'
                }`}>
                  {order.store_name || 'Tommy CK'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!order.synced_to_erp && (
                <button
                  onClick={syncToERP}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync to ERP'}
                </button>
              )}
              {order.synced_to_erp && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-900/50 text-green-300 border border-green-700 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  Synced to ERP
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({items.length})
              </h2>
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {item.product_name || item.item_name || 'Product'}
                      </h3>
                      <div className="text-sm text-gray-400 space-y-1">
                        {item.size && <p>Size: {item.size}</p>}
                        {item.item_code && <p>Item Code: {item.item_code}</p>}
                        <p>Quantity: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {item.price?.toLocaleString() || item.standard_rate?.toLocaleString() || '0'} DJF each
                      </p>
                      <p className="text-lg font-bold text-white">
                        {((item.quantity || 1) * (item.price || item.standard_rate || 0)).toLocaleString()} DJF
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="font-semibold text-white">
                    {order.total_amount?.toLocaleString() || '0'} DJF
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 text-xl">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-yellow-400">
                    {order.total_amount?.toLocaleString() || '0'} DJF
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Manager */}
            <DeliveryManager 
              order={order} 
              onUpdate={loadOrder}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Name</p>
                  <p className="font-semibold text-white">{order.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </p>
                  <p className="text-white">{order.customer_email || 'N/A'}</p>
                </div>
                {order.customer_phone && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone
                    </p>
                    <p className="text-white">{order.customer_phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              <div className="space-y-2 text-sm">
                {shippingAddress.firstName && (
                  <p className="text-white">
                    <span className="text-gray-400">Name:</span> {shippingAddress.firstName} {shippingAddress.lastName}
                  </p>
                )}
                {shippingAddress.address && (
                  <p className="text-white">
                    <span className="text-gray-400">Address:</span> {shippingAddress.address}
                  </p>
                )}
                {shippingAddress.city && (
                  <p className="text-white">
                    <span className="text-gray-400">City:</span> {shippingAddress.city}
                  </p>
                )}
                {shippingAddress.state && (
                  <p className="text-white">
                    <span className="text-gray-400">State:</span> {shippingAddress.state}
                  </p>
                )}
                {shippingAddress.zipCode && (
                  <p className="text-white">
                    <span className="text-gray-400">ZIP:</span> {shippingAddress.zipCode}
                  </p>
                )}
                {!shippingAddress.firstName && !shippingAddress.address && (
                  <p className="text-gray-400">No shipping address provided</p>
                )}
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Order Information
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Order Date</p>
                  <p className="text-white">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                {order.paid_at && (
                  <div>
                    <p className="text-gray-400 mb-1">Paid At</p>
                    <p className="text-white">
                      {new Date(order.paid_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {order.erp_order_id && (
                  <div>
                    <p className="text-gray-400 mb-1">ERP Order ID</p>
                    <p className="text-white font-mono">{order.erp_order_id}</p>
                  </div>
                )}
                {order.transaction_id && (
                  <div>
                    <p className="text-gray-400 mb-1">Transaction ID</p>
                    <p className="text-white font-mono text-xs break-all">{order.transaction_id}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 mb-1">Payment Method</p>
                  <p className="text-white">{order.payment_method || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Status Actions */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Update Status</h2>
              <div className="space-y-2">
                {['pending', 'processing', 'shipped', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(status)}
                    disabled={order.status === status}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      order.status === status
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-700/50 text-white hover:bg-gray-700'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

