import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, CreditCard, Phone, User, Mail, MapPin, Loader2, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import * as cacBankService from '../services/cacBankService';
import toast from 'react-hot-toast';
import PaymentProcessing from '../components/PaymentProcessing';
import cacLogoVertical from '../assets/logos/For-White-BG-Vertical.png';
import NationalityInput from '../components/NationalityInput';

const CheckoutWithCAC = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const { cart, user } = state;

  // Form states
  const [step, setStep] = useState(1); // 1: shipping, 2: payment, 3: otp
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  
  // Shipping details
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
    zipCode: '',
    nationality: ''
  });

  // Payment state
  const [paymentData, setPaymentData] = useState({
    phoneNumber: '',
    otp: ''
  });

  // Transaction state
  const [transaction, setTransaction] = useState({
    orderId: null,
    transactionId: null,
    reference: null
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
  const shipping = 0; // ⚠️ TESTING: Shipping disabled for testing purposes
  const total = subtotal + shipping;

  // Format price in DJF
  const formatPrice = (amount) => {
    return `${Math.round(amount).toLocaleString()} DJF`;
  };

  // Handle shipping form submit
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!shippingData.firstName || !shippingData.lastName || !shippingData.email || 
        !shippingData.phone || !shippingData.address || !shippingData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setStep(2);
  };

  // Handle payment initiation
  const handleInitiatePayment = async (e) => {
    e.preventDefault();

    if (!paymentData.phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    // Validate Djibouti phone number format
    const phoneRegex = /^(77|78)\d{6}$/;
    if (!phoneRegex.test(paymentData.phoneNumber)) {
      toast.error('Please enter a valid Djibouti phone number (77XXXXXX or 78XXXXXX)');
      return;
    }

    // Clear any previous transaction data to start fresh
    setTransaction({
      orderId: null,
      paymentRequestId: null,
      reference: null
    });

    setIsProcessing(true);

    try {
      // Create order in Supabase
      const orderResult = await cacBankService.createOrder({
        userId: user?.id,
        items: cart.items.map(item => ({
          item_code: item.itemCode || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
          image: item.image
        })),
        totalAmount: total,
        shippingAddress: shippingData,
        phoneNumber: paymentData.phoneNumber,
        customerEmail: shippingData.email,
        customerName: `${shippingData.firstName} ${shippingData.lastName}`
      });

      if (!orderResult.success) {
        throw new Error('Failed to create order');
      }

      const orderId = orderResult.order.id;
      setTransaction(prev => ({ ...prev, orderId }));

      // Initiate CAC Bank payment
      const paymentResult = await cacBankService.initiatePayment({
        amount: total,
        phoneNumber: paymentData.phoneNumber,
        customerName: `${shippingData.firstName} ${shippingData.lastName}`,
        customerEmail: shippingData.email,
        orderId: orderId,
        description: `Urban Jungle - Order ${cart.items.length} items`
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment initiation failed');
      }

      // Update order with transaction details
      await cacBankService.updateOrderPayment(orderId, {
        paymentRequestId: paymentResult.paymentRequestId,
        transactionId: paymentResult.paymentRequestId,
        status: 'pending',
        paymentStatus: 'pending' // Changed from 'processing' to match constraint
      });

      setTransaction({
        orderId,
        paymentRequestId: paymentResult.paymentRequestId,
        reference: paymentResult.paymentRequestId
      });

      toast.success('OTP sent to your phone! Please check your messages.');
      setStep(3); // Move to OTP verification

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle OTP verification and payment confirmation
  const handleConfirmPayment = async (e) => {
    e.preventDefault();

    if (!paymentData.otp || paymentData.otp.length < 4) {
      toast.error('Please enter the OTP code');
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment with OTP
      const confirmResult = await cacBankService.confirmPayment({
        paymentRequestId: transaction.paymentRequestId,
        otp: paymentData.otp,
        phoneNumber: paymentData.phoneNumber
      });

      if (!confirmResult.success) {
        throw new Error(confirmResult.error || 'Payment confirmation failed');
      }

      // Payment confirmed successfully - no separate verification needed
      // CAC Bank confirmation is the final step
      
      // Update order status to completed
      await cacBankService.updateOrderPayment(transaction.orderId, {
        paymentRequestId: transaction.paymentRequestId,
        transactionId: confirmResult.reference || transaction.paymentRequestId,
        status: 'confirmed',
        paymentStatus: 'paid',
        reference: confirmResult.reference,
        confirmReference: confirmResult.confirmReference
      });

      // Show processing animation FIRST (before clearing cart)
      console.log('🎬 Showing processing animation for order:', transaction.orderId);
      setShowProcessing(true);
      
      // Clear cart after a delay (so page doesn't redirect)
      setTimeout(() => {
        actions.clearCart();
      }, 3000);

    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error(error.message || 'Payment confirmation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render checkout if cart is empty AND we're not showing processing screen
  if (cart.items.length === 0 && !showProcessing) {
    return null;
  }

  // If showing processing screen, only render that
  if (showProcessing) {
    return (
      <PaymentProcessing 
        onComplete={() => {
          navigate(`/payment-success?orderId=${transaction.orderId}`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#004488] border-b border-[#D4AF37] sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* CAC Logo Banner */}
          <div className="flex justify-center mb-4">
            <img 
              src={cacLogoVertical} 
              alt="CAC Bank" 
              className="h-20 object-contain"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}
              className="flex items-center gap-2 text-white hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-[#D4AF37]" />
              <span className="text-sm font-semibold text-white">Secure CACPay Checkout</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Confirm' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 ${step >= s.num ? 'text-white' : 'text-blue-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    step > s.num ? 'bg-[#D4AF37] text-[#003366]' : 
                    step === s.num ? 'bg-white text-[#003366]' : 
                    'bg-blue-800 text-blue-300'
                  }`}>
                    {step > s.num ? <Check size={16} /> : s.num}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{s.label}</span>
                </div>
                {idx < 2 && <div className={`w-12 h-0.5 mx-2 ${step > s.num ? 'bg-[#D4AF37]' : 'bg-blue-800'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left - Checkout Forms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-[#D4AF37]"
              >
                <h2 className="text-2xl font-bold mb-2 text-[#003366]">Shipping Information</h2>
                <p className="text-sm text-gray-600 mb-6">Enter your delivery details</p>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={shippingData.firstName}
                        onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={shippingData.lastName}
                        onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-base"
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
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-base"
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
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Address *</label>
                    <input
                      type="text"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Apartment, suite, etc.</label>
                    <input
                      type="text"
                      value={shippingData.apartment}
                      onChange={(e) => setShippingData({ ...shippingData, apartment: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">City *</label>
                      <input
                        type="text"
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Region</label>
                      <input
                        type="text"
                        value={shippingData.region}
                        onChange={(e) => setShippingData({ ...shippingData, region: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Nationality (Optional)</label>
                    <NationalityInput
                      value={shippingData.nationality}
                      onChange={(value) => setShippingData({ ...shippingData, nationality: value })}
                      placeholder="Select Nationality"
                      className="w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#003366] to-[#004488] text-white py-4 rounded-lg font-bold 
                      hover:from-[#004488] hover:to-[#003366] transition-all duration-300 
                      shadow-lg hover:shadow-xl border-2 border-[#D4AF37]"
                  >
                    Continue to Payment
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-[#D4AF37]"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-[#003366] mb-2">CACPay Payment</h2>
                  <p className="text-sm text-gray-600">Secure mobile money payment</p>
                </div>
                <form onSubmit={handleInitiatePayment} className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-[#D4AF37] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Phone className="text-[#003366] mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm text-[#003366] font-semibold mb-1">
                          Mobile Money Payment
                        </p>
                        <p className="text-xs text-gray-700">
                          Enter your phone number to receive an OTP code for payment confirmation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number for Payment *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="tel"
                        value={paymentData.phoneNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, phoneNumber: e.target.value })}
                        placeholder="77XXXXXX or 78XXXXXX"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 text-base"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      You will receive an OTP code to confirm payment
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-[#003366] to-[#004488] text-white py-4 rounded-lg font-bold 
                      hover:from-[#004488] hover:to-[#003366] transition-all duration-300 
                      shadow-lg hover:shadow-xl border-2 border-[#D4AF37]
                      disabled:from-gray-400 disabled:to-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Phone size={20} />
                        Send OTP
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 3: OTP Confirmation */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-[#D4AF37]"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-[#003366] mb-2">Confirm Payment</h2>
                  <p className="text-sm text-gray-600">Enter the verification code</p>
                </div>
                <form onSubmit={handleConfirmPayment} className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-[#D4AF37] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Check className="text-green-600 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm text-green-800 font-semibold mb-1">
                          OTP Sent Successfully!
                        </p>
                        <p className="text-xs text-gray-700">
                          Check your phone <strong>({paymentData.phoneNumber})</strong> for the verification code.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Enter OTP Code *</label>
                    <input
                      type="text"
                      value={paymentData.otp}
                      onChange={(e) => setPaymentData({ ...paymentData, otp: e.target.value })}
                      placeholder="Enter 4-6 digit code"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-center text-2xl font-mono tracking-widest text-gray-900"
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-bold 
                        hover:bg-gray-300 transition-all border-2 border-gray-300 hover:border-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold 
                        hover:from-green-700 hover:to-emerald-700 transition-all duration-300 
                        shadow-lg hover:shadow-xl border-2 border-[#D4AF37]
                        disabled:from-gray-400 disabled:to-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Check size={20} />
                          Confirm Payment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
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
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock size={16} className="text-green-600" />
                  <span>Secure CAC Bank Payment</span>
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

export default CheckoutWithCAC;

