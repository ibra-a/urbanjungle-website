#!/bin/bash
# Script to update .env file with production CAC Bank credentials

ENV_FILE=".env"

echo "🔧 Updating .env file with production CAC Bank credentials..."

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  .env file not found. Creating new one..."
    touch "$ENV_FILE"
fi

# Backup existing .env
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created: ${ENV_FILE}.backup.*"

# Update or add CAC Bank production credentials
grep -q "^VITE_CAC_API_URL=" "$ENV_FILE" && \
    sed -i '' 's|^VITE_CAC_API_URL=.*|VITE_CAC_API_URL=https://services.cacintbank.com:8749/pay/v1|' "$ENV_FILE" || \
    echo "VITE_CAC_API_URL=https://services.cacintbank.com:8749/pay/v1" >> "$ENV_FILE"

grep -q "^VITE_CAC_USERNAME=" "$ENV_FILE" && \
    sed -i '' 's|^VITE_CAC_USERNAME=.*|VITE_CAC_USERNAME=CACPAY_GAB|' "$ENV_FILE" || \
    echo "VITE_CAC_USERNAME=CACPAY_GAB" >> "$ENV_FILE"

grep -q "^VITE_CAC_PASSWORD=" "$ENV_FILE" && \
    sed -i '' 's|^VITE_CAC_PASSWORD=.*|VITE_CAC_PASSWORD=VklQX3xPVO9HRcKjY9FjcGF9UGFzJA#=|' "$ENV_FILE" || \
    echo "VITE_CAC_PASSWORD=VklQX3xPVO9HRcKjY9FjcGF9UGFzJA#=" >> "$ENV_FILE"

grep -q "^VITE_CAC_APP_KEY=" "$ENV_FILE" && \
    sed -i '' 's|^VITE_CAC_APP_KEY=.*|VITE_CAC_APP_KEY=(d}]477}ap#2n26_+i|' "$ENV_FILE" || \
    echo "VITE_CAC_APP_KEY=(d}]477}ap#2n26_+i" >> "$ENV_FILE"

grep -q "^VITE_CAC_API_KEY=" "$ENV_FILE" && \
    sed -i '' 's|^VITE_CAC_API_KEY=.*|VITE_CAC_API_KEY=Q555FDUEFZLVdB9u799jAyUUU=#|' "$ENV_FILE" || \
    echo "VITE_CAC_API_KEY=Q555FDUEFZLVdB9u799jAyUUU=#" >> "$ENV_FILE"

grep -q "^VITE_CAC_COMPANY_SERVICES_ID=" "$ENV_FILE" && \
    sed -i '' 's|^VITE_CAC_COMPANY_SERVICES_ID=.*|VITE_CAC_COMPANY_SERVICES_ID=10020|' "$ENV_FILE" || \
    echo "VITE_CAC_COMPANY_SERVICES_ID=10020" >> "$ENV_FILE"

grep -q "^VITE_PAYMENT_TEST_MODE=" "$ENV_FILE" && \
    sed -i '' 's|^VITE_PAYMENT_TEST_MODE=.*|VITE_PAYMENT_TEST_MODE=false|' "$ENV_FILE" || \
    echo "VITE_PAYMENT_TEST_MODE=false" >> "$ENV_FILE"

echo "✅ .env file updated with production credentials!"
echo ""
echo "📋 Please verify the following in your .env file:"
echo "   - VITE_CAC_API_URL=https://services.cacintbank.com:8749/pay/v1"
echo "   - VITE_CAC_USERNAME=CACPAY_GAB"
echo "   - VITE_CAC_COMPANY_SERVICES_ID=10020"
echo "   - VITE_PAYMENT_TEST_MODE=false"
echo ""
echo "⚠️  Make sure your Supabase credentials are also set!"
