import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { headerLogo } from '../assets/images';

const UJLoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            onLoadingComplete && onLoadingComplete();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50); // ~5 seconds total (100 steps * 50ms)

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Patterns with Nike Colors */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-500/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-yellow-400/20 rounded-full blur-xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/6 w-24 h-24 bg-yellow-500/15 rounded-full blur-lg"
              animate={{
                y: [0, -20, 0],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>

          <div className="text-center relative z-10">
            {/* Urban Jungle Logo with smooth entrance */}
            <motion.div
              className="mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <img 
                src={headerLogo}
                alt="Urban Jungle"
                className="h-16 w-auto mx-auto"
              />
            </motion.div>

            {/* Branded Text with staggered timing */}
            <motion.div
              className="mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.p 
                className="text-white text-xl sm:text-2xl font-montserrat font-light tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                EXPLORE YOUR STYLE
              </motion.p>
            </motion.div>

            {/* Progress Bar with Nike coral to amber gradient */}
            <motion.div
              className="w-64 mx-auto"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                  style={{ width: `${progress}%` }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
                
                {/* Glowing effect on progress bar */}
                <motion.div
                  className="absolute top-0 left-0 h-full bg-yellow-400 opacity-50 rounded-full blur-sm"
                  style={{ width: `${progress}%` }}
                  animate={{ 
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              {/* Percentage counter */}
              <motion.p
                className="text-white/60 text-xs font-montserrat mt-4 tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {Math.round(progress)}%
              </motion.p>
            </motion.div>
          </div>

          {/* Floating Coral Dots at absolute bottom of page */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex space-x-2">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-yellow-500 rounded-full"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UJLoadingScreen;