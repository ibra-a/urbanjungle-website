import { createContext, useContext, useReducer, useEffect } from 'react';
import { backend } from '../config/backend';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  cart: {
    items: [],
    total: 0,
    itemCount: 0
  },
  wishlist: [],
  searchQuery: '',
  isLoading: false,
  authLoading: true,
  shouldOpenCart: false,
  shouldOpenFavorites: false,
  favoriteNotification: {
    isVisible: false,
    message: '',
    type: 'added'
  }
};

// Action types
export const actionTypes = {
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_AUTH_LOADING: 'SET_AUTH_LOADING',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_QUANTITY: 'UPDATE_CART_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_LOADING: 'SET_LOADING',
  TRIGGER_CART_OPEN: 'TRIGGER_CART_OPEN',
  RESET_CART_TRIGGER: 'RESET_CART_TRIGGER',
  TRIGGER_FAVORITES_OPEN: 'TRIGGER_FAVORITES_OPEN',
  RESET_FAVORITES_TRIGGER: 'RESET_FAVORITES_TRIGGER',
  SHOW_FAVORITE_NOTIFICATION: 'SHOW_FAVORITE_NOTIFICATION',
  HIDE_FAVORITE_NOTIFICATION: 'HIDE_FAVORITE_NOTIFICATION',
  SET_FAVORITES: 'SET_FAVORITES'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        authLoading: false
      };

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        authLoading: false,
        cart: initialState.cart,
        wishlist: []
      };

    case actionTypes.SET_AUTH_LOADING:
      return {
        ...state,
        authLoading: action.payload
      };

    case actionTypes.ADD_TO_CART:
      const existingItem = state.cart.items.find(item => 
        item.id === action.payload.id && item.size === action.payload.size
      );

      if (existingItem) {
        const updatedItems = state.cart.items.map(item =>
          item.id === action.payload.id && item.size === action.payload.size
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

        return {
          ...state,
          cart: {
            items: updatedItems,
            total: newTotal,
            itemCount: newItemCount
          }
        };
      } else {
        const updatedItems = [...state.cart.items, action.payload];
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

        return {
          ...state,
          cart: {
            items: updatedItems,
            total: newTotal,
            itemCount: newItemCount
          }
        };
      }

    case actionTypes.REMOVE_FROM_CART:
      const filteredItems = state.cart.items.filter(item => 
        !(item.id === action.payload.id && item.size === action.payload.size)
      );
      const newTotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        cart: {
          items: filteredItems,
          total: newTotal,
          itemCount: newItemCount
        }
      };

    case actionTypes.UPDATE_CART_QUANTITY:
      const updatedCartItems = state.cart.items.map(item =>
        item.id === action.payload.id && item.size === action.payload.size
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const updatedTotal = updatedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const updatedItemCount = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        cart: {
          items: updatedCartItems,
          total: updatedTotal,
          itemCount: updatedItemCount
        }
      };

    case actionTypes.CLEAR_CART:
      return {
        ...state,
        cart: initialState.cart
      };

    case actionTypes.ADD_TO_WISHLIST:
      if (!state.wishlist.find(item => item.id === action.payload.id)) {
        return {
          ...state,
          wishlist: [...state.wishlist, action.payload]
        };
      }
      return state;

    case actionTypes.REMOVE_FROM_WISHLIST:
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.id !== action.payload.id)
      };

    case actionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case actionTypes.TRIGGER_CART_OPEN:
      return {
        ...state,
        shouldOpenCart: true
      };

    case actionTypes.RESET_CART_TRIGGER:
      return {
        ...state,
        shouldOpenCart: false
      };

    case actionTypes.TRIGGER_FAVORITES_OPEN:
      return {
        ...state,
        shouldOpenFavorites: true
      };

    case actionTypes.RESET_FAVORITES_TRIGGER:
      return {
        ...state,
        shouldOpenFavorites: false
      };

    case actionTypes.SHOW_FAVORITE_NOTIFICATION:
      return {
        ...state,
        favoriteNotification: {
          isVisible: true,
          message: action.payload.message,
          type: action.payload.type
        }
      };

    case actionTypes.HIDE_FAVORITE_NOTIFICATION:
      return {
        ...state,
        favoriteNotification: {
          isVisible: false,
          message: '',
          type: 'added'
        }
      };

    case actionTypes.SET_FAVORITES:
      return {
        ...state,
        wishlist: action.payload
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Sync favorites from Supabase
  const syncFavorites = async (userId) => {
    if (!userId) return;
    
    try {
      const favoriteIds = await backend.favorites.getFavoriteIds(userId);
      // Convert IDs to wishlist format (just store IDs for now)
      const wishlist = favoriteIds.map(id => ({ id }));
      dispatch({ type: actionTypes.SET_FAVORITES, payload: wishlist });
    } catch (error) {
      console.error('Error syncing favorites:', error);
    }
  };

  // Check authentication on mount - Supabase (like Tommy CK)
  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: true });
      
      try {
        const { user, error } = await backend.auth.getCurrentUser();
        if (user && !error) {
          dispatch({ type: actionTypes.SET_USER, payload: user });
          await syncFavorites(user.id);
        } else {
          dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: false });
      }
    };

    checkAuth();

    // Listen for auth changes (social login redirects) - like Tommy CK
    const { data: authListener } = backend.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          dispatch({ type: actionTypes.SET_USER, payload: session.user });
          await syncFavorites(session.user.id);
          
          // Handle social login profile creation with registration_source
          if (session.user.id) {
            const userMetadata = session.user.user_metadata || {};
            await backend.supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                first_name: userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || null,
                last_name: userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || null,
                phone: userMetadata.phone || null,
                nationality: userMetadata.nationality || null,
                registration_source: 'Urban Jungle' // Track registration source for social logins
              }, {
                onConflict: 'id'
              });
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: actionTypes.LOGOUT });
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      cartData.items.forEach(item => {
        dispatch({ type: actionTypes.ADD_TO_CART, payload: item });
      });
    }

    if (savedWishlist) {
      const wishlistData = JSON.parse(savedWishlist);
      wishlistData.forEach(item => {
        dispatch({ type: actionTypes.ADD_TO_WISHLIST, payload: item });
      });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.cart));
  }, [state.cart]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
  }, [state.wishlist]);

  // Authentication action creators
  const authActions = {
    login: async (email, password) => {
      dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: true });
      try {
        const { data, error } = await backend.auth.signIn(email, password);
        
        if (data?.user && !error) {
          dispatch({ type: actionTypes.SET_USER, payload: data.user });
          return { success: true, data: { user: data.user } };
        } else {
          dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: false });
          return { success: false, error: error?.message || 'Login failed' };
        }
      } catch (error) {
        dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: false });
        return { success: false, error: error.message };
      }
    },

    register: async (userData) => {
      dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: true });
      try {
        const { data, error } = await backend.auth.signUp(
          userData.email, 
          userData.password, 
          {
            first_name: userData.first_name,
            last_name: userData.last_name
          }
        );
        
        if (data?.user && !error) {
          dispatch({ type: actionTypes.SET_USER, payload: data.user });
          
          // Create/update profile with additional data (like Tommy CK)
          if (data.user.id) {
            await backend.supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone || null,
                nationality: userData.nationality || null,
                registration_source: 'Urban Jungle' // Track registration source
              }, {
                onConflict: 'id'
              });
          }
          
          // Auto-import addresses from guest orders (if any) - run in background (like Tommy CK)
          if (data.user.email) {
            import('../services/addressService').then(({ autoImportAddressesOnSignup }) => {
              autoImportAddressesOnSignup(data.user.id, data.user.email);
            }).catch(err => console.error('Error importing addresses:', err));
          }
          
          return { success: true, data: { user: data.user } };
        } else {
          dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: false });
          return { success: false, error: error?.message || 'Registration failed' };
        }
      } catch (error) {
        dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: false });
        return { success: false, error: error.message };
      }
    },

    logout: async () => {
      try {
        await backend.auth.signOut();
        dispatch({ type: actionTypes.LOGOUT });
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    getProfile: async () => {
      try {
        const { data: { user }, error } = await backend.supabase.auth.getUser();
        if (user && !error) {
          return { success: true, data: { user } };
        } else {
          return { success: false, error: error?.message || 'Failed to get profile' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  };

  // Regular action creators
  const actions = {
    setUser: (user) => dispatch({ type: actionTypes.SET_USER, payload: user }),
    logout: authActions.logout,
    addToCart: (item) => dispatch({ type: actionTypes.ADD_TO_CART, payload: item }),
    removeFromCart: (item) => dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: item }),
    updateCartQuantity: (item) => dispatch({ type: actionTypes.UPDATE_CART_QUANTITY, payload: item }),
    clearCart: () => dispatch({ type: actionTypes.CLEAR_CART }),
    addToWishlist: (item) => dispatch({ type: actionTypes.ADD_TO_WISHLIST, payload: item }),
    removeFromWishlist: (item) => dispatch({ type: actionTypes.REMOVE_FROM_WISHLIST, payload: item }),
    setSearchQuery: (query) => dispatch({ type: actionTypes.SET_SEARCH_QUERY, payload: query }),
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    triggerCartOpen: () => dispatch({ type: actionTypes.TRIGGER_CART_OPEN }),
    resetCartTrigger: () => dispatch({ type: actionTypes.RESET_CART_TRIGGER }),
    triggerFavoritesOpen: () => dispatch({ type: actionTypes.TRIGGER_FAVORITES_OPEN }),
    resetFavoritesTrigger: () => dispatch({ type: actionTypes.RESET_FAVORITES_TRIGGER }),
    showFavoriteNotification: (message, type) => dispatch({ 
      type: actionTypes.SHOW_FAVORITE_NOTIFICATION, 
      payload: { message, type } 
    }),
    hideFavoriteNotification: () => dispatch({ type: actionTypes.HIDE_FAVORITE_NOTIFICATION }),
    
    // Toggle favorite with Supabase sync
    toggleFavorite: async (productId) => {
      if (!state.user) {
        return { success: false, requiresAuth: true };
      }
      
      const result = await backend.favorites.toggleFavorite(state.user.id, productId);
      
      if (result.success) {
        // Sync favorites after toggle
        await syncFavorites(state.user.id);
      }
      
      return result;
    },
    
    // Sync favorites manually
    syncFavorites: () => syncFavorites(state.user?.id),
    
    // Auth actions
    ...authActions
  };

  return (
    <AppContext.Provider value={{ state, actions, backend }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext; 