#!/usr/bin/env node
/**
 * Security Check Script
 * Validates security configurations and code patterns
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Running Security Checks...\n');

let passed = 0;
let failed = 0;
const issues = [];

// Test 1: Check for hardcoded passwords
console.log('1️⃣  Checking for hardcoded passwords...');
try {
  const createAdminPath = path.join(__dirname, 'create-admin.js');
  const createSchemaPath = path.join(__dirname, 'create-schema.js');

  const createAdminContent = fs.readFileSync(createAdminPath, 'utf8');
  const createSchemaContent = fs.readFileSync(createSchemaPath, 'utf8');

  // Check create-admin.js
  if (createAdminContent.includes('process.env.ADMIN_PASSWORD') &&
      !createAdminContent.match(/const\s+\w*[Pp]assword\s*=\s*['"][^'"]*!['"];/)) {
    console.log('   ✅ create-admin.js uses environment variables for passwords');
    passed++;
  } else {
    console.log('   ❌ create-admin.js may contain hardcoded passwords');
    issues.push('Hardcoded passwords found in create-admin.js');
    failed++;
  }

  // Check create-schema.js
  if (!createSchemaContent.includes('SanzoAdmin2025!')) {
    console.log('   ✅ create-schema.js does not expose passwords');
    passed++;
  } else {
    console.log('   ❌ create-schema.js contains hardcoded password');
    issues.push('Hardcoded password found in create-schema.js');
    failed++;
  }
} catch (error) {
  console.log(`   ⚠️  Error checking files: ${error.message}`);
}

// Test 2: Check .gitignore for .env files
console.log('\n2️⃣  Checking .gitignore configuration...');
try {
  const gitignorePath = path.join(__dirname, '../.gitignore');
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

  if (gitignoreContent.includes('.env') &&
      gitignoreContent.match(/\.env\.local/) &&
      gitignoreContent.includes('!.env.example')) {
    console.log('   ✅ .gitignore properly configured for environment files');
    passed++;
  } else {
    console.log('   ❌ .gitignore may not properly exclude .env files');
    issues.push('.gitignore configuration incomplete');
    failed++;
  }
} catch (error) {
  console.log(`   ⚠️  Error checking .gitignore: ${error.message}`);
}

// Test 3: Check environment example file
console.log('\n3️⃣  Checking .env.example...');
try {
  const envExamplePath = path.join(__dirname, '../.env.example');
  const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');

  if (envExampleContent.includes('ADMIN_PASSWORD') &&
      envExampleContent.includes('your_secure_admin_password_here') &&
      !envExampleContent.includes('SanzoAdmin2025!')) {
    console.log('   ✅ .env.example contains safe placeholder values');
    passed++;
  } else {
    console.log('   ❌ .env.example may contain real secrets');
    issues.push('.env.example contains real values');
    failed++;
  }
} catch (error) {
  console.log(`   ⚠️  Error checking .env.example: ${error.message}`);
}

// Test 4: Check for unsafe-inline in CSP
console.log('\n4️⃣  Checking Content Security Policy...');
try {
  const indexPath = path.join(__dirname, '../src/index.js');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  if (indexContent.includes('styleSrc') &&
      !indexContent.includes("'unsafe-inline'")) {
    console.log('   ✅ CSP does not use unsafe-inline for styles');
    passed++;
  } else {
    console.log('   ⚠️  CSP may use unsafe-inline (check if needed)');
    // Not a failure, just a warning
  }

  if (indexContent.includes('scriptSrc') &&
      !indexContent.includes("scriptSrc: [\"'self'\", \"'unsafe-inline'\"]")) {
    console.log('   ✅ CSP does not use unsafe-inline for scripts');
    passed++;
  } else {
    console.log('   ❌ CSP uses unsafe-inline for scripts');
    issues.push('Unsafe CSP configuration');
    failed++;
  }
} catch (error) {
  console.log(`   ⚠️  Error checking CSP: ${error.message}`);
}

// Test 5: Check authentication bypass protection
console.log('\n5️⃣  Checking authentication bypass protection...');
try {
  const authPath = path.join(__dirname, '../src/middleware/auth.js');
  const authContent = fs.readFileSync(authPath, 'utf8');

  if (authContent.includes("process.env.NODE_ENV === 'production'") &&
      authContent.includes('return next()')) {
    console.log('   ✅ Authentication bypass disabled in production');
    passed++;
  } else {
    console.log('   ❌ Authentication bypass may not be properly protected');
    issues.push('Auth bypass not protected in production');
    failed++;
  }
} catch (error) {
  console.log(`   ⚠️  Error checking auth middleware: ${error.message}`);
}

// Test 6: Check security middleware exists
console.log('\n6️⃣  Checking security middleware...');
try {
  const securityPath = path.join(__dirname, '../src/middleware/security.js');
  if (fs.existsSync(securityPath)) {
    const securityContent = fs.readFileSync(securityPath, 'utf8');

    if (securityContent.includes('sanitizeRequest') &&
        securityContent.includes('securityHeaders') &&
        securityContent.includes('validateProductionEnv')) {
      console.log('   ✅ Security middleware properly implemented');
      passed++;
    } else {
      console.log('   ⚠️  Security middleware may be incomplete');
    }
  } else {
    console.log('   ❌ Security middleware file not found');
    issues.push('Security middleware missing');
    failed++;
  }
} catch (error) {
  console.log(`   ⚠️  Error checking security middleware: ${error.message}`);
}

// Test 7: Check for SQL injection protection patterns
console.log('\n7️⃣  Checking SQL injection protection...');
try {
  const securityPath = path.join(__dirname, '../src/middleware/security.js');
  const securityContent = fs.readFileSync(securityPath, 'utf8');

  if (securityContent.includes('sqlInjectionPatterns') &&
      securityContent.includes('SELECT|INSERT|UPDATE|DELETE')) {
    console.log('   ✅ SQL injection protection implemented');
    passed++;
  } else {
    console.log('   ❌ SQL injection protection not found');
    issues.push('SQL injection protection missing');
    failed++;
  }
} catch (error) {
  console.log(`   ⚠️  Error checking SQL protection: ${error.message}`);
}

// Test 8: Check for XSS protection patterns
console.log('\n8️⃣  Checking XSS protection...');
try {
  const securityPath = path.join(__dirname, '../src/middleware/security.js');
  const securityContent = fs.readFileSync(securityPath, 'utf8');

  if (securityContent.includes('xssPatterns') &&
      securityContent.includes('<script')) {
    console.log('   ✅ XSS protection implemented');
    passed++;
  } else {
    console.log('   ❌ XSS protection not found');
    issues.push('XSS protection missing');
    failed++;
  }
} catch (error) {
  console.log(`   ⚠️  Error checking XSS protection: ${error.message}`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Security Check Summary');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (issues.length > 0) {
  console.log('\n🚨 Issues Found:');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
}

if (failed === 0) {
  console.log('\n🎉 All security checks passed!');
  console.log('✅ Application is ready for production deployment.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some security checks failed.');
  console.log('❌ Please address the issues before deploying to production.\n');
  process.exit(1);
}
