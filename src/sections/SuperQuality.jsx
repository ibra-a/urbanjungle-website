import { mbappeNike } from "../assets/images";
import { Button } from "../components";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const SuperQuality = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  return (
    <motion.section
      ref={ref}
      id='about-us'
      className='flex justify-between items-center max-lg:flex-col gap-10 w-full max-container relative'
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className='flex flex-1 flex-col px-4 sm:px-6 lg:px-0'
        initial={{ opacity: 0, x: -30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className='font-palanquin capitalize text-3xl sm:text-4xl lg:text-5xl lg:max-w-lg font-bold text-white'>
          Be Aware Of Our
          <span className='chrome-yellow-gradient'> Super </span>
          <span className='chrome-yellow-gradient'>Promotions </span>
        </h2>
        <p className='mt-4 lg:max-w-lg info-text text-base sm:text-lg'>
          Stay updated with our exclusive deals and limited-time offers. 
          Don't miss out on incredible savings and special promotions 
          designed to bring you premium footwear at unbeatable prices.
        </p>
        <p className='mt-6 lg:max-w-lg info-text text-base sm:text-lg'>
          Our promotional campaigns ensure you get the best value for the latest collections from top brands
        </p>
        <div className='mt-8 sm:mt-11'>
          <Button label='View promotions' variant="primary" />
        </div>
      </motion.div>

      <motion.div 
        className='flex-1 flex justify-center items-center relative px-4 sm:px-6 lg:px-0'
        initial={{ opacity: 0, x: 30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Dynamic gradient background */}
        <div className="mbappe-bg-gradient"></div>
        
        {/* Main Mbappe container with glow effects */}
        <div className="mbappe-container">
          <div className="mbappe-glow-border">
            <img
              src={mbappeNike}
              alt='Urban Jungle Collection'
              width={570}
              height={522}
              className='mbappe-image'
              loading="lazy"
            />
          </div>
          
          {/* Floating promotional badges */}
          <div className="mbappe-badge mbappe-badge-1">
            <span className="badge-text">LIMITED</span>
          </div>
          <div className="mbappe-badge mbappe-badge-2">
            <span className="badge-text">NEW</span>
          </div>
          <div className="mbappe-badge mbappe-badge-3">
            <span className="badge-text">30% OFF</span>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default SuperQuality;
