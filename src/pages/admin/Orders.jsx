import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Eye, RefreshCw, X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DeliveryManager from '../../components/admin/DeliveryManager';

const ITEMS_PER_PAGE = 10;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('Urban Jungle'); // Default to Urban Jungle
  const [paymentFilter, setPaymentFilter] = useState('paid'); // Default to only show paid orders
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [syncing, setSyncing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    loadOrders();
  }, [filter, storeFilter, paymentFilter]);
  
  const loadOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Store filter
      if (storeFilter !== 'all') {
        query = query.eq('store_name', storeFilter);
      }
      
      // Status filter
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      // Payment status filter - only show paid orders by default
      // STRICT: Only show orders with payment_status = 'paid' (exclude null, undefined, or 'pending')
      if (paymentFilter === 'paid') {
        query = query.eq('payment_status', 'paid');
      } else if (paymentFilter === 'pending') {
        query = query.eq('payment_status', 'pending');
      }
      // If 'all', show all orders regardless of payment status
      
      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
  
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Update both status and delivery_status for consistency
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
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };
  
  const syncToERP = async (orderId) => {
    try {
      setSyncing(orderId);
      // Get order to determine store
      const { data: order } = await supabase
        .from('orders')
        .select('store_name')
        .eq('id', orderId)
        .single();
      
      const response = await fetch('/api/sync-order-to-erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId,
          storeType: order?.store_name === 'Urban Jungle' ? 'urban' : 'gab'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Order synced to ERPNext! Sales Order: ${result.erp_order_id}`);
        loadOrders();
      } else {
        toast.error(result.error || 'Failed to sync order to ERP');
      }
    } catch (error) {
      console.error('Error syncing to ERP:', error);
      toast.error('Failed to sync order to ERP');
    } finally {
      setSyncing(null);
    }
  };
  
  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'completed', label: 'Completed' },
  ];
  
  // Pagination
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, endIndex);
  
  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders Management</h1>
          <p className="text-gray-400 mt-1">Manage and sync orders to ERPNext</p>
        </div>
        <button 
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors disabled:bg-gray-600"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <span className="text-gray-400 text-sm self-center mr-2">Store:</span>
          {['all', 'Tommy CK', 'Urban Jungle'].map(store => (
          <button
            key={store}
            onClick={() => setStoreFilter(store)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              storeFilter === store 
                ? 'bg-white text-black' 
                : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {store === 'all' ? 'All Stores' : store}
          </button>
        ))}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <span className="text-gray-400 text-sm self-center mr-2">Payment:</span>
          {['all', 'pending', 'paid'].map(status => (
            <button
              key={status}
              onClick={() => setPaymentFilter(status)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                paymentFilter === status 
                  ? 'bg-white text-black' 
                  : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {status === 'all' ? 'All Payments' : status === 'paid' ? 'Paid' : 'Pending Payment'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Status Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              filter === option.value 
                ? 'bg-white text-black' 
                : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      {/* Orders Table */}
      {loading ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-8 text-center">
          <div className="text-gray-400">Loading orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">No orders found</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Store</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Order ID</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Customer</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Items</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Total</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Payment</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">ERP Status</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Delivery</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Date</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-700/50">
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        order.store_name === 'Urban Jungle'
                          ? 'bg-green-900/50 text-green-300 border border-green-700'
                          : 'bg-red-900/50 text-red-300 border border-red-700'
                      }`}>
                        {order.store_name || 'Tommy CK'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-sm text-white">#{order.id.slice(0, 8)}</div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-sm text-white">{order.customer_name || 'N/A'}</div>
                        <div className="text-xs text-gray-400">{order.customer_email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">
                      {Array.isArray(order.items) ? order.items.length : (order.order_items?.length || 0)} items
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-sm text-white">{order.total_amount?.toLocaleString() || 0} DJF</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        order.payment_status === 'paid'
                          ? 'bg-green-900/50 text-green-300 border border-green-700'
                          : order.payment_status === 'pending'
                          ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                          : 'bg-gray-700 text-gray-300 border border-gray-600'
                      }`}>
                        {order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'pending' ? 'Pending' : order.payment_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="px-2 py-1 bg-gray-900 border border-gray-600 text-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {order.synced_to_erp || order.erp_synced ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Synced</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Not synced</span>
                      )}
                    </td>
                    <td className="p-4">
                      <DeliveryManager order={order} onUpdate={loadOrders} />
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-gray-600 rounded transition-colors text-gray-300"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => syncToERP(order.id)}
                          disabled={syncing === order.id || order.synced_to_erp || order.erp_synced}
                          className="p-2 hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                          title={order.synced_to_erp || order.erp_synced ? 'Already synced' : 'Sync to ERP'}
                        >
                          <RefreshCw className={`w-4 h-4 ${syncing === order.id ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-4">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, orders.length)} of {orders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[40px] h-[40px] rounded font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-white text-black'
                        : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        </>
      )}
      
      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Order Details</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedOrder.customer_name || 'N/A'}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedOrder.customer_email || 'N/A'}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedOrder.customer_phone || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Info</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Order ID:</span> #{selectedOrder.id.slice(0, 8)}</p>
                    <p><span className="text-gray-500">Status:</span> {selectedOrder.status}</p>
                    <p><span className="text-gray-500">Payment:</span> <span className={`font-semibold ${
                      selectedOrder.payment_status === 'paid' ? 'text-green-600' : 
                      selectedOrder.payment_status === 'pending' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`}>{selectedOrder.payment_status || 'Unknown'}</span></p>
                    <p><span className="text-gray-500">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                    {selectedOrder.erp_order_id && (
                      <p><span className="text-gray-500">ERP ID:</span> {selectedOrder.erp_order_id}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                <p className="text-sm text-gray-700">{selectedOrder.shipping_address || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {(selectedOrder.items || selectedOrder.order_items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 px-4 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product_name || item.item_name}</p>
                        <p className="text-xs text-gray-500">Size: {item.size || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{item.quantity} × {item.price?.toLocaleString()} DJF</p>
                        <p className="text-sm font-medium">{(item.quantity * item.price)?.toLocaleString()} DJF</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold">{selectedOrder.total_amount?.toLocaleString()} DJF</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              {!selectedOrder.synced_to_erp && !selectedOrder.erp_synced && (
                <button 
                  onClick={() => {
                    syncToERP(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Sync to ERP
                </button>
              )}
              <button 
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

