// Vercel Serverless Function for CACIntBank Authentication
// This endpoint manages JWT token authentication for CACIntBank API

export default async function handler(req, res) {
  // CORS headers - Enterprise security: restrict to production domains only
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'false');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Digital Ocean proxy URL (whitelisted IP: 157.230.110.104)
    const DO_PROXY_URL = process.env.DO_PROXY_URL || 'http://157.230.110.104:3000';
    const CACINT_USERNAME = process.env.CACINT_USERNAME;
    const CACINT_PASSWORD = process.env.CACINT_PASSWORD;

    // Validate environment variables
    if (!CACINT_USERNAME || !CACINT_PASSWORD) {
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Missing CACIntBank credentials' 
      });
    }

    // Call Digital Ocean proxy (which has whitelisted IP) - proxy forwards to CAC Bank API
    const proxyEndpoint = `${DO_PROXY_URL}/api/cacint/auth/signin`;
    console.log('🔗 Using Digital Ocean proxy (whitelisted IP):', proxyEndpoint);
    console.log('🔧 DO_PROXY_URL:', DO_PROXY_URL);
    
    // Retry logic for proxy connectivity issues
    const MAX_RETRIES = 3;
    const REQUEST_TIMEOUT = 20000; // 20 seconds per attempt
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${MAX_RETRIES} connecting to Digital Ocean proxy...`);
        
        // Create AbortController for timeout (compatible with Node.js)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
        
        const response = await fetch(proxyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Urban-Jungle/1.0',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            username: CACINT_USERNAME,
            password: CACINT_PASSWORD,
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // If we got a response (even if error), break retry loop
        if (response) {
          // Get response text first to handle empty or invalid JSON
          const responseText = await response.text();
    
          // Handle 403 Forbidden (likely IP whitelisting issue)
          if (response.status === 403) {
            console.error('403 Forbidden from CAC Bank API:', responseText);
            return res.status(403).json({
              error: '403 Forbidden - Access Denied',
              message: 'The CAC Bank API is blocking this request. This usually means:',
              possibleCauses: [
                'Your IP address is not whitelisted with CAC Bank',
                'The API only allows requests from specific domains/IPs',
                'You may need to contact CAC Bank to whitelist your IP address',
                'Vercel serverless functions might have whitelisted IPs - try testing on deployment'
              ],
              responseText: responseText.substring(0, 500),
              status: 403
            });
          }
          
          let data;
          try {
            data = responseText ? JSON.parse(responseText) : {};
          } catch (parseError) {
            console.error('Failed to parse response:', responseText);
            return res.status(500).json({
              error: 'Invalid response from CAC Bank API',
              message: 'Response was not valid JSON',
              responseText: responseText.substring(0, 200),
              status: response.status
            });
          }
          
          // Handle authentication failure
          if (!response.ok) {
            // SECURITY: Don't expose internal error details to client
            console.error('CACIntBank auth failed:', {
              status: response.status,
              errorCode: data.errorCode,
              message: data.message
            });
            
            // Return generic error to client (don't leak system details)
            return res.status(401).json({ 
              error: 'Authentication failed',
              message: 'Invalid credentials or service unavailable'
            });
          }

          // Success! Return token to frontend
          console.log('✅ Authentication successful on attempt', attempt);
          return res.status(200).json({
            success: true,
            token: data.accessToken,
            expiresIn: 86400, // 24 hours in seconds
            tokenType: data.tokenType || 'Bearer',
          });
        }
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);
        
        // If this is the last attempt, return error
        if (attempt === MAX_RETRIES) {
          if (error.name === 'AbortError' || error.message?.includes('timeout')) {
            return res.status(504).json({
              error: 'Gateway Timeout',
              message: `Timeout connecting to Digital Ocean proxy after ${MAX_RETRIES} attempts. The proxy server may not be running or is unreachable.`,
              hint: 'Please verify the proxy server is running on port 3000 and accessible from Vercel.',
              attempts: MAX_RETRIES
            });
          }
          return res.status(502).json({
            error: 'Bad Gateway',
            message: `Failed to connect to Digital Ocean proxy after ${MAX_RETRIES} attempts: ${error.message}`,
            hint: 'Please verify the proxy server is running and accessible.',
            attempts: MAX_RETRIES
          });
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Should never reach here, but just in case
    return res.status(502).json({
      error: 'Bad Gateway',
      message: `Failed to connect to Digital Ocean proxy after ${MAX_RETRIES} attempts`,
      hint: 'Please verify the proxy server is running and accessible.'
    });
  } catch (error) {
    // SECURITY: Log full error server-side, but return generic message to client
    console.error('CACIntBank auth error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Return generic error (don't expose internal details)
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication service temporarily unavailable'
    });
  }
}

