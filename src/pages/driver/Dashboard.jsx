import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Package, Truck, CheckCircle, Phone, MapPin, DollarSign, LogOut, User, Navigation, Camera, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { showDriverToast, showErrorToast } from '../../utils/toastUtils.jsx';
import gabLogo from '../../assets/logos/GABFASHIONLOGOUPDATED.jpeg';
import CameraCapture from '../../components/driver/CameraCapture';
import AdminFooter from '../../components/AdminFooter';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'delivered'
  const [showCamera, setShowCamera] = useState(null); // { orderId, photoType }

  useEffect(() => {
    // Check driver session
    const session = localStorage.getItem('driver_session');
    if (!session) {
      navigate('/driver/login');
      return;
    }

    setDriver(JSON.parse(session));
    loadOrders(JSON.parse(session).id);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadOrders(JSON.parse(session).id);
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  const loadOrders = async (driverId) => {
    try {
      setLoading(true);

      // Get orders assigned to this driver
      // Show all assigned orders (not just today's) - driver needs to see their assignments
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('driver_id', driverId)
        .not('delivery_status', 'is', null)
        .order('assigned_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get assignment details for each order
      const ordersWithAssignment = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: assignment } = await supabase
            .from('delivery_assignments')
            .select('assigned_by, assigned_at')
            .eq('order_id', order.id)
            .eq('driver_id', driverId)
            .eq('status', 'assigned')
            .single();
          
          return {
            ...order,
            assignment_info: assignment
          };
        })
      );

      setOrders(ordersWithAssignment);
    } catch (error) {
      console.error('Error loading orders:', error);
      showErrorToast('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Status updates now happen automatically when photos are uploaded

  const handleLogout = () => {
    localStorage.removeItem('driver_session');
    navigate('/driver/login');
  };

  const parseAddress = (address) => {
    try {
      if (typeof address === 'string') {
        const addr = JSON.parse(address);
        return `${addr.street || ''}, ${addr.city || ''}, ${addr.country || ''}`.trim();
      }
      return address.street + ', ' + address.city;
    } catch {
      return 'Address not available';
    }
  };

  const getCustomerPhone = (order) => {
    // Get phone from shipping_address (where it's stored)
    if (order.shipping_address) {
      const address = typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address;
      
      // Try different possible phone fields
      const phone = address.phone || address.phoneNumber || address.phone_number;
      if (phone) {
        // Remove all spaces and non-digit characters except +
        const cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
        
        // If already has +253, return as is
        if (cleaned.startsWith('+253')) {
          return cleaned;
        }
        
        // Remove + if present but not +253
        const digitsOnly = cleaned.replace(/\+/g, '');
        
        // If starts with 253 (9 digits after), it's already complete
        if (digitsOnly.startsWith('253') && digitsOnly.length === 11) {
          return `+${digitsOnly}`;
        }
        
        // If starts with 0, remove 0 and add +253
        if (digitsOnly.startsWith('0')) {
          return `+253${digitsOnly.substring(1)}`;
        }
        
        // If starts with 253 but wrong length, might be duplicate - check
        if (digitsOnly.startsWith('253253')) {
          // Remove duplicate 253
          return `+${digitsOnly.substring(3)}`;
        }
        
        // Otherwise, assume it's missing country code
        if (digitsOnly.length === 8) {
          // 8 digits = local number (77XXXXXX or 78XXXXXX)
          return `+253${digitsOnly}`;
        }
        
        // If it already has 253 prefix, just add +
        if (digitsOnly.startsWith('253')) {
          return `+${digitsOnly}`;
        }
        
        // Last resort: add +253
        return `+253${digitsOnly}`;
      }
    }
    return null;
  };

  const getWhatsAppLink = (phoneNumber) => {
    if (!phoneNumber) return null;
    // WhatsApp link format: https://wa.me/253XXXXXXXXX (without +)
    const cleaned = phoneNumber.replace(/[^\d]/g, ''); // Remove all non-digits
    return `https://wa.me/${cleaned}`;
  };

  const pendingOrders = orders.filter(o => ['assigned', 'out_for_delivery'].includes(o.delivery_status));
  const deliveredOrders = orders.filter(o => ['delivered', 'completed'].includes(o.delivery_status));

  if (!driver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={gabLogo} alt="GAB" className="h-10 w-auto rounded" />
              <div>
                <p className="text-xs text-gray-400">Driver Portal</p>
                <p className="text-white font-semibold">{driver.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 py-6 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-blue-100 text-sm">Today's Total</p>
            <p className="text-3xl font-bold text-white">{orders.length}</p>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-sm">Delivered</p>
            <p className="text-3xl font-bold text-white">{deliveredOrders.length}</p>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-sm">Pending</p>
            <p className="text-3xl font-bold text-white">{pendingOrders.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4 flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 px-4 py-3 font-semibold rounded-t-lg transition-colors ${
            activeTab === 'pending'
              ? 'bg-gray-800 text-white border-t border-x border-gray-700'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Pending ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          className={`flex-1 px-4 py-3 font-semibold rounded-t-lg transition-colors ${
            activeTab === 'delivered'
              ? 'bg-gray-800 text-white border-t border-x border-gray-700'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Delivered ({deliveredOrders.length})
        </button>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <>
            {activeTab === 'pending' && (
              <>
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No pending deliveries</p>
                  </div>
                ) : (
                  pendingOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      parseAddress={parseAddress}
                      getCustomerPhone={getCustomerPhone}
                      setShowCamera={setShowCamera}
                      onRefresh={() => loadOrders(driver.id)}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === 'delivered' && (
              <>
                {deliveredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No deliveries completed today</p>
                  </div>
                ) : (
                  deliveredOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      parseAddress={parseAddress}
                      getCustomerPhone={getCustomerPhone}
                      delivered
                      onRefresh={() => loadOrders(driver.id)}
                    />
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          orderId={showCamera.orderId}
          photoType={showCamera.photoType}
          onPhotoTaken={(photoUrl) => {
            // Reload orders to get updated photo URL
            loadOrders(driver.id);
            setShowCamera(null);
          }}
          onCancel={() => setShowCamera(null)}
        />
      )}

      {/* Footer */}
      <AdminFooter />
    </div>
  );
};

// Helper function to format amount in words (simplified)
const formatAmountInWords = (amount) => {
  if (amount >= 1000000) {
    const millions = Math.floor(amount / 1000000);
    const remainder = amount % 1000000;
    if (remainder === 0) {
      return `${millions} Million${millions > 1 ? 's' : ''}`;
    }
    return `${millions} Million ${formatAmountInWords(remainder)}`;
  }
  if (amount >= 1000) {
    const thousands = Math.floor(amount / 1000);
    const remainder = amount % 1000;
    if (remainder === 0) {
      return `${thousands} Thousand${thousands > 1 ? 's' : ''}`;
    }
    return `${thousands} Thousand ${remainder}`;
  }
  return amount.toString();
};

const OrderCard = ({ order, parseAddress, getCustomerPhone, delivered = false, setShowCamera, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  const address = parseAddress(order.shipping_address);
  const customerPhone = getCustomerPhone(order);
  const whatsappLink = customerPhone ? `https://wa.me/${customerPhone.replace(/[^\d]/g, '')}` : null;

  // Determine payment method
  const isCOD = order.payment_method === 'Cash on Delivery' || order.payment_method === 'cash_on_delivery';
  const isCAC = order.payment_method?.includes('CAC') || order.payment_method === 'CAC Bank Mobile Money';
  const totalAmount = parseFloat(order.total_amount || 0);

  const statusColors = {
    ready: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    assigned: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    out_for_delivery: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
    completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-gray-400">Order</p>
            <p className="text-white font-semibold">#{order.id.slice(0, 8)}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Payment Method Badge */}
            {isCOD && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-900/50 text-yellow-400 border-yellow-700">
                💵 COD
              </span>
            )}
            {isCAC && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-900/50 text-blue-400 border-blue-700">
                💳 CAC
              </span>
            )}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.delivery_status] || statusColors.pending}`}>
            {order.delivery_status || 'pending'}
          </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{order.customer_name || 'Customer'}</span>
          </div>
          
          <div className="flex items-start gap-2 text-gray-300 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{address}</span>
          </div>

          {customerPhone ? (
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
              <a href={`tel:${customerPhone}`} className="hover:text-blue-400 underline">
                {customerPhone}
            </a>
          </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Phone className="w-4 h-4 text-gray-600" />
              <span>Phone: N/A</span>
            </div>
          )}

          {/* Payment Info - Prominent Display */}
          <div className="pt-2 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs text-gray-400">Total Amount</p>
                  <p className="text-white font-bold text-lg">{totalAmount.toLocaleString()} DJF</p>
                </div>
              </div>
              {isCOD && (
                <div className="text-right">
                  <p className="text-xs text-yellow-400 font-medium">💵 Collect Cash</p>
                  <p className="text-xs text-gray-400">On Delivery</p>
                </div>
              )}
              {isCAC && (
                <div className="text-right">
                  <p className="text-xs text-green-400 font-medium">✅ Already Paid</p>
                  <p className="text-xs text-gray-400">Online Payment</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Assignment Info */}
          {order.assignment_info && (
            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400 space-y-1">
                <div>Assigned by: <span className="text-gray-300">{order.assignment_info.assigned_by?.split('@')[0] || 'Admin'}</span></div>
                <div>
                  {(() => {
                    const assignedDate = new Date(order.assignment_info.assigned_at);
                    const now = new Date();
                    const diffMs = now - assignedDate;
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMins / 60);
                    
                    if (diffMins < 60) {
                      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
                    } else if (diffHours < 24) {
                      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                    } else {
                      return assignedDate.toLocaleString();
                    }
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="p-4 bg-gray-900/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-gray-400 hover:text-white mb-2"
        >
          {expanded ? '▼' : '▶'} {items.length} item(s)
        </button>
        {expanded && (
          <div className="space-y-1">
            {items.map((item, idx) => (
              <div key={idx} className="text-sm text-gray-300">
                • {item.name || item.product_name} × {item.quantity}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {!delivered && (
        <div className="p-4 space-y-2">
          {order.delivery_status === 'assigned' && (
            <>
              {/* COD: Show amount to collect early */}
              {isCOD && (
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-2">
                  <p className="text-yellow-300 font-semibold text-sm mb-1">💰 Cash on Delivery</p>
                  <p className="text-white font-bold text-xl text-center">
                    Collect: {totalAmount.toLocaleString()} DJF
                  </p>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Remember this amount for when you deliver
                  </p>
                </div>
              )}

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-2">
                <p className="text-sm text-blue-300 font-medium mb-1">📦 Step 1: Pickup</p>
                <p className="text-xs text-gray-400">Take a pickup photo when you collect the items</p>
              </div>
              
              <button
                onClick={() => setShowCamera?.({ orderId: order.id, photoType: 'collection' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Camera className="w-5 h-5" />
                📸 Take Pickup Photo
              </button>
            </>
          )}

          {order.delivery_status === 'out_for_delivery' && (
            <>
              {/* COD: Large Collect Cash Box */}
              {isCOD && (
                <div className="bg-yellow-900/40 border-2 border-yellow-600 rounded-lg p-4 mb-3 animate-pulse">
                  <div className="text-center">
                    <p className="text-yellow-300 font-bold text-lg mb-2">💰 COLLECT CASH</p>
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-2 border border-yellow-600">
                      <p className="text-white font-bold text-3xl mb-1">{totalAmount.toLocaleString()} DJF</p>
                      <p className="text-yellow-200 text-xs font-medium">
                        ({formatAmountInWords(totalAmount)} DJF)
                      </p>
                    </div>
                    <div className="bg-yellow-900/30 rounded p-2 mb-2">
                      <p className="text-yellow-200 text-xs font-semibold">
                        ⚠️ IMPORTANT: Collect this amount BEFORE giving items
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Verify customer pays exactly: <span className="text-yellow-200 font-semibold">{totalAmount.toLocaleString()} DJF</span>
                    </p>
                  </div>
                </div>
              )}

              {/* CAC: Payment Already Done */}
              {isCAC && (
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-sm text-green-300 font-medium">Payment Already Completed</p>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Customer paid online. Just deliver the items.
                  </p>
                </div>
              )}

              <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 mb-2">
                <p className="text-sm text-green-300 font-medium mb-1">✅ Step 2: Delivery</p>
                <p className="text-xs text-gray-400">Take a delivery photo at the customer's location</p>
              </div>
              
                <button
                onClick={() => setShowCamera?.({ orderId: order.id, photoType: 'delivery' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <Camera className="w-5 h-5" />
                  📸 Take Delivery Photo
                </button>
            </>
          )}

          {/* Contact Customer - Call and WhatsApp */}
          {customerPhone ? (
            <div className="grid grid-cols-2 gap-2">
          <a
                href={`tel:${customerPhone}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <Phone className="w-5 h-5" />
                📞 Call
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors font-semibold"
              >
                <MessageCircle className="w-5 h-5" />
                💬 WhatsApp
              </a>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed">
              <Phone className="w-5 h-5" />
              Phone Number Not Available
            </div>
          )}

          {/* Navigate */}
          {address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold"
            >
              <Navigation className="w-5 h-5" />
              Navigate
            </a>
          )}
        </div>
      )}

      {delivered && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-center gap-2 text-green-400 py-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Delivered</span>
          </div>
          {order.delivered_at && (
            <p className="text-xs text-gray-400 text-center">
              {new Date(order.delivered_at).toLocaleString()}
            </p>
          )}

          {/* Cash on Delivery - Info for Driver */}
          {(order.payment_method === 'Cash on Delivery' || order.payment_method === 'cash_on_delivery') && 
           order.payment_status !== 'paid' && (
            <div className="mt-4 space-y-2">
              <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                <p className="text-sm text-yellow-300 font-medium mb-1">💰 Cash on Delivery</p>
                <p className="text-xs text-gray-400">
                  Collect <span className="text-yellow-200 font-semibold">{order.total_amount?.toLocaleString() || 0} DJF</span> from customer.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Return to store with cash. Admin will confirm payment when you drop it off.
                </p>
              </div>
            </div>
          )}

          {/* Payment already confirmed */}
          {order.payment_status === 'paid' && 
           (order.payment_method === 'Cash on Delivery' || order.payment_method === 'cash_on_delivery') && (
            <div className="mt-4 bg-green-900/30 border border-green-700 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">Payment Confirmed</span>
              </div>
              <p className="text-xs text-gray-400 text-center mt-1">
                Cash payment has been confirmed and recorded
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;


