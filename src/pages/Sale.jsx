import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, ArrowLeft } from 'lucide-react';

const Sale = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <motion.div
        className="max-w-2xl w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icon */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500 rounded-full blur-2xl opacity-30"></div>
            <div className="relative bg-white p-8 rounded-full shadow-xl">
              <ShoppingBag className="w-16 h-16 text-yellow-500 mx-auto" />
            </div>
          </div>
        </motion.div>

        {/* Coming Soon Text */}
        <motion.h1
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Coming Soon
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          We're preparing something amazing for you!
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-2 text-gray-500 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Clock className="w-5 h-5" />
          <span className="text-sm">Sale section will be available soon</span>
        </motion.div>

        {/* Back to Shop Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Shop
          </Link>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-12 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <p>Check back soon for exclusive deals and discounts!</p>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default Sale;

