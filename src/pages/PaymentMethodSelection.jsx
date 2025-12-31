import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, ChevronRight, Banknote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import cacLogoHorizontal from '../assets/logos/For-White-BG-Horizontal.png';

const PaymentMethodSelection = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const { cart } = state;

  // Redirect if cart is empty
  React.useEffect(() => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/shop');
    }
  }, [cart.items.length, navigate]);

  // Calculate totals (DJF currency)
  const subtotal = cart.total;
  const shipping = 0; // ⚠️ TEMPORARY: Shipping disabled for testing (matches Tommy CK)
  const total = subtotal + shipping;

  const formatPrice = (amount) => {
    return `${Math.round(amount).toLocaleString()} DJF`;
  };

  const paymentMethods = [
    {
      id: 'cacpay',
      name: 'CACPay',
      description: 'Pay with your phone number',
      logo: cacLogoHorizontal,
      logoAlt: 'CAC Bank Logo',
      badge: '🔒 Secure OTP verification',
      available: true,
      route: '/checkout/cacpay',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200 hover:border-[#003366]',
      textColor: 'text-gray-900',
      badgeColor: 'text-[#D4AF37]'
    },
    {
      id: 'dmoney',
      name: 'D-Money',
      description: 'Mobile Money Payment',
      logo: null,
      logoAlt: 'D-Money Logo',
      badge: '🔒 Coming Soon',
      available: false,
      route: null,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-400',
      badgeColor: 'text-gray-400'
    },
    {
      id: 'salam',
      name: 'Salam Bank',
      description: 'Online Banking Payment',
      logo: null,
      logoAlt: 'Salam Bank Logo',
      badge: '🔒 Coming Soon',
      available: false,
      route: null,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-400',
      badgeColor: 'text-gray-400'
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      logo: null,
      logoAlt: null,
      badge: '💵 Always Available',
      available: true,
      route: '/checkout/cash-on-delivery',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200 hover:border-green-500',
      textColor: 'text-gray-900',
      badgeColor: 'text-green-600'
    }
  ];

  const handlePaymentMethodClick = (method) => {
    if (!method.available) {
      toast.error('This payment method is coming soon!');
      return;
    }
    navigate(method.route);
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
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Choose Your Payment Method</h1>
            <p className="text-gray-600">Select how you'd like to pay for your order</p>
          </motion.div>

          {/* Order Summary Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg p-6 mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80 mb-1">Order Total</p>
                <p className="text-3xl font-bold">{formatPrice(total)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">{cart.items.length} items</p>
                {shipping === 0 && (
                  <p className="text-sm text-green-400 font-medium">Free Shipping ✓</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Payment Methods Grid */}
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <button
                  onClick={() => handlePaymentMethodClick(method)}
                  disabled={!method.available}
                  className={`w-full ${method.bgColor} border-2 ${method.borderColor} rounded-xl p-6 
                    transition-all duration-300 hover:shadow-lg
                    ${method.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Logo or Icon */}
                      <div className="w-24 h-16 flex items-center justify-center">
                        {method.logo ? (
                          <img
                            src={method.logo}
                            alt={method.logoAlt}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : method.id === 'cash' ? (
                          <Banknote size={40} className={method.textColor} />
                        ) : (
                          <div className={`text-4xl font-bold ${method.textColor}`}>
                            {method.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left">
                        <h3 className={`text-xl font-bold ${method.textColor} mb-1`}>
                          {method.name}
                        </h3>
                        <p className={`text-sm ${method.available ? 'text-gray-600' : 'text-gray-400'}`}>
                          {method.description}
                        </p>
                        <p className={`text-xs ${method.badgeColor} font-medium mt-2`}>
                          {method.badge}
                        </p>
                      </div>

                      {/* Arrow */}
                      {method.available && (
                        <ChevronRight 
                          size={24} 
                          className="text-gray-400 group-hover:text-gray-600 transition-colors" 
                        />
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white rounded-lg p-6 border"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Lock size={24} className="text-green-600" />
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-gray-500">Your payment is protected</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-gray-500">30-day return policy</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">Order Updates</p>
                <p className="text-xs text-gray-500">Track your delivery</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelection;

