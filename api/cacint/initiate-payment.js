// Vercel Serverless Function for CACIntBank Payment Initiation
// Initiates payment and triggers OTP SMS to customer

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
    const { token, customer_mobile, amount, desc, vender_ref } = req.body;
    
    // Validate required fields
    if (!token || !customer_mobile || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['token', 'customer_mobile', 'amount']
      });
    }

    // Validate amount range (10 - 100,000 DJF)
    const amountNum = parseFloat(amount);
    if (amountNum < 10 || amountNum > 100000) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        message: 'Amount must be between 10 and 100,000 DJF'
      });
    }

    // SECURITY: Strict input validation
    // Validate phone number format (international format without +)
    const phoneRegex = /^77\d{6}$/;
    if (!phoneRegex.test(customer_mobile)) {
      return res.status(400).json({ 
        error: 'Invalid phone number',
        message: 'Phone must be in format: 77XXXXXX'
      });
    }
    
    // Validate token format (should be a string, not empty)
    if (typeof token !== 'string' || token.length < 10 || token.length > 500) {
      return res.status(400).json({ 
        error: 'Invalid token format'
      });
    }
    
    // Validate description length (prevent extremely long inputs)
    if (desc && desc.length > 500) {
      return res.status(400).json({ 
        error: 'Description too long'
      });
    }

    // Get Digital Ocean proxy URL (whitelisted IP: 157.230.110.104)
    // Proxy automatically adds app_key, api_key, and company_services_id
    const DO_PROXY_URL = process.env.DO_PROXY_URL || 'http://157.230.110.104:3000';

    // Call Digital Ocean proxy (which has whitelisted IP) - proxy forwards to CAC Bank API
    const proxyEndpoint = `${DO_PROXY_URL}/api/cacint/PaymentInitiateRequest`;
    // SECURITY: Minimal logging in production (no token exposure)
    console.log('🔗 Using Digital Ocean proxy (whitelisted IP):', proxyEndpoint);
    console.log('🔧 Token present:', token ? 'YES' : 'NO');
    // Don't log token even partially - security risk
    
    const response = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Proxy adds app_key, api_key, company_services_id automatically
        customer_mobile,
        currency: 'DJF',
        desc: desc || 'Urban Jungle Purchase',
        vender_ref: vender_ref || `UJ-${Date.now()}`,
        amount: amountNum,
      }),
    });

    // Get response text first to handle empty or invalid JSON
    const responseText = await response.text();
    let data;
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('Failed to parse payment response:', responseText);
      return res.status(500).json({
        error: 'Invalid response from CAC Bank API',
        message: 'Response was not valid JSON',
        responseText: responseText.substring(0, 200) // First 200 chars for debugging
      });
    }
    
    // Handle payment initiation failure
    if (!response.ok) {
      console.error('❌ Payment initiation failed');
      console.error('   Status:', response.status);
      console.error('   Response data:', JSON.stringify(data, null, 2));
      console.error('   Response text:', responseText.substring(0, 500));
      
      // Provide more detailed error message
      let errorMessage = 'Payment initiation failed';
      if (response.status === 401) {
        errorMessage = 'Authentication failed - token may be invalid or expired. Please try authenticating again.';
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
      
      return res.status(response.status).json({ 
        error: errorMessage,
        details: data,
        status: response.status,
        message: 'Check console logs for more details'
      });
    }

    // Return payment request ID to frontend
    // OTP will be sent to customer's phone automatically
    res.status(200).json({
      success: true,
      paymentRequestId: data.paymentRequestId,
      description: data.description,
      message: 'OTP sent to customer mobile',
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

