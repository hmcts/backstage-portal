#!/usr/bin/env node

/**
 * Simple configuration validation script for Microsoft Auth setup
 */

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

console.log('🔍 Validating Microsoft Authentication Configuration...\n');

// Check if config files exist
const configPath = path.join(__dirname, 'app-config.yaml');
const prodConfigPath = path.join(__dirname, 'app-config.production.yaml');

if (!fs.existsSync(configPath)) {
  console.error('❌ app-config.yaml not found');
  process.exit(1);
}

if (!fs.existsSync(prodConfigPath)) {
  console.error('❌ app-config.production.yaml not found');
  process.exit(1);
}

try {
  // Load and parse configs
  const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
  const prodConfig = yaml.load(fs.readFileSync(prodConfigPath, 'utf8'));

  console.log('✅ Configuration files loaded successfully');

  // Check Microsoft auth provider
  const hasDevMicrosoft = config.auth?.providers?.microsoft?.development;
  const hasProdMicrosoft = prodConfig.auth?.providers?.microsoft?.production;

  if (hasDevMicrosoft) {
    console.log('✅ Development Microsoft auth provider configured');
    
    // Check for sign-in resolvers
    const hasResolvers = hasDevMicrosoft.signIn?.resolvers;
    if (hasResolvers && hasResolvers.length > 0) {
      console.log(`✅ Sign-in resolvers configured (${hasResolvers.length} resolvers)`);
      hasResolvers.forEach((resolver, index) => {
        console.log(`   ${index + 1}. ${resolver.resolver}`);
      });
    } else {
      console.error('❌ No sign-in resolvers configured for development');
    }
  } else {
    console.error('❌ Development Microsoft auth provider not configured');
  }

  if (hasProdMicrosoft) {
    console.log('✅ Production Microsoft auth provider configured');
    
    // Check for sign-in resolvers
    const hasResolvers = hasProdMicrosoft.signIn?.resolvers;
    if (hasResolvers && hasResolvers.length > 0) {
      console.log(`✅ Production sign-in resolvers configured (${hasResolvers.length} resolvers)`);
    } else {
      console.error('❌ No sign-in resolvers configured for production');
    }
  } else {
    console.error('❌ Production Microsoft auth provider not configured');
  }

  // Check catalog configuration
  const hasOrgLocation = config.catalog?.locations?.some(
    loc => loc.target?.includes('org.yaml') && loc.rules?.some(rule => rule.allow?.includes('User'))
  );

  if (hasOrgLocation) {
    console.log('✅ User/Group catalog location configured');
  } else {
    console.error('❌ User/Group catalog location not configured');
  }

  // Check Microsoft Graph provider
  const hasMSGraphProvider = config.catalog?.providers?.microsoftGraphOrg;
  if (hasMSGraphProvider) {
    console.log('✅ Microsoft Graph catalog provider configured');
  } else {
    console.error('❌ Microsoft Graph catalog provider not configured');
  }

  // Check if org.yaml exists
  const orgYamlPath = path.join(__dirname, 'examples', 'org.yaml');
  if (fs.existsSync(orgYamlPath)) {
    console.log('✅ examples/org.yaml file exists');
    
    // Parse and check for User entities (handle multiple YAML documents)
    const orgContent = fs.readFileSync(orgYamlPath, 'utf8');
    const docs = yaml.loadAll(orgContent);
    const userEntities = docs.filter(doc => doc && doc.kind === 'User');
    
    if (userEntities.length > 0) {
      console.log(`✅ Found ${userEntities.length} User entities in org.yaml`);
    } else {
      console.error('❌ No User entities found in org.yaml');
    }
  } else {
    console.error('❌ examples/org.yaml file not found');
  }

  console.log('\n🎉 Configuration validation complete!');
  console.log('\n📋 Required Environment Variables:');
  console.log('   - AUTH_MICROSOFT_CLIENT_ID');
  console.log('   - AUTH_MICROSOFT_CLIENT_SECRET'); 
  console.log('   - AUTH_MICROSOFT_TENANT_ID');
  console.log('\n📖 See docs/microsoft-auth-setup.md for detailed setup instructions');

} catch (error) {
  console.error('❌ Error parsing configuration:', error.message);
  process.exit(1);
}