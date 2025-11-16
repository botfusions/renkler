/**
 * Create Admin User Script for Sanzo Color Advisor
 * This script creates an admin user via Supabase Admin API
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Multi-schema configuration
const tablePrefix = process.env.SUPABASE_TABLE_PREFIX || 'sanzo_';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - REACT_APP_SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🚀 Creating admin user for Sanzo Color Advisor...\n');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sanzo-color-advisor.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  const testEmail = process.env.TEST_EMAIL || 'test@sanzo-color-advisor.com';
  const testPassword = process.env.TEST_PASSWORD;

  // Validate required environment variables
  if (!adminPassword || !testPassword) {
    console.error('❌ Missing required environment variables:');
    if (!adminPassword) console.error('   - ADMIN_PASSWORD is required');
    if (!testPassword) console.error('   - TEST_PASSWORD is required');
    console.error('\nPlease set these in your .env file or environment.');
    process.exit(1);
  }

  try {
    // Create admin user
    console.log('📧 Creating admin user...');
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
    } else {
      console.log('✅ Admin user created successfully!');
      console.log(`   ID: ${adminData.user.id}`);
      console.log(`   Email: ${adminData.user.email}`);

      // Update admin profile
      const { error: profileError } = await supabase
        .from(`${tablePrefix}profiles`)
        .upsert({
          id: adminData.user.id,
          email: adminEmail,
          full_name: 'Sanzo Admin',
          language_preference: 'tr',
          theme_preference: 'light',
          accessibility_settings: {
            high_contrast: false,
            reduced_motion: false,
            screen_reader: false,
            large_text: false,
            keyboard_navigation: true
          }
        });

      if (profileError) {
        console.warn('⚠️  Warning: Could not create admin profile:', profileError.message);
      } else {
        console.log('✅ Admin profile created successfully!');
      }
    }

    // Create test user
    console.log('\n📧 Creating test user...');
    const { data: testData, error: testError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        role: 'user'
      }
    });

    if (testError) {
      console.error('❌ Failed to create test user:', testError.message);
    } else {
      console.log('✅ Test user created successfully!');
      console.log(`   ID: ${testData.user.id}`);
      console.log(`   Email: ${testData.user.email}`);

      // Update test user profile
      const { error: testProfileError } = await supabase
        .from(`${tablePrefix}profiles`)
        .upsert({
          id: testData.user.id,
          email: testEmail,
          full_name: 'Test User',
          language_preference: 'tr',
          theme_preference: 'light',
          accessibility_settings: {}
        });

      if (testProfileError) {
        console.warn('⚠️  Warning: Could not create test profile:', testProfileError.message);
      } else {
        console.log('✅ Test user profile created successfully!');
      }
    }

    // Display summary
    console.log('\n🎉 User creation completed!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ ADMIN USER                              │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ Email:    ${adminEmail.padEnd(29)}│`);
    console.log('│ Password: [Set via ADMIN_PASSWORD]     │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ TEST USER                               │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ Email:    ${testEmail.padEnd(29)}│`);
    console.log('│ Password: [Set via TEST_PASSWORD]      │');
    console.log('└─────────────────────────────────────────┘');

    console.log('\n💡 Next Steps:');
    console.log('1. Test login with both accounts');
    console.log('2. Run seed data script if needed');
    console.log('3. Configure OAuth providers (optional)');
    console.log('4. Start your application server');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

async function checkExistingUsers() {
  console.log('🔍 Checking for existing users...\n');

  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Failed to list users:', error.message);
      return false;
    }

    const adminExists = users.users.find(user => user.email === 'admin@sanzo-color-advisor.com');
    const testExists = users.users.find(user => user.email === 'test@sanzo-color-advisor.com');

    if (adminExists) {
      console.log('ℹ️  Admin user already exists:');
      console.log(`   ID: ${adminExists.id}`);
      console.log(`   Email: ${adminExists.email}`);
      console.log(`   Created: ${adminExists.created_at}`);
    }

    if (testExists) {
      console.log('ℹ️  Test user already exists:');
      console.log(`   ID: ${testExists.id}`);
      console.log(`   Email: ${testExists.email}`);
      console.log(`   Created: ${testExists.created_at}`);
    }

    if (adminExists && testExists) {
      console.log('\n✅ Both users already exist. Skipping creation.');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error checking existing users:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🎨 Sanzo Color Advisor - Admin User Setup');
  console.log('==========================================\n');

  const usersExist = await checkExistingUsers();

  if (!usersExist) {
    await createAdminUser();
  }

  console.log('\n🎯 Setup complete! You can now start your application.');
}

// Run the script
main().catch(console.error);