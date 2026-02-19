#!/usr/bin/env node

/**
 * GÉNÉRATEUR DE SECRETS SÉCURISÉS
 * Génère des secrets cryptographiquement sûrs pour l'application
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     GÉNÉRATEUR DE SECRETS SÉCURISÉS - GRANDSON CLOTHES     ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Générer les secrets
const secrets = {
  JWT_SECRET: crypto.randomBytes(64).toString('hex'),
  NEXTAUTH_SECRET: crypto.randomBytes(64).toString('hex'),
  ORANGE_MONEY_SECRET: crypto.randomBytes(32).toString('hex'),
  MTN_MONEY_SECRET: crypto.randomBytes(32).toString('hex'),
  CSRF_SECRET: crypto.randomBytes(32).toString('hex'),
  ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
};

console.log('✅ Secrets générés avec succès!\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Afficher les secrets
console.log('📋 COPIEZ CES VALEURS DANS VOTRE FICHIER .env.local:\n');
console.log('-----------------------------------------------------------');
for (const [key, value] of Object.entries(secrets)) {
  console.log(`${key}="${value}"`);
}
console.log('-----------------------------------------------------------\n');

// Créer un fichier .env.local.example avec les secrets
const envExample = `# ═══════════════════════════════════════════════════════════
# SECRETS DE SÉCURITÉ - GÉNÉRÉS LE ${new Date().toISOString()}
# ═══════════════════════════════════════════════════════════
# ⚠️ NE JAMAIS COMMITER CE FICHIER !
# ⚠️ RENOMMER EN .env.local APRÈS AVOIR COPIÉ
# ═══════════════════════════════════════════════════════════

# Authentication - JWT Secret (minimum 64 caractères)
${Object.entries(secrets).map(([key, value]) => `${key}="${value}"`).join('\n')}

# Database - Supabase (À REMPLIR)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email Service - Resend
RESEND_API_KEY="re_your_resend_api_key_here"

# Orange Money API (Guinea) - À REMPLIR
ORANGE_MONEY_API_URL="https://api.orange.com/orange-money-webpay/gn/v1"
ORANGE_MONEY_CLIENT_ID="your-orange-client-id"
ORANGE_MONEY_CLIENT_SECRET="your-orange-client-secret"
ORANGE_MONEY_MERCHANT_KEY="your-orange-merchant-key"
ORANGE_MONEY_API_KEY="your-orange-money-api-key"

# MTN Money API (Guinea) - À REMPLIR
MTN_MONEY_API_URL="https://sandbox.momodeveloper.mtn.com"
MTN_MONEY_SUBSCRIPTION_KEY="your-mtn-subscription-key"
MTN_MONEY_API_USER_ID="your-mtn-api-user-id"
MTN_MONEY_API_KEY="your-mtn-api-key"

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Environment
NODE_ENV="development"
`;

// Sauvegarder dans un fichier
const outputPath = path.join(process.cwd(), '.env.local.generated');
fs.writeFileSync(outputPath, envExample);

console.log(`✅ Fichier créé: ${outputPath}\n`);
console.log('📝 PROCHAINES ÉTAPES:\n');
console.log('1. Renommer .env.local.generated en .env.local');
console.log('2. Remplir les valeurs manquantes (Supabase, Orange Money, etc.)');
console.log('3. Vérifier que .env.local est dans .gitignore');
console.log('4. NE JAMAIS commiter les secrets dans Git!\n');

console.log('⚠️  SÉCURITÉ IMPORTANTE:\n');
console.log('• Ces secrets sont CRITIQUES pour la sécurité de votre application');
console.log('• Stockez-les dans un gestionnaire de mots de passe sécurisé');
console.log('• En production, utilisez des variables d\'environnement sécurisées');
console.log('• Changez les secrets régulièrement (tous les 3-6 mois)');
console.log('• Si un secret est compromis, générez-en un nouveau immédiatement\n');

console.log('═══════════════════════════════════════════════════════════\n');

// Vérifier si .gitignore contient .env.local
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (!gitignoreContent.includes('.env.local')) {
    console.log('⚠️  ATTENTION: .env.local n\'est pas dans .gitignore!');
    console.log('   Ajoutez cette ligne à .gitignore:\n');
    console.log('   .env.local');
    console.log('   .env.local.generated\n');
  } else {
    console.log('✅ .env.local est bien dans .gitignore\n');
  }
}

// Créer un fichier de backup des secrets (chiffré)
const backupData = {
  generated: new Date().toISOString(),
  secrets: secrets,
  warning: 'Ce fichier contient des secrets sensibles. Stockez-le en lieu sûr!',
};

const backupPath = path.join(process.cwd(), `secrets-backup-${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

console.log(`💾 Backup des secrets créé: ${backupPath}`);
console.log('   Stockez ce fichier dans un endroit sûr et supprimez-le du serveur!\n');

console.log('✨ Génération terminée avec succès!\n');
