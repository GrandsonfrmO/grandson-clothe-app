#!/usr/bin/env node

/**
 * Script pour générer une clé JWT sécurisée
 * Usage: npx ts-node scripts/generate-jwt-secret.ts
 */

import crypto from 'crypto'

function generateJWTSecret(): string {
  // Générer 32 bytes aléatoires et les convertir en base64
  return crypto.randomBytes(32).toString('base64')
}

function main() {
  console.log('\n🔐 Générateur de Clé JWT Sécurisée\n')
  console.log('=' .repeat(50))
  
  const secret = generateJWTSecret()
  
  console.log('\n✅ Clé JWT générée avec succès:\n')
  console.log(`JWT_SECRET="${secret}"\n`)
  
  console.log('📋 Instructions:\n')
  console.log('1. Copiez la clé ci-dessus')
  console.log('2. Ajoutez-la à votre fichier .env.local:')
  console.log(`   JWT_SECRET="${secret}"\n`)
  console.log('3. Redémarrez votre serveur de développement\n')
  
  console.log('⚠️  IMPORTANT:\n')
  console.log('- Ne partagez JAMAIS cette clé')
  console.log('- Gardez-la secrète et sécurisée')
  console.log('- Utilisez une clé différente pour chaque environnement')
  console.log('- Stockez-la dans un gestionnaire de secrets en production\n')
  
  console.log('=' .repeat(50) + '\n')
}

main()
