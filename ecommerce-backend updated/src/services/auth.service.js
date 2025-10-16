/**
 * Authentication Service
 * Handles all authentication operations with Supabase
 */
export class AuthService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient
  }

  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} userData - Additional user data
   * @returns {Promise<Object>} Sign up result
   */
  async signUp(email, password, userData = {}) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Sign in result
   */
  async signIn(email, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  /**
   * Social login - Google
   * @param {string} redirectTo - Redirect URL after login
   * @returns {Promise<Object>} OAuth result
   */
  async signInWithGoogle(redirectTo = null) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  /**
   * Social login - Facebook
   * @param {string} redirectTo - Redirect URL after login
   * @returns {Promise<Object>} OAuth result
   */
  async signInWithFacebook(redirectTo = null) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  /**
   * Social login - Apple
   * @param {string} redirectTo - Redirect URL after login
   * @returns {Promise<Object>} OAuth result
   */
  async signInWithApple(redirectTo = null) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  /**
   * Sign out
   * @returns {Promise<Object>} Sign out result
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    return { error }
  }

  /**
   * Get current user
   * @returns {Promise<Object>} Current user data
   */
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    return { user, error }
  }

  /**
   * Get current session
   * @returns {Promise<Object>} Current session data
   */
  async getCurrentSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    return { session, error }
  }

  /**
   * Listen for auth state changes
   * @param {Function} callback - Callback function for auth changes
   * @returns {Object} Subscription object
   */
  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset result
   */
  async resetPassword(email) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Update result
   */
  async updatePassword(newPassword) {
    const { data, error } = await this.supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  }

  /**
   * Update user metadata
   * @param {Object} metadata - User metadata
   * @returns {Promise<Object>} Update result
   */
  async updateUserMetadata(metadata) {
    const { data, error } = await this.supabase.auth.updateUser({
      data: metadata
    })
    return { data, error }
  }
}

