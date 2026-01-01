import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { auth } from '../lib/supabase';
import toast from 'react-hot-toast';
import NationalityInput from './NationalityInput';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    confirmPassword: '',
    phone: '',
    nationality: '',
    acceptTerms: false
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

    // Password validation (matches Supabase settings: 8+ chars, lowercase, uppercase, digit, symbol)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const password = formData.password;
      const errors = [];
      
      if (password.length < 8) {
        errors.push('at least 8 characters');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('one lowercase letter');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('one uppercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('one digit');
      }
      if (!/[^a-zA-Z0-9]/.test(password)) {
        errors.push('one symbol');
      }
      
      if (errors.length > 0) {
        newErrors.password = `Password must contain ${errors.join(', ')}`;
      }
    }

    // Registration-specific validation
    if (mode === 'register') {
      if (!formData.first_name) {
        newErrors.first_name = 'First name is required';
      }
      if (!formData.last_name) {
        newErrors.last_name = 'Last name is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s-]{8,}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSocialLogin = async (provider) => {
    try {
      let result;
      
      if (provider === 'google') {
        result = await auth.signInWithGoogle();
      } else if (provider === 'facebook') {
        result = await auth.signInWithFacebook();
      } else if (provider === 'apple') {
        result = await auth.signInWithApple();
      }
      
      if (result.error) {
        toast.error(`${provider} login failed: ${result.error.message}`);
      }
      // Success handled by redirect
    } catch (error) {
      toast.error(`Failed to login with ${provider}`);
    }
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
          last_name: formData.last_name,
          phone: formData.phone,
          nationality: formData.nationality
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
          confirmPassword: '',
          phone: '',
          nationality: ''
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
      confirmPassword: '',
      phone: '',
      nationality: ''
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
    text-base min-h-[44px]
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
                {errors.password ? (
                  <motion.p
                    className="text-red-500 text-sm mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.password}
                  </motion.p>
                ) : mode === 'register' && formData.password && (
                  <p className="text-xs text-gray-500 mt-1">
                    Must be 8+ characters with lowercase, uppercase, digit, and symbol
                  </p>
                )}
              </div>

              {mode === 'register' && (
                <>
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
                        className="text-djibouti-red text-sm mt-1 font-medium"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                  {/* Phone Number */}
                  <div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-gray text-lg">📱</span>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number (+253...)"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={inputClasses('phone')}
                        style={{ paddingLeft: '3rem' }}
                      />
                    </div>
                    {errors.phone && (
                      <motion.p
                        className="text-djibouti-red text-sm mt-1 font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.phone}
                      </motion.p>
                    )}
                  </div>

                  {/* Nationality */}
                  <div>
                    <NationalityInput
                      value={formData.nationality}
                      onChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
                      placeholder="Select Nationality (Optional)"
                      className={errors.nationality ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    />
                  </div>

                  {/* Terms & Conditions */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData(prev => ({...prev, acceptTerms: e.target.checked}))}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-djibouti-green focus:ring-djibouti-blue cursor-pointer"
                      />
                      <span className="text-sm text-slate-gray">
                        I accept the{' '}
                        <button type="button" className="text-djibouti-green hover:text-djibouti-blue font-semibold underline">
                          Terms & Conditions
                        </button>
                        {' '}and{' '}
                        <button type="button" className="text-djibouti-green hover:text-djibouti-blue font-semibold underline">
                          Privacy Policy
                        </button>
                      </span>
                    </label>
                    {errors.acceptTerms && (
                      <motion.p
                        className="text-djibouti-red text-sm mt-1 font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.acceptTerms}
                      </motion.p>
                    )}
                  </div>
                </>
              )}

              {/* Submit Button - Djibouti Theme */}
              <button
                type="submit"
                disabled={state.authLoading}
                className="w-full bg-gradient-to-r from-djibouti-blue to-djibouti-green hover:shadow-lg hover:shadow-djibouti-blue/30 text-white font-bold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-montserrat"
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

              {/* Social Login - OAuth Enabled */}
              {true && (
                <>
                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative bg-white px-4">
                      <span className="text-sm text-slate-gray font-medium">or continue with</span>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="space-y-3">
                    {/* Google */}
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md text-slate-900 font-semibold py-3 rounded-lg transition-all duration-200"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>

                    {/* Facebook */}
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('facebook')}
                      className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-semibold py-3 rounded-lg transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Continue with Facebook
                    </button>

                    {/* Apple */}
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('apple')}
                      className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      Continue with Apple
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 text-center">
              <p className="text-slate-gray font-montserrat">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={switchMode}
                  className="text-djibouti-green hover:text-djibouti-blue font-semibold transition-colors"
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