#!/usr/bin/env node
/**
 * Script simple pour tester toutes les pages
 * Vérifie l'existence des fichiers et la syntaxe basique
 */

const fs = require('fs');
const path = require('path');

// Configuration
const APP_DIR = path.join(__dirname, '..', 'app');
const OUTPUT_FILE = path.join(__dirname, '..', 'test-pages-results.json');

// Liste de toutes les pages à tester
const PAGES_TO_TEST = [
  // Pages principales
  '/',
  '/explorer',
  '/models',
  '/models/1',
  '/produit/1',
  '/panier',
  '/favoris',
  '/profil',
  '/recherche',
  '/notifications',
  '/commandes',
  '/commandes/ORDER-123',
  '/adresses',
  '/paiement',
  '/confidentialite',
  '/aide',
  '/aide/commandes',
  '/aide/livraison',
  '/aide/paiement',
  '/aide/retours',
  '/parametres',
  '/parametres/langue',
  '/parametres/about',
  '/zones-livraison',
  
  // Pages de checkout
  '/checkout-choice',
  '/checkout-guest',
  '/checkout',
  '/order-confirmation',
  '/payment-success',
  '/payment-failure',
  
  // Pages PWA
  '/pwa-demo',
  
  // Pages admin
  '/admin',
  '/admin/login',
  '/admin/analytics',
  '/admin/app-icons',
  '/admin/categories',
  '/admin/gallery',
  '/admin/homepage',
  '/admin/inventory',
  '/admin/media-library',
  '/admin/models',
  '/admin/orders',
  '/admin/products',
  '/admin/products/new',
  '/admin/products/1/edit',
  '/admin/settings',
  '/admin/special-offer',
  '/admin/users',
  '/admin/videos',
  
  // Pages de test
  '/test-simple',
];

// Fonction pour vérifier si une page existe
function pageExists(pagePath) {
  const relativePath = pagePath === '/' ? 'page.tsx' : `${pagePath}/page.tsx`;
  const fullPath = path.join(APP_DIR, relativePath);
  return fs.existsSync(fullPath);
}

// Fonction pour tester une page
function testPage(pagePath) {
  const exists = pageExists(pagePath);
  
  if (!exists) {
    return {
      page: pagePath,
      status: 'missing',
      exists: false,
      error: 'Page file not found'
    };
  }
  
  // Vérifier la syntaxe du fichier
  const relativePath = pagePath === '/' ? 'page.tsx' : `${pagePath}/page.tsx`;
  const fullPath = path.join(APP_DIR, relativePath);
  
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    // Vérifications basiques
    const checks = {
      hasReactImport: content.includes('import React') || content.includes('import * as React'),
      hasDefaultExport: content.includes('export default'),
      hasFunctionComponent: content.includes('function') || content.includes('const') || content.includes('export default function'),
      fileSize: content.length,
      hasJSX: content.includes('<') && content.includes('>') && (content.includes('div') || content.includes('h1') || content.includes('p')),
      hasUseClient: content.includes("'use client'") || content.includes('"use client"'),
      hasUseServer: content.includes("'use server'") || content.includes('"use server"'),
    };
    
    return {
      page: pagePath,
      status: 'success',
      exists: true,
      checks,
      error: null
    };
  } catch (error) {
    return {
      page: pagePath,
      status: 'error',
      exists: true,
      error: `File read error: ${error.message}`
    };
  }
}

// Fonction principale
function main() {
  console.log('🔍 Démarrage du test de toutes les pages...\n');
  
  const results = [];
  const startTime = Date.now();
  
  // Tester chaque page
  for (const pagePath of PAGES_TO_TEST) {
    process.stdout.write(`Testing: ${pagePath.padEnd(40)}`);
    const result = testPage(pagePath);
    results.push(result);
    
    if (result.status === 'success') {
      console.log('✅ OK');
    } else if (result.status === 'missing') {
      console.log('⚠️  Missing');
    } else {
      console.log('❌ Error');
    }
  }
  
  // Calculer les statistiques
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const stats = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    error: results.filter(r => r.status === 'error').length,
    missing: results.filter(r => r.status === 'missing').length,
    duration: `${duration}ms`
  };
  
  // Afficher le résumé
  console.log('\n📊 Résumé des tests:');
  console.log(`Total pages: ${stats.total}`);
  console.log(`✅ Succès: ${stats.success}`);
  console.log(`❌ Erreurs: ${stats.error}`);
  console.log(`⚠️  Manquantes: ${stats.missing}`);
  console.log(`⏱️  Durée: ${stats.duration}`);
  
  // Sauvegarder les résultats
  const output = {
    timestamp: new Date().toISOString(),
    stats,
    results
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n📁 Résultats sauvegardés dans: ${OUTPUT_FILE}`);
  
  // Afficher les pages problématiques
  const problematicPages = results.filter(r => r.status !== 'success');
  if (problematicPages.length > 0) {
    console.log('\n🚨 Pages problématiques:');
    problematicPages.forEach(page => {
      console.log(`  - ${page.page}: ${page.error || 'Missing'}`);
    });
  }
  
  // Afficher quelques statistiques intéressantes
  const successfulPages = results.filter(r => r.status === 'success');
  if (successfulPages.length > 0) {
    console.log('\n📈 Statistiques des pages réussies:');
    
    const useClientCount = successfulPages.filter(p => p.checks?.hasUseClient).length;
    const useServerCount = successfulPages.filter(p => p.checks?.hasUseServer).length;
    const avgFileSize = successfulPages.reduce((sum, p) => sum + (p.checks?.fileSize || 0), 0) / successfulPages.length;
    
    console.log(`Pages avec 'use client': ${useClientCount}`);
    console.log(`Pages avec 'use server': ${useServerCount}`);
    console.log(`Taille moyenne des fichiers: ${Math.round(avgFileSize)} caractères`);
    
    // Trouver les plus grandes pages
    const largestPages = [...successfulPages]
      .sort((a, b) => (b.checks?.fileSize || 0) - (a.checks?.fileSize || 0))
      .slice(0, 5);
    
    console.log('\n📄 5 plus grandes pages:');
    largestPages.forEach((page, i) => {
      console.log(`  ${i + 1}. ${page.page}: ${page.checks?.fileSize} caractères`);
    });
  }
  
  // Retourner le code de sortie approprié
  if (stats.error > 0) {
    console.log('\n❌ Certaines pages ont des erreurs');
    process.exit(1);
  } else if (stats.missing > 0) {
    console.log('\n⚠️  Certaines pages sont manquantes (peut être normal)');
    process.exit(0);
  } else {
    console.log('\n✅ Toutes les pages testées avec succès!');
    process.exit(0);
  }
}

// Exécuter le script
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution:', error);
    process.exit(1);
  }
}

module.exports = { testPage, PAGES_TO_TEST };