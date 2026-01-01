import { copyrightSign } from "../assets/icons";
import { headerLogo } from "../assets/images";
import { footerLinks, socialMedia } from "../constants";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Footer = () => {
  const getSocialButtonStyle = (platform) => {
    switch (platform) {
      case 'instagram':
        return {
          background: 'linear-gradient(135deg, #833ab4 0%, #fd5949 25%, #fccc63 50%, #fbad50 100%)',
          boxShadow: '0 8px 32px rgba(131, 58, 180, 0.4), 0 0 20px rgba(253, 89, 73, 0.3)',
          hoverBackground: 'linear-gradient(135deg, #833ab4 0%, #fd5949 20%, #fccc63 40%, #fbad50 80%, rgba(255, 107, 53, 0.8) 100%)',
          hoverBoxShadow: '0 12px 40px rgba(131, 58, 180, 0.6), 0 0 30px rgba(253, 89, 73, 0.5), 0 0 60px rgba(252, 204, 99, 0.3)'
        };
      case 'facebook':
        return {
          background: 'linear-gradient(135deg, #1877f2 0%, #42a5f5 100%)',
          boxShadow: '0 8px 32px rgba(24, 119, 242, 0.4), 0 0 20px rgba(66, 165, 245, 0.3)',
          hoverBackground: 'linear-gradient(135deg, #1877f2 0%, #42a5f5 50%, rgba(255, 107, 53, 0.8) 100%)',
          hoverBoxShadow: '0 12px 40px rgba(24, 119, 242, 0.6), 0 0 30px rgba(66, 165, 245, 0.5), 0 0 60px rgba(255, 107, 53, 0.3)'
        };
      case 'x':
        return {
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 1) 0%, rgba(255, 182, 39, 1) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 182, 39, 0.3)',
          hoverBackground: 'linear-gradient(135deg, rgba(0, 0, 0, 1) 0%, rgba(255, 182, 39, 1) 50%, rgba(75, 85, 99, 0.8) 100%)',
          hoverBoxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 182, 39, 0.5), 0 0 60px rgba(75, 85, 99, 0.3)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 1) 0%, rgba(255, 182, 39, 1) 100%)',
          boxShadow: '0 8px 32px rgba(255, 107, 53, 0.4), 0 0 20px rgba(255, 182, 39, 0.3)',
          hoverBackground: 'linear-gradient(135deg, rgba(255, 107, 53, 1) 0%, rgba(255, 182, 39, 1) 100%)',
          hoverBoxShadow: '0 12px 40px rgba(255, 107, 53, 0.6), 0 0 30px rgba(255, 182, 39, 0.5)'
        };
    }
  };

  return (
    <footer className='max-container'>
      <div className='flex justify-between items-start gap-20 flex-wrap max-lg:flex-col'>
        <div className='flex flex-col items-start'>
          <Link to='/'>
            <img
              src={headerLogo}
              alt='Urban Jungle logo'
              width={150}
              height={46}
              className='m-0'
            />
          </Link>
          <p className='mt-6 text-base leading-7 font-montserrat text-white/70 sm:max-w-sm font-light'>
            Discover premium athletic gear from your favorite brands. Experience the perfect blend of style, performance, and innovation at Urban Jungle.
          </p>
          
          {/* Updated Social Media Buttons - Chatbot Style */}
          <div className='flex items-center gap-4 mt-8'>
            {socialMedia.map((social, index) => {
              const styles = getSocialButtonStyle(social.platform);
              return (
                <motion.a
                  key={social.platform}
                  href="#"
                  className='relative w-12 h-12 rounded-full flex justify-center items-center cursor-pointer backdrop-filter backdrop-blur-10 border-2 border-white/20'
                  style={{
                    background: styles.background,
                    boxShadow: styles.boxShadow
                  }}
                  whileHover={{
                    scale: 1.1,
                    y: -2,
                    background: styles.hoverBackground,
                    boxShadow: styles.hoverBoxShadow,
                    borderColor: 'rgba(255, 255, 255, 0.4)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300
                  }}
                >
                  <img 
                    src={social.src} 
                    alt={social.alt} 
                    width={18} 
                    height={18} 
                    className="filter brightness-0 invert transition-all duration-300"
                    style={{ filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
                  />
                  
                  {/* Floating animation effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full opacity-30"
                    style={{ background: styles.background }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.1, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  />
                </motion.a>
              );
            })}
          </div>
        </div>

        <div className='flex flex-1 justify-between lg:gap-10 gap-20 flex-wrap'>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className='font-montserrat text-2xl leading-normal font-medium mb-6 text-white'>
                {section.title}
              </h4>
              <ul>
                {section.links.map((link) => (
                  <li
                    className='mt-3 font-montserrat text-base leading-normal text-white/70 hover:text-white transition-colors duration-300 font-light'
                    key={link.name}
                  >
                    {link.link.startsWith('http') || link.link.startsWith('mailto') || link.link.startsWith('tel') ? (
                      <a href={link.link} className="hover:underline underline-offset-4">
                        {link.name}
                      </a>
                    ) : (
                      <Link to={link.link} className="hover:underline underline-offset-4">
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className='flex justify-between text-white/60 mt-24 max-sm:flex-col max-sm:items-center border-t border-white/10 pt-8'>
        <div className='flex flex-1 justify-start items-center gap-2 font-montserrat cursor-pointer font-light'>
          <img
            src={copyrightSign}
            alt='copyright sign'
            width={20}
            height={20}
            className='rounded-full m-0 filter brightness-0 invert opacity-60'
          />
          <p>Copyright. All rights reserved.</p>
        </div>
        <Link 
          to="/terms-and-conditions"
          className='font-montserrat cursor-pointer hover:text-white transition-colors duration-300 font-light hover:underline underline-offset-4'
        >
          Terms & Conditions
        </Link>
      </div>

      {/* Powered by GABAISOLUTIONS */}
      <div className='flex justify-center items-center mt-6 pb-4'>
        <p className='text-white/50 text-sm font-montserrat font-light'>
          Powered by <span className='text-white/70 font-medium'>GABAISOLUTIONS</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
