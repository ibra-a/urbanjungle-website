import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Banknote, Loader2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { supabase, orders } from '../services/supabase';

const CheckoutCOD = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const { cart, user } = state;

  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    region: '',
    country: 'Djibouti',
    zipCode: ''
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/shop');
    }
  }, [cart.items.length, navigate]);

  // Calculate totals (DJF currency)
  const subtotal = cart.total;
  const shipping = 0; // Free delivery for all orders
  const total = subtotal + shipping;

  const formatPrice = (amount) => {
    return `${Math.round(amount).toLocaleString()} DJF`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!shippingData.firstName || !shippingData.lastName || !shippingData.email ||
        !shippingData.phone || !shippingData.address || !shippingData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // ✅ COD ORDERS: NO stock reservation (tentative order, customer can cancel)
      // Stock will be reserved when driver takes collection photo
      
      // Create order in unified orders table
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          customer_id: user?.id,
          customer_name: `${shippingData.firstName} ${shippingData.lastName}`,
          customer_email: shippingData.email,
          customer_phone: shippingData.phone,
          shipping_address: shippingData,
          items: cart.items.map(item => ({
            item_code: item.itemCode || item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
            image: item.image
          })),
          total_amount: total,
          currency: 'DJF',
          payment_method: 'Cash on Delivery',
          payment_status: 'pending', // Will be paid on delivery
          status: 'pending', // CRITICAL FIX: Changed from 'confirmed' to 'pending' to match database constraint
          delivery_status: 'pending',
          synced_to_erp: false,
          store_name: 'Urban Jungle' // Store identifier
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cart
      actions.clearCart();

      // Redirect to success page
      toast.success('Order placed successfully!');
      navigate(`/payment-success?orderId=${order.id}`);

    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <Lock size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - Shipping Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-green-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Banknote className="text-green-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Cash on Delivery</h2>
                  <p className="text-sm text-gray-600">Pay when you receive your order</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>How it works:</strong> You'll pay in cash when your order is delivered to your doorstep.
                    Make sure to have the exact amount ready: <strong>{formatPrice(total)}</strong>
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={shippingData.firstName}
                      onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                      className="w-full px-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base min-h-[48px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={shippingData.lastName}
                      onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                      className="w-full px-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base min-h-[48px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email *</label>
                  <input
                    type="email"
                    value={shippingData.email}
                    onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                    className="w-full px-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base min-h-[48px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                    placeholder="77XXXXXX or 78XXXXXX"
                    className="w-full px-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base min-h-[48px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Address *</label>
                  <input
                    type="text"
                    value={shippingData.address}
                    onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                    className="w-full px-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base min-h-[48px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Apartment, suite, etc.</label>
                  <input
                    type="text"
                    value={shippingData.apartment}
                    onChange={(e) => setShippingData({ ...shippingData, apartment: e.target.value })}
                    className="w-full px-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base min-h-[48px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">City *</label>
                    <input
                      type="text"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      className="w-full px-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base min-h-[48px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Region</label>
                    <input
                      type="text"
                      value={shippingData.region}
                      onChange={(e) => setShippingData({ ...shippingData, region: e.target.value })}
                      className="w-full px-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base min-h-[48px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 sm:py-4 rounded-lg font-bold text-base sm:text-lg min-h-[52px] 
                    hover:from-green-700 hover:to-emerald-700 transition-all duration-300 
                    shadow-lg hover:shadow-xl
                    disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Place Order
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Right - Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:sticky lg:top-32 h-fit"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        Size: {item.size} {item.color && `• ${item.color}`}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total (Cash on Delivery)</span>
                  <span className="text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Banknote size={16} className="text-green-600" />
                  <span>Pay in Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-green-600" />
                  <span>Free Returns within 30 days</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCOD;

