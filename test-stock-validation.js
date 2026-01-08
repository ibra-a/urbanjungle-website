#!/usr/bin/env node

/**
 * Quick test script for verify-stock-uj Edge Function
 * 
 * Usage:
 *   node test-stock-validation.js <item_code> <quantity>
 * 
 * Example:
 *   node test-stock-validation.js 719833610637 1
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tcpsgddtixfqnenlsqyt.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const itemCode = process.argv[2];
const quantity = parseInt(process.argv[3]) || 1;

if (!itemCode) {
  console.error('❌ Error: Item code required');
  console.log('\nUsage: node test-stock-validation.js <item_code> <quantity>');
  console.log('Example: node test-stock-validation.js 719833610637 1\n');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Error: VITE_SUPABASE_ANON_KEY environment variable required');
  console.log('Set it in .env file or export it:\n');
  console.log('  export VITE_SUPABASE_ANON_KEY=your-key');
  console.log('  node test-stock-validation.js', itemCode, quantity, '\n');
  process.exit(1);
}

async function testStockValidation() {
  console.log('🧪 Testing Stock Validation\n');
  console.log('Item Code:', itemCode);
  console.log('Quantity:', quantity);
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('');

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-stock-uj`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            id: 'test-1',
            item_code: itemCode,
            quantity: quantity
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error Response:', response.status, response.statusText);
      console.error('Response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('✅ Response received:\n');
    console.log(JSON.stringify(data, null, 2));
    console.log('');

    // Summary
    if (data.all_available) {
      console.log('✅ Stock Available!');
      console.log(`   Requested: ${quantity}`);
      console.log(`   Available: ${data.items[0]?.available || 0}`);
      console.log(`   Source: ${data.source || 'unknown'}`);
    } else {
      console.log('❌ Stock Insufficient!');
      console.log(`   Requested: ${quantity}`);
      console.log(`   Available: ${data.items[0]?.available || 0}`);
      console.log(`   Source: ${data.source || 'unknown'}`);
    }

    if (data.warning) {
      console.log('\n⚠️  Warning:', data.warning);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

testStockValidation();

