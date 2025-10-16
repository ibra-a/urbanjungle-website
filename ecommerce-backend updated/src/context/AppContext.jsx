import { createContext, useContext, useReducer, useEffect } from 'react'
import { FavoritesService } from '../services/favorites.service.js'

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
  favorites: [],
  favoritesLoading: false,
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
}

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
  SET_FAVORITES: 'SET_FAVORITES',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  SET_FAVORITES_LOADING: 'SET_FAVORITES_LOADING'
}

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        authLoading: false
      }

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        authLoading: false,
        cart: initialState.cart,
        wishlist: []
      }

    case actionTypes.SET_AUTH_LOADING:
      return {
        ...state,
        authLoading: action.payload
      }

    case actionTypes.ADD_TO_CART:
      const existingItem = state.cart.items.find(item => 
        item.id === action.payload.id && item.size === action.payload.size
      )

      if (existingItem) {
        const updatedItems = state.cart.items.map(item =>
          item.id === action.payload.id && item.size === action.payload.size
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        return {
          ...state,
          cart: {
            items: updatedItems,
            total: newTotal,
            itemCount: newItemCount
          }
        }
      } else {
        const updatedItems = [...state.cart.items, action.payload]
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        return {
          ...state,
          cart: {
            items: updatedItems,
            total: newTotal,
            itemCount: newItemCount
          }
        }
      }

    case actionTypes.REMOVE_FROM_CART:
      const filteredItems = state.cart.items.filter(item => 
        !(item.id === action.payload.id && item.size === action.payload.size)
      )
      const newTotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        cart: {
          items: filteredItems,
          total: newTotal,
          itemCount: newItemCount
        }
      }

    case actionTypes.UPDATE_CART_QUANTITY:
      const updatedCartItems = state.cart.items.map(item =>
        item.id === action.payload.id && item.size === action.payload.size
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      const updatedTotal = updatedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const updatedItemCount = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        cart: {
          items: updatedCartItems,
          total: updatedTotal,
          itemCount: updatedItemCount
        }
      }

    case actionTypes.CLEAR_CART:
      return {
        ...state,
        cart: initialState.cart
      }

    case actionTypes.ADD_TO_WISHLIST:
      if (!state.wishlist.find(item => item.id === action.payload.id)) {
        return {
          ...state,
          wishlist: [...state.wishlist, action.payload]
        }
      }
      return state

    case actionTypes.REMOVE_FROM_WISHLIST:
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.id !== action.payload.id)
      }

    case actionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      }

    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }

    case actionTypes.TRIGGER_CART_OPEN:
      return {
        ...state,
        shouldOpenCart: true
      }

    case actionTypes.RESET_CART_TRIGGER:
      return {
        ...state,
        shouldOpenCart: false
      }

    case actionTypes.TRIGGER_FAVORITES_OPEN:
      return {
        ...state,
        shouldOpenFavorites: true
      }

    case actionTypes.RESET_FAVORITES_TRIGGER:
      return {
        ...state,
        shouldOpenFavorites: false
      }

    case actionTypes.SHOW_FAVORITE_NOTIFICATION:
      return {
        ...state,
        favoriteNotification: {
          isVisible: true,
          message: action.payload.message,
          type: action.payload.type
        }
      }

    case actionTypes.HIDE_FAVORITE_NOTIFICATION:
      return {
        ...state,
        favoriteNotification: {
          isVisible: false,
          message: '',
          type: 'added'
        }
      }

    case actionTypes.SET_FAVORITES:
      return {
        ...state,
        favorites: action.payload,
        favoritesLoading: false
      }

    case actionTypes.ADD_FAVORITE:
      return {
        ...state,
        favorites: [...state.favorites, action.payload]
      }

    case actionTypes.REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter(id => id !== action.payload)
      }

    case actionTypes.SET_FAVORITES_LOADING:
      return {
        ...state,
        favoritesLoading: action.payload
      }

    default:
      return state
  }
}

