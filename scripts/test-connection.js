/**
 * Test Supabase Connection and Create Schema
 * Tests connection to turklawai.com Supabase instance
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔗 Testing Supabase Connection...');
console.log(`URL: ${supabaseUrl}`);
console.log(`Service Key: ${supabaseServiceKey ? 'Present' : 'Missing'}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('\n🔍 Testing basic connection...');

    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1);

    if (healthError && healthError.code !== 'PGRST116') {
      console.log('⚠️  Health check table not found (normal), but connection works!');
    } else {
      console.log('✅ Basic connection successful!');
    }

    // Test auth connection
    console.log('\n🔍 Testing auth system...');
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Auth connection failed:', authError.message);
      return false;
    }

    console.log(`✅ Auth connection successful! Found ${users.users.length} users`);

    // Check if our schema exists
    console.log('\n🔍 Checking for sanzo_color_advisor schema...');
    const { data: schemas, error: schemaError } = await supabase
      .rpc('get_schemas')
      .then(result => ({ data: null, error: result.error }))
      .catch(() => ({ data: null, error: null }));

    // Try to create schema if it doesn't exist
    console.log('\n🏗️  Creating sanzo_color_advisor schema...');

    const createSchemaSQL = `
      -- Create schema
      CREATE SCHEMA IF NOT EXISTS sanzo_color_advisor;

      -- Test table creation
      CREATE TABLE IF NOT EXISTS sanzo_color_advisor.sanzo_test (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createSchemaSQL
    });

    if (createError) {
      console.log('⚠️  Direct SQL execution not available, this is normal for security');
      console.log('   Schema creation will need to be done via SQL Editor');
    } else {
      console.log('✅ Schema creation successful!');
    }

    return true;

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

async function createAdminUser() {
  try {
    console.log('\n👤 Creating admin user...');

    const adminEmail = 'admin@sanzo-color-advisor.com';
    const adminPassword = 'SanzoAdmin2025!';

    // Check if admin already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const adminExists = existingUsers.users.find(user => user.email === adminEmail);

    if (adminExists) {
      console.log('ℹ️  Admin user already exists:');
      console.log(`   ID: ${adminExists.id}`);
      console.log(`   Email: ${adminExists.email}`);
      console.log(`   Created: ${adminExists.created_at}`);
      return true;
    }

    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Sanzo Admin',
        role: 'admin'
      }
    });

    if (adminError) {
      console.error('❌ Failed to create admin user:', adminError.message);
      return false;
    }

    console.log('✅ Admin user created successfully!');
    console.log(`   ID: ${adminData.user.id}`);
    console.log(`   Email: ${adminData.user.email}`);

    return true;

  } catch (error) {
    console.error('❌ Admin user creation failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎨 Sanzo Color Advisor - Supabase Setup');
  console.log('===========================================\n');

  const connectionOk = await testConnection();

  if (connectionOk) {
    await createAdminUser();

    console.log('\n🎉 Setup Summary:');
    console.log('✅ Supabase connection verified');
    console.log('⚠️  Schema creation: Run multi-schema-database.sql in SQL Editor');
    console.log('✅ Admin user creation attempted');

    console.log('\n📋 Next Steps:');
    console.log('1. Go to Supabase Dashboard SQL Editor');
    console.log('2. Run: supabase/multi-schema-database.sql');
    console.log('3. Verify tables created with: \\dt sanzo_color_advisor.sanzo_*');
    console.log('4. Test login with admin@sanzo-color-advisor.com / SanzoAdmin2025!');

  } else {
    console.log('\n❌ Connection failed. Please check:');
    console.log('1. Supabase URL is correct');
    console.log('2. Service key has proper permissions');
    console.log('3. Self-hosted instance is running');
  }
}

main().catch(console.error);