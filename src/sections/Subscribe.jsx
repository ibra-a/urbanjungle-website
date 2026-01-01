import { Button } from "../components";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribing:", email);
    setEmail("");
  };

  return (
    <motion.section
      ref={ref}
      id='contact-us'
      className='max-container flex justify-between items-center max-lg:flex-col gap-10'
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <motion.h3 
        className='text-4xl leading-[68px] lg:max-w-md font-palanquin font-bold text-white'
        initial={{ opacity: 0, x: -30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Sign Up for
        <span className='chrome-yellow-gradient'> Updates </span>& Newsletter
      </motion.h3>
      
      <motion.form
        onSubmit={handleSubmit}
        className='lg:max-w-[40%] w-full'
        initial={{ opacity: 0, x: 30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div 
          className={`flex items-center max-sm:flex-col gap-5 p-2.5 sm:border rounded-full transition-all duration-300 ${
            isFocused 
              ? 'sm:border-yellow-500 sm:shadow-lg sm:shadow-yellow-500/30' 
              : 'sm:border-slate-gray'
          }`}
        >
          <input 
            type='email' 
            placeholder='Enter your email' 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className='input flex-1 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30' 
          />
          <div className='flex max-sm:justify-end items-center max-sm:w-full'>
            <motion.button
              type="submit"
              className='bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black px-8 py-4 rounded-full font-montserrat font-semibold text-base sm:text-lg transition-all duration-300 relative overflow-hidden group w-full sm:w-auto'
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 8px 30px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              style={{ boxShadow: "0 4px 15px rgba(251, 191, 36, 0.3)" }}
            >
              <span className='relative z-10'>Sign Up</span>
              <motion.div
                className='absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 opacity-0 group-hover:opacity-100'
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
          </div>
        </div>
      </motion.form>
    </motion.section>
  );
};

export default Subscribe;
