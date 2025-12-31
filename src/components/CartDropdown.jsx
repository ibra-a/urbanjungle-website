import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CartDropdown = ({ isOpen, onClose }) => {
  const { state, actions } = useApp();
  const { cart } = state;
  const navigate = useNavigate();

  // Find the most recently added item
  const recentlyAdded = cart.items.find(item => item.isJustAdded);

  // Clear the "just added" flag after showing the confirmation
  useEffect(() => {
    if (recentlyAdded && isOpen) {
      const timer = setTimeout(() => {
        // Remove the isJustAdded flag from all items
        cart.items.forEach(item => {
          if (item.isJustAdded) {
            const updatedItem = { ...item };
            delete updatedItem.isJustAdded;
            actions.updateCartQuantity({
              id: item.id,
              size: item.size,
              quantity: item.quantity
            });
          }
        });
      }, 3000); // Remove flag after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [recentlyAdded, isOpen, cart.items, actions]);

  const updateQuantity = (item, newQuantity) => {
    if (newQuantity === 0) {
      actions.removeFromCart({ id: item.id, size: item.size });
    } else {
      actions.updateCartQuantity({
        id: item.id,
        size: item.size,
        quantity: newQuantity
      });
    }
  };

  const removeItem = (item) => {
    actions.removeFromCart({ id: item.id, size: item.size });
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleViewBag = () => {
    onClose();
    navigate('/cart'); // Navigate to full cart page
  };

  // Calculate cart total
  const cartTotal = cart.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Cart Dropdown - Nike Style */}
          <motion.div
            className="fixed top-16 right-4 w-96 max-w-[90vw] bg-white rounded-lg shadow-2xl border border-gray-100 z-50 max-h-[80vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header with Added Confirmation */}
            {recentlyAdded && (
              <div className="bg-green-50 border-b border-green-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800">Added To Bag</p>
                    
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-green-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Regular Header */}
            {!recentlyAdded && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Bag</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}

            {/* Cart Content */}
            <div className="p-4">
              {cart.items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Your bag is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Show only the most recent item for clean UI */}
                  {(recentlyAdded ? [recentlyAdded] : [cart.items[0]]).map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          Size {item.size}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.price.toLocaleString('fr-DJ')} DJF
                        </p>
                        {cart.items.length > 1 && (
                          <p className="text-xs text-gray-400 mt-1">
                            +{cart.items.length - 1} more in bag
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Actions */}
            {cart.items.length > 0 && (
              <div className="p-4 border-t border-gray-100 space-y-3">
                {/* Subtotal Display */}
                <div className="flex items-center justify-between py-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {cartTotal.toLocaleString('fr-DJ')} DJF
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleViewBag}
                    className="px-4 py-3 border border-gray-300 text-gray-900 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    View Bag ({cart.itemCount})
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="px-4 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDropdown; 