import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { star } from "../assets/icons";
import FavoriteButton from "./FavoriteButton";
import toast from 'react-hot-toast';

const PopularProductCard = ({ imgURL, name, price, product }) => {
  const { state } = useApp();
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (product?.item_code) {
      navigate(`/product/${product.item_code}`);
    }
  };

  return (
    <motion.div 
      className='flex flex-1 flex-col w-full max-sm:w-full group cursor-pointer'
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
    >
      {/* Image container with modern styling */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 modern-card'>
        <motion.img 
          src={imgURL} 
          alt={name} 
          className='w-full h-[280px] object-contain transition-transform duration-500 group-hover:scale-110' 
          whileHover={{ rotateY: 5 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Gradient overlay on hover */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl' />
        
        {/* Nike-Style Favorite Button - only show for authenticated users */}
        {state.isAuthenticated && product && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FavoriteButton 
              product={product} 
              size="md"
              className="transform hover:scale-110"
            />
          </div>
        )}
        
        {/* Floating badge */}
        <div className='absolute top-4 left-4 bg-coral-red text-white px-3 py-1 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          New
        </div>
      </div>

      {/* Content section */}
      <div className='mt-6 space-y-3'>
        {/* Rating */}
        <motion.div 
          className='flex justify-start items-center gap-2.5'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <img src={star} alt='rating icon' width={20} height={20} />
          <p className='font-montserrat text-lg leading-normal text-slate-gray'>
            (4.5)
          </p>
          <div className='flex gap-1 ml-2'>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < 4 ? 'bg-yellow-400' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Product name */}
        <motion.h3 
          className='text-xl sm:text-2xl leading-normal font-semibold font-palanquin text-slate-900 group-hover:text-coral-red transition-colors duration-300'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {name}
        </motion.h3>

        {/* Price and action */}
        <div className='flex justify-between items-center'>
          <motion.p 
            className='font-montserrat font-bold text-xl sm:text-2xl leading-normal gradient-text'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {price}
          </motion.p>
          
          <motion.button
            className='opacity-0 group-hover:opacity-100 bg-coral-red text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-coral-red/90'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0, x: 0 }}
            whileInView={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              // Add to cart logic here
              toast.success('Added to cart!');
            }}
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PopularProductCard;
