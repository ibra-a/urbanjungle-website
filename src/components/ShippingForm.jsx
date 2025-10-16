import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, User } from 'lucide-react';

const ShippingForm = ({ data, onChange }) => {
  const [errors, setErrors] = useState({});

  const uaeStates = [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 
    'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'
  ];

  const countries = [
    'UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 
    'Bahrain', 'Oman', 'Jordan', 'Lebanon'
  ];

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        break;
      case 'firstName':
      case 'lastName':
        if (!value) error = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        break;
      case 'address':
        if (!value) error = 'Address is required';
        break;
      case 'city':
        if (!value) error = 'City is required';
        break;
      case 'zipCode':
        if (!value) error = 'ZIP code is required';
        break;
      case 'phone':
        if (!value) error = 'Phone number is required';
        else if (!/^\+?[\d\s\-\(\)]{8,}$/.test(value)) error = 'Phone number is invalid';
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...data, [name]: value };
    
    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    onChange(newData);
  };

  const inputClasses = (name) => `
    w-full px-4 py-3 rounded-lg border transition-all duration-200
    ${errors[name] 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
      : 'border-gray-300 focus:border-coral-red focus:ring-coral-red/20'
    }
    focus:ring-4 outline-none
    font-montserrat text-slate-900
    placeholder-slate-gray
  `;

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold font-palanquin mb-4 flex items-center gap-2">
          <Mail size={20} className="text-coral-red" />
          Contact Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={inputClasses('email')}
            />
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
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-semibold font-palanquin mb-4 flex items-center gap-2">
          <MapPin size={20} className="text-coral-red" />
          Shipping Address
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={data.firstName}
              onChange={handleChange}
              placeholder="First name"
              className={inputClasses('firstName')}
            />
            {errors.firstName && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.firstName}
              </motion.p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={data.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className={inputClasses('lastName')}
            />
            {errors.lastName && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.lastName}
              </motion.p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Address *
          </label>
          <input
            type="text"
            name="address"
            value={data.address}
            onChange={handleChange}
            placeholder="Street address"
            className={inputClasses('address')}
          />
          {errors.address && (
            <motion.p
              className="text-red-500 text-sm mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.address}
            </motion.p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Apartment, suite, etc. (optional)
          </label>
          <input
            type="text"
            name="apartment"
            value={data.apartment}
            onChange={handleChange}
            placeholder="Apartment, suite, etc."
            className={inputClasses('apartment')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={data.city}
              onChange={handleChange}
              placeholder="City"
              className={inputClasses('city')}
            />
            {errors.city && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.city}
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Country *
            </label>
            <select
              name="country"
              value={data.country}
              onChange={handleChange}
              className={inputClasses('country')}
            >
              {countries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              State/Emirate {data.country === 'UAE' && '*'}
            </label>
            {data.country === 'UAE' ? (
              <select
                name="state"
                value={data.state}
                onChange={handleChange}
                className={inputClasses('state')}
              >
                <option value="">Select Emirate</option>
                {uaeStates.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="state"
                value={data.state}
                onChange={handleChange}
                placeholder="State/Province"
                className={inputClasses('state')}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              ZIP/Postal Code *
            </label>
            <input
              type="text"
              name="zipCode"
              value={data.zipCode}
              onChange={handleChange}
              placeholder="ZIP code"
              className={inputClasses('zipCode')}
            />
            {errors.zipCode && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.zipCode}
              </motion.p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Phone size={16} className="text-coral-red" />
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={data.phone}
              onChange={handleChange}
              placeholder="+971 50 123 4567"
              className={inputClasses('phone')}
            />
            {errors.phone && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.phone}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Save Address Option */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="saveAddress"
          className="w-4 h-4 text-coral-red bg-gray-100 border-gray-300 rounded focus:ring-coral-red focus:ring-2"
        />
        <label htmlFor="saveAddress" className="text-sm text-slate-gray">
          Save this address for future orders
        </label>
      </div>
    </div>
  );
};

export default ShippingForm; 