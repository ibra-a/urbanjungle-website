import { motion } from "framer-motion";
import { kobeBryant, africanike } from "../assets/images";
import { Button } from "./";

const PromoSections = () => {
  return (
    <section className="w-full bg-black">
      <div className="max-container flex max-lg:flex-col">
        {/* Premium Section */}
        <motion.div 
          className="flex-1 relative h-[500px] lg:h-[600px] overflow-hidden group"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${kobeBryant})` }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center padding-x">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-md"
            >
              <h2 className="font-palanquin text-4xl lg:text-5xl font-bold text-white mb-4">
                PREMIUM
                <span className="block electric-promo-text">COLLECTION</span>
              </h2>
              <p className="text-white/80 text-lg font-montserrat mb-8 leading-relaxed">
                Discover our exclusive premium selection featuring the latest releases, 
                limited editions, and cutting-edge designs for the ultimate athletic experience.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  label="Shop Premium" 
                  variant="primary"
                />
              </motion.div>
            </motion.div>
          </div>
          
          {/* Floating Badge */}
          <motion.div
            className="absolute top-8 right-8 bg-gradient-to-r from-yellow-500 to-yellow-400 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            EXCLUSIVE
          </motion.div>
        </motion.div>

        {/* Outlet Section */}
        <motion.div 
          className="flex-1 relative h-[500px] lg:h-[600px] overflow-hidden group"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${africanike})` }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/50 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center padding-x">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="max-w-md ml-auto text-right"
            >
              <h2 className="font-palanquin text-4xl lg:text-5xl font-bold text-white mb-4">
                OUTLET
                <span className="block electric-promo-text">DEALS</span>
              </h2>
              <p className="text-white/80 text-lg font-montserrat mb-8 leading-relaxed">
                Unbeatable prices on quality athletic gear. Save big on previous seasons, 
                overstock items, and special clearance deals across all categories.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  label="Shop Outlet" 
                  variant="secondary"
                />
              </motion.div>
            </motion.div>
          </div>
          
          {/* Floating Badge */}
          <motion.div
            className="absolute top-8 left-8 bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            SAVE 50%
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PromoSections; 