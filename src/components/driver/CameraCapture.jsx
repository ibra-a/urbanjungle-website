/**
 * Camera Capture Component
 * Allows drivers to take photos for proof of collection/delivery
 */

import { useState, useRef } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function CameraCapture({ orderId, photoType, onPhotoTaken, onCancel }) {
  const [capturing, setCapturing] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB allowed');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhoto({
        file,
        preview: e.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = async () => {
    if (!photo) return;

    setUploading(true);
    
    try {
      // Generate unique filename
      const uploadTimestamp = Date.now();
      const fileExt = photo.file.name.split('.').pop();
      const fileName = `${orderId}_${photoType}_${uploadTimestamp}.${fileExt}`;
      const filePath = `${photoType}/${fileName}`;

      console.log('📸 Uploading photo:', filePath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('delivery-photos')
        .upload(filePath, photo.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('✅ Photo uploaded:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('delivery-photos')
        .getPublicUrl(filePath);

      const photoUrl = urlData.publicUrl;
      console.log('📎 Photo URL:', photoUrl);

      // Update order in database
      const updateData = {};
      const timestampISO = new Date().toISOString();
      if (photoType === 'collection') {
        updateData.collection_photo_url = photoUrl;
        updateData.collection_photo_taken_at = timestampISO;
        updateData.delivery_status = 'out_for_delivery';
        updateData.status = 'out_for_delivery';
        updateData.out_for_delivery_at = timestampISO;
      } else {
        updateData.delivery_photo_url = photoUrl;
        updateData.delivery_photo_taken_at = timestampISO;
        updateData.delivery_status = 'delivered';
        updateData.status = 'delivered';
        updateData.delivered_at = timestampISO;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
      
      // ============================================================================
      // VERIFY: Ensure delivery_status was actually updated
      // ============================================================================
      if (photoType === 'delivery') {
        const { data: verifyOrder } = await supabase
          .from('orders')
          .select('delivery_status, status')
          .eq('id', orderId)
          .single();
        
        if (verifyOrder && verifyOrder.delivery_status !== 'delivered') {
          console.warn('⚠️ delivery_status not updated correctly, retrying...');
          // Retry the update
          await supabase
            .from('orders')
            .update({
              delivery_status: 'delivered',
              status: 'delivered',
              delivered_at: timestampISO
            })
            .eq('id', orderId);
        }
      }

      // Mark assignment completed once order is delivered
      if (photoType === 'delivery') {
        await supabase
          .from('delivery_assignments')
          .update({ status: 'completed' })
          .eq('order_id', orderId)
          .eq('status', 'assigned');

        // ============================================================================
        // AUTOMATIC ERP DOCUMENT SUBMISSION ON DELIVERY PHOTO (Option 3: Hybrid)
        // ============================================================================
        // When driver takes delivery photo, automatically submit ERP documents
        // This works for both CAC and COD orders
        // - CAC: Payment Entry already created on payment
        // - COD: Payment Entry will be created when admin confirms cash
        // 
        // HYBRID APPROACH:
        // 1. Check if order is synced to ERP
        // 2. If NOT synced → Auto-sync first (fallback)
        // 3. Then submit ERP documents (SO, DN, SI)
        // ============================================================================
        try {
          // Fetch current order status
          const { data: orderData } = await supabase
            .from('orders')
            .select('synced_to_erp, erp_order_id, payment_method, payment_status')
            .eq('id', orderId)
            .single();

          if (!orderData) {
            console.error('⚠️ Could not fetch order data');
            return;
          }

          // ============================================================================
          // STEP 1: Ensure order is synced to ERP (fallback if missed)
          // ============================================================================
          if (!orderData.synced_to_erp || !orderData.erp_order_id) {
            console.log('⚠️ Order not synced to ERP yet, auto-syncing now...');
            
            // Import sync function dynamically to avoid circular dependency
            const { syncOrderToERPNext } = await import('../../services/cacBankService');
            
            const syncResult = await syncOrderToERPNext(orderId);
            
            if (syncResult.success) {
              console.log('✅ Order auto-synced to ERP on delivery photo');
              toast.success('Order synced to ERP. Submitting documents...');
              
              // Refresh order data after sync
              const { data: refreshedOrder } = await supabase
                .from('orders')
                .select('synced_to_erp, erp_order_id')
                .eq('id', orderId)
                .single();
              
              if (refreshedOrder?.synced_to_erp && refreshedOrder?.erp_order_id) {
                orderData.synced_to_erp = true;
                orderData.erp_order_id = refreshedOrder.erp_order_id;
              } else {
                console.error('⚠️ Sync completed but flag not set, skipping ERP submission');
                toast.error('Order synced but ERP documents cannot be submitted. Admin can retry.');
                return;
              }
            } else {
              console.error('❌ Auto-sync failed:', syncResult.error);
              toast.error('Failed to sync order to ERP. Admin must sync manually.');
              return;
            }
          }

          // ============================================================================
          // STEP 2: Submit ERP documents (SO, DN, SI)
          // ============================================================================
          if (orderData.synced_to_erp && orderData.erp_order_id) {
            console.log('📋 Auto-submitting ERP documents on delivery photo...');
            
            const submitResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-erp-documents`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({ orderId })
            });

            if (submitResponse.ok) {
              const submitResult = await submitResponse.json();
              console.log('✅ ERP documents auto-submitted:', submitResult);
              toast.success('✅ Delivery confirmed! ERP documents submitted. Stock reduced.');
            } else {
              const submitError = await submitResponse.json();
              console.error('⚠️ ERP auto-submission failed:', submitError);
              toast.error('Photo uploaded, but ERP submission failed. Admin can retry.');
            }
          }
        } catch (erpError) {
          console.error('Error auto-submitting ERP documents:', erpError);
          // Don't fail the photo upload if ERP submission fails
          toast.error('Photo uploaded, but ERP submission failed. Admin can retry.');
        }

        // ============================================================================
        // CUSTOMER NOTIFICATION ON DELIVERY
        // ============================================================================
        // Notify customer via SMS and Email when order is delivered
        // ============================================================================
        try {
          // Fetch full order details for customer notification
          const { data: fullOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

          if (fullOrder) {
            // Get customer phone from shipping_address
            const shippingAddress = typeof fullOrder.shipping_address === 'string'
              ? JSON.parse(fullOrder.shipping_address)
              : fullOrder.shipping_address;
            
            const customerPhone = shippingAddress?.phone || shippingAddress?.phoneNumber || shippingAddress?.phone_number;
            const customerEmail = fullOrder.customer_email;

            if (customerPhone || customerEmail) {
              console.log('📧 Sending delivery notification to customer...');
              
              const items = typeof fullOrder.items === 'string' 
                ? JSON.parse(fullOrder.items) 
                : fullOrder.items;
              
              const itemsList = items.map(item => 
                `• ${item.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`
              ).join('\n');

              const deliveryMessage = `✅ Your order #${fullOrder.id.slice(0, 8).toUpperCase()} has been delivered!

Thank you for shopping with GAB Fashion House!

📦 Items:
${itemsList}

💰 Total: ${fullOrder.total_amount?.toLocaleString() || 0} DJF

If you have any questions, contact us:
📞 +253 77 20 01 29
💬 WhatsApp: +253 77 20 01 29

We hope you love your new items! 🎉`;

              const notificationResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-notification`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                  orderId: fullOrder.id,
                  orderNumber: fullOrder.id.slice(0, 8).toUpperCase(),
                  customerName: fullOrder.customer_name || 'Customer',
                  customerPhone: customerPhone,
                  customerEmail: customerEmail,
                  deliveryAddress: typeof fullOrder.shipping_address === 'object'
                    ? `${fullOrder.shipping_address.address || ''}, ${fullOrder.shipping_address.city || ''}`
                    : (fullOrder.shipping_address || ''),
                  totalAmount: fullOrder.total_amount || 0,
                  items: items,
                  customMessage: deliveryMessage,
                  customEmailSubject: `✅ Order Delivered - GAB Fashion House #${fullOrder.id.slice(0, 8).toUpperCase()}`
                })
              });

              if (notificationResponse.ok) {
                const notificationResult = await notificationResponse.json();
                console.log('✅ Customer notification sent:', notificationResult);
                // Don't show toast - customer notification is background process
              } else {
                const notificationError = await notificationResponse.json();
                console.error('⚠️ Customer notification failed:', notificationError);
                // Don't fail the delivery if notification fails
              }
            } else {
              console.log('⚠️ No customer phone or email found, skipping notification');
            }
          }
        } catch (notificationError) {
          console.error('Error sending customer notification:', notificationError);
          // Don't fail the delivery if notification fails
        }
      }

      toast.success('Photo uploaded successfully!');
      
      // ============================================================================
      // IMPORTANT: Refresh order data after photo upload
      // ============================================================================
      // This ensures the UI reflects the updated delivery_status immediately
      if (onPhotoTaken) {
      onPhotoTaken(photoUrl);
      }
      
      // Also trigger a page refresh/reload to ensure all components see the update
      // This is especially important for the admin Orders page
      if (photoType === 'delivery') {
        // Small delay to ensure database update is complete
        setTimeout(() => {
          // Dispatch a custom event that the Orders page can listen to
          window.dispatchEvent(new CustomEvent('order-delivered', { 
            detail: { orderId } 
          }));
        }, 500);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(`Failed to upload photo: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-700">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {photoType === 'collection' ? 'Collection Photo' : 'Delivery Photo'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!photo ? (
            // Camera capture view
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-8 text-center border-2 border-dashed border-gray-700">
                <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  {photoType === 'collection' 
                    ? 'Take a photo of the items you are collecting'
                    : 'Take a photo of the delivered items'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={handleTakePhoto}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera
                </button>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                  <strong>📸 Photo Tips:</strong>
                  <br />• Make sure items are clearly visible
                  <br />• Use good lighting
                  <br />• Keep camera steady
                  <br />• Max file size: 5MB
                </p>
              </div>
            </div>
          ) : (
            // Photo preview view
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-900">
                <img
                  src={photo.preview}
                  alt="Captured photo"
                  className="w-full h-auto"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRetake}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retake
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

