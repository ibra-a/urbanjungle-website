import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

import { Button } from "../components";
import { arrowRight } from "../assets/icons";

const Hero = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.8
      }
    }
  };

  return (
    <motion.section
      ref={ref}
      id='home'
      className='relative w-full h-screen overflow-hidden'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Full Width Background Video */}
      <div className='absolute inset-0 w-full h-full'>
        <video
          className='w-full h-full object-cover'
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/Airmax.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for better text readability */}
        <div className='absolute inset-0 bg-black/40'></div>
      </div>

      {/* Content Overlay */}
      <div className='relative z-10 h-full flex flex-col justify-between'>
        
        {/* Main Content - Left positioned */}
        <motion.div
          className='flex-1 flex flex-col justify-center items-start pt-24 sm:pt-28 md:pt-32 lg:pt-20 px-4 sm:px-8 md:px-16 ml-4 sm:ml-8 md:ml-16'
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Main Headline */}
          <motion.h1
            className='font-montserrat text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight text-white max-w-4xl'
            variants={itemVariants}
          >
            <span className='block'>
              Fuel <span className='chrome-yellow-gradient'>your Game.</span>
            </span>
            <span className='block mt-2'>Shop The Brands.</span> 
            <span className='chrome-yellow-gradient block mt-2'>You Love.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className='font-montserrat text-white/90 text-base sm:text-lg lg:text-xl leading-relaxed mt-4 sm:mt-6 md:mt-8 max-w-lg font-light'
            variants={itemVariants}
          >
            Discover premium athletic gear from your favorite brands. Experience the perfect blend of style, performance, and innovation.
          </motion.p>
        </motion.div>

        {/* Bottom Buttons Section - Nike UAE Style */}
        <motion.div
          className='pb-6 sm:pb-8 md:pb-12 flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 px-4 sm:px-8 md:px-16 ml-4 sm:ml-8 md:ml-16'
          variants={buttonVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Primary Shop All Button - Urban Jungle Yellow with Glow */}
          <Link to="/shop" className="w-full sm:w-auto">
            <motion.button
              className='w-full sm:w-auto bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full font-montserrat font-semibold text-base sm:text-lg transition-all duration-300 relative overflow-hidden group'
              whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              style={{
                boxShadow: "0 4px 15px rgba(251, 191, 36, 0.3)"
              }}
            >
              <span className='relative z-10'>Shop All</span>
              <motion.div
                className='absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 100%'
                }}
              />
            </motion.button>
          </Link>

          {/* Secondary Shop Kids Button - Yellow Fill on Hover */}
          <Link to="/kids" className="w-full sm:w-auto">
            <motion.button
              className='w-full sm:w-auto bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-montserrat font-semibold text-base sm:text-lg transition-all duration-300 relative overflow-hidden group'
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "#fbbf24",
                boxShadow: "0 8px 30px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className='relative z-10 group-hover:text-black transition-colors duration-300'>Shop Kids'</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Subtle bottom gradient for better button visibility */}
        <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none'></div>
      </div>
    </motion.section>
  );
};

export default Hero;
