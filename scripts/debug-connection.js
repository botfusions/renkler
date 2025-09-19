/**
 * Debug Supabase Connection Issues
 * Tests different authentication methods and provides detailed error info
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔧 Debug Supabase Connection');
console.log('============================\n');

console.log('Environment Variables:');
console.log(`SUPABASE_URL: ${supabaseUrl}`);
console.log(`ANON_KEY: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING'}`);
console.log(`SERVICE_KEY: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'MISSING'}`);

async function testWithAnonKey() {
  console.log('\n🔍 Testing with Anon Key...');

  if (!supabaseAnonKey) {
    console.log('❌ Anon key missing');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`⚠️  Expected error with anon key: ${error.message}`);
      console.log('   (This is normal - anon key has limited access)');
    } else {
      console.log('✅ Anon key works!');
    }

    return true;
  } catch (error) {
    console.log(`❌ Anon key test failed: ${error.message}`);
    return false;
  }
}

async function testWithServiceKey() {
  console.log('\n🔍 Testing with Service Key...');

  if (!supabaseServiceKey) {
    console.log('❌ Service key missing');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test auth admin access
    console.log('   Testing auth admin access...');
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log(`❌ Auth admin failed: ${authError.message}`);
      console.log('   Possible issues:');
      console.log('   1. Service key is incorrect');
      console.log('   2. Self-hosted Supabase auth not configured properly');
      console.log('   3. JWT secret mismatch');
      return false;
    }

    console.log(`✅ Service key works! Found ${users.users.length} existing users`);

    // List existing users
    if (users.users.length > 0) {
      console.log('\n   Existing users:');
      users.users.forEach(user => {
        console.log(`   - ${user.email} (${user.id}) - Created: ${user.created_at}`);
      });
    }

    return true;
  } catch (error) {
    console.log(`❌ Service key test failed: ${error.message}`);
    return false;
  }
}

async function testBasicHTTP() {
  console.log('\n🔍 Testing Basic HTTP Connection...');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    console.log(`   HTTP Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);

    if (response.ok) {
      console.log('✅ Basic HTTP connection works!');
      return true;
    } else {
      console.log('❌ HTTP connection failed');
      const text = await response.text();
      console.log(`   Response: ${text.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ HTTP test failed: ${error.message}`);
    return false;
  }
}

async function testSchemaAccess() {
  console.log('\n🔍 Testing Schema Access...');

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try to access a common table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`   Expected error: ${error.message}`);
      console.log('   (Normal for protected tables)');
    }

    // Try health check
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey
      }
    });

    if (response.ok) {
      console.log('✅ Schema access available');
      return true;
    }

    return false;
  } catch (error) {
    console.log(`❌ Schema access failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Starting comprehensive connection test...\n');

  const httpOk = await testBasicHTTP();
  const anonOk = await testWithAnonKey();
  const serviceOk = await testWithServiceKey();
  const schemaOk = await testSchemaAccess();

  console.log('\n📊 Test Results Summary:');
  console.log(`   HTTP Connection: ${httpOk ? '✅' : '❌'}`);
  console.log(`   Anon Key: ${anonOk ? '✅' : '❌'}`);
  console.log(`   Service Key: ${serviceOk ? '✅' : '❌'}`);
  console.log(`   Schema Access: ${schemaOk ? '✅' : '❌'}`);

  if (serviceOk) {
    console.log('\n🎉 Service key is working! Ready to create admin user and schema.');
    console.log('\n📋 Next Steps:');
    console.log('1. Run admin creation script');
    console.log('2. Execute schema creation SQL');
  } else {
    console.log('\n❌ Service key issue detected.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify service key is correct in .env file');
    console.log('2. Check self-hosted Supabase JWT_SECRET configuration');
    console.log('3. Ensure auth service is running properly');
    console.log('4. Try regenerating service key in Supabase dashboard');
  }
}

main().catch(console.error);