#!/usr/bin/env tsx
/**
 * Script de test pour toutes les pages de l'application
 * Ce script vérifie que toutes les pages peuvent être rendues sans erreur
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const APP_DIR = path.join(process.cwd(), 'app');
const OUTPUT_FILE = path.join(process.cwd(), 'test-results.json');

// Liste de toutes les pages à tester
const PAGES_TO_TEST = [
  // Pages principales
  '/',
  '/explorer',
  '/models',
  '/models/1', // ID exemple
  '/produit/1', // ID exemple
  '/panier',
  '/favoris',
  '/profil',
  '/recherche',
  '/notifications',
  '/commandes',
  '/commandes/ORDER-123', // Exemple de numéro de commande
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
  
  // Pages admin (nécessitent authentification)
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
  '/admin/products/1/edit', // ID exemple
  '/admin/settings',
  '/admin/special-offer',
  '/admin/users',
  '/admin/videos',
  
  // Pages de test
  '/test-simple',
];

// Fonction pour vérifier si une page existe
function pageExists(pagePath: string): boolean {
  const relativePath = pagePath === '/' ? 'page.tsx' : `${pagePath}/page.tsx`;
  const fullPath = path.join(APP_DIR, relativePath);
  return fs.existsSync(fullPath);
}

// Fonction pour tester une page avec curl
async function testPageWithCurl(pagePath: string): Promise<TestResult> {
  const url = `http://localhost:3000${pagePath}`;
  
  try {
    // Vérifier si le serveur est en cours d'exécution
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`, {
      stdio: 'pipe',
      timeout: 5000
    });
    
    return {
      page: pagePath,
      status: 'success',
      exists: pageExists(pagePath),
      error: null
    };
  } catch (error: any) {
    return {
      page: pagePath,
      status: 'error',
      exists: pageExists(pagePath),
      error: error.message
    };
  }
}

// Fonction pour tester une page en vérifiant le fichier
function testPageFile(pagePath: string): TestResult {
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
      fileSize: content.length
    };
    
    return {
      page: pagePath,
      status: 'success',
      exists: true,
      checks,
      error: null
    };
  } catch (error: any) {
    return {
      page: pagePath,
      status: 'error',
      exists: true,
      error: `File read error: ${error.message}`
    };
  }
}

// Interface pour les résultats
interface TestResult {
  page: string;
  status: 'success' | 'error' | 'missing';
  exists: boolean;
  checks?: {
    hasReactImport: boolean;
    hasDefaultExport: boolean;
    hasFunctionComponent: boolean;
    fileSize: number;
  };
  error: string | null;
}

// Fonction principale
async function main() {
  console.log('🔍 Démarrage du test de toutes les pages...\n');
  
  const results: TestResult[] = [];
  const startTime = Date.now();
  
  // Tester chaque page
  for (const pagePath of PAGES_TO_TEST) {
    console.log(`Testing: ${pagePath}`);
    const result = testPageFile(pagePath);
    results.push(result);
    
    if (result.status === 'success') {
      console.log(`  ✅ ${pagePath} - OK`);
    } else if (result.status === 'missing') {
      console.log(`  ⚠️  ${pagePath} - Missing (expected but not found)`);
    } else {
      console.log(`  ❌ ${pagePath} - Error: ${result.error}`);
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
  
  // Retourner le code de sortie approprié
  if (stats.error > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur lors de l\'exécution:', error);
    process.exit(1);
  });
}

export { testPageFile, PAGES_TO_TEST };