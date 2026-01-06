import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const MegaMenu = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  const menuItems = [
    { key: 'men', label: 'Men' },
    { key: 'women', label: 'Women' },
    { key: 'kids', label: 'Kids' },
    { key: 'brands', label: 'Brands' },
    { key: 'sale', label: 'Sale' }
  ];

  // Updated menu configurations with Accessories and Sale
  const menuConfigs = {
    men: [
      { label: 'All', href: '/men' },
      { label: 'Apparel', href: '/shop?category=men&type=apparel' },
      { label: 'Footwear', href: '/shop?category=men&type=footwear' },
      { label: 'Accessories', href: '/shop?category=men&type=accessories' }
    ],
    women: [
      { label: 'All', href: '/women' },
      { label: 'Apparel', href: '/shop?category=women&type=apparel' },
      { label: 'Footwear', href: '/shop?category=women&type=footwear' },
      { label: 'Accessories', href: '/shop?category=women&type=accessories' }
    ],
    kids: [
      { label: 'All', href: '/kids' },
      { label: 'Apparel', href: '/shop?category=kids&type=apparel' },
      { label: 'Footwear', href: '/shop?category=kids&type=footwear' },
      { label: 'Accessories', href: '/shop?category=kids&type=accessories' }
    ],
    brands: [
      { label: 'Nike', href: '/shop?brand=nike' },
      { label: 'Jordan', href: '/shop?brand=jordan' },
      { label: 'Adidas', href: '/shop?brand=adidas' },
      { label: 'Converse', href: '/shop?brand=converse' }
    ],
    sale: [
      { label: 'Coming Soon', href: '/sale' }
    ]
  };

  const handleMouseEnter = (menuKey) => {
    setActiveMenu(menuKey);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  return (
    <div className="relative">
      {/* Main Navigation Items */}
      <div className="flex items-center space-x-8">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className="relative"
            onMouseEnter={() => handleMouseEnter(item.key)}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`text-white hover:text-yellow-500 transition-all duration-300 font-semibold text-sm py-4 uppercase tracking-wide relative group hover-underline-animation cursor-pointer ${
                activeMenu === item.key ? 'text-yellow-500' : ''
              }`}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Mega Menu Dropdown */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            className="absolute top-full left-0 bg-white shadow-2xl border-0 rounded-xl z-50 min-w-[320px] overflow-hidden backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onMouseEnter={() => setActiveMenu(activeMenu)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Header accent */}
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-400"></div>
            
            <div className="py-3">
              {menuConfigs[activeMenu]?.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className="group flex items-center px-6 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-gray-50 hover:to-yellow-50 hover:text-yellow-500 transition-all duration-300 font-medium text-sm relative overflow-hidden"
                >
                  {/* Hover accent line */}
                  <span className="absolute left-0 top-0 h-full w-1 bg-yellow-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></span>
                  
                  {/* Text with subtle animation */}
                  <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-300 font-semibold uppercase tracking-wide">
                    {item.label}
                  </span>
                  
                  {/* Arrow indicator */}
                  <svg 
                    className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-yellow-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
            
            {/* Bottom accent */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-30"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom CSS for animated underline */}
      <style>{`
        .hover-underline-animation {
          position: relative;
          display: inline-block;
        }

        .hover-underline-animation::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 3px;
          bottom: 10px;
          left: 0;
          background: linear-gradient(90deg, #FCD34D, #FBBF24);
          border-radius: 2px;
          transform-origin: bottom left;
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .hover-underline-animation:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
      `}</style>
    </div>
  );
};

export default MegaMenu; 