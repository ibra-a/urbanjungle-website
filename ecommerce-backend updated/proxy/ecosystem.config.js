module.exports = {
  apps: [{
    name: 'cacint-proxy',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      CAC_API_BASE_URL: 'http://172.17.2.52:8080/pay/paymentapi'
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3001,
      CAC_API_BASE_URL: 'http://172.17.2.52:8080/pay/paymentapi'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}

