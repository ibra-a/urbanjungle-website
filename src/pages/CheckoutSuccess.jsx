import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Mail, Download, ArrowRight } from 'lucide-react';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Get order data from navigation state or localStorage
    const order = location.state?.orderData || JSON.parse(localStorage.getItem('lastOrder') || 'null');
    
    if (!order) {
      navigate('/shop');
      return;
    }
    
    setOrderData(order);
  }, [location.state, navigate]);

  if (!orderData) {
    return null;
  }

  const { orderId, items, shipping, total, createdAt } = orderData;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-container py-12">
        {/* Success Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          >
            <CheckCircle size={48} className="text-green-600" />
          </motion.div>
          
          <h1 className="text-4xl font-bold font-palanquin text-slate-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-slate-gray mb-2">
            Thank you for your order, {shipping.firstName}!
          </p>
          <p className="text-lg text-slate-gray">
            Order #{orderId}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left - Order Details */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold font-palanquin mb-6">
                Order Summary
              </h2>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={`${item.item_code}-${item.selectedSize || 'default'}`}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  >
                    <img
                      src={item.image || '/api/placeholder/80/80'}
                      alt={item.item_name}
                      className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {item.item_name}
                      </h3>
                      {item.selectedSize && (
                        <p className="text-sm text-slate-gray mb-1">
                          Size: {item.selectedSize}
                        </p>
                      )}
                      <p className="text-sm text-slate-gray">
                        Qty: {item.quantity} × ${item.standard_rate}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {(item.standard_rate * item.quantity).toLocaleString('fr-DJ')} DJF
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="border-t mt-6 pt-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    Total: {total.toLocaleString('fr-DJ')} DJF
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold font-palanquin mb-6">
                Shipping Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Delivery Address</h3>
                  <div className="text-slate-gray space-y-1">
                    <p>{shipping.firstName} {shipping.lastName}</p>
                    <p>{shipping.address}</p>
                    {shipping.apartment && <p>{shipping.apartment}</p>}
                    <p>{shipping.city}, {shipping.state} {shipping.zipCode}</p>
                    <p>{shipping.country}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Contact Information</h3>
                  <div className="text-slate-gray space-y-1">
                    <p>{shipping.email}</p>
                    <p>{shipping.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Next Steps */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Order Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold font-palanquin mb-6">
                What's Next?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">Order Confirmed</p>
                    <p className="text-sm text-green-600">Just now</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Package size={20} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-800">Processing</p>
                    <p className="text-sm text-blue-600">1-2 business days</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Truck size={20} className="text-slate-gray flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Shipped</p>
                    <p className="text-sm text-slate-gray">3-5 business days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Confirmation */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <Mail size={20} className="text-coral-red" />
                <h3 className="font-semibold text-slate-900">Email Confirmation</h3>
              </div>
              <p className="text-slate-gray text-sm mb-4">
                We've sent a confirmation email to {shipping.email} with your order details and tracking information.
              </p>
              <button className="flex items-center gap-2 text-coral-red hover:underline font-semibold text-sm">
                <Download size={16} />
                Download Receipt
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                to="/shop"
                className="w-full bg-coral-red hover:bg-coral-red/90 text-white font-semibold 
                           py-3 px-6 rounded-lg transition-all duration-200 
                           flex items-center justify-center gap-2"
              >
                Continue Shopping
                <ArrowRight size={16} />
              </Link>
              
              <button className="w-full bg-white hover:bg-gray-50 text-coral-red border border-coral-red 
                               font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                Track Your Order
              </button>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-r from-coral-red/10 to-amber/10 rounded-lg p-4 border border-coral-red/20">
              <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
              <p className="text-sm text-slate-gray mb-3">
                Our customer service team is here to help with any questions about your order.
              </p>
              <button className="text-coral-red hover:underline font-semibold text-sm">
                Contact Support →
              </button>
            </div>
          </motion.div>
        </div>

        {/* Recommended Products */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-palanquin text-slate-900 mb-4">
              You Might Also Like
            </h2>
            <p className="text-slate-gray">
              Complete your Nike collection with these popular items
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow"
                whileHover={{ y: -4 }}
              >
                <img
                  src={`/api/placeholder/200/200`}
                  alt={`Product ${i}`}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-slate-900 mb-2">Nike Product {i}</h3>
                <p className="text-slate-gray text-sm mb-3">Recommended for you</p>
                <p className="text-xl font-bold text-slate-900">$99.99</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutSuccess; 