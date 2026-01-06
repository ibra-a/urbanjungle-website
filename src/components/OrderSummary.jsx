import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Shield, RotateCcw } from 'lucide-react';

const OrderSummary = ({ items, subtotal, shipping, tax, total }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <h2 className="text-xl font-semibold font-palanquin mb-6">
        Order Summary
      </h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <motion.div
            key={`${item.item_code}-${item.selectedSize || 'default'}`}
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="relative">
              <img
                src={item.image || '/api/placeholder/80/80'}
                alt={item.item_name}
                className="w-16 h-16 object-cover rounded-lg bg-gray-100"
              />
              <div className="absolute -top-2 -right-2 bg-coral-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {item.quantity}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">
                {item.item_name}
              </h3>
              {item.selectedSize && (
                <p className="text-xs text-slate-gray mb-1">
                  Size: {item.selectedSize}
                </p>
              )}
              <p className="text-sm font-semibold text-slate-900">
                {item.standard_rate.toLocaleString('fr-DJ')} DJF × {item.quantity}
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

      {/* Pricing Breakdown */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-gray">Subtotal</span>
          <span className="font-semibold">{subtotal.toLocaleString('fr-DJ')} DJF</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-gray">Shipping</span>
          <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
            {shipping === 0 ? 'FREE' : `${shipping.toLocaleString('fr-DJ')} DJF`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-gray">Tax</span>
          <span className="font-semibold">{tax.toLocaleString('fr-DJ')} DJF</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-slate-900">Total</span>
            <span className="text-lg font-bold text-slate-900">{total.toLocaleString('fr-DJ')} DJF</span>
          </div>
        </div>
      </div>

      {/* Free Shipping Notice */}
      {shipping > 0 && subtotal < 25000 && (
        <motion.div
          className="mt-4 p-3 bg-pale-blue rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-slate-gray text-center">
            Add <span className="font-semibold text-coral-red">
              {(25000 - subtotal).toLocaleString('fr-DJ')} DJF
            </span> more for free shipping
          </p>
        </motion.div>
      )}

      {/* Benefits */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-sm text-slate-gray">
          <Truck size={16} className="text-coral-red flex-shrink-0" />
          <span>Free shipping on orders over 25,000 DJF</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-gray">
          <RotateCcw size={16} className="text-coral-red flex-shrink-0" />
          <span>Free 60-day returns</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-gray">
          <Shield size={16} className="text-coral-red flex-shrink-0" />
          <span>2-year warranty included</span>
        </div>
      </div>

      {/* Member Benefits */}
      <div className="mt-6 p-4 bg-gradient-to-r from-coral-red/10 to-amber/10 rounded-lg border border-coral-red/20">
        <div className="text-center">
          <h3 className="font-semibold text-slate-900 mb-1">Urban Jungle Member Benefits</h3>
          <p className="text-sm text-slate-gray">
            Free shipping, exclusive access & more
          </p>
          <button className="mt-2 text-sm text-coral-red font-semibold hover:underline">
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary; 