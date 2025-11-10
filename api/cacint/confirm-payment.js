// Vercel Serverless Function for CACIntBank Payment Confirmation
// Confirms payment using OTP received by customer

export default async function handler(req, res) {
  // CORS headers - Enterprise security: restrict to production domains
  const allowedOrigins = [
    'https://gab-fashion-house.vercel.app',
    'https://urban-jungle.vercel.app',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'false');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, payment_request_id, otp } = req.body;
    
    // Validate required fields
    if (!token || !payment_request_id || !otp) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['token', 'payment_request_id', 'otp']
      });
    }

    // SECURITY: Strict input validation
    // Validate OTP format (typically 4-6 digits)
    if (!/^\d{4,6}$/.test(otp)) {
      return res.status(400).json({ 
        error: 'Invalid OTP format',
        message: 'OTP must be 4-6 digits'
      });
    }
    
    // Validate token format
    if (typeof token !== 'string' || token.length < 10 || token.length > 500) {
      return res.status(400).json({ 
        error: 'Invalid token format'
      });
    }
    
    // Validate payment_request_id (should be numeric string or number)
    const requestIdStr = payment_request_id.toString();
    if (!/^\d+$/.test(requestIdStr) || requestIdStr.length > 20) {
      return res.status(400).json({ 
        error: 'Invalid payment request ID'
      });
    }

    // Get Digital Ocean proxy URL (whitelisted IP: 157.230.110.104)
    // Proxy automatically adds app_key and api_key if not provided
    const DO_PROXY_URL = process.env.DO_PROXY_URL || 'http://157.230.110.104:3000';

    // Call Digital Ocean proxy (which has whitelisted IP) - proxy forwards to CAC Bank API
    const proxyEndpoint = `${DO_PROXY_URL}/api/cacint/PaymentConfirmationRequest`;
    console.log('🔗 Using Digital Ocean proxy (whitelisted IP):', proxyEndpoint);
    console.log('🔧 DO_PROXY_URL:', DO_PROXY_URL);
    console.log('🔧 Proxy will add credentials automatically');
    
    const response = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Proxy adds app_key and api_key automatically if not provided
        payment_request_id: payment_request_id.toString(), // Keep as string for large IDs (17+ digits)
        otp: otp.toString(),
      }),
    });

    const data = await response.json();
    
    // Handle payment confirmation failure
    if (!response.ok) {
      console.error('Payment confirmation failed:', data);
      
      // Check for specific error messages
      let errorMessage = 'Payment confirmation failed';
      if (data.description && data.description.toLowerCase().includes('otp')) {
        errorMessage = 'Invalid or expired OTP';
      }
      
      return res.status(response.status).json({ 
        error: errorMessage,
        details: data 
      });
    }

    // Return confirmation details to frontend
    res.status(200).json({
      success: true,
      confirmReference: data.confirmReference,
      reference: data.reference,
      description: data.description,
      message: 'Payment confirmed successfully',
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