// Create context
const AppContext = createContext()

/**
 * App Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.backend - Backend instance with services
 * @returns {React.ReactNode} Provider component
 */
export const AppProvider = ({ children, backend }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: true })
      
      const { user, error } = await backend.auth.getCurrentUser()
      
      if (user && !error) {
        dispatch({ type: actionTypes.SET_USER, payload: user })
      } else {
        dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: false })
      }
    }

    checkAuth()

    // Listen for auth changes (social login redirects)
    const { data: authListener } = backend.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        dispatch({ type: actionTypes.SET_USER, payload: session.user })
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: actionTypes.LOGOUT })
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [backend])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    const savedWishlist = localStorage.getItem('wishlist')
    
    if (savedCart) {
      const cartData = JSON.parse(savedCart)
      cartData.items.forEach(item => {
        dispatch({ type: actionTypes.ADD_TO_CART, payload: item })
      })
    }

    if (savedWishlist) {
      const wishlistData = JSON.parse(savedWishlist)
      wishlistData.forEach(item => {
        dispatch({ type: actionTypes.ADD_TO_WISHLIST, payload: item })
      })
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.cart))
  }, [state.cart])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist))
  }, [state.wishlist])

  // Load favorites when user logs in
  useEffect(() => {
    const loadFavorites = async () => {
      if (state.user) {
        dispatch({ type: actionTypes.SET_FAVORITES_LOADING, payload: true })
        const favorites = await backend.favorites.getFavorites(state.user.id)
        dispatch({ type: actionTypes.SET_FAVORITES, payload: favorites })
      } else {
        // Clear favorites when logged out
        dispatch({ type: actionTypes.SET_FAVORITES, payload: [] })
      }
    }

    loadFavorites()
  }, [state.user, backend])

  // Authentication action creators
  const authActions = {
    login: async (email, password) => {
      dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: true })
      const { data, error } = await backend.auth.signIn(email, password)
      
      if (data?.user && !error) {
        dispatch({ type: actionTypes.SET_USER, payload: data.user })
        return { success: true, data }
      } else {
        dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: false })
        return { success: false, error: error?.message || 'Login failed' }
      }
    },

    register: async (userData) => {
      dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: true })
      const { data, error } = await backend.auth.signUp(
        userData.email,
        userData.password,
        {
          first_name: userData.first_name,
          last_name: userData.last_name
        }
      )
      
      if (data?.user && !error) {
        dispatch({ type: actionTypes.SET_USER, payload: data.user })
        return { success: true, data }
      } else {
        dispatch({ type: actionTypes.SET_AUTH_LOADING, payload: false })
        return { success: false, error: error?.message || 'Registration failed' }
      }
    },

    logout: async () => {
      await backend.auth.signOut()
      dispatch({ type: actionTypes.LOGOUT })
    },

    getProfile: async () => {
      const { user, error } = await backend.auth.getCurrentUser()
      return { user, error }
    }
  }

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
    
    // Favorites actions
    toggleFavorite: async (productId) => {
      if (!state.user) {
        // Show auth modal or message
        return { success: false, requiresAuth: true }
      }

      const isFavorited = state.favorites.includes(productId)
      
      if (isFavorited) {
        const success = await backend.favorites.removeFavorite(state.user.id, productId)
        if (success) {
          dispatch({ type: actionTypes.REMOVE_FAVORITE, payload: productId })
        }
        return { success, action: 'removed' }
      } else {
        const success = await backend.favorites.addFavorite(state.user.id, productId)
        if (success) {
          dispatch({ type: actionTypes.ADD_FAVORITE, payload: productId })
        }
        return { success, action: 'added' }
      }
    },

    setFavorites: (favorites) => dispatch({ type: actionTypes.SET_FAVORITES, payload: favorites }),
    
    // Auth actions
    ...authActions
  }

  return (
    <AppContext.Provider value={{ state, actions, backend }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default AppContext

