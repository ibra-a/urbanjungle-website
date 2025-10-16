import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Lock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const PaymentForm = ({ shippingData, total, cartItems }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [savePayment, setSavePayment] = useState(false);

  // Card element styling
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        fontFamily: 'Montserrat, system-ui, sans-serif',
        '::placeholder': {
          color: '#64748b',
        },
        iconColor: '#FF6B35',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  const validateForm = () => {
    const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'zipCode', 'phone'];
    const missing = requiredFields.filter(field => !shippingData[field]);
    
    if (missing.length > 0) {
      toast.error('Please fill in all required shipping information');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'card') {
        await handleCardPayment();
      } else if (paymentMethod === 'apple') {
        await handleApplePayment();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    const cardElement = elements.getElement(CardElement);

    // Create payment method
    const { error, paymentMethod: pm } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: `${shippingData.firstName} ${shippingData.lastName}`,
        email: shippingData.email,
        phone: shippingData.phone,
        address: {
          line1: shippingData.address,
          line2: shippingData.apartment,
          city: shippingData.city,
          state: shippingData.state,
          postal_code: shippingData.zipCode,
          country: shippingData.country === 'UAE' ? 'AE' : shippingData.country,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    // For demo purposes, we'll simulate a successful payment
    // In production, you'd send this to your backend to create a payment intent
    await simulatePayment(pm);
  };

  const handleApplePayment = async () => {
    // Apple Pay integration would go here
    // For demo purposes, we'll simulate
    await simulatePayment({ id: 'apple_pay_demo' });
  };

  const simulatePayment = async (paymentMethod) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create order data
    const orderData = {
      orderId: `ORD-${Date.now()}`,
      items: cartItems,
      shipping: shippingData,
      payment: {
        method: paymentMethod.id,
        amount: total,
      },
      total,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage for demo
    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    // Clear cart
    dispatch({ type: 'CLEAR_CART' });

    // Show success and redirect
    toast.success('Order placed successfully!');
    navigate('/checkout/success', { 
      state: { orderData } 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold font-palanquin mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-coral-red" />
          Payment Method
        </h3>
        
        <div className="space-y-3">
          {/* Credit Card */}
          <motion.div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              paymentMethod === 'card' 
                ? 'border-coral-red bg-coral-red/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => setPaymentMethod('card')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-coral-red focus:ring-coral-red"
              />
              <CreditCard size={20} className="text-slate-gray" />
              <span className="font-semibold">Credit or Debit Card</span>
              <div className="ml-auto flex gap-2">
                <img src="/api/placeholder/24/16" alt="Visa" className="h-4" />
                <img src="/api/placeholder/24/16" alt="Mastercard" className="h-4" />
                <img src="/api/placeholder/24/16" alt="Amex" className="h-4" />
              </div>
            </div>
          </motion.div>

          {/* Apple Pay */}
          <motion.div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              paymentMethod === 'apple' 
                ? 'border-coral-red bg-coral-red/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => setPaymentMethod('apple')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="apple"
                checked={paymentMethod === 'apple'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-coral-red focus:ring-coral-red"
              />
              <Smartphone size={20} className="text-slate-gray" />
              <span className="font-semibold">Apple Pay</span>
              <div className="ml-auto">
                <img src="/api/placeholder/40/24" alt="Apple Pay" className="h-6" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Card Details */}
      {paymentMethod === 'card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Card Information
            </label>
            <div className="border rounded-lg p-4 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* Save Payment Method */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="savePayment"
              checked={savePayment}
              onChange={(e) => setSavePayment(e.target.checked)}
              className="w-4 h-4 text-coral-red bg-gray-100 border-gray-300 rounded focus:ring-coral-red focus:ring-2"
            />
            <label htmlFor="savePayment" className="text-sm text-slate-gray">
              Save payment method for future purchases
            </label>
          </div>
        </motion.div>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <Lock size={16} className="text-green-600 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-green-800">Your payment is secure</p>
          <p className="text-green-600">
            All transactions are encrypted and processed securely through Stripe
          </p>
        </div>
      </div>

      {/* Terms */}
      <div className="text-sm text-slate-gray">
        <p>
          By placing your order, you agree to Nike's{' '}
          <button className="text-coral-red hover:underline font-semibold">
            Terms of Use
          </button>{' '}
          and{' '}
          <button className="text-coral-red hover:underline font-semibold">
            Privacy Policy
          </button>
        </p>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-coral-red hover:bg-coral-red/90 disabled:bg-gray-400 
                   text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200
                   flex items-center justify-center gap-3 text-lg"
        whileHover={{ scale: isProcessing ? 1 : 1.02 }}
        whileTap={{ scale: isProcessing ? 1 : 0.98 }}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <CheckCircle size={20} />
            Complete Order • ${total.toFixed(2)}
          </>
        )}
      </motion.button>

      {/* Payment Benefits */}
      <div className="text-center space-y-2 text-sm text-slate-gray">
        <p>✓ Free returns within 60 days</p>
        <p>✓ 2-year warranty included</p>
        <p>✓ 24/7 customer support</p>
      </div>
    </form>
  );
};

export default PaymentForm; 