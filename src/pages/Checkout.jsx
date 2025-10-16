import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ArrowLeft, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import OrderSummary from '../components/OrderSummary';
import ShippingForm from '../components/ShippingForm';
import PaymentForm from '../components/PaymentForm';
import toast from 'react-hot-toast';

// Initialize Stripe (you'll need to add your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51...');

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const { cart } = state;

  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [shippingData, setShippingData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    country: 'UAE',
    state: '',
    zipCode: '',
    phone: ''
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/shop');
    }
  }, [cart.items.length, navigate]);

  // Calculate totals
  const subtotal = cart.total;
  const shipping = subtotal > 200 ? 0 : 25; // Free shipping over $200
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + shipping + tax;

  const handleShippingChange = (data) => {
    setShippingData(data);
  };

  if (cart.items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-container py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-gray hover:text-coral-red transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-montserrat">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-slate-gray">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-container py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left - Checkout Form */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mobile Order Summary Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                className="w-full bg-white rounded-lg border p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-gray">
                    {isOrderSummaryOpen ? 'Hide' : 'Show'} order summary
                  </span>
                  <span className="font-bold text-lg">{total.toLocaleString('fr-DJ')} DJF</span>
                </div>
                {isOrderSummaryOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {isOrderSummaryOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <OrderSummary 
                    items={cart.items}
                    subtotal={subtotal}
                    shipping={shipping}
                    tax={tax}
                    total={total}
                  />
                </motion.div>
              )}
            </div>

            {/* Checkout Header */}
            <div>
              <h1 className="text-3xl font-bold font-palanquin text-slate-900 mb-2">
                Checkout
              </h1>
              <p className="text-slate-gray">
                Complete your order in just a few steps
              </p>
            </div>

            {/* Shipping Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold font-palanquin mb-6">
                Shipping Information
              </h2>
              <ShippingForm 
                data={shippingData}
                onChange={handleShippingChange}
              />
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold font-palanquin mb-6">
                Payment Information
              </h2>
              <Elements stripe={stripePromise}>
                <PaymentForm 
                  shippingData={shippingData}
                  total={total}
                  cartItems={cart.items}
                />
              </Elements>
            </div>
          </motion.div>

          {/* Right - Order Summary (Desktop) */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="sticky top-24">
              <OrderSummary 
                items={cart.items}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 