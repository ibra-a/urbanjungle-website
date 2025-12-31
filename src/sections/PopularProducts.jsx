import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { africanike } from '../assets/images';
import { Link } from 'react-router-dom';

const PopularProducts = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const slideRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const items = [
    {
      type: "video",
      src: "/src/assets/videos/Epic Adidas shoe commercial concept _ product video B-ROLL.mp4",
      alt: "Epic Adidas Shoe",
      title: "Adidas"
    },
    {
      type: "video",
      src: "/src/assets/videos/3dairforcebuttonshow.mp4",
      alt: "3D Air Force Show",
      title: "Nike"
    },
    {
      type: "video",
      src: "/src/assets/videos/Converse Weapon l Create History Not Hype.mp4",
      alt: "Converse Weapon",
      title: "Converse"
    }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isDragging.current) return;
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    if (slideRef.current) {
      slideRef.current.style.transform = `translateX(${-currentSlide * 100 - (diff / slideRef.current.offsetWidth) * 100}%)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isDragging.current) return;
    isDragging.current = false;
    
    const diff = startX.current - currentX.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentSlide < items.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (diff < 0 && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    }
    
    if (slideRef.current) {
      slideRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const renderMediaContent = (item, index) => {
    if (item.type === "video") {
      return (
        <video
          className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={item.src} type="video/mp4" />
        </video>
      );
    } else {
      return (
        <img
          src={item.src}
          alt={item.alt}
          className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
      );
    }
  };

  const renderMobileMediaContent = (item, index) => {
    if (item.type === "video") {
      return (
        <video
          className='w-full h-full object-cover'
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={item.src} type="video/mp4" />
        </video>
      );
    } else {
      return (
        <img
          src={item.src}
          alt={item.alt}
          className='w-full h-full object-cover'
        />
      );
    }
  };

  return (
    <>
      <section id='products' className='max-container max-sm:mt-12'>
        {/* Desktop Grid Layout */}
        <div className='hidden md:grid md:grid-cols-3 gap-6 h-96'>
          {items.map((item, index) => (
            <div key={index} className='relative group overflow-hidden rounded-lg'>
              {renderMediaContent(item, index)}
              <div className='absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300'></div>
              <div className='absolute inset-0 flex flex-col justify-end p-6'>
                <h3 className='text-white font-montserrat font-bold text-xl mb-4'>{item.title}</h3>
                {item.title === "Nike" ? (
                  <Link to="/men">
                    <button className='bg-white text-black px-6 py-3 rounded-full font-montserrat font-semibold hover:bg-gray-100 transition-colors duration-300 w-fit'>
                      Shop now
                    </button>
                  </Link>
                ) : (
                  <button className='bg-white text-black px-6 py-3 rounded-full font-montserrat font-semibold hover:bg-gray-100 transition-colors duration-300 w-fit'>
                    Shop now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swiper Layout */}
        <div className='md:hidden relative'>
          <div className='overflow-hidden rounded-lg h-96'>
            <div
              ref={slideRef}
              className='flex transition-transform duration-300 ease-out h-full'
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {items.map((item, index) => (
                <div key={index} className='w-full h-full flex-shrink-0 relative'>
                  {renderMobileMediaContent(item, index)}
                  <div className='absolute inset-0 bg-black/40'></div>
                  <div className='absolute inset-0 flex flex-col justify-end p-6'>
                    <h3 className='text-white font-montserrat font-bold text-xl mb-4'>{item.title}</h3>
                    {item.title === "Nike" ? (
                      <Link to="/men">
                        <button className='bg-white text-black px-6 py-3 rounded-full font-montserrat font-semibold w-fit'>
                          Shop now
                        </button>
                      </Link>
                    ) : (
                      <button className='bg-white text-black px-6 py-3 rounded-full font-montserrat font-semibold w-fit'>
                        Shop now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Pagination Dots */}
          <div className='flex justify-center mt-4 space-x-2'>
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  currentSlide === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Jordan Video Section - Full Width */}
      <motion.section 
        className="w-full max-container mt-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className='relative h-96 overflow-hidden rounded-lg group'>
          {/* Background Video */}
          <video
            className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/src/assets/videos/jordan.mp4" type="video/mp4" />
          </video>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <h2 className="font-palanquin text-5xl lg:text-6xl font-bold text-white mb-4">
                JUMPMAN
                <span className="block electric-promo-text">LEGACY</span>
              </h2>
              <p className="text-white/80 text-lg lg:text-xl font-montserrat mb-8 leading-relaxed">
                Greatness never goes out of style. Experience the legendary performance 
                and iconic design that defined basketball excellence.
              </p>
              <Link to="/men">
                <motion.button
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white px-8 py-4 rounded-full font-montserrat font-bold text-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Shop Jordan Collection
                </motion.button>
              </Link>
            </motion.div>
          </div>
          
          {/* Floating "23" Badge */}
          <motion.div
            className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-yellow-500/90 to-yellow-400/90 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <span className="text-white font-bold text-xl font-palanquin">23</span>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
};

export default PopularProducts;
