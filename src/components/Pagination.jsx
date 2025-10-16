import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Nike/Urban Jungle Orange themed Pagination Component
 * High contrast for dark backgrounds
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        pages.push(2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all text-sm
          ${currentPage === 1
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            : 'bg-white text-black border-2 border-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:border-transparent'
          }
        `}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-white font-semibold"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                min-w-[40px] h-[40px] rounded-md font-bold transition-all text-sm
                ${isActive
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg scale-110'
                  : 'bg-white text-black border border-gray-300 hover:border-orange-500 hover:text-orange-500 hover:scale-105'
                }
              `}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all text-sm
          ${currentPage === totalPages
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            : 'bg-white text-black border-2 border-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white hover:border-transparent'
          }
        `}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;

