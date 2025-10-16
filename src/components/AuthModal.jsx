import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  
  const { actions, state } = useApp();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Registration-specific validation
    if (mode === 'register') {
      if (!formData.first_name) {
        newErrors.first_name = 'First name is required';
      }
      if (!formData.last_name) {
        newErrors.last_name = 'Last name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let result;
      
      if (mode === 'login') {
        result = await actions.login(formData.email, formData.password);
      } else {
        result = await actions.register({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name
        });
      }

      if (result.success) {
        toast.success(mode === 'login' ? 'Welcome back!' : 'Account created successfully!');
        onClose();
        setFormData({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      confirmPassword: ''
    });
  };

  const inputClasses = (fieldName) => `
    w-full px-4 py-3 pl-12 rounded-lg border transition-all duration-200
    ${errors[fieldName] 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
      : 'border-gray-300 focus:border-coral-red focus:ring-coral-red/20'
    }
    focus:ring-4 outline-none
    font-montserrat text-slate-900
    placeholder-slate-gray
  `;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold font-palanquin text-slate-900">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-gray" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-gray" />
                      <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className={inputClasses('first_name')}
                      />
                    </div>
                    {errors.first_name && (
                      <motion.p
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.first_name}
                      </motion.p>
                    )}
                  </div>
                  
                  <div>
                    <div className="relative">
                      <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-gray" />
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className={inputClasses('last_name')}
                      />
                    </div>
                    {errors.last_name && (
                      <motion.p
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.last_name}
                      </motion.p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-gray" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClasses('email')}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    className="text-red-500 text-sm mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-gray" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={inputClasses('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-gray hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    className="text-red-500 text-sm mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {mode === 'register' && (
                <div>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-gray" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={inputClasses('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={state.authLoading}
                className="w-full bg-coral-red hover:bg-coral-red/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-montserrat"
              >
                {state.authLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 text-center">
              <p className="text-slate-gray font-montserrat">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={switchMode}
                  className="text-coral-red hover:text-coral-red/80 font-semibold transition-colors"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal; 