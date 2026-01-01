import toast from 'react-hot-toast';

// Standard toast styles
const standardStyles = {
  borderRadius: '8px',
  padding: '12px 16px',
  fontSize: '13px',
  fontWeight: '500',
  maxWidth: '320px',
  minWidth: '280px',
};

const successStyles = {
  ...standardStyles,
  background: '#333',
  color: '#fff',
  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)',
};

const errorStyles = {
  ...standardStyles,
  background: '#333',
  color: '#fff',
  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)',
};

// Standard success toast with close button
export const showSuccessToast = (message, icon = '✅') => {
  toast.success((t) => (
    <div className="flex items-center justify-between gap-2 w-full">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm">{message}</span>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="text-white/60 hover:text-white transition-colors ml-2 flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  ), {
    style: successStyles,
    duration: 3000,
  });
};

// Standard error toast with close button
export const showErrorToast = (message, icon = '❌') => {
  toast.error((t) => (
    <div className="flex items-center justify-between gap-2 w-full">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm">{message}</span>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="text-white/60 hover:text-white transition-colors ml-2 flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  ), {
    style: errorStyles,
    duration: 4000,
  });
};

// Specialized toasts for common actions
export const showCartToast = (message) => showSuccessToast(message, '🛒');
export const showFavoriteToast = (message, isAdded = true) => showSuccessToast(message, isAdded ? '❤️' : '💔');
export const showOrderToast = (message) => showSuccessToast(message, '📦');
export const showDriverToast = (message) => showSuccessToast(message, '🚚');
export const showAdminToast = (message) => showSuccessToast(message, '⚙️');
export const showPhotoToast = (message) => showSuccessToast(message, '📸');

// Simple toasts without close buttons (for quick messages)
export const showSimpleSuccess = (message) => {
  toast.success(message, {
    style: successStyles,
    duration: 2000,
  });
};

export const showSimpleError = (message) => {
  toast.error(message, {
    style: errorStyles,
    duration: 3000,
  });
};

