/**
 * Payment Service - CAC International Bank Integration
 * Handles all payment operations with CAC Bank API
 * Documentation: https://documenter.getpostman.com/view/26519164/2sB3QMLUwM
 */

// Token cache to reuse the same token across initiation and confirmation
let cachedToken = null
let tokenExpiry = null

export class PaymentService {
  constructor(config) {
    this.proxyUrl = config.proxyUrl || 'http://157.230.110.104/api/cacint'
    this.testMode = config.testMode || false
    this.credentials = config.credentials || {
      username: 'CACPAY_GAB',
      password: 'VPAP#$X3xZTO9HRcKjY9FjcGF9UGFzJA=='
    }
    this.apiKeys = config.apiKeys || {
      app_key: "TWVyYXNAY5FjcGF7",
      api_key: "TWGHBo$_CACpos"
    }
    this.companyServicesId = config.companyServicesId || 20
    this.currency = config.currency || "DJF"
  }

  /**
   * Authenticate with CAC Bank API (Sign In)
   * @param {Object} credentials - Username and password
   * @param {Boolean} forceNew - Force new authentication even if token is cached
   * @returns {Promise<Object>} Authentication token and details
   */
  async authenticate(credentials = {}, forceNew = false) {
    try {
      // Check if we have a valid cached token (unless forced to get new)
      if (!forceNew && cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        console.log('🔄 Using cached Bearer token')
        return {
          success: true,
          token: cachedToken,
          cached: true
        }
      }

      const { username = this.credentials.username, password = this.credentials.password } = credentials
      
      console.log('🔧 Authenticating with:', { username, passwordLength: password.length })
      
      const response = await fetch(`${this.proxyUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        })
      })

      if (!response.ok) {
        throw new Error('Authentication failed')
      }

      const data = await response.json()
      
      console.log('✅ Authentication successful:', data)
      
      // Cache the token for 1 hour (CAC Bank tokens are valid for much longer but we'll refresh more frequently)
      cachedToken = data.accessToken || data.token || data.id
      tokenExpiry = Date.now() + (60 * 60 * 1000) // 1 hour from now
      
      return {
        success: true,
        token: cachedToken,
        data: data
      }
    } catch (error) {
      console.error('CAC Auth Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Clear cached authentication token
   * Use this if you need to force re-authentication
   */
  clearAuthCache() {
    cachedToken = null
    tokenExpiry = null
    console.log('🔄 Auth cache cleared')
  }

  /**
   * Initiate payment transaction
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Payment initiation response with transaction ID
   */
  async initiatePayment(paymentData) {
    try {
      const {
        amount,
        phoneNumber,
        orderId,
        description
      } = paymentData

      // First authenticate to get token
      const authResult = await this.authenticate()
      if (!authResult.success) {
        throw new Error('Authentication failed')
      }

      const response = await fetch(`${this.proxyUrl}/PaymentInitiateRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authResult.token}`
        },
        body: JSON.stringify({
          app_key: this.apiKeys.app_key,
          api_key: this.apiKeys.api_key,
          customer_mobile: phoneNumber,
          currency: this.currency,
          desc: description || `Order #${orderId}`,
          vender_ref: orderId,
          amount: parseFloat(amount),
          company_services_id: this.companyServicesId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Payment initiation failed')
      }

      const data = await response.json()
      
      console.log('✅ Payment initiated successfully:', data)
      console.log('🔧 Payment Request ID:', data.paymentRequestId)
      
      return {
        success: true,
        paymentRequestId: data.paymentRequestId,
        message: data.description,
        data: data
      }
    } catch (error) {
      console.error('CAC Payment Initiation Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Confirm payment with OTP
   * @param {Object} confirmData - Confirmation details
   * @returns {Promise<Object>} Payment confirmation response
   */
  async confirmPayment(confirmData) {
    try {
      const {
        paymentRequestId,
        otp,
        phoneNumber
      } = confirmData

      // TEST MODE: Simulate successful confirmation
      if (this.testMode) {
        console.log('🧪 TEST MODE: Simulating payment confirmation')
        console.log('🧪 Payment Request ID:', paymentRequestId)
        console.log('🧪 OTP:', otp)
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Simulate successful confirmation
        return {
          success: true,
          status: 'confirmed',
          message: 'Payment confirmed successfully (TEST MODE)',
          data: { paymentRequestId, otp, testMode: true }
        }
      }

      // First authenticate to get token
      const authResult = await this.authenticate()
      if (!authResult.success) {
        throw new Error('Authentication failed')
      }

      console.log('🔧 Confirming payment:', paymentRequestId, 'with OTP:', otp)
      console.log('🔧 Payment Request ID type:', typeof paymentRequestId)
      console.log('🔧 Using Bearer token')
      console.log('🔧 API URL:', `${this.proxyUrl}/PaymentConfirmationRequest`)

      // Ensure payment_request_id is a number (not string)
      const requestId = typeof paymentRequestId === 'string' ? parseInt(paymentRequestId) : paymentRequestId

      // PaymentConfirmationRequest REQUIRES Bearer token + app_key/api_key in body
      const response = await fetch(`${this.proxyUrl}/PaymentConfirmationRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authResult.token}`
        },
        body: JSON.stringify({
          app_key: this.apiKeys.app_key,
          api_key: this.apiKeys.api_key,
          payment_request_id: requestId,
          otp: otp
        }),
      })

      // According to Postman docs, this endpoint returns no response body
      // Check if response is successful (2xx status)
      if (!response.ok) {
        let errorMessage = 'Payment confirmation failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.errorDescription || errorMessage
        } catch (e) {
          // No JSON response, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      console.log('✅ Payment confirmed successfully')
      
      return {
        success: true,
        status: 'confirmed',
        message: 'Payment confirmed successfully',
        data: null // No response body expected
      }
    } catch (error) {
      console.error('CAC Payment Confirmation Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Verify payment status
   * @param {string} transactionId - Transaction ID to verify
   * @returns {Promise<Object>} Payment verification response
   */
  async verifyPayment(transactionId) {
    try {
      const response = await fetch(`${this.proxyUrl}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transactionId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Payment verification failed')
      }

      const data = await response.json()
      
      return {
        success: true,
        status: data.status,
        isPaid: data.status === 'success' || data.status === 'completed',
        amount: data.amount,
        message: data.message,
        data: data
      }
    } catch (error) {
      console.error('CAC Payment Verification Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

