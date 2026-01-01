import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { countries, commonNationalities } from '../utils/countries';

const NationalityInput = ({ value, onChange, placeholder = "Select Nationality (Optional)", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter countries based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Show common nationalities first, then all others
      const common = commonNationalities.map(name => ({ name, isCommon: true }));
      const others = countries
        .filter(c => !commonNationalities.includes(c.name))
        .map(c => ({ name: c.name, isCommon: false }));
      setFilteredCountries([...common, ...others]);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = countries
        .filter(country => country.name.toLowerCase().includes(query))
        .map(c => ({ 
          name: c.name, 
          isCommon: commonNationalities.includes(c.name) 
        }))
        .sort((a, b) => {
          // Common nationalities first
          if (a.isCommon && !b.isCommon) return -1;
          if (!a.isCommon && b.isCommon) return 1;
          return a.name.localeCompare(b.name);
        });
      setFilteredCountries(filtered);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (nationality) => {
    onChange(nationality);
    setIsOpen(false);
    setSearchQuery('');
  };

  const selectedCountry = countries.find(c => c.name === value) || { name: value };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 pl-12 rounded-lg border transition-all duration-200
          border-gray-300 focus:border-coral-red focus:ring-coral-red/20
          focus:ring-4 outline-none
          font-montserrat text-slate-900 text-left
          flex items-center justify-between
          min-h-[44px]
          ${value ? 'text-slate-900' : 'text-slate-gray'}
        `}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown 
          size={20} 
          className={`text-slate-gray transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Search Icon */}
      <Search 
        size={20} 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-gray pointer-events-none" 
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[60vh] overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
            <div className="relative">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nationality..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-red focus:border-coral-red outline-none text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto max-h-[50vh]">
            {filteredCountries.length > 0 ? (
              <>
                {/* Common Nationalities Section */}
                {!searchQuery && (
                  <>
                    {filteredCountries
                      .filter(c => c.isCommon)
                      .map((country) => (
                        <button
                          key={country.name}
                          type="button"
                          onClick={() => handleSelect(country.name)}
                          className={`
                            w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                            ${value === country.name ? 'bg-coral-red/10 text-coral-red font-semibold' : 'text-slate-900'}
                            border-b border-gray-100 last:border-b-0
                          `}
                        >
                          {country.name}
                        </button>
                      ))}
                    {filteredCountries.some(c => c.isCommon) && filteredCountries.some(c => !c.isCommon) && (
                      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 font-semibold border-b border-gray-200">
                        All Nationalities
                      </div>
                    )}
                  </>
                )}

                {/* All Other Nationalities */}
                {filteredCountries
                  .filter(c => !c.isCommon || searchQuery)
                  .map((country) => (
                    <button
                      key={country.name}
                      type="button"
                      onClick={() => handleSelect(country.name)}
                      className={`
                        w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                        ${value === country.name ? 'bg-coral-red/10 text-coral-red font-semibold' : 'text-slate-900'}
                        border-b border-gray-100 last:border-b-0
                      `}
                    >
                      {country.name}
                    </button>
                  ))}
              </>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No nationalities found</p>
                <p className="text-sm mt-1">Try a different search</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalityInput;

