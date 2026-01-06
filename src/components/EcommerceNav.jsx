import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, 
  ShoppingCart, 
  User, 
  Heart, 
  Menu, 
  X,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  LogOut,
  UserCircle
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { headerLogo } from "../assets/images";
import CartDropdown from "./CartDropdown";
import AuthModal from "./AuthModal";
import MegaMenu from "./MegaMenu";

const EcommerceNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);
  const { state, actions } = useApp();
  const navigate = useNavigate();

  // Mobile menu structure matching desktop MegaMenu
  const mobileMenuItems = [
    { 
      key: 'men', 
      label: 'MEN',
      subItems: [
        { label: 'All', href: '/men' },
        { label: 'Apparel', href: '/shop?category=men&type=apparel' },
        { label: 'Footwear', href: '/shop?category=men&type=footwear' },
        { label: 'Accessories', href: '/shop?category=men&type=accessories' }
      ]
    },
    { 
      key: 'women', 
      label: 'WOMEN',
      subItems: [
        { label: 'All', href: '/women' },
        { label: 'Apparel', href: '/shop?category=women&type=apparel' },
        { label: 'Footwear', href: '/shop?category=women&type=footwear' },
        { label: 'Accessories', href: '/shop?category=women&type=accessories' }
      ]
    },
    { 
      key: 'kids', 
      label: 'KIDS',
      subItems: [
        { label: 'All', href: '/kids' },
        { label: 'Apparel', href: '/shop?category=kids&type=apparel' },
        { label: 'Footwear', href: '/shop?category=kids&type=footwear' },
        { label: 'Accessories', href: '/shop?category=kids&type=accessories' }
      ]
    },
    { 
      key: 'brands', 
      label: 'BRANDS',
      subItems: [
        { label: 'Nike', href: '/shop?brand=nike' },
        { label: 'Jordan', href: '/shop?brand=jordan' },
        { label: 'Converse', href: '/shop?brand=converse' },
        { label: 'Crocs', href: '/shop?brand=crocs' },
        { label: 'Vans', href: '/shop?brand=vans' },
        { label: 'Puma', href: '/shop?brand=puma' }
      ]
    },
    { 
      key: 'sale', 
      label: 'SALE',
      subItems: [
        { label: 'Coming Soon', href: '/sale' }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setExpandedMobileMenu(null);
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      const result = await actions.logout();
      if (result?.success) {
        setIsUserMenuOpen(false);
        navigate('/');
      } else {
        console.error('Logout failed:', result?.error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileSubmenu = (menuKey) => {
    setExpandedMobileMenu(expandedMobileMenu === menuKey ? null : menuKey);
  };

  // Heart button click handler with proper event handling
  const handleFavoritesClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (state.isAuthenticated) {
      navigate('/favorites');
    } else {
      openAuthModal('login');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // Listen for cart triggers and automatically open cart
  useEffect(() => {
    if (state.shouldOpenCart) {
      setIsCartOpen(true);
      // Reset the trigger after opening
      actions.resetCartTrigger();
    }
  }, [state.shouldOpenCart, actions]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search after navigation
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: { 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1]
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: { 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <motion.header 
      className={`fixed z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-md' 
          : 'bg-white'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Promotional Banner - Djibouti Local */}
      <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black text-center py-2 text-xs sm:text-sm font-semibold">
        🚚 Free shipping on orders over 25,000 DJF | Shop now and save
      </div>

      {/* Main Navigation - Reduced height */}
      <nav className="bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            
            {/* Logo - Smaller size */}
            <div className="flex items-center">
              <Link to="/" className="hover:opacity-80 transition-opacity duration-200">
                <img 
                  src={headerLogo}
                  alt="Urban Jungle"
                  className="h-[50px] w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links - Smaller text and spacing */}
            <div className="hidden lg:flex items-center space-x-6">
              <MegaMenu />
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-3">
              {/* Search Bar - Smaller input */}
              <div className="hidden md:flex items-center relative">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search Urban Jungle..."
                    className="bg-white/10 border border-white/20 rounded-full pl-10 pr-4 py-1.5 text-sm text-white placeholder-white/60 focus:outline-none focus:border-nike-coral focus:bg-white/20 transition-all w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                  />
                </form>
              </div>

              {/* Action Buttons - Reduced padding and icon size */}
              <div className="flex items-center space-x-2">
                {/* Favorites - Always visible, prompts login if not authenticated */}
                <div className="relative favorites-dropdown-container">
                  <button 
                    type="button"
                    onClick={handleFavoritesClick}
                    className="p-1.5 text-white hover:text-nike-coral transition-colors relative"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                
                <Link 
                  to="/cart"
                  className="p-1.5 text-white hover:text-nike-coral transition-colors relative"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {state.cart.itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-nike-coral text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                      {state.cart.itemCount}
                    </span>
                  )}
                </Link>

                {/* User Authentication - Smart User Icon */}
                <div className="relative user-menu-container">
                  <button 
                    type="button"
                    className="p-1.5 text-white hover:text-nike-coral transition-colors flex items-center gap-1"
                    onClick={() => {
                      if (state.isAuthenticated) {
                        setIsUserMenuOpen(!isUserMenuOpen);
                      } else {
                        openAuthModal('login');
                      }
                    }}
                  >
                    {state.isAuthenticated ? (
                      <>
                        <UserCircle className="w-4 h-4" />
                        <span className="text-xs hidden md:block">
                          {state.user?.first_name || 'Account'}
                        </span>
                      </>
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </button>

                  {/* User Dropdown Menu - Only show when authenticated */}
                  <AnimatePresence>
                    {isUserMenuOpen && state.isAuthenticated && (
                      <motion.div
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {state.user?.first_name} {state.user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{state.user?.email}</p>
                        </div>
                        
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        
                        <Link
                          to="/favorites"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4" />
                          Favorites
                        </Link>
                        
                        <Link
                          to="/orders"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          My Orders
                        </Link>
                        
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  type="button"
                  className="lg:hidden p-1.5 text-white hover:text-nike-coral transition-colors"
                  onClick={() => setIsOpen(true)}
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Dropdown - Only shows on Add to Cart trigger */}
      <CartDropdown 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />
            
            {/* Mobile Menu Panel */}
            <motion.div
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl lg:hidden z-50 overflow-y-auto"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* Mobile Menu Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <img src={headerLogo} alt="Urban Jungle logo" width={50} height={18} />
                <motion.button
                  type="button"
                  onClick={closeMenu}
                  className="p-2 rounded-full hover:bg-gray-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Mobile Authentication Section */}
              {state.isAuthenticated ? (
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCircle className="w-10 h-10 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {state.user?.first_name} {state.user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{state.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={closeMenu}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/favorites');
                        closeMenu();
                      }}
                      className="flex items-center gap-2 w-full p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      Favorites
                    </button>
                    
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={closeMenu}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      My Orders
                    </Link>
                    
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        closeMenu();
                      }}
                      className="flex items-center gap-2 w-full p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-gray-200">
                  <button 
                    type="button"
                    onClick={() => {
                      openAuthModal('login');
                      closeMenu();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-md font-medium transition-colors hover:bg-gray-800"
                  >
                    <User className="w-5 h-5" />
                    Sign In / Join Us
                  </button>
                </div>
              )}

              {/* Mobile Search */}
              <div className="p-4 border-b border-gray-200">
                <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                  <Search size={18} className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Search Urban Jungle..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                  />
                </form>
              </div>

              {/* Mobile Navigation Links - Accordion Style */}
              <div className="flex-1">
                {mobileMenuItems.map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Main Category */}
                    <div className="border-b border-gray-100">
                      <button
                        type="button"
                        onClick={() => toggleMobileSubmenu(item.key)}
                        className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{item.label}</span>
                        <motion.div
                          animate={{ rotate: expandedMobileMenu === item.key ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={20} className="text-gray-400" />
                        </motion.div>
                      </button>
                      
                      {/* Submenu */}
                      <AnimatePresence>
                        {expandedMobileMenu === item.key && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden bg-gray-50"
                          >
                            {item.subItems.map((subItem, subIndex) => (
                              <motion.div
                                key={subIndex}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: subIndex * 0.05 }}
                              >
                                <Link
                                  to={subItem.href}
                                  className="flex items-center justify-between pl-8 pr-4 py-3 text-gray-700 hover:bg-white hover:text-nike-coral transition-colors border-b border-gray-200"
                                  onClick={closeMenu}
                                >
                                  <span className="font-medium">{subItem.label}</span>
                                  <ChevronRight size={16} className="text-gray-400" />
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (state.isAuthenticated) {
                        navigate('/favorites');
                        closeMenu();
                      } else {
                        openAuthModal('login');
                        closeMenu();
                      }
                    }}
                    className="p-2"
                  >
                    <Heart size={20} className="text-gray-600" />
                  </button>
                  <Link to="/cart" className="p-2 relative" onClick={closeMenu}>
                    <ShoppingBag size={20} className="text-gray-600" />
                    {state.cart.itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-nike-coral text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {state.cart.itemCount}
                      </span>
                    )}
                  </Link>
                  {/* User Icon - Mobile */}
                  <button
                    type="button"
                    onClick={() => {
                      if (state.isAuthenticated) {
                        navigate('/profile');
                        closeMenu();
                      } else {
                        openAuthModal('login');
                        closeMenu();
                      }
                    }}
                    className="p-2"
                  >
                    {state.isAuthenticated ? (
                      <UserCircle size={20} className="text-gray-600" />
                    ) : (
                      <User size={20} className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click outside handler for user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </motion.header>
  );
};

export default EcommerceNav;