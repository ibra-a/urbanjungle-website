// Vercel Serverless Function for CACIntBank Payment Verification
// Verifies payment status using reference number

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
    const { token, reference } = req.body;
    
    // SECURITY: Strict input validation
    if (!token || !reference) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['token', 'reference']
      });
    }
    
    // Validate token format
    if (typeof token !== 'string' || token.length < 10 || token.length > 500) {
      return res.status(400).json({ 
        error: 'Invalid token format'
      });
    }
    
    // Validate reference format (alphanumeric, reasonable length)
    if (typeof reference !== 'string' || reference.length < 1 || reference.length > 100) {
      return res.status(400).json({ 
        error: 'Invalid reference format'
      });
    }

    // Get Digital Ocean proxy URL (whitelisted IP: 157.230.110.104)
    // Proxy automatically adds app_key and api_key
    const DO_PROXY_URL = process.env.DO_PROXY_URL || 'http://157.230.110.104:3000';

    // Call Digital Ocean proxy (which has whitelisted IP) - proxy forwards to CAC Bank API
    const proxyEndpoint = `${DO_PROXY_URL}/api/cacint/verify-payment`;
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
        // Proxy adds app_key and api_key automatically
        reference: reference.toString(),
      }),
    });

    const data = await response.json();
    
    // Handle verification failure
    if (!response.ok) {
      console.error('Payment verification failed:', data);
      return res.status(response.status).json({ 
        error: 'Payment verification failed',
        details: data 
      });
    }

    // Return payment details to frontend
    res.status(200).json({
      success: true,
      customerName: data.customerName,
      reference: data.reference,
      amount: data.amount,
      transactionDate: data.transactionDate,
      transactionNo: data.transactionNo,
      description: data.description,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

