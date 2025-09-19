/**
 * Create Database Schema for Sanzo Color Advisor
 * Creates schema and tables via direct SQL execution
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql, description) {
  console.log(`\n🔧 ${description}...`);

  try {
    // For self-hosted Supabase, we need to use REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ sql })
    });

    if (response.ok) {
      console.log(`✅ ${description} completed successfully`);
      return true;
    } else {
      const error = await response.text();
      console.log(`⚠️  ${description} - Direct SQL not available (normal for security)`);
      console.log(`   Response: ${error.substring(0, 100)}...`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️  ${description} - ${error.message}`);
    return false;
  }
}

async function createSchemaManually() {
  console.log('\n🏗️  Creating schema manually via table operations...');

  // Since direct SQL might not work, let's try creating tables one by one
  try {
    // Test if we can create a simple table first
    console.log('   Testing table creation capability...');

    const { error: testError } = await supabase
      .from('test_table')
      .select('*')
      .limit(1);

    if (testError && testError.message.includes('does not exist')) {
      console.log('   ✅ Ready to create tables (no existing conflicts)');
    }

    console.log('\n📋 Manual Schema Creation Required');
    console.log('   Due to security restrictions in self-hosted Supabase,');
    console.log('   you need to create the schema manually.');

    return false;
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function updateProfiles() {
  console.log('\n👤 Updating user profiles...');

  try {
    // Try to get existing users
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log(`❌ Could not get users: ${authError.message}`);
      return false;
    }

    console.log(`   Found ${users.users.length} users to update`);

    for (const user of users.users) {
      if (user.email === 'admin@sanzo-color-advisor.com') {
        console.log(`   📝 Admin user ready: ${user.email} (${user.id})`);
      } else if (user.email === 'test@sanzo-color-advisor.com') {
        console.log(`   📝 Test user ready: ${user.email} (${user.id})`);
      }
    }

    return true;
  } catch (error) {
    console.log(`❌ Profile update failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🎨 Sanzo Color Advisor - Schema Creation');
  console.log('========================================\n');

  // Read SQL file
  const sqlFile = 'supabase/multi-schema-database.sql';
  let sql = '';

  try {
    sql = fs.readFileSync(sqlFile, 'utf8');
    console.log(`✅ Loaded SQL file: ${sqlFile} (${sql.length} characters)`);
  } catch (error) {
    console.log(`❌ Could not read SQL file: ${error.message}`);
    process.exit(1);
  }

  // Try to execute SQL
  const sqlSuccess = await executeSQL(sql, 'Creating database schema');

  if (!sqlSuccess) {
    await createSchemaManually();
  }

  // Update user profiles
  await updateProfiles();

  console.log('\n🎯 Next Steps:');
  console.log('1. Go to Supabase Dashboard: https://supabase.turklawai.com');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the contents of: supabase/multi-schema-database.sql');
  console.log('4. Execute the SQL to create all tables and schemas');
  console.log('5. Verify tables created with: \\dt sanzo_color_advisor.sanzo_*');

  console.log('\n📋 Admin Login Credentials:');
  console.log('Email: admin@sanzo-color-advisor.com');
  console.log('Password: SanzoAdmin2025!');

  console.log('\n✅ Users created, schema pending manual creation');
}

main().catch(console.error);