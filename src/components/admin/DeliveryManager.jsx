import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, X, AlertCircle, User, DollarSign } from 'lucide-react';
import { updateDeliveryStatus, getDeliveryStatusColor, getDeliveryStatusName } from '../../services/delivery.service';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const DeliveryManager = ({ order, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(order.driver_id || '');
  const [showDriverSelect, setShowDriverSelect] = useState(false);
  const [notifyDriver, setNotifyDriver] = useState(true); // Default to notify

  const sendNotification = async (body, context = 'notification') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${context}] failed:`, errorText);
        toast.error(`Failed to send ${context}`);
      }
    } catch (notificationError) {
      console.error(`[${context}] error:`, notificationError);
      toast.error(`Could not send ${context}`);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    const { data } = await supabase
      .from('drivers')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setDrivers(data || []);
  };

  const getDriverName = () => {
    if (!order.driver_id) return null;
    const driver = drivers.find(d => d.id === order.driver_id);
    return driver?.name;
  };

  const handleStatusUpdate = async (action) => {
    try {
      setUpdating(true);
      
      let trackingToSend = null;
      if (action === 'mark_shipped') {
        if (!trackingNumber.trim()) {
          toast.error('Please enter a tracking number');
          setShowTrackingInput(true);
          return;
        }
        trackingToSend = trackingNumber;
      }

      const result = await updateDeliveryStatus(order.id, action, trackingToSend);

      if (result.success) {
        // Update assignment status to 'completed' when delivery is marked as delivered
        if (action === 'mark_delivered' && order.driver_id) {
          await supabase
            .from('delivery_assignments')
            .update({ status: 'completed' })
            .eq('order_id', order.id)
            .eq('status', 'assigned');
        }
        
        toast.success(`Delivery status updated: ${getDeliveryStatusName(result.order.delivery_status)}`);
        setShowTrackingInput(false);
        if (onUpdate) onUpdate();
      } else {
        toast.error(result.error || 'Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast.error('Failed to update delivery status');
    } finally {
      setUpdating(false);
    }
  };

  // Handle case where delivery_status is not updated but delivery photo exists
  let status = order.delivery_status || 'pending';
  if (order.delivery_photo_url && order.delivery_photo_taken_at && status !== 'delivered') {
    console.warn(`⚠️ Order ${order.id.slice(0, 8)} has delivery photo but delivery_status is "${status}". Treating as delivered.`);
    status = 'delivered';
  }
  
  const hasDeliveryNote = !!order.delivery_note_id;

  // Determine payment method type
  const isCOD = order.payment_method === 'Cash on Delivery' || order.payment_method === 'cash_on_delivery';
  const isCAC = order.payment_method?.includes('CAC') || order.payment_method === 'CAC Bank Mobile Money';

  // Prevent showing "Mark Ready & Assign Driver" if:
  // - Driver is already assigned (even if status is pending/ready)
  // - Order is delivered
  // - Order is out for delivery
  const canShowMarkReadyButton = status === 'pending' && !order.driver_id;
  const canShowAssignDriverButton = (status === 'ready' || status === 'pending') && !order.driver_id;

  return (
    <div className="space-y-3">
      {/* Delivery Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Delivery:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getDeliveryStatusColor(status)}`}>
            {getDeliveryStatusName(status)}
          </span>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          isCOD 
            ? 'bg-green-900/50 text-green-400 border border-green-700' 
            : isCAC
            ? 'bg-blue-900/50 text-blue-400 border border-blue-700'
            : 'bg-gray-700 text-gray-300'
        }`}>
          {isCOD ? '💵 COD' : isCAC ? '💳 CAC' : order.payment_method || 'N/A'}
        </span>
      </div>

      {/* Payment Status */}
      {isCOD && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Payment:</span>
          <span className={`font-medium ${
            order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
          </span>
        </div>
      )}
      {isCAC && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Payment:</span>
          <span className="font-medium text-green-400">
            ✅ Paid (Before Delivery)
          </span>
        </div>
      )}

      {/* Assigned Driver */}
      {order.driver_id && getDriverName() && (
        <div className="flex items-center gap-2 text-xs">
          <User className="w-3 h-3 text-gray-400" />
          <span className="text-gray-400">Driver:</span>
          <span className="text-white font-medium">{getDriverName()}</span>
        </div>
      )}

      {/* ERP Sync Status */}
      {order.delivery_note_id ? (
        <div className="text-xs text-gray-400">
          DN: {order.delivery_note_id}
        </div>
      ) : (
        <div className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">
          ⚠️ Not synced to ERP yet
        </div>
      )}

      {/* Tracking Number */}
      {order.tracking_number && (
        <div className="text-xs">
          <span className="text-gray-400">Tracking: </span>
          <span className="text-white font-mono">{order.tracking_number}</span>
        </div>
      )}

      {/* Action Buttons based on current status */}
      <div className="space-y-2">
        {canShowMarkReadyButton && (
          <>
            {!showDriverSelect ? (
              <button
                onClick={() => {
                  supabase
                    .from('orders')
                    .update({
                      delivery_status: 'ready',
                      ready_at: new Date().toISOString(),
                      status: 'ready'
                    })
                    .eq('id', order.id)
                    .then(() => {
                      setShowDriverSelect(true);
                    });
                }}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
              >
                <Package className="w-4 h-4" />
                {updating ? 'Updating...' : 'Mark Ready & Assign Driver'}
              </button>
            ) : null}
            {showDriverSelect ? (
              <div className="space-y-2">
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select driver...</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.vehicle_type})
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyDriver}
                    onChange={(e) => setNotifyDriver(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span>Notify driver with status</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!selectedDriver) {
                        toast.error('Please select a driver');
                        return;
                      }
                      try {
                        setUpdating(true);
                        
                        const { data: { user } } = await supabase.auth.getUser();
                        const adminEmail = user?.email || 'unknown';
                        const adminUserId = user?.id || null;
                        
                        const driver = drivers.find(d => d.id === selectedDriver);
                        
                        const { error: orderError } = await supabase
                          .from('orders')
                          .update({
                            driver_id: selectedDriver,
                            assigned_at: new Date().toISOString(),
                            delivery_status: 'assigned',
                            assigned_by_admin_id: adminUserId
                          })
                          .eq('id', order.id);
                        
                        if (orderError) throw orderError;
                        
                        const { error: logError } = await supabase
                          .from('delivery_assignments')
                          .insert({
                            order_id: order.id,
                            driver_id: selectedDriver,
                            assigned_by: adminEmail,
                            assigned_by_user_id: adminUserId,
                            status: 'assigned',
                            assigned_at: new Date().toISOString()
                          });
                        
                        if (logError) {
                          console.error('Failed to log assignment:', logError);
                        }
                        
                        if (notifyDriver && driver?.phone) {
                          const pickupAddress = 'H5F5+MGP, Djibouti';
                          const message = `Order #${order.id.slice(0, 8)} is ready for pickup!\nTotal: ${order.total_amount?.toLocaleString() || 0} DJF\nPickup: ${pickupAddress}${order.shipping_address ? `\nDeliver to: ${typeof order.shipping_address === 'object' ? `${order.shipping_address.address || ''}, ${order.shipping_address.city || ''}` : order.shipping_address}` : ''}\nPlease come collect the order.`;

                          await sendNotification({
                            orderId: order.id,
                            orderNumber: order.id.slice(0, 8),
                            customerName: driver.name || 'Driver',
                            customerPhone: driver.phone,
                            deliveryAddress: typeof order.shipping_address === 'object'
                              ? `${order.shipping_address.address || ''}, ${order.shipping_address.city || ''}`
                              : (order.shipping_address || ''),
                            totalAmount: order.total_amount || 0,
                            items: [],
                            customMessage: message
                          }, 'driver notification');
                        }
                        
                        toast.success(notifyDriver && driver?.phone ? 'Driver assigned and notified!' : 'Driver assigned successfully!');
                        setShowDriverSelect(false);
                        setSelectedDriver('');
                        setNotifyDriver(true);
                        if (onUpdate) onUpdate();
                      } catch (error) {
                        console.error('Assignment error:', error);
                        toast.error('Failed to assign driver');
                      } finally {
                        setUpdating(false);
                      }
                    }}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    {updating ? 'Assigning...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDriverSelect(false);
                      setSelectedDriver('');
                      setNotifyDriver(true);
                    }}
                    className="px-3 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}

        {canShowAssignDriverButton && status === 'ready' && !order.driver_id && (
          <>
            {showDriverSelect ? (
              <div className="space-y-2">
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select driver...</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.vehicle_type || 'No vehicle'})
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyDriver}
                    onChange={(e) => setNotifyDriver(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span>Notify driver with status</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!selectedDriver) {
                        toast.error('Please select a driver');
                        return;
                      }
                      try {
                        setUpdating(true);
                        
                        const { data: { user } } = await supabase.auth.getUser();
                        const adminEmail = user?.email || 'unknown';
                        const adminUserId = user?.id || null;
                        
                        const driver = drivers.find(d => d.id === selectedDriver);
                        
                        const { error: orderError } = await supabase
                          .from('orders')
                          .update({
                            driver_id: selectedDriver,
                            assigned_at: new Date().toISOString(),
                            delivery_status: 'assigned',
                            assigned_by_admin_id: adminUserId
                          })
                          .eq('id', order.id);
                        
                        if (orderError) throw orderError;
                        
                        const { error: logError } = await supabase
                          .from('delivery_assignments')
                          .insert({
                            order_id: order.id,
                            driver_id: selectedDriver,
                            assigned_by: adminEmail,
                            assigned_by_user_id: adminUserId,
                            status: 'assigned',
                            assigned_at: new Date().toISOString()
                          });
                        
                        if (logError) {
                          console.error('Failed to log assignment:', logError);
                        }
                        
                        if (notifyDriver && driver?.phone) {
                          const pickupAddress = 'H5F5+MGP, Djibouti';
                          const message = `Order #${order.id.slice(0, 8)} is ready for pickup!\nTotal: ${order.total_amount?.toLocaleString() || 0} DJF\nPickup: ${pickupAddress}${order.shipping_address ? `\nDeliver to: ${typeof order.shipping_address === 'object' ? `${order.shipping_address.address || ''}, ${order.shipping_address.city || ''}` : order.shipping_address}` : ''}\nPlease come collect the order.`;

                          await sendNotification({
                            orderId: order.id,
                            orderNumber: order.id.slice(0, 8),
                            customerName: driver.name || 'Driver',
                            customerPhone: driver.phone,
                            deliveryAddress: typeof order.shipping_address === 'object'
                              ? `${order.shipping_address.address || ''}, ${order.shipping_address.city || ''}`
                              : (order.shipping_address || ''),
                            totalAmount: order.total_amount || 0,
                            items: [],
                            customMessage: message
                          }, 'driver notification');
                        }
                        
                        toast.success(notifyDriver && driver?.phone ? 'Driver assigned and notified!' : 'Driver assigned successfully!');
                        setShowDriverSelect(false);
                        setSelectedDriver('');
                        setNotifyDriver(true);
                        if (onUpdate) onUpdate();
                      } catch (error) {
                        console.error('Assignment error:', error);
                        toast.error('Failed to assign driver');
                      } finally {
                        setUpdating(false);
                      }
                    }}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:bg-gray-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {updating ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDriverSelect(false);
                      setSelectedDriver('');
                      setNotifyDriver(true);
                    }}
                    className="px-3 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDriverSelect(true)}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:bg-gray-600 transition-colors"
              >
                <User className="w-4 h-4" />
                Assign Driver
              </button>
            )}
          </>
        )}

        {status === 'assigned' && (
          <div className="bg-blue-900/30 border border-blue-700 rounded p-2 text-xs text-center">
            <p className="text-blue-300 font-medium mb-1">📦 Driver Assigned</p>
            <p className="text-gray-400">Driver will take pickup photo when collecting items</p>
          </div>
        )}

        {status === 'out_for_delivery' && (
          <div className="bg-purple-900/30 border border-purple-700 rounded p-2 text-xs text-center">
            <p className="text-purple-300 font-medium mb-1">🚚 Out for Delivery</p>
            <p className="text-gray-400">Driver will take delivery photo when items are delivered</p>
          </div>
        )}

        {status === 'delivered' && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Delivered</span>
            </div>

            {/* COD-Specific: Cash Payment Confirmation */}
            {isCOD && order.payment_status !== 'paid' && order.sales_invoice_id && (
              <button
                onClick={async () => {
                  if (!confirm(`Confirm that cash payment of ${order.total_amount?.toLocaleString() || 0} DJF was received from the customer?`)) {
                    return;
                  }

                  try {
                    setUpdating(true);
                    toast.loading('Confirming cash payment...');
                    
                    const paymentResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-cod-payment`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                      },
                      body: JSON.stringify({ orderId: order.id })
                    });

                    if (paymentResponse.ok) {
                      const paymentResult = await paymentResponse.json();
                      toast.dismiss();
                      toast.success('✅ Cash payment confirmed! Payment Entry created in ERPNext.');
                      if (onUpdate) onUpdate();
                    } else {
                      const paymentError = await paymentResponse.json();
                      toast.dismiss();
                      toast.error(`Failed to confirm payment: ${paymentError.error || 'Unknown error'}`);
                    }
                  } catch (paymentError) {
                    toast.dismiss();
                    console.error('Cash confirmation error:', paymentError);
                    toast.error('Failed to confirm cash payment. Please try again.');
                  } finally {
                    setUpdating(false);
                  }
                }}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-600 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                {updating ? 'Confirming...' : 'Confirm Cash Received'}
              </button>
            )}

            {/* Show Delivery Photo if Available */}
            {order.delivery_photo_url && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Delivery Photo:</p>
                <a
                  href={order.delivery_photo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <img
                    src={order.delivery_photo_url}
                    alt="Delivery proof"
                    className="w-full h-auto max-h-32 object-cover"
                  />
                </a>
                {order.delivery_photo_taken_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    Taken: {new Date(order.delivery_photo_taken_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cancel option */}
        {(status === 'pending' || status === 'ready') && !order.driver_id && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to cancel this delivery?')) {
                handleStatusUpdate('cancel_delivery');
              }
            }}
            disabled={updating}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 border border-red-600/50 text-red-400 rounded text-sm hover:bg-red-600/30 disabled:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel Delivery
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryManager;

