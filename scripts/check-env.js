#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Build environment checker
console.log('🔍 Checking build environment...\n');

// Load environment variables from .env.local
function loadEnvFile(filePath) {
    if (fs.existsSync(filePath)) {
        const envContent = fs.readFileSync(filePath, 'utf8');
        const envVars = {};

        envContent.split('\n').forEach((line) => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key.trim()] = valueParts.join('=').trim();
                }
            }
        });

        return envVars;
    }
    return {};
}

// Load environment variables from various sources
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

const envLocalVars = loadEnvFile(envLocalPath);
const envVars = loadEnvFile(envPath);

// Merge environment variables (process.env takes precedence, then .env.local, then .env)
const allEnvVars = { ...envVars, ...envLocalVars, ...process.env };

console.log(`📁 Checking environment files:
   - .env.local: ${fs.existsSync(envLocalPath) ? '✅ Found' : '❌ Not found'}
   - .env: ${fs.existsSync(envPath) ? '✅ Found' : '❌ Not found'}
`);

const requiredEnvVars = [
    'NEXT_PUBLIC_APPWRITE_ENDPOINT',
    'NEXT_PUBLIC_APPWRITE_PROJECT',
    'NEXT_APPWRITE_KEY',
    'APPWRITE_DATABASE_ID',
    'APPWRITE_USER_COLLECTION_ID',
    'APPWRITE_BANK_COLLECTION_ID',
    'APPWRITE_TRANSACTION_COLLECTION_ID',
];

const optionalEnvVars = [
    'PLAID_CLIENT_ID',
    'PLAID_SECRET',
    'DWOLLA_KEY',
    'DWOLLA_SECRET',
    'SENTRY_DSN',
];

let missingRequired = [];
let missingOptional = [];

// Check required environment variables
requiredEnvVars.forEach((envVar) => {
    if (!allEnvVars[envVar] || allEnvVars[envVar] === '') {
        missingRequired.push(envVar);
    } else {
        console.log(
            `✅ ${envVar}: Set (${allEnvVars[envVar].substring(0, 20)}...)`
        );
    }
});

// Check optional environment variables
optionalEnvVars.forEach((envVar) => {
    if (!allEnvVars[envVar] || allEnvVars[envVar] === '') {
        missingOptional.push(envVar);
    } else {
        console.log(
            `✅ ${envVar}: Set (${allEnvVars[envVar].substring(0, 20)}...)`
        );
    }
});

console.log('\n📋 Environment Check Summary:');

if (missingRequired.length > 0) {
    console.log('\n❌ Missing Required Environment Variables:');
    missingRequired.forEach((envVar) => {
        console.log(`   - ${envVar}`);
    });
    console.log(
        '\n🔧 These variables are required for the application to function properly.'
    );
    console.log(
        '   Please check your .env.local file or environment configuration.'
    );
    process.exit(1);
} else {
    console.log('\n✅ All required environment variables are set!');
}

if (missingOptional.length > 0) {
    console.log('\n⚠️  Missing Optional Environment Variables:');
    missingOptional.forEach((envVar) => {
        console.log(`   - ${envVar}`);
    });
    console.log(
        '\n💡 These variables are optional but recommended for full functionality.'
    );
}

console.log('\n🚀 Environment check completed successfully!');
console.log('   Your application should build and run properly.\n');
