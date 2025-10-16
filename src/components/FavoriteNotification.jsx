import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Heart } from 'lucide-react';

const FavoriteNotification = ({ isVisible, message, type, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-0 left-0 right-0 z-[100] ${
            type === 'added' 
              ? 'bg-green-600 text-white' 
              : 'bg-green-600 text-white'
          } px-4 py-3 flex items-center justify-center gap-3 shadow-lg`}
          style={{ marginTop: '0px' }}
        >
          <div className="flex items-center gap-2">
            {type === 'added' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Heart className="w-5 h-5" />
            )}
            <span className="font-medium text-sm tracking-wide">
              {message}
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FavoriteNotification; 