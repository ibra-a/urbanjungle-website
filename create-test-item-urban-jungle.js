/**
 * Create Test Item in ERPNext for Urban Jungle
 * Similar to Tommy CK test item but for UJ warehouse
 */

import 'dotenv/config';

const ERP_BASE_URL = process.env.VITE_ERP_BASE_URL?.trim();
const ERP_API_KEY = process.env.VITE_ERP_API_KEY?.trim();
const ERP_SECRET_KEY = process.env.VITE_ERP_SECRET_KEY?.trim();

// Test item for Urban Jungle
const testItem = {
  item_code: 'TEST-UJ-TSHIRT-BLACK-M',
  item_name: 'TEST Urban Jungle T-Shirt — Black — M',
  item_group: 'Apparel - Urban Jungle',
  brand: 'URBAN',
  stock_uom: 'Nos',
  description: '🧪 TEST ITEM - Safe to delete after testing',
  is_stock_item: 1,
  include_item_in_manufacturing: 0,
  standard_rate: 10,
  valuation_rate: 10,
  custom_product_id: 'TEST-UJ-001-BLK-M'
};

async function createTestItem() {
  console.log('🧪 Creating Urban Jungle test item in ERPNext...\n');
  
  try {
    console.log(`📦 Creating: ${testItem.item_code}...`);
    
    const response = await fetch(`${ERP_BASE_URL}api/resource/Item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${ERP_API_KEY}:${ERP_SECRET_KEY}`
      },
      body: JSON.stringify(testItem)
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Created: ${testItem.item_code}`);
      console.log(`   Item Group: ${testItem.item_group}`);
      console.log(`   Brand: ${testItem.brand}`);
      console.log(`   Rate: ${testItem.standard_rate} DJF`);
      
      // Add opening stock to UJ - GFH warehouse
      console.log(`   📊 Adding stock to UJ - GFH warehouse...`);
      const stockSuccess = await addOpeningStock(testItem.item_code, 999, testItem.valuation_rate);
      if (stockSuccess) {
        console.log('\n' + '='.repeat(70));
        console.log('✅ Urban Jungle test item creation complete!');
        console.log('='.repeat(70));
        console.log('');
        console.log('📋 Item in ERPNext:');
        console.log(`   • ${testItem.item_code} (${testItem.standard_rate} DJF, 999 stock in UJ - GFH)`);
        console.log('');
        console.log('📋 Next Steps:');
        console.log('   1. Run sync script to add to Supabase:');
        console.log('      cd ../tommyck-website && node sync-urban-jungle-to-supabase.js');
        console.log('   2. Item will appear on Urban Jungle website');
        console.log('   3. Test checkout flow');
        console.log('');
        console.log('🧹 Cleanup after testing:');
        console.log('   Delete item from ERPNext manually or use delete script');
        console.log('');
      }
    } else {
      if (result.exception && result.exception.includes('already exists')) {
        console.log(`⚠️  ${testItem.item_code} already exists - adding stock anyway`);
        const stockSuccess = await addOpeningStock(testItem.item_code, 999, testItem.valuation_rate);
        if (stockSuccess) {
          console.log('\n✅ Test item already exists, stock updated!');
        }
      } else {
        console.error(`❌ Error: ${result.exception || result.message}`);
        console.error('Full response:', JSON.stringify(result, null, 2));
      }
    }
  } catch (error) {
    console.error(`❌ Failed to create ${testItem.item_code}:`, error.message);
    console.error('Stack:', error.stack);
  }
}

async function addOpeningStock(itemCode, qty, rate) {
  try {
    const stockEntry = {
      doctype: 'Stock Entry',
      stock_entry_type: 'Material Receipt',
      company: 'GAB Fashion House',
      to_warehouse: 'UJ - GFH',  // Urban Jungle warehouse
      items: [{
        item_code: itemCode,
        qty: qty,
        basic_rate: rate,
        t_warehouse: 'UJ - GFH',  // Urban Jungle warehouse
        cost_center: 'Main - GFH'
      }]
    };

    const response = await fetch(`${ERP_BASE_URL}api/resource/Stock Entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${ERP_API_KEY}:${ERP_SECRET_KEY}`
      },
      body: JSON.stringify(stockEntry)
    });

    const result = await response.json();

    if (response.ok) {
      // Submit the stock entry
      const submitResponse = await fetch(`${ERP_BASE_URL}api/resource/Stock Entry/${result.data.name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${ERP_API_KEY}:${ERP_SECRET_KEY}`
        },
        body: JSON.stringify({ docstatus: 1 })
      });
      
      if (submitResponse.ok) {
        console.log(`   ✅ Stock added: ${qty} units to UJ - GFH (Entry: ${result.data.name})`);
        return true;
      } else {
        console.log(`   ⚠️  Stock Entry created but not submitted: ${result.data.name}`);
        return false;
      }
    } else {
      console.log(`   ⚠️  Could not add stock: ${result.exception || result.message}`);
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  Stock entry error: ${error.message}`);
    return false;
  }
}

createTestItem();

