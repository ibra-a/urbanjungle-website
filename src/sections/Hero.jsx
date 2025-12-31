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
          className='flex-1 flex flex-col justify-center items-start pt-20 px-8 sm:px-16 ml-8 sm:ml-16'
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Main Headline */}
          <motion.h1
            className='font-montserrat text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight text-white max-w-4xl'
            variants={itemVariants}
          >
            <span className='block'>
              Fuel <span className='chrome-red-gradient'>your Game.</span>
            </span>
            <span className='block mt-2'>Shop The Brands.</span> 
            <span className='chrome-red-gradient block mt-2'>You Love.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className='font-montserrat text-white/90 text-lg lg:text-xl leading-relaxed mt-8 max-w-lg font-light'
            variants={itemVariants}
          >
            Discover premium athletic gear from your favorite brands. Experience the perfect blend of style, performance, and innovation.
          </motion.p>
        </motion.div>

        {/* Bottom Buttons Section - Nike UAE Style */}
        <motion.div
          className='pb-12 flex flex-col sm:flex-row gap-4 sm:gap-6 px-8 sm:px-16 ml-8 sm:ml-16'
          variants={buttonVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Primary Shop All Button */}
          <Link to="/shop">
            <motion.button
              className='bg-white text-black px-8 py-4 rounded-full font-montserrat font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Shop All
            </motion.button>
          </Link>

          {/* Secondary Shop Kids Button */}
          <Link to="/kids">
            <motion.button
              className='bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-montserrat font-semibold text-lg hover:bg-white hover:text-black transition-all duration-300'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Shop Kids'
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
